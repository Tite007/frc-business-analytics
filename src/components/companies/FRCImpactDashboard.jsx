"use client";

import { useState, useEffect } from "react";
import {
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


  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Coverage Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
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
        </div>
      </div>


    </div>
  );
}
