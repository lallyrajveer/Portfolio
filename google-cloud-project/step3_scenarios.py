#!/usr/bin/env python3
"""
Step 3: Scenario Assumptions
=============================
Defines three forward-looking scenarios for Google Cloud (2025-2027)
anchored to the benchmarking findings from Step 2.

All metrics are expressed relative to Google Cloud segment revenue:
  - revenue_growth_rate:  YoY growth rate of Google Cloud segment revenue
  - capex_intensity:      Allocated cloud CapEx as % of cloud segment revenue
                          (Google Cloud allocated ~45-55% of total Alphabet CapEx in 2023-24)
  - operating_margin:     Google Cloud operating income / Google Cloud revenue

Anchoring to actuals:
  - Google Cloud 2024 revenue:          $43.2B
  - Google Cloud 2024 operating margin: ~17.5% (Q4 2024 was 17.5%)
  - Google Cloud implied CapEx 2024:    ~$23-28B (using ~45-55% of $52.5B total Alphabet CapEx)
  - Google Cloud revenue growth 2024:   +30.5% YoY

Scenario rationale:
  Bear — Google loses cloud market share. AI workloads consolidate on AWS/Azure due to enterprise
          incumbency, CUDA ecosystem lock-in, and superior sales motion. Revenue growth decelerates
          to 8-15%. CapEx stays high (Google continues infra investment) while revenue lags.
          Operating margin compresses to 5-10% as fixed costs grow faster than revenue.

  Base — Google holds market share and grows in line with AI-driven cloud demand (~20-28% YoY).
          TPU v5 and Gemini integrations attract net-new AI workloads. CapEx intensity moderates
          as prior investments scale. Operating margin reaches 15-22%, approaching AWS-level.

  Bull — Google closes the scale gap with AWS/Azure. TPU advantage accelerates enterprise AI
          adoption; Anthos and multi-cloud strategy wins large migrations. Revenue grows 32-42%
          (above market). Margin expands to 22-30% as cloud revenue leverages fixed infra spend.
"""

import json

BASE_YEAR        = 2024
BASE_CLOUD_REV   = 43.2   # $B — Google Cloud FY2024 actual
FORECAST_YEARS   = [2025, 2026, 2027]

scenarios = {
    "bear": {
        "label":              "Bear",
        "description":        (
            "Google loses cloud share to AWS/Azure. CUDA lock-in and enterprise incumbency "
            "slow AI workload wins. Revenue growth decelerates to 8-15%; CapEx stays elevated "
            "as infra commitments outpace revenue. Margin compresses to 5-10%."
        ),
        "key_risks":          [
            "CUDA/NVIDIA ecosystem lock-in prevents TPU-scale adoption",
            "Enterprise sales motion remains underdeveloped vs. AWS/Azure",
            "Regulatory scrutiny delays large public-sector cloud migrations",
        ],
        "revenue_growth_rate": [0.08, 0.15],    # [low, high] per year
        "capex_intensity":     [0.50, 0.65],    # cloud CapEx / cloud revenue
        "operating_margin":    [0.05, 0.10],    # cloud op income / cloud revenue
    },
    "base": {
        "label":              "Base",
        "description":        (
            "Google holds market share and grows in line with AI-driven cloud demand. "
            "TPU v5 and Gemini attract net-new AI workloads. CapEx intensity moderates "
            "as infrastructure scales. Margin reaches 15-22%."
        ),
        "key_drivers":        [
            "AI-native workloads (Gemini API, Vertex AI) drive net-new enterprise sign-ups",
            "TPU v5 delivers 2x training throughput vs. prior gen, improving unit economics",
            "UCAN and EMEA cloud expansion tracks consensus analyst estimates",
        ],
        "revenue_growth_rate": [0.20, 0.28],
        "capex_intensity":     [0.38, 0.52],
        "operating_margin":    [0.15, 0.22],
    },
    "bull": {
        "label":              "Bull",
        "description":        (
            "Google closes the scale gap with AWS/Azure. TPU advantage accelerates enterprise "
            "AI adoption; Anthos multi-cloud wins large migrations. Revenue grows 32-42% above "
            "market. Margin expands to 22-30% as cloud revenue leverages fixed infra."
        ),
        "key_drivers":        [
            "TPU v5/v6 becomes the dominant AI training chip for frontier model labs",
            "Google Workspace + Cloud bundle drives mass enterprise migration from Azure",
            "Gemini Ultra integration creates switching costs and recurring AI workload revenue",
        ],
        "revenue_growth_rate": [0.32, 0.42],
        "capex_intensity":     [0.28, 0.42],
        "operating_margin":    [0.22, 0.30],
    },
    "_meta": {
        "base_year":              BASE_YEAR,
        "base_cloud_revenue_bn":  BASE_CLOUD_REV,
        "forecast_years":         FORECAST_YEARS,
        "capex_note":             (
            "capex_intensity = allocated Google Cloud CapEx / Google Cloud revenue. "
            "Alphabet does not disclose segment-level CapEx; allocation uses 45-55% of total "
            "Alphabet CapEx as the Google Cloud share (consistent with disclosed infra priorities)."
        ),
        "data_source":            "Alphabet 10-K FY2024; scenario ranges informed by Wells Fargo, "
                                  "Goldman Sachs, and JPMorgan cloud research (Jan-Mar 2025).",
    },
}

# ── Print summary table ───────────────────────────────────────────────────────
print("=" * 65)
print("GOOGLE CLOUD SCENARIO ASSUMPTIONS (2025-2027)")
print("=" * 65)
print(f"{'Metric':<30} {'Bear':>12} {'Base':>12} {'Bull':>12}")
print("-" * 65)
for key, label in [
    ("revenue_growth_rate", "Revenue Growth / yr"),
    ("capex_intensity",     "CapEx Intensity"),
    ("operating_margin",    "Operating Margin"),
]:
    for sc in ["bear", "base", "bull"]:
        lo, hi = scenarios[sc][key]
    row = f"{label:<30}"
    for sc in ["bear", "base", "bull"]:
        lo, hi = scenarios[sc][key]
        row += f" {lo*100:.0f}-{hi*100:.0f}%".rjust(12)
    print(row)
print()

# ── Save ──────────────────────────────────────────────────────────────────────
with open("scenario_assumptions.json", "w") as f:
    json.dump(scenarios, f, indent=2)
print("Saved: scenario_assumptions.json")
