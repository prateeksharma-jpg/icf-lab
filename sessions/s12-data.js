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
      insight: 'ITC pays out 88% of what it earns, so retention × ROE gives only about 3.6% growth. Yet about 63% of its price is PVGO. That much growth value does not come from so little reinvestment: either investors expect ITC\'s earnings to grow faster than 3.6%, or they require a lower return than our CAPM estimate of 13.1%. Try a lower beta in the inputs: at β = 0.6, r falls to about 11.5% and the PVGO share falls to about 58%.' },
    { id: 'coal', tk: 'COALINDIA', n: 'Coal India', p: 385.0, beta: 0.605, d0: 26.50, eps: 54.13, ni: 31071, bv: 101721, po: 0.53, bvps: 207,
      what: 'India\'s state-owned coal miner, one of the highest dividend payers on the Nifty.',
      insight: '<b>PVGO is negative.</b> Today\'s earnings, capitalised at the cost of equity, are worth more than the share price. The market expects coal earnings to fall as India shifts to other energy sources, exactly the situation in Case 5 of Concept application practice. Retention × ROE says 14%, but that formula assumes Coal India can keep earning a 30% ROE on the money it reinvests, which the market clearly does not believe.' },
    { id: 'ongc', tk: 'ONGC', n: 'ONGC', p: 222.0, beta: 0.609, d0: 15.25, eps: 39.33, ni: 49793, bv: 343440, po: 0.22, bvps: 318,
      what: 'State-owned oil and gas producer. The consolidated figures include its refining subsidiaries (HPCL and MRPL).',
      insight: 'Two warning signs at once: the share trades <b>below book value</b> (₹222 against ₹318 of book value per share) and <b>PVGO is negative</b>. Investors expect earnings from oil and gas to shrink over time. Its ROE (about 14.5%) is above its cost of equity (about 11.6%), so on paper reinvesting should add value; the negative PVGO says the market does not believe ONGC can keep earning that ROE on new oil and gas investment. Its payout has also jumped around (22% to 43% over the last six years), which makes the dividend model less reliable here.' },
    { id: 'tcs', tk: 'TCS', n: 'TCS', p: 2517.3, beta: 1.078, d0: 112.0, eps: 142.64, ni: 49454, bv: 94756, po: 0.81, bvps: 329,
      what: 'India\'s largest IT services company. No borrowings, a very high ROE and a high payout.',
      insight: 'TCS keeps back only about a fifth of its earnings, but it earns an ROE above 50% on its book, far more than its 14.8% cost of equity. When ROE is above r, reinvesting creates value, so even this small amount of reinvestment adds a lot: about 62% of the price is PVGO.' },
    { id: 'infy', tk: 'INFY', n: 'Infosys', p: 1130.0, beta: 0.802, d0: 51.0, eps: 75.80, ni: 29474, bv: 95818, po: 0.66, bvps: 244,
      what: 'IT services. EPS has risen steadily for ten years and the payout has stayed within a narrow band.',
      insight: 'A textbook case for the dividend model: steady earnings and a dividend that moves with them (see the chart below). About half of its price is the value of growth opportunities.' },
    { id: 'hero', tk: 'HEROMOTOCO', n: 'Hero MotoCorp', p: 5751.5, beta: 0.984, d0: 185.0, eps: 299.91, ni: 5776, bv: 19272, po: 0.64, bvps: 1170,
      what: 'India\'s largest two-wheeler maker. Pays two dividends a year and has no debt.',
      insight: 'Its payout has stayed between 46% and 82% for a decade. It keeps back about a third of its earnings and earns an ROE of about 30%, roughly twice its cost of equity (about 14%), so its reinvestment creates value. Retention × ROE gives about 10.8% growth, and about 63% of the price is PVGO.' },
    { id: 'pg', tk: 'POWERGRID', n: 'Power Grid', p: 266.75, beta: 0.955, d0: 7.50, eps: 17.42, ni: 15928, bv: 92663, po: 0.53, bvps: 115,
      what: 'The national power-transmission company. Its returns are set by the regulator, so earnings are steady.',
      insight: 'Its beta over 2021–26 (0.96) is higher than you might expect for a regulated utility, which pushes up the cost of equity. A higher r makes assets in place (EPS<sub>0</sub> ÷ r) worth less, so more of the price shows up as PVGO. Try a lower beta in the inputs: at β = 0.6, r falls to about 11.5% and the PVGO share falls from about 53% to about 43%. The split depends heavily on the discount rate.' },
    { id: 'titan', tk: 'TITAN', n: 'Titan', p: 4686.6, beta: 1.233, d0: 15.0, eps: 79.22, ni: 5073, bv: 11624, po: 0.26, bvps: 206,
      what: 'Tanishq jewellery, watches and eyewear. Pays out only about a quarter of its earnings and reinvests the rest.',
      insight: '<b>About 89% of the price is PVGO.</b> Investors are paying almost entirely for future growth, not for today\'s earnings. Titan pays out only about a quarter of its earnings and reinvests the rest at an ROE of about 44%, far above its 15.9% cost of equity. That is exactly when reinvesting creates value. (Retention × ROE of 32% is this year\'s growth; no company keeps that up for long.) It also trades at about 23 times its book value: its brands, such as Tanishq, are worth far more than the assets on its balance sheet.' },
    { id: 'asian', tk: 'ASIANPAINT', n: 'Asian Paints', p: 2621.2, beta: 1.167, d0: 28.75, eps: 50.45, ni: 4395, bv: 19400, po: 0.61, bvps: 227,
      what: 'India\'s largest paint company.',
      insight: 'Like Titan, about 88% of its price is PVGO, even though it pays out more (61%) and so reinvests less. Its ROE (about 23%) is above its 15.4% cost of equity, so reinvesting creates value, but retention × ROE gives only about 8.8% growth today. Such a large PVGO tells you investors expect Asian Paints to grow faster, or for longer, than today\'s numbers alone suggest.' }
  ];
  window.S12_COMPANIES = CO;

  function calc(c, ov) {
    const v = k => (ov[k] != null ? ov[k] : c[k]);
    const p = v('p'), beta = v('beta'), eps = v('eps');
    const r = MACRO.rf + beta * MACRO.erp, aip = eps / r, pvgo = p - aip;
    const roe = c.ni / c.bv, gf = (1 - c.po) * roe;
    return { p, beta, eps, r, aip, pvgo, roe, gf, pb: p / c.bvps };
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
      <li><b>Beta:</b> our own calculation: monthly returns of the share (${A(SRC.yhist(c.tk), 'price history')}) regressed on monthly returns of the ${A(SRC.nifty, 'Nifty 50')}, December 2021 to October 2026 (58 months).</li></ul></details>`;

  function notesCard() {
    return h('div', { class: 'card notes' },
      h('h3', null, 'How every number is built, and where it comes from'),
      h('p', { class: 'muted' }, 'All market data are as of 25 November 2026, except R<sub>f</sub> (17 November 2026, as in Session 11). Links open the original source in a new tab.'),
      h('div', { html: `
      <h4>1. Cost of equity r (CAPM)</h4>
      <p>r = R<sub>f</sub> + β × market risk premium, with R<sub>f</sub> = ${P(MACRO.rf)} (10-year G-sec, ${A(SRC.te, 'Trading Economics')}) and a premium of ${P(MACRO.erp)} (${A(SRC.damCtry, 'Damodaran\'s estimate for India')}), the same inputs as Session 11.</p>
      <h4>2. Beta</h4>
      <p>Different websites report very different betas for the same company, because they use different periods and return intervals (daily, weekly, monthly). To keep every company comparable, we calculated all betas the same way: 58 monthly returns of each share (adjusted for dividends and splits) regressed on monthly returns of the Nifty 50, December 2021 to October 2026. Because the method differs, some betas differ from those used in Session 11 (TCS: 1.08 here, 0.74 there; ITC: 0.83 here, 0.66 there). A beta from a single company over one five-year window is a noisy estimate: TCS (1.08) and Infosys (0.80) run similar businesses yet come out quite different. That is why Session 11 also built bottom-up betas from the average of many firms in an industry. The beta is a key input; change it in the inputs box and watch every result move.</p>
      <h4>3. PVGO</h4>
      <p>Value of assets in place = EPS<sub>0</sub> ÷ r, using trailing-12-month EPS: what the share would be worth if the company never grew and paid out all its earnings forever. PVGO = price − EPS<sub>0</sub> ÷ r, the part of the price investors pay for future growth. A negative PVGO means the price is below the value of today's earnings: investors expect earnings to fall.</p>
      <h4>4. Fundamental growth</h4>
      <p>Retention ratio × ROE, with retention = 1 − FY2026 payout ratio, and ROE = FY2026 net profit ÷ book equity at the <i>start</i> of the year (31 Mar 2025), as defined in class. This is the growth that this year's reinvestment supports if ROE stays where it is. It is not a growth rate that lasts forever: high ROEs and fast growth fade as companies mature. Consolidated net profit includes the share of subsidiaries' profits that belongs to minority shareholders, so the ROE here is approximate.</p>
      <h4>Why there is no "growth implied by the price" here</h4>
      <p>Real share prices are not set by a single stable growth model. Most companies are expected to grow fast for some years and then slow down, so forcing one forever growth rate onto a real price gives numbers that mean little. The PVGO split needs no growth assumption at all, which is why this tab uses it.</p>
      <p class="callout warn">These inputs were gathered from public sources on 25 Nov 2026. They are approximate and are not investment advice.</p>` }));
  }

  // ------- Real companies renderer -------
  window.S12_REAL = function (host) {
    const o = { sel: 'coal', ov: {} };
    const list = h('div', { class: 'list-co' }), detail = h('div'), cmp = h('div');
    host.append(h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Real world · data as of 25 Nov 2026'),
      h('h2', null, 'What are Indian share prices assuming?'),
      h('p', { class: 'lede', html: 'Apply the session\'s tools to nine large Indian dividend payers. For each company: the cost of equity from CAPM, how much of the share price pays for today\'s earnings (assets in place) and how much pays for future growth (PVGO), and the growth that retention × ROE delivers. Every input is editable.' })));
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
      const kpis = h('div', { class: 'statrow' }, ...[['Cost of equity r', P(r.r)], ['Assets in place: EPS₀ ÷ r', '₹' + F.big(r.aip, 0)], ['PVGO share of price', pc(r.pvgo / r.p), r.pvgo < 0 ? 'var(--bad)' : null], ['Retention × ROE (this year only)', P(r.gf, 1)], ['Price ÷ book', F.n(r.pb, 2) + '×', r.pb < 1 ? 'var(--bad)' : null]]
        .map(([l, v, col]) => h('div', { class: 'statbox stat' }, h('div', { class: 'v', style: { color: col || null } }, v), h('div', { class: 'l', html: l }))));
      const steps = h('div', { html: `
        <div class="step"><h4>1. Cost of equity</h4>r = ${P(MACRO.rf)} + ${F.n(r.beta, 3)} × ${P(MACRO.erp)} = <b>${P(r.r)}</b></div>
        <div class="step"><h4>2. PVGO</h4>Assets in place = ${F.n(r.eps, 2)} ÷ ${P(r.r)} = ₹${F.big(r.aip, 1)}<br>PVGO = ${F.big(r.p, 2)} − ${F.big(r.aip, 1)} = <b>${r.pvgo < 0 ? '−' : ''}₹${F.big(Math.abs(r.pvgo), 1)}</b> (${pc(r.pvgo / r.p)} of the price)</div>
        <div class="step"><h4>3. Fundamental growth</h4>ROE = ₹${F.big(c.ni)} cr ÷ ₹${F.big(c.bv)} cr = ${P(r.roe, 1)}; retention = 1 − ${P(c.po, 0)} = ${P(1 - c.po, 0)}<br>g = ${F.n(1 - c.po, 2)} × ${P(r.roe, 1)} = <b>${P(r.gf, 1)}</b><br><span class="muted">This is the growth this year's reinvestment supports. It is not a forever rate: growth that lasts forever must stay below R<sub>f</sub> (${P(MACRO.rf)}).</span></div>` });
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
            h('div', null, 'EPS, last 12 months: EPS₀ (₹)'), h('div', null, inp('eps'))),
            h('p', { class: 'faint', style: { fontSize: '.8rem', marginTop: '8px' } }, `Rf ${P(MACRO.rf)}, market risk premium ${P(MACRO.erp)}. Payout FY2026 ${P(c.po, 0)}. Book value per share ₹${F.n(c.bvps, 0)}.`)),
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
