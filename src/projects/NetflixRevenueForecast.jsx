import { useState } from "react";
import {
  Line, BarChart, Bar, ComposedChart,
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

  const histData = HISTORICAL.map(h => ({ period: h.period, actual: h.rev, bear_v: null, cons_v: null, bull_v: null, custom_v: null }));
  const lastActual = HISTORICAL[HISTORICAL.length - 1].rev;
  const lastHistPatched = { ...histData[histData.length - 1], bear_v: lastActual, cons_v: lastActual, bull_v: lastActual, custom_v: lastActual };
  const foreData = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_v: bear[i].revenue, cons_v: consensus[i].revenue, bull_v: bull[i].revenue, custom_v: custom[i].revenue }));
  const chartData = [...histData.slice(0, -1), lastHistPatched, ...foreData];

  // ARM trajectory chart data
  const lastHistARM = HISTORICAL[HISTORICAL.length - 1].arm;
  const armHistData = HISTORICAL.map(h => ({ period: h.period, actual: h.arm, bear_a: null, cons_a: null, bull_a: null, custom_a: null }));
  const armLastHist = { ...armHistData[armHistData.length - 1], bear_a: lastHistARM, cons_a: lastHistARM, bull_a: lastHistARM, custom_a: lastHistARM };
  const armForeData = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_a: bear[i].arm, cons_a: consensus[i].arm, bull_a: bull[i].arm, custom_a: custom[i].arm }));
  const armChartData = [...armHistData.slice(0, -1), armLastHist, ...armForeData];

  // Subscriber trajectory chart data
  const lastHistSubs = HISTORICAL[HISTORICAL.length - 1].subs;
  const subsHistData = HISTORICAL.map(h => ({ period: h.period, actual: h.subs, bear_s: null, cons_s: null, bull_s: null, custom_s: null }));
  const subsLastHist = { ...subsHistData[subsHistData.length - 1], bear_s: lastHistSubs, cons_s: lastHistSubs, bull_s: lastHistSubs, custom_s: lastHistSubs };
  const subsForeData = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_s: bear[i].subs, cons_s: consensus[i].subs, bull_s: bull[i].subs, custom_s: custom[i].subs }));
  const subsChartData = [...subsHistData.slice(0, -1), subsLastHist, ...subsForeData];

  const mechForecast = allForecasts[mechKey];
  const mechSc       = SCENARIOS[mechKey];
  const mechChurn    = mechKey === "custom"
    ? (customDrivers.churnStart + customDrivers.churnEnd) / 2
    : (mechSc.churnStart + mechSc.churnEnd) / 2;

  const customDriversDisplay = { ...customDrivers };

  return (
    <div>
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

      {/* Custom sliders — always visible */}
      <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "10px 20px 6px", marginBottom: 4, fontSize: 12, color: "#5B21B6", lineHeight: 1.6 }}>
        <strong>Bear / Base / Bull</strong> are fixed research scenarios with preset assumptions — they represent named market views and cannot be edited.{" "}
        <strong>Custom</strong> is your own working scenario: adjust the sliders below to test any combination of drivers. The Custom line updates all three charts in real time. Sync the Executive Deck to Custom when you want the financial outlook table to reflect your specific assumptions rather than a named case.
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

      {/* Market consensus context */}
      <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5B21B6", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Market Consensus Assumptions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            {
              label: "Gross Adds  29→31M/Q",
              color: "#7C3AED",
              points: [
                "Implies ~28–30M FY2026 net adds — mid-point of Wall Street consensus (Wells Fargo, JPMorgan, Goldman Sachs, Jan–Mar 2025).",
                "Password-sharing tailwind largely exhausted after the 2024 blowout quarter (19M net adds). Ad-tier and international underpenetration (MENA, SEA, LatAm) are the primary growth engines.",
                "Sports content (NFL Christmas, WWE Raw) adds periodic acquisition spikes and reduces off-season churn.",
              ],
            },
            {
              label: "ARM Growth  3.0→5.0%/yr",
              color: "#7C3AED",
              points: [
                "Conservative start: international growth in EM markets ($6–8/mo) dilutes global blended ARM; no UCAN price hike expected until late 2026 after Jan 2024 increase.",
                "Accelerates through 2027 as ad-tier CPM monetisation matures — eMarketer estimates Netflix US ad revenue growing 40%+ YoY through 2026. Programmatic expansion and upfront deals improve yield per subscriber.",
                "New UCAN pricing cycle in late 2026/early 2027 adds an estimated 1–2pp to ARM growth.",
              ],
            },
            {
              label: "Churn  2.2→1.9%/mo",
              color: "#7C3AED",
              points: [
                "Starts at 2.2%: Q1 is seasonally the weakest retention quarter; heightened competition from Max's price-led EMEA expansion and Disney+ bundling.",
                "Improves to 1.9% by Q4'27: sports content creates weekly viewing habits that suppress cancellations between content drops. Antenna data shows churn 30–40% lower in months with live sports.",
                "Ad-tier ($7.99/mo) price floor prevents cancellations that would otherwise occur at $17.99 — subscribers downgrade rather than cancel. Structural floor on churn.",
              ],
            },
          ].map(({ label, color, points }) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 7 }}>{label}</div>
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

      {/* Chart — all 4 lines */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 20px" }}>
          Netflix — Revenue Scenarios ($B)
        </h3>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={axisStyle} />
            <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={56} />
            <Tooltip formatter={(v, name) => [fmtRev(v), name]} />
            <ReferenceLine x="Q4'25" stroke={C.muted} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: C.muted }} />
            <Line dataKey="actual"   name="Historical" stroke={C.navy}       strokeWidth={1.5} strokeDasharray="3 2" dot={false} connectNulls />
            <Line dataKey="bear_v"   name="Bear"       stroke={SC_COLORS.bear}   strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="cons_v"   name="Consensus"  stroke={SC_COLORS.consensus}   strokeWidth={2.5} dot={false} connectNulls />
            <Line dataKey="bull_v"   name="Bull"       stroke={SC_COLORS.bull}   strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="custom_v" name="Custom"     stroke={SC_COLORS.custom} strokeWidth={2}   dot={false} connectNulls strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Subscriber trajectory chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 4px" }}>
          Netflix — Paid Memberships (M)
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          Subscriber growth across scenarios driven by net adds ramp. Bull ceiling reaches ~400M by Q4'27; Bear floor stays near 350M.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={subsChartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={axisStyle} />
            <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `${v}M`} width={56} />
            <Tooltip formatter={(v, name) => [v != null ? `${v.toFixed(1)}M` : "—", name]} />
            <ReferenceLine x="Q4'25" stroke={C.muted} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: C.muted }} />
            <Line dataKey="actual"   name="Historical" stroke={C.navy}          strokeWidth={1.5} strokeDasharray="3 2" dot={false} connectNulls />
            <Line dataKey="bear_s"   name="Bear"       stroke={SC_COLORS.bear}   strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="cons_s"   name="Consensus"  stroke={SC_COLORS.consensus}   strokeWidth={2.5} dot={false} connectNulls />
            <Line dataKey="bull_s"   name="Bull"       stroke={SC_COLORS.bull}   strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="custom_s" name="Custom"     stroke={SC_COLORS.custom} strokeWidth={2}   dot={false} connectNulls strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ARM trajectory chart */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.navy, margin: "0 0 4px" }}>
          Netflix — Forecasted ARM ($/mo)
        </h3>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
          ARM ramps gradually as ad-tier CPM matures and pricing cycles compound. Historical = actuals; forecast lines show per-scenario trajectories.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={armChartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="period" tick={axisStyle} />
            <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}`} width={52} />
            <Tooltip formatter={(v, name) => [v != null ? `$${v.toFixed(2)}/mo` : "—", name]} />
            <ReferenceLine x="Q4'25" stroke={C.muted} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: C.muted }} />
            <Line dataKey="actual"   name="Historical" stroke={C.navy}         strokeWidth={1.5} strokeDasharray="3 2" dot={false} connectNulls />
            <Line dataKey="bear_a"   name="Bear"       stroke={SC_COLORS.bear}  strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="cons_a"   name="Consensus"  stroke={SC_COLORS.consensus}  strokeWidth={2.5} dot={false} connectNulls />
            <Line dataKey="bull_a"   name="Bull"       stroke={SC_COLORS.bull}  strokeWidth={2}   dot={false} connectNulls />
            <Line dataKey="custom_a" name="Custom"     stroke={SC_COLORS.custom} strokeWidth={2}  dot={false} connectNulls strokeDasharray="5 3" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Assumptions table — all 4 columns */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 14px" }}>
          Scenario Assumptions & Implied Revenue
        </h4>
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 7, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
          <strong>ARM growth rationale:</strong> Netflix UCAN price hikes averaged ~7% in 2024 but global blended ARM is diluted by faster international growth at lower price points. Ad-tier CPM monetization adds ~1–2pp annually as inventory scales — so ARM growth is expected to accelerate over the forecast as inventory matures. Base ramps 2→4%/yr (avg 3%); Bear 0.5→1.5% (price fatigue early, modest recovery); Bull 3.5→6.5% (ad-tier CPM matures faster, UCAN hikes continue). Custom scenario uses a flat rate.
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Driver","Bear","Consensus","Bull","Custom"].map((h, i) => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "center", background: i === 0 ? "#F4F5F8" : SC_COLORS[["bear","consensus","bull","custom"][i-1]], color: i === 0 ? C.navy : "#fff", fontWeight: 600, borderBottom: `2px solid ${i === 0 ? C.grid : SC_COLORS[["bear","consensus","bull","custom"][i-1]]}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Qtrly Net Adds (M)",
                  `+${SCENARIOS.bear.netAddsStart}→${SCENARIOS.bear.netAddsEnd}M`,
                  `+${SCENARIOS.consensus.netAddsStart}→${SCENARIOS.consensus.netAddsEnd}M`,
                  `+${SCENARIOS.bull.netAddsStart}→${SCENARIOS.bull.netAddsEnd}M`,
                  `+${customDriversDisplay.netAddsStart.toFixed(1)}→${customDriversDisplay.netAddsEnd.toFixed(1)}M (gross)`,
                  v => v],
                ["Annual ARM Growth (%)",
                  `${SCENARIOS.bear.armGrowthStart}→${SCENARIOS.bear.armGrowthEnd}%`,
                  `${SCENARIOS.consensus.armGrowthStart}→${SCENARIOS.consensus.armGrowthEnd}%`,
                  `${SCENARIOS.bull.armGrowthStart}→${SCENARIOS.bull.armGrowthEnd}%`,
                  `${customDriversDisplay.armGrowthStart.toFixed(1)}→${customDriversDisplay.armGrowthEnd.toFixed(1)}%`,
                  v => v],
                ["Monthly Churn Rate (%)",
                  `${SCENARIOS.bear.churnStart}→${SCENARIOS.bear.churnEnd}%`,
                  `${SCENARIOS.consensus.churnStart}→${SCENARIOS.consensus.churnEnd}%`,
                  `${SCENARIOS.bull.churnStart}→${SCENARIOS.bull.churnEnd}%`,
                  `${customDriversDisplay.churnStart.toFixed(1)}→${customDriversDisplay.churnEnd.toFixed(1)}%/mo`,
                  v => v],
                ["Implied FY2026E ($B)",     fy26.bear, fy26.consensus, fy26.bull, fy26.custom, v => `$${v.toFixed(1)}B`],
                ["YoY vs FY2025 ($45.2B)",   fy26.bear-45.2, fy26.consensus-45.2, fy26.bull-45.2, fy26.custom-45.2, v => `${v>=0?"+":""}${((v/45.2)*100).toFixed(1)}%`],
                ["Implied FY2027E ($B)",     fy27.bear, fy27.consensus, fy27.bull, fy27.custom, v => `$${v.toFixed(1)}B`],
                ["YoY FY2027 vs FY2026",     fy27.bear-fy26.bear, fy27.consensus-fy26.consensus, fy27.bull-fy26.bull, fy27.custom-fy26.custom, v => `${v>=0?"+":""}${((v/fy26.consensus)*100).toFixed(1)}%`],
              ].map(([label, bv, bsv, bulv, cv, fmt], ri) => {
                const isYoY = label.startsWith("YoY");
                return (
                  <tr key={label} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                    <td style={{ padding: "9px 14px", color: isYoY ? C.tick : C.navy, fontWeight: isYoY ? 400 : 500, fontSize: isYoY ? 12 : 13, fontStyle: isYoY ? "italic" : "normal" }}>{label}</td>
                    {[["bear",bv],["consensus",bsv],["bull",bulv],["custom",cv]].map(([k,v]) => (
                      <td key={k} style={{ padding: "9px 14px", textAlign: "center", color: isYoY ? (v >= 0 ? "#16a34a" : "#dc2626") : SC_COLORS[k], fontWeight: isYoY ? 400 : 600 }}>{fmt(v)}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscriber mechanics — per-scenario selector within section */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: 0 }}>
            Subscriber Mechanics
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
            : "Bear/Base/Bull use fixed net add targets — churn drives acquisition cost (gross adds needed), not revenue directly."}
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Quarter","Begin Subs (M)","Gross Adds (M)","Churn Losses (M)","Net Adds (M)","End Subs (M)","ARM ($/mo)","Qtrly Rev ($B)"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${SC_COLORS[mechKey]}`, whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mechForecast.map((row, ri) => (
                <tr key={row.period} style={{ background: ri % 2 === 0 ? "#F8F9FA" : "#fff" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: C.navy }}>{row.period}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.tick }}>{row.beginSubs.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: "#16a34a", fontWeight: 600 }}>+{row.grossAdds.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: "#dc2626" }}>−{row.churnLosses.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: SC_COLORS[mechKey], fontWeight: 700 }}>+{row.netAdds.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.navy, fontWeight: 600 }}>{row.endSubs.toFixed(1)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: SC_COLORS[mechKey], fontWeight: 600 }}>${row.arm.toFixed(2)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center", color: C.navy }}>${row.revenue.toFixed(2)}B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: C.muted, marginTop: 10, lineHeight: 1.5 }}>
          Churn losses = {mechChurn.toFixed(1)}%/mo × Begin Subs × 3 months.
          {mechKey === "custom"
            ? " Net adds = Gross adds − Churn losses. End Subs = Begin Subs + Net adds."
            : " Gross adds = Net adds + Churn losses. Higher churn inflates gross adds needed (CAC), not end subscriber count."}
        </p>
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
