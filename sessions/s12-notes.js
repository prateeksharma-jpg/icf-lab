/* Session 12: detailed self-study notes for every tab. Students use the lab on their own,
   so every point is explained in full. Only what the session teaches. */
(function () {
  'use strict';
  const N = {};

  N.start = {
    title: 'Session 12 notes: valuing equity with dividends',
    sections: [
      ['1. The idea: a share is worth the cash it pays you',
        `<p>The value of <b>any</b> asset is the present value of the cash flows it will give its owner. You have already used this for bonds: a bond's price is the PV of its coupons and face value, discounted at the return bondholders want for that risk (the YTM).</p>
        <p>A share works the same way. A shareholder who buys and holds receives <b>dividends</b>. So:</p>
        <div class="formula">Value of a share = PV of the future dividends, discounted at the cost of equity r</div>
        <p>The discount rate r is the <b>cost of equity</b>: the return shareholders want, given how risky the dividends are. You estimate it with CAPM, exactly as in Session 11: r = R<sub>f</sub> + β × (R<sub>m</sub> − R<sub>f</sub>).</p>
        <p>Every dividend discount model (DDM) needs just three inputs: the <b>cash flows</b> (dividends), their <b>growth rate</b>, and the <b>discount rate</b>.</p>`],
      ['2. Why not just use the book value of equity?',
        `<p>Book value of equity = assets − liabilities on the balance sheet. It is the most backward-looking number in finance:</p>
        <ul><li>Some items are at fair value (cash, short-term marketable securities), but long-term assets, purchased licences and patents, and acquired goodwill are at <b>historical cost</b> less depreciation, not at what they are worth today.</li>
        <li>Many valuable assets are <b>not on the balance sheet at all</b>: brand names, customer loyalty, employees' skills, managers' competence, know-how, relationships with suppliers and partners, knowledge the firm built itself.</li></ul>
        <p>So book value and market value can be far apart. Book equity can even be <b>negative</b> for a good company. In June 2005 Amazon had total liabilities of $2.6 billion and book equity of <b>−$64 million</b>, while the market valued its equity at over <b>$15 billion</b>. Investors could see that its assets were worth far more than their book value. (Market value of equity can never be negative: the worst a shareholder can lose is what they paid.)</p>
        <div class="callout"><b>Today's examples (25 Nov 2026).</b> Nestlé India's share price is about <b>45 times</b> its book value per share (₹1,358 against about ₹30): its brands are worth far more than the balance sheet shows. ONGC trades <b>below</b> book value (₹222 against ₹318), because investors expect its oil and gas earnings to shrink. Marriott International (Session 11) has negative book equity after years of buying back its shares.</div>`],
      ['3. Why not just use the market price?',
        `<ul><li>Markets may be wrong: a price is investors' current opinion, not a guarantee.</li>
        <li>Private companies have no market price at all.</li>
        <li>To make decisions that raise value, a manager needs to know what <b>drives</b> value: cash flows, growth and risk. A valuation model shows that; a price alone does not.</li></ul>
        <p>This course covers two of the five approaches to valuing equity: <b>dividend discount models</b> (this session) and <b>relative valuation</b> (later).</p>`],
      ['4. Single-period and multi-period DDM',
        `<p><b>One period.</b> If you buy today, collect the dividend D<sub>1</sub> at the end of the year and sell at P<sub>1</sub>:</p>
        <div class="formula">V<sub>0</sub> = D<sub>1</sub> ÷ (1 + r) + P<sub>1</sub> ÷ (1 + r)</div>
        <div class="callout"><b>Worked example (class).</b> Bandhan Bank is expected to pay a ₹2 dividend next year and trade at ₹58 a year from now. With r = 10%: V<sub>0</sub> = (2 + 58) ÷ 1.1 = <b>₹54.55</b>.</div>
        <p><b>Two or more periods.</b> P<sub>1</sub> is itself the value of D<sub>2</sub> and P<sub>2</sub>, so V<sub>0</sub> = D<sub>1</sub>/(1+r) + D<sub>2</sub>/(1+r)<sup>2</sup> + P<sub>2</sub>/(1+r)<sup>2</sup>, and so on. Keep expanding and every future price is replaced by the dividends after it:</p>
        <div class="formula">V<sub>0</sub> = D<sub>1</sub>/(1+r) + D<sub>2</sub>/(1+r)<sup>2</sup> + D<sub>3</sub>/(1+r)<sup>3</sup> + … forever</div>
        <p>A share is a <b>perpetual</b> instrument. Holding it for one year and selling gives the same value as holding it forever, because the selling price is the value of all the later dividends.</p>
        <div class="callout warn"><b>Default assumption.</b> The current year's dividend D<sub>0</sub> (at t = 0) has <b>already been paid</b>. D<sub>1</sub> is the first future cash flow. The sum starts at D<sub>1</sub>, never at D<sub>0</sub>.</div>`],
      ['5. The stable growth (Gordon) model',
        `<p>We cannot forecast every dividend forever. The simplest assumption: dividends grow at a stable rate g forever. Then the dividends D<sub>1</sub>, D<sub>1</sub>(1+g), D<sub>1</sub>(1+g)<sup>2</sup>, … form a growing perpetuity:</p>
        <div class="formula">P<sub>0</sub> = D<sub>1</sub> ÷ (r − g) = D<sub>0</sub>(1 + g) ÷ (r − g)</div>
        <p>This is the <b>single-stage</b> or <b>stable growth</b> model (also called the Gordon growth model).</p>
        <div class="callout"><b>Worked examples (class).</b><br>• D<sub>0</sub> = ₹5 just paid, g = 5%, r = 8%: D<sub>1</sub> = 5.25 and P<sub>0</sub> = 5.25 ÷ 0.03 = <b>₹175</b>.<br>• D<sub>0</sub> = ₹5, r = 10%, dividends <b>shrinking</b> 5% a year forever: P<sub>0</sub> = 5 × 0.95 ÷ (0.10 + 0.05) = <b>₹31.67</b>. Growth can be negative; it just lowers the value.<br>• Same firm growing at +5%: 5 × 1.05 ÷ 0.05 = <b>₹105</b>.<br>• No growth (g = 0): the same ₹5 every year, worth 5 ÷ 0.10 = <b>₹50</b>.</div>
        <p>Because the model runs forever, both r and g must be <b>long-term</b> numbers. The value is <b>very sensitive</b> to them: in the ₹175 example, cutting r from 8% to 7% raises the value to 5.25 ÷ 0.02 = ₹262.50, a 50% jump: r − g falls from 3% to 2%, and 0.03 ÷ 0.02 = 1.5.</p>`],
      ['6. How high can stable growth be?',
        `<p>Stable growth lasts <b>forever</b>, so it must be capped at a sensible ceiling. A company cannot grow faster than the economy it operates in forever, or one day its dividends would be bigger than the whole economy (see the "How high can growth go?" tab).</p>
        <p>The long-run growth of the economy is nominal GDP growth = real growth + inflation. The risk-free rate also reflects expected inflation plus expected real growth, so <b>R<sub>f</sub> is a good proxy for the long-term growth of the economy</b>. This gives a useful result:</p>
        <div class="formula">Stable growth g &lt; R<sub>f</sub></div>
        <p>And since r = R<sub>f</sub> + risk premium &gt; R<sub>f</sub>, it follows that <b>g &lt; r</b>, so r − g &gt; 0. If r − g = 0 the formula gives an infinite price; if r − g &lt; 0 it gives a negative price. Both are impossible, which is why the formula only works when growth is below the discount rate.</p>`],
      ['7. Where growth comes from: retention × ROE',
        `<p>Earnings a company does <b>not</b> pay out are reinvested. Reinvested earnings raise book equity, and book equity earns the ROE, so they raise future earnings. Growth depends on two things: <b>how much is reinvested</b> and <b>how well it is invested</b>.</p>
        <div class="formula">Growth in EPS<sub>t</sub> = Retention ratio<sub>t−1</sub> × ROE<sub>t</sub></div>
        <ul><li>Payout ratio = DPS ÷ EPS (or dividends ÷ net income); retention ratio = 1 − payout ratio.</li>
        <li>ROE<sub>t</sub> = EPS<sub>t</sub> ÷ BVPS<sub>t−1</sub> = net income<sub>t</sub> ÷ book equity<sub>t−1</sub>: book equity at the <b>start</b> of the year.</li>
        <li>Assumption: the firm raises no new equity or debt.</li></ul>
        <div class="callout"><b>Worked example 1 (class).</b> ROE 20%, BVPS<sub>0</sub> = 100, half of EPS retained. Year 1: EPS 20, DPS 10, BVPS 110. Year 2: EPS = 20% × 110 = 22, DPS 11, BVPS 121. EPS grew 20 → 22 = 10% = 0.5 × 20%. The extra ₹2 is 20% earned on the ₹10 kept back in year 1.<br><br><b>Worked example 2 (class).</b> BVPS<sub>0</sub> = 100, ROE 15%, retention ⅓. EPS<sub>1</sub> = 15, DPS<sub>1</sub> = 10, retained 5, BVPS<sub>1</sub> = 105, EPS<sub>2</sub> = 15.75: growth 5% = ⅓ × 15%. With a fixed payout, DPS also grows 5% (10 → 10.5).</div>
        <p><b>Timing.</b> Growth in year t uses the retention of year t − 1. Companies often retain a lot while young (high growth), then settle into a low, constant retention ratio. If the retention ratio settles in year 3, the growth rate of earnings (and dividends) settles from <b>year 4</b>.</p>
        <p>Other ways to estimate growth: historical growth and analysts' estimates.</p>`],
      ['8. Running the model backwards: implied growth and implied return',
        `<p>If the market price equals the value, the stable growth model can be solved for the unknown.</p>
        <div class="callout"><b>Worked example (class).</b> β = 1.1, R<sub>f</sub> = 5.6%, market risk premium 6%, D<sub>0</sub> = ₹2, g = 5%.<br>r = 5.6% + 1.1 × 6% = 12.2%; V<sub>0</sub> = 2 × 1.05 ÷ (0.122 − 0.05) = <b>₹29.17</b>.<br>If the price is ₹40, the growth the market expects: 40 = 2(1 + g) ÷ (0.122 − g) ⟹ 4.88 − 40g = 2 + 2g ⟹ g = 2.88 ÷ 42 = <b>6.857%</b>.</div>
        <p><b>Implied cost of equity</b> (the expected return from buying at today's price): rearrange P<sub>0</sub> = D<sub>1</sub> ÷ (r − g):</p>
        <div class="formula">r = D<sub>1</sub> ÷ P<sub>0</sub> + g = dividend yield + growth</div>
        <p>Both rely on the price being equal to the intrinsic value.</p>`],
      ['9. Multi-stage models',
        `<p>The stable growth model suits mature companies. Young companies usually grow fast first, then settle down.</p>
        <ul><li><b>Two-stage:</b> high growth for some years (say 10% for 5 years), then stable growth forever (say 5%).</li>
        <li><b>Three-stage:</b> high growth, then a <b>transition</b> in which growth falls step by step, then stable growth. Class example: 10% for five years, then 8%, 6%, 4% in years 6–8, then 4% forever.</li></ul>
        <p>Method: discount each dividend of the early stages, then add the <b>terminal value</b>, the value of the stable stage. The growing perpetuity formula gives the value <b>one period before</b> its first dividend: if stable dividends start in year n + 1, then P<sub>n</sub> = D<sub>n+1</sub> ÷ (r − g) is a year-n value and is discounted by (1 + r)<sup>n</sup>.</p>
        <div class="callout"><b>Worked example (class).</b> D<sub>1</sub> = ₹5, growing 8% a year up to year 6. D<sub>7</sub> = ₹8.33, then 4% forever. r = 10%.<br>Years 1–6 (growing annuity): 5 ÷ (0.10 − 0.08) × [1 − (1.08/1.10)<sup>6</sup>] = 26.06.<br>Terminal value at year 6: 8.33 ÷ (0.10 − 0.04) = 138.83, worth 138.83 ÷ 1.1<sup>6</sup> = 78.37 today.<br>Price = 26.06 + 78.37 = <b>₹104.43</b>.</div>
        <p>For a growing company, the terminal value is usually most of the price, so the stable growth rate is the most important assumption in the model.</p>`],
      ['10. PVGO: what investors pay for growth',
        `<p>Imagine an all-equity company that pays out all its earnings. It reinvests nothing, so its EPS never grows: EPS = DPS = EPS<sub>0</sub> forever, a level perpetuity worth EPS<sub>0</sub> ÷ r. Most companies have growth opportunities (new positive-NPV projects), so their price can be higher. Split the value in two:</p>
        <div class="formula">Value of a share = EPS<sub>0</sub> ÷ r (assets in place) + PVGO (present value of growth opportunities)</div>
        <ul><li><b>Assets in place (AIP):</b> the assets that produce today's EPS<sub>0</sub>.</li>
        <li><b>PVGO:</b> future positive-NPV investments that will grow earnings and dividends. A company with no positive-NPV projects is a no-growth company with PVGO = 0.</li></ul>
        <div class="callout"><b>Worked example (class).</b> EPS<sub>0</sub> = ₹20, r = 10%, price ₹250. AIP = 20 ÷ 0.1 = 200, so PVGO = 250 − 200 = <b>₹50</b>.<br>• Price ₹200: PVGO = 0, no growth opportunities: EPS = DPS = 20 forever.<br>• Price ₹150: PVGO = <b>−₹50</b>. Investors expect earnings and dividends to fall below ₹20, or the company to invest in projects that earn less than r.</div>
        <p>If PVGO is 80% of the price, the market is assigning 80% of the value to future growth. For a no-growth company (and if the price equals the value), the earnings yield EPS<sub>0</sub> ÷ P<sub>0</sub> equals the expected return r.</p>`],
      ['11. When is the DDM the right tool?',
        `<p><b>Use it</b> when dividends bear an understandable and consistent relation to profitability: mature, stable companies and broad portfolios such as equity indices. The stable growth model is also used to estimate expected returns and to compute the terminal value in other DCF models.</p>
        <p><b>Be careful</b> when:</p>
        <ul><li>the firm pays no dividends (young or high-growth firms);</li>
        <li>dividends are "sticky" and set by the board without any link to value created (dividends distribute wealth, they do not create it);</li>
        <li>the firm returns cash mainly through share buybacks, which the DDM ignores;</li>
        <li>the answer depends heavily on g and r, which are hard to pin down.</li></ul>
        <p>The class slide's Firm A paid ₹1.00 every year while its EPS swung from −0.36 to 4.92 (payout from 20% to 833%): the dividend says nothing about value. Firm B's dividend moved with its earnings (payout 28–58%). The DDM suits Firm B. The Real companies tab shows real examples of both.</p>`]
    ]
  };

  N.builder = {
    title: 'Notes: reading the DDM Builder',
    sections: [
      ['What the chart shows', `<p>Each bar is one year's dividend. The light part is the dividend itself; the dark part is what it is worth today (its PV at r). Later dividends are bigger (growth) but worth less today (discounting). The block on the right is the <b>terminal value</b>: the PV of every dividend in the stable stage.</p>`],
      ['The value breakdown', `<p>The stacked bar splits the price into the PV of the high-growth dividends, the transition dividends and the terminal value. For most growing companies the terminal value is the biggest part. That is why the stable growth rate deserves so much care.</p>`],
      ['The sensitivity table', `<p>The table recalculates the value for r and stable g one percentage point either side of your inputs. Values change most when r − g is small, because the denominator of the growing perpetuity is close to zero.</p>`],
      ['The warnings', `<p><b>g ≥ r:</b> the formula breaks (infinite or negative value). <b>g &gt; R<sub>f</sub>:</b> the stable growth rate is above the long-run growth of the economy, which cannot last forever. The builder uses R<sub>f</sub> = 7.34%, the 10-year G-sec yield on 17 Nov 2026.</p>`]
    ]
  };

  N.growth = {
    title: 'Notes: the growth engine and PVGO',
    sections: [
      ['How the table is built', `<p>Start: EPS<sub>0</sub> has just been earned and BVPS<sub>−1</sub> = EPS<sub>0</sub> ÷ ROE. Each year: EPS<sub>t</sub> = ROE × BVPS<sub>t−1</sub>; DPS<sub>t</sub> = payout<sub>t</sub> × EPS<sub>t</sub>; BVPS<sub>t</sub> = BVPS<sub>t−1</sub> + (EPS<sub>t</sub> − DPS<sub>t</sub>). The growth column is EPS<sub>t</sub> ÷ EPS<sub>t−1</sub> − 1, which always equals retention<sub>t−1</sub> × ROE.</p>`],
      ['A change in payout', `<p>If you set a new payout from some year k, dividends jump in year k (a bigger share of the same earnings is paid out), but growth changes only from year k + 1, because growth comes from what was kept back the year before.</p>`],
      ['How the value is computed', `<p>Dividends up to year k − 1 are discounted one by one. From year k on, the dividends D<sub>k</sub>, D<sub>k+1</sub>, … form a growing perpetuity: each is bigger than the one before by the new stable rate, starting with D<sub>k+1</sub> = D<sub>k</sub>(1 + g). So they are valued at year k − 1: P<sub>k−1</sub> = D<sub>k</sub> ÷ (r − g). With no payout change, this is just the stable growth model: P<sub>0</sub> = D<sub>1</sub> ÷ (r − g).</p>`],
      ['Reading PVGO', `<p>PVGO = value − EPS<sub>0</sub> ÷ r. Try these:</p><ul><li><b>Payout 100%:</b> nothing is reinvested, EPS stays at EPS<sub>0</sub>, and PVGO is zero.</li><li><b>High ROE, low payout:</b> reinvested money earns much more than shareholders require, and PVGO is large.</li><li><b>ROE well below r:</b> money kept back earns less than shareholders could earn elsewhere at the same risk. Earnings still grow, but PVGO turns negative: shareholders would be better off if the company paid the money out.</li></ul><p class="muted">A detail you may notice: with ROE exactly equal to r, PVGO here is slightly positive (about retention × EPS<sub>0</sub>). That is because the earnings kept back in year 0 are already in the book value and will earn r from year 1. PVGO turns negative a little below r.</p>`]
    ]
  };

  N.reality = {
    title: 'Notes: why stable growth must be modest',
    sections: [
      ['The point of the Apple vs World spreadsheet', `<p>The class spreadsheet compared Apple's revenue ($200 billion, growing 25.9% a year in 2015) with world GDP ($78 trillion, growing 3.5% a year, the IMF estimate of real growth used in class). Keep both growth rates going and Apple's revenue eventually becomes larger than the entire world economy, which is impossible because Apple's sales are part of world GDP. A growth rate far above the economy's can only last for a limited time.</p>`],
      ['What this means for the DDM', `<p>In a stable growth (terminal) stage, the growth rate lasts forever, so it cannot be higher than the long-run nominal growth of the economy. R<sub>f</sub> is a good proxy for that, and the rule we use is <b>g &lt; R<sub>f</sub></b>. High growth belongs in the early stages of a multi-stage model, for a limited number of years.</p>`],
      ['How the years are calculated', `<p>The company's share of the economy changes each year by the factor (1 + g<sub>company</sub>) ÷ (1 + g<sub>economy</sub>). Starting from share s<sub>0</sub>, it reaches 100% after n years, where s<sub>0</sub> × [(1 + g<sub>company</sub>) ÷ (1 + g<sub>economy</sub>)]<sup>n</sup> = 1. You do not need to solve this by hand: the chart shows the year.</p>`]
    ]
  };

  N.cases = {
    title: 'Notes: how to approach these cases',
    sections: [
      ['A checklist that works for every DDM question', `<ol><li><b>Timeline first.</b> Write t = 0, 1, 2, 3 … and put each dividend under its year. Is the dividend given D<sub>0</sub> (just paid) or D<sub>1</sub>?</li>
        <li><b>Discount rate.</b> If it is not given, use CAPM: r = R<sub>f</sub> + β × market risk premium.</li>
        <li><b>Growth.</b> If growth is not given, build it: g = retention ratio of the previous year × ROE, with ROE measured on book equity at the start of the year.</li>
        <li><b>Find where stable growth starts.</b> If stable dividends start at year n + 1, the terminal value P<sub>n</sub> = D<sub>n+1</sub> ÷ (r − g) sits at year n.</li>
        <li><b>Discount</b> every early dividend and the terminal value to today, and add.</li>
        <li><b>Sense-check:</b> is g below R<sub>f</sub> and r? Is PVGO = price − EPS<sub>0</sub> ÷ r positive or negative, and does that make sense?</li></ol>`],
      ['Common slips', `<ul><li>Using D<sub>0</sub> instead of D<sub>1</sub> in D ÷ (r − g).</li><li>Discounting a year-n terminal value by (1 + r)<sup>n+1</sup>.</li><li>Changing growth in the same year the payout changes (it changes the year after).</li><li>Using ROE on the end-of-year book value.</li><li>Forgetting that a negative g makes r − g bigger.</li></ul>`]
    ]
  };

  window.S12_NOTES = N;
})();
