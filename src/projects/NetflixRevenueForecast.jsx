import { useState } from "react";
import {
  HISTORICAL, START, SCENARIOS, QUARTERS,
  buildForecast, getForecast, getFY,
} from "./NetflixShared.js";
import { useNetflix } from "./NetflixContext.js";

/* ─── Dual-handle range slider ───────────────────────────────── */
const DUAL_SLIDER_CSS = `
  .nf-dual-range { position: relative; height: 20px; }
  .nf-dual-range input[type=range] {
    position: absolute; width: 100%; top: 50%; margin: 0;
    height: 0; background: transparent; appearance: none; -webkit-appearance: none;
    pointer-events: none;
  }
  .nf-dual-range input[type=range]::-webkit-slider-thumb {
    appearance: none; -webkit-appearance: none; pointer-events: all; cursor: grab;
    width: 15px; height: 15px; border-radius: 50%;
    background: #7C3AED; border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(124,58,237,0.35);
  }
  .nf-dual-range input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; }
  .nf-dual-range input[type=range]::-moz-range-thumb {
    pointer-events: all; cursor: grab;
    width: 15px; height: 15px; border-radius: 50%;
    background: #7C3AED; border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(124,58,237,0.35);
  }
`;
if (typeof document !== "undefined" && !document.getElementById("nf-dual-range-style")) {
  const s = document.createElement("style");
  s.id = "nf-dual-range-style";
  s.textContent = DUAL_SLIDER_CSS;
  document.head.appendChild(s);
}

function DualRangeSlider({ min, max, step, startVal, endVal, onStartChange, onEndChange, fmt }) {
  const pct      = v => ((v - min) / (max - min)) * 100;
  const pStart   = pct(startVal);
  const pEnd     = pct(endVal);
  const trackL   = Math.min(pStart, pEnd);
  const trackW   = Math.abs(pEnd - pStart);
  const declining = endVal < startVal;
  const arrow    = declining ? "↘" : endVal > startVal ? "↗" : "→";
  const arrowClr = declining ? "#DC2626" : "#16A34A";
  // When handles cross, bring the start handle forward so it can be pulled back left
  const zStart   = startVal >= endVal ? 5 : 3;
  const zEnd     = startVal >= endVal ? 3 : 5;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#6B7280" }}>Q1'26 <strong style={{ color: "#7C3AED", fontSize: 11 }}>{fmt(startVal)}</strong></span>
        <span style={{ fontSize: 12, color: arrowClr, fontWeight: 700 }}>{arrow}</span>
        <span style={{ fontSize: 10, color: "#6B7280" }}>Q4'27 <strong style={{ color: "#7C3AED", fontSize: 11 }}>{fmt(endVal)}</strong></span>
      </div>
      <div className="nf-dual-range">
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", height: 4, background: "#E5E7EB", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${trackL}%`, width: `${trackW}%`, height: 4, background: "#7C3AED", borderRadius: 2 }} />
        <input type="range" min={min} max={max} step={step} value={startVal}
          style={{ zIndex: zStart }}
          onChange={e => onStartChange(parseFloat(e.target.value))} />
        <input type="range" min={min} max={max} step={step} value={endVal}
          style={{ zIndex: zEnd }}
          onChange={e => onEndChange(parseFloat(e.target.value))} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9CA3AF", marginTop: 3 }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

/* ─── Colors ─────────────────────────────────────────────────── */
const C = {
  NF:    "#E50914",
  navy:  "#0B1628",
  bg:    "#F8F9FA",
  grid:  "#E5E7EB",
  tick:  "#6B7280",
  muted: "#9CA3AF",
};

const SLIDER_CONFIG = [
  { key: "netAdds",   label: "Gross Adds/Q",  startKey: "netAddsStart",   endKey: "netAddsEnd",   min: 5,   max: 55,  step: 0.5, fmt: v => `+${v.toFixed(1)}M`   },
  { key: "armGrowth", label: "ARM Growth",    startKey: "armGrowthStart", endKey: "armGrowthEnd", min: 0,   max: 8.0, step: 0.1, fmt: v => `${v.toFixed(1)}%/yr` },
  { key: "churn",     label: "Monthly Churn", startKey: "churnStart",     endKey: "churnEnd",     min: 1.0, max: 4.0, step: 0.1, fmt: v => `${v.toFixed(1)}%/mo` },
];

/* ══════════════════════════════════════════════════════════════
   TAB 1: SCENARIO FORECAST
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

      {/* Executive Deck sync, small secondary row */}
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
        <strong>Bear / Consensus / Bull</strong> are fixed research scenarios, named market views that cannot be edited.{" "}
        <strong>Custom</strong> uses fixed gross adds: adjust the sliders to test any driver combination. Sync the Executive Deck to Custom when you want the financial outlook to reflect your specific assumptions rather than a named case.
      </div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#7C3AED" }}>Custom Drivers</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Each driver ramps linearly from Start (Q1'26) to End (Q4'27)</div>
          </div>
          <button onClick={() => setCustomDrivers({ netAddsStart: 28.9, netAddsEnd: 31.1, armGrowthStart: 3.0, armGrowthEnd: 5.0, churnStart: 2.2, churnEnd: 1.9 })} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid #7C3AED", background: "transparent", color: "#7C3AED", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            Reset to Market Consensus
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {SLIDER_CONFIG.map(cfg => {
            const startVal = customDrivers[cfg.startKey];
            const endVal   = customDrivers[cfg.endKey];
            return (
              <div key={cfg.key}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 10 }}>{cfg.label}</div>
                <DualRangeSlider
                  min={cfg.min} max={cfg.max} step={cfg.step}
                  startVal={startVal} endVal={endVal}
                  fmt={cfg.fmt}
                  onStartChange={v => setCustomDrivers(prev => ({ ...prev, [cfg.startKey]: v }))}
                  onEndChange={v   => setCustomDrivers(prev => ({ ...prev, [cfg.endKey]:   v }))}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscriber mechanics, per-scenario selector within section */}
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
            ? "Custom uses fixed gross adds; churn reduces them to net adds, so higher churn directly lowers subscriber count and revenue."
            : "Bear/Consensus/Bull use fixed net add targets; churn determines gross adds needed (acquisition cost) but does not affect subscriber count or revenue directly."}
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
            padding: "5px 3px", textAlign: "center", fontSize: 10, fontWeight: 600,
            background: isHist ? "#F4F5F8" : "#EEF2FF",
            color: isHist ? C.tick : SC_COLORS[mechKey],
            borderBottom: `2px solid ${isHist ? C.grid : SC_COLORS[mechKey]}`,
            borderLeft: isFore === "first" ? `2px solid ${SC_COLORS[mechKey]}` : undefined,
          });

          return (
            <div>
              <table style={{ borderCollapse: "collapse", fontSize: 10, fontFamily: "'Outfit', sans-serif", width: "100%", tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "110px" }} />
                  {allCols.map(col => <col key={col.period} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th style={{ padding: "5px 8px", textAlign: "left", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.grid}`, fontSize: 10 }}>
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
                      <td style={{ padding: "5px 8px", fontWeight: 600, color: C.navy, fontSize: 10, whiteSpace: "nowrap" }}>
                        {row.label}
                      </td>
                      {allCols.map((col, ci) => (
                        <td key={col.period} style={{
                          padding: "5px 3px", textAlign: "center",
                          color: col.isHist ? C.muted : row.color,
                          fontWeight: col.isHist ? 400 : (row.key === "netAdds" || row.key === "revenue" ? 700 : 500),
                          borderLeft: !col.isHist && ci === histCols.length ? `2px solid ${SC_COLORS[mechKey]}` : undefined,
                          fontSize: 10,
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

      {/* Scenario Assumptions Rationale */}
      <div style={{ marginTop: 32, fontFamily: "'Outfit', sans-serif" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Scenario Driver Rationale</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            {
              label: "Bear",
              color: "#DC2626",
              bg: "#FEF2F2",
              border: "#FECACA",
              drivers: [
                { name: "Net Adds  2→4M/Q", points: ["Password-sharing tailwind exhausted; ad-tier fails to offset. Disney+/Max bundles and price fatigue suppress acquisition.", "International growth in MENA and SEA slower than expected; mobile-only tier uptake muted."] },
                { name: "ARM  0.5→1.5%/yr",  points: ["Price hike fatigue limits UCAN increases throughout the period. Ad-tier CPM monetization ramps slowly; programmatic inventory underpriced.", "EM mix dilution persists; no meaningful pricing cycle resumes before Q4'27."] },
                { name: "Churn  2.6→3.0%/mo", points: ["Escalating competition and price sensitivity drive elevated cancellations. Sports rights fail to build must-watch habit loops off-season.", "Ad-tier subscribers churn at higher rate than standard tier; price floor provides limited structural benefit."] },
              ],
            },
            {
              label: "Consensus",
              color: "#1D4ED8",
              bg: "#EFF6FF",
              border: "#BFDBFE",
              drivers: [
                { name: "Net Adds  7→9M/Q",   points: ["Mid-point of Wall Street consensus (Wells Fargo, JPMorgan, Goldman Sachs). Ad-tier and international growth (MENA, SEA, LatAm) are the primary acquisition engines.", "Sports content (NFL Christmas, WWE Raw) adds periodic spikes and reduces off-season churn."] },
                { name: "ARM  3.0→5.0%/yr",   points: ["Conservative start: EM mix dilutes blended ARM; no UCAN price hike expected until late 2026. Accelerates as ad-tier CPM matures.", "New UCAN pricing cycle in late 2026/early 2027 adds an estimated 1–2pp to ARM growth."] },
                { name: "Churn  2.2→1.9%/mo", points: ["Modest improvement as sports content builds weekly viewing habits (Antenna: churn 30–40% lower in live-sports months).", "Ad-tier price floor ($7.99/mo) reduces cancellations; subscribers downgrade rather than leave."] },
              ],
            },
            {
              label: "Bull",
              color: "#16A34A",
              bg: "#F0FDF4",
              border: "#BBF7D0",
              drivers: [
                { name: "Net Adds  8→14M/Q",  points: ["Ad-tier accelerates sign-ups to 40%+ mix by Q4'26. FIFA World Cup 2026 and expanded live sports drive broad international acquisition.", "Mobile-only tiers in India and SEA contribute 15–20M+ incremental members over the forecast."] },
                { name: "ARM  3.5→6.5%/yr",   points: ["Aggressive UCAN pricing cycle resumes in late 2026. Ad-tier CPM matures rapidly to $40+ by FY2027; standard/premium mix shift compounds.", "New UCAN hike cycle adds an estimated 1.5–2.5pp above the base ARM trajectory."] },
                { name: "Churn  2.1→1.5%/mo", points: ["Must-watch sports slate (NFL, WWE, FIFA) drives materially better retention. Deep content reduces off-season churn gaps.", "Ad-tier price floor creates structural floor; subscribers downgrade rather than cancel at higher rates than Consensus."] },
              ],
            },
          ].map(sc => (
            <div key={sc.label} style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: sc.color, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>{sc.label}</div>
              {sc.drivers.map(d => (
                <div key={d.name} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: sc.color, marginBottom: 5 }}>{d.name}</div>
                  <ul style={{ margin: 0, padding: "0 0 0 14px", listStyle: "disc" }}>
                    {d.points.map((pt, i) => (
                      <li key={i} style={{ fontSize: 11, color: "#374151", lineHeight: 1.55, marginBottom: 4 }}>{pt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: 10, color: C.muted }}>
          Sources: Netflix Q3–Q4 2025 Shareholder Letters · Wells Fargo / JPMorgan / Goldman Sachs equity research (Jan–Mar 2025) · eMarketer Streaming Ad Revenue Forecast 2024 · Antenna monthly churn data · Bloomberg Second Measure · Netflix Upfront 2024
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 2: SENSITIVITY ANALYSIS
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

  // Absolute test ranges: economically meaningful stress tests, not ±% of the rate
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

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: 28 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 16px" }}>
          Driver Sensitivity Tables
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr>
              {["Variation","Driver Value","FY2026E Rev ($B)","FY2027E Rev ($B)","vs Base ($B)","vs Base (%)"].map((h, i) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: i < 2 ? "left" : "center", background: "#F8F9FA", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.NF}`, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, di) => (
              <>
                <tr key={`header-${d.key}`}>
                  <td colSpan={6} style={{ padding: "8px 12px", fontWeight: 700, fontSize: 11, color: C.NF, background: "#FFF5F5", borderTop: di > 0 ? `2px solid ${C.grid}` : undefined, letterSpacing: 0.3 }}>
                    {d.label} Sensitivity
                  </td>
                </tr>
                {d.rows.map(row => {
                  const isBase        = !!row.isBase;
                  const effectiveBase = d.baseOverride ?? baseResult;
                  const res           = isBase ? effectiveBase : d.getFn(row.val);
                  const deltaB        = +(res.fy26 - effectiveBase.fy26).toFixed(3);
                  const deltaPct      = +((deltaB / effectiveBase.fy26) * 100).toFixed(2);
                  const rowBg         = isBase ? "#FFFBEB" : deltaB > 0 ? "#F0FDF4" : deltaB < 0 ? "#FEF2F2" : "#fff";
                  return (
                    <tr key={`${d.key}-${row.label}`} style={{ background: rowBg }}>
                      <td style={{ padding: "7px 12px", fontWeight: isBase ? 700 : 400, color: C.navy }}>{row.label}</td>
                      <td style={{ padding: "7px 12px", color: C.tick }}>{d.fmt(row.val)}</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", fontWeight: isBase ? 700 : 400, color: C.navy }}>${res.fy26.toFixed(2)}B</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: C.tick }}>${res.fy27.toFixed(2)}B</td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: isBase ? C.tick : deltaB > 0 ? "#16a34a" : "#dc2626", fontWeight: isBase ? 400 : 600 }}>
                        {isBase ? "—" : `${deltaB >= 0 ? "+" : ""}$${deltaB.toFixed(3)}B`}
                      </td>
                      <td style={{ padding: "7px 12px", textAlign: "center", color: isBase ? C.tick : deltaPct > 0 ? "#16a34a" : "#dc2626", fontWeight: isBase ? 400 : 600 }}>
                        {isBase ? "—" : `${deltaPct >= 0 ? "+" : ""}${deltaPct.toFixed(2)}%`}
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixRevenueForecast() {
  const consForecast = getForecast("consensus");
  const consFY26     = +getFY(consForecast, 2026).toFixed(1);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.navy, padding: "24px 40px", borderBottom: `3px solid ${C.NF}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: C.NF, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.NF }}>Revenue Forecast</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Netflix Revenue Forecast
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Driver-Based Model · Q1 2026–Q4 2027 · Starting from Q4 2025 Actuals ($12.05B / 332M members)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.grid}`, padding: "18px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            { label: "Starting Revenue",  value: "$12.05B",                   sub: "Q4 2025 actual",   trend: "Q4 2025" },
            { label: "Starting Members",  value: "332M",                      sub: "paid memberships", trend: "Q4 2025" },
            { label: "Starting ARM",      value: "$12.23/mo",                 sub: "global blended",   trend: "Q4 2025" },
            { label: "Consensus FY2026E", value: `$${consFY26.toFixed(1)}B`,  sub: "consensus scenario", trend: "FY2026" },
          ].map(card => (
            <div key={card.label} style={{ padding: "13px 16px", borderRadius: 10, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${C.NF}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.tick, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{card.value}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: C.tick }}>{card.sub}</span>
                <span style={{ fontSize: 11, color: C.tick }}>{card.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>

      {/* Content */}
      <div style={{ paddingBottom: 28 }}>
        <ScenarioTab />
        <SensitivityTab />
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: 14 }}>
        <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Source: Netflix shareholder letters Q1 2023–Q4 2025. Revenue model: Avg Paid Members × ARM ($/mo) × 3 months.
          Starting point: Q4 2025 actuals. Netflix stopped reporting paid members after Q1 2025; Q2–Q4 2025 are estimates.
          Forecasts are illustrative scenarios only, not financial guidance.
        </p>
      </div>

      </div>{/* end body */}
    </div>
  );
}
