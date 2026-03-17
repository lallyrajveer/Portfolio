import { lazy } from "react";

const TelecomAnalysis = lazy(() => import("./TelecomAnalysis.jsx"));
const WirelessRevenueForecast = lazy(() => import("./WirelessRevenueForecast.jsx"));
const VerizonBoardReport = lazy(() => import("./VerizonBoardReport.jsx"));

export const projects = [
  {
    id: "telecom-analysis",
    title: "U.S. Wireless Competitive Analysis — Postpaid Phone",
    category: "KPI Dashboards",
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
];

export const categories = ["All", "KPI Dashboards", "Forecasting", "Board Reporting"];
