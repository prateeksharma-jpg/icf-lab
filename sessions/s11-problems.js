/* Session 11 — five hard practice problems (original, exam level). Together they cover every
   major step of the session. Every number in a solution is computed from the problem data. */
(function () {
  'use strict';
  const { Fin, F } = ICF;
  const P = x => F.pct(x, 2), N = (x, d = 4) => F.n(x, d), C = (x, d = 2) => (x < 0 ? '−₹' : '₹') + F.big(Math.abs(x), d) + ' cr';

  // Rating table used inside the problems (stated in each problem that needs it).
  const PT = [[8.5, 'AAA', 0.006], [6.5, 'AA', 0.008], [5.5, 'A+', 0.010], [4.25, 'A', 0.011], [3, 'A−', 0.0125], [2.5, 'BBB', 0.016],
  [2.25, 'BB+', 0.020], [2, 'BB', 0.024], [1.75, 'B+', 0.030], [1.5, 'B', 0.036], [1.25, 'B−', 0.050], [0.8, 'CCC', 0.080], [-1e9, 'D', 0.120]];
  const ptHtml = () => '<details><summary>Rating table for this case (interest coverage = EBIT ÷ interest)</summary><div class="tblwrap"><table class="tbl"><tr><th>Coverage ≥</th><th>Rating</th><th>Spread over R<sub>f</sub></th></tr>' +
    PT.map((r, i) => `<tr><td>${i === PT.length - 1 ? 'below 0.80' : r[0].toFixed(2) + (i ? ' and < ' + PT[i - 1][0].toFixed(2) : '')}</td><td>${r[1]}</td><td>${P(r[2])}</td></tr>`).join('') + '</table></div></details>';
  const tbl = (head, rows) => '<div class="tblwrap"><table class="tbl"><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</table></div>';

  const problems = [];

  /* ---------------- P1: build a WACC from raw market data ---------------- */
  problems.push({
    id: 's11-P1', code: 'Case 3', level: 'Hard', marks: 8,
    title: 'Build a WACC from raw market data',
    covers: 'Historical risk premium (CAGR) · YTM as K<sub>d</sub> · relevering a stale beta · market-value weights',
    data: {
      rm: [0.27, -0.07, 0.36, 0.04, 0.24, 0.02], rfr: [0.07, 0.08, 0.06, 0.09, 0.07, 0.07], rf: 0.0734,
      c: 9, face: 100, n: 3, price: 101.35, Dface: 4000, E: 6000, bl: 0.9, deOld: 0.30, t: 0.2517
    },
    story: d => `<p><b>Rana Power Ltd</b> wants its WACC. You have the following.</p>
      <p><b>Market returns.</b> Six years of annual total returns on the Nifty 50 and on 10-year G-secs:</p>` +
      tbl(['Year', '1', '2', '3', '4', '5', '6'], [['Nifty 50', ...d.rm.map(x => P(x, 0))], ['10-yr G-sec', ...d.rfr.map(x => P(x, 0))]]) +
      `<p>Estimate the market risk premium as CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>), as in class. Today's 10-year G-sec yield is <b>${P(d.rf)}</b>.</p>
      <p><b>Debt.</b> Rana's only debt is a bond issue with face value <b>₹${F.big(d.Dface)} cr</b>, a ${d.c}% annual coupon and ${d.n} years to maturity, trading at <b>₹${d.price} per ₹100</b> of face value.</p>
      <p><b>Equity.</b> Market value of equity is ₹${F.big(d.E)} cr. Rana's regression beta is <b>${d.bl}</b>, estimated over a period when its market D/E averaged <b>${d.deOld}</b>; the business has not changed since. Tax rate = ${P(d.t)}.</p>
      <p>Use market values for today's D/E and for the WACC weights.</p>`,
    solve(d) {
      const cm = Fin.cagr(d.rm), cf = Fin.cagr(d.rfr), hrp = cm - cf, hrpA = Fin.mean(d.rm) - Fin.mean(d.rfr);
      const y = Fin.ytm(d.price, d.c, d.face, d.n), Dm = d.Dface * d.price / 100, V = Dm + d.E, de = Dm / d.E;
      const bu = Fin.unlever(d.bl, d.deOld, d.t), bl = Fin.lever(bu, de, d.t), ke = Fin.capm(d.rf, bl, hrp);
      const w = Fin.wacc(d.E / V, ke, Dm / V, y, d.t);
      // each shortcut on its own, everything else correct
      const sc = {
        coupon: Fin.wacc(d.E / V, ke, Dm / V, d.c / 100, d.t),
        face: (() => { const Vf = d.E + d.Dface, blf = Fin.lever(bu, d.Dface / d.E, d.t); return Fin.wacc(d.E / Vf, Fin.capm(d.rf, blf, hrp), d.Dface / Vf, y, d.t); })(),
        stale: Fin.wacc(d.E / V, Fin.capm(d.rf, d.bl, hrp), Dm / V, y, d.t),
        arith: Fin.wacc(d.E / V, Fin.capm(d.rf, bl, hrpA), Dm / V, y, d.t)
      };
      return { hrp, y, bl, w, dv: Dm / V, cm, cf, hrpA, Dm, V, de, bu, ke, sc };
    },
    parts: [
      { key: 'hrp', label: '(a) Market risk premium (geometric)', unit: '%' },
      { key: 'y', label: '(b) Pre-tax cost of debt', unit: '%' },
      { key: 'dv', label: '(c) Debt-to-value ratio (D/V) at market values', unit: '%' },
      { key: 'bl', label: '(d) Rana\'s levered beta today', unit: 'x', abs: 0.003 },
      { key: 'w', label: '(e) Rana\'s WACC', unit: '%' }],
    hints: ['CAGR = [(1+r<sub>1</sub>)(1+r<sub>2</sub>)…(1+r<sub>6</sub>)]<sup>1/6</sup> − 1, for each series.',
      'The cost of debt is what lenders demand today: solve 101.35 = 9/(1+y) + 9/(1+y)<sup>2</sup> + 109/(1+y)<sup>3</sup> by trial and error on your calculator (try 8%, then 9%, and narrow down). The bond trades above par, so y is below 9%.',
      'The regression beta carries the old D/E of 0.30. Unlever at 0.30, then relever at today\'s market D/E = (4,000 × 1.0135) ÷ 6,000.'],
    steps: (d, r) => [
      { t: 'Market risk premium', html: `CAGR(Nifty) = [${d.rm.map(x => F.n(1 + x, 2)).join(' × ')}]<sup>1/6</sup> − 1 = ${P(r.cm)}<br>CAGR(G-sec) = [${d.rfr.map(x => F.n(1 + x, 2)).join(' × ')}]<sup>1/6</sup> − 1 = ${P(r.cf)}<br>MRP = <b>${P(r.hrp)}</b>. (The arithmetic version would be ${P(r.hrpA)}: a volatile series always has an arithmetic mean above its CAGR.)` },
      { t: 'Cost of debt = YTM, not the coupon', html: `<div class="formula">${d.price} = Σ<sub>t=1..${d.n}</sub> ${d.c}/(1+y)<sup>t</sup> + 100/(1+y)<sup>${d.n}</sup> ⟹ y = <b>${P(r.y)}</b></div>The ${d.c}% coupon was fixed at issue. Lenders today accept ${P(r.y)}, so that is the cost of new borrowing. After tax: ${P(r.y)} × (1 − ${d.t}) = ${P(r.y * (1 - d.t))}.` },
      { t: 'Market-value leverage', html: `D = ${F.big(d.Dface)} × ${d.price}/100 = ₹${F.big(r.Dm, 1)} cr; V = ₹${F.big(r.V, 1)} cr<br>D/E = ${F.big(r.Dm, 1)}/${F.big(d.E)} = ${F.n(r.de, 4)}; D/V = ${P(r.Dm / r.V)}` },
      { t: 'Fix the stale beta', html: `β<sub>U</sub> = ${d.bl} ÷ [1 + ${d.deOld} × (1 − ${d.t})] = ${N(r.bu)}<br>β<sub>L</sub> = ${N(r.bu)} × [1 + ${F.n(r.de, 4)} × (1 − ${d.t})] = <b>${N(r.bl)}</b>` },
      { t: 'Cost of equity and WACC', html: `K<sub>e</sub> = ${P(d.rf)} + ${N(r.bl)} × ${P(r.hrp)} = ${P(r.ke)}<div class="formula">WACC = ${F.n(d.E / r.V, 4)} × ${P(r.ke)} + ${F.n(r.Dm / r.V, 4)} × ${P(r.y)} × (1 − ${d.t}) = <b>${P(r.w)}</b></div>What each common shortcut does on its own (everything else correct):` + tbl(['Shortcut', 'WACC', 'Error'], [
        ['Coupon (' + d.c + '%) instead of YTM', P(r.sc.coupon), F.n((r.sc.coupon - r.w) * 10000, 0) + ' bp'],
        ['Face value of debt instead of market value', P(r.sc.face), F.n((r.sc.face - r.w) * 10000, 0) + ' bp'],
        ['Stale regression beta (' + d.bl + ') used as is', P(r.sc.stale), F.n((r.sc.stale - r.w) * 10000, 0) + ' bp'],
        ['Arithmetic premium (' + P(r.hrpA) + ')', P(r.sc.arith), F.n((r.sc.arith - r.w) * 10000, 0) + ' bp']]) + 'Some errors push up and some push down, so a student who makes several can land near the right number by luck, but the method would fail on the next company.' }],
    takeaway: () => 'Every WACC input has a "today" version and a "history" version. Use today\'s yield (YTM, not coupon), today\'s market values, today\'s leverage in the beta, and a compound (CAGR) premium measured over as long a history as you can get. Six years, as here, is far too short for real use.'
  });

  /* ---------------- P2: synthetic rating and a leveraged buyback ---------------- */
  problems.push({
    id: 's11-P2', code: 'Case 4', level: 'Hard', marks: 8,
    title: 'Synthetic ratings: what happens to K<sub>d</sub> when you borrow more',
    covers: 'Interest coverage → synthetic rating → spread · Hamada relevering · WACC before and after borrowing to buy back shares',
    data: { ebit: 1200, E: 12000, D: 3000, add: 2500, bl: 1.10, t: 0.25, rf: 0.065, mrp: 0.07 },
    story: d => `<p><b>Sajjangarh Resorts Ltd</b> is unrated. Its EBIT is a stable <b>₹${F.big(d.ebit)} cr</b> a year. Market value of equity is ₹${F.big(d.E)} cr and it has ₹${F.big(d.D)} cr of debt. Its regression (levered) beta is <b>${d.bl}</b>, measured at today's leverage. R<sub>f</sub> = ${P(d.rf)}, market risk premium = ${P(d.mrp)}, tax rate = ${P(d.t)}.</p>
      <p>The CFO plans to borrow another <b>₹${F.big(d.add)} cr</b> and use all of it to buy back shares. Assume firm value is unchanged by the recapitalisation, and that after it <i>all</i> debt (old and new) is refinanced at the firm's new pre-tax cost of debt. The cost of debt is R<sub>f</sub> + the default spread for the firm's synthetic rating, where the rating depends on the interest coverage that the cost of debt itself produces. Find the rating by starting at the top of the table (AAA) and moving down until the rating you assume is the rating you get.</p>${ptHtml()}`,
    solve(d) {
      const now = Fin.synthKd(d.ebit, d.D, d.rf, PT), D2 = d.D + d.add, E2 = d.E - d.add;
      const nxt = Fin.synthKd(d.ebit, D2, d.rf, PT);
      const de = d.D / d.E, bu = Fin.unlever(d.bl, de, d.t), ke = Fin.capm(d.rf, d.bl, d.mrp), V = d.D + d.E;
      const w1 = Fin.wacc(d.E / V, ke, d.D / V, now.kd, d.t);
      const de2 = D2 / E2, bl2 = Fin.lever(bu, de2, d.t), ke2 = Fin.capm(d.rf, bl2, d.mrp);
      const w2 = Fin.wacc(E2 / V, ke2, D2 / V, nxt.kd, d.t);
      const wConst = Fin.wacc(E2 / V, ke2, D2 / V, now.kd, d.t);
      return { kd1: now.kd, w1, kd2: nxt.kd, w2, now, nxt, bu, ke, de2, bl2, ke2, D2, E2, V, wConst };
    },
    parts: [
      { key: 'kd1', label: '(a) Current pre-tax cost of debt', unit: '%' },
      { key: 'w1', label: '(b) Current WACC', unit: '%' },
      { key: 'kd2', label: '(c) Pre-tax cost of debt after the buyback', unit: '%' },
      { key: 'w2', label: '(d) WACC after the buyback', unit: '%', tol: 0.0005 }],
    hints: ['Guess a rating, compute K<sub>d</sub> = R<sub>f</sub> + spread, then interest = D × K<sub>d</sub> and coverage = EBIT ÷ interest. If the coverage maps to a different rating, re-guess with that rating. Stop when the guess is self-consistent.',
      'For the new equity beta: unlever 1.10 at today\'s D/E, then relever at the post-buyback D/E.'],
    steps: (d, r) => [
      { t: 'Find today\'s self-consistent rating', html: 'Iterate (start from the top of the table):<br>' + r.now.path.map(p => `Try ${p.rating}: K<sub>d</sub> = ${P(p.kd)} → interest = ${F.big(d.D)} × ${P(p.kd)} = ₹${F.big(d.D * p.kd, 1)} cr → coverage = ${F.n(p.cov, 3)} → ${p.next}`).join('<br>') + `<br><b>Rating ${r.now.rating}, K<sub>d</sub> = ${P(r.kd1)}.</b>` },
      { t: 'Today\'s cost of equity', html: `The regression beta already reflects today's leverage, so K<sub>e</sub> = ${P(d.rf)} + ${d.bl} × ${P(d.mrp)} = <b>${P(r.ke)}</b>.` },
      { t: 'Today\'s WACC', html: `<div class="formula">WACC = ${F.n(d.E / r.V, 4)} × ${P(r.ke)} + ${F.n(d.D / r.V, 4)} × ${P(r.kd1)} × (1 − ${d.t}) = <b>${P(r.w1)}</b></div>` },
      { t: 'Re-rate the firm at ₹' + F.big(r.D2) + ' cr of debt', html: r.nxt.path.map(p => `Try ${p.rating}: K<sub>d</sub> = ${P(p.kd)} → interest ₹${F.big(r.D2 * p.kd, 1)} cr → coverage ${F.n(p.cov, 3)} → ${p.next}`).join('<br>') + `<br><b>New rating ${r.nxt.rating}, K<sub>d</sub> = ${P(r.kd2)}.</b> Each notch down raises interest, which lowers coverage again. That feedback is why heavily borrowed firms slide several notches at once.` },
      { t: 'Relever the beta', html: `β<sub>U</sub> = ${d.bl} ÷ [1 + ${F.n(d.D / d.E, 3)}(1 − ${d.t})] = ${N(r.bu)}.<br>New D/E = ${F.big(r.D2)}/${F.big(r.E2)} = ${F.n(r.de2, 4)} → β<sub>L</sub> = ${N(r.bu)} × [1 + ${F.n(r.de2, 4)} × ${1 - d.t}] = <b>${N(r.bl2)}</b><br>K<sub>e</sub> = ${P(d.rf)} + ${N(r.bl2)} × ${P(d.mrp)} = <b>${P(r.ke2)}</b>` },
      { t: 'New WACC', html: `<div class="formula">WACC = ${F.n(r.E2 / r.V, 4)} × ${P(r.ke2)} + ${F.n(r.D2 / r.V, 4)} × ${P(r.kd2)} × ${1 - d.t} = <b>${P(r.w2)}</b></div>WACC ${r.w2 > r.w1 ? 'rises' : 'falls'} by only ${F.n(Math.abs(r.w2 - r.w1) * 10000, 0)} bp, although the firm took ${F.n((r.D2 - d.D) / r.V * 100, 0)}% of its value in new debt. Counterfactual: had K<sub>d</sub> stayed at ${P(r.kd1)}, WACC would have fallen to ${P(r.wConst)} (−${F.n((r.w1 - r.wConst) * 10000, 0)} bp), with the higher equity beta already included. The spread rising from ${P(r.kd1 - d.rf)} to ${P(r.kd2 - d.rf)} on <i>all</i> the debt eats about ${F.n((r.w2 - r.wConst) / (r.w1 - r.wConst) * 100, 0)}% of that gain.` }],
    takeaway: () => 'Cheap debt is not free. Each notch down the rating table raises the spread on every rupee already borrowed, so the benefit of extra debt shrinks quickly. Borrow a little more and WACC starts rising: open the <b>WACC Machine</b>, set the spread to follow the rating, and watch the U-shape appear.'
  });

  /* ---------------- P3: bottom-up beta with cash ---------------- */
  problems.push({
    id: 's11-P3', code: 'Case 1', level: 'Medium', marks: 6,
    title: 'Bottom-up beta with cash: an all-equity carmaker goes EV',
    covers: 'Unlevering comparables · removing and adding cash · relevering at a target D/E · CAPM',
    data: { bComp: 1.20, deComp: 0.40, cashComp: 0.12, cashM: 0.06, deM: 0.25, t: 0.25, rf: 0.064, mrp: 0.072 },
    story: d => `<p><b>Mewar Motors</b> is all-equity today and holds cash equal to ${P(d.cashM, 0)} of its firm value. To fund an EV platform it will move to a target <b>D/E of ${d.deM}</b>, keeping its cash. Assume cash remains ${P(d.cashM, 0)} of firm value after the change. Its own regression beta is unreliable because the business is changing, so the CFO uses a bottom-up beta from EV comparables:</p>` +
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
      { key: 'ke', label: '(c) Mewar\'s cost of equity', unit: '%' }],
    hints: ['Strip out both leverage (unlever) and cash (divide by 1 − cash/V). Both are multiplicative, so the order does not matter. Then add back Mewar\'s cash and Mewar\'s leverage.'],
    steps: (d, r) => [
      { t: 'Remove the comparables\' leverage', html: `β<sub>U</sub> (incl. cash) = ${d.bComp} ÷ [1 + ${d.deComp} × ${1 - d.t}] = ${N(r.buC)}` },
      { t: 'Remove the comparables\' cash', html: `Cash has a beta of 0, so it drags the measured beta down. β<sub>business</sub> = ${N(r.buC)} ÷ (1 − ${d.cashComp}) = <b>${N(r.bBiz)}</b>` },
      { t: 'Add Mewar\'s cash, then Mewar\'s leverage', html: `β<sub>U, Mewar</sub> = ${N(r.bBiz)} × (1 − ${d.cashM}) = ${N(r.buM)}<br>β<sub>L</sub> = ${N(r.buM)} × [1 + ${d.deM} × ${1 - d.t}] = <b>${N(r.blM)}</b>` },
      { t: 'Cost of equity', html: `K<sub>e</sub> = ${P(d.rf, 1)} + ${N(r.blM)} × ${P(d.mrp, 1)} = <b>${P(r.ke)}</b>` },
      { t: 'Extra insight (not asked): what if Mewar paid out all its cash?', html: `With no cash, β<sub>U</sub> = β<sub>business</sub> = ${N(r.bBiz)}; β<sub>L</sub> = ${N(r.blNoCash)}; K<sub>e</sub> = <b>${P(r.keNoCash)}</b>. Equity holders are left holding only the risky business, so they demand more.` }],
    takeaway: () => 'Cash-rich comparables (common in Indian IT and autos) make the business look safer than it is. Clean out both leverage <i>and</i> cash before borrowing a comparable\'s beta.'
  });

  /* ---------------- P4: Marriott in Rajasthan ---------------- */
  problems.push({
    id: 's11-P4', code: 'Case 5', level: 'Hard', marks: 10,
    title: 'Marriott in Rajasthan: divisional hurdles, and the cost of using one rate',
    covers: 'Unlevering parent and comparables · backing out the orphan division · divisional WACCs · firm-wide WACC · NPV damage from the wrong hurdle',
    data: {
      E: 18000, D: 9000, bl: 1.30, kdNow: 0.08, t: 0.25, rf: 0.065, mrp: 0.07,
      w: { H: 0.5, Q: 0.3, F: 0.2 }, comp: { H: { b: 1.35, dv: 0.40 }, Q: { b: 0.95, dv: 0.20 } },
      tgt: { H: { dv: 0.55, s: 0.015 }, Q: { dv: 0.25, s: 0.012 }, F: { dv: 0.30, s: 0.020 } },
      X: { c0: -1000, c: 428, n: 3 }, Y: { c0: -1000, c: 416, n: 3 }
    },
    story: d => `<p><b>Aravalli Group</b> runs three divisions: Hotels, Quick-Service Restaurants (QSR) and Facility Services (FS). Its equity is worth ₹${F.big(d.E)} cr and its debt ₹${F.big(d.D)} cr; it currently borrows at <b>${P(d.kdNow, 0)}</b>. Its regression beta, measured at today's leverage, is <b>${d.bl}</b>. Using identifiable assets, Hotels, QSR and FS make up ${d.w.H * 100}%, ${d.w.Q * 100}% and ${d.w.F * 100}% of firm value. There are no listed pure-play facility-services firms in India.</p>` +
      tbl(['', 'Comparables β<sub>L</sub> (avg)', 'Comparables D/V (avg)', 'Target D/V', 'Debt spread over R<sub>f</sub>'], [
        ['Hotels', d.comp.H.b, P(d.comp.H.dv, 0), P(d.tgt.H.dv, 0), P(d.tgt.H.s, 1)],
        ['QSR', d.comp.Q.b, P(d.comp.Q.dv, 0), P(d.tgt.Q.dv, 0), P(d.tgt.Q.s, 1)],
        ['Facility Services', '–', '–', P(d.tgt.F.dv, 0), P(d.tgt.F.s, 1)]]) +
      `<p>Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}.</p>
      <p>Until now Aravalli has evaluated every project at its <b>firm-wide WACC</b> (current market weights, current K<sub>d</sub>). Two proposals reach the investment committee:</p>` +
      tbl(['Project (₹ cr)', 't = 0', `Years 1–${d.X.n} (each)`, 'IRR (given)'], [['X: 3-year hospital facility-management contract (FS)', d.X.c0, '+' + d.X.c, P(Fin.irr([d.X.c0, ...Array(d.X.n).fill(d.X.c)]))], ['Y: 3-year kitchen-upgrade programme across 40 QSR outlets (QSR)', d.Y.c0, '+' + d.Y.c, P(Fin.irr([d.Y.c0, ...Array(d.Y.n).fill(d.Y.c)]))]]) +
      '<p class="muted">The IRRs are given: you do not need to calculate them. A project is worth accepting when its IRR is above its hurdle rate (equivalently, when its NPV at the hurdle rate is positive).</p>',
    solve(d) {
      const V = d.E + d.D, bu = Fin.unlever(d.bl, d.D / d.E, d.t);
      const buH = Fin.unlever(d.comp.H.b, Fin.deFromDv(d.comp.H.dv), d.t), buQ = Fin.unlever(d.comp.Q.b, Fin.deFromDv(d.comp.Q.dv), d.t);
      const buF = (bu - d.w.H * buH - d.w.Q * buQ) / d.w.F;
      const div = (b, tg) => { const de = Fin.deFromDv(tg.dv), blv = Fin.lever(b, de, d.t), ke = Fin.capm(d.rf, blv, d.mrp), kd = d.rf + tg.s; return { de, blv, ke, kd, w: Fin.wacc(1 - tg.dv, ke, tg.dv, kd, d.t) }; };
      const H = div(buH, d.tgt.H), Q = div(buQ, d.tgt.Q), Fs = div(buF, d.tgt.F);
      const keF = Fin.capm(d.rf, d.bl, d.mrp), firm = Fin.wacc(d.E / V, keF, d.D / V, d.kdNow, d.t);
      const cf = p => [p.c0, ...Array(p.n).fill(p.c)];
      const irrX = Fin.irr(cf(d.X)), irrY = Fin.irr(cf(d.Y));
      const nXf = Fin.pv(cf(d.X), firm), nYf = Fin.pv(cf(d.Y), firm), nXd = Fin.pv(cf(d.X), Fs.w), nYd = Fin.pv(cf(d.Y), Q.w);
      const loss = (nXf > 0 && nXd < 0 ? -nXd : 0) + (nYf < 0 && nYd > 0 ? nYd : 0);
      return { buF, wF: Fs.w, firm, nYd, loss, bu, buH, buQ, H, Q, Fs, keF, V, irrX, irrY, nXf, nYf, nXd };
    },
    parts: [
      { key: 'buF', label: '(a) Unlevered beta of Facility Services', unit: 'x' },
      { key: 'wF', label: '(b) Hurdle rate (WACC) for Facility Services', unit: '%', tol: 0.0005 },
      { key: 'firm', label: '(c) Aravalli\'s firm-wide WACC', unit: '%' },
      { key: 'nYd', label: '(d) NPV of project Y at the QSR hurdle rate (keep the hurdle rate to two decimals, e.g. 11.57%)', unit: 'cr', abs: 0.3 },
      { key: 'loss', label: '(e) Value lost by using the firm-wide WACC for both projects: the negative NPV of any project wrongly accepted plus the positive NPV of any project wrongly rejected, both measured at the divisional rates (enter a positive number)', unit: 'cr', abs: 0.5 }],
    hints: ['The comparables report D/V. Convert to D/E = (D/V)/(1 − D/V) before unlevering.',
      'The firm\'s β<sub>U</sub> is the asset-weighted average of the three divisional β<sub>U</sub>s. Two are known, so solve for the third. Then relever each division at <i>its own</i> target D/E and use <i>its own</i> spread.',
      'Compare each project’s given IRR with the firm-wide WACC (what the firm does now) and with its own division’s hurdle (what it should do). Which project is accepted and which rejected under each rule? Value lost = the negative NPV you accept plus the positive NPV you give up, both measured at the correct divisional rates.'],
    steps: (d, r) => [
      { t: 'Unlever the parent and the comparables', html: `Aravalli: D/E = ${F.n(d.D / d.E, 3)}; β<sub>U</sub> = ${d.bl} ÷ (1 + ${F.n(d.D / d.E, 3)} × ${1 - d.t}) = ${N(r.bu)}<br>Hotels: D/E = ${F.n(Fin.deFromDv(d.comp.H.dv), 4)}; β<sub>U</sub> = ${N(r.buH)}. QSR: D/E = ${F.n(Fin.deFromDv(d.comp.Q.dv), 4)}; β<sub>U</sub> = ${N(r.buQ)}` },
      { t: 'Back out Facility Services', html: `<div class="formula">${N(r.bu)} = ${d.w.H} × ${N(r.buH)} + ${d.w.Q} × ${N(r.buQ)} + ${d.w.F} × β<sub>U,FS</sub> ⟹ β<sub>U,FS</sub> = <b>${N(r.buF)}</b></div>This is exactly how Marriott's Contract Services beta was found: the parent's β<sub>U</sub> is the asset-weighted average of its divisions, so the one unknown can be solved for.` },
      { t: 'Divisional hurdle rates', html: `FS: target D/E = ${F.n(r.Fs.de, 4)} → β<sub>L</sub> = ${N(r.Fs.blv)} → K<sub>e</sub> = ${P(r.Fs.ke)}; K<sub>d</sub> = ${P(r.Fs.kd)}<div class="formula">WACC<sub>FS</sub> = ${F.n(1 - d.tgt.F.dv, 2)} × ${P(r.Fs.ke)} + ${d.tgt.F.dv} × ${P(r.Fs.kd)} × ${1 - d.t} = <b>${P(r.wF)}</b></div>QSR: D/E ${F.n(r.Q.de, 4)} → β<sub>L</sub> ${N(r.Q.blv)} → K<sub>e</sub> ${P(r.Q.ke)} → WACC<sub>QSR</sub> = ${P(r.Q.w)}. (Hotels, for completeness: ${P(r.H.w)}.)` },
      { t: 'Firm-wide WACC', html: `K<sub>e</sub> = ${P(d.rf)} + ${d.bl} × ${P(d.mrp, 0)} = ${P(r.keF)}<div class="formula">WACC = ${F.n(d.E / r.V, 4)} × ${P(r.keF)} + ${F.n(d.D / r.V, 4)} × ${P(d.kdNow, 0)} × ${1 - d.t} = <b>${P(r.firm)}</b></div>It need not equal the asset-weighted average of the divisional hurdles (${P(d.w.H * r.H.w + d.w.Q * r.Q.w + d.w.F * r.wF)}), because the divisions are evaluated at their own target leverage and spreads, not at today\'s group capital structure.` },
      { t: 'What the firm-wide rule does', html: `Given IRRs: X ${P(r.irrX)}, Y ${P(r.irrY)}. Against the firm-wide ${P(r.firm)}, X looks good (${P(r.irrX)} > ${P(r.firm)}) and Y looks bad (${P(r.irrY)} < ${P(r.firm)}).<br>At ${P(r.firm)}: NPV<sub>X</sub> = ${C(r.nXf)} → accept X; NPV<sub>Y</sub> = ${C(r.nYf)} → reject Y.` },
      { t: 'What the right rates say', html: `NPV<sub>X</sub> at ${P(r.wF)} = ${C(r.nXd)} → X destroys value. NPV<sub>Y</sub> at ${P(r.Q.w)} = <b>${C(r.nYd)}</b> → Y creates value.<br>Value lost = ${C(-r.nXd)} (accepting X) + ${C(r.nYd)} (rejecting Y) = <b>${C(r.loss)}</b>. The firm grows its riskiest division and fails to grow a safer one.` }],
    takeaway: () => 'This is the Marriott recipe end to end: unlever the parent and the comparables, back out the orphan division, relever each division at its own target leverage with its own spread, and use those rates. The firm-wide WACC over-invests in risky divisions and under-invests in safe ones, which is the picture in the <b>Hurdle rates</b> tab.'
  });

  /* ---------------- P5: debt-funded acquisition ---------------- */
  problems.push({
    id: 's11-P5', code: 'Case 2', level: 'Medium', marks: 7,
    title: 'Debt-funded acquisition: the acquirer\'s beta jumps',
    covers: 'Unlevering · value-weighted asset betas · relevering after a debt-funded deal',
    data: { E: 8000, D: 2000, bl: 0.85, t: 0.25, price: 3000, buT: 1.6, rf: 0.065, mrp: 0.07, kd: 0.09 },
    story: d => `<p><b>Jaisalmer Foods</b> (packaged snacks) has equity of ₹${F.big(d.E)} cr, debt of ₹${F.big(d.D)} cr and an equity beta of <b>${d.bl}</b>, measured at today's leverage. It is buying a cloud-kitchen start-up for <b>₹${F.big(d.price)} cr</b> (a fair price, so NPV = 0), funded <b>entirely with new debt</b>. Cloud-kitchen comparables have an unlevered beta of <b>${d.buT}</b>. Tax = ${P(d.t, 0)}, R<sub>f</sub> = ${P(d.rf)}, MRP = ${P(d.mrp, 0)}. After the deal Jaisalmer can borrow at ${P(d.kd, 0)}, and it plans to keep its post-deal D/V.</p>`,
    solve(d) {
      const V0 = d.E + d.D, bu0 = Fin.unlever(d.bl, d.D / d.E, d.t), V1 = V0 + d.price, D1 = d.D + d.price, E1 = d.E;
      const bu1 = (V0 * bu0 + d.price * d.buT) / V1, bl1 = Fin.lever(bu1, D1 / E1, d.t), ke1 = Fin.capm(d.rf, bl1, d.mrp);
      const blK = Fin.lever(d.buT, D1 / E1, d.t), keK = Fin.capm(d.rf, blK, d.mrp), wK = Fin.wacc(E1 / V1, keK, D1 / V1, d.kd, d.t);
      return { bu0, bu1, bl1, ke1, wK, V1, D1, E1, blK, keK };
    },
    parts: [
      { key: 'bu0', label: '(a) Jaisalmer\'s unlevered beta before the deal', unit: 'x' },
      { key: 'bu1', label: '(b) Unlevered beta after the deal', unit: 'x' },
      { key: 'bl1', label: '(c) Equity beta after the deal', unit: 'x' }],
    hints: ['A debt-funded purchase leaves equity unchanged but adds ₹3,000 cr to both debt and firm value.', 'Two things push the equity beta up at once: a riskier asset mix and more leverage.'],
    steps: (d, r) => [
      { t: 'Before', html: `β<sub>U,0</sub> = ${d.bl} ÷ [1 + ${F.n(d.D / d.E, 3)} × ${1 - d.t}] = <b>${N(r.bu0)}</b>` },
      { t: 'New asset mix', html: `V = ${F.big(d.E + d.D)} + ${F.big(d.price)} = ${F.big(r.V1)}<div class="formula">β<sub>U,1</sub> = (${F.big(d.E + d.D)} × ${N(r.bu0)} + ${F.big(d.price)} × ${d.buT}) ÷ ${F.big(r.V1)} = <b>${N(r.bu1)}</b></div>` },
      { t: 'New leverage', html: `D = ${F.big(r.D1)}, E = ${F.big(r.E1)} (unchanged) → D/E = ${F.n(r.D1 / r.E1, 4)}<br>β<sub>L,1</sub> = ${N(r.bu1)} × [1 + ${F.n(r.D1 / r.E1, 4)} × ${1 - d.t}] = <b>${N(r.bl1)}</b> (up from ${d.bl}). K<sub>e</sub> rises to ${P(r.ke1)}.` },
      { t: 'Extra insight (not asked): the hurdle rate for future cloud-kitchen projects', html: `Suppose the CFO says: "We are funding the cloud kitchens with a 9% loan, so their hurdle rate is 9%." The hurdle must reflect the risk of the cloud-kitchen business, financed at the group's D/V:<br>β<sub>L</sub> = ${d.buT} × [1 + ${F.n(r.D1 / r.E1, 4)} × ${1 - d.t}] = ${N(r.blK)} → K<sub>e</sub> = ${P(r.keK)}<div class="formula">Hurdle = ${F.n(r.E1 / r.V1, 4)} × ${P(r.keK)} + ${F.n(r.D1 / r.V1, 4)} × ${P(d.kd, 0)} × ${1 - d.t} = <b>${P(r.wK)}</b></div>The CFO is wrong: the 9% loan does <i>not</i> make the cloud-kitchen business a 9% (or 6.75%) business. (In Case 5 each division has its own target leverage. Here Jaisalmer finances the whole group at one D/V, so that is the leverage the cloud-kitchen hurdle uses.)` }],
    takeaway: () => 'The source of finance does not set the hurdle rate; the risk of the asset does. "We are funding it with a 9% loan, so the hurdle is 9%" is one of the most common mistakes in real boardrooms.'
  });

  // 2 medium cases first, then 3 hard ones
  window.S11_PROBLEMS = ['s11-P3', 's11-P5', 's11-P1', 's11-P2', 's11-P4'].map(id => problems.find(p => p.id === id));
  window.S11_PT = PT;
})();
