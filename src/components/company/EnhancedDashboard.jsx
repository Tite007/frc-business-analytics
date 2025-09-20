"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChartBarIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import ChartComponent from "@/components/ChartComponent";
import TableComponent from "@/components/TableComponent";
import AnalysisComponent from "@/components/AnalysisComponent";
import BloombergReadershipTable from "@/components/BloombergReadershipTable";
import BloombergAnalysis from "@/components/BloombergAnalysis";
import EnhancedMetricsTable from "./EnhancedMetricsTable";
import DataSummaryDashboard from "./DataSummaryDashboard";
import MobileDataControls from "./MobileDataControls";
import QuickAccessMenu from "./QuickAccessMenu";
import VolumeCorrelationDashboard from "./VolumeCorrelationDashboard";
import { getBloombergReadership } from "@/lib/api";
import VolumeTimelineChart from "./VolumeTimelineChart";
import VolumeCorrelationHeatmap from "./VolumeCorrelationHeatmap";
import FRCImpactDashboard from "../companies/FRCImpactDashboard";
import PDFExportButton from "./PDFExportButton";

export default function EnhancedDashboard({
  chartData,
  metricsData,
  analysisData,
  companyData,
  ticker,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [bloombergData, setBloombergData] = useState(null);

  // Helper functions
  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.data?.company_profile?.name ||
      ticker
    );
  };

  const getExchange = () => {
    return companyData.data?.company_profile?.exchange || companyData.exchange;
  };

  const getCurrency = () => {
    return (
      companyData.data?.company_profile?.currency ||
      companyData.currency ||
      "CAD"
    );
  };

  const getTotalReports = () => {
    return (
      companyData.reports?.length ||
      companyData.reports_count ||
      companyData.data?.reports?.length ||
      0
    );
  };

  // Data availability checks
  const hasChartData =
    chartData || companyData.data_available?.has_chart || companyData.has_chart;
  const hasMetricsData =
    metricsData ||
    companyData.data_available?.has_metrics ||
    companyData.has_metrics;
  const hasAnalysisData =
    analysisData || companyData.data_available?.has_ai_analysis;

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!metricsData || metricsData.length === 0) return null;

    const totalReports = metricsData.length;
    const avgVolumeChange =
      metricsData.reduce(
        (sum, report) => sum + (report["Volume Change 30 Days (%)"] || 0),
        0
      ) / totalReports;
    const avgPrePostChange =
      metricsData.reduce(
        (sum, report) =>
          sum + (report["Volume Change Pre-Post 30 Days (%)"] || 0),
        0
      ) / totalReports;
    const positiveReports = metricsData.filter(
      (report) => (report["Volume Change 30 Days (%)"] || 0) > 0
    ).length;

    return {
      totalReports,
      avgVolumeChange,
      avgPrePostChange,
      positiveReports,
      successRate: (positiveReports / totalReports) * 100,
    };
  }, [metricsData]);

  // Fetch Bloomberg data
  useEffect(() => {
    const fetchBloombergData = async () => {
      if (!ticker) return;

      try {
        const response = await getBloombergReadership(ticker, getCompanyName());
        if (response.success && response.data) {
          setBloombergData(response.data);
        } else if (response.error) {
          // Bloomberg data not available for this ticker - this is expected
          setBloombergData(null);
        }
      } catch (error) {
        // Only log errors that aren't 404s (expected when no data exists)
        if (error.response?.status !== 404) {
          console.error("Error fetching Bloomberg data:", error);
        }
        setBloombergData(null);
      }
    };

    fetchBloombergData();
  }, [ticker]);

  // Filter and sort data
  const filteredMetricsData = useMemo(() => {
    if (!metricsData) return [];

    let filtered = metricsData.filter(
      (report) =>
        !searchTerm ||
        report["Report Title"]
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        report["Report Number"]?.toString().includes(searchTerm)
    );

    // Sort data
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "date":
          aVal = new Date(a["Publication Date"]);
          bVal = new Date(b["Publication Date"]);
          break;
        case "volume":
          aVal = a["Volume Change 30 Days (%)"] || 0;
          bVal = b["Volume Change 30 Days (%)"] || 0;
          break;
        case "prepost":
          aVal = a["Volume Change Pre-Post 30 Days (%)"] || 0;
          bVal = b["Volume Change Pre-Post 30 Days (%)"] || 0;
          break;
        default:
          aVal = a["Report Number"];
          bVal = b["Report Number"];
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [metricsData, searchTerm, sortBy, sortOrder]);

  const tabs = [
    {
      id: "overview",
      name: "Overview",
      icon: ChartBarIcon,
      count: null,
    },
    {
      id: "volume-correlation",
      name: "Volume Correlation",
      icon: ArrowTrendingUpIcon,
      count: getTotalReports(),
    },
    {
      id: "metrics",
      name: "Performance Metrics",
      icon: TableCellsIcon,
      count: getTotalReports(),
    },
    {
      id: "analysis",
      name: "AI Analysis",
      icon: DocumentChartBarIcon,
      count: null,
    },
    {
      id: "bloomberg",
      name: "Bloomberg Data",
      icon: EyeIcon,
      count: bloombergData?.data?.summary?.unique_institutions || bloombergData?.summary?.unique_institutions || null,
    },
  ];

  // PDF Export function for mobile controls
  const exportPDFReport = () => {
    // Trigger PDF export from the component
    const pdfButton = document.querySelector('[data-pdf-export]');
    if (pdfButton) {
      pdfButton.click();
    }
  };

  // CSV Export function for mobile controls
  const exportData = () => {
    const csvContent = [
      [
        "Report #",
        "Report Title",
        "Company",
        "Ticker",
        "Price on Release",
        "Publication Date",
        "Avg Volume 5D",
        "Avg Volume 10D",
        "Volume Δ 30D (%)",
        "Pre-Post Δ 30D (%)",
      ],
      ...filteredMetricsData.map((report) => [
        report["Report Number"],
        report["Report Title"],
        getCompanyName(),
        ticker,
        report["Price on Release"],
        report["Publication Date"],
        report["Avg Volume Post 5 Days"],
        report["Avg Volume Post 10 Days"],
        report["Volume Change 30 Days (%)"],
        report["Volume Change Pre-Post 30 Days (%)"],
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticker}_performance_metrics.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Enhanced Search and Filter Bar - Desktop only
  const SearchAndFilterBar = () => (
    <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports by title or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Sort by Date</option>
            <option value="volume">Sort by Volume Change</option>
            <option value="prepost">Sort by Pre-Post Change</option>
            <option value="number">Sort by Report Number</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>

          <button
            onClick={exportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            CSV
          </button>

          <PDFExportButton
            companyData={companyData}
            chartData={chartData}
            metricsData={metricsData}
            analysisData={analysisData}
            bloombergData={bloombergData}
            ticker={ticker}
            className="px-4 py-2"
          />
        </div>
      </div>

      {/* Results Summary */}
      {(searchTerm || filteredMetricsData.length !== metricsData?.length) && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredMetricsData.length} of {metricsData?.length || 0}{" "}
          reports
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Data Summary Dashboard */}
      {hasMetricsData && (
        <DataSummaryDashboard
          metricsData={metricsData}
          companyData={companyData}
          ticker={ticker}
          onViewDetails={() => setActiveTab("metrics")}
        />
      )}

      {/* Quick Access Menu - Mobile Only */}
      <QuickAccessMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasChartData={hasChartData}
        hasMetricsData={hasMetricsData}
        hasAnalysisData={hasAnalysisData}
        totalReports={getTotalReports()}
      />

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          {/* Desktop Tab Navigation */}
          <nav className="hidden lg:flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.name}
                  {tab.count !== null && (
                    <span
                      className={`${
                        isActive
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      } ml-2 py-1 px-2 rounded-full text-xs font-medium`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 lg:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6 lg:space-y-8">
              {/* FRC Impact Analysis */}
              <FRCImpactDashboard
                company={{
                  ticker: ticker,
                  company_name: getCompanyName(),
                  exchange: getExchange(),
                  currency: getCurrency(),
                  status: companyData.status || "unknown",
                  reports_count: getTotalReports(),
                  stock_data_points: companyData.data_quality?.stock_data_points || companyData.stock_data_points || 0,
                  has_chart: hasChartData,
                  has_metrics: hasMetricsData,
                  frc_covered: companyData.frc_covered || companyData.company_data?.frc_covered || false,
                  analysis_date: companyData.analysis_date,
                  first_report_date: companyData.data?.reports_summary?.reports_list?.[0]?.published_date,
                  last_report_date: companyData.data?.reports_summary?.reports_list?.[companyData.data?.reports_summary?.reports_list?.length - 1]?.published_date,
                }}
              />

              {/* Quick Metrics Overview */}
              {hasMetricsData && (
                <div className="bg-gray-50 rounded-lg p-4 lg:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Quick Overview
                    </h3>

                  </div>
                  <TableComponent
                    metrics={metricsData || []}
                    ticker={ticker}
                    currency={getCurrency()}
                    totalReports={getTotalReports()}
                  />
                </div>
              )}

              {/* No data message */}
              {!hasChartData && !hasMetricsData && !hasAnalysisData && (
                <div className="text-center py-12 lg:py-20">
                  <ExclamationTriangleIcon className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-600 mb-4">
                    Limited Data Available
                  </h3>
                  <p className="text-gray-500 text-base lg:text-lg max-w-md mx-auto px-4">
                    This company has basic information but no additional charts,
                    metrics, or analysis data available yet.
                  </p>
                  <p className="text-gray-400 text-sm mt-4">
                    We're continuously expanding our coverage. Check back soon!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "volume-correlation" && (
            <div className="space-y-6">
              {hasMetricsData ? (
                <>
                  <VolumeCorrelationDashboard
                    metricsData={metricsData}
                    ticker={ticker}
                    companyData={companyData}
                  />
                  <VolumeTimelineChart
                    metricsData={metricsData}
                    chartData={chartData}
                    ticker={ticker}
                  />
                  <VolumeCorrelationHeatmap
                    metricsData={metricsData}
                    ticker={ticker}
                  />
                </>
              ) : (
                <div className="text-center py-16">
                  <ArrowTrendingUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No volume correlation data available for this company.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Volume correlation analysis requires metrics data.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6">
              {/* Mobile Controls */}
              <MobileDataControls
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                onExport={exportData}
                onPDFExport={exportPDFReport}
                resultsCount={filteredMetricsData.length}
                totalCount={metricsData?.length || 0}
              />

              {/* Desktop Search Bar */}
              <SearchAndFilterBar />

              {hasMetricsData ? (
                <>
                  <EnhancedMetricsTable
                    metricsData={filteredMetricsData}
                    companyData={companyData}
                    ticker={ticker}
                  />

                  {filteredMetricsData.length === 0 && searchTerm && (
                    <div className="text-center py-12">
                      <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No reports match your search criteria.
                      </p>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear search
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <TableCellsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No metrics data available for this company.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back later as we continuously update our data.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="space-y-6">
              {hasAnalysisData ? (
                <AnalysisComponent
                  analysis={analysisData || ""}
                  ticker={ticker}
                  status="success"
                  generatedDate={companyData.analysis_date}
                />
              ) : (
                <div className="text-center py-16">
                  <DocumentAnalyticsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No AI analysis available for this company.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Analysis will be generated as more data becomes available.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "bloomberg" && (
            <div className="space-y-6">
              <BloombergReadershipTable ticker={ticker} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
