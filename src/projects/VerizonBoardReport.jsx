import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import { useWireless } from "./WirelessContext.js";
import { SCENARIOS, getScenarioMetrics } from "./WirelessShared.js";

const C = {
  red:   "#CD040B",
  navy:  "#0B1628",
  amber: "#C9A84C",
  green: "#16A34A",
  muted: "#9BA3B8",
  grid:  "#E8EAF0",
  bg:    "#F8F9FF",
  text:  "#374151",
};

const card = {
  background: "#fff",
  borderRadius: 10,
  boxShadow: "0 2px 10px rgba(11,22,40,0.07)",
};

const sectionLabel = (text) => (
  <div style={{
    fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
    color: C.amber, textTransform: "uppercase", marginBottom: 20,
    fontFamily: "'Outfit', sans-serif",
  }}>
    {text}
  </div>
);

// ── Section 1: Header ──────────────────────────────────────────────────────────
function Header() {
  return (
    <div style={{ background: C.red, padding: "36px 40px" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>
        Verizon — Internal Board Report
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 34, color: "#fff", fontWeight: 700, marginBottom: 8 }}>
        Wireless Competitive Strategy
      </div>
      <div style={{ fontSize: 14, color: "#fff", opacity: 0.8, marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>
        FY2025 Performance Review &amp; Strategic Priorities for FY2026–FY2027
      </div>
      <div style={{ fontSize: 12, color: "#fff", opacity: 0.55, fontFamily: "'Outfit', sans-serif" }}>
        Prepared by: FP&amp;A — Wireless Strategy | March 2026
      </div>
    </div>
  );
}

// ── Section 2: KPI Snapshot ────────────────────────────────────────────────────
const kpis = [
  { label: "Wireless Service Revenue", value: "$83.7B", note: "FY2025 · #1 in industry",        sub: "+5.0% YoY" },
  { label: "Postpaid Phone Net Adds",  value: "+362K",  note: "FY2025 full year",               sub: "Q4 2025: +616K, best quarter since 2019" },
  { label: "Postpaid Phone ARPU",      value: "$57.56", note: "FY2025 avg · industry-leading",  sub: "$7.24 premium vs T-Mobile" },
  { label: "Q4 2025 Net Adds",         value: "+616K",  note: "Best quarter since 2019",        sub: "Strong Q4 momentum" },
];

function KPISnapshot() {
  return (
    <div style={{ background: "#fff", padding: "36px 40px" }}>
      {sectionLabel("FY2025 At a Glance")}
      <div style={{ display: "flex", gap: 16 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...card, flex: 1, borderTop: `3px solid ${C.red}`, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
              {k.label}
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: C.navy, fontWeight: 700, lineHeight: 1.1, marginBottom: 4 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 12, color: C.navy, marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>{k.note}</div>
            <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>{k.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section 3: Competitive Context ────────────────────────────────────────────
const revenueData = [
  { year: "FY2022", VZ: 74.5, Peers: 60.9 },
  { year: "FY2023", VZ: 76.7, Peers: 63.2 },
  { year: "FY2024", VZ: 79.1, Peers: 65.9 },
  { year: "FY2025", VZ: 83.7, Peers: 69.4 },
];

// Total postpaid phone net adds (Consumer + Business segments)
const netAddsData = [
  { year: "FY2022", adds: 201  },
  { year: "FY2023", adds: 430  },
  { year: "FY2024", adds: 887  },
  { year: "FY2025", adds: 362  },
];

const netAddColors = ["#FFCDD2", "#FFADB0", C.red, "#FF6B6B"];

function CompetitiveContext() {
  return (
    <div style={{ background: "#F4F5F8", padding: "36px 40px" }}>
      {sectionLabel("Competitive Context")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <div style={{ ...card, padding: "24px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
            Annual Wireless Service Revenue ($B)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} domain={[50, 95]} />
              <Tooltip contentStyle={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} formatter={(v, name) => [`$${v}B`, name]} />
              <Legend wrapperStyle={{ fontFamily: "'Outfit', sans-serif", fontSize: 12 }} formatter={(v) => v === "VZ" ? "Verizon" : "Competitor Avg"} />
              <Line dataKey="VZ" stroke={C.red} strokeWidth={2.5} dot={false} />
              <Line dataKey="Peers" stroke={C.muted} strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 10, fontFamily: "'Outfit', sans-serif" }}>
            Peer avg = T-Mobile + AT&amp;T average
          </div>
        </div>

        <div style={{ ...card, padding: "24px 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 16, fontFamily: "'Outfit', sans-serif" }}>
            Verizon Postpaid Phone Net Adds (K)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={netAddsData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.muted, fontFamily: "'Outfit', sans-serif" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, borderRadius: 6, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} formatter={(v) => [`${v}K`, "Net Adds"]} />
              <ReferenceLine y={0} stroke={C.navy} strokeWidth={1.5} />
              <Bar dataKey="adds" radius={[4, 4, 0, 0]}>
                {netAddsData.map((_, i) => <Cell key={i} fill={netAddColors[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}

// ── Section 4: Strategic Priorities ───────────────────────────────────────────
const priorities = [
  {
    id: "P1",
    title: "Sustain Net Add Momentum",
    body: "Build on Q4 2025's +616K result — the strongest quarterly performance since 2019 — by codifying the acquisition playbook and targeting competitor switchers in underserved markets. Every +100K incremental quarterly net adds generates ~$69M in annualized postpaid phone revenue at current ARPU.",
    impact: "+$200–280M incremental revenue potential by FY2027",
  },
  {
    id: "P2",
    title: "Accelerate FWA–Wireless Bundle",
    body: "Verizon's Fixed Wireless Access product creates unique multi-product households where wireless churn is materially lower. Formalize FWA + wireless bundles to deepen switching costs and grow household ARPU. Target 500K new FWA-wireless bundled households in FY2026.",
    impact: "Est. 8–12% churn reduction on bundled wireless lines",
  },
  {
    id: "P3",
    title: "Defend ARPU Premium",
    body: "The $7.24 ARPU gap over T-Mobile translates to ~$7.9B in annual incremental revenue across our 91M subscriber base. Protect it through premium tier upsell (myPlan Ultimate), bundled perks, and device financing incentives to keep customers on high-value plans.",
    impact: "+$0.60–$1.20 ARPU potential from premium tier migration",
  },
  {
    id: "P4",
    title: "Protect Enterprise Wireless",
    body: "Verizon's business wireless segment generates higher ARPU and 30–40% lower churn than consumer — making it a structurally superior revenue base. T-Mobile is actively targeting mid-market enterprises; counter with private 5G solutions and dedicated B2B retention programs.",
    impact: "Structural churn advantage; higher ARPU than consumer",
  },
  {
    id: "P5",
    title: "AI-Powered Churn Prevention",
    body: "FY2025 churn of 0.92% is 4bp above FY2024. At our 91M subscriber base, each 1bp reduction in monthly churn preserves ~109K annual subscribers (~$75M revenue). Deploy ML churn propensity models using usage, billing, and device signals to engage at-risk customers 60–90 days before their churn window.",
    impact: "1bp churn reduction = ~$75M annualized revenue retained",
  },
];

function StrategicPriorities() {
  return (
    <div style={{ background: "#fff", padding: "36px 40px" }}>
      {sectionLabel("5 Strategic Priorities for FY2026–FY2027")}
      {priorities.map((p) => (
        <div key={p.id} style={{ ...card, borderLeft: `4px solid ${C.red}`, borderRadius: 6, padding: "18px 20px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ background: C.red, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.05em" }}>
              {p.id}
            </span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: C.navy, fontWeight: 700 }}>{p.title}</span>
          </div>
          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7, marginBottom: 10, fontFamily: "'Outfit', sans-serif" }}>{p.body}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.amber, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.05em" }}>EXPECTED IMPACT</span>
            <span style={{ fontSize: 12, color: C.navy, fontFamily: "'Outfit', sans-serif" }}>{p.impact}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Section 5: Financial Outlook (live-synced to scenario) ────────────────────
const SCENARIO_LABELS = { bear: "Bear", base: "Base", bull: "Bull", custom: "Custom" };
const SCENARIO_COLORS = { bear: "#ef4444", base: C.navy, bull: "#16a34a", custom: "#7c3aed" };

// Fixed "with Initiatives" targets (management aspirations, not scenario-driven)
const WITH_INIT = {
  rev26: "$87.5B", rev27: "$91.8B",
  adds26: "+600K", adds27: "+800K",
  arpu26: "$58.20", arpu27: "$58.90",
  churn26: "0.88%", churn27: "0.86%",
  upside26: "+$1.2B", upside27: "+$2.7B",
};

function FinancialOutlook() {
  const { scenario, customDrivers } = useWireless();

  const drivers = scenario === "custom" ? customDrivers : SCENARIOS[scenario];
  const m = getScenarioMetrics(drivers);

  const scenarioLabel = SCENARIO_LABELS[scenario] || "Base";
  const scenarioColor = SCENARIO_COLORS[scenario] || C.navy;

  const fmtAdds = (v) => `${v >= 0 ? "+" : ""}${v}K`;
  const fmtArpu = (v) => `$${v.toFixed(2)}`;
  const fmtChurn = (v) => `${v.toFixed(2)}%`;

  const tableRows = [
    {
      metric: "Postpaid Phone Revenue",
      fy25: "$62.6B",
      b26: `$${m.rev26}B`, i26: WITH_INIT.rev26,
      b27: `$${m.rev27}B`, i27: WITH_INIT.rev27,
      isUpside: false,
    },
    {
      metric: "Phone Net Adds",
      fy25: "+362K",
      b26: fmtAdds(m.netAdds26), i26: WITH_INIT.adds26,
      b27: fmtAdds(m.netAdds27), i27: WITH_INIT.adds27,
      isUpside: false,
    },
    {
      metric: "Postpaid ARPU",
      fy25: "$57.56",
      b26: fmtArpu(m.arpu26), i26: WITH_INIT.arpu26,
      b27: fmtArpu(m.arpu27), i27: WITH_INIT.arpu27,
      isUpside: false,
    },
    {
      metric: "Phone Churn (avg)",
      fy25: "0.92%",
      b26: fmtChurn(m.churn26), i26: WITH_INIT.churn26,
      b27: fmtChurn(m.churn27), i27: WITH_INIT.churn27,
      isUpside: false,
    },
    {
      metric: "Upside vs Scenario",
      fy25: "—",
      b26: "—", i26: WITH_INIT.upside26,
      b27: "—", i27: WITH_INIT.upside27,
      isUpside: true,
    },
  ];

  const thStyle = (tint) => ({
    background: tint ? "#FFF5F5" : C.navy,
    color: tint ? C.navy : "#fff",
    fontSize: 11, fontWeight: 700,
    padding: "10px 16px", textAlign: "left",
    fontFamily: "'Outfit', sans-serif",
  });

  return (
    <div style={{ background: "#F4F5F8", padding: "36px 40px" }}>
      {sectionLabel("Financial Outlook")}

      {/* Scenario badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Outfit', sans-serif" }}>
          Forecast scenario:
        </span>
        <span style={{
          background: scenarioColor, color: "#fff",
          fontSize: 12, fontWeight: 700, padding: "3px 14px",
          borderRadius: 20, fontFamily: "'Outfit', sans-serif",
        }}>
          {scenarioLabel}
        </span>
        <span style={{ fontSize: 11, color: "#16a34a", fontFamily: "'Outfit', sans-serif", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
          ⟳ Live — synced from Wireless Revenue Forecast
        </span>
      </div>

      <div style={{ ...card, overflow: "hidden", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Metric",
                "FY2025A",
                `FY2026E (${scenarioLabel})`,
                "FY2026E (w/ Initiatives)",
                `FY2027E (${scenarioLabel})`,
                "FY2027E (w/ Initiatives)",
              ].map((h, i) => (
                <th key={h} style={thStyle(i === 3 || i === 5)}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((r, idx) => {
              const rowBg = r.isUpside ? "#FFFBEB" : idx % 2 === 0 ? "#fff" : "#F9FAFB";
              const cellBase = { fontSize: 13, padding: "11px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: r.isUpside ? 700 : 400 };
              return (
                <tr key={r.metric}>
                  <td style={{ ...cellBase, background: rowBg, color: C.navy }}>{r.metric}</td>
                  <td style={{ ...cellBase, background: rowBg, color: C.muted }}>{r.fy25}</td>
                  <td style={{ ...cellBase, background: rowBg, color: scenarioColor, fontWeight: 600 }}>{r.b26}</td>
                  <td style={{ ...cellBase, background: r.isUpside ? "#FFFBEB" : "#FFF5F5", color: C.navy }}>{r.i26}</td>
                  <td style={{ ...cellBase, background: rowBg, color: scenarioColor, fontWeight: 600 }}>{r.b27}</td>
                  <td style={{ ...cellBase, background: r.isUpside ? "#FFFBEB" : "#FFF5F5", color: C.navy }}>{r.i27}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { text: "Revenue Target: $91.8B by FY2027",          bg: C.red,   color: "#fff" },
          { text: "Net Adds Target: +800K annually by FY2027", bg: C.amber, color: "#fff" },
          { text: "Churn Goal: <0.86% monthly by FY2027",      bg: C.green, color: "#fff" },
        ].map((pill) => (
          <div key={pill.text} style={{ background: pill.bg, color: pill.color, fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 20, fontFamily: "'Outfit', sans-serif" }}>
            {pill.text}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <div style={{ background: C.navy, padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif" }}>
        Source: Company earnings releases Q1 2023–Q4 2025. Internal illustrative scenarios — not guidance.
      </span>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", textAlign: "right" }}>
        Verizon FP&amp;A — Wireless Strategy | March 2026 | CONFIDENTIAL
      </span>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export default function VerizonBoardReport() {
  return (
    <div style={{ background: C.bg, fontFamily: "'Outfit', sans-serif", minHeight: "100vh" }}>
      <Header />
      <KPISnapshot />
      <CompetitiveContext />
      <StrategicPriorities />
      <FinancialOutlook />
      <Footer />
    </div>
  );
}
