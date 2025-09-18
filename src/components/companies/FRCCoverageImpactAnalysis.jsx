"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  EyeIcon,
  DocumentTextIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "@heroicons/react/24/outline";
import { getCoverageImpactAnalysis } from "@/lib/api";

export default function FRCCoverageImpactAnalysis({ ticker, className = "" }) {
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImpactAnalysis() {
      try {
        setLoading(true);
        const response = await getCoverageImpactAnalysis(ticker, {
          pre_coverage_days: 90,
          include_volume_analysis: true,
          include_price_analysis: true,
        });

        if (response.error) {
          setError(response.message);
        } else {
          setImpactData(response);
        }
      } catch (err) {
        setError(`Failed to load impact analysis: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchImpactAnalysis();
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
            {error.includes("404") ? "Coverage analysis not available yet" : error}
          </p>
        </div>
      </div>
    );
  }

  if (!impactData || !impactData.coverage_periods) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No coverage impact data available</p>
        </div>
      </div>
    );
  }

  const { coverage_periods, volume_analysis, price_analysis, summary } = impactData;

  // Calculate impact metrics
  const calculateImpactMetrics = () => {
    if (!volume_analysis || !price_analysis) return null;

    const volumeChange = volume_analysis.post_coverage_avg_volume - volume_analysis.pre_coverage_avg_volume;
    const volumeChangePercent = ((volumeChange / volume_analysis.pre_coverage_avg_volume) * 100);

    const priceVolatilityChange = price_analysis.post_coverage_volatility - price_analysis.pre_coverage_volatility;
    const volatilityChangePercent = ((priceVolatilityChange / price_analysis.pre_coverage_volatility) * 100);

    return {
      volumeChange,
      volumeChangePercent,
      priceVolatilityChange,
      volatilityChangePercent,
      totalReports: summary?.total_reports || 0,
      avgVolumeSpike: volume_analysis.avg_volume_spike_on_report_day || 0,
      reportEffectiveness: summary?.report_effectiveness_score || 0,
    };
  };

  const metrics = calculateImpactMetrics();

  const getImpactColor = (value) => {
    if (value > 10) return "text-green-600";
    if (value > 0) return "text-blue-600";
    if (value > -10) return "text-yellow-600";
    return "text-red-600";
  };

  const getImpactIcon = (value) => {
    return value > 0 ? TrendingUpIcon : TrendingDownIcon;
  };

  const formatPercent = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatVolume = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
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
              <h3 className="text-lg font-semibold text-gray-900">FRC Coverage Impact Analysis</h3>
              <p className="text-sm text-gray-600">Pre vs Post Coverage Performance</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Coverage Period</div>
            <div className="font-medium text-gray-900">
              {coverage_periods.coverage_start ? new Date(coverage_periods.coverage_start).toLocaleDateString() : 'N/A'} -
              {coverage_periods.coverage_end ? new Date(coverage_periods.coverage_end).toLocaleDateString() : 'Present'}
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics Grid */}
      {metrics && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Volume Impact */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Volume Impact</span>
                {React.createElement(getImpactIcon(metrics.volumeChangePercent), {
                  className: `h-4 w-4 ${getImpactColor(metrics.volumeChangePercent)}`
                })}
              </div>
              <div className={`text-2xl font-bold ${getImpactColor(metrics.volumeChangePercent)}`}>
                {formatPercent(metrics.volumeChangePercent)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatVolume(Math.abs(metrics.volumeChange))} change
              </div>
            </div>

            {/* Volatility Impact */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Price Volatility</span>
                {React.createElement(getImpactIcon(metrics.volatilityChangePercent), {
                  className: `h-4 w-4 ${getImpactColor(metrics.volatilityChangePercent)}`
                })}
              </div>
              <div className={`text-2xl font-bold ${getImpactColor(metrics.volatilityChangePercent)}`}>
                {formatPercent(metrics.volatilityChangePercent)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Volatility change
              </div>
            </div>

            {/* Report Volume Spike */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Report Day Spike</span>
                <DocumentTextIcon className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {formatPercent(metrics.avgVolumeSpike)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Avg volume spike
              </div>
            </div>

            {/* Effectiveness Score */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Effectiveness</span>
                <EyeIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.reportEffectiveness.toFixed(1)}/10
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Report impact score
              </div>
            </div>
          </div>

          {/* Timeline Comparison */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-600" />
              Coverage Timeline Analysis
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pre-Coverage Period */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h5 className="font-medium text-gray-900">Pre-Coverage Period</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{coverage_periods.pre_coverage_days} days</span>
                  </div>
                  {volume_analysis && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Volume:</span>
                        <span className="font-medium">{formatVolume(volume_analysis.pre_coverage_avg_volume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume Volatility:</span>
                        <span className="font-medium">{volume_analysis.pre_coverage_volume_volatility?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  {price_analysis && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Volatility:</span>
                      <span className="font-medium">{price_analysis.pre_coverage_volatility?.toFixed(2) || 'N/A'}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Post-Coverage Period */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h5 className="font-medium text-gray-900">Post-Coverage Period</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{coverage_periods.post_coverage_days} days</span>
                  </div>
                  {volume_analysis && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Volume:</span>
                        <span className="font-medium">{formatVolume(volume_analysis.post_coverage_avg_volume)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume Volatility:</span>
                        <span className="font-medium">{volume_analysis.post_coverage_volume_volatility?.toFixed(2) || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  {price_analysis && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Volatility:</span>
                      <span className="font-medium">{price_analysis.post_coverage_volatility?.toFixed(2) || 'N/A'}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Insights */}
          {summary && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-3">Key Insights</h4>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      FRC published <strong>{metrics.totalReports} reports</strong> during the coverage period
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Trading volume {metrics.volumeChangePercent > 0 ? 'increased' : 'decreased'} by{' '}
                      <strong>{formatPercent(Math.abs(metrics.volumeChangePercent))}</strong> after coverage began
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Reports generate an average <strong>{formatPercent(metrics.avgVolumeSpike)}</strong> volume spike on publication days
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>
                      Overall report effectiveness score: <strong>{metrics.reportEffectiveness.toFixed(1)}/10</strong>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}