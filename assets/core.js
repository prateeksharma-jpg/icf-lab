/* ICF Lab core: DOM helpers, finance engine, charts, problem + quiz components.
   Plain script (no modules) so the site also works when opened from disk. */
(function (G) {
  'use strict';

  // ---------- DOM ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }
  const NS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, ...kids) {
    const el = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) { if (attrs[k] != null) el.setAttribute(k, attrs[k]); }
    for (const c of kids.flat()) if (c != null) el.append(c.nodeType ? c : document.createTextNode(String(c)));
    return el;
  }

  // ---------- format ----------
  const F = {
    pct: (x, d = 2) => (x == null || !isFinite(x)) ? '–' : (x * 100).toFixed(d) + '%',
    pp: (x, d = 2) => (x == null || !isFinite(x)) ? '–' : (x * 100).toFixed(d),
    n: (x, d = 2) => (x == null || !isFinite(x)) ? '–' : Number(x).toFixed(d),
    big: (x, d = 0) => (x == null || !isFinite(x)) ? '–' : Number(x).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }),
    usd: (x, d = 1) => (x == null || !isFinite(x)) ? '–' : Number(x).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d }),
  };

  // ---------- finance engine ----------
  const Fin = {
    lever: (bu, de, t) => bu * (1 + de * (1 - t)),
    unlever: (bl, de, t) => bl / (1 + de * (1 - t)),
    capm: (rf, b, mrp) => rf + b * mrp,
    wacc: (wE, ke, wD, kd, t) => wE * ke + wD * kd * (1 - t),
    deFromDv: dv => dv / (1 - dv),
    dvFromDe: de => de / (1 + de),
    pv: (cfs, r) => cfs.reduce((a, c, i) => a + c / Math.pow(1 + r, i), 0), // cfs[0] at t=0
    annuityFactor: (n, r) => (1 - Math.pow(1 + r, -n)) / r,
    irr(cfs) {
      let lo = -0.99, hi = 5;
      const f = r => Fin.pv(cfs, r);
      if (f(lo) * f(hi) > 0) return NaN;
      for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (f(lo) * f(m) <= 0) ? (hi = m) : (lo = m); }
      return (lo + hi) / 2;
    },
    bondPrice: (c, face, n, y) => { let p = 0; for (let i = 1; i <= n; i++) p += c / Math.pow(1 + y, i); return p + face / Math.pow(1 + y, n); },
    ytm(price, c, face, n) { let lo = 0, hi = 1; for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; (Fin.bondPrice(c, face, n, m) > price) ? (lo = m) : (hi = m); } return (lo + hi) / 2; },
    cagr: rs => Math.pow(rs.reduce((a, r) => a * (1 + r), 1), 1 / rs.length) - 1,
    mean: xs => xs.reduce((a, x) => a + x, 0) / xs.length,
    // rating table rows: [minCoverage, rating, spread]; sorted descending by minCoverage
    rate(cov, table) {
      for (const r of table) if (cov >= r[0]) return { rating: r[1], spread: r[2] };
      const last = table[table.length - 1]; return { rating: last[1], spread: last[2] };
    },
    // fixed-point: coverage depends on Kd which depends on rating
    synthKd(ebit, debt, rf, table, maxIter = 40) {
      if (debt <= 0) { const r = table[0]; return { rating: r[1], spread: r[2], kd: rf + r[2], cov: Infinity, path: [] }; }
      let cur = table[0], path = [];
      for (let i = 0; i < maxIter; i++) {
        const kd = rf + cur[2], cov = ebit / (debt * kd);
        const nx = table.find(r => cov >= r[0]) || table[table.length - 1];
        path.push({ rating: cur[1], kd, cov, next: nx[1] });
        if (nx === cur) return { rating: cur[1], spread: cur[2], kd, cov, path };
        cur = nx;
      }
      const kd = rf + cur[2];
      return { rating: cur[1], spread: cur[2], kd, cov: ebit / (debt * kd), path, cycled: true };
    }
  };

  // ---------- storage (best effort) ----------
  const Store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  // ---------- tooltip ----------
  let tipEl;
  function tip(html, ev) {
    if (!tipEl) { tipEl = h('div', { class: 'tip' }); document.body.append(tipEl); }
    if (html == null) { tipEl.classList.remove('on'); return; }
    tipEl.innerHTML = html; tipEl.classList.add('on');
    const pad = 14, w = tipEl.offsetWidth, hh = tipEl.offsetHeight;
    let x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
    if (y + hh > innerHeight - 8) y = ev.clientY - hh - pad;
    tipEl.style.left = Math.max(8, x) + 'px'; tipEl.style.top = Math.max(8, y) + 'px';
  }
  G.addEventListener && G.addEventListener('scroll', () => tip(null), { passive: true });

  // ---------- small chart kit ----------
  const lin = (d0, d1, r0, r1) => { const f = v => r0 + (v - d0) / (d1 - d0) * (r1 - r0); f.inv = p => d0 + (p - r0) / (r1 - r0) * (d1 - d0); return f; };
  function niceTicks(lo, hi, n = 5) {
    const span = hi - lo, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(st => span / st <= n + 0.5) || mag * 10;
    const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }

  /* Line chart with crosshair tooltip.
     cfg: {width,height, x:{min,max,fmt,label}, y:{min,max,fmt,label}, series:[{name,color,data:[[x,y]],width,dash}],
           marks:[{x, label}], dots:[{x,y,color,label}], tipFmt:(x, vals)=>html, onPick:x=>{} } */
  function lineChart(el, cfg) {
    el.innerHTML = '';
    const W = cfg.width || 720, H = cfg.height || 340, m = { l: 52, r: 18, t: 14, b: 42 };
    const X = lin(cfg.x.min, cfg.x.max, m.l, W - m.r), Y = lin(cfg.y.min, cfg.y.max, H - m.b, m.t);
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': cfg.aria || 'chart' });
    const gx = s('g', { class: 'axis' });
    for (const t of niceTicks(cfg.y.min, cfg.y.max, 5)) {
      gx.append(s('line', { class: 'gridl', x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t) }));
      gx.append(s('text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }, cfg.y.fmt(t)));
    }
    for (const t of niceTicks(cfg.x.min, cfg.x.max, 6)) {
      gx.append(s('text', { x: X(t), y: H - m.b + 18, 'text-anchor': 'middle' }, cfg.x.fmt(t)));
    }
    gx.append(s('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b }));
    if (cfg.x.label) gx.append(s('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle', style: 'font-weight:600' }, cfg.x.label));
    if (cfg.y.label) gx.append(s('text', { x: 12, y: m.t + 4, 'text-anchor': 'start', style: 'font-weight:600' }, ''));
    svg.append(gx);
    for (const mk of (cfg.marks || [])) {
      svg.append(s('line', { x1: X(mk.x), x2: X(mk.x), y1: m.t, y2: H - m.b, stroke: 'var(--text-3)', 'stroke-dasharray': '4 4' }));
      if (mk.label) svg.append(s('text', { x: X(mk.x) + 5, y: m.t + 12, style: 'font-weight:600' }, mk.label));
    }
    for (const sr of cfg.series) {
      const d = sr.data.filter(p => isFinite(p[1])).map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(Math.max(cfg.y.min, Math.min(cfg.y.max, p[1]))).toFixed(1)).join(' ');
      svg.append(s('path', { d, fill: 'none', stroke: sr.color, 'stroke-width': sr.width || 2, 'stroke-dasharray': sr.dash || null, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
      if (sr.label !== false) {
        const last = sr.data.filter(p => isFinite(p[1]) && p[1] <= cfg.y.max && p[1] >= cfg.y.min).pop();
        if (last) svg.append(s('text', { x: X(last[0]) - 4, y: Y(last[1]) - 7, 'text-anchor': 'end', style: 'font-weight:700;fill:var(--text)' }, sr.name));
      }
    }
    for (const dt of (cfg.dots || [])) {
      svg.append(s('circle', { cx: X(dt.x), cy: Y(dt.y), r: dt.r || 6, fill: dt.color, stroke: 'var(--surface)', 'stroke-width': 2 }));
      if (dt.label) svg.append(s('text', { x: X(dt.x), y: Y(dt.y) + (dt.below ? 20 : -12), 'text-anchor': 'middle', style: 'font-weight:700;fill:var(--text)' }, dt.label));
    }
    // crosshair
    const cross = s('line', { y1: m.t, y2: H - m.b, stroke: 'var(--text-2)', 'stroke-width': 1, opacity: 0 });
    svg.append(cross);
    const hit = s('rect', { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: 'transparent', style: 'cursor:crosshair' });
    svg.append(hit);
    const move = ev => {
      const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
      const xv = Math.max(cfg.x.min, Math.min(cfg.x.max, X.inv(loc.x)));
      const base = cfg.series[0].data; let best = base[0];
      for (const p of base) if (Math.abs(p[0] - xv) < Math.abs(best[0] - xv)) best = p;
      cross.setAttribute('x1', X(best[0])); cross.setAttribute('x2', X(best[0])); cross.setAttribute('opacity', .5);
      const vals = cfg.series.map(sr => { const p = sr.data.find(q => q[0] === best[0]); return { name: sr.name, color: sr.color, v: p ? p[1] : NaN }; });
      tip(cfg.tipFmt ? cfg.tipFmt(best[0], vals) : vals.map(v => `${v.name}: <b>${cfg.y.fmt(v.v)}</b>`).join('<br>'), ev);
    };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerleave', () => { tip(null); cross.setAttribute('opacity', 0); });
    if (cfg.onPick) hit.addEventListener('click', ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const loc = pt.matrixTransform(svg.getScreenCTM().inverse()); cfg.onPick(X.inv(loc.x)); });
    el.append(svg);
    return svg;
  }

  // ---------- answer checking ----------
  function parseNum(v) { if (v == null) return NaN; const t = String(v).replace(/[,%₹\s]/g, ''); return t === '' ? NaN : Number(t); }
  function isClose(user, ans, unit, tol, abs) {
    if (!isFinite(user)) return false;
    if (abs != null) return Math.abs(user - ans) <= abs + 1e-12;
    if (unit === '%') { const u = user / 100; return Math.abs(u - ans) <= (tol ?? 0.001) + 1e-12; }
    const rel = tol ?? 0.01;
    return Math.abs(user - ans) <= Math.max(rel * Math.abs(ans), unit === 'x' ? 0.006 : 0.011);
  }
  const showAns = (v, unit) => unit === '%' ? F.pct(v, 2) : unit === 'x' ? F.n(v, 3) : unit === 'cr' ? '₹' + F.big(v, 1) + ' cr' : unit === '₹' ? '₹' + F.big(v, 2) : F.n(v, 2);

  /* Problem component.
     p = {id,title,topic,level,story(d),data,solve(d)->{...}, parts:[{key,label,unit,tol}], hints:[], steps(d,r)->[{t,html}], takeaway(d,r)} */
  function problem(p, mount, onStatus) {
    const store = Store.get('icf-progress', {});
    const st = store[p.id] || {};
    const d = p.data, r = p.solve(d);
    const wrap = h('div', { class: 'prob', id: 'prob-' + p.id });
    const status = h('span', { class: 'status' });
    const setStatus = () => {
      const cur = (Store.get('icf-progress', {})[p.id]) || {};
      status.className = 'status ' + (cur.solved ? 'solved' : cur.tried ? 'tried' : '');
      status.textContent = cur.solved ? '✓ Solved' : cur.tried ? 'Attempted' : '';
    };
    const head = h('div', { class: 'prob-head', onclick: () => wrap.classList.toggle('open') },
      h('span', { class: 'pill accent' }, p.code || p.id),
      h('h3', { html: p.title }),
      h('span', { class: 'pill ' + ((p.level || 'Hard') === 'Hard' ? 'hard' : 'medium') }, p.level || 'Hard'),
      status);
    const body = h('div', { class: 'prob-body' });
    if (p.covers) body.append(h('p', { class: 'muted', style: { margin: '0 0 8px' }, html: '<b>Covers:</b> ' + p.covers }));
    body.append(h('div', { class: 'story', html: p.story(d) }));
    const partsBox = h('div');
    const rows = p.parts.map(pt => {
      const inp = h('input', { type: 'text', inputmode: 'decimal', placeholder: pt.unit === '%' ? 'e.g. 12.34' : pt.unit === 'x' ? 'e.g. 1.234' : 'number', 'aria-label': pt.label });
      if (st.inputs && st.inputs[pt.key] != null) inp.value = st.inputs[pt.key];
      const mark = h('span', { class: 'mark' });
      const row = h('div', { class: 'part' }, h('div', { html: pt.label }), h('div', { class: 'inp' }, inp, h('span', { class: 'unit' }, pt.unit === '%' ? '%' : pt.unit === 'x' ? '' : pt.unit === 'cr' ? 'cr' : pt.unit || '')), mark);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
      return { pt, inp, mark, row };
    });
    rows.forEach(x => partsBox.append(x.row));
    body.append(partsBox);
    const score = h('span', { class: 'muted' });
    const hintBox = h('div');
    let hintN = 0;
    const btnHint = h('button', { class: 'btn small', onclick: () => { if (hintN < p.hints.length) { hintBox.append(h('div', { class: 'hint', html: '💡 <b>Hint ' + (hintN + 1) + ':</b> ' + p.hints[hintN] })); hintN++; } if (hintN >= p.hints.length) btnHint.disabled = true; } }, 'Hint');
    if (!p.hints || !p.hints.length) btnHint.style.display = 'none';
    const btnCheck = h('button', { class: 'btn primary', onclick: () => check() }, 'Check answers');
    const btnSol = h('button', { class: 'btn', disabled: !st.tried, onclick: () => showSolution() }, st.tried ? 'Show solution' : '🔒 Solution unlocks after you check');
    body.append(h('div', { class: 'row', style: { marginTop: '12px' } }, btnCheck, btnHint, btnSol, h('span', { class: 'spacer' }), score));
    body.append(hintBox);
    const solBox = h('div');
    body.append(solBox);

    function check() {
      let ok = 0; const inputs = {};
      rows.forEach(({ pt, inp, row, mark }) => {
        const u = parseNum(inp.value); inputs[pt.key] = inp.value;
        const good = isClose(u, r[pt.key], pt.unit, pt.tol, pt.abs);
        row.classList.toggle('ok', good); row.classList.toggle('no', !good);
        mark.textContent = good ? '✓' : '✗'; if (good) ok++;
      });
      score.textContent = `${ok} / ${rows.length} correct` + (ok === rows.length ? ' 🎉' : '');
      const all = Store.get('icf-progress', {});
      all[p.id] = Object.assign(all[p.id] || {}, { tried: true, inputs, solved: (all[p.id] && all[p.id].solved) || ok === rows.length });
      Store.set('icf-progress', all);
      btnSol.disabled = false; btnSol.textContent = 'Show solution';
      setStatus(); onStatus && onStatus();
    }
    function showSolution() {
      solBox.innerHTML = '';
      const sol = h('div', { class: 'sol' });
      sol.append(h('h4', null, 'Step-by-step solution'));
      const steps = p.steps(d, r);
      const list = h('div');
      // all steps at once, then the answers and the takeaway
      steps.forEach((sp, i) => list.append(h('div', { class: 'step' }, h('h4', { html: `Step ${i + 1}. ${sp.t}` }), h('div', { html: sp.html }))));
      list.append(h('div', { class: 'callout good' }, h('b', null, 'Answers: '), p.parts.map((pt, i) => h('span', null, (i ? ' · ' : '') + pt.label.replace(/<[^>]+>/g, '').split(' ')[0] + ' ' + showAns(r[pt.key], pt.unit)))));
      if (p.takeaway) list.append(h('div', { class: 'callout', html: '<b>Real-world takeaway.</b> ' + p.takeaway(d, r) }));
      sol.append(list);
      solBox.append(sol);
      btnSol.disabled = true;
    }
    wrap.append(head, body);
    mount.append(wrap);
    setStatus();
    return wrap;
  }

  /* MCQ: q = {q, opts:[...], a: index, why: html, whyWrong: {i: html}} */
  function mcq(q, mount, key, onDone) {
    const box = h('div', { class: 'card tight mcq' });
    box.append(h('div', { class: 'q', html: q.q }));
    const ex = h('div');
    const btns = q.opts.map((o, i) => h('button', { class: 'opt', html: String.fromCharCode(65 + i) + '. ' + o, onclick: () => pick(i) }));
    btns.forEach(b => box.append(b));
    box.append(ex);
    function pick(i) {
      btns.forEach((b, j) => { b.disabled = true; if (j === q.a) b.classList.add('right'); if (j === i && i !== q.a) b.classList.add('wrong'); });
      const right = i === q.a;
      ex.innerHTML = '';
      ex.append(h('div', { class: 'explain', html: (right ? '<b style="color:var(--good)">✓ Correct.</b> ' : '<b style="color:var(--bad)">✗ Not quite.</b> ' + ((q.whyWrong && q.whyWrong[i]) ? q.whyWrong[i] + ' ' : '')) + q.why }),
        h('button', { class: 'btn small', style: { marginTop: '8px' }, onclick: () => { btns.forEach(b => { b.disabled = false; b.classList.remove('right', 'wrong'); }); ex.innerHTML = ''; } }, 'Try again'));
      const all = Store.get('icf-quiz', {}); all[key] = all[key] || right; Store.set('icf-quiz', all);
      onDone && onDone();
    }
    mount.append(box);
    return box;
  }

  // slider control helper
  function slider(label, min, max, step, val, fmt, oninput) {
    const out = h('b', null, fmt(val));
    const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
    inp.addEventListener('input', () => { out.textContent = fmt(+inp.value); oninput(+inp.value); });
    const el = h('div', { class: 'ctl' }, h('label', null, h('span', { html: label }), out), inp);
    el.set = v => { inp.value = v; out.textContent = fmt(+v); };
    return el;
  }
  function seg(options, val, onchange) {
    const box = h('div', { class: 'seg' });
    const bs = options.map(o => h('button', { class: o.v === val ? 'on' : '' }, o.t));
    bs.forEach((bt, i) => { bt.onclick = () => { bs.forEach(x => x.classList.remove('on')); bt.classList.add('on'); onchange(options[i].v); }; box.append(bt); });
    return box;
  }

  G.ICF = { $, $$, h, s, F, Fin, Store, tip, lin, niceTicks, lineChart, problem, mcq, slider, seg, parseNum, isClose };
})(window);
