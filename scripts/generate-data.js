/**
 * generate-data.js
 * Reads data/netflix-data.xlsx and writes src/projects/NetflixData.js
 * Run after editing the Excel: npm run update-data
 */
const XLSX = require("xlsx");
const fs   = require("fs");
const path = require("path");

const xlsxPath = path.join(__dirname, "../data/netflix-data.xlsx");
if (!fs.existsSync(xlsxPath)) {
  console.error("✗ data/netflix-data.xlsx not found. Run: npm run create-excel");
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);

// ── Quarterly sheet → HISTORICAL ─────────────────────────────────────────────
const quarterly = XLSX.utils.sheet_to_json(wb.Sheets["Quarterly"]);
if (!quarterly.length) { console.error("✗ 'Quarterly' sheet is empty"); process.exit(1); }

const HISTORICAL = quarterly.map(r => ({
  period:   String(r.period),
  rev:      +Number(r.rev).toFixed(2),
  subs:     +Number(r.subs).toFixed(1),
  arm:      +Number(r.arm).toFixed(2),
  netAdds:  +Number(r.netAdds).toFixed(2),
  churn:    +Number(r.churn).toFixed(2),
}));

// Derive START from last quarter
const last  = HISTORICAL[HISTORICAL.length - 1];
const START = { subs: last.subs, arm: last.arm, rev: last.rev };

// ── Annual sheet → HIST_YR ───────────────────────────────────────────────────
const annual = XLSX.utils.sheet_to_json(wb.Sheets["Annual"]);
if (!annual.length) { console.error("✗ 'Annual' sheet is empty"); process.exit(1); }

// Strip the 'year' label column — HIST_YR is a positional array (index 0 = first FY)
const HIST_YR = annual.map(r => ({
  corPct:    +Number(r.corPct).toFixed(4),
  tndPct:    +Number(r.tndPct).toFixed(4),
  mktgPct:   +Number(r.mktgPct).toFixed(4),
  gaPct:     +Number(r.gaPct).toFixed(4),
  netMgnPct: +Number(r.netMgnPct).toFixed(4),
}));

// ── Write output ─────────────────────────────────────────────────────────────
const histStr  = JSON.stringify(HISTORICAL, null, 2)
  .replace(/"(\w+)":/g, "$1:"); // unquote keys for cleaner JS style

const startStr = JSON.stringify(START);

const histYrStr = JSON.stringify(HIST_YR, null, 2)
  .replace(/"(\w+)":/g, "$1:");

const output = `// AUTO-GENERATED — do not edit manually.
// Source: data/netflix-data.xlsx
// To update: edit the Excel file, then run: npm run update-data

export const HISTORICAL = ${histStr};

// Derived from the last row of the Quarterly sheet
export const START = ${startStr};

// Annual OpEx ratios (% of revenue, 0–1 scale) — one entry per fiscal year
export const HIST_YR = ${histYrStr};
`;

const outPath = path.join(__dirname, "../src/projects/NetflixData.js");
fs.writeFileSync(outPath, output, "utf8");

console.log(`✓ src/projects/NetflixData.js updated`);
console.log(`  ${HISTORICAL.length} quarters loaded (${HISTORICAL[0].period} → ${last.period})`);
console.log(`  ${HIST_YR.length} fiscal years loaded`);
console.log(`  START: subs=${START.subs}M  ARM=$${START.arm}  rev=$${START.rev}B`);
