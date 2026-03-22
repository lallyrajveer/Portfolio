import { useState } from "react";
import {
  HISTORICAL, START, SCENARIOS, QUARTERS,
  buildForecast, getForecast, getFY, SEASONAL_FACTORS,
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

function DualRangeSlider({ min, max, step, startVal, endVal, onStartChange, onEndChange, fmt, startFmt, lockStart = false }) {
  const pct      = v => ((v - min) / (max - min)) * 100;
  const pStart   = pct(startVal);
  const pEnd     = pct(endVal);
  const trackL   = Math.min(pStart, pEnd);
  const trackW   = Math.abs(pEnd - pStart);
  const declining = endVal < startVal;
  const arrow    = declining ? "↘" : endVal > startVal ? "↗" : "→";
  const arrowClr = declining ? "#DC2626" : "#16A34A";
  const zStart   = lockStart ? 1 : (startVal >= endVal ? 5 : 3);
  const zEnd     = lockStart ? 5 : (startVal >= endVal ? 3 : 5);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#6B7280" }}>
          {lockStart ? "Q4'25" : "Q1'26"} <strong style={{ color: lockStart ? "#9CA3AF" : "#7C3AED", fontSize: 11 }}>{lockStart && startFmt ? startFmt(startVal) : fmt(startVal)}</strong>
          {lockStart && <span style={{ marginLeft: 4, fontSize: 9, background: "#F3F4F6", color: "#6B7280", padding: "1px 5px", borderRadius: 4, border: "1px solid #E5E7EB" }}>Actual</span>}
        </span>
        <span style={{ fontSize: 12, color: arrowClr, fontWeight: 700 }}>{arrow}</span>
        <span style={{ fontSize: 10, color: "#6B7280" }}>Q4'27 <strong style={{ color: "#7C3AED", fontSize: 11 }}>{fmt(endVal)}</strong></span>
      </div>
      <div className="nf-dual-range">
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", height: 4, background: "#E5E7EB", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${trackL}%`, width: `${trackW}%`, height: 4, background: lockStart ? "#D1D5DB" : "#7C3AED", borderRadius: 2 }} />
        {lockStart && <div style={{ position: "absolute", top: "50%", left: `${pStart}%`, transform: "translate(-50%, -50%)", width: 10, height: 10, borderRadius: "50%", background: "rgba(0,0,0,0.18)", border: "1.5px solid rgba(0,0,0,0.12)", pointerEvents: "none", zIndex: 2 }} />}
        <input type="range" min={min} max={max} step={step} value={startVal}
          style={{ zIndex: zStart, pointerEvents: lockStart ? "none" : "auto", opacity: lockStart ? 0 : 1 }}
          onChange={e => !lockStart && onStartChange(parseFloat(e.target.value))} />
        <input type="range" min={min} max={max} step={step} value={endVal}
          style={{ zIndex: zEnd }}
          onChange={e => onEndChange(parseFloat(e.target.value))} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9CA3AF", marginTop: 3 }}>
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
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
  { key: "netAdds",   label: "Net Adds/Q",    startKey: "netAddsStart",   endKey: "netAddsEnd",   min: 0,   max: 15,  step: 0.5, fmt: v => `+${v.toFixed(1)}M` },
  { key: "armGrowth", label: "ARM ($/mo)",    startKey: "armStart",       endKey: "armEnd",       min: 12.0, max: 17.0, step: 0.1, fmt: v => `$${v.toFixed(2)}`, startFmt: () => `$${START.arm.toFixed(2)}` },
];

/* ══════════════════════════════════════════════════════════════
   TAB 1: SCENARIO FORECAST
   ══════════════════════════════════════════════════════════════ */
const SC_COLORS = { bear: "#DC2626", consensus: "#1D4ED8", bull: "#16A34A", custom: "#7C3AED" };
const SC_LABELS = { bear: "Bear",    consensus: "Consensus", bull: "Bull", custom: "Custom" };

function ScenarioTab() {
  const { scenario, setScenario, customDrivers, setCustomDrivers } = useNetflix();
  const [rationaleOpen, setRationaleOpen] = useState(false);

  const sf        = SEASONAL_FACTORS;
  const bear      = getForecast("bear",      sf);
  const consensus = getForecast("consensus", sf);
  const bull      = getForecast("bull",      sf);
  const cd = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const custom    = buildForecast(START.subs, START.arm, cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS, cd.netAddsEnd ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, sf);
  const allForecasts = { bear, consensus, bull, custom };

  const fy26 = { bear: +getFY(bear,2026).toFixed(1), consensus: +getFY(consensus,2026).toFixed(1), bull: +getFY(bull,2026).toFixed(1), custom: +getFY(custom,2026).toFixed(1) };
  const fy27 = { bear: +getFY(bear,2027).toFixed(1), consensus: +getFY(consensus,2027).toFixed(1), bull: +getFY(bull,2027).toFixed(1), custom: +getFY(custom,2027).toFixed(1) };

  const mechForecast = allForecasts[scenario];


  const customDriversDisplay = { ...customDrivers };

  return (
    <div>
      {/* Section heading */}
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.navy, margin: "0 0 16px", fontWeight: 600 }}>
        Scenario Assumptions &amp; Implied Revenue
      </h3>

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
                    <span>+{customDriversDisplay.netAddsStart.toFixed(1)}→{customDriversDisplay.netAddsEnd.toFixed(1)}M adds/Q</span>
                    <span>${customDriversDisplay.armStart.toFixed(2)}→${customDriversDisplay.armEnd.toFixed(2)} ARM/mo</span>
                  </>
                ) : (
                  <>
                    <span>+{SCENARIOS[key].netAddsStart.toFixed(1)}→{SCENARIOS[key].netAddsEnd.toFixed(1)}M adds/Q</span>
                    <span>${START.arm.toFixed(2)}→${(START.arm * Math.pow(1 + SCENARIOS[key].armGrowthEnd / 400, 8)).toFixed(2)} ARM/mo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scenario Driver Rationale — collapsible */}
      <div style={{ marginBottom: 12, fontFamily: "'Outfit', sans-serif" }}>
        <button onClick={() => setRationaleOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
          <span style={{ fontSize: 13, lineHeight: 1, transition: "transform 0.2s", display: "inline-block", transform: rationaleOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
          Scenario Driver Rationale
        </button>
        {rationaleOpen && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                {
                  label: "Bear",
                  color: "#DC2626",
                  bg: "#FEF2F2",
                  border: "#FECACA",
                  drivers: [
                    { name: "Net Adds  7→4M/Q", points: ["Starts at Q4'25 actuals; deteriorates as password-sharing tailwind exhausts and ad-tier fails to offset. Disney+/Max bundles and price fatigue suppress acquisition.", "International growth in MENA and SEA slower than expected; mobile-only tier uptake muted."] },
                    { name: "ARM  4.5→1.5%/yr",  points: ["Starts at Q4'25 trailing rate; decelerates as price hike fatigue limits UCAN increases. Ad-tier CPM monetization ramps slowly; programmatic inventory underpriced.", "EM mix dilution persists; no meaningful pricing cycle resumes before Q4'27."] },
                  ],
                },
                {
                  label: "Consensus",
                  color: "#1D4ED8",
                  bg: "#EFF6FF",
                  border: "#BFDBFE",
                  drivers: [
                    { name: "Net Adds  7→9M/Q",   points: ["Mid-point of Wall Street consensus (Wells Fargo, JPMorgan, Goldman Sachs). The +2M/Q ramp is sourced as follows: ~1M/Q from ad-tier acquisition growth (ad tier was 40% of new sign-ups in ad-available markets per Netflix Q4'24; scaling gross adds on a larger base adds ~1M/Q by FY2027); ~0.8M/Q from APAC/MENA mobile-tier expansion (APAC at <10% penetration in a 500M+ broadband-HH market); ~0.2M/Q residual from FIFA World Cup 2026 host-market spikes absorbed into the H2'26 ramp.", "Password-sharing tailwind is assumed exhausted by Q1'26. Sports content (NFL Christmas, WWE Raw) reduces off-season churn but is not credited as a net-adds driver."] },
                    { name: "ARM  4.5→5.0%/yr",   points: ["Conservative start: EM mix dilutes blended ARM; no UCAN price hike expected until late 2026. Accelerates as ad-tier CPM matures.", "New UCAN pricing cycle in late 2026/early 2027 adds an estimated 1–2pp to ARM growth."] },
                  ],
                },
                {
                  label: "Bull",
                  color: "#16A34A",
                  bg: "#F0FDF4",
                  border: "#BBF7D0",
                  drivers: [
                    { name: "Net Adds  7→14M/Q",  points: ["Ad-tier accelerates sign-ups to 40%+ mix by Q4'26. FIFA World Cup 2026 and expanded live sports drive broad international acquisition.", "Mobile-only tiers in India and SEA contribute 15–20M+ incremental members over the forecast."] },
                    { name: "ARM  4.5→6.5%/yr",   points: ["Aggressive UCAN pricing cycle resumes in late 2026. Ad-tier CPM matures rapidly to $40+ by FY2027; standard/premium mix shift compounds.", "New UCAN hike cycle adds an estimated 1.5–2.5pp above the base ARM trajectory."] },
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
              Sources: Netflix Q3–Q4 2025 Shareholder Letters · Wells Fargo / JPMorgan / Goldman Sachs equity research (Jan–Mar 2025) · eMarketer Streaming Ad Revenue Forecast 2024 · Bloomberg Second Measure · Netflix Upfront 2024
            </div>
            <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
              Seasonality: Net adds are adjusted by quarterly seasonal factors derived from FY2025 actuals (Q1 ×1.10 · Q2 ×1.30 · Q3 ×0.65 · Q4 ×0.95; sum = 4.00, preserving annual totals). Applied to all scenarios including Custom.
            </div>
          </div>
        )}
      </div>

      {/* Custom sliders */}
      <div style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: 7, padding: "10px 16px", marginBottom: 8, fontSize: 12, color: "#5B21B6", lineHeight: 1.6 }}>
        <strong>Bear / Consensus / Bull</strong> are fixed research scenarios, named market views that cannot be edited.{" "}
        <strong>Custom</strong> uses fixed net adds — the same model as the named scenarios: adjust the sliders to test any driver combination. Sync the Executive Deck to Custom when you want the financial outlook to reflect your specific assumptions rather than a named case.
      </div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#7C3AED" }}>Custom Drivers</div>
          </div>
          <button onClick={() => setCustomDrivers(prev => ({ ...prev, netAddsEnd: 9.0, armEnd: 13.51, churnEnd: 1.9 }))} style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid #7C3AED", background: "transparent", color: "#7C3AED", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            Reset to Consensus
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {SLIDER_CONFIG.map(cfg => {
            const startVal = customDrivers[cfg.startKey];
            const endVal   = customDrivers[cfg.endKey];
            return (
              <div key={cfg.key}>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 10 }}>{cfg.label}</div>
                <DualRangeSlider
                  min={cfg.min} max={cfg.max} step={cfg.step}
                  startVal={startVal} endVal={endVal}
                  fmt={cfg.fmt} startFmt={cfg.startFmt}
                  lockStart
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: 0 }}>
            Membership & Revenue Bridge
          </h4>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {["bear","consensus","bull","custom"].map(key => {
              const active = scenario === key;
              return (
                <button key={key} onClick={() => setScenario(key)} style={{
                  padding: "3px 12px", borderRadius: 20,
                  border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
                  background: active ? SC_COLORS[key] : "#fff",
                  color: active ? "#fff" : C.tick,
                  fontSize: 11, cursor: "pointer", fontWeight: active ? 700 : 400, transition: "all 0.15s",
                }}>{SC_LABELS[key]}</button>
              );
            })}
            <span style={{ fontSize: 11, color: "#16a34a", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0" }}>⟳ Live</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 14px" }}>
          {"Revenue = Avg Subs × ARM × 3 / 1000 ($B)."}
        </p>
        {(() => {
          // Build historical columns
          const histCols = HISTORICAL.map((h, i) => {
            const beginSubs = +(i === 0 ? h.subs - h.netAdds : HISTORICAL[i - 1].subs).toFixed(1);
            return { period: h.period, isHist: true, beginSubs, netAdds: h.netAdds, endSubs: h.subs, arm: h.arm, revenue: h.rev };
          });
          const foreCols = mechForecast.map(r => ({ ...r, isHist: false }));
          const allCols  = [...histCols, ...foreCols];

          const metricRows = [
            { label: "Begin Subs (M)", key: "beginSubs", fmt: v => v.toFixed(1),                                    color: C.tick              },
            { label: "Net Adds (M)",   key: "netAdds",   fmt: v => v >= 0 ? `+${v.toFixed(1)}` : v.toFixed(1),     color: SC_COLORS[scenario]  },
            { label: "End Subs (M)",   key: "endSubs",   fmt: v => v.toFixed(1),                                    color: C.navy              },
            { label: "ARM ($/mo)",     key: "arm",       fmt: v => `$${v.toFixed(2)}`,                              color: SC_COLORS[scenario]  },
            { label: "Qtrly Rev ($B)", key: "revenue",   fmt: v => `$${v.toFixed(1)}B`,                             color: C.navy              },
          ];

          const thStyle = (isHist, isFore) => ({
            padding: "5px 3px", textAlign: "center", fontSize: 10, fontWeight: 600,
            background: isHist ? "#F4F5F8" : "#EEF2FF",
            color: isHist ? C.tick : SC_COLORS[scenario],
            borderBottom: `2px solid ${isHist ? C.grid : SC_COLORS[scenario]}`,
            borderLeft: isFore === "first" ? `2px solid ${SC_COLORS[scenario]}` : undefined,
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
                          borderLeft: !col.isHist && ci === histCols.length ? `2px solid ${SC_COLORS[scenario]}` : undefined,
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
          Net adds seasonally adjusted (Q1 ×1.10 · Q2 ×1.30 · Q3 ×0.65 · Q4 ×0.95); ARM compounds quarterly. Revenue = Avg Subs × ARM × 3 / 1000 ($B).
        </p>
      </div>

    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   TAB 2: SENSITIVITY ANALYSIS
   ══════════════════════════════════════════════════════════════ */
function SensitivityTab() {
  const sc = SCENARIOS.consensus;

  const toRev = fc => ({ fy26: +getFY(fc, 2026).toFixed(3), fy27: +getFY(fc, 2027).toFixed(3) });

  // Full Consensus ramp forecast — used as base for all three sensitivity tables
  const consForecast = buildForecast(START.subs, START.arm,
    sc.netAddsStart, sc.armGrowthStart, sc.churnStart, QUARTERS,
    sc.netAddsEnd,   sc.armGrowthEnd,   sc.churnEnd, false, SEASONAL_FACTORS);

  // ── Net Adds ──────────────────────────────────────────────────────────
  // Flat val applied each quarter; ARM + Churn held on Consensus ramp
  const getNetAddsSens = val => {
    const fc = buildForecast(START.subs, START.arm,
      val, sc.armGrowthStart, sc.churnStart, QUARTERS,
      val, sc.armGrowthEnd,   sc.churnEnd, false, SEASONAL_FACTORS);
    const drv = (val * 4).toFixed(1) + "M/yr";
    return { ...toRev(fc), drv26: drv, drv27: drv };
  };
  const baseNetAdds = {
    ...toRev(consForecast),
    drv26: consForecast.slice(0, 4).reduce((s, q) => s + q.netAdds, 0).toFixed(1) + "M/yr",
    drv27: consForecast.slice(4, 8).reduce((s, q) => s + q.netAdds, 0).toFixed(1) + "M/yr",
  };

  // ── ARM Growth ────────────────────────────────────────────────────────
  // Flat armGrowth% applied; Net Adds + Churn held on Consensus ramp
  const getArmSens = val => {
    const fc = buildForecast(START.subs, START.arm,
      sc.netAddsStart, val, sc.churnStart, QUARTERS,
      sc.netAddsEnd,   val, sc.churnEnd, false, SEASONAL_FACTORS);
    const avg26 = (fc.slice(0,4).reduce((s,q) => s + q.arm, 0) / 4).toFixed(2);
    const avg27 = (fc.slice(4,8).reduce((s,q) => s + q.arm, 0) / 4).toFixed(2);
    return { ...toRev(fc), drv26: "$" + avg26 + "/mo", drv27: "$" + avg27 + "/mo" };
  };
  const baseArm = {
    ...toRev(consForecast),
    drv26: "$" + (consForecast.slice(0,4).reduce((s,q) => s + q.arm, 0) / 4).toFixed(2) + "/mo",
    drv27: "$" + (consForecast.slice(4,8).reduce((s,q) => s + q.arm, 0) / 4).toFixed(2) + "/mo",
  };

  const drivers = [
    {
      label: "Net Adds", key: "netAdds", baseRes: baseNetAdds,
      rows: [{ val: 2.0 }, { val: 4.0 }, { isBase: true }, { val: 12.0 }, { val: 14.0 }],
      getFn: getNetAddsSens,
    },
    {
      label: "ARM", key: "armGrowth", baseRes: baseArm,
      rows: [{ val: 0.0 }, { val: 1.5 }, { isBase: true }, { val: 4.5 }, { val: 6.0 }],
      getFn: getArmSens,
    },
  ];

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginTop: 28 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: C.navy, margin: "0 0 16px" }}>
          Driver Sensitivity Tables
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
            <col style={{ width: "12.5%" }} />
          </colgroup>
          <thead>
            <tr>
              <th colSpan={4} style={{ padding: "6px 12px", textAlign: "center", background: "#EFF6FF", color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.NF}`, borderRight: `2px solid ${C.grid}`, fontSize: 11 }}>FY 2026</th>
              <th colSpan={4} style={{ padding: "6px 12px", textAlign: "center", background: "#F0FDF4", color: C.navy, fontWeight: 700, borderBottom: `2px solid ${C.NF}`, fontSize: 11 }}>FY 2027</th>
            </tr>
            <tr>
              {[
                { h: "2026 Driver",       left: true,  bg: "#EFF6FF" },
                { h: "FY2026E Rev ($B)",  left: false, bg: "#EFF6FF" },
                { h: "vs '26 Base ($B)",  left: false, bg: "#EFF6FF" },
                { h: "vs '26 Base (%)",   left: false, bg: "#EFF6FF", border: true },
                { h: "2027 Driver",       left: true,  bg: "#F0FDF4" },
                { h: "FY2027E Rev ($B)",  left: false, bg: "#F0FDF4" },
                { h: "vs '27 Base ($B)",  left: false, bg: "#F0FDF4" },
                { h: "vs '27 Base (%)",   left: false, bg: "#F0FDF4" },
              ].map(({ h, left, bg, border }) => (
                <th key={h} style={{ padding: "7px 10px", textAlign: left ? "left" : "center", background: bg, color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.NF}`, borderRight: border ? `2px solid ${C.grid}` : undefined, whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((d, di) => (
              <>
                <tr key={`header-${d.key}`}>
                  <td colSpan={8} style={{ padding: "8px 12px", background: "#FFF5F5", borderTop: di > 0 ? `2px solid ${C.grid}` : undefined }}>
                    <span style={{ fontWeight: 700, fontSize: 11, color: C.NF, letterSpacing: 0.3 }}>{d.label} Sensitivity</span>
                    {d.key === "netAdds" && (
                      <span style={{ marginLeft: 10, fontSize: 10, color: C.tick, fontWeight: 400 }}>
                        Annual totals shown · ÷4 = per-quarter rate &nbsp;(e.g. 8M/yr = 2M/Q · Consensus ramp: 7→9M/Q)
                      </span>
                    )}
                  </td>
                </tr>
                {d.rows.map((row, ri) => {
                  const isBase    = !!row.isBase;
                  const res       = isBase ? d.baseRes : d.getFn(row.val);
                  const db26      = +(res.fy26 - d.baseRes.fy26).toFixed(3);
                  const dp26      = +((db26 / d.baseRes.fy26) * 100).toFixed(2);
                  const db27      = +(res.fy27 - d.baseRes.fy27).toFixed(3);
                  const dp27      = +((db27 / d.baseRes.fy27) * 100).toFixed(2);
                  const rowBg     = isBase ? "#FFFBEB" : (db26 + db27) > 0 ? "#F0FDF4" : (db26 + db27) < 0 ? "#FEF2F2" : "#fff";
                  const clr26     = isBase ? C.tick : db26 > 0 ? "#16a34a" : "#dc2626";
                  const clr27     = isBase ? C.tick : db27 > 0 ? "#16a34a" : "#dc2626";
                  return (
                    <tr key={`${d.key}-${ri}`} style={{ background: rowBg }}>
                      <td style={{ padding: "7px 10px", fontWeight: isBase ? 700 : 400, color: isBase ? C.navy : C.tick }}>{res.drv26}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: isBase ? 700 : 400, color: C.navy }}>${res.fy26.toFixed(1)}B</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: clr26, fontWeight: isBase ? 400 : 600 }}>
                        {isBase ? "—" : `${db26 >= 0 ? "+" : ""}$${db26.toFixed(1)}B`}
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: clr26, fontWeight: isBase ? 400 : 600, borderRight: `2px solid ${C.grid}` }}>
                        {isBase ? "—" : `${dp26 >= 0 ? "+" : ""}${dp26.toFixed(2)}%`}
                      </td>
                      <td style={{ padding: "7px 10px", color: C.tick }}>{res.drv27}</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: C.tick }}>${res.fy27.toFixed(1)}B</td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: clr27, fontWeight: isBase ? 400 : 600 }}>
                        {isBase ? "—" : `${db27 >= 0 ? "+" : ""}$${db27.toFixed(1)}B`}
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "center", color: clr27, fontWeight: isBase ? 400 : 600 }}>
                        {isBase ? "—" : `${dp27 >= 0 ? "+" : ""}${dp27.toFixed(2)}%`}
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
            Driver-Based Model · Q1 2026–Q4 2027 · Starting from Q4 2025 Actuals ($12.1B / 332M members)
          </p>
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
