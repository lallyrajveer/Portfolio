#!/usr/bin/env python3
"""
Step 2: Benchmarking Model
==========================
Loads cloud_peers_data.csv, calculates four KPIs for each company,
produces a grouped bar chart, and prints a text summary.

KPIs:
  1. CapEx Intensity       = total_capex / total_revenue (2024)
  2. Cloud Revenue CAGR    = (cloud_rev_2024 / cloud_rev_2020)^(1/4) - 1
  3. CapEx per $1 Cloud    = cumulative CapEx 2020-2024 / cumulative cloud rev growth
  4. Operating Margin      = operating_income / total_revenue (2024)
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

# ── Load data ─────────────────────────────────────────────────────────────────
df = pd.read_csv("cloud_peers_data.csv")
companies = ["Alphabet", "Amazon", "Microsoft"]
colors    = {"Alphabet": "#4285F4", "Amazon": "#FF9900", "Microsoft": "#00A4EF"}

# ── KPI Calculations ──────────────────────────────────────────────────────────
kpis = {}

for co in companies:
    d     = df[df["company"] == co].sort_values("year")
    d2020 = d[d["year"] == 2020].iloc[0]
    d2024 = d[d["year"] == 2024].iloc[0]

    # 1. CapEx Intensity (2024)
    capex_intensity = d2024["total_capex_bn"] / d2024["total_revenue_bn"]

    # 2. Cloud Revenue CAGR (2020-2024, 4-year)
    cloud_cagr = (d2024["cloud_revenue_bn"] / d2020["cloud_revenue_bn"]) ** (1 / 4) - 1

    # 3. CapEx per $1 of cloud revenue growth
    #    Cumulative CapEx invested 2020-2024 per dollar of cloud revenue gained
    cumulative_capex        = d["total_capex_bn"].sum()
    cloud_revenue_growth    = d2024["cloud_revenue_bn"] - d2020["cloud_revenue_bn"]
    capex_per_cloud_growth  = cumulative_capex / cloud_revenue_growth

    # 4. Operating Margin (2024)
    operating_margin = d2024["operating_income_bn"] / d2024["total_revenue_bn"]

    kpis[co] = {
        "CapEx Intensity (2024)":          round(capex_intensity * 100, 1),   # as %
        "Cloud Rev CAGR 2020-24":          round(cloud_cagr * 100, 1),         # as %
        "CapEx per $1 Cloud Growth ($)":   round(capex_per_cloud_growth, 2),   # dollars
        "Operating Margin (2024)":         round(operating_margin * 100, 1),   # as %
    }

kpi_df = pd.DataFrame(kpis).T
print("=" * 65)
print("BENCHMARKING KPIs — ALL PEERS")
print("=" * 65)
print(kpi_df.to_string())
print()

# ── Grouped Bar Chart ─────────────────────────────────────────────────────────
fig, axes = plt.subplots(1, 4, figsize=(18, 6))
fig.patch.set_facecolor("#F8F9FA")
fig.suptitle("Cloud Peer Benchmarking: Alphabet vs. Amazon vs. Microsoft (2020–2024)",
             fontsize=14, fontweight="bold", color="#0B1628", y=1.02)

kpi_labels = list(kpis["Alphabet"].keys())
x          = np.arange(len(companies))
bar_width  = 0.55

for i, (ax, kpi) in enumerate(zip(axes, kpi_labels)):
    vals = [kpis[co][kpi] for co in companies]
    bars = ax.bar(x, vals, width=bar_width,
                  color=[colors[co] for co in companies],
                  edgecolor="white", linewidth=1.2, zorder=3)

    # Value labels on bars
    for bar, val in zip(bars, vals):
        unit = "%" if "%" in kpi or "Intensity" in kpi or "Margin" in kpi or "CAGR" in kpi else "$"
        label = f"{val:.1f}%" if unit == "%" else f"${val:.2f}"
        ax.text(bar.get_x() + bar.get_width() / 2,
                bar.get_height() + max(vals) * 0.02,
                label, ha="center", va="bottom",
                fontsize=10, fontweight="bold", color="#0B1628")

    ax.set_title(kpi, fontsize=10, fontweight="bold", color="#0B1628", pad=10,
                 wrap=True)
    ax.set_xticks(x)
    ax.set_xticklabels(companies, fontsize=10, color="#4A5568")
    ax.set_facecolor("#FFFFFF")
    ax.spines[["top", "right", "left"]].set_visible(False)
    ax.yaxis.set_visible(False)
    ax.grid(axis="y", color="#E5E7EB", linewidth=0.8, zorder=0)
    ax.yaxis.set_visible(True)
    ax.tick_params(axis="y", colors="#9CA3AF", labelsize=9)

    # Highlight Google bar with border
    bars[0].set_edgecolor("#0B1628")
    bars[0].set_linewidth(2)

# Legend
patches = [mpatches.Patch(color=colors[co], label=co) for co in companies]
fig.legend(handles=patches, loc="lower center", ncol=3,
           frameon=False, fontsize=11, bbox_to_anchor=(0.5, -0.04))

plt.tight_layout()
plt.savefig("benchmarking_chart.png", dpi=150, bbox_inches="tight",
            facecolor=fig.get_facecolor())
print("Saved: benchmarking_chart.png")

# ── Text Summary ──────────────────────────────────────────────────────────────
goog = kpis["Alphabet"]
amzn = kpis["Amazon"]
msft = kpis["Microsoft"]

print("\n" + "=" * 65)
print("BENCHMARKING SUMMARY: WHERE GOOGLE LEADS vs. LAGS")
print("=" * 65)

print("\n📈 WHERE GOOGLE LEADS:")
if goog["Cloud Rev CAGR 2020-24"] == max(goog["Cloud Rev CAGR 2020-24"],
                                          amzn["Cloud Rev CAGR 2020-24"],
                                          msft["Cloud Rev CAGR 2020-24"]):
    print(f"  ✓ Cloud Revenue CAGR: Google {goog['Cloud Rev CAGR 2020-24']}% vs."
          f" Amazon {amzn['Cloud Rev CAGR 2020-24']}% vs. Microsoft {msft['Cloud Rev CAGR 2020-24']}%")
    print("    Google is growing cloud revenue fastest — reflecting share gains from a smaller base.")

if goog["CapEx Intensity (2024)"] < msft["CapEx Intensity (2024)"]:
    print(f"  ✓ CapEx Intensity: Google {goog['CapEx Intensity (2024)']}% vs. Microsoft {msft['CapEx Intensity (2024)']}%")
    print("    Google spends a lower share of total revenue on CapEx than Microsoft.")

print("\n⚠️  WHERE GOOGLE LAGS:")
if goog["Operating Margin (2024)"] < msft["Operating Margin (2024)"]:
    print(f"  ✗ Operating Margin: Google {goog['Operating Margin (2024)']}% vs. Microsoft {msft['Operating Margin (2024)']}%")
    print("    Microsoft's margin reflects a more mature, diversified software+cloud mix.")

if goog["CapEx per $1 Cloud Growth ($)"] > amzn["CapEx per $1 Cloud Growth ($)"]:
    print(f"  ✗ CapEx per $1 Cloud Growth: Google ${goog['CapEx per $1 Cloud Growth ($)']} vs. Amazon ${amzn['CapEx per $1 Cloud Growth ($)']}")
    print("    Google required more cumulative CapEx per dollar of cloud revenue gained than Amazon.")
    print("    This reflects the cost of building out TPU infrastructure and data center footprint.")

print(f"\n  ✗ Absolute Cloud Scale: Google $43.2B vs. AWS $107.6B vs. Azure (IC) $105.4B (2024)")
print("    Google Cloud is ~40% the size of AWS — the scale gap is the core strategic challenge.")

print()
