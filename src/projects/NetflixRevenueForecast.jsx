import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import {
  HISTORICAL, START, SCENARIOS, QUARTERS, BASE_CHURN,
  buildForecast, getForecast, getFY,
} from "./NetflixShared.js";
import { useNetflix } from "./NetflixContext.js";

/* ─── Colors ─────────────────────────────────────────────────── */
const C = {
  NF:    "#E50914",
  navy:  "#0B1628",
  bg:    "#F8F9FA",
  grid:  "#E5E7EB",
  tick:  "#6B7280",
  muted: "#9CA3AF",
};

const axisStyle = { fontSize: 11, fill: C.tick };
const gridProps  = { stroke: C.grid, strokeDasharray: "3 3" };
const fmtRev     = v => v != null ? `$${v.toFixed(2)}B` : "—";

/* ══════════════════════════════════════════════════════════════
   TAB 1 — SCENARIO FORECAST
   ══════════════════════════════════════════════════════════════ */
function ScenarioTab() {
  const { scenario, setScenario } = useNetflix();

  const bear = getForecast("bear");
  const base = getForecast("base");
  const bull = getForecast("bull");

  const histData = HISTORICAL.map(h => ({
    period: h.period, actual: h.rev,
    bear_v: null, base_v: null, bull_v: null, band_lo: null, band_hi: null,
  }));

  const foreData = QUARTERS.map((q, i) => ({
    period: q, actual: null,
    bear_v: bear[i].revenue, base_v: base[i].revenue, bull_v: bull[i].revenue,
    band_lo: bear[i].revenue, band_hi: bull[i].revenue,
  }));

  const lastActual = HISTORICAL[HISTORICAL.length - 1].rev;
  const lastHistPatched = {
    ...histData[histData.length - 1],
    bear_v: lastActual, base_v: lastActual, bull_v: lastActual,
    band_lo: lastActual, band_hi: lastActual,
  };

  const chartData = [...histData.slice(0, -1), lastHistPatched, ...foreData];

  const fy26bear = +getFY(bear, 2026).toFixed(2);
  const fy26base = +getFY(base, 2026).toFixed(2);
  const fy26bull = +getFY(bull, 2026).toFixed(2);
  const fy27bear = +getFY(bear, 2027).toFixed(2);
  const fy27base = +getFY(base, 2027).toFixed(2);
  const fy27bull = +getFY(bull, 2027).toFixed(2);

  const SCENARIO_LABELS = { bear: "Bear", base: "Base", bull: "Bull" };

  return (
    <div>
      {/* Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>
          Active scenario (synced to Board Report):
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {["bear","base","bull"].map(key => {
            const active = scenario === key;
            return (
              <button key={key} onClick={() => setScenario(key)} style={{
                padding: "5px 16px", borderRadius: 20,
                border: `1.5px solid ${active ? C.NF : C.grid}`,
                background: active ? C.NF : "#fff",
                color: active ? "#fff" : C.tick,
                fontSize: 12, fontFamily: "'Outfit', sans-serif",
                fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s",
              }}>
                {SCENARIO_LABELS[key]}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: "#16a34a", fontFamily: "'Outfit', sans-serif", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
          ⟳ Live — Board Report will reflect this scenario
        </span>
      </div>

      {/* Chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 20px" }}>
          Netflix — Bear / Base / Bull Revenue Scenarios ($B)
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={axisStyle} />
            <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={56} />
            <Tooltip formatter={(v, name) => [fmtRev(v), name]} />
            <ReferenceLine x="Q4'25" stroke={C.muted} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: C.muted }} />
            <Area dataKey="band_hi" fill={C.NF} stroke="none" fillOpacity={0.08} legendType="none" connectNulls />
            <Area dataKey="band_lo" fill={C.bg} stroke="none" fillOpacity={1}    legendType="none" connectNulls />
            <Line dataKey="actual" name="Historical" stroke={C.NF} strokeWidth={1.5} strokeDasharray="3 2" dot={false} connectNulls />
            <Line dataKey="bull_v" name="Bull" stroke={C.NF} strokeWidth={scenario === "bull" ? 3 : 1.8} strokeDasharray={scenario === "bull" ? undefined : "5 3"} dot={false} connectNulls opacity={scenario === "bull" ? 1 : 0.5} />
            <Line dataKey="base_v" name="Base" stroke={C.NF} strokeWidth={scenario === "base" ? 3 : 2}   dot={false} connectNulls opacity={scenario === "base" ? 1 : 0.5} />
            <Line dataKey="bear_v" name="Bear" stroke={C.NF} strokeWidth={scenario === "bear" ? 3 : 1.8} strokeDasharray={scenario === "bear" ? undefined : "5 3"} dot={false} connectNulls opacity={scenario === "bear" ? 1 : 0.4} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Assumptions Table */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 14px" }}>
          Scenario Assumptions & Implied Revenue
        </h4>

        {/* ARM rationale note */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#92400E", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
          <strong>ARM growth rationale:</strong> Netflix UCAN price hikes averaged ~7% in 2024 but global blended ARM is diluted by faster international growth at lower price points. Ad-tier CPM monetization adds ~1–2pp annually as inventory scales. Base of 3%/yr reflects this blend; Bear (1%) assumes price-hike fatigue and mix headwinds; Bull (5%) assumes ad-tier CPM matures faster and UCAN hikes continue unabated.
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Driver", "Bear", "Base", "Bull"].map((h, i) => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "center", background: i === 0 ? "#F4F5F8" : C.NF, color: i === 0 ? C.navy : "#fff", fontWeight: 600, borderBottom: `2px solid ${C.NF}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Qtrly Net Adds (M)",        SCENARIOS.bear.netAdds,    SCENARIOS.base.netAdds,    SCENARIOS.bull.netAdds,    v => (v > 0 ? "+" : "") + v.toFixed(1) + "M"],
                ["Annual ARM Growth (%)",      SCENARIOS.bear.armGrowth,  SCENARIOS.base.armGrowth,  SCENARIOS.bull.armGrowth,  v => v.toFixed(1) + "%"],
                ["Monthly Churn Rate (%)",     SCENARIOS.bear.churn,      SCENARIOS.base.churn,      SCENARIOS.bull.churn,      v => v.toFixed(1) + "%/mo"],
                ["Implied FY2026E Rev ($B)",   fy26bear, fy26base, fy26bull, v => `$${v.toFixed(1)}B`],
                ["YoY vs FY2025 ($45.2B)",     fy26bear-45.2, fy26base-45.2, fy26bull-45.2, v => `${v>=0?"+":""}${((v/45.2)*100).toFixed(1)}%`],
                ["Implied FY2027E Rev ($B)",   fy27bear, fy27base, fy27bull, v => `$${v.toFixed(1)}B`],
                ["YoY FY2027 vs FY2026",       fy27bear-fy26bear, fy27base-fy26base, fy27bull-fy26bull, v => `${v>=0?"+":""}${((v/(v>=0?fy26base:fy26bear))*100).toFixed(1)}%`],
              ].map(([label, bv, bsv, bulv, fmt], ri) => {
                const isYoY = label.startsWith("YoY");
                return (
                  <tr key={label} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                    <td style={{ padding: "9px 14px", color: isYoY ? C.tick : C.navy, fontWeight: isYoY ? 400 : 500, fontSize: isYoY ? 12 : 13, fontStyle: isYoY ? "italic" : "normal" }}>{label}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: isYoY ? (bv >= 0 ? "#16a34a" : "#dc2626") : (scenario === "bear" ? C.NF : C.tick), fontWeight: scenario === "bear" && !isYoY ? 700 : 400 }}>{fmt(bv)}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: isYoY ? (bsv >= 0 ? "#16a34a" : "#dc2626") : (scenario === "base" ? C.NF : C.navy), fontWeight: scenario === "base" && !isYoY ? 700 : 600 }}>{fmt(bsv)}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: isYoY ? (bulv >= 0 ? "#16a34a" : "#dc2626") : (scenario === "bull" ? C.NF : C.tick), fontWeight: scenario === "bull" && !isYoY ? 700 : 400 }}>{fmt(bulv)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscriber mechanics table */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 6px" }}>
          Subscriber Mechanics — {SCENARIO_LABELS[scenario]} Scenario
        </h4>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 14px", fontFamily: "'Outfit', sans-serif" }}>
          Gross adds required = Net adds + Churn losses. Churn rate drives acquisition cost, not revenue directly.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Quarter", "Begin Subs (M)", "Gross Adds (M)", "Churn Losses (M)", "Net Adds (M)", "End Subs (M)", "Qtrly Rev ($B)"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.NF}`, whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(scenario === "bear" ? bear : scenario === "bull" ? bull : base).map((row, ri) => (
                <tr key={row.period} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: C.navy }}>{row.period}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>{row.beginSubs.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: "#16a34a", fontWeight: 600 }}>+{row.grossAdds.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: "#dc2626" }}>−{row.churnLosses.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.NF, fontWeight: 700 }}>+{row.netAdds.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.navy, fontWeight: 600 }}>{row.endSubs.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.navy }}>${row.revenue.toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
          Churn losses = {(scenario === "bear" ? SCENARIOS.bear.churn : scenario === "bull" ? SCENARIOS.bull.churn : SCENARIOS.base.churn).toFixed(1)}%/mo × Begin Subs × 3 months.
          Gross adds = the number of new subscribers required to land the net adds target given that churn rate.
          Higher churn inflates gross adds needed, driving up customer acquisition cost — captured in the margin model.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — SENSITIVITY ANALYSIS
   ══════════════════════════════════════════════════════════════ */
function SensitivityTab() {
  const sc = SCENARIOS.base;

  const computeRev = (netAdds, armGrowth, churn) => {
    const fc = buildForecast(START.subs, START.arm, netAdds, armGrowth, churn, QUARTERS);
    return { fy26: +getFY(fc, 2026).toFixed(3), fy27: +getFY(fc, 2027).toFixed(3) };
  };

  const baseResult = computeRev(sc.netAdds, sc.armGrowth, sc.churn);

  const drivers = [
    { label: "Net Adds/Q",  key: "netAdds",   getFn: pct => computeRev(sc.netAdds * (1 + pct / 100), sc.armGrowth, sc.churn) },
    { label: "ARM Growth",  key: "armGrowth", getFn: pct => computeRev(sc.netAdds, sc.armGrowth * (1 + pct / 100), sc.churn) },
    { label: "Churn Rate",  key: "churn",     getFn: pct => computeRev(sc.netAdds, sc.armGrowth, sc.churn * (1 + pct / 100)) },
  ];

  const tornadoBars = [];
  drivers.forEach(d => {
    [-10, -5, 5, 10].forEach(pct => {
      const res   = d.getFn(pct);
      const delta = +(res.fy26 - baseResult.fy26).toFixed(3);
      tornadoBars.push({ label: `${d.label} ${pct > 0 ? "+" : ""}${pct}%`, delta, color: delta >= 0 ? "#22c55e" : "#ef4444", driver: d.label, pct, fy26: res.fy26, fy27: res.fy27 });
    });
  });
  tornadoBars.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const tableRows = [
    { pct: -10, label: "-10%" }, { pct: -5, label: "-5%" },
    { pct: 0,  label: "Base" }, { pct: 5,  label: "+5%" }, { pct: 10, label: "+10%" },
  ];

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 6px" }}>
          Netflix — FY2026E Revenue Sensitivity
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          Impact of ±5% / ±10% driver changes on FY2026E annual revenue vs. Base ($B)
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart layout="vertical" data={tornadoBars} margin={{ top: 4, right: 60, bottom: 4, left: 120 }}>
            <CartesianGrid {...gridProps} horizontal={false} />
            <XAxis type="number" tick={axisStyle} tickFormatter={v => (v >= 0 ? "+" : "") + v.toFixed(1) + "B"} domain={["auto","auto"]} />
            <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: C.tick }} width={118} />
            <Tooltip formatter={v => [`${v >= 0 ? "+" : ""}$${v.toFixed(3)}B`, "Delta vs Base"]} />
            <ReferenceLine x={0} stroke={C.navy} strokeWidth={1.5} />
            <Bar dataKey="delta" radius={[0, 3, 3, 0]}>
              {tornadoBars.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 16px" }}>
          Driver Sensitivity Tables
        </h4>
        {drivers.map(d => (
          <div key={d.key} style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.NF, margin: "0 0 8px", fontFamily: "'Outfit', sans-serif" }}>
              {d.label} Sensitivity
            </p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
                <thead>
                  <tr>
                    {["Variation","Driver Value","FY2026E Rev ($B)","FY2027E Rev ($B)","vs Base ($B)","vs Base (%)"].map((h, i) => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: i === 0 ? "left" : "center", background: "#F8F9FA", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.NF}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map(({ pct, label }) => {
                    const isBase = pct === 0;
                    const res    = isBase ? baseResult : d.getFn(pct);
                    const dv     = isBase ? sc[d.key] : sc[d.key] * (1 + pct / 100);
                    const deltaB   = +(res.fy26 - baseResult.fy26).toFixed(3);
                    const deltaPct = +((deltaB / baseResult.fy26) * 100).toFixed(2);
                    const rowBg = isBase ? "#FFFBEB" : deltaB > 0 ? "#F0FDF4" : deltaB < 0 ? "#FEF2F2" : "#fff";
                    return (
                      <tr key={pct} style={{ background: rowBg }}>
                        <td style={{ padding: "8px 12px", fontWeight: isBase ? 700 : 400, color: C.navy }}>{label}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>
                          {d.key === "netAdds" ? dv.toFixed(1) + "M" : dv.toFixed(2) + "%/mo"}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: isBase ? 700 : 400, color: C.navy }}>${res.fy26.toFixed(2)}B</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>${res.fy27.toFixed(2)}B</td>
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

/* ══════════════════════════════════════════════════════════════
   TAB 3 — CUSTOM SCENARIO
   ══════════════════════════════════════════════════════════════ */
const SLIDER_CONFIG = {
  netAdds:   { min: 0,   max: 18,  step: 0.5, unit: "M/qtr",  label: "Net Adds per Quarter" },
  armGrowth: { min: 0,   max: 4.0, step: 0.1, unit: "%/yr",   label: "Annual ARM Growth"     },
  churn:     { min: 1.0, max: 4.0, step: 0.1, unit: "%/mo",   label: "Monthly Churn Rate"    },
};

function CustomTab() {
  const { setScenario, customDrivers, setCustomDrivers } = useNetflix();

  const setDriver = (key, value) => {
    setScenario("custom");
    setCustomDrivers(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setCustomDrivers({ netAdds: 6.0, armGrowth: 1.5, churn: 2.3 });
    setScenario("custom");
  };

  const customForecast = buildForecast(START.subs, START.arm, customDrivers.netAdds, customDrivers.armGrowth, customDrivers.churn ?? BASE_CHURN, QUARTERS);
  const baseForecast   = getForecast("base");

  const chartData = QUARTERS.map((q, i) => ({
    period: q, custom: customForecast[i].revenue, base: baseForecast[i].revenue,
  }));

  const cFy26 = +getFY(customForecast, 2026).toFixed(2);
  const bFy26 = +getFY(baseForecast,   2026).toFixed(2);
  const cFy27 = +getFY(customForecast, 2027).toFixed(2);
  const bFy27 = +getFY(baseForecast,   2027).toFixed(2);
  const d26   = +(cFy26 - bFy26).toFixed(2);
  const d27   = +(cFy27 - bFy27).toFixed(2);

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {/* Sliders */}
      <div style={{ flex: "0 0 300px", minWidth: 260 }}>
        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ background: C.NF, padding: "12px 16px" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>Netflix Custom Drivers</span>
          </div>
          <div style={{ padding: "18px 16px" }}>
            {Object.entries(SLIDER_CONFIG).map(([key, cfg]) => {
              const val = customDrivers[key];
              const displayVal = key === "netAdds" ? `+${val.toFixed(1)}M` : key === "churn" ? `${val.toFixed(1)}%/mo` : `${val.toFixed(1)}%`;
              return (
                <div key={key} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.tick, fontFamily: "'Outfit', sans-serif" }}>
                      {cfg.label} <span style={{ color: C.muted, fontSize: 10 }}>({cfg.unit})</span>
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: C.NF, fontFamily: "'Outfit', sans-serif" }}>{displayVal}</span>
                  </div>
                  <input
                    type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={val}
                    onChange={e => setDriver(key, parseFloat(e.target.value))}
                    style={{ width: "100%", accentColor: C.NF, cursor: "pointer" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.muted, marginTop: 2 }}>
                    <span>{cfg.min}{key === "netAdds" ? "M" : "%"}</span>
                    <span>{cfg.max}{key === "netAdds" ? "M" : "%"}</span>
                  </div>
                </div>
              );
            })}
            <button onClick={reset} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${C.NF}`, background: "transparent", color: C.NF, fontSize: 12, fontFamily: "'Outfit', sans-serif", cursor: "pointer", fontWeight: 600, marginTop: 4 }}>
              Reset to Base
            </button>
            <div style={{ marginTop: 12, padding: "8px 10px", background: "#F0FDF4", borderRadius: 6, border: "1px solid #bbf7d0" }}>
              <span style={{ fontSize: 11, color: "#16a34a", fontFamily: "'Outfit', sans-serif" }}>
                ⟳ Board Report synced to this custom scenario
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart + Impact */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: "0 0 6px" }}>Custom vs. Base Scenario</h3>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 16px" }}>— Custom &nbsp;&nbsp; - - Base</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="period" tick={axisStyle} />
              <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={52} />
              <Tooltip formatter={(v, name) => [fmtRev(v), name]} />
              <Line dataKey="custom" name="Custom" stroke={C.NF} strokeWidth={2.2} dot={false} />
              <Line dataKey="base"   name="Base"   stroke={C.NF} strokeWidth={1.4} strokeDasharray="4 2" dot={false} opacity={0.6} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden", borderTop: `3px solid ${C.NF}` }}>
          <div style={{ padding: "16px 20px" }}>
            {[
              { label: "FY2026E", custom: cFy26, base: bFy26, delta: d26 },
              { label: "FY2027E", custom: cFy27, base: bFy27, delta: d27 },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", marginBottom: 3 }}>{row.label}</div>
                <div style={{ fontSize: 14, color: C.navy, fontFamily: "'Outfit', sans-serif" }}>
                  <span style={{ fontWeight: 700 }}>Custom ${row.custom.toFixed(2)}B</span>
                  <span style={{ color: C.muted }}> vs Base ${row.base.toFixed(2)}B</span>
                  <span style={{ marginLeft: 10, fontWeight: 700, color: row.delta >= 0 ? "#16a34a" : "#dc2626", fontSize: 13 }}>
                    {row.delta >= 0 ? "+" : ""}${row.delta.toFixed(2)}B
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 4 — MARGIN & EBITDA
   ══════════════════════════════════════════════════════════════ */

// Netflix FY2025 actual: ~29% operating margin. FY2024: 26.7%.
// Bear: content cost inflation + elevated churn → higher CAC compresses margin.
// Base: continuation of FY2025 guided range (26–29%), modest efficiency gains.
// Bull: strong operating leverage as revenue scales faster than content spend.
const MARGIN_SCENARIOS = {
  bear: { fy26: 0.25, fy27: 0.26, label: "Cost Pressure",      color: "#DC2626", desc: "Content cost inflation (+5% YoY), elevated churn → higher gross adds needed → higher CAC. Limited pricing leverage compresses margin vs. FY2025." },
  base: { fy26: 0.28, fy27: 0.29, label: "Guided Continuation", color: "#1D4ED8", desc: "Consistent with Netflix's stated 26–29% operating margin target. Modest content spend efficiency and ad-tier contribution partially offset FX headwinds." },
  bull: { fy26: 0.31, fy27: 0.33, label: "Operating Leverage",  color: "#16A34A", desc: "Revenue scales faster than content spend. Ad-tier CPM matures, pricing power holds in UCAN/EMEA. Low churn reduces gross add CAC burden significantly." },
};

// Netflix FY2025 operating cost context (approximate):
//   Content amortization: ~$15–17B   Marketing: ~$2.5B   Tech & Dev: ~$3B   G&A: ~$1.5B
//   Total operating costs: ~$32B on $45.2B revenue → ~29% op margin
const FY25_REV = 45.2;
const FY25_OP_INC = FY25_REV * 0.29; // ~$13.1B baseline

function EBITDATab() {
  const bear = getForecast("bear");
  const base = getForecast("base");
  const bull = getForecast("bull");

  const revScenarios = [
    { key: "bear", label: "Bear", fy26rev: +getFY(bear, 2026).toFixed(1), fy27rev: +getFY(bull, 2027).toFixed(1), color: "#DC2626" },
    { key: "base", label: "Base", fy26rev: +getFY(base, 2026).toFixed(1), fy27rev: +getFY(base, 2027).toFixed(1), color: "#1D4ED8" },
    { key: "bull", label: "Bull", fy26rev: +getFY(bull, 2026).toFixed(1), fy27rev: +getFY(bull, 2027).toFixed(1), color: "#16A34A" },
  ];
  // fix bear fy27 (was accidentally set to bull)
  revScenarios[0].fy27rev = +getFY(bear, 2027).toFixed(1);

  const marginKeys = ["bear", "base", "bull"];

  const matrixData26 = revScenarios.map(r => {
    const row = { revLabel: `${r.label} Rev ($${r.fy26rev}B)`, revColor: r.color };
    marginKeys.forEach(mk => {
      row[mk] = +(r.fy26rev * MARGIN_SCENARIOS[mk].fy26).toFixed(1);
    });
    return row;
  });
  const matrixData27 = revScenarios.map(r => {
    const row = { revLabel: `${r.label} Rev ($${r.fy27rev}B)`, revColor: r.color };
    marginKeys.forEach(mk => {
      row[mk] = +(r.fy27rev * MARGIN_SCENARIOS[mk].fy27).toFixed(1);
    });
    return row;
  });

  // Waterfall-style bar data: Base rev + Base margin for each year, vs FY2025
  const waterfallData = [
    { period: "FY2025A",   opInc: +FY25_OP_INC.toFixed(1),              fill: "#6B7280" },
    { period: "FY2026E Bear", opInc: +(revScenarios[0].fy26rev * MARGIN_SCENARIOS.bear.fy26).toFixed(1), fill: "#DC2626" },
    { period: "FY2026E Base", opInc: +(revScenarios[1].fy26rev * MARGIN_SCENARIOS.base.fy26).toFixed(1), fill: "#1D4ED8" },
    { period: "FY2026E Bull", opInc: +(revScenarios[2].fy26rev * MARGIN_SCENARIOS.bull.fy26).toFixed(1), fill: "#16A34A" },
    { period: "FY2027E Bear", opInc: +(revScenarios[0].fy27rev * MARGIN_SCENARIOS.bear.fy27).toFixed(1), fill: "#DC2626" },
    { period: "FY2027E Base", opInc: +(revScenarios[1].fy27rev * MARGIN_SCENARIOS.base.fy27).toFixed(1), fill: "#1D4ED8" },
    { period: "FY2027E Bull", opInc: +(revScenarios[2].fy27rev * MARGIN_SCENARIOS.bull.fy27).toFixed(1), fill: "#16A34A" },
  ];

  return (
    <div>
      {/* Methodology note */}
      <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: "#1E40AF", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
        <strong>Margin model:</strong> Operating income = Revenue × Operating margin %. Margin scenarios are independent of revenue scenarios — each intersection shows a distinct outcome.
        Netflix FY2025 actual operating margin: ~29% ($13.1B on $45.2B). FY2024: 26.7%.
        Bear margin reflects content cost inflation and higher gross-add CAC from elevated churn. Bull margin reflects operating leverage as revenue scales faster than the (largely fixed) content amortization base.
      </div>

      {/* Margin scenario cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {marginKeys.map(mk => {
          const m = MARGIN_SCENARIOS[mk];
          return (
            <div key={mk} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${m.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: m.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</div>
              <div style={{ display: "flex", gap: 16, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0B1628", lineHeight: 1 }}>{(m.fy26 * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>FY2026E margin</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0B1628", lineHeight: 1 }}>{(m.fy27 * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 10, color: "#6B7280" }}>FY2027E margin</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{m.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Operating income bar chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 6px" }}>
          Implied Operating Income — All Combinations ($B)
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          Each bar = Revenue scenario × its matching margin scenario. Red = Bear, Blue = Base, Green = Bull.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={waterfallData} margin={{ top: 8, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: C.tick }} />
            <YAxis tick={axisStyle} tickFormatter={v => `$${v}B`} width={52} domain={[0, "auto"]} />
            <Tooltip formatter={v => [`$${v}B`, "Op. Income"]} />
            <ReferenceLine y={FY25_OP_INC} stroke={C.grid} strokeDasharray="4 2" label={{ value: `FY25A $${FY25_OP_INC.toFixed(1)}B`, position: "insideTopRight", fontSize: 10, fill: C.muted }} />
            <Bar dataKey="opInc" radius={[4, 4, 0, 0]}>
              {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sensitivity matrix */}
      {[{ year: "FY2026E", data: matrixData26 }, { year: "FY2027E", data: matrixData27 }].map(({ year, data }) => (
        <div key={year} style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 14px" }}>
            {year} — Operating Income Sensitivity Matrix ($B)
          </h4>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 12px", fontFamily: "'Outfit', sans-serif" }}>
            Rows = revenue scenario · Columns = margin scenario · Each cell = Revenue × Margin
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                <th style={{ padding: "9px 14px", textAlign: "left", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.NF}` }}>Revenue Scenario</th>
                {marginKeys.map(mk => (
                  <th key={mk} style={{ padding: "9px 14px", textAlign: "center", background: "#F4F5F8", color: MARGIN_SCENARIOS[mk].color, fontWeight: 700, borderBottom: `2px solid ${C.NF}` }}>
                    {MARGIN_SCENARIOS[mk].label}<br /><span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}>{((year === "FY2026E" ? MARGIN_SCENARIOS[mk].fy26 : MARGIN_SCENARIOS[mk].fy27) * 100).toFixed(0)}% margin</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: row.revColor }}>{row.revLabel}</td>
                  {marginKeys.map(mk => {
                    const val = row[mk];
                    const isBase = mk === "base" && row.revLabel.startsWith("Base");
                    return (
                      <td key={mk} style={{ padding: "9px 14px", textAlign: "center", fontWeight: isBase ? 700 : 500, color: isBase ? C.NF : C.navy, background: isBase ? "#FFF8F8" : undefined }}>
                        ${val.toFixed(1)}B
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Cost context footnote */}
      <div style={{ background: "#F8F9FA", borderRadius: 8, padding: "14px 16px", fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
        <strong style={{ color: C.navy }}>Cost structure context (FY2025 approximate):</strong> Content amortization ~$15–17B · Marketing ~$2.5B · Technology & Development ~$3.0B · G&A ~$1.5B · Total operating costs ~$32B.
        Operating leverage arises because content spend is largely fixed in the near term (multi-year licensing, studio output deals) while incremental ARM and subscriber revenue flows through at high contribution margin.
        Bear margin compression driven primarily by higher gross-add CAC (more subscribers must be acquired to offset elevated churn) and content cost inflation not offset by ARM growth.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixRevenueForecast() {
  const [activeTab, setActiveTab] = useState("scenarios");
  const { setScenario } = useNetflix();

  const handleTabChange = (id) => {
    setActiveTab(id);
    if (id === "custom") setScenario("custom");
  };

  const baseForecast = getForecast("base");
  const baseFY26     = +getFY(baseForecast, 2026).toFixed(1);

  const tabs = [
    { id: "scenarios",   label: "Scenario Forecast" },
    { id: "sensitivity", label: "Sensitivity Analysis" },
    { id: "custom",      label: "Custom Scenario" },
    { id: "ebitda",      label: "Margin & EBITDA" },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh", padding: 24 }}>

      {/* Header */}
      <div style={{ background: C.navy, borderRadius: 12, padding: "28px 28px 24px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, background: C.NF, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 12 }}>N</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.NF }}>Revenue Forecast</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#fff", margin: "0 0 6px", fontWeight: 700 }}>
          Netflix Revenue Forecast
        </h1>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 22px" }}>
          Driver-Based Model · Q1 2026–Q4 2027 | Starting from Q4 2025 Actuals ($12.05B / 332M members)
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            { label: "Starting Revenue",   value: "$12.05B",              sub: "Q4 2025 actual" },
            { label: "Starting Members",   value: "332M",                 sub: "paid memberships" },
            { label: "Starting ARM",       value: "$12.23/mo",            sub: "global blended" },
            { label: "Base FY2026E",       value: `$${baseFY26.toFixed(1)}B`, sub: "base scenario" },
          ].map(card => (
            <div key={card.label} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "14px 18px", flex: "1 1 140px", minWidth: 120 }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 21, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.2 }}>{card.value}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{card.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} style={{
              padding: "9px 22px", borderRadius: 7, border: "none", cursor: "pointer",
              background: isActive ? C.NF : "#F0F1F5",
              color: isActive ? "#fff" : C.tick,
              fontSize: 13, fontWeight: isActive ? 600 : 400, transition: "all 0.15s",
            }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 28 }}>
        {activeTab === "scenarios"   && <ScenarioTab />}
        {activeTab === "sensitivity" && <SensitivityTab />}
        {activeTab === "custom"      && <CustomTab />}
        {activeTab === "ebitda"      && <EBITDATab />}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: 14 }}>
        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Source: Netflix shareholder letters Q1 2023–Q4 2025. Revenue model: Avg Paid Members × ARM ($/mo) × 3 months.
          Starting point: Q4 2025 actuals. Netflix stopped reporting paid members after Q1 2025; Q2–Q4 2025 are estimates.
          Forecasts are illustrative scenarios only, not financial guidance.
        </p>
      </div>
    </div>
  );
}
