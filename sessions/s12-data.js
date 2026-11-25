/* Session 12: real-company data (as of 25 Nov 2026) and the Real companies lab.
   Approximate teaching inputs compiled from public sources; verify before any real use. */
(function () {
  'use strict';
  const { h, F, tip, lineChart } = ICF;
  const P = (x, d = 2) => F.pct(x, d);
  const pc = x => (x < 0 ? '−' : '') + F.n(Math.abs(x) * 100, 0) + '%'; // share of price
  const A = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;

  const MACRO = { rf: 0.0734, erp: 0.0692 }; // same inputs as Session 11 (10-yr G-sec; Damodaran India ERP, Jul 2026)

  /* p: share price (NSE close, 25 Nov 2026); beta: 5-yr monthly regression vs Nifty 50 (58 months, Dec 2021–Oct 2026, our calculation);
     d0: dividends per share with ex-dates in the 12 months to 25 Nov 2026; eps: trailing-12-month EPS (consolidated);
     ni: FY2026 net profit (₹ cr); bv: book equity at 31 Mar 2025 (₹ cr, equity capital + reserves); po: FY2026 dividend payout; bvps: latest book value per share */
  const CO = [
    { id: 'itc', tk: 'ITC', n: 'ITC Ltd', p: 309.25, beta: 0.832, d0: 14.50, eps: 15.08, ni: 21018, bv: 70030, po: 0.88, bvps: 57.0,
      what: 'Cigarettes, packaged foods, paperboard and agri-business. Pays out most of its earnings every year.',
      insight: 'ITC pays out almost everything it earns, so retention × ROE gives only about 3.6% growth. Yet the market price needs about 8% growth forever, which is above the risk-free rate. The price is not explained by a single stable growth rate: either investors expect faster growth for some years first, or they require a lower return than our CAPM estimate.' },
    { id: 'coal', tk: 'COALINDIA', n: 'Coal India', p: 385.0, beta: 0.605, d0: 26.50, eps: 54.13, ni: 31071, bv: 101721, po: 0.53, bvps: 207,
      what: 'India\'s state-owned coal miner, one of the highest dividend payers on the Nifty.',
      insight: '<b>PVGO is negative.</b> Today\'s earnings, capitalised at the cost of equity, are worth more than the share price. The market expects coal earnings to fall as India shifts to other energy sources, exactly the situation in Real-world case 5. Retention × ROE says 14%, but that formula assumes Coal India can keep earning a 30% ROE on the money it reinvests, which the market clearly does not believe.' },
    { id: 'ongc', tk: 'ONGC', n: 'ONGC', p: 222.0, beta: 0.609, d0: 15.25, eps: 39.33, ni: 49793, bv: 343440, po: 0.22, bvps: 318,
      what: 'State-owned oil and gas producer. The consolidated figures include its refining subsidiaries (HPCL and MRPL).',
      insight: 'Two warning signs at once: the share trades <b>below book value</b> (₹222 against ₹318 of book value per share) and <b>PVGO is negative</b>. Investors expect earnings from oil and gas to shrink over time. Its payout has also jumped around (22% to 43% over the last six years), which makes the dividend model less reliable here.' },
    { id: 'tcs', tk: 'TCS', n: 'TCS', p: 2517.3, beta: 1.078, d0: 112.0, eps: 142.64, ni: 49454, bv: 94756, po: 0.81, bvps: 329,
      what: 'India\'s largest IT services company. No borrowings, a very high ROE and a high payout.',
      insight: 'The ₹112 of dividends includes a ₹46 special dividend (ex-dividend 16 January 2026), so D<sub>0</sub> is higher than a normal year. Even so, the price implies about 9.9% growth forever, above the risk-free rate, so a single-stage model cannot justify it. With ROE above 50%, the little TCS keeps back still grows earnings fast.' },
    { id: 'infy', tk: 'INFY', n: 'Infosys', p: 1130.0, beta: 0.802, d0: 51.0, eps: 75.80, ni: 29474, bv: 95818, po: 0.66, bvps: 244,
      what: 'IT services. EPS has risen steadily for ten years and the payout has stayed within a narrow band.',
      insight: 'A textbook case for the dividend model: steady earnings and a dividend that moves with them (see the chart below). About half of its price is the value of growth opportunities.' },
    { id: 'hero', tk: 'HEROMOTOCO', n: 'Hero MotoCorp', p: 5751.5, beta: 0.984, d0: 185.0, eps: 299.91, ni: 5776, bv: 19272, po: 0.64, bvps: 1170,
      what: 'India\'s largest two-wheeler maker. Pays two dividends a year and has no debt.',
      insight: 'Its payout has stayed between 46% and 82% for a decade. Retention × ROE (about 10.8%) and the growth implied by the price (about 10.6%) are close to each other, but both are above the risk-free rate, so the price includes a period of above-normal growth.' },
    { id: 'pg', tk: 'POWERGRID', n: 'Power Grid', p: 266.75, beta: 0.955, d0: 7.50, eps: 17.42, ni: 15928, bv: 92663, po: 0.53, bvps: 115,
      what: 'The national power-transmission company. Its returns are set by the regulator, so earnings are steady.',
      insight: 'Its beta over 2021–26 (0.96) is higher than you might expect for a regulated utility, which pushes up the cost of equity and with it the implied growth rate. Try a lower beta in the inputs: at β = 0.6 the implied growth falls to about 8.4%. This shows how much the answer depends on the discount rate.' },
    { id: 'titan', tk: 'TITAN', n: 'Titan', p: 4686.6, beta: 1.233, d0: 15.0, eps: 79.22, ni: 5073, bv: 11624, po: 0.26, bvps: 206,
      what: 'Tanishq jewellery, watches and eyewear. Pays out only about a quarter of its earnings and reinvests the rest.',
      insight: '<b>About 89% of the price is PVGO.</b> Investors are paying almost entirely for future growth, not for today\'s earnings. The price implies 15.5% growth forever, far above the risk-free rate, so a single-stage model is the wrong tool: a growth company like this needs a multi-stage model with a long high-growth period.' },
    { id: 'asian', tk: 'ASIANPAINT', n: 'Asian Paints', p: 2621.2, beta: 1.167, d0: 28.75, eps: 50.45, ni: 4395, bv: 19400, po: 0.61, bvps: 227,
      what: 'India\'s largest paint company.',
      insight: 'Like Titan, about 88% of its price is PVGO, even though its payout is higher. The price implies about 14% growth forever, far above both the risk-free rate and the 8.8% that retention × ROE delivers today. Investors are counting on many years of faster growth.' }
  ];
  window.S12_COMPANIES = CO;

  function calc(c, ov) {
    const v = k => (ov[k] != null ? ov[k] : c[k]);
    const p = v('p'), beta = v('beta'), d0 = v('d0'), eps = v('eps');
    const r = MACRO.rf + beta * MACRO.erp, gi = (r * p - d0) / (p + d0), aip = eps / r, pvgo = p - aip;
    const roe = c.ni / c.bv, gf = (1 - c.po) * roe;
    return { p, beta, d0, eps, r, gi, aip, pvgo, roe, gf, pb: p / c.bvps, yld: d0 / p };
  }

  // ------- payout history: Firm A vs Firm B (class slide), with real companies -------
  const YRS = ['FY15', 'FY16', 'FY17', 'FY18', 'FY19', 'FY20', 'FY21', 'FY22', 'FY23', 'FY24', 'FY25', 'FY26'];
  const HIST = {
    infy: { n: 'Infosys', eps: [26.93, 29.36, 31.24, 36.69, 35.26, 38.96, 45.42, 52.56, 58.08, 63.20, 64.32, 72.59], po: [.55, .41, .41, .59, .60, .45, .59, .59, .58, .73, .67, .66] },
    tata: { n: 'Tata Steel', eps: [-3.85, -0.38, -4.16, 11.93, 9.07, 1.38, 6.26, 32.88, 7.17, -3.55, 2.74, 8.65], po: [-.20, -2.03, -.23, .09, .15, .74, .40, .16, .50, -1.01, 1.31, .46] }
  };
  Object.values(HIST).forEach(x => { x.dps = x.eps.map((e, i) => e * x.po[i]); });

  // ------- Sources -------
  const SRC = {
    screener: tk => `https://www.screener.in/company/${tk}/consolidated/`,
    yhist: tk => `https://finance.yahoo.com/quote/${tk}.NS/history/`,
    ydiv: tk => `https://finance.yahoo.com/quote/${tk}.NS/history/?filter=div`,
    nifty: 'https://finance.yahoo.com/quote/%5ENSEI/history/',
    te: 'https://tradingeconomics.com/india/government-bond-yield',
    damCtry: 'https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html'
  };
  const coSources = c => `<details class="srcbox"><summary>Sources for ${c.n}</summary><ul class="muted">
      <li><b>Share price, EPS, net profit, book value and payout:</b> ${A(SRC.screener(c.tk), 'screener.in: ' + c.tk)} (consolidated). Price at the NSE close on 25 Nov 2026; EPS for the trailing 12 months; net profit and payout for the year to 31 Mar 2026; book equity at 31 Mar 2025.</li>
      <li><b>Dividends (D<sub>0</sub>):</b> all dividends with ex-dates from 26 Nov 2025 to 25 Nov 2026, from ${A(SRC.ydiv(c.tk), 'Yahoo Finance dividend history')}.</li>
      <li><b>Beta:</b> our own calculation: monthly returns of the share (${A(SRC.yhist(c.tk), 'price history')}) regressed on monthly returns of the ${A(SRC.nifty, 'Nifty 50')}, December 2021 to October 2026 (58 months).</li></ul></details>`;

  function notesCard() {
    return h('div', { class: 'card notes' },
      h('h3', null, 'How every number is built, and where it comes from'),
      h('p', { class: 'muted' }, 'All market data are as of 25 November 2026, except R<sub>f</sub> (17 November 2026, as in Session 11). Links open the original source in a new tab.'),
      h('div', { html: `
      <h4>1. Cost of equity r (CAPM)</h4>
      <p>r = R<sub>f</sub> + β × market risk premium, with R<sub>f</sub> = ${P(MACRO.rf)} (10-year G-sec, ${A(SRC.te, 'Trading Economics')}) and a premium of ${P(MACRO.erp)} (${A(SRC.damCtry, 'Damodaran\'s estimate for India')}), the same inputs as Session 11.</p>
      <h4>2. Beta</h4>
      <p>Different websites report very different betas for the same company, because they use different periods and return intervals (daily, weekly, monthly). To keep every company comparable, we calculated all betas the same way: 58 monthly returns of each share (adjusted for dividends and splits) regressed on monthly returns of the Nifty 50, December 2021 to October 2026. Because the method differs, some betas differ from those used in Session 11 (TCS: 1.08 here, 0.74 there). The beta is a key input; change it in the inputs box and watch every result move.</p>
      <h4>3. Dividend just paid, D<sub>0</sub></h4>
      <p>The sum of all dividends per share that went ex-dividend in the 12 months to 25 November 2026 (interim, final and special). This is the "dividend just received" in the stable growth model.</p>
      <h4>4. Growth implied by the price</h4>
      <p>Set the price equal to the stable growth model and solve for g: P<sub>0</sub> = D<sub>0</sub>(1 + g) ÷ (r − g) gives <b>g = (r × P<sub>0</sub> − D<sub>0</sub>) ÷ (P<sub>0</sub> + D<sub>0</sub>)</b>. Compare it with R<sub>f</sub> (${P(MACRO.rf)}), the ceiling for growth that lasts forever.</p>
      <h4>5. PVGO</h4>
      <p>Value of assets in place = EPS<sub>0</sub> ÷ r, using trailing-12-month EPS. PVGO = price − EPS<sub>0</sub> ÷ r.</p>
      <h4>6. Fundamental growth</h4>
      <p>Retention ratio × ROE, with retention = 1 − FY2026 payout ratio, and ROE = FY2026 net profit ÷ book equity at the <i>start</i> of the year (31 Mar 2025), as defined in class. Consolidated net profit includes the share of subsidiaries' profits that belongs to minority shareholders, so the ROE here is approximate.</p>
      <p class="callout warn">These inputs were gathered from public sources on 25 Nov 2026. They are approximate and are not investment advice.</p>` }));
  }

  // ------- Real companies renderer -------
  window.S12_REAL = function (host) {
    const o = { sel: 'coal', ov: {} };
    const list = h('div', { class: 'list-co' }), detail = h('div'), cmp = h('div');
    host.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Real world · data as of 25 Nov 2026'),
      h('h2', null, 'What are Indian share prices assuming?'),
      h('p', { class: 'lede', html: 'Run the session\'s tools backwards on nine large Indian dividend payers. For each company: the cost of equity from CAPM, the stable growth rate the price implies, how much of the price is PVGO, and the growth that retention × ROE delivers. Every input is editable.' })));
    host.append(h('div', { class: 'grid side' }, h('div', { class: 'card tight' }, list), detail));
    host.append(h('div', { class: 'card' }, h('h3', null, 'How much of each price is paying for growth?'),
      h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)', height: '10px' } }), 'Assets in place: EPS₀ ÷ r'), h('span', null, h('i', { class: 'hatch', style: { background: 'var(--s2)', height: '10px' } }), 'PVGO (positive)'), h('span', null, h('i', { style: { background: 'var(--bad)', height: '10px' } }), 'Negative PVGO: assets in place are worth more than the price')),
      cmp, h('p', { class: 'muted' }, 'Each bar is the share price (100%); the number on the right is PVGO as a share of the price. Click a bar to open that company. Companies whose price is mostly PVGO (Titan, Asian Paints) are priced as growth companies; companies with negative PVGO (Coal India, ONGC) are priced for decline.')));

    // DDM relevance: Firm A vs Firm B with real data
    const chA = h('div'), chB = h('div');
    const mk = (el, x, col) => lineChart(el, { width: 520, height: 260, aria: x.n + ' EPS and DPS', x: { min: 0, max: 11, fmt: v => YRS[Math.round(v)] || '' }, y: { min: Math.min(0, ...x.eps) - 2, max: Math.max(...x.eps) * 1.1, fmt: v => '₹' + F.n(v, 0) },
      series: [{ name: 'EPS', color: col, data: x.eps.map((v, i) => [i, v]) }, { name: 'DPS', color: 'var(--s3)', width: 3, data: x.dps.map((v, i) => [i, v]) }],
      tipFmt: (xv, vals) => `<b>${x.n}, ${YRS[xv]}</b><br>EPS ₹${F.n(x.eps[xv], 2)} · DPS ₹${F.n(x.dps[xv], 2)}<br>payout ${x.eps[xv] > 0 ? P(x.po[xv], 0) : 'n.a. (loss)'}` });
    host.append(h('div', { class: 'card' }, h('h3', null, 'Is the dividend model the right tool? Firm A and Firm B in real life'),
      h('p', { class: 'muted', html: 'The class slide compared a firm whose dividend has nothing to do with its earnings (Firm A) with one whose dividend tracks earnings (Firm B). Here are real examples of both, per share, FY2015–FY2026 (Tata Steel adjusted for its 2022 share split).' }),
      h('div', { class: 'grid g2' }, h('div', null, h('h4', null, 'Infosys: like Firm B'), chB, h('p', { class: 'muted' }, 'EPS rises steadily and the dividend rises with it (payout 41–73%). The dividend model fits.')),
        h('div', null, h('h4', null, 'Tata Steel: like Firm A'), chA, h('p', { class: 'muted' }, 'Steel profits swing with global steel prices: losses in FY15–17 and FY24, a boom in FY22. The dividend stayed between about ₹0.8 and ₹5.3 a share throughout, sometimes more than the year\'s earnings, so it tells you little about value. The dividend model does not fit.'))),
      h('div', { class: 'callout', html: '<b>And a firm that pays nothing.</b> Eternal (Zomato and Blinkit) paid no dividend in any year from FY2021 to FY2026. The dividend model cannot value it at all. This is the "young, high-growth firm" case from the slides.' })));
    host.append(notesCard());

    function redraw() {
      list.innerHTML = '';
      CO.forEach(c => {
        const r = calc(c, o.ov[c.id] || {});
        list.append(h('button', { class: o.sel === c.id ? 'on' : '', onclick: () => { o.sel = c.id; redraw(); } }, h('span', null, c.n), h('b', { style: { color: r.pvgo < 0 ? 'var(--bad)' : null } }, 'PVGO ' + pc(r.pvgo / r.p))));
      });
      const c = CO.find(x => x.id === o.sel), ov = o.ov[c.id] = o.ov[c.id] || {}, r = calc(c, ov);
      const inp = k => { const e = h('input', { class: 'editable', type: 'number', step: 'any', value: ov[k] != null ? ov[k] : c[k] }); e.addEventListener('change', () => { const v = parseFloat(e.value); if (isFinite(v)) ov[k] = v; else delete ov[k]; redraw(); }); return e; };
      const kpis = h('div', { class: 'statrow' }, ...[['Cost of equity r', P(r.r)], ['Implied stable growth', P(r.gi), r.gi > MACRO.rf ? 'var(--bad)' : 'var(--good)'], ['PVGO share of price', pc(r.pvgo / r.p), r.pvgo < 0 ? 'var(--bad)' : null], ['Retention × ROE', P(r.gf, 1)], ['Price ÷ book', F.n(r.pb, 2) + '×', r.pb < 1 ? 'var(--bad)' : null]]
        .map(([l, v, col]) => h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: col || null } }, v), h('div', { class: 'l', html: l }))));
      const steps = h('div', { html: `
        <div class="step"><h4>1. Cost of equity</h4>r = ${P(MACRO.rf)} + ${F.n(r.beta, 3)} × ${P(MACRO.erp)} = <b>${P(r.r)}</b></div>
        <div class="step"><h4>2. Growth implied by the price</h4>g = (${F.n(r.r, 4)} × ${F.n(r.p, 2)} − ${F.n(r.d0, 2)}) ÷ (${F.n(r.p, 2)} + ${F.n(r.d0, 2)}) = <b>${P(r.gi)}</b><br><span style="color:var(${r.gi > MACRO.rf ? '--bad' : '--good'})">${r.gi > MACRO.rf ? `Above R<sub>f</sub> (${P(MACRO.rf)}): no company can grow this fast forever, so the price must include a period of faster growth first (or investors require less than ${P(r.r)}).` : `Below R<sub>f</sub> (${P(MACRO.rf)}): a growth rate the economy could sustain forever.`}</span></div>
        <div class="step"><h4>3. PVGO</h4>Assets in place = ${F.n(r.eps, 2)} ÷ ${P(r.r)} = ₹${F.big(r.aip, 1)}<br>PVGO = ${F.big(r.p, 2)} − ${F.big(r.aip, 1)} = <b>${r.pvgo < 0 ? '−' : ''}₹${F.big(Math.abs(r.pvgo), 1)}</b> (${pc(r.pvgo / r.p)} of the price)</div>
        <div class="step"><h4>4. Fundamental growth</h4>ROE = ₹${F.big(c.ni)} cr ÷ ₹${F.big(c.bv)} cr = ${P(r.roe, 1)}; retention = 1 − ${P(c.po, 0)} = ${P(1 - c.po, 0)}<br>g = ${F.n(1 - c.po, 2)} × ${P(r.roe, 1)} = <b>${P(r.gf, 1)}</b></div>` });
      detail.innerHTML = '';
      detail.append(h('div', { class: 'card' },
        h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, c.n), h('span', { class: 'spacer' }), h('button', { class: 'btn small', onclick: () => { delete o.ov[c.id]; redraw(); } }, 'Reset inputs')),
        h('p', { class: 'muted', style: { marginTop: '6px' } }, c.what), kpis,
        h('div', { class: 'callout', html: '<b>What this shows:</b> ' + c.insight }),
        h('div', { html: coSources(c) }),
        h('div', { class: 'grid g2' },
          h('div', null, h('h4', null, 'Inputs (editable)'), h('div', { class: 'kv' },
            h('div', null, 'Share price (₹)'), h('div', null, inp('p')),
            h('div', null, 'Beta'), h('div', null, inp('beta')),
            h('div', null, 'Dividends, last 12 months: D₀ (₹)'), h('div', null, inp('d0')),
            h('div', null, 'EPS, last 12 months: EPS₀ (₹)'), h('div', null, inp('eps'))),
            h('p', { class: 'faint', style: { fontSize: '.8rem', marginTop: '8px' } }, `Rf ${P(MACRO.rf)}, market risk premium ${P(MACRO.erp)}. Dividend yield ${P(r.yld)}. Book value per share ₹${F.n(c.bvps, 0)}.`)),
          h('div', null, h('h4', null, 'The calculation'), steps))));
      // comparison bars (as % of price)
      cmp.innerHTML = '';
      const rows = CO.map(x => ({ c: x, r: calc(x, o.ov[x.id] || {}) })).sort((a, b) => b.r.pvgo / b.r.p - a.r.pvgo / a.r.p);
      const max = Math.max(1, ...rows.map(x => x.r.aip / x.r.p));
      rows.forEach(({ c, r }) => {
        const a = Math.min(r.aip, r.p) / r.p, pv = Math.max(0, r.pvgo) / r.p, neg = Math.max(0, r.aip - r.p) / r.p;
        const t = `<b>${c.n}</b><br>Price ₹${F.big(r.p, 2)} = assets in place ₹${F.big(r.aip, 1)} + PVGO ${r.pvgo < 0 ? '−' : ''}₹${F.big(Math.abs(r.pvgo), 1)}`;
        cmp.append(h('div', { class: 'sbar-row', style: { cursor: 'pointer' }, onclick: () => { o.sel = c.id; redraw(); detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, h('div', null, c.n),
          h('div', { class: 'sbar' },
            h('div', { style: { flexBasis: (a / max * 100) + '%', background: 'var(--s1)' }, onpointermove: ev => tip(t, ev), onpointerleave: () => tip(null) }),
            pv > 0 ? h('div', { class: 'hatch', style: { flexBasis: (pv / max * 100) + '%', background: 'var(--s2)' }, onpointermove: ev => tip(t, ev), onpointerleave: () => tip(null) }) : null,
            neg > 0 ? h('div', { style: { flexBasis: (neg / max * 100) + '%', background: 'var(--bad)', opacity: 0.75 }, onpointermove: ev => tip(t, ev), onpointerleave: () => tip(null) }) : null),
          h('div', { class: 'val' }, pc(r.pvgo / r.p))));
      });
    }
    redraw();
    mk(chA, HIST.tata, 'var(--s2)'); mk(chB, HIST.infy, 'var(--s1)');
  };
})();
