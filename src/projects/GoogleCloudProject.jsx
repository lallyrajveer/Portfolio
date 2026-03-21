import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend,
} from "recharts";

/* ─── Colors ──────────────────────────────────────────────────────────────── */
const C = {
  navy:      "#0B1628",
  gBlue:     "#4285F4",   // Google Blue  — Alphabet
  gRed:      "#EA4335",   // Google Red   — Bear scenario
  gGreen:    "#34A853",   // Google Green — Bull scenario
  gYellow:   "#FBBC05",   // Google Yellow
  amzOrange: "#FF9900",   // Amazon
  msBlue:    "#00A4EF",   // Microsoft
  muted:     "#6B7280",
  light:     "#F8F9FA",
  grid:      "#E5E7EB",
  border:    "#E0E3EC",
};

const SC_COLORS = { bear: C.gRed, base: C.gBlue, bull: C.gGreen };
const SC_LABELS = { bear: "Bear",  base: "Base",  bull: "Bull"  };

/* ─── Pre-computed data (from Python Steps 2 + 4) ────────────────────────── */

// Step 2: Benchmarking KPIs — sourced from 10-K filings, computed in step2_benchmarking.py
const BENCHMARKING = {
  capexIntensity: [
    { company: "Alphabet",  value: 15.0, color: C.gBlue     },
    { company: "Amazon",    value: 12.1, color: C.amzOrange  },
    { company: "Microsoft", value: 22.7, color: C.msBlue     },
  ],
  cloudCAGR: [
    { company: "Alphabet",  value: 34.8, color: C.gBlue     },
    { company: "Amazon",    value: 24.1, color: C.amzOrange  },
    { company: "Microsoft", value: 24.4, color: C.msBlue     },
  ],
  capexPerCloudGrowth: [
    { company: "Alphabet",  value: 5.42, color: C.gBlue     },
    { company: "Amazon",    value: 5.57, color: C.amzOrange  },
    { company: "Microsoft", value: 2.34, color: C.msBlue     },
  ],
  operatingMargin: [
    { company: "Alphabet",  value: 32.0, color: C.gBlue     },
    { company: "Amazon",    value: 10.7, color: C.amzOrange  },
    { company: "Microsoft", value: 44.6, color: C.msBlue     },
  ],
};

// Step 4: Monte Carlo P10/P50/P90 — 1,000 iterations per scenario, from step4_monte_carlo.py
// Base year: Google Cloud FY2024 = $43.2B | Forecast: 2025-2027
const MONTE_CARLO = {
  bear: {
    rev2027:   { p10: 53.5,  p50: 59.9,  p90: 66.4  },  // $B
    margin2027:{ p10: 0.05,  p50: 0.075, p90: 0.10  },  // %
    capex2027: { p10: 27.1,  p50: 34.4,  p90: 42.5  },  // $B
    opInc2027: { p10: 2.7,   p50: 4.5,   p90: 6.6   },  // $B
    revByYear: [
      { year: "2024A", rev: 43.2 },
      { year: "2025E", p10: 46.6, p50: 49.7, p90: 52.9 },
      { year: "2026E", p10: 50.4, p50: 55.6, p90: 60.9 },
      { year: "2027E", p10: 53.5, p50: 59.9, p90: 66.4 },
    ],
  },
  base: {
    rev2027:   { p10: 73.4,  p50: 82.4,  p90: 91.7  },
    margin2027:{ p10: 0.15,  p50: 0.185, p90: 0.22  },
    capex2027: { p10: 29.4,  p50: 37.5,  p90: 46.8  },
    opInc2027: { p10: 11.0,  p50: 15.2,  p90: 20.2  },
    revByYear: [
      { year: "2024A", rev: 43.2 },
      { year: "2025E", p10: 51.8, p50: 55.3, p90: 59.0 },
      { year: "2026E", p10: 62.4, p50: 68.8, p90: 75.6 },
      { year: "2027E", p10: 73.4, p50: 82.4, p90: 91.7 },
    ],
  },
  bull: {
    rev2027:   { p10: 97.1,  p50: 110.9, p90: 126.2 },
    margin2027:{ p10: 0.22,  p50: 0.26,  p90: 0.30  },
    capex2027: { p10: 31.1,  p50: 40.0,  p90: 51.9  },
    opInc2027: { p10: 21.4,  p50: 28.8,  p90: 37.9  },
    revByYear: [
      { year: "2024A", rev: 43.2 },
      { year: "2025E", p10: 57.9, p50: 63.3, p90: 69.1 },
      { year: "2026E", p10: 76.0, p50: 85.7, p90: 96.0 },
      { year: "2027E", p10: 97.1, p50: 110.9, p90: 126.2 },
    ],
  },
};

/* ─── Sub-components ──────────────────────────────────────────────────────── */

function GoogleLogo() {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[C.gBlue, C.gRed, C.gYellow, C.gBlue, C.gGreen, C.gRed].map((col, i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: col }} />
      ))}
    </div>
  );
}

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 10, padding: "16px 18px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                    textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "32px 0 16px" }}>
      <div style={{ width: 3, height: 18, background: C.gBlue, borderRadius: 2 }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.navy, letterSpacing: 0.3 }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: C.grid }} />
    </div>
  );
}

function BenchmarkChart({ data, title, unit, note }) {
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { company, value } = payload[0].payload;
    return (
      <div style={{ background: "#fff", border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: 4 }}>{company}</div>
        <div style={{ color: C.muted }}>{unit === "$" ? `$${value}` : `${value}${unit}`}</div>
      </div>
    );
  };

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "18px 20px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{title}</div>
      {note && <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>{note}</div>}
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="company" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false}
                 tickFormatter={v => unit === "$" ? `$${v}` : `${v}${unit}`} width={40} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
          {/* Highlight Google with reference  */}
          <ReferenceLine y={data[0].value} stroke={C.gBlue} strokeDasharray="4 2" strokeWidth={1} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RevenueRangeChart({ scenario }) {
  const sc    = MONTE_CARLO[scenario];
  const color = SC_COLORS[scenario];

  const chartData = sc.revByYear.map(d => ({
    year:   d.year,
    actual: d.rev ?? null,
    p10:    d.p10  ?? null,
    p50:    d.p50  ?? null,
    p90:    d.p90  ?? null,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: "#fff", border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "10px 14px", fontSize: 12, minWidth: 140 }}>
        <div style={{ fontWeight: 700, color: C.navy, marginBottom: 6 }}>{label}</div>
        {d.actual  != null && <div style={{ color: C.muted }}>Actual:  ${d.actual}B</div>}
        {d.p90     != null && <div style={{ color }}>P90: ${d.p90}B</div>}
        {d.p50     != null && <div style={{ color, fontWeight: 700 }}>P50: ${d.p50}B</div>}
        {d.p10     != null && <div style={{ color }}>P10: ${d.p10}B</div>}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false}
               tickFormatter={v => `$${v}B`} width={50} domain={[0, "auto"]} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="actual" name="Actual"  fill={C.navy}      radius={[4,4,0,0]} maxBarSize={40} />
        <Bar dataKey="p90"    name="P90"     fill={color}       opacity={0.35} radius={[4,4,0,0]} maxBarSize={40} />
        <Bar dataKey="p50"    name="P50"     fill={color}       opacity={0.75} radius={[4,4,0,0]} maxBarSize={40} />
        <Bar dataKey="p10"    name="P10"     fill={color}       opacity={0.35} radius={[4,4,0,0]} maxBarSize={40} />
        <Legend wrapperStyle={{ fontSize: 11, color: C.muted }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─── Root Component ─────────────────────────────────────────────────────── */
export default function GoogleCloudProject() {
  const [scenario, setScenario] = useState("base");
  const sc    = MONTE_CARLO[scenario];
  const color = SC_COLORS[scenario];

  return (
    <div style={{ fontFamily: "'Outfit', 'Segoe UI', sans-serif",
                  background: C.light, minHeight: "100vh" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ background: C.navy, padding: "28px 48px 24px",
                    borderBottom: `3px solid ${C.gBlue}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <GoogleLogo />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2,
                           textTransform: "uppercase", color: C.gBlue }}>
              Cloud Finance · BI Team
            </span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32,
                       fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Google Cloud ML CapEx Benchmarking
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            AI Demand Scenario Simulation · Peer Analysis: Alphabet vs. Amazon vs. Microsoft · FY2020–2027E
          </p>
        </div>
      </div>

      {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${C.grid}`,
                    padding: "18px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto",
                      display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <KPICard label="Google Cloud FY2024 Revenue" value="$43.2B"
                   sub="+30.5% YoY" accent={C.gBlue} />
          <KPICard label="Cloud Revenue CAGR 2020-24" value="34.8%"
                   sub="Fastest among peers" accent={C.gGreen} />
          <KPICard label="Total Alphabet CapEx 2024" value="$52.5B"
                   sub="+62% vs. 2023" accent={C.gYellow} />
          <KPICard label="Google Cloud Op. Margin 2024" value="~17%"
                   sub="First full profitable year" accent={C.gRed} />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 48px 48px" }}>

        {/* Benchmarking */}
        <SectionLabel text="Peer Benchmarking: CapEx, Cloud Growth & Margins (2020–2024)" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          <BenchmarkChart
            data={BENCHMARKING.capexIntensity}
            title="CapEx Intensity 2024 (%)"
            unit="%"
            note="Total CapEx / Total Revenue. Google and Amazon are broadly in line; Microsoft surged on AI infra."
          />
          <BenchmarkChart
            data={BENCHMARKING.cloudCAGR}
            title="Cloud Revenue CAGR 2020–2024 (%)"
            unit="%"
            note="Google Cloud grew fastest (+34.8% CAGR) from a smaller base. AWS and Azure are converging."
          />
          <BenchmarkChart
            data={BENCHMARKING.capexPerCloudGrowth}
            title="Cumulative CapEx per $1 Cloud Revenue Growth ($)"
            unit="x"
            note="Microsoft most efficient ($2.34/$1) due to Azure's software leverage. Google and Amazon broadly similar."
          />
          <BenchmarkChart
            data={BENCHMARKING.operatingMargin}
            title="Total Company Operating Margin 2024 (%)"
            unit="%"
            note="Google (32%) reflects Search/YouTube mix. Microsoft (45%) shows software-scale advantage. AWS pulls Amazon to 11%."
          />
        </div>

        {/* Key Insight */}
        <div style={{ background: "#EFF6FF", border: `1px solid #BFDBFE`,
                      borderRadius: 10, padding: "16px 20px", marginTop: 20,
                      display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.gBlue,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: 1 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>i</span>
          </div>
          <div style={{ fontSize: 12, color: "#1E3A8A", lineHeight: 1.7 }}>
            <strong>Key finding:</strong> Google Cloud is growing the fastest of the three peers (+34.8% CAGR vs. ~24% for AWS and Azure),
            but at 40% of AWS's scale ($43.2B vs. $107.6B), the absolute revenue gap remains the core strategic challenge.
            Google's cumulative CapEx-to-cloud-growth ratio ($5.42/$1) is comparable to Amazon's ($5.57) but significantly
            higher than Microsoft's ($2.34), reflecting the higher upfront cost of building TPU infrastructure vs. leveraging existing enterprise software channels.
          </div>
        </div>

        {/* Scenario Simulation */}
        <SectionLabel text="AI Demand Scenario Simulation — Google Cloud 2025–2027E" />

        {/* Scenario Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: C.muted }}>Select scenario:</span>
          {["bear", "base", "bull"].map(key => {
            const active = scenario === key;
            return (
              <button key={key} onClick={() => setScenario(key)} style={{
                padding: "6px 20px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
                background: active ? SC_COLORS[key] : "#fff",
                color: active ? "#fff" : C.muted,
                fontSize: 12, fontWeight: active ? 700 : 400, transition: "all 0.15s",
              }}>
                {SC_LABELS[key]}
              </button>
            );
          })}
          <span style={{ fontSize: 11, color: "#16a34a", background: "#F0FDF4",
                         padding: "4px 12px", borderRadius: 20, border: "1px solid #bbf7d0" }}>
            1,000 iterations · Monte Carlo
          </span>
        </div>

        {/* Scenario description */}
        {{
          bear: <div style={{ fontSize: 12, color: "#7F1D1D", background: "#FEF2F2",
                              border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px",
                              marginBottom: 20, lineHeight: 1.7 }}>
                  <strong>Bear:</strong> Google loses cloud share to AWS/Azure. CUDA/NVIDIA ecosystem lock-in prevents
                  TPU-scale adoption. Enterprise sales motion remains underdeveloped. Revenue growth decelerates
                  to 8–15%/yr; CapEx stays elevated as infrastructure commitments outpace revenue growth.
                </div>,
          base: <div style={{ fontSize: 12, color: "#1E3A8A", background: "#EFF6FF",
                              border: "1px solid #BFDBFE", borderRadius: 8, padding: "12px 16px",
                              marginBottom: 20, lineHeight: 1.7 }}>
                  <strong>Base:</strong> Google holds market share and grows in line with AI-driven cloud demand (~20–28%/yr).
                  TPU v5 and Gemini integrations attract net-new AI workloads. CapEx intensity moderates as infrastructure scales.
                  Operating margin reaches 15–22%.
                </div>,
          bull: <div style={{ fontSize: 12, color: "#14532D", background: "#F0FDF4",
                              border: "1px solid #BBF7D0", borderRadius: 8, padding: "12px 16px",
                              marginBottom: 20, lineHeight: 1.7 }}>
                  <strong>Bull:</strong> Google closes the scale gap with AWS/Azure. TPU advantage accelerates enterprise AI adoption;
                  Anthos multi-cloud wins large migrations. Revenue grows 32–42% above market.
                  Margin expands to 22–30% as cloud revenue leverages fixed infrastructure.
                </div>,
        }[scenario]}

        {/* Charts + KPIs side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>

          {/* Revenue trajectory chart */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "20px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
              Google Cloud Revenue Trajectory ($B) — P10 / P50 / P90
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>
              2024A actuals + 2025–2027E Monte Carlo distribution
            </div>
            <RevenueRangeChart scenario={scenario} />
          </div>

          {/* 2027 KPI cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy,
                          textTransform: "uppercase", letterSpacing: 1 }}>
              2027E Implied KPIs — {SC_LABELS[scenario]}
            </div>

            {/* Revenue range */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1,
                            textTransform: "uppercase", marginBottom: 8 }}>Cloud Revenue 2027E</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[["P10", sc.rev2027.p10], ["P50", sc.rev2027.p50], ["P90", sc.rev2027.p90]].map(([pct, val]) => (
                  <div key={pct} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{pct}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pct === "P50" ? color : C.navy }}>
                      ${val}B
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operating income range */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1,
                            textTransform: "uppercase", marginBottom: 8 }}>Operating Income 2027E</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[["P10", sc.opInc2027.p10], ["P50", sc.opInc2027.p50], ["P90", sc.opInc2027.p90]].map(([pct, val]) => (
                  <div key={pct} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{pct}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pct === "P50" ? color : C.navy }}>
                      ${val}B
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implied CapEx range */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${C.gYellow}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1,
                            textTransform: "uppercase", marginBottom: 8 }}>
                Implied Cloud CapEx 2027E
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[["P10", sc.capex2027.p10], ["P50", sc.capex2027.p50], ["P90", sc.capex2027.p90]].map(([pct, val]) => (
                  <div key={pct} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{pct}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pct === "P50" ? C.gYellow : C.navy }}>
                      ${val}B
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                Cloud-allocated CapEx (45–55% of total Alphabet CapEx).
                Total Alphabet CapEx will be higher.
              </div>
            </div>

            {/* Op margin range */}
            <div style={{ background: "#fff", borderRadius: 10, padding: "16px 18px",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1,
                            textTransform: "uppercase", marginBottom: 8 }}>Op. Margin Range 2027E</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {[["P10", sc.margin2027.p10], ["P50", sc.margin2027.p50], ["P90", sc.margin2027.p90]].map(([pct, val]) => (
                  <div key={pct} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: C.muted }}>{pct}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: pct === "P50" ? color : C.navy }}>
                      {(val * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology footnote */}
        <div style={{ marginTop: 32, borderTop: `1px solid ${C.grid}`, paddingTop: 16,
                      fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
          <strong style={{ color: C.navy }}>Methodology:</strong> Benchmarking KPIs computed from Alphabet, Amazon, and Microsoft
          10-K filings (FY2020–FY2024). Microsoft cloud revenue = Intelligent Cloud segment (Azure + Server Products).
          Scenario simulation: 1,000 Monte Carlo iterations per scenario; drivers (revenue growth, CapEx intensity, operating margin)
          sampled independently from Uniform[low, high] each year. Cloud CapEx allocation: 45–55% of total Alphabet CapEx
          attributed to Google Cloud based on disclosed infrastructure priorities.
          All projections are illustrative and not financial guidance.
          Sources: SEC EDGAR, Alphabet / Amazon / Microsoft annual reports, Wells Fargo / Goldman Sachs / JPMorgan
          equity research (Jan–Mar 2025).
        </div>
      </div>
    </div>
  );
}
