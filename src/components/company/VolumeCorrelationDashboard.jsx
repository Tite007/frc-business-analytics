"use client";

import { useState, useMemo } from "react";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function VolumeCorrelationDashboard({ metricsData, ticker, companyData }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");

  // Calculate correlation insights
  const correlationInsights = useMemo(() => {
    if (!metricsData || metricsData.length === 0) return null;

    const reports = metricsData.map(report => report._raw).filter(Boolean);

    if (reports.length === 0) return null;

    const insights = {
      totalReports: reports.length,
      avgVolumeSpike: 0,
      avgVolumeChange: 0,
      avgPriceImpact: 0,
      positiveCorrelations: 0,
      strongCorrelations: 0,
      reports: []
    };

    reports.forEach(report => {
      const volumeSpike = report.frc_30_day_analysis?.volume_spike_30_days_pct || 0;
      const volumeChange = report.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0;
      const priceChange = report.frc_30_day_analysis?.price_change_30_days_pct || 0;

      insights.avgVolumeSpike += volumeSpike;
      insights.avgVolumeChange += volumeChange;
      insights.avgPriceImpact += priceChange;

      if (volumeChange > 0) insights.positiveCorrelations++;
      if (Math.abs(volumeChange) > 20) insights.strongCorrelations++;

      insights.reports.push({
        id: report.report_id,
        title: report.report_title,
        date: report.publication_date,
        volumeSpike: volumeSpike,
        volumeChange: volumeChange,
        priceChange: priceChange,
        priceOnRelease: report.frc_30_day_analysis?.price_on_release || 0,
        volumeOnRelease: report.frc_30_day_analysis?.volume_on_release || 0,
        volatility: report.volatility_analysis?.annualized_volatility_pct || 0,
        correlationStrength: Math.abs(volumeChange),
        effectivenessRating: Math.abs(volumeChange) > 20 ? "Strong" : Math.abs(volumeChange) > 10 ? "Moderate" : "Weak"
      });
    });

    insights.avgVolumeSpike /= reports.length;
    insights.avgVolumeChange /= reports.length;
    insights.avgPriceImpact /= reports.length;
    insights.successRate = (insights.positiveCorrelations / reports.length) * 100;
    insights.strongCorrelationRate = (insights.strongCorrelations / reports.length) * 100;

    return insights;
  }, [metricsData]);

  if (!correlationInsights) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <BeakerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Volume Correlation Analysis</h3>
          <p className="text-gray-500">No metrics data available for correlation analysis</p>
        </div>
      </div>
    );
  }

  const getCorrelationColor = (value) => {
    if (Math.abs(value) > 20) return "text-green-600";
    if (Math.abs(value) > 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getCorrelationBg = (value) => {
    if (Math.abs(value) > 20) return "bg-green-50 border-green-200";
    if (Math.abs(value) > 10) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <ChartBarIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Volume Correlation Analysis</h2>
        </div>
        <p className="text-blue-100">
          Analyzing trading volume behavior before and after FRC research report releases for {ticker}
        </p>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Volume Impact</p>
              <p className={`text-2xl font-bold ${getCorrelationColor(correlationInsights.avgVolumeChange)}`}>
                {correlationInsights.avgVolumeChange.toFixed(1)}%
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price Impact</p>
              <p className={`text-2xl font-bold ${correlationInsights.avgPriceImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {correlationInsights.avgPriceImpact.toFixed(1)}%
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Positive Volume Response</p>
              <p className="text-2xl font-bold text-blue-600">
                {correlationInsights.successRate.toFixed(0)}%
              </p>
            </div>
            <ArrowPathIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Strong Correlations</p>
              <p className="text-2xl font-bold text-purple-600">
                {correlationInsights.strongCorrelationRate.toFixed(0)}%
              </p>
            </div>
            <BeakerIcon className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Report Analysis Cards */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Report Impact Analysis</h3>
          <div className="text-sm text-gray-500">
            {correlationInsights.totalReports} report{correlationInsights.totalReports !== 1 ? 's' : ''} analyzed
          </div>
        </div>

        <div className="space-y-4">
          {correlationInsights.reports.map((report) => (
            <div
              key={report.id}
              className={`border rounded-lg p-4 ${getCorrelationBg(report.volumeChange)}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900 text-sm">{report.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                    <div>
                      Price: ${report.priceOnRelease.toFixed(2)}
                    </div>
                    <div>
                      Volume: {report.volumeOnRelease.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Volume Change</p>
                    <p className={`font-bold ${getCorrelationColor(report.volumeChange)}`}>
                      {report.volumeChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Volume Spike</p>
                    <p className={`font-bold ${getCorrelationColor(report.volumeSpike)}`}>
                      {report.volumeSpike.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Price Impact</p>
                    <p className={`font-bold ${report.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {report.priceChange.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Effectiveness</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.effectivenessRating === 'Strong' ? 'bg-green-100 text-green-800' :
                      report.effectivenessRating === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.effectivenessRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlation Strength Distribution */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Correlation Strength Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {correlationInsights.reports.filter(r => r.effectivenessRating === 'Strong').length}
            </div>
            <div className="text-sm font-medium text-green-800">Strong Correlations</div>
            <div className="text-xs text-green-600 mt-1">&gt;20% volume change</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-2">
              {correlationInsights.reports.filter(r => r.effectivenessRating === 'Moderate').length}
            </div>
            <div className="text-sm font-medium text-yellow-800">Moderate Correlations</div>
            <div className="text-xs text-yellow-600 mt-1">10-20% volume change</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">
              {correlationInsights.reports.filter(r => r.effectivenessRating === 'Weak').length}
            </div>
            <div className="text-sm font-medium text-red-800">Weak Correlations</div>
            <div className="text-xs text-red-600 mt-1">&lt;10% volume change</div>
          </div>
        </div>
      </div>
    </div>
  );
}