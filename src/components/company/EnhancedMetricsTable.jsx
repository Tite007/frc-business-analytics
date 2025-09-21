"use client";

import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

export default function EnhancedMetricsTable({
  metricsData,
  companyData,
  ticker,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [viewMode, setViewMode] = useState("table");
  const [sortOrder, setSortOrder] = useState("chronological"); // "chronological" or "reverse"
  const [filterType, setFilterType] = useState("all"); // "all", "positive", "negative"

  // Process and sort metrics data chronologically
  const processedMetricsData = React.useMemo(() => {
    if (!metricsData || metricsData.length === 0) return [];

    // Sort by publication date (oldest first) and add chronological numbering
    const sortedMetrics = [...metricsData].sort((a, b) => {
      const dateA = new Date(a["Publication Date"]);
      const dateB = new Date(b["Publication Date"]);
      return dateA - dateB; // Ascending order (oldest first)
    }).map((report, index) => ({
      ...report,
      chronologicalNumber: index + 1, // 1 = oldest, 2, 3... up to newest
      originalReportNumber: report["Report Number"] // Keep original for reference
    }));

    // Apply filtering
    let filteredMetrics = sortedMetrics;
    if (filterType === "positive") {
      filteredMetrics = sortedMetrics.filter(report =>
        (report["Price Change 30 Days (%)"] || 0) >= 0
      );
    } else if (filterType === "negative") {
      filteredMetrics = sortedMetrics.filter(report =>
        (report["Price Change 30 Days (%)"] || 0) < 0
      );
    }

    // Apply sort order
    if (sortOrder === "reverse") {
      filteredMetrics = [...filteredMetrics].reverse();
    }

    return filteredMetrics;
  }, [metricsData, sortOrder, filterType]);

  if (!metricsData || metricsData.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-5xl mb-4">📊</div>
        <p className="text-gray-500 text-lg font-medium">
          No metrics data available for this company.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Check back later as we continuously update our data.
        </p>
      </div>
    );
  }

  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.company_data?.name ||
      companyData.data?.company_profile?.name ||
      ticker
    );
  };

  const toggleRowExpansion = (reportNumber) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(reportNumber)) {
      newExpanded.delete(reportNumber);
    } else {
      newExpanded.add(reportNumber);
    }
    setExpandedRows(newExpanded);
  };

  const exportData = () => {
    const csvContent = [
      [
        "Report #",
        "Report Title",
        "Company",
        "Ticker",
        "Price on Release",
        "Publication Date",
        "Pre Volume 30D",
        "Post Volume 30D",
        "Avg Volume 5D",
        "Avg Volume 10D",
        "Volume Spike 30D (%)",
        "Pre-Post Volume Change 30D (%)",
        "Price Change 30D (%)",
      ],
      ...processedMetricsData.map((report) => [
        report.chronologicalNumber,
        report["Report Title"],
        getCompanyName(),
        ticker,
        report["Price on Release"],
        report["Publication Date"],
        report["Avg Volume Pre 30 Days"]?.toLocaleString() || "0",
        report["Avg Volume Post 30 Days"]?.toLocaleString() || "0",
        report["Avg Volume Post 5 Days"]?.toLocaleString() || "0",
        report["Avg Volume Post 10 Days"]?.toLocaleString() || "0",
        report["Volume Spike 30 Days (%)"] || 0,
        report["Volume Change Pre-Post 30 Days (%)"] || 0,
        report["Price Change 30 Days (%)"] || 0,
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

  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0.00%";
    const num = parseFloat(value);
    if (isNaN(num)) return "0.00%";
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "text-gray-500";
    const num = parseFloat(value);
    if (isNaN(num)) return "text-gray-500";
    return num >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "$0.00";
    const num = parseFloat(value);
    if (isNaN(num)) return "$0.00";
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "0";
    const num = parseInt(value);
    if (isNaN(num)) return "0";
    return num.toLocaleString();
  };


  // Table View Component
  const TableView = () => (
    <div className="overflow-hidden border border-gray-200 rounded-xl">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Report #
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Report Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Price on Release
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div>Volume Spike</div>
                <div className="text-xs font-normal opacity-75">vs 30D Avg</div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div>Pre vs Post</div>
                <div className="text-xs font-normal opacity-75">30D Volume Change</div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div>Price Change</div>
                <div className="text-xs font-normal opacity-75">30D Performance</div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedMetricsData.map((report, index) => (
              <React.Fragment key={`${ticker}-${report.chronologicalNumber}`}>
                <tr
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.chronologicalNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                    <div className="truncate" title={report["Report Title"]}>
                      {report["Report Title"]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report["Publication Date"]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(report["Price on Release"])}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1" title="Volume spike vs 30-day average (how much volume increased on report day)">
                      {(report["Volume Spike 30 Days (%)"] || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-semibold ${getPercentageColor(
                          report["Volume Spike 30 Days (%)"]
                        )}`}
                      >
                        {formatPercentage(report["Volume Spike 30 Days (%)"])}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1" title="Comparison of average volume 30 days before vs 30 days after report">
                      {(report["Volume Change Pre-Post 30 Days (%)"] || 0) >=
                      0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-semibold ${getPercentageColor(
                          report["Volume Change Pre-Post 30 Days (%)"]
                        )}`}
                      >
                        {formatPercentage(
                          report["Volume Change Pre-Post 30 Days (%)"]
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      {(report["Price Change 30 Days (%)"] || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-semibold ${getPercentageColor(
                          report["Price Change 30 Days (%)"]
                        )}`}
                      >
                        {formatPercentage(report["Price Change 30 Days (%)"])}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        toggleRowExpansion(report.chronologicalNumber)
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      {expandedRows.has(report.chronologicalNumber) ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(report.chronologicalNumber) && (
                  <tr className="bg-blue-50">
                    <td colSpan="8" className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Pre/Post Volume Analysis
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-sm text-gray-600">
                                Pre Volume (30D):
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {formatVolume(report["Avg Volume Pre 30 Days"])}
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-sm text-gray-600">
                                Post Volume (30D):
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {formatVolume(report["Avg Volume Post 30 Days"])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Post Volume (5D):
                              </span>
                              <span className="text-sm font-medium">
                                {formatVolume(report["Avg Volume Post 5 Days"])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Post Volume (10D):
                              </span>
                              <span className="text-sm font-medium">
                                {formatVolume(report["Avg Volume Post 10 Days"])}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Price Analysis
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-sm text-gray-600">
                                Price on Release:
                              </span>
                              <span className="text-sm font-medium text-blue-600">
                                {formatCurrency(report["Price on Release"])}
                              </span>
                            </div>
                            <div className="flex justify-between border-b pb-1">
                              <span className="text-sm text-gray-600">
                                Price After 30D:
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(report["Price After 30 Days"])}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Price Change:
                              </span>
                              <span
                                className={`text-sm font-medium ${getPercentageColor(
                                  report["Price Change 30 Days (%)"]
                                )}`}
                              >
                                {formatPercentage(report["Price Change 30 Days (%)"])}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Company Info
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Company:
                              </span>
                              <span className="text-sm font-medium">
                                {getCompanyName()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Ticker:
                              </span>
                              <span className="text-sm font-medium font-mono text-blue-600">
                                {ticker}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Full Report Title
                          </h4>
                          <p className="text-sm text-gray-700">
                            {report["Report Title"]}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Table - Use responsive table view */}
      <div className="lg:hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Report #</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Price</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Vol. Spike</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Pre/Post</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase">Price Δ</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedMetricsData.map((report, index) => (
              <tr key={`mobile-${ticker}-${report.chronologicalNumber}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.chronologicalNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{report["Report Title"]}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{report["Publication Date"]}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(report["Price on Release"])}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold ${getPercentageColor(report["Volume Spike 30 Days (%)"])}`}>
                    {formatPercentage(report["Volume Spike 30 Days (%)"])}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold ${getPercentageColor(report["Volume Change Pre-Post 30 Days (%)"])}`}>
                    {formatPercentage(report["Volume Change Pre-Post 30 Days (%)"])}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`font-semibold ${getPercentageColor(report["Price Change 30 Days (%)"])}`}>
                    {formatPercentage(report["Price Change 30 Days (%)"])}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Report Performance Metrics
            </h3>
            <p className="text-gray-600">
              Comprehensive analysis of {processedMetricsData.length} report
              {processedMetricsData.length !== 1 ? "s" : ""} performance
              {processedMetricsData.length !== metricsData.length &&
                ` (filtered from ${metricsData.length} total)`
              }
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
            {/* Sort Order Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortOrder("chronological")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortOrder === "chronological"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                1→n
              </button>
              <button
                onClick={() => setSortOrder("reverse")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sortOrder === "reverse"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                n→1
              </button>
            </div>

            {/* Filter Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("positive")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filterType === "positive"
                    ? "bg-white text-green-700 shadow-sm"
                    : "text-gray-600 hover:text-green-700"
                }`}
              >
                +
              </button>
              <button
                onClick={() => setFilterType("negative")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filterType === "negative"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-gray-600 hover:text-red-700"
                }`}
              >
                -
              </button>
            </div>


            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {processedMetricsData.length} Reports
            </span>

            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <TableView />
      </div>
    </div>
  );
}
