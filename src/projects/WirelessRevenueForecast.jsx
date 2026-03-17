import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

/* ─── Brand Colors ─────────────────────────────────────────────────────────── */
const C = {
  VZ:    "#CD040B",
  navy:  "#0B1628",
  bg:    "#F8F9FF",
  grid:  "#E8EAF0",
  tick:  "#6B7490",
  muted: "#9BA3B8",
};

/* ─── Historical Data (VZ postpaid phone revenue $B, Q1'23–Q4'25) ─────────── */
const HISTORICAL = [
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

/* ─── Starting Point (Q4 2025 Actuals) ─────────────────────────────────────── */
const START = { subs: 91.1, arpu: 57.56, rev: 15.68 };

/* ─── Scenario Assumptions ──────────────────────────────────────────────────── */
const SCENARIOS = {
  bear: { netAdds: -60,  arpuGrowth: 0.15, churn: 1.00 },
  base: { netAdds: 100,  arpuGrowth: 0.35, churn: 0.92 },
  bull: { netAdds: 250,  arpuGrowth: 0.55, churn: 0.85 },
};

const QUARTERS = ["Q1'26","Q2'26","Q3'26","Q4'26","Q1'27","Q2'27","Q3'27","Q4'27"];

/* ─── Forecast Engine ───────────────────────────────────────────────────────── */
function buildForecast(startSubs, startARPU, netAddsPerQ, arpuGrowthPct, churnPct, baseChurnPct, quarters) {
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

function getForecast(scenarioKey) {
  const sc = SCENARIOS[scenarioKey];
  const base = SCENARIOS.base;
  return buildForecast(
    START.subs,
    START.arpu,
    sc.netAdds,
    sc.arpuGrowth,
    sc.churn,
    base.churn,
    QUARTERS
  );
}

function getFY(forecast, year) {
  const prefix = year === 2026 ? "'26" : "'27";
  return forecast.filter(d => d.period.endsWith(prefix)).reduce((s, d) => s + d.revenue, 0);
}

/* ─── Shared chart axis defaults ───────────────────────────────────────────── */
const axisStyle = { fontSize: 11, fill: C.tick };
const gridProps = { stroke: C.grid, strokeDasharray: "3 3" };

/* ─── Tooltip formatter ─────────────────────────────────────────────────────── */
const fmtRev = v => (v != null ? `$${v.toFixed(2)}B` : "—");

/* ════════════════════════════════════════════════════════════════════════════
   TAB 1 — SCENARIO FORECAST
   ════════════════════════════════════════════════════════════════════════════ */
function ScenarioTab() {
  const bear = getForecast("bear");
  const base = getForecast("base");
  const bull = getForecast("bull");

  // Build merged data: historical actuals + forecast
  const histData = HISTORICAL.map(h => ({
    period:  h.period,
    actual:  h.rev,
    bear_v:  null,
    base_v:  null,
    bull_v:  null,
    band_lo: null,
    band_hi: null,
  }));

  const foreData = QUARTERS.map((q, i) => ({
    period:  q,
    actual:  null,
    bear_v:  bear[i].revenue,
    base_v:  base[i].revenue,
    bull_v:  bull[i].revenue,
    band_lo: bear[i].revenue,
    band_hi: bull[i].revenue,
  }));

  // Bridge: patch last historical row so forecast lines connect cleanly
  const lastActual = HISTORICAL[HISTORICAL.length - 1].rev;
  const lastHistPatched = {
    ...histData[histData.length - 1],
    bear_v:  lastActual,
    base_v:  lastActual,
    bull_v:  lastActual,
    band_lo: lastActual,
    band_hi: lastActual,
  };

  const chartData = [
    ...histData.slice(0, -1),
    lastHistPatched,
    ...foreData,
  ];

  const fy26bear = +getFY(bear, 2026).toFixed(2);
  const fy26base = +getFY(base, 2026).toFixed(2);
  const fy26bull = +getFY(bull, 2026).toFixed(2);
  const fy27bear = +getFY(bear, 2027).toFixed(2);
  const fy27base = +getFY(base, 2027).toFixed(2);
  const fy27bull = +getFY(bull, 2027).toFixed(2);

  return (
    <div>
      {/* Chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(11,22,40,0.07)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 20px" }}>
          Verizon — Bear / Base / Bull Scenarios ($B)
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={axisStyle} />
            <YAxis domain={["auto", "auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={56} />
            <Tooltip formatter={(v, name) => [fmtRev(v), name]} />
            <ReferenceLine
              x="Q4'25"
              stroke={C.muted}
              strokeDasharray="5 3"
              label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: C.muted }}
            />

            {/* Area band between bull and bear */}
            <Area dataKey="band_hi" fill={C.VZ} stroke="none" fillOpacity={0.10} legendType="none" connectNulls />
            <Area dataKey="band_lo" fill={C.bg} stroke="none" fillOpacity={1} legendType="none" connectNulls />

            {/* Historical actuals */}
            <Line
              dataKey="actual"
              name="Historical"
              stroke={C.VZ}
              strokeWidth={1.5}
              strokeDasharray="3 2"
              dot={false}
              connectNulls
            />
            {/* Bull */}
            <Line
              dataKey="bull_v"
              name="Bull"
              stroke={C.VZ}
              strokeWidth={1.8}
              strokeDasharray="5 3"
              dot={false}
              connectNulls
              opacity={0.7}
            />
            {/* Base */}
            <Line
              dataKey="base_v"
              name="Base"
              stroke={C.VZ}
              strokeWidth={2.5}
              dot={false}
              connectNulls
            />
            {/* Bear */}
            <Line
              dataKey="bear_v"
              name="Bear"
              stroke={C.VZ}
              strokeWidth={1.8}
              strokeDasharray="5 3"
              dot={false}
              connectNulls
              opacity={0.55}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Assumptions Table */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(11,22,40,0.07)" }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 14px" }}>
          Scenario Assumptions
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Driver", "Bear", "Base", "Bull"].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 14px",
                      textAlign: i === 0 ? "left" : "center",
                      background: i === 0 ? "#F4F5F8" : "#CD040B",
                      color: i === 0 ? C.navy : "#fff",
                      fontWeight: 600,
                      borderBottom: "2px solid #CD040B",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Quarterly Net Adds (K)",    SCENARIOS.bear.netAdds,    SCENARIOS.base.netAdds,    SCENARIOS.bull.netAdds,    v => (v > 0 ? "+" : "") + v + "K"],
                ["Monthly ARPU Growth (%)",   SCENARIOS.bear.arpuGrowth, SCENARIOS.base.arpuGrowth, SCENARIOS.bull.arpuGrowth, v => v.toFixed(2) + "%"],
                ["Monthly Churn (%)",         SCENARIOS.bear.churn,      SCENARIOS.base.churn,      SCENARIOS.bull.churn,      v => v.toFixed(2) + "%"],
                ["Implied FY2026E Revenue ($B)", fy26bear, fy26base, fy26bull, v => `$${v.toFixed(2)}B`],
                ["Implied FY2027E Revenue ($B)", fy27bear, fy27base, fy27bull, v => `$${v.toFixed(2)}B`],
              ].map(([label, bear_v, base_v, bull_v, fmt], ri) => (
                <tr key={label} style={{ background: ri % 2 === 0 ? "#F4F5F8" : "#fff" }}>
                  <td style={{ padding: "9px 14px", color: C.navy, fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: C.tick }}>{fmt(bear_v)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: C.navy, fontWeight: 600 }}>{fmt(base_v)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: C.tick }}>{fmt(bull_v)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TAB 2 — SENSITIVITY ANALYSIS
   ════════════════════════════════════════════════════════════════════════════ */
function SensitivityTab() {
  const sc = SCENARIOS.base;

  function computeRevForDrivers(netAdds, arpuGrowth, churn) {
    const forecast = buildForecast(
      START.subs,
      START.arpu,
      netAdds,
      arpuGrowth,
      churn,
      sc.churn,
      QUARTERS
    );
    const fy25 = +getFY(forecast, 2026).toFixed(3);
    const fy26 = +getFY(forecast, 2027).toFixed(3);
    return { fy25, fy26 };
  }

  const baseResult = computeRevForDrivers(sc.netAdds, sc.arpuGrowth, sc.churn);

  const drivers = [
    {
      label: "Net Adds",
      key: "netAdds",
      getFn: (pct) => computeRevForDrivers(
        sc.netAdds * (1 + pct / 100),
        sc.arpuGrowth,
        sc.churn
      ),
    },
    {
      label: "ARPU Growth",
      key: "arpuGrowth",
      getFn: (pct) => computeRevForDrivers(
        sc.netAdds,
        sc.arpuGrowth * (1 + pct / 100),
        sc.churn
      ),
    },
    {
      label: "Churn Rate",
      key: "churn",
      getFn: (pct) => computeRevForDrivers(
        sc.netAdds,
        sc.arpuGrowth,
        sc.churn * (1 + pct / 100)
      ),
    },
  ];

  const tornadoBars = [];
  drivers.forEach(d => {
    [-10, -5, 5, 10].forEach(pct => {
      const res = d.getFn(pct);
      const delta = +(res.fy25 - baseResult.fy25).toFixed(3);
      tornadoBars.push({
        label: `${d.label} ${pct > 0 ? "+" : ""}${pct}%`,
        delta,
        color: delta >= 0 ? "#22c55e" : "#ef4444",
        driver: d.label,
        pct,
        fy25: res.fy25,
        fy26: res.fy26,
      });
    });
  });
  tornadoBars.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const tableRows = [
    { pct: -10, label: "-10%" },
    { pct:  -5, label: "-5%"  },
    { pct:   0, label: "Base" },
    { pct:   5, label: "+5%"  },
    { pct:  10, label: "+10%" },
  ];

  return (
    <div>
      {/* Tornado Chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(11,22,40,0.07)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 6px" }}>
          Verizon — FY2026E Revenue Sensitivity
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          Impact of ±5% / ±10% driver changes on FY2026E annual revenue vs. Base ($B)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            layout="vertical"
            data={tornadoBars}
            margin={{ top: 4, right: 60, bottom: 4, left: 120 }}
          >
            <CartesianGrid {...gridProps} horizontal={false} />
            <XAxis
              type="number"
              tick={axisStyle}
              tickFormatter={v => (v >= 0 ? "+" : "") + v.toFixed(2) + "B"}
              domain={["auto", "auto"]}
            />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: C.tick }} width={118} />
            <Tooltip
              formatter={(v) => [`${v >= 0 ? "+" : ""}$${v.toFixed(3)}B`, "Delta vs Base"]}
              labelStyle={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }}
            />
            <ReferenceLine x={0} stroke={C.navy} strokeWidth={1.5} />
            <Bar dataKey="delta" name="Impact vs Base" radius={[0, 3, 3, 0]}>
              {tornadoBars.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sensitivity Table — one per driver */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(11,22,40,0.07)" }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 16px" }}>
          Driver Sensitivity Table
        </h4>
        {drivers.map(d => (
          <div key={d.key} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.VZ, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
              {d.label} Sensitivity
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
                <thead>
                  <tr>
                    {["Variation", "Driver Value", "FY2026E Rev ($B)", "FY2027E Rev ($B)", "vs Base ($B)", "vs Base (%)"].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          padding: "8px 12px",
                          textAlign: i === 0 ? "left" : "center",
                          background: "#F8F9FF",
                          color: C.navy,
                          fontWeight: 600,
                          borderBottom: `2px solid ${C.VZ}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(({ pct, label }) => {
                    const isBase = pct === 0;
                    const res = isBase ? baseResult : d.getFn(pct);
                    const driverVal = isBase
                      ? sc[d.key]
                      : sc[d.key] * (1 + pct / 100);
                    const deltaB   = +(res.fy25 - baseResult.fy25).toFixed(3);
                    const deltaPct = +((deltaB / baseResult.fy25) * 100).toFixed(2);
                    const rowBg = isBase ? "#FFFBEB" : deltaB > 0 ? "#F0FDF4" : deltaB < 0 ? "#FEF2F2" : "#fff";
                    return (
                      <tr key={pct} style={{ background: rowBg }}>
                        <td style={{ padding: "8px 12px", fontWeight: isBase ? 700 : 400, color: C.navy }}>{label}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>
                          {driverVal.toFixed(d.key === "netAdds" ? 0 : 2)}{d.key === "netAdds" ? "K" : "%"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: isBase ? 700 : 400, color: C.navy }}>
                          ${res.fy25.toFixed(2)}B
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>
                          ${res.fy26.toFixed(2)}B
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: isBase ? C.tick : deltaB > 0 ? "#16a34a" : "#dc2626", fontWeight: isBase ? 400 : 600 }}>
                          {isBase ? "—" : `${deltaB >= 0 ? "+" : ""}$${deltaB.toFixed(3)}B`}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: isBase ? C.tick : deltaPct > 0 ? "#16a34a" : "#dc2626", fontWeight: isBase ? 400 : 600 }}>
                          {isBase ? "—" : `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   TAB 3 — CUSTOM SCENARIO
   ════════════════════════════════════════════════════════════════════════════ */
const SLIDER_CONFIG = {
  netAdds:    { min: -200,  max: 400,  step: 25,   unit: "K/qtr", label: "Net Adds" },
  arpuGrowth: { min: -0.20, max: 1.20, step: 0.05, unit: "%/qtr", label: "ARPU Growth" },
  churn:      { min: 0.70,  max: 1.20, step: 0.01, unit: "%/mo",  label: "Churn" },
};

const BASE_CUSTOM = { netAdds: 100, arpuGrowth: 0.35, churn: 0.92 };

function CustomTab() {
  const [drivers, setDrivers] = useState({ ...BASE_CUSTOM });

  const setDriver = (key, value) => {
    setDrivers(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setDrivers({ ...BASE_CUSTOM });
  };

  // Build custom and base forecasts
  const customForecast = buildForecast(
    START.subs,
    START.arpu,
    drivers.netAdds,
    drivers.arpuGrowth,
    drivers.churn,
    SCENARIOS.base.churn,
    QUARTERS
  );
  const baseForecast = getForecast("base");

  const chartData = QUARTERS.map((q, i) => ({
    period:  q,
    custom:  customForecast[i].revenue,
    base:    baseForecast[i].revenue,
  }));

  const cFy26 = +getFY(customForecast, 2026).toFixed(2);
  const bFy26 = +getFY(baseForecast,   2026).toFixed(2);
  const cFy27 = +getFY(customForecast, 2027).toFixed(2);
  const bFy27 = +getFY(baseForecast,   2027).toFixed(2);
  const d26   = +(cFy26 - bFy26).toFixed(2);
  const d27   = +(cFy27 - bFy27).toFixed(2);

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* Left Panel — Sliders */}
      <div style={{ flex: "0 0 300px", minWidth: 260 }}>
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(11,22,40,0.07)", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: C.VZ, padding: "12px 16px" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>
              Verizon
            </span>
          </div>

          <div style={{ padding: "18px 16px" }}>
            {Object.entries(SLIDER_CONFIG).map(([key, cfg]) => {
              const val = drivers[key];
              const displayVal = key === "netAdds"
                ? `${val > 0 ? "+" : ""}${val}K`
                : `${val.toFixed(2)}%`;
              return (
                <div key={key} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.tick, fontFamily: "'Outfit', sans-serif" }}>
                      {cfg.label} <span style={{ color: C.muted, fontSize: 10 }}>({cfg.unit})</span>
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.VZ, fontFamily: "'Outfit', sans-serif" }}>
                      {displayVal}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={cfg.min}
                    max={cfg.max}
                    step={cfg.step}
                    value={val}
                    onChange={e => setDriver(key, parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: C.VZ, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
                    <span>{cfg.min}{key === "netAdds" ? "K" : "%"}</span>
                    <span>{cfg.max}{key === "netAdds" ? "K" : "%"}</span>
                  </div>
                </div>
              );
            })}

            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: 6,
                border: `1px solid ${C.VZ}`,
                background: "transparent",
                color: C.VZ,
                fontSize: 12,
                fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              Reset to Base
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel — Chart + Impact Card */}
      <div style={{ flex: 1, minWidth: 320 }}>
        {/* Chart */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(11,22,40,0.07)", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: "0 0 6px" }}>
            Custom vs Base Scenario
          </h3>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
            — Custom &nbsp;&nbsp; - - Base
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="period" tick={axisStyle} />
              <YAxis domain={["auto", "auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={52} />
              <Tooltip formatter={(v, name) => [fmtRev(v), name]} />
              <Line
                dataKey="custom"
                name="Custom"
                stroke={C.VZ}
                strokeWidth={2.2}
                dot={false}
              />
              <Line
                dataKey="base"
                name="Base"
                stroke={C.VZ}
                strokeWidth={1.4}
                strokeDasharray="4 2"
                dot={false}
                opacity={0.6}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Impact Card */}
        <div style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(11,22,40,0.07)",
          overflow: "hidden",
          borderTop: `3px solid ${C.VZ}`,
        }}>
          <div style={{ padding: "16px 20px" }}>
            {[
              { label: "FY2026E", custom: cFy26, base: bFy26, delta: d26 },
              { label: "FY2027E", custom: cFy27, base: bFy27, delta: d27 },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 3 }}>
                  {row.label}
                </div>
                <div style={{ fontSize: 14, fontFamily: "'Outfit', sans-serif", color: C.navy }}>
                  <span style={{ fontWeight: 700 }}>Custom ${row.custom.toFixed(2)}B</span>
                  <span style={{ color: C.muted }}> vs Base ${row.base.toFixed(2)}B</span>
                  <span style={{
                    marginLeft: 10,
                    fontWeight: 700,
                    color: row.delta >= 0 ? "#16a34a" : "#dc2626",
                    fontSize: 13,
                  }}>
                    {row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)}B
                  </span>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 11, color: C.muted, margin: "10px 0 0", fontFamily: "'Outfit', sans-serif" }}>
              Churn impact reflected in effective net adds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function WirelessRevenueForecast() {
  const [activeTab, setActiveTab] = useState("scenarios");

  const tabs = [
    { id: "scenarios",   label: "Scenario Forecast" },
    { id: "sensitivity", label: "Sensitivity Analysis" },
    { id: "custom",      label: "Custom Scenario" },
  ];

  // Pre-compute base forecast for header stat
  const baseForecast = getForecast("base");
  const baseFY26 = +getFY(baseForecast, 2026).toFixed(2);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh", padding: 24 }}>

      {/* Header */}
      <div style={{
        background: C.navy,
        borderRadius: 12,
        padding: "28px 28px 24px",
        marginBottom: 28,
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 28,
          color: "#fff",
          margin: "0 0 6px",
          fontWeight: 700,
        }}>
          Verizon Wireless Revenue Forecast
        </h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 22px", fontFamily: "'Outfit', sans-serif" }}>
          Postpaid Phone · Q1 2026–Q4 2027 | Starting from Q4 2025 Actuals ($15.68B / 91.1M subs)
        </p>

        {/* Quick-stat cards */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Starting Revenue",       value: "$15.68B",            sub: "Q4 2025 actual" },
            { label: "Starting Subscribers",   value: "91.1M",              sub: "postpaid phone" },
            { label: "Base Case FY2026E",       value: `$${baseFY26.toFixed(2)}B`, sub: "base scenario" },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: "rgba(255,255,255,0.07)",
                borderRadius: 8,
                padding: "14px 18px",
                flex: "1 1 160px",
                minWidth: 140,
              }}
            >
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", marginTop: 3 }}>
                {card.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "9px 22px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                background: isActive ? "#CD040B" : "#F0F1F5",
                color: isActive ? "#fff" : C.tick,
                fontSize: 13,
                fontFamily: "'Outfit', sans-serif",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ paddingBottom: 28 }}>
        {activeTab === "scenarios"   && <ScenarioTab />}
        {activeTab === "sensitivity" && <SensitivityTab />}
        {activeTab === "custom"      && <CustomTab />}
      </div>

      {/* Footer / Source Note */}
      <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: 16, marginTop: 8 }}>
        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}>
          Source: Company earnings releases Q1 2023–Q4 2025. Postpaid phone revenue model (Subs × ARPU × 3 months). Starting point: Q4 2025 actuals. Forecasts are illustrative scenarios, not guidance.
        </p>
      </div>
    </div>
  );
}
