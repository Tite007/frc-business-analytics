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
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"

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
      companyData.data?.company_profile?.name ||
      companyData.company_data?.name ||
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
        "Avg Volume 5D",
        "Avg Volume 10D",
        "Volume Δ 30D (%)",
        "Pre-Post Δ 30D (%)",
      ],
      ...metricsData.map((report) => [
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

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "0.00%";
    const num = parseFloat(value);
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const getPercentageColor = (value) => {
    if (value === null || value === undefined) return "text-gray-500";
    return parseFloat(value) >= 0 ? "text-green-600" : "text-red-600";
  };

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsData.map((report, index) => (
        <div
          key={`${ticker}-${report["Report Number"]}`}
          className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">
                  Report #{report["Report Number"]}
                </h3>
                <p className="text-blue-100 text-sm">
                  {report["Publication Date"]}
                </p>
              </div>
              <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {ticker}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-4">
            {/* Report Title */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">
                Report Title
              </h4>
              <p
                className="text-gray-900 text-sm line-clamp-2"
                title={report["Report Title"]}
              >
                {report["Report Title"]}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Price on Release</p>
                <p className="font-semibold text-gray-900">
                  {report["Price on Release"]}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Avg Volume 5D</p>
                <p className="font-semibold text-gray-900">
                  {report["Avg Volume Post 5 Days"]?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Volume Δ 30D</span>
                <div className="flex items-center gap-1">
                  {(report["Volume Change 30 Days (%)"] || 0) >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`font-semibold ${getPercentageColor(
                      report["Volume Change 30 Days (%)"]
                    )}`}
                  >
                    {formatPercentage(report["Volume Change 30 Days (%)"])}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Pre-Post Δ 30D</span>
                <div className="flex items-center gap-1">
                  {(report["Volume Change Pre-Post 30 Days (%)"] || 0) >= 0 ? (
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
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

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
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Volume Δ 30D
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Pre-Post Δ 30D
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {metricsData.map((report, index) => (
              <React.Fragment key={`${ticker}-${report["Report Number"]}`}>
                <tr
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report["Report Number"]}
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
                    {report["Price on Release"]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      {(report["Volume Change 30 Days (%)"] || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`font-semibold ${getPercentageColor(
                          report["Volume Change 30 Days (%)"]
                        )}`}
                      >
                        {formatPercentage(report["Volume Change 30 Days (%)"])}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
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
                    <button
                      onClick={() =>
                        toggleRowExpansion(report["Report Number"])
                      }
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      {expandedRows.has(report["Report Number"]) ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRows.has(report["Report Number"]) && (
                  <tr className="bg-blue-50">
                    <td colSpan="7" className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Volume Metrics
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Avg Volume 5D:
                              </span>
                              <span className="text-sm font-medium">
                                {report[
                                  "Avg Volume Post 5 Days"
                                ]?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">
                                Avg Volume 10D:
                              </span>
                              <span className="text-sm font-medium">
                                {report[
                                  "Avg Volume Post 10 Days"
                                ]?.toLocaleString() || "0"}
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

      {/* Mobile Table */}
      <div className="lg:hidden">
        <CardView />
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
              Comprehensive analysis of {metricsData.length} report
              {metricsData.length !== 1 ? "s" : ""} performance
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cards
              </button>
            </div>

            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {metricsData.length} Reports
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
        {viewMode === "table" ? <TableView /> : <CardView />}
      </div>
    </div>
  );
}
