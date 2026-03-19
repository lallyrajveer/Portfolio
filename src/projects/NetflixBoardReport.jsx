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
      "Accelerate ad-tier as the primary entry-point offering — target 40% of new sign-ups on ad tier by Q4 2026",
      "Expand programmatic inventory and CPM yield optimization across UCAN and EMEA markets",
      "Scale measurement partnerships (Nielsen, DoubleVerify) to capture premium brand budgets",
    ],
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "Live Events & Sports Rights",
    impact: "+$1.5B incremental rev",
    bullets: [
      "Build on NFL Christmas games and WWE Raw to establish Netflix as a live destination",
      "Pursue FIFA World Cup 2026 streaming rights — highest-reach live event globally",
      "Expand live sports catalog in India and LatAm to anchor retention in high-churn markets",
    ],
    status: "Strategic Priority",
    statusColor: NF,
  },
  {
    title: "Gaming & Interactive Content",
    impact: "Retention driver",
    bullets: [
      "Scale mobile gaming library from 100+ titles toward premium AAA releases",
      "Explore cloud gaming to create a distinct entertainment moat vs. Disney+ and Max",
      "Target 10M daily active players by FY2026 as the proof-of-concept threshold",
    ],
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "ARM Expansion via Pricing",
    impact: "+0.5–1.0% ARM/yr",
    bullets: [
      "Execute strategic price increases in under-monetized UCAN and EMEA markets",
      "Shift subscriber mix toward Standard/Premium tiers with bundled benefits",
      "Zero incremental content spend required — flows directly to operating income",
    ],
    status: "Ongoing",
    statusColor: "#16A34A",
  },
  {
    title: "Global Market Penetration",
    impact: "+25–40M members",
    bullets: [
      "Prioritize India, Southeast Asia, Middle East, and Africa — largest untapped runway",
      "Deploy localized content investment and mobile-only tiers at sub-$5/mo price points",
      "International growth dilutes ARM near-term but drives long-term pricing ladder opportunity",
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
        Subscriber growth across scenarios. Bull ceiling ~400M by Q4'27; Bear floor near 350M.
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
        ARM ramps gradually as ad-tier CPM matures and pricing cycles compound.
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
      <div style={{ background: "#0B1628", borderRadius: 10, padding: "20px 24px", border: "1px solid rgba(229,9,20,0.25)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: NF, marginBottom: 10 }}>Recommendation — Capital Allocation Priority</div>
        <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 14px", paddingLeft: 20 }}>
          <li style={{ marginBottom: 8 }}><strong style={{ color: "#fff" }}>Fund Ad-Tier Monetization first.</strong> Infrastructure is built; marginal cost of next ad dollar is the lowest on this list. CPM yield + programmatic expansion require execution, not new CapEx.</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: "#fff" }}>ARM Pricing second</strong> — zero incremental content spend; flows directly to operating income. Churn risk from price hikes is manageable given demonstrated pricing power in prior cycles.</li>
          <li style={{ marginBottom: 8 }}><strong style={{ color: "#fff" }}>Live Events and Global Penetration are long-cycle commitments</strong> — fund after the first two. IRR depends on rights costs and market entry timing; size positions accordingly.</li>
          <li><strong style={{ color: "#fff" }}>Gaming is optionality, not a near-term line item</strong> — no revenue proof point at current scale. Protect ad-tier and ARM budgets before adding gaming CapEx.</li>
        </ul>
        <div style={{ borderTop: "1px solid rgba(229,9,20,0.2)", paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>If content budget is cut 10% (~$1.5–2B)</div>
          <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}><strong style={{ color: "#fff" }}>Deprioritize Gaming first</strong> — no near-term revenue proof point; daily active player data not yet at scale to justify CapEx over ad-tier yield improvement.</li>
            <li style={{ marginBottom: 8 }}><strong style={{ color: "#fff" }}>Defer Live Events rights renewals second</strong> — largest upfront cash commitment and longest payback; deferring a rights renewal is lower-cost than cutting an amortizing content slate.</li>
            <li><strong style={{ color: "#fff" }}>Protect Ad-Tier and ARM Pricing in every budget scenario</strong> — both require no incremental content spend. Right-size Global Penetration (don't eliminate) if constraints tighten further.</li>
          </ul>
        </div>
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
        {scenario === "custom" && (
          <div style={{ background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: 6, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#92400E", lineHeight: 1.6 }}>
            <strong>Board view: Custom scenario.</strong> This table reflects preparer-defined assumptions — not the named Bear, Consensus, or Bull cases. Custom was selected to reflect a scenario where gross adds and churn jointly drive subscriber count and revenue. If the board should see Consensus case numbers, switch the scenario in the Revenue Forecast tab.
          </div>
        )}
        {scenario === "consensus" && (
          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 6, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: "#1E40AF", lineHeight: 1.6 }}>
            <strong>Board view: Consensus scenario.</strong> Assumes 7→9M quarterly net adds and 3.0→5.0%/yr ARM growth — aligned with Wall Street consensus (Wells Fargo, JPMorgan, Goldman Sachs). Churn improves modestly from 2.2% to 1.9% as sports content and ad-tier pricing floor reduce cancellations.
          </div>
        )}
        {(scenario === "bear" || scenario === "bull") && (
          <div style={{ background: "#F9FAFB", border: `1px solid ${GRID}`, borderRadius: 6, padding: "10px 14px", marginBottom: 10, fontSize: 12, color: MUTED, lineHeight: 1.6 }}>
            <strong>Board view: {label} scenario.</strong> {scenario === "bear" ? "Stress-test case. Assumes pricing headwinds (1%/yr ARM growth) and elevated churn (2.8%/mo). Use this view to size downside risk, not as a planning baseline." : "Upside case. Assumes aggressive ad-tier CPM maturation (5%/yr ARM growth) and churn improvement (1.8%/mo). Use this view to frame the bull thesis, not as a commitment."}
          </div>
        )}
        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.5 }}>
          FY2026–27 values are driver-based model outputs. Change the scenario once in the Revenue Forecast — every number in this table updates automatically.
          Strategic targets reflect company-stated ambitions and analyst consensus. Not financial guidance.
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

        <SectionHeading title="Analyst View" />
        <div style={{ background: "#fff", borderRadius: 10, padding: "22px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${NF}`, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: MUTED, marginBottom: 10 }}>Preparer's Point of View</div>
          <ul style={{ fontSize: 13, color: NAVY, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 8 }}><strong>Ad-Tier is the highest-conviction capital allocation</strong> — Netflix has already absorbed infrastructure and measurement costs; the next dollar into CPM yield earns a return no other priority can match because marginal cost approaches zero once inventory exists.</li>
            <li style={{ marginBottom: 8 }}><strong>ARM Pricing ranks second</strong> — zero incremental content spend required; price increases in under-monetized UCAN and EMEA flow directly to operating income, with manageable churn risk given Netflix's demonstrated pricing power.</li>
            <li style={{ marginBottom: 8 }}><strong>Live Events and Global Penetration are high-conviction long-cycle investments</strong> — fund after the first two. IRR depends heavily on rights costs and market entry timing; capital committed here should be sized to the long payback horizon.</li>
            <li style={{ marginBottom: 8 }}><strong>Gaming is strategic optionality, not a near-term revenue driver</strong> — daily active player data is not yet at scale to justify incremental CapEx over ad-tier yield improvement. Size accordingly until the data matures.</li>
            <li><strong>Key risk to the bull case</strong>: ad-tier success depends on advertiser demand and CPM rates partially outside Netflix's control — a macro advertising pullback compresses this upside faster than any other priority. Monitor quarterly fill-rate and CPM trend data.</li>
          </ul>
        </div>

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
