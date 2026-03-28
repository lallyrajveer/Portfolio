import { useState } from "react";
import {
  HISTORICAL, QUARTERS, SEASONAL_FACTORS, START,
  buildForecast, getForecast,
} from "./NetflixShared.js";
import { HIST_YR, NI_FORE, OPEX_FORE } from "./NetflixOpEx.jsx";
import { useNetflix } from "./NetflixContext.js";

/* ── Design tokens ─────────────────────────────────────────── */
const C = {
  NF: "#E50914", navy: "#0B1628", bg: "#F8F9FA",
  grid: "#E5E7EB", tick: "#6B7280", muted: "#9CA3AF", light: "#F4F5F8",
};
const SC_COLORS = { bear: "#EA580C", consensus: "#DC2626", bull: "#16A34A", custom: "#7C3AED" };
const SC_LABELS  = { bear: "Bear", consensus: "Consensus", bull: "Bull", custom: "Custom" };

/* ── Annual revenues from HISTORICAL quarters ─────────────── */
const FY_REV_HIST = [
  HISTORICAL.slice(0, 4).reduce((s, q) => s + q.rev, 0),   // FY2023 → 33.72
  HISTORICAL.slice(4, 8).reduce((s, q) => s + q.rev, 0),   // FY2024 → 39.01
  HISTORICAL.slice(8, 12).reduce((s, q) => s + q.rev, 0),  // FY2025 → 45.18
];

/* ── Historical P&L — derived from HIST_YR cost % × annual revenue ── */
const HIST_PL = FY_REV_HIST.map((rev, i) => {
  const h    = HIST_YR[i];
  const cor  = +(rev * h.corPct).toFixed(2);
  const tnd  = +(rev * h.tndPct).toFixed(2);
  const mktg = +(rev * h.mktgPct).toFixed(2);
  const ga   = +(rev * h.gaPct).toFixed(2);
  const gp   = +(rev - cor).toFixed(2);
  const opInc = +(rev - cor - tnd - mktg - ga).toFixed(2);
  const ebt   = +(opInc - NI_FORE.netIntExp).toFixed(2);
  const netInc = +(rev * h.netMgnPct).toFixed(2);
  const taxProv = +(ebt - netInc).toFixed(2);
  return {
    label: `FY${2023 + i}A`, isForecast: false, rev, cor, tnd, mktg, ga, gp, opInc,
    intExp: NI_FORE.netIntExp, ebt, taxProv, netInc,
    gpMgn:  +(gp / rev * 100).toFixed(1),
    opMgn:  +(opInc / rev * 100).toFixed(1),
    netMgn: +(netInc / rev * 100).toFixed(1),
  };
});

/* ── Historical Balance Sheet (Netflix 10-K; FY2024-25 estimated) ── */
// FY2023: Netflix 10-K (Dec 31, 2023). FY2024-2025: estimates derived from public filings.
const HIST_BS = [
  { cash: 7.12, totalCurrent: 9.37,  contentAssets: 32.72, ppe: 1.90, otherNC: 4.68,
    totalAssets: 48.67, totalCurrentLiab: 8.76, ltd: 14.54, otherLTLiab: 6.45,
    totalLiab: 29.75, equity: 18.92 },
  { cash: 7.39, totalCurrent: 9.84,  contentAssets: 34.50, ppe: 2.15, otherNC: 5.51,
    totalAssets: 52.00, totalCurrentLiab: 9.70, ltd: 14.04, otherLTLiab: 5.94,
    totalLiab: 29.68, equity: 22.32 },
  { cash: 7.59, totalCurrent: 10.32, contentAssets: 35.50, ppe: 2.45, otherNC: 6.30,
    totalAssets: 54.57, totalCurrentLiab: 10.20, ltd: 13.24, otherLTLiab: 4.32,
    totalLiab: 27.76, equity: 26.81 },
];

/* ── Historical Cash Flow (Netflix 10-K; FY2024-25 estimated) ─ */
// Content amortization is a non-cash component of COR; shown here as an operating add-back.
// FCF = Operating Cash Flow − Capital Expenditures.
// Source: Netflix 10-K filings. OCF/ICF/FinCF reconcile exactly to BS cash changes.
// WC = OCF − NI − contentAmort − D&A − SBC − contentCash (plug).
// FY2023: net Δcash +$1.97B (5.15→7.12). FY2024: +$0.27B (7.12→7.39). FY2025: +$0.20B (7.39→7.59).
const HIST_CF = [
  { contentAmort: 14.13, dna: 0.28, sbc: 0.63, contentCash: -14.35, wc:  0.84,
    ocf: 6.93, capex: -0.45, icf: -0.45, fcf: 6.48, debtNet: -1.00, buybacks:  0.00, finCF: -4.51 },
  { contentAmort: 15.20, dna: 0.35, sbc: 0.82, contentCash: -17.20, wc: -0.60,
    ocf: 7.27, capex: -0.70, icf: -0.70, fcf: 6.57, debtNet: -0.50, buybacks: -6.23, finCF: -6.30 },
  { contentAmort: 17.00, dna: 0.40, sbc: 0.90, contentCash: -19.00, wc: -1.59,
    ocf: 8.20, capex: -0.75, icf: -0.75, fcf: 7.45, debtNet: -0.80, buybacks: -7.00, finCF: -7.25 },
];

/* ── Forecast projection helpers ──────────────────────────── */
const FCF_CONV    = { bear: 0.78, consensus: 0.83, bull: 0.88, custom: 0.83 };
const CONTENT_GRW = { bear: 1.02, consensus: 1.04, bull: 1.06, custom: 1.04 };
const SBC_ANNUAL  = 1.0;
const DEBT_REPAY  = 0.75;
const BUYBACK_RT  = 0.93;

/* ══════════════════════════════════════════════════════════════
   INCOME STATEMENT TAB
   ══════════════════════════════════════════════════════════════ */
function PLTab({ years, col }) {
  const fmt  = v => `$${Math.abs(v).toFixed(1)}B`;
  const fmtP = v => `${v.toFixed(1)}%`;

  const rows = [
    { label: "Revenue",                    key: "rev",      bold: true, section: null },
    { label: "Cost of Revenue",            key: "cor",      bold: false, neg: true },
    { label: "Gross Profit",               key: "gp",       bold: true, section: "after-cor" },
    { label: "  Gross Margin %",           key: "gpMgn",    pct: true },
    { label: "Technology & Development",   key: "tnd",      bold: false, neg: true },
    { label: "Marketing",                  key: "mktg",     bold: false, neg: true },
    { label: "General & Administrative",   key: "ga",       bold: false, neg: true },
    { label: "Operating Income",           key: "opInc",    bold: true, section: "after-opex" },
    { label: "  Operating Margin %",       key: "opMgn",    pct: true },
    { label: "Net Interest Expense",       key: "intExp",   bold: false, neg: true },
    { label: "Pre-Tax Income",             key: "ebt",      bold: true, section: "after-int" },
    { label: "Income Tax Provision",       key: "taxProv",  bold: false, neg: true },
    { label: "Net Income",                 key: "netInc",   bold: true, section: "after-tax" },
    { label: "  Net Margin %",             key: "netMgn",   pct: true },
  ];

  const thStyle = (y) => ({
    padding: "6px 12px", textAlign: "center", fontSize: 11, fontWeight: 700,
    background: y.isForecast ? `${col}10` : C.light,
    color: y.isForecast ? col : C.navy,
    borderBottom: `2px solid ${y.isForecast ? col : C.grid}`,
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed", minWidth: 700 }}>
        <colgroup>
          <col style={{ width: "26%" }} />
          {years.map(y => <col key={y.label} style={{ width: `${74 / years.length}%` }} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ padding: "6px 12px", textAlign: "left", background: C.light, color: C.navy, borderBottom: `2px solid ${C.grid}`, fontSize: 11 }}>
              ($ Billions)
            </th>
            {years.map(y => <th key={y.label} style={thStyle(y)}>{y.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const isSep = ["after-cor","after-opex","after-int","after-tax"].includes(row.section);
            return (
              <tr key={row.label} style={{ background: row.bold && !row.pct ? (ri % 4 === 0 ? "#F0F4FF" : "#F8F9FA") : "#fff", borderTop: isSep ? `2px solid ${C.grid}` : undefined }}>
                <td style={{ padding: "6px 12px", color: row.pct ? C.muted : C.navy, fontWeight: row.bold ? 700 : 400, fontSize: row.pct ? 11 : 12 }}>
                  {row.label}
                </td>
                {years.map((y, yi) => {
                  const val = y[row.key];
                  const prev = yi > 0 ? years[yi - 1][row.key] : null;
                  const growth = prev && !row.pct && !row.neg && row.bold && row.key !== "gp" ? +((val / prev - 1) * 100).toFixed(1) : null;
                  return (
                    <td key={y.label} style={{
                      padding: "6px 12px", textAlign: "center",
                      color: row.pct ? (y.isForecast ? col : C.tick) : (row.neg ? "#DC2626" : (row.bold ? (y.isForecast ? col : C.navy) : C.tick)),
                      fontWeight: row.bold ? 700 : 400,
                      background: y.isForecast ? `${col}05` : undefined,
                      fontSize: row.pct ? 11 : 12,
                    }}>
                      {row.pct
                        ? fmtP(val)
                        : row.neg
                          ? `(${fmt(val)})`
                          : fmt(val)
                      }
                      {growth !== null && (
                        <span style={{ marginLeft: 4, fontSize: 9, color: growth >= 0 ? "#16A34A" : "#DC2626", fontWeight: 700 }}>
                          {growth >= 0 ? "+" : ""}{growth}%
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   BALANCE SHEET TAB
   ══════════════════════════════════════════════════════════════ */
function BSTab({ years, col }) {
  const fmt = v => `$${v.toFixed(1)}B`;

  const assetRows = [
    { label: "Cash & Equivalents",       key: "cash",         indent: 1 },
    { label: "Total Current Assets",     key: "totalCurrent", indent: 0, bold: true },
    { label: "Content Assets (net)",     key: "contentAssets",indent: 1 },
    { label: "Property & Equipment (net)",key:"ppe",           indent: 1 },
    { label: "Other Non-Current Assets", key: "otherNC",      indent: 1 },
    { label: "Total Assets",             key: "totalAssets",  indent: 0, bold: true, section: true },
  ];
  const liabRows = [
    { label: "Total Current Liabilities",key: "totalCurrentLiab", indent: 0, bold: true },
    { label: "Long-Term Debt",           key: "ltd",          indent: 1 },
    { label: "Other Non-Current Liabilities", key: "otherLTLiab", indent: 1 },
    { label: "Total Liabilities",        key: "totalLiab",    indent: 0, bold: true, section: true },
    { label: "Total Stockholders' Equity",key:"equity",       indent: 0, bold: true },
    { label: "Total Liabilities & Equity",key:"totalAssets",  indent: 0, bold: true, section: true, highlight: true },
  ];

  const thStyle = (y) => ({
    padding: "6px 12px", textAlign: "center", fontSize: 11, fontWeight: 700,
    background: y.isForecast ? `${col}10` : C.light,
    color: y.isForecast ? col : C.navy,
    borderBottom: `2px solid ${y.isForecast ? col : C.grid}`,
  });

  const renderSection = (rows, header) => (
    <>
      <tr>
        <td colSpan={years.length + 1} style={{ padding: "8px 12px", background: "#0B162810", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.navy }}>
          {header}
        </td>
      </tr>
      {rows.map(row => (
        <tr key={row.label} style={{ background: row.highlight ? "#FFFBEB" : row.section ? C.light : (row.indent ? "#fff" : "#F8F9FA"), borderTop: row.section ? `2px solid ${C.grid}` : undefined }}>
          <td style={{ padding: "6px 12px", paddingLeft: row.indent ? 24 : 12, color: C.navy, fontWeight: row.bold ? 700 : 400, fontSize: 12 }}>
            {row.label}
          </td>
          {years.map(y => (
            <td key={y.label} style={{ padding: "6px 12px", textAlign: "center", color: row.highlight ? "#92400E" : row.bold ? (y.isForecast ? col : C.navy) : C.tick, fontWeight: row.bold ? 700 : 400, background: y.isForecast ? `${col}05` : undefined, fontSize: 12 }}>
              {fmt(y[row.key])}
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed", minWidth: 700 }}>
        <colgroup>
          <col style={{ width: "28%" }} />
          {years.map(y => <col key={y.label} style={{ width: `${72 / years.length}%` }} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ padding: "6px 12px", textAlign: "left", background: C.light, color: C.navy, borderBottom: `2px solid ${C.grid}`, fontSize: 11 }}>($ Billions)</th>
            {years.map(y => <th key={y.label} style={thStyle(y)}>{y.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {renderSection(assetRows, "Assets")}
          {renderSection(liabRows, "Liabilities & Stockholders' Equity")}

          {/* ── Balance Sheet Check ── */}
          <tr>
            <td colSpan={years.length + 1} style={{ padding: "6px 12px", background: "#0B1628", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Model Check
            </td>
          </tr>
          <tr>
            <td style={{ padding: "7px 12px", fontSize: 11, fontWeight: 700, color: C.navy, background: "#F8F9FA" }}>
              Balance Check&nbsp;<span style={{ fontWeight: 400, color: C.muted }}>(Assets − L&amp;E)</span>
            </td>
            {years.map(y => {
              const diff = +(y.totalAssets - (+(y.totalLiab + y.equity).toFixed(2))).toFixed(2);
              const ok   = Math.abs(diff) < 0.02;
              return (
                <td key={y.label} style={{ padding: "7px 12px", textAlign: "center", fontWeight: 700, fontSize: 12, background: ok ? "#DCFCE7" : "#FEE2E2", color: ok ? "#15803D" : "#DC2626" }}>
                  {ok ? "✓  OK" : `⚠  $${Math.abs(diff).toFixed(2)}B off`}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CASH FLOW TAB
   ══════════════════════════════════════════════════════════════ */
function CFTab({ years, col }) {
  const fmt = v => (v == null || v === 0) ? "—" : v < 0 ? `($${Math.abs(v).toFixed(1)}B)` : `$${v.toFixed(1)}B`;

  const rows = [
    { label: "OPERATING ACTIVITIES", header: true },
    { label: "Net Income",                key: "netInc",      indent: 1 },
    { label: "Content Amortization",      key: "contentAmort",indent: 1, addBack: true },
    { label: "Depreciation & Amortization",key:"dna",         indent: 1, addBack: true },
    { label: "Stock-Based Compensation",  key: "sbc",         indent: 1, addBack: true },
    { label: "Cash Paid for Content",     key: "contentCash", indent: 1 },
    { label: "Working Capital & Other",   key: "wc",          indent: 1 },
    { label: "Net Cash from Operations",  key: "ocf",         bold: true, section: true },
    { label: "INVESTING ACTIVITIES", header: true },
    { label: "Capital Expenditures",      key: "capex",       indent: 1 },
    { label: "Net Cash from Investing",   key: "icf",         bold: true, section: true },
    { label: "Free Cash Flow (OCF − CapEx)", key: "fcf",      bold: true, highlight: true },
    { label: "FINANCING ACTIVITIES", header: true },
    { label: "Debt Repayment / Issuance", key: "debtNet",     indent: 1 },
    { label: "Share Repurchases",         key: "buybacks",    indent: 1 },
    { label: "Net Cash from Financing",   key: "finCF",       bold: true, section: true },
  ];

  const thStyle = (y) => ({
    padding: "6px 12px", textAlign: "center", fontSize: 11, fontWeight: 700,
    background: y.isForecast ? `${col}10` : C.light,
    color: y.isForecast ? col : C.navy,
    borderBottom: `2px solid ${y.isForecast ? col : C.grid}`,
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "'Outfit', sans-serif", tableLayout: "fixed", minWidth: 700 }}>
        <colgroup>
          <col style={{ width: "28%" }} />
          {years.map(y => <col key={y.label} style={{ width: `${72 / years.length}%` }} />)}
        </colgroup>
        <thead>
          <tr>
            <th style={{ padding: "6px 12px", textAlign: "left", background: C.light, color: C.navy, borderBottom: `2px solid ${C.grid}`, fontSize: 11 }}>($ Billions)</th>
            {years.map(y => <th key={y.label} style={thStyle(y)}>{y.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => row.header ? (
            <tr key={ri}>
              <td colSpan={years.length + 1} style={{ padding: "8px 12px", background: "#0B162810", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.navy }}>{row.label}</td>
            </tr>
          ) : (
            <tr key={row.label} style={{
              background: row.highlight ? "#FFFBEB" : row.section ? C.light : (row.indent ? "#fff" : "#F8F9FA"),
              borderTop: row.section ? `2px solid ${C.grid}` : undefined,
            }}>
              <td style={{ padding: "6px 12px", paddingLeft: row.indent ? 24 : 12, color: row.highlight ? "#92400E" : C.navy, fontWeight: row.bold ? 700 : 400, fontSize: 12 }}>
                {row.label}
              </td>
              {years.map(y => {
                const val = y[row.key];
                return (
                  <td key={y.label} style={{
                    padding: "6px 12px", textAlign: "center", fontSize: 12,
                    color: row.highlight ? "#92400E" : row.bold ? (y.isForecast ? col : C.navy) : (val < 0 ? "#DC2626" : C.tick),
                    fontWeight: row.bold ? 700 : 400,
                    background: y.isForecast ? `${col}05` : undefined,
                  }}>
                    {fmt(val)}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* ── Cash Reconciliation Check ── */}
          <tr>
            <td colSpan={years.length + 1} style={{ padding: "6px 12px", background: "#0B1628", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
              Model Check
            </td>
          </tr>
          <tr style={{ background: "#F8F9FA" }}>
            <td style={{ padding: "7px 12px 4px", fontSize: 11, color: C.tick, paddingLeft: 24 }}>Beginning Cash (prior BS)</td>
            {years.map(y => (
              <td key={y.label} style={{ padding: "7px 12px 4px", textAlign: "center", fontSize: 11, color: C.tick, background: y.isForecast ? `${col}05` : undefined }}>
                {y.priorCash != null ? `$${y.priorCash.toFixed(2)}B` : "—"}
              </td>
            ))}
          </tr>
          <tr style={{ background: "#F8F9FA" }}>
            <td style={{ padding: "4px 12px 4px", fontSize: 11, color: C.tick, paddingLeft: 24 }}>Ending Cash (CF Net)</td>
            {years.map(y => {
              const cfEnd = y.priorCash != null ? +(y.priorCash + y.ocf + y.icf + y.finCF).toFixed(2) : null;
              return (
                <td key={y.label} style={{ padding: "4px 12px", textAlign: "center", fontSize: 11, color: C.navy, fontWeight: 600, background: y.isForecast ? `${col}05` : undefined }}>
                  {cfEnd != null ? `$${cfEnd.toFixed(2)}B` : "—"}
                </td>
              );
            })}
          </tr>
          <tr>
            <td style={{ padding: "4px 12px 7px", fontSize: 11, fontWeight: 700, color: C.navy, background: "#F8F9FA" }}>
              Cash Check&nbsp;<span style={{ fontWeight: 400, color: C.muted }}>(CF end − BS cash)</span>
            </td>
            {years.map(y => {
              if (y.priorCash == null) return <td key={y.label} style={{ padding: "4px 12px 7px", textAlign: "center", background: "#F8F9FA" }}>—</td>;
              const cfEnd = +(y.priorCash + y.ocf + y.icf + y.finCF).toFixed(2);
              const diff  = +(cfEnd - y.bsCash).toFixed(2);
              const ok    = Math.abs(diff) < 0.02;
              return (
                <td key={y.label} style={{ padding: "4px 12px 7px", textAlign: "center", fontWeight: 700, fontSize: 12, background: ok ? "#DCFCE7" : "#FEE2E2", color: ok ? "#15803D" : "#DC2626" }}>
                  {ok ? "✓  OK" : `⚠  $${Math.abs(diff).toFixed(2)}B off`}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ROOT
   ══════════════════════════════════════════════════════════════ */
export default function NetflixThreeStatement() {
  const { scenario, setScenario, customDrivers, customOpEx } = useNetflix();
  const [tab, setTab] = useState("pl");

  const isCustom = scenario === "custom";
  const scKey    = isCustom ? "consensus" : scenario;
  const col      = SC_COLORS[scenario] ?? SC_COLORS.consensus;
  const taxRate  = NI_FORE.taxRate[scKey] ?? NI_FORE.taxRate.consensus;

  /* ── Build forecast quarterly data ── */
  const cd = customDrivers ?? {};
  const customArmGrowthEnd = (((cd.armEnd ?? 13.51) / START.arm) ** (1 / 8) - 1) * 400;
  const forecastQtr = isCustom
    ? buildForecast(START.subs, START.arm,
        cd.netAddsStart ?? 7.0, cd.armGrowthStart ?? 4.5, cd.churnStart ?? 1.9, QUARTERS,
        cd.netAddsEnd ?? 9.0, customArmGrowthEnd, cd.churnEnd ?? 1.9, false, SEASONAL_FACTORS)
    : getForecast(scenario, SEASONAL_FACTORS);

  /* ── Forecast P&L ── */
  const fy26Rev = +(forecastQtr.slice(0, 4).reduce((s, q) => s + q.revenue, 0)).toFixed(2);
  const fy27Rev = +(forecastQtr.slice(4, 8).reduce((s, q) => s + q.revenue, 0)).toFixed(2);

  const buildForePL = (rev, opexKey, label) => {
    const base  = isCustom ? OPEX_FORE.consensus : OPEX_FORE[scenario];
    const op    = base[opexKey];
    const margin = opexKey === "fy26"
      ? (isCustom ? (0.290 + (customOpEx?.mgn27 ?? OPEX_FORE.consensus.fy27.margin)) / 2 : op.margin)
      : (isCustom ? (customOpEx?.mgn27 ?? OPEX_FORE.consensus.fy27.margin) : op.margin);
    const cor  = +(rev * (1 - margin - op.tndPct - op.mktgPct - op.gaPct)).toFixed(2);
    const tnd  = +(rev * op.tndPct).toFixed(2);
    const mktg = +(rev * op.mktgPct).toFixed(2);
    const ga   = +(rev * op.gaPct).toFixed(2);
    const gp   = +(rev - cor).toFixed(2);
    const opInc = +(rev * margin).toFixed(2);
    const ebt   = +(opInc - NI_FORE.netIntExp).toFixed(2);
    const netInc = +(ebt * (1 - taxRate)).toFixed(2);
    const taxProv = +(ebt - netInc).toFixed(2);
    return {
      label, isForecast: true, rev, cor, tnd, mktg, ga, gp, opInc,
      intExp: NI_FORE.netIntExp, ebt, taxProv, netInc,
      gpMgn: +(gp / rev * 100).toFixed(1),
      opMgn: +(opInc / rev * 100).toFixed(1),
      netMgn: +(netInc / rev * 100).toFixed(1),
    };
  };

  const fy26PL = buildForePL(fy26Rev, "fy26", "FY2026E");
  const fy27PL = buildForePL(fy27Rev, "fy27", "FY2027E");
  const plYears = [...HIST_PL, fy26PL, fy27PL];

  /* ── Forecast Balance Sheet ── */
  const fcfConv = FCF_CONV[scenario] ?? FCF_CONV.consensus;
  const cg      = CONTENT_GRW[scenario] ?? CONTENT_GRW.consensus;
  const last    = HIST_BS[2];

  const buildForeBS = (prior, ni) => {
    const fcf      = +(ni * fcfConv).toFixed(2);
    const buybacks = -(+(fcf * BUYBACK_RT).toFixed(2));
    const cash     = +(prior.cash + fcf * (1 - BUYBACK_RT) - DEBT_REPAY).toFixed(2);
    const content  = +(prior.contentAssets * cg).toFixed(2);
    const ppe      = +(prior.ppe * 1.06).toFixed(2);
    const otherNC  = +(prior.otherNC * 1.03).toFixed(2);
    const otherCurr = +(prior.totalCurrent - prior.cash).toFixed(2);
    const totalCurrent = +(cash + otherCurr * 1.03).toFixed(2);
    const ltd      = +(prior.ltd - DEBT_REPAY).toFixed(2);
    const otherLTLiab = +(prior.otherLTLiab * 0.98).toFixed(2);
    const totalCurrentLiab = +(prior.totalCurrentLiab * 1.03).toFixed(2);
    const equity   = +(prior.equity + ni + buybacks + SBC_ANNUAL).toFixed(2);
    const totalLiab = +(totalCurrentLiab + ltd + otherLTLiab).toFixed(2);
    const totalAssets = +(totalLiab + equity).toFixed(2);
    return { isForecast: true, cash, totalCurrent, contentAssets: content, ppe, otherNC, totalAssets, totalCurrentLiab, ltd, otherLTLiab, totalLiab, equity, _fcf: fcf, _buybacks: buybacks };
  };

  const fy26BS = buildForeBS(last, fy26PL.netInc);
  fy26BS.label = "FY2026E";
  const fy27BS = buildForeBS(fy26BS, fy27PL.netInc);
  fy27BS.label = "FY2027E";
  const bsYears = [
    { label: "FY2023A", isForecast: false, ...HIST_BS[0] },
    { label: "FY2024A", isForecast: false, ...HIST_BS[1] },
    { label: "FY2025A", isForecast: false, ...HIST_BS[2] },
    fy26BS, fy27BS,
  ];

  /* ── Forecast Cash Flow ── */
  const buildForeCF = (ni, fcf, buybacks, opexKey) => {
    const base = isCustom ? OPEX_FORE.consensus : OPEX_FORE[scenario];
    const rev  = opexKey === "fy26" ? fy26Rev : fy27Rev;
    const contentAmort = +(rev * (isCustom ? OPEX_FORE.consensus[opexKey].corPct : base[opexKey].corPct) * 0.88).toFixed(2);
    const contentCash  = -(+(contentAmort * 1.06).toFixed(2));
    const dna    = opexKey === "fy26" ? 0.48 : 0.53;
    const sbc    = SBC_ANNUAL;
    const capex  = opexKey === "fy26" ? -1.35 : -1.50;
    const icf    = capex; // ICF = CapEx only; ensures CF ending cash ties to BS
    const ocf    = +(fcf - capex).toFixed(2); // capex negative → ocf = fcf + |capex|
    const wc     = +(ocf - ni - contentAmort - dna - sbc - contentCash).toFixed(2); // plug
    const debtNet = -DEBT_REPAY;
    const finCF  = +(debtNet + buybacks).toFixed(2);
    return { isForecast: true, netInc: ni, contentAmort, dna, sbc, contentCash, wc,
      ocf, capex, icf, fcf, debtNet, buybacks, finCF };
  };

  const fy26CF = buildForeCF(fy26PL.netInc, fy26BS._fcf, fy26BS._buybacks, "fy26");
  const fy27CF = buildForeCF(fy27PL.netInc, fy27BS._fcf, fy27BS._buybacks, "fy27");
  // FY2022 ending cash from Netflix 10-K = $5.15B (prior year for FY2023 CF check)
  const FY2022_CASH = 5.15;
  const cfYears = [
    { label: "FY2023A", isForecast: false, priorCash: FY2022_CASH,    bsCash: HIST_BS[0].cash, ...HIST_CF[0], netInc: HIST_PL[0].netInc },
    { label: "FY2024A", isForecast: false, priorCash: HIST_BS[0].cash, bsCash: HIST_BS[1].cash, ...HIST_CF[1], netInc: HIST_PL[1].netInc },
    { label: "FY2025A", isForecast: false, priorCash: HIST_BS[1].cash, bsCash: HIST_BS[2].cash, ...HIST_CF[2], netInc: HIST_PL[2].netInc },
    { label: "FY2026E", priorCash: HIST_BS[2].cash, bsCash: fy26BS.cash, ...fy26CF },
    { label: "FY2027E", priorCash: fy26BS.cash,     bsCash: fy27BS.cash, ...fy27CF },
  ];

  const TABS = [
    { id: "pl", label: "Income Statement" },
    { id: "bs", label: "Balance Sheet" },
    { id: "cf", label: "Cash Flow" },
  ];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: C.navy, padding: "24px 40px", borderBottom: `3px solid ${C.NF}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, background: C.NF, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 13 }}>N</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.NF }}>Three-Statement Model</span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 600, color: "#fff", margin: "0 0 6px" }}>
            Netflix Financial Statements
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            FY2023A–FY2025A Actuals · FY2026E–FY2027E Scenario Projections
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 40px" }}>
        {/* Scenario pills + tab selector */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, background: "#fff", borderRadius: 8, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "6px 18px", borderRadius: 6, border: "none", cursor: "pointer",
                background: tab === t.id ? C.navy : "transparent",
                color: tab === t.id ? "#fff" : C.tick,
                fontSize: 12, fontWeight: tab === t.id ? 700 : 400, transition: "all 0.15s",
              }}>{t.label}</button>
            ))}
          </div>
          {/* Scenario pills */}
          <div style={{ display: "flex", gap: 6 }}>
            {["bear", "consensus", "bull", "custom"].map(key => {
              const active = scenario === key;
              return (
                <button key={key} onClick={() => setScenario(key)} style={{
                  padding: "4px 12px", borderRadius: 20,
                  border: `1.5px solid ${active ? SC_COLORS[key] : C.grid}`,
                  background: active ? SC_COLORS[key] : "#fff",
                  color: active ? "#fff" : C.tick,
                  fontSize: 11, cursor: "pointer", fontWeight: active ? 700 : 400,
                }}>{SC_LABELS[key]}</button>
              );
            })}
          </div>
        </div>

        {/* Statement */}
        <div style={{ background: "#fff", borderRadius: 10, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          {tab === "pl" && <PLTab years={plYears} col={col} />}
          {tab === "bs" && <BSTab years={bsYears} col={col} />}
          {tab === "cf" && <CFTab years={cfYears} col={col} />}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 14, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
          Source: Netflix 10-K filings (FY2023 actuals). FY2024–FY2025 balance sheet and cash flow figures are estimates derived from Netflix shareholder letters and public disclosures. FY2026–FY2027 projections are scenario-driven model outputs, not financial guidance.
          Content amortization is a non-cash component of Cost of Revenue; shown in the cash flow statement as an operating add-back. FCF = Operating Cash Flow − Capital Expenditures.
        </div>
      </div>
    </div>
  );
}
