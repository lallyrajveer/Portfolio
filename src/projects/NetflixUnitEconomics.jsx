import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  HISTORICAL, QUARTERS, SEASONAL_FACTORS, START,
  buildForecast, getForecast,
} from "./NetflixShared.js";
import { HIST_YR, OPEX_FORE } from "./NetflixOpEx.jsx";
import { useNetflix } from "./NetflixContext.js";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  NF:    "#E50914",
  navy:  "#0B1628",
  bg:    "#F8F9FA",
  grid:  "#E5E7EB",
  tick:  "#6B7280",
  muted: "#9CA3AF",
  light: "#F4F5F8",
};
const SC_COLORS = { bear: "#EA580C", consensus: "#DC2626", bull: "#16A34A", custom: "#7C3AED" };
const SC_LABELS  = { bear: "Bear", consensus: "Consensus", bull: "Bull", custom: "Custom" };

/* ── Annual revenue sums ─────────────────────────────────────── */
const FY_REV_HIST = [
  HISTORICAL.slice(0, 4).reduce((s, q) => s + q.rev, 0),  // FY2023 → 33.72
  HISTORICAL.slice(4, 8).reduce((s, q) => s + q.rev, 0),  // FY2024 → 39.01
  HISTORICAL.slice(8, 12).reduce((s, q) => s + q.rev, 0), // FY2025 → 45.18
];

/* ── Marketing spend ($B) from 10-K comments ────────────────── */
// FY2023: $2.7B  FY2024: $2.8B  FY2025: $2.9B
const MKTG_HIST = FY_REV_HIST.map((rev, i) => +(rev * HIST_YR[i].mktgPct).toFixed(3));

/* ── Gross adds from HISTORICAL quarters ────────────────────── */
// grossAdds = netAdds + churnLosses; churnLosses = churnPct/100 × beginSubs × 3
function computeGrossAdds(quarters) {
  return quarters.reduce((sum, q) => {
    const beginSubs   = +(q.subs - q.netAdds).toFixed(2);
    const churnLosses = +(q.churn / 100 * beginSubs * 3).toFixed(2);
    return sum + q.netAdds + churnLosses;
  }, 0);
}
const GROSS_ADDS_HIST = [
  computeGrossAdds(HISTORICAL.slice(0, 4)),
  computeGrossAdds(HISTORICAL.slice(4, 8)),
  computeGrossAdds(HISTORICAL.slice(8, 12)),
];

/* ── Historical annual unit economics ────────────────────────── */
// LTV = ARM × grossMargin / (monthlyChurn/100)
// CAC = marketingSpend ($B) × 1000 / grossAdds (M)  → $/member
// Payback = CAC / (ARM × grossMargin)  → months
// Contribution Margin = ARM × grossMargin  → $/member/mo
function buildHistRow(yearIdx, label) {
  const qs      = HISTORICAL.slice(yearIdx * 4, yearIdx * 4 + 4);
  const h       = HIST_YR[yearIdx];
  const arm     = +(qs.reduce((s, q) => s + q.arm, 0) / 4).toFixed(2);
  const churn   = +(qs.reduce((s, q) => s + q.churn, 0) / 4).toFixed(3);
  const gm      = +(1 - h.corPct);
  const contMgn = +(arm * gm).toFixed(2);
  const ltv     = +(contMgn / (churn / 100)).toFixed(1);
  const cac     = +(MKTG_HIST[yearIdx] * 1000 / GROSS_ADDS_HIST[yearIdx]).toFixed(2);
  const ltvCac  = +(ltv / cac).toFixed(1);
  const payback = +(cac / contMgn).toFixed(1);
  return {
    label, isForecast: false,
    arm, churn: +churn.toFixed(2), gm: +(gm * 100).toFixed(1),
    contMgn, ltv, cac, ltvCac, payback,
    mktg: +(MKTG_HIST[yearIdx]).toFixed(2),
    grossAdds: +(GROSS_ADDS_HIST[yearIdx]).toFixed(1),
  };
}

const HIST_ROWS = [
  buildHistRow(0, "FY2023A"),
  buildHistRow(1, "FY2024A"),
  buildHistRow(2, "FY2025A"),
];

/* ── Fixed chart domains (computed once across all standard scenarios) ── */
const _allRows = [
  ...HIST_ROWS,
  ...["bear","consensus","bull"].flatMap(sc => buildForeRows(sc)),
];
const _maxLtv    = Math.max(..._allRows.map(r => r.ltv));
const _maxCac    = Math.max(..._allRows.map(r => r.cac));
const _maxLtvCac = Math.max(..._allRows.map(r => r.ltvCac));
const _maxPaybk  = Math.max(..._allRows.map(r => r.payback));
const LTV_CAC_DOMAIN   = [0, Math.ceil(_maxLtv  * 1.10)];
const LTVCAC_RATIO_DOM = [0, Math.ceil(_maxLtvCac * 1.10)];
const PAYBACK_DOM      = [0, Math.ceil(_maxPaybk  * 1.10)];

/* ── Forecast unit economics builder ────────────────────────── */
// Uses getForecast() quarterly data + OPEX_FORE margins per scenario
function buildForeRows(scenario, customDrivers, customOpEx) {
  const isCustom = scenario === "custom";
  const scKey    = isCustom ? "consensus" : scenario;

  // quarterly forecast
  const sf  = SEASONAL_FACTORS;
  const cd  = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecastQtr = isCustom
    ? buildForecast(
        START.subs, START.arm,
        cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS,
        cd.netAddsEnd   ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, sf)
    : getForecast(scenario, sf);

  // OpEx assumptions per year
  const FIXED = OPEX_FORE.consensus;
  const Q4_25_MGN = 0.290;
  const cmgn27 = customOpEx?.mgn27 ?? FIXED.fy27.margin;
  const cmgn26 = +((Q4_25_MGN + cmgn27) / 2).toFixed(4);
  const customAssump = {
    fy26: { margin: cmgn26, corPct: +(1 - cmgn26 - FIXED.fy26.tndPct - FIXED.fy26.mktgPct - FIXED.fy26.gaPct).toFixed(4), mktgPct: FIXED.fy26.mktgPct },
    fy27: { margin: cmgn27, corPct: +(1 - cmgn27 - FIXED.fy27.tndPct - FIXED.fy27.mktgPct - FIXED.fy27.gaPct).toFixed(4), mktgPct: FIXED.fy27.mktgPct },
  };
  const assump = isCustom ? customAssump : {
    fy26: { margin: OPEX_FORE[scKey].fy26.margin, corPct: OPEX_FORE[scKey].fy26.corPct, mktgPct: OPEX_FORE[scKey].fy26.mktgPct },
    fy27: { margin: OPEX_FORE[scKey].fy27.margin, corPct: OPEX_FORE[scKey].fy27.corPct, mktgPct: OPEX_FORE[scKey].fy27.mktgPct },
  };

  const rows = [];
  for (const [fyIdx, label, qSlice] of [[0, "FY2026E", [0, 4]], [1, "FY2027E", [4, 8]]]) {
    const qs    = forecastQtr.slice(...qSlice);
    const a     = fyIdx === 0 ? assump.fy26 : assump.fy27;
    const rev   = +(qs.reduce((s, q) => s + q.revenue, 0)).toFixed(2);
    const arm   = +(qs.reduce((s, q) => s + q.arm,     0) / 4).toFixed(2);
    const churn = +(qs.reduce((s, q) => s + q.churn,   0) / 4).toFixed(3);
    const gm    = +(1 - a.corPct);

    // Gross adds from forecast quarters
    let gA = 0;
    for (const q of qs) {
      const churnLosses = +(q.churn / 100 * q.beginSubs * 3).toFixed(2);
      gA += q.netAdds + churnLosses;
    }

    const mktg    = +(rev * a.mktgPct).toFixed(3);
    const contMgn = +(arm * gm).toFixed(2);
    const ltv     = +(contMgn / (churn / 100)).toFixed(1);
    const cac     = +(mktg * 1000 / gA).toFixed(2);
    const ltvCac  = +(ltv / cac).toFixed(1);
    const payback = +(cac / contMgn).toFixed(1);

    rows.push({
      label, isForecast: true,
      arm, churn: +churn.toFixed(2), gm: +(gm * 100).toFixed(1),
      contMgn, ltv, cac, ltvCac, payback,
      mktg: +mktg.toFixed(2), grossAdds: +gA.toFixed(1),
    });
  }
  return rows;
}

/* ── Custom tooltip ──────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ margin: "0 0 4px", fontWeight: 700, color: C.navy }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(p.dataKey === "ltvCac" ? 1 : 1) : p.value}</strong>
          {p.dataKey === "ltvCac" ? "x" : p.dataKey === "payback" ? " mo" : ""}
        </p>
      ))}
    </div>
  );
}

/* ── KPI card ────────────────────────────────────────────────── */
function KpiCard({ label, value, unit, sub, trend, color }) {
  const trendColor = trend === "up" ? "#16A34A" : trend === "down" ? "#DC2626" : "#6B7280";
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
      padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4,
      borderTop: `3px solid ${color ?? C.NF}`,
    }}>
      <span style={{ fontSize: 11, color: C.tick, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1.1 }}>
        {value}<span style={{ fontSize: 13, fontWeight: 500, color: C.muted, marginLeft: 2 }}>{unit}</span>
      </span>
      {sub && (
        <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>
          {trendArrow} {sub}
        </span>
      )}
    </div>
  );
}

/* ── Section header ──────────────────────────────────────────── */
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.navy }}>{title}</h3>
      {sub && <p style={{ margin: "3px 0 0", fontSize: 12, color: C.tick }}>{sub}</p>}
    </div>
  );
}

/* ── Table ───────────────────────────────────────────────────── */
const COLS = [
  { key: "label",     label: "Year",               fmt: v => v,                          align: "left" },
  { key: "arm",       label: "Avg ARM ($/mo)",      fmt: v => "$" + v.toFixed(2),         align: "right" },
  { key: "gm",        label: "Gross Margin",        fmt: v => v.toFixed(1) + "%",         align: "right" },
  { key: "churn",     label: "Monthly Churn",       fmt: v => v.toFixed(2) + "%",         align: "right" },
  { key: "contMgn",   label: "Contribution Margin", fmt: v => "$" + v.toFixed(2) + "/mo", align: "right" },
  { key: "mktg",      label: "Marketing ($B)",      fmt: v => "$" + v.toFixed(2),         align: "right" },
  { key: "grossAdds", label: "Gross Adds (M)",      fmt: v => v.toFixed(1) + "M",         align: "right" },
  { key: "cac",       label: "CAC ($/member)",      fmt: v => "$" + v.toFixed(2),         align: "right" },
  { key: "ltv",       label: "LTV ($/member)",      fmt: v => "$" + v.toFixed(0),         align: "right" },
  { key: "ltvCac",    label: "LTV/CAC",             fmt: v => v.toFixed(1) + "x",         align: "right" },
  { key: "payback",   label: "Payback (mo)",        fmt: v => v.toFixed(1) + " mo",       align: "right" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixUnitEconomics() {
  const { scenario, setScenario, customDrivers, customOpEx } = useNetflix();
  const [methOpen, setMethOpen] = useState(false);
  const col = SC_COLORS[scenario] ?? SC_COLORS.consensus;

  const foreRows  = buildForeRows(scenario, customDrivers, customOpEx);
  const allRows   = [...HIST_ROWS, ...foreRows];

  // FY2026 / FY2027 forecast rows for KPI cards
  const fy26 = foreRows[0];
  const fy27 = foreRows[1];
  const fy25 = HIST_ROWS[2]; // FY2025 for YoY comparison

  // Chart data: LTV, CAC, LTV/CAC, Payback
  const chartData = allRows.map(r => ({
    year:    r.label,
    ltv:     r.ltv,
    cac:     r.cac,
    ltvCac:  r.ltvCac,
    payback: r.payback,
  }));

  const trendDir = (curr, prev) => curr > prev ? "up" : curr < prev ? "down" : "flat";

  /* ── Pill styles ──────────────────────────────────────────── */
  const pill = (sc) => ({
    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: "1.5px solid",
    background: scenario === sc ? SC_COLORS[sc] : "#fff",
    color: scenario === sc ? "#fff" : SC_COLORS[sc],
    borderColor: SC_COLORS[sc],
    transition: "all .15s",
  });

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", padding: "clamp(12px,3vw,32px)" }}>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 4, height: 22, background: C.NF, borderRadius: 2 }} />
          <h2 style={{ margin: 0, fontSize: "clamp(16px,3vw,22px)", fontWeight: 800, color: C.navy }}>
            Netflix Unit Economics
          </h2>
        </div>
        <p style={{ margin: "0 0 12px 12px", fontSize: 13, color: C.tick, maxWidth: 640 }}>
          Customer-level profitability analysis — LTV, CAC, payback period, and contribution margin
          across FY2023–FY2027, scenario-synced to the Revenue Forecast.
        </p>

        {/* Scenario pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 12 }}>
          {["bear", "consensus", "bull", "custom"].map(sc => (
            <button key={sc} style={pill(sc)} onClick={() => setScenario(sc)}>
              {SC_LABELS[sc]}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI cards row ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
        <KpiCard
          label="LTV — FY2026E"
          value={"$" + fy26.ltv.toFixed(0)}
          unit="/member"
          sub={"vs $" + fy25.ltv.toFixed(0) + " FY2025A"}
          trend={trendDir(fy26.ltv, fy25.ltv)}
          color={col}
        />
        <KpiCard
          label="CAC — FY2026E"
          value={"$" + fy26.cac.toFixed(2)}
          unit="/member"
          sub={"vs $" + fy25.cac.toFixed(2) + " FY2025A"}
          trend={trendDir(fy26.cac, fy25.cac) === "up" ? "down" : trendDir(fy26.cac, fy25.cac) === "down" ? "up" : "flat"}
          color={col}
        />
        <KpiCard
          label="LTV/CAC — FY2026E"
          value={fy26.ltvCac.toFixed(1) + "x"}
          unit=""
          sub={"vs " + fy25.ltvCac.toFixed(1) + "x FY2025A"}
          trend={trendDir(fy26.ltvCac, fy25.ltvCac)}
          color={col}
        />
        <KpiCard
          label="Payback — FY2026E"
          value={fy26.payback.toFixed(1)}
          unit=" mo"
          sub={"vs " + fy25.payback.toFixed(1) + " mo FY2025A"}
          trend={trendDir(fy26.payback, fy25.payback) === "up" ? "down" : trendDir(fy26.payback, fy25.payback) === "down" ? "up" : "flat"}
          color={col}
        />
        <KpiCard
          label="Contribution Margin FY2027E"
          value={"$" + fy27.contMgn.toFixed(2)}
          unit="/mo"
          sub={"LTV $" + fy27.ltv.toFixed(0) + "  ·  LTV/CAC " + fy27.ltvCac.toFixed(1) + "x"}
          trend={trendDir(fy27.contMgn, fy26.contMgn)}
          color={col}
        />
      </div>

      {/* ── Charts row ───────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

        {/* LTV & CAC chart */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", padding: "16px" }}>
          <SectionHeader title="LTV vs. CAC ($/member)" sub="Lifetime value vs. acquisition cost — wider spread = stronger unit economics" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.tick }} />
              <YAxis tick={{ fontSize: 10, fill: C.tick }} tickFormatter={v => "$" + v} domain={LTV_CAC_DOMAIN} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine x="FY2025A" stroke="#9CA3AF" strokeDasharray="4 2" label={{ value: "Hist → Fore", fontSize: 9, fill: "#9CA3AF", position: "insideTopRight" }} />
              <Line dataKey="ltv"  name="LTV"  stroke={col} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line dataKey="cac"  name="CAC"  stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* LTV/CAC & Payback chart */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", padding: "16px" }}>
          <SectionHeader title="LTV/CAC Ratio & Payback Period" sub="Ratio >3x is strong; payback <12 months is best-in-class for subscription" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: C.tick }} />
              <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: C.tick }} tickFormatter={v => v + "x"} domain={LTVCAC_RATIO_DOM} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: C.tick }} tickFormatter={v => v + "mo"} domain={PAYBACK_DOM} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine yAxisId="left" x="FY2025A" stroke="#9CA3AF" strokeDasharray="4 2" />
              <Line yAxisId="left"  dataKey="ltvCac"  name="LTV/CAC"  stroke={col} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line yAxisId="right" dataKey="payback" name="Payback"  stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Annual table ─────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", padding: "16px", marginBottom: 16, overflowX: "auto" }}>
        <SectionHeader title="Annual Unit Economics Summary" sub="FY2023A–FY2025A from 10-K; FY2026E–FY2027E scenario-linked" />
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr>
              {COLS.map(c => (
                <th key={c.key} style={{
                  padding: "6px 8px", textAlign: c.align, fontWeight: 700,
                  color: C.tick, borderBottom: "2px solid " + C.grid,
                  background: C.light, whiteSpace: "nowrap",
                }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.map((row, ri) => {
              const isFore   = row.isForecast;
              const isFirst  = row.label === "FY2026E";
              const highlight = isFore ? "#FFF8F8" : "#fff";
              return (
                <tr key={row.label}>
                  {COLS.map((c, ci) => {
                    const val    = row[c.key];
                    const isBold = c.key === "ltvCac" || c.key === "payback";
                    const isKey  = c.key === "ltv" || c.key === "cac" || c.key === "ltvCac";
                    return (
                      <td key={c.key} style={{
                        padding: "7px 8px",
                        textAlign: c.align,
                        color: c.key === "label" ? C.navy : isKey ? (isFore ? col : C.navy) : C.tick,
                        fontWeight: c.key === "label" ? 700 : isBold ? 700 : 500,
                        borderBottom: "1px solid " + C.grid,
                        borderLeft: isFirst && ci === 0 ? "3px solid " + col : "none",
                        background: highlight,
                        whiteSpace: "nowrap",
                      }}>
                        {c.key === "label"
                          ? <><span>{val}</span>{isFore && <span style={{ marginLeft: 6, fontSize: 9, background: col + "18", color: col, padding: "1px 5px", borderRadius: 4, border: "1px solid " + col + "40", fontWeight: 600 }}>E</span>}</>
                          : c.fmt(val)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Methodology accordion ────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <button
          onClick={() => setMethOpen(o => !o)}
          style={{
            width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 13, fontWeight: 700, color: C.navy,
          }}
        >
          <span>Methodology & Definitions</span>
          <span style={{ fontSize: 14, color: C.muted, transform: methOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
        </button>
        {methOpen && (
          <div style={{ padding: "4px 16px 16px", borderTop: "1px solid " + C.grid }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px 24px", fontSize: 12, color: C.tick, lineHeight: 1.6 }}>
              {[
                ["LTV (Lifetime Value)", "ARM × Gross Margin % ÷ Monthly Churn Rate. Represents the present value of gross profit generated per subscriber over their expected lifetime."],
                ["CAC (Customer Acquisition Cost)", "Marketing Spend ($B) × 1,000 ÷ Gross Adds (M). Gross adds = net adds + churn losses each quarter."],
                ["Contribution Margin", "ARM × Gross Margin % per subscriber per month — the incremental profit contribution before fixed costs."],
                ["Payback Period", "CAC ÷ Contribution Margin — months required to recover the cost of acquiring one subscriber."],
                ["Gross Margin", "1 − Cost of Revenue %. Content amortization, delivery, and customer support are COR. T&D, Marketing, and G&A are below gross profit."],
                ["Churn Rate", "Monthly churn (%) from third-party panel estimates (Antenna/YipitData). Netflix does not officially report churn. Forecast churn ramps linearly per scenario."],
              ].map(([title, body]) => (
                <div key={title}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, color: C.navy, fontSize: 12 }}>{title}</p>
                  <p style={{ margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 12, fontSize: 11, color: C.muted, borderTop: "1px solid " + C.grid, paddingTop: 8 }}>
              Historical financials from Netflix FY2023–2025 10-K filings. FY2025 margins estimated from Q4'25 actuals and full-year guidance. Forecast values are scenario-linked to the Netflix Revenue Forecast model — change the scenario above or in any connected tab to update all outputs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
