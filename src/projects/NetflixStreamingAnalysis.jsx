import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, Legend,
} from "recharts";

/* ─── Colors ────────────────────────────────────────────────────────────── */
const NETFLIX = "#E50914";
const DISNEY  = "#113CCF";
const MAX     = "#8B5CF6";
const DARK    = "#0B1628";
const MUTED   = "#6B7280";
const GRID    = "#E5E7EB";
const LIGHT   = "#F8F9FA";

/* ─── Competitive Data Q1'23 – Q4'25 ─────────────────────────────────── */
// Disney+ Core subscribers (excl. Hotstar). Q3'23 drop = Hotstar reclassification.
// Disney ARM = DTC revenue / (3 × avg Disney+ Core subs) — includes Hulu blended.
// Max = HBO Max / Warner Bros. Discovery DTC (Max + Discovery+).
const subsQ = [
  { q: "Q1'23", Netflix: 232.5, Disney: 157.8, Max:  97.6 },
  { q: "Q2'23", Netflix: 238.4, Disney: 146.1, Max:  95.8 },
  { q: "Q3'23", Netflix: 247.2, Disney: 112.6, Max:  95.1 },
  { q: "Q4'23", Netflix: 260.3, Disney: 111.3, Max:  97.7 },
  { q: "Q1'24", Netflix: 269.6, Disney: 117.6, Max:  99.6 },
  { q: "Q2'24", Netflix: 277.7, Disney: 118.3, Max: 103.3 },
  { q: "Q3'24", Netflix: 282.7, Disney: 122.7, Max: 110.5 },
  { q: "Q4'24", Netflix: 301.6, Disney: 124.6, Max: 116.9 },
  { q: "Q1'25", Netflix: 310.0, Disney: 126.4, Max: 122.3 },
  { q: "Q2'25", Netflix: 320.0, Disney: 128.0, Max: 125.7 },
  { q: "Q3'25", Netflix: 325.0, Disney: 132.0, Max: 128.0 },
  { q: "Q4'25", Netflix: 332.0, Disney: 135.0, Max: 131.6 },
];

const netAddsQ = [
  { q: "Q1'23", Netflix:  1.75, Disney:  -4.0, Max:  1.8 },
  { q: "Q2'23", Netflix:  5.90, Disney: -11.7, Max: -1.8 },
  { q: "Q3'23", Netflix:  8.76, Disney: -33.5, Max: -0.7 },
  { q: "Q4'23", Netflix: 13.12, Disney:  -1.3, Max:  2.6 },
  { q: "Q1'24", Netflix:  9.33, Disney:   6.3, Max:  1.9 },
  { q: "Q2'24", Netflix:  8.05, Disney:   0.7, Max:  3.7 },
  { q: "Q3'24", Netflix:  5.07, Disney:   4.4, Max:  7.2 },
  { q: "Q4'24", Netflix: 19.00, Disney:   1.9, Max:  6.4 },
  { q: "Q1'25", Netflix:  8.40, Disney:   1.8, Max:  5.4 },
  { q: "Q2'25", Netflix: 10.00, Disney:   1.6, Max:  3.4 },
  { q: "Q3'25", Netflix:  5.00, Disney:   4.0, Max:  2.3 },
  { q: "Q4'25", Netflix:  7.00, Disney:   3.0, Max:  3.6 },
];

const revenueQ = [
  { q: "Q1'23", Netflix:  8.16, Disney: 2.64, Max: 2.40 },
  { q: "Q2'23", Netflix:  8.19, Disney: 2.67, Max: 2.40 },
  { q: "Q3'23", Netflix:  8.54, Disney: 2.50, Max: 2.44 },
  { q: "Q4'23", Netflix:  8.83, Disney: 2.40, Max: 2.50 },
  { q: "Q1'24", Netflix:  9.37, Disney: 2.64, Max: 2.50 },
  { q: "Q2'24", Netflix:  9.56, Disney: 2.67, Max: 2.55 },
  { q: "Q3'24", Netflix:  9.83, Disney: 2.69, Max: 2.60 },
  { q: "Q4'24", Netflix: 10.25, Disney: 2.82, Max: 2.65 },
  { q: "Q1'25", Netflix: 10.54, Disney: 2.90, Max: 2.70 },
  { q: "Q2'25", Netflix: 11.08, Disney: 2.95, Max: 2.80 },
  { q: "Q3'25", Netflix: 11.51, Disney: 3.00, Max: 2.75 },
  { q: "Q4'25", Netflix: 12.05, Disney: 3.05, Max: 2.80 },
];

const revenueA = [
  { year: "FY2022", Netflix: 31.6, Disney:  9.0, Max:  9.4 },
  { year: "FY2023", Netflix: 33.7, Disney: 10.2, Max:  9.7 },
  { year: "FY2024", Netflix: 39.0, Disney: 10.8, Max: 10.3 },
  { year: "FY2025", Netflix: 45.2, Disney: 11.9, Max: 11.1 },
];

// Monthly churn rate (%) — third-party analyst estimates (Antenna/YipitData).
// None of Netflix, Disney, or Max officially report churn.
const churnQ = [
  { q: "Q1'23", Netflix: 2.40, Disney: 3.50, Max: 3.20 },
  { q: "Q2'23", Netflix: 2.30, Disney: 3.80, Max: 3.50 },
  { q: "Q3'23", Netflix: 2.20, Disney: 4.00, Max: 3.30 },
  { q: "Q4'23", Netflix: 1.90, Disney: 3.20, Max: 3.00 },
  { q: "Q1'24", Netflix: 2.10, Disney: 2.80, Max: 2.80 },
  { q: "Q2'24", Netflix: 2.00, Disney: 2.70, Max: 2.60 },
  { q: "Q3'24", Netflix: 2.30, Disney: 2.50, Max: 2.40 },
  { q: "Q4'24", Netflix: 1.80, Disney: 2.40, Max: 2.20 },
  { q: "Q1'25", Netflix: 2.00, Disney: 2.30, Max: 2.00 },
  { q: "Q2'25", Netflix: 2.10, Disney: 2.20, Max: 2.10 },
  { q: "Q3'25", Netflix: 2.00, Disney: 2.10, Max: 2.00 },
  { q: "Q4'25", Netflix: 1.90, Disney: 2.00, Max: 1.90 },
];

// ARM = quarterly revenue / (3 × avg memberships). Disney ARM includes Hulu blended.
const armQ = [
  { q: "Q1'23", Netflix: 11.73, Disney: 5.51, Max: 8.27 },
  { q: "Q2'23", Netflix: 11.60, Disney: 5.86, Max: 8.27 },
  { q: "Q3'23", Netflix: 11.72, Disney: 6.44, Max: 8.52 },
  { q: "Q4'23", Netflix: 11.60, Disney: 7.15, Max: 8.64 },
  { q: "Q1'24", Netflix: 11.79, Disney: 7.69, Max: 8.46 },
  { q: "Q2'24", Netflix: 11.64, Disney: 7.55, Max: 8.38 },
  { q: "Q3'24", Netflix: 11.68, Disney: 7.44, Max: 8.11 },
  { q: "Q4'24", Netflix: 11.69, Disney: 7.60, Max: 7.77 },
  { q: "Q1'25", Netflix: 11.49, Disney: 7.70, Max: 7.53 },
  { q: "Q2'25", Netflix: 11.72, Disney: 7.73, Max: 7.53 },
  { q: "Q3'25", Netflix: 11.90, Disney: 7.69, Max: 7.23 },
  { q: "Q4'25", Netflix: 12.23, Disney: 7.49, Max: 7.19 },
];

const kpiCards = [
  { label: "Global Paid Members",  value: "332M",   sub: "Q4 2025",       trend: "+7M QoQ",    color: "#16A34A" },
  { label: "Quarterly Revenue",    value: "$12.1B",  sub: "Q4 2025",       trend: "+26% YoY",   color: "#16A34A" },
  { label: "Global ARM",           value: "$12.23",  sub: "per month",     trend: "+$0.54 YoY", color: "#16A34A" },
  { label: "FY2025 Revenue",       value: "$45.2B",  sub: "Full Year",     trend: "+16% YoY",   color: "#16A34A" },
];

const insights = [
  {
    title: "Netflix leads by a massive margin",
    body: "At 332M paid members, Netflix is 2.5× larger than Disney+ (135M) and Max (132M) combined subscriber lead widened significantly after password-sharing enforcement drove record net adds in 2023–2024.",
    color: NETFLIX,
  },
  {
    title: "ARM premium drives outsized revenue",
    body: "Netflix's $12.23 global ARM is 63% higher than Disney ($7.49) and 70% higher than Max ($7.19), reflecting premium positioning, breadth of content, and ad-tier monetization layered on top of subscriptions.",
    color: NETFLIX,
  },
  {
    title: "Disney reversed the subscriber slide",
    body: "Disney+ lost ~47M members between Q1'23 and Q4'23, largely due to separating Hotstar (India). Since Q1'24, core Disney+ has regained 24M members, showing price-increase absorption and improved retention.",
    color: DISNEY,
  },
  {
    title: "Max accelerating with global expansion",
    body: "Max added 34M subscribers in FY2025, driven by international market launches across Europe and Latin America. Revenue per member declined as international mix grows, but total DTC revenue reached $11.1B.",
    color: MAX,
  },
];

/* ═══════════════════════════════════════════════════════════════════════
   TAB 5 — CHURN
   ═══════════════════════════════════════════════════════════════════════ */
function ChurnTab() {
  const latest = churnQ[churnQ.length - 1];
  return (
    <div>
      {/* Disclaimer */}
      <div style={{ background: "#FFF8EC", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 16px", marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: "#92400E" }}>
          ⚠ Monthly churn rates are third-party analyst estimates (Antenna / YipitData).
          Netflix, Disney, and Max do not officially disclose churn.
        </span>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { name: "Netflix", color: "#E50914", val: latest.Netflix, note: "Price increases Q3'24 uptick; ad-tier improves retention long-term" },
          { name: "Disney+", color: "#113CCF", val: latest.Disney,  note: "Improved from ~4% highs in 2023 as content investment stabilized" },
          { name: "Max",     color: "#8B5CF6", val: latest.Max,     note: "Declining steadily as bundling with Disney+ reduces churn pressure" },
        ].map(s => (
          <div key={s.name} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.name}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0B1628", lineHeight: 1 }}>{s.val.toFixed(1)}%</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>monthly churn — Q4 2025 est.</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 8, lineHeight: 1.5 }}>{s.note}</div>
          </div>
        ))}
      </div>

      <SectionCard title="Monthly Churn Rate — Quarterly Trend (%)">
        <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 16px" }}>
          Lower churn = stronger retention. Netflix password-sharing enforcement (Q3'23–Q4'23) improved retention materially.
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={churnQ} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="q" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `${v}%`} domain={[1.5, 4.5]} width={44} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x="Q3'23" stroke="#113CCF" strokeDasharray="4 2" strokeWidth={1}
              label={{ value: "PW sharing crackdown", position: "top", fontSize: 10, fill: "#113CCF" }} />
            <Line dataKey="Netflix" stroke="#E50914" strokeWidth={2.5} dot={false} />
            <Line dataKey="Disney"  stroke="#113CCF" strokeWidth={2}   dot={false} />
            <Line dataKey="Max"     stroke="#8B5CF6" strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Churn Data Table — Monthly Rate (%)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Quarter","Netflix","Disney+","Max","NF–DIS Gap","NF–MAX Gap"].map((h, i) => (
                  <th key={h} style={{ padding: "7px 12px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: "#0B1628", fontWeight: 600, borderBottom: "2px solid #E50914", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {churnQ.map((row, ri) => (
                <tr key={row.q} style={{ background: ri % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                  <td style={{ padding: "7px 12px", fontWeight: 600, color: "#0B1628" }}>{row.q}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: "#E50914", fontWeight: 600 }}>{row.Netflix.toFixed(1)}%</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: "#113CCF" }}>{row.Disney.toFixed(1)}%</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: "#8B5CF6" }}>{row.Max.toFixed(1)}%</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: "#6B7280" }}>{(row.Netflix - row.Disney).toFixed(1)}pp</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: "#6B7280" }}>{(row.Netflix - row.Max).toFixed(1)}pp</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: "#6B7280", marginTop: 12, lineHeight: 1.5 }}>
          Negative gap = Netflix churn is lower than peer. pp = percentage points. All figures are third-party estimates.
        </p>
      </SectionCard>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const axisStyle = { fontSize: 11, fill: MUTED };
const gridProps  = { stroke: GRID, strokeDasharray: "3 3" };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${GRID}`, borderRadius: 6, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: DARK, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const SectionCard = ({ title, children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20, ...style }}>
    {title && <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: DARK, margin: "0 0 18px" }}>{title}</h3>}
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ═══════════════════════════════════════════════════════════════════════ */
function OverviewTab() {
  const latest = subsQ[subsQ.length - 1];
  const latestRev = revenueQ[revenueQ.length - 1];

  return (
    <div>
      {/* Leader Board */}
      <SectionCard title="Q4 2025 — At a Glance">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { name: "Netflix", color: NETFLIX, subs: latest.Netflix, rev: latestRev.Netflix },
            { name: "Disney+", color: DISNEY,  subs: latest.Disney,  rev: latestRev.Disney  },
            { name: "Max",     color: MAX,      subs: latest.Max,     rev: latestRev.Max     },
          ].map(s => (
            <div key={s.name} style={{ border: `2px solid ${s.color}`, borderRadius: 10, padding: "18px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginBottom: 8 }}>{s.name}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: DARK, lineHeight: 1 }}>{s.subs.toFixed(0)}M</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 3, marginBottom: 12 }}>paid members</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: DARK }}>${s.rev.toFixed(2)}B</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>quarterly revenue</div>
            </div>
          ))}
        </div>

        {/* Mini bar chart: Q4'25 subs */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Paid Members (M) — Q4 2025</div>
          {[
            { name: "Netflix", val: latest.Netflix, color: NETFLIX },
            { name: "Disney+", val: latest.Disney,  color: DISNEY  },
            { name: "Max",     val: latest.Max,      color: MAX     },
          ].map(s => (
            <div key={s.name} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: DARK, marginBottom: 3 }}>
                <span style={{ fontWeight: 600 }}>{s.name}</span><span>{s.val.toFixed(0)}M</span>
              </div>
              <div style={{ height: 8, background: GRID, borderRadius: 4 }}>
                <div style={{ width: `${(s.val / 332) * 100}%`, height: "100%", background: s.color, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Insights */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ background: "#fff", borderLeft: `4px solid ${ins.color}`, borderRadius: "0 8px 8px 0", padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 6 }}>{ins.title}</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{ins.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 2 — SUBSCRIBERS
   ═══════════════════════════════════════════════════════════════════════ */
function SubscribersTab() {
  return (
    <div>
      <SectionCard title="Paid Memberships — Quarterly (M)">
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px", fontFamily: "'Outfit', sans-serif" }}>
          ⚠ Disney+ Q3'23 drop reflects Hotstar (~33M) reclassified as separate segment after losing IPL rights
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={subsQ} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="q" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `${v}M`} width={54} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x="Q3'23" stroke={DISNEY} strokeDasharray="4 2" strokeWidth={1} label={{ value: "Hotstar split", position: "top", fontSize: 10, fill: DISNEY }} />
            <Line dataKey="Netflix" stroke={NETFLIX} strokeWidth={2.5} dot={false} />
            <Line dataKey="Disney"  stroke={DISNEY}  strokeWidth={2}   dot={false} />
            <Line dataKey="Max"     stroke={MAX}      strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Net Membership Adds — Quarterly (M)">
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px" }}>
          Netflix Q4'24 record +19.0M driven by password-sharing enforcement and ad-tier growth
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={netAddsQ} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="q" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `${v}M`} width={50} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine y={0} stroke={DARK} strokeWidth={1} />
            <Bar dataKey="Netflix" fill={NETFLIX} radius={[2,2,0,0]} maxBarSize={18} />
            <Bar dataKey="Disney"  fill={DISNEY}  radius={[2,2,0,0]} maxBarSize={18} />
            <Bar dataKey="Max"     fill={MAX}      radius={[2,2,0,0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Data Table */}
      <SectionCard title="Paid Memberships — Full Data Table (M)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Quarter", "Netflix", "Disney+", "Max", "NF Net Adds", "DIS Net Adds", "MAX Net Adds"].map((h, i) => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: DARK, fontWeight: 600, borderBottom: `2px solid ${NETFLIX}`, whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subsQ.map((row, ri) => {
                const na = netAddsQ[ri];
                return (
                  <tr key={row.q} style={{ background: ri % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                    <td style={{ padding: "7px 12px", fontWeight: 600, color: DARK }}>{row.q}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: NETFLIX, fontWeight: 600 }}>{row.Netflix.toFixed(1)}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: DISNEY }}>{row.Disney.toFixed(1)}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: MAX }}>{row.Max.toFixed(1)}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: na.Netflix >= 0 ? "#16A34A" : "#DC2626", fontWeight: 600 }}>{na.Netflix >= 0 ? "+" : ""}{na.Netflix.toFixed(2)}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: na.Disney >= 0 ? "#16A34A" : "#DC2626" }}>{na.Disney >= 0 ? "+" : ""}{na.Disney.toFixed(1)}</td>
                    <td style={{ padding: "7px 12px", textAlign: "center", color: na.Max >= 0 ? "#16A34A" : "#DC2626" }}>{na.Max >= 0 ? "+" : ""}{na.Max.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 3 — REVENUE
   ═══════════════════════════════════════════════════════════════════════ */
function RevenueTab() {
  return (
    <div>
      <SectionCard title="Annual Revenue Comparison ($B)">
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px" }}>
          Netflix FY2025 revenue of $45.2B is 3.8× Disney+ DTC ($11.9B) and 4.1× Max ($11.1B)
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueA} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="year" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `$${v}B`} width={54} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Netflix" fill={NETFLIX} radius={[3,3,0,0]} maxBarSize={36} />
            <Bar dataKey="Disney"  fill={DISNEY}  radius={[3,3,0,0]} maxBarSize={36} />
            <Bar dataKey="Max"     fill={MAX}      radius={[3,3,0,0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard title="Quarterly Revenue — All Three Services ($B)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueQ} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="q" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `$${v}B`} width={54} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line dataKey="Netflix" stroke={NETFLIX} strokeWidth={2.5} dot={false} />
            <Line dataKey="Disney"  stroke={DISNEY}  strokeWidth={2}   dot={false} />
            <Line dataKey="Max"     stroke={MAX}      strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Revenue Table */}
      <SectionCard title="Annual Revenue Summary ($B)">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Year", "Netflix", "YoY %", "Disney+ DTC", "YoY %", "Max DTC", "YoY %"].map((h, i) => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: DARK, fontWeight: 600, borderBottom: `2px solid ${NETFLIX}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {revenueA.map((row, ri) => {
                const prev = ri > 0 ? revenueA[ri - 1] : null;
                const nfYoY  = prev ? (((row.Netflix - prev.Netflix) / prev.Netflix) * 100).toFixed(1) : null;
                const disYoY = prev ? (((row.Disney  - prev.Disney)  / prev.Disney)  * 100).toFixed(1) : null;
                const maxYoY = prev ? (((row.Max     - prev.Max)     / prev.Max)     * 100).toFixed(1) : null;
                const yoyStyle = (v) => ({ color: v && +v >= 0 ? "#16A34A" : "#DC2626", fontWeight: 600 });
                return (
                  <tr key={row.year} style={{ background: ri % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: DARK }}>{row.year}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: NETFLIX, fontWeight: 700 }}>${row.Netflix.toFixed(1)}B</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", ...yoyStyle(nfYoY) }}>{nfYoY ? `+${nfYoY}%` : "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: DISNEY }}>${row.Disney.toFixed(1)}B</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", ...yoyStyle(disYoY) }}>{disYoY ? `+${disYoY}%` : "—"}</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", color: MAX }}>${row.Max.toFixed(1)}B</td>
                    <td style={{ padding: "9px 14px", textAlign: "center", ...yoyStyle(maxYoY) }}>{maxYoY ? `+${maxYoY}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   TAB 4 — ARM
   ═══════════════════════════════════════════════════════════════════════ */
function ARMTab() {
  return (
    <div>
      <SectionCard title="Average Revenue per Membership — Monthly ($/mo)">
        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px" }}>
          ARM = Quarterly Revenue ÷ (3 × Avg Paid Members). Disney ARM includes Hulu blended into DTC segment.
        </p>
        <p style={{ fontSize: 12, color: "#D97706", margin: "0 0 16px" }}>
          ⚠ Disney Q3'23 ARM jump reflects Hotstar reclassification (fewer members, similar revenue base) — not a real price increase.
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={armQ} margin={{ top: 4, right: 20, bottom: 4, left: 8 }}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="q" tick={axisStyle} />
            <YAxis tick={axisStyle} tickFormatter={v => `$${v}`} domain={[4, 14]} width={46} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <ReferenceLine x="Q3'23" stroke={DISNEY} strokeDasharray="4 2" strokeWidth={1} label={{ value: "Hotstar split", position: "top", fontSize: 10, fill: DISNEY }} />
            <Line dataKey="Netflix" stroke={NETFLIX} strokeWidth={2.5} dot={false} />
            <Line dataKey="Disney"  stroke={DISNEY}  strokeWidth={2}   dot={false} />
            <Line dataKey="Max"     stroke={MAX}      strokeWidth={2}   dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ARM Gap analysis */}
      <SectionCard title="ARM Gap Analysis — Netflix Premium vs Peers">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Netflix vs Disney+ ARM Gap", val: (12.23 - 7.49).toFixed(2), pct: (((12.23 - 7.49) / 7.49) * 100).toFixed(0), color: DISNEY },
            { label: "Netflix vs Max ARM Gap",     val: (12.23 - 7.19).toFixed(2), pct: (((12.23 - 7.19) / 7.19) * 100).toFixed(0), color: MAX },
          ].map(g => (
            <div key={g.label} style={{ background: LIGHT, borderRadius: 8, padding: "16px 18px", border: `1px solid ${GRID}` }}>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{g.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: DARK }}>+${g.val}</div>
              <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Netflix is <strong style={{ color: NETFLIX }}>+{g.pct}%</strong> higher per member per month</div>
            </div>
          ))}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
            <thead>
              <tr>
                {["Quarter", "Netflix ARM", "Disney ARM", "Max ARM", "NF–DIS Gap", "NF–MAX Gap"].map((h, i) => (
                  <th key={h} style={{ padding: "7px 12px", textAlign: i === 0 ? "left" : "center", background: "#F4F5F8", color: DARK, fontWeight: 600, borderBottom: `2px solid ${NETFLIX}`, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {armQ.map((row, ri) => (
                <tr key={row.q} style={{ background: ri % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                  <td style={{ padding: "7px 12px", fontWeight: 600, color: DARK }}>{row.q}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: NETFLIX, fontWeight: 700 }}>${row.Netflix.toFixed(2)}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: DISNEY }}>${row.Disney.toFixed(2)}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: MAX }}>${row.Max.toFixed(2)}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: DARK }}>+${(row.Netflix - row.Disney).toFixed(2)}</td>
                  <td style={{ padding: "7px 12px", textAlign: "center", color: DARK }}>+${(row.Netflix - row.Max).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
const TAB_STYLE = (active) => ({
  padding: "9px 22px", fontSize: 13, fontWeight: active ? 600 : 400,
  cursor: "pointer", border: "none", borderBottom: active ? `2px solid ${NETFLIX}` : "2px solid transparent",
  background: "none", color: active ? NETFLIX : MUTED, transition: "all 0.15s", fontFamily: "'Outfit', sans-serif",
});

export default function NetflixStreamingAnalysis() {
  const [tab, setTab] = useState("overview");

  return (
    <div style={{ fontFamily: "'Outfit', 'Segoe UI', sans-serif", background: LIGHT, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: DARK, padding: "24px 40px", borderBottom: `3px solid ${NETFLIX}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: NETFLIX, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: NETFLIX }}>Streaming Analysis</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Global Streaming — Competitive KPI Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Netflix vs. Disney+ vs. Max · Q1 2023 – Q4 2025 · Paid Memberships, Revenue, ARM
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${GRID}`, padding: "18px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {kpiCards.map((k, i) => (
            <div key={i} style={{ padding: "13px 16px", borderRadius: 8, border: `1px solid ${GRID}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: DARK, lineHeight: 1 }}>{k.value}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 11, color: MUTED }}>{k.sub}</span>
                <span style={{ fontSize: 11, color: k.color, fontWeight: 600 }}>{k.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${GRID}`, padding: "0 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {[["overview","Overview"],["subscribers","Subscribers"],["revenue","Revenue"],["arm","ARM"],["churn","Churn"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={TAB_STYLE(tab === id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>
        {tab === "overview"     && <OverviewTab />}
        {tab === "subscribers"  && <SubscribersTab />}
        {tab === "revenue"      && <RevenueTab />}
        {tab === "arm"          && <ARMTab />}
        {tab === "churn"        && <ChurnTab />}
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 28px" }}>
        <p style={{ fontSize: 11, color: MUTED, borderTop: `1px solid ${GRID}`, paddingTop: 14, lineHeight: 1.6 }}>
          Sources: Netflix shareholder letters Q1 2023–Q4 2025; Disney earnings reports (FQ calendar-aligned); WBD/Max earnings releases.
          Disney+ subscribers = Core (excl. Hotstar). Disney ARM includes Hulu blended into DTC segment. Netflix stopped reporting paid memberships after Q1 2025; Q2–Q4 2025 are Ampere Analysis estimates.
          ARM calculated as: Quarterly Revenue ÷ (3 × Avg Paid Members).
        </p>
      </div>
    </div>
  );
}
