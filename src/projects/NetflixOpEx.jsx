import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import {
  START, QUARTERS, SEASONAL_FACTORS,
  buildForecast, getForecast, getFY,
} from "./NetflixShared.js";
import { useNetflix } from "./NetflixContext.js";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  navy:  "#0A1628",
  NF:    "#E50914",
  bg:    "#F4F5F8",
  grid:  "#E5E7EB",
  tick:  "#6B7280",
  muted: "#9BA3B8",
};

const SC_COLORS = {
  bear:      "#DC2626",
  consensus: "#1D4ED8",
  bull:      "#16A34A",
  custom:    "#7C3AED",
};

const SC_LABELS = { bear: "Bear", consensus: "Consensus", bull: "Bull", custom: "Custom" };

const COST_LINES = [
  { label: "Cost of Revenue",            key: "cor",  color: "#3B82F6" },
  { label: "Technology & Development",   key: "tnd",  color: "#8B5CF6" },
  { label: "Marketing",                  key: "mktg", color: "#F59E0B" },
  { label: "General & Administrative",   key: "ga",   color: "#6B7280" },
];

/* ── Historical OpEx (Netflix 10-K FY2023–FY2024; FY2025 estimated) ── */
// Revenue consistent with quarterly model (sum of reported/estimated quarterly actuals).
// Cost line % splits derived from disclosed annual cost structure; FY2025 estimated
// from Q4'25 actuals and Netflix's guided ~29% operating margin.
const OPEX_HIST = [
  { label: "FY2023A", isForecast: false, rev: 33.7, cor: 19.4, tnd: 2.7, mktg: 2.7, ga: 2.0 },
  { label: "FY2024A", isForecast: false, rev: 39.0, cor: 19.9, tnd: 3.1, mktg: 2.8, ga: 2.8 },
  { label: "FY2025A", isForecast: false, rev: 45.2, cor: 23.3, tnd: 3.4, mktg: 2.9, ga: 2.5 },
];

/* ── Forecast margin & cost-split assumptions by scenario ──── */
// Operating margin varies by scenario; Cost of Revenue absorbs the swing
// (content leverage differs by subscriber growth trajectory).
// T&D, Marketing, and G&A are relatively fixed as % of revenue.
export const OPEX_FORE = {
  bear: {
    fy26: { margin: 0.285, corPct: 0.510, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.065 },
    fy27: { margin: 0.295, corPct: 0.500, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.065 },
  },
  consensus: {
    fy26: { margin: 0.310, corPct: 0.490, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.060 },
    fy27: { margin: 0.330, corPct: 0.470, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.060 },
  },
  bull: {
    fy26: { margin: 0.340, corPct: 0.460, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.060 },
    fy27: { margin: 0.365, corPct: 0.435, tndPct: 0.075, mktgPct: 0.065, gaPct: 0.060 },
  },
};

function computeForeOpEx(rev, a) {
  return {
    cor:  +(rev * a.corPct).toFixed(1),
    tnd:  +(rev * a.tndPct).toFixed(1),
    mktg: +(rev * a.mktgPct).toFixed(1),
    ga:   +(rev * a.gaPct).toFixed(1),
  };
}

function enrich(r) {
  const total  = +(r.cor + r.tnd + r.mktg + r.ga).toFixed(1);
  const opInc  = +(r.rev - total).toFixed(1);
  const opMgn  = +(opInc / r.rev * 100).toFixed(1);
  return { ...r, total, opInc, opMgn };
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixOpEx() {
  const { scenario, setScenario, customDrivers } = useNetflix();
  const [methOpen, setMethOpen] = useState(false);
  const scKey = ["bear", "consensus", "bull"].includes(scenario) ? scenario : "consensus";
  const col   = SC_COLORS[scenario] ?? SC_COLORS.consensus;

  /* Forecast revenues from existing model */
  const sf  = SEASONAL_FACTORS;
  const cd  = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecastQtr = scenario === "custom"
    ? buildForecast(
        START.subs, START.arm,
        cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS,
        cd.netAddsEnd   ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, sf)
    : getForecast(scenario, sf);

  const foreRev26 = +getFY(forecastQtr, 2026).toFixed(1);
  const foreRev27 = +getFY(forecastQtr, 2027).toFixed(1);

  /* Custom scenario uses Consensus margin assumptions with its own revenue */
  const assump = OPEX_FORE[scKey];
  const fore26 = computeForeOpEx(foreRev26, assump.fy26);
  const fore27 = computeForeOpEx(foreRev27, assump.fy27);

  const years = [
    ...OPEX_HIST,
    { label: "FY2026E", isForecast: true, rev: foreRev26, ...fore26 },
    { label: "FY2027E", isForecast: true, rev: foreRev27, ...fore27 },
  ].map(enrich);

  /* ── Table helpers ────────────────────────────────────────── */
  const thStyle = isFore => ({
    padding: "7px 10px", textAlign: "center",
    background: isFore ? "#EEF2FF" : "#F4F5F8",
    color: isFore ? col : C.navy,
    fontWeight: 600,
    borderBottom: `2px solid ${isFore ? col : C.grid}`,
    fontSize: 11,
  });

  const tdStyle = (isFore, bold) => ({
    padding: "7px 10px", textAlign: "center",
    fontWeight: bold ? 700 : 400,
    color: bold && isFore ? col : bold ? C.navy : C.tick,
    borderLeft: isFore === "first" ? `2px solid ${col}` : undefined,
  });

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: C.navy, padding: "24px 40px", borderBottom: `3px solid ${C.NF}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: C.NF, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.NF }}>Operating Expenses</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Netflix Cost Structure & Operating Margin
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            FY2023A–FY2027E · Operating Leverage Analysis · Linked to Revenue Forecast Model
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>

        {/* Scenario selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>Scenario:</span>
          {["bear", "consensus", "bull", "custom"].map(key => {
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

        {/* Methodology note — collapsible */}
        <div style={{ marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
          <button onClick={() => setMethOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span style={{ fontSize: 13, lineHeight: 1, display: "inline-block", transition: "transform 0.2s", transform: methOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
            How This Model Works — {methOpen ? "Collapse" : "Expand"}
          </button>
          {methOpen && (
            <div style={{ marginTop: 10, background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontSize: 12, color: C.tick, lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.navy }}>Top-Down Margin Approach</p>
              <p style={{ margin: "0 0 8px" }}>
                This model forecasts OpEx using a top-down method: revenue comes from the Netflix Revenue Forecast model (net adds × ARM), and operating margin is assumed per scenario. Each cost line is then back-calculated as a percentage of that revenue — it does not build costs from unit economics.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong style={{ color: C.navy }}>What drives the difference between scenarios</strong> — Cost of Revenue (content amortization + delivery) absorbs most of the margin swing, reflecting that content leverage differs by subscriber growth trajectory. Technology & Development, Marketing, and G&A are held at relatively stable percentages across scenarios, consistent with their historically low sensitivity to revenue growth.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong style={{ color: C.navy }}>Limitation</strong> — A bottoms-up OpEx model would forecast content spend from slate commitments, headcount costs for T&D and G&A, and CPM yield for marketing efficiency. Those inputs are not publicly disclosed. The margin assumptions used here are grounded in Netflix's public guidance (~29% for FY2025) and sell-side consensus for FY2026–27.
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>
                Sources: Netflix FY2023–FY2024 10-K · Netflix Q4 2025 Shareholder Letter (FY2025 margin guidance) · Wells Fargo / JPMorgan / Goldman Sachs equity research (Jan–Mar 2025)
              </p>
            </div>
          )}
        </div>

        {/* Cost Structure Table */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24, overflowX: "auto" }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: "0 0 16px" }}>
            Annual Cost Structure & Operating Margin
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, fontFamily: "'Outfit', sans-serif", minWidth: 620 }}>
            <thead>
              <tr>
                <th style={{ padding: "7px 10px", textAlign: "left", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.grid}`, fontSize: 11, width: 200 }}>
                  Line Item
                </th>
                {years.map(y => (
                  <th key={y.label} style={{ ...thStyle(y.isForecast), borderLeft: y.label === "FY2026E" ? `2px solid ${col}` : undefined }}>
                    {y.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr style={{ background: "#F8FAFC" }}>
                <td style={{ padding: "7px 10px", fontWeight: 700, color: C.navy }}>Revenue ($B)</td>
                {years.map(y => (
                  <td key={y.label} style={tdStyle(y.label === "FY2026E" ? "first" : y.isForecast, true)}>
                    ${y.rev.toFixed(1)}B
                  </td>
                ))}
              </tr>

              {/* Cost lines */}
              {COST_LINES.map(row => (
                <tr key={row.key}>
                  <td style={{ padding: "7px 10px", color: C.tick, paddingLeft: 20 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: row.color, marginRight: 6, verticalAlign: "middle" }} />
                    {row.label}
                  </td>
                  {years.map(y => (
                    <td key={y.label} style={tdStyle(y.label === "FY2026E" ? "first" : y.isForecast, false)}>
                      ${y[row.key].toFixed(1)}B
                      <span style={{ color: C.muted, marginLeft: 3 }}>({(y[row.key] / y.rev * 100).toFixed(1)}%)</span>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total OpEx */}
              <tr style={{ background: "#F8FAFC", borderTop: `1px solid ${C.grid}` }}>
                <td style={{ padding: "7px 10px", fontWeight: 600, color: C.navy }}>Total Operating Costs ($B)</td>
                {years.map(y => (
                  <td key={y.label} style={tdStyle(y.label === "FY2026E" ? "first" : y.isForecast, true)}>
                    ${y.total.toFixed(1)}B
                  </td>
                ))}
              </tr>

              {/* Operating Income */}
              <tr style={{ borderTop: `2px solid ${C.grid}` }}>
                <td style={{ padding: "7px 10px", fontWeight: 700, color: C.navy }}>Operating Income ($B)</td>
                {years.map(y => (
                  <td key={y.label} style={tdStyle(y.label === "FY2026E" ? "first" : y.isForecast, true)}>
                    ${y.opInc.toFixed(1)}B
                  </td>
                ))}
              </tr>

              {/* Operating Margin */}
              <tr style={{ background: "#F8FAFC" }}>
                <td style={{ padding: "7px 10px", fontWeight: 700, color: C.navy }}>Operating Margin (%)</td>
                {years.map(y => (
                  <td key={y.label} style={{ ...tdStyle(y.label === "FY2026E" ? "first" : y.isForecast, true), background: y.isForecast ? `${col}12` : undefined }}>
                    {y.opMgn.toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: "0 0 4px" }}>
            Revenue, Operating Income & Margin Trend
          </h3>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 16px" }}>
            Bars show revenue (light) and operating income (coloured); line shows operating margin % (right axis)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={years} margin={{ top: 10, right: 60, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.tick, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tickFormatter={v => `$${v}B`} tick={{ fontSize: 11, fill: C.tick, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} width={52} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 11, fill: C.tick, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} width={44} domain={[0, 50]} />
              <Tooltip
                contentStyle={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }}
                formatter={(v, name) => name === "Op Margin %" ? [`${v.toFixed(1)}%`, name] : [`$${v.toFixed(1)}B`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "'Outfit', sans-serif" }} />
              <Bar yAxisId="left" dataKey="rev" name="Revenue" radius={[3, 3, 0, 0]}>
                {years.map((y, i) => <Cell key={i} fill={y.isForecast ? `${col}22` : "#E5E7EB"} />)}
              </Bar>
              <Bar yAxisId="left" dataKey="opInc" name="Operating Income" radius={[3, 3, 0, 0]}>
                {years.map((y, i) => <Cell key={i} fill={y.isForecast ? col : "#94A3B8"} />)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="opMgn" name="Op Margin %" stroke={C.navy} strokeWidth={2} dot={{ r: 4, fill: C.navy }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: 14 }}>
          <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Historical: Netflix 10-K filings FY2023–FY2024. FY2025A estimated from reported Q4'25 actuals and Netflix's guided ~29% operating margin for FY2025. Cost line item % splits are derived from disclosed annual cost structure; individual line items are estimates.
          </p>
          <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0", lineHeight: 1.6 }}>
            Forecast margin assumptions — Bear {(OPEX_FORE.bear.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.bear.fy27.margin * 100).toFixed(1)}%, Consensus {(OPEX_FORE.consensus.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.consensus.fy27.margin * 100).toFixed(1)}%, Bull {(OPEX_FORE.bull.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.bull.fy27.margin * 100).toFixed(1)}%. Revenue sourced from the Netflix Revenue Forecast model. Custom scenario applies Consensus margin assumptions to Custom revenue.
          </p>
        </div>

      </div>
    </div>
  );
}
