// ═══════════════════════════════════════════════════════════════
//  Code.gs  —  Revenue Forecast Web App
//
//  FIRST-TIME SETUP (do this once):
//  1. Create a blank Google Sheet
//  2. Open Extensions → Apps Script
//  3. Paste this file as Code.gs
//  4. Paste index.html as a new HTML file named "index"
//  5. In the function dropdown, select "setupSheet" → click Run
//     This creates Config, Scenarios, and Historical tabs with
//     sample data. Replace the sample data with your own.
//  6. Deploy → New Deployment → Web App
//     Execute as: Me  |  Who has access: Anyone in [your org]
//  7. Copy the web app URL and share internally
//
//  TO UPDATE DATA: just edit the Sheet tabs and refresh the URL.
//  No re-deployment needed.
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  setupSheet()  —  Run once to build all Sheet tabs
//  Select this function in the dropdown and click ▶ Run
// ═══════════════════════════════════════════════════════════════
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── helpers ─────────────────────────────────────────────────
  function getOrCreate(name) {
    return ss.getSheetByName(name) || ss.insertSheet(name);
  }
  function headerStyle(range, bgColor) {
    range.setBackground(bgColor)
         .setFontColor('#ffffff')
         .setFontWeight('bold')
         .setFontSize(10);
  }
  function labelStyle(range) {
    range.setBackground('#F4F5F8')
         .setFontWeight('bold')
         .setFontSize(10);
  }
  function freeze(sheet, rows, cols) {
    sheet.setFrozenRows(rows);
    if (cols) sheet.setFrozenColumns(cols);
  }

  // ════════════════════════════════════════════════════════════
  //  TAB 1: Config
  // ════════════════════════════════════════════════════════════
  const cfg = getOrCreate('Config');
  cfg.clearContents().clearFormats();

  const configData = [
    ['Key',                  'Value',       'Description'],
    ['Dashboard Title',      'Revenue Forecast', 'Shown in the page header'],
    ['Company',              'My Company',  'Shown as eyebrow text in header'],
    ['Starting Revenue',     12.05,         'Q4 actuals quarterly revenue ($B)'],
    ['Starting Members',     332,           'Q4 actuals end-period members (M)'],
    ['Starting ARM',         12.23,         'Q4 actuals avg revenue per member/mo ($)'],
    ['Starting Period',      'Q4 2025',     'Label for the actuals starting point'],
    ['Currency Symbol',      '$',           'Prepended to all monetary values'],
    ['Revenue Unit',         'B',           'Appended to revenue — B=billions, M=millions'],
    ['Member Unit',          'M',           'Appended to member counts'],
    ['',                     '',            ''],
    ['Driver 1 Label',       'Net Adds/Q',  'Your growth driver — rename to match your business'],
    ['Driver 2 Label',       'ARM Growth',  'Your pricing/yield driver'],
    ['Driver 3 Label',       'Churn Rate',  'Your retention driver'],
    ['',                     '',            ''],
    ['Driver 1 Min',         0.5,           'Slider minimum for custom scenario'],
    ['Driver 1 Max',         55,            'Slider maximum for custom scenario'],
    ['Driver 2 Min',         0,             'Slider minimum'],
    ['Driver 2 Max',         10,            'Slider maximum'],
    ['Driver 3 Min',         0.5,           'Slider minimum'],
    ['Driver 3 Max',         5,             'Slider maximum'],
    ['',                     '',            ''],
    ['Driver 1 Sens Rows',   '2,4,8,12,14', 'Comma-separated values for sensitivity table rows'],
    ['Driver 2 Sens Rows',   '0,1.5,3,4.5,6', 'Middle value should equal (d2Start+d2End)/2 of Consensus'],
    ['Driver 3 Sens Rows',   '1.5,1.8,2.05,2.6,3', 'Middle value should equal (d3Start+d3End)/2 of Consensus'],
  ];

  cfg.getRange(1, 1, configData.length, 3).setValues(configData);
  headerStyle(cfg.getRange(1, 1, 1, 3), '#0B1628');
  cfg.setColumnWidth(1, 200);
  cfg.setColumnWidth(2, 160);
  cfg.setColumnWidth(3, 340);
  freeze(cfg, 1);

  // Style Key column
  cfg.getRange(2, 1, configData.length - 1, 1)
     .setBackground('#F8F9FA')
     .setFontWeight('bold')
     .setFontSize(10);

  // ════════════════════════════════════════════════════════════
  //  TAB 2: Scenarios
  // ════════════════════════════════════════════════════════════
  const scen = getOrCreate('Scenarios');
  scen.clearContents().clearFormats();

  const scenHeaders = ['name', 'd1Start', 'd1End', 'd2Start', 'd2End', 'd3Start', 'd3End'];
  const scenNotes   = ['bear/consensus/bull', 'Driver 1 Q1 val', 'Driver 1 Q4 val', 'Driver 2 Q1 %/yr', 'Driver 2 Q4 %/yr', 'Driver 3 Q1 %/mo', 'Driver 3 Q4 %/mo'];
  const scenColors  = { bear: '#DC2626', consensus: '#1D4ED8', bull: '#16A34A' };
  const scenData = [
    ['bear',      5,   4,   0.5, 1.5, 2.6, 3.0],
    ['consensus', 7,   9,   2.0, 3.0, 2.2, 1.9],
    ['bull',      10,  13,  3.5, 5.0, 2.1, 1.5],
  ];

  scen.getRange(1, 1, 1, scenHeaders.length).setValues([scenHeaders]);
  scen.getRange(2, 1, 1, scenHeaders.length).setValues([scenNotes]);
  scen.getRange(3, 1, scenData.length, scenHeaders.length).setValues(scenData);

  // Header row
  headerStyle(scen.getRange(1, 1, 1, scenHeaders.length), '#0B1628');
  // Notes row
  scen.getRange(2, 1, 1, scenHeaders.length)
      .setBackground('#F4F5F8').setFontColor('#9CA3AF').setFontStyle('italic').setFontSize(9);
  // Scenario rows — color the name cell
  scenData.forEach((row, i) => {
    const color = scenColors[row[0]] || '#374151';
    scen.getRange(3 + i, 1).setBackground(color).setFontColor('#ffffff').setFontWeight('bold');
    scen.getRange(3 + i, 2, 1, 6).setBackground('#F9FAFB').setFontSize(10);
  });

  for (let c = 1; c <= scenHeaders.length; c++) scen.setColumnWidth(c, c === 1 ? 120 : 100);
  freeze(scen, 1);

  // ════════════════════════════════════════════════════════════
  //  TAB 3: Historical
  // ════════════════════════════════════════════════════════════
  const hist = getOrCreate('Historical');
  hist.clearContents().clearFormats();

  const histHeaders = ['period', 'members', 'arm', 'revenue', 'netAdds', 'churn'];
  const histNotes   = ['Quarter label', 'End-period members (M)', 'Avg rev/member/mo ($)', 'Quarterly revenue ($B)', 'Net member adds (M)', 'Monthly churn rate (%)'];
  const histData = [
    ["Q1'23", 232.5, 10.13, 8.16,  1.75,  2.4],
    ["Q2'23", 238.4, 10.37, 8.19,  5.89,  2.4],
    ["Q3'23", 247.2, 10.55, 8.54,  8.76,  2.3],
    ["Q4'23", 260.3, 11.18, 8.83,  13.12, 2.2],
    ["Q1'24", 269.6, 11.10, 9.37,  9.33,  2.1],
    ["Q2'24", 277.7, 11.01, 9.56,  8.05,  2.1],
    ["Q3'24", 282.7, 11.18, 9.83,  5.07,  2.1],
    ["Q4'24", 301.6, 11.79, 10.25, 18.91, 2.0],
    ["Q1'25", 313.6, 11.93, 10.54, 11.99, 2.1],
    ["Q2'25", 320.0, 12.00, 11.03, 6.4,   2.1],
    ["Q3'25", 326.0, 12.12, 11.63, 6.0,   2.1],
    ["Q4'25", 332.0, 12.23, 12.05, 6.0,   2.1],
  ];

  hist.getRange(1, 1, 1, histHeaders.length).setValues([histHeaders]);
  hist.getRange(2, 1, 1, histHeaders.length).setValues([histNotes]);
  hist.getRange(3, 1, histData.length, histHeaders.length).setValues(histData);

  // Header row
  headerStyle(hist.getRange(1, 1, 1, histHeaders.length), '#0B1628');
  // Notes row
  hist.getRange(2, 1, 1, histHeaders.length)
      .setBackground('#F4F5F8').setFontColor('#9CA3AF').setFontStyle('italic').setFontSize(9);
  // Alternate row shading
  histData.forEach((_, i) => {
    const bg = i % 2 === 0 ? '#ffffff' : '#F9FAFB';
    hist.getRange(3 + i, 1, 1, histHeaders.length).setBackground(bg).setFontSize(10);
    // Shade Q4 rows (last quarter of each year) slightly darker
    if ((i + 1) % 4 === 0) {
      hist.getRange(3 + i, 1, 1, histHeaders.length).setBackground('#EFF6FF');
    }
  });
  // Column widths
  const histWidths = [80, 100, 80, 100, 90, 90];
  histWidths.forEach((w, i) => hist.setColumnWidth(i + 1, w));
  freeze(hist, 2, 1);

  // Number formats
  hist.getRange(3, 2, histData.length, 1).setNumberFormat('0.0');   // members
  hist.getRange(3, 3, histData.length, 1).setNumberFormat('$0.00'); // arm
  hist.getRange(3, 4, histData.length, 1).setNumberFormat('$0.00'); // revenue
  hist.getRange(3, 5, histData.length, 1).setNumberFormat('0.00');  // netAdds
  hist.getRange(3, 6, histData.length, 1).setNumberFormat('0.00');  // churn

  // ── Done ────────────────────────────────────────────────────
  // Move tabs to front and reorder
  ss.setActiveSheet(cfg);
  SpreadsheetApp.getUi().alert(
    '✅ Sheet setup complete!\n\n' +
    'Three tabs created: Config, Scenarios, Historical.\n\n' +
    'Replace the sample data with your own, then deploy the web app\n' +
    'via Deploy → New Deployment → Web App.'
  );
}

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('Revenue Forecast Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── Called from the browser via google.script.run.getData() ───
function getData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    return {
      config:     readConfig(ss),
      scenarios:  readScenarios(ss),
      historical: readHistorical(ss),
    };
  } catch (e) {
    // No Sheet connected — return built-in sample data so the
    // dashboard still loads and can be previewed standalone.
    Logger.log('getData fallback to sample data: ' + e.message);
    return getSampleData();
  }
}

// ── Config tab ─────────────────────────────────────────────────
// Expected layout: Column A = key, Column B = value
// See README for full list of supported keys.
function readConfig(ss) {
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return getSampleData().config;

  const rows = sheet.getDataRange().getValues();
  const cfg  = {};
  rows.forEach(r => { if (r[0]) cfg[String(r[0]).trim()] = r[1]; });

  return {
    title:          cfg['Dashboard Title']   || 'Revenue Forecast',
    company:        cfg['Company']           || '',
    startRevenue:   +cfg['Starting Revenue'] || 12.05,
    startMembers:   +cfg['Starting Members'] || 332,
    startARM:       +cfg['Starting ARM']     || 12.23,
    startPeriod:    cfg['Starting Period']   || 'Q4 2025',
    currencySymbol: cfg['Currency Symbol']   || '$',
    revenueUnit:    cfg['Revenue Unit']      || 'B',
    memberUnit:     cfg['Member Unit']       || 'M',
    // Driver labels — rename to match your business
    driver1Label:   cfg['Driver 1 Label']    || 'Net Adds/Q',
    driver2Label:   cfg['Driver 2 Label']    || 'ARM Growth',
    driver3Label:   cfg['Driver 3 Label']    || 'Churn Rate',
    // Slider ranges — adjust to your data scale
    d1Min: +cfg['Driver 1 Min'] || 0.5,
    d1Max: +cfg['Driver 1 Max'] || 55,
    d2Min: +cfg['Driver 2 Min'] || 0,
    d2Max: +cfg['Driver 2 Max'] || 10,
    d3Min: +cfg['Driver 3 Min'] || 0.5,
    d3Max: +cfg['Driver 3 Max'] || 5,
    // Sensitivity rows (comma-separated values for each driver)
    d1SensRows: cfg['Driver 1 Sens Rows'] || '2,4,8,12,14',
    d2SensRows: cfg['Driver 2 Sens Rows'] || '0,1.5,3,4.5,6',
    d3SensRows: cfg['Driver 3 Sens Rows'] || '1.5,1.8,2.05,2.6,3',
  };
}

// ── Scenarios tab ──────────────────────────────────────────────
// Expected columns (row 1 = headers, rows 2+ = data):
//   name | d1Start | d1End | d2Start | d2End | d3Start | d3End
// name must be: bear, consensus, or bull (lowercase)
function readScenarios(ss) {
  const sheet = ss.getSheetByName('Scenarios');
  if (!sheet) return getSampleData().scenarios;

  const rows      = sheet.getDataRange().getValues();
  const scenarios = {};
  rows.slice(1).forEach(r => {
    if (!r[0]) return;
    const key = String(r[0]).toLowerCase().trim();
    scenarios[key] = {
      d1Start: +r[1], d1End: +r[2],
      d2Start: +r[3], d2End: +r[4],
      d3Start: +r[5], d3End: +r[6],
    };
  });

  // Fill any missing scenarios with sample defaults
  const sample = getSampleData().scenarios;
  ['bear','consensus','bull'].forEach(k => {
    if (!scenarios[k]) scenarios[k] = sample[k];
  });
  return scenarios;
}

// ── Historical tab ─────────────────────────────────────────────
// Expected columns (row 1 = headers, rows 2+ = data):
//   period | members | arm | revenue | netAdds | churn
// period:  label string e.g. "Q1'23"
// members: end-period members (M)
// arm:     average revenue per member per month ($)
// revenue: quarterly revenue (B)
// netAdds: net member additions for the quarter (M)
// churn:   monthly churn rate (%)
function readHistorical(ss) {
  const sheet = ss.getSheetByName('Historical');
  if (!sheet) return getSampleData().historical;

  const rows = sheet.getDataRange().getValues();
  return rows.slice(1)
    .filter(r => r[0])
    .map(r => ({
      period:  String(r[0]).trim(),
      subs:    +r[1],
      arm:     +r[2],
      rev:     +r[3],
      netAdds: +r[4],
      churn:   +r[5],
    }));
}

// ── Sample / fallback data ─────────────────────────────────────
function getSampleData() {
  return {
    config: {
      title: 'Revenue Forecast', company: 'Sample Co.',
      startRevenue: 12.05, startMembers: 332, startARM: 12.23,
      startPeriod: 'Q4 2025',
      currencySymbol: '$', revenueUnit: 'B', memberUnit: 'M',
      driver1Label: 'Net Adds/Q',
      driver2Label: 'ARM Growth',
      driver3Label: 'Churn Rate',
      d1Min: 0.5, d1Max: 55,
      d2Min: 0,   d2Max: 10,
      d3Min: 0.5, d3Max: 5,
      d1SensRows: '2,4,8,12,14',
      d2SensRows: '0,1.5,3,4.5,6',
      d3SensRows: '1.5,1.8,2.05,2.6,3',
    },
    scenarios: {
      bear:      { d1Start: 5,  d1End: 4,  d2Start: 0.5, d2End: 1.5, d3Start: 2.6, d3End: 3.0 },
      consensus: { d1Start: 7,  d1End: 9,  d2Start: 2.0, d2End: 3.0, d3Start: 2.2, d3End: 1.9 },
      bull:      { d1Start: 10, d1End: 13, d2Start: 3.5, d2End: 5.0, d3Start: 2.1, d3End: 1.5 },
    },
    historical: [
      { period: "Q1'23", subs: 232.5, arm: 10.13, rev: 8.16,  netAdds: 1.75,  churn: 2.4 },
      { period: "Q2'23", subs: 238.4, arm: 10.37, rev: 8.19,  netAdds: 5.89,  churn: 2.4 },
      { period: "Q3'23", subs: 247.2, arm: 10.55, rev: 8.54,  netAdds: 8.76,  churn: 2.3 },
      { period: "Q4'23", subs: 260.3, arm: 11.18, rev: 8.83,  netAdds: 13.12, churn: 2.2 },
      { period: "Q1'24", subs: 269.6, arm: 11.10, rev: 9.37,  netAdds: 9.33,  churn: 2.1 },
      { period: "Q2'24", subs: 277.7, arm: 11.01, rev: 9.56,  netAdds: 8.05,  churn: 2.1 },
      { period: "Q3'24", subs: 282.7, arm: 11.18, rev: 9.83,  netAdds: 5.07,  churn: 2.1 },
      { period: "Q4'24", subs: 301.6, arm: 11.79, rev: 10.25, netAdds: 18.91, churn: 2.0 },
      { period: "Q1'25", subs: 313.6, arm: 11.93, rev: 10.54, netAdds: 11.99, churn: 2.1 },
      { period: "Q2'25", subs: 320.0, arm: 12.00, rev: 11.03, netAdds: 6.4,   churn: 2.1 },
      { period: "Q3'25", subs: 326.0, arm: 12.12, rev: 11.63, netAdds: 6.0,   churn: 2.1 },
      { period: "Q4'25", subs: 332.0, arm: 12.23, rev: 12.05, netAdds: 6.0,   churn: 2.1 },
    ],
  };
}
