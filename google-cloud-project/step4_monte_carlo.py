#!/usr/bin/env python3
"""
Step 4: Monte Carlo Simulation
================================
Loads scenario_assumptions.json and runs 1,000 iterations per scenario.
Each iteration independently samples revenue growth, CapEx intensity, and
operating margin for each of 2025, 2026, and 2027.

Methodology:
  - All three drivers are sampled from Uniform[low, high] each year independently.
  - Revenue compounds year-over-year from the 2024 base ($43.2B).
  - Operating income  = cloud revenue × sampled operating margin
  - Implied cloud CapEx = cloud revenue × sampled capex intensity

Outputs:
  - monte_carlo_results.csv    — all 1,000 × 3 scenarios × 3 years of iterations
  - simulation_chart.png       — histogram of 2027 cloud revenue per scenario
  - Summary table printed to console: P10 / P50 / P90 per scenario
"""

import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

# ── Config ────────────────────────────────────────────────────────────────────
N_ITER         = 1_000
FORECAST_YEARS = [2025, 2026, 2027]
BASE_REV       = 43.2   # Google Cloud FY2024 actual ($B)
np.random.seed(42)      # reproducibility

# ── Load assumptions ──────────────────────────────────────────────────────────
with open("scenario_assumptions.json") as f:
    assumptions = json.load(f)

SCENARIO_KEYS = ["bear", "base", "bull"]
SC_COLORS     = {"bear": "#EA4335", "base": "#4285F4", "bull": "#34A853"}
SC_LABELS     = {"bear": "Bear",    "base": "Base",    "bull": "Bull"}

# ── Run simulations ───────────────────────────────────────────────────────────
all_results = []

for sc_key in SCENARIO_KEYS:
    sc = assumptions[sc_key]
    growth_lo,  growth_hi  = sc["revenue_growth_rate"]
    capex_lo,   capex_hi   = sc["capex_intensity"]
    margin_lo,  margin_hi  = sc["operating_margin"]

    for iteration in range(N_ITER):
        rev = BASE_REV
        for year in FORECAST_YEARS:
            # Independent draw per year per driver
            g = np.random.uniform(growth_lo,  growth_hi)
            c = np.random.uniform(capex_lo,   capex_hi)
            m = np.random.uniform(margin_lo,  margin_hi)

            rev          = rev * (1 + g)
            op_income    = rev * m
            implied_capex = rev * c

            all_results.append({
                "scenario":        sc_key,
                "iteration":       iteration,
                "year":            year,
                "cloud_revenue_bn": round(rev,         2),
                "operating_income_bn": round(op_income, 2),
                "implied_capex_bn":    round(implied_capex, 2),
                "growth_rate":         round(g,  4),
                "capex_intensity":     round(c,  4),
                "operating_margin":    round(m,  4),
            })

results_df = pd.DataFrame(all_results)

# ── P10 / P50 / P90 Summary ───────────────────────────────────────────────────
print("=" * 75)
print("MONTE CARLO SUMMARY — P10 / P50 / P90  (1,000 iterations per scenario)")
print("=" * 75)

summary_rows = []
for sc_key in SCENARIO_KEYS:
    for year in FORECAST_YEARS:
        sub = results_df[(results_df["scenario"] == sc_key) & (results_df["year"] == year)]
        for metric, col in [
            ("Cloud Revenue ($B)",    "cloud_revenue_bn"),
            ("Operating Income ($B)", "operating_income_bn"),
            ("Implied CapEx ($B)",    "implied_capex_bn"),
            ("Op Margin (%)",         "operating_margin"),
        ]:
            p10 = sub[col].quantile(0.10)
            p50 = sub[col].quantile(0.50)
            p90 = sub[col].quantile(0.90)
            fmt = "{:.1%}" if "Margin" in metric else "${:.1f}B"
            summary_rows.append({
                "Scenario": SC_LABELS[sc_key],
                "Year":     year,
                "Metric":   metric,
                "P10":      p10,
                "P50":      p50,
                "P90":      p90,
            })

summary_df = pd.DataFrame(summary_rows)

# Print 2027 summary
print(f"\n{'':>2} 2027 Projections:")
print(f"{'Scenario':<12} {'Metric':<25} {'P10':>10} {'P50':>10} {'P90':>10}")
print("-" * 70)
for sc_key in SCENARIO_KEYS:
    sub2027 = summary_df[(summary_df["Scenario"] == SC_LABELS[sc_key]) & (summary_df["Year"] == 2027)]
    for _, row in sub2027.iterrows():
        is_margin = "Margin" in row["Metric"]
        fmt = lambda v: f"{v:.1%}" if is_margin else f"${v:.1f}B"
        print(f"  {SC_LABELS[sc_key]:<10} {row['Metric']:<25} "
              f"{fmt(row['P10']):>10} {fmt(row['P50']):>10} {fmt(row['P90']):>10}")
    print()

# ── Histogram chart ───────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(16, 5), sharey=False)
fig.patch.set_facecolor("#F8F9FA")
fig.suptitle("Google Cloud 2027E Revenue Distribution — Monte Carlo (1,000 iterations per scenario)",
             fontsize=13, fontweight="bold", color="#0B1628", y=1.02)

for ax, sc_key in zip(axes, SCENARIO_KEYS):
    rev_2027 = results_df[(results_df["scenario"] == sc_key) & (results_df["year"] == 2027)]["cloud_revenue_bn"]
    p10 = rev_2027.quantile(0.10)
    p50 = rev_2027.quantile(0.50)
    p90 = rev_2027.quantile(0.90)

    ax.hist(rev_2027, bins=40, color=SC_COLORS[sc_key], alpha=0.85,
            edgecolor="white", linewidth=0.5, zorder=3)

    # Percentile lines
    for pct, val, ls in [(10, p10, "--"), (50, p50, "-"), (90, p90, "--")]:
        ax.axvline(val, color="#0B1628", linewidth=1.5, linestyle=ls, zorder=4)
        ax.text(val, ax.get_ylim()[1] * 0.88,
                f"P{pct}\n${val:.0f}B",
                ha="center", va="top", fontsize=8.5, fontweight="bold",
                color="#0B1628", bbox=dict(boxstyle="round,pad=0.2",
                                           facecolor="white", alpha=0.7))

    ax.set_title(f"{SC_LABELS[sc_key]} Scenario", fontsize=12,
                 fontweight="bold", color=SC_COLORS[sc_key])
    ax.set_xlabel("2027E Cloud Revenue ($B)", fontsize=10, color="#4A5568")
    ax.set_ylabel("Frequency", fontsize=10, color="#4A5568")
    ax.set_facecolor("#FFFFFF")
    ax.spines[["top", "right"]].set_visible(False)
    ax.tick_params(colors="#9CA3AF", labelsize=9)
    ax.grid(axis="y", color="#E5E7EB", linewidth=0.8, zorder=0)

plt.tight_layout()
plt.savefig("simulation_chart.png", dpi=150, bbox_inches="tight",
            facecolor=fig.get_facecolor())
print("Saved: simulation_chart.png")

# ── Save results ──────────────────────────────────────────────────────────────
results_df.to_csv("monte_carlo_results.csv", index=False)
print("Saved: monte_carlo_results.csv")
print(f"\nTotal rows: {len(results_df):,} ({N_ITER} iterations × 3 scenarios × 3 years)")
