import { useNetflix } from "./NetflixContext.js";
import { HISTORICAL, QUARTERS, getForecast, buildForecast, START, SEASONAL_FACTORS } from "./NetflixShared.js";
import { ComposedChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

/* ─── Colors ─────────────────────────────────────────────────── */
const NF    = "#E50914";
const NAVY  = "#0B1628";
const MUTED = "#6B7280";
const GRID  = "#E5E7EB";
const LIGHT = "#F8F9FA";

const SCENARIO_COLORS = { bear: "#DC2626", consensus: "#1D4ED8", bull: "#16A34A", custom: "#7C3AED" };
const SCENARIO_LABELS = { bear: "Bear",    consensus: "Consensus", bull: "Bull",  custom: "Custom" };


const priorities = [
  {
    title: "Net Adds Growth",
    driver: "Subscriber Driver",
    driverColor: "#1D4ED8",
    driverBg: "#EFF6FF",
    bullets: [
      "Ad-supported tier was 40% of new sign-ups in ad-available markets (Q4'24); scaling this base drives incremental adds through FY2027.",
      "International expansion in India and SEA via mobile-only tiers at lower price points — both markets remain below 10% broadband penetration.",
      "Live events (NFL Christmas, WWE Raw, FIFA World Cup 2026) reduce off-season churn and pull in new subscribers during event windows.",
    ],
  },
  {
    title: "ARM Expansion",
    driver: "Revenue per Member Driver",
    driverColor: "#16A34A",
    driverBg: "#F0FDF4",
    bullets: [
      "UCAN price hike cycle expected to resume in late 2026 after a pause; prior hikes averaged ~7% and were well-tolerated.",
      "Ad-tier CPM monetization scales as programmatic inventory matures — incremental revenue with no additional content spend.",
      "Tier mix shift toward Standard and Premium as ad tier serves as a price-floor entry point rather than a permanent destination.",
    ],
  },
  {
    title: "Key Risks",
    driver: "Downside Factors",
    driverColor: "#DC2626",
    driverBg: "#FEF2F2",
    bullets: [
      "Password-sharing tailwind is largely exhausted by Q1'26; net adds must be earned through product and content rather than enforcement.",
      "Disney+/Max bundle competition and price fatigue could suppress UCAN acquisition and increase voluntary churn.",
      "International growth dilutes blended ARM — faster subscriber growth in lower-ARPU markets compresses the global average.",
    ],
  },
];

/* ─── Scenario Charts (moved from Revenue Forecast tab) ─────── */
const axisStyle  = { fontSize: 11, fill: MUTED };
const gridProps  = { stroke: GRID, strokeDasharray: "3 3" };

function useScenariosData() {
  const { customDrivers } = useNetflix();
  const sf        = SEASONAL_FACTORS;
  const bear      = getForecast("bear",      sf);
  const consensus = getForecast("consensus", sf);
  const bull      = getForecast("bull",      sf);
  const cd = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const custom    = buildForecast(
    START.subs, START.arm,
    cd.netAddsStart   ?? 7.0,
    cd.armGrowthStart ?? 4.5,
    cd.churnStart     ?? 1.9,
    QUARTERS,
    cd.netAddsEnd  ?? 9.0,
    customArmGrowthEnd,
    cd.churnEnd    ?? 1.9,
    false, sf
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

// chartData = 11 hist + 1 connector + 8 forecast = 20 points
const HIST_END_IDX = HISTORICAL.length - 1;          // 11: last actual point
const FORE_END_IDX = HISTORICAL.length + QUARTERS.length - 1; // 19: last forecast point

const makeEndLabel = (color, formatter, idx) => (props) => {
  if (props.index !== idx || props.value == null) return null;
  return (
    <text x={props.x + 5} y={props.y + 4} fill={color} fontSize={10} fontWeight={700} fontFamily="'Outfit', sans-serif">
      {formatter(props.value)}
    </text>
  );
};

const SC_LINES = [
  { dataKey: "actual",   name: "Historical", stroke: "#94A3B8",                  width: 1.5, dash: "3 2",  endIdx: HIST_END_IDX },
  { dataKey: "bear_v",   name: "Bear",       stroke: SCENARIO_COLORS.bear,       width: 2,   dash: null,   endIdx: FORE_END_IDX },
  { dataKey: "cons_v",   name: "Consensus",  stroke: SCENARIO_COLORS.consensus,  width: 2,   dash: null,   endIdx: FORE_END_IDX },
  { dataKey: "bull_v",   name: "Bull",       stroke: SCENARIO_COLORS.bull,       width: 2,   dash: null,   endIdx: FORE_END_IDX },
  { dataKey: "custom_v", name: "Custom",     stroke: SCENARIO_COLORS.custom,     width: 2.5, dash: "5 3",  endIdx: FORE_END_IDX },
];

function RevenueScenariosChart() {
  const { chartData } = useScenariosData();
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "24px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: NAVY, margin: "0 0 20px" }}>
        Netflix: Revenue Scenarios ($B)
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 8, right: 72, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}B`} width={56} />
          <Tooltip formatter={(v, name) => [v != null ? `$${v.toFixed(1)}B` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {SC_LINES.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls label={makeEndLabel(l.stroke, v => `$${v.toFixed(1)}B`, l.endIdx)} />)}
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
        Netflix: Paid Memberships (M)
      </h3>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
        Bull ceiling ~400M by Q4'27; Bear floor near 350M.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={subsChartData} margin={{ top: 8, right: 72, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `${v}M`} width={56} />
          <Tooltip formatter={(v, name) => [v != null ? `${v.toFixed(1)}M` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {subLines.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls label={makeEndLabel(l.stroke, v => `${Math.round(v)}M`, l.endIdx)} />)}
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
        Netflix: Forecasted ARM ($/mo)
      </h3>
      <p style={{ fontSize: 12, color: MUTED, margin: "0 0 20px", fontFamily: "'Outfit', sans-serif" }}>
        Ramps as ad-tier CPM matures and pricing cycles compound.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={armChartData} margin={{ top: 8, right: 72, bottom: 4, left: 8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey="period" tick={axisStyle} />
          <YAxis domain={["auto","auto"]} tick={axisStyle} tickFormatter={v => `$${v}`} width={52} />
          <Tooltip formatter={(v, name) => [v != null ? `$${v.toFixed(2)}/mo` : "—", name]} />
          <ReferenceLine x="Q4'25" stroke={MUTED} strokeDasharray="5 3" label={{ value: "Forecast →", position: "insideTopRight", fontSize: 11, fill: MUTED }} />
          {armLines.map(l => <Line key={l.dataKey} dataKey={l.dataKey} name={l.name} stroke={l.stroke} strokeWidth={l.width} strokeDasharray={l.dash ?? undefined} dot={false} connectNulls label={makeEndLabel(l.stroke, v => `$${v.toFixed(2)}`, l.endIdx)} />)}
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


function StrategicPriorities() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {priorities.map((p, i) => (
        <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${p.driverColor}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: p.driverColor, background: p.driverBg, display: "inline-block", padding: "2px 8px", borderRadius: 20, marginBottom: 10 }}>{p.driver}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 12, lineHeight: 1.3 }}>{p.title}</div>
          <ul style={{ fontSize: 12, color: MUTED, lineHeight: 1.65, margin: 0, paddingLeft: 16 }}>
            {p.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: 6 }}>{b}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* Fixed chart domains — computed once across all standard scenarios so axis range
   never shifts when the user switches Bear / Consensus / Bull / Custom.          */
const _aggH = qs => ({
  rev:      +(qs.reduce((s, q) => s + q.rev,      0)).toFixed(1),
  netAdds:  +(qs.reduce((s, q) => s + q.netAdds,  0)).toFixed(1),
});
const _aggF = qs => ({
  rev:      +(qs.reduce((s, q) => s + q.revenue,  0)).toFixed(1),
  netAdds:  +(qs.reduce((s, q) => s + q.netAdds,  0)).toFixed(1),
});
const _domainRevs     = [];
const _domainNetAdds  = [];
[HISTORICAL.slice(0,4), HISTORICAL.slice(4,8), HISTORICAL.slice(8,12)].forEach(qs => {
  const d = _aggH(qs); _domainRevs.push(d.rev); _domainNetAdds.push(d.netAdds);
});
["bear","consensus","bull"].forEach(sc => {
  const f = getForecast(sc, SEASONAL_FACTORS);
  [f.slice(0,4), f.slice(4,8)].forEach(qs => {
    const d = _aggF(qs); _domainRevs.push(d.rev); _domainNetAdds.push(d.netAdds);
  });
});
const FY_REV_DOMAIN   = [0, Math.ceil(Math.max(..._domainRevs)    * 1.12 / 5) * 5];
const FY_ADDS_DOMAIN  = [0, Math.ceil(Math.max(..._domainNetAdds) * 1.15 / 5) * 5];

function FinancialOutlook() {
  const { scenario, setScenario, customDrivers } = useNetflix();

  const cd = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecast = scenario === "custom"
    ? buildForecast(START.subs, START.arm,
        cd.netAddsStart   ?? 7.0,
        cd.armGrowthStart ?? 4.5,
        cd.churnStart     ?? 1.9,
        QUARTERS,
        cd.netAddsEnd  ?? 9.0,
        customArmGrowthEnd,
        cd.churnEnd    ?? 1.9,
        false, SEASONAL_FACTORS)
    : getForecast(scenario, SEASONAL_FACTORS);

  const agg = (qs, isHist) => {
    const rev     = +(qs.reduce((s, q) => s + (isHist ? q.rev : q.revenue), 0)).toFixed(1);
    const members = +qs[3].subs.toFixed(0);
    const arm     = +qs[3].arm.toFixed(2);
    const avgArm  = +(qs.reduce((s, q) => s + q.arm, 0) / qs.length).toFixed(2);
    const netAdds = +(qs.reduce((s, q) => s + q.netAdds, 0)).toFixed(1);
    return { rev, members, arm, arpu: avgArm, netAdds };
  };

  const years = [
    { label: "FY2023A", isForecast: false, ...agg(HISTORICAL.slice(0, 4),  true) },
    { label: "FY2024A", isForecast: false, ...agg(HISTORICAL.slice(4, 8),  true) },
    { label: "FY2025A", isForecast: false, ...agg(HISTORICAL.slice(8, 12), true) },
    { label: "FY2026E", isForecast: true,  ...agg(forecast.slice(0, 4),    false) },
    { label: "FY2027E", isForecast: true,  ...agg(forecast.slice(4, 8),    false) },
  ].map((y, i, arr) => ({
    ...y,
    revGrowth: i > 0 ? +((y.rev / arr[i - 1].rev - 1) * 100).toFixed(1) : null,
  }));

  const col      = SCENARIO_COLORS[scenario] ?? SCENARIO_COLORS.consensus;
  const ttStyle  = { fontFamily: "'Outfit', sans-serif", fontSize: 12 };

  const metrics = [
    { label: "Revenue ($B)",      fmt: y => `$${y.rev.toFixed(1)}B` },
    { label: "YoY Growth",        fmt: y => y.revGrowth != null ? `${y.revGrowth > 0 ? "+" : ""}${y.revGrowth}%` : "—" },
    { label: "Members (M)",       fmt: y => `${y.members}M` },
    { label: "ARPU ($/mo)",       fmt: y => `$${y.arpu.toFixed(2)}` },
    { label: "Net Adds (M)",      fmt: y => `${y.netAdds > 0 ? "+" : ""}${y.netAdds}M` },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
      {/* Scenario selector */}
      <div style={{ background: LIGHT, padding: "10px 20px", borderBottom: `1px solid ${GRID}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["bear","consensus","bull","custom"].map(key => {
            const active = scenario === key;
            return (
              <button key={key} onClick={() => setScenario(key)} style={{
                padding: "3px 14px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${active ? SCENARIO_COLORS[key] : GRID}`,
                background: active ? SCENARIO_COLORS[key] : "#fff",
                color: active ? "#fff" : MUTED,
                fontSize: 11, fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>{SCENARIO_LABELS[key]}</button>
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: "#16a34a", background: "#F0FDF4", padding: "3px 10px", borderRadius: 20, border: "1px solid #bbf7d0", fontWeight: 600 }}>
          ⟳ Synced with Revenue Forecast
        </span>
      </div>

      {/* Bar charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, padding: "16px 20px" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Annual Revenue ($B)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={years} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis domain={FY_REV_DOMAIN} tick={{ fontSize: 10, fill: MUTED, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}B`} />
              <Tooltip contentStyle={ttStyle} formatter={v => [`$${v.toFixed(1)}B`, "Revenue"]} />
              <Bar dataKey="rev" radius={[4, 4, 0, 0]}>
                {years.map((y, i) => <Cell key={i} fill={y.isForecast ? col : NF} opacity={y.isForecast ? 0.75 : 1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Annual Net Adds (M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={years} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: MUTED, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} />
              <YAxis domain={FY_ADDS_DOMAIN} tick={{ fontSize: 10, fill: MUTED, fontFamily: "'Outfit',sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip contentStyle={ttStyle} formatter={v => [`${v > 0 ? "+" : ""}${v.toFixed(1)}M`, "Net Adds"]} />
              <Bar dataKey="netAdds" radius={[4, 4, 0, 0]}>
                {years.map((y, i) => <Cell key={i} fill={y.isForecast ? col : NF} opacity={y.isForecast ? 0.75 : 1} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Metrics table */}
      <div style={{ borderTop: `1px solid ${GRID}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "20%" }} />
            {years.map(y => <col key={y.label} style={{ width: "16%" }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: LIGHT }}>
              <th style={{ padding: "10px 16px", textAlign: "left", color: NAVY, fontWeight: 600, borderBottom: `2px solid ${NF}` }}>Metric</th>
              {years.map(y => (
                <th key={y.label} style={{
                  padding: "10px 16px", textAlign: "center", fontWeight: 700,
                  borderBottom: `2px solid ${y.isForecast ? col : NF}`,
                  color: y.isForecast ? col : NAVY,
                  background: y.isForecast ? `${col}08` : LIGHT,
                }}>
                  {y.label}
                  {y.isForecast && <span style={{ display: "block", fontSize: 9, fontWeight: 500, color: col, letterSpacing: 0.5, textTransform: "uppercase", marginTop: 1 }}>{scenario}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, mi) => (
              <tr key={m.label} style={{ background: mi % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "9px 16px", color: MUTED, fontWeight: 600 }}>{m.label}</td>
                {years.map((y, yi) => {
                  const isGrowth = m.label === "YoY Growth";
                  const growthColor = isGrowth && y.revGrowth != null ? (y.revGrowth >= 0 ? "#16A34A" : "#DC2626") : NAVY;
                  return (
                    <td key={yi} style={{
                      padding: "9px 16px", textAlign: "center",
                      color: y.isForecast ? (isGrowth ? growthColor : col) : (isGrowth ? growthColor : NAVY),
                      fontWeight: y.isForecast ? 600 : 400,
                      background: y.isForecast ? `${col}05` : undefined,
                    }}>
                      {m.fmt(y)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ padding: "14px 20px", borderTop: `1px solid ${GRID}`, background: LIGHT }}>
        <p style={{ fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          Driver-based model. Change scenario above; charts and table update automatically. Not financial guidance.
        </p>
        <p style={{ fontSize: 11, color: MUTED, margin: "6px 0 0", lineHeight: 1.6 }}>
          ARPU = annual avg ARM ($/mo) across the four quarters; matches the ARM driver shown in the sensitivity table. Model starts from Q4'25 exit rate of $12.23/mo.
        </p>
        <p style={{ fontSize: 11, color: MUTED, margin: "6px 0 0", lineHeight: 1.6 }}>
          FY2026&#8594;27E ~14% revenue growth: ~9% paid member growth + ~4% ARM lift. Ad-tier CPM monetization contributes an estimated +$1.5&#8211;2.5B by FY2027, embedded in the ARM growth assumption. Password-sharing tailwind largely exhausted; growth is ad-tier and international-led.
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
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 48px" }}>

        <SectionHeading title="Performance & Financial Outlook" />
        <FinancialOutlook />

        <SectionHeading title="Revenue & Membership Trajectory" />
        <RevenueScenariosChart />
        <MembershipChart />
        <ARMChart />

        <SectionHeading title="Strategic Priorities: FY2026–27" />
        <StrategicPriorities />

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
