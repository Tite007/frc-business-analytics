"use client";

import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function DataSummaryDashboard({
  metricsData,
  companyData,
  ticker,
  onViewDetails,
}) {
  if (!metricsData || metricsData.length === 0) {
    return null;
  }


  // Calculate summary statistics
  const totalReports = metricsData.length;
  // Use Pre-Post data since that's where the real volume impact data is
  const avgVolumeChange =
    metricsData.reduce(
      (sum, report) => sum + (report["Volume Change Pre-Post 30 Days (%)"] || 0),
      0
    ) / totalReports;
  const avgPrePostChange =
    metricsData.reduce(
      (sum, report) =>
        sum + (report["Volume Change Pre-Post 30 Days (%)"] || 0),
      0
    ) / totalReports;

  const positiveVolumeReports = metricsData.filter(
    (report) => (report["Volume Change Pre-Post 30 Days (%)"] || 0) > 0
  ).length;

  const mostRecentReport = metricsData.reduce((latest, report) => {
    const reportDate = new Date(report["Publication Date"]);
    const latestDate = new Date(latest["Publication Date"]);
    return reportDate > latestDate ? report : latest;
  }, metricsData[0]);

  const bestPerformingReport = metricsData.reduce((best, report) => {
    const reportChange = report["Volume Change Pre-Post 30 Days (%)"] || 0;
    const bestChange = best["Volume Change Pre-Post 30 Days (%)"] || 0;
    return reportChange > bestChange ? report : best;
  }, metricsData[0]);

  const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Overview
          </h2>
          <p className="text-gray-600">
            Comprehensive analysis of {totalReports} report
            {totalReports !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          onClick={onViewDetails}
          className="mt-4 lg:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          <EyeIcon className="h-5 w-5" />
          View Detailed Data
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Reports */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-blue-600">{totalReports}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Published reports tracked
          </div>
        </div>

        {/* Average Volume Change */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg Volume Change
              </p>
              <p
                className={`text-3xl font-bold ${
                  avgVolumeChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPercentage(avgVolumeChange)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                avgVolumeChange >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {avgVolumeChange >= 0 ? (
                <ArrowTrendingUpIcon
                  className={`h-8 w-8 ${
                    avgVolumeChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              ) : (
                <ArrowTrendingDownIcon
                  className={`h-8 w-8 ${
                    avgVolumeChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">30-day volume impact</div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p
                className={`text-3xl font-bold ${
                  positiveVolumeReports / totalReports >= 0.5
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {Math.round((positiveVolumeReports / totalReports) * 100)}%
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                positiveVolumeReports / totalReports >= 0.5
                  ? "bg-green-100"
                  : "bg-orange-100"
              }`}
            >
              <ChartBarIcon
                className={`h-8 w-8 ${
                  positiveVolumeReports / totalReports >= 0.5
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Reports with positive impact
          </div>
        </div>

        {/* Pre-Post Average */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pre-Post Avg</p>
              <p
                className={`text-3xl font-bold ${
                  avgPrePostChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPercentage(avgPrePostChange)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                avgPrePostChange >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {avgPrePostChange >= 0 ? (
                <ArrowTrendingUpIcon
                  className={`h-8 w-8 ${
                    avgPrePostChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              ) : (
                <ArrowTrendingDownIcon
                  className={`h-8 w-8 ${
                    avgPrePostChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                />
              )}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Average pre-post volume change
          </div>
        </div>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Recent Report */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Most Recent Report
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">
                Report #{mostRecentReport["Report Number"]}
              </p>
              <p
                className="font-medium text-gray-900 line-clamp-2"
                title={mostRecentReport["Report Title"]}
              >
                {mostRecentReport["Report Title"]}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Published:</span>
              <span className="font-medium">
                {formatDate(mostRecentReport["Publication Date"])}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Volume Impact:</span>
              <span
                className={`font-semibold ${
                  (mostRecentReport["Volume Change Pre-Post 30 Days (%)"] || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPercentage(
                  mostRecentReport["Volume Change Pre-Post 30 Days (%)"] || 0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Best Performing Report */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Best Performing Report
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">
                Report #{bestPerformingReport["Report Number"]}
              </p>
              <p
                className="font-medium text-gray-900 line-clamp-2"
                title={bestPerformingReport["Report Title"]}
              >
                {bestPerformingReport["Report Title"]}
              </p>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Published:</span>
              <span className="font-medium">
                {formatDate(bestPerformingReport["Publication Date"])}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Volume Impact:</span>
              <span className="font-semibold text-green-600">
                {formatPercentage(
                  bestPerformingReport["Volume Change Pre-Post 30 Days (%)"] || 0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
