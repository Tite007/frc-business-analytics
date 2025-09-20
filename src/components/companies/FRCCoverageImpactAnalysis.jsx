"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { getChartData } from "@/lib/api";

export default function FRCCoverageImpactAnalysis({ ticker, className = "" }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);
        const response = await getChartData(ticker);

        if (response.error) {
          setError(response.message);
        } else if (response.success) {
          setChartData(response);
        }
      } catch (err) {
        setError(`Failed to load chart data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchChartData();
    }
  }, [ticker]);

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
            {error.includes("404") ? "Chart data not available yet" : error}
          </p>
        </div>
      </div>
    );
  }

  if (!chartData || !chartData.chart_data || !chartData.reports_coverage) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No chart data available for analysis</p>
        </div>
      </div>
    );
  }

  const { chart_data, reports_coverage, total_data_points, date_range } = chartData;

  // Calculate actual performance metrics from real data
  const calculateRealMetrics = () => {
    if (!chart_data || chart_data.length === 0) return null;

    // Find the first report date to determine pre/post periods
    const firstReportDate = new Date(reports_coverage.oldest_report);
    const lastReportDate = new Date(reports_coverage.newest_report);

    // Split data into pre and post coverage periods
    const preReportData = chart_data.filter(d => new Date(d.date) < firstReportDate);
    const postReportData = chart_data.filter(d => new Date(d.date) >= firstReportDate);

    if (preReportData.length === 0 || postReportData.length === 0) {
      return null;
    }

    // Calculate pre-report averages
    const preAvgVolume = preReportData.reduce((sum, d) => sum + d.volume, 0) / preReportData.length;
    const preAvgPrice = preReportData.reduce((sum, d) => sum + d.price, 0) / preReportData.length;

    // Calculate post-report averages
    const postAvgVolume = postReportData.reduce((sum, d) => sum + d.volume, 0) / postReportData.length;
    const postAvgPrice = postReportData.reduce((sum, d) => sum + d.price, 0) / postReportData.length;

    // Calculate percentage changes
    const volumeChange = ((postAvgVolume - preAvgVolume) / preAvgVolume) * 100;
    const priceChange = ((postAvgPrice - preAvgPrice) / preAvgPrice) * 100;

    // Get report day data if available
    const reportDayData = chart_data.find(d => d.date === reports_coverage.oldest_report);
    const reportDayVolume = reportDayData ? reportDayData.volume : null;
    const reportDayPrice = reportDayData ? reportDayData.price : null;

    return {
      totalReports: reports_coverage.total_reports,
      coverageDays: reports_coverage.date_span_days,
      preReportDays: preReportData.length,
      postReportDays: postReportData.length,
      preAvgVolume,
      postAvgVolume,
      preAvgPrice,
      postAvgPrice,
      volumeChange,
      priceChange,
      reportDayVolume,
      reportDayPrice,
      firstReportDate: reports_coverage.oldest_report,
      lastReportDate: reports_coverage.newest_report,
    };
  };

  const metrics = calculateRealMetrics();

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatVolume = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toLocaleString();
  };

  const getImpactColor = (value) => {
    if (value > 10) return "text-green-600";
    if (value > 0) return "text-blue-600";
    return "text-red-600";
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Report Performance Metrics</h3>
              <p className="text-sm text-gray-600">Comprehensive analysis of {metrics?.totalReports || 0} report{metrics?.totalReports !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Coverage Period</div>
            <div className="font-medium text-gray-900">
              {metrics ? `${new Date(metrics.firstReportDate).toLocaleDateString()} - ${new Date(metrics.lastReportDate).toLocaleDateString()}` : 'N/A'}
            </div>
            {metrics && (
              <div className="text-xs text-gray-500">{metrics.coverageDays} days</div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      {metrics && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Reports */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Total Reports</span>
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {metrics.totalReports}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Published reports tracked
              </div>
            </div>

            {/* Average Volume Change */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Volume Change</span>
                <ArrowTrendingUpIcon className={`h-4 w-4 ${getImpactColor(metrics.volumeChange)}`} />
              </div>
              <div className={`text-2xl font-bold ${getImpactColor(metrics.volumeChange)}`}>
                {formatPercent(metrics.volumeChange)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Post-report volume impact
              </div>
            </div>

            {/* Average Price Change */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Avg Price Impact</span>
                <ArrowTrendingUpIcon className={`h-4 w-4 ${getImpactColor(metrics.priceChange)}`} />
              </div>
              <div className={`text-2xl font-bold ${getImpactColor(metrics.priceChange)}`}>
                {formatPercent(metrics.priceChange)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Post-report price change
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Success Rate</span>
                <ChartBarIcon className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.volumeChange > 0 ? '100%' : '0%'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Reports with positive impact
              </div>
            </div>
          </div>

          {/* Pre vs Post Comparison */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              Pre vs Post Report Analysis
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pre-Report Period */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h5 className="font-medium text-gray-900">Pre-Report Period</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{metrics.preReportDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Volume:</span>
                    <span className="font-medium">{formatVolume(metrics.preAvgVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">${metrics.preAvgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Post-Report Period */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h5 className="font-medium text-gray-900">Post-Report Period</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{metrics.postReportDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Volume:</span>
                    <span className="font-medium">{formatVolume(metrics.postAvgVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">${metrics.postAvgPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Day Analysis */}
          {metrics.reportDayVolume && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">First Report Impact</h4>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Report Date:</span>
                    <div className="font-medium text-gray-900">{new Date(metrics.firstReportDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Day Volume:</span>
                    <div className="font-medium text-blue-600">{formatVolume(metrics.reportDayVolume)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Day Price:</span>
                    <div className="font-medium text-blue-600">${metrics.reportDayPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Insights */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Key Performance Insights</h4>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    FRC published <strong>{metrics.totalReports} report{metrics.totalReports !== 1 ? 's' : ''}</strong> over {metrics.coverageDays} days
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Average volume {metrics.volumeChange > 0 ? 'increased' : 'decreased'} by{' '}
                    <strong>{formatPercent(Math.abs(metrics.volumeChange))}</strong> after coverage began
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Stock price {metrics.priceChange > 0 ? 'gained' : 'declined'} an average of{' '}
                    <strong>{formatPercent(Math.abs(metrics.priceChange))}</strong> following report publication
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>
                    Analysis based on <strong>{total_data_points.toLocaleString()} data points</strong> from {date_range.start} to {date_range.end}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}