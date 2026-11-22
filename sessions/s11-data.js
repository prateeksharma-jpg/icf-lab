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
    { id: 'mar', n: 'Marriott International', c: 'US', grp: 'The Marriott family today', mcap: 104.7, debt: 16.74, lease: 1.05, cash: 0.45, beta: 1.14, ebit: 4.141, int: 0.809, rating: 'S&P BBB / Moody\'s Baa2', ind: ['Hotel/Gaming (US)', 0.88], bookE: -5.08,
      what: 'The hotel-management descendant of the 1988 case. It franchises and manages hotels it mostly does not own.',
      insight: 'Book equity is <b>−$5.1 bn</b> after years of buybacks, so book-value weights would be meaningless; only market weights work. Compare today\'s hurdle with Cohrs\'s 1988 Lodging rate of 9.31%.' },
    { id: 'hlt', n: 'Hilton Worldwide', c: 'US', grp: 'The Marriott family today', mcap: 79.3, debt: 13.02, lease: 0.95, cash: 0.77, beta: 1.07, ebit: 2.693, int: 0.620, rating: 'BB+ / Ba1 (unverified)', ind: ['Hotel/Gaming (US)', 0.88], bookE: -6.56,
      what: 'Asset-light franchisor and manager. Hilton Hotels was one of Marriott\'s lodging comparables in 1988.',
      insight: 'Its synthetic rating from coverage (≈4.3× → A) is several notches above its actual sub-investment-grade rating. Agencies weigh total leverage, not just one coverage ratio.' },
    { id: 'mcd', n: 'McDonald\'s', c: 'US', grp: 'The Marriott family today', mcap: 192.9, debt: 39.83, lease: 14.72, cash: 1.19, beta: 0.43, ebit: 12.393, int: 1.582, rating: 'BBB+ / Baa1', ind: ['Restaurant/Dining (US)', 0.78], bookE: -0.34,
      what: 'Global franchisor and landlord to its franchisees. It was a restaurant comparable in the case (β 1.00 in 1987).',
      insight: 'A regression beta of <b>0.43</b> versus 1.00 in 1987: today\'s McDonald\'s behaves like a defensive real-estate-and-royalty business. Leases add about $15 bn of debt-like claims.' },
    { id: 'armk', n: 'Aramark', c: 'US', grp: 'The Marriott family today', mcap: 14.2, debt: 5.23, lease: 0.31, cash: 0.69, beta: 1.17, ebit: 0.917, int: 0.321, rating: 'S&P BB+ / Moody\'s Ba2', ind: ['Business & Consumer Services (US)', 0.81], bookE: 3.49,
      what: 'Food and facilities services for hospitals, universities and stadiums. It is the closest listed analog of Marriott\'s 1988 Contract Services division.',
      insight: 'In 1988 Cohrs had no comparable for Contract Services and had to back out β<sub>U</sub> ≈ 1.05. Unlever Aramark\'s beta here and compare.' },
    { id: 'ihcl', n: 'Indian Hotels (IHCL)', c: 'IN', grp: 'Indian hospitality & food', mcap: 129817, debt: 51, lease: 2745, cash: 4345, beta: 1.27, ebit: 3147, int: 221, rating: 'ICRA AAA', ind: ['Hotel/Gaming (India)', 0.76],
      what: 'Tata group hotels (Taj, Vivanta, Ginger), plus TajSATS air catering, which is itself a Contract-Services-style business.',
      insight: 'Almost all of its "debt" is lease liabilities. The regression beta (~1.27) is far above the Indian hotel industry\'s bottom-up 0.76 relevered. Switch the beta source and see how much the hurdle rate moves.' },
    { id: 'itch', n: 'ITC Hotels', c: 'IN', grp: 'Indian hospitality & food', mcap: 38385, debt: 0, lease: 74, cash: 2432, beta: 1.25, ebit: 1178, int: 55, rating: 'CRISIL AAA', ind: ['Hotel/Gaming (India)', 0.76], betaWarn: 'Listed Jan 2025: fewer than two years of return data.',
      what: 'Luxury hotels demerged from ITC Ltd with effect from 1 January 2025. ITC kept a stake of about 40%.',
      insight: 'A real version of practice problem C3. With under two years of trading history its regression beta is noisy, which is exactly when a bottom-up beta is the better estimate. It has no borrowings, so WACC is close to its cost of equity.' },
    { id: 'jub', n: 'Jubilant FoodWorks', c: 'IN', grp: 'Indian hospitality & food', mcap: 28024, debt: 1745, lease: 3157, cash: 335, beta: 1.38, ebit: 1035, int: 436, rating: 'CRISIL A1+ (commercial paper)', ind: ['Restaurant/Dining (India)', 0.57],
      what: 'Domino\'s and Popeyes franchisee in India, with Domino\'s Turkey (about 26% of revenue).',
      insight: 'Leases are about two-thirds of its debt. Coverage of about 2.4× maps to a BB+ synthetic rating, yet its commercial paper is A1+. A useful prompt for "when does the synthetic rating fail?"' },
    { id: 'itc', n: 'ITC Ltd (post-demerger)', c: 'IN', grp: 'Indian conglomerates', mcap: 374830, debt: 0, lease: 400, cash: 21523, beta: 0.66, ebit: 28118, int: 85, rating: 'CRISIL AAA', ind: null, leaseEst: true,
      what: 'Cigarettes, FMCG foods and personal care, agri-business, and paperboard. Cigarettes earn most of the profit.',
      insight: 'A Marriott-style conglomerate: one firm-wide rate for cigarettes (stable cash cow) and new FMCG brands (riskier) would repeat Cohrs\'s problem. No single industry beta fits, so the bottom-up option is disabled here.' },
    { id: 'ril', n: 'Reliance Industries', c: 'IN', grp: 'Indian conglomerates', mcap: 1864107, debt: 374421, lease: 23579, cash: 249704, beta: 1.00, ebit: 150223, int: 27061, rating: 'S&P A− / Moody\'s Baa1', ind: ['Oil/Gas Integrated (India; n = 1, Reliance itself)', 0.60],
      what: 'Oil-to-chemicals, Jio (telecom), Retail, and upstream oil and gas, with very different risk in each.',
      insight: 'The biggest Marriott problem in India. A refinery, a telecom network and a grocery chain should not share one hurdle rate. Deferred spectrum dues (~₹1 lakh cr) are debt-like but not included here. Try adding them to the debt.' },
    { id: 'bha', n: 'Bharti Airtel', c: 'IN', grp: 'Indian conglomerates', mcap: 1316400, debt: 121670, lease: 73740, cash: 30720, beta: 0.67, ebit: 66728, int: 21555, rating: 'S&P BBB+ / CRISIL AAA', ind: ['Telecom Services (India)', 0.65],
      what: 'Mobile, broadband and enterprise telecom in India and Africa.',
      insight: 'A low-beta, utility-like business carrying heavy debt (including spectrum dues) and large tower leases. Coverage of about 3.1× gives an A− synthetic rating.' },
    { id: 'mar-i', n: 'Maruti Suzuki', c: 'IN', grp: 'Indian bellwethers', mcap: 440509, debt: 70, lease: 103, cash: 78758, beta: 1.11, ebit: 19357, int: 239, rating: 'CRISIL AAA', ind: ['Auto & Truck (India)', 1.11],
      what: 'India\'s largest car maker, about 58% owned by Suzuki. It is net-cash, including about ₹61,000 cr in long-term debt mutual funds.',
      insight: 'Cash is about 18% of firm value. In bottom-up mode the business beta is scaled down by (1 − cash/V): the 2025 mid-term Maruti question with real numbers.' },
    { id: 'tcs', n: 'TCS', c: 'IN', grp: 'Indian bellwethers', mcap: 859730, debt: 0, lease: 11283, cash: 41080, beta: 0.74, ebit: 66714, int: 1227, rating: 'Moody\'s A2', ind: ['Computer Services (India)', 0.74],
      what: 'India\'s largest IT services firm. It has no borrowings, only office leases.',
      insight: 'With almost no debt, WACC ≈ cost of equity. Its "interest" is lease interest, so coverage is a huge ~54×.' },
    { id: 'indigo', n: 'IndiGo (InterGlobe)', c: 'IN', grp: 'Indian bellwethers', mcap: 216054, debt: 1806, lease: 75943, cash: 51651, beta: 1.73, ebit: 3984, int: 5944, rating: 'CRISIL AA− / ICRA AA (watch)', ind: ['Air Transport (India)', 0.83], debtEst: true, lossYear: true,
      what: 'India\'s largest airline, with about 440 aircraft, almost all leased. It made a loss in FY26.',
      insight: 'Turn leases off and IndiGo looks debt-free. Turn them on and debt is about a quarter of firm value. Coverage of 0.67× maps to a CC synthetic rating (12.6% spread) against an actual AA−. Synthetic ratings break down for lease-heavy firms in a loss year.' }
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

  // ------- Real companies renderer -------
  window.S11_REAL = function (host) {
    const o = { lease: true, beta: 'reg', rfm: 'gsec', ov: {}, sel: 'mar' };
    const list = h('div', { class: 'list-co' }), detail = h('div'), cmp = h('div');
    const top = h('div', { class: 'card' },
      h('div', { class: 'kicker' }, 'Real world · data as of 20–22 Nov 2026'),
      h('h2', null, 'Hurdle rates for real companies today'),
      h('p', { class: 'lede', html: 'The same recipe as Marriott, applied to the Marriott family today and to Indian companies. Every input is editable. Flip the switches to see which choices matter most.' }),
      h('div', { class: 'row', style: { gap: '18px' } },
        h('div', null, h('div', { class: 'muted', style: { fontSize: '.82rem' } }, 'Lease liabilities'), ICF.seg([{ v: true, t: 'Count as debt' }, { v: false, t: 'Ignore' }], o.lease, v => { o.lease = v; redraw(); })),
        h('div', null, h('div', { class: 'muted', style: { fontSize: '.82rem' } }, 'Beta'), ICF.seg([{ v: 'reg', t: 'Regression' }, { v: 'bu', t: 'Bottom-up (industry)' }], o.beta, v => { o.beta = v; redraw(); })),
        h('div', null, h('div', { class: 'muted', style: { fontSize: '.82rem' } }, 'India R<sub>f</sub>'.replace(/<[^>]+>/g, '')), ICF.seg([{ v: 'gsec', t: 'G-sec yield (class)' }, { v: 'dam', t: 'G-sec − default spread' }], o.rfm, v => { o.rfm = v; redraw(); }))));
    host.append(top);
    host.append(h('div', { class: 'grid side' }, h('div', { class: 'card tight' }, list), detail));
    host.append(h('div', { class: 'card' }, h('h3', null, 'All companies side by side'), h('div', { class: 'legend' }, h('span', null, h('i', { style: { background: 'var(--s1)', height: '10px' } }), 'E/V × Ke'), h('span', null, h('i', { class: 'hatch', style: { background: 'var(--s2)', height: '10px' } }), 'D/V × Kd(1 − t)')), cmp,
      h('p', { class: 'muted' }, 'Rupee and dollar WACCs are not directly comparable: Indian rates include higher expected inflation (and country risk), so compare within a currency.')));
    host.append(h('div', { class: 'card' }, h('h3', null, 'Where these numbers come from'),
      h('p', { class: 'muted', html: `<b>Macro:</b> ${MACRO.IN.rfNote}; ${MACRO.US.rfNote}. ERP: ${MACRO.IN.erpNote}; ${MACRO.US.erpNote}. Tax: India 25.17% (new regime, s.115BAA), US 25% (federal + state).<br><b>Cost of debt:</b> R<sub>f</sub> + spread from Damodaran's synthetic rating table (large non-financial firms, Jan 2026), using EBIT ÷ interest from the latest full year. Indian finance cost includes lease interest (Ind AS 116) and other items such as interest on deposits, so for nearly debt-free firms (ITC Hotels, Maruti) the implied interest rate is not meaningful, though coverage is clearly very high. US interest excludes operating-lease interest. Reliance's coverage (≈5.55×) sits just above the A+/A cut-off of 5.5, so small input changes flip its rating.<br><b>Companies:</b> share prices are closes on 20 Nov 2026; balance sheets are at Mar 2026 (India) or Sep 2026 (US). Sources: screener.in, stockanalysis.com, company filings and rating-agency releases. Regression betas come from data aggregators with differing windows (Indian betas especially). Bottom-up mode starts from Damodaran's cash-corrected industry unlevered beta (Jan 2026), adds back the company's own cash (× (1 − cash/V)), and then relevers it at the company's own market D/E: β<sub>L</sub> = β<sub>U</sub>[1 + (D/E)(1 − t)].<br><b>These are teaching inputs, not investment advice.</b> Before using a number for anything real, check it against a primary source.` })));

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
        <div class="step"><h4>1. Weights (market values)</h4>E = ${F.big(r.E, m.big)}, D = ${F.big(r.D, m.big)}${o.lease ? ' (incl. leases)' : ' (excl. leases)'} → D/V = <b>${P(r.dv, 1)}</b>, D/E = ${F.n(r.de, 3)}${c.bookE != null && c.bookE < 0 ? `<br><span class="muted">Book equity is ${F.usd(c.bookE, 2)} bn, which is negative, so market values are the only usable weights.</span>` : ''}</div>
        <div class="step"><h4>2. Beta</h4>β<sub>L</sub> = <b>${F.n(r.bl, 3)}</b> <span class="muted">(${r.note})</span>${c.betaWarn && !r.useBU ? `<br><span class="pill hard">Caution</span> ${c.betaWarn}` : ''}${o.beta === 'bu' && !c.ind ? '<br><span class="pill">No single industry fits a conglomerate, so the regression beta is used.</span>' : ''}</div>
        <div class="step"><h4>3. Cost of equity</h4>K<sub>e</sub> = ${P(r.rf)} + ${F.n(r.bl, 3)} × ${P(r.erp)} = <b>${P(r.ke)}</b></div>
        <div class="step"><h4>4. Cost of debt (synthetic rating)</h4>Coverage = EBIT ÷ interest = ${isFinite(r.cov) ? F.n(r.cov, 2) + '×' : '∞'} → <b>${r.rt.rating}</b>, spread ${P(r.rt.spread)} → K<sub>d</sub> = ${P(r.rfD)} + ${P(r.rt.spread)} = <b>${P(r.kd)}</b>${r.rfD !== r.rf ? ' <span class=\"muted\">(debt is priced off the actual G-sec yield, which already includes India’s default spread)</span>' : ''}<br><span class="muted">Actual rating: ${c.rating}${c.lossYear ? '. Note: a loss-making year, so the coverage ratio is distorted.' : ''}</span></div>
        <div class="step"><h4>5. WACC</h4><div class="formula">${F.n(1 - r.dv, 3)} × ${P(r.ke)} + ${F.n(r.dv, 3)} × ${P(r.kd)} × (1 − ${P(r.t)}) = <b>${P(r.w)}</b></div></div>` });
      detail.append(h('div', { class: 'card' },
        h('div', { class: 'row' }, h('h3', { style: { margin: 0 } }, c.n), h('span', { class: 'pill' }, c.c === 'IN' ? 'India · ₹' : 'USA · $'), h('span', { class: 'spacer' }), h('button', { class: 'btn small', onclick: () => { delete o.ov[c.id]; redraw(); } }, 'Reset inputs')),
        h('p', { class: 'muted', style: { marginTop: '6px' } }, c.what), kpis,
        h('div', { class: 'callout', html: '<b>Discuss:</b> ' + c.insight }),
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
          row('Market risk premium', '5.63% (historical)', P(r.erp) + ' (implied)') +
          row('Regression beta', '0.97', F.n(mar.beta, 2)) +
          row('Market D/V', P(M.D / (M.D + M.E), 1), P(r.dv, 1)) +
          row('Tax rate', '34%', '25%') +
          row('Book equity', '$0.81 bn', '−$5.08 bn') +
          row('Market cap', '$3.6 bn', '$' + F.usd(mar.mcap, 1) + ' bn') +
          `<tr class="hl"><td>WACC</td><td>${P(base.firm.wacc)} (firm, target D/V 60%)</td><td>${P(r.w)} (current weights)</td></tr></table>` }),
        h('div', null,
          h('p', { html: '<b>What happened to the three divisions?</b>' }),
          h('ul', { class: 'muted', html: '<li><b>1993:</b> Marriott Corporation split in two. <b>Host Marriott</b> kept the hotel real estate and most of the debt (it later became Host Hotels & Resorts, a REIT). <b>Marriott International</b> took the management businesses.</li><li><b>1998:</b> the food-service management business (the old Contract Services) merged with Sodexho\'s North American operations to form <b>Sodexho Marriott Services</b>.</li><li><b>2016:</b> Marriott International bought Starwood and became the world\'s largest hotel company. It owns very few of the hotels it runs.</li>' }),
          h('p', { class: 'muted', html: 'The split was driven mainly by the burden of real-estate debt (and was fought by bondholders), but it also separated businesses with very different risks, so each could be priced on its own. Open <b>Real companies</b> to see Aramark, today\'s closest analog of Contract Services.' }))));
  };
})();
