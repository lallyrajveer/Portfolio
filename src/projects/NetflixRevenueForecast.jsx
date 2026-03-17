import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import {
  HISTORICAL, START, SCENARIOS, QUARTERS,
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
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 14px" }}>
          Scenario Assumptions & Implied Revenue
        </h4>
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
                ["Implied FY2026E Rev ($B)",   fy26bear, fy26base, fy26bull, v => `$${v.toFixed(1)}B`],
                ["Implied FY2027E Rev ($B)",   fy27bear, fy27base, fy27bull, v => `$${v.toFixed(1)}B`],
              ].map(([label, bv, bsv, bulv, fmt], ri) => (
                <tr key={label} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                  <td style={{ padding: "9px 14px", color: C.navy, fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: scenario === "bear" ? C.NF : C.tick, fontWeight: scenario === "bear" ? 700 : 400 }}>{fmt(bv)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: scenario === "base" ? C.NF : C.navy, fontWeight: scenario === "base" ? 700 : 600 }}>{fmt(bsv)}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center", color: scenario === "bull" ? C.NF : C.tick, fontWeight: scenario === "bull" ? 700 : 400 }}>{fmt(bulv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — SENSITIVITY ANALYSIS
   ══════════════════════════════════════════════════════════════ */
function SensitivityTab() {
  const sc = SCENARIOS.base;

  const computeRev = (netAdds, armGrowth) => {
    const fc = buildForecast(START.subs, START.arm, netAdds, armGrowth, QUARTERS);
    return { fy26: +getFY(fc, 2026).toFixed(3), fy27: +getFY(fc, 2027).toFixed(3) };
  };

  const baseResult = computeRev(sc.netAdds, sc.armGrowth);

  const drivers = [
    { label: "Net Adds/Q",  key: "netAdds",   getFn: pct => computeRev(sc.netAdds * (1 + pct / 100), sc.armGrowth) },
    { label: "ARM Growth",  key: "armGrowth", getFn: pct => computeRev(sc.netAdds, sc.armGrowth * (1 + pct / 100)) },
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
                          {d.key === "netAdds" ? dv.toFixed(1) + "M" : dv.toFixed(2) + "%"}
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
};

function CustomTab() {
  const { setScenario, customDrivers, setCustomDrivers } = useNetflix();

  const setDriver = (key, value) => {
    setScenario("custom");
    setCustomDrivers(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setCustomDrivers({ netAdds: 6.0, armGrowth: 1.5 });
    setScenario("custom");
  };

  const customForecast = buildForecast(START.subs, START.arm, customDrivers.netAdds, customDrivers.armGrowth, QUARTERS);
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
              const displayVal = key === "netAdds" ? `+${val.toFixed(1)}M` : `${val.toFixed(1)}%`;
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
