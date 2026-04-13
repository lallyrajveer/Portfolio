/**
 * create-excel.js
 * Run once to seed data/netflix-data.xlsx from current hardcoded values.
 * After this, edit the Excel directly and run: npm run update-data
 */
const XLSX = require("xlsx");
const path = require("path");

// ── Quarterly historical data (from NetflixShared.js) ────────────────────────
const QUARTERLY = [
  { period: "Q1'23", rev: 8.16,  subs: 232.5, arm: 11.73, netAdds: 1.75,  churn: 2.40 },
  { period: "Q2'23", rev: 8.19,  subs: 238.4, arm: 11.60, netAdds: 5.90,  churn: 2.30 },
  { period: "Q3'23", rev: 8.54,  subs: 247.2, arm: 11.72, netAdds: 8.76,  churn: 2.20 },
  { period: "Q4'23", rev: 8.83,  subs: 260.3, arm: 11.60, netAdds: 13.12, churn: 1.90 },
  { period: "Q1'24", rev: 9.37,  subs: 269.6, arm: 11.79, netAdds: 9.33,  churn: 2.10 },
  { period: "Q2'24", rev: 9.56,  subs: 277.7, arm: 11.64, netAdds: 8.05,  churn: 2.00 },
  { period: "Q3'24", rev: 9.83,  subs: 282.7, arm: 11.68, netAdds: 5.07,  churn: 2.30 },
  { period: "Q4'24", rev: 10.25, subs: 301.6, arm: 11.69, netAdds: 19.00, churn: 1.80 },
  { period: "Q1'25", rev: 10.54, subs: 310.0, arm: 11.49, netAdds: 8.40,  churn: 2.00 },
  { period: "Q2'25", rev: 11.08, subs: 320.0, arm: 11.72, netAdds: 10.00, churn: 2.10 },
  { period: "Q3'25", rev: 11.51, subs: 325.0, arm: 11.90, netAdds: 5.00,  churn: 2.00 },
  { period: "Q4'25", rev: 12.05, subs: 332.0, arm: 12.23, netAdds: 7.00,  churn: 1.90 },
];

// ── Annual OpEx ratios (from NetflixOpEx.jsx HIST_YR) ────────────────────────
// Source: Netflix 10-K filings. All values are % of revenue (0–1 scale).
const ANNUAL = [
  { year: "FY2023", corPct: 0.5757, tndPct: 0.0801, mktgPct: 0.0801, gaPct: 0.0594, netMgnPct: 0.1602 },
  { year: "FY2024", corPct: 0.5103, tndPct: 0.0795, mktgPct: 0.0718, gaPct: 0.0718, netMgnPct: 0.2231 },
  { year: "FY2025", corPct: 0.5155, tndPct: 0.0752, mktgPct: 0.0642, gaPct: 0.0553, netMgnPct: 0.2323 },
];

const wb = XLSX.utils.book_new();

const wsQ = XLSX.utils.json_to_sheet(QUARTERLY);
XLSX.utils.book_append_sheet(wb, wsQ, "Quarterly");

const wsA = XLSX.utils.json_to_sheet(ANNUAL);
XLSX.utils.book_append_sheet(wb, wsA, "Annual");

const outPath = path.join(__dirname, "../data/netflix-data.xlsx");
XLSX.writeFile(wb, outPath);
console.log("✓ Created data/netflix-data.xlsx");
console.log("  Sheet 'Quarterly' — add new rows here when Netflix reports earnings");
console.log("  Sheet 'Annual'    — add a new row each FY with updated OpEx ratios");
console.log("\nTo regenerate the app data after editing: npm run update-data");
