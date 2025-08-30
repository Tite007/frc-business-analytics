"use client";

import React, { useState } from "react";

const CompanyMetrics = ({ ticker, metrics, currency, totalReports }) => {
  const [viewMode, setViewMode] = useState("overview"); // 'overview' or 'detailed'

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

  // Calculate statistics
  const avgPriceChange =
    metrics.reduce((sum, m) => sum + (m["Price Change 30 Days (%)"] || 0), 0) /
    metrics.length;

  const avgVolumeChange =
    metrics.reduce((sum, m) => sum + (m["Volume Change 30 Days (%)"] || 0), 0) /
    metrics.length;

  const avgVolumeSpike =
    metrics.reduce(
      (sum, m) => sum + Math.abs(m["Volume Spike 5 Days (%)"] || 0),
      0
    ) / metrics.length;

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
              onClick={() => setViewMode("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "overview"
                  ? "bg-white text-blue-700 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setViewMode("detailed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "detailed"
                  ? "bg-white text-blue-700 shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-400"
              }`}
            >
              🔍 Detailed
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === "overview" ? (
          // Overview Mode - Summary Cards + Simple Table
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">
                  {metrics.length}
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
                    <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Report Details
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Price Impact (30d)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Volume Change (30d)
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Volume Spike (5d)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((report, index) => (
                    <tr key={index} className="hover:bg-gray-50">
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
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (report["Price Change 30 Days (%)"] || 0) >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(report["Price Change 30 Days (%)"] || 0) >= 0
                            ? "+"
                            : ""}
                          {(report["Price Change 30 Days (%)"] || 0).toFixed(1)}
                          %
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            (report["Volume Change 30 Days (%)"] || 0) >= 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(report["Volume Change 30 Days (%)"] || 0) >= 0
                            ? "+"
                            : ""}
                          {(report["Volume Change 30 Days (%)"] || 0).toFixed(
                            1
                          )}
                          %
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          +
                          {Math.abs(
                            report["Volume Spike 5 Days (%)"] || 0
                          ).toFixed(1)}
                          %
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Detailed Mode - Comprehensive Data Table
          <div className="space-y-6">
            {metrics.map((report, index) => (
              <div
                key={index}
                className="border border-gray-300 rounded-lg overflow-hidden"
              >
                {/* Report Header */}
                <div className="bg-gray-100 p-4 border-b border-gray-300">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {report["Report Title"] || `Report ${index + 1}`}
                  </h4>
                  <div className="text-sm text-gray-600">
                    📅{" "}
                    {new Date(report["Publication Date"]).toLocaleDateString()}{" "}
                    • 🔢 Report #{report["Report Number"] || index + 1}
                  </div>
                </div>

                {/* Price Analysis Table */}
                <div className="p-4 border-b border-gray-200">
                  <h5 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    💰 Price Analysis
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            Metric
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Value
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            Metric
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            Price on Release:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {report["Price on Release"] || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            After 30 Days:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {report["Price After 30 Days"] || "N/A"}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            After 90 Days:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {report["Price After 90 Days"] || "N/A"}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            90-Day Change:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                                (report["Price Change 90 Days (%)"] || 0) >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(report["Price Change 90 Days (%)"] || 0) >= 0
                                ? "+"
                                : ""}
                              {(
                                report["Price Change 90 Days (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-blue-50">
                            <strong>30-Day Change:</strong>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                (report["Price Change 30 Days (%)"] || 0) >= 0
                                  ? "bg-green-200 text-green-900"
                                  : "bg-red-200 text-red-900"
                              }`}
                            >
                              {(report["Price Change 30 Days (%)"] || 0) >= 0
                                ? "+"
                                : ""}
                              {(
                                report["Price Change 30 Days (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-blue-50">
                            <strong>90-Day Change:</strong>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center bg-blue-50">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                                (report["Price Change 90 Days (%)"] || 0) >= 0
                                  ? "bg-green-200 text-green-900"
                                  : "bg-red-200 text-red-900"
                              }`}
                            >
                              {(report["Price Change 90 Days (%)"] || 0) >= 0
                                ? "+"
                                : ""}
                              {(
                                report["Price Change 90 Days (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Volume Analysis Table */}
                <div className="p-4 border-b border-gray-200">
                  <h5 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    📊 Volume Analysis
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            Metric
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Value
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-700">
                            Metric
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            Volume on Release:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Volume on Release"] || 0
                            ).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            After 30 Days:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Volume After 30 Days"] || 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            5-Day Spike:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-purple-100 text-purple-800">
                              +
                              {Math.abs(
                                report["Volume Spike 5 Days (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            30-Day Change:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                                (report["Volume Change 30 Days (%)"] || 0) >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(report["Volume Change 30 Days (%)"] || 0) >= 0
                                ? "+"
                                : ""}
                              {(
                                report["Volume Change 30 Days (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50">
                            Pre-Post 30d:
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
                                (report["Volume Change Pre Post 30d (%)"] ||
                                  0) >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {(report["Volume Change Pre Post 30d (%)"] ||
                                0) >= 0
                                ? "+"
                                : ""}
                              {(
                                report["Volume Change Pre Post 30d (%)"] || 0
                              ).toFixed(1)}
                              %
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-sm text-gray-600 bg-gray-50"></td>
                          <td className="border border-gray-300 px-3 py-2 text-center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detailed Volume Metrics Table */}
                <div className="p-4">
                  <h5 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    🔍 Detailed Volume Metrics
                  </h5>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Avg Pre 5 Days
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Avg Post 5 Days
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Avg Pre 30 Days
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700">
                            Avg Post 30 Days
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Avg Volume Pre 5 Days"] || 0
                            ).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Avg Volume Post 5 Days"] || 0
                            ).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Avg Volume Pre 30 Days"] || 0
                            ).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">
                            {(
                              report["Avg Volume Post 30 Days"] || 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyMetrics;
