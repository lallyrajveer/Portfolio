import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import {
  START, QUARTERS, SEASONAL_FACTORS, HISTORICAL,
  buildForecast, getForecast,
} from "./NetflixShared.js";
import { useNetflix } from "./NetflixContext.js";

/* ── Dual-handle range slider (mirrored from Revenue Forecast) ── */
const DUAL_SLIDER_CSS = `
  .nf-opex-range { position: relative; height: 20px; }
  .nf-opex-range input[type=range] {
    position: absolute; width: 100%; top: 50%; margin: 0;
    height: 0; background: transparent; appearance: none; -webkit-appearance: none;
    pointer-events: none;
  }
  .nf-opex-range input[type=range]::-webkit-slider-thumb {
    appearance: none; -webkit-appearance: none; pointer-events: all; cursor: grab;
    width: 15px; height: 15px; border-radius: 50%;
    background: #7C3AED; border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(124,58,237,0.35);
  }
  .nf-opex-range input[type=range]:active::-webkit-slider-thumb { cursor: grabbing; }
  .nf-opex-range input[type=range]::-moz-range-thumb {
    pointer-events: all; cursor: grab;
    width: 15px; height: 15px; border-radius: 50%;
    background: #7C3AED; border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(124,58,237,0.35);
  }
`;
if (typeof document !== "undefined" && !document.getElementById("nf-opex-range-style")) {
  const s = document.createElement("style");
  s.id = "nf-opex-range-style";
  s.textContent = DUAL_SLIDER_CSS;
  document.head.appendChild(s);
}

function OpExSlider({ min, max, step, startVal, endVal, onEndChange, fmt }) {
  const pct    = v => ((v - min) / (max - min)) * 100;
  const pStart = pct(startVal);
  const pEnd   = pct(endVal);
  const trackL = Math.min(pStart, pEnd);
  const trackW = Math.abs(pEnd - pStart);
  const arrow  = endVal > startVal ? "↗" : endVal < startVal ? "↘" : "→";
  const arrowC = endVal > startVal ? "#16A34A" : endVal < startVal ? "#DC2626" : "#6B7280";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "#6B7280" }}>
          Q4'25 <strong style={{ color: "#9CA3AF", fontSize: 11 }}>{fmt(startVal)}</strong>
          <span style={{ marginLeft: 4, fontSize: 9, background: "#F3F4F6", color: "#6B7280", padding: "1px 5px", borderRadius: 4, border: "1px solid #E5E7EB" }}>Actual</span>
        </span>
        <span style={{ fontSize: 12, color: arrowC, fontWeight: 700 }}>{arrow}</span>
        <span style={{ fontSize: 10, color: "#6B7280" }}>Q4'27 <strong style={{ color: "#7C3AED", fontSize: 11 }}>{fmt(endVal)}</strong></span>
      </div>
      <div className="nf-opex-range">
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", width: "100%", height: 4, background: "#E5E7EB", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: `${trackL}%`, width: `${trackW}%`, height: 4, background: "#D1D5DB", borderRadius: 2 }} />
        <div style={{ position: "absolute", top: "50%", left: `${pStart}%`, transform: "translate(-50%, -50%)", width: 10, height: 10, borderRadius: "50%", background: "rgba(0,0,0,0.18)", border: "1.5px solid rgba(0,0,0,0.12)", pointerEvents: "none", zIndex: 2 }} />
        {/* locked start handle — invisible range input, just positions the dot */}
        <input type="range" min={min} max={max} step={step} value={startVal}
          style={{ zIndex: 1, pointerEvents: "none", opacity: 0 }} readOnly />
        <input type="range" min={min} max={max} step={step} value={endVal}
          style={{ zIndex: 5 }}
          onChange={e => onEndChange(parseFloat(e.target.value))} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#9CA3AF", marginTop: 3 }}>
        <span>{fmt(min)}</span><span>{fmt(max)}</span>
      </div>
    </div>
  );
}

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
  bear:      "#EA580C",
  consensus: "#DC2626",
  bull:      "#16A34A",
  custom:    "#7C3AED",
};

const SC_LABELS = { bear: "Bear", consensus: "Consensus", bull: "Bull", custom: "Custom" };

const COST_LINES = [
  { label: "Cost of Revenue",          shortLabel: "Cost of Rev",  key: "cor",  color: "#3B82F6" },
  { label: "Technology & Development", shortLabel: "Tech & Dev",   key: "tnd",  color: "#8B5CF6" },
  { label: "Marketing",                shortLabel: "Marketing",    key: "mktg", color: "#F59E0B" },
  { label: "General & Administrative", shortLabel: "G&A",          key: "ga",   color: "#6B7280" },
];

/* ── Historical annual cost % by year (derived from Netflix 10-K) ─── */
// Applied uniformly to each quarter within the year (consistent with top-down method).
// FY2025 estimated from Q4'25 actuals and Netflix's guided ~29% operating margin.
export const HIST_YR = [
  // FY2023 (10-K): cor 19.4 / tnd 2.7 / mktg 2.7 / ga 2.0 / rev 33.7 / netInc 5.4
  { corPct: 0.5757, tndPct: 0.0801, mktgPct: 0.0801, gaPct: 0.0594, netMgnPct: 0.1602 },
  // FY2024 (10-K): cor 19.9 / tnd 3.1 / mktg 2.8 / ga 2.8 / rev 39.0 / netInc 8.7
  { corPct: 0.5103, tndPct: 0.0795, mktgPct: 0.0718, gaPct: 0.0718, netMgnPct: 0.2231 },
  // FY2025 (est):  cor 23.3 / tnd 3.4 / mktg 2.9 / ga 2.5 / rev 45.2 / netInc 10.5
  { corPct: 0.5155, tndPct: 0.0752, mktgPct: 0.0642, gaPct: 0.0553, netMgnPct: 0.2323 },
];

/* ── Below-the-line assumptions for net income ─────────────── */
export const NI_FORE = {
  netIntExp: 0.4,   // annual net interest expense ($B); quarterly = 0.1B
  taxRate: { bear: 0.18, consensus: 0.16, bull: 0.15 },
};

/* ── Forecast margin & cost-split assumptions by scenario ──── */
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

/* ── Fixed Y-axis domain for the chart ──────────────────────── */
// Computed once across all standard scenarios so the scale never shifts
// when the user switches Bear / Consensus / Bull / Custom.
const _allRevs = [
  ...HISTORICAL.map(h => h.rev),
  ...["bear", "consensus", "bull"].flatMap(sc =>
    getForecast(sc, SEASONAL_FACTORS).map(q => q.revenue)
  ),
];
const QTR_REV_DOMAIN = [0, Math.ceil(Math.max(..._allRevs) * 1.1)];

function enrich(r, qtrNetIntExp, taxRate) {
  const total  = +(r.cor + r.tnd + r.mktg + r.ga).toFixed(2);
  const opInc  = +(r.rev - total).toFixed(2);
  const opMgn  = +(opInc / r.rev * 100).toFixed(1);
  // Historical: back-out net income from annual net margin applied to quarterly rev.
  // Forecast: compute from op income minus quarterly interest expense, after tax.
  const netInc = r.netMgnPct != null
    ? +(r.rev * r.netMgnPct).toFixed(2)
    : +((opInc - qtrNetIntExp) * (1 - taxRate)).toFixed(2);
  const netMgn = +(netInc / r.rev * 100).toFixed(1);
  return { ...r, total, opInc, opMgn, netInc, netMgn };
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixOpEx() {
  const { scenario, setScenario, customDrivers, customOpEx, setCustomOpEx } = useNetflix();
  const [methOpen, setMethOpen] = useState(false);
  const isCustom = scenario === "custom";
  const scKey    = isCustom ? "consensus" : scenario;
  const col      = SC_COLORS[scenario] ?? SC_COLORS.consensus;

  /* ── Historical quarterly rows ──────────────────────────── */
  const histRows = HISTORICAL.map((q, i) => {
    const yr = HIST_YR[Math.floor(i / 4)];
    const rev = q.rev;
    return {
      label: q.period, isForecast: false, rev,
      cor:  +(rev * yr.corPct).toFixed(2),
      tnd:  +(rev * yr.tndPct).toFixed(2),
      mktg: +(rev * yr.mktgPct).toFixed(2),
      ga:   +(rev * yr.gaPct).toFixed(2),
      netMgnPct: yr.netMgnPct,
    };
  });

  /* ── Forecast quarterly rows ────────────────────────────── */
  const sf  = SEASONAL_FACTORS;
  const cd  = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecastQtr = isCustom
    ? buildForecast(
        START.subs, START.arm,
        cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS,
        cd.netAddsEnd   ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, sf)
    : getForecast(scenario, sf);

  // Custom OpEx: user-set margins; T&D / Marketing / G&A fixed at Consensus %; COR absorbs swing
  const FIXED        = OPEX_FORE.consensus;
  const DEFAULT_OPEX = { mgn27: FIXED.fy27.margin };
  const Q4_25_MGN    = 0.290;  // Q4'25 actual operating margin — locked anchor
  const cmgn27  = customOpEx?.mgn27 ?? FIXED.fy27.margin;
  const cmgn26  = +((Q4_25_MGN + cmgn27) / 2).toFixed(4);  // linear interpolation
  const customAssump = {
    fy26: { margin: cmgn26, tndPct: FIXED.fy26.tndPct, mktgPct: FIXED.fy26.mktgPct, gaPct: FIXED.fy26.gaPct, corPct: +(1 - cmgn26 - FIXED.fy26.tndPct - FIXED.fy26.mktgPct - FIXED.fy26.gaPct).toFixed(4) },
    fy27: { margin: cmgn27, tndPct: FIXED.fy27.tndPct, mktgPct: FIXED.fy27.mktgPct, gaPct: FIXED.fy27.gaPct, corPct: +(1 - cmgn27 - FIXED.fy27.tndPct - FIXED.fy27.mktgPct - FIXED.fy27.gaPct).toFixed(4) },
  };
  const assump  = isCustom ? customAssump : OPEX_FORE[scKey];
  const qtrNIE  = NI_FORE.netIntExp / 4;
  const taxRate = NI_FORE.taxRate[scKey] ?? 0.16;

  const foreRows = forecastQtr.map((q, i) => {
    const a   = i < 4 ? assump.fy26 : assump.fy27;
    const rev = +q.revenue.toFixed(2);
    return {
      label: QUARTERS[i], isForecast: true, rev,
      cor:  +(rev * a.corPct).toFixed(2),
      tnd:  +(rev * a.tndPct).toFixed(2),
      mktg: +(rev * a.mktgPct).toFixed(2),
      ga:   +(rev * a.gaPct).toFixed(2),
    };
  });

  /* ── All 20 quarters ────────────────────────────────────── */
  const quarters = [...histRows, ...foreRows].map(r => enrich(r, qtrNIE, taxRate));

  /* ── Table helpers ────────────────────────────────────────── */
  const isFirstFore = q => q.label === "Q1'26";

  const thStyle = q => ({
    padding: "4px 2px", textAlign: "center",
    background: q.isForecast ? "#EEF2FF" : "#F4F5F8",
    color: q.isForecast ? col : C.navy,
    fontWeight: 600,
    borderBottom: `2px solid ${q.isForecast ? col : C.grid}`,
    borderLeft: isFirstFore(q) ? `2px solid ${col}` : undefined,
    fontSize: 9,
  });

  const tdStyle = (q, bold) => ({
    padding: "4px 2px", textAlign: "center",
    fontWeight: bold ? 700 : 400,
    color: bold && q.isForecast ? col : bold ? C.navy : C.tick,
    borderLeft: isFirstFore(q) ? `2px solid ${col}` : undefined,
    fontSize: 9,
  });

  const renderOpExLegend = ({ payload }) => (
    <div style={{ display: "flex", gap: 14, justifyContent: "center", fontSize: 10, fontFamily: "'Outfit',sans-serif", paddingTop: 8 }}>
      {payload.map((entry, i) => {
        const isLine = entry.type === "line";
        return (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {isLine
              ? <span style={{ width: 18, height: 2, background: entry.color, display: "inline-block", borderRadius: 1 }} />
              : <><span style={{ width: 7, height: 10, background: C.NF, borderRadius: 1, display: "inline-block" }} /><span style={{ width: 7, height: 10, background: `${col}60`, borderRadius: 1, display: "inline-block" }} /></>
            }
            <span style={{ color: C.tick }}>{entry.value}</span>
          </span>
        );
      })}
    </div>
  );

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
            Q1'23–Q4'27 · Quarterly · Linked to Revenue Forecast Model
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>

        {/* Quarterly Chart */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: "0 0 4px" }}>
            Quarterly Revenue & Margin Trend
          </h3>
          <p style={{ fontSize: 11, color: C.muted, margin: "0 0 16px" }}>
            Bars show quarterly revenue; lines show operating and net margin % (right axis). Forecast begins Q1'26.
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={quarters} margin={{ top: 8, right: 56, bottom: 20, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: C.tick, fontFamily: "'Outfit',sans-serif" }}
                axisLine={false} tickLine={false}
                interval={0} angle={-45} textAnchor="end"
              />
              <YAxis yAxisId="left" tickFormatter={v => `$${v}B`} tick={{ fontSize: 10, fill: C.tick, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} width={48} domain={QTR_REV_DOMAIN} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: C.tick, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} width={40} domain={[0, 50]} />
              <Tooltip
                contentStyle={{ fontFamily: "'Outfit',sans-serif", fontSize: 11 }}
                formatter={(v, name) => (name === "Op Margin %" || name === "Net Margin %") ? [`${v.toFixed(1)}%`, name] : [`$${v.toFixed(1)}B`, name]}
              />
              <Legend content={renderOpExLegend} />
              <Bar yAxisId="left" dataKey="rev" name="Revenue" radius={[2, 2, 0, 0]} fill={col}>
                {quarters.map((q, i) => <Cell key={i} fill={q.isForecast ? `${col}40` : C.NF} />)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="opMgn" name="Op Margin %" stroke={C.navy} strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="netMgn" name="Net Margin %" stroke={col} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Custom OpEx Drivers — always visible; sliders activate only on Custom */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "10px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16, opacity: isCustom ? 1 : 0.45, pointerEvents: isCustom ? "auto" : "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>Custom OpEx Drivers</span>
              <span style={{ fontSize: 10, color: C.muted }}>
                Op Margin · FY2026: <strong style={{ color: isCustom ? col : C.muted }}>{(cmgn26 * 100).toFixed(1)}%</strong> · FY2027: <strong style={{ color: isCustom ? col : C.muted }}>{(cmgn27 * 100).toFixed(1)}%</strong>
              </span>
            </div>
            {isCustom
              ? <button onClick={() => setCustomOpEx(DEFAULT_OPEX)} style={{ fontSize: 10, color: C.muted, background: "none", border: `1px solid ${C.grid}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>Reset</button>
              : <span style={{ fontSize: 10, color: C.muted }}>Select Custom to activate</span>
            }
          </div>
          <OpExSlider
            min={0.20} max={0.45} step={0.005}
            startVal={Q4_25_MGN}
            endVal={cmgn27}
            onEndChange={v => setCustomOpEx({ mgn27: +v.toFixed(3) })}
            fmt={v => `${(v * 100).toFixed(1)}%`}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: C.muted }}>
            <span>Bear {(OPEX_FORE.bear.fy27.margin * 100).toFixed(1)}%</span>
            <span>Consensus {(FIXED.fy27.margin * 100).toFixed(1)}%</span>
            <span>Bull {(OPEX_FORE.bull.fy27.margin * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* Methodology note — collapsible */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setMethOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <span style={{ fontSize: 13, lineHeight: 1, display: "inline-block", transition: "transform 0.2s", transform: methOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
            Forecast Methodology — {methOpen ? "Collapse" : "Expand"}
          </button>
          {methOpen && (
            <div style={{ marginTop: 10, background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontSize: 12, color: C.tick, lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 10px", fontWeight: 700, color: C.navy }}>Top-Down Margin Approach</p>
              <p style={{ margin: "0 0 8px" }}>
                This model forecasts OpEx using a top-down method: quarterly revenue comes from the Netflix Revenue Forecast model (net adds × ARM), and operating margin is assumed per scenario. Each cost line is then back-calculated as a percentage of that quarterly revenue — it does not build costs from unit economics.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong style={{ color: C.navy }}>Historical quarters</strong> — Annual cost % splits from Netflix 10-K are applied uniformly to each quarter's revenue. Quarterly net income is derived from the annual net margin for that year.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong style={{ color: C.navy }}>What drives the difference between scenarios</strong> — Cost of Revenue (content amortization + delivery) absorbs most of the margin swing. Technology & Development, Marketing, and G&A are held at relatively stable percentages, consistent with their historically low sensitivity to revenue growth.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <strong style={{ color: C.navy }}>Limitation</strong> — A bottoms-up model would forecast content spend from slate commitments, headcount costs for T&D and G&A, and CPM yield for marketing. Those inputs are not publicly disclosed. Margin assumptions are grounded in Netflix's public guidance (~29% for FY2025) and sell-side consensus for FY2026–27.
              </p>
              <p style={{ margin: 0, color: C.muted, fontSize: 11 }}>
                Sources: Netflix FY2023–FY2024 10-K · Netflix Q4 2025 Shareholder Letter · Wells Fargo / JPMorgan / Goldman Sachs equity research (Jan–Mar 2025)
              </p>
            </div>
          )}
        </div>

        {/* Quarterly Cost Structure Table */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: C.navy, margin: 0 }}>
              Quarterly Cost Structure & Income Statement
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
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
          </div>
          <table style={{ borderCollapse: "collapse", fontSize: 9, fontFamily: "'Outfit', sans-serif", width: "100%", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 126 }} />
              {quarters.map(q => <col key={q.label} />)}
            </colgroup>
            <thead>
              <tr>
                <th style={{ padding: "4px 6px", textAlign: "left", background: "#F4F5F8", color: C.navy, fontWeight: 600, borderBottom: `2px solid ${C.grid}`, fontSize: 9 }}>
                  Line Item
                </th>
                {quarters.map(q => (
                  <th key={q.label} style={thStyle(q)}>{q.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Revenue */}
              <tr style={{ background: "#F8FAFC" }}>
                <td style={{ padding: "4px 6px", fontWeight: 700, color: C.navy }}>Revenue</td>
                {quarters.map(q => (
                  <td key={q.label} style={tdStyle(q, true)}>${q.rev.toFixed(1)}B</td>
                ))}
              </tr>

              {/* Cost lines */}
              {COST_LINES.map(row => (
                <tr key={row.key}>
                  <td style={{ padding: "4px 6px", color: C.tick, paddingLeft: 12 }}>
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: row.color, marginRight: 4, verticalAlign: "middle" }} />
                    {row.shortLabel}
                  </td>
                  {quarters.map(q => (
                    <td key={q.label} style={tdStyle(q, false)}>
                      <div>${q[row.key].toFixed(1)}B</div>
                      <div style={{ color: C.muted, fontSize: 8, marginTop: 1 }}>{(q[row.key] / q.rev * 100).toFixed(1)}%</div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Total OpEx */}
              <tr style={{ background: "#F8FAFC", borderTop: `1px solid ${C.grid}` }}>
                <td style={{ padding: "4px 6px", fontWeight: 600, color: C.navy }}>Total OpEx</td>
                {quarters.map(q => (
                  <td key={q.label} style={tdStyle(q, true)}>${q.total.toFixed(1)}B</td>
                ))}
              </tr>

              {/* Operating Income */}
              <tr style={{ borderTop: `2px solid ${C.grid}` }}>
                <td style={{ padding: "4px 6px", fontWeight: 700, color: C.navy }}>Op Income</td>
                {quarters.map(q => (
                  <td key={q.label} style={tdStyle(q, true)}>${q.opInc.toFixed(1)}B</td>
                ))}
              </tr>

              {/* Operating Margin */}
              <tr style={{ background: "#F8FAFC" }}>
                <td style={{ padding: "4px 6px", fontWeight: 700, color: C.navy }}>Op Margin</td>
                {quarters.map(q => (
                  <td key={q.label} style={{ ...tdStyle(q, true), background: q.isForecast ? `${col}12` : undefined }}>
                    {q.opMgn.toFixed(1)}%
                  </td>
                ))}
              </tr>

              {/* Below-the-line divider */}
              <tr>
                <td colSpan={quarters.length + 1} style={{ padding: "3px 6px", background: "#F4F5F8", fontSize: 8, color: C.muted, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", borderTop: `2px solid ${C.grid}` }}>
                  Below the Line
                </td>
              </tr>

              {/* Net Interest Expense */}
              <tr>
                <td style={{ padding: "4px 6px", color: C.tick, paddingLeft: 12 }}>Net Int Exp</td>
                {quarters.map(q => (
                  <td key={q.label} style={tdStyle(q, false)}>
                    {q.isForecast ? `$${qtrNIE.toFixed(1)}B` : "—"}
                  </td>
                ))}
              </tr>

              {/* Net Income */}
              <tr style={{ borderTop: `2px solid ${C.grid}` }}>
                <td style={{ padding: "4px 6px", fontWeight: 700, color: C.navy }}>Net Income</td>
                {quarters.map(q => (
                  <td key={q.label} style={tdStyle(q, true)}>${q.netInc.toFixed(1)}B</td>
                ))}
              </tr>

              {/* Net Margin */}
              <tr style={{ background: "#F8FAFC" }}>
                <td style={{ padding: "4px 6px", fontWeight: 700, color: C.navy }}>Net Margin</td>
                {quarters.map(q => (
                  <td key={q.label} style={{ ...tdStyle(q, true), background: q.isForecast ? `${col}12` : undefined }}>
                    {q.netMgn.toFixed(1)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${C.grid}`, paddingTop: 14 }}>
          <p style={{ fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Historical (Q1'23–Q4'25): Annual cost % splits from Netflix 10-K applied uniformly to each quarter's revenue. Quarterly net income derived from annual net margin for the respective year. FY2025 estimated from Q4'25 actuals and Netflix's guided ~29% operating margin.
          </p>
          <p style={{ fontSize: 11, color: C.muted, margin: "4px 0 0", lineHeight: 1.6 }}>
            Forecast (Q1'26–Q4'27) margin assumptions — Bear {(OPEX_FORE.bear.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.bear.fy27.margin * 100).toFixed(1)}%, Consensus {(OPEX_FORE.consensus.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.consensus.fy27.margin * 100).toFixed(1)}%, Bull {(OPEX_FORE.bull.fy26.margin * 100).toFixed(1)}→{(OPEX_FORE.bull.fy27.margin * 100).toFixed(1)}%. Revenue sourced from the Netflix Revenue Forecast model. Custom scenario applies Consensus margin assumptions to Custom revenue. Net income assumes ${NI_FORE.netIntExp.toFixed(1)}B/yr net interest expense and effective tax rates of {(NI_FORE.taxRate.bear * 100).toFixed(0)}% / {(NI_FORE.taxRate.consensus * 100).toFixed(0)}% / {(NI_FORE.taxRate.bull * 100).toFixed(0)}% (Bear / Consensus / Bull).
          </p>
        </div>

      </div>
    </div>
  );
}
