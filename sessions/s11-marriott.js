/* Marriott Corporation: The Cost of Capital (HBS 9-289-047), April 1988 data.
   Engine reproduces the class solution (Mariott Case.xlsx, Sheet1) exactly in its base case. */
(function () {
  'use strict';
  const { Fin } = ICF;
  const M = {
    E: 30 * 118.8, D: 2498.8, bl: 0.97, price: 30, shares: 118.8, bookE: 810.8,
    rf: { '30y': 0.0895, '10y': 0.0872, '1y': 0.069 },
    mrp: [
      { k: 'g-lt', t: 'Geometric, S&P 500 over LT govt bonds, 1926–87 (class)', v: 0.0563, base: 'lt', type: 'g' },
      { k: 'a-lt', t: 'Arithmetic, S&P 500 over LT govt bonds, 1926–87', v: 0.0743, base: 'lt', type: 'a' },
      { k: 'g-tb', t: 'Geometric, S&P 500 over T-bills, 1926–87', v: 0.0642, base: 'tb', type: 'g' },
      { k: 'a-tb', t: 'Arithmetic, S&P 500 over T-bills, 1926–87', v: 0.0847, base: 'tb', type: 'a' },
      { k: 'g-5175', t: 'Geometric over LT govt, 1951–75 only', v: 0.0804, base: 'lt', type: 'g' },
      { k: 'g-8185', t: 'Geometric over LT govt, 1981–85 only (negative!)', v: -0.0211, base: 'lt', type: 'g' }],
    tax: { stat: 0.34, eff: 175.9 / 398.9 },
    seg: { lod: { assets: 2777.4, op: 263.9, sales: 2673.3 }, cs: { assets: 1237.7, op: 170.6, sales: 2969.0 }, rest: { assets: 567.6, op: 82.4, sales: 879.9 } },
    comps: {
      lod: [{ n: 'Hilton Hotels', b: 0.88, dv: 0.14, on: true }, { n: 'Holiday Corp', b: 1.46, dv: 0.79, on: true }, { n: 'La Quinta Motor Inns', b: 0.38, dv: 0.69, on: true }, { n: 'Ramada Inns', b: 0.95, dv: 0.65, on: true }],
      rest: [{ n: "Church's Fried Chicken", b: 0.75, dv: 0.04, on: true }, { n: 'Collins Foods', b: 0.60, dv: 0.10, on: true }, { n: "Frisch's Restaurants", b: 0.13, dv: 0.06, on: true }, { n: "Luby's Cafeterias", b: 0.64, dv: 0.01, on: false, note: 'cafeterias: excluded in the class solution' }, { n: "McDonald's", b: 1.00, dv: 0.23, on: true }, { n: "Wendy's", b: 1.08, dv: 0.21, on: true }]
    },
    tgt: { firm: { dv: 0.60, s: 0.013 }, lod: { dv: 0.74, s: 0.011 }, cs: { dv: 0.40, s: 0.014 }, rest: { dv: 0.42, s: 0.018 } },
    names: { firm: 'Marriott (firm)', lod: 'Lodging', rest: 'Restaurants', cs: 'Contract Services' }
  };
  M.defaults = () => ({ rf: '30y', mrp: 'g-lt', tax: 'stat', w: 'assets', method: 'avg', match: false, comps: JSON.parse(JSON.stringify(M.comps)) });

  M.run = function (o) {
    const t = M.tax[o.tax];
    const mrpObj = M.mrp.find(m => m.k === o.mrp);
    const rfFor = div => o.match ? (div === 'lod' || div === 'firm' ? M.rf['30y'] : div === 'rest' ? M.rf['10y'] : M.rf['1y']) : M.rf[o.rf];
    const mrpFor = div => {
      if (!o.match || div !== 'cs') return mrpObj.v;
      // a 1-year rate must be paired with the premium measured over T-bills (same averaging method)
      const pair = { 'g-lt': 'g-tb', 'a-lt': 'a-tb' }[mrpObj.k];
      return pair ? M.mrp.find(m => m.k === pair).v : mrpObj.v;
    };
    const de0 = M.D / M.E, buF = Fin.unlever(M.bl, de0, t);
    const tot = M.seg.lod[o.w] + M.seg.cs[o.w] + M.seg.rest[o.w];
    const w = { lod: M.seg.lod[o.w] / tot, cs: M.seg.cs[o.w] / tot, rest: M.seg.rest[o.w] / tot };
    const compBeta = list => {
      const on = list.filter(c => c.on); if (!on.length) return { bu: NaN, avgB: NaN, avgDv: NaN, n: 0 };
      if (o.method === 'avg') {
        const avgB = Fin.mean(on.map(c => c.b)), avgDv = Fin.mean(on.map(c => c.dv)), de = Fin.deFromDv(avgDv);
        return { bu: Fin.unlever(avgB, de, t), avgB, avgDv, de, n: on.length };
      }
      const each = on.map(c => Fin.unlever(c.b, Fin.deFromDv(c.dv), t));
      return { bu: Fin.mean(each), each, n: on.length, avgB: Fin.mean(on.map(c => c.b)), avgDv: Fin.mean(on.map(c => c.dv)) };
    };
    const L = compBeta(o.comps.lod), R = compBeta(o.comps.rest);
    const buCS = (buF - w.lod * L.bu - w.rest * R.bu) / w.cs;
    const div = (key, bu) => {
      const g = M.tgt[key], rf = rfFor(key), mrp = mrpFor(key), de = Fin.deFromDv(g.dv), blv = Fin.lever(bu, de, t);
      const ke = Fin.capm(rf, blv, mrp), kd = rf + g.s, wacc = Fin.wacc(1 - g.dv, ke, g.dv, kd, t);
      return { key, bu, rf, mrp, dv: g.dv, s: g.s, de, bl: blv, ke, kd, kdAT: kd * (1 - t), wacc };
    };
    const out = { t, de0, buF, w, L, R, buCS, mrp: mrpObj };
    out.firm = div('firm', buF); out.lod = div('lod', L.bu); out.rest = div('rest', R.bu); out.cs = div('cs', buCS);
    return out;
  };

  // Generic step-by-step explanation of a run, used by the case-extension problems
  M.steps = function (o, r, focus) {
    const P = x => ICF.F.pct(x, 2), N = x => ICF.F.n(x, 4);
    const st = [];
    st.push({ t: 'Unlever Marriott\'s regression beta at its current market D/E', html: `D/E = ${ICF.F.n(M.D, 1)} / ${ICF.F.n(M.E, 0)} = ${N(r.de0)}; t = ${P(r.t)}<div class="formula">β<sub>U</sub> = 0.97 ÷ [1 + ${N(r.de0)} × (1 − ${ICF.F.n(r.t, 4)})] = <b>${N(r.buF)}</b></div>` });
    st.push({ t: 'Unlever the comparables', html: `Lodging: avg β<sub>L</sub> = ${N(r.L.avgB)}, avg D/V = ${N(r.L.avgDv)} → β<sub>U</sub> = <b>${N(r.L.bu)}</b><br>Restaurants: avg β<sub>L</sub> = ${N(r.R.avgB)}, avg D/V = ${N(r.R.avgDv)} → β<sub>U</sub> = <b>${N(r.R.bu)}</b>` });
    st.push({ t: 'Back out Contract Services', html: `Weights (${o.w === 'assets' ? 'identifiable assets' : o.w === 'op' ? 'operating profit' : 'sales'}, 1987): Lodging ${P(r.w.lod)}, CS ${P(r.w.cs)}, Restaurants ${P(r.w.rest)}<div class="formula">β<sub>U,CS</sub> = [${N(r.buF)} − ${N(r.w.lod)} × ${N(r.L.bu)} − ${N(r.w.rest)} × ${N(r.R.bu)}] ÷ ${N(r.w.cs)} = <b>${N(r.buCS)}</b></div>` });
    for (const k of (focus || ['firm', 'lod', 'rest', 'cs'])) {
      const d = r[k];
      st.push({ t: `${M.names[k]}: relever, CAPM, WACC`, html: `Target D/V = ${P(d.dv)} → D/E = ${N(d.de)}; β<sub>L</sub> = ${N(d.bu)} × [1 + ${N(d.de)} × ${ICF.F.n(1 - r.t, 4)}] = ${N(d.bl)}<br>K<sub>e</sub> = ${P(d.rf)} + ${N(d.bl)} × ${P(d.mrp)} = ${P(d.ke)}; K<sub>d</sub> = ${P(d.rf)} + ${P(d.s)} = ${P(d.kd)}<div class="formula">WACC = ${ICF.F.n(1 - d.dv, 2)} × ${P(d.ke)} + ${ICF.F.n(d.dv, 2)} × ${P(d.kd)} × (1 − ${ICF.F.n(r.t, 4)}) = <b>${P(d.wacc)}</b></div>` });
    }
    return st;
  };

  window.MARRIOTT = M;
})();
