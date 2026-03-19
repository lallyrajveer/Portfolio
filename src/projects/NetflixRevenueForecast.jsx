import { useState } from "react";
import {
  BarChart, Bar,
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

const SLIDER_CONFIG = [
  { key: "netAdds",   label: "Gross Adds/Q",  startKey: "netAddsStart",   endKey: "netAddsEnd",   min: 5,   max: 55,  step: 0.5, fmt: v => `+${v.toFixed(1)}M`   },
  { key: "armGrowth", label: "ARM Growth",    startKey: "armGrowthStart", endKey: "armGrowthEnd", min: 0,   max: 8.0, step: 0.1, fmt: v => `${v.toFixed(1)}%/yr` },
  { key: "churn",     label: "Monthly Churn", startKey: "churnStart",     endKey: "churnEnd",     min: 1.0, max: 4.0, step: 0.1, fmt: v => `${v.toFixed(1)}%/mo` },
];

/* ══════════════════════════════════════════════════════════════
   TAB 1 — SCENARIO FORECAST
   ══════════════════════════════════════════════════════════════ */
const SC_COLORS = { bear: "#DC2626", consensus: "#1D4ED8", bull: "#16A34A", custom: "#7C3AED" };
const SC_LABELS = { bear: "Bear",    consensus: "Consensus", bull: "Bull", custom: "Custom" };

function ScenarioTab() {
  const { scenario, setScenario, customDrivers, setCustomDrivers } = useNetflix();
  const [mechKey, setMechKey] = useState("consensus");

  const bear      = getForecast("bear");
  const consensus = getForecast("consensus");
  const bull      = getForecast("bull");
  const custom    = buildForecast(START.subs, START.arm, customDrivers.netAddsStart, customDrivers.armGrowthStart, customDrivers.churnStart, QUARTERS, customDrivers.netAddsEnd, customDrivers.armGrowthEnd, customDrivers.churnEnd, true);
  const allForecasts = { bear, consensus, bull, custom };

  const fy26 = { bear: +getFY(bear,2026).toFixed(2), consensus: +getFY(consensus,2026).toFixed(2), bull: +getFY(bull,2026).toFixed(2), custom: +getFY(custom,2026).toFixed(2) };
  const fy27 = { bear: +getFY(bear,2027).toFixed(2), consensus: +getFY(consensus,2027).toFixed(2), bull: +getFY(bull,2027).toFixed(2), custom: +getFY(custom,2027).toFixed(2) };

  const mechForecast = allForecasts[mechKey];


  const customDriversDisplay = { ...customDrivers };

  return (
    <div>
      {/* Section heading */}
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.navy, margin: "0 0 16px", fontWeight: 600 }}>
        Scenario Assumptions &amp; Implied Revenue
      </h3>

      {/* Executive Deck sync — small secondary row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>Sync Executive Deck to:</span>
        {["bear","consensus","bull","custom"].map(key => {
          const active = scenario === key;
          return (
            <button key={key} onClick={() => setScenario(key)} style={{
              padding: "3px 12px", borderRadius: 20,
              border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
              background: active ? SC_COLORS[key] : "#fff",
              color: active ? "#fff" : C.tick,
              fontSize: 11, fontFamily: "'Outfit', sans-serif",
              fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s",
            }}>{SC_LABELS[key]}</button>
          );
        })}
        <span style={{ fontSize: 11, color: "#16a34a", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0" }}>⟳ Live</span>
      </div>

      {/* 4 scenario summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {["bear","consensus","bull","custom"].map(key => (
          <div key={key} onClick={() => setScenario(key)} style={{
            background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden", borderTop: `3px solid ${SC_COLORS[key]}`,
            cursor: "pointer", outline: scenario === key ? `2px solid ${SC_COLORS[key]}` : "none",
            outlineOffset: 2,
          }}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: SC_COLORS[key], marginBottom: 8 }}>{SC_LABELS[key]}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted }}>FY2026E</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, fontFamily: "'Cormorant Garamond', serif" }}>${fy26[key]}B</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted }}>FY2027E</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.navy, fontFamily: "'Cormorant Garamond', serif" }}>${fy27[key]}B</div>
                </div>
              </div>
              <div style={{ fontSize: 10, color: C.muted, borderTop: `1px solid ${C.grid}`, paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                {key === "custom" ? (
                  <>
                    <span>+{customDriversDisplay.netAddsStart.toFixed(1)}→{customDriversDisplay.netAddsEnd.toFixed(1)}M gross/Q</span>
                    <span>{customDriversDisplay.armGrowthStart.toFixed(1)}→{customDriversDisplay.armGrowthEnd.toFixed(1)}% ARM/yr</span>
                    <span>{customDriversDisplay.churnStart.toFixed(1)}→{customDriversDisplay.churnEnd.toFixed(1)}% churn/mo</span>
                  </>
                ) : (
                  <>
                    <span>+{SCENARIOS[key].netAddsStart.toFixed(1)}→{SCENARIOS[key].netAddsEnd.toFixed(1)}M adds/Q</span>
                    <span>{SCENARIOS[key].armGrowthStart.toFixed(1)}→{SCENARIOS[key].armGrowthEnd.toFixed(1)}% ARM/yr</span>
                    <span>{SCENARIOS[key].churnStart.toFixed(1)}→{SCENARIOS[key].churnEnd.toFixed(1)}% churn/mo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom sliders */}
      <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 7, padding: "10px 16px", marginBottom: 8, fontSize: 12, color: "#5B21B6", lineHeight: 1.6 }}>
        <strong>Bear / Consensus / Bull</strong> are fixed research scenarios — named market views that cannot be edited.{" "}
        <strong>Custom</strong> uses fixed gross adds: adjust the sliders to test any driver combination. Sync the Executive Deck to Custom when you want the financial outlook to reflect your specific assumptions rather than a named case.
      </div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#7C3AED" }}>Custom Drivers</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Each driver ramps linearly from Start (Q1'26) to End (Q4'27)</div>
          </div>
          <button onClick={() => setCustomDrivers({ netAddsStart: 29.0, netAddsEnd: 31.0, armGrowthStart: 3.0, armGrowthEnd: 5.0, churnStart: 2.2, churnEnd: 1.9 })} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid #7C3AED", background: "transparent", color: "#7C3AED", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            Reset to Market Consensus
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {SLIDER_CONFIG.map(cfg => {
            const startVal = customDrivers[cfg.startKey];
            const endVal   = customDrivers[cfg.endKey];
            return (
              <div key={cfg.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>{cfg.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>{cfg.fmt(startVal)} → {cfg.fmt(endVal)}</span>
                </div>
                {[{ label: "Start (Q1'26)", valKey: cfg.startKey, val: startVal }, { label: "End (Q4'27)", valKey: cfg.endKey, val: endVal }].map(row => (
                  <div key={row.valKey} style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>{row.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED" }}>{cfg.fmt(row.val)}</span>
                    </div>
                    <input type="range" min={cfg.min} max={cfg.max} step={cfg.step} value={row.val}
                      onChange={e => setCustomDrivers(prev => ({ ...prev, [row.valKey]: parseFloat(e.target.value) }))}
                      style={{ width: "100%", accentColor: "#7C3AED", cursor: "pointer" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.muted }}>
                      <span>{cfg.min}</span><span>{cfg.max}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriber mechanics — per-scenario selector within section */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: 0 }}>
            Membership & Revenue Bridge
          </h4>
          <div style={{ display: "flex", gap: 6 }}>
            {["bear","consensus","bull","custom"].map(key => {
              const active = mechKey === key;
              return (
                <button key={key} onClick={() => setMechKey(key)} style={{
                  padding: "3px 12px", borderRadius: 20,
                  border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
                  background: active ? SC_COLORS[key] : "#fff",
                  color: active ? "#fff" : C.tick,
                  fontSize: 11, cursor: "pointer", fontWeight: active ? 700 : 400, transition: "all 0.15s",
                }}>{SC_LABELS[key]}</button>
              );
            })}
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 14px" }}>
          {mechKey === "custom"
            ? "Custom uses fixed gross adds — churn reduces them to net adds, so higher churn directly lowers subscriber count and revenue."
            : "Bear/Consensus/Bull use fixed net add targets — churn determines gross adds needed (acquisition cost) but does not affect subscriber count or revenue directly."}
        </p>
        {(() => {
          // Build historical columns (derive beginSubs + grossAdds/churnLosses from available data)
          const histCols = HISTORICAL.map((h, i) => {
            const beginSubs   = +(i === 0 ? h.subs - h.netAdds : HISTORICAL[i - 1].subs).toFixed(1);
            const avgSubs     = (beginSubs + h.subs) / 2;
            const churnLosses = +(h.churn / 100 * avgSubs * 3).toFixed(1);
            const grossAdds   = +(h.netAdds + churnLosses).toFixed(1);
            return { period: h.period, isHist: true, beginSubs, grossAdds, churnLosses, netAdds: h.netAdds, endSubs: h.subs, arm: h.arm, revenue: h.rev, churn: h.churn };
          });
          const foreCols = mechForecast.map(r => ({ ...r, isHist: false }));
          const allCols  = [...histCols, ...foreCols];

          const metricRows = [
            { label: "Begin Subs (M)",    key: "beginSubs",   fmt: v => v.toFixed(1),             color: C.tick   },
            { label: "Gross Adds (M)",    key: "grossAdds",   fmt: v => `+${v.toFixed(1)}`,        color: "#16a34a" },
            { label: "Churn Losses (M)",  key: "churnLosses", fmt: v => `−${v.toFixed(1)}`,        color: "#dc2626" },
            { label: "Net Adds (M)",      key: "netAdds",     fmt: v => `+${v.toFixed(1)}`,        color: SC_COLORS[mechKey] },
            { label: "End Subs (M)",      key: "endSubs",     fmt: v => v.toFixed(1),              color: C.navy   },
            { label: "Churn Rate (%/mo)", key: "churn",       fmt: v => `${v.toFixed(2)}%`,        color: C.tick   },
            { label: "ARM ($/mo)",        key: "arm",         fmt: v => `$${v.toFixed(2)}`,        color: SC_COLORS[mechKey] },
            { label: "Qtrly Rev ($B)",    key: "revenue",     fmt: v => `$${v.toFixed(2)}B`,       color: C.navy   },
          ];

          const thStyle = (isHist, isFore) => ({
            padding: "7px 10px", textAlign: "center", whiteSpace: "nowrap", fontSize: 11, fontWeight: 600,
            background: isHist ? "#F4F5F8" : "#EEF2FF",
            color: isHist ? C.tick : SC_COLORS[mechKey],
            borderBottom: `2px solid ${isHist ? C.grid : SC_COLORS[mechKey]}`,
            borderLeft: isFore === "first" ? `2px solid ${SC_COLORS[mechKey]}` : undefined,
          });

          return (
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", minWidth: "100%" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "7px 12px", textAlign: "left", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.grid}`, whiteSpace: "nowrap", fontSize: 11, position: "sticky", left: 0, zIndex: 1 }}>
                      Metric
                    </th>
                    {allCols.map((col, ci) => (
                      <th key={col.period} style={thStyle(col.isHist, !col.isHist && ci === histCols.length ? "first" : false)}>
                        {col.period}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metricRows.map((row, ri) => (
                    <tr key={row.label} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                      <td style={{ padding: "7px 12px", fontWeight: 600, color: C.navy, whiteSpace: "nowrap", fontSize: 11, position: "sticky", left: 0, background: ri % 2 === 0 ? "#F8F9FA" : "#fff", zIndex: 1 }}>
                        {row.label}
                      </td>
                      {allCols.map((col, ci) => (
                        <td key={col.period} style={{
                          padding: "7px 10px", textAlign: "center",
                          color: col.isHist ? C.muted : row.color,
                          fontWeight: col.isHist ? 400 : (row.key === "netAdds" || row.key === "revenue" ? 700 : 500),
                          borderLeft: !col.isHist && ci === histCols.length ? `2px solid ${SC_COLORS[mechKey]}` : undefined,
                          fontSize: 11,
                        }}>
                          {row.fmt(col[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
        <p style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
          Historical gross adds and churn losses are estimated from reported net adds, end-period subs, and third-party churn data (Antenna/YipitData).
          Forecast: {mechKey === "custom"
            ? "gross adds fixed; net adds = gross adds − churn losses."
            : "net adds fixed; gross adds = net adds + churn losses (CAC driver only)."}
        </p>
      </div>

      {/* ── Context / Assumptions — bottom of page ── */}
      <div style={{ marginTop: 32 }}>
        <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "16px 18px", fontFamily: "'Outfit', sans-serif" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#5B21B6", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Market Consensus Assumptions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              {
                label: "Gross Adds  29→31M/Q",
                points: [
                  "Mid-point of Wall Street consensus (Wells Fargo, JPMorgan, Goldman Sachs). Password-sharing tailwind largely exhausted; ad-tier and international growth (MENA, SEA, LatAm) are the primary engines.",
                  "Sports content (NFL Christmas, WWE Raw) adds periodic acquisition spikes and reduces off-season churn.",
                ],
              },
              {
                label: "ARM Growth  3.0→5.0%/yr",
                points: [
                  "Conservative start: EM mix dilutes blended ARM; no UCAN price hike expected until late 2026. Accelerates as ad-tier CPM matures — Bear 0.5→1.5%, Consensus 3.0→5.0%, Bull 3.5→6.5%.",
                  "New UCAN pricing cycle in late 2026/early 2027 adds an estimated 1–2pp.",
                ],
              },
              {
                label: "Churn  2.2→1.9%/mo",
                points: [
                  "Starts at 2.2%: seasonal weakness + competition from Max and Disney+ bundling. Improves to 1.9% by Q4'27 as sports content builds weekly viewing habits (Antenna: churn 30–40% lower in live-sports months).",
                  "Ad-tier price floor ($7.99/mo) structurally reduces cancellations — subscribers downgrade rather than leave.",
                ],
              },
            ].map(({ label, points }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", marginBottom: 7 }}>{label}</div>
                <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "disc" }}>
                  {points.map((pt, i) => (
                    <li key={i} style={{ fontSize: 11, color: "#374151", lineHeight: 1.55, marginBottom: 5 }}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #DDD6FE", fontSize: 10, color: "#7C3AED" }}>
            Sources: Netflix Q3–Q4 2025 Shareholder Letters · Wells Fargo / JPMorgan / Goldman Sachs equity research (Jan–Mar 2025) · eMarketer Streaming Ad Revenue Forecast 2024 · Antenna monthly churn data · Bloomberg Second Measure · Netflix Upfront 2024
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — SENSITIVITY ANALYSIS
   ══════════════════════════════════════════════════════════════ */
function SensitivityTab() {
  const sc = SCENARIOS.consensus;

  const baseNetAdds   = (sc.netAddsStart  + sc.netAddsEnd)  / 2;
  const baseArmGrowth = (sc.armGrowthStart + sc.armGrowthEnd) / 2;
  const baseChurn     = (sc.churnStart    + sc.churnEnd)    / 2;

  // Revenue from flat drivers (net-adds and ARM growth held fixed)
  const computeRev = (netAdds, armGrowth, churn) => {
    const fc = buildForecast(START.subs, START.arm, netAdds, armGrowth, churn, QUARTERS);
    return { fy26: +getFY(fc, 2026).toFixed(3), fy27: +getFY(fc, 2027).toFixed(3) };
  };

  // Churn sensitivity: hold gross adds fixed at base level; higher churn reduces net adds → revenue
  const baseFC = buildForecast(START.subs, START.arm, baseNetAdds, baseArmGrowth, baseChurn, QUARTERS);
  const computeRevChurnSensitivity = (churnRate) => {
    let subs = START.subs;
    let arm  = START.arm;
    const revs = [];
    for (let qi = 0; qi < QUARTERS.length; qi++) {
      const grossAdds   = baseFC[qi].grossAdds;
      const churnLosses = churnRate / 100 * subs * 3;
      const netAdds     = grossAdds - churnLosses;
      const endSubs     = subs + netAdds;
      const avgSubs     = (subs + endSubs) / 2;
      arm = arm * (1 + baseArmGrowth / 400);
      revs.push(+(avgSubs * arm * 3 / 1000).toFixed(2));
      subs = endSubs;
    }
    return {
      fy26: +revs.slice(0, 4).reduce((s, v) => s + v, 0).toFixed(3),
      fy27: +revs.slice(4, 8).reduce((s, v) => s + v, 0).toFixed(3),
    };
  };

  const baseResult          = computeRev(baseNetAdds, baseArmGrowth, baseChurn);
  // Churn uses its own base so delta comparison is apples-to-apples within the fixed-gross-adds model
  const churnSensBaseResult = computeRevChurnSensitivity(baseChurn);

  // Absolute test ranges — economically meaningful stress tests, not ±% of the rate
  const drivers = [
    {
      label: "Net Adds/Q", key: "netAdds", baseVal: baseNetAdds,
      rows: [
        { label: "Bear floor",   val: 2.0  },
        { label: "Low",          val: 4.0  },
        { label: "Base",         val: baseNetAdds, isBase: true },
        { label: "High",         val: 8.0  },
        { label: "Bull ceiling", val: 10.0 },
      ],
      getFn: val => computeRev(val, baseArmGrowth, baseChurn),
      fmt: v => v.toFixed(1) + "M/Q",
    },
    {
      label: "ARM Growth", key: "armGrowth", baseVal: baseArmGrowth,
      rows: [
        { label: "Price-hike pause",  val: 0.0  },
        { label: "Modest",            val: 1.5  },
        { label: "Base",              val: baseArmGrowth, isBase: true },
        { label: "Strong hikes",      val: 4.5  },
        { label: "Aggressive cycle",  val: 6.0  },
      ],
      getFn: val => computeRev(baseNetAdds, val, baseChurn),
      fmt: v => v.toFixed(1) + "%/yr",
    },
    {
      label: "Churn Rate", key: "churn", baseVal: baseChurn,
      // baseOverride: delta is compared against churnSensBaseResult, not the fixed-net-adds baseResult.
      // Without this, churn rows compare two different models (fixed-net-adds vs fixed-gross-adds),
      // which produces zero or near-zero deltas even though churn materially affects subscriber counts.
      baseOverride: churnSensBaseResult,
      rows: [
        { label: "Very low",  val: 1.8  },
        { label: "Low",       val: 2.05 },
        { label: "Base",      val: baseChurn, isBase: true },
        { label: "Elevated",  val: 2.55 },
        { label: "High",      val: 2.8  },
      ],
      getFn: val => computeRevChurnSensitivity(val),
      fmt: v => v.toFixed(2) + "%/mo",
    },
  ];

  // Tornado: outermost test values per driver (churn uses its own base for apples-to-apples)
  const tornadoBars = [];
  drivers.forEach(d => {
    const effectiveBase = d.baseOverride ?? baseResult;
    const extremes = [d.rows[0], d.rows[d.rows.length - 1]];
    extremes.forEach(row => {
      const res   = d.getFn(row.val);
      const delta = +(res.fy26 - effectiveBase.fy26).toFixed(3);
      tornadoBars.push({ label: `${d.label}: ${d.fmt(row.val)}`, delta, color: delta >= 0 ? "#22c55e" : "#ef4444", fy26: res.fy26, fy27: res.fy27 });
    });
  });
  tornadoBars.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 6px" }}>
          Netflix — FY2026E Revenue Sensitivity
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 4px", fontFamily: "'Outfit', sans-serif" }}>
          Absolute stress-test ranges per driver vs. Base case — FY2026E revenue delta ($B)
        </p>
        <p style={{ fontSize: 11, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          Churn: gross adds held fixed at base level; higher churn reduces net adds and revenue. Net Adds & ARM Growth: all other drivers held at base.
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
                  {d.rows.map(row => {
                    const isBase       = !!row.isBase;
                    const effectiveBase = d.baseOverride ?? baseResult;
                    const res          = isBase ? effectiveBase : d.getFn(row.val);
                    const deltaB       = +(res.fy26 - effectiveBase.fy26).toFixed(3);
                    const deltaPct     = +((deltaB / effectiveBase.fy26) * 100).toFixed(2);
                    const rowBg    = isBase ? "#FFFBEB" : deltaB > 0 ? "#F0FDF4" : deltaB < 0 ? "#FEF2F2" : "#fff";
                    return (
                      <tr key={row.label} style={{ background: rowBg }}>
                        <td style={{ padding: "8px 12px", fontWeight: isBase ? 700 : 400, color: C.navy }}>{row.label}</td>
                        <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>{d.fmt(row.val)}</td>
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
   ROOT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixRevenueForecast() {
  const [activeTab, setActiveTab] = useState("scenarios");

  const consForecast = getForecast("consensus");
  const consFY26     = +getFY(consForecast, 2026).toFixed(1);

  const tabs = [
    { id: "scenarios", label: "Scenario Forecast" },
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
            { label: "Consensus FY2026E",   value: `$${consFY26.toFixed(1)}B`, sub: "consensus scenario" },
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
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
