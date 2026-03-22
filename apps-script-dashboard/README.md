# Revenue Forecast Dashboard — Apps Script

A single-page interactive revenue forecast dashboard powered by Google Sheets data,
built with vanilla HTML/CSS/JavaScript and Chart.js. No React, no npm, no build step.

---

## Files

| File | Purpose |
|------|---------|
| `Code.gs` | Apps Script backend — serves the page and reads Sheet data |
| `index.html` | Complete front-end — all CSS, HTML, and JS in one file |

---

## Setup (5 minutes)

### Step 1 — Create a blank Google Sheet
Just create a new blank Sheet. No tabs to set up manually — the script does it.

### Step 2 — Open Apps Script
In your Google Sheet: **Extensions → Apps Script**

### Step 3 — Paste the files
1. Delete any existing code in `Code.gs` and paste the contents of `Code.gs`
2. Click **+ (New file) → HTML**, name it `index` (no extension), paste `index.html`

### Step 4 — Run the sheet setup
1. In the function dropdown (top toolbar), select **`setupSheet`**
2. Click **▶ Run**
3. Approve permissions when prompted
4. A popup confirms: *"Sheet setup complete!"*

This creates three formatted tabs (`Config`, `Scenarios`, `Historical`) pre-filled
with sample data. **Replace the sample values with your own data** in each tab.

### Step 5 — Deploy
1. Click **Deploy → New Deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone in [your organization]** (or Anyone, for testing)
5. Click **Deploy**, copy the URL

### Step 6 — Share
Send the URL to your team. They open it in a browser — no install required.

> **To update data later:** just edit the Sheet tabs and refresh the web app URL.
> No re-deployment needed unless you change `Code.gs` or `index.html`.

---

## Sheet Structure

### Tab: `Config`
Two columns. Column A = key (exact spelling), Column B = value.

| Key | Example Value | Description |
|-----|--------------|-------------|
| Dashboard Title | Revenue Forecast | Page title |
| Company | Acme Corp | Shows in header |
| Starting Revenue | 12.05 | Q4 actuals revenue |
| Starting Members | 332 | Q4 actuals members/units |
| Starting ARM | 12.23 | Q4 actuals avg revenue per member/unit |
| Starting Period | Q4 2025 | Label for actuals period |
| Currency Symbol | $ | Prepended to monetary values |
| Revenue Unit | B | Appended to revenue (B = billions, M = millions) |
| Member Unit | M | Appended to member counts |
| Driver 1 Label | Net Adds/Q | Name for your growth driver |
| Driver 2 Label | ARM Growth | Name for your pricing driver |
| Driver 3 Label | Churn Rate | Name for your retention driver |
| Driver 1 Min | 0.5 | Slider minimum for driver 1 |
| Driver 1 Max | 55 | Slider maximum for driver 1 |
| Driver 2 Min | 0 | Slider minimum for driver 2 |
| Driver 2 Max | 10 | Slider maximum for driver 2 |
| Driver 3 Min | 0.5 | Slider minimum for driver 3 |
| Driver 3 Max | 5 | Slider maximum for driver 3 |
| Driver 1 Sens Rows | 2,4,8,12,14 | Sensitivity table values for driver 1 |
| Driver 2 Sens Rows | 0,1.5,3,4.5,6 | Sensitivity table values for driver 2 |
| Driver 3 Sens Rows | 1.5,1.8,2.05,2.6,3 | Sensitivity table values for driver 3 |

---

### Tab: `Scenarios`
Row 1 = headers. Rows 2–4 = Bear, Consensus, Bull.

| name | d1Start | d1End | d2Start | d2End | d3Start | d3End |
|------|---------|-------|---------|-------|---------|-------|
| bear | 5 | 4 | 0.5 | 1.5 | 2.6 | 3.0 |
| consensus | 7 | 9 | 2.0 | 3.0 | 2.2 | 1.9 |
| bull | 10 | 13 | 3.5 | 5.0 | 2.1 | 1.5 |

- `d1` = Driver 1 (Net Adds / your growth driver)
- `d2` = Driver 2 (ARM Growth / your pricing driver, expressed as %/yr)
- `d3` = Driver 3 (Churn Rate / your retention driver, expressed as %/mo)
- `Start` = value at Q1 of forecast period
- `End` = value at Q4 of final forecast year (linear ramp between)
- `name` must be lowercase: `bear`, `consensus`, `bull`

---

### Tab: `Historical`
Row 1 = headers. One row per quarter, oldest first.

| period | members | arm | revenue | netAdds | churn |
|--------|---------|-----|---------|---------|-------|
| Q1'23 | 232.5 | 10.13 | 8.16 | 1.75 | 2.4 |
| Q2'23 | 238.4 | 10.37 | 8.19 | 5.89 | 2.4 |
| … | … | … | … | … | … |
| Q4'25 | 332.0 | 12.23 | 12.05 | 6.0 | 2.1 |

- `period`: Quarter label (string), e.g. `Q1'23`
- `members`: End-of-period paid members/units (M)
- `arm`: Average Revenue per Member/Unit per month ($)
- `revenue`: Quarterly revenue (B)
- `netAdds`: Net member/unit additions for the quarter (M)
- `churn`: Monthly churn rate (%)

The dashboard groups historical data into annual FY buckets automatically
(every 4 rows = 1 fiscal year). Make sure your historical data starts at Q1.

---

## How the model works

```
For each quarter Q1'26 → Q4'27:

  Driver 1 (Q)  = linear ramp from d1Start → d1End
  Driver 2 (Q)  = linear ramp from d2Start → d2End  [ARM growth %/yr]
  Driver 3 (Q)  = linear ramp from d3Start → d3End  [churn %/mo]

  Churn Losses  = d3(Q) / 100 × Begin Subs × 3
  Net Adds      = Driver 1 value  (Bear/Consensus/Bull)
  Gross Adds    = Net Adds + Churn Losses
  End Subs      = Begin Subs + Net Adds
  Avg Subs      = (Begin + End) / 2

  ARM(Q)        = ARM(Q-1) × (1 + d2(Q) / 400)   [quarterly compounding]
  Revenue       = Avg Subs × ARM(Q) × 3 / 1000    [quarterly, $B]

Custom scenario uses Gross Adds as the fixed input instead of Net Adds.
```

---

## Customising further

**Change accent color** — find `#1D4ED8` in `index.html` and replace with your brand color.

**Add a 4th scenario** — add a row to the Scenarios sheet and extend `SC_COLORS`/`SC_LABELS`
in the `<script>` block of `index.html`.

**Rename metrics** — update the `driver1Label` / `driver2Label` / `driver3Label` in Config.
The sensitivity row labels and bridge table columns update automatically.

**Adjust forecast horizon** — change the `QUARTERS` array in `index.html` to cover more years.
Update `getFY()` calls accordingly.

---

## Updating data

Edit the `Historical` or `Scenarios` Sheet tabs → refresh the web app URL.
No code changes needed. The `Config` tab controls all labels and ranges.
