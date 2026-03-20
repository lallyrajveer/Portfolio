/* ─── Shared Netflix data, constants, and forecast engine ───────────────────
   Imported by NetflixRevenueForecast.jsx and NetflixBoardReport.jsx
   Revenue model: avgSubs (M) × ARM ($/mo) × 3 months / 1000 = $B
   Churn delta vs base adjusts effective quarterly net adds.
   ─────────────────────────────────────────────────────────────────────────── */

// Monthly churn %: analyst estimates (Antenna/YipitData). None of these
// companies officially report churn; figures are third-party estimates.
export const HISTORICAL = [
  { period: "Q1'23", rev: 8.16,  subs: 232.5, arm: 11.73, netAdds: 1.75,  churn: 2.40 },
  { period: "Q2'23", rev: 8.19,  subs: 238.4, arm: 11.60, netAdds: 5.90,  churn: 2.30 },
  { period: "Q3'23", rev: 8.54,  subs: 247.2, arm: 11.72, netAdds: 8.76,  churn: 2.20 },
  { period: "Q4'23", rev: 8.83,  subs: 260.3, arm: 11.60, netAdds: 13.12, churn: 1.90 },
  { period: "Q1'24", rev: 9.37,  subs: 269.6, arm: 11.79, netAdds: 9.33,  churn: 2.10 },
  { period: "Q2'24", rev: 9.56,  subs: 277.7, arm: 11.64, netAdds: 8.05,  churn: 2.00 },
  { period: "Q3'24", rev: 9.83,  subs: 282.7, arm: 11.68, netAdds: 5.07,  churn: 2.30 },
  { period: "Q4'24", rev: 10.25, subs: 301.6, arm: 11.69, netAdds: 19.00, churn: 1.80 },
  { period: "Q1'25", rev: 10.54, subs: 310.0, arm: 11.49, netAdds: 8.40,  churn: 2.00 },
  { period: "Q2'25", rev: 11.08, subs: 320.0, arm: 11.72, netAdds: 10.00, churn: 2.10 },
  { period: "Q3'25", rev: 11.51, subs: 325.0, arm: 11.90, netAdds: 5.00,  churn: 2.00 },
  { period: "Q4'25", rev: 12.05, subs: 332.0, arm: 12.23, netAdds: 7.00,  churn: 1.90 },
];

// Starting point: Q4 2025 actuals
export const START = { subs: 332.0, arm: 12.23, rev: 12.05 };

// Base monthly churn: used as reference point for churn delta calculations
export const BASE_CHURN = 2.3;

// ARM growth rationale:
//   UCAN price hikes averaged ~7% in 2024; global ARM diluted by faster international growth at
//   lower price points. Ad-tier CPM monetization adds ~1–2pp annually as inventory scales.
//   ARM growth ramps over the forecast as ad-tier inventory matures and pricing cycles compound.
//   Bear 0.5→1.5% (avg 1%): early-period price fatigue before modest recovery.
//   Consensus 3.0→5.0% (avg 4%): Wall Street consensus, ad-tier CPM scales, UCAN hike cycle resumes late 2026.
//   Bull 3.5→6.5% (avg 5%): strong pricing + rapid CPM maturation by FY2027.
//
// Churn rationale:
//   Churn ramps linearly across 8 quarters; direction reflects the competitive/content backdrop.
//   Bear 2.6→3.0% (avg 2.8%): escalating competition + price hike fatigue erodes retention.
//   Consensus 2.2→1.9% (avg 2.05%): modest improvement from sports habit loops, ad-tier price floor, deeper slate.
//   Bull 2.1→1.5% (avg 1.8%): strong must-watch slate drives materially better retention by FY2027.
export const SCENARIOS = {
  bear:      { netAddsStart: 2.0, netAddsEnd:  4.0, armGrowthStart: 0.5, armGrowthEnd: 1.5, churnStart: 2.6, churnEnd: 3.0 },
  consensus: { netAddsStart: 7.0, netAddsEnd:  9.0, armGrowthStart: 3.0, armGrowthEnd: 5.0, churnStart: 2.2, churnEnd: 1.9 },
  bull:      { netAddsStart: 8.0, netAddsEnd: 14.0, armGrowthStart: 3.5, armGrowthEnd: 6.5, churnStart: 2.1, churnEnd: 1.5 },
};

export const QUARTERS = [
  "Q1'26", "Q2'26", "Q3'26", "Q4'26",
  "Q1'27", "Q2'27", "Q3'27", "Q4'27",
];

/**
 * Build a quarterly forecast from given drivers.
 *
 * netAddsPerQ is the TARGET NET adds per quarter, i.e., the number that appears in the
 * subscriber count change. Churn rate determines how many gross subscribers must be acquired
 * to achieve that net number; it is a cost driver (CAC), not a revenue driver.
 *
 * Mechanics per quarter:
 *   churnLosses = churnPct/100 × beginSubs × 3   (members lost over 3 months)
 *   grossAdds   = netAddsPerQ + churnLosses        (subscribers that must join)
 *   endSubs     = beginSubs + netAddsPerQ           (actual ending count)
 *   revenue     = avgSubs × ARM × 3 / 1000         ($B)
 *
 * @param {number}   startSubs       - starting paid memberships (M)
 * @param {number}   startARM        - starting ARM ($/mo)
 * @param {number}   netAddsPerQ     - target net membership adds per quarter (M)
 * @param {number}   armGrowthAnnual - annual ARM growth rate (%)
 * @param {number}   churnPct        - starting monthly churn rate (%)
 * @param {string[]} quarters        - quarter labels
 * @param {number}   netAddsEnd      - ending net adds (or gross adds) per quarter (ramps linearly)
 * @param {number}   armGrowthEnd    - ending annual ARM growth rate (ramps linearly)
 * @param {number}   churnEnd        - ending monthly churn rate (ramps linearly from churnPct)
 * @param {boolean}  useGrossAdds    - if true, netAddsStart/End are gross adds; churn reduces them
 *                                     to net adds which then drive subscriber count and revenue.
 *                                     if false (default), netAddsStart/End are fixed net add targets;
 *                                     churn only affects gross adds (CAC), not revenue.
 */
export function buildForecast(startSubs, startARM, netAddsStart, armGrowthAnnual, churnPct, quarters, netAddsEnd = netAddsStart, armGrowthEnd = armGrowthAnnual, churnEnd = churnPct, useGrossAdds = false) {
  const results = [];
  let subs = startSubs;
  let arm  = startARM;
  const n = quarters.length;

  for (let qi = 0; qi < n; qi++) {
    const q           = quarters[qi];
    const addsInput   = n > 1 ? netAddsStart + (netAddsEnd - netAddsStart) * qi / (n - 1) : netAddsStart;
    const armGrowthQ  = n > 1 ? armGrowthAnnual + (armGrowthEnd - armGrowthAnnual) * qi / (n - 1) : armGrowthAnnual;
    const churnQ      = n > 1 ? churnPct + (churnEnd - churnPct) * qi / (n - 1) : churnPct;
    const beginSubs   = subs;
    // Churn losses: members lost over the quarter (churn% per month × 3 months)
    const churnLosses = +(churnQ / 100 * beginSubs * 3).toFixed(1);

    // Fixed gross adds: churn eats into gross adds → net adds float → revenue responds to churn
    // Fixed net adds:   churn only affects gross adds needed (CAC) → revenue is churn-independent
    const grossAdds   = useGrossAdds ? addsInput                              : +(addsInput + churnLosses).toFixed(1);
    const netAdds     = useGrossAdds ? +(addsInput - churnLosses).toFixed(1)  : addsInput;

    const endSubs   = +(beginSubs + netAdds).toFixed(1);
    const avgSubs   = (beginSubs + endSubs) / 2;
    // ARM: quarterly compounding of interpolated annual growth rate
    arm = arm * (1 + armGrowthQ / 400);
    const revenue = +(avgSubs * arm * 3 / 1000).toFixed(2);
    results.push({
      period: q, beginSubs, endSubs: +endSubs.toFixed(1),
      subs: endSubs, arm: +arm.toFixed(2), revenue,
      grossAdds: +grossAdds.toFixed(1), churnLosses, netAdds: +netAdds.toFixed(1),
      churn: +churnQ.toFixed(2),
    });
    subs = endSubs;
  }
  return results;
}

export function getForecast(scenarioKey) {
  const sc = SCENARIOS[scenarioKey];
  return buildForecast(START.subs, START.arm, sc.netAddsStart, sc.armGrowthStart, sc.churnStart, QUARTERS, sc.netAddsEnd, sc.armGrowthEnd, sc.churnEnd);
}

export function getFY(forecast, year) {
  const prefix = year === 2026 ? "'26" : "'27";
  return forecast.filter(d => d.period.endsWith(prefix)).reduce((s, d) => s + d.revenue, 0);
}

/** Compute board-report metrics from any set of drivers. */
export function getScenarioMetrics(drivers, useGrossAdds = false) {
  const netAddsStart   = drivers.netAddsStart   ?? drivers.netAdds;
  const netAddsEnd     = drivers.netAddsEnd     ?? drivers.netAdds;
  const armGrowthStart = drivers.armGrowthStart ?? drivers.armGrowth;
  const armGrowthEnd   = drivers.armGrowthEnd   ?? drivers.armGrowth;
  const churnStart     = drivers.churnStart     ?? drivers.churn ?? BASE_CHURN;
  const churnEnd       = drivers.churnEnd       ?? drivers.churn ?? BASE_CHURN;
  const forecast = buildForecast(
    START.subs, START.arm,
    netAddsStart, armGrowthStart, churnStart, QUARTERS, netAddsEnd, armGrowthEnd, churnEnd, useGrossAdds
  );
  const fy26q = forecast.slice(0, 4);
  const fy27q = forecast.slice(4, 8);
  const avgARM   = (qs) => +(qs.reduce((s, q) => s + q.arm,   0) / qs.length).toFixed(2);
  const avgChurn = (qs) => +(qs.reduce((s, q) => s + q.churn, 0) / qs.length).toFixed(2);
  const sumRev   = (qs) => +(qs.reduce((s, q) => s + q.revenue, 0)).toFixed(1);

  return {
    netAdds26: +fy26q.reduce((s, q) => s + q.netAdds, 0).toFixed(0),
    netAdds27: +fy27q.reduce((s, q) => s + q.netAdds, 0).toFixed(0),
    arm26:     avgARM(fy26q),
    arm27:     avgARM(fy27q),
    churn26:   avgChurn(fy26q),
    churn27:   avgChurn(fy27q),
    subs26:    forecast[3].subs,
    subs27:    forecast[7].subs,
    rev26:     sumRev(fy26q),
    rev27:     sumRev(fy27q),
  };
}
