"use client";

import { useState } from "react";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function PerformanceAnalyticsTable({
  metricsData,
  companyData,
  ticker,
  className = ""
}) {
  const [activeView, setActiveView] = useState("overview");

  // Calculate summary metrics from the data
  const calculateSummaryMetrics = () => {
    if (!metricsData || metricsData.length === 0) {
      return {
        totalReports: 0,
        avgPriceImpact: 0,
        avgVolumeChange: 0,
        avgVolumeSpike: 0
      };
    }

    const totalReports = metricsData.length;

    // Calculate price impact (try multiple field name variants)
    const priceImpacts = metricsData.map(report => {
      return report["Price Change 30 Days (%)"] ||
             report["Volume Change 30 Days (%)"] ||
             report["Price Impact"] ||
             0;
    }).filter(val => val !== null && val !== undefined);

    // Calculate volume changes
    const volumeChanges = metricsData.map(report => {
      const pre = report["Avg Volume Pre 30 Days"] || report["Pre Volume"] || 0;
      const post = report["Avg Volume Post 30 Days"] || report["Post Volume"] || 0;
      return pre > 0 ? ((post - pre) / pre) * 100 : 0;
    }).filter(val => val !== null && val !== undefined);

    // Calculate volume spikes (highest single-day impact)
    const volumeSpikes = metricsData.map(report => {
      return report["Volume Spike %"] ||
             report["Max Volume Change"] ||
             Math.abs(volumeChanges[metricsData.indexOf(report)] || 0);
    }).filter(val => val !== null && val !== undefined);

    const avgPriceImpact = priceImpacts.length > 0
      ? priceImpacts.reduce((sum, val) => sum + val, 0) / priceImpacts.length
      : 0;

    const avgVolumeChange = volumeChanges.length > 0
      ? volumeChanges.reduce((sum, val) => sum + val, 0) / volumeChanges.length
      : 0;

    const avgVolumeSpike = volumeSpikes.length > 0
      ? volumeSpikes.reduce((sum, val) => sum + val, 0) / volumeSpikes.length
      : 0;

    return {
      totalReports,
      avgPriceImpact,
      avgVolumeChange,
      avgVolumeSpike
    };
  };

  const metrics = calculateSummaryMetrics();

  const formatPercentage = (value) => {
    const formatted = value.toFixed(1);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const getPercentageColor = (value) => {
    if (value > 0) return "text-green-600";
    if (value < 0) return "text-red-600";
    return "text-gray-600";
  };

  const formatReportData = (report, index) => {
    const reportNum = report["Report Number"] || index + 1;
    const title = report["Report Title"] || "Report";
    const pubDate = report["Publication Date"] || report["Date"] || "";
    const priceOnRelease = report["Price on Release"] || report["Release Price"] || 0;

    // Volume data
    const preVolume = report["Avg Volume Pre 30 Days"] || report["Pre Volume"] || 0;
    const postVolume = report["Avg Volume Post 30 Days"] || report["Post Volume"] || 0;

    // Price data - purely from API, no calculations
    const priceAfter30 = report["Price After 30 Days"] ||
                         report["Price Post 30 Days"] ||
                         priceOnRelease; // Use release price as fallback only

    // Calculate changes
    const priceChange = priceOnRelease > 0
      ? ((priceAfter30 - priceOnRelease) / priceOnRelease) * 100
      : 0;
    const volumeChange = preVolume > 0
      ? ((postVolume - preVolume) / preVolume) * 100
      : 0;

    return {
      number: reportNum,
      title,
      date: pubDate,
      priceOnRelease: priceOnRelease,
      preVolume,
      priceAfter30,
      postVolume,
      priceChange,
      volumeChange
    };
  };

  const formatVolume = (volume) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toLocaleString();
  };

  const formatCurrency = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            <p className="text-sm text-gray-600">
              Comprehensive report impact analysis for {ticker}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveView("overview")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === "overview"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveView("detailed")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === "detailed"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🔍 Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      {activeView === "overview" && (
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalReports}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className={`text-2xl font-bold ${getPercentageColor(metrics.avgPriceImpact)}`}>
                {formatPercentage(metrics.avgPriceImpact)}
              </div>
              <div className="text-sm text-gray-600">Avg Price Impact</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className={`text-2xl font-bold ${getPercentageColor(metrics.avgVolumeChange)}`}>
                {formatPercentage(metrics.avgVolumeChange)}
              </div>
              <div className="text-sm text-gray-600">Avg Volume Change</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {formatPercentage(metrics.avgVolumeSpike)}
              </div>
              <div className="text-sm text-gray-600">Avg Volume Spike</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Table Section */}
      {activeView === "detailed" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  30 Days Before
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  30 Days After
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metricsData && metricsData.map((report, index) => {
                const data = formatReportData(report, index);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Report Number */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-blue-600">{data.number}</div>
                    </td>

                    {/* Report Details */}
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {data.title}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(data.date)}
                          <span>•</span>
                          <DocumentTextIcon className="h-3 w-3" />
                          Report #{data.number}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Price on release: {formatCurrency(data.priceOnRelease)}
                        </div>
                      </div>
                    </td>

                    {/* 30 Days Before */}
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-1">
                        <div className="text-gray-500">Pre-30d avg volume</div>
                        <div className="font-medium text-gray-900">{formatVolume(data.preVolume)}</div>
                      </div>
                    </td>

                    {/* 30 Days After */}
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-1">
                        <div className="text-gray-500">Price after 30 days</div>
                        <div className="font-medium text-gray-900">{formatCurrency(data.priceAfter30)}</div>
                        <div className="text-gray-500">Post-30d avg volume</div>
                        <div className="font-medium text-gray-900">{formatVolume(data.postVolume)}</div>
                      </div>
                    </td>

                    {/* Impact Changes */}
                    <td className="px-4 py-4">
                      <div className="text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Price Change</span>
                          <span className={`font-bold ${getPercentageColor(data.priceChange)}`}>
                            {formatPercentage(data.priceChange)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Volume Change</span>
                          <span className={`font-bold ${getPercentageColor(data.volumeChange)}`}>
                            {formatPercentage(data.volumeChange)}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!metricsData || metricsData.length === 0) && (
            <div className="text-center py-12">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h4>
              <p className="text-gray-600">
                Performance analytics will be available once report data is loaded.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}