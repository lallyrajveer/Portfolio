import { lazy } from "react";

const NetflixStreamingAnalysis = lazy(() => import("./NetflixStreamingAnalysis.jsx"));
const NetflixRevenueForecast   = lazy(() => import("./NetflixRevenueForecast.jsx"));
const NetflixBoardReport       = lazy(() => import("./NetflixBoardReport.jsx"));

export const projects = [
  /* Verizon projects — hidden locally
  {
    id: "telecom-analysis",
    title: "U.S. Wireless Competitive Analysis — Postpaid Phone",
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
    title: "Verizon Wireless Revenue Forecast — Postpaid Phone",
    category: "Forecasting",
    description:
      "Driver-based postpaid phone revenue forecast for Verizon through FY2027. Projects revenue from three core drivers — quarterly net adds, monthly ARPU growth, and churn rate — across Bear / Base / Bull scenarios, sensitivity (tornado) analysis, and an interactive custom scenario builder.",
    date: "Q1 2026",
    tags: ["forecast", "wireless", "Verizon", "scenario analysis", "sensitivity", "driver-based"],
    featured: true,
    component: WirelessRevenueForecast,
  },
  {
    id: "verizon-board-report",
    title: "Verizon Wireless Strategy — Board Report",
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
    id: "netflix-streaming-analysis",
    title: "Global Streaming Competitive Analysis — Top 5 Services",
    category: "Competitive Analysis",
    description:
      "Comparative streaming KPI analysis of Netflix, Amazon Prime Video, Disney+, Max, and Paramount+ across paid memberships, revenue, net adds, ARM, and churn. Tracks Q1 2023 through Q4 2025, including Netflix's password-sharing crackdown, Disney's Hotstar reclassification, and Amazon's bundling moat.",
    date: "Q1 2026",
    tags: ["streaming", "Netflix", "Disney+", "Max", "Amazon", "Paramount+", "KPI", "benchmarking"],
    featured: true,
    component: NetflixStreamingAnalysis,
  },
  {
    id: "netflix-revenue-forecast",
    title: "Netflix Revenue Forecast — ARM-Based Model",
    category: "Forecasting",
    description:
      "Driver-based revenue forecast for Netflix through FY2027, projecting from two key levers — quarterly net membership adds and annual ARM growth — across Bear / Base / Bull scenarios, sensitivity (tornado) analysis, and a custom scenario builder synced to the Board Report.",
    date: "Q1 2026",
    tags: ["forecast", "Netflix", "streaming", "scenario analysis", "ARM", "driver-based"],
    featured: true,
    component: NetflixRevenueForecast,
  },
  {
    id: "netflix-board-report",
    title: "Netflix Streaming Strategy — Board Report",
    category: "Board Reporting",
    description:
      "Board-level strategic report from a Netflix FP&A perspective. Presents FY2025 competitive KPIs, competitive context vs. Disney+ and Max, five strategic priorities for FY2026–27, and a financial outlook table live-synced to the Netflix Revenue Forecast scenario selector.",
    date: "Q1 2026",
    tags: ["board report", "strategy", "Netflix", "streaming", "FP&A"],
    featured: true,
    component: NetflixBoardReport,
  },
];

export const categories = ["All", "Competitive Analysis", "Forecasting", "Board Reporting"];
