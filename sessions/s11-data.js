/* Session 11: real-company data (as of 20–22 Nov 2026) and the Real companies lab.
   Figures are approximate teaching inputs compiled from public sources; verify before any real use. */
(function () {
  'use strict';
  const { h, F, Fin, tip, $ } = ICF;
  const P = (x, d = 2) => F.pct(x, d);

  // Damodaran synthetic rating table, large non-financial firms (Jan 2026): [min coverage, rating, spread]
  const DAM = [[8.5, 'AAA', 0.0040], [6.5, 'AA', 0.0055], [5.5, 'A+', 0.0070], [4.25, 'A', 0.0078], [3, 'A−', 0.0089], [2.5, 'BBB', 0.0111], [2.25, 'BB+', 0.0138], [2, 'BB', 0.0184],
  [1.75, 'B+', 0.0275], [1.5, 'B', 0.0321], [1.25, 'B−', 0.0509], [0.8, 'CCC', 0.0885], [0.65, 'CC', 0.1261], [0.2, 'C', 0.16], [-1e9, 'D', 0.19]];
  window.S11_RATING = DAM;

  const MACRO = {
    IN: { rf: 0.0734, rfNote: '10-yr G-sec ≈ 7.34% (17 Nov 2026)', erp: 0.0692, erpNote: 'Damodaran India total ERP, Jul 2026 (4.20% mature + 2.72% CRP)', dsp: 0.0175, tax: 0.2517, ccy: '₹ cr', big: 0 },
    US: { rf: 0.0505, rfNote: '10-yr Treasury ≈ 5.05% (19 Nov 2026)', erp: 0.0441, erpNote: 'Damodaran implied US ERP, 1 Nov 2026', dsp: 0, tax: 0.25, ccy: '$ bn', big: 2 }
  };

  // c: country; mcap/debt/lease/cash in ccy units; beta = regression beta vs local index; ind = [industry, Damodaran cash-corrected unlevered beta]
  const CO = [
    { id: 'mar', n: 'Marriott International', c: 'US', grp: 'The Marriott family today', mcap: 104.7, debt: 16.74, lease: 1.05, cash: 0.45, beta: 1.14, ebit: 4.141, int: 0.809, ind: ['Hotel/Gaming (US)', 0.88], bookE: -5.08,
      what: 'Today\'s Marriott hotel company. It runs and franchises hotels but owns very few of them.',
      insight: 'Its book equity is negative (−$5.1 bn) because it has bought back so many shares. Book values cannot be used as weights here; market values must be used, exactly as the session teaches.' },
    { id: 'hlt', n: 'Hilton Worldwide', c: 'US', grp: 'The Marriott family today', mcap: 79.3, debt: 13.02, lease: 0.95, cash: 0.77, beta: 1.07, ebit: 2.693, int: 0.620, ind: ['Hotel/Gaming (US)', 0.88], bookE: -6.56,
      what: 'A hotel company like Marriott. Hilton Hotels was one of the lodging comparables in the 1988 case.',
      insight: 'Its beta (1.07) is close to Marriott\'s (1.14): two firms in the same business carry similar systematic risk, which is why comparables work.' },
    { id: 'mcd', n: 'McDonald\'s', c: 'US', grp: 'The Marriott family today', mcap: 192.9, debt: 39.83, lease: 14.72, cash: 1.19, beta: 0.43, ebit: 12.393, int: 1.582, ind: ['Restaurant/Dining (US)', 0.78], bookE: -0.34,
      what: 'Most of its restaurants are run by franchisees, who pay McDonald\'s rent and royalties. It was a restaurant comparable in the case (beta 1.00 in 1987).',
      insight: 'Its beta is low (0.43): rent and royalties from thousands of franchisees are steady even when the economy slows, so the business carries little systematic risk.' },
    { id: 'armk', n: 'Aramark', c: 'US', grp: 'The Marriott family today', mcap: 14.2, debt: 5.23, lease: 0.31, cash: 0.69, beta: 1.17, ebit: 0.917, int: 0.321, ind: ['Business & Consumer Services (US)', 0.81], bookE: 3.49,
      what: 'Runs food and facility services for hospitals, universities and stadiums: the same business as Marriott\'s 1988 Contract Services division.',
      insight: 'In 1988 there was no listed comparable for Contract Services, so its beta had to be backed out (1.05). Aramark is the kind of comparable Cohrs did not have.' },
    { id: 'ihcl', n: 'Indian Hotels (IHCL)', c: 'IN', grp: 'Indian hospitality & food', mcap: 129817, debt: 51, lease: 2745, cash: 4345, beta: 1.27, ebit: 3147, int: 221, ind: ['Hotel/Gaming (India)', 0.76],
      what: 'Tata group hotels: Taj, Vivanta and Ginger.',
      insight: 'Its own regression beta (1.27) is much higher than the bottom-up beta built from the Indian hotel industry. Switch the beta source above to see how much this one input moves the WACC.' },
    { id: 'itch', n: 'ITC Hotels', c: 'IN', grp: 'Indian hospitality & food', mcap: 38385, debt: 0, lease: 74, cash: 2432, beta: 1.25, ebit: 1178, int: 55, ind: ['Hotel/Gaming (India)', 0.76], betaWarn: 'Listed only since January 2025, so its regression beta rests on little more than a year of data.',
      what: 'Luxury hotels separated from ITC Ltd in January 2025 and listed as their own company.',
      insight: 'It has almost no debt, so its WACC is close to its cost of equity. With so little trading history, the bottom-up (industry) beta is the more reliable estimate.' },
    { id: 'jub', n: 'Jubilant FoodWorks', c: 'IN', grp: 'Indian hospitality & food', mcap: 28024, debt: 1745, lease: 3157, cash: 335, beta: 1.38, ebit: 1035, int: 436, ind: ['Restaurant/Dining (India)', 0.57],
      what: 'Runs Domino\'s and Popeyes restaurants in India.',
      insight: 'Its interest coverage is low (EBIT is only about 2.4 times its interest bill), so its synthetic rating is lower and its cost of debt higher than the other Indian companies here.' },
    { id: 'itc', n: 'ITC Ltd', c: 'IN', grp: 'Indian conglomerates', mcap: 374830, debt: 0, lease: 400, cash: 21523, beta: 0.66, ebit: 28118, int: 85, ind: null, leaseEst: true,
      what: 'Cigarettes, packaged foods and personal care, agri-business and paperboard.',
      insight: 'Like Marriott, ITC has several businesses with different risk. One WACC for all of them would set the wrong hurdle for each, so a single industry beta cannot be used (the bottom-up option is not available here).' },
    { id: 'ril', n: 'Reliance Industries', c: 'IN', grp: 'Indian conglomerates', mcap: 1864107, debt: 374421, lease: 23579, cash: 249704, beta: 1.00, ebit: 150223, int: 27061, ind: ['Oil/Gas Integrated (India)', 0.60],
      what: 'Oil refining and petrochemicals, Jio (telecom), Retail, and oil and gas production.',
      insight: 'A refinery, a telecom network and a chain of shops carry very different risk. As in the Marriott case, each business should have its own hurdle rate; the firm-wide WACC shown here is only the average.' },
    { id: 'bha', n: 'Bharti Airtel', c: 'IN', grp: 'Indian conglomerates', mcap: 1316400, debt: 121670, lease: 73740, cash: 30720, beta: 0.67, ebit: 66728, int: 21555, ind: ['Telecom Services (India)', 0.65],
      what: 'Mobile, broadband and business telecom in India and Africa.',
      insight: 'People keep paying their phone bills in good times and bad, so the beta is low (0.67). Its debt is large in rupees (about ₹1.95 lakh crore including leases) but only about 13% of firm value, because its shares are worth far more. So its WACC is still mostly its cost of equity.' },
    { id: 'mar-i', n: 'Maruti Suzuki', c: 'IN', grp: 'Indian bellwethers', mcap: 440509, debt: 70, lease: 103, cash: 78758, beta: 1.11, ebit: 19357, int: 239, ind: ['Auto & Truck (India)', 1.11],
      what: 'India\'s largest car maker. It holds a large pile of cash and investments and has almost no borrowings.',
      insight: 'Cash is about 18% of its firm value. Cash has a beta of about zero, so in bottom-up mode the car business beta is scaled down by (1 − cash/V), as in the 2025 mid-term Maruti question.' },
    { id: 'tcs', n: 'TCS', c: 'IN', grp: 'Indian bellwethers', mcap: 859730, debt: 0, lease: 11283, cash: 41080, beta: 0.74, ebit: 66714, int: 1227, ind: ['Computer Services (India)', 0.74],
      what: 'India\'s largest IT services company. It has no borrowings.',
      insight: 'With almost no debt, debt is a tiny share of its capital, so its WACC is almost exactly its cost of equity.' }
  ];
  window.S11_COMPANIES = CO;

  function calc(c, o) {
    const m = MACRO[c.c], ov = (o.ov[c.id] || {});
    const val = k => ov[k] != null ? ov[k] : c[k];
    const E = val('mcap'), D = val('debt') + (o.lease ? val('lease') : 0), cash = val('cash'), V = D + E, de = D / E, t = m.tax;
    const rf = (o.rfm === 'dam' && c.c === 'IN') ? m.rf - m.dsp : m.rf, rfD = m.rf, erp = m.erp;
    const useBU = o.beta === 'bu' && c.ind;
    let bl, bu, note;
    if (useBU) { const cashV = Math.min(0.9, cash / V); bu = c.ind[1] * (1 - cashV); bl = Fin.lever(bu, de, t); note = `bottom-up: ${c.ind[0]} β<sub>U</sub> ${F.n(c.ind[1], 2)} × (1 − cash/V ${F.n(cashV, 3)}) = ${F.n(bu, 3)}, relevered at D/E ${F.n(de, 3)}`; }
    else { bl = val('beta'); bu = Fin.unlever(bl, de, t); note = 'regression beta vs local index (as reported)'; }
    const ke = Fin.capm(rf, bl, erp);
    const intr = val('int'), cov = intr > 0 ? val('ebit') / intr : Infinity, rt = Fin.rate(cov, DAM), kd = rfD + rt.spread;
    const w = Fin.wacc(E / V, ke, D / V, kd, t);
    return { E, D, V, cash, de, dv: D / V, t, rf, rfD, erp, bl, bu, ke, cov, rt, kd, w, note, m, useBU };
  }

  // ------- Sources (all links checked 22 Nov 2026) -------
  const DAMO = 'https://pages.stern.nyu.edu/~adamodar/';
  const SRC = {
    damHome: DAMO,
    damData: DAMO + 'New_Home_Page/data.html',
    damRatings: DAMO + 'New_Home_Page/datafile/ratings.html',
    damCtry: DAMO + 'New_Home_Page/datafile/ctryprem.html',
    damCtryXls: DAMO + 'pc/datasets/ctrypremJuly26.xlsx',
    damImpl: DAMO + 'New_Home_Page/datafile/implpr.html',
    damBetasUS: DAMO + 'New_Home_Page/datafile/Betas.html',
    damBetasIN: DAMO + 'pc/datasets/betaIndia.xls',
    teIN: 'https://tradingeconomics.com/india/government-bond-yield',
    teUS: 'https://tradingeconomics.com/united-states/government-bond-yield',
    itax: 'https://www.incometaxindia.gov.in/',
    screener: 'https://www.screener.in/',
    sa: 'https://stockanalysis.com/'
  };
  const A = (url, text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;
  const TICK = { mar: 'MAR', hlt: 'HLT', mcd: 'MCD', armk: 'ARMK', ihcl: 'INDHOTEL', itch: 'ITCHOTELS', jub: 'JUBLFOOD', itc: 'ITC', ril: 'RELIANCE', bha: 'BHARTIARTL', 'mar-i': 'MARUTI', tcs: 'TCS', indigo: 'INDIGO' };
  const BETASRC = {
    mar: '5-year monthly vs S&P 500 (stockanalysis.com)', hlt: '5-year monthly vs S&P 500 (stockanalysis.com)', mcd: '5-year monthly vs S&P 500 (stockanalysis.com)', armk: '5-year monthly vs S&P 500 (stockanalysis.com)',
    ihcl: 'IndMoney, trailing 12 months vs Nifty', itch: 'about 1 year vs Nifty (listed Jan 2025)', jub: 'GuruFocus, window not stated', itc: 'Trendlyne, 3-year vs Nifty (1-year: 0.76)',
    ril: 'data aggregator, window not stated', bha: 'data aggregator, window not stated', 'mar-i': 'data aggregator, window not stated', tcs: 'data aggregator, window not stated', indigo: 'data aggregator, window not stated'
  };
  function coSources(c) {
    const tk = TICK[c.id];
    const mkt = c.c === 'IN'
      ? A(`https://www.screener.in/company/${tk}/consolidated/`, `screener.in: ${tk}`)
      : A(`https://stockanalysis.com/stocks/${tk.toLowerCase()}/statistics/`, `stockanalysis.com: ${tk}`);
    const bs = c.c === 'IN' ? '31 Mar 2026' : (c.id === 'armk' ? '2 Oct 2026' : '30 Sep 2026');
    return `<details class="srcbox"><summary>Sources for ${c.n}</summary><ul class="muted">
      <li><b>Share price, debt, cash, EBIT and interest:</b> ${mkt}. Share price at the close on 20 Nov 2026; balance sheet at ${bs}; EBIT and interest from the latest full year.${c.leaseEst ? ' The lease figure is approximate.' : ''}</li>
      <li><b>Regression beta:</b> ${F.n(c.beta, 2)}, ${BETASRC[c.id]}.</li>
      <li><b>Industry beta (bottom-up):</b> ${c.ind ? `${c.ind[0]}, ${F.n(c.ind[1], 2)}, from ${A(c.c === 'IN' ? SRC.damBetasIN : SRC.damBetasUS, c.c === 'IN' ? "Damodaran's India industry betas" : "Damodaran's US industry betas")} (January 2026).` : 'not available, because ITC runs several different businesses.'}</li>
    </ul></details>`;
  }
  const ratingTable = () => '<div class="tblwrap"><table class="tbl"><tr><th>Interest coverage ≥</th><th>Rating</th><th>Default spread</th></tr>' +
    DAM.map((r, i) => `<tr><td>${i === DAM.length - 1 ? 'below 0.20' : r[0].toFixed(2) + (i ? ' and < ' + DAM[i - 1][0].toFixed(2) : '')}</td><td>${r[1]}</td><td>${P(r[2])}</td></tr>`).join('') + '</table></div>';
  const BU_LIST = () => CO.filter(c => c.ind).map(c => `${c.n}: ${c.ind[0]}, ${F.n(c.ind[1], 2)}`).join('; ');

  function notesCard() {
    return h('div', { class: 'card notes' },
      h('h3', null, 'How every number is built, and where it comes from'),
      h('p', { class: 'muted' }, 'All market data are as of 20–22 November 2026. Links open the original source in a new tab.'),
      h('div', { html: `
      <h4>1. Risk-free rate (R<sub>f</sub>)</h4>
      <p>The yield on the 10-year government bond: India ${P(MACRO.IN.rf)} (17 Nov 2026, ${A(SRC.teIN, 'Trading Economics: India 10-year')}); US ${P(MACRO.US.rf)} (19 Nov 2026, ${A(SRC.teUS, 'Trading Economics: US 10-year')}).</p>
      <h4>2. Market risk premium (R<sub>m</sub> − R<sub>f</sub>)</h4>
      <p>India ${P(MACRO.IN.erp)} and US ${P(MACRO.US.erp)}, the estimates published by Professor Aswath Damodaran of NYU (${A(SRC.damCtry, 'risk premiums by country')}; ${A(SRC.damHome, 'his home page')}). These are his published estimates for each market, used here as ready-made inputs. The course method, CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>), needs decades of return data; Marriott's 5.63% is an example of it.</p>
      <h4>3. Beta</h4>
      <ul><li><b>Regression beta (default):</b> the company's own beta against its market index (Nifty 50 or S&P 500), as reported by financial data websites. It already reflects the company's current debt, so it goes straight into CAPM.</li>
      <li><b>Bottom-up beta (switch):</b> (1) start from the average unlevered beta of the company's industry, published by ${A(SRC.damBetasIN, 'Damodaran for India')} and ${A(SRC.damBetasUS, 'for the US')}; (2) multiply by (1 − cash/V) for the company's own cash; (3) relever at the company's own D/E: β<sub>L</sub> = β<sub>U</sub>[1 + (D/E)(1 − t)].</li></ul>
      <h4>4. Cost of debt (K<sub>d</sub>)</h4>
      <p>K<sub>d</sub> = R<sub>f</sub> + default spread. The spread comes from a <b>synthetic rating</b>: interest coverage = EBIT ÷ interest expense, looked up in ${A(SRC.damRatings, "Damodaran's rating table")} (January 2026), shown below. This is the third method on the class slides.</p>
      <details><summary>Damodaran's synthetic rating table (January 2026)</summary>${ratingTable()}</details>
      <h4>5. Weights</h4>
      <p>E = market value of equity (share price × shares). D = borrowings plus lease liabilities, as reported on the balance sheet (book value, used as a proxy for market value). V = D + E.</p>
      <h4>6. Tax rate</h4>
      <p>India 25.17% (the corporate tax rate under the new regime, ${A(SRC.itax, 'Income Tax Department')}); US 25% (federal plus state).</p>
      <h4>7. Company data</h4>
      <p>Indian companies from ${A(SRC.screener, 'screener.in')}, US companies from ${A(SRC.sa, 'stockanalysis.com')}. Each company's links are in its "Sources" box above. More of Damodaran's data: ${A(SRC.damData, 'Damodaran Online')}.</p>
      <p class="callout warn">These are practice inputs gathered from public sources on 22 Nov 2026. They are not investment advice.</p>` }));
  }

  // ------- Real companies renderer -------
  window.S11_REAL = function (host) {
    const o = { lease: true, beta: 'reg', rfm: 'gsec', ov: {}, sel: 'mar' }; // debt = borrowings + lease liabilities as reported; R_f = 10-year government yield
    const list = h('div', { class: 'list-co' }), detail = h('div'), cmp = h('div');
    const top = h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Real world · data as of 20–22 Nov 2026'),
      h('h2', null, 'Hurdle rates for real companies today'),
      h('p', { class: 'lede', html: 'The same recipe as the Marriott case, applied to the Marriott family today and to Indian companies. Pick a company to see each step. Every input is editable.' }),
      h('div', { class: 'row', style: { gap: '18px' } },
        h('div', null, h('div', { class: 'muted', style: { fontSize: '.82rem' } }, 'Beta'), ICF.seg([{ v: 'reg', t: 'Regression' }, { v: 'bu', t: 'Bottom-up (industry)' }], o.beta, v => { o.beta = v; redraw(); }))));
    host.append(top);
    host.append(h('div', { class: 'grid side' }, h('div', { class: 'card tight' }, list), detail));
    host.append(h('div', { class: 'card' }, h('h3', null, 'All companies side by side'), h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)', height: '10px' } }), 'E/V × Ke'), h('span', null, h('i', { class: 'hatch', style: { background: 'var(--s2)', height: '10px' } }), 'D/V × Kd(1 − t)')), cmp,
      h('p', { class: 'muted' }, 'Compare companies within the same currency. Rupee WACCs are higher than dollar WACCs mainly because the Indian risk-free rate is higher (7.34% vs 5.05%).')));
    host.append(notesCard());

    const ROWS = [['mcap', 'Market value of equity'], ['debt', 'Borrowings (ex-leases)'], ['lease', 'Lease liabilities'], ['cash', 'Cash & liquid investments'], ['beta', 'Regression beta'], ['ebit', 'EBIT (latest year)'], ['int', 'Interest / finance cost']];
    function redraw() {
      list.innerHTML = '';
      let grp = '';
      CO.forEach(c => {
        if (c.grp !== grp) { grp = c.grp; list.append(h('div', { class: 'faint', style: { fontSize: '.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', margin: '8px 10px 2px' } }, grp)); }
        const r = calc(c, o);
        list.append(h('button', { class: o.sel === c.id ? 'on' : '', onclick: () => { o.sel = c.id; redraw(); } }, h('span', null, c.n), h('b', null, P(r.w, 1))));
      });
      const c = CO.find(x => x.id === o.sel), r = calc(c, o), m = MACRO[c.c], ov = o.ov[c.id] = o.ov[c.id] || {};
      const inp = (k) => { const e = h('input', { class: 'editable', type: 'number', step: 'any', value: ov[k] != null ? ov[k] : c[k] }); e.addEventListener('change', () => { const v = parseFloat(e.value); if (isFinite(v)) ov[k] = v; else delete ov[k]; redraw(); }); return e; };
      detail.innerHTML = '';
      const kpis = h('div', { class: 'statrow' },
        ...[['WACC', P(r.w)], ['Cost of equity', P(r.ke)], ['Pre-tax K<sub>d</sub>', P(r.kd)], ['D/V', P(r.dv, 1)], ['Levered β', F.n(r.bl, 2)]].map(([l, v]) => h('div', { class: 'statbox stat' }, h('div', { class: 'v' }, v), h('div', { class: 'l', html: l }))));
      const inputs = h('div', { class: 'kv' }, ...ROWS.flatMap(([k, l]) => [h('div', null, l + (k === 'beta' || k === 'ebit' || k === 'int' ? '' : ` (${m.ccy})`) + ((k === 'lease' && c.leaseEst) || (k === 'debt' && c.debtEst) ? ' · estimate' : '')), h('div', null, inp(k))]));
      const steps = h('div', { html: `
        <div class="step"><h4>1. Weights (market values)</h4>E = ${F.big(r.E, m.big)}, D = ${F.big(r.D, m.big)} (borrowings + lease liabilities) → D/V = <b>${P(r.dv, 1)}</b>, D/E = ${F.n(r.de, 3)}${c.bookE != null && c.bookE < 0 ? `<br><span class="muted">Book equity is ${F.usd(c.bookE, 2)} bn, which is negative, so market values are the only usable weights.</span>` : ''}</div>
        <div class="step"><h4>2. Beta</h4>β<sub>L</sub> = <b>${F.n(r.bl, 3)}</b> <span class="muted">(${r.note})</span>${c.betaWarn && !r.useBU ? `<br><span class="pill hard">Caution</span> ${c.betaWarn}` : ''}${o.beta === 'bu' && !c.ind ? '<br><span class="pill">No single industry fits a conglomerate, so the regression beta is used.</span>' : ''}</div>
        <div class="step"><h4>3. Cost of equity</h4>K<sub>e</sub> = ${P(r.rf)} + ${F.n(r.bl, 3)} × ${P(r.erp)} = <b>${P(r.ke)}</b></div>
        <div class="step"><h4>4. Cost of debt (synthetic rating)</h4>Coverage = EBIT ÷ interest = ${isFinite(r.cov) ? F.n(r.cov, 2) + '×' : '∞'} → <b>${r.rt.rating}</b>, spread ${P(r.rt.spread)} → K<sub>d</sub> = ${P(r.rfD)} + ${P(r.rt.spread)} = <b>${P(r.kd)}</b></div>
        <div class="step"><h4>5. WACC</h4><div class="formula">${F.n(1 - r.dv, 3)} × ${P(r.ke)} + ${F.n(r.dv, 3)} × ${P(r.kd)} × (1 − ${P(r.t)}) = <b>${P(r.w)}</b></div></div>` });
      detail.append(h('div', { class: 'card' },
        h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, c.n), h('span', { class: 'pill' }, c.c === 'IN' ? 'India · ₹' : 'USA · $'), h('span', { class: 'spacer' }), h('button', { class: 'btn small', onclick: () => { delete o.ov[c.id]; redraw(); } }, 'Reset inputs')),
        h('p', { class: 'muted', style: { marginTop: '6px' } }, c.what), kpis,
        h('div', { class: 'callout', html: '<b>What this shows:</b> ' + c.insight }),
        h('div', { html: coSources(c) }),
        h('div', { class: 'grid g2' }, h('div', null, h('h4', null, 'Inputs (editable)'), inputs, h('p', { class: 'faint', style: { fontSize: '.8rem', marginTop: '8px' } }, `R_f ${P(r.rf)}, ERP ${P(r.erp)}, tax ${P(r.t)}`.replace('R_f', 'Rf'))), h('div', null, h('h4', null, 'The calculation'), steps))));
      // comparison
      cmp.innerHTML = '';
      const rows = CO.map(x => ({ c: x, r: calc(x, o) }));
      ['IN', 'US'].forEach(cc => {
        cmp.append(h('h4', { style: { marginTop: '10px' } }, cc === 'IN' ? 'India (₹)' : 'United States ($)'));
        const rs = rows.filter(x => x.c.c === cc).sort((a, b) => b.r.w - a.r.w), max = Math.max(...rs.map(x => x.r.w)) * 1.05;
        rs.forEach(({ c, r }) => {
          const ep = (1 - r.dv) * r.ke, dp = r.dv * r.kd * (1 - r.t);
          cmp.append(h('div', { class: 'sbar-row', style: { cursor: 'pointer' }, onclick: () => { o.sel = c.id; redraw(); detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, h('div', null, c.n),
            h('div', { class: 'sbar' }, h('div', { style: { flexBasis: (ep / max * 100) + '%', background: 'var(--s1)' }, onpointermove: ev => tip(`<b>${c.n}</b><br>E/V ${P(1 - r.dv, 1)} × K<sub>e</sub> ${P(r.ke)} = ${P(ep)}`, ev), onpointerleave: () => tip(null) }),
              h('div', { class: 'hatch', style: { flexBasis: (dp / max * 100) + '%', background: 'var(--s2)' }, onpointermove: ev => tip(`<b>${c.n}</b><br>D/V ${P(r.dv, 1)} × K<sub>d</sub> ${P(r.kd)} × (1 − t) = ${P(dp)}<br>rating ${r.rt.rating}`, ev), onpointerleave: () => tip(null) })),
            h('div', { class: 'val' }, P(r.w))));
        });
      });
    }
    redraw();
  };

  // ------- Then & now (Marriott tab) -------
  window.S11_THENNOW = function () {
    const M = window.MARRIOTT, base = M.run(M.defaults());
    const mar = CO.find(c => c.id === 'mar'), r = calc(mar, { lease: true, beta: 'reg', rfm: 'gsec', ov: {} });
    const row = (l, a, b) => `<tr><td>${l}</td><td>${a}</td><td>${b}</td></tr>`;
    return h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Real world'),
      h('h3', null, 'Then and now: Marriott in 1988 vs Marriott International in 2026'),
      h('div', { class: 'grid g2' },
        h('div', { class: 'tblwrap', html: '<table class="tbl"><tr><th></th><th>1988 (case)</th><th>Nov 2026</th></tr>' +
          row('Risk-free rate', '8.95% (30-yr)', P(r.rf) + ' (10-yr)') +
          row('Market risk premium', '5.63% (historical)', P(r.erp) + ' (Damodaran)') +
          row('Regression beta', '0.97', F.n(mar.beta, 2)) +
          row('Market D/V', P(M.D / (M.D + M.E), 1), P(r.dv, 1)) +
          row('Tax rate', '34%', '25%') +
          row('Book equity', '$0.81 bn', '−$5.08 bn') +
          row('Market cap', '$3.6 bn', '$' + F.usd(mar.mcap, 1) + ' bn') +
          `<tr class="hl"><td>WACC</td><td>${P(base.firm.wacc)} (firm, target D/V 60%)</td><td>${P(r.w)} (current weights)</td></tr></table>` }),
        h('div', null,
          h('p', { class: 'muted', html: 'Two things changed most. Interest rates are much lower (the US 10-year rate is about 5% against 8.95% for the 30-year rate in 1988), and Marriott now has far less debt relative to the market value of its shares. Both feed straight into the WACC formula you used in the case.' }))));
  };
})();
