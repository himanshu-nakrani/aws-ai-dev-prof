/* ==========================================================================
   quiz.js — question bank engine + timed exam simulator + flashcards.
   Data comes from assets/data/questions.js (window.AIP_QUESTIONS)
   and assets/data/flashcards.js (window.AIP_FLASHCARDS).
   ========================================================================== */
(function () {
  'use strict';

  var E = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  };
  var KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

  var DOMAINS = {
    d0: { name: 'Foundations', weight: 0 },
    d1: { name: 'D1 · FM integration, data, compliance', weight: 31 },
    d2: { name: 'D2 · Implementation and integration', weight: 26 },
    d3: { name: 'D3 · Safety, security, governance', weight: 20 },
    d4: { name: 'D4 · Operational efficiency', weight: 12 },
    d5: { name: 'D5 · Testing, validation, troubleshooting', weight: 11 }
  };
  window.AIP_DOMAINS = DOMAINS;

  /* ---------------------------------------------------------------- state */

  function hist() { return (window.AIP && window.AIP.load(window.AIP.LS.quiz, null)) || { seen: {}, missed: {}, runs: [] }; }
  function saveHist(h) { if (window.AIP) window.AIP.save(window.AIP.LS.quiz, h); }

  function shuffle(a, seed) {
    var arr = a.slice(), s = seed || Math.floor(Math.random() * 1e9);
    for (var i = arr.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      var j = s % (i + 1);
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function bank() { return window.AIP_QUESTIONS || []; }

  /* Build an exam that matches the real blueprint weighting. */
  function weightedSet(n) {
    var out = [], all = bank();
    Object.keys(DOMAINS).forEach(function (d) {
      var w = DOMAINS[d].weight;
      if (!w) return;
      var want = Math.round(n * w / 100);
      var pool = shuffle(all.filter(function (q) { return q.d === d; }));
      out = out.concat(pool.slice(0, want));
    });
    // top up / trim to exactly n
    var used = new Set(out.map(function (q) { return q.id; }));
    var rest = shuffle(all.filter(function (q) { return !used.has(q.id) && q.d !== 'd0'; }));
    while (out.length < n && rest.length) out.push(rest.pop());
    return shuffle(out).slice(0, n);
  }

  /* ----------------------------------------------------------------- quiz */

  function Quiz(host) {
    this.host = host;
    this.qs = [];
    this.i = 0;
    this.answers = {};
    this.mode = 'practice';
    this.deadline = null;
    this.timer = null;
    this.render();
  }

  Quiz.prototype.start = function (qs, mode, minutes) {
    if (!qs.length) { alert('No questions match that filter yet.'); return; }
    this.qs = qs; this.mode = mode; this.i = 0; this.answers = {};
    this.deadline = minutes ? Date.now() + minutes * 60000 : null;
    clearInterval(this.timer);
    if (this.deadline) {
      var self = this;
      this.timer = setInterval(function () { self.tick(); }, 1000);
    }
    this.render();
  };

  Quiz.prototype.tick = function () {
    var left = this.deadline - Date.now();
    var el = this.host.querySelector('[data-timer]');
    if (left <= 0) { clearInterval(this.timer); this.finish(); return; }
    if (el) {
      var m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
      el.textContent = m + ':' + String(s).padStart(2, '0');
      el.classList.toggle('warn', left < 10 * 60000);
    }
  };

  Quiz.prototype.setupScreen = function () {
    var counts = {};
    bank().forEach(function (q) { counts[q.d] = (counts[q.d] || 0) + 1; });
    var h = hist();
    var missedN = Object.keys(h.missed || {}).length;
    var total = bank().length;

    this.host.innerHTML =
      '<div class="quiz-shell">' +
      '<h3 style="margin-top:0">Pick a mode</h3>' +
      '<div class="grid grid-2" style="margin-bottom:6px">' +
        '<div class="card" style="margin:0"><div class="card-title"><span class="card-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></span> Full Mock Exam</div>' +
        '<p style="font-size:13.5px">75 questions, 180 minutes, domain mix weighted exactly like the real blueprint. Scaled to 100–1000 with a 750 pass mark. No feedback until you submit — same as exam day.</p>' +
        '<button class="btn" data-go="exam">Start mock exam</button></div>' +
        '<div class="card" style="margin:0"><div class="card-title"><span class="card-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span> Practice Mode</div>' +
        '<p style="font-size:13.5px">Instant feedback and a full explanation after every question, including why each wrong option is wrong. This is where the learning happens.</p>' +
        '<div class="btn-row" style="margin:0"><button class="btn" data-go="practice20">20 mixed</button><button class="btn btn-ghost" data-go="practiceAll">All ' + total + '</button></div></div>' +
      '</div>' +
      '<h4>Drill one domain</h4><div class="chip-row">' +
        Object.keys(DOMAINS).filter(function (d) { return counts[d]; }).map(function (d) {
          return '<button class="chip" data-drill="' + d + '">' + E(DOMAINS[d].name) + ' <span style="opacity:.6">' + counts[d] + '</span></button>';
        }).join('') +
      '</div>' +
      '<h4>Targeted</h4><div class="btn-row">' +
        '<button class="btn btn-ghost btn-sm" data-go="missed"' + (missedN ? '' : ' disabled') + '>Retry ' + missedN + ' missed</button>' +
        '<button class="btn btn-ghost btn-sm" data-go="unseen">Only questions I have not seen</button>' +
        '<button class="btn btn-ghost btn-sm" data-go="hard">Hardest 25</button>' +
      '</div>' +
      this.statsBlock(h) +
      '</div>';

    var self = this;
    this.host.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.dataset.go;
        if (g === 'exam') self.start(weightedSet(75), 'exam', 180);
        else if (g === 'practice20') self.start(weightedSet(20), 'practice');
        else if (g === 'practiceAll') self.start(shuffle(bank()), 'practice');
        else if (g === 'missed') self.start(shuffle(bank().filter(function (q) { return h.missed[q.id]; })), 'practice');
        else if (g === 'unseen') self.start(shuffle(bank().filter(function (q) { return !h.seen[q.id]; })), 'practice');
        else if (g === 'hard') self.start(shuffle(bank().filter(function (q) { return q.hard; })).slice(0, 25), 'practice');
      });
    });
    this.host.querySelectorAll('[data-drill]').forEach(function (b) {
      b.addEventListener('click', function () {
        self.start(shuffle(bank().filter(function (q) { return q.d === b.dataset.drill; })), 'practice');
      });
    });
  };

  Quiz.prototype.statsBlock = function (h) {
    var runs = h.runs || [];
    if (!runs.length) return '<p style="font-size:12.5px;color:var(--text-3);margin-top:18px;margin-bottom:0">No attempts recorded yet. Your scores are stored in this browser only — nothing is uploaded anywhere.</p>';
    var last = runs[runs.length - 1];
    var pts = runs.slice(-12).map(function (r, i) { return [i + 1, r.scaled]; });
    return '<hr><h4>Your history</h4>' +
      '<div class="grid grid-3" style="margin-bottom:10px">' +
      '<div class="stat"><div class="stat-val">' + runs.length + '</div><div class="stat-lbl">attempts</div></div>' +
      '<div class="stat"><div class="stat-val" style="color:var(--' + (last.scaled >= 750 ? 'green' : 'red') + ')">' + last.scaled + '</div><div class="stat-lbl">most recent scaled</div></div>' +
      '<div class="stat"><div class="stat-val">' + Math.max.apply(null, runs.map(function (r) { return r.scaled; })) + '</div><div class="stat-lbl">best</div></div></div>' +
      (pts.length > 1 ? '<div class="chart" data-chart="line" data-series=\'' +
        JSON.stringify([{ label: 'scaled score', points: pts, color: '--accent', area: true }]).replace(/'/g, '&#39;') +
        '\' data-opts=\'{"ymin":100,"ymax":1000,"xlabel":"attempt","ylabel":"scaled score"}\'></div>' : '');
  };

  Quiz.prototype.render = function () {
    if (!this.qs.length) { this.setupScreen(); return; }
    if (this.i >= this.qs.length) { this.finish(); return; }

    var q = this.qs[this.i];
    var ans = this.answers[q.id] || { picked: [], locked: false };
    var multi = q.a.length > 1;

    this.host.innerHTML =
      '<div class="quiz-shell">' +
        (this.bare
          ? '<div class="quiz-topbar"><span class="quiz-counter">Quick check' +
            (this.qs.length > 1 ? ' — ' + (this.i + 1) + ' of ' + this.qs.length : '') + '</span></div>'
          : '<div class="quiz-topbar">' +
            '<span class="quiz-counter">Question ' + (this.i + 1) + ' of ' + this.qs.length + '</span>' +
            '<div class="meter" style="flex:1;min-width:120px"><i style="width:' + ((this.i) / this.qs.length * 100) + '%"></i></div>' +
            (this.mode === 'exam' ? '<span class="quiz-timer" data-timer>—</span>' : '<button class="btn btn-ghost btn-sm" data-quit>End session</button>') +
          '</div>') +
        '<div class="q-domain">' + E(DOMAINS[q.d] ? DOMAINS[q.d].name : q.d) + (q.hard ? ' · harder' : '') + '</div>' +
        '<div class="q-stem">' + q.q + '</div>' +
        (multi ? '<div class="q-hint">Choose ' + q.a.length + '.</div>' : '') +
        '<div class="q-opts">' + q.o.map(function (o, i) {
          var cls = 'q-opt';
          if (ans.picked.indexOf(i) >= 0) cls += ' sel';
          if (ans.locked) {
            cls += ' locked';
            if (q.a.indexOf(i) >= 0) cls = 'q-opt locked correct';
            else if (ans.picked.indexOf(i) >= 0) cls = 'q-opt locked wrong';
          }
          return '<button class="' + cls + '" data-opt="' + i + '"><span class="q-key">' + KEYS[i] + '</span><span>' + o + '</span></button>';
        }).join('') + '</div>' +
        (ans.locked ? this.explainHtml(q, ans) : '') +
        '<div class="quiz-actions">' +
          '<button class="btn btn-ghost btn-sm" data-prev' + (this.i === 0 ? ' disabled' : '') + '>← Previous</button>' +
          '<span class="spacer"></span>' +
          (this.mode === 'practice' && !ans.locked
            ? '<button class="btn" data-check' + (ans.picked.length ? '' : ' disabled') + '>Check answer</button>'
            : '<button class="btn" data-next>' + (this.i === this.qs.length - 1 ? 'Finish →' : 'Next →') + '</button>') +
          (this.mode === 'exam' ? '<button class="btn btn-ghost btn-sm" data-submit>Submit exam</button>' : '') +
        '</div>' +
      '</div>';

    var self = this;
    this.host.querySelectorAll('[data-opt]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (ans.locked) return;
        var idx = +b.dataset.opt;
        var p = ans.picked.slice();
        if (multi) {
          var at = p.indexOf(idx);
          if (at >= 0) p.splice(at, 1);
          else if (p.length < q.a.length) p.push(idx);
        } else p = [idx];
        self.answers[q.id] = { picked: p, locked: false };
        self.render();
      });
    });
    var check = this.host.querySelector('[data-check]');
    if (check) check.addEventListener('click', function () {
      self.answers[q.id].locked = true;
      self.record(q, self.answers[q.id].picked);
      self.render();
    });
    var next = this.host.querySelector('[data-next]');
    if (next) next.addEventListener('click', function () { self.i++; self.render(); });
    var prev = this.host.querySelector('[data-prev]');
    if (prev) prev.addEventListener('click', function () { self.i--; self.render(); });
    var quit = this.host.querySelector('[data-quit]');
    if (quit) quit.addEventListener('click', function () { self.finish(); });
    var sub = this.host.querySelector('[data-submit]');
    if (sub) sub.addEventListener('click', function () {
      var unanswered = self.qs.filter(function (qq) { return !(self.answers[qq.id] || {}).picked || !self.answers[qq.id].picked.length; }).length;
      if (unanswered && !confirm(unanswered + ' question(s) still unanswered. Submit anyway?')) return;
      self.finish();
    });
    if (this.mode === 'exam') this.tick();
    if (window.AIPCharts) window.AIPCharts.renderAll(this.host);
  };

  Quiz.prototype.explainHtml = function (q, ans) {
    var correct = q.a.slice().sort().join(',') === ans.picked.slice().sort().join(',');
    return '<div class="q-explain">' +
      '<div class="q-verdict ' + (correct ? 'ok' : 'no') + '">' + (correct ? '✓ Correct' : '✕ Not quite') +
      ' — answer: ' + q.a.map(function (i) { return KEYS[i]; }).join(' + ') + '</div>' +
      '<div class="q-why">' + q.e + '</div>' +
      (q.oe ? '<div style="margin-top:10px">' + q.o.map(function (o, i) {
        if (!q.oe[i]) return '';
        var good = q.a.indexOf(i) >= 0;
        return '<div class="q-optwhy' + (good ? ' good' : '') + '"><b>' + KEYS[i] + '</b><span>' + q.oe[i] + '</span></div>';
      }).join('') + '</div>' : '') +
      (q.ref ? '<div class="q-ref">Where this lives: ' + q.ref + '</div>' : '') +
      '</div>';
  };

  Quiz.prototype.record = function (q, picked) {
    var h = hist();
    h.seen[q.id] = 1;
    var ok = q.a.slice().sort().join(',') === picked.slice().sort().join(',');
    if (ok) delete h.missed[q.id]; else h.missed[q.id] = 1;
    saveHist(h);
  };

  Quiz.prototype.finish = function () {
    clearInterval(this.timer);
    var self = this;

    if (this.bare) {
      var got = this.qs.filter(function (q) {
        var p = (self.answers[q.id] || {}).picked || [];
        return p.length && q.a.slice().sort().join(',') === p.slice().sort().join(',');
      }).length;
      this.host.innerHTML = '<div class="callout ' + (got === this.qs.length ? 'tip' : 'info') + '" style="margin-bottom:0">' +
        '<div class="co-title">Quick check: ' + got + ' / ' + this.qs.length + '</div>' +
        (got === this.qs.length
          ? 'Solid. Carry on.'
          : 'Worth re-reading the section above before you move on — this exact distinction shows up in scenario questions.') +
        ' <button class="btn btn-ghost btn-sm" data-retry style="margin-left:8px">Try again</button></div>';
      this.host.querySelector('[data-retry]').addEventListener('click', function () {
        self.start(self.qs, 'practice');
      });
      return;
    }
    var perDom = {}, correctN = 0;
    this.qs.forEach(function (q) {
      var picked = (self.answers[q.id] || {}).picked || [];
      var ok = picked.length && q.a.slice().sort().join(',') === picked.slice().sort().join(',');
      perDom[q.d] = perDom[q.d] || { n: 0, ok: 0 };
      perDom[q.d].n++;
      if (ok) { perDom[q.d].ok++; correctN++; }
      if (self.mode === 'exam') self.record(q, picked);
    });
    var pct = this.qs.length ? correctN / this.qs.length : 0;
    // AWS reports 100-1000 with 750 to pass; ~72% raw is the usual working
    // assumption for the pass line. This mapping is a study aid, not official.
    var scaled = Math.round(100 + pct * 900);

    if (this.mode === 'exam') {
      var h = hist();
      h.runs = (h.runs || []).concat([{ scaled: scaled, pct: Math.round(pct * 100), n: this.qs.length }]);
      if (h.runs.length > 40) h.runs = h.runs.slice(-40);
      saveHist(h);
    }

    var domRows = Object.keys(perDom).map(function (d) {
      var p = perDom[d], r = Math.round(p.ok / p.n * 100);
      return '<div class="dom-bar-row"><div><div class="dom-bar-lbl">' + E(DOMAINS[d] ? DOMAINS[d].name : d) +
        ' <span style="color:var(--text-3)">(' + p.ok + '/' + p.n + ')</span></div>' +
        '<div class="meter"><i style="width:' + r + '%;background:var(--' + (r >= 72 ? 'green' : r >= 55 ? 'amber' : 'red') + ')"></i></div></div>' +
        '<div class="dom-bar-num" style="color:var(--' + (r >= 72 ? 'green' : r >= 55 ? 'amber' : 'red') + ')">' + r + '%</div></div>';
    }).join('');

    var weakest = Object.keys(perDom).sort(function (a, b) {
      return (perDom[a].ok / perDom[a].n) - (perDom[b].ok / perDom[b].n);
    })[0];

    this.host.innerHTML =
      '<div class="quiz-shell">' +
        '<div class="result-hero">' +
          '<div class="chart" data-chart="gauge" data-series=\'[{"value":' + scaled + '}]\' data-opts=\'{"max":1000,"min":100,"threshold":750}\'></div>' +
          '<div class="result-verdict" style="color:var(--' + (scaled >= 750 ? 'green' : 'red') + ')">' +
            (scaled >= 750 ? 'Pass territory' : 'Below the line') + '</div>' +
          '<div class="result-sub">' + correctN + ' of ' + this.qs.length + ' correct (' + Math.round(pct * 100) + '%)' +
          (this.mode === 'exam' ? ' · mock exam' : ' · practice') + '</div>' +
        '</div>' +
        '<h4>By domain</h4><div class="dom-bars">' + domRows + '</div>' +
        (weakest ? '<div class="callout ' + (scaled >= 750 ? 'tip' : 'warn') + '"><div class="co-title">What to do next</div>' +
          'Your weakest area is <strong>' + E(DOMAINS[weakest] ? DOMAINS[weakest].name : weakest) + '</strong>. ' +
          'Re-read that module, then come back and drill only that domain. Anything under 72% in a domain worth 20%+ of the exam is the thing standing between you and a pass.' +
          '</div>' : '') +
        '<h4>Review every question</h4><div data-review></div>' +
        '<div class="btn-row"><button class="btn" data-again>Back to modes</button>' +
        '<button class="btn btn-ghost" data-retrywrong>Retry the ones I missed</button></div>' +
      '</div>';

    this.host.querySelector('[data-review]').innerHTML = this.qs.map(function (q, n) {
      var picked = (self.answers[q.id] || {}).picked || [];
      var ok = picked.length && q.a.slice().sort().join(',') === picked.slice().sort().join(',');
      return '<details class="acc"><summary><span style="color:var(--' + (ok ? 'green' : 'red') + ');font-weight:800">' +
        (ok ? '✓' : '✕') + '</span> Q' + (n + 1) + '. ' + E(q.q.replace(/<[^>]+>/g, '').slice(0, 105)) + '…</summary>' +
        '<div class="acc-body"><div class="q-stem" style="font-size:14.5px">' + q.q + '</div>' +
        '<div class="q-opts">' + q.o.map(function (o, i) {
          var cls = 'q-opt locked';
          if (q.a.indexOf(i) >= 0) cls += ' correct';
          else if (picked.indexOf(i) >= 0) cls += ' wrong';
          return '<div class="' + cls + '"><span class="q-key">' + KEYS[i] + '</span><span>' + o + '</span></div>';
        }).join('') + '</div>' +
        self.explainHtml(q, { picked: picked }) + '</div></details>';
    }).join('');

    this.host.querySelector('[data-again]').addEventListener('click', function () { self.qs = []; self.render(); });
    this.host.querySelector('[data-retrywrong]').addEventListener('click', function () {
      var wrong = self.qs.filter(function (q) {
        var p = (self.answers[q.id] || {}).picked || [];
        return !(p.length && q.a.slice().sort().join(',') === p.slice().sort().join(','));
      });
      if (!wrong.length) { alert('Nothing missed. Go book the exam.'); return; }
      self.start(shuffle(wrong), 'practice');
    });
    if (window.AIPCharts) window.AIPCharts.renderAll(this.host);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ----------------------------------------------------------- flashcards */

  function flashcards(host) {
    var cards = window.AIP_FLASHCARDS || [];
    if (!cards.length) { host.innerHTML = '<p>No cards loaded.</p>'; return; }
    var state = (window.AIP && window.AIP.load(window.AIP.LS.fc, null)) || { box: {} };
    var tags = [];
    cards.forEach(function (c) { if (tags.indexOf(c.t) < 0) tags.push(c.t); });
    var filter = 'all', deck = [], i = 0, flipped = false;

    function build() {
      deck = cards.filter(function (c) { return filter === 'all' || c.t === filter; });
      // Leitner-ish: cards you keep missing come round more often.
      deck.sort(function (a, b) { return (state.box[a.q] || 0) - (state.box[b.q] || 0); });
      var head = deck.slice(0, Math.ceil(deck.length / 2));
      var tail = deck.slice(Math.ceil(deck.length / 2));
      deck = head.concat(tail.sort(function () { return Math.random() - 0.5; }));
      i = 0; flipped = false;
    }

    function draw() {
      var c = deck[i];
      var known = Object.keys(state.box).filter(function (k) { return state.box[k] >= 2; }).length;
      host.innerHTML =
        '<div class="chip-row">' +
          '<button class="chip' + (filter === 'all' ? ' on' : '') + '" data-f="all">All ' + cards.length + '</button>' +
          tags.map(function (t) {
            return '<button class="chip' + (filter === t ? ' on' : '') + '" data-f="' + E(t) + '">' + E(t) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="fc-stage"><div class="fc-card' + (flipped ? ' flipped' : '') + '" data-card>' +
          '<div class="fc-face"><span class="fc-tag">' + E(c.t) + ' · card ' + (i + 1) + ' of ' + deck.length + '</span>' +
            '<div class="fc-front-text">' + c.q + '</div>' +
            '<span class="fc-hint">click, or press <span class="kbd">space</span>, to reveal</span></div>' +
          '<div class="fc-face fc-back"><span class="fc-tag">answer</span>' +
            '<div class="fc-back-text">' + c.a + '</div></div>' +
        '</div></div>' +
        '<div class="btn-row">' +
          '<button class="btn btn-ghost" data-again>Didn\'t know it</button>' +
          '<button class="btn" data-got>Got it</button>' +
          '<span style="flex:1"></span>' +
          '<span style="font-size:12.5px;color:var(--text-3);align-self:center">' + known + ' of ' + cards.length + ' marked known</span>' +
        '</div>';

      host.querySelector('[data-card]').addEventListener('click', function () { flipped = !flipped; draw(); });
      host.querySelectorAll('[data-f]').forEach(function (b) {
        b.addEventListener('click', function () { filter = b.dataset.f; build(); draw(); });
      });
      host.querySelector('[data-got]').addEventListener('click', function () { grade(1); });
      host.querySelector('[data-again]').addEventListener('click', function () { grade(-1); });
    }

    function grade(delta) {
      var c = deck[i];
      state.box[c.q] = Math.max(0, Math.min(3, (state.box[c.q] || 0) + delta));
      if (window.AIP) window.AIP.save(window.AIP.LS.fc, state);
      i = (i + 1) % deck.length;
      flipped = false;
      draw();
    }

    document.addEventListener('keydown', function (e) {
      if (!host.isConnected || host.offsetParent === null) return;
      if (/input|textarea/i.test(document.activeElement.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); flipped = !flipped; draw(); }
      if (e.key === 'ArrowRight') grade(1);
      if (e.key === 'ArrowLeft') grade(-1);
    });

    build(); draw();
  }

  /* --------------------------------------------------------------- wiring */

  function init(root) {
    (root || document).querySelectorAll('[data-quiz]').forEach(function (host) {
      if (host.dataset.ready === '1') return;
      host.dataset.ready = '1';
      new Quiz(host);
    });
    (root || document).querySelectorAll('[data-flashcards]').forEach(function (host) {
      if (host.dataset.ready === '1') return;
      host.dataset.ready = '1';
      flashcards(host);
    });
    // inline "quick check" questions embedded inside lesson pages
    (root || document).querySelectorAll('[data-checkq]').forEach(function (host) {
      if (host.dataset.ready === '1') return;
      host.dataset.ready = '1';
      var ids = host.dataset.checkq.split(/\s*,\s*/);
      var qs = ids.map(function (id) {
        return bank().filter(function (x) { return x.id === id; })[0];
      }).filter(Boolean);
      if (!qs.length) { host.style.display = 'none'; return; }
      var qz = new Quiz(host);
      qz.bare = true;
      qz.start(qs, 'practice');
    });
  }

  window.AIPQuiz = { init: init, weightedSet: weightedSet, DOMAINS: DOMAINS };
  window.AIPFlash = { init: function () {} };
})();
