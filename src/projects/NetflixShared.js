/* ─── Shared Netflix data, constants, and forecast engine ───────────────────
   Imported by NetflixRevenueForecast.jsx and NetflixBoardReport.jsx
   Revenue model: avgSubs (M) × ARM ($/mo) × 3 months / 1000 = $B
   Churn delta vs base adjusts effective quarterly net adds.
   ─────────────────────────────────────────────────────────────────────────── */

// Monthly churn % — analyst estimates (Antenna/YipitData). None of these
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

// Base monthly churn — used as reference point for churn delta calculations
export const BASE_CHURN = 2.3;

export const SCENARIOS = {
  bear: { netAdds: 3.0,  armGrowth: 0.5, churn: 2.8 },
  base: { netAdds: 6.0,  armGrowth: 1.5, churn: 2.3 },
  bull: { netAdds: 11.0, armGrowth: 2.5, churn: 1.8 },
};

export const QUARTERS = [
  "Q1'26", "Q2'26", "Q3'26", "Q4'26",
  "Q1'27", "Q2'27", "Q3'27", "Q4'27",
];

/**
 * Build a quarterly forecast from given drivers.
 * @param {number} startSubs       - starting paid memberships (M)
 * @param {number} startARM        - starting ARM ($/mo)
 * @param {number} netAddsPerQ     - gross-net membership adds per quarter (M) at base churn
 * @param {number} armGrowthAnnual - annual ARM growth rate (%)
 * @param {number} churnPct        - monthly churn rate (%)
 * @param {string[]} quarters      - quarter labels
 */
export function buildForecast(startSubs, startARM, netAddsPerQ, armGrowthAnnual, churnPct, quarters) {
  const results = [];
  let subs = startSubs;
  let arm  = startARM;

  for (const q of quarters) {
    const beginSubs = subs;
    // Higher churn than base erodes net adds; lower churn boosts them
    const churnAdj = ((churnPct - BASE_CHURN) / 100) * beginSubs * 3;
    const effectiveNetAdds = netAddsPerQ - churnAdj;
    const endSubs  = +(beginSubs + effectiveNetAdds).toFixed(1);
    const avgSubs  = (beginSubs + endSubs) / 2;
    arm = arm * (1 + armGrowthAnnual / 400); // quarterly compounding
    const revenue = +(avgSubs * arm * 3 / 1000).toFixed(2);
    results.push({ period: q, subs: endSubs, arm: +arm.toFixed(2), revenue });
    subs = endSubs;
  }
  return results;
}

export function getForecast(scenarioKey) {
  const sc = SCENARIOS[scenarioKey];
  return buildForecast(START.subs, START.arm, sc.netAdds, sc.armGrowth, sc.churn, QUARTERS);
}

export function getFY(forecast, year) {
  const prefix = year === 2026 ? "'26" : "'27";
  return forecast.filter(d => d.period.endsWith(prefix)).reduce((s, d) => s + d.revenue, 0);
}

/** Compute board-report metrics from any set of drivers. */
export function getScenarioMetrics(drivers) {
  const forecast = buildForecast(
    START.subs, START.arm,
    drivers.netAdds, drivers.armGrowth, drivers.churn ?? BASE_CHURN, QUARTERS
  );
  const fy26q = forecast.slice(0, 4);
  const fy27q = forecast.slice(4, 8);
  const avgARM = (qs) => +(qs.reduce((s, q) => s + q.arm, 0) / qs.length).toFixed(2);
  const sumRev = (qs) => +(qs.reduce((s, q) => s + q.revenue, 0)).toFixed(1);

  return {
    netAdds26: +(drivers.netAdds * 4).toFixed(0),
    netAdds27: +(drivers.netAdds * 4).toFixed(0),
    arm26:     avgARM(fy26q),
    arm27:     avgARM(fy27q),
    churn26:   drivers.churn ?? BASE_CHURN,
    churn27:   drivers.churn ?? BASE_CHURN,
    subs26:    forecast[3].subs,
    subs27:    forecast[7].subs,
    rev26:     sumRev(fy26q),
    rev27:     sumRev(fy27q),
  };
}
