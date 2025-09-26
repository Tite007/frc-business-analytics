"use client";

import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

// Tooltip component for information display
const InfoTooltip = ({ title, formula, explanation }) => {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-3 w-3 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-80 max-w-96">
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
        {/* Tooltip arrow pointing up */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900"></div>
      </div>
    </div>
  );
};

const CompanyMetrics = ({ ticker, metrics, currency, totalReports, onReportSelect }) => {
  const [selectedReports, setSelectedReports] = React.useState(new Set());

  const handleReportClick = (reportData) => {
    const reportId = reportData.chronologicalOrder;
    const newSelectedReports = new Set(selectedReports);

    if (selectedReports.has(reportId)) {
      newSelectedReports.delete(reportId);
    } else {
      newSelectedReports.add(reportId);
    }

    setSelectedReports(newSelectedReports);

    // Call parent callback with selected report data
    if (onReportSelect) {
      onReportSelect({
        id: reportId,
        date: reportData["Publication Date"],
        title: reportData["Report Title"],
        reportNumber: reportData["Report Number"],
        isSelected: newSelectedReports.has(reportId),
        selectedReports: Array.from(newSelectedReports)
      });
    }
  };

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
            {selectedReports.size > 0 && (
              <button
                onClick={() => {
                  setSelectedReports(new Set());
                  if (onReportSelect) {
                    onReportSelect({
                      selectedReports: [],
                      clearAll: true
                    });
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              >
                Clear Selection ({selectedReports.size})
              </button>
            )}
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
              <div className="text-sm text-blue-600 font-medium flex items-center justify-center gap-1">
                Total Reports
                <InfoTooltip
                  title="Total Research Reports"
                  formula="COUNT = Total number of reports published"
                  explanation="We count all FRC research reports published for this company over the analysis period. Each report represents ongoing coverage and analysis by our research team."
                />
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
                className={`text-sm font-medium flex items-center justify-center gap-1 ${
                  avgPriceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                Avg Price Impact
                <InfoTooltip
                  title="30-Day Price Impact"
                  formula="Average % = (Price after 30 days - Price at publication) ÷ Price at publication × 100"
                  explanation="We calculate the percentage price change from when each report was published to 30 days later, then average all results. Shows how our research timing aligns with stock movements."
                />
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
              <div className="text-sm text-orange-600 font-medium flex items-center justify-center gap-1">
                Avg Volume Change
                <InfoTooltip
                  title="30-Day Volume Impact"
                  formula="Volume Change % = (Volume after 30 days - Volume before) ÷ Volume before × 100"
                  explanation="We measure the percentage change in trading volume from 30 days before our report to 30 days after, then average across all reports. Positive values show increased market interest."
                />
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-800">
                {avgVolumeSpike.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600 font-medium flex items-center justify-center gap-1">
                Avg Volume Spike
                <InfoTooltip
                  title="5-Day Volume Spike"
                  formula="Volume Spike % = (Peak 5-day volume - Average volume) ÷ Average volume × 100"
                  explanation="We identify the highest trading volume spike within 5 days of publication compared to normal trading levels. Shows immediate market reaction to our research."
                />
              </div>
            </div>
          </div>

          {/* Simple Overview Table */}
          <div className="overflow-x-auto relative">
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
                    <div className="flex items-center justify-center gap-1">
                      30 Days Before
                      <InfoTooltip
                        title="Pre-Publication Baseline"
                        formula="Baseline = Stock price at publication date + Average daily volume 30 days prior"
                        explanation="Shows the market conditions before our research was published, including stock price on release date and average trading volume during the 30-day period before publication."
                      />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      30 Days After
                      <InfoTooltip
                        title="Post-Publication Results"
                        formula="Results = Stock price 30 days later + Average daily volume 30 days after"
                        explanation="Shows market conditions 30 days after our research publication, including final stock price and average trading volume during the post-publication period."
                      />
                    </div>
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-1">
                      Impact Change
                      <InfoTooltip
                        title="Research Impact Metrics"
                        formula="Price Change = (Final Price - Initial Price) ÷ Initial Price × 100\nVolume Change = (Post Volume - Pre Volume) ÷ Pre Volume × 100"
                        explanation="Measures the direct impact of our research by comparing price and volume changes over the 30-day analysis period. Green indicates positive price movement, blue shows volume increases."
                      />
                    </div>
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

                  const isSelected = selectedReports.has(report.chronologicalOrder);

                  return (
                    <tr
                      key={index}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-50 hover:bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleReportClick(report)}
                    >
                      <td className="border border-gray-300 px-3 py-3 text-center">
                        <div className={`font-bold text-lg relative ${
                          isSelected ? 'text-blue-700' : 'text-blue-600'
                        }`}>
                          {report.chronologicalOrder}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
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
