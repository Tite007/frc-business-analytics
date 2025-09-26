"use client";

import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Tooltip component for information display
const InfoTooltip = ({ title, formula, explanation }) => {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-80 max-w-96">
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
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default function DataSummaryDashboard({
  metricsData,
  companyData,
  ticker,
}) {
  if (!metricsData || metricsData.length === 0) {
    return null;
  }


  // Calculate summary statistics
  const totalReports = metricsData.length;
  // Calculate average price change (30-day impact)
  const avgPriceChange =
    metricsData.reduce(
      (sum, report) => sum + (report["Price Change 30 Days (%)"] || 0),
      0
    ) / totalReports;
  // Use Pre-Post data since that's where the real volume impact data is
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
      <div className="mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Performance Overview
          </h2>
          <p className="text-gray-600">
            Comprehensive analysis of {totalReports} report
            {totalReports !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Reports */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600">Published Research</p>
                <InfoTooltip
                  title="Total Research Reports"
                  formula="COUNT = Total number of reports published"
                  explanation="We simply count how many research reports FRC has published for this company. Each report represents ongoing coverage and analysis by our research team."
                />
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalReports}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            FRC institutional research reports
          </div>
        </div>

        {/* Average Price Change */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600">
                  30-Day Price Impact
                </p>
                <InfoTooltip
                  title="30-Day Price Impact"
                  formula="Average % = (Price after 30 days - Price at publication) ÷ Price at publication × 100"
                  explanation="We calculate the percentage price change from when each report was published to 30 days later, then average all these percentages. Positive numbers show our research identifies stocks before they rise."
                />
              </div>
              <p
                className={`text-3xl font-bold ${
                  avgPriceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatPercentage(avgPriceChange)}
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${
                avgPriceChange >= 0 ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <CurrencyDollarIcon
                className={`h-8 w-8 ${
                  avgPriceChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">Average stock price response</div>
        </div>

        {/* Success Rate */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600">Research Hit Rate</p>
                <InfoTooltip
                  title="Research Success Rate"
                  formula="Success Rate % = (Reports with positive volume impact ÷ Total reports) × 100"
                  explanation="We count how many of our reports caused increased trading volume, then divide by total reports. Higher percentages show our research effectively captures investor attention and drives market activity."
                />
              </div>
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
            Reports driving increased volume
          </div>
        </div>

        {/* Pre-Post Average */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-600">Volume Enhancement</p>
                <InfoTooltip
                  title="Volume Enhancement Impact"
                  formula="Volume Change % = (Avg Volume Post-30d - Avg Volume Pre-30d) ÷ Avg Volume Pre-30d × 100"
                  explanation="For each report, we calculate the percentage change in average daily trading volume from 30 days before publication to 30 days after, then average all results. Positive values indicate our research increases market liquidity."
                />
              </div>
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
            Market liquidity improvement
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
            <InfoTooltip
              title="Most Recent Report"
              formula="Latest Report = MAX(Publication Date)"
              explanation="We identify the report with the most recent publication date from all our research coverage. Shows current engagement and latest market impact metrics for this company."
            />
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">30-Day Volume Impact:</span>
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
              <p className="text-xs text-gray-500">
                Average daily volume change: 30 days before vs 30 days after publication (Source: Market data)
              </p>
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
            <InfoTooltip
              title="Best Performing Report"
              formula="Top Report = MAX(Volume Change Pre-Post 30 Days %)"
              explanation="We identify the report that generated the highest percentage increase in trading volume. This represents our most effective research impact and demonstrates our ability to move markets and drive investor interest."
            />
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">30-Day Volume Impact:</span>
                <span className="font-semibold text-green-600">
                  {formatPercentage(
                    bestPerformingReport["Volume Change Pre-Post 30 Days (%)"] || 0
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Average daily volume change: 30 days before vs 30 days after publication (Source: Market data)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
