"use client";

import React, { useState } from "react";

const CompanyMetrics = ({ ticker, metrics, currency, totalReports }) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState("overview"); // 'overview' or 'detailed'

  // Debug logging
  console.log("CompanyMetrics received:", {
    ticker,
    metrics,
    currency,
    totalReports,
  });

  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Performance Metrics
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No metrics data available</p>
        </div>
      </div>
    );
  }

  // Calculate comprehensive statistics
  const avgPriceChange =
    metrics.reduce(
      (sum, m) =>
        sum + (m["Price Change 30 Days (%)"] || m.price_change_percentage || 0),
      0
    ) / metrics.length;
  const avgVolumeChange =
    metrics.reduce(
      (sum, m) =>
        sum +
        (m["Volume Change 30 Days (%)"] || m.volume_change_percentage || 0),
      0
    ) / metrics.length;

  const bestPerformingReport = metrics.reduce((best, current) =>
    (current["Price Change 30 Days (%)"] || 0) >
    (best["Price Change 30 Days (%)"] || 0)
      ? current
      : best
  );

  const totalVolumeSpike =
    metrics.reduce(
      (sum, m) => sum + Math.abs(m["Volume Spike 5 Days (%)"] || 0),
      0
    ) / metrics.length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Performance Analytics
            </h3>
            <p className="text-blue-100">
              Comprehensive report impact analysis for {ticker}
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => setViewMode("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "overview"
                  ? "bg-white text-blue-600 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "detailed"
                  ? "bg-white text-blue-600 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              🔍 Detailed
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-emerald-700 mb-1">
                  Total Reports
                </div>
                <div className="text-2xl font-bold text-emerald-800">
                  {totalReports || metrics.length}
                </div>
              </div>
              <div className="text-3xl text-emerald-600">📈</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">
                  Avg Price Impact
                </div>
                <div
                  className={`text-2xl font-bold ${
                    avgPriceChange >= 0 ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {avgPriceChange >= 0 ? "+" : ""}
                  {avgPriceChange.toFixed(1)}%
                </div>
              </div>
              <div
                className={`text-3xl ${
                  avgPriceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {avgPriceChange >= 0 ? "📈" : "📉"}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-purple-700 mb-1">
                  Avg Volume Change
                </div>
                <div
                  className={`text-2xl font-bold ${
                    avgVolumeChange >= 0 ? "text-purple-700" : "text-orange-700"
                  }`}
                >
                  {avgVolumeChange >= 0 ? "+" : ""}
                  {avgVolumeChange.toFixed(1)}%
                </div>
              </div>
              <div className="text-3xl text-purple-600">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-amber-700 mb-1">
                  Avg Volume Spike
                </div>
                <div className="text-2xl font-bold text-amber-800">
                  {totalVolumeSpike.toFixed(1)}%
                </div>
              </div>
              <div className="text-3xl text-amber-600">⚡</div>
            </div>
          </div>
        </div>

        {viewMode === "overview" ? (
          /* Overview Mode - Summary Table */
          <div className="overflow-x-auto">
            <div className="bg-gray-50 rounded-xl p-1">
              <table className="w-full">
                <thead>
                  <tr className="bg-white rounded-lg">
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">
                      Report
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-gray-800">
                      Date
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-800">
                      Price Before
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-800">
                      Price After 30d
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-800">
                      Price Impact
                    </th>
                    <th className="text-right py-4 px-4 font-semibold text-gray-800">
                      Volume Impact
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-800">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {metrics.map((metric, index) => (
                    <tr
                      key={index}
                      className="bg-white hover:bg-blue-50 transition-colors rounded-lg"
                    >
                      <td className="py-4 px-6 rounded-l-lg">
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 text-sm leading-tight">
                            {metric["Report Title"] ||
                              metric.report_title ||
                              `Report ${index + 1}`}
                          </div>
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Report #{metric["Report Number"] || index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {metric["Publication Date"] || metric.published_date
                          ? new Date(
                              metric["Publication Date"] ||
                                metric.published_date
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-sm">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {metric["Price on Release"] ||
                          metric.price_before_report
                            ? typeof metric["Price on Release"] === "string"
                              ? metric["Price on Release"]
                              : `${currency} ${parseFloat(
                                  metric["Price on Release"] ||
                                    metric.price_before_report
                                ).toFixed(2)}`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-sm">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {metric["Price After 30 Days"] ||
                          metric.price_after_30_days
                            ? typeof metric["Price After 30 Days"] === "string"
                              ? metric["Price After 30 Days"]
                              : `${currency} ${parseFloat(
                                  metric["Price After 30 Days"] ||
                                    metric.price_after_30_days
                                ).toFixed(2)}`
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            (metric["Price Change 30 Days (%)"] ||
                              metric.price_change_percentage ||
                              0) >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(metric["Price Change 30 Days (%)"] ||
                            metric.price_change_percentage ||
                            0) >= 0
                            ? "↗"
                            : "↘"}
                          {(metric["Price Change 30 Days (%)"] ||
                            metric.price_change_percentage ||
                            0) >= 0
                            ? "+"
                            : ""}
                          {(
                            metric["Price Change 30 Days (%)"] ||
                            metric.price_change_percentage
                          )?.toFixed(1) || "N/A"}
                          %
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                            (metric["Volume Change 30 Days (%)"] ||
                              metric.volume_change_percentage ||
                              0) >= 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {(metric["Volume Change 30 Days (%)"] ||
                            metric.volume_change_percentage ||
                            0) >= 0
                            ? "📈"
                            : "📉"}
                          {(metric["Volume Change 30 Days (%)"] ||
                            metric.volume_change_percentage ||
                            0) >= 0
                            ? "+"
                            : ""}
                          {(
                            metric["Volume Change 30 Days (%)"] ||
                            metric.volume_change_percentage
                          )?.toFixed(1) || "N/A"}
                          %
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center rounded-r-lg">
                        <button
                          onClick={() => setSelectedReport(metric)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Detailed Mode - Comprehensive Analysis */
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">
                        {metric["Report Title"] ||
                          metric.report_title ||
                          `Report ${index + 1}`}
                      </h4>
                      <div className="flex items-center space-x-4 text-blue-100 text-sm">
                        <span>
                          📅{" "}
                          {new Date(
                            metric["Publication Date"] || metric.published_date
                          ).toLocaleDateString()}
                        </span>
                        <span>
                          🔢 Report #{metric["Report Number"] || index + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Price Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        💰 Price Analysis
                      </h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Price on Release:
                          </span>
                          <span className="font-mono font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded">
                            {metric["Price on Release"] || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            After 30 Days:
                          </span>
                          <span className="font-mono font-semibold bg-green-100 text-green-800 px-3 py-1 rounded">
                            {metric["Price After 30 Days"] || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            After 90 Days:
                          </span>
                          <span className="font-mono font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded">
                            {metric["Price After 90 Days"] || "N/A"}
                          </span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                30-Day Change
                              </div>
                              <div
                                className={`text-lg font-bold ${
                                  (metric["Price Change 30 Days (%)"] || 0) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(metric["Price Change 30 Days (%)"] || 0) >= 0
                                  ? "+"
                                  : ""}
                                {metric["Price Change 30 Days (%)"]?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 mb-1">
                                90-Day Change
                              </div>
                              <div
                                className={`text-lg font-bold ${
                                  (metric["Price Change 90 Days (%)"] || 0) >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {(metric["Price Change 90 Days (%)"] || 0) >= 0
                                  ? "+"
                                  : ""}
                                {metric["Price Change 90 Days (%)"]?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Volume Analysis */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        📊 Volume Analysis
                      </h5>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Volume on Release:
                          </span>
                          <span className="font-mono font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded">
                            {(
                              metric["Volume on Release"] || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            After 30 Days:
                          </span>
                          <span className="font-mono font-semibold bg-green-100 text-green-800 px-3 py-1 rounded">
                            {(
                              metric["Volume After 30 Days"] || 0
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                5-Day Spike:
                              </span>
                              <span
                                className={`font-semibold px-2 py-1 rounded text-xs ${
                                  (metric["Volume Spike 5 Days (%)"] || 0) >= 0
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {(metric["Volume Spike 5 Days (%)"] || 0) >= 0
                                  ? "+"
                                  : ""}
                                {metric["Volume Spike 5 Days (%)"]?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                30-Day Change:
                              </span>
                              <span
                                className={`font-semibold px-2 py-1 rounded text-xs ${
                                  (metric["Volume Change 30 Days (%)"] || 0) >=
                                  0
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {(metric["Volume Change 30 Days (%)"] || 0) >= 0
                                  ? "+"
                                  : ""}
                                {metric["Volume Change 30 Days (%)"]?.toFixed(
                                  1
                                ) || "N/A"}
                                %
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                Pre-Post 30d:
                              </span>
                              <span
                                className={`font-semibold px-2 py-1 rounded text-xs ${
                                  (metric[
                                    "Volume Change Pre-Post 30 Days (%)"
                                  ] || 0) >= 0
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {(metric[
                                  "Volume Change Pre-Post 30 Days (%)"
                                ] || 0) >= 0
                                  ? "+"
                                  : ""}
                                {metric[
                                  "Volume Change Pre-Post 30 Days (%)"
                                ]?.toFixed(1) || "N/A"}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Volume Metrics */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-5">
                    <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      🔍 Detailed Volume Metrics
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Avg Pre 5 Days
                        </div>
                        <div className="text-sm font-mono font-semibold text-gray-700">
                          {(
                            metric["Avg Volume Pre 5 Days"] || 0
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Avg Post 5 Days
                        </div>
                        <div className="text-sm font-mono font-semibold text-gray-700">
                          {(
                            metric["Avg Volume Post 5 Days"] || 0
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Avg Pre 30 Days
                        </div>
                        <div className="text-sm font-mono font-semibold text-gray-700">
                          {(
                            metric["Avg Volume Pre 30 Days"] || 0
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          Avg Post 30 Days
                        </div>
                        <div className="text-sm font-mono font-semibold text-gray-700">
                          {(
                            metric["Avg Volume Post 30 Days"] || 0
                          ).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Best Performing Report Highlight */}
        <div className="mt-8 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
            🏆 Best Performing Report
          </h4>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold text-emerald-900 mb-1">
                {bestPerformingReport["Report Title"] || "N/A"}
              </div>
              <div className="text-sm text-emerald-700">
                Published:{" "}
                {new Date(
                  bestPerformingReport["Publication Date"]
                ).toLocaleDateString()}{" "}
                • Report #{bestPerformingReport["Report Number"]}
              </div>
            </div>
            <div className="mt-3 md:mt-0">
              <span className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold">
                +{bestPerformingReport["Price Change 30 Days (%)"]?.toFixed(1)}%
                Price Impact
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedReport["Report Title"]}
                  </h3>
                  <p className="text-blue-100">
                    Published:{" "}
                    {new Date(
                      selectedReport["Publication Date"]
                    ).toLocaleDateString()}{" "}
                    • Report #{selectedReport["Report Number"]}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-white hover:bg-blue-500 rounded-lg p-2 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Detailed content would go here */}
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p>Detailed report analysis coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyMetrics;
