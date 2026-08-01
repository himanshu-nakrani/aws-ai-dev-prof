/* ==========================================================================
   charts.js — tiny dependency-free SVG chart renderer.

   Usage in content:
     <div class="chart" data-chart="donut"
          data-series='[{"label":"Domain 1","value":31},...]'></div>

   Types: donut, hbar, vbar, stack, line, scatter, gauge, heat
   Everything reads CSS custom properties so charts re-theme on toggle.
   ========================================================================== */
(function () {
  'use strict';

  var PALETTE = ['--accent', '--cyan', '--violet', '--green', '--pink', '--amber', '--red'];

  function cssv(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888';
  }
  function color(i) { return cssv(PALETTE[i % PALETTE.length]); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function el(tag, attrs, kids) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function txt(s, attrs) {
    var n = el('text', attrs);
    n.textContent = s;
    return n;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: '100%', role: 'img' });
  }
  function fmt(n) {
    if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
    if (Math.abs(n) < 1 && n !== 0) return n.toFixed(2);
    return String(Math.round(n * 100) / 100);
  }

  /* ------------------------------------------------------------------ donut */

  function donut(host, series, opts) {
    var W = 360, H = 240, cx = 118, cy = 120, r = 84, thick = 30;
    var s = svg(W, H);
    var total = series.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var ang = -Math.PI / 2;

    series.forEach(function (d, i) {
      var frac = d.value / total;
      var a2 = ang + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(ang), y1 = cy + r * Math.sin(ang);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var ri = r - thick;
      var x3 = cx + ri * Math.cos(a2), y3 = cy + ri * Math.sin(a2);
      var x4 = cx + ri * Math.cos(ang), y4 = cy + ri * Math.sin(ang);
      var path = el('path', {
        d: 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 +
           ' L' + x3 + ' ' + y3 + ' A' + ri + ' ' + ri + ' 0 ' + large + ' 0 ' + x4 + ' ' + y4 + ' Z',
        fill: d.color ? cssv(d.color) : color(i),
        opacity: 0.92
      });
      path.appendChild(el('title', {}, [])).textContent = d.label + ': ' + d.value + (opts.unit || '');
      path.style.transition = 'opacity .15s';
      path.addEventListener('mouseenter', function () { path.setAttribute('opacity', 1); });
      path.addEventListener('mouseleave', function () { path.setAttribute('opacity', .92); });
      s.appendChild(path);
      ang = a2;
    });

    s.appendChild(txt(opts.centerTop || String(total) + (opts.unit || ''), {
      x: cx, y: cy - 2, 'text-anchor': 'middle', fill: cssv('--text'),
      'font-size': 26, 'font-weight': 800
    }));
    s.appendChild(txt(opts.centerSub || 'total', {
      x: cx, y: cy + 18, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 11
    }));

    series.forEach(function (d, i) {
      var y = 34 + i * 25;
      s.appendChild(el('rect', { x: 232, y: y - 9, width: 11, height: 11, rx: 3, fill: d.color ? cssv(d.color) : color(i) }));
      s.appendChild(txt(d.label, { x: 250, y: y, fill: cssv('--text-2'), 'font-size': 12 }));
      s.appendChild(txt(d.value + (opts.unit || ''), { x: W - 8, y: y, 'text-anchor': 'end', fill: cssv('--text'), 'font-size': 12, 'font-weight': 700 }));
    });

    host.appendChild(s);
  }

  /* ------------------------------------------------------------------- hbar */

  function hbar(host, series, opts) {
    var labelW = opts.labelWidth || 168;
    var rowH = 30, pad = 10;
    var W = 640, H = pad * 2 + series.length * rowH;
    var s = svg(W, H);
    var max = opts.max || Math.max.apply(null, series.map(function (d) { return d.value; })) || 1;
    var barMax = W - labelW - 62;

    series.forEach(function (d, i) {
      var y = pad + i * rowH;
      s.appendChild(txt(d.label, { x: labelW - 10, y: y + 19, 'text-anchor': 'end', fill: cssv('--text-2'), 'font-size': 12.5 }));
      s.appendChild(el('rect', { x: labelW, y: y + 7, width: barMax, height: 15, rx: 4, fill: cssv('--line-soft') }));
      var w = Math.max(2, (d.value / max) * barMax);
      var rect = el('rect', { x: labelW, y: y + 7, width: 0, height: 15, rx: 4, fill: d.color ? cssv(d.color) : color(i) });
      rect.style.transition = 'width .7s cubic-bezier(.2,.7,.3,1)';
      s.appendChild(rect);
      setTimeout(function () { rect.setAttribute('width', w); }, 40 + i * 55);
      s.appendChild(txt((opts.prefix || '') + fmt(d.value) + (opts.unit || ''), {
        x: labelW + barMax + 8, y: y + 19, fill: cssv('--text'), 'font-size': 12, 'font-weight': 700
      }));
    });
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------- vbar */

  function vbar(host, series, opts) {
    var W = 640, H = 260, padL = 46, padB = 46, padT = 18, padR = 12;
    var s = svg(W, H);
    var max = opts.max || Math.max.apply(null, series.map(function (d) { return d.value; })) * 1.12 || 1;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var bw = Math.min(64, plotW / series.length * 0.62);

    for (var g = 0; g <= 4; g++) {
      var y = padT + plotH * (g / 4);
      s.appendChild(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: cssv('--line-soft'), 'stroke-width': 1 }));
      s.appendChild(txt(fmt(max * (1 - g / 4)), { x: padL - 8, y: y + 4, 'text-anchor': 'end', fill: cssv('--text-3'), 'font-size': 10.5 }));
    }

    series.forEach(function (d, i) {
      var cx = padL + plotW * ((i + 0.5) / series.length);
      var h = (d.value / max) * plotH;
      var rect = el('rect', { x: cx - bw / 2, y: padT + plotH, width: bw, height: 0, rx: 5, fill: d.color ? cssv(d.color) : color(i) });
      rect.style.transition = 'height .7s cubic-bezier(.2,.7,.3,1), y .7s cubic-bezier(.2,.7,.3,1)';
      s.appendChild(rect);
      setTimeout(function () {
        rect.setAttribute('height', h); rect.setAttribute('y', padT + plotH - h);
      }, 40 + i * 60);
      s.appendChild(txt((opts.prefix || '') + fmt(d.value) + (opts.unit || ''), {
        x: cx, y: padT + plotH - h - 7, 'text-anchor': 'middle', fill: cssv('--text'), 'font-size': 11.5, 'font-weight': 700
      }));
      String(d.label).split('\n').forEach(function (line, li) {
        s.appendChild(txt(line, { x: cx, y: H - padB + 17 + li * 13, 'text-anchor': 'middle', fill: cssv('--text-2'), 'font-size': 11 }));
      });
    });
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------ stack */

  function stack(host, series, opts) {
    // series: [{label, parts:[{label,value,color}]}]
    var W = 640, padL = 130, padR = 60, rowH = 34, padT = 26;
    var H = padT + series.length * rowH + 12;
    var s = svg(W, H);
    var totals = series.map(function (r) { return r.parts.reduce(function (a, p) { return a + p.value; }, 0); });
    var max = opts.max || Math.max.apply(null, totals) || 1;
    var barMax = W - padL - padR;

    series.forEach(function (row, i) {
      var y = padT + i * rowH;
      s.appendChild(txt(row.label, { x: padL - 10, y: y + 18, 'text-anchor': 'end', fill: cssv('--text-2'), 'font-size': 12.5 }));
      var x = padL;
      row.parts.forEach(function (p, j) {
        var w = (p.value / max) * barMax;
        var rect = el('rect', { x: x, y: y + 6, width: Math.max(0, w), height: 17, fill: p.color ? cssv(p.color) : color(j), opacity: .92 });
        rect.appendChild(el('title')).textContent = p.label + ': ' + fmt(p.value) + (opts.unit || '');
        s.appendChild(rect);
        x += w;
      });
      s.appendChild(txt(fmt(totals[i]) + (opts.unit || ''), { x: x + 8, y: y + 19, fill: cssv('--text'), 'font-size': 11.5, 'font-weight': 700 }));
    });

    // legend
    var lx = padL;
    (series[0] ? series[0].parts : []).forEach(function (p, j) {
      s.appendChild(el('rect', { x: lx, y: 6, width: 10, height: 10, rx: 2, fill: p.color ? cssv(p.color) : color(j) }));
      var t = txt(p.label, { x: lx + 15, y: 15, fill: cssv('--text-3'), 'font-size': 11 });
      s.appendChild(t);
      lx += 22 + String(p.label).length * 6.1;
    });
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------- line */

  function line(host, series, opts) {
    // series: [{label, points:[[x,y],...], color}]
    var W = 640, H = 270, padL = 52, padR = 16, padT = 20, padB = 44;
    var s = svg(W, H);
    var all = series.reduce(function (a, sr) { return a.concat(sr.points); }, []);
    var xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; });
    var xmin = opts.xmin != null ? opts.xmin : Math.min.apply(null, xs);
    var xmax = opts.xmax != null ? opts.xmax : Math.max.apply(null, xs);
    var ymin = opts.ymin != null ? opts.ymin : 0;
    var ymax = opts.ymax != null ? opts.ymax : Math.max.apply(null, ys) * 1.12;
    var pw = W - padL - padR, ph = H - padT - padB;
    var X = function (v) { return padL + ((v - xmin) / (xmax - xmin || 1)) * pw; };
    var Y = function (v) { return padT + ph - ((v - ymin) / (ymax - ymin || 1)) * ph; };

    for (var g = 0; g <= 4; g++) {
      var y = padT + ph * (g / 4);
      s.appendChild(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: cssv('--line-soft') }));
      s.appendChild(txt(fmt(ymax - (ymax - ymin) * (g / 4)), { x: padL - 8, y: y + 4, 'text-anchor': 'end', fill: cssv('--text-3'), 'font-size': 10.5 }));
    }
    (opts.xticks || []).forEach(function (t) {
      s.appendChild(txt(t.label, { x: X(t.at), y: H - padB + 18, 'text-anchor': 'middle', fill: cssv('--text-2'), 'font-size': 11 }));
    });
    if (opts.ylabel) s.appendChild(txt(opts.ylabel, { x: 12, y: padT + ph / 2, fill: cssv('--text-3'), 'font-size': 10.5, transform: 'rotate(-90 12 ' + (padT + ph / 2) + ')', 'text-anchor': 'middle' }));
    if (opts.xlabel) s.appendChild(txt(opts.xlabel, { x: padL + pw / 2, y: H - 6, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10.5 }));

    series.forEach(function (sr, i) {
      var c = sr.color ? cssv(sr.color) : color(i);
      var d = sr.points.map(function (p, j) { return (j ? 'L' : 'M') + X(p[0]) + ' ' + Y(p[1]); }).join(' ');
      if (sr.area) {
        s.appendChild(el('path', {
          d: d + ' L' + X(sr.points[sr.points.length - 1][0]) + ' ' + Y(ymin) + ' L' + X(sr.points[0][0]) + ' ' + Y(ymin) + ' Z',
          fill: c, opacity: .1
        }));
      }
      var p = el('path', { d: d, fill: 'none', stroke: c, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      s.appendChild(p);
      try {
        var len = p.getTotalLength ? p.getTotalLength() : 0;
        if (len) {
          p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
          p.style.transition = 'stroke-dashoffset 1s ease ' + (i * .12) + 's';
          setTimeout(function () { p.style.strokeDashoffset = 0; }, 30);
        }
      } catch (e) { /* jsdom / no layout */ }
      sr.points.forEach(function (pt) {
        if (sr.dots === false) return;
        s.appendChild(el('circle', { cx: X(pt[0]), cy: Y(pt[1]), r: 3, fill: cssv('--bg-2'), stroke: c, 'stroke-width': 2 }));
      });
    });

    var lx = padL;
    series.forEach(function (sr, i) {
      if (!sr.label) return;
      s.appendChild(el('rect', { x: lx, y: 4, width: 10, height: 10, rx: 2, fill: sr.color ? cssv(sr.color) : color(i) }));
      s.appendChild(txt(sr.label, { x: lx + 15, y: 13, fill: cssv('--text-3'), 'font-size': 11 }));
      lx += 24 + sr.label.length * 6.1;
    });
    host.appendChild(s);
  }

  /* ---------------------------------------------------------------- scatter */

  function scatter(host, series, opts) {
    var W = 640, H = 320, padL = 58, padR = 18, padT = 18, padB = 48;
    var s = svg(W, H);
    var xs = series.map(function (d) { return d.x; }), ys = series.map(function (d) { return d.y; });
    var xmin = opts.xmin != null ? opts.xmin : 0, xmax = opts.xmax != null ? opts.xmax : Math.max.apply(null, xs) * 1.15;
    var ymin = opts.ymin != null ? opts.ymin : 0, ymax = opts.ymax != null ? opts.ymax : Math.max.apply(null, ys) * 1.15;
    var pw = W - padL - padR, ph = H - padT - padB;
    var X = function (v) { return padL + ((v - xmin) / (xmax - xmin || 1)) * pw; };
    var Y = function (v) { return padT + ph - ((v - ymin) / (ymax - ymin || 1)) * ph; };

    for (var g = 0; g <= 4; g++) {
      var y = padT + ph * (g / 4);
      s.appendChild(el('line', { x1: padL, y1: y, x2: W - padR, y2: y, stroke: cssv('--line-soft') }));
      s.appendChild(txt(fmt(ymax - (ymax - ymin) * (g / 4)), { x: padL - 8, y: y + 4, 'text-anchor': 'end', fill: cssv('--text-3'), 'font-size': 10.5 }));
      var x = padL + pw * (g / 4);
      s.appendChild(el('line', { x1: x, y1: padT, x2: x, y2: padT + ph, stroke: cssv('--line-soft') }));
      s.appendChild(txt(fmt(xmin + (xmax - xmin) * (g / 4)), { x: x, y: padT + ph + 16, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10.5 }));
    }
    if (opts.ylabel) s.appendChild(txt(opts.ylabel, { x: 14, y: padT + ph / 2, fill: cssv('--text-2'), 'font-size': 11, transform: 'rotate(-90 14 ' + (padT + ph / 2) + ')', 'text-anchor': 'middle' }));
    if (opts.xlabel) s.appendChild(txt(opts.xlabel, { x: padL + pw / 2, y: H - 8, 'text-anchor': 'middle', fill: cssv('--text-2'), 'font-size': 11 }));

    series.forEach(function (d, i) {
      var c = d.color ? cssv(d.color) : color(i);
      var g2 = el('g');
      g2.appendChild(el('circle', { cx: X(d.x), cy: Y(d.y), r: d.r || 7, fill: c, opacity: .8 }));
      g2.appendChild(txt(d.label, { x: X(d.x), y: Y(d.y) - (d.r || 7) - 6, 'text-anchor': 'middle', fill: cssv('--text-2'), 'font-size': 10.5 }));
      g2.appendChild(el('title')).textContent = d.label + ' — ' + (opts.xlabel || 'x') + ': ' + d.x + ', ' + (opts.ylabel || 'y') + ': ' + d.y;
      s.appendChild(g2);
    });
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------ gauge */

  function gauge(host, series, opts) {
    var v = series[0].value, max = opts.max || 1000, min = opts.min || 0;
    var W = 300, H = 176;
    var s = svg(W, H);
    var cx = 150, cy = 140, r = 108, thick = 20;
    function arc(from, to, col, op) {
      var a1 = Math.PI + Math.PI * from, a2 = Math.PI + Math.PI * to;
      var x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      var x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      var ri = r - thick;
      var x3 = cx + ri * Math.cos(a2), y3 = cy + ri * Math.sin(a2);
      var x4 = cx + ri * Math.cos(a1), y4 = cy + ri * Math.sin(a1);
      return el('path', {
        d: 'M' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + y2 +
           ' L' + x3 + ' ' + y3 + ' A' + ri + ' ' + ri + ' 0 0 0 ' + x4 + ' ' + y4 + ' Z',
        fill: cssv(col), opacity: op == null ? 1 : op
      });
    }
    s.appendChild(arc(0, 1, '--line-soft', 1));
    var passFrac = ((opts.threshold || 750) - min) / (max - min);
    var frac = Math.max(0, Math.min(1, (v - min) / (max - min)));
    s.appendChild(arc(0, frac, frac >= passFrac ? '--green' : '--red', .95));
    // pass marker
    var a = Math.PI + Math.PI * passFrac;
    s.appendChild(el('line', {
      x1: cx + (r - thick - 4) * Math.cos(a), y1: cy + (r - thick - 4) * Math.sin(a),
      x2: cx + (r + 5) * Math.cos(a), y2: cy + (r + 5) * Math.sin(a),
      stroke: cssv('--text'), 'stroke-width': 2
    }));
    s.appendChild(txt('pass ' + (opts.threshold || 750), { x: cx + (r + 12) * Math.cos(a), y: cy + (r + 12) * Math.sin(a) - 4, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10 }));
    s.appendChild(txt(String(Math.round(v)), { x: cx, y: cy - 18, 'text-anchor': 'middle', fill: cssv('--text'), 'font-size': 40, 'font-weight': 800 }));
    s.appendChild(txt(opts.caption || 'scaled score', { x: cx, y: cy + 4, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 11 }));
    s.appendChild(txt(String(min), { x: cx - r + thick / 2, y: cy + 20, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10 }));
    s.appendChild(txt(String(max), { x: cx + r - thick / 2, y: cy + 20, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10 }));
    host.appendChild(s);
  }

  /* ------------------------------------------------------------------- heat */

  function heat(host, series, opts) {
    // series: {cols:[], rows:[{label, values:[]}]}
    var cols = series.cols, rows = series.rows;
    var padL = opts.labelWidth || 150, padT = 34, cell = 46, gap = 3;
    var W = padL + cols.length * cell + 12;
    var H = padT + rows.length * cell + 8;
    var s = svg(W, H);
    var max = 0;
    rows.forEach(function (r) { r.values.forEach(function (v) { max = Math.max(max, v); }); });

    cols.forEach(function (c, j) {
      s.appendChild(txt(c, { x: padL + j * cell + cell / 2, y: padT - 12, 'text-anchor': 'middle', fill: cssv('--text-3'), 'font-size': 10.5 }));
    });
    rows.forEach(function (r, i) {
      s.appendChild(txt(r.label, { x: padL - 10, y: padT + i * cell + cell / 2 + 4, 'text-anchor': 'end', fill: cssv('--text-2'), 'font-size': 12 }));
      r.values.forEach(function (v, j) {
        var t = max ? v / max : 0;
        s.appendChild(el('rect', {
          x: padL + j * cell + gap / 2, y: padT + i * cell + gap / 2,
          width: cell - gap, height: cell - gap, rx: 6,
          fill: cssv('--accent'), opacity: 0.10 + t * 0.85
        }));
        s.appendChild(txt(v + (opts.unit || ''), {
          x: padL + j * cell + cell / 2, y: padT + i * cell + cell / 2 + 4,
          'text-anchor': 'middle', fill: t > .55 ? '#1a1005' : cssv('--text-2'),
          'font-size': 11, 'font-weight': 700
        }));
      });
    });
    host.appendChild(s);
  }

  /* -------------------------------------------------------------- dispatch */

  var TYPES = { donut: donut, hbar: hbar, vbar: vbar, stack: stack, line: line, scatter: scatter, gauge: gauge, heat: heat };

  function render(host) {
    var type = host.dataset.chart;
    if (!TYPES[type]) return;
    var series, opts = {};
    try { series = JSON.parse(host.dataset.series || '[]'); } catch (e) { host.innerHTML = '<em>bad chart data</em>'; return; }
    try { opts = JSON.parse(host.dataset.opts || '{}'); } catch (e) { opts = {}; }
    host.innerHTML = '';
    TYPES[type](host, series, opts);
    if (host.dataset.caption) {
      var cap = document.createElement('div');
      cap.className = 'cap';
      cap.textContent = host.dataset.caption;
      host.appendChild(cap);
    }
  }

  function renderAll(root) {
    (root || document).querySelectorAll('[data-chart]').forEach(render);
  }

  window.AIPCharts = { renderAll: renderAll, render: render, cssv: cssv, color: color, fmt: fmt, esc: esc };
})();
