"use client";

import React from "react";

const CompanyMetrics = ({ ticker, metrics, currency, totalReports }) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <p className="text-gray-500">No metrics data available</p>
      </div>
    );
  }

  // Calculate average performance
  const avgPriceChange =
    metrics.reduce((sum, m) => sum + (m.price_change_percentage || 0), 0) /
    metrics.length;
  const avgVolumeChange =
    metrics.reduce((sum, m) => sum + (m.volume_change_percentage || 0), 0) /
    metrics.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Reports</div>
          <div className="text-2xl font-bold text-blue-700">
            {totalReports || metrics.length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">
            Avg Price Change
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
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">
            Avg Volume Change
          </div>
          <div
            className={`text-2xl font-bold ${
              avgVolumeChange >= 0 ? "text-purple-700" : "text-red-700"
            }`}
          >
            {avgVolumeChange >= 0 ? "+" : ""}
            {avgVolumeChange.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-900">
                Report
              </th>
              <th className="text-left py-2 font-medium text-gray-900">Date</th>
              <th className="text-right py-2 font-medium text-gray-900">
                Before ({currency})
              </th>
              <th className="text-right py-2 font-medium text-gray-900">
                After 30d ({currency})
              </th>
              <th className="text-right py-2 font-medium text-gray-900">
                Price Change
              </th>
              <th className="text-right py-2 font-medium text-gray-900">
                Volume Change
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3">
                  <div className="font-medium text-gray-900 truncate max-w-48">
                    {metric.report_title || `Report ${index + 1}`}
                  </div>
                </td>
                <td className="py-3 text-gray-600">
                  {metric.published_date
                    ? new Date(metric.published_date).toLocaleDateString()
                    : "N/A"}
                </td>
                <td className="py-3 text-right font-mono">
                  {metric.price_before_report?.toFixed(2) || "N/A"}
                </td>
                <td className="py-3 text-right font-mono">
                  {metric.price_after_30_days?.toFixed(2) || "N/A"}
                </td>
                <td
                  className={`py-3 text-right font-semibold ${
                    (metric.price_change_percentage || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(metric.price_change_percentage || 0) >= 0 ? "+" : ""}
                  {metric.price_change_percentage?.toFixed(1) || "N/A"}%
                </td>
                <td
                  className={`py-3 text-right font-semibold ${
                    (metric.volume_change_percentage || 0) >= 0
                      ? "text-blue-600"
                      : "text-orange-600"
                  }`}
                >
                  {(metric.volume_change_percentage || 0) >= 0 ? "+" : ""}
                  {metric.volume_change_percentage?.toFixed(1) || "N/A"}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyMetrics;
