import { useNetflix } from "./NetflixContext.js";
import { SCENARIOS, HISTORICAL, QUARTERS, getScenarioMetrics, getForecast, buildForecast, START } from "./NetflixShared.js";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

/* ─── Colors ─────────────────────────────────────────────────── */
const NF    = "#E50914";
const NAVY  = "#0B1628";
const MUTED = "#6B7280";
const GRID  = "#E5E7EB";
const LIGHT = "#F8F9FA";

const SCENARIO_COLORS = { bear: "#DC2626", consensus: "#1D4ED8", bull: "#16A34A", custom: "#7C3AED" };
const SCENARIO_LABELS = { bear: "Bear",    consensus: "Consensus", bull: "Bull",  custom: "Custom" };

/* ─── Static Board Data ──────────────────────────────────────── */
const kpiCards = [
  { label: "Paid Members",       value: "332M",  sub: "Q4 2025",        change: "+7M QoQ",      up: true },
  { label: "FY2025 Revenue",     value: "$45.2B", sub: "Full Year",     change: "+16% YoY",     up: true },
  { label: "Operating Margin",   value: "29%",    sub: "FY2025",        change: "+2pts YoY",    up: true },
  { label: "Global ARM",         value: "$12.23", sub: "per month",     change: "+4.6% YoY",    up: true },
];

const priorities = [
  {
    title: "Ad-Supported Tier Monetization",
    impact: "+$2–3B by FY2027",
    bullets: [
      "Target 40% of new sign-ups on ad tier by Q4'26",
      "Expand CPM yield and programmatic inventory in UCAN and EMEA",
      "Scale measurement partnerships to capture premium brand budgets",
    ],
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "Live Events & Sports Rights",
    impact: "+$1.5B incremental rev",
    bullets: [
      "Build on NFL/WWE Raw to establish Netflix as a live destination",
      "Pursue FIFA World Cup 2026 streaming rights",
      "Expand live sports in India and LatAm for retention",
    ],
    status: "Strategic Priority",
    statusColor: NF,
  },
  {
    title: "Gaming & Interactive Content",
    impact: "Retention driver",
    bullets: [
      "Scale from 100+ mobile titles toward premium AAA releases",
      "Explore cloud gaming as a competitive moat vs. Disney+ and Max",
      "Target 10M daily active players by FY2026",
    ],
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "ARM Expansion via Pricing",
    impact: "+0.5–1.0% ARM/yr",
    bullets: [
      "Price increases in under-monetized UCAN and EMEA markets",
      "Shift mix toward Standard/Premium tiers",
      "Zero incremental content spend — flows directly to operating income",
    ],
    status: "Ongoing",
    statusColor: "#16A34A",
  },
  {
    title: "Global Market Penetration",
    impact: "+25–40M members",
    bullets: [
      "Target India, SEA, Middle East, and Africa",
      "Mobile-only tiers at sub-$5/mo",
      "Near-term ARM dilution; long-term pricing ladder opportunity",
    ],
    status: "Expanding",
    statusColor: "#16A34A",
  },
];

/* ─── Scenario Charts (moved from Revenue Forecast tab) ─────── */
const axisStyle  = { fontSize: 11, fill: MUTED };
const gridProps  = { stroke: GRID, strokeDasharray: "3 3" };

function useScenariosData() {
  const { customDrivers } = useNetflix();
  const bear      = getForecast("bear");
  const consensus = getForecast("consensus");
  const bull      = getForecast("bull");
  const custom    = buildForecast(
    START.subs, START.arm,
    customDrivers.netAddsStart, customDrivers.armGrowthStart, customDrivers.churnStart,
    QUARTERS,
    customDrivers.netAddsEnd, customDrivers.armGrowthEnd, customDrivers.churnEnd,
    true
  );

  // Revenue
  const histRev = HISTORICAL.map(h => ({ period: h.period, actual: h.rev, bear_v: null, cons_v: null, bull_v: null, custom_v: null }));
  const lastRev  = HISTORICAL[HISTORICAL.length - 1].rev;
  const lastRevP = { ...histRev[histRev.length - 1], bear_v: lastRev, cons_v: lastRev, bull_v: lastRev, custom_v: lastRev };
  const foreRev  = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_v: bear[i].revenue, cons_v: consensus[i].revenue, bull_v: bull[i].revenue, custom_v: custom[i].revenue }));
  const chartData = [...histRev.slice(0, -1), lastRevP, ...foreRev];

  // Subs
  const histSubs = HISTORICAL.map(h => ({ period: h.period, actual: h.subs, bear_s: null, cons_s: null, bull_s: null, custom_s: null }));
  const lastSubs  = HISTORICAL[HISTORICAL.length - 1].subs;
  const lastSubsP = { ...histSubs[histSubs.length - 1], bear_s: lastSubs, cons_s: lastSubs, bull_s: lastSubs, custom_s: lastSubs };
  const foreSubs  = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_s: bear[i].subs, cons_s: consensus[i].subs, bull_s: bull[i].subs, custom_s: custom[i].subs }));
  const subsChartData = [...histSubs.slice(0, -1), lastSubsP, ...foreSubs];

  // ARM
  const histARM = HISTORICAL.map(h => ({ period: h.period, actual: h.arm, bear_a: null, cons_a: null, bull_a: null, custom_a: null }));
  const lastARM  = HISTORICAL[HISTORICAL.length - 1].arm;
  const lastARMP = { ...histARM[histARM.length - 1], bear_a: lastARM, cons_a: lastARM, bull_a: lastARM, custom_a: lastARM };
  const foreARM  = QUARTERS.map((q, i) => ({ period: q, actual: null, bear_a: bear[i].arm, cons_a: consensus[i].arm, bull_a: bull[i].arm, custom_a: custom[i].arm }));
  const armChartData = [...histARM.slice(0, -1), lastARMP, ...foreARM];

  return { chartData, subsChartData, armChartData };
}

const SC_LINES = [
  { dataKey: "actual",   name: "Historical", stroke: "#94A3B8", width: 1.5, dash: "3 2" },
  { dataKey: "bear_v",   name: "Bear",       stroke: SCENARIO_COLORS.bear,      width: 2,   dash: null },
  { dataKey: "cons_v",   name: "Consensus",  stroke: SCENARIO_COLORS.consensus, width: 2.5, dash: null },
  { dataKey: "bull_v",   name: "Bull",       stroke: SCENARIO_COLORS.bull,      width: 2,   dash: null },
  { dataKey: "custom_v", name: "Custom",     stroke: SCENARIO_COLORS.custom,    width: 2,   dash: "5 3" },
];

function RevenueScenariosChart() {
  const { chartData } = useScenariosData();
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: NAVY, margin: "0 0 20px" }}>
        Netflix — Revenue Scenarios ($B)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={56} />
          <Tooltip formatter={(v, name) => [v != null ? `$${v.toFixed(2)}B` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {SC_LINES.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls />)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function MembershipChart() {
  const { subsChartData } = useScenariosData();
  const subLines = SC_LINES.map(l => ({ ...l, dataKey: l.dataKey.replace("_v","_s") }));
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>
        Netflix — Paid Memberships (M)
      </h3>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
        Bull ceiling ~400M by Q4'27; Bear floor near 350M.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={subsChartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `${v}M`} width={56} />
          <Tooltip formatter={(v, name) => [v != null ? `${v.toFixed(1)}M` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {subLines.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls />)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function ARMChart() {
  const { armChartData } = useScenariosData();
  const armLines = SC_LINES.map(l => ({ ...l, dataKey: l.dataKey.replace("_v","_a") }));
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>
        Netflix — Forecasted ARM ($/mo)
      </h3>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
        Ramps as ad-tier CPM matures and pricing cycles compound.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={armChartData} margin={{ top: 8, right: 24, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}`} width={52} />
          <Tooltip formatter={(v, name) => [v != null ? `$${v.toFixed(2)}/mo` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {armLines.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls />)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Sub-sections ───────────────────────────────────────────── */
function SectionHeading({ title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "40px 0 20px" }}>
      <div style={{ width: 4, height: 22, background: NF, borderRadius: 2, flexShrink: 0 }} />
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: NAVY, margin: 0 }}>{title}</h2>
      <div style={{ flex: 1, height: 1, background: GRID }} />
    </div>
  );
}

function KPISection() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {kpiCards.map((k, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${NF}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 6 }}>{k.label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: NAVY, lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>{k.value}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{k.sub}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: k.up ? "#16A34A" : "#DC2626", marginTop: 5 }}>{k.change}</div>
        </div>
      ))}
    </div>
  );
}

function StrategicPriorities() {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14, marginBottom: 20 }}>
        {priorities.map((p, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${NF}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, flex: 1, lineHeight: 1.3 }}>{p.title}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: p.statusColor, background: `${p.statusColor}18`, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 8, flexShrink: 0 }}>{p.status}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: NF, marginBottom: 6 }}>{p.impact}</div>
            <ul style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, margin: 0, paddingLeft: 16 }}>
              {p.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: 4 }}>{b}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ background: "#0B1628", borderRadius: 10, padding: "18px 22px", border: "1px solid rgba(229,9,20,0.25)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: NF, marginBottom: 10 }}>Capital Allocation Priority</div>
        <ol style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.9, margin: 0, paddingLeft: 18 }}>
          <li><strong style={{ color: "#fff" }}>Ad-Tier Monetization</strong> — infrastructure built; near-zero marginal cost on next ad dollar</li>
          <li><strong style={{ color: "#fff" }}>ARM Pricing</strong> — no content spend; flows directly to operating income</li>
          <li><strong style={{ color: "#fff" }}>Live Events + Global Penetration</strong> — long payback; fund after above two</li>
          <li><strong style={{ color: "#fff" }}>Gaming</strong> — optionality; no revenue proof point at scale yet</li>
        </ol>
      </div>
    </div>
  );
}

function FinancialOutlook() {
  const { scenario, customDrivers } = useNetflix();
  const isCustom = scenario === "custom";
  const drivers  = isCustom
    ? { ...SCENARIOS.consensus, ...customDrivers }
    : SCENARIOS[scenario] ?? SCENARIOS.consensus;
  const m        = getScenarioMetrics(drivers, isCustom);
  const col      = SCENARIO_COLORS[scenario] ?? SCENARIO_COLORS.consensus;
  const label    = SCENARIO_LABELS[scenario] ?? "Consensus";

  const rows = [
    { metric: "Annual Paid Net Adds (M)",    fy26: `+${m.netAdds26}M`,         fy27: `+${m.netAdds27}M`         },
    { metric: "End-Period Paid Members (M)", fy26: `${m.subs26.toFixed(0)}M`,  fy27: `${m.subs27.toFixed(0)}M`  },
    { metric: "Avg ARM ($/month)",           fy26: `$${m.arm26}`,              fy27: `$${m.arm27}`              },
    { metric: "Monthly Churn Rate",          fy26: `${m.churn26.toFixed(1)}%`, fy27: `${m.churn27.toFixed(1)}%` },
    { metric: "Annual Revenue ($B)",         fy26: `$${m.rev26}B`,             fy27: `$${m.rev27}B`             },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Sync Badge */}
      <div style={{ background: LIGHT, padding: "10px 20px", borderBottom: `1px solid ${GRID}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: "#16a34a", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0", fontWeight: 600 }}>
          ⟳ Live — synced from Netflix Revenue Forecast
        </span>
        <span style={{ fontSize: 12, color: MUTED }}>
          Active: <strong style={{ color: col }}>{label} Scenario</strong>
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
          <thead>
            <tr>
              {[
                { label: "Metric",             bg: "#F4F5F8", color: NAVY  },
                { label: `FY2026E (${label})`, bg: col,       color: "#fff" },
                { label: `FY2027E (${label})`, bg: col,       color: "#fff" },
              ].map((h, i) => (
                <th key={i} style={{ padding: "11px 16px", textAlign: i === 0 ? "left" : "center", background: h.bg, color: h.color, fontWeight: 600, borderBottom: `2px solid ${NF}`, whiteSpace: "nowrap" }}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.metric} style={{ background: ri % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                <td style={{ padding: "11px 16px", fontWeight: 600, color: NAVY }}>{row.metric}</td>
                <td style={{ padding: "11px 16px", textAlign: "center", fontWeight: 700, color: col }}>{row.fy26}</td>
                <td style={{ padding: "11px 16px", textAlign: "center", fontWeight: 700, color: col }}>{row.fy27}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "14px 20px", borderTop: `1px solid ${GRID}`, background: LIGHT }}>
        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.5 }}>
          Driver-based model outputs. Change scenario in Revenue Forecast — numbers here update automatically. Not financial guidance.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function NetflixBoardReport() {
  return (
    <div style={{ fontFamily: "'Outfit', 'Segoe UI', sans-serif", background: LIGHT, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ background: NAVY, padding: "28px 48px 24px", borderBottom: `3px solid ${NF}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 28, height: 28, background: NF, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: NF }}>Executive Deck</span>
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
                Netflix Streaming Strategy
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                FP&A Executive Deck · FY2025 Performance & FY2026–27 Strategic Outlook
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: 1 }}>Prepared by</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 3, fontFamily: "'Cormorant Garamond', serif" }}>FP&A · Strategic Finance</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>Q1 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 48px" }}>

        <SectionHeading title="KPI Snapshot — FY2025" />
        <KPISection />

        <SectionHeading title="Revenue & Membership Trajectory" />
        <RevenueScenariosChart />
        <MembershipChart />
        <ARMChart />

        <SectionHeading title="Strategic Priorities — FY2026–27" />
        <StrategicPriorities />

        <SectionHeading title="Financial Outlook — FY2026–27E" />
        <FinancialOutlook />

      </div>

      {/* Footer */}
      <div style={{ background: NAVY, padding: "16px 48px", borderTop: `1px solid rgba(229,9,20,0.2)` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            Source: Netflix earnings releases, shareholder letters, analyst estimates. For internal strategy use only.
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>Netflix FP&A · Q1 2026</p>
        </div>
      </div>
    </div>
  );
}
