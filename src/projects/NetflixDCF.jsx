import { useState } from "react";
import {
  QUARTERS, SEASONAL_FACTORS, START,
  buildForecast, getForecast,
} from "./NetflixShared.js";
import { NI_FORE, OPEX_FORE } from "./NetflixOpEx.jsx";
import { useNetflix } from "./NetflixContext.js";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  NF: "#E50914", navy: "#0B1628", bg: "#F8F9FA",
  grid: "#E5E7EB", tick: "#6B7280", muted: "#9CA3AF",
};
const SC_COLORS = { bear: "#EA580C", consensus: "#DC2626", bull: "#16A34A", custom: "#7C3AED" };
const SC_LABELS  = { bear: "Bear", consensus: "Consensus", bull: "Bull", custom: "Custom" };

/* ── Market & capital structure inputs (editable defaults) ─── */
const DEFAULT_WACC_INPUTS = {
  rf:        4.3,   // risk-free rate, % (10-yr US Treasury)
  erp:       5.5,   // equity risk premium, %
  beta:      1.15,  // Netflix 5-yr monthly beta
  costDebt:  5.0,   // pre-tax cost of debt, %
  debtWeight:5.0,   // D / (D+E) based on market cap, %
  taxRate:   16.0,  // effective income tax rate, %
};

/* ── Terminal / projection assumptions ─────────────────────── */
const TERMINAL_GROWTH = { bear: 2.5, consensus: 3.5, bull: 4.5, custom: 3.5 };
const CAPEX_ANNUAL    = { fy26: 1.35, fy27: 1.50, terminal: 1.60 }; // $B PP&E only
const DNA_ANNUAL      = { fy26: 0.48, fy27: 0.53, terminal: 0.58 }; // D&A excl. content
const NWC_CHANGE      = { fy26: 0.30, fy27: 0.35, terminal: 0.35 }; // ΔNWC per year

/* ── Shares outstanding (M) — post-FY2025 buybacks ─────────── */
const SHARES_OUT = 429;

/* ── Net debt — FY2025A balance sheet ──────────────────────── */
const NET_DEBT = 13.24 - 7.59; // LTD - Cash = $5.65B

/* ── WACC calculator ─────────────────────────────────────────── */
function computeWACC(inp) {
  const ke     = inp.rf + inp.beta * inp.erp;           // cost of equity %
  const kdAt   = inp.costDebt * (1 - inp.taxRate / 100); // after-tax cost of debt %
  const ew     = (100 - inp.debtWeight) / 100;
  const dw     = inp.debtWeight / 100;
  return +(ew * ke + dw * kdAt).toFixed(3);
}

/* ── FCFF builder ────────────────────────────────────────────── */
function buildFCFF(opInc, taxRate, dna, capex, dnwc) {
  const nopat = opInc * (1 - taxRate / 100);
  return +(nopat + dna - capex - dnwc).toFixed(3);
}

/* ── DCF engine ──────────────────────────────────────────────── */
function runDCF(fcff26, fcff27, fcffT, wacc, tgr) {
  const w = wacc / 100;
  const g = tgr  / 100;
  const pv26 = fcff26 / (1 + w);
  const pv27 = fcff27 / (1 + w) ** 2;
  const tv   = fcffT * (1 + g) / (w - g);
  const pvTV = tv / (1 + w) ** 2;
  const ev   = +(pv26 + pv27 + pvTV).toFixed(2);
  const equityVal = +(ev - NET_DEBT).toFixed(2);
  const price = +(equityVal * 1000 / SHARES_OUT).toFixed(0); // convert $B → $M → per share
  return { pv26: +pv26.toFixed(2), pv27: +pv27.toFixed(2), pvTV: +pvTV.toFixed(2), tv: +tv.toFixed(2), ev, equityVal, price };
}

/* ── Sensitivity grid values ─────────────────────────────────── */
const SENS_WACCS = [7.5, 8.5, 9.5, 10.5, 11.5, 12.5];
const SENS_TGRS  = [1.5, 2.5, 3.5, 4.5, 5.5];

/* ══════════════════════════════════════════════════════════════
   WACC INPUTS PANEL
   ══════════════════════════════════════════════════════════════ */
function WACCPanel({ inputs, onChange, wacc }) {
  const fields = [
    { key: "rf",         label: "Risk-Free Rate",        suffix: "%" },
    { key: "erp",        label: "Equity Risk Premium",   suffix: "%" },
    { key: "beta",       label: "Beta (5-yr monthly)",   suffix: "×" },
    { key: "costDebt",   label: "Pre-Tax Cost of Debt",  suffix: "%" },
    { key: "debtWeight", label: "Debt Weight (mkt cap)", suffix: "%" },
    { key: "taxRate",    label: "Effective Tax Rate",    suffix: "%" },
  ];
  const ke   = inputs.rf + inputs.beta * inputs.erp;
  const kdAt = inputs.costDebt * (1 - inputs.taxRate / 100);

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.navy, margin: 0 }}>WACC Assumptions</h4>
        <button onClick={() => onChange(DEFAULT_WACC_INPUTS)} style={{ padding: "3px 12px", borderRadius: 20, border: `1.5px solid ${C.grid}`, background: "transparent", color: C.tick, fontSize: 10, cursor: "pointer", fontWeight: 600 }}>Reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        {fields.map(f => (
          <div key={f.key}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{f.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="number" step="0.1" min="0" max="50"
                value={inputs[f.key]}
                onChange={e => onChange({ ...inputs, [f.key]: +parseFloat(e.target.value).toFixed(2) })}
                style={{ width: "100%", padding: "5px 8px", border: `1px solid ${C.grid}`, borderRadius: 6, fontSize: 12, color: C.navy, fontFamily: "'Outfit', sans-serif", outline: "none" }}
              />
              <span style={{ fontSize: 11, color: C.muted }}>{f.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Derived outputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, background: "#F8F9FA", borderRadius: 8, padding: 12 }}>
        {[
          { label: "Cost of Equity",          val: `${ke.toFixed(2)}%` },
          { label: "After-Tax Cost of Debt",  val: `${kdAt.toFixed(2)}%` },
          { label: "WACC",                    val: `${wacc.toFixed(2)}%`, highlight: true },
          { label: "Shares Outstanding",      val: `${SHARES_OUT}M` },
        ].map(item => (
          <div key={item.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.highlight ? C.NF : C.navy, fontFamily: "'Cormorant Garamond', serif" }}>{item.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DCF BRIDGE TABLE
   ══════════════════════════════════════════════════════════════ */
function DCFBridge({ fcff26, fcff27, fcffT, wacc, tgr, col, result }) {
  const fmt = v => `$${Math.abs(v).toFixed(1)}B`;
  const rows = [
    { label: "FY2026E FCFF",                   val: fcff26,            indent: 1 },
    { label: "PV of FY2026E FCFF",             val: result.pv26,       indent: 2, sub: true },
    { label: "FY2027E FCFF",                   val: fcff27,            indent: 1 },
    { label: "PV of FY2027E FCFF",             val: result.pv27,       indent: 2, sub: true },
    { label: "Terminal Year FCFF",             val: fcffT,             indent: 1 },
    { label: `Terminal Value (WACC ${wacc.toFixed(1)}% / TGR ${tgr.toFixed(1)}%)`, val: result.tv, indent: 2, sub: true },
    { label: "PV of Terminal Value",           val: result.pvTV,       indent: 2, sub: true },
    { label: "Enterprise Value (EV)",          val: result.ev,         bold: true, section: true },
    { label: "Less: Net Debt",                 val: -NET_DEBT,         indent: 1 },
    { label: "Equity Value",                   val: result.equityVal,  bold: true, section: true },
    { label: `Implied Share Price (${SHARES_OUT}M shares)`, val: result.price / 1000 * SHARES_OUT / SHARES_OUT * 1000, bold: true, price: true },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.navy, margin: "0 0 16px" }}>DCF Bridge</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: row.bold ? C.bg : "#fff", borderTop: row.section ? `2px solid ${C.grid}` : undefined }}>
              <td style={{ padding: "7px 12px", paddingLeft: (row.indent ?? 0) * 16 + 12, color: row.sub ? C.muted : C.navy, fontWeight: row.bold ? 700 : 400, fontSize: row.sub ? 11 : 12 }}>
                {row.label}
              </td>
              <td style={{ padding: "7px 12px", textAlign: "right", fontWeight: row.bold ? 700 : 400, color: row.price ? C.NF : row.bold ? (col) : (row.sub ? C.muted : C.tick), fontSize: row.price ? 16 : 12 }}>
                {row.price ? `$${result.price.toLocaleString()}` : fmt(row.val)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SENSITIVITY TABLE
   ══════════════════════════════════════════════════════════════ */
function SensTable({ fcff26, fcff27, fcffT, baseWACC, baseTGR }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.navy, margin: "0 0 6px" }}>
        Share Price Sensitivity: WACC × Terminal Growth Rate
      </h4>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px" }}>Implied share price ($) across discount rate and terminal growth assumptions.</p>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, fontFamily: "'Outfit', sans-serif", minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 14px", background: C.navy, color: "#fff", fontWeight: 700, borderRadius: "4px 0 0 0", whiteSpace: "nowrap" }}>
                WACC → / TGR ↓
              </th>
              {SENS_WACCS.map(w => (
                <th key={w} style={{ padding: "8px 14px", background: Math.abs(w - baseWACC) < 0.01 ? C.NF : C.navy, color: "#fff", fontWeight: 700, textAlign: "center" }}>
                  {w.toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SENS_TGRS.map(g => (
              <tr key={g}>
                <td style={{ padding: "8px 14px", background: Math.abs(g - baseTGR) < 0.01 ? "#FEF2F2" : C.bg, fontWeight: Math.abs(g - baseTGR) < 0.01 ? 700 : 400, color: C.navy, whiteSpace: "nowrap" }}>
                  {g.toFixed(1)}% TGR
                </td>
                {SENS_WACCS.map(w => {
                  const r    = runDCF(fcff26, fcff27, fcffT, w, g);
                  const isBase = Math.abs(w - baseWACC) < 0.01 && Math.abs(g - baseTGR) < 0.01;
                  const price = r.price;
                  const bg = isBase ? "#FFFBEB"
                    : price > 1200 ? "#F0FDF4"
                    : price > 900  ? "#ECFDF5"
                    : price > 600  ? "#FEF9C3"
                    : price > 300  ? "#FEF3C7"
                    : "#FEF2F2";
                  const clr = price > 900 ? "#16A34A" : price > 600 ? "#92400E" : price > 300 ? "#B45309" : "#DC2626";
                  return (
                    <td key={w} style={{ padding: "8px 14px", textAlign: "center", background: bg, color: isBase ? "#92400E" : clr, fontWeight: isBase ? 700 : 500, border: isBase ? `2px solid #C9A84C` : "1px solid #F0F1F5" }}>
                      ${price.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: C.muted }}>
        Highlighted cell = base case (current scenario WACC & TGR). Green = bull range, yellow = fair value, red = below base. Netflix current market price context: ~$900–1,000 at time of model build.
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   FCFF BRIDGE DETAIL
   ══════════════════════════════════════════════════════════════ */
function FCFFDetail({ opInc26, opInc27, taxRate, col }) {
  const rows = [
    [
      { label: "EBIT (Operating Income)",          v26: opInc26, v27: opInc27 },
      { label: "× (1 − Tax Rate)",                 v26: `(1 − ${(taxRate).toFixed(0)}%)`, v27: null, txt: true },
      { label: "= NOPAT",                           v26: opInc26*(1-taxRate/100), v27: opInc27*(1-taxRate/100), bold: true },
      { label: "+ D&A (PP&E only)",                 v26: DNA_ANNUAL.fy26, v27: DNA_ANNUAL.fy27 },
      { label: "− Capital Expenditures",            v26: -CAPEX_ANNUAL.fy26, v27: -CAPEX_ANNUAL.fy27 },
      { label: "− Change in Net Working Capital",  v26: -NWC_CHANGE.fy26, v27: -NWC_CHANGE.fy27 },
    ],
  ][0];

  const fcff26 = buildFCFF(opInc26, taxRate, DNA_ANNUAL.fy26, CAPEX_ANNUAL.fy26, NWC_CHANGE.fy26);
  const fcff27 = buildFCFF(opInc27, taxRate, DNA_ANNUAL.fy27, CAPEX_ANNUAL.fy27, NWC_CHANGE.fy27);

  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 }}>
      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: C.navy, margin: "0 0 6px" }}>
        FCFF Build (Unlevered Free Cash Flow to Firm)
      </h4>
      <p style={{ fontSize: 12, color: C.muted, margin: "0 0 16px" }}>
        Content spend is an operating cost (captured in COR → EBIT). Capital expenditures here reflect PP&E only.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif" }}>
        <thead>
          <tr>
            <th style={{ padding: "6px 12px", textAlign: "left", background: "#F4F5F8", color: C.navy, borderBottom: `2px solid ${C.grid}`, fontSize: 11 }}>
              ($ Billions)
            </th>
            <th style={{ padding: "6px 12px", textAlign: "center", background: `${col}10`, color: col, borderBottom: `2px solid ${col}`, fontSize: 11 }}>FY2026E</th>
            <th style={{ padding: "6px 12px", textAlign: "center", background: `${col}10`, color: col, borderBottom: `2px solid ${col}`, fontSize: 11 }}>FY2027E</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: row.bold ? "#F0F4FF" : i % 2 === 0 ? "#F8F9FA" : "#fff", borderTop: row.bold ? `2px solid ${C.grid}` : undefined }}>
              <td style={{ padding: "6px 12px", color: C.navy, fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
              <td style={{ padding: "6px 12px", textAlign: "center", color: row.bold ? col : C.tick, fontWeight: row.bold ? 700 : 400 }}>
                {row.txt ? row.v26 : row.v26 >= 0 ? `$${row.v26.toFixed(2)}B` : `($${Math.abs(row.v26).toFixed(2)}B)`}
              </td>
              <td style={{ padding: "6px 12px", textAlign: "center", color: row.bold ? col : C.tick, fontWeight: row.bold ? 700 : 400 }}>
                {row.txt || row.v27 === null ? (row.v27 ?? "—") : row.v27 >= 0 ? `$${row.v27.toFixed(2)}B` : `($${Math.abs(row.v27).toFixed(2)}B)`}
              </td>
            </tr>
          ))}
          <tr style={{ background: "#EEF2FF", borderTop: `2px solid ${col}` }}>
            <td style={{ padding: "6px 12px", color: col, fontWeight: 700 }}>= FCFF</td>
            <td style={{ padding: "6px 12px", textAlign: "center", color: col, fontWeight: 700 }}>${fcff26.toFixed(2)}B</td>
            <td style={{ padding: "6px 12px", textAlign: "center", color: col, fontWeight: 700 }}>${fcff27.toFixed(2)}B</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixDCF() {
  const { scenario, setScenario, customDrivers, customOpEx } = useNetflix();
  const [waccInputs, setWaccInputs] = useState(DEFAULT_WACC_INPUTS);

  const isCustom = scenario === "custom";
  const scKey    = isCustom ? "consensus" : scenario;
  const col      = SC_COLORS[scenario] ?? SC_COLORS.consensus;
  const taxRate  = NI_FORE.taxRate[scKey] ?? NI_FORE.taxRate.consensus;
  const tgr      = TERMINAL_GROWTH[scenario] ?? TERMINAL_GROWTH.consensus;

  /* ── Forecast revenues & margins ── */
  const cd = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecastQtr = isCustom
    ? buildForecast(START.subs, START.arm,
        cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS,
        cd.netAddsEnd ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, SEASONAL_FACTORS)
    : getForecast(scenario, SEASONAL_FACTORS);

  const fy26Rev = forecastQtr.slice(0, 4).reduce((s, q) => s + q.revenue, 0);
  const fy27Rev = forecastQtr.slice(4, 8).reduce((s, q) => s + q.revenue, 0);

  const base = isCustom ? OPEX_FORE.consensus : OPEX_FORE[scenario];
  const margin26 = isCustom
    ? (0.290 + (customOpEx?.mgn27 ?? OPEX_FORE.consensus.fy27.margin)) / 2
    : base.fy26.margin;
  const margin27 = isCustom
    ? (customOpEx?.mgn27 ?? OPEX_FORE.consensus.fy27.margin)
    : base.fy27.margin;

  const opInc26 = +(fy26Rev * margin26).toFixed(3);
  const opInc27 = +(fy27Rev * margin27).toFixed(3);

  /* ── FCFF ── */
  const fcff26 = buildFCFF(opInc26, taxRate * 100, DNA_ANNUAL.fy26, CAPEX_ANNUAL.fy26, NWC_CHANGE.fy26);
  const fcff27 = buildFCFF(opInc27, taxRate * 100, DNA_ANNUAL.fy27, CAPEX_ANNUAL.fy27, NWC_CHANGE.fy27);

  // Terminal FCFF: FY2027 NOPAT adjusted for terminal-year capex/DNA
  const fcffT  = buildFCFF(opInc27, taxRate * 100, DNA_ANNUAL.terminal, CAPEX_ANNUAL.terminal, NWC_CHANGE.terminal);

  /* ── WACC & DCF ── */
  const wacc   = computeWACC(waccInputs);
  const result = runDCF(fcff26, fcff27, fcffT, wacc, tgr);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: "24px 40px", borderBottom: `3px solid ${C.NF}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: C.NF, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.NF }}>DCF Valuation</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Netflix Intrinsic Value Model
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Unlevered DCF · 2-Year Explicit Forecast + Terminal Value · Scenario-Linked Cash Flows
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>

        {/* Scenario pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Scenario:</span>
          {["bear", "consensus", "bull", "custom"].map(key => {
            const active = scenario === key;
            return (
              <button key={key} onClick={() => setScenario(key)} style={{
                padding: "4px 14px", borderRadius: 20,
                border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
                background: active ? SC_COLORS[key] : "#fff",
                color: active ? "#fff" : C.tick,
                fontSize: 11, cursor: "pointer", fontWeight: active ? 700 : 400,
              }}>{SC_LABELS[key]}</button>
            );
          })}
          <span style={{ marginLeft: 8, fontSize: 11, color: C.muted }}>
            Terminal growth: <strong style={{ color: col }}>{tgr.toFixed(1)}%</strong> · Tax rate: <strong style={{ color: col }}>{(taxRate * 100).toFixed(0)}%</strong>
          </span>
        </div>

        {/* Implied price hero */}
        <div style={{ background: C.navy, borderRadius: 12, padding: "20px 28px", marginBottom: 20, display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Implied Share Price</div>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 600, color: col }}>${result.price.toLocaleString()}</div>
          </div>
          {[
            { label: "Enterprise Value",  val: `$${result.ev.toFixed(1)}B` },
            { label: "Equity Value",      val: `$${result.equityVal.toFixed(1)}B` },
            { label: "PV Forecast CFs",   val: `$${(result.pv26 + result.pv27).toFixed(1)}B` },
            { label: "PV Terminal Value", val: `$${result.pvTV.toFixed(1)}B` },
            { label: "WACC",              val: `${wacc.toFixed(2)}%` },
          ].map(item => (
            <div key={item.label} style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 24 }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Cormorant Garamond', serif" }}>{item.val}</div>
            </div>
          ))}
        </div>

        {/* WACC inputs */}
        <WACCPanel inputs={waccInputs} onChange={setWaccInputs} wacc={wacc} />

        {/* FCFF detail */}
        <FCFFDetail opInc26={opInc26} opInc27={opInc27} taxRate={taxRate * 100} col={col} />

        {/* DCF bridge */}
        <DCFBridge fcff26={fcff26} fcff27={fcff27} fcffT={fcffT} wacc={wacc} tgr={tgr} col={col} result={result} />

        {/* Sensitivity */}
        <SensTable fcff26={fcff26} fcff27={fcff27} fcffT={fcffT} baseWACC={wacc} baseTGR={tgr} />

        {/* Footer */}
        <div style={{ marginTop: 14, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          Model: 2-period explicit forecast (FY2026E, FY2027E) + Gordon Growth terminal value. FCFF = NOPAT + D&A − CapEx − ΔNWC.
          Content spend is an operating cost captured in EBIT, not a separate capital item. CapEx = PP&E additions only (~$1.35–1.60B/yr).
          Net debt = Long-term debt ($13.24B) − cash ($7.59B) = $5.65B (FY2025A). Shares outstanding: 429M (post-buyback estimate).
          This model is illustrative only and not financial advice.
        </div>
      </div>
    </div>
  );
}
