import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ── Brand colors ──────────────────────────────────────────────
const C = {
  VZ: "#CD040B",
  TMO: "#E20074",
  ATT: "#00A8E0",
  navy: "#0B1628",
  bg: "#F8F9FF",
  grid: "#E8EAF0",
  tickFill: "#6B7490",
};

// ── Data ──────────────────────────────────────────────────────
const revenueQ = [
  { q: "Q1'23", VZ: 18.97, TMO: 15.49, ATT: 14.87 },
  { q: "Q2'23", VZ: 19.19, TMO: 15.86, ATT: 15.06 },
  { q: "Q3'23", VZ: 19.37, TMO: 16.17, ATT: 15.27 },
  { q: "Q4'23", VZ: 19.48, TMO: 16.36, ATT: 15.37 },
  { q: "Q1'24", VZ: 19.51, TMO: 16.52, ATT: 15.48 },
  { q: "Q2'24", VZ: 19.74, TMO: 16.70, ATT: 15.73 },
  { q: "Q3'24", VZ: 19.77, TMO: 16.78, ATT: 15.96 },
  { q: "Q4'24", VZ: 20.03, TMO: 16.89, ATT: 16.65 },
  { q: "Q1'25", VZ: 20.80, TMO: 16.90, ATT: 16.70 },
  { q: "Q2'25", VZ: 20.90, TMO: 17.40, ATT: 16.90 },
  { q: "Q3'25", VZ: 21.00, TMO: 18.20, ATT: 16.90 },
  { q: "Q4'25", VZ: 21.00, TMO: 18.70, ATT: 17.00 },
];

const revenueA = [
  { year: "FY2022", VZ: 74.5, TMO: 57.0, ATT: 57.2 },
  { year: "FY2023", VZ: 76.7, TMO: 60.5, ATT: 60.9 },
  { year: "FY2024", VZ: 79.7, TMO: 63.7, ATT: 63.8 },
  { year: "FY2025", VZ: 83.7, TMO: 71.2, ATT: 67.5 },
];

const netAddsQ = [
  { q: "Q1'23", VZ: -127, TMO: 526, ATT: 402 },
  { q: "Q2'23", VZ: -36, TMO: 760, ATT: 326 },
  { q: "Q3'23", VZ: -49, TMO: 850, ATT: 425 },
  { q: "Q4'23", VZ: -68, TMO: 934, ATT: 526 },
  { q: "Q1'24", VZ: -68, TMO: 532, ATT: 349 },
  { q: "Q2'24", VZ: -83, TMO: 778, ATT: 617 },
  { q: "Q3'24", VZ: -102, TMO: 865, ATT: 403 },
  { q: "Q4'24", VZ: -51, TMO: 903, ATT: 827 },
  { q: "Q1'25", VZ: -289, TMO: 495, ATT: 324 },
  { q: "Q2'25", VZ:   -9, TMO: 830, ATT: 401 },
  { q: "Q3'25", VZ:   44, TMO: 1000, ATT: 405 },
  { q: "Q4'25", VZ:  616, TMO: 962, ATT: 421 },
];

const netAddsA = [
  { year: "FY2022", VZ: -158, TMO: 3002, ATT: 2911 },
  { year: "FY2023", VZ: -280, TMO: 3070, ATT: 1679 },
  { year: "FY2024", VZ: -304, TMO: 3078, ATT: 2196 },
  { year: "FY2025", VZ: 362, TMO: 3287, ATT: 1551 },
];

const subsQ = [
  { q: "Q1'23", VZ: 91.2, TMO: 76.1, ATT: 82.5 },
  { q: "Q2'23", VZ: 91.2, TMO: 76.9, ATT: 82.8 },
  { q: "Q3'23", VZ: 91.1, TMO: 77.7, ATT: 83.3 },
  { q: "Q4'23", VZ: 91.0, TMO: 78.6, ATT: 83.8 },
  { q: "Q1'24", VZ: 90.9, TMO: 79.1, ATT: 84.1 },
  { q: "Q2'24", VZ: 90.9, TMO: 79.9, ATT: 84.8 },
  { q: "Q3'24", VZ: 90.8, TMO: 80.7, ATT: 85.2 },
  { q: "Q4'24", VZ: 90.7, TMO: 81.6, ATT: 86.0 },
  { q: "Q1'25", VZ: 90.4, TMO: 82.1, ATT: 86.3 },
  { q: "Q2'25", VZ: 90.4, TMO: 82.9, ATT: 86.7 },
  { q: "Q3'25", VZ: 90.4, TMO: 83.9, ATT: 87.1 },
  { q: "Q4'25", VZ: 91.1, TMO: 84.9, ATT: 87.6 },
];

const subsA = [
  { year: "2022", VZ: 91.3, TMO: 75.6, ATT: 82.0 },
  { year: "2023", VZ: 91.0, TMO: 78.6, ATT: 83.8 },
  { year: "2024", VZ: 90.7, TMO: 81.6, ATT: 86.0 },
  { year: "2025", VZ: 91.1, TMO: 84.9, ATT: 87.6 },
];

const churnQ = [
  { q: "Q1'23", VZ: 0.87, TMO: 0.84, ATT: 0.80 },
  { q: "Q2'23", VZ: 0.88, TMO: 0.83, ATT: 0.77 },
  { q: "Q3'23", VZ: 0.87, TMO: 0.82, ATT: 0.80 },
  { q: "Q4'23", VZ: 0.88, TMO: 0.87, ATT: 0.83 },
  { q: "Q1'24", VZ: 0.89, TMO: 0.86, ATT: 0.82 },
  { q: "Q2'24", VZ: 0.87, TMO: 0.87, ATT: 0.77 },
  { q: "Q3'24", VZ: 0.87, TMO: 0.88, ATT: 0.79 },
  { q: "Q4'24", VZ: 0.89, TMO: 0.86, ATT: 0.78 },
  { q: "Q1'25", VZ: 0.90, TMO: 0.91, ATT: 0.83 },
  { q: "Q2'25", VZ: 0.90, TMO: 0.90, ATT: 0.87 },
  { q: "Q3'25", VZ: 0.91, TMO: 0.89, ATT: 0.92 },
  { q: "Q4'25", VZ: 0.95, TMO: 1.02, ATT: 0.98 },
];

const arpuQ = [
  { q: "Q1'23", VZ: 55.83, TMO: 47.44, ATT: 55.03 },
  { q: "Q2'23", VZ: 56.13, TMO: 47.84, ATT: 55.39 },
  { q: "Q3'23", VZ: 56.21, TMO: 48.24, ATT: 55.59 },
  { q: "Q4'23", VZ: 56.54, TMO: 48.83, ATT: 55.62 },
  { q: "Q1'24", VZ: 56.69, TMO: 49.20, ATT: 55.78 },
  { q: "Q2'24", VZ: 56.89, TMO: 49.45, ATT: 56.04 },
  { q: "Q3'24", VZ: 56.88, TMO: 49.63, ATT: 56.30 },
  { q: "Q4'24", VZ: 57.26, TMO: 49.78, ATT: 56.28 },
  { q: "Q1'25", VZ: 57.40, TMO: 49.90, ATT: 56.56 },
  { q: "Q2'25", VZ: 57.65, TMO: 50.62, ATT: 57.04 },
  { q: "Q3'25", VZ: 57.80, TMO: 50.20, ATT: 56.64 },
  { q: "Q4'25", VZ: 57.56, TMO: 50.71, ATT: 56.47 },
];

// ── Shared chart props ────────────────────────────────────────
const gridProps = { stroke: C.grid, strokeDasharray: "3 3" };
const tickStyle = { fontSize: 11, fill: C.tickFill };
const legendStyle = { wrapperStyle: { fontSize: 12 } };
const lineProps = { strokeWidth: 2.5, dot: false };

// ── KPI Snapshot Cards ────────────────────────────────────────
const kpiCards = [
  { label: "Revenue Leader",   value: "Verizon $21.0B",   note: "Q4 2025 wireless service revenue", color: C.VZ  },
  { label: "Net Adds Leader",  value: "T-Mobile +962K",   note: "Q4 2025 postpaid phone net adds",   color: C.TMO },
  { label: "Lowest Churn",     value: "Verizon 0.90%",    note: "Q1–Q2 2025 postpaid phone churn",   color: C.VZ  },
  { label: "ARPU Leader",      value: "AT&T $57.04",      note: "Q2 2025 peak postpaid phone ARPU",  color: C.ATT },
  { label: "Fastest Growing",  value: "T-Mobile +3.3M",   note: "Postpaid phone net adds in FY2025", color: C.TMO },
];

// ── Annual summary table data ─────────────────────────────────
const tableSections = [
  {
    metric: "Wireless Service Revenue ($B)",
    rows: [
      { year: "FY2023", VZ: "76.7", TMO: "60.5", ATT: "60.9", leader: { label: "Verizon", color: C.VZ } },
      { year: "FY2024", VZ: "79.7", TMO: "63.7", ATT: "63.8", leader: { label: "Verizon", color: C.VZ } },
      { year: "FY2025", VZ: "83.7", TMO: "71.2", ATT: "67.5", leader: { label: "Verizon", color: C.VZ } },
      { year: "YoY %",  VZ: "+5.0%", TMO: "+11.7%", ATT: "+5.8%", leader: { label: "T-Mobile", color: C.TMO }, highlight: true },
    ],
  },
  {
    metric: "Postpaid Phone Subscribers (M)",
    rows: [
      { year: "2023", VZ: "91.0", TMO: "78.6", ATT: "83.8", leader: { label: "Verizon", color: C.VZ } },
      { year: "2024", VZ: "90.7", TMO: "81.6", ATT: "86.0", leader: { label: "Verizon", color: C.VZ } },
      { year: "2025", VZ: "91.1", TMO: "84.9", ATT: "87.6", leader: { label: "Verizon", color: C.VZ } },
      { year: "YoY Δ", VZ: "+0.4M", TMO: "+3.3M", ATT: "+1.6M", leader: { label: "T-Mobile", color: C.TMO }, highlight: true },
    ],
  },
  {
    metric: "Postpaid Phone Net Adds (K)",
    rows: [
      { year: "FY2023", VZ: "-280",  TMO: "3,070", ATT: "1,679", leader: { label: "T-Mobile", color: C.TMO } },
      { year: "FY2024", VZ: "-304",  TMO: "3,078", ATT: "2,196", leader: { label: "T-Mobile", color: C.TMO } },
      { year: "FY2025", VZ: "+362",  TMO: "3,287", ATT: "1,551", leader: { label: "T-Mobile", color: C.TMO } },
      { year: "YoY Δ",  VZ: "+666K", TMO: "+209K", ATT: "-645K", leader: { label: "Verizon", color: C.VZ }, highlight: true },
    ],
  },
  {
    metric: "Postpaid Phone Churn (%)",
    rows: [
      { year: "FY2023", VZ: "0.88", TMO: "0.85", ATT: "0.80", leader: { label: "AT&T", color: C.ATT } },
      { year: "FY2024", VZ: "0.88", TMO: "0.87", ATT: "0.79", leader: { label: "AT&T", color: C.ATT } },
      { year: "FY2025", VZ: "0.92", TMO: "0.93", ATT: "0.90", leader: { label: "AT&T", color: C.ATT } },
      { year: "YoY Δ",  VZ: "+0.04pp", TMO: "+0.06pp", ATT: "+0.11pp", leader: { label: "Verizon", color: C.VZ }, highlight: true },
    ],
  },
  {
    metric: "Postpaid Phone ARPU ($)",
    rows: [
      { year: "FY2023", VZ: "56.41", TMO: "48.35", ATT: "55.56", leader: { label: "Verizon", color: C.VZ } },
      { year: "FY2024", VZ: "57.18", TMO: "49.52", ATT: "56.10", leader: { label: "Verizon", color: C.VZ } },
      { year: "FY2025", VZ: "57.60", TMO: "50.36", ATT: "56.68", leader: { label: "Verizon", color: C.VZ } },
      { year: "YoY %",  VZ: "+0.7%", TMO: "+1.7%", ATT: "+1.0%", leader: { label: "T-Mobile", color: C.TMO }, highlight: true },
    ],
  },
];

// ── Insight cards data ────────────────────────────────────────
const insights = [
  {
    title: "Revenue: Verizon Leads, But Gap is Closing",
    borderColor: C.VZ,
    body: "Verizon's $83.7B in FY2025 wireless service revenue maintains its lead, but T-Mobile ($71.2B) and AT&T ($67.5B) are closing the gap. T-Mobile's +11.7% YoY growth was the fastest of the three, driven by continued subscriber gains and ARPU expansion. Verizon's edge stems from a premium pricing strategy and a large enterprise/business customer base, but the revenue gap is narrowing as T-Mobile and AT&T scale their postpaid bases.",
  },
  {
    title: "Subscriber Growth: T-Mobile is the Clear Winner",
    borderColor: C.TMO,
    body: "T-Mobile added 3.3M postpaid phone customers in FY2025, extending its lead as the industry's net adds champion. Verizon staged a notable recovery, turning positive with +362K net adds for the full year after three consecutive years of losses—highlighted by a Q4 2025 surge of 616K, the highest quarterly result since 2019. AT&T added 1,551K for the year, a moderation from its strong FY2024 performance.",
  },
  {
    title: "Churn: AT&T Has Made the Biggest Improvement",
    borderColor: C.ATT,
    body: "Industry churn rose across all three carriers in Q4 2025, driven by seasonal promotions and competitive intensity. Despite the uptick, AT&T maintained the best annual average churn at 0.90% in FY2025, reflecting continued strength in network quality and bundling with FirstNet. T-Mobile's Q4 2025 churn of 1.02% was notably elevated, suggesting heightened competitive pressure in the back half of the year.",
  },
  {
    title: "ARPU: Premium Pricing Powers Verizon's Revenue",
    borderColor: C.VZ,
    body: "In FY2025, Verizon led with an average ARPU of $57.60, followed closely by AT&T at $56.68, and T-Mobile at $50.36. T-Mobile's lower ARPU reflects its value-market positioning, but its +1.7% YoY growth rate was the fastest of the three, narrowing the gap. AT&T's Q2 2025 ARPU peaked at $57.04, briefly eclipsing Verizon, as all three carriers benefit from customers migrating to premium unlimited tiers.",
  },
];

// ── Utility styles ────────────────────────────────────────────
const s = {
  fontFamily: "'Outfit', sans-serif",
  sectionHeading: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 26,
    fontWeight: 700,
    color: C.navy,
    margin: "0 0 20px 0",
  },
  chartTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    color: "#3D4461",
    marginBottom: 8,
  },
};

// ── Sub-components ────────────────────────────────────────────
function ChartCard({ title, children }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "20px 16px 12px",
        boxShadow: "0 1px 4px rgba(11,22,40,0.07)",
        flex: 1,
        minWidth: 0,
      }}
    >
      {title && <div style={s.chartTitle}>{title}</div>}
      {children}
    </div>
  );
}

function SectionWrap({ children, style }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "28px 28px 24px",
        boxShadow: "0 1px 6px rgba(11,22,40,0.07)",
        marginBottom: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function TelecomAnalysis() {
  const [activeTab, setActiveTab] = useState("Revenue");
  const tabs = ["Revenue", "Subscribers", "Net Adds", "Churn", "ARPU"];

  return (
    <div
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: C.bg,
        minHeight: "100vh",
        padding: "0 0 60px",
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        style={{
          background: C.navy,
          padding: "40px 36px 32px",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 34,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.3px",
              marginBottom: 6,
            }}
          >
            U.S. Wireless Competitive Analysis — Postpaid Phone
          </div>
          <div
            style={{
              fontSize: 15,
              color: "#A8B4CC",
              marginBottom: 20,
              fontWeight: 400,
            }}
          >
            Verizon · T-Mobile · AT&amp;T — Postpaid Phone KPIs · Q1 2023–Q4 2025
          </div>
          {/* Legend badges */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { name: "Verizon", color: C.VZ },
              { name: "T-Mobile", color: C.TMO },
              { name: "AT&T", color: C.ATT },
            ].map((co) => (
              <span
                key={co.name}
                style={{
                  background: co.color,
                  color: "#fff",
                  borderRadius: 20,
                  padding: "4px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.2px",
                }}
              >
                {co.name}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#6B7490" }}>
            Source: Company earnings releases. Postpaid phone metrics. Figures are approximate.
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        {/* ── KPI Snapshot Cards ───────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {kpiCards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "18px 16px 16px",
                boxShadow: "0 1px 4px rgba(11,22,40,0.07)",
                borderTop: `3px solid ${card.color}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: card.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.6px",
                  marginBottom: 8,
                }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.navy,
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}
              >
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: C.tickFill }}>{card.note}</div>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ───────────────────────────────── */}
        <SectionWrap>
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  background: activeTab === tab ? C.navy : "#F0F1F5",
                  color: activeTab === tab ? "#fff" : "#3D4461",
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Revenue Tab ─────────────────────────────────── */}
          {activeTab === "Revenue" && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <ChartCard title="Quarterly Wireless Service Revenue ($B)">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueQ} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="q" tick={tickStyle} />
                    <YAxis domain={[14, 21]} tick={tickStyle} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip formatter={(v) => [`$${v.toFixed(2)}B`]} />
                    <Legend {...legendStyle} />
                    <Line dataKey="VZ" name="Verizon" stroke={C.VZ} {...lineProps} />
                    <Line dataKey="TMO" name="T-Mobile" stroke={C.TMO} {...lineProps} />
                    <Line dataKey="ATT" name="AT&T" stroke={C.ATT} {...lineProps} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Annual Wireless Service Revenue ($B)">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueA} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="year" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v) => `$${v}B`} />
                    <Tooltip formatter={(v) => [`$${v.toFixed(1)}B`]} />
                    <Legend {...legendStyle} />
                    <Bar dataKey="VZ" name="Verizon" fill={C.VZ} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="TMO" name="T-Mobile" fill={C.TMO} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ATT" name="AT&T" fill={C.ATT} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── Subscribers Tab ──────────────────────────────── */}
          {activeTab === "Subscribers" && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <ChartCard title="Quarterly Postpaid Phone Subscribers (M)">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={subsQ} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="q" tick={tickStyle} />
                    <YAxis domain={[70, 96]} tick={tickStyle} tickFormatter={(v) => `${v}M`} />
                    <Tooltip formatter={(v) => [`${v.toFixed(1)}M`]} />
                    <Legend {...legendStyle} />
                    <Line dataKey="VZ" name="Verizon" stroke={C.VZ} {...lineProps} />
                    <Line dataKey="TMO" name="T-Mobile" stroke={C.TMO} {...lineProps} />
                    <Line dataKey="ATT" name="AT&T" stroke={C.ATT} {...lineProps} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Annual End-of-Year Postpaid Subscribers (M)">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={subsA} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="year" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v) => `${v}M`} />
                    <Tooltip formatter={(v) => [`${v.toFixed(1)}M`]} />
                    <Legend {...legendStyle} />
                    <Bar dataKey="VZ" name="Verizon" fill={C.VZ} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="TMO" name="T-Mobile" fill={C.TMO} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ATT" name="AT&T" fill={C.ATT} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── Net Adds Tab ─────────────────────────────────── */}
          {activeTab === "Net Adds" && (
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <ChartCard title="Quarterly Postpaid Phone Net Adds (K)">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={netAddsQ} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="q" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v) => `${v}K`} />
                    <Tooltip formatter={(v) => [`${v.toLocaleString()}K`]} />
                    <Legend {...legendStyle} />
                    <ReferenceLine y={0} stroke="#3D4461" strokeWidth={1} />
                    <Bar dataKey="VZ" name="Verizon" fill={C.VZ} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="TMO" name="T-Mobile" fill={C.TMO} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ATT" name="AT&T" fill={C.ATT} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Annual Postpaid Phone Net Adds (K)">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={netAddsA} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="year" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v) => `${v}K`} />
                    <Tooltip formatter={(v) => [`${v.toLocaleString()}K`]} />
                    <Legend {...legendStyle} />
                    <ReferenceLine y={0} stroke="#3D4461" strokeWidth={1} />
                    <Bar dataKey="VZ" name="Verizon" fill={C.VZ} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="TMO" name="T-Mobile" fill={C.TMO} radius={[3, 3, 0, 0]} />
                    <Bar dataKey="ATT" name="AT&T" fill={C.ATT} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── Churn Tab ────────────────────────────────────── */}
          {activeTab === "Churn" && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: C.tickFill,
                  marginBottom: 10,
                  fontStyle: "italic",
                }}
              >
                Lower churn = better retention. Industry best practice is below 0.85% monthly.
              </div>
              <ChartCard title="Quarterly Postpaid Phone Churn (%)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={churnQ} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="q" tick={tickStyle} />
                    <YAxis
                      domain={[0.70, 0.95]}
                      tick={tickStyle}
                      tickFormatter={(v) => `${v.toFixed(2)}%`}
                    />
                    <Tooltip formatter={(v) => [`${v.toFixed(2)}%`]} />
                    <Legend {...legendStyle} />
                    <Line dataKey="VZ" name="Verizon" stroke={C.VZ} {...lineProps} />
                    <Line dataKey="TMO" name="T-Mobile" stroke={C.TMO} {...lineProps} />
                    <Line dataKey="ATT" name="AT&T" stroke={C.ATT} {...lineProps} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* ── ARPU Tab ─────────────────────────────────────── */}
          {activeTab === "ARPU" && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: C.tickFill,
                  marginBottom: 10,
                  fontStyle: "italic",
                }}
              >
                T-Mobile's lower ARPU reflects its value-market positioning and customer mix. All three carriers are seeing ARPU expand as customers migrate to premium unlimited tiers.
              </div>
              <ChartCard title="Quarterly Postpaid Phone ARPU ($)">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={arpuQ} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid {...gridProps} />
                    <XAxis dataKey="q" tick={tickStyle} />
                    <YAxis
                      domain={[44, 60]}
                      tick={tickStyle}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip formatter={(v) => [`$${v.toFixed(2)}`]} />
                    <Legend {...legendStyle} />
                    <Line dataKey="VZ" name="Verizon" stroke={C.VZ} {...lineProps} />
                    <Line dataKey="TMO" name="T-Mobile" stroke={C.TMO} {...lineProps} />
                    <Line dataKey="ATT" name="AT&T" stroke={C.ATT} {...lineProps} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}
        </SectionWrap>

        {/* ── Annual Data Summary Table ─────────────────────── */}
        <SectionWrap>
          <h2 style={s.sectionHeading}>Annual Data Summary</h2>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      background: "#F0F1F5",
                      color: "#3D4461",
                      fontWeight: 600,
                      borderRadius: "8px 0 0 0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Metric / Period
                  </th>
                  {[
                    { label: "Verizon", color: C.VZ },
                    { label: "T-Mobile", color: C.TMO },
                    { label: "AT&T", color: C.ATT },
                  ].map((col, i, arr) => (
                    <th
                      key={col.label}
                      style={{
                        padding: "10px 14px",
                        background: col.color,
                        color: "#fff",
                        fontWeight: 600,
                        textAlign: "center",
                        borderRadius:
                          i === arr.length - 1 ? "0 0 0 0" : "0",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th
                    style={{
                      padding: "10px 14px",
                      background: "#F0F1F5",
                      color: "#3D4461",
                      fontWeight: 600,
                      textAlign: "center",
                      borderRadius: "0 8px 0 0",
                    }}
                  >
                    Leader
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableSections.map((section, si) => (
                  <>
                    <tr key={`section-${si}`}>
                      <td
                        colSpan={5}
                        style={{
                          padding: "10px 14px 4px",
                          fontWeight: 700,
                          color: C.navy,
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          background: "#F8F9FF",
                          borderTop: si > 0 ? "2px solid #E8EAF0" : "none",
                        }}
                      >
                        {section.metric}
                      </td>
                    </tr>
                    {section.rows.map((row, ri) => (
                      <tr
                        key={`${si}-${ri}`}
                        style={{
                          background: row.highlight ? "#FFFBF0" : ri % 2 === 0 ? "#fff" : "#FAFBFF",
                        }}
                      >
                        <td
                          style={{
                            padding: "8px 14px",
                            color: row.highlight ? "#6B4C0E" : "#3D4461",
                            fontWeight: row.highlight ? 600 : 400,
                            borderBottom: "1px solid #F0F1F5",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.year}
                        </td>
                        {["VZ", "TMO", "ATT"].map((key) => (
                          <td
                            key={key}
                            style={{
                              padding: "8px 14px",
                              textAlign: "center",
                              color: row.highlight ? "#6B4C0E" : "#1A2340",
                              fontWeight: row.highlight ? 600 : 400,
                              borderBottom: "1px solid #F0F1F5",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {row[key]}
                          </td>
                        ))}
                        <td
                          style={{
                            padding: "8px 14px",
                            textAlign: "center",
                            borderBottom: "1px solid #F0F1F5",
                          }}
                        >
                          <span
                            style={{
                              background: row.leader.color,
                              color: "#fff",
                              borderRadius: 20,
                              padding: "2px 10px",
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.leader.label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrap>

        {/* ── Leadership Analysis ───────────────────────────── */}
        <SectionWrap>
          <h2 style={s.sectionHeading}>Competitive Scorecard — Who's Leading &amp; Why</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {insights.map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  borderLeft: `4px solid ${card.borderColor}`,
                  padding: "18px 18px 16px",
                  boxShadow: "0 1px 3px rgba(11,22,40,0.06)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.navy,
                    marginBottom: 10,
                    lineHeight: 1.4,
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#4A5270",
                    lineHeight: 1.65,
                  }}
                >
                  {card.body}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Verdict */}
          <div
            style={{
              background: C.navy,
              borderRadius: 12,
              padding: "22px 24px",
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18,
                fontWeight: 700,
                color: "#C9A84C",
                marginBottom: 10,
              }}
            >
              Overall Verdict
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#D0D8EA",
                lineHeight: 1.7,
              }}
            >
              2025 was a year of recovery and realignment. Verizon staged a strong comeback in Q4
              2025 with 616K net adds—its highest quarterly result since 2019—signaling that its
              network investments and promotional strategy are finally bearing fruit. T-Mobile
              continued its subscriber dominance with 3.3M net adds in FY2025, and its +11.7%
              revenue growth was far ahead of peers. AT&amp;T maintained consistent growth and the
              best annual churn rate at 0.90%. The competitive landscape is tightening: T-Mobile's
              revenue lead over AT&amp;T is growing, Verizon is fighting back on subscribers, and
              ARPU expansion is the key battleground for all three carriers heading into 2026.
            </div>
          </div>
        </SectionWrap>
      </div>
    </div>
  );
}
