/* ==========================================================================
   app.js — Linear / Raycast App-Shell Controller
   Theme Engine (Carbon / Titanium / Paper), Dock & Collapsible Drawer,
   Floating Status Pill HUD, Raycast Spotlight Command Palette, SPA Nav & Search.
   ========================================================================== */
(function () {
  'use strict';

  var SPA = document.body.dataset.spa === '1';
  var LS = {
    theme: 'aip.theme',
    drawer: 'aip.drawer',
    read: 'aip.read',
    quiz: 'aip.quiz',
    fc: 'aip.flash'
  };

  var PAGES_META = {
    'index': { group: 'Orientation', title: 'Start here', mins: 12 },
    'exam': { group: 'Orientation', title: 'The exam, decoded', mins: 18 },
    'studyplan': { group: 'Orientation', title: 'Study plans: 8-week, 4-week, 10-day', mins: 10 },
    'foundations': { group: 'Learn', title: 'Module 0 — From zero: AI and AWS', mins: 95 },
    'domain1': { group: 'Learn', title: 'Domain 1 — FM Integration, Data & Compliance', mins: 120 },
    'domain2': { group: 'Learn', title: 'Domain 2 — Implementation and Integration', mins: 110 },
    'domain3': { group: 'Learn', title: 'Domain 3 — AI Safety, Security, Governance', mins: 85 },
    'domain4': { group: 'Learn', title: 'Domain 4 — Operational Efficiency & Cost', mins: 60 },
    'domain5': { group: 'Learn', title: 'Domain 5 — Testing, Validation, Debugging', mins: 55 },
    'services': { group: 'Reference', title: 'Service atlas and decision tables', mins: 45 },
    'labs': { group: 'Practice', title: 'Hands-on labs: build the whole stack', mins: 180 },
    'practice': { group: 'Practice', title: 'Question bank and exam simulator', mins: 240 },
    'flashcards': { group: 'Practice', title: 'Flashcards (spaced repetition)', mins: 40 },
    'cheatsheet': { group: 'Reference', title: 'The cram sheet', mins: 30 },
    'glossary': { group: 'Reference', title: 'Glossary', mins: 25 }
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

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  window.AIP = window.AIP || {};
  window.AIP.load = load;
  window.AIP.save = save;
  window.AIP.LS = LS;
  window.AIP.escapeHtml = escapeHtml;

  /* -------------------------------------------------------- theme engine */

  var THEMES = ['carbon', 'titanium', 'paper'];
  var THEME_NAMES = {
    carbon: 'Carbon',
    titanium: 'Titanium',
    paper: 'Paper'
  };

  function setTheme(name, savePref) {
    if (THEMES.indexOf(name) === -1) name = 'carbon';
    document.documentElement.dataset.theme = name;
    var label = document.getElementById('themeNameLabel');
    if (label) label.textContent = THEME_NAMES[name] || 'Carbon';
    if (savePref) save(LS.theme, name);
    document.dispatchEvent(new CustomEvent('aip:theme', { detail: name }));
  }

  function cycleTheme() {
    var current = document.documentElement.dataset.theme || 'carbon';
    var idx = THEMES.indexOf(current);
    var next = THEMES[(idx + 1) % THEMES.length];
    setTheme(next, true);
  }

  // Restore saved theme (support legacy dark/light mapping)
  var savedTheme = load(LS.theme, null);
  if (savedTheme === 'dark') savedTheme = 'carbon';
  if (savedTheme === 'light') savedTheme = 'paper';
  setTheme(savedTheme || document.documentElement.dataset.theme || 'carbon', false);

  var themeSelectBtn = document.getElementById('themeSelectBtn');
  if (themeSelectBtn) themeSelectBtn.addEventListener('click', cycleTheme);

  var themeCycleBtn = document.getElementById('themeCycleBtn');
  if (themeCycleBtn) themeCycleBtn.addEventListener('click', cycleTheme);

  /* ---------------------------------------------------- drawer & dock shell */

  function setDrawer(collapsed, savePref) {
    document.body.classList.toggle('drawer-collapsed', collapsed);
    if (savePref) save(LS.drawer, collapsed ? 'collapsed' : 'open');
  }

  function toggleDrawer() {
    var isCollapsed = document.body.classList.contains('drawer-collapsed');
    setDrawer(!isCollapsed, true);
  }

  // Initial drawer state on desktop
  var savedDrawer = load(LS.drawer, 'open');
  if (savedDrawer === 'collapsed' && window.innerWidth >= 900) {
    setDrawer(true, false);
  }

  var drawerToggleBtn = document.getElementById('drawerToggleBtn');
  if (drawerToggleBtn) drawerToggleBtn.addEventListener('click', toggleDrawer);

  var drawerCloseBtn = document.getElementById('drawerCloseBtn');
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', function () {
      setDrawer(true, true);
      document.body.classList.remove('nav-open');
    });
  }

  // Mobile menu toggle
  var menuBtn = document.getElementById('menuBtn');
  var scrim = document.getElementById('scrim');
  function closeNav() { document.body.classList.remove('nav-open'); }
  if (menuBtn) menuBtn.addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  if (scrim) scrim.addEventListener('click', closeNav);

  // Dock group button clicks: expand drawer and scroll to group
  document.querySelectorAll('.dock-btn[data-dock-group]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var grp = btn.dataset.dockGroup;
      if (document.body.classList.contains('drawer-collapsed')) {
        setDrawer(false, true);
      }
      if (window.innerWidth < 860) {
        document.body.classList.add('nav-open');
      }
      var targetGroup = document.querySelector('.nav-group[data-nav-group="' + grp + '"]');
      if (targetGroup) {
        targetGroup.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Global keyboard shortcuts: `[` toggles drawer
  document.addEventListener('keydown', function (e) {
    if (e.key === '[' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      toggleDrawer();
    }
  });

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

  function updateFloatingPill(read) {
    read = read || readSet();
    var curSlug = document.body.dataset.page || 'index';
    var meta = PAGES_META[curSlug] || { title: curSlug, group: 'Learn', mins: 15 };
    var curSecs = sectionsForPage(curSlug);
    var total = curSecs.length;
    var done = curSecs.filter(function (t) { return read[t.dataset.read]; }).length;

    var pill = document.getElementById('floatingPill');
    if (!pill) return;

    var barFill = document.getElementById('pillBarFill');
    if (barFill) barFill.style.width = total ? Math.round((done / total) * 100) + '%' : '100%';

    var readCount = document.getElementById('pillReadCount');
    if (readCount) readCount.textContent = total ? done + ' of ' + total + ' read' : 'Reference';

    var markBtn = document.getElementById('pillMarkBtn');
    if (markBtn) {
      if (total === 0) {
        markBtn.textContent = 'Reference tool';
        markBtn.disabled = true;
        markBtn.classList.remove('done');
      } else if (done === total) {
        markBtn.textContent = 'Completed ✓';
        markBtn.disabled = false;
        markBtn.classList.add('done');
      } else {
        markBtn.textContent = 'Mark page read';
        markBtn.disabled = false;
        markBtn.classList.remove('done');
      }
    }
  }

  function refreshProgress() {
    var read = readSet();
    var toggles = allSections();
    var done = 0;

    toggles.forEach(function (t) {
      var on = !!read[t.dataset.read];
      t.classList.toggle('done', on);
      var lbl = t.querySelector('.rt-label');
      if (lbl) lbl.textContent = on ? 'Read' : 'Mark read';
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

    // per-page dots in the sidebar drawer
    document.querySelectorAll('.nav-dot[data-dot]').forEach(function (dot) {
      var slug = dot.dataset.dot;
      var ids = SPA ? sectionsForPage(slug).map(function (t) { return t.dataset.read; }) : null;
      if (!SPA) {
        var idx = load('aip.index.' + slug, null);
        ids = idx || (slug === document.body.dataset.page ? sectionsForPage(slug).map(function (t) { return t.dataset.read; }) : null);
      }
      dot.classList.remove('done', 'part');
      if (!ids || !ids.length) return;
      var n = ids.filter(function (i) { return read[i]; }).length;
      if (n === ids.length) dot.classList.add('done');
      else if (n > 0) dot.classList.add('part');
    });

    // page-level state pills
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

    updateFloatingPill(read);
  }

  // remember which section ids belong to each page so sidebar dots work across pages in multi-page mode
  (function indexThisPage() {
    document.querySelectorAll('.page[data-page]').forEach(function (page) {
      var slug = page.dataset.page;
      var ids = Array.prototype.slice.call(page.querySelectorAll('.read-toggle')).map(function (t) { return t.dataset.read; });
      if (ids.length) save('aip.index.' + slug, ids);
    });
  })();

  // Toggle individual section read mark
  document.addEventListener('click', function (e) {
    var t = e.target.closest('.read-toggle');
    if (!t) return;
    var read = readSet();
    var id = t.dataset.read;
    if (read[id]) delete read[id]; else read[id] = 1;
    save(LS.read, read);
    refreshProgress();
  });

  // Toggle all sections on current page from floating pill
  var pillMarkBtn = document.getElementById('pillMarkBtn');
  if (pillMarkBtn) {
    pillMarkBtn.addEventListener('click', function () {
      var curSlug = document.body.dataset.page || 'index';
      var curSecs = sectionsForPage(curSlug);
      if (!curSecs.length) return;
      var read = readSet();
      var allDone = curSecs.every(function (t) { return !!read[t.dataset.read]; });
      curSecs.forEach(function (t) {
        var id = t.dataset.read;
        if (allDone) delete read[id];
        else read[id] = 1;
      });
      save(LS.read, read);
      refreshProgress();
    });
  }

  // Floating status pill scroll auto-hide
  var floatingPill = document.getElementById('floatingPill');
  if (floatingPill) {
    var lastScrollY = window.scrollY;
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var sy = window.scrollY;
          var delta = sy - lastScrollY;
          var atBottom = (window.innerHeight + sy) >= (document.documentElement.scrollHeight - 90);
          if (sy > 160 && delta > 12 && !atBottom) {
            floatingPill.classList.add('pill-hidden');
          } else if (delta < -8 || atBottom || sy <= 80) {
            floatingPill.classList.remove('pill-hidden');
          }
          lastScrollY = sy;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

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

    var meta = PAGES_META[slug] || { title: slug, group: 'Learn', mins: 15 };

    // Update top bar breadcrumb
    var bc = document.getElementById('barBreadcrumb');
    if (bc) {
      bc.innerHTML = '<span class="bc-group">' + escapeHtml(meta.group) + '</span>' +
        '<span class="bc-sep">/</span>' +
        '<span class="bc-page">' + escapeHtml(meta.title) + '</span>';
    }

    // Update dock active item
    document.querySelectorAll('.dock-btn[data-dock-group]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.dockGroup === meta.group);
    });

    // Update floating pill header
    var pillTitle = document.querySelector('.pill-title');
    if (pillTitle) pillTitle.textContent = meta.title;
    var pillTime = document.querySelector('.pill-time');
    if (pillTime) pillTime.textContent = '≈' + meta.mins + 'm';

    if (push && location.hash !== '#/' + slug) history.pushState(null, '', '#/' + slug);
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    closeNav();
    document.dispatchEvent(new CustomEvent('aip:page', { detail: slug }));
    initWidgets(target);
    refreshProgress();
    return true;
  }

  if (SPA) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#/"]');
      if (!a) return;
      e.preventDefault();
      var targetPath = a.getAttribute('href').slice(2);
      var parts = targetPath.split('#');
      var pageSlug = parts[0];
      var anchorId = parts[1];
      showPage(pageSlug, true);
      if (anchorId) {
        setTimeout(function () {
          var el = document.getElementById(anchorId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    });
    window.addEventListener('popstate', function () {
      var path = (location.hash || '#/index').slice(2) || 'index';
      var parts = path.split('#');
      showPage(parts[0], false);
      if (parts[1]) {
        setTimeout(function () {
          var el = document.getElementById(parts[1]);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    });
    var initial = (location.hash || '#/index').slice(2) || 'index';
    var initialParts = initial.split('#');
    if (!showPage(initialParts[0], false)) showPage('index', false);
    if (initialParts[1]) {
      setTimeout(function () {
        var el = document.getElementById(initialParts[1]);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  } else {
    document.addEventListener('click', function (e) {
      if (e.target.closest('.nav-link')) closeNav();
    });
  }

  /* ----------------------- Raycast Spotlight Command Palette ---------------- */

  var SEARCH_INDEX = null;

  function buildIndex() {
    if (SEARCH_INDEX) return SEARCH_INDEX;
    if (window.AIP_SEARCH && window.AIP_SEARCH.length) {
      SEARCH_INDEX = window.AIP_SEARCH;
      return SEARCH_INDEX;
    }
    SEARCH_INDEX = [];
    document.querySelectorAll('.page[data-page]').forEach(function (page) {
      var slug = page.dataset.page;
      var meta = PAGES_META[slug] || { title: slug, group: 'Learn' };
      page.querySelectorAll('section[id]').forEach(function (sec) {
        var h = sec.querySelector('h2, h3');
        SEARCH_INDEX.push({
          slug: slug,
          id: sec.id,
          page: meta.title,
          group: meta.group,
          title: h ? h.textContent.trim() : sec.id,
          text: (sec.textContent || '').replace(/\s+/g, ' ').slice(0, 4000).toLowerCase()
        });
      });
    });
    return SEARCH_INDEX;
  }

  var DEFAULT_COMMANDS = [
    { title: 'Full Exam Simulator & Question Bank', sub: 'Practice real AIP-C01 questions with timer & explanations', badge: 'Practice', slug: 'practice', id: '' },
    { title: '75-Card Spaced Repetition Flashcards', sub: 'Active recall drill with Leitner confidence boxes', badge: 'Practice', slug: 'flashcards', id: '' },
    { title: 'High-Yield Architecture Cram Sheet', sub: 'Bedrock limits, model selection matrices, and traps', badge: 'Reference', slug: 'cheatsheet', id: '' },
    { title: 'Hands-on Labs: Build the Whole Stack', sub: 'Step-by-step labs for Bedrock, Agents, RAG, and Guardrails', badge: 'Practice', slug: 'labs', id: '' },
    { title: 'Service Atlas & Decision Tables', sub: 'Interactive Bedrock & SageMaker architecture comparisons', badge: 'Reference', slug: 'services', id: '' },
    { title: 'Switch to Carbon Void Theme', sub: 'Deep space blacks & electric indigo/cyan accents', badge: 'Theme', action: 'theme:carbon' },
    { title: 'Switch to AWS Titanium Theme', sub: 'Dark graphite with warm luminous amber accents', badge: 'Theme', action: 'theme:titanium' },
    { title: 'Switch to Clean Paper Theme', sub: 'Clean high-contrast light mode with crisp borders', badge: 'Theme', action: 'theme:paper' },
    { title: 'Toggle Sidebar Drawer', sub: 'Show or hide the curriculum navigation drawer ([)', badge: 'Shell', action: 'drawer:toggle' },
    { title: 'Clear Study & Quiz History', sub: 'Reset progress marks, quiz scores, and flashcard queues', badge: 'Data', action: 'data:reset' }
  ];

  var cmdModalBackdrop = document.getElementById('cmdModalBackdrop');
  var cmdInput = document.getElementById('cmdInput');
  var cmdResults = document.getElementById('cmdResults');
  var cmdFilters = document.getElementById('cmdFilters');
  var activeFilter = 'all';
  var selectedIndex = 0;
  var currentMatches = [];

  function openPalette() {
    if (!cmdModalBackdrop) return;
    cmdModalBackdrop.removeAttribute('hidden');
    if (cmdInput) {
      cmdInput.value = '';
      setTimeout(function () { cmdInput.focus(); cmdInput.select(); }, 20);
    }
    renderPalette();
  }

  function closePalette() {
    if (!cmdModalBackdrop) return;
    cmdModalBackdrop.setAttribute('hidden', '');
    if (cmdInput) cmdInput.blur();
  }

  function renderPalette() {
    if (!cmdResults) return;
    var q = (cmdInput ? cmdInput.value : '').trim().toLowerCase();
    currentMatches = [];

    if (!q) {
      var filteredDefaults = DEFAULT_COMMANDS.filter(function (cmd) {
        if (activeFilter === 'all') return true;
        if (cmd.badge === activeFilter) return true;
        var meta = PAGES_META[cmd.slug];
        return meta && meta.group === activeFilter;
      });
      currentMatches = filteredDefaults;
    } else {
      var terms = q.split(/\s+/);
      var rows = buildIndex();
      var scored = [];

      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var rowGroup = r.group || (PAGES_META[r.slug] ? PAGES_META[r.slug].group : '');
        if (activeFilter !== 'all' && rowGroup !== activeFilter) continue;

        var score = 0;
        var rTitle = r.title.toLowerCase();
        for (var j = 0; j < terms.length; j++) {
          var t = terms[j];
          if (rTitle === t) score += 35;
          else if (rTitle.indexOf(t) === 0) score += 20;
          else if (rTitle.indexOf(t) > 0) score += 12;

          var count = r.text ? (r.text.split(t).length - 1) : 0;
          if (count > 0) score += Math.min(count, 6);
        }

        if (score > 0) {
          scored.push({
            title: r.title,
            sub: r.page + (r.id ? ' · #' + r.id : ''),
            badge: rowGroup || 'Guide',
            slug: r.slug,
            id: r.id,
            score: score
          });
        }
      }

      scored.sort(function (a, b) { return b.score - a.score; });
      currentMatches = scored.slice(0, 18);
    }

    if (!currentMatches.length) {
      cmdResults.innerHTML = '<div class="cmd-empty">No results found for “' + escapeHtml(q) + '”. Try searching for “guardrail”, “latency”, “agent”, or “cost”…</div>';
      return;
    }

    if (selectedIndex >= currentMatches.length) selectedIndex = 0;

    var html = '';
    for (var k = 0; k < currentMatches.length; k++) {
      var item = currentMatches[k];
      var isSel = k === selectedIndex;
      html += '<div class="cmd-result-item' + (isSel ? ' selected' : '') + '" data-idx="' + k + '">' +
        '<div class="cmd-result-left">' +
          '<span class="cmd-result-title">' + escapeHtml(item.title) + '</span>' +
          '<span class="cmd-result-sub">' + escapeHtml(item.sub) + '</span>' +
        '</div>' +
        '<span class="cmd-result-badge">' + escapeHtml(item.badge) + '</span>' +
      '</div>';
    }
    cmdResults.innerHTML = html;
  }

  function updateSelectionHighlight() {
    if (!cmdResults) return;
    var items = cmdResults.querySelectorAll('.cmd-result-item');
    items.forEach(function (el, idx) {
      el.classList.toggle('selected', idx === selectedIndex);
      if (idx === selectedIndex) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  function executeItem(item) {
    if (!item) return;
    closePalette();

    if (item.action) {
      if (item.action === 'theme:carbon') setTheme('carbon', true);
      else if (item.action === 'theme:titanium') setTheme('titanium', true);
      else if (item.action === 'theme:paper') setTheme('paper', true);
      else if (item.action === 'drawer:toggle') toggleDrawer();
      else if (item.action === 'data:reset') {
        if (confirm('Clear reading progress, quiz history and flashcard scheduling?')) {
          [LS.read, LS.quiz, LS.fc].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
          location.reload();
        }
      }
      return;
    }

    if (item.slug) {
      if (SPA) {
        showPage(item.slug, true);
        if (item.id) {
          setTimeout(function () {
            var el = document.getElementById(item.id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        }
      } else {
        var href = (item.slug === 'index' ? 'index.html' : item.slug + '.html') + (item.id ? '#' + item.id : '');
        location.href = href;
      }
    }
  }

  // Wire palette triggers
  var cmdTriggerBtn = document.getElementById('cmdTriggerBtn');
  if (cmdTriggerBtn) cmdTriggerBtn.addEventListener('click', openPalette);

  var cmdBtnDock = document.getElementById('cmdBtnDock');
  if (cmdBtnDock) cmdBtnDock.addEventListener('click', openPalette);

  var pillCmdBtn = document.getElementById('pillCmdBtn');
  if (pillCmdBtn) pillCmdBtn.addEventListener('click', openPalette);

  if (cmdModalBackdrop) {
    cmdModalBackdrop.addEventListener('click', function (e) {
      if (e.target === cmdModalBackdrop) closePalette();
    });
  }

  if (cmdFilters) {
    cmdFilters.addEventListener('click', function (e) {
      var btn = e.target.closest('.cmd-filter');
      if (!btn) return;
      cmdFilters.querySelectorAll('.cmd-filter').forEach(function (b) { b.classList.toggle('on', b === btn); });
      activeFilter = btn.dataset.filter || 'all';
      selectedIndex = 0;
      renderPalette();
      if (cmdInput) cmdInput.focus();
    });
  }

  if (cmdInput) {
    var searchDebounce;
    cmdInput.addEventListener('input', function () {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(function () {
        selectedIndex = 0;
        renderPalette();
      }, 60);
    });

    cmdInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentMatches.length) {
          selectedIndex = (selectedIndex + 1) % currentMatches.length;
          updateSelectionHighlight();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentMatches.length) {
          selectedIndex = (selectedIndex - 1 + currentMatches.length) % currentMatches.length;
          updateSelectionHighlight();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentMatches.length && currentMatches[selectedIndex]) {
          executeItem(currentMatches[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });
  }

  if (cmdResults) {
    cmdResults.addEventListener('click', function (e) {
      var row = e.target.closest('.cmd-result-item');
      if (!row) return;
      var idx = parseInt(row.dataset.idx, 10);
      if (!isNaN(idx) && currentMatches[idx]) {
        executeItem(currentMatches[idx]);
      }
    });
  }

  // Global shortcuts: ⌘K, Ctrl+K, or `/`
  document.addEventListener('keydown', function (e) {
    var isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
    var isSlash = e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName);
    if (isCmdK || isSlash) {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape' && cmdModalBackdrop && !cmdModalBackdrop.hasAttribute('hidden')) {
      closePalette();
    }
  });

  /* ----------------------------------------------------------------- tabs */

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn) return;
    var wrap = btn.closest('.tabs');
    if (!wrap) return;
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
  window.AIP.setTheme = setTheme;
  window.AIP.cycleTheme = cycleTheme;
  window.AIP.toggleDrawer = toggleDrawer;
  window.AIP.openPalette = openPalette;
  window.AIP.closePalette = closePalette;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
