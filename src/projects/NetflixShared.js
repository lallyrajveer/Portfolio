/* ─── Shared Netflix data, constants, and forecast engine ───────────────────
   Imported by NetflixRevenueForecast.jsx and NetflixBoardReport.jsx
   Revenue model: avgSubs (M) × ARM ($/mo) × 3 months / 1000 = $B
   Churn delta vs base adjusts effective quarterly net adds.

   Data source: data/netflix-data.xlsx — edit that file and run:
     npm run update-data
   to regenerate src/projects/NetflixData.js
   ─────────────────────────────────────────────────────────────────────────── */

// Monthly churn %: analyst estimates (Antenna/YipitData). None of these
// companies officially report churn; figures are third-party estimates.
import { HISTORICAL, START } from "./NetflixData.js";
export { HISTORICAL, START };

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
// All scenarios share Q4'25 actual start values (net adds 7.0M, ARM growth 4.5%/yr, churn 1.90%/mo)
// and diverge toward their respective Q4'27 end assumptions.
export const SCENARIOS = {
  bear:      { netAddsStart: 7.0, netAddsEnd:  4.0, armGrowthStart: 4.5, armGrowthEnd: 1.5, churnStart: 1.9, churnEnd: 3.0 },
  consensus: { netAddsStart: 7.0, netAddsEnd:  9.0, armGrowthStart: 4.5, armGrowthEnd: 5.0, churnStart: 1.9, churnEnd: 1.9 },
  bull:      { netAddsStart: 7.0, netAddsEnd: 14.0, armGrowthStart: 4.5, armGrowthEnd: 6.5, churnStart: 1.9, churnEnd: 1.5 },
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
// Seasonal factors derived from FY2025 actuals (cleanest year, no password-sharing distortion).
// Q1=1.10, Q2=1.30, Q3=0.65, Q4=0.95 — sum to 4.00 so annual totals are preserved.
// Applied as a multiplier on the quarterly net/gross adds ramp value.
export const SEASONAL_FACTORS = [1.10, 1.30, 0.65, 0.95]; // [Q1, Q2, Q3, Q4]

export function buildForecast(startSubs, startARM, netAddsStart, armGrowthAnnual, churnPct, quarters, netAddsEnd = netAddsStart, armGrowthEnd = armGrowthAnnual, churnEnd = churnPct, useGrossAdds = false, seasonalFactors = null) {
  const results = [];
  let subs = startSubs;
  let arm  = startARM;
  const n = quarters.length;

  for (let qi = 0; qi < n; qi++) {
    const q           = quarters[qi];
    const seasonal    = seasonalFactors ? seasonalFactors[qi % 4] : 1;
    const addsInput   = seasonal * (n > 1 ? netAddsStart + (netAddsEnd - netAddsStart) * qi / (n - 1) : netAddsStart);
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

export function getForecast(scenarioKey, seasonalFactors = null) {
  const sc = SCENARIOS[scenarioKey];
  return buildForecast(START.subs, START.arm, sc.netAddsStart, sc.armGrowthStart, sc.churnStart, QUARTERS, sc.netAddsEnd, sc.armGrowthEnd, sc.churnEnd, false, seasonalFactors);
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
