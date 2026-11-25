/* Session 12: valuing equity with dividend discount models, growth and PVGO. UI module. */
(function () {
  'use strict';
  const { $, $$, h, s, F, Store, tip, lineChart, problem, mcq, slider, seg } = ICF;
  const P = (x, d = 2) => F.pct(x, d);
  const Pg = (x, d = 1) => x < 0 ? '(−' + F.pct(-x, d) + ')' : F.pct(x, d); // growth inside a formula
  const RF = 0.0734; // 10-year G-sec, 17 Nov 2026 (same as Session 11)
  const SN = 12;

  const TABS = [
    { id: 'start', t: 'Start here' },
    { id: 'builder', t: 'DDM Builder' },
    { id: 'growth', t: 'Growth engine & PVGO' },
    { id: 'reality', t: 'How high can growth go?' },
    { id: 'real', t: 'Real companies' },
    { id: 'concepts', t: 'Concept checks' },
    { id: 'cases', t: 'Real-world cases' }];

  function mount(root, tabbar, want) {
    TABS.forEach(tb => {
      tabbar.append(h('button', { class: 'tab', 'data-tab': tb.id, onclick: () => go(tb.id) }, tb.t));
      root.append(h('section', { class: 'panel', id: 'panel-' + tb.id }));
    });
    renderStart($('#panel-start'));
    renderBuilder($('#panel-builder'));
    renderGrowth($('#panel-growth'));
    renderReality($('#panel-reality'));
    renderReal($('#panel-real'));
    renderConcepts($('#panel-concepts'));
    renderCases($('#panel-cases'));
    addNotes();
    go(TABS.some(t => t.id === want) ? want : 'start', true);
  }
  function notesCard(id, n) {
    const card = h('div', { class: 'card notes', id: 'notes-' + id, style: { scrollMarginTop: '120px' } },
      h('div', { class: 'kicker' }, 'Notes'), h('h2', null, n.title));
    n.sections.forEach(([t, html], i) => card.append(h('details', { class: 'note-sec', open: id === 'start' ? i === 0 : true }, h('summary', null, t), h('div', { html }))));
    return card;
  }
  function addNotes() {
    const NOTES = window.S12_NOTES || {};
    Object.keys(NOTES).forEach(id => {
      const panel = $('#panel-' + id); if (!panel) return;
      const card = notesCard(id, NOTES[id]);
      if (id === 'start') {
        if (panel.children[1]) panel.insertBefore(card, panel.children[1]); else panel.append(card);
        card.querySelector('h2').after(h('p', { class: 'muted' }, 'Everything you need for this session, in one place. Click a heading to open or close it.'));
      } else {
        panel.append(card);
        panel.insertBefore(h('p', { class: 'jump' }, h('a', { href: '#notes-' + id, onclick: e => { e.preventDefault(); card.scrollIntoView({ behavior: 'smooth' }); } }, '📘 Read the notes for this section ↓')), panel.firstChild);
      }
    });
  }
  function go(id, noPush) {
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
    if (!noPush) history.replaceState(null, '', '#s' + SN + '/' + id);
    window.scrollTo({ top: 0 });
    const p = $('#panel-' + id); if (p && p._onShow) p._onShow();
  }
  const openCase = id => { go('cases'); setTimeout(() => { const t = $('#prob-' + id); if (t) { t.classList.add('open'); t.scrollIntoView({ behavior: 'smooth' }); } }, 50); };

  /* =========================================================== START */
  function renderStart(el) {
    el.append(h('div', { class: 'card hero' },
      h('div', { class: 'kicker' }, 'Session 12 · Valuing equity'),
      h('h1', null, 'What is a share worth?'),
      h('p', { class: 'lede', html: 'A share is a claim on dividends that never end. Its value is the present value of all of them, discounted at the cost of equity. This session builds that idea into a set of tools: the stable growth model, multi-stage models, growth from retention × ROE, and PVGO. Then it runs them on real Indian share prices to ask what the market is assuming.' }),
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn primary', onclick: () => go('builder') }, 'Build a valuation →'),
        h('button', { class: 'btn', onclick: () => go('real') }, 'What are Indian prices assuming?'),
        h('button', { class: 'btn', onclick: () => go('cases') }, 'Real-world cases'))));

    el.append(h('div', { class: 'card' },
      h('h2', null, '1 · Three inputs, one formula'),
      h('div', { class: 'grid g3' },
        h('div', { class: 'statbox', html: '<h4>Cash flows</h4><p class="muted">Dividends: the cash a shareholder who buys and holds actually receives. D<sub>0</sub> has just been paid; D<sub>1</sub> is the first one you will get.</p>' }),
        h('div', { class: 'statbox', html: '<h4>Growth</h4><p class="muted">How fast dividends grow: from history, from analysts, or from fundamentals (retention ratio × ROE). Growth that lasts forever must stay below R<sub>f</sub>.</p>' }),
        h('div', { class: 'statbox', html: '<h4>Discount rate</h4><p class="muted">The cost of equity r from CAPM: R<sub>f</sub> + β × market risk premium. The return shareholders require for the risk of the dividends.</p>' })),
      h('div', { class: 'formula', html: 'P<sub>0</sub> = D<sub>1</sub>/(1+r) + D<sub>2</sub>/(1+r)<sup>2</sup> + D<sub>3</sub>/(1+r)<sup>3</sup> + …  and with stable growth:  P<sub>0</sub> = D<sub>1</sub> ÷ (r − g)' })));

    el.append(h('div', { class: 'card' },
      h('h2', null, '2 · Book value is not value'),
      h('div', { class: 'grid g3' },
        h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: 'var(--bad)' } }, '−$64 m'), h('div', { class: 'l' }, 'Amazon\'s book equity, June 2005, while the market valued its equity at over $15 billion')),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, '45×'), h('div', { class: 'l' }, 'Nestlé India: share price ÷ book value per share, 25 Nov 2026. Brands are not on the balance sheet.')),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: 'var(--bad)' } }, '0.70×'), h('div', { class: 'l' }, 'ONGC: the market values it below its book value, because it expects oil and gas earnings to shrink.'))),
      h('p', { class: 'muted', style: { marginTop: '10px' } }, 'Book value records history (what assets cost); value looks forward (what they will pay). That is why we value shares from their future dividends.')));

    el.append(h('div', { class: 'card' },
      h('h2', null, '3 · The session in one picture'),
      h('div', { class: 'pipe' },
        ...[['1', 'One period', 'V<sub>0</sub> = (D<sub>1</sub> + P<sub>1</sub>) ÷ (1 + r)'],
        ['2', 'Forever', 'Keep expanding: the value of all future dividends'],
        ['3', 'Stable growth', 'D<sub>1</sub> ÷ (r − g), with g &lt; R<sub>f</sub> &lt; r'],
        ['4', 'Where g comes from', 'g = retention ratio × ROE'],
        ['5', 'Multi-stage', 'High growth → transition → stable (terminal value)'],
        ['6', 'Backwards', 'Implied g and implied r from the market price'],
        ['7', 'PVGO', 'Price = EPS<sub>0</sub> ÷ r + PVGO']].map(([n, a, b]) => h('div', { class: 'pnode' }, h('div', { class: 'n' }, 'Step ' + n), h('div', { class: 'v' }, a), h('div', { class: 'd', html: b }))))));
  }

  /* =========================================================== DDM BUILDER */
  function ddm(st) {
    // returns { years:[{t, g, d, pv, stage}], N, tv, pvTV, V, parts:{s1,s2,tv}, ok }
    const r = st.r, out = { years: [], parts: { s1: 0, s2: 0, tv: 0 }, ok: true };
    if (st.model === 'one') {
      const V = (st.D1 + st.P1) / (1 + r);
      out.years = [{ t: 1, d: st.D1, pv: st.D1 / (1 + r), stage: 's1', g: null }];
      out.N = 1; out.tv = st.P1; out.pvTV = st.P1 / (1 + r); out.V = V; out.parts = { s1: st.D1 / (1 + r), s2: 0, tv: st.P1 / (1 + r) };
      return out;
    }
    const gs = st.model === 'gordon' ? st.g : st.gs;
    if (gs >= r) { out.ok = false; }
    let n1 = 0, n2 = 0;
    if (st.model === 'gordon') { n1 = 0; n2 = 0; }
    if (st.model === 'two') { n1 = st.n1; }
    if (st.model === 'three') { n1 = st.n1; n2 = st.n2; }
    const N = n1 + n2;
    let d = st.D0;
    for (let t = 1; t <= N; t++) {
      let g, stage;
      if (t <= n1) { g = st.g1; stage = 's1'; } else { const k = t - n1; g = st.g1 - (st.g1 - gs) * k / n2; stage = 's2'; }
      d = d * (1 + g);
      const pv = d / Math.pow(1 + r, t);
      out.years.push({ t, g, d, pv, stage });
      out.parts[stage] += pv;
    }
    const dN1 = d * (1 + gs);
    out.N = N; out.dN1 = dN1;
    out.tv = out.ok ? dN1 / (r - gs) : NaN;
    out.pvTV = out.tv / Math.pow(1 + r, N);
    out.parts.tv = out.pvTV;
    out.V = out.parts.s1 + out.parts.s2 + out.pvTV;
    // stable-stage years shown for the picture
    out.stable = [];
    let dd = d;
    for (let t = N + 1; t <= Math.max(N + 6, 15); t++) { dd = dd * (1 + gs); out.stable.push({ t, g: gs, d: dd, pv: dd / Math.pow(1 + r, t), stage: 'tv' }); }
    out.gs = gs;
    return out;
  }

  function renderBuilder(el) {
    const st = { model: 'gordon', D0: 5, D1: 2, P1: 58, r: 0.08, g: 0.05, g1: 0.10, n1: 5, n2: 3, gs: 0.04 };
    const chart = h('div'), kpi = h('div'), stack = h('div'), sens = h('div'), warn = h('div'), formula = h('div'), ctlBox = h('div');
    const PRESETS = [
      ['Bandhan Bank (one period)', { model: 'one', D1: 2, P1: 58, r: 0.10 }],
      ['Class: ₹5 at 5%, r 8%', { model: 'gordon', D0: 5, g: 0.05, r: 0.08 }],
      ['Class: shrinking 5% a year', { model: 'gordon', D0: 5, g: -0.05, r: 0.10 }],
      ['Class: β 1.1 (₹29.17)', { model: 'gordon', D0: 2, g: 0.05, r: 0.122 }],
      ['Two-stage: 15% for 5 yrs', { model: 'two', D0: 2, g1: 0.15, n1: 5, gs: 0.05, r: 0.12 }],
      ['Class notes: three stages', { model: 'three', D0: 2, g1: 0.10, n1: 5, n2: 3, gs: 0.04, r: 0.12 }]];
    const presets = h('div', { class: 'row' }, h('span', { class: 'muted' }, 'Try:'), ...PRESETS.map(([t, v]) => h('button', { class: 'btn small', onclick: () => { Object.assign(st, v); buildControls(); draw(); } }, t)));
    const modelSeg = () => seg([{ v: 'one', t: 'One period' }, { v: 'gordon', t: 'Stable growth' }, { v: 'two', t: 'Two-stage' }, { v: 'three', t: 'Three-stage' }], st.model, v => { st.model = v; buildControls(); draw(); });
    let segBox = h('div');

    function buildControls() {
      segBox.innerHTML = ''; segBox.append(modelSeg());
      ctlBox.innerHTML = '';
      const add = (...x) => ctlBox.append(...x);
      if (st.model === 'one') {
        add(slider('Dividend next year D<sub>1</sub> (₹)', 0, 20, 0.25, st.D1, v => '₹' + F.n(v, 2), v => { st.D1 = v; draw(); }),
          slider('Expected price in one year P<sub>1</sub> (₹)', 0, 300, 1, st.P1, v => '₹' + F.n(v, 0), v => { st.P1 = v; draw(); }));
      } else {
        add(slider('Dividend just paid D<sub>0</sub> (₹)', 0.5, 20, 0.25, st.D0, v => '₹' + F.n(v, 2), v => { st.D0 = v; draw(); }));
        if (st.model === 'gordon') add(slider('Stable growth g', -0.10, 0.15, 0.001, st.g, v => P(v, 1), v => { st.g = v; draw(); }));
        else {
          add(slider('High growth g<sub>1</sub>', 0, 0.40, 0.005, st.g1, v => P(v, 1), v => { st.g1 = v; draw(); }),
            slider('Years of high growth', 1, 15, 1, st.n1, v => v + ' yrs', v => { st.n1 = v; draw(); }));
          if (st.model === 'three') add(slider('Years of transition (growth falls in equal steps)', 1, 10, 1, st.n2, v => v + ' yrs', v => { st.n2 = v; draw(); }));
          add(slider('Stable growth g (forever)', -0.05, 0.15, 0.001, st.gs, v => P(v, 1), v => { st.gs = v; draw(); }));
        }
      }
      add(slider('Cost of equity r', 0.04, 0.20, 0.001, st.r, v => P(v, 1), v => { st.r = v; draw(); }));
    }

    function drawChart(res) {
      chart.innerHTML = '';
      const W = 760, H = 300, m = { l: 48, r: 12, t: 16, b: 40 };
      const yrs = st.model === 'one' ? res.years : res.years.concat(res.stable || []);
      const nb = yrs.length + 1; // + terminal block
      const bw = (W - m.l - m.r) / nb;
      const maxD = Math.max(...yrs.map(y => y.d), 0.01);
      const tvH = isFinite(res.pvTV) ? res.pvTV : 0;
      const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Dividends by year and their present values' });
      const plotH = H - m.t - m.b;
      const Y = v => H - m.b - v / maxD * plotH * 0.62;
      // axis
      svg.append(s('line', { x1: m.l, x2: W - m.r, y1: H - m.b, y2: H - m.b, stroke: 'var(--border)' }));
      const col = { s1: 'var(--s1)', s2: 'var(--s4)', tv: 'var(--s2)' };
      yrs.forEach((y, i) => {
        const x = m.l + i * bw + bw * 0.12, w = bw * 0.76;
        const inStable = y.stage === 'tv';
        const g1 = s('rect', { x, y: Y(y.d), width: w, height: H - m.b - Y(y.d), fill: col[y.stage], opacity: 0.25 });
        const g2 = s('rect', { x, y: Y(y.pv), width: w, height: H - m.b - Y(y.pv), fill: col[y.stage], opacity: inStable ? 0.55 : 1 });
        [g1, g2].forEach(e => { e.addEventListener('pointermove', ev => tip(`<b>Year ${y.t}</b>${y.g != null ? ` · growth ${P(y.g, 1)}` : ''}<br>Dividend ₹${F.n(y.d, 2)}<br>PV today ₹${F.n(y.pv, 2)}${inStable ? '<br><i>part of the terminal value</i>' : ''}`, ev)); e.addEventListener('pointerleave', () => tip(null)); });
        svg.append(g1, g2);
        if (nb <= 26 || y.t % 2 === 1) svg.append(s('text', { x: x + w / 2, y: H - m.b + 14, 'text-anchor': 'middle', class: 'axis', style: 'font-size:11px;fill:var(--text-2)' }, String(y.t)));
      });
      // terminal / remaining block
      const x = m.l + yrs.length * bw + bw * 0.08, w = bw * 0.84;
      if (st.model !== 'one' && res.ok) {
        const rest = res.pvTV - (res.stable || []).reduce((a, y) => a + y.pv, 0);
        const scale = Math.max(1, rest / maxD / 1.5);
        const hh = Math.min(plotH * 0.95, rest / maxD * plotH * 0.62 / scale * 1);
        const rect = s('rect', { x, y: H - m.b - hh, width: w, height: hh, fill: 'var(--s2)', rx: 3 });
        rect.addEventListener('pointermove', ev => tip(`<b>All later years, ${(res.stable || []).length ? res.stable[res.stable.length - 1].t + 1 : res.N + 1} → ∞</b><br>PV today ₹${F.n(rest, 2)}<br>(drawn at reduced scale)`, ev)); rect.addEventListener('pointerleave', () => tip(null));
        svg.append(rect, s('text', { x: x + w / 2, y: H - m.b + 14, 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--text-2)' }, '→ ∞'));
      } else if (st.model === 'one') {
        const hh = Math.min(plotH * 0.95, res.pvTV / maxD * plotH * 0.62 / Math.max(1, res.pvTV / maxD / 1.5));
        const rect = s('rect', { x, y: H - m.b - hh, width: w, height: hh, fill: 'var(--s2)', rx: 3 });
        rect.addEventListener('pointermove', ev => tip(`<b>Sale price P<sub>1</sub> at year 1</b><br>₹${F.n(st.P1, 2)}, PV today ₹${F.n(res.pvTV, 2)}<br>(drawn at reduced scale)`, ev)); rect.addEventListener('pointerleave', () => tip(null));
        svg.append(rect, s('text', { x: x + w / 2, y: H - m.b + 14, 'text-anchor': 'middle', style: 'font-size:11px;fill:var(--text-2)' }, 'P₁'));
      }
      svg.append(s('text', { x: (m.l + W - m.r) / 2, y: H - 6, 'text-anchor': 'middle', style: 'font-weight:600;font-size:12px;fill:var(--text-2)' }, 'Year'));
      chart.append(svg);
    }

    function draw() {
      const res = ddm(st);
      warn.innerHTML = '';
      if (!res.ok) warn.append(h('div', { class: 'callout bad', html: '<b>The model breaks: stable growth is not below r.</b> The growing perpetuity D ÷ (r − g) needs r − g &gt; 0. With g ≥ r every future dividend is worth as much as or more than the one before, so the sum never stops growing. Lower g or raise r.' }));
      else if (st.model !== 'one' && res.gs > RF) warn.append(h('div', { class: 'callout warn', html: `<b>Stable growth of ${P(res.gs, 1)} is above R<sub>f</sub> (${P(RF)}).</b> Growth that lasts forever cannot beat the long-run growth of the economy. Use a multi-stage model: put the high growth in the early years and keep the stable rate below R<sub>f</sub>.` }));
      drawChart(res);
      kpi.innerHTML = '';
      kpi.append(h('div', { class: 'statrow' },
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, res.ok ? '₹' + F.big(res.V, 2) : '∞ / undefined'), h('div', { class: 'l' }, 'Value of one share today')),
        st.model === 'one' ? null : h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, '₹' + F.n(st.D0 * (1 + (st.model === 'gordon' ? st.g : st.g1)), 2)), h('div', { class: 'l', html: 'D<sub>1</sub> = D<sub>0</sub>(1 + g)' })),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, res.ok ? F.n((st.model === 'gordon' ? (res.V - res.stable.reduce((a, y) => a + y.pv, 0)) : res.pvTV) / res.V * 100, 0) + '%' : '–'), h('div', { class: 'l' }, st.model === 'one' ? 'of the value comes from the sale price' : st.model === 'gordon' ? 'of the value comes from years 16 onwards' : 'of the value is the terminal value'))));
      // stacked breakdown
      stack.innerHTML = '';
      if (res.ok) {
        let parts;
        if (st.model === 'one') parts = [['Dividend D₁', res.parts.s1, 'var(--s1)'], ['Sale price P₁', res.pvTV, 'var(--s2)']];
        else if (st.model === 'gordon') { const first = res.stable.reduce((a, y) => a + y.pv, 0); parts = [['Years 1–15', first, 'var(--s1)'], ['Years 16 → ∞', res.V - first, 'var(--s2)']]; }
        else parts = [['High growth', res.parts.s1, 'var(--s1)'], ['Transition', res.parts.s2, 'var(--s4)'], ['Terminal value', res.pvTV, 'var(--s2)']].filter(p => p[1] > 1e-9);
        stack.append(h('div', { class: 'sbar', style: { height: '30px' } }, ...parts.map(([n, v, c]) => h('div', { style: { flexBasis: Math.max(0, v / res.V * 100) + '%', background: c }, onpointermove: ev => tip(`<b>${n}</b><br>PV ₹${F.n(v, 2)} (${P(v / res.V, 1)})`, ev), onpointerleave: () => tip(null) }, v / res.V > 0.12 ? n + ' ' + P(v / res.V, 0) : ''))));
      }
      // formula
      const fm = () => {
        if (st.model === 'one') return `V<sub>0</sub> = (D<sub>1</sub> + P<sub>1</sub>) ÷ (1 + r) = (${F.n(st.D1, 2)} + ${F.n(st.P1, 2)}) ÷ ${F.n(1 + st.r, 3)} = <b>₹${F.n(res.V, 2)}</b>`;
        if (!res.ok) return 'P<sub>0</sub> = D<sub>1</sub> ÷ (r − g) is undefined when g ≥ r.';
        if (st.model === 'gordon') return `P<sub>0</sub> = D<sub>0</sub>(1 + g) ÷ (r − g) = ${F.n(st.D0, 2)} × ${F.n(1 + st.g, 3)} ÷ (${P(st.r, 1)} − ${Pg(st.g)}) = ${F.n(st.D0 * (1 + st.g), 4)} ÷ ${F.n(st.r - st.g, 3)} = <b>₹${F.n(res.V, 2)}</b>`;
        return `PV of dividends in years 1–${res.N} = ₹${F.n(res.parts.s1 + res.parts.s2, 2)}<br>Terminal value at year ${res.N}: P<sub>${res.N}</sub> = D<sub>${res.N + 1}</sub> ÷ (r − g)<br>= ${F.n(res.dN1, 4)} ÷ (${P(st.r, 1)} − ${Pg(res.gs)}) = ₹${F.n(res.tv, 2)}<br>Worth today: ${F.n(res.tv, 2)} ÷ ${F.n(1 + st.r, 3)}<sup>${res.N}</sup> = ₹${F.n(res.pvTV, 2)}<br>Value = ${F.n(res.parts.s1 + res.parts.s2, 2)} + ${F.n(res.pvTV, 2)} = <b>₹${F.n(res.V, 2)}</b>`;
      };
      formula.innerHTML = `<div class="formula">${fm()}</div>` + (st.model !== 'one' && res.years.length ? '<details><summary>Year-by-year table</summary>' + '<div class="tblwrap"><table class="tbl"><tr><th>Year</th><th>Growth</th><th>Dividend</th><th>PV</th></tr>' + res.years.map(y => `<tr><td>${y.t}</td><td>${P(y.g, 1)}</td><td>${F.n(y.d, 4)}</td><td>${F.n(y.pv, 4)}</td></tr>`).join('') + (res.ok ? `<tr class="hl"><td>${res.N}</td><td colspan="2">Terminal value P<sub>${res.N}</sub> = ${F.n(res.tv, 4)}</td><td>${F.n(res.pvTV, 4)}</td></tr>` : '') + '</table></div></details>' : '');
      // sensitivity
      sens.innerHTML = '';
      if (st.model !== 'one') {
        const gk = st.model === 'gordon' ? 'g' : 'gs', base = st[gk];
        const rs = [st.r - 0.01, st.r, st.r + 0.01], gs = [base - 0.01, base, base + 0.01];
        const val = (r, g) => { const t = Object.assign({}, st, { r, [gk]: g }); const x = ddm(t); return x.ok ? x.V : NaN; };
        const V0 = res.V;
        sens.innerHTML = '<div class="tblwrap"><table class="tbl"><tr><th>r ↓ / stable g →</th>' + gs.map(g => `<th>${P(g, 1)}</th>`).join('') + '</tr>' +
          rs.map(r => `<tr><td><b>${P(r, 1)}</b></td>` + gs.map(g => { const v = val(r, g); const hl = Math.abs(r - st.r) < 1e-9 && Math.abs(g - base) < 1e-9; return `<td style="${hl ? 'font-weight:700;background:var(--accent-soft, rgba(42,120,214,.12))' : ''}">${isFinite(v) ? '₹' + F.n(v, 1) + (hl || !isFinite(V0) ? '' : ` <span class="faint">(${v >= V0 ? '+' : ''}${F.n((v / V0 - 1) * 100, 0)}%)</span>`) : 'n.a.'}</td>`; }).join('') + '</tr>').join('') + '</table></div>';
      }
    }
    buildControls();
    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Simulation'),
      h('h2', null, 'The DDM Builder: watch a share price being built'),
      h('p', { class: 'lede', html: 'Pick a model, set the dividend, growth and cost of equity, and see every future dividend and what it is worth today. The class examples are one click away.' }),
      presets));
    el.append(h('div', { class: 'grid side' },
      h('div', { class: 'card' }, h('h3', null, 'Model'), segBox, ctlBox),
      h('div', null,
        h('div', { class: 'card' }, kpi, warn,
          h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)' } }), 'high growth'), h('span', null, h('i', { style: { background: 'var(--s4)' } }), 'transition'), h('span', null, h('i', { style: { background: 'var(--s2)' } }), 'stable stage / terminal value'), h('span', null, h('i', { style: { background: 'var(--text-3)', opacity: .35 } }), 'pale = dividend, solid = PV today')),
          chart, h('h4', null, 'Where the value comes from'), stack, formula),
        h('div', { class: 'card' }, h('h3', null, 'How sensitive is the value?'), h('p', { class: 'muted' }, 'The value for the cost of equity and the stable growth rate one percentage point either side of your inputs.'), sens))));
    draw();
  }

  /* =========================================================== GROWTH ENGINE */
  function engine(st) {
    const po = t => (st.change && t >= st.k ? st.po2 : st.po);
    const rows = [];
    let B = st.E0 / st.roe, E = st.E0;
    const b0 = 1 - po(0);
    rows.push({ t: 0, Bstart: B, E, D: po(0) * E, ret: b0 * E, Bend: B + b0 * E, g: null, po: po(0) });
    B = B + b0 * E;
    const T = Math.max(8, (st.change ? st.k : 1) + 4);
    for (let t = 1; t <= T; t++) {
      const En = st.roe * B, g = En / E - 1, p = po(t), D = p * En;
      rows.push({ t, Bstart: B, E: En, D, ret: En - D, Bend: B + En - D, g, po: p });
      B = B + En - D; E = En;
    }
    const k = st.change ? st.k : 1, g2 = (1 - (st.change ? st.po2 : st.po)) * st.roe;
    let V = NaN, ok = g2 < st.r;
    if (ok) {
      V = 0;
      for (let t = 1; t <= k - 1; t++) V += rows[t].D / Math.pow(1 + st.r, t);
      const Pk1 = rows[k].D / (st.r - g2);
      V += Pk1 / Math.pow(1 + st.r, k - 1);
    }
    const aip = st.E0 / st.r;
    return { rows, V, aip, pvgo: V - aip, g1: (1 - st.po) * st.roe, g2, ok, k };
  }

  function renderGrowth(el) {
    const st = { E0: 10, roe: 0.15, po: 0.60, change: false, k: 4, po2: 0.80, r: 0.12 };
    const tbl = h('div'), kpi = h('div'), bar = h('div'), chart = h('div'), msg = h('div'), ctl = h('div');
    const PRE = [
      ['Steady payer', { E0: 10, roe: 0.15, po: 0.80, change: false, r: 0.12 }],
      ['Growth company that matures', { E0: 10, roe: 0.30, po: 0.20, change: true, k: 5, po2: 0.80, r: 0.13 }],
      ['Pays out everything', { E0: 10, roe: 0.18, po: 1.0, change: false, r: 0.12 }],
      ['Reinvests at a poor ROE', { E0: 10, roe: 0.07, po: 0.40, change: false, r: 0.12 }]];
    function buildCtl() {
      ctl.innerHTML = '';
      ctl.append(slider('EPS just earned, EPS<sub>0</sub> (₹)', 1, 50, 0.5, st.E0, v => '₹' + F.n(v, 1), v => { st.E0 = v; draw(); }),
        slider('ROE (on start-of-year book equity)', 0.02, 0.50, 0.005, st.roe, v => P(v, 1), v => { st.roe = v; draw(); }),
        slider('Payout ratio (years 0 onward)', 0, 1, 0.01, st.po, v => P(v, 0), v => { st.po = v; draw(); }),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: st.change, onchange: e => { st.change = e.target.checked; buildCtl(); draw(); } }), 'The payout changes later'));
      if (st.change) ctl.append(slider('New payout starts in year', 2, 8, 1, st.k, v => 'year ' + v, v => { st.k = v; draw(); }),
        slider('New payout ratio', 0, 1, 0.01, st.po2, v => P(v, 0), v => { st.po2 = v; draw(); }));
      ctl.append(slider('Cost of equity r', 0.05, 0.20, 0.005, st.r, v => P(v, 1), v => { st.r = v; draw(); }));
    }
    function draw() {
      const e = engine(st);
      tbl.innerHTML = '<div class="tblwrap"><table class="tbl"><tr><th>Year</th><th>BVPS at start</th><th>EPS (= ROE × BVPS at start)</th><th>Payout</th><th>DPS</th><th>Kept back</th><th>EPS growth</th></tr>' +
        e.rows.map(x => `<tr class="${st.change && x.t === st.k ? 'hl' : ''}"><td>${x.t}</td><td>${F.n(x.Bstart, 2)}</td><td>${F.n(x.E, 2)}</td><td>${P(x.po, 0)}</td><td>${F.n(x.D, 2)}</td><td>${F.n(x.ret, 2)}</td><td>${x.g == null ? '–' : P(x.g, 2)}</td></tr>`).join('') + '</table></div>';
      kpi.innerHTML = '';
      kpi.append(h('div', { class: 'statrow' },
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, P(e.g1, 2)), h('div', { class: 'l', html: `growth = ${P(1 - st.po, 0)} × ${P(st.roe, 1)}` + (st.change ? ` (years 1–${st.k})` : '') })),
        st.change ? h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, P(e.g2, 2)), h('div', { class: 'l', html: `growth from year ${st.k + 1} = ${P(1 - st.po2, 0)} × ${P(st.roe, 1)}` })) : null,
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, e.ok ? '₹' + F.n(e.V, 2) : 'n.a.'), h('div', { class: 'l' }, 'value of one share')),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: e.ok && e.pvgo < 0 ? 'var(--bad)' : null } }, e.ok ? (e.pvgo < 0 ? '−₹' : '₹') + F.n(Math.abs(e.pvgo), 2) : 'n.a.'), h('div', { class: 'l' }, 'PVGO = value − EPS₀ ÷ r'))));
      bar.innerHTML = ''; msg.innerHTML = '';
      if (e.ok && e.g2 > RF) msg.append(h('div', { class: 'callout warn', html: `<b>Stable growth of ${P(e.g2, 1)} is above R<sub>f</sub> (${P(RF)}).</b> In this set-up that growth lasts forever, which no company can sustain. Lower the ROE or raise the payout (or tick "The payout changes later") so that long-run growth stays below R<sub>f</sub>.` }));
      if (!e.ok) { msg.append(h('div', { class: 'callout bad', html: 'Stable growth (retention × ROE) is not below r, so the growing perpetuity has no finite value. Lower the ROE or the retention, or raise r.' })); }
      else {
        const tot = Math.max(e.V, e.aip);
        bar.append(h('div', { class: 'sbar', style: { height: '30px' } },
          h('div', { style: { flexBasis: (Math.min(e.aip, e.V) / tot * 100) + '%', background: 'var(--s1)' } }, `Assets in place ₹${F.n(e.aip, 1)}`),
          e.pvgo > 0 ? h('div', { class: 'hatch', style: { flexBasis: (e.pvgo / tot * 100) + '%', background: 'var(--s2)' } }, e.pvgo / tot > 0.15 ? `PVGO ₹${F.n(e.pvgo, 1)}` : '') : null,
          e.pvgo < 0 ? h('div', { style: { flexBasis: (-e.pvgo / tot * 100) + '%', background: 'var(--bad)', opacity: .75 } }, -e.pvgo / tot > 0.15 ? `−₹${F.n(-e.pvgo, 1)}` : '') : null));
        const txt = Math.abs(e.pvgo) < 0.005 * e.aip ? 'PVGO is zero: the share is worth exactly its current earnings as a level perpetuity.' :
          e.pvgo > 0 ? `About ${F.n(e.pvgo / e.V * 100, 0)}% of the value comes from growth.` + (st.roe > st.r ? ` The money kept back earns ${P(st.roe, 1)}, more than the ${P(st.r, 1)} shareholders require, so reinvesting adds value.` : '') :
            `PVGO is negative. Earnings still grow (${P(e.g1, 2)} a year), but the money kept back earns only ${P(st.roe, 1)} while shareholders require ${P(st.r, 1)}. The share is worth less than if the company paid out all its earnings (red part: value lost).`;
        msg.append(h('p', { class: 'muted', style: { marginTop: '8px' } }, txt));
      }
      const yrs = e.rows.slice(0, 11);
      lineChart(chart, { width: 560, height: 240, aria: 'EPS and DPS by year', x: { min: 0, max: yrs.length - 1, fmt: v => 'Y' + v }, y: { min: 0, max: Math.max(...yrs.map(x => x.E)) * 1.15, fmt: v => '₹' + F.n(v, 0) },
        series: [{ name: 'EPS', color: 'var(--s1)', data: yrs.map(x => [x.t, x.E]) }, { name: 'DPS', color: 'var(--s3)', width: 3, data: yrs.map(x => [x.t, x.D]) }],
        marks: st.change ? [{ x: st.k, label: 'new payout' }] : [],
        tipFmt: (xv) => { const x = e.rows[xv]; return `<b>Year ${xv}</b><br>EPS ₹${F.n(x.E, 2)} · DPS ₹${F.n(x.D, 2)}<br>BVPS at start ₹${F.n(x.Bstart, 2)}`; } });
    }
    buildCtl();
    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Simulation'),
      h('h2', null, 'The growth engine: retention × ROE, and what growth is worth'),
      h('p', { class: 'lede', html: 'Kept-back earnings are added to book value, and book value earns the ROE next year. Move the sliders and watch book value, earnings and dividends build up year by year, then see how much of the share price is paying for that growth (PVGO).' }),
      h('div', { class: 'row' }, h('span', { class: 'muted' }, 'Try:'), ...PRE.map(([t, v]) => h('button', { class: 'btn small', onclick: () => { Object.assign(st, v); buildCtl(); draw(); } }, t)))));
    el.append(h('div', { class: 'grid side' },
      h('div', { class: 'card' }, ctl, h('p', { class: 'faint', style: { fontSize: '.8rem' } }, 'The company raises no new equity or debt. BVPS at the start of year 0 = EPS₀ ÷ ROE.')),
      h('div', null,
        h('div', { class: 'card' }, kpi, h('h4', null, 'Value = assets in place + PVGO'), bar, msg),
        h('div', { class: 'card' }, h('h3', null, 'Year by year'), tbl, chart))));
    draw();
  }

  /* =========================================================== REALITY CHECK */
  function renderReality(el) {
    const st = { s0: 200 / 78000, gc: 0.259, ge: 0.035 };
    const ch = h('div'), out = h('div'), ctl = h('div');
    const PRE = [['Apple vs World (class figures, 2015)', { s0: 200 / 78000, gc: 0.259, ge: 0.035 }],
      ['An Indian firm: 0.1% of the economy, growing 20%', { s0: 0.001, gc: 0.20, ge: RF }],
      ['Growing at the economy\'s rate', { s0: 0.001, gc: RF, ge: RF }]];
    function buildCtl() {
      ctl.innerHTML = '';
      ctl.append(slider('Company today as a share of the economy', 0.0001, 0.05, 0.0001, st.s0, v => P(v, 2), v => { st.s0 = v; draw(); }),
        slider('Company growth a year', 0, 0.40, 0.001, st.gc, v => P(v, 1), v => { st.gc = v; draw(); }),
        slider('Economy growth a year (nominal)', 0, 0.12, 0.001, st.ge, v => P(v, 1), v => { st.ge = v; draw(); }));
    }
    function draw() {
      const f = (1 + st.gc) / (1 + st.ge), n = f > 1 ? Math.log(1 / st.s0) / Math.log(f) : Infinity;
      const T = isFinite(n) ? Math.min(150, Math.ceil(n * 1.15) + 2) : 60;
      const data = []; for (let t = 0; t <= T; t++) data.push([t, Math.min(1.0, st.s0 * Math.pow(f, t))]);
      lineChart(ch, { width: 720, height: 300, aria: 'Company size as a share of the economy', x: { min: 0, max: T, fmt: v => 'Y' + v, label: 'Years from now' }, y: { min: 0, max: 1, fmt: v => P(v, 0) },
        series: [{ name: 'company ÷ economy', color: 'var(--s2)', width: 3, data, label: false }],
        marks: isFinite(n) ? [{ x: Math.min(T, n), label: n > T * 0.7 ? '' : `year ${Math.ceil(n)}` }] : [],
        tipFmt: (x) => `<b>Year ${x}</b><br>company = ${P(Math.min(1, st.s0 * Math.pow(f, x)), 2)} of the economy` });
      out.innerHTML = isFinite(n) ? `<div class="callout bad"><b>Impossible after about ${Math.ceil(n)} years.</b> Growing at ${P(st.gc, 1)} while the economy grows at ${P(st.ge, 1)}, the company's share of the economy rises by a factor of ${F.n(f, 4)} every year, from ${P(st.s0, 2)} today to 100% in year ${Math.ceil(n)}. Its sales are part of the economy, so this cannot happen. Growth that high can only be temporary.</div>`
        : `<div class="callout good"><b>Sustainable.</b> Growing no faster than the economy, the company's share of the economy never rises. Only growth like this can be used as a stable growth rate that lasts forever.</div>`;
    }
    buildCtl();
    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'The ceiling on stable growth'),
      h('h2', null, 'How high can growth go, forever?'),
      h('p', { class: 'lede', html: 'In class we let Apple keep growing at its 2015 pace of 25.9% a year while the world economy grew 3.5%. Do that and Apple ends up bigger than the planet\'s entire GDP. Move the sliders to see how long any growth rate above the economy\'s can last. (Here each year\'s growth is applied once, so with the class figures Apple overtakes the world economy in about 31 years. The class spreadsheet applies growth more aggressively and shows year 8, but the point is the same: no company can outgrow the economy forever.)' }),
      h('div', { class: 'row' }, h('span', { class: 'muted' }, 'Try:'), ...PRE.map(([t, v]) => h('button', { class: 'btn small', onclick: () => { Object.assign(st, v); buildCtl(); draw(); } }, t)))));
    el.append(h('div', { class: 'grid side' }, h('div', { class: 'card' }, ctl), h('div', { class: 'card' }, ch, out)));

    // value vs g
    const st2 = { D0: 5, r: 0.08 };
    const ch2 = h('div'), out2 = h('div');
    const draw2 = () => {
      const data = []; for (let g = -0.05; g < st2.r - 0.004; g += 0.001) data.push([+g.toFixed(4), st2.D0 * (1 + g) / (st2.r - g)]);
      const ymax = Math.min(1500, Math.max(...data.map(d => d[1])));
      lineChart(ch2, { width: 720, height: 280, aria: 'Value against stable growth', x: { min: -0.05, max: st2.r, fmt: v => P(v, 0), label: 'Stable growth rate g' }, y: { min: 0, max: ymax, fmt: v => '₹' + F.big(v, 0) },
        series: [{ name: 'value', color: 'var(--s1)', width: 3, data, label: false }],
        marks: [{ x: RF, label: 'R_f ' + P(RF) }].filter(m => m.x < st2.r),
        tipFmt: x => `<b>g = ${P(x, 1)}</b><br>value = ₹${F.n(st2.D0 * (1 + x) / (st2.r - x), 2)}` });
      out2.innerHTML = `<p class="muted">With D<sub>0</sub> = ₹${F.n(st2.D0, 2)} and r = ${P(st2.r, 1)}: at g = ${P(st2.r - 0.03, 1)} the value is ₹${F.n(st2.D0 * (1 + st2.r - 0.03) / 0.03, 2)}; at g = ${P(st2.r - 0.01, 1)} it is ₹${F.n(st2.D0 * (1 + st2.r - 0.01) / 0.01, 2)}. As g approaches r, r − g approaches zero and the value shoots up without limit. That is why g must stay well below r, and why a small change in g moves the value so much.</p>`;
    };
    el.append(h('div', { class: 'card' }, h('h3', null, 'Why g must stay below r: the value explodes as g → r'),
      h('div', { class: 'grid g2' }, slider('Dividend just paid D<sub>0</sub>', 1, 20, 0.5, st2.D0, v => '₹' + F.n(v, 1), v => { st2.D0 = v; draw2(); }), slider('Cost of equity r', 0.06, 0.18, 0.005, st2.r, v => P(v, 1), v => { st2.r = v; draw2(); })),
      ch2, out2));
    draw(); draw2();
  }

  /* =========================================================== REAL */
  function renderReal(el) {
    const host = h('div'); el.append(host);
    if (window.S12_REAL) window.S12_REAL(host); else host.append(h('div', { class: 'card' }, 'Company data is loading…'));
  }

  /* =========================================================== CONCEPTS */
  const QUIZ = [
    { q: 'Why is the book value of equity a poor estimate of what a share is worth?', opts: ['Because it is audited', 'Because many assets are at historical cost and many valuable ones (brands, skills, customer loyalty) are not on the balance sheet at all', 'Because it is always higher than the market value', 'Because it includes the value of debt'], a: 1, why: 'Book value looks backward: long-term assets and acquired intangibles sit at historical cost less depreciation, and assets the firm built itself (brand, know-how, relationships) are missing. Value looks forward at the cash shareholders will receive.', whyWrong: { 2: 'It can be higher or lower: Nestlé India trades at about 45 times book, ONGC at 0.7 times.', 3: 'Book equity is assets minus liabilities, so debt has already been subtracted.' } },
    { q: 'In June 2005 Amazon\'s book equity was −$64 million while its market value of equity was over $15 billion. What does this show?', opts: ['Amazon was bankrupt', 'Book equity can be negative even for a valuable company; investors valued its assets far above their book value', 'The market was certainly wrong', 'Market value of equity can also be negative'], a: 1, why: 'A negative book value only says liabilities exceeded the recorded (historical) value of assets. Investors looked at the cash Amazon\'s business would generate and valued its equity at over $15 billion.', whyWrong: { 3: 'Market value of equity cannot be negative: the most a shareholder can lose is what they paid.' } },
    { q: 'A company has just paid a dividend of ₹5. Dividends grow 5% a year forever and r = 8%. What is the share worth?', opts: ['₹166.67', '₹175.00', '₹62.50', '₹105.00'], a: 1, why: 'The ₹5 has been paid, so the first future dividend is D<sub>1</sub> = 5 × 1.05 = 5.25. P<sub>0</sub> = 5.25 ÷ (0.08 − 0.05) = ₹175.', whyWrong: { 0: '₹166.67 = 5 ÷ 0.03 uses D<sub>0</sub> on top. The formula needs the next dividend, D<sub>1</sub>.' } },
    { q: 'In the ₹175 example (D<sub>1</sub> = 5.25, g = 5%, r = 8%), investors become less worried about risk and r falls to 7%. The new value is:', opts: ['About ₹200', '₹262.50, a 50% rise', '₹175, unchanged', '₹131.25'], a: 1, why: 'P<sub>0</sub> = 5.25 ÷ (0.07 − 0.05) = 5.25 ÷ 0.02 = ₹262.50. r − g falls from 3% to 2%, by a third, so the value rises by half (0.03 ÷ 0.02 = 1.5). The model is very sensitive to r and g when they are close.' },
    { q: 'An analyst values an Indian company with 12% stable growth forever. The 10-year G-sec yields 7.34%. What is wrong?', opts: ['Nothing, if the company has grown 12% in the past', 'Stable growth lasts forever, so it should be below the long-run growth of the economy, for which R<sub>f</sub> is a good proxy; 12% is too high', 'Stable growth must be exactly equal to R<sub>f</sub>', 'Stable growth must be above r'], a: 1, why: 'A company that grew faster than the economy forever would one day be bigger than the economy. Fast growth belongs in the early stages of a multi-stage model; the stable rate should be below R<sub>f</sub>.', whyWrong: { 3: 'If g ≥ r, D ÷ (r − g) is infinite or negative: the model breaks.' } },
    { q: 'A company earns an ROE of 15% and pays out 40% of its earnings. It raises no new capital. At what rate will its earnings grow?', opts: ['6%', '9%', '15%', '40%'], a: 1, why: 'Growth = retention ratio × ROE = (1 − 0.40) × 15% = 9%. The 60% kept back is added to book equity, which earns 15% next year.', whyWrong: { 0: '6% = 0.40 × 15% uses the payout ratio. Growth comes from what is kept back, not from what is paid out.' } },
    { q: 'A company will raise its payout ratio from 25% to 75% starting in year 3, with ROE constant. When does its earnings growth rate change?', opts: ['In year 3', 'In year 4', 'In year 2', 'Never, because ROE is constant'], a: 1, why: 'Growth in year t = retention in year t − 1 × ROE. Year 3 earnings still grow on year 2\'s high retention; the lower retention of year 3 first slows growth in year 4. (Dividends jump in year 3 because a bigger share of year-3 earnings is paid out.)' },
    { q: 'A firm\'s dividend of ₹5 (just paid) is expected to shrink 5% a year forever. With r = 10%, the share is worth:', opts: ['It cannot be valued: g must be positive', '₹31.67', '₹100', '₹50'], a: 1, why: 'Negative growth is allowed. D<sub>1</sub> = 5 × 0.95 = 4.75, and P<sub>0</sub> = 4.75 ÷ (0.10 − (−0.05)) = 4.75 ÷ 0.15 = ₹31.67. With no growth it would be 5 ÷ 0.10 = ₹50.' },
    { q: 'A share trades at ₹40. Next year\'s dividend is expected to be ₹2.10 and dividends grow 5% a year forever. What return are investors expecting if they buy at ₹40?', opts: ['5.00%', '10.25%', '12.20%', '5.25%'], a: 1, why: 'Implied cost of equity: r = D<sub>1</sub> ÷ P<sub>0</sub> + g = 2.10 ÷ 40 + 5% = 5.25% + 5% = 10.25%: a dividend yield plus growth.', whyWrong: { 3: '5.25% is only the dividend yield. Shareholders also get growth of 5% a year.' } },
    { q: 'A company\'s EPS<sub>0</sub> is ₹20, its cost of equity is 10% and its share trades at ₹250. What is its PVGO, and what does it mean?', opts: ['₹50: investors expect profitable new investments to add ₹50 a share', '₹230', '₹200: the value of growth', '−₹50'], a: 0, why: 'Assets in place = EPS<sub>0</sub> ÷ r = 20 ÷ 0.10 = ₹200. PVGO = 250 − 200 = ₹50: the part of the price paid for future positive-NPV investments.', whyWrong: { 2: '₹200 is the value of the assets in place (today\'s earnings forever), not of growth.' } },
    { q: 'In November 2026 Coal India\'s current EPS, capitalised at its CAPM cost of equity, is worth more than its share price. What does the negative PVGO tell you?', opts: ['The calculation must be wrong: PVGO cannot be negative', 'The market expects its earnings to fall below today\'s level (or its reinvestment to earn less than investors require)', 'Coal India has no assets in place', 'Its share is certainly a bargain'], a: 1, why: 'Price = EPS<sub>0</sub> ÷ r + PVGO. If the price is below EPS<sub>0</sub> ÷ r, investors are pricing in shrinking earnings. For a coal miner facing the shift to other energy sources, that is a reasonable market view, not an error.' },
    { q: 'Firm A has paid ₹1 a share every year for ten years while its EPS swung from −0.36 to 4.92. Firm B\'s dividend has risen and fallen with its earnings (payout 28–58%). For which is the dividend model suitable?', opts: ['Firm A, because its dividend is perfectly stable', 'Firm B, because its dividends have a consistent relation to its profitability', 'Both equally', 'Neither, because both pay dividends'], a: 1, why: 'The DDM values the company through its dividends, so it works only when dividends reflect what the business earns. Firm A\'s fixed ₹1 is a board decision with no link to value created (payout from 20% to 833%).' },
    { q: 'A three-stage model has stable growth starting in year 9 (so D<sub>9</sub> is the first stable dividend). The terminal value D<sub>9</sub> ÷ (r − g) is a value at which date, and how is it discounted?', opts: ['Year 9; divide by (1 + r)<sup>9</sup>', 'Year 8; divide by (1 + r)<sup>8</sup>', 'Today; no discounting', 'Year 10; divide by (1 + r)<sup>10</sup>'], a: 1, why: 'The growing perpetuity formula gives the value one period before its first cash flow. The first stable dividend is at year 9, so the value sits at year 8 and is discounted by (1 + r)<sup>8</sup>. Mixing this up is one of the most common slips.' },
    { q: 'A company stops paying dividends and returns all its cash to shareholders through share buybacks. What happens if you value it with the DDM?', opts: ['Nothing changes: the DDM captures buybacks', 'The DDM misses the cash returned through buybacks and would undervalue the shares', 'The DDM overvalues it', 'Buybacks raise the dividend growth rate automatically'], a: 1, why: 'The DDM counts only dividends. Buybacks are another way of returning cash to shareholders, so a firm that uses them instead of dividends looks less valuable through the DDM than it really is. This is one of the model\'s limitations listed in class.' }
  ];

  function renderConcepts(el) {
    const prog = h('div', { class: 'progressbar' }, h('div', { style: { width: '0%' } }));
    const lab = h('span', { class: 'muted' });
    const upd = () => { const q = Store.get('icf-quiz', {}); const n = QUIZ.filter((_, i) => q['s12-q' + i]).length; prog.firstChild.style.width = (n / QUIZ.length * 100) + '%'; lab.textContent = `${n} / ${QUIZ.length} answered correctly at least once`; };
    el.append(h('div', { class: 'card' }, h('div', { class: 'kicker' }, 'Concept checks'), h('h2', null, 'Do you understand why, not just how?'),
      h('p', { class: 'lede' }, 'Pick an answer to see the explanation. Wrong answers are explained too. These questions test the reasoning behind each formula.'),
      h('div', { class: 'row' }, h('div', { style: { flex: 1 } }, prog), lab)));
    const box = h('div', { class: 'grid g2' });
    QUIZ.forEach((q, i) => mcq(Object.assign({}, q, { q: `<span class="pill accent">Q${i + 1}</span> ${q.q}` }), box, 's12-q' + i, upd));
    el.append(box);
    upd();
  }

  /* =========================================================== CASES */
  function renderCases(el) {
    const all = window.S12_PROBLEMS;
    const prog = h('div', { class: 'progressbar' }, h('div', { style: { width: '0%' } }));
    const lab = h('span', { class: 'muted' });
    const upd = () => { const st = Store.get('icf-progress', {}); const n = all.filter(p => st[p.id] && st[p.id].solved).length; prog.firstChild.style.width = (n / all.length * 100) + '%'; lab.textContent = `${n} / ${all.length} solved`; };
    el.append(h('div', { class: 'card' }, h('div', { class: 'kicker' }, 'Apply the concepts'), h('h2', null, `${all.length} real-world cases`),
      h('p', { class: 'lede', html: 'Each case is a real-world situation that uses several steps of this session. The first two are <b>medium</b>, to warm up; the last three are <b>hard</b>. Work each one out first, then press <b>Check answers</b>. The step-by-step solution unlocks only after you have checked. Enter percentages as numbers (12.34 for 12.34%) and rupee amounts without the ₹ sign. Answers within ±0.10 percentage points, or ±1% for rupee amounts, count as correct, so rounding at intermediate steps is fine.' }),
      h('div', { class: 'row' }, h('div', { style: { flex: 1 } }, prog), lab),
      h('div', { class: 'tblwrap', style: { marginTop: '12px' }, html: '<table class="tbl"><tr><th>Case</th><th>Level</th><th>What it covers</th></tr>' + all.map(p => `<tr><td style="white-space:nowrap"><a href="#" data-prob="${p.id}">${p.code}</a></td><td style="text-align:left">${p.level}</td><td style="text-align:left">${p.covers}</td></tr>`).join('') + '</table>' })));
    $$('a[data-prob]', el).forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = $('#prob-' + a.dataset.prob); t.classList.add('open'); t.scrollIntoView({ behavior: 'smooth' }); }));
    const sec = h('div', { style: { marginTop: '18px' } });
    all.forEach(p => problem(p, sec, upd));
    el.append(sec);
    upd();
  }

  window.S12 = { mount, TABS, go, openCase };
})();
