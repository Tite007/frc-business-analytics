"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import FRCCoverageTimelineCard from "./FRCCoverageTimelineCard";
import { getChartData } from "@/lib/api";
import AdvancedFRCChart from "../charts/AdvancedFRCChart";

// Tooltip component for information display
const InfoTooltip = ({ title, formula, explanation }) => {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-3 w-3 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-80 max-w-96">
        <div className="font-semibold text-blue-200 mb-2">{title}</div>
        <div className="mb-2">
          <span className="font-medium">Formula:</span>
          <div className="font-mono bg-gray-800 p-2 rounded mt-1 text-green-300">
            {formula}
          </div>
        </div>
        <div>
          <span className="font-medium">Explanation:</span>
          <div className="mt-1 text-gray-300">{explanation}</div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default function FRCImpactDashboard({ company, className = "" }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch chart data on component mount and refresh
  useEffect(() => {
    if (company?.ticker) {
      fetchChartData();
    }
  }, [company?.ticker]);

  const fetchChartData = async () => {
    if (!company?.ticker) return;

    setLoading(true);
    try {
      const data = await getChartData(company.ticker);
      if (data.success) {
        setChartData(data);
      } else if (data.error) {
        console.error("Error fetching chart data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChartData();
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  const tabs = [
    {
      id: "overview",
      name: "Coverage Overview",
      icon: ChartBarIcon,
      description: "FRC research coverage summary and timeline",
    },
  ];

  // Generate impact summary using actual API data
  const generateImpactSummary = () => {
    // Use chartData if available for more accurate information
    const reportsData = chartData?.reports_coverage || {};
    const stockData = chartData?.chart_data || [];

    const hasReports =
      (reportsData.total_reports || company.reports_count || 0) > 0;
    const digitalReportsCount = reportsData.digital_reports || 0;
    const pdfReportsCount = reportsData.pdf_reports || 0;
    const hasDigitalReports = digitalReportsCount > 0;
    const hasPdfReports = pdfReportsCount > 0;
    const hasStockData =
      stockData.length > 0 || (company.stock_data_points || 0) > 0;

    let summary = {
      coverage_status: "not_covered",
      total_reports: reportsData.total_reports || company.reports_count || 0,
      digital_reports: digitalReportsCount,
      pdf_reports: pdfReportsCount,
      stock_data_points:
        chartData?.total_data_points || company.stock_data_points || 0,
      first_report_date:
        reportsData.oldest_report_date ||
        reportsData.oldest_report ||
        company.first_report_date ||
        company.analysis_date,
      latest_report_date:
        reportsData.newest_report_date ||
        reportsData.newest_report ||
        company.last_report_date ||
        company.analysis_date,
      frc_covered: company.frc_covered || hasReports,
      date_span_days: reportsData.date_span_days || 0,
      coverage_period_days: reportsData.coverage_period_days || 0,
      data_range: chartData?.date_range || null,
    };

    if (hasDigitalReports) {
      summary.coverage_status = "active_digital";
    } else if (hasPdfReports) {
      summary.coverage_status = "pdf_coverage";
    } else if (hasReports) {
      summary.coverage_status = "limited";
    }

    return summary;
  };

  const summary = generateImpactSummary();

  const getCoverageStatusInfo = () => {
    switch (summary.coverage_status) {
      case "active_digital":
        return {
          label: "Active Digital Coverage",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          description: "Full interactive reports with real-time analytics",
        };
      case "pdf_coverage":
        return {
          label: "PDF Research Coverage",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          description: "Research reports available in PDF format",
        };
      case "limited":
        return {
          label: "Limited Coverage",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          description: "Basic research coverage available",
        };
      default:
        return {
          label: "No Coverage",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          description: "Not currently covered by FRC research",
        };
    }
  };

  const statusInfo = getCoverageStatusInfo();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div
        className={`rounded-lg border p-6 ${statusInfo.bgColor} ${statusInfo.borderColor}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              FRC Research Impact Analysis
            </h2>
            <p className="text-gray-600">
              Comprehensive analysis of FRC research coverage impact on{" "}
              {company.company_name} ({company.ticker})
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={refreshing}
          >
            <ArrowPathIcon
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>

        {/* Status Banner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-full font-medium ${statusInfo.color} bg-white border`}
            >
              {statusInfo.label}
            </div>
            <span className="text-sm text-gray-600">
              {statusInfo.description}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Data Coverage</div>
            <div className="font-medium text-gray-900">
              {summary.data_range
                ? `${summary.data_range.start} to ${summary.data_range.end}`
                : company.analysis_date
                ? new Date(company.analysis_date).toLocaleDateString()
                : "N/A"}
            </div>
            {summary.date_span_days > 0 && (
              <div className="text-xs text-gray-500">
                {summary.date_span_days} days
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {summary.coverage_status !== "not_covered" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.total_reports}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Total Reports
                <InfoTooltip
                  title="Total Research Reports"
                  formula="COUNT = Total number of reports published"
                  explanation="We count all FRC research reports published for this company, including both digital interactive reports and PDF documents."
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.digital_reports}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Digital Reports
                <InfoTooltip
                  title="Interactive Digital Reports"
                  formula="COUNT = Digital reports with interactive features"
                  explanation="Interactive research reports with real-time analytics, charts, and data visualization tools available on FRC platform."
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {summary.pdf_reports}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                PDF Reports
                <InfoTooltip
                  title="PDF Research Documents"
                  formula="COUNT = Traditional PDF format reports"
                  explanation="Research reports delivered in PDF format for download and offline reading. These contain comprehensive fundamental analysis and investment insights."
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {summary.stock_data_points.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                Data Points
                <InfoTooltip
                  title="Market Data Points"
                  formula="COUNT = Total stock price and volume data points"
                  explanation="Number of individual market data points (daily price, volume, etc.) available for comprehensive analysis and chart visualization."
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Coverage Overview
                </h3>
                <p className="text-gray-600 mb-6">
                  This section provides a comprehensive overview of FRC's
                  research coverage for {company.company_name}, including
                  coverage timeline, data availability, and research impact
                  summary.
                </p>
              </div>

              <FRCCoverageTimelineCard
                company={company}
                chartData={chartData}
              />

              {/* Interactive Chart with Report Markers */}
              {chartData &&
                chartData.chart_data &&
                chartData.chart_data.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Stock Price with FRC Report Timeline
                    </h4>
                    <AdvancedFRCChart
                      chartData={chartData}
                      reportDates={chartData.actual_reports || []}
                      ticker={company.ticker}
                      companyName={company.company_name}
                      height={500}
                      showVolume={true}
                      showCandlestick={false}
                    />
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
