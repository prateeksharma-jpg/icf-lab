/* Session 12: valuing equity with dividend discount models (DDM), growth and PVGO.
   Five real-world cases (2 medium, then 3 hard). Every number in a solution is computed from the case data.
   Calculator-friendly: no case asks for more than three explicit years of dividends. */
(function () {
  'use strict';
  const { F } = ICF;
  const P = x => F.pct(x, 2), R = (x, d = 2) => (x < 0 ? '−₹' : '₹') + F.big(Math.abs(x), d), N = (x, d = 4) => F.n(x, d);
  const tbl = (head, rows) => '<div class="tblwrap"><table class="tbl"><tr>' + head.map(x => `<th>${x}</th>`).join('') + '</tr>' + rows.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</table></div>';
  const pct0 = x => (x * 100).toFixed(x * 100 % 1 ? 1 : 0) + '%';

  const problems = [];

  /* ---------------- Case 1 (Medium): Gordon growth and the market's implied growth ---------------- */
  problems.push({
    id: 's12-P1', code: 'Case 1', level: 'Medium',
    title: 'A power-transmission share: value it, then read the market price',
    covers: 'CAPM cost of equity · stable growth (Gordon) model with D<sub>0</sub> → D<sub>1</sub> · implied growth from the market price',
    data: { rf: 0.073, beta: 0.90, mrp: 0.07, D0: 9, g: 0.05, price: 160 },
    story: d => `<p><b>Aravalli Grid Ltd</b> owns high-voltage power lines. Its income is set by the regulator, so its dividends grow steadily. It has <b>just paid</b> a dividend of <b>₹${d.D0}</b> per share, and analysts expect dividends to grow at <b>${P(d.g)}</b> a year forever.</p>
      <p>Aravalli's beta is <b>${d.beta.toFixed(2)}</b>. The 10-year G-sec yields <b>${P(d.rf)}</b> and the market risk premium is <b>${P(d.mrp)}</b>.</p>
      <p>The share trades at <b>₹${d.price}</b>.</p>`,
    solve(d) {
      const r = d.rf + d.beta * d.mrp, D1 = d.D0 * (1 + d.g), V = D1 / (r - d.g);
      const gi = (d.price * r - d.D0) / (d.price + d.D0);
      return { r, D1, V, gi };
    },
    parts: [
      { key: 'r', label: '(a) Cost of equity, r', unit: '%' },
      { key: 'V', label: '(b) Value of one share today, using the analysts\' 5% growth', unit: '₹' },
      { key: 'gi', label: '(c) The stable growth rate that would justify the market price of ₹160', unit: '%' }],
    hints: ['CAPM: r = R<sub>f</sub> + β × market risk premium.',
      'The ₹9 has already been paid, so it is D<sub>0</sub>. The first future dividend is D<sub>1</sub> = D<sub>0</sub>(1 + g).',
      'Set 160 = 9(1 + g) ÷ (r − g) and solve for g: multiply out, collect the g terms on one side.'],
    steps: (d, r) => [
      { t: 'Cost of equity (CAPM)', html: `r = ${P(d.rf)} + ${d.beta.toFixed(2)} × ${P(d.mrp)} = <b>${P(r.r)}</b>` },
      { t: 'Value with the stable growth model', html: `The ₹${d.D0} was just paid (D<sub>0</sub>), so the first dividend we will receive is D<sub>1</sub> = ${d.D0} × ${F.n(1 + d.g, 2)} = ₹${F.n(r.D1, 2)}.<div class="formula">V<sub>0</sub> = D<sub>1</sub> ÷ (r − g) = ${F.n(r.D1, 2)} ÷ (${P(r.r)} − ${P(d.g)}) = ${F.n(r.D1, 2)} ÷ ${F.n(r.r - d.g, 3)} = <b>${R(r.V)}</b></div>A common slip is to put D<sub>0</sub> = 9 on top: 9 ÷ ${F.n(r.r - d.g, 3)} = ₹${F.n(d.D0 / (r.r - d.g), 2)}, which values a dividend you can no longer receive.` },
      { t: 'Growth implied by the market price', html: `<div class="formula">${d.price} = ${d.D0}(1 + g) ÷ (${F.n(r.r, 3)} − g)</div>${d.price} × ${F.n(r.r, 3)} − ${d.price}g = ${d.D0} + ${d.D0}g<br>${F.n(d.price * r.r, 2)} − ${d.D0} = (${d.price} + ${d.D0})g<br>g = ${F.n(d.price * r.r - d.D0, 2)} ÷ ${d.price + d.D0} = <b>${P(r.gi)}</b><br>Check: 9 × ${F.n(1 + r.gi, 4)} ÷ (${F.n(r.r, 3)} − ${F.n(r.gi, 4)}) = ₹${F.n(d.D0 * (1 + r.gi) / (r.r - r.gi), 2)} ✓` },
      { t: 'Extra insight (not asked): is that growth believable?', html: `A stable growth rate lasts forever, so it cannot be higher than the long-run growth of the economy, for which the risk-free rate (${P(d.rf)}) is a good proxy. The market price needs <b>${P(r.gi)}</b> forever, which is <b>above ${P(d.rf)}</b>. So either the market expects a period of faster growth first (a multi-stage model would be needed), or the share is priced too high.` }],
    takeaway: (d, r) => `The stable growth model turns one dividend, one growth rate and one discount rate into a price. Run it backwards and a market price tells you what growth investors are assuming. Here the market's ${P(r.gi)} is higher than the economy can grow forever, which is a warning sign worth checking for any steady dividend payer.`
  });

  /* ---------------- Case 2 (Medium): where growth comes from (retention × ROE) ---------------- */
  problems.push({
    id: 's12-P2', code: 'Case 2', level: 'Medium',
    title: 'A paint maker: where does dividend growth come from?',
    covers: 'ROE on beginning book equity · retained earnings raise book value · fundamental growth g = retention ratio × ROE · implied cost of equity',
    data: { B0: 120, roe: 0.18, po: 0.60, price: 288 },
    story: d => `<p><b>Sahyadri Paints Ltd</b> has just closed year 0. Its book value per share (BVPS) at the end of year 0 is <b>₹${d.B0}</b>. It earns a return on equity of <b>${P(d.roe)}</b> every year, measured on book equity at the <i>start</i> of the year. It pays out <b>${pct0(d.po)}</b> of its earnings as dividends and keeps the rest in the business. It raises no new equity or debt. ROE and payout stay the same forever.</p>
      <p>The share trades at <b>₹${d.price}</b> (the year-0 dividend has already been paid).</p>`,
    solve(d) {
      const E1 = d.roe * d.B0, b = 1 - d.po, B1 = d.B0 + b * E1, E2 = d.roe * B1, g = b * d.roe, D1 = d.po * E1;
      const ri = D1 / d.price + g;
      return { E1, B1, E2, g, D1, ri, b, V12: D1 / (0.12 - g), Vall: E1 / 0.12 };
    },
    parts: [
      { key: 'E2', label: '(a) Earnings per share in year 2, EPS<sub>2</sub>', unit: '₹' },
      { key: 'g', label: '(b) Growth rate of EPS and of dividends', unit: '%' },
      { key: 'ri', label: '(c) Cost of equity implied by the market price of ₹288', unit: '%' }],
    hints: ['EPS<sub>1</sub> = ROE × BVPS<sub>0</sub>. The part of EPS<sub>1</sub> that is not paid out is added to book value: BVPS<sub>1</sub> = BVPS<sub>0</sub> + retained EPS<sub>1</sub>.',
      'Retention ratio = 1 − payout ratio. Growth = retention ratio × ROE.',
      'If the price equals the value, P<sub>0</sub> = D<sub>1</sub> ÷ (r − g), so r = D<sub>1</sub> ÷ P<sub>0</sub> + g.'],
    steps: (d, r) => [
      { t: 'Year 1: earnings, dividend, book value', html: `EPS<sub>1</sub> = ${P(d.roe)} × ₹${d.B0} = ₹${F.n(r.E1, 2)}<br>DPS<sub>1</sub> = ${pct0(d.po)} × ${F.n(r.E1, 2)} = ₹${F.n(r.D1, 2)}; retained = ₹${F.n(r.b * r.E1, 2)}<br>BVPS<sub>1</sub> = ${d.B0} + ${F.n(r.b * r.E1, 2)} = ₹${F.n(r.B1, 2)}` },
      { t: 'Year 2 earnings', html: `EPS<sub>2</sub> = ${P(d.roe)} × ₹${F.n(r.B1, 2)} = <b>${R(r.E2)}</b>. The extra ₹${F.n(r.E2 - r.E1, 2)} of earnings is ${P(d.roe)} earned on the ₹${F.n(r.b * r.E1, 2)} kept back in year 1.` },
      { t: 'Fundamental growth', html: `<div class="formula">g = retention ratio × ROE = ${F.n(r.b, 2)} × ${P(d.roe)} = <b>${P(r.g)}</b></div>Check: ${F.n(r.E2, 4)} ÷ ${F.n(r.E1, 2)} − 1 = ${P(r.E2 / r.E1 - 1)} ✓. With a fixed payout ratio, dividends grow at the same rate as earnings.` },
      { t: 'Implied cost of equity', html: `<div class="formula">r = D<sub>1</sub> ÷ P<sub>0</sub> + g = ${F.n(r.D1, 2)} ÷ ${d.price} + ${P(r.g)} = ${P(r.D1 / d.price)} + ${P(r.g)} = <b>${P(r.ri)}</b></div>This is the return investors can expect if they buy at ₹${d.price}: a dividend yield of ${P(r.D1 / d.price)} plus growth of ${P(r.g)}.` },
      { t: 'Extra insight (not asked): what reinvestment is worth', html: `Suppose shareholders require 12%. Then the share is worth ${F.n(r.D1, 2)} ÷ (12% − ${P(r.g)}) = ₹${F.n(r.V12, 2)}. If instead Sahyadri paid out <i>all</i> its earnings, it would keep nothing back, book value would stay at ₹${d.B0}, EPS would stay at ₹${F.n(r.E1, 2)} forever, and the share would be worth ${F.n(r.E1, 2)} ÷ 12% = ₹${F.n(r.Vall, 2)}. The extra ₹${F.n(r.V12 - r.Vall, 2)} comes from reinvesting at an ROE of 18%, which beats the 12% shareholders require.` }],
    takeaway: (d, r) => `Growth is not free: it is paid for by the dividends a company holds back. How fast earnings grow depends on how much is kept (retention ratio) and how well it is invested (ROE). A market price, read through the same model, gives the return investors are expecting: here ${P(r.ri)}.`
  });

  /* ---------------- Case 3 (Hard): payout change, two-stage, PVGO ---------------- */
  problems.push({
    id: 's12-P3', code: 'Case 3', level: 'Hard',
    title: 'An ed-tech company that will start paying out more',
    covers: 'ROE from last year\'s book value · growth changes the year after the payout changes · two-stage DDM · PVGO',
    data: { E0: 20, D0: 5, Bm1: 100, po2: 0.75, r: 0.13 },
    story: d => `<p><b>Kota Learning Ltd</b>, an ed-tech company with no debt, has just finished year 0 with earnings per share of <b>₹${d.E0}</b> and has just paid a dividend of <b>₹${d.D0}</b> per share. Its book value per share at the end of the previous year (year −1) was <b>₹${d.Bm1}</b>.</p>
      <p>Kota will keep paying out the same share of its earnings as in year 0 in <b>years 1 and 2</b>. From <b>year 3 onwards</b> it will pay out <b>${pct0(d.po2)}</b> of its earnings forever. Its ROE (earnings ÷ book equity at the start of the year) stays at its year-0 level forever, and it raises no new capital.</p>
      <p>Kota's cost of equity is <b>${P(d.r)}</b>.</p>`,
    solve(d) {
      const roe = d.E0 / d.Bm1, po0 = d.D0 / d.E0, g1 = (1 - po0) * roe, g2 = (1 - d.po2) * roe;
      const E1 = d.E0 * (1 + g1), E2 = E1 * (1 + g1), E3 = E2 * (1 + g1);
      const D1 = po0 * E1, D2 = po0 * E2, D3 = d.po2 * E3, P2 = D3 / (d.r - g2);
      const P0 = D1 / (1 + d.r) + (D2 + P2) / Math.pow(1 + d.r, 2), aip = d.E0 / d.r, pvgo = P0 - aip;
      return { roe, po0, g1, g2, E1, E2, E3, D1, D2, D3, P2, P0, aip, pvgo };
    },
    parts: [
      { key: 'g1', label: '(a) Growth rate of EPS in years 1, 2 and 3', unit: '%' },
      { key: 'g2', label: '(b) Growth rate of EPS and dividends from year 4 onwards', unit: '%' },
      { key: 'D3', label: '(c) Dividend per share in year 3, DPS<sub>3</sub>', unit: '₹' },
      { key: 'P0', label: '(d) Value of one share today', unit: '₹' },
      { key: 'pvgo', label: '(e) Present value of growth opportunities (PVGO) per share, with assets in place = EPS<sub>0</sub> ÷ r', unit: '₹' }],
    hints: ['ROE = EPS<sub>0</sub> ÷ BVPS<sub>−1</sub>. Payout in year 0 = DPS<sub>0</sub> ÷ EPS<sub>0</sub>.',
      'Growth in year t = retention ratio in year t−1 × ROE. The payout changes in year 3, so growth changes only from year 4.',
      'From year 3 on, the dividends D<sub>3</sub>, D<sub>4</sub>, D<sub>5</sub> … form a growing perpetuity: each is bigger than the one before by the new stable rate, starting with D<sub>4</sub> = D<sub>3</sub>(1 + g). So the value at the end of year 2 is P<sub>2</sub> = D<sub>3</sub> ÷ (r − g).',
      'PVGO = P<sub>0</sub> − EPS<sub>0</sub> ÷ r.'],
    steps: (d, r) => [
      { t: 'ROE and the year-0 payout', html: `ROE = ${d.E0} ÷ ${d.Bm1} = ${P(r.roe)}; payout in year 0 = ${d.D0} ÷ ${d.E0} = ${pct0(r.po0)}, so retention = ${pct0(1 - r.po0)}.` },
      { t: 'Growth before and after the change', html: `Growth in year t = retention<sub>t−1</sub> × ROE.<br>Years 1, 2, 3 use the retention of years 0, 1, 2 (${pct0(1 - r.po0)}): g = ${F.n(1 - r.po0, 2)} × ${P(r.roe)} = <b>${P(r.g1)}</b>.<br>From year 4, growth uses the retention of year 3 onwards (${pct0(1 - d.po2)}): g = ${F.n(1 - d.po2, 2)} × ${P(r.roe)} = <b>${P(r.g2)}</b>.` },
      { t: 'Earnings and dividends, years 1 to 3', html: tbl(['Year', 'EPS', 'Payout', 'DPS'], [
        ['1', F.n(r.E1, 4), pct0(r.po0), F.n(r.D1, 4)], ['2', F.n(r.E2, 4), pct0(r.po0), F.n(r.D2, 4)], ['3', F.n(r.E3, 4), pct0(d.po2), '<b>' + F.n(r.D3, 4) + '</b>']]) +
        `DPS<sub>3</sub> jumps because the payout rises to ${pct0(d.po2)}, even though EPS<sub>3</sub> grew at the old rate.` },
      { t: 'Value at the end of year 2', html: `From year 3 on, the dividends D<sub>3</sub>, D<sub>4</sub>, D<sub>5</sub> … each grow by ${P(r.g2)} over the one before (D<sub>4</sub> = D<sub>3</sub> × ${F.n(1 + r.g2, 2)}, and so on). D<sub>3</sub> itself jumped because the payout rose, but from D<sub>3</sub> onwards the growth is a steady ${P(r.g2)}. So they form a growing perpetuity whose first dividend is D<sub>3</sub>:<div class="formula">P<sub>2</sub> = D<sub>3</sub> ÷ (r − g) = ${F.n(r.D3, 4)} ÷ (${P(d.r)} − ${P(r.g2)}) = ₹${F.n(r.P2, 2)}</div>(Equivalently, P<sub>3</sub> = D<sub>4</sub> ÷ (r − g) = ₹${F.n(r.D3 * (1 + r.g2) / (d.r - r.g2), 2)}, and you then discount D<sub>3</sub> + P<sub>3</sub> from year 3. Same answer.)` },
      { t: 'Value today', html: `<div class="formula">P<sub>0</sub> = ${F.n(r.D1, 4)} ÷ ${F.n(1 + d.r, 2)} + (${F.n(r.D2, 4)} + ${F.n(r.P2, 2)}) ÷ ${F.n(1 + d.r, 2)}<sup>2</sup> = ${F.n(r.D1 / (1 + d.r), 2)} + ${F.n((r.D2 + r.P2) / Math.pow(1 + d.r, 2), 2)} = <b>${R(r.P0)}</b></div>` },
      { t: 'PVGO', html: `If Kota had no growth opportunities, EPS would stay at ₹${d.E0} forever and the share would be worth EPS<sub>0</sub> ÷ r = ${d.E0} ÷ ${P(d.r)} = ₹${F.n(r.aip, 2)} (the value of assets in place).<div class="formula">PVGO = ${F.n(r.P0, 2)} − ${F.n(r.aip, 2)} = <b>${R(r.pvgo)}</b></div>That is ${P(r.pvgo / r.P0)} of the share price: the part investors pay for future growth.` }],
    takeaway: (d, r) => `Real companies change their payout as they mature. Timing matters: a payout change in year 3 changes dividends in year 3 but growth only from year 4, because growth comes from what was kept back the year before. About ${F.n(r.pvgo / r.P0 * 100, 0)}% of Kota's value is the market paying for growth, not for today's earnings.`
  });

  /* ---------------- Case 4 (Hard): three-stage DDM and the market's implied stable growth ---------------- */
  problems.push({
    id: 's12-P4', code: 'Case 4', level: 'Hard',
    title: 'A solar company: three growth stages, and what the market price assumes',
    covers: 'CAPM · three-stage DDM (high growth, transition, stable) · terminal value · implied stable growth · the g < R<sub>f</sub> check',
    data: { rf: 0.073, beta: 1.2, mrp: 0.07, D0: 4, gs: [0.20, 0.20, 0.12], gst: 0.06, price: 80 },
    story: d => `<p><b>Thar Renewables Ltd</b> builds solar parks in Rajasthan. It has <b>just paid</b> a dividend of <b>₹${d.D0}</b> per share. Analysts expect dividends to grow:</p>` +
      tbl(['Stage', 'Years', 'Dividend growth'], [['High growth', '1 and 2', P(d.gs[0]) + ' a year'], ['Transition', '3', P(d.gs[2])], ['Stable', '4 onwards, forever', P(d.gst) + ' a year']]) +
      `<p>Thar's beta is <b>${d.beta.toFixed(2)}</b>, the 10-year G-sec yields <b>${P(d.rf)}</b> and the market risk premium is <b>${P(d.mrp)}</b>.</p>
      <p>The share trades at <b>₹${d.price}</b>.</p>`,
    solve(d) {
      const r = d.rf + d.beta * d.mrp, D1 = d.D0 * (1 + d.gs[0]), D2 = D1 * (1 + d.gs[1]), D3 = D2 * (1 + d.gs[2]);
      const P3 = D3 * (1 + d.gst) / (r - d.gst);
      const pvD = D1 / (1 + r) + D2 / Math.pow(1 + r, 2) + D3 / Math.pow(1 + r, 3), pvTV = P3 / Math.pow(1 + r, 3), P0 = pvD + pvTV;
      const K = (d.price - pvD) * Math.pow(1 + r, 3), gi = (K * r - D3) / (K + D3);
      return { r, D1, D2, D3, P3, pvD, pvTV, P0, K, gi };
    },
    parts: [
      { key: 'r', label: '(a) Cost of equity, r', unit: '%' },
      { key: 'D3', label: '(b) Dividend per share in year 3, DPS<sub>3</sub>', unit: '₹' },
      { key: 'P3', label: '(c) Value at the end of year 3 of all dividends from year 4 onwards, P<sub>3</sub>', unit: '₹' },
      { key: 'P0', label: '(d) Value of one share today', unit: '₹' },
      { key: 'gi', label: '(e) Keeping the dividends of years 1–3 as forecast, the stable growth rate (from year 4) that would justify the market price of ₹80', unit: '%' }],
    hints: ['D<sub>1</sub> = 4 × 1.20, D<sub>2</sub> = D<sub>1</sub> × 1.20, D<sub>3</sub> = D<sub>2</sub> × 1.12.',
      'From year 4, dividends grow at 6% forever: P<sub>3</sub> = D<sub>4</sub> ÷ (r − g) with D<sub>4</sub> = D<sub>3</sub> × 1.06.',
      'P<sub>0</sub> = D<sub>1</sub>/(1+r) + D<sub>2</sub>/(1+r)<sup>2</sup> + (D<sub>3</sub> + P<sub>3</sub>)/(1+r)<sup>3</sup>.',
      'For (e): subtract the PV of D<sub>1</sub>, D<sub>2</sub>, D<sub>3</sub> from ₹80. What is left, grown to year 3 (× (1+r)<sup>3</sup>), must equal D<sub>3</sub>(1 + g) ÷ (r − g). Solve for g.'],
    steps: (d, r) => [
      { t: 'Cost of equity', html: `r = ${P(d.rf)} + ${d.beta.toFixed(2)} × ${P(d.mrp)} = <b>${P(r.r)}</b>` },
      { t: 'Dividends in the first three years', html: tbl(['Year', 'Growth', 'Dividend', 'PV at ' + P(r.r)], [
        ['1', P(d.gs[0]), F.n(r.D1, 4), F.n(r.D1 / (1 + r.r), 4)], ['2', P(d.gs[1]), F.n(r.D2, 4), F.n(r.D2 / Math.pow(1 + r.r, 2), 4)], ['3', P(d.gs[2]), '<b>' + F.n(r.D3, 4) + '</b>', F.n(r.D3 / Math.pow(1 + r.r, 3), 4)],
        ['', '', 'Total', F.n(r.pvD, 4)]]) },
      { t: 'Terminal value at the end of year 3', html: `<div class="formula">P<sub>3</sub> = D<sub>4</sub> ÷ (r − g) = ${F.n(r.D3, 4)} × ${F.n(1 + d.gst, 2)} ÷ (${P(r.r)} − ${P(d.gst)}) = ${F.n(r.D3 * (1 + d.gst), 4)} ÷ ${F.n(r.r - d.gst, 3)} = <b>${R(r.P3)}</b></div>P<sub>3</sub> is a year-3 amount, because the growing perpetuity formula gives the value one period before its first cash flow (D<sub>4</sub>).` },
      { t: 'Value today', html: `<div class="formula">P<sub>0</sub> = ${F.n(r.pvD, 4)} + ${F.n(r.P3, 4)} ÷ ${F.n(1 + r.r, 3)}<sup>3</sup> = ${F.n(r.pvD, 2)} + ${F.n(r.pvTV, 2)} = <b>${R(r.P0)}</b></div>The terminal value is ${P(r.pvTV / r.P0)} of the value: most of what you pay for a growing company is the stable stage far in the future.` },
      { t: 'Stable growth implied by ₹80', html: `Part of the price paid for years 1–3: ₹${F.n(r.pvD, 4)}. The rest, ${d.price} − ${F.n(r.pvD, 4)} = ₹${F.n(d.price - r.pvD, 4)}, is what the stable stage must be worth today. At the end of year 3 that is ${F.n(d.price - r.pvD, 4)} × ${F.n(1 + r.r, 3)}<sup>3</sup> = ₹${F.n(r.K, 2)}.<div class="formula">${F.n(r.K, 2)} = ${F.n(r.D3, 4)}(1 + g) ÷ (${F.n(r.r, 3)} − g)</div>${F.n(r.K, 2)} × ${F.n(r.r, 3)} − ${F.n(r.D3, 4)} = (${F.n(r.K, 2)} + ${F.n(r.D3, 4)})g ⟹ g = ${F.n(r.K * r.r - r.D3, 4)} ÷ ${F.n(r.K + r.D3, 4)} = <b>${P(r.gi)}</b>` },
      { t: 'Extra insight (not asked): is the market\'s assumption reasonable?', html: `Stable growth lasts forever, so it should stay below the long-run growth of the economy, for which R<sub>f</sub> = ${P(d.rf)} is a good proxy. The market price needs <b>${P(r.gi)}</b> a year forever, which is above ${P(d.rf)}. The analysts' 6% gives ₹${F.n(r.P0, 2)}, well below ₹${d.price}. Either the market expects a much longer high-growth period than the analysts do, or the share is expensive.` }],
    takeaway: (d, r) => `For a growing company the terminal value is most of the price (${F.n(r.pvTV / r.P0 * 100, 0)}% here), so the stable growth rate is the single most powerful assumption in the model. Backing it out of the market price and checking it against the risk-free rate is a quick way to spot a market that is assuming more than an economy can deliver.`
  });

  /* ---------------- Case 5 (Hard): declining dividends, negative PVGO, single-period check ---------------- */
  problems.push({
    id: 's12-P5', code: 'Case 5', level: 'Hard',
    title: 'A coal miner in decline: negative growth and negative PVGO',
    covers: 'Constant then negative growth · two-stage DDM · PVGO below zero · single-period DDM (one-year price) · implied rate of decline',
    data: { E0: 30, r: 0.12, flat: 2, gd: -0.04, price: 170 },
    story: d => `<p><b>Godavari Coal Ltd</b> has no debt and pays out <b>all</b> of its earnings as dividends, so its dividend always equals its EPS. It has just paid <b>₹${d.E0}</b> per share.</p>
      <p>Its mines are still productive, so the dividend is expected to stay at <b>₹${d.E0}</b> in <b>years 1 and 2</b>. After that, as mines run down and coal demand falls, the dividend is expected to <b>shrink by ${P(-d.gd)} a year forever</b>, starting in year 3 (so D<sub>3</sub> = ${d.E0} × ${F.n(1 + d.gd, 2)}).</p>
      <p>The cost of equity is <b>${P(d.r)}</b>.</p>`,
    solve(d) {
      const D1 = d.E0, D2 = d.E0, D3 = d.E0 * (1 + d.gd), P2 = D3 / (d.r - d.gd), P1 = (D2 + P2) / (1 + d.r);
      const P0 = D1 / (1 + d.r) + (D2 + P2) / Math.pow(1 + d.r, 2), aip = d.E0 / d.r, pvgo = P0 - aip;
      const P2m = (d.price - D1 / (1 + d.r)) * Math.pow(1 + d.r, 2) - D2, gi = (P2m * d.r - d.E0) / (P2m + d.E0);
      return { D1, D2, D3, P2, P1, P0, aip, pvgo, P2m, gi };
    },
    parts: [
      { key: 'P2', label: '(a) Value at the end of year 2 of all dividends from year 3 onwards, P<sub>2</sub>', unit: '₹' },
      { key: 'P0', label: '(b) Value of one share today', unit: '₹' },
      { key: 'pvgo', label: '(c) PVGO per share (enter a negative number if it is negative)', unit: '₹' },
      { key: 'P1', label: '(d) Expected share price one year from now, just after D<sub>1</sub> is paid', unit: '₹' },
      { key: 'gi', label: '(e) The share trades at ₹170. Keeping D<sub>1</sub> = D<sub>2</sub> = ₹30, what yearly growth rate from year 3 does this price imply? (negative for a decline)', unit: '%' }],
    hints: ['The growing perpetuity formula works with a negative g: P<sub>2</sub> = D<sub>3</sub> ÷ (r − g) = D<sub>3</sub> ÷ (r + 4%).',
      'P<sub>0</sub> = D<sub>1</sub>/(1+r) + (D<sub>2</sub> + P<sub>2</sub>)/(1+r)<sup>2</sup>.',
      'With no growth opportunities, EPS would stay at ₹30 forever, worth EPS<sub>0</sub> ÷ r. PVGO is the difference from P<sub>0</sub>.',
      'One year from now, the share is worth the PV (at that date) of D<sub>2</sub> and P<sub>2</sub>. Check it with the single-period model: P<sub>0</sub> = (D<sub>1</sub> + P<sub>1</sub>) ÷ (1 + r).',
      'For (e): find what P<sub>2</sub> must be for the price to be ₹170, then solve P<sub>2</sub> = 30(1 + g) ÷ (r − g) for g.'],
    steps: (d, r) => [
      { t: 'Terminal value at the end of year 2', html: `D<sub>3</sub> = ${d.E0} × ${F.n(1 + d.gd, 2)} = ₹${F.n(r.D3, 2)}. From year 3 the dividend shrinks by ${P(-d.gd)} a year: a growing perpetuity with g = ${P(d.gd)}.<div class="formula">P<sub>2</sub> = D<sub>3</sub> ÷ (r − g) = ${F.n(r.D3, 2)} ÷ (${P(d.r)} − (${P(d.gd)})) = ${F.n(r.D3, 2)} ÷ ${F.n(d.r - d.gd, 2)} = <b>${R(r.P2)}</b></div>Subtracting a negative growth rate makes the denominator bigger, so the value is smaller.` },
      { t: 'Value today', html: `<div class="formula">P<sub>0</sub> = ${d.E0} ÷ ${F.n(1 + d.r, 2)} + (${d.E0} + ${F.n(r.P2, 2)}) ÷ ${F.n(1 + d.r, 2)}<sup>2</sup> = ${F.n(r.D1 / (1 + d.r), 4)} + ${F.n((r.D2 + r.P2) / Math.pow(1 + d.r, 2), 4)} = <b>${R(r.P0)}</b></div>` },
      { t: 'PVGO', html: `Assets in place: if EPS simply stayed at ₹${d.E0} forever, the share would be worth ${d.E0} ÷ ${P(d.r)} = ₹${F.n(r.aip, 2)}.<div class="formula">PVGO = ${F.n(r.P0, 2)} − ${F.n(r.aip, 2)} = <b>${R(r.pvgo)}</b></div>PVGO is <b>negative</b>: investors expect earnings and dividends to fall below today's ₹${d.E0}, so the share is worth less than a firm that simply kept earning ₹${d.E0}.` },
      { t: 'Price one year from now (single-period check)', html: `At the end of year 1 (after D<sub>1</sub> is paid), the remaining dividends are D<sub>2</sub> and everything from year 3, which is worth P<sub>2</sub> at year 2:<div class="formula">P<sub>1</sub> = (${d.E0} + ${F.n(r.P2, 2)}) ÷ ${F.n(1 + d.r, 2)} = <b>${R(r.P1)}</b></div>Single-period model: P<sub>0</sub> = (D<sub>1</sub> + P<sub>1</sub>) ÷ (1 + r) = (${d.E0} + ${F.n(r.P1, 2)}) ÷ ${F.n(1 + d.r, 2)} = ₹${F.n((r.D1 + r.P1) / (1 + d.r), 2)} ✓. An investor who holds for one year and sells gets the same value as one who holds forever, because the selling price is itself the value of all later dividends.` },
      { t: 'Decline implied by the market price', html: `(${d.price} − ${d.E0}/${F.n(1 + d.r, 2)}) × ${F.n(1 + d.r, 2)}<sup>2</sup> = ${d.E0} + P<sub>2</sub> ⟹ P<sub>2</sub> = ${F.n((d.price - r.D1 / (1 + d.r)) * Math.pow(1 + d.r, 2), 4)} − ${d.E0} = ₹${F.n(r.P2m, 4)}<div class="formula">${F.n(r.P2m, 4)} = ${d.E0}(1 + g) ÷ (${F.n(d.r, 2)} − g) ⟹ g = (${F.n(r.P2m, 4)} × ${F.n(d.r, 2)} − ${d.E0}) ÷ (${F.n(r.P2m, 4)} + ${d.E0}) = <b>${P(r.gi)}</b></div>The market is more pessimistic than the forecast: it prices in a decline of about ${F.n(-r.gi * 100, 1)}% a year, not ${P(-d.gd)}.` }],
    takeaway: (d, r) => `A negative PVGO is not an error. It is the market saying that earnings will shrink, or that the company will put money into projects that earn less than investors require. For Godavari it is the first reason: it reinvests nothing, and its earnings simply shrink. In November 2026, Coal India and ONGC both trade below the value of their current earnings capitalised at the CAPM cost of equity: see the Real companies tab.`
  });

  window.S12_PROBLEMS = problems; // order: Case 1, 2 (medium), then 3, 4, 5 (hard)
})();
