import { useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from "recharts";

/* ─── Colors ────────────────────────────────────────────────────────────── */
const NETFLIX   = "#E50914";
const DISNEY    = "#1B6FE4";
const MAX       = "#7C3FFF";
const AMAZON    = "#FF9900";
const PARAMOUNT = "#1C56B2";
const DARK      = "#0B1628";
const MUTED     = "#6B7280";
const GRID      = "#E5E7EB";
const LIGHT     = "#F8F9FA";

/* ─── Data ───────────────────────────────────────────────────────────────── */
const subsQ = [
  { q: "Q1'23", Netflix: 232.5, Amazon: 202, Disney: 157.8, Max:  97.6, Paramount:  60.0 },
  { q: "Q2'23", Netflix: 238.4, Amazon: 205, Disney: 146.1, Max:  95.8, Paramount:  61.0 },
  { q: "Q3'23", Netflix: 247.2, Amazon: 207, Disney: 112.6, Max:  95.1, Paramount:  63.0 },
  { q: "Q4'23", Netflix: 260.3, Amazon: 210, Disney: 111.3, Max:  97.7, Paramount:  67.5 },
  { q: "Q1'24", Netflix: 269.6, Amazon: 212, Disney: 117.6, Max:  99.6, Paramount:  71.2 },
  { q: "Q2'24", Netflix: 277.7, Amazon: 215, Disney: 118.3, Max: 103.3, Paramount:  68.4 },
  { q: "Q3'24", Netflix: 282.7, Amazon: 218, Disney: 122.7, Max: 110.5, Paramount:  72.0 },
  { q: "Q4'24", Netflix: 301.6, Amazon: 220, Disney: 124.6, Max: 116.9, Paramount:  77.5 },
  { q: "Q1'25", Netflix: 310.0, Amazon: 222, Disney: 126.4, Max: 122.3, Paramount:  79.0 },
  { q: "Q2'25", Netflix: 320.0, Amazon: 225, Disney: 128.0, Max: 125.7, Paramount:  77.7 },
  { q: "Q3'25", Netflix: 325.0, Amazon: 228, Disney: 132.0, Max: 128.0, Paramount:  79.1 },
  { q: "Q4'25", Netflix: 332.0, Amazon: 230, Disney: 135.0, Max: 131.6, Paramount:  78.9 },
];

const netAddsQ = [
  { q: "Q1'23", Netflix:  1.75, Amazon: 2, Disney:  -4.0, Max:  1.8, Paramount:  4.1 },
  { q: "Q2'23", Netflix:  5.90, Amazon: 3, Disney: -11.7, Max: -1.8, Paramount:  1.0 },
  { q: "Q3'23", Netflix:  8.76, Amazon: 2, Disney: -33.5, Max: -0.7, Paramount:  2.0 },
  { q: "Q4'23", Netflix: 13.12, Amazon: 3, Disney:  -1.3, Max:  2.6, Paramount:  4.5 },
  { q: "Q1'24", Netflix:  9.33, Amazon: 2, Disney:   6.3, Max:  1.9, Paramount:  3.7 },
  { q: "Q2'24", Netflix:  8.05, Amazon: 3, Disney:   0.7, Max:  3.7, Paramount: -2.8 },
  { q: "Q3'24", Netflix:  5.07, Amazon: 3, Disney:   4.4, Max:  7.2, Paramount:  3.6 },
  { q: "Q4'24", Netflix: 19.00, Amazon: 2, Disney:   1.9, Max:  6.4, Paramount:  5.5 },
  { q: "Q1'25", Netflix:  8.40, Amazon: 2, Disney:   1.8, Max:  5.4, Paramount:  1.5 },
  { q: "Q2'25", Netflix: 10.00, Amazon: 3, Disney:   1.6, Max:  3.4, Paramount: -1.3 },
  { q: "Q3'25", Netflix:  5.00, Amazon: 3, Disney:   4.0, Max:  2.3, Paramount:  1.4 },
  { q: "Q4'25", Netflix:  7.00, Amazon: 2, Disney:   3.0, Max:  3.6, Paramount: -0.2 },
];

const revenueQ = [
  { q: "Q1'23", Netflix:  8.16, Amazon:  9.51, Disney: 2.64, Max: 2.40, Paramount: 1.55 },
  { q: "Q2'23", Netflix:  8.19, Amazon:  9.89, Disney: 2.67, Max: 2.40, Paramount: 1.60 },
  { q: "Q3'23", Netflix:  8.54, Amazon: 10.17, Disney: 2.50, Max: 2.44, Paramount: 1.68 },
  { q: "Q4'23", Netflix:  8.83, Amazon: 10.74, Disney: 2.40, Max: 2.50, Paramount: 1.87 },
  { q: "Q1'24", Netflix:  9.37, Amazon: 10.72, Disney: 2.64, Max: 2.50, Paramount: 1.87 },
  { q: "Q2'24", Netflix:  9.56, Amazon: 10.91, Disney: 2.67, Max: 2.55, Paramount: 1.88 },
  { q: "Q3'24", Netflix:  9.83, Amazon: 11.28, Disney: 2.69, Max: 2.60, Paramount: 1.86 },
  { q: "Q4'24", Netflix: 10.25, Amazon: 11.57, Disney: 2.82, Max: 2.65, Paramount: 2.01 },
  { q: "Q1'25", Netflix: 10.54, Amazon: 11.71, Disney: 2.90, Max: 2.70, Paramount: 2.04 },
  { q: "Q2'25", Netflix: 11.08, Amazon: 11.95, Disney: 2.95, Max: 2.80, Paramount: 2.10 },
  { q: "Q3'25", Netflix: 11.51, Amazon: 12.20, Disney: 3.00, Max: 2.75, Paramount: 2.17 },
  { q: "Q4'25", Netflix: 12.05, Amazon: 12.49, Disney: 3.05, Max: 2.80, Paramount: 2.21 },
];

const revenueA = [
  { year: "FY2022", Netflix: 31.6, Amazon: 35.2, Disney:  9.0, Max:  9.4, Paramount: 4.9 },
  { year: "FY2023", Netflix: 33.7, Amazon: 40.3, Disney: 10.2, Max:  9.7, Paramount: 6.7 },
  { year: "FY2024", Netflix: 39.0, Amazon: 44.5, Disney: 10.8, Max: 10.3, Paramount: 7.6 },
  { year: "FY2025", Netflix: 45.2, Amazon: 48.4, Disney: 11.9, Max: 11.1, Paramount: 8.5 },
];

const churnQ = [
  { q: "Q1'23", Netflix: 2.40, Amazon: 0.70, Disney: 3.50, Max: 3.20, Paramount: 5.20 },
  { q: "Q2'23", Netflix: 2.30, Amazon: 0.70, Disney: 3.80, Max: 3.50, Paramount: 5.30 },
  { q: "Q3'23", Netflix: 2.20, Amazon: 0.60, Disney: 4.00, Max: 3.30, Paramount: 5.00 },
  { q: "Q4'23", Netflix: 1.90, Amazon: 0.60, Disney: 3.20, Max: 3.00, Paramount: 4.70 },
  { q: "Q1'24", Netflix: 2.10, Amazon: 0.60, Disney: 2.80, Max: 2.80, Paramount: 4.90 },
  { q: "Q2'24", Netflix: 2.00, Amazon: 0.60, Disney: 2.70, Max: 2.60, Paramount: 5.20 },
  { q: "Q3'24", Netflix: 2.30, Amazon: 0.50, Disney: 2.50, Max: 2.40, Paramount: 4.94 },
  { q: "Q4'24", Netflix: 1.80, Amazon: 0.50, Disney: 2.40, Max: 2.20, Paramount: 4.50 },
  { q: "Q1'25", Netflix: 2.00, Amazon: 0.50, Disney: 2.30, Max: 2.00, Paramount: 3.60 },
  { q: "Q2'25", Netflix: 2.10, Amazon: 0.50, Disney: 2.20, Max: 2.10, Paramount: 3.80 },
  { q: "Q3'25", Netflix: 2.00, Amazon: 0.50, Disney: 2.10, Max: 2.00, Paramount: 3.40 },
  { q: "Q4'25", Netflix: 1.90, Amazon: 0.50, Disney: 2.00, Max: 1.90, Paramount: 3.20 },
];

const armQ = [
  { q: "Q1'23", Netflix: 11.73, Amazon: 15.77, Disney: 5.51, Max: 8.27, Paramount: 8.91 },
  { q: "Q2'23", Netflix: 11.60, Amazon: 16.20, Disney: 5.86, Max: 8.27, Paramount: 8.82 },
  { q: "Q3'23", Netflix: 11.72, Amazon: 16.46, Disney: 6.44, Max: 8.52, Paramount: 9.03 },
  { q: "Q4'23", Netflix: 11.60, Amazon: 17.17, Disney: 7.15, Max: 8.64, Paramount: 9.55 },
  { q: "Q1'24", Netflix: 11.79, Amazon: 16.94, Disney: 7.69, Max: 8.46, Paramount: 8.99 },
  { q: "Q2'24", Netflix: 11.64, Amazon: 17.03, Disney: 7.55, Max: 8.38, Paramount: 8.98 },
  { q: "Q3'24", Netflix: 11.68, Amazon: 17.37, Disney: 7.44, Max: 8.11, Paramount: 8.83 },
  { q: "Q4'24", Netflix: 11.69, Amazon: 17.61, Disney: 7.60, Max: 7.77, Paramount: 8.96 },
  { q: "Q1'25", Netflix: 11.49, Amazon: 17.66, Disney: 7.70, Max: 7.53, Paramount: 8.69 },
  { q: "Q2'25", Netflix: 11.72, Amazon: 17.82, Disney: 7.73, Max: 7.53, Paramount: 8.93 },
  { q: "Q3'25", Netflix: 11.90, Amazon: 17.95, Disney: 7.69, Max: 7.23, Paramount: 9.23 },
  { q: "Q4'25", Netflix: 12.23, Amazon: 18.18, Disney: 7.49, Max: 7.19, Paramount: 9.32 },
];

const kpiCards = [
  { label: "Global Paid Members", value: "332M",  sub: "Q4 2025",  trend: "+7M QoQ",    color: "#16A34A" },
  { label: "Quarterly Revenue",   value: "$12.1B", sub: "Q4 2025",  trend: "+26% YoY",   color: "#16A34A" },
  { label: "Global ARM",          value: "$12.23", sub: "per month", trend: "+$0.54 YoY", color: "#16A34A" },
  { label: "FY2025 Revenue",      value: "$45.2B", sub: "Full Year", trend: "+16% YoY",   color: "#16A34A" },
];


/* ─── Helpers ────────────────────────────────────────────────────────────── */
const axisStyle = { fontSize: 11, fill: MUTED };
const gridProps  = { stroke: GRID, strokeDasharray: "3 3" };

const LEGEND_ORDER = [
  { name: "Netflix",   color: NETFLIX   },
  { name: "Amazon",    color: AMAZON    },
  { name: "Disney",    color: DISNEY    },
  { name: "Max",       color: MAX       },
  { name: "Paramount", color: PARAMOUNT },
];

const endLabel = (name, color, dataLen) => (props) => {
  if (props.index !== dataLen - 1) return null;
  return (
    <text x={props.x + 6} y={props.y + 4} fill={color} fontSize={10} fontWeight={700} fontFamily="'Outfit', sans-serif">
      {name}
    </text>
  );
};

const renderLegend = (type) => () => (
  <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "6px 0", flexWrap: "wrap" }}>
    {LEGEND_ORDER.map(item => (
      <span key={item.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: MUTED }}>
        {type === "line"
          ? <span style={{ width: 14, height: 2, background: item.color, display: "inline-block", borderRadius: 1 }} />
          : <span style={{ width: 10, height: 10, background: item.color, display: "inline-block", borderRadius: 2 }} />
        }
        {item.name}
      </span>
    ))}
  </div>
);

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

const CompanyGrid = ({ companies }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
    {companies.map(c => (
      <div key={c.name} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${c.color}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.name}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: DARK, lineHeight: 1 }}>{c.metric}</div>
        {c.sub && <div style={{ fontSize: 11, fontWeight: 600, color: c.subColor ?? MUTED, marginTop: 3 }}>{c.sub}</div>}
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6, lineHeight: 1.5 }}>{c.note}</div>
      </div>
    ))}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: MUTED, margin: "32px 0 12px", paddingBottom: 6, borderBottom: `1px solid ${GRID}` }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */
export default function NetflixStreamingAnalysis() {
  const latestChurn = churnQ[churnQ.length - 1];
  const [sourcesOpen, setSourcesOpen] = useState(false);

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
            Global Streaming: Competitive KPI Dashboard
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Netflix · Amazon Prime · Disney+ · Max · Paramount+ · Q1 2023 – Q4 2025 · Memberships, Revenue, ARM, Churn
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${GRID}`, padding: "18px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {kpiCards.map((k, i) => (
            <div key={i} style={{ padding: "13px 16px", borderRadius: 10, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${NETFLIX}` }}>
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

      {/* Page body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>

        {/* ── Subscribers ── */}
        <SectionLabel>Subscribers</SectionLabel>

        <SectionCard title="Paid Memberships, Quarterly (M)">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={subsQ} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `${v}M`} width={54} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("line")} />
              <ReferenceLine x="Q3'23" stroke={DISNEY} strokeDasharray="4 2" strokeWidth={1} label={{ value: "Hotstar split", position: "top", fontSize: 10, fill: DISNEY }} />
              <Line dataKey="Netflix"   stroke={NETFLIX}   strokeWidth={2.5} dot={false} label={endLabel("Netflix",   NETFLIX,   12)} />
              <Line dataKey="Amazon"    stroke={AMAZON}    strokeWidth={2}   dot={false} label={endLabel("Amazon",    AMAZON,    12)} />
              <Line dataKey="Disney"    stroke={DISNEY}    strokeWidth={2}   dot={false} label={endLabel("Disney",    DISNEY,    12)} />
              <Line dataKey="Max"       stroke={MAX}       strokeWidth={2}   dot={false} label={endLabel("Max",       MAX,       12)} />
              <Line dataKey="Paramount" stroke={PARAMOUNT} strokeWidth={2}   dot={false} label={endLabel("Paramount", PARAMOUNT, 12)} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <CompanyGrid companies={[
          { name: "Netflix",       color: NETFLIX,   metric: "332M",  sub: "Q4 2025",     note: "Largest pure-play streamer; 2.5x bigger than Disney+ and Max. Record +19M net adds in Q4'24 from password-sharing crackdown." },
          { name: "Amazon Prime*", color: AMAZON,    metric: "~230M", sub: "est., Q4'25", note: "Analyst estimate (Antenna / MoffettNathanson). Includes full Prime bundle (shipping + music). Last confirmed figure: 200M in April 2021." },
          { name: "Disney+",       color: DISNEY,    metric: "135M",  sub: "Q4 2025",     note: "Recovered +24M since Q1'24 low. Q3'23 drop of ~33M reflects Hotstar reclassification after IPL rights loss, not real churn." },
          { name: "Max",           color: MAX,       metric: "131.6M", sub: "Q4 2025",    note: "Fastest-growing among pure-play streamers. Added ~34M members in FY2025, aided by Disney+ bundle partnership." },
          { name: "Paramount+",    color: PARAMOUNT, metric: "78.9M", sub: "Q4 2025",     note: "Smallest among peers. Skydance acquisition (Q2'25) provides capital runway; sports rights (NFL, UEFA) anchoring retention." },
        ]} />

        <SectionCard title="Net Membership Adds, Quarterly (M)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={netAddsQ} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `${v}M`} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("bar")} />
              <ReferenceLine y={0} stroke={DARK} strokeWidth={1} />
              <Bar dataKey="Netflix"   fill={NETFLIX}   radius={[2,2,0,0]} maxBarSize={12} />
              <Bar dataKey="Amazon"    fill={AMAZON}    radius={[2,2,0,0]} maxBarSize={12} />
              <Bar dataKey="Disney"    fill={DISNEY}    radius={[2,2,0,0]} maxBarSize={12} />
              <Bar dataKey="Max"       fill={MAX}       radius={[2,2,0,0]} maxBarSize={12} />
              <Bar dataKey="Paramount" fill={PARAMOUNT} radius={[2,2,0,0]} maxBarSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <CompanyGrid companies={[
          { name: "Netflix",       color: NETFLIX,   metric: "+7.0M",  sub: "Q4 2025",     note: "Steady growth post-crackdown. Q4'24 record +19.0M remains the highest single-quarter gain in Netflix history." },
          { name: "Amazon Prime*", color: AMAZON,    metric: "+2M",    sub: "est., Q4'25", note: "Analyst estimate. Stable, low-single-digit quarterly growth consistent with gradual Prime bundle penetration in new markets." },
          { name: "Disney+",       color: DISNEY,    metric: "+3.0M",  sub: "Q4 2025",     note: "Positive adds for 6 consecutive quarters following the Hotstar reclassification reset. Content investment driving re-engagement." },
          { name: "Max",           color: MAX,       metric: "+3.6M",  sub: "Q4 2025",     note: "Consistent positive adds; international expansion and Disney+ bundling are primary growth drivers heading into 2026." },
          { name: "Paramount+",    color: PARAMOUNT, metric: "-0.2M",  sub: "Q4 2025",  subColor: "#DC2626", note: "Slight net subscriber loss in Q4'25. Skydance integration costs are weighing on marketing and content spend." },
        ]} />

        {/* ── Revenue ── */}
        <SectionLabel>Revenue</SectionLabel>

        <SectionCard title="Annual Revenue Comparison ($B)">
          <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px" }}>
            Netflix FY2025 revenue of $45.2B is 3.8× Disney+ DTC ($11.9B) and 5.3× Paramount+ DTC ($8.5B)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueA} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="year" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `$${v}B`} width={54} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("bar")} />
              <Bar dataKey="Netflix"   fill={NETFLIX}   radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="Amazon"    fill={AMAZON}    radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="Disney"    fill={DISNEY}    radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="Max"       fill={MAX}       radius={[3,3,0,0]} maxBarSize={22} />
              <Bar dataKey="Paramount" fill={PARAMOUNT} radius={[3,3,0,0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: "#D97706", margin: "8px 0 0" }}>* Amazon = Subscription Services segment (Prime + Music + Audible). Not video-only revenue.</p>
        </SectionCard>

        <CompanyGrid companies={[
          { name: "Netflix",       color: NETFLIX,   metric: "$45.2B", sub: "FY2025",  note: "+16% YoY. Pure streaming revenue. Ad-tier monetization and UCAN price hikes are primary growth drivers." },
          { name: "Amazon Prime*", color: AMAZON,    metric: "$48.4B", sub: "FY2025",  note: "Subscription Services segment (Prime + Music + Audible). Not video-only. Largest total revenue among peers." },
          { name: "Disney+",       color: DISNEY,    metric: "$11.9B", sub: "FY2025",  note: "DTC segment. Netflix is 3.8x larger. Hulu integration is the primary revenue growth lever heading into 2026." },
          { name: "Max",           color: MAX,       metric: "$11.1B", sub: "FY2025",  note: "Narrowing gap with Disney+ DTC. International rollout across EMEA and APAC is expected to accelerate FY2026 revenue." },
          { name: "Paramount+",    color: PARAMOUNT, metric: "$8.5B",  sub: "FY2025",  note: "DTC segment includes Pluto TV ad revenue. Netflix is 5.3x larger. Skydance deal adds balance sheet support." },
        ]} />

        <SectionCard title="Quarterly Revenue, All Services ($B)">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueQ} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `$${v}B`} width={54} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("line")} />
              <Line dataKey="Netflix"   stroke={NETFLIX}   strokeWidth={2.5} dot={false} label={endLabel("Netflix",   NETFLIX,   12)} />
              <Line dataKey="Amazon"    stroke={AMAZON}    strokeWidth={2}   dot={false} label={endLabel("Amazon",    AMAZON,    12)} />
              <Line dataKey="Disney"    stroke={DISNEY}    strokeWidth={2}   dot={false} label={endLabel("Disney",    DISNEY,    12)} />
              <Line dataKey="Max"       stroke={MAX}       strokeWidth={2}   dot={false} label={endLabel("Max",       MAX,       12)} />
              <Line dataKey="Paramount" stroke={PARAMOUNT} strokeWidth={2}   dot={false} label={endLabel("Paramount", PARAMOUNT, 12)} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <CompanyGrid companies={[
          { name: "Netflix",       color: NETFLIX,   metric: "$12.05B", sub: "Q4 2025", note: "+26% YoY. Crossing $12B/quarter; ad-tier contribution is growing materially as CPM inventory scales." },
          { name: "Amazon Prime*", color: AMAZON,    metric: "$12.49B", sub: "Q4 2025", note: "Subscription Services. Neck-and-neck with Netflix in quarterly revenue, though not directly comparable." },
          { name: "Disney+",       color: DISNEY,    metric: "$3.05B",  sub: "Q4 2025", note: "Steady sequential growth from DTC profitability push. Hulu SVOD blended into DTC from FY2024." },
          { name: "Max",           color: MAX,       metric: "$2.80B",  sub: "Q4 2025", note: "Consistent quarterly growth. Max hit DTC profitability in Q4'24; revenue growth is now margin-accretive." },
          { name: "Paramount+",    color: PARAMOUNT, metric: "$2.21B",  sub: "Q4 2025", note: "DTC segment including Pluto TV. Slow but steady growth; Pluto TV ad revenue offsets SVOD price pressure." },
        ]} />

        {/* ── ARM ── */}
        <SectionLabel>Average Revenue per Membership</SectionLabel>

        <SectionCard title="ARM, Monthly ($/mo)">
          <p style={{ fontSize: 12, color: MUTED, margin: "0 0 12px" }}>
            ARM = Quarterly Revenue ÷ (3 × Avg Paid Members). Disney ARM includes Hulu blended into DTC segment.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={armQ} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `$${v}`} domain={[4, 20]} width={46} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("line")} />
              <ReferenceLine x="Q3'23" stroke={DISNEY} strokeDasharray="4 2" strokeWidth={1} label={{ value: "Hotstar split", position: "top", fontSize: 10, fill: DISNEY }} />
              <Line dataKey="Netflix"   stroke={NETFLIX}   strokeWidth={2.5} dot={false} label={endLabel("Netflix",   NETFLIX,   12)} />
              <Line dataKey="Amazon"    stroke={AMAZON}    strokeWidth={2}   dot={false} label={endLabel("Amazon",    AMAZON,    12)} />
              <Line dataKey="Disney"    stroke={DISNEY}    strokeWidth={2}   dot={false} label={endLabel("Disney",    DISNEY,    12)} />
              <Line dataKey="Max"       stroke={MAX}       strokeWidth={2}   dot={false} label={endLabel("Max",       MAX,       12)} />
              <Line dataKey="Paramount" stroke={PARAMOUNT} strokeWidth={2}   dot={false} label={endLabel("Paramount", PARAMOUNT, 12)} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <CompanyGrid companies={[
          { name: "Netflix",       color: NETFLIX,   metric: "$12.23", sub: "/mo, Q4 2025", note: "+$0.54 YoY. Global ARM growing as ad-tier CPM scales and UCAN price hike cycle resumes." },
          { name: "Amazon Prime*", color: AMAZON,    metric: "$18.18", sub: "/mo, Q4 2025", note: "Highest ARM, but reflects full Prime bundle (shipping + music + video). Not directly comparable to pure-play streaming." },
          { name: "Disney+",       color: DISNEY,    metric: "$7.49",  sub: "/mo, Q4 2025", note: "Netflix is 63% higher per member/mo. Includes Hulu SVOD in DTC blended ARM. Q3'23 spike was Hotstar reclassification." },
          { name: "Max",           color: MAX,       metric: "$7.19",  sub: "/mo, Q4 2025", note: "ARM declined from $7.77 in Q4'24 as international mix grew. Netflix is 70% higher. Risk: Max capturing budget-tier in EMEA." },
          { name: "Paramount+",    color: PARAMOUNT, metric: "$9.32",  sub: "/mo, Q4 2025", note: "Includes Pluto TV AVOD blended in. Netflix is 31% higher. Rising from $8.83 low in Q3'24 as ad inventory matures." },
        ]} />

        <SectionCard title="ARM Gap Analysis: Netflix vs Peers (Q4 2025)">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { label: "Netflix vs Amazon*",   color: AMAZON,    val: (12.23 - 18.18).toFixed(2), note: <><strong style={{ color: AMAZON }}>Amazon</strong> is +{(((18.18-12.23)/12.23)*100).toFixed(0)}% higher (full Prime bundle, not video-only)</> },
              { label: "Netflix vs Disney+",   color: DISNEY,    val: (12.23 -  7.49).toFixed(2), note: <>Netflix is <strong style={{ color: NETFLIX }}>+{(((12.23-7.49)/7.49)*100).toFixed(0)}%</strong> higher per member/mo</> },
              { label: "Netflix vs Max",        color: MAX,       val: (12.23 -  7.19).toFixed(2), note: <>Netflix is <strong style={{ color: NETFLIX }}>+{(((12.23-7.19)/7.19)*100).toFixed(0)}%</strong> higher per member/mo</> },
              { label: "Netflix vs Paramount+", color: PARAMOUNT, val: (12.23 -  9.32).toFixed(2), note: <>Netflix is <strong style={{ color: NETFLIX }}>+{(((12.23-9.32)/9.32)*100).toFixed(0)}%</strong> higher (Paramount incl. Pluto TV)</> },
            ].map(g => (
              <div key={g.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${g.color}` }}>
                <div style={{ fontSize: 11, color: MUTED, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{g.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: DARK }}>
                  {parseFloat(g.val) >= 0 ? `+$${g.val}` : `-$${Math.abs(parseFloat(g.val)).toFixed(2)}`}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{g.note}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── Churn ── */}
        <SectionLabel>Churn</SectionLabel>



        <SectionCard title="Monthly Churn Rate, Quarterly Trend (%)">
          <p style={{ fontSize: 12, color: MUTED, margin: "0 0 16px" }}>
            Lower churn = stronger retention. Netflix password-sharing enforcement (Q3'23–Q4'23) improved retention materially.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={churnQ} margin={{ top: 4, right: 80, bottom: 4, left: 8 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="q" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `${v}%`} domain={[0, 6]} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend("line")} />
              <ReferenceLine x="Q3'23" stroke={NETFLIX} strokeDasharray="4 2" strokeWidth={1}
                label={{ value: "PW sharing crackdown", position: "top", fontSize: 10, fill: NETFLIX }} />
              <Line dataKey="Netflix"   stroke={NETFLIX}   strokeWidth={2.5} dot={false} label={endLabel("Netflix",   NETFLIX,   12)} />
              <Line dataKey="Amazon"    stroke={AMAZON}    strokeWidth={2}   dot={false} label={endLabel("Amazon",    AMAZON,    12)} />
              <Line dataKey="Disney"    stroke={DISNEY}    strokeWidth={2}   dot={false} label={endLabel("Disney",    DISNEY,    12)} />
              <Line dataKey="Max"       stroke={MAX}       strokeWidth={2}   dot={false} label={endLabel("Max",       MAX,       12)} />
              <Line dataKey="Paramount" stroke={PARAMOUNT} strokeWidth={2}   dot={false} label={endLabel("Paramount", PARAMOUNT, 12)} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { name: "Netflix",    color: NETFLIX,    val: latestChurn.Netflix,    note: "Ad-tier growth improving long-term retention; PW crackdown drove near-term improvement" },
            { name: "Amazon*",    color: AMAZON,     val: latestChurn.Amazon,     note: "Industry-low churn driven by Prime shipping/music bundle lock-in" },
            { name: "Disney+",    color: DISNEY,     val: latestChurn.Disney,     note: "Improved from ~4% highs in 2023 as content investment stabilized" },
            { name: "Max",        color: MAX,        val: latestChurn.Max,        note: "Declining steadily as bundling with Disney+ reduces churn pressure" },
            { name: "Paramount+", color: PARAMOUNT,  val: latestChurn.Paramount,  note: "Largest churn improvement among peers, down from ~5.2% in 2023" },
          ].map(s => (
            <div key={s.name} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.color, marginBottom: 6 }}>{s.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: DARK, lineHeight: 1 }}>{s.val.toFixed(1)}%</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>monthly churn, Q4 2025 est.</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>{s.note}</div>
            </div>
          ))}
        </div>


        {/* Footer */}
        <div style={{ borderTop: `1px solid ${GRID}`, paddingTop: 14 }}>
          <button
            onClick={() => setSourcesOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: sourcesOpen ? 14 : 0 }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: DARK }}>Sources & Data Transparency</span>
            <span style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>{sourcesOpen ? "▲ collapse" : "▼ expand"}</span>
          </button>

          {sourcesOpen && (
            <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 12px" }}>
                <strong style={{ color: DARK }}>Primary filings:</strong> Netflix shareholder letters Q1 2023–Q4 2025; Disney earnings reports (FQ calendar-aligned); WBD/Max earnings releases; Amazon annual reports (Subscription Services segment); Paramount Global / Skydance earnings releases Q1 2023–Q4 2025. ARM calculated as: Quarterly Revenue ÷ (3 × Avg Paid Members).
              </p>

              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>Churn Data Disclaimer</div>
                <div style={{ fontSize: 11, color: "#78350F", lineHeight: 1.6 }}>
                  <strong>None of these companies officially report monthly churn.</strong> All figures are third-party analyst estimates sourced from Antenna and YipitData, based on credit card transaction panels and survey data. Treat as directional, not precise.
                  <br />* Amazon Prime churn reflects the full Prime membership (shipping + video + music), not video-only cancellations. Amazon's low churn (~0.5%) is largely a function of bundle lock-in, not content retention.
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 12 }}>
                {[
                  { name: "Netflix", color: NETFLIX, rows: [
                    { label: "Subscribers", value: "Public filings through Q1'25. Q2–Q4'25 are Ampere Analysis estimates — Netflix stopped disclosing paid memberships after Q1'25." },
                    { label: "Revenue", value: "Public (10-Q / 10-K)." },
                    { label: "ARM", value: "Calculated. Derivable from public data; not directly reported." },
                    { label: "Churn", value: "Not officially disclosed. Estimates from Antenna / YipitData credit card transaction panels. Treat as directional." },
                  ]},
                  { name: "Amazon Prime", color: AMAZON, rows: [
                    { label: "Subscribers", value: "Not from public filings. Amazon has never disclosed Prime Video-only subscribers. ~230M figures are analyst estimates (Antenna, MoffettNathanson). Last confirmed: 200M in April 2021." },
                    { label: "Revenue", value: "Public, but Subscription Services segment covers Prime + Music + Audible. Not video-only." },
                    { label: "ARM", value: "Calculated from blended segment. Not comparable to pure streaming ARM." },
                    { label: "Churn", value: "Reflects full Prime membership cancellations, not video-only. Unusually low (~0.5%) due to bundle lock-in with shipping and other services." },
                  ]},
                  { name: "Disney+", color: DISNEY, rows: [
                    { label: "Subscribers", value: "Public (earnings reports). Core Disney+ excluding Hotstar since Q4'23 reclassification." },
                    { label: "Revenue", value: "Public (DTC segment), blended with Hulu SVOD from FY2024." },
                    { label: "ARM", value: "Calculated. Includes Hulu in DTC blend, not a pure Disney+ figure." },
                    { label: "Churn", value: "Not officially disclosed. Estimates from Antenna / YipitData. Elevated in 2023 due to Hotstar reclassification and content gaps; improving since Q1'24." },
                  ]},
                  { name: "Max", color: MAX, rows: [
                    { label: "Subscribers", value: "Public (WBD earnings releases)." },
                    { label: "Revenue", value: "Public (DTC segment)." },
                    { label: "ARM", value: "Calculated from public figures." },
                    { label: "Churn", value: "Not officially disclosed. Estimates from Antenna. Declining trend as Disney+ bundle reduces cancellation pressure." },
                  ]},
                  { name: "Paramount+", color: PARAMOUNT, rows: [
                    { label: "Subscribers", value: "Public (earnings releases)." },
                    { label: "Revenue", value: "Public, but DTC segment includes Pluto TV ad revenue. Not pure SVOD." },
                    { label: "ARM", value: "Calculated. Slightly inflated by Pluto TV ad revenue in the segment." },
                    { label: "Churn", value: "Estimates from Antenna / Sci-Tech Today. Highest churn among peers historically (~5%+), but showing the largest improvement — down to ~3.2% by Q4'25 driven by Showtime integration and sports rights." },
                  ]},
                ].map(c => (
                  <div key={c.name} style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${c.color}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 8 }}>{c.name}</div>
                    {c.rows.map(r => (
                      <div key={r.label} style={{ marginBottom: 7 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, color: DARK, marginBottom: 2 }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
