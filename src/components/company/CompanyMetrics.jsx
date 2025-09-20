"use client";

import React from "react";

const CompanyMetrics = ({ ticker, metrics, currency, totalReports }) => {

  // Sort metrics by publication date (oldest first) and add chronological order
  const sortedMetrics = metrics ? [...metrics].sort((a, b) => {
    const dateA = new Date(a["Publication Date"]);
    const dateB = new Date(b["Publication Date"]);
    return dateA - dateB; // Ascending order (oldest first)
  }).map((report, index) => ({
    ...report,
    chronologicalOrder: index + 1 // Add chronological order starting from 1
  })) : [];

  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          Performance Analytics
        </h3>
        <div className="text-center py-12">
          <div className="text-gray-300 text-6xl mb-4">📊</div>
          <p className="text-gray-500 text-lg">No metrics data available</p>
        </div>
      </div>
    );
  }

  // Calculate statistics using sorted metrics
  const avgPriceChange =
    sortedMetrics.reduce((sum, m) => sum + (m["Price Change 30 Days (%)"] || 0), 0) /
    sortedMetrics.length;

  const avgVolumeChange =
    sortedMetrics.reduce((sum, m) => sum + (m["Volume Change 30 Days (%)"] || 0), 0) /
    sortedMetrics.length;

  const avgVolumeSpike =
    sortedMetrics.reduce(
      (sum, m) => sum + Math.abs(m["Volume Spike 5 Days (%)"] || 0),
      0
    ) / sortedMetrics.length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
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
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-blue-700 shadow-md"
            >
              📊 Overview
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Mode - Summary Cards + Simple Table */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-800">
                {sortedMetrics.length}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Total Reports
              </div>
            </div>
            <div
              className={`text-center p-4 rounded-lg border ${
                avgPriceChange >= 0
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div
                className={`text-2xl font-bold ${
                  avgPriceChange >= 0 ? "text-green-800" : "text-red-800"
                }`}
              >
                {avgPriceChange >= 0 ? "+" : ""}
                {avgPriceChange.toFixed(1)}%
              </div>
              <div
                className={`text-sm font-medium ${
                  avgPriceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Avg Price Impact
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div
                className={`text-2xl font-bold ${
                  avgVolumeChange >= 0 ? "text-green-800" : "text-red-800"
                }`}
              >
                {avgVolumeChange >= 0 ? "+" : ""}
                {avgVolumeChange.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-600 font-medium">
                Avg Volume Change
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-800">
                {avgVolumeSpike.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600 font-medium">
                Avg Volume Spike
              </div>
            </div>
          </div>

          {/* Simple Overview Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-3 text-center text-sm font-semibold text-gray-700">
                    #
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Report Details
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    30 Days Before
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    30 Days After
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Impact Change
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.map((report, index) => {
                  // Access the raw report data that includes frc_30_day_analysis
                  const rawReport = report._raw || report;
                  const frc30 = rawReport.frc_30_day_analysis || {};

                  // Use the raw API data first, then fall back to transformed data
                  const priceOnRelease = frc30.price_on_release || report["Price on Release"] || 0;
                  const priceAfter30Days = frc30.price_after_30_days || report["Price After 30 Days"] || 0;
                  const priceChange30d = frc30.price_change_30_days_pct || report["Price Change 30 Days (%)"] || 0;
                  const volumeChange30d = frc30.volume_change_pre_post_30_days_pct || frc30.volume_change_30_days_pct || report["Volume Change 30 Days (%)"] || 0;
                  const preAvgVolume = frc30.avg_volume_pre_30_days || report["Avg Volume Pre 30 Days"] || 0;
                  const postAvgVolume = frc30.avg_volume_post_30_days || report["Avg Volume Post 30 Days"] || 0;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-3 text-center">
                        <div className="font-bold text-lg text-blue-600">
                          {report.chronologicalOrder}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-medium text-gray-900 mb-1">
                          {report["Report Title"] || `Report ${index + 1}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          📅{" "}
                          {new Date(
                            report["Publication Date"]
                          ).toLocaleDateString()}{" "}
                          • 🔢 Report #{report["Report Number"] || index + 1}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">Price on release</div>
                        <div className="font-semibold text-gray-900 mb-2">
                          ${typeof priceOnRelease === 'number' ? priceOnRelease.toFixed(2) : priceOnRelease}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Pre-30d avg volume</div>
                        <div className="text-sm font-medium text-blue-600">
                          {typeof preAvgVolume === 'number' ? preAvgVolume.toLocaleString() : preAvgVolume}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <div className="text-xs text-gray-500 mb-1">Price after 30 days</div>
                        <div className="font-semibold text-gray-900 mb-2">
                          ${typeof priceAfter30Days === 'number' ? priceAfter30Days.toFixed(2) : priceAfter30Days}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Post-30d avg volume</div>
                        <div className="text-sm font-medium text-blue-600">
                          {typeof postAvgVolume === 'number' ? postAvgVolume.toLocaleString() : postAvgVolume}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500">Price Change</div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              priceChange30d >= 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {priceChange30d >= 0 ? "+" : ""}
                            {typeof priceChange30d === 'number' ? priceChange30d.toFixed(1) : priceChange30d}%
                          </span>
                          <div className="text-xs text-gray-500">Volume Change</div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              volumeChange30d >= 0
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {volumeChange30d >= 0 ? "+" : ""}
                            {typeof volumeChange30d === 'number' ? volumeChange30d.toFixed(1) : volumeChange30d}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyMetrics;
