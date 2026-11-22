/* Session 11 — hard practice problems (original, exam level). Every number in a
   solution is computed from the problem data, so statements and answers cannot drift. */
(function () {
  'use strict';
  const { Fin, F } = ICF;
  const P = x => F.pct(x, 2), N = (x, d = 4) => F.n(x, d), C = (x, d = 2) => '₹' + F.big(x, d) + ' cr';

  // Rating table used inside the problems (stated in each problem that needs it).
  const PT = [[8.5, 'AAA', 0.006], [6.5, 'AA', 0.008], [5.5, 'A+', 0.010], [4.25, 'A', 0.011], [3, 'A−', 0.0125], [2.5, 'BBB', 0.016],
  [2.25, 'BB+', 0.020], [2, 'BB', 0.024], [1.75, 'B+', 0.030], [1.5, 'B', 0.036], [1.25, 'B−', 0.050], [0.8, 'CCC', 0.080], [-1e9, 'D', 0.120]];
  const ptHtml = () => '<details><summary>Rating table for this problem (interest coverage = EBIT ÷ interest)</summary><div class="tblwrap"><table class="tbl"><tr><th>Coverage ≥</th><th>Rating</th><th>Spread over R<sub>f</sub></th></tr>' +
    PT.map((r, i) => `<tr><td>${i === PT.length - 1 ? 'below 0.80' : r[0].toFixed(2) + (i ? ' and < ' + PT[i - 1][0].toFixed(2) : '')}</td><td>${r[1]}</td><td>${P(r[2])}</td></tr>`).join('') + '</table></div></details>';

  const tbl = (head, rows) => '<div class="tblwrap"><table class="tbl"><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</table></div>';

  const problems = [];

  /* ======================= TOPIC A: Cost of equity & cost of debt ======================= */

  problems.push({
    id: 's11-A1', code: 'A1', topic: 'A', marks: 6,
    title: 'Synthetic ratings: what happens to K<sub>d</sub> when you borrow more',
    data: { ebit: 1200, E: 12000, D: 3000, add: 2500, bl: 1.10, t: 0.25, rf: 0.065, mrp: 0.07 },
    story: d => `<p><b>Sajjangarh Resorts Ltd</b> is unrated. Its EBIT is a stable <b>₹${F.big(d.ebit)} cr</b> a year. Market value of equity is ₹${F.big(d.E)} cr and it has ₹${F.big(d.D)} cr of debt. Its regression (levered) beta is <b>${d.bl}</b>. R<sub>f</sub> = ${P(d.rf)}, market risk premium = ${P(d.mrp)}, tax rate = ${P(d.t)}.</p>
      <p>The CFO plans to borrow another <b>₹${F.big(d.add)} cr</b> and use all of it to buy back shares. Assume firm value is unchanged by the recapitalisation, and that after it <i>all</i> debt (old and new) is refinanced at the firm's new pre-tax cost of debt. The cost of debt is R<sub>f</sub> + the default spread for the firm's synthetic rating, where the rating depends on the interest coverage that the cost of debt itself produces. Find the rating by starting at the top of the table (AAA) and moving down until the rating you assume is the rating you get.</p>${ptHtml()}`,
    solve(d) {
      const now = Fin.synthKd(d.ebit, d.D, d.rf, PT), D2 = d.D + d.add, E2 = d.E - d.add;
      const nxt = Fin.synthKd(d.ebit, D2, d.rf, PT);
      const de = d.D / d.E, bu = Fin.unlever(d.bl, de, d.t), ke = Fin.capm(d.rf, d.bl, d.mrp), V = d.D + d.E;
      const w1 = Fin.wacc(d.E / V, ke, d.D / V, now.kd, d.t);
      const de2 = D2 / E2, bl2 = Fin.lever(bu, de2, d.t), ke2 = Fin.capm(d.rf, bl2, d.mrp);
      const w2 = Fin.wacc(E2 / V, ke2, D2 / V, nxt.kd, d.t);
      return { kd1: now.kd, w1, kd2: nxt.kd, w2, now, nxt, bu, ke, de2, bl2, ke2, D2, E2, V };
    },
    parts: [
      { key: 'kd1', label: '(a) Current pre-tax cost of debt', unit: '%' },
      { key: 'w1', label: '(b) Current WACC', unit: '%' },
      { key: 'kd2', label: '(c) Pre-tax cost of debt after the buyback', unit: '%' },
      { key: 'w2', label: '(d) WACC after the buyback', unit: '%' }],
    hints: ['Guess a rating, compute K<sub>d</sub> = R<sub>f</sub> + spread, then interest = D × K<sub>d</sub> and coverage = EBIT ÷ interest. If the coverage maps to a different rating, re-guess with that rating. Stop when the guess is self-consistent.',
      'For the new equity beta: unlever 1.10 at today\'s D/E, then relever at the post-buyback D/E.'],
    steps: (d, r) => [
      { t: 'Find today\'s self-consistent rating', html: 'Iterate (start from the top of the table):<br>' + r.now.path.map(p => `Try ${p.rating}: K<sub>d</sub> = ${P(p.kd)} → interest = ${F.big(d.D)} × ${P(p.kd)} = ₹${F.big(d.D * p.kd, 1)} cr → coverage = ${F.n(p.cov, 2)} → ${p.next}`).join('<br>') + `<br><b>Rating ${r.now.rating}, K<sub>d</sub> = ${P(r.kd1)}.</b>` },
      { t: 'Today\'s cost of equity', html: `The regression beta already reflects today's leverage, so K<sub>e</sub> = ${P(d.rf)} + ${d.bl} × ${P(d.mrp)} = <b>${P(r.ke)}</b>.` },
      { t: 'Today\'s WACC', html: `<div class="formula">WACC = ${F.n(d.E / r.V, 4)} × ${P(r.ke)} + ${F.n(d.D / r.V, 4)} × ${P(r.kd1)} × (1 − ${d.t}) = <b>${P(r.w1)}</b></div>` },
      { t: 'Re-rate the firm at ₹' + F.big(r.D2) + ' cr of debt', html: r.nxt.path.map(p => `Try ${p.rating}: K<sub>d</sub> = ${P(p.kd)} → interest ₹${F.big(r.D2 * p.kd, 1)} cr → coverage ${F.n(p.cov, 3)} → ${p.next}`).join('<br>') + `<br><b>New rating ${r.nxt.rating}, K<sub>d</sub> = ${P(r.kd2)}.</b> Each notch down raises interest, which lowers coverage again. That feedback is why heavily borrowed firms slide several notches at once.` },
      { t: 'Relever the beta', html: `β<sub>U</sub> = ${d.bl} ÷ [1 + ${F.n(d.D / d.E, 3)}(1 − ${d.t})] = ${N(r.bu)}.<br>New D/E = ${F.big(r.D2)}/${F.big(r.E2)} = ${F.n(r.de2, 4)} → β<sub>L</sub> = ${N(r.bu)} × [1 + ${F.n(r.de2, 4)} × ${1 - d.t}] = <b>${N(r.bl2)}</b><br>K<sub>e</sub> = ${P(d.rf)} + ${N(r.bl2)} × ${P(d.mrp)} = <b>${P(r.ke2)}</b>` },
      { t: 'New WACC', html: `<div class="formula">WACC = ${F.n(r.E2 / r.V, 4)} × ${P(r.ke2)} + ${F.n(r.D2 / r.V, 4)} × ${P(r.kd2)} × ${1 - d.t} = <b>${P(r.w2)}</b></div>WACC ${r.w2 > r.w1 ? 'rises' : 'falls'} by only ${F.n(Math.abs(r.w2 - r.w1) * 10000, 0)} bp. The firm took ${F.n((r.D2 - d.D) / r.V * 100, 0)}% of its value in new debt, yet the extra tax shield is mostly eaten by a spread that rose from ${P(r.kd1 - d.rf)} to ${P(r.kd2 - d.rf)} on <i>all</i> the debt, and by a higher equity beta.` }],
    takeaway: (d, r) => 'Cheap debt is not free. Each notch down the rating table raises the spread on every rupee already borrowed, so the benefit of extra debt shrinks quickly. Borrow a little more and WACC starts rising: open the <b>WACC Machine</b>, set the spread to follow the rating, and watch the U-shape appear.'
  });

  problems.push({
    id: 's11-A2', code: 'A2', topic: 'A', marks: 5,
    title: 'Coupon is not cost: K<sub>d</sub> from a traded bond',
    data: { c: 9, face: 100, n: 6, price: 102.4, Dface: 4000, E: 6000, bl: 0.9, rf: 0.063, mrp: 0.07, t: 0.2517 },
    story: d => `<p><b>Rana Power Ltd</b> has one bond issue outstanding, with face value <b>₹${F.big(d.Dface)} cr</b>. It pays a ${d.c}% annual coupon, has ${d.n} years left to maturity, and trades at <b>₹${d.price} per ₹100</b> of face value. The market value of equity is ₹${F.big(d.E)} cr and the regression beta is ${d.bl}. R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp)}, and the tax rate is ${P(d.t)} (the Indian new-regime rate).</p>`,
    solve(d) {
      const y = Fin.ytm(d.price, d.c, d.face, d.n), at = y * (1 - d.t), Dm = d.Dface * d.price / 100, V = Dm + d.E;
      const ke = Fin.capm(d.rf, d.bl, d.mrp), w = Fin.wacc(d.E / V, ke, Dm / V, y, d.t);
      const wWrong = Fin.wacc(d.E / (d.E + d.Dface), ke, d.Dface / (d.E + d.Dface), d.c / 100, d.t);
      return { y, at, dv: Dm / V, w, Dm, V, ke, wWrong };
    },
    parts: [
      { key: 'y', label: '(a) Pre-tax cost of debt (YTM)', unit: '%' },
      { key: 'at', label: '(b) After-tax cost of debt', unit: '%' },
      { key: 'dv', label: '(c) D/V using market values (as a decimal)', unit: 'x' },
      { key: 'w', label: '(d) WACC', unit: '%' }],
    hints: ['A bond trading above par has a YTM below its coupon. Solve 102.4 = Σ 9/(1+y)<sup>t</sup> + 100/(1+y)<sup>6</sup> by trial and error (or RATE in Excel).',
      'Market value of debt = ₹4,000 cr × 102.4/100.'],
    steps: (d, r) => [
      { t: 'YTM is the market\'s required return on the debt', html: `<div class="formula">${d.price} = Σ<sub>t=1..${d.n}</sub> ${d.c}/(1+y)<sup>t</sup> + 100/(1+y)<sup>${d.n}</sup> ⟹ y = <b>${P(r.y, 3)}</b></div>The ${d.c}% coupon was set when the bond was issued. Lenders today would accept ${P(r.y, 2)}, so that is the cost of debt.` },
      { t: 'After-tax cost', html: `${P(r.y, 3)} × (1 − ${d.t}) = <b>${P(r.at, 3)}</b>` },
      { t: 'Market-value weights', html: `D = ${F.big(d.Dface)} × ${d.price}/100 = ₹${F.big(r.Dm, 1)} cr; V = ${F.big(r.Dm, 1)} + ${F.big(d.E)} = ₹${F.big(r.V, 1)} cr; D/V = <b>${F.n(r.dv, 4)}</b>` },
      { t: 'Cost of equity and WACC', html: `K<sub>e</sub> = ${P(d.rf)} + ${d.bl} × ${P(d.mrp)} = ${P(r.ke)}<div class="formula">WACC = ${F.n(1 - r.dv, 4)} × ${P(r.ke)} + ${F.n(r.dv, 4)} × ${P(r.at, 3)} = <b>${P(r.w)}</b></div>Had you used the coupon rate and face value, you would get ${P(r.wWrong)}, which is wrong.` }],
    takeaway: () => 'The cost of debt is what lenders demand <i>today</i> (the YTM), not the historical coupon. Weights use market values for debt as well as equity.'
  });

  problems.push({
    id: 's11-A3', code: 'A3', topic: 'A', marks: 5,
    title: 'Geometric vs arithmetic risk premium, and what it does to value',
    data: { rm: [0.28, -0.08, 0.36, -0.12, 0.20], rfr: [0.07, 0.09, 0.06, 0.08, 0.07], b: 1.2, rf: 0.064, cf: 100, g: 0.05 },
    story: d => `<p>An analyst has five years of annual total returns on the Nifty 50 and on the 10-year G-sec:</p>` +
      tbl(['Year', '1', '2', '3', '4', '5'], [['Nifty 50', ...d.rm.map(x => P(x, 0))], ['10-yr G-sec', ...d.rfr.map(x => P(x, 0))]]) +
      `<p>She estimates the historical risk premium (HRP) as CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>), the method used in class. Her colleague uses the arithmetic averages instead. Today's 10-year yield is ${P(d.rf)}. <b>Gulab Foods</b> is all-equity with β = ${d.b} and expects a free cash flow of ₹${d.cf} cr next year, growing at ${P(d.g, 0)} forever.</p>`,
    solve(d) {
      const gm = Fin.cagr(d.rm) - Fin.cagr(d.rfr), am = Fin.mean(d.rm) - Fin.mean(d.rfr);
      const keg = Fin.capm(d.rf, d.b, gm), kea = Fin.capm(d.rf, d.b, am);
      const vg = d.cf / (keg - d.g), va = d.cf / (kea - d.g);
      return { gm, am, keg, vgap: vg - va, vg, va, kea, cm: Fin.cagr(d.rm), cf: Fin.cagr(d.rfr) };
    },
    parts: [
      { key: 'gm', label: '(a) Geometric HRP', unit: '%' },
      { key: 'am', label: '(b) Arithmetic HRP', unit: '%' },
      { key: 'keg', label: '(c) Cost of equity using the geometric HRP', unit: '%' },
      { key: 'vgap', label: '(d) Value(geometric) − Value(arithmetic) of Gulab Foods', unit: 'cr' }],
    hints: ['CAGR = [(1+r<sub>1</sub>)(1+r<sub>2</sub>)…(1+r<sub>5</sub>)]<sup>1/5</sup> − 1.', 'Value of a growing perpetuity = CF<sub>1</sub> / (K<sub>e</sub> − g).'],
    steps: (d, r) => [
      { t: 'Compound growth rates', html: `CAGR(Nifty) = [${d.rm.map(x => F.n(1 + x, 2)).join(' × ')}]<sup>1/5</sup> − 1 = ${P(r.cm, 3)}<br>CAGR(G-sec) = [${d.rfr.map(x => F.n(1 + x, 2)).join(' × ')}]<sup>1/5</sup> − 1 = ${P(r.cf, 3)}<br>Geometric HRP = <b>${P(r.gm, 3)}</b>` },
      { t: 'Arithmetic averages', html: `Mean(Nifty) = ${P(Fin.mean(d.rm), 2)}; Mean(G-sec) = ${P(Fin.mean(d.rfr), 2)}; Arithmetic HRP = <b>${P(r.am, 3)}</b>.<br>A volatile series always has an arithmetic mean above its CAGR. The gap is roughly half the variance.` },
      { t: 'Two costs of equity', html: `Geometric: ${P(d.rf)} + ${d.b} × ${P(r.gm, 3)} = <b>${P(r.keg, 3)}</b><br>Arithmetic: ${P(d.rf)} + ${d.b} × ${P(r.am, 3)} = ${P(r.kea, 3)}` },
      { t: 'Valuation gap', html: `V<sub>geo</sub> = ${d.cf}/(${P(r.keg, 3)} − ${P(d.g, 0)}) = ${C(r.vg)}; V<sub>arith</sub> = ${d.cf}/(${P(r.kea, 3)} − ${P(d.g, 0)}) = ${C(r.va)}<br>Difference = <b>${C(r.vgap)}</b>. A few hundred basis points of premium moves value by about ${F.n(r.vgap / r.va * 100, 0)}%.` }],
    takeaway: () => 'The 100%, −50% example from class: you end where you started, so the CAGR (0%) tells the truth and the arithmetic mean (25%) does not. Small changes in the premium move valuations a lot, because the premium is multiplied by β and sits in the denominator.'
  });

  problems.push({
    id: 's11-A4', code: 'A4', topic: 'A', marks: 5,
    title: 'Back out the market, then fix a stale beta',
    data: { b1: 1.3, e1: 0.156, b2: 0.8, e2: 0.121, bz: 1.15, deOld: 0.30, deNew: 0.80, t: 0.25 },
    story: d => `<p>Two fairly priced stocks lie on the security market line. <b>Pichola Ltd</b> has β = ${d.b1} and expected return ${P(d.e1, 1)}. <b>Fateh Ltd</b> has β = ${d.b2} and expected return ${P(d.e2, 1)}.</p>
      <p><b>Zawar Mines</b> has a regression beta of <b>${d.bz}</b>, estimated over a period when its D/E averaged <b>${d.deOld}</b>. Zawar has since borrowed heavily, and its D/E is now <b>${d.deNew}</b>. Tax rate = ${P(d.t, 0)}. Zawar's business mix has not changed.</p>`,
    solve(d) {
      const mrp = (d.e1 - d.e2) / (d.b1 - d.b2), rf = d.e1 - d.b1 * mrp;
      const bu = Fin.unlever(d.bz, d.deOld, d.t), bl = Fin.lever(bu, d.deNew, d.t), ke = Fin.capm(rf, bl, mrp);
      return { rf, mrp, bu, ke, bl, keStale: Fin.capm(rf, d.bz, mrp) };
    },
    parts: [
      { key: 'rf', label: '(a) Risk-free rate', unit: '%' },
      { key: 'mrp', label: '(b) Market risk premium', unit: '%' },
      { key: 'bu', label: '(c) Zawar\'s unlevered beta', unit: 'x' },
      { key: 'ke', label: '(d) Zawar\'s cost of equity today', unit: '%' }],
    hints: ['Two points define a line: the slope of the SML is the market risk premium.', 'A regression beta carries the leverage of the regression window. Unlever it at that D/E, not today\'s.'],
    steps: (d, r) => [
      { t: 'Slope of the SML', html: `MRP = (${P(d.e1, 1)} − ${P(d.e2, 1)}) ÷ (${d.b1} − ${d.b2}) = <b>${P(r.mrp)}</b>` },
      { t: 'Intercept', html: `R<sub>f</sub> = ${P(d.e1, 1)} − ${d.b1} × ${P(r.mrp)} = <b>${P(r.rf)}</b>` },
      { t: 'Strip out the old leverage', html: `β<sub>U</sub> = ${d.bz} ÷ [1 + ${d.deOld} × (1 − ${d.t})] = <b>${N(r.bu)}</b>` },
      { t: 'Put in today\'s leverage', html: `β<sub>L</sub> = ${N(r.bu)} × [1 + ${d.deNew} × ${1 - d.t}] = ${N(r.bl)}<br>K<sub>e</sub> = ${P(r.rf)} + ${N(r.bl)} × ${P(r.mrp)} = <b>${P(r.ke)}</b><br>Using the stale regression beta directly would give ${P(r.keStale)}, too low by ${F.n((r.ke - r.keStale) * 10000, 0)} bp.` }],
    takeaway: () => 'Regression betas describe the past capital structure. When leverage has changed, unlever at the regression-period D/E and relever at the current or target D/E. That is exactly what we did for Marriott (unlever at 0.70, relever at 1.50).'
  });

  /* ======================= TOPIC B: Leverage, unlevering, cash ======================= */

  problems.push({
    id: 's11-B1', code: 'B1', topic: 'B', marks: 6,
    title: 'The tax-rate detective',
    data: { de1: 0.4, b1: 1.56, de2: 0.7, b2: 1.83, rf: 0.065, mrp: 0.07, kd1: 0.08, kd3: 0.09, de3: 1.0 },
    story: d => `<p><b>Kesariya Textiles</b> has not changed its business in years, but its leverage has moved around. When its D/E was <b>${d.de1}</b>, its equity beta was <b>${d.b1}</b>. When D/E was <b>${d.de2}</b>, its equity beta was <b>${d.b2}</b>. Nobody remembers the tax rate, but it has not changed either.</p>
      <p>Today D/E is ${d.de1} and pre-tax K<sub>d</sub> = ${P(d.kd1, 0)}. The board is considering D/E = ${d.de3}, at which banks would charge ${P(d.kd3, 0)}. R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}. Use β<sub>L</sub> = β<sub>U</sub>[1 + (1 − t)D/E].</p>`,
    solve(d) {
      const ratio = d.b2 / d.b1; const x = (ratio - 1) / (d.de2 - ratio * d.de1); const t = 1 - x;
      const bu = d.b1 / (1 + d.de1 * x);
      const w0 = Fin.wacc(1 / (1 + d.de1), Fin.capm(d.rf, d.b1, d.mrp), d.de1 / (1 + d.de1), d.kd1, t);
      const bl3 = Fin.lever(bu, d.de3, t), ke3 = Fin.capm(d.rf, bl3, d.mrp), wE = 1 / (1 + d.de3), wD = 1 - wE;
      const w3 = Fin.wacc(wE, ke3, wD, d.kd3, t);
      const kdBE = (w0 - wE * ke3) / (wD * (1 - t));
      return { t, bu, w3, kdBE, w0, bl3, ke3, x };
    },
    parts: [
      { key: 't', label: '(a) Tax rate', unit: '%', tol: 0.002 },
      { key: 'bu', label: '(b) Unlevered beta', unit: 'x' },
      { key: 'w3', label: '(c) WACC at D/E = 1.0', unit: '%' },
      { key: 'kdBE', label: '(d) Highest pre-tax K<sub>d</sub> at D/E = 1.0 for which the move does not raise WACC', unit: '%' }],
    hints: ['Divide one beta equation by the other: β<sub>U</sub> cancels and you are left with one equation in (1 − t).', 'For (d), set WACC at D/E 1.0 equal to today\'s WACC and solve for K<sub>d</sub>.'],
    steps: (d, r) => [
      { t: 'Eliminate β<sub>U</sub>', html: `<div class="formula">${d.b2}/${d.b1} = [1 + ${d.de2}x] / [1 + ${d.de1}x], with x = 1 − t</div>${F.n(d.b2 / d.b1, 5)}(1 + ${d.de1}x) = 1 + ${d.de2}x ⟹ x = ${F.n(r.x, 4)} ⟹ <b>t = ${P(r.t)}</b>` },
      { t: 'Unlevered beta', html: `β<sub>U</sub> = ${d.b1} ÷ (1 + ${d.de1} × ${F.n(r.x, 4)}) = <b>${N(r.bu)}</b>. Check: ${N(r.bu)} × (1 + ${d.de2} × ${F.n(r.x, 4)}) = ${F.n(Fin.lever(r.bu, d.de2, r.t), 3)} ✓` },
      { t: 'WACC today (D/E = ' + d.de1 + ')', html: `D/V = ${F.n(d.de1 / (1 + d.de1), 4)}; K<sub>e</sub> = ${P(d.rf)} + ${d.b1} × ${P(d.mrp, 0)} = ${P(Fin.capm(d.rf, d.b1, d.mrp))}; WACC = ${P(r.w0)}` },
      { t: 'WACC at D/E = ' + d.de3, html: `β<sub>L</sub> = ${N(r.bu)} × (1 + ${F.n(r.x, 4)}) = ${N(r.bl3)}; K<sub>e</sub> = ${P(r.ke3)}<div class="formula">WACC = 0.5 × ${P(r.ke3)} + 0.5 × ${P(d.kd3, 0)} × ${F.n(r.x, 4)} = <b>${P(r.w3)}</b></div>` },
      { t: 'Break-even cost of debt', html: `${P(r.w0)} = 0.5 × ${P(r.ke3)} + 0.5 × K<sub>d</sub> × ${F.n(r.x, 4)} ⟹ <b>K<sub>d</sub> = ${P(r.kdBE)}</b>. If banks charge more than this, the extra leverage destroys value.` }],
    takeaway: () => 'Two observations of the same business at different leverage pin down both β<sub>U</sub> and the tax rate. The Hamada relation is a tool you can run backwards, not just a formula to memorise.'
  });

  problems.push({
    id: 's11-B2', code: 'B2', topic: 'B', marks: 5,
    title: 'Bottom-up beta with cash: an all-equity carmaker goes EV',
    data: { bComp: 1.20, deComp: 0.40, cashComp: 0.12, cashM: 0.06, deM: 0.25, t: 0.25, rf: 0.064, mrp: 0.072 },
    story: d => `<p><b>Mewar Motors</b> is all-equity today and holds cash equal to ${P(d.cashM, 0)} of its firm value. To fund an EV platform it will move to a target <b>D/E of ${d.deM}</b>, keeping its cash. Its own regression beta is unreliable because the business is changing, so the CFO uses a bottom-up beta from EV comparables:</p>` +
      tbl(['Comparables (average)', 'Value'], [['Regression (levered) beta', d.bComp], ['D/E', d.deComp], ['Cash ÷ firm value (D+E)', P(d.cashComp, 0)]]) +
      `<p>Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf, 1)}, MRP = ${P(d.mrp, 1)}. Treat cash as a zero-beta asset: β<sub>U, firm</sub> = β<sub>business</sub> × (1 − cash/V).</p>`,
    solve(d) {
      const buC = Fin.unlever(d.bComp, d.deComp, d.t), bBiz = buC / (1 - d.cashComp);
      const buM = bBiz * (1 - d.cashM), blM = Fin.lever(buM, d.deM, d.t), ke = Fin.capm(d.rf, blM, d.mrp);
      const blNoCash = Fin.lever(bBiz, d.deM, d.t), keNoCash = Fin.capm(d.rf, blNoCash, d.mrp);
      return { bBiz, blM, ke, keNoCash, buC, buM, blNoCash };
    },
    parts: [
      { key: 'bBiz', label: '(a) Pure business (operating-asset) beta of EV makers', unit: 'x' },
      { key: 'blM', label: '(b) Mewar\'s levered beta at target D/E', unit: 'x' },
      { key: 'ke', label: '(c) Mewar\'s cost of equity', unit: '%' },
      { key: 'keNoCash', label: '(d) Cost of equity if Mewar pays out all its cash as a special dividend (same D/E)', unit: '%' }],
    hints: ['Order matters: first remove leverage (unlever), then remove cash (divide by 1 − cash/V). Going back, add Mewar\'s cash, then Mewar\'s leverage.'],
    steps: (d, r) => [
      { t: 'Remove the comparables\' leverage', html: `β<sub>U</sub> (incl. cash) = ${d.bComp} ÷ [1 + ${d.deComp} × ${1 - d.t}] = ${N(r.buC)}` },
      { t: 'Remove the comparables\' cash', html: `Cash has a beta of 0, so it drags the measured beta down. β<sub>business</sub> = ${N(r.buC)} ÷ (1 − ${d.cashComp}) = <b>${N(r.bBiz)}</b>` },
      { t: 'Add Mewar\'s cash, then Mewar\'s leverage', html: `β<sub>U, Mewar</sub> = ${N(r.bBiz)} × (1 − ${d.cashM}) = ${N(r.buM)}<br>β<sub>L</sub> = ${N(r.buM)} × [1 + ${d.deM} × ${1 - d.t}] = <b>${N(r.blM)}</b>` },
      { t: 'Cost of equity', html: `K<sub>e</sub> = ${P(d.rf, 1)} + ${N(r.blM)} × ${P(d.mrp, 1)} = <b>${P(r.ke)}</b>` },
      { t: 'Pay out the cash', html: `With no cash, β<sub>U</sub> = β<sub>business</sub> = ${N(r.bBiz)}; β<sub>L</sub> = ${N(r.blNoCash)}; K<sub>e</sub> = <b>${P(r.keNoCash)}</b>. Equity holders are left holding only the risky business, so they demand more.` }],
    takeaway: () => 'Cash-rich comparables (common in Indian IT and autos) make the business look safer than it is. Clean out both leverage <i>and</i> cash before borrowing a comparable\'s beta. This is the 2025 mid-term Maruti question in a new setting.'
  });

  problems.push({
    id: 's11-B3', code: 'B3', topic: 'B', marks: 6,
    title: 'Merger of unequals: whose hurdle rate?',
    data: { EA: 6000, DA: 2000, bA: 1.3, EB: 3000, DB: 3000, bB: 2.4, t: 0.25, rf: 0.065, mrp: 0.07, kd: 0.085 },
    story: d => `<p><b>Aravali Cables</b> (A) and <b>Bhilwara Data Centres</b> (B) merge in an all-stock deal. The combined firm takes on both firms' debt, and no value is created or destroyed.</p>` +
      tbl(['', 'Equity (₹ cr)', 'Debt (₹ cr)', 'Equity beta'], [['A: Cables', F.big(d.EA), F.big(d.DA), d.bA], ['B: Data centres', F.big(d.EB), F.big(d.DB), d.bB]]) +
      `<p>Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}. The merged firm borrows at ${P(d.kd)} and keeps the combined D/V.</p>`,
    solve(d) {
      const VA = d.EA + d.DA, VB = d.EB + d.DB, V = VA + VB, D = d.DA + d.DB, E = d.EA + d.EB;
      const buA = Fin.unlever(d.bA, d.DA / d.EA, d.t), buB = Fin.unlever(d.bB, d.DB / d.EB, d.t);
      const bu = (VA * buA + VB * buB) / V, bl = Fin.lever(bu, D / E, d.t), ke = Fin.capm(d.rf, bl, d.mrp);
      const w = Fin.wacc(E / V, ke, D / V, d.kd, d.t);
      const blB = Fin.lever(buB, D / E, d.t), keB = Fin.capm(d.rf, blB, d.mrp), wB = Fin.wacc(E / V, keB, D / V, d.kd, d.t);
      return { bu, bl, w, wB, buA, buB, VA, VB, V, D, E, ke, blB, keB };
    },
    parts: [
      { key: 'bu', label: '(a) Unlevered beta of the merged firm', unit: 'x' },
      { key: 'bl', label: '(b) Equity beta of the merged firm', unit: 'x' },
      { key: 'w', label: '(c) Firm-wide WACC of the merged firm', unit: '%' },
      { key: 'wB', label: '(d) Hurdle rate for a new data-centre project, financed at the group\'s D/V', unit: '%' }],
    hints: ['Unlevered betas average by <i>firm value</i> (D + E), not by equity.', 'For (d), use the data-centre business\'s β<sub>U</sub> relevered at the group\'s D/E. The project\'s risk does not change because it now sits inside a group with a cables business.'],
    steps: (d, r) => [
      { t: 'Unlever each firm', html: `β<sub>U,A</sub> = ${d.bA} ÷ [1 + ${F.n(d.DA / d.EA, 4)} × ${1 - d.t}] = ${N(r.buA)}<br>β<sub>U,B</sub> = ${d.bB} ÷ [1 + ${F.n(d.DB / d.EB, 4)} × ${1 - d.t}] = ${N(r.buB)}` },
      { t: 'Value-weight the asset betas', html: `β<sub>U</sub> = (${F.big(r.VA)} × ${N(r.buA)} + ${F.big(r.VB)} × ${N(r.buB)}) ÷ ${F.big(r.V)} = <b>${N(r.bu)}</b>` },
      { t: 'Relever at the merged D/E', html: `D/E = ${F.big(r.D)}/${F.big(r.E)} = ${F.n(r.D / r.E, 4)} → β<sub>L</sub> = <b>${N(r.bl)}</b>; K<sub>e</sub> = ${P(r.ke)}` },
      { t: 'Firm-wide WACC', html: `<div class="formula">WACC = ${F.n(r.E / r.V, 4)} × ${P(r.ke)} + ${F.n(r.D / r.V, 4)} × ${P(d.kd)} × ${1 - d.t} = <b>${P(r.w)}</b></div>` },
      { t: 'Divisional hurdle for data centres', html: `β<sub>L,DC</sub> = ${N(r.buB)} × [1 + ${F.n(r.D / r.E, 4)} × ${1 - d.t}] = ${N(r.blB)} → K<sub>e</sub> = ${P(r.keB)}<div class="formula">Hurdle = ${F.n(r.E / r.V, 4)} × ${P(r.keB)} + ${F.n(r.D / r.V, 4)} × ${P(d.kd)} × ${1 - d.t} = <b>${P(r.wB)}</b></div>Using the firm-wide ${P(r.w)} would subsidise data-centre projects by ${F.n((r.wB - r.w) * 10000, 0)} bp, the Marriott Contract Services mistake.` }],
    takeaway: () => 'Merging does not average away a project\'s risk. Firm-wide WACC is a value-weighted blend of divisional hurdles, and it is the right rate for <i>none</i> of them.'
  });

  /* ======================= TOPIC C: Divisional & project hurdle rates ======================= */

  problems.push({
    id: 's11-C1', code: 'C1', topic: 'C', marks: 8,
    title: 'Marriott in Rajasthan: back out the division with no comparables',
    data: {
      E: 18000, D: 9000, bl: 1.30, t: 0.25, rf: 0.065, mrp: 0.07,
      w: { H: 0.5, Q: 0.3, F: 0.2 }, comp: { H: { b: 1.35, dv: 0.40 }, Q: { b: 0.95, dv: 0.20 } },
      tgt: { H: { dv: 0.55, s: 0.015 }, Q: { dv: 0.25, s: 0.012 }, F: { dv: 0.30, s: 0.020 } }
    },
    story: d => `<p><b>Aravalli Group</b> runs three divisions: Hotels, Quick-Service Restaurants (QSR) and Facility Services. Its equity is worth ₹${F.big(d.E)} cr, its debt ₹${F.big(d.D)} cr, and its regression beta is <b>${d.bl}</b>. Using identifiable assets, Hotels, QSR and Facility Services make up ${d.w.H * 100}%, ${d.w.Q * 100}% and ${d.w.F * 100}% of firm value. There are no listed pure-play facility-services firms in India.</p>` +
      tbl(['', 'Comparables β<sub>L</sub> (avg)', 'Comparables D/V (avg)', 'Target D/V', 'Debt spread'], [
        ['Hotels', d.comp.H.b, P(d.comp.H.dv, 0), P(d.tgt.H.dv, 0), P(d.tgt.H.s, 1)],
        ['QSR', d.comp.Q.b, P(d.comp.Q.dv, 0), P(d.tgt.Q.dv, 0), P(d.tgt.Q.s, 1)],
        ['Facility Services', '–', '–', P(d.tgt.F.dv, 0), P(d.tgt.F.s, 1)]]) +
      `<p>Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}.</p>`,
    solve(d) {
      const bu = Fin.unlever(d.bl, d.D / d.E, d.t);
      const buH = Fin.unlever(d.comp.H.b, Fin.deFromDv(d.comp.H.dv), d.t), buQ = Fin.unlever(d.comp.Q.b, Fin.deFromDv(d.comp.Q.dv), d.t);
      const buF = (bu - d.w.H * buH - d.w.Q * buQ) / d.w.F;
      const div = (b, tg) => { const de = Fin.deFromDv(tg.dv), blv = Fin.lever(b, de, d.t), ke = Fin.capm(d.rf, blv, d.mrp), kd = d.rf + tg.s; return { de, blv, ke, kd, w: Fin.wacc(1 - tg.dv, ke, tg.dv, kd, d.t) }; };
      const H = div(buH, d.tgt.H), Q = div(buQ, d.tgt.Q), Fs = div(buF, d.tgt.F);
      return { bu, buF, wH: H.w, wF: Fs.w, buH, buQ, H, Q, Fs };
    },
    parts: [
      { key: 'bu', label: '(a) Aravalli\'s unlevered beta', unit: 'x' },
      { key: 'buF', label: '(b) Unlevered beta of Facility Services', unit: 'x' },
      { key: 'wH', label: '(c) Hurdle rate (WACC) for Hotels', unit: '%' },
      { key: 'wF', label: '(d) Hurdle rate (WACC) for Facility Services', unit: '%' }],
    hints: ['The comparables report D/V. Convert to D/E = (D/V)/(1 − D/V) before unlevering.', 'The firm\'s β<sub>U</sub> is the asset-weighted average of the three divisional β<sub>U</sub>s. Two are known, so solve for the third.'],
    steps: (d, r) => [
      { t: 'Firm unlevered beta', html: `D/E = ${F.big(d.D)}/${F.big(d.E)} = ${F.n(d.D / d.E, 3)}; β<sub>U</sub> = ${d.bl} ÷ (1 + ${F.n(d.D / d.E, 3)} × ${1 - d.t}) = <b>${N(r.bu)}</b>` },
      { t: 'Divisions with comparables', html: `Hotels: D/E = ${d.comp.H.dv}/${F.n(1 - d.comp.H.dv, 2)} = ${F.n(Fin.deFromDv(d.comp.H.dv), 4)}, β<sub>U</sub> = ${d.comp.H.b} ÷ (1 + ${F.n(Fin.deFromDv(d.comp.H.dv), 4)} × ${1 - d.t}) = ${N(r.buH)}<br>QSR: D/E = ${F.n(Fin.deFromDv(d.comp.Q.dv), 4)}, β<sub>U</sub> = ${N(r.buQ)}` },
      { t: 'Back out Facility Services', html: `<div class="formula">${N(r.bu)} = ${d.w.H} × ${N(r.buH)} + ${d.w.Q} × ${N(r.buQ)} + ${d.w.F} × β<sub>U,FS</sub> ⟹ β<sub>U,FS</sub> = <b>${N(r.buF)}</b></div>Any error in the other two estimates lands, multiplied by 1/${d.w.F} = ${F.n(1 / d.w.F, 0)}×, on this division. Marriott's Contract Services beta had the same weakness.` },
      { t: 'Hotels hurdle', html: `Target D/E = ${F.n(r.H.de, 4)} → β<sub>L</sub> = ${N(r.H.blv)} → K<sub>e</sub> = ${P(r.H.ke)}; K<sub>d</sub> = ${P(r.H.kd)}<div class="formula">WACC = ${F.n(1 - d.tgt.H.dv, 2)} × ${P(r.H.ke)} + ${d.tgt.H.dv} × ${P(r.H.kd)} × ${1 - d.t} = <b>${P(r.wH)}</b></div>` },
      { t: 'Facility Services hurdle', html: `Target D/E = ${F.n(r.Fs.de, 4)} → β<sub>L</sub> = ${N(r.Fs.blv)} → K<sub>e</sub> = ${P(r.Fs.ke)}; K<sub>d</sub> = ${P(r.Fs.kd)}<div class="formula">WACC = ${F.n(1 - d.tgt.F.dv, 2)} × ${P(r.Fs.ke)} + ${d.tgt.F.dv} × ${P(r.Fs.kd)} × ${1 - d.t} = <b>${P(r.wF)}</b></div>For comparison, QSR's hurdle is ${P(r.Q.w)}.` }],
    takeaway: () => 'This is the Marriott recipe end to end: unlever the parent, unlever the comparables, back out the orphan division, then relever each division at <i>its own</i> target leverage and add <i>its own</i> spread.'
  });

  problems.push({
    id: 's11-C2', code: 'C2', topic: 'C', marks: 6,
    title: 'One hurdle rate for everyone: count the damage',
    data: { firm: 0.125, hF: 0.1475, hQ: 0.1125, X: { c0: -500, c: 127, n: 6 }, Y: { c0: -400, c: 97, n: 6 } },
    story: d => `<p>Aravalli Group (from C1) evaluates every project at its firm-wide WACC of <b>${P(d.firm)}</b>. Its divisional hurdle rates are <b>${P(d.hF)}</b> for Facility Services and <b>${P(d.hQ)}</b> for QSR. Two proposals reach the investment committee:</p>` +
      tbl(['Project (₹ cr)', 't = 0', 'Years 1–6 (each)'], [['X: hospital facility-management contract (Facility Services)', d.X.c0, '+' + d.X.c], ['Y: 40 new QSR outlets in tier-2 cities (QSR)', d.Y.c0, '+' + d.Y.c]]),
    solve(d) {
      const cf = p => [p.c0, ...Array(p.n).fill(p.c)];
      const irrX = Fin.irr(cf(d.X)), irrY = Fin.irr(cf(d.Y));
      const nXf = Fin.pv(cf(d.X), d.firm), nXd = Fin.pv(cf(d.X), d.hF), nYf = Fin.pv(cf(d.Y), d.firm), nYd = Fin.pv(cf(d.Y), d.hQ);
      const loss = (nXf > 0 && nXd < 0 ? -nXd : 0) + (nYf < 0 && nYd > 0 ? nYd : 0);
      return { irrX, nXd, nYd, loss, irrY, nXf, nYf };
    },
    parts: [
      { key: 'irrX', label: '(a) IRR of project X', unit: '%' },
      { key: 'nXd', label: '(b) NPV of X at its divisional hurdle', unit: 'cr' },
      { key: 'nYd', label: '(c) NPV of Y at its divisional hurdle', unit: 'cr' },
      { key: 'loss', label: '(d) Total value lost by using the firm-wide WACC rule (a positive number)', unit: 'cr' }],
    hints: ['NPV = C<sub>0</sub> + C × annuity factor(n, r).', 'Under the firm-wide rule, which project is accepted and which rejected? Value lost = the negative NPV you accept plus the positive NPV you give up, both measured at the correct (divisional) rates.'],
    steps: (d, r) => [
      { t: 'IRRs', html: `X: 500 = 127 × AF(6, IRR) ⟹ IRR<sub>X</sub> = <b>${P(r.irrX)}</b>. Y: IRR<sub>Y</sub> = ${P(r.irrY)}.` },
      { t: 'What the firm-wide rule does', html: `At ${P(d.firm)}: NPV<sub>X</sub> = ${C(r.nXf)} → <b>accept X</b>; NPV<sub>Y</sub> = ${C(r.nYf)} → <b>reject Y</b>.` },
      { t: 'What the right rates say', html: `NPV<sub>X</sub> at ${P(d.hF)} = <b>${C(r.nXd)}</b> → X should be rejected. Its IRR ${P(r.irrX)} is below its division's hurdle.<br>NPV<sub>Y</sub> at ${P(d.hQ)} = <b>${C(r.nYd)}</b> → Y should be accepted.` },
      { t: 'Value destroyed', html: `Accepting X costs ${C(-r.nXd)}; rejecting Y gives up ${C(r.nYd)}. Total = <b>${C(r.loss)}</b>. The firm grows in its riskiest division and shrinks in its safest, and over time its own WACC rises.` }],
    takeaway: () => 'A single hurdle rate systematically <b>over-invests in risky divisions and under-invests in safe ones</b>. Look at the <b>Hurdle Rates</b> tab: these two projects sit in the two shaded wedges.'
  });

  problems.push({
    id: 's11-C3', code: 'C3', topic: 'C', marks: 7,
    title: 'Demerger: what happens to the parent\'s beta?',
    data: { E: 40000, D: 10000, bl: 0.95, t: 0.25, Vh: 12000, buH: 1.3, Dh: 3000, rf: 0.065, mrp: 0.07 },
    story: d => `<p><b>Kumbhalgarh Industries</b> owns a cement business and a hotels business. Equity is worth ₹${F.big(d.E)} cr, debt is ₹${F.big(d.D)} cr, and the equity beta is <b>${d.bl}</b>. The hotels business is worth <b>₹${F.big(d.Vh)} cr</b>, and listed hotel chains suggest an unlevered beta of <b>${d.buH}</b> for it.</p>
      <p>The board demerges the hotels into a separately listed company that takes <b>₹${F.big(d.Dh)} cr</b> of the debt. The cement company keeps the rest. No value is created or lost. Tax = ${P(d.t, 0)}; there is no cash.</p>`,
    solve(d) {
      const V = d.E + d.D, bu = Fin.unlever(d.bl, d.D / d.E, d.t), wH = d.Vh / V;
      const buC = (bu - wH * d.buH) / (1 - wH);
      const Vc = V - d.Vh, Dc = d.D - d.Dh, Ec = Vc - Dc, Eh = d.Vh - d.Dh;
      const blC = Fin.lever(buC, Dc / Ec, d.t), blH = Fin.lever(d.buH, d.Dh / Eh, d.t);
      return { bu, buC, blC, blH, V, wH, Vc, Dc, Ec, Eh };
    },
    parts: [
      { key: 'bu', label: '(a) Unlevered beta of Kumbhalgarh before the demerger', unit: 'x' },
      { key: 'buC', label: '(b) Unlevered beta of the cement business', unit: 'x' },
      { key: 'blC', label: '(c) Equity beta of the cement company after the demerger', unit: 'x' },
      { key: 'blH', label: '(d) Equity beta of the new hotels company', unit: 'x' }],
    hints: ['Hotels are ₹12,000 cr out of ₹50,000 cr of firm value.', 'After the split each company has its own D and E. Cement keeps ₹7,000 cr of debt, and its equity is its value minus that debt.'],
    steps: (d, r) => [
      { t: 'Pre-demerger asset beta', html: `β<sub>U</sub> = ${d.bl} ÷ [1 + ${F.n(d.D / d.E, 3)} × ${1 - d.t}] = <b>${N(r.bu)}</b>` },
      { t: 'Back out cement', html: `Hotels weight = ${F.big(d.Vh)}/${F.big(r.V)} = ${F.n(r.wH, 2)}<div class="formula">${N(r.bu)} = ${F.n(r.wH, 2)} × ${d.buH} + ${F.n(1 - r.wH, 2)} × β<sub>U,cement</sub> ⟹ β<sub>U,cement</sub> = <b>${N(r.buC)}</b></div>` },
      { t: 'Cement after the split', html: `V = ${F.big(r.Vc)}, D = ${F.big(r.Dc)}, E = ${F.big(r.Ec)} → D/E = ${F.n(r.Dc / r.Ec, 4)}<br>β<sub>L</sub> = ${N(r.buC)} × [1 + ${F.n(r.Dc / r.Ec, 4)} × ${1 - d.t}] = <b>${N(r.blC)}</b>` },
      { t: 'The new hotels company', html: `D = ${F.big(d.Dh)}, E = ${F.big(r.Eh)} → D/E = ${F.n(d.Dh / r.Eh, 4)}; β<sub>L</sub> = ${d.buH} × [1 + ${F.n(d.Dh / r.Eh, 4)} × ${1 - d.t}] = <b>${N(r.blH)}</b><br>Shareholders who held the conglomerate now hold a low-beta cement stock and a high-beta hotel stock. Together their risk is unchanged, but each company can now be valued at its own discount rate.` }],
    takeaway: () => 'In January 2025 ITC demerged ITC Hotels in the same way. A demerger does not change total risk. It reveals the separate risks so that each business gets its own hurdle rate, as Marriott did in 1993.'
  });

  problems.push({
    id: 's11-C4', code: 'C4', topic: 'C', marks: 6,
    title: 'Debt-funded acquisition: the acquirer\'s beta jumps',
    data: { E: 8000, D: 2000, bl: 0.85, t: 0.25, price: 3000, buT: 1.6, rf: 0.065, mrp: 0.07, kd: 0.09 },
    story: d => `<p><b>Jaisalmer Foods</b> (packaged snacks) has equity of ₹${F.big(d.E)} cr, debt of ₹${F.big(d.D)} cr and an equity beta of <b>${d.bl}</b>. It is buying a cloud-kitchen start-up for <b>₹${F.big(d.price)} cr</b> (a fair price, so NPV = 0), funded <b>entirely with new debt</b>. Cloud-kitchen comparables have an unlevered beta of <b>${d.buT}</b>. Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}. After the deal, Jaisalmer can borrow at ${P(d.kd, 0)}.</p>`,
    solve(d) {
      const V0 = d.E + d.D, bu0 = Fin.unlever(d.bl, d.D / d.E, d.t), V1 = V0 + d.price, D1 = d.D + d.price, E1 = d.E;
      const bu1 = (V0 * bu0 + d.price * d.buT) / V1, bl1 = Fin.lever(bu1, D1 / E1, d.t), ke1 = Fin.capm(d.rf, bl1, d.mrp);
      const blK = Fin.lever(d.buT, D1 / E1, d.t), keK = Fin.capm(d.rf, blK, d.mrp), wK = Fin.wacc(E1 / V1, keK, D1 / V1, d.kd, d.t);
      return { bu0, bu1, bl1, ke1, wK, V1, D1, E1, blK, keK };
    },
    parts: [
      { key: 'bu0', label: '(a) Jaisalmer\'s unlevered beta before the deal', unit: 'x' },
      { key: 'bu1', label: '(b) Unlevered beta after the deal', unit: 'x' },
      { key: 'bl1', label: '(c) Equity beta after the deal', unit: 'x' },
      { key: 'wK', label: '(d) Hurdle rate for future cloud-kitchen expansion, at the group\'s new D/V', unit: '%' }],
    hints: ['A debt-funded purchase leaves equity unchanged but adds ₹3,000 cr to both debt and firm value.', 'Two things push the equity beta up at once: a riskier asset mix and more leverage.'],
    steps: (d, r) => [
      { t: 'Before', html: `β<sub>U,0</sub> = ${d.bl} ÷ [1 + ${F.n(d.D / d.E, 3)} × ${1 - d.t}] = <b>${N(r.bu0)}</b>` },
      { t: 'New asset mix', html: `V = ${F.big(d.E + d.D)} + ${F.big(d.price)} = ${F.big(r.V1)}<div class="formula">β<sub>U,1</sub> = (${F.big(d.E + d.D)} × ${N(r.bu0)} + ${F.big(d.price)} × ${d.buT}) ÷ ${F.big(r.V1)} = <b>${N(r.bu1)}</b></div>` },
      { t: 'New leverage', html: `D = ${F.big(r.D1)}, E = ${F.big(r.E1)} (unchanged) → D/E = ${F.n(r.D1 / r.E1, 4)}<br>β<sub>L,1</sub> = ${N(r.bu1)} × [1 + ${F.n(r.D1 / r.E1, 4)} × ${1 - d.t}] = <b>${N(r.bl1)}</b> (up from ${d.bl}). K<sub>e</sub> rises to ${P(r.ke1)}.` },
      { t: 'Cloud-kitchen hurdle', html: `β<sub>L</sub> = ${d.buT} × [1 + ${F.n(r.D1 / r.E1, 4)} × ${1 - d.t}] = ${N(r.blK)} → K<sub>e</sub> = ${P(r.keK)}<div class="formula">Hurdle = ${F.n(r.E1 / r.V1, 4)} × ${P(r.keK)} + ${F.n(r.D1 / r.V1, 4)} × ${P(d.kd, 0)} × ${1 - d.t} = <b>${P(r.wK)}</b></div>The cheap 9% loan does <i>not</i> make the cloud-kitchen business a 9% (or 6.75%) business.` }],
    takeaway: () => 'The source of finance does not set the hurdle rate; the risk of the asset does. "We are funding it with a 9% loan, so the hurdle is 9%" is the most common wrong answer in exams and in boardrooms.'
  });

  window.S11_PROBLEMS = problems;
  window.S11_PT = PT;
  window.S11_TOPICS = {
    A: { name: 'Cost of equity & cost of debt', blurb: 'CAPM inputs, YTM vs coupon, synthetic ratings, historical risk premium.' },
    B: { name: 'Leverage, unlevering & cash', blurb: 'Hamada both ways, bottom-up betas, cash adjustment, mergers.' },
    C: { name: 'Divisional & project hurdle rates', blurb: 'Marriott-style back-outs, the wrong-hurdle trap, demergers, acquisitions.' }
  };
})();
