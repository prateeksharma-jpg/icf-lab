/* Session 11: detailed self-study notes for every tab. The lab is used for practice outside
   class, so every point is explained in full rather than left for discussion. */
(function () {
  'use strict';
  const N = {};

  /* ------------------------------------------------------------------ START: full session notes */
  N.start = {
    title: 'Session 11 notes: the cost of capital',
    sections: [
      ['1. The idea: what a project must earn',
        `<p>A firm's assets (the <i>use</i> of capital) are paid for by debt and equity (the <i>sources</i> of capital). Each group of investors expects a return, and that expected return is exactly the firm's <b>cost</b> of using their money:</p>
        <ul><li><b>Cost of equity (K<sub>e</sub>)</b> = the return equity investors expect.</li><li><b>Cost of debt (K<sub>d</sub>)</b> = the return lenders and bond investors expect.</li></ul>
        <p>The assets must earn at least the blended cost of both, the <b>weighted average cost of capital (WACC)</b>. Otherwise investors would do better putting their money elsewhere at the same risk. That is why the cost of capital is an <b>opportunity cost</b>: it is set by what investors could earn on other investments of similar risk, not by what the firm happens to pay.</p>
        <div class="callout"><b>Worked example (from class).</b> Assets of ₹100 cr are financed by ₹60 cr of equity at K<sub>e</sub> = 20% and ₹40 cr of debt at K<sub>d</sub> = 10%. The tax rate is 30%. Interest of ₹4 cr saves ₹1.2 cr of tax, so debt really costs 10% × (1 − 0.3) = 7%.<br>WACC = 0.6 × 20% + 0.4 × 7% = <b>14.8%</b>. The assets must earn at least 14.8% a year.</div>`],
      ['2. Cost of equity: CAPM and its three inputs',
        `<div class="formula">K<sub>e</sub> = R<sub>f</sub> + β<sub>L</sub> × (R<sub>m</sub> − R<sub>f</sub>)</div>
        <p><b>Risk-free rate R<sub>f</sub>.</b> The return investors demand even when there is no risk: compensation for waiting. Economically it reflects <b>expected real growth plus expected inflation</b>. In real use, take the yield on a long-term government bond in the <b>same currency</b> as the cash flows: the 10-year G-sec for rupee cash flows, or (cleaner) the 10-year zero-coupon yield. The Marriott case uses the 30-year Treasury (8.95%) because hotels produce cash flows for decades.</p>
        <p><b>Beta β<sub>L</sub>.</b> How much <i>systematic</i> (market) risk the equity carries. Only systematic risk is rewarded, because the <b>marginal investor</b> (the one most likely to make the next trade and set the price) is well diversified and has already diversified away firm-specific risk. The largest shareholder is often not the marginal investor (a founder or promoter who never trades does not set the price). A beta from regressing the stock's returns on the market is a <b>levered</b> beta: it contains the risk of the business <i>and</i> of the firm's debt. Beta is higher for:</p>
        <ul><li><b>discretionary products</b> (hotels, cars, luxury) than for necessities, because demand swings with the economy;</li><li><b>high operating leverage</b>: a large share of fixed costs, so profits swing more than sales;</li><li><b>high financial leverage</b>: more debt, so equity holders bear more of the swing.</li></ul>
        <p><b>Market risk premium (R<sub>m</sub> − R<sub>f</sub>).</b> The extra return investors demand per unit of beta. If our class were the whole market, the premium would be a <b>wealth-weighted average</b> of what each of us demands ("dollar-weighted democracy"). When investors become more risk averse, the premium <b>rises</b>, so hurdle rates rise and project values fall.</p>
        <p>In this course we estimate it as a <b>historical premium = CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>)</b> over a long period. We use the geometric average (CAGR), not the arithmetic one, because the CAGR is what investors' wealth actually did. Example: ₹100 rises 100% to ₹200, then falls 50% to ₹100. The arithmetic mean says +25% a year; the CAGR says 0%, which is the truth about wealth. For Marriott the premium is 5.63% (see the worked example below).</p>
        <div class="callout"><b>Worked example: Marriott's historical risk premium (HRP).</b> Exhibit 4 of the case gives average annual returns over 1926–87:
        <div class="tblwrap"><table class="tbl"><tr><th></th><th>Geometric (CAGR)</th><th>Arithmetic</th></tr>
        <tr><td>S&P 500 (R<sub>m</sub>)</td><td>9.90%</td><td>12.01%</td></tr>
        <tr><td>Long-term government bonds (R<sub>f</sub>)</td><td>4.27%</td><td>4.58%</td></tr>
        <tr class="hl"><td>HRP = R<sub>m</sub> − R<sub>f</sub></td><td>5.63%</td><td>7.43%</td></tr></table></div>
        HRP = CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>) = 9.90% − 4.27% = <b>5.63%</b>, the figure in Exhibit 5 that we use. (The arithmetic version, 12.01% − 4.58% = 7.43%, is the one the course does not use.)</div>
        <div class="callout warn"><b>Two different R<sub>f</sub>s, do not mix them up.</b> Inside the premium, R<sub>f</sub> is the <i>realised return</i> on government bonds over the same long historical period (4.27% a year here). The R<sub>f</sub> at the front of CAPM is <i>today's</i> government bond yield (8.95% for Marriott in April 1988):
        <div class="formula">K<sub>e</sub> = R<sub>f, today</sub> + β<sub>L</sub> × [CAGR(R<sub>m</sub>) − CAGR(R<sub>f</sub>)]<sub>historical</sub> = 8.95% + β<sub>L</sub> × 5.63%</div>
        A common mistake is CAGR(R<sub>m</sub>) − today's yield (9.90% − 8.95% = 0.95%). This mixes a 62-year average with a single current number and badly understates the premium.</div>`],
      ['3. Cost of debt: three ways to estimate it',
        `<div class="formula">K<sub>d</sub> = R<sub>f</sub> + default spread</div>
        <p>K<sub>d</sub> is what it would cost to borrow long-term <b>today</b>. It has two parts: the prevailing risk-free rate, and the lenders' current view of the firm's default risk (the spread).</p>
        <ol><li><b>Traded long-term bonds:</b> use their <b>yield to maturity (YTM)</b>. Not the coupon: the coupon was fixed when the bond was issued, while the YTM is what lenders demand now.</li>
        <li><b>Rated but no traded bonds:</b> take the average (or median) YTM of bonds with the same rating (say BBB), subtract R<sub>f</sub> to get the spread, then K<sub>d</sub> = R<sub>f</sub> + spread.</li>
        <li><b>Unrated:</b> compute <b>interest coverage = EBIT ÷ interest expense</b>, map it to a <b>synthetic rating</b> using Damodaran's table, and use that rating's spread. Higher coverage means a safer firm, a better rating and a smaller spread.</li></ol>
        <p><b>After-tax cost of debt = K<sub>d</sub>(1 − t)</b>, because interest is tax-deductible. Example: ₹100 of debt at 10% means ₹10 of interest, which saves ₹3 of tax at a 30% rate, so the effective cost is ₹7, or 7%. Use the firm's <b>marginal</b> tax rate.</p>`],
      ['4. WACC: weights and the tax shield',
        `<div class="formula">WACC = (E/V) × K<sub>e</sub> + (D/V) × K<sub>d</sub> × (1 − t), with V = D + E</div>
        <ul><li><b>Market values, not book values.</b> E = share price × number of shares. Investors could sell at market value, so their opportunity cost applies to market value. Marriott's 1987 book equity was $810.8m against a market value of $3,564m, and today's Marriott International has <i>negative</i> book equity. Debt at book value is an acceptable proxy when market values are not available.</li>
        <li><b>Target weights for hurdle rates.</b> A hurdle rate is used for decisions about the future, so use the capital structure the firm (or division) plans to keep. Marriott's target was 60% debt.</li>
        <li><b>Tax rate:</b> the marginal statutory rate (India 25.17% under the new regime; Marriott 34% after the 1986 Tax Reform Act).</li></ul>`],
      ['5. Levered and unlevered betas',
        `<div class="formula">β<sub>L</sub> = β<sub>U</sub> × [1 + (D/E)(1 − t)]   (Hamada)</div>
        <p>The <b>unlevered (asset) beta β<sub>U</sub></b> is the pure business risk: the beta the firm would have with no debt. The levered beta adds financial risk. Use the relation in both directions:</p>
        <ul><li><b>Unlever</b> a regression beta with the D/E that prevailed while it was estimated: β<sub>U</sub> = β<sub>L</sub> ÷ [1 + (D/E)(1 − t)].</li>
        <li><b>Relever</b> at the D/E the firm or division will actually carry: today's, or its target.</li></ul>
        <p><b>Asset betas add up by value.</b> A firm is a portfolio of businesses, so β<sub>U,firm</sub> = Σ (V<sub>i</sub>/V) × β<sub>U,i</sub>. This lets you (a) build a firm's beta from its divisions, or (b) back out the beta of a division that has no comparables.</p>
        <p><b>Cash.</b> Cash has a beta of about 0, so a cash-rich firm's measured beta understates its business risk: β<sub>U,firm</sub> = β<sub>business</sub> × (1 − cash/V). Strip cash out of comparables' betas and add the target firm's own cash back.</p>
        <p><b>Bottom-up beta (the usual recipe):</b> (1) find comparable firms, (2) unlever each (and remove cash), (3) average, (4) add your firm's cash and relever at your firm's D/E. An average over many comparable firms is usually more reliable than one stock's own regression beta. (In the Marriott case we average the comparables' betas and D/V ratios first and then unlever once; both ways are acceptable.)</p>`],
      ['6. Hurdle rates: firm, division, project',
        `<p>A <b>hurdle rate</b> is the minimum return (IRR) a project must earn. It is the same thing as the <b>discount rate</b> in an NPV calculation: the cash flows in the numerator tell you what the project returns, and the rate in the denominator captures how risky those cash flows are. Accept when IRR > hurdle, or equivalently when NPV at the hurdle > 0.</p>
        <ul><li><b>Firm level:</b> one rate for everything. Correct only if every project has the firm's average risk.</li>
        <li><b>Division level:</b> one rate per division, assuming projects within a division share its risk. This is what Marriott builds.</li>
        <li><b>Project level:</b> each project gets its own rate. Ideal in theory; data rarely allow it, so adjust the divisional rate up or down for clearly riskier or safer projects.</li></ul>
        <p>Using the firm-wide rate everywhere <b>accepts bad projects in risky divisions and rejects good projects in safe divisions</b>. The firm drifts into its riskiest business, and its own cost of capital rises over time. The <b>source of financing does not set the hurdle</b>: a project funded with a cheap loan is no safer than the same project funded with equity.</p>`],
      ['7. Marriott in one paragraph',
        `<p>In April 1988 Dan Cohrs, Marriott's vice-president of project finance, estimated hurdle rates for Marriott and its three divisions: Lodging, Contract Services and Restaurants. He unlevered Marriott's regression beta (0.97) at its market D/E (0.70), took betas for Lodging and Restaurants from listed comparables, and backed out Contract Services, which had no good comparables. He then relevered each division at its own target leverage (Table A), applied CAPM with the 30-year Treasury (8.95%) and the 5.63% historical premium, and added each division's own debt spread. Result: <b>Lodging 9.31% &lt; Marriott 10.61% &lt; Restaurants 11.30% &lt; Contract Services 13.23%</b>. The Marriott lab tab rebuilds every step.</p>`],
      ['8. The ten most common mistakes',
        `<ol><li>Using the bond's <b>coupon</b> as K<sub>d</sub> instead of its YTM.</li><li>Using <b>book values</b> for the weights.</li><li>Forgetting the <b>(1 − t)</b> on debt, or using it on equity.</li><li>Plugging a <b>regression beta</b> into CAPM after leverage has changed, without unlevering and relevering.</li><li>Unlevering a comparable's beta at <b>your firm's D/E</b> instead of at the comparable's own D/E.</li><li>Averaging betas by <b>equity</b> instead of by firm value (D + E).</li><li>Forgetting to convert <b>D/V into D/E</b> = (D/V)/(1 − D/V) before using Hamada.</li><li>Ignoring <b>cash</b> in cash-rich comparables.</li><li>Using the <b>arithmetic</b> average for the historical premium when the course uses the CAGR.</li><li>Setting the hurdle by the <b>source of financing</b> ("we borrow at 9%, so the hurdle is 9%") instead of by the risk of the project.</li></ol>`]
    ]
  };

  /* ------------------------------------------------------------------ HURDLE */
  N.hurdle = {
    title: 'Notes: reading the hurdle-rate chart',
    sections: [
      ['What the chart shows',
        `<p>Each column is one Marriott division. The coloured line in a column is that division's hurdle rate (its WACC from the Marriott lab, class base case). The dashed line is Marriott's firm-wide WACC of 10.61%, which is the value-weighted blend of the divisions' risk. Each dot is a project, plotted at its IRR. A green ✓ means the IRR is above the division's own hurdle (the project creates value); a red ✗ means it is below (the project destroys value).</p>`],
      ['The two shaded wedges',
        `<ul><li><b>Lodging (amber, "Wrongly rejected"):</b> Lodging's hurdle (9.31%) is <i>below</i> the firm rate. A hotel project with an IRR of, say, 10% beats its true cost of capital, so it creates value, but a manager using 10.61% rejects it. Every project inside this band is a good project turned down.</li>
        <li><b>Restaurants and Contract Services (red, "Wrongly accepted"):</b> their hurdles are <i>above</i> the firm rate. A catering contract with an IRR of 12.6% looks fine against 10.61% but fails its true 13.23% hurdle. Every project inside these bands destroys value but is approved.</li></ul>
        <p>Outside the wedges both rules agree: a project above both lines is accepted either way, and a project below both lines is rejected either way. The single-rate mistake only bites inside the wedges, but that is exactly where the marginal projects sit.</p>`],
      ['Why this matters over time',
        `<p>The errors are not random. The single-rate firm keeps saying yes to its riskiest division and no to its safest. Year by year its asset mix shifts towards risky businesses, so its true cost of capital rises, while it keeps using the old, too-low rate. The fix is the divisional (or project) hurdle rate.</p>`],
      ['How the game is scored',
        `<p>Each proposal is judged against its own division's hurdle: Lodging 9.31%, Restaurants 11.30%, Contract Services 13.23%. The "firm-WACC manager" uses 10.61% for everything. Of the eight illustrative projects, the firm-WACC manager gets five wrong: two good hotel projects rejected and three value-destroying restaurant and catering projects accepted.</p>`]
    ]
  };

  /* ------------------------------------------------------------------ MACHINE */
  N.machine = {
    title: 'Notes: what the WACC Machine computes',
    sections: [
      ['The three curves',
        `<p>For each debt ratio D/V from 0% to 80% the machine computes:</p>
        <ol><li><b>Cost of equity</b>: D/E = (D/V)/(1 − D/V), β<sub>L</sub> = β<sub>U</sub>[1 + (D/E)(1 − t)], K<sub>e</sub> = R<sub>f</sub> + β<sub>L</sub> × MRP. It rises with leverage because equity holders bear more risk.</li>
        <li><b>After-tax cost of debt</b>: K<sub>d</sub> × (1 − t), with K<sub>d</sub> = R<sub>f</sub> + spread.</li>
        <li><b>WACC</b> = (1 − D/V) × K<sub>e</sub> + D/V × K<sub>d</sub> × (1 − t).</li></ol>
        <p>Click anywhere on the chart, or drag the D/V slider, to move the marker. The decomposition bars below the chart show where each percentage point comes from at that leverage.</p>`],
      ['Fixed spread',
        `<p>With a fixed spread, three cases tell the whole story:</p>
        <ul><li><b>No taxes and no spread</b> (set both to 0): WACC is <b>flat</b>. Replacing equity with cheaper debt is exactly offset by equity becoming riskier and more expensive.</li>
        <li><b>With taxes, small spread</b>: WACC <b>falls</b> as debt rises, because every rupee of interest saves t rupees of tax (the interest tax shield).</li>
        <li><b>With taxes, large spread</b>: WACC rises from the very first rupee of debt. With a fixed spread the WACC line is straight, so it either falls all the way or rises all the way. It rises when the spread × (1 − t) is larger than t × (R<sub>f</sub> + β<sub>U</sub> × MRP), which at the default settings means a spread above about 4.3%.</li></ul>`],
      ['Spread follows the rating: why WACC is U-shaped',
        `<p>In this mode the cost of debt is not fixed. Interest coverage = EBIT ÷ interest = (EBIT/V) ÷ [(D/V) × K<sub>d</sub>]. More debt means more interest, lower coverage, a worse synthetic rating and a higher spread, which in turn raises interest again. The machine iterates until the rating is self-consistent (as in real-world case 4). The kinks in the curves are rating downgrades. At low leverage the tax shield dominates and WACC falls; at high leverage the rising spread dominates and WACC rises. The lowest point shows the debt level with the lowest WACC.</p>
        <p>The "EBIT / firm value" slider sets how profitable the firm is relative to its size. A more profitable firm keeps higher coverage at the same debt, so its lowest-WACC D/V is further to the right.</p>`],
      ['Reading the decomposition bars',
        `<ul><li><b>Cost of equity</b> = R<sub>f</sub> (time value) + β<sub>U</sub> × MRP (business-risk premium) + (β<sub>L</sub> − β<sub>U</sub>) × MRP (financial-risk premium, the extra return equity demands because of debt).</li>
        <li><b>WACC</b> = the equity part + the after-tax debt part. The hatched grey block is the tax shield, D/V × K<sub>d</sub> × t: the share of the interest bill paid by the government.</li></ul>`],
    ]
  };

  /* ------------------------------------------------------------------ MARRIOTT */
  N.marriott = {
    title: 'Notes: the Marriott case, step by step',
    sections: [
      ['Background',
        `<p>In 1988 Marriott Corporation had three lines of business: <b>Lodging</b> (hotels, about 41% of 1987 sales), <b>Contract Services</b> (food and services management for airlines, hospitals, schools and businesses, about 46%) and <b>Restaurants</b> (about 13%). Its financial strategy had four elements: <b>manage rather than own hotel assets</b>, <b>invest in projects that increase shareholder value</b>, <b>optimise the use of debt</b>, and <b>repurchase undervalued shares</b>. To decide which projects increase value it needed a hurdle rate for each division. Dan Cohrs, vice-president of project finance, was asked to estimate them.</p>`],
      ['Step 1: cost of debt (Table A, Table B)',
        `<p>K<sub>d</sub> = government rate + the division's debt-rate premium. Using the 30-year Treasury (8.95%): Marriott 8.95% + 1.30% = 10.25%; Lodging + 1.10% = 10.05%; Contract Services + 1.40% = 10.35%; Restaurants + 1.80% = 10.75%. Lodging borrows most cheaply because hotels are long-lived real estate that makes good collateral.</p>`],
      ['Step 2: Marriott\'s unlevered beta (Exhibit 1, Exhibit 3)',
        `<p>Market value of equity = $30 × 118.8m shares = $3,564m. Debt (book value as a proxy) = $2,498.8m. Current D/E = 0.70. The regression beta is 0.97 (Exhibit 3, daily data 1986–87).</p>
        <div class="formula">β<sub>U</sub> = 0.97 ÷ [1 + 0.70 × (1 − 0.34)] = 0.663</div>
        <p>We remove the effect of Marriott's own debt (D/E = 0.70) to get the pure business risk of Marriott as a whole.</p>`],
      ['Step 3: comparables for Lodging and Restaurants (Exhibit 3)',
        `<p><b>Lodging</b> (Hilton, Holiday, La Quinta, Ramada): average β<sub>L</sub> = 0.9175, average D/V = 0.5675, so D/E = 1.312 and β<sub>U</sub> = 0.9175 ÷ [1 + 1.312 × 0.66] = <b>0.492</b>.<br>
        <b>Restaurants</b> (Church's, Collins, Frisch's, McDonald's, Wendy's; Luby's cafeterias excluded): average β<sub>L</sub> = 0.712, average D/V = 0.128, so D/E = 0.147 and β<sub>U</sub> = <b>0.649</b>.<br>
        The "market leverage" column in Exhibit 3 is a D/V ratio, so convert it to D/E before unlevering.</p>`],
      ['Step 4: back out Contract Services (Exhibit 2)',
        `<p>Divisional market values are unknown, so we weight by 1987 identifiable assets: Lodging 60.6%, Contract Services 27.0%, Restaurants 12.4%.</p>
        <div class="formula">0.663 = 0.606 × 0.492 + 0.270 × β<sub>U,CS</sub> + 0.124 × 0.649 ⟹ β<sub>U,CS</sub> = 1.054</div>
        <p>Contract Services comes out as the riskiest division. Its margins are thin and its contracts can be lost at short notice, which fits.</p>`],
      ['Steps 5–7: relever, CAPM, WACC',
        `<p>Each division is relevered at <b>its own target leverage</b> (Table A), then CAPM uses R<sub>f</sub> = 8.95% and MRP = 5.63%:</p>
        <div class="tblwrap"><table class="tbl"><tr><th></th><th>Target D/V</th><th>β<sub>L</sub></th><th>K<sub>e</sub></th><th>K<sub>d</sub></th><th>WACC</th></tr>
        <tr><td>Marriott</td><td>60%</td><td>1.320</td><td>16.38%</td><td>10.25%</td><td>10.61%</td></tr>
        <tr><td>Lodging</td><td>74%</td><td>1.415</td><td>16.92%</td><td>10.05%</td><td>9.31%</td></tr>
        <tr><td>Restaurants</td><td>42%</td><td>0.959</td><td>14.35%</td><td>10.75%</td><td>11.30%</td></tr>
        <tr><td>Contract Services</td><td>40%</td><td>1.518</td><td>17.50%</td><td>10.35%</td><td>13.23%</td></tr></table></div>
        <p>Lodging has the highest cost of equity but the lowest WACC. It carries 74% cheap, tax-deductible debt, and its business risk is low enough to support it.</p>`],
      ['Why each assumption is made',
        `<ul><li><b>30-year rate:</b> hotels are long-lived, so a long-term government rate is used.</li>
        <li><b>5.63%, not 7.43%:</b> HRP = CAGR(S&P 500) − CAGR(long-term government bonds) = 9.90% − 4.27% = 5.63% (Exhibit 4, 1926–87). The course uses this geometric (CAGR) premium because it reflects how wealth actually compounded. The arithmetic premium (7.43%) would raise the hurdles by about 0.7 points (Lodging) to 1.6 points (Contract Services).</li>
        <li><b>34% tax:</b> the US corporate tax rate in 1988.</li>
        <li><b>Asset weights:</b> they approximate the capital each division ties up. Weighting by operating profit would give Contract Services a larger weight (33%) and a lower backed-out beta (0.94).</li>
        <li><b>Luby's excluded:</b> it runs cafeterias, a different business from the fast-food chains.</li></ul>
        <p>The assumption panel lets you change each choice and see its effect. The class base case is marked in green.</p>`]
    ]
  };

  /* ------------------------------------------------------------------ REAL */
  N.real = {
    title: 'Notes: using the Real companies tab',
    sections: [
      ['What this tab does',
        `<p>It applies the session's recipe to 12 listed companies with data as of November 2026: market-value weights, CAPM for K<sub>e</sub>, a synthetic rating for K<sub>d</sub>, and the WACC formula. Pick a company on the left to see every input and each step of the calculation. Every input box can be edited; "Reset inputs" restores the original data. The full methodology and the source links are in the card "How every number is built" below.</p>`],
      ['The beta switch',
        `<p><b>Regression</b> uses each company's own beta, measured from its share price against the market index. <b>Bottom-up</b> uses the average unlevered beta of the company's industry (like the comparables in the Marriott case), adjusts it for the company's cash, and relevers it at the company's own D/E. If the two give very different answers, the company's own beta is unusual for its industry.</p>`],
      ['Comparing across countries',
        `<p>A rupee WACC and a dollar WACC are not directly comparable: the Indian risk-free rate is higher, mainly because expected inflation in India is higher. Compare companies within the same currency.</p>`]
    ]
  };

  /* ------------------------------------------------------------------ CONCEPTS */
  N.concepts = {
    title: 'Notes: using the concept checks',
    sections: [
      ['How to use them',
        `<p>Each question tests a <i>reason</i>, not a calculation. Choose an answer to see a full explanation. If you are wrong, the explanation also says why your choice fails. "Try again" resets a question. Your record of correct answers is kept only in this browser. The ideas behind every question are in the Session 11 notes on the Start here tab.</p>`]
    ]
  };

  /* ------------------------------------------------------------------ PRACTICE */
  N.cases = {
    title: 'Notes: how to approach these cases',
    sections: [
      ['A five-step routine',
        `<ol><li><b>List what you are given</b> and in which form: D/V or D/E? Book or market values? A levered or an unlevered beta, and at which leverage was it measured?</li>
        <li><b>Draw the chain</b> before calculating: for example comparables' β<sub>L</sub> → β<sub>U</sub> → (remove cash) → (add your cash) → relever at your D/E → K<sub>e</sub> → WACC.</li>
        <li><b>Keep four decimals</b> for betas and two decimals in % for rates during the working. Round only the final answer.</li>
        <li><b>Check signs and sizes:</b> levered beta > unlevered beta; after-tax K<sub>d</sub> < K<sub>d</sub>; WACC lies between after-tax K<sub>d</sub> and K<sub>e</sub>.</li>
        <li><b>Use the hints in order</b> only when stuck. The full solution unlocks once you have checked an attempt.</li></ol>`],
      ['Entering answers',
        `<p>Enter percentages as numbers (12.34 for 12.34%), betas as decimals, and rupee amounts in crore. An answer counts as correct within ±0.10 percentage points for rates and ±1% for betas and amounts, unless a part says otherwise. Some parts are deliberately tighter so that a common wrong method is not accepted by accident.</p>`]
    ]
  };

  window.S11_NOTES = N;
})();
