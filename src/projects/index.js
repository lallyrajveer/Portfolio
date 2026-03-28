import { lazy } from "react";

const NetflixStreamingAnalysis = lazy(() => import("./NetflixStreamingAnalysis.jsx"));
const NetflixRevenueForecast   = lazy(() => import("./NetflixRevenueForecast.jsx"));
const NetflixOpEx              = lazy(() => import("./NetflixOpEx.jsx"));
const NetflixBoardReport       = lazy(() => import("./NetflixBoardReport.jsx"));
const GoogleCloudProject       = lazy(() => import("./GoogleCloudProject.jsx"));
const NetflixThreeStatement    = lazy(() => import("./NetflixThreeStatement.jsx"));
const NetflixDCF               = lazy(() => import("./NetflixDCF.jsx"));
const NetflixUnitEconomics     = lazy(() => import("./NetflixUnitEconomics.jsx"));

export const projects = [
  /* Verizon projects, hidden locally
  {
    id: "telecom-analysis",
    title: "U.S. Wireless Competitive Analysis: Postpaid Phone",
    category: "Competitive Analysis",
    description:
      "Postpaid phone comparative analysis of Verizon, T-Mobile, and AT&T across key wireless KPIs: service revenue, subscribers, net adds, churn, and ARPU. Identifies market leaders and strategic trends from Q1 2023 through Q4 2024.",
    date: "Q4 2024",
    tags: ["wireless", "KPI", "telecom", "benchmarking", "recharts"],
    featured: true,
    component: TelecomAnalysis,
  },
  {
    id: "wireless-forecast",
    title: "Verizon Wireless Revenue Forecast: Postpaid Phone",
    category: "Forecasting",
    description:
      "Driver-based postpaid phone revenue forecast for Verizon through FY2027. Projects revenue from three core drivers: quarterly net adds, monthly ARPU growth, and churn rate, across Bear / Base / Bull scenarios, sensitivity (tornado) analysis, and an interactive custom scenario builder.",
    date: "Q1 2026",
    tags: ["forecast", "wireless", "Verizon", "scenario analysis", "sensitivity", "driver-based"],
    featured: true,
    component: WirelessRevenueForecast,
  },
  {
    id: "verizon-board-report",
    title: "Verizon Wireless Strategy: Board Report",
    category: "Board Reporting",
    description:
      "Board-level competitive strategy report prepared from a Verizon FP&A perspective. Presents FY2025 competitive findings across revenue, subscribers, ARPU, and churn, and proposes five strategic recommendations to sustain wireless market leadership through FY2027.",
    date: "Q1 2026",
    tags: ["board report", "strategy", "Verizon", "competitive analysis", "FP&A"],
    featured: true,
    component: VerizonBoardReport,
  },
  */
  {
    id: "google-cloud-capex",
    title: "Google Cloud ML CapEx Benchmarking",
    category: "Cloud Infrastructure",
    description:
      "End-to-end CapEx and cloud revenue analysis benchmarking Alphabet against AWS and Microsoft. Includes peer KPI benchmarking, Bear/Base/Bull scenario modeling, 1,000-iteration Monte Carlo simulation, and an investment recommendation framed for Google Cloud Finance leadership.",
    date: "Q1 2026",
    tags: ["Google Cloud", "CapEx", "Monte Carlo", "benchmarking", "scenario analysis", "FP&A"],
    featured: true,
    component: GoogleCloudProject,
  },
  {
    id: "netflix-streaming-analysis",
    title: "Global Streaming Competitive Analysis: Top 5 Services",
    category: "Streaming Market Analysis",
    description:
      "Comparative streaming KPI analysis of Netflix, Amazon Prime Video, Disney+, Max, and Paramount+ across paid memberships, revenue, net adds, ARM, and churn. Tracks Q1 2023 through Q4 2025, including Netflix's password-sharing crackdown, Disney's Hotstar reclassification, and Amazon's bundling moat.",
    date: "Q1 2026",
    tags: ["streaming", "Netflix", "Disney+", "Max", "Amazon", "Paramount+", "KPI", "benchmarking"],
    featured: true,
    component: NetflixStreamingAnalysis,
  },
  {
    id: "netflix-revenue-forecast",
    title: "Netflix Revenue & Operating Model",
    category: "Forecasting",
    description:
      "Integrated driver-based model forecasting Netflix revenue and operating margin through FY2027. Projects revenue from net membership adds and ARM growth, then flows through to cost structure, operating income, and scenario-linked margin expansion — across Bear / Consensus / Bull scenarios with sensitivity analysis and a custom scenario builder.",
    date: "Q1 2026",
    tags: ["forecast", "Netflix", "streaming", "scenario analysis", "ARM", "OpEx", "operating margin", "driver-based"],
    featured: true,
    component: NetflixRevenueForecast,
  },
  {
    id: "netflix-opex",
    title: "Netflix Cost Structure & Operating Margin",
    category: "Forecasting",
    description:
      "Operating expense model forecasting Netflix's cost structure through FY2027. Breaks down Cost of Revenue, Technology & Development, Marketing, and G&A as a percentage of revenue, with scenario-linked operating income and margin expansion analysis.",
    date: "Q1 2026",
    tags: ["OpEx", "Netflix", "operating margin", "cost structure", "scenario analysis", "FP&A"],
    featured: true,
    component: NetflixOpEx,
  },
  {
    id: "netflix-variance-q1-2026",
    title: "Netflix Q1 2026: Forecast vs. Actuals Variance Analysis",
    category: "Variance Analysis",
    description:
      "Quarterly variance analysis comparing the ARM-based revenue forecast against Netflix Q1 2026 reported actuals. Breaks down revenue, membership, and ARM deltas by driver, quantifies forecast error, and identifies what the model got right — and what it missed.",
    date: "Q1 2026",
    tags: ["variance analysis", "Netflix", "forecast vs. actuals", "FP&A", "Q1 2026"],
    featured: true,
    comingSoon: true,
    comingSoonLabel: "Available after Q1 2026 earnings filing",
  },
  {
    id: "netflix-board-report",
    title: "Netflix Streaming Strategy: Executive Deck",
    category: "Board Reporting",
    description:
      "Exec-facing strategic deck from a Netflix FP&A perspective. Presents FY2025 competitive KPIs, competitive context vs. Disney+ and Max, five strategic priorities for FY2026–27, and a financial outlook table live-synced to the Netflix Revenue Forecast scenario selector.",
    date: "Q1 2026",
    tags: ["executive deck", "strategy", "Netflix", "streaming", "FP&A"],
    featured: true,
    component: NetflixBoardReport,
  },
  {
    id: "netflix-three-statement",
    title: "Netflix Three-Statement Financial Model",
    category: "Financial Modeling",
    description:
      "Annual three-statement model (Income Statement, Balance Sheet, Cash Flow) for Netflix from FY2023A through FY2027E. Sourced from Netflix 10-K filings and synced to the scenario selector — forecast P&L, FCF, and balance sheet metrics update dynamically across Bear / Consensus / Bull.",
    date: "Q1 2026",
    tags: ["three-statement model", "Netflix", "financial modeling", "10-K", "scenario analysis", "FP&A"],
    featured: true,
    component: NetflixThreeStatement,
  },
  {
    id: "netflix-dcf",
    title: "Netflix DCF & Intrinsic Valuation",
    category: "Financial Modeling",
    description:
      "Full discounted cash flow valuation for Netflix using FCFF from the three-statement model. Includes editable WACC inputs (Rf, ERP, Beta, cost of debt), scenario-linked terminal growth rates, an EV-to-equity bridge, and a WACC × terminal growth rate sensitivity grid.",
    date: "Q1 2026",
    tags: ["DCF", "valuation", "Netflix", "WACC", "FCFF", "financial modeling", "FP&A"],
    featured: true,
    component: NetflixDCF,
  },
  {
    id: "netflix-unit-economics",
    title: "Netflix Unit Economics: LTV, CAC & Payback",
    category: "Financial Modeling",
    description:
      "Customer-level profitability analysis for Netflix from FY2023A through FY2027E. Models LTV, CAC, LTV/CAC ratio, payback period, and contribution margin by year — scenario-synced to the Revenue Forecast so all outputs update dynamically across Bear / Consensus / Bull.",
    date: "Q1 2026",
    tags: ["unit economics", "LTV", "CAC", "Netflix", "payback", "contribution margin", "FP&A"],
    featured: true,
    component: NetflixUnitEconomics,
  },
];

export const categories = ["All", "Cloud Infrastructure", "Streaming Market Analysis", "Forecasting", "Variance Analysis", "Board Reporting", "Financial Modeling"];
