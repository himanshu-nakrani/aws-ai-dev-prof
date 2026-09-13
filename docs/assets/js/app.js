/* ==========================================================================
   app.js — shell behaviour: theme, nav, SPA routing, progress, search, tabs.
   Runs on both the multi-page build and the single-file bundle.
   ========================================================================== */
(function () {
  'use strict';

  var SPA = document.body.dataset.spa === '1';
  var LS = {
    theme: 'aip.theme',
    read: 'aip.read',
    quiz: 'aip.quiz',
    fc: 'aip.flash'
  };

  /* ------------------------------------------------------------- storage */

  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* private mode */ }
  }
  window.AIP = window.AIP || {};
  window.AIP.load = load;
  window.AIP.save = save;
  window.AIP.LS = LS;

  /* --------------------------------------------------------------- theme */

  var savedTheme = load(LS.theme, null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      save(LS.theme, next);
      document.dispatchEvent(new CustomEvent('aip:theme', { detail: next }));
    });
  }

  /* ------------------------------------------------------------ mobile nav */

  var menuBtn = document.getElementById('menuBtn');
  var scrim = document.getElementById('scrim');
  function closeNav() { document.body.classList.remove('nav-open'); }
  if (menuBtn) menuBtn.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  if (scrim) scrim.addEventListener('click', closeNav);

  /* ------------------------------------------------------- progress model */

  function readSet() { return load(LS.read, {}); }

  function allSections() {
    return Array.prototype.slice.call(document.querySelectorAll('.read-toggle[data-read]'));
  }

  function sectionsForPage(slug) {
    var page = document.querySelector('.page[data-page="' + slug + '"]');
    if (!page) return [];
    return Array.prototype.slice.call(page.querySelectorAll('.read-toggle[data-read]'));
  }

  function refreshProgress() {
    var read = readSet();
    var toggles = allSections();
    var done = 0;

    toggles.forEach(function (t) {
      var on = !!read[t.dataset.read];
      t.classList.toggle('done', on);
      t.querySelector('.rt-label').textContent = on ? 'Read' : 'Mark read';
      if (on) done++;
    });

    var total = toggles.length || 1;
    var pct = Math.round((done / total) * 100);
    var ring = document.getElementById('ringFg');
    if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - done / total));
    var pctEl = document.getElementById('ringPct');
    if (pctEl) pctEl.textContent = pct + '%';
    var sub = document.getElementById('progressSub');
    if (sub) sub.textContent = done + ' of ' + toggles.length + ' sections read';

    // per-page dots in the sidebar
    document.querySelectorAll('.nav-dot[data-dot]').forEach(function (dot) {
      var slug = dot.dataset.dot;
      var ids = SPA ? sectionsForPage(slug).map(function (t) { return t.dataset.read; }) : null;
      if (!SPA) {
        // multi-page: we only know the current page's sections, so use a saved index
        var idx = load('aip.index.' + slug, null);
        ids = idx || (slug === document.body.dataset.page ? sectionsForPage(slug).map(function (t) { return t.dataset.read; }) : null);
      }
      dot.classList.remove('done', 'part');
      if (!ids || !ids.length) return;
      var n = ids.filter(function (i) { return read[i]; }).length;
      if (n === ids.length) dot.classList.add('done');
      else if (n > 0) dot.classList.add('part');
    });

    // page-level state pill
    document.querySelectorAll('.page[data-page]').forEach(function (page) {
      var slug = page.dataset.page;
      var pill = document.getElementById('pageReadState-' + slug);
      if (!pill) return;
      var ids = Array.prototype.slice.call(page.querySelectorAll('.read-toggle')).map(function (t) { return t.dataset.read; });
      if (!ids.length) { pill.remove(); return; }
      var n = ids.filter(function (i) { return read[i]; }).length;
      pill.textContent = n === 0 ? 'not started' : (n === ids.length ? 'complete ✓' : n + '/' + ids.length + ' read');
      pill.className = 'pill ' + (n === 0 ? 'pill-ghost' : (n === ids.length ? 'pill-green' : 'pill-amber'));
    });
  }

  // remember which section ids belong to each page so sidebar dots work across pages
  (function indexThisPage() {
    document.querySelectorAll('.page[data-page]').forEach(function (page) {
      var slug = page.dataset.page;
      var ids = Array.prototype.slice.call(page.querySelectorAll('.read-toggle')).map(function (t) { return t.dataset.read; });
      if (ids.length) save('aip.index.' + slug, ids);
    });
  })();

  document.addEventListener('click', function (e) {
    var t = e.target.closest('.read-toggle');
    if (!t) return;
    var read = readSet();
    var id = t.dataset.read;
    if (read[id]) delete read[id]; else read[id] = 1;
    save(LS.read, read);
    refreshProgress();
  });

  var resetBtn = document.getElementById('resetProgress');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!confirm('Clear reading progress, quiz history and flashcard scheduling?')) return;
      [LS.read, LS.quiz, LS.fc].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
      location.reload();
    });
  }

  /* -------------------------------------------------------------- SPA nav */

  function showPage(slug, push) {
    var target = document.querySelector('.page[data-page="' + slug + '"]');
    if (!target) return false;
    document.querySelectorAll('.page[data-page]').forEach(function (p) { p.hidden = p !== target; });
    document.querySelectorAll('.nav-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.slug === slug);
    });
    document.body.dataset.page = slug;
    if (push && location.hash !== '#/' + slug) history.pushState(null, '', '#/' + slug);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    closeNav();
    document.dispatchEvent(new CustomEvent('aip:page', { detail: slug }));
    initWidgets(target);
    return true;
  }

  if (SPA) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#/"]');
      if (!a) return;
      e.preventDefault();
      showPage(a.getAttribute('href').slice(2), true);
    });
    window.addEventListener('popstate', function () {
      showPage((location.hash || '#/index').slice(2) || 'index', false);
    });
    var initial = (location.hash || '#/index').slice(2) || 'index';
    if (!showPage(initial, false)) showPage('index', false);
  } else {
    document.querySelectorAll('.nav-link').forEach(function (a) { closeNav; });
    document.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link')) closeNav();
    });
  }

  /* --------------------------------------------------------------- search */

  var SEARCH_INDEX = null;

  function buildIndex() {
    if (SEARCH_INDEX) return SEARCH_INDEX;
    // Prefer the index the build step generated: it covers every page, not
    // just the one currently loaded.
    if (window.AIP_SEARCH && window.AIP_SEARCH.length) {
      SEARCH_INDEX = window.AIP_SEARCH;
      return SEARCH_INDEX;
    }
    SEARCH_INDEX = [];
    document.querySelectorAll('.page[data-page]').forEach(function (page) {
      var slug = page.dataset.page;
      var pageTitle = (page.querySelector('.page-head h1') || {}).textContent || slug;
      page.querySelectorAll('section[id]').forEach(function (sec) {
        var h = sec.querySelector('h2, h3');
        SEARCH_INDEX.push({
          slug: slug,
          id: sec.id,
          page: pageTitle,
          title: h ? h.textContent.trim() : sec.id,
          text: (sec.textContent || '').replace(/\s+/g, ' ').slice(0, 4000).toLowerCase()
        });
      });
    });
    return SEARCH_INDEX;
  }

  var searchInput = document.getElementById('siteSearch');
  var searchOut = document.getElementById('searchResults');

  function runSearch() {
    var q = searchInput.value.trim().toLowerCase();
    if (q.length < 2) { searchOut.hidden = true; return; }
    var terms = q.split(/\s+/);
    var hits = buildIndex().map(function (row) {
      var score = 0;
      terms.forEach(function (t) {
        if (row.title.toLowerCase().indexOf(t) >= 0) score += 12;
        var n = row.text.split(t).length - 1;
        score += Math.min(n, 6);
      });
      return { row: row, score: score };
    }).filter(function (h) { return h.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 14);

    if (!hits.length) {
      searchOut.innerHTML = '<div class="search-empty">No match. Try “guardrail”, “chunking”, “provisioned throughput”, “ReAct”…</div>';
      searchOut.hidden = false; return;
    }
    searchOut.innerHTML = hits.map(function (h) {
      var r = h.row;
      var href = SPA ? ('#/' + r.slug + (r.id ? '' : '')) : ((r.slug === 'index' ? 'index.html' : r.slug + '.html') + (r.id ? '#' + r.id : ''));
      return '<a href="' + href + '" data-slug="' + r.slug + '" data-anchor="' + r.id + '">' +
        escapeHtml(r.title) + '<small>' + escapeHtml(r.page) + '</small></a>';
    }).join('');
    searchOut.hidden = false;
  }

  if (searchInput) {
    var deb;
    searchInput.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(runSearch, 120); });
    searchInput.addEventListener('focus', runSearch);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.search-wrap')) searchOut.hidden = true;
    });
    document.addEventListener('keydown', function (e) {
      var isK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      var isSlash = e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName);
      if ((isK || isSlash) && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        if (searchInput.select) searchInput.select();
      }
      if (e.key === 'Escape') { searchOut.hidden = true; searchInput.blur(); }
    });
    if (SPA) {
      searchOut.addEventListener('click', function (e) {
        var a = e.target.closest('a'); if (!a) return;
        e.preventDefault();
        showPage(a.dataset.slug, true);
        searchOut.hidden = true;
        if (a.dataset.anchor) {
          var el = document.getElementById(a.dataset.anchor);
          if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
        }
      });
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  window.AIP.escapeHtml = escapeHtml;

  /* ----------------------------------------------------------------- tabs */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    var wrap = btn.closest('.tabs');
    wrap.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
    wrap.querySelectorAll('.tab-panel').forEach(function (p) {
      p.classList.toggle('active', p.dataset.tab === btn.dataset.tab);
    });
  });

  /* ------------------------------------------------------------ copy code */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cp-btn');
    if (!btn) return;
    var pre = btn.closest('.code-head').nextElementSibling;
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(function () {
      var old = btn.textContent;
      btn.textContent = 'copied ✓';
      setTimeout(function () { btn.textContent = old; }, 1400);
    }).catch(function () { btn.textContent = 'press ⌘C'; });
  });

  /* ------------------------------------------------------------- scrollspy */

  function initScrollspy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[data-toc]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('active', l.dataset.toc === en.target.id); });
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    links.forEach(function (l) {
      var el = document.getElementById(l.dataset.toc);
      if (el) io.observe(el);
    });
  }

  /* --------------------------------------------------------- widget wiring */

  function initWidgets(root) {
    root = root || document;
    if (window.AIPCharts && window.AIPCharts.renderAll) window.AIPCharts.renderAll(root);
    if (window.AIPInteractive && window.AIPInteractive.init) window.AIPInteractive.init(root);
    if (window.AIPQuiz && window.AIPQuiz.init) window.AIPQuiz.init(root);
    if (window.AIPFlash && window.AIPFlash.init) window.AIPFlash.init(root);
  }
  window.AIP.initWidgets = initWidgets;

  /* ------------------------------------------------------------------ boot */

  function boot() {
    refreshProgress();
    initScrollspy();
    initWidgets(document);
    document.addEventListener('aip:theme', function () {
      if (window.AIPCharts && window.AIPCharts.renderAll) window.AIPCharts.renderAll(document);
    });
  }

  window.AIP.refreshProgress = refreshProgress;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
