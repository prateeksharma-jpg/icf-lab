/* Session 11 — Cost of capital & hurdle rates (Marriott). UI module. */
(function () {
  'use strict';
  const { $, $$, h, s, F, Fin, Store, tip, lineChart, problem, mcq, slider, seg } = ICF;
  const M = window.MARRIOTT;
  const P = (x, d = 2) => F.pct(x, d);
  const COL = { lod: 'var(--s1)', rest: 'var(--s2)', cs: 'var(--s3)', firm: 'var(--text)' };

  const TABS = [
    { id: 'start', t: 'Start here' },
    { id: 'hurdle', t: 'Hurdle rates' },
    { id: 'machine', t: 'WACC Machine' },
    { id: 'marriott', t: 'Marriott lab' },
    { id: 'real', t: 'Real companies' },
    { id: 'concepts', t: 'Concept checks' },
    { id: 'practice', t: 'Practice problems' }];

  function mount(root, tabbar) {
    TABS.forEach(tb => {
      tabbar.append(h('button', { class: 'tab', 'data-tab': tb.id, onclick: () => go(tb.id) }, tb.t));
      root.append(h('section', { class: 'panel', id: 'panel-' + tb.id }));
    });
    renderStart($('#panel-start'));
    renderHurdle($('#panel-hurdle'));
    renderMachine($('#panel-machine'));
    renderMarriott($('#panel-marriott'));
    renderReal($('#panel-real'));
    renderConcepts($('#panel-concepts'));
    renderPractice($('#panel-practice'));
    const want = (location.hash || '').replace('#', '');
    go(TABS.some(t => t.id === want) ? want : 'start', true);
    addEventListener('hashchange', () => { const w = location.hash.replace('#', ''); if (TABS.some(t => t.id === w)) go(w, true); });
  }
  function go(id, noPush) {
    $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    $$('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
    if (!noPush) history.replaceState(null, '', '#' + id);
    window.scrollTo({ top: 0 });
    const p = $('#panel-' + id); if (p && p._onShow) p._onShow();
  }
  window.S11_GO = go;

  /* =========================================================== START */
  function renderStart(el) {
    el.append(h('div', { class: 'card hero' },
      h('div', { class: 'kicker' }, 'Session 11 · Cost of capital'),
      h('h1', null, 'What return must a project earn before it creates value?'),
      h('p', { class: 'lede', html: 'In April 1988 Dan Cohrs, Marriott\'s VP of project finance, had to answer that question for three very different businesses: hotels, restaurants and contract food services. His answer is a <b>hurdle rate</b> for each division. This lab walks through how to build one, how to get it wrong, and what it looks like for real companies today.' }),
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn primary', onclick: () => go('hurdle') }, 'Why one rate is not enough →'),
        h('button', { class: 'btn', onclick: () => go('marriott') }, 'Jump to the Marriott lab'),
        h('button', { class: 'btn', onclick: () => go('practice') }, 'Practice problems'))));

    // Balance-sheet blender
    const st = { e: 0.6, ke: 0.20, kd: 0.10, t: 0.30 };
    const bs = h('div', { class: 'bs' });
    const out = h('div');
    const draw = () => {
      const w = st.e * st.ke + (1 - st.e) * st.kd * (1 - st.t);
      bs.innerHTML = '';
      bs.append(h('div', { class: 'a' }, 'Assets', h('small', null, 'use of capital'), h('div', { style: { fontSize: '1.6rem', marginTop: '8px' } }, P(w)), h('small', null, 'must earn at least this')),
        h('div', { class: 'l' },
          h('div', { style: { flex: `0 0 ${(1 - st.e) * 100}%`, background: 'var(--s2)' } }, (1 - st.e) > 0.08 ? `Debt ${F.n((1 - st.e) * 100, 0)} cr` : '', (1 - st.e) > 0.16 ? h('span', { style: { fontWeight: 400 } }, `@ ${P(st.kd, 1)} → ${P(st.kd * (1 - st.t), 2)} after tax`) : ''),
          h('div', { style: { flex: `0 0 ${st.e * 100}%`, background: 'var(--s1)' } }, st.e > 0.08 ? `Equity ${F.n(st.e * 100, 0)} cr` : '', st.e > 0.16 ? h('span', { style: { fontWeight: 400 } }, `@ ${P(st.ke, 1)} (CAPM)`) : '')));
      out.innerHTML = `<div class="formula">WACC = ${F.n(st.e, 2)} × ${P(st.ke, 1)} + ${F.n(1 - st.e, 2)} × ${P(st.kd, 1)} × (1 − ${F.n(st.t, 2)}) = <b>${P(w)}</b></div>
        <p class="muted">Interest of ₹${F.n((1 - st.e) * 100 * st.kd, 1)} cr saves ₹${F.n((1 - st.e) * 100 * st.kd * st.t, 2)} cr of tax, so debt really costs ${P(st.kd * (1 - st.t))}. The assets must earn the blended ${P(w)} to pay both groups of investors what they could earn elsewhere at the same risk.</p>`;
    };
    const ctl = h('div',
      slider('Equity share of capital (E/V)', 0, 1, 0.01, st.e, v => P(v, 0), v => { st.e = v; draw(); }),
      slider('Cost of equity K<sub>e</sub>', 0.08, 0.30, 0.0025, st.ke, v => P(v, 1), v => { st.ke = v; draw(); }),
      slider('Pre-tax cost of debt K<sub>d</sub>', 0.04, 0.16, 0.0025, st.kd, v => P(v, 1), v => { st.kd = v; draw(); }),
      slider('Tax rate', 0, 0.45, 0.01, st.t, v => P(v, 0), v => { st.t = v; draw(); }));
    el.append(h('div', { class: 'card' },
      h('h2', null, '1 · The balance-sheet blender'),
      h('p', { class: 'muted' }, 'From the class notes: ₹100 cr of assets, financed with ₹60 cr of equity at 20% and ₹40 cr of debt at 10%, tax 30%. Move the sliders.'),
      h('div', { class: 'grid g2' }, h('div', null, bs, out), ctl)));
    draw();

    el.append(h('div', { class: 'card' },
      h('h2', null, '2 · Three levels of hurdle rate'),
      h('div', { class: 'grid g3' },
        h('div', { class: 'statbox', html: '<h4>Firm level</h4><p class="muted">One WACC for everything. Correct <i>only</i> if every project has the same risk as the firm as a whole.</p><b>Marriott: 10.61%</b>' }),
        h('div', { class: 'statbox', html: '<h4>Division level</h4><p class="muted">One rate per line of business. Projects within a division are assumed to share its risk. <b>This is what Cohrs builds.</b></p><b>Lodging 9.31% · Restaurants 11.30% · CS 13.23%</b>' }),
        h('div', { class: 'statbox', html: '<h4>Project level</h4><p class="muted">Each project carries its own risk. Ideal in theory, but you rarely have the data, so divisions are the practical compromise.</p><b>Adjust up or down from the division rate</b>' })),
      h('div', { class: 'callout', html: '<b>Hurdle rate = discount rate = opportunity cost of capital.</b> The cash flows in the numerator say what the project returns (its IRR). The rate in the denominator says how risky those cash flows are. Accept when IRR > hurdle, or equivalently when NPV at the hurdle is positive.' })));

    el.append(h('div', { class: 'card' },
      h('h2', null, '3 · The recipe (memorise this order)'),
      h('div', { class: 'pipe' },
        ...[['1', 'K_d', 'R<sub>f</sub> + default spread (traded YTM, rating, or synthetic rating from EBIT/interest)'],
        ['2', 'β_L → β_U', 'Unlever the regression beta at the leverage of the estimation period'],
        ['3', 'Comparables', 'Average comparable betas for each division, then unlever them'],
        ['4', 'Back out', 'Solve for the division that has no comparables'],
        ['5', 'β_U → β_L', 'Relever each division at its own target D/E'],
        ['6', 'K_e', 'CAPM: R<sub>f</sub> + β<sub>L</sub>(R<sub>m</sub> − R<sub>f</sub>)'],
        ['7', 'WACC', 'E/V·K<sub>e</sub> + D/V·K<sub>d</sub>(1 − t), with market or target weights']].map(([n, a, b]) => h('div', { class: 'pnode' }, h('div', { class: 'n' }, 'Step ' + n), h('div', { class: 'v', html: a.replace('_L', '<sub>L</sub>').replace('_U', '<sub>U</sub>').replace('_d', '<sub>d</sub>').replace('_e', '<sub>e</sub>') }), h('div', { class: 'd', html: b }))))));

    el.append(h('div', { class: 'card' },
      h('h2', null, '4 · Formula sheet'),
      h('div', { class: 'grid g2' },
        h('div', { html: `<div class="formula">WACC = <i>E/V</i>·K<sub>e</sub> + <i>D/V</i>·K<sub>d</sub>(1 − t)</div>
          <div class="formula">K<sub>e</sub> = R<sub>f</sub> + β<sub>L</sub>(R<sub>m</sub> − R<sub>f</sub>)</div>
          <div class="formula">K<sub>d</sub> = R<sub>f</sub> + default spread</div>
          <div class="formula">Interest coverage = EBIT ÷ interest expense</div>` }),
        h('div', { html: `<div class="formula">β<sub>L</sub> = β<sub>U</sub>[1 + (D/E)(1 − t)]</div>
          <div class="formula">β<sub>U,firm</sub> = Σ (V<sub>i</sub>/V)·β<sub>U,i</sub></div>
          <div class="formula">β<sub>U, with cash</sub> = β<sub>business</sub> × (1 − Cash/V)</div>
          <div class="formula">D/E = (D/V) ÷ (1 − D/V)</div>` })),
      h('p', { class: 'muted' }, 'Historical risk premium in this course = CAGR(Rm) − CAGR(Rf) over a long period. For Marriott in 1988 that is 5.63% (S&P 500 vs long-term government bonds, 1926–87).')));
  }

  /* =========================================================== HURDLE */
  const BASE = M.run(M.defaults());
  const PROJECTS = [
    { n: 'Courtyard hotel, 150 rooms, suburban Atlanta', d: 'lod', irr: 0.101 },
    { n: 'Full-service convention hotel, Orlando', d: 'lod', irr: 0.088 },
    { n: 'Fairfield Inn economy-hotel roll-out', d: 'lod', irr: 0.098 },
    { n: 'In-flight catering kitchen at a new airline hub', d: 'cs', irr: 0.126 },
    { n: 'Ten-year hospital food-service contract', d: 'cs', irr: 0.140 },
    { n: 'University dining-services bid', d: 'cs', irr: 0.120 },
    { n: 'Roy Rogers fast-food expansion, 40 units', d: 'rest', irr: 0.110 },
    { n: 'Big Boy family-restaurant remodel programme', d: 'rest', irr: 0.122 }];

  function hurdleChart(el, projects, picked) {
    el.innerHTML = '';
    const W = 760, H = 360, m = { l: 52, r: 16, t: 20, b: 40 };
    const ymin = 0.08, ymax = 0.15, Y = ICF.lin(ymin, ymax, H - m.b, m.t);
    const cols = ['lod', 'rest', 'cs'], cw = (W - m.l - m.r) / 3;
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Division hurdle rates versus firm-wide WACC with project IRRs' });
    for (const t of ICF.niceTicks(ymin, ymax, 6)) { svg.append(s('line', { class: 'gridl', x1: m.l, x2: W - m.r, y1: Y(t), y2: Y(t) })); svg.append(s('text', { x: m.l - 8, y: Y(t) + 4, 'text-anchor': 'end' }, P(t, 0))); }
    const firm = BASE.firm.wacc;
    cols.forEach((k, i) => {
      const x0 = m.l + i * cw + 8, x1 = m.l + (i + 1) * cw - 8, hr = BASE[k].wacc;
      if (hr > firm) {
        svg.append(s('rect', { x: x0, y: Y(hr), width: x1 - x0, height: Y(firm) - Y(hr), fill: 'var(--bad)', opacity: 0.13 }));
        const mid = (Y(hr) + Y(firm)) / 2, thin = Y(firm) - Y(hr) < 34;
        if (thin) svg.append(s('text', { x: x0 + 6, y: mid + 4, style: 'font-size:11px;font-weight:700;fill:var(--bad)' }, 'Wrongly accepted'));
        else { svg.append(s('text', { x: x0 + 6, y: mid - 2, style: 'font-size:11px;font-weight:700;fill:var(--bad)' }, 'Wrongly')); svg.append(s('text', { x: x0 + 6, y: mid + 10, style: 'font-size:11px;font-weight:700;fill:var(--bad)' }, 'accepted')); }
      } else {
        svg.append(s('rect', { x: x0, y: Y(firm), width: x1 - x0, height: Y(hr) - Y(firm), fill: 'var(--s4)', opacity: 0.18 }));
        svg.append(s('text', { x: x0 + 6, y: (Y(hr) + Y(firm)) / 2 - 2, style: 'font-size:11px;font-weight:700;fill:var(--text)' }, 'Wrongly'));
        svg.append(s('text', { x: x0 + 6, y: (Y(hr) + Y(firm)) / 2 + 10, style: 'font-size:11px;font-weight:700;fill:var(--text)' }, 'rejected'));
      }
      svg.append(s('line', { x1: x0, x2: x1, y1: Y(hr), y2: Y(hr), stroke: COL[k], 'stroke-width': 3, 'stroke-linecap': 'round' }));
      svg.append(s('text', { x: x0, y: hr > firm ? Y(hr) - 8 : Y(hr) + 17, style: 'font-weight:700;fill:var(--text)' }, M.names[k] + ' hurdle ' + P(hr)));
      svg.append(s('text', { x: (x0 + x1) / 2, y: H - m.b + 20, 'text-anchor': 'middle', style: 'font-weight:600' }, M.names[k]));
    });
    svg.append(s('line', { x1: m.l, x2: W - m.r, y1: Y(firm), y2: Y(firm), stroke: 'var(--text)', 'stroke-width': 2, 'stroke-dasharray': '7 5' }));
    svg.append(s('text', { x: W - m.r, y: Y(firm) + 16, 'text-anchor': 'end', style: 'font-weight:700;fill:var(--text)' }, 'Firm-wide WACC ' + P(firm)));
    const byDiv = { lod: [], rest: [], cs: [] }; projects.forEach(p => byDiv[p.d].push(p));
    cols.forEach((k, i) => byDiv[k].forEach((p, j, arr) => {
      const x = m.l + i * cw + cw * (0.42 + 0.5 * (j + 1) / (arr.length + 1)), y = Y(Math.max(ymin, Math.min(ymax, p.irr)));
      const ok = p.irr > BASE[k].wacc;
      const g = s('g', { style: 'cursor:pointer' });
      g.append(s('circle', { cx: x, cy: y, r: 14, fill: 'transparent' }));
      g.append(s('circle', { cx: x, cy: y, r: p === picked ? 9 : 7, fill: ok ? 'var(--good)' : 'var(--bad)', stroke: 'var(--surface)', 'stroke-width': 2 }));
      g.append(s('text', { x, y: y + 4, 'text-anchor': 'middle', style: 'font-size:9px;font-weight:800;fill:#fff' }, ok ? '✓' : '✗'));
      g.addEventListener('pointermove', ev => tip(`<b>${p.n}</b><br>${M.names[p.d]} · IRR ${P(p.irr, 1)}<br>Division hurdle ${P(BASE[p.d].wacc)} → <b>${ok ? 'accept' : 'reject'}</b><br>Firm WACC ${P(firm)} → ${p.irr > firm ? 'accept' : 'reject'}${(p.irr > firm) !== ok ? ' <b style="color:var(--bad)">(wrong)</b>' : ''}`, ev));
      g.addEventListener('pointerleave', () => tip(null));
      svg.append(g);
    }));
    el.append(svg);
  }

  function renderHurdle(el) {
    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'The central idea'),
      h('h2', null, 'One firm-wide WACC misprices every division'),
      h('p', { class: 'lede', html: 'Marriott\'s firm WACC (10.61%) is a value-weighted blend of a safe business (Lodging, 9.31%) and a risky one (Contract Services, 13.23%). Use the blend everywhere and you turn down good hotel projects while approving bad catering contracts. Over time the firm drifts toward its riskiest business.' }),
      h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)' } }), 'Lodging hurdle'), h('span', null, h('i', { style: { background: 'var(--s2)' } }), 'Restaurants hurdle'), h('span', null, h('i', { style: { background: 'var(--s3)' } }), 'Contract Services hurdle'), h('span', null, h('i', { style: { background: 'var(--text)' } }), 'Firm-wide WACC (dashed)'), h('span', null, h('i', { class: 'dot', style: { background: 'var(--good)' } }), '✓ project clears its division hurdle'), h('span', null, h('i', { class: 'dot', style: { background: 'var(--bad)' } }), '✗ it does not')),
      h('div', { class: 'chart', id: 'hurdle-chart' }),
      h('p', { class: 'muted' }, 'Hover a dot to see both decisions. Hurdles are the class base case from the Marriott lab.')));
    const chartEl = $('#hurdle-chart', el);

    // Try-your-own project
    const mine = { n: 'Your project', d: 'cs', irr: 0.12 };
    const verdict = h('div');
    const upd = () => {
      hurdleChart(chartEl, PROJECTS.concat([mine]), mine);
      const hr = BASE[mine.d].wacc, firm = BASE.firm.wacc, right = mine.irr > hr, firmSays = mine.irr > firm;
      verdict.innerHTML = `<div class="callout ${right === firmSays ? 'good' : 'bad'}">Division rule: <b>${right ? 'ACCEPT' : 'REJECT'}</b> (IRR ${P(mine.irr, 1)} vs ${P(hr)}). Firm-wide rule: <b>${firmSays ? 'ACCEPT' : 'REJECT'}</b> (vs ${P(firm)}). ${right === firmSays ? 'Both rules agree here.' : (firmSays ? 'The firm-wide rule accepts a project that destroys value.' : 'The firm-wide rule rejects a project that creates value.')}</div>`;
    };
    el.append(h('div', { class: 'card' }, h('h3', null, 'Drop in your own project'),
      h('div', { class: 'grid g2' },
        h('div', null, h('div', { class: 'ctl' }, h('label', null, 'Division'), seg([{ v: 'lod', t: 'Lodging' }, { v: 'rest', t: 'Restaurants' }, { v: 'cs', t: 'Contract Services' }], mine.d, v => { mine.d = v; upd(); })),
          slider('Project IRR', 0.075, 0.15, 0.001, mine.irr, v => P(v, 1), v => { mine.irr = v; upd(); })),
        verdict)));
    upd();

    // Capital committee game
    const game = h('div', { class: 'grid g4' });
    const score = h('div', { class: 'muted' });
    let answered = 0, right = 0, firmRight = 0;
    PROJECTS.forEach(p => {
      const card = h('div', { class: 'gcard' },
        h('div', { class: 'tag', style: { color: COL[p.d] } }, M.names[p.d]),
        h('div', null, p.n), h('div', { class: 'irr' }, 'IRR ' + P(p.irr, 1)));
      const vd = h('div');
      const act = acc => {
        const truth = p.irr > BASE[p.d].wacc, firmSays = p.irr > BASE.firm.wacc;
        answered++; if (acc === truth) right++; if (firmSays === truth) firmRight++;
        card.querySelectorAll('button').forEach(b => b.remove());
        vd.className = 'verdict callout ' + (acc === truth ? 'good' : 'bad');
        vd.innerHTML = `${acc === truth ? '✓' : '✗'} Hurdle ${P(BASE[p.d].wacc)} → should <b>${truth ? 'accept' : 'reject'}</b>.${firmSays !== truth ? ` A firm-WACC manager would have got this wrong.` : ''}`;
        score.innerHTML = `You: <b>${right}/${answered}</b> correct · Firm-WACC manager on the same projects: <b>${firmRight}/${answered}</b>` + (answered === PROJECTS.length ? ` · <b>Done.</b> The one-rate manager misjudges ${PROJECTS.length - firmRight} of ${PROJECTS.length} projects, and every mistake tilts the firm toward risk: safe hotel projects are turned down while risky contracts are approved.` : '');
      };
      card.append(h('div', { class: 'row' }, h('button', { class: 'btn small primary', onclick: () => act(true) }, 'Accept'), h('button', { class: 'btn small', onclick: () => act(false) }, 'Reject')), vd);
      game.append(card);
    });
    el.append(h('div', { class: 'card' }, h('h3', null, 'You chair Marriott\'s capital committee, 1988'),
      h('p', { class: 'muted' }, 'Accept or reject each proposal using the right divisional hurdle (Lodging 9.31%, Restaurants 11.30%, Contract Services 13.23%). The projects are illustrative.'), game, h('div', { style: { marginTop: '10px' } }, score)));
  }

  /* =========================================================== WACC MACHINE */
  function renderMachine(el) {
    const st = { rf: 0.065, mrp: 0.07, bu: 0.9, t: 0.25, dv: 0.30, mode: 'rating', spread: 0.015, op: 0.09 };
    const chartEl = h('div', { class: 'chart' }), barsEl = h('div'), stats = h('div', { class: 'statrow' }), note = h('div');
    const table = () => (window.S11_RATING || window.S11_PT);
    const at = dv => {
      const de = dv >= 0.999 ? Infinity : dv / (1 - dv), bl = Fin.lever(st.bu, de, st.t), ke = Fin.capm(st.rf, bl, st.mrp);
      let kd, rating = '', cov = Infinity;
      if (st.mode === 'fixed') kd = st.rf + st.spread;
      else { const r = Fin.synthKd(st.op, dv, st.rf, table()); kd = r.kd; rating = r.rating; cov = r.cov; }
      return { dv, de, bl, ke, kd, rating, cov, wacc: Fin.wacc(1 - dv, ke, dv, kd, st.t) };
    };
    const draw = () => {
      const pts = []; for (let i = 0; i <= 80; i++) pts.push(at(i / 100));
      const cur = at(st.dv), best = pts.reduce((a, b) => b.wacc < a.wacc ? b : a);
      const ymax = Math.min(0.40, Math.max(0.2, Math.ceil(Math.max(...pts.map(p => Math.min(p.ke, 0.4))) * 20) / 20));
      lineChart(chartEl, {
        width: 760, height: 360, aria: 'Cost of equity, after-tax cost of debt and WACC against leverage',
        x: { min: 0, max: 0.8, fmt: v => P(v, 0), label: 'Debt / firm value (D/V)' },
        y: { min: 0, max: ymax, fmt: v => P(v, 0) },
        series: [
          { name: 'Cost of equity', color: 'var(--s1)', data: pts.map(p => [p.dv, p.ke]) },
          { name: 'After-tax cost of debt', color: 'var(--s2)', data: pts.map(p => [p.dv, p.kd * (1 - st.t)]) },
          { name: 'WACC', color: 'var(--s3)', width: 3.5, data: pts.map(p => [p.dv, p.wacc]) }],
        marks: [{ x: st.dv, label: 'You: ' + P(st.dv, 0) }],
        dots: [{ x: best.dv, y: best.wacc, color: 'var(--s3)', label: 'min ' + P(best.wacc), below: true }],
        tipFmt: (x, v) => { const p = at(x); return `<b>D/V ${P(x, 0)}</b> (D/E ${F.n(p.de, 2)})<br>β<sub>L</sub> ${F.n(p.bl, 3)}${p.rating ? ` · rating ${p.rating} (coverage ${isFinite(p.cov) ? F.n(p.cov, 2) : '∞'})` : ''}<br>K<sub>e</sub> <b>${P(p.ke)}</b><br>K<sub>d</sub> ${P(p.kd)} → after tax <b>${P(p.kd * (1 - st.t))}</b><br>WACC <b>${P(p.wacc)}</b>`; },
        onPick: x => { st.dv = Math.round(Math.max(0, Math.min(0.8, x)) * 100) / 100; dvCtl.set(st.dv); draw(); }
      });
      // decomposition bars
      const maxv = Math.max(cur.ke, 0.01) * 1.05;
      const pctw = v => (Math.max(0, v) / maxv * 100) + '%';
      const busRisk = st.bu * st.mrp, finRisk = (cur.bl - st.bu) * st.mrp;
      const eq = (1 - st.dv) * cur.ke, dt = st.dv * cur.kd * (1 - st.t), shield = st.dv * cur.kd * st.t;
      const seg2 = (w, bg, txt, t) => { const d = h('div', { style: { flexBasis: pctw(w), background: bg }, onpointermove: ev => tip(t, ev), onpointerleave: () => tip(null) }, txt); return d; };
      barsEl.innerHTML = '';
      barsEl.append(
        h('div', { class: 'sbar-row' }, h('div', null, 'Cost of equity'), h('div', { class: 'sbar' },
          seg2(st.rf, 'var(--text-3)', 'Rf', `<b>Risk-free rate</b> ${P(st.rf)}: time value of money`),
          seg2(busRisk, 'var(--s1)', 'Business risk', `<b>Business risk premium</b> β<sub>U</sub> × MRP = ${F.n(st.bu, 2)} × ${P(st.mrp)} = ${P(busRisk)}`),
          seg2(finRisk, 'var(--s7)', finRisk > 0.015 ? 'Fin. risk' : '', `<b>Financial risk premium</b> (β<sub>L</sub> − β<sub>U</sub>) × MRP = ${P(finRisk)}<br>extra return equity demands because of debt`)), h('div', { class: 'val' }, P(cur.ke))),
        h('div', { class: 'sbar-row' }, h('div', null, 'WACC'), h('div', { class: 'sbar' },
          seg2(eq, 'var(--s1)', 'E/V·Ke', `<b>Equity part</b> ${F.n(1 - st.dv, 2)} × ${P(cur.ke)} = ${P(eq)}`),
          seg2(dt, 'var(--s2)', dt > 0.01 ? 'D/V·Kd(1−t)' : '', `<b>Debt part, after tax</b> ${F.n(st.dv, 2)} × ${P(cur.kd)} × ${F.n(1 - st.t, 2)} = ${P(dt)}`),
          h('div', { class: 'hatch', style: { flexBasis: pctw(shield), background: 'var(--border-strong)', color: 'var(--text)' }, onpointermove: ev => tip(`<b>Tax shield</b> ${F.n(st.dv, 2)} × ${P(cur.kd)} × ${F.n(st.t, 2)} = ${P(shield)}<br>the government's share of the interest bill`, ev), onpointerleave: () => tip(null) }, shield > 0.012 ? 'tax shield' : '')), h('div', { class: 'val' }, P(cur.wacc))));
      stats.innerHTML = '';
      [['Levered beta', F.n(cur.bl, 3)], ['Cost of equity', P(cur.ke)], ['Pre-tax K_d' + (cur.rating ? ' (' + cur.rating + ')' : ''), P(cur.kd)], ['WACC', P(cur.wacc)], ['Lowest WACC (at D/V ' + P(best.dv, 0) + ')', P(best.wacc)]].forEach(([l, v]) => stats.append(h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, v), h('div', { class: 'l', html: l.replace('K_d', 'K<sub>d</sub>') }))));
      note.innerHTML = st.mode === 'fixed'
        ? `<div class="callout warn"><b>Fixed spread:</b> with a small spread, WACC falls as you add debt because each rupee of debt brings a tax shield (Modigliani–Miller with taxes). It keeps falling only while the after-tax spread is smaller than that tax saving; raise the spread above roughly 4% and it turns up. Set <b>both</b> the tax rate and the spread to 0 and the WACC line goes flat: the cheaper debt is exactly offset by the costlier equity.</div>`
        : `<div class="callout"><b>Spread follows the rating:</b> interest coverage = EBIT ÷ (D × K<sub>d</sub>). As D/V rises, coverage falls, the rating drops and the spread on <i>all</i> debt jumps. The tax-shield benefit is eventually swamped, giving a U-shaped WACC with a minimum near ${P(best.dv, 0)} debt. The kinks are rating downgrades.</div>`;
    };
    const dvCtl = slider('Debt / firm value (D/V)', 0, 0.8, 0.01, st.dv, v => P(v, 0), v => { st.dv = v; draw(); });
    const spreadCtl = slider('Fixed default spread', 0, 0.06, 0.0025, st.spread, v => P(v, 2), v => { st.spread = v; draw(); });
    const opCtl = slider('EBIT / firm value (sets coverage)', 0.05, 0.20, 0.005, st.op, v => P(v, 1), v => { st.op = v; draw(); });
    const modeBox = h('div');
    const setMode = m => { st.mode = m; spreadCtl.style.display = m === 'fixed' ? '' : 'none'; opCtl.style.display = m === 'fixed' ? 'none' : ''; draw(); };
    modeBox.append(h('div', { class: 'ctl' }, h('label', null, 'Cost of debt'), seg([{ v: 'rating', t: 'Spread follows rating' }, { v: 'fixed', t: 'Fixed spread' }], st.mode, setMode)));
    const presets = h('div', { class: 'row' }, h('span', { class: 'muted' }, 'Presets:'),
      ...[['Marriott Lodging \'88', { rf: 0.0895, mrp: 0.0563, bu: 0.4917, t: 0.34 }], ['Marriott CS \'88', { rf: 0.0895, mrp: 0.0563, bu: 1.0543, t: 0.34 }], ['Indian FMCG', { rf: 0.064, mrp: 0.073, bu: 0.75, t: 0.2517 }], ['Indian airline', { rf: 0.064, mrp: 0.073, bu: 1.15, t: 0.2517 }]].map(([n, v]) =>
        h('button', { class: 'btn small', onclick: () => { Object.assign(st, v); ctls.forEach(c => c.el.set(st[c.k])); draw(); } }, n)));
    const ctls = [
      { k: 'rf', el: slider('Risk-free rate R<sub>f</sub>', 0.02, 0.10, 0.0005, st.rf, v => P(v, 2), v => { st.rf = v; draw(); }) },
      { k: 'mrp', el: slider('Market risk premium', 0.03, 0.10, 0.0005, st.mrp, v => P(v, 2), v => { st.mrp = v; draw(); }) },
      { k: 'bu', el: slider('Unlevered (business) beta β<sub>U</sub>', 0.3, 1.8, 0.01, st.bu, v => F.n(v, 2), v => { st.bu = v; draw(); }) },
      { k: 't', el: slider('Tax rate', 0, 0.45, 0.005, st.t, v => P(v, 1), v => { st.t = v; draw(); }) }];
    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Simulation'),
      h('h2', null, 'The WACC Machine: what does debt really do?'),
      h('p', { class: 'lede' }, 'Equity gets riskier as you borrow (Hamada), debt is cheap after tax, and lenders charge more as coverage falls. Drag D/V, or click anywhere on the chart, to see which force wins.'),
      presets));
    el.append(h('div', { class: 'grid side' },
      h('div', { class: 'card' }, dvCtl, ...ctls.map(c => c.el), modeBox, opCtl, spreadCtl),
      h('div', null,
        h('div', { class: 'card' }, h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)' } }), 'Cost of equity'), h('span', null, h('i', { style: { background: 'var(--s2)' } }), 'After-tax cost of debt'), h('span', null, h('i', { style: { background: 'var(--s3)', height: '4px' } }), 'WACC')), chartEl, note),
        h('div', { class: 'card' }, h('h3', null, 'Where does each percentage point come from?'), barsEl, h('div', { style: { marginTop: '12px' } }, stats)))));
    setMode('rating');
    el._onShow = draw;
  }

  /* =========================================================== MARRIOTT */
  function renderMarriott(el) {
    const o = M.defaults();
    const pipe = h('div', { class: 'pipe' }), bars = h('div'), tbl = h('div', { class: 'tblwrap' }), compBox = h('div');
    const draw = () => {
      const r = M.run(o);
      pipe.innerHTML = '';
      const node = (n, v, d, c) => h('div', { class: 'pnode', style: { borderTopColor: c || 'var(--accent)' } }, h('div', { class: 'n' }, n), h('div', { class: 'v' }, v), h('div', { class: 'd', html: d }));
      pipe.append(node('Regression beta', '0.97', 'Marriott stock, daily 1986–87'),
        node('Unlevered beta', F.n(r.buF, 3), `at market D/E ${F.n(r.de0, 2)}, t ${P(r.t, 1)}`),
        node('Lodging unlevered β', F.n(r.L.bu, 3), `${r.L.n} hotel comps`, 'var(--s1)'),
        node('Restaurants unlevered β', F.n(r.R.bu, 3), `${r.R.n} restaurant comps`, 'var(--s2)'),
        node('CS unlevered β', F.n(r.buCS, 3), `backed out: weight ${P(r.w.cs, 1)}`, 'var(--s3)'));
      // bars
      bars.innerHTML = '';
      const max = Math.max(...['firm', 'lod', 'rest', 'cs'].map(k => r[k].wacc), 0.16) * 1.08;
      ['lod', 'rest', 'cs', 'firm'].forEach(k => {
        const d = r[k];
        const eqp = (1 - d.dv) * d.ke, dbp = d.dv * d.kdAT;
        const bar = h('div', { class: 'sbar' },
          h('div', { style: { flexBasis: (eqp / max * 100) + '%', background: k === 'firm' ? 'var(--text-2)' : COL[k] }, onpointermove: ev => tip(`<b>${M.names[k]}: equity part</b><br>${P(1 - d.dv, 0)} × K<sub>e</sub> ${P(d.ke)} = ${P(eqp)}<br>β<sub>L</sub> ${F.n(d.bl, 3)} at D/E ${F.n(d.de, 2)}`, ev), onpointerleave: () => tip(null) }, 'equity ' + P(eqp, 1)),
          h('div', { class: 'hatch', style: { flexBasis: (dbp / max * 100) + '%', background: k === 'firm' ? 'var(--text-2)' : COL[k] }, onpointermove: ev => tip(`<b>${M.names[k]}: debt part</b><br>${P(d.dv, 0)} × K<sub>d</sub> ${P(d.kd)} × (1 − t) = ${P(dbp)}`, ev), onpointerleave: () => tip(null) }, dbp > 0.02 ? 'debt ' + P(dbp, 1) : ''));
        bars.append(h('div', { class: 'sbar-row' }, h('div', { style: { fontWeight: k === 'firm' ? 700 : 600 } }, M.names[k]), bar, h('div', { class: 'val' }, P(d.wacc))));
      });
      // table
      const rows = [['Unlevered beta', k => F.n(r[k].bu, 4)], ['Target D/V', k => P(r[k].dv, 0)], ['Target D/E', k => F.n(r[k].de, 3)], ['Levered beta', k => F.n(r[k].bl, 4)], ['Rf', k => P(r[k].rf)], ['MRP', k => P(r[k].mrp)], ['Cost of equity', k => P(r[k].ke)], ['Spread', k => P(r[k].s, 1)], ['Pre-tax K_d', k => P(r[k].kd)], ['After-tax K_d', k => P(r[k].kdAT)], ['WACC', k => P(r[k].wacc)]];
      tbl.innerHTML = '<table class="tbl"><tr><th></th><th>Marriott</th><th>Lodging</th><th>Restaurants</th><th>Contract Services</th></tr>' + rows.map(([n, f], i) => `<tr class="${i === rows.length - 1 ? 'hl' : ''}"><td>${n.replace('Rf', 'R<sub>f</sub>').replace('K_d', 'K<sub>d</sub>')}</td>${['firm', 'lod', 'rest', 'cs'].map(k => `<td>${f(k)}</td>`).join('')}</tr>`).join('') + '</table>';
      const isBase = o.rf === '30y' && o.mrp === 'g-lt' && o.tax === 'stat' && o.w === 'assets' && o.method === 'avg' && !o.match && JSON.stringify(o.comps) === JSON.stringify(M.comps);
      baseNote.innerHTML = isBase ? '<span class="pill good">Class base case: matches the solution sheet</span>' : '<span class="pill">Modified: <a href="#" id="mar-reset">reset to class base case</a></span>';
      const rs = $('#mar-reset', baseNote); if (rs) rs.onclick = e => { e.preventDefault(); Object.assign(o, M.defaults()); rebuildControls(); draw(); };
    };
    const baseNote = h('div');
    const controls = h('div');
    const rebuildControls = () => {
      controls.innerHTML = '';
      const sel = (lab, opts, key) => { const sl = h('select', { onchange: () => { o[key] = sl.value; draw(); } }, opts.map(([v, t]) => h('option', { value: v, selected: o[key] === v }, t))); return h('div', { class: 'ctl' }, h('label', null, lab), sl); };
      controls.append(
        sel('Risk-free rate (Table B)', [['30y', '30-year Treasury 8.95% (class)'], ['10y', '10-year Treasury 8.72%'], ['1y', '1-year Treasury 6.90%']], 'rf'),
        sel('Market risk premium (Exhibit 5)', M.mrp.map(m => [m.k, `${P(m.v)}: ${m.t}`]), 'mrp'),
        sel('Tax rate', [['stat', '34%: statutory after the 1986 Tax Reform Act (class)'], ['eff', '44.1%: Marriott\'s 1987 effective rate']], 'tax'),
        sel('Division weights (Exhibit 2, 1987)', [['assets', 'Identifiable assets (class)'], ['op', 'Operating profit'], ['sales', 'Sales']], 'w'),
        sel('Comparable averaging', [['avg', 'Average β and D/V, then unlever (class)'], ['each', 'Unlever each comparable, then average']], 'method'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: o.match, onchange: e => { o.match = e.target.checked; draw(); } }), 'Maturity-match Rf by division (debate: Lodging 30-yr, Restaurants 10-yr, CS 1-yr)'));
      compBox.innerHTML = '';
      [['lod', 'Lodging comparables'], ['rest', 'Restaurant comparables']].forEach(([k, t]) => {
        compBox.append(h('h4', { style: { marginTop: '10px' } }, t));
        o.comps[k].forEach(c => compBox.append(h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: c.on, onchange: e => { c.on = e.target.checked; draw(); } }), `${c.n}  (β ${c.b}, D/V ${P(c.dv, 0)})${c.note ? ' · ' + c.note : ''}`)));
      });
    };
    rebuildControls();

    el.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'HBS case 9-289-047 · April 1988'),
      h('h2', null, 'Marriott Corporation: rebuild Cohrs\'s hurdle rates'),
      h('p', { class: 'lede', html: 'Every number below comes live from the case exhibits. The default settings reproduce the class solution exactly. Change one assumption at a time and watch which hurdle rates move, and by how much.' }),
      baseNote));
    el.append(h('div', { class: 'card' }, h('h3', null, 'From one regression beta to three divisional betas'), pipe,
      h('p', { class: 'muted', html: 'Marriott\'s β<sub>U</sub> is the asset-weighted average of its divisions: β<sub>U,Marriott</sub> = w<sub>L</sub>β<sub>U,L</sub> + w<sub>R</sub>β<sub>U,R</sub> + w<sub>CS</sub>β<sub>U,CS</sub>. Lodging and Restaurants come from comparables; Contract Services has no good comparables, so we solve for it.' })));
    el.append(h('div', { class: 'grid side' },
      h('div', { class: 'card' }, h('h3', null, 'Assumptions'), controls, compBox),
      h('div', null,
        h('div', { class: 'card' }, h('h3', null, 'Hurdle rates (WACC) by division'),
          h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)', height: '10px' } }), 'equity part E/V × Ke (solid)'), h('span', null, h('i', { class: 'hatch', style: { background: 'var(--s1)', height: '10px' } }), 'debt part D/V × Kd(1 − t) (hatched)')), bars),
        h('div', { class: 'card' }, h('h3', null, 'Full calculation'), tbl))));

    // Debate notes
    el.append(h('div', { class: 'card' }, h('h3', null, 'Debates worth having in class'),
      ...[
        ['Why 5.63% and not 7.43%?', 'The arithmetic average (7.43%) is the better estimate of next year\'s expected return, but the geometric average (5.63%) is the compound rate investors actually earned over long horizons, the 100% then −50% problem from class. The course uses CAGR(Rm) − CAGR(Rf). Switch the premium to 7.43% and the hurdles rise by about 0.7 points (Lodging) to 1.6 points (Contract Services).'],
        ['Why unlever at 0.70 but relever at 1.50?', 'The 0.97 regression beta was estimated on 1986–87 returns, so in principle we should unlever it at the leverage of that window. The class uses the current market D/E of 0.70 (end-1987) as a proxy; at end-1986 the market D/E was only about 0.43, and unlevering at that would give a higher β<sub>U</sub>. Marriott plans to run at 60% debt (D/E = 1.5), so the hurdle for new projects must reflect the risk equity will carry at that leverage.'],
        ['Why market value of equity?', 'Book equity was $810.8m against a market value of $3,564m. Investors\' opportunity cost is on what their stake is worth today, not on historical book value. Today\'s Marriott International has <i>negative</i> book equity after years of buybacks, so book weights would not even make sense.'],
        ['Is backing out Contract Services reliable?', 'Errors are amplified when they land on CS: an error in the Lodging β<sub>U</sub> is multiplied by w<sub>L</sub>/w<sub>CS</sub> ≈ 2.2×, in the Restaurant β<sub>U</sub> by ≈ 0.5×, and in Marriott\'s own β<sub>U</sub> by 1/w<sub>CS</sub> ≈ 3.7×. Try ticking La Quinta off: Lodging β<sub>U</sub> rises and the CS beta collapses. Treat 1.05 as an estimate with wide error bands.'],
        ['Should every division use the 30-year rate?', 'Hotels are 30+ year assets, but restaurants and food-service contracts are much shorter. Matching the risk-free rate to the life of the cash flows is the textbook argument. Tick the maturity-match box to see it lower the CS hurdle.']
      ].map(([q, a]) => h('details', { style: { margin: '8px 0' } }, h('summary', null, q), h('p', { class: 'muted', html: a })))));

    // Arithmetic vs geometric mini-demo
    el.append(h('div', { class: 'card' }, h('h3', null, 'Why geometric? The ₹100 that goes nowhere'),
      h('div', { class: 'grid g3' },
        h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, '₹100 → ₹200 → ₹100'), h('div', { class: 'l' }, 'Year 1: +100%, Year 2: −50%')),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: 'var(--bad)' } }, 'AM = 25%'), h('div', { class: 'l' }, '(100% − 50%) ÷ 2: says you earned 25% a year')),
        h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: 'var(--good)' } }, 'GM = 0%'), h('div', { class: 'l' }, '[(2)(0.5)]^½ − 1: what your wealth actually did'))),
      h('p', { class: 'muted', style: { marginTop: '10px' } }, 'Practice problem A3 shows how much this choice moves a valuation.')));

    // Then and now
    const tn = h('div', { id: 'then-now' });
    el.append(tn);
    el._fillThenNow = () => { tn.innerHTML = ''; if (window.S11_THENNOW) tn.append(window.S11_THENNOW()); };
    el._fillThenNow();
    el.append(h('div', { class: 'card' }, h('h3', null, 'Test yourself on the case'), h('p', { class: 'muted' }, 'Practice problem P4 (Marriott in Rajasthan) runs the whole Marriott recipe on a new company, then asks what a single firm-wide rate costs in NPV.'), h('button', { class: 'btn primary', onclick: () => { go('practice'); setTimeout(() => { const t = $('#prob-s11-P4'); if (t) { t.classList.add('open'); t.scrollIntoView({ behavior: 'smooth' }); } }, 50); } }, 'Go to problem P4 →')));
    draw();
  }

  /* =========================================================== REAL COMPANIES */
  function renderReal(el) {
    const host = h('div');
    el.append(host);
    el._build = () => { host.innerHTML = ''; if (window.S11_REAL) window.S11_REAL(host); else host.append(h('div', { class: 'card' }, 'Company data is loading…')); };
    el._build();
  }

  /* =========================================================== CONCEPTS */
  const QUIZ = [
    { q: 'Marriott\'s firm-wide WACC is 10.61%. A Contract Services project has an IRR of 12%. The division head says "12% beats 10.61%, so approve it." What is the best response?', opts: ['Approve: the IRR exceeds the cost of capital', 'Reject: the relevant hurdle is the Contract Services rate (≈13.2%), which the project fails', 'Approve if it is financed with debt costing 10.35%', 'Cannot decide without the payback period'], a: 1, why: 'The discount rate must reflect the risk of the project\'s cash flows. A CS project carries CS risk, so its hurdle is the CS WACC. The firm-wide 10.61% is a blend that includes much safer hotel assets.' },
    { q: 'Why do we unlever Marriott\'s regression beta at D/E = 0.70 but relever the division betas at the target D/E (e.g. 1.5 for the firm)?', opts: ['0.70 is the book D/E and 1.5 is the market D/E', 'The regression beta embeds the leverage of the estimation period (≈ current market D/E); hurdle rates must reflect the leverage the firm will maintain going forward', 'The case says so; there is no economic reason', 'Target leverage is always higher than current leverage'], a: 1, why: 'Unlever with the leverage that was present when the returns were measured (the class uses the current market D/E of 0.70 as a proxy; it was about 0.43 at end-1986). Relever with the capital structure the projects will carry over their life.' },
    { q: 'In 1987 Marriott\'s book equity was $810.8m and its market value of equity was $3,564m. Which belongs in the WACC weights, and why?', opts: ['Book value: it is audited and stable', 'Market value: it is what investors could get for their stake today, so it measures their opportunity cost', 'The average of the two', 'Neither: use the number of shares'], a: 1, why: 'Investors could sell at market value and reinvest elsewhere, so their required return applies to market value. Book equity reflects historical cost and, after buybacks, can even be negative, as it is for today\'s Marriott International.' },
    { q: 'A firm borrows at 10%. Its statutory tax rate is 30%, but it has large carried-forward losses and will pay no tax for the next five years. Its after-tax cost of debt over that period is closest to:', opts: ['7%', '10%', '3%', '13%'], a: 1, why: 'The tax shield exists only if there is taxable income to shield. With no tax payable, interest saves no tax now. The deduction only adds to loss carry-forwards, deferring any saving to an uncertain future, so the after-tax cost over these five years is close to the pre-tax 10%. Always ask whether the firm can use the deduction.' },
    { q: 'An index rises 100% in year 1 and falls 50% in year 2. Which average describes what happened to an investor\'s wealth, and which does this course use for the historical risk premium?', opts: ['Arithmetic (25%), for both', 'Geometric (0%), for both', 'Arithmetic for wealth, geometric for the premium', 'Neither: use the median'], a: 1, why: '₹100 → ₹200 → ₹100: wealth did not grow, and only the geometric mean (0%) shows that. The course measures the premium as CAGR(Rm) − CAGR(Rf), which is why Marriott\'s MRP is 5.63%.' },
    { q: 'Firms A and B run identical businesses and have no debt. A holds 30% of its firm value in cash; B holds none. Whose regression beta is higher?', opts: ['A', 'B', 'Equal, because the businesses are identical', 'Cannot tell'], a: 1, why: 'Cash has a beta of about 0. A\'s equity is 70% business and 30% cash, so β<sub>A</sub> ≈ 0.7 × β<sub>business</sub>. Clean out cash before using a cash-rich comparable: β<sub>business</sub> = β<sub>U</sub> ÷ (1 − cash/V).' },
    { q: 'A Lodging project will be financed entirely by a 30-year mortgage at 10.05%. What is its hurdle rate?', opts: ['10.05%, the cost of the money used', '10.05% × (1 − 0.34) = 6.63%', 'The Lodging WACC (≈ 9.3%), which reflects the risk of hotel assets at the division\'s target leverage', 'The firm-wide WACC of 10.61%'], a: 2, why: 'Where the money comes from does not change how risky the hotel is. Borrowing against this project uses up the division\'s debt capacity, and equity must be raised elsewhere to keep target leverage. The hurdle is the cost of the <i>whole</i> capital mix that supports the asset.' },
    { q: 'Contract Services has no pure-play comparables, so its β<sub>U</sub> is backed out. The estimate (1.05) is most sensitive to:', opts: ['Errors in the Restaurant β<sub>U</sub> only', 'Errors in the Lodging β<sub>U</sub>, amplified by w<sub>Lodging</sub>/w<sub>CS</sub> ≈ 2.2', 'The risk-free rate', 'The target D/V of Contract Services'], a: 1, why: 'β<sub>U,CS</sub> = (β<sub>U,M</sub> − 0.61β<sub>U,L</sub> − 0.12β<sub>U,R</sub>)/0.27. An error of 0.1 in Lodging\'s beta moves CS\'s by 0.61/0.27 × 0.1 ≈ 0.22. (An error in Marriott\'s own β<sub>U</sub> is amplified even more, by 1/0.27 ≈ 3.7×, but that is not among the options.) Try it in the Marriott lab by removing La Quinta.' },
    { q: 'A promoter owns 45% of a listed company and never trades. Mutual funds and FPIs hold the rest and trade daily. Whose view of risk sets the cost of equity?', opts: ['The promoter\'s, as the largest shareholder', 'The diversified marginal investors who set the price on the next trade, for whom only systematic (beta) risk matters', 'The board\'s', 'The average retail investor\'s'], a: 1, why: 'Prices are set at the margin by investors who actually trade, and they are well diversified. That is why CAPM uses beta (systematic risk) and ignores firm-specific volatility.' },
    { q: 'With a fixed cost of debt and NO taxes, raising D/V from 40% to 60% will:', opts: ['Lower WACC, because debt is cheaper than equity', 'Leave WACC unchanged: equity becomes riskier and K<sub>e</sub> rises exactly enough to offset the cheaper debt', 'Raise WACC', 'Lower K<sub>e</sub>'], a: 1, why: 'This is Modigliani–Miller without taxes. In the WACC Machine, choose a fixed spread and set both the spread and the tax rate to 0: the WACC line is flat. With taxes it slopes down because of the tax shield; with rating-linked spreads it eventually turns up.' },
    { q: 'Within Restaurants, a new and unproven cuisine format is much riskier than the division average. Its hurdle rate should be:', opts: ['The Restaurant WACC, 11.30%', 'Above 11.30%: project risk exceeds division risk', 'The firm WACC, 10.61%', 'Below 11.30%, because it diversifies the division'], a: 1, why: 'Firm < division < project: the division rate is a starting point. When a project is clearly riskier (or safer) than its division, adjust the rate, ideally using a beta from businesses that resemble the project.' },
    { q: 'Each Marriott division adds its own spread (Lodging 1.10%, Restaurants 1.80%) even though Marriott borrows as one company. Why?', opts: ['Banks lend to each division separately in practice', 'Each division\'s assets support a different amount of debt at a different default risk; charging the right spread keeps every hurdle consistent with that division\'s own risk', 'To make the WACCs different', 'Because of different tax rates'], a: 1, why: 'Hotels are long-lived real estate that can back a lot of secured debt cheaply; restaurants cannot. The hurdle rate should use the debt capacity and credit risk of the assets being financed, not those of the whole firm.' },
    { q: 'In a market sell-off investors become more risk averse. What happens to the equilibrium market risk premium and to corporate hurdle rates?', opts: ['Both fall', 'MRP rises and hurdle rates rise, so fewer projects clear them', 'MRP rises but hurdle rates are unchanged', 'Nothing: the premium is a long-run constant'], a: 1, why: 'The premium is the wealth-weighted average of what investors demand per unit of risk. More risk aversion means a higher premium, a higher K<sub>e</sub> and WACC, and lower project values. Implied premiums jumped in March 2020 for exactly this reason.' },
    { q: 'Which risk-free rate should a 30-year hotel project use?', opts: ['The 1-year T-bill rate, because it is the most "risk-free"', 'A long-term (e.g. 30-year) government yield that matches the duration of the cash flows, with the premium measured over long bonds', 'The repo rate', 'Whichever is lowest'], a: 1, why: 'Match the maturity of the risk-free rate to the cash flows, and keep the premium consistent (premium over long bonds with a long-bond R<sub>f</sub>). That is why Marriott uses the 30-year 8.95% and the 5.63% premium over long-term governments.' }
  ];

  function renderConcepts(el) {
    const prog = h('div', { class: 'progressbar' }, h('div', { style: { width: '0%' } }));
    const lab = h('span', { class: 'muted' });
    const upd = () => { const q = Store.get('icf-quiz', {}); const n = QUIZ.filter((_, i) => q['s11-q' + i]).length; prog.firstChild.style.width = (n / QUIZ.length * 100) + '%'; lab.textContent = `${n} / ${QUIZ.length} answered correctly at least once`; };
    el.append(h('div', { class: 'card' }, h('div', { class: 'kicker' }, 'Concept checks'), h('h2', null, 'Do you understand why, not just how?'),
      h('p', { class: 'lede' }, 'Pick an answer to see the explanation. Wrong answers are explained too. These are the reasoning questions that separate a B from an A in the end-term.'),
      h('div', { class: 'row' }, h('div', { style: { flex: 1 } }, prog), lab)));
    const box = h('div', { class: 'grid g2' });
    QUIZ.forEach((q, i) => mcq(Object.assign({}, q, { q: `<span class="pill accent">Q${i + 1}</span> ${q.q}` }), box, 's11-q' + i, upd));
    el.append(box);
    upd();
  }

  /* =========================================================== PRACTICE */
  function renderPractice(el) {
    const all = window.S11_PROBLEMS;
    const prog = h('div', { class: 'progressbar' }, h('div', { style: { width: '0%' } }));
    const lab = h('span', { class: 'muted' });
    const upd = () => { const st = Store.get('icf-progress', {}); const n = all.filter(p => st[p.id] && st[p.id].solved).length; prog.firstChild.style.width = (n / all.length * 100) + '%'; lab.textContent = `${n} / ${all.length} solved`; };
    el.append(h('div', { class: 'card' }, h('div', { class: 'kicker' }, 'Exam-level practice'), h('h2', null, `${all.length} exam-level hard problems`),
      h('p', { class: 'lede', html: 'Each problem chains several steps, the way end-term questions do. Attempt first, then press <b>Check answers</b>. The step-by-step solution unlocks only after you have checked. Enter percentages as numbers (12.34 for 12.34%). Answers within ±0.10 percentage points, or ±1% for betas and amounts, count as correct, so rounding at intermediate steps is fine.' }),
      h('div', { class: 'row' }, h('div', { style: { flex: 1 } }, prog), lab),
      h('div', { class: 'tblwrap', style: { marginTop: '12px' }, html: '<table class="tbl"><tr><th>Problem</th><th>What it covers</th></tr>' + all.map(p => `<tr><td style="white-space:nowrap"><a href="#practice" data-prob="${p.id}">${p.code}</a></td><td style="text-align:left">${p.covers}</td></tr>`).join('') + '</table>' })));
    $$('a[data-prob]', el).forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = $('#prob-' + a.dataset.prob); t.classList.add('open'); t.scrollIntoView({ behavior: 'smooth' }); }));
    const sec = h('div', { style: { marginTop: '18px' } });
    all.forEach(p => problem(p, sec, upd));
    el.append(sec);
    upd();
  }

  window.S11 = { mount, TABS };
})();
