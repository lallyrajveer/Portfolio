import { useNetflix } from "./NetflixContext.js";
import { SCENARIOS, getScenarioMetrics } from "./NetflixShared.js";

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
    body: "Accelerate ad-tier membership growth as the entry-point offering. Expand programmatic inventory and CPM yield optimization globally. Target 40% of new sign-ups on ad tier by Q4 2026.",
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "Live Events & Sports Rights",
    impact: "+$1.5B incremental rev",
    body: "Capitalize on NFL Christmas games success and WWE Raw partnership. Pursue FIFA World Cup 2026 streaming rights and expand live sports catalog in key international markets to reduce churn.",
    status: "Strategic Priority",
    statusColor: NF,
  },
  {
    title: "Gaming & Interactive Content",
    impact: "Retention driver",
    body: "Scale mobile gaming library from 100+ titles. Explore premium AAA releases and cloud gaming to create a distinct entertainment moat. Target 10M daily active players by FY2026.",
    status: "In Progress",
    statusColor: "#D97706",
  },
  {
    title: "ARM Expansion via Pricing",
    impact: "+0.5–1.0% ARM/yr",
    body: "Strategic price increases in under-monetized markets (UCAN, EMEA) supported by demonstrated content value. Shift mix toward Standard/Premium tiers with bundled benefits to justify increases.",
    status: "Ongoing",
    statusColor: "#16A34A",
  },
  {
    title: "Global Market Penetration",
    impact: "+25–40M members",
    body: "Accelerate growth in India, Southeast Asia, Middle East, and Africa through localized content investment and lower-priced mobile-only tiers. These markets represent Netflix's largest untapped runway.",
    status: "Expanding",
    statusColor: "#16A34A",
  },
];

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
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.65 }}>{p.body}</div>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div style={{ background: "#0B1628", borderRadius: 10, padding: "20px 24px", border: "1px solid rgba(229,9,20,0.25)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: NF, marginBottom: 10 }}>Recommendation — Capital Allocation Priority</div>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 12px" }}>
          If capital is constrained, <strong style={{ color: "#fff" }}>Ad-Tier Monetization should be funded first.</strong> The infrastructure is already built; the marginal cost of the next dollar of ad revenue is lower than for any other priority on this list. CPM yield optimization and programmatic expansion require execution, not new CapEx — the sensitivity model shows a +1% ARM improvement alone adds ~$0.5B to FY2026E revenue, and the ad tier is the fastest path to that lift.
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.75, margin: "0 0 12px" }}>
          <strong style={{ color: "#fff" }}>ARM Pricing ranks second</strong> because it is the only priority with zero incremental content spend — price increases in under-monetized UCAN and EMEA markets flow directly to operating income. The bear case risk (churn acceleration) is manageable given Netflix's demonstrated pricing power in prior cycles.
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: "0 0 14px" }}>
          Live Events and Global Penetration are high-conviction long-cycle investments where IRR depends heavily on rights costs and market entry timing — fund after the first two, not instead of them. Gaming remains a strategic optionality play; the revenue case is unproven and should be sized accordingly until daily active player data matures.
        </p>
        <div style={{ borderTop: "1px solid rgba(229,9,20,0.2)", paddingTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>If content budget is cut 10% (~$1.5–2B)</div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, margin: 0 }}>
            <strong style={{ color: "#fff" }}>Deprioritize Gaming and Live Events first.</strong> Gaming has no near-term revenue proof point — daily active player data is not yet at a scale that justifies incremental CapEx over ad-tier yield improvement. Live Events rights (sports, live programming) carry the largest upfront cash commitment with the longest payback period; in a constrained budget, deferring a rights renewal is lower-cost than cutting a content slate that is already amortizing. Ad-Tier Monetization and ARM Pricing require no incremental content spend and should be protected in any budget scenario. Global Penetration sits in the middle — localized content investment is more capital-efficient than sports rights, but it is the first to be right-sized (not eliminated) if constraints tighten.
          </p>
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
  const col      = SCENARIO_COLORS[scenario] ?? SCENARIO_COLORS.base;
  const label    = SCENARIO_LABELS[scenario] ?? "Consensus";

  const rows = [
    { metric: "Annual Paid Net Adds (M)",    fy26: `+${m.netAdds26}M`,        fy27: `+${m.netAdds27}M`,        baseline: "+30M",   target: "+35M"   },
    { metric: "End-Period Paid Members (M)", fy26: `${m.subs26.toFixed(0)}M`, fy27: `${m.subs27.toFixed(0)}M`, baseline: "362M",   target: "380M"   },
    { metric: "Avg ARM ($/month)",           fy26: `$${m.arm26}`,             fy27: `$${m.arm27}`,             baseline: "$12.50", target: "$12.80" },
    { metric: "Monthly Churn Rate",          fy26: `${m.churn26.toFixed(1)}%`, fy27: `${m.churn27.toFixed(1)}%`, baseline: "~1.9%", target: "<1.8%"  },
    { metric: "Annual Revenue ($B)",         fy26: `$${m.rev26}B`,            fy27: `$${m.rev27}B`,            baseline: "$51B",   target: "$56B"   },
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
                { label: "Metric",         bg: "#F4F5F8", color: NAVY },
                { label: `FY2026E (${label})`, bg: col,  color: "#fff" },
                { label: `FY2027E (${label})`, bg: col,  color: "#fff" },
                { label: "FY2025 Baseline",    bg: NAVY, color: "#fff" },
                { label: "Strategic Target",   bg: "#1E3A5F", color: "#fff" },
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
                <td style={{ padding: "11px 16px", textAlign: "center", color: MUTED }}>{row.baseline}</td>
                <td style={{ padding: "11px 16px", textAlign: "center", color: "#16A34A", fontWeight: 600 }}>{row.target}</td>
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

        <SectionHeading title="Strategic Priorities — FY2026–27" />
        <StrategicPriorities />

        <SectionHeading title="Analyst View" />
        <div style={{ background: "#fff", borderRadius: 10, padding: "22px 26px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${NF}`, marginBottom: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: MUTED, marginBottom: 10 }}>Preparer's Point of View</div>
          <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.8, margin: 0 }}>
            Of the five priorities on this page, <strong>Ad-Supported Tier Monetization will generate the most shareholder value over the next three years</strong> — and it is not close. The core reason is structural: Netflix has already absorbed the cost of building ad-tier infrastructure, signed measurement partnerships, and trained the recommendation system on ad-tier engagement patterns. The next dollar of investment into CPM yield and programmatic fill rates earns a return that no other priority on this list can match, because the marginal cost of additional ad revenue approaches zero once inventory exists. Every other priority requires either large upfront rights spend (Live Events), unproven consumer behavior (Gaming), multi-year market entry cycles (Global Penetration), or execution risk from price elasticity (ARM Pricing). Ad-tier is the one lever Netflix can pull in FY2026 that will show up meaningfully in FY2026 operating income — not FY2028. The counterargument is that ad-tier success depends on advertiser demand and CPM rates that are partially outside Netflix's control; a macro advertising pullback would compress that upside faster than any of the other priorities. That risk is real and should be monitored. But on a risk-adjusted basis, ad-tier monetization is where I would concentrate capital if forced to choose one.
          </p>
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
