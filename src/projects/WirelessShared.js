/* ─── Shared wireless data, constants, and forecast engine ───────────────────
   Imported by WirelessRevenueForecast.jsx and VerizonBoardReport.jsx
   so both projects always compute from the same numbers.
   ─────────────────────────────────────────────────────────────────────────── */

export const HISTORICAL = [
  { period: "Q1'23", rev: 15.29 },
  { period: "Q2'23", rev: 15.36 },
  { period: "Q3'23", rev: 15.38 },
  { period: "Q4'23", rev: 15.44 },
  { period: "Q1'24", rev: 15.47 },
  { period: "Q2'24", rev: 15.52 },
  { period: "Q3'24", rev: 15.51 },
  { period: "Q4'24", rev: 15.59 },
  { period: "Q1'25", rev: 15.60 },
  { period: "Q2'25", rev: 15.63 },
  { period: "Q3'25", rev: 15.68 },
  { period: "Q4'25", rev: 15.68 },
];

export const START = { subs: 91.1, arpu: 57.56, rev: 15.68 };

export const SCENARIOS = {
  bear: { netAdds: -60,  arpuGrowth: 0.15, churn: 1.00 },
  base: { netAdds: 100,  arpuGrowth: 0.35, churn: 0.92 },
  bull: { netAdds: 250,  arpuGrowth: 0.55, churn: 0.85 },
};

export const QUARTERS = [
  "Q1'26", "Q2'26", "Q3'26", "Q4'26",
  "Q1'27", "Q2'27", "Q3'27", "Q4'27",
];

export function buildForecast(
  startSubs, startARPU, netAddsPerQ, arpuGrowthPct, churnPct, baseChurnPct, quarters
) {
  const results = [];
  let subs = startSubs;
  let arpu = startARPU;
  const churnAdjK = ((churnPct - baseChurnPct) / 100) * subs * 1000 * 3;
  const effectiveNetAdds = netAddsPerQ - churnAdjK;

  for (const q of quarters) {
    const beginSubs = subs;
    const endSubs = beginSubs + effectiveNetAdds / 1000;
    const avgSubs = (beginSubs + endSubs) / 2;
    arpu = arpu * (1 + arpuGrowthPct / 100);
    const revenue = +(avgSubs * arpu * 3 / 1000).toFixed(2);
    results.push({ period: q, subs: +endSubs.toFixed(2), arpu: +arpu.toFixed(2), revenue });
    subs = endSubs;
  }
  return results;
}

export function getForecast(scenarioKey) {
  const sc = SCENARIOS[scenarioKey];
  return buildForecast(
    START.subs, START.arpu,
    sc.netAdds, sc.arpuGrowth, sc.churn, SCENARIOS.base.churn, QUARTERS
  );
}

export function getFY(forecast, year) {
  const prefix = year === 2026 ? "'26" : "'27";
  return forecast.filter(d => d.period.endsWith(prefix)).reduce((s, d) => s + d.revenue, 0);
}

/** Compute board-report metrics from any set of drivers (bear/base/bull or custom). */
export function getScenarioMetrics(drivers) {
  const forecast = buildForecast(
    START.subs, START.arpu,
    drivers.netAdds, drivers.arpuGrowth, drivers.churn, SCENARIOS.base.churn, QUARTERS
  );

  const fy26q = forecast.slice(0, 4);
  const fy27q = forecast.slice(4, 8);

  const avgARPU = (qs) => +(qs.reduce((s, q) => s + q.arpu, 0) / qs.length).toFixed(2);
  const sumRev  = (qs) => +(qs.reduce((s, q) => s + q.revenue, 0)).toFixed(2);

  return {
    netAdds26: drivers.netAdds * 4,
    netAdds27: drivers.netAdds * 4,
    arpu26: avgARPU(fy26q),
    arpu27: avgARPU(fy27q),
    churn26: drivers.churn,
    churn27: drivers.churn,
    rev26: sumRev(fy26q),
    rev27: sumRev(fy27q),
  };
}
