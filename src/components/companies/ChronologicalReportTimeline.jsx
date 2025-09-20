"use client";

import { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  PlayIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getChartData, getCompanyData } from "@/lib/api";

export default function ChronologicalReportTimeline({ ticker, className = "" }) {
  const [chartData, setChartData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // "cards" or "table"

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch both chart data and metrics data
        const [chartResponse, metricsResponse] = await Promise.all([
          getChartData(ticker),
          getCompanyData(ticker, "metrics")
        ]);

        if (chartResponse.error) {
          setError(chartResponse.message);
        } else if (chartResponse.success) {
          setChartData(chartResponse);
        }

        if (metricsResponse.success) {
          setMetricsData(metricsResponse);
        }
      } catch (err) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  // Create report entries based on real metrics data
  const generateReportEntries = () => {
    if (!metricsData || !metricsData.detailed_metrics) return [];

    const { detailed_metrics } = metricsData;

    // Sort by publication date to maintain chronological order
    const sortedMetrics = detailed_metrics.sort((a, b) =>
      new Date(a.publication_date) - new Date(b.publication_date)
    );

    const reports = sortedMetrics.map((metric, index) => {
      const frc30 = metric.frc_30_day_analysis;

      return {
        reportNumber: metric.report_id,
        date: metric.publication_date,
        title: metric.report_title,
        reportType: metric.report_type,
        isPdf: metric.is_pdf,

        // Real 30-day metrics from API
        priceOnRelease: frc30.price_on_release,
        volumeOnRelease: frc30.volume_on_release,
        priceAfter30Days: frc30.price_after_30_days,
        priceChange30d: frc30.price_change_30_days_pct,

        avgVolumeBefore: frc30.avg_volume_pre_30_days,
        avgVolumeAfter: frc30.avg_volume_post_30_days,
        volumeChange30d: frc30.volume_change_pre_post_30_days_pct,
        volumeSpike30d: frc30.volume_spike_30_days_pct,

        // Additional metrics available
        window5Days: metric.window_5_days,
        window10Days: metric.window_10_days,
        volatility: metric.volatility_analysis,
        frc15: metric.frc_15_day_analysis,

        isFirst: index === 0,
        isLatest: index === sortedMetrics.length - 1,
      };
    });

    return reports;
  };

  const reportEntries = generateReportEntries();

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {error.includes("404") ? "Report timeline not available yet" : error}
          </p>
        </div>
      </div>
    );
  }

  if (!reportEntries.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No reports published yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Performance Metrics</h3>
              <p className="text-sm text-gray-600">Comprehensive analysis of {reportEntries.length} report performance</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{reportEntries.length}</div>
            <div className="text-xs text-gray-500">Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">Export CSV</div>
            <div className="text-xs text-gray-500">Download</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {chartData?.reports_coverage?.date_span_days || 0}
            </div>
            <div className="text-xs text-gray-500">Days Coverage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {reportEntries.length > 0 ? Math.round(reportEntries.reduce((sum, r) => sum + (r.priceChange30d || 0), 0) / reportEntries.length * 100) / 100 : 0}%
            </div>
            <div className="text-xs text-gray-500">Avg Impact</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "table" ? (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    30 Days Before
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    30 Days After
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact Change
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Additional Metrics
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportEntries.map((report) => (
                  <tr key={report.reportNumber} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900 mb-1">{report.title}</div>
                        <div className="text-xs text-gray-500">
                          📅 {new Date(report.date).toLocaleDateString()} • 🔢 Report #{report.reportNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="space-y-1">
                        <div className="text-gray-900 font-medium">
                          ${report.priceOnRelease?.toFixed(2) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Vol: {report.avgVolumeBefore ? formatVolume(report.avgVolumeBefore) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="space-y-1">
                        <div className="text-gray-900 font-medium">
                          ${report.priceAfter30Days?.toFixed(2) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Vol: {report.avgVolumeAfter ? formatVolume(report.avgVolumeAfter) : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="space-y-1">
                        <div className={`font-medium ${report.priceChange30d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(report.priceChange30d)}
                        </div>
                        <div className={`text-xs ${report.volumeChange30d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Vol: {formatPercent(report.volumeChange30d)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">5d Impact</div>
                        <div className={`text-xs font-medium ${(report.window5Days?.price_impact_pct || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(report.window5Days?.price_impact_pct || 0)}
                        </div>
                        <div className="text-xs text-gray-500">Volatility</div>
                        <div className="text-xs text-gray-600">
                          {report.volatility?.annualized_volatility_pct?.toFixed(1) || 'N/A'}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="space-y-4">
            {reportEntries.map((report) => (
              <div key={report.reportNumber} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      report.isFirst ? 'bg-green-100' :
                      report.isLatest ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {report.isFirst ? (
                        <PlayIcon className="h-5 w-5 text-green-600" />
                      ) : report.isLatest ? (
                        <CheckCircleIcon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          Report #{report.reportNumber}
                        </span>
                        {report.isFirst && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            First Coverage
                          </span>
                        )}
                      </div>

                      <h4 className="font-medium text-gray-900 mb-2">
                        {report.title}
                      </h4>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>📅 {new Date(report.date).toLocaleDateString()}</span>
                        <span>🔢 Report #{report.reportNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500">Before</div>
                      <div className="text-sm text-gray-900">${report.priceOnRelease?.toFixed(2) || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Vol: {report.avgVolumeBefore ? formatVolume(report.avgVolumeBefore) : 'N/A'}</div>

                      <div className="border-t pt-2">
                        <div className="text-xs text-gray-500">After</div>
                        <div className="text-sm text-gray-900">${report.priceAfter30Days?.toFixed(2) || 'N/A'}</div>
                        <div className="text-xs text-gray-500">Vol: {report.avgVolumeAfter ? formatVolume(report.avgVolumeAfter) : 'N/A'}</div>
                      </div>

                      <div className="border-t pt-2">
                        <div className={`text-sm font-medium ${report.priceChange30d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercent(report.priceChange30d)}
                        </div>
                        <div className={`text-xs ${report.volumeChange30d > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          Vol: {formatPercent(report.volumeChange30d)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Timeline */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <strong>{report.title}</strong>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>📅 {new Date(report.date).toLocaleDateString()} • 🔢 Report #{report.reportNumber}</span>
                    <span>30-day impact: {formatPercent(report.priceChange30d)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="text-sm text-gray-600 text-center">
          <span className="font-medium text-gray-900">{reportEntries.length}</span> reports published from{" "}
          <span className="font-medium text-gray-900">
            {reportEntries.length > 0 ? new Date(reportEntries[0].date).toLocaleDateString() : 'N/A'}
          </span> to{" "}
          <span className="font-medium text-gray-900">
            {reportEntries.length > 0 ? new Date(reportEntries[reportEntries.length - 1].date).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
}