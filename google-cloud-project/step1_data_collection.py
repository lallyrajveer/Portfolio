#!/usr/bin/env python3
"""
Step 1: Data Collection
=======================
Constructs a structured dataset of cloud peer financials (2020-2024)
from publicly available SEC 10-K filings.

Sources:
  Alphabet  — 10-K filings, Exhibit 99 (Google Cloud segment)
  Amazon    — 10-K filings, AWS segment; CapEx = purchases of PP&E (cash flow)
  Microsoft — 10-K filings, Intelligent Cloud segment (FY ending June, labeled by year of end month)

Notes on cloud_revenue_bn proxy:
  Alphabet  → Google Cloud segment (direct disclosure, reported from 2020)
  Amazon    → AWS segment (direct disclosure)
  Microsoft → Intelligent Cloud segment (Azure + Server Products + Enterprise Services)
               Azure-only is ~60-65% of Intelligent Cloud; MSFT does not break out Azure standalone.
"""

import pandas as pd

# ── Raw data from 10-K filings ────────────────────────────────────────────────
data = [
    # ── Alphabet (Google) ── Calendar year Jan-Dec
    # CapEx = purchases of property and equipment (cash flow statement)
    # Operating income = total Alphabet (includes Search, YouTube, Cloud, Other Bets)
    {"company": "Alphabet",  "year": 2020, "total_capex_bn": 22.3,  "cloud_revenue_bn": 13.1,  "operating_income_bn":  41.2, "total_revenue_bn": 182.5},
    {"company": "Alphabet",  "year": 2021, "total_capex_bn": 24.6,  "cloud_revenue_bn": 19.2,  "operating_income_bn":  78.7, "total_revenue_bn": 257.6},
    {"company": "Alphabet",  "year": 2022, "total_capex_bn": 31.5,  "cloud_revenue_bn": 26.3,  "operating_income_bn":  74.8, "total_revenue_bn": 282.8},
    {"company": "Alphabet",  "year": 2023, "total_capex_bn": 32.3,  "cloud_revenue_bn": 33.1,  "operating_income_bn":  84.3, "total_revenue_bn": 307.4},
    {"company": "Alphabet",  "year": 2024, "total_capex_bn": 52.5,  "cloud_revenue_bn": 43.2,  "operating_income_bn": 112.0, "total_revenue_bn": 350.0},

    # ── Amazon (AWS) ── Calendar year Jan-Dec
    # CapEx = purchases of property and equipment (excludes finance lease obligations)
    # Operating income = total Amazon (AWS + North America + International)
    {"company": "Amazon",    "year": 2020, "total_capex_bn": 40.1,  "cloud_revenue_bn": 45.4,  "operating_income_bn":  22.9, "total_revenue_bn": 386.1},
    {"company": "Amazon",    "year": 2021, "total_capex_bn": 61.1,  "cloud_revenue_bn": 62.2,  "operating_income_bn":  24.9, "total_revenue_bn": 469.8},
    {"company": "Amazon",    "year": 2022, "total_capex_bn": 63.6,  "cloud_revenue_bn": 80.1,  "operating_income_bn":  12.2, "total_revenue_bn": 514.0},
    {"company": "Amazon",    "year": 2023, "total_capex_bn": 52.7,  "cloud_revenue_bn": 90.8,  "operating_income_bn":  36.9, "total_revenue_bn": 574.8},
    {"company": "Amazon",    "year": 2024, "total_capex_bn": 77.4,  "cloud_revenue_bn": 107.6, "operating_income_bn":  68.6, "total_revenue_bn": 638.0},

    # ── Microsoft (Azure / Intelligent Cloud) ── Fiscal year ending June
    # Labeled by calendar year of fiscal year end (e.g., FY2024 = Jul 2023 – Jun 2024)
    # CapEx = additions to property, plant & equipment (cash flow statement)
    # Operating income = total Microsoft
    {"company": "Microsoft", "year": 2020, "total_capex_bn": 15.4,  "cloud_revenue_bn": 44.0,  "operating_income_bn":  52.9, "total_revenue_bn": 143.0},
    {"company": "Microsoft", "year": 2021, "total_capex_bn": 20.6,  "cloud_revenue_bn": 60.1,  "operating_income_bn":  69.9, "total_revenue_bn": 168.1},
    {"company": "Microsoft", "year": 2022, "total_capex_bn": 23.8,  "cloud_revenue_bn": 75.3,  "operating_income_bn":  83.4, "total_revenue_bn": 198.3},
    {"company": "Microsoft", "year": 2023, "total_capex_bn": 28.1,  "cloud_revenue_bn": 87.9,  "operating_income_bn":  88.5, "total_revenue_bn": 211.9},
    {"company": "Microsoft", "year": 2024, "total_capex_bn": 55.7,  "cloud_revenue_bn": 105.4, "operating_income_bn": 109.4, "total_revenue_bn": 245.1},
]

df = pd.DataFrame(data)

# ── Validation ────────────────────────────────────────────────────────────────
print("=" * 60)
print("CLOUD PEERS DATASET — VALIDATION SUMMARY")
print("=" * 60)
print(f"Rows: {len(df)} | Companies: {list(df['company'].unique())} | Years: {df['year'].min()}–{df['year'].max()}\n")

summary = df.groupby("company").agg(
    capex_total=("total_capex_bn", "sum"),
    cloud_rev_2020=("cloud_revenue_bn", "first"),
    cloud_rev_2024=("cloud_revenue_bn", "last"),
    total_rev_2024=("total_revenue_bn", "last"),
).round(1)
summary["cloud_rev_growth"] = (summary["cloud_rev_2024"] / summary["cloud_rev_2020"]).round(2)
print(summary.to_string())
print()

# ── Save ──────────────────────────────────────────────────────────────────────
df.to_csv("cloud_peers_data.csv", index=False)
print("Saved: cloud_peers_data.csv")
