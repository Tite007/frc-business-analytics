"use client";

import {
  BuildingOfficeIcon,
  ChartBarIcon,
  GlobeAmericasIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function CompaniesSummaryDashboard({ companies, onViewAll }) {
  if (!companies || companies.length === 0) {
    return null;
  }

  // Calculate summary statistics - COUNT TICKERS, NOT UNIQUE COMPANIES
  const totalTickers = companies.length; // This is the total number of ticker symbols (231)
  const digitalReports = companies.filter((c) => c.status === "success").length;

  // Count unique companies by grouping by company_name
  const uniqueCompanies = new Set(companies.map(c => c.company_name)).size;

  const usCompanies = companies.filter(
    (c) => {
      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
      return exchanges.some(ex =>
        ex === "NASDAQ" || ex === "NYSE" || ex === "NYSE Arca" ||
        ex === "New York Stock Exchange" || ex === "NASDAQ Global Market" ||
        ex === "NASDAQ Capital Market" || ex === "AMEX" || ex === "OTC"
      );
    }
  ).length;

  const canadianCompanies = companies.filter(
    (c) => {
      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
      return exchanges.some(ex =>
        ex === "TSX" || ex === "TSXV" || ex === "Toronto Stock Exchange" ||
        ex === "TSX Venture Exchange" || ex === "CNQ" || ex === "NEO"
      );
    }
  ).length;

  const totalReports = companies.reduce(
    (sum, company) => sum + (company.reports_count || 0),
    0
  );
  const avgReportsPerCompany = totalReports / Math.max(digitalReports, 1);

  // New metrics for enhanced data
  const withCharts = companies.filter(c => c.has_chart).length;
  const withMetrics = companies.filter(c => c.has_metrics).length;
  const frcCovered = companies.filter(c => c.frc_covered).length;
  const totalStockDataPoints = companies.reduce(
    (sum, company) => sum + (company.stock_data_points || 0),
    0
  );
  const companiesWithStockData = companies.filter(c => (c.stock_data_points || 0) > 0).length;

  const metrics = [
    {
      title: "Total Tickers",
      value: totalTickers,
      icon: BuildingOfficeIcon,
      color: "blue",
      description: `${uniqueCompanies} unique companies`,
      format: "number",
    },
    {
      title: "Digital Reports",
      value: digitalReports,
      icon: ChartBarIcon,
      color: "green",
      description: "Full interactive dashboards",
      format: "number",
      percentage: Math.round((digitalReports / totalTickers) * 100),
    },
    {
      title: "Charts Available",
      value: withCharts,
      icon: ChartBarIcon,
      color: "emerald",
      description: "Tickers with chart data",
      format: "number",
      percentage: Math.round((withCharts / totalTickers) * 100),
    },
    {
      title: "Metrics Available",
      value: withMetrics,
      icon: ArrowTrendingUpIcon,
      color: "indigo",
      description: "Volume impact analysis",
      format: "number",
      percentage: Math.round((withMetrics / totalTickers) * 100),
    },
    {
      title: "Stock Data Points",
      value: totalStockDataPoints.toLocaleString(),
      icon: GlobeAmericasIcon,
      color: "orange",
      description: "Total data points across all tickers",
      format: "string",
    },
    {
      title: "Coverage Rate",
      value: Math.round((frcCovered / totalTickers) * 100),
      icon: EyeIcon,
      color: "purple",
      description: "FRC research coverage",
      format: "percentage",
    },
  ];

  const exchangeStats = [
    {
      name: "United States",
      count: usCompanies,
      flag: "🇺🇸",
      exchanges: ["NYSE", "NASDAQ"],
      color: "bg-blue-500",
    },
    {
      name: "Canada",
      count: canadianCompanies,
      flag: "🇨🇦",
      exchanges: ["TSX", "TSXV"],
      color: "bg-red-500",
    },
  ];

  const topPerformers = companies
    .filter((c) => c.reports_count > 0)
    .sort((a, b) => (b.reports_count || 0) - (a.reports_count || 0))
    .slice(0, 3);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Companies Overview
          </h2>
          <p className="text-gray-600">
            Comprehensive coverage across {totalTickers} tickers ({uniqueCompanies} unique companies) with{" "}
            {totalReports} total reports
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="mt-4 lg:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
        >
          <EyeIcon className="h-5 w-5" />
          View All Companies
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {metric.title}
                </p>
                <p
                  className={`text-3xl font-bold ${
                    metric.color === "green"
                      ? "text-green-600"
                      : metric.color === "yellow"
                      ? "text-yellow-600"
                      : metric.color === "purple"
                      ? "text-purple-600"
                      : metric.color === "emerald"
                      ? "text-emerald-600"
                      : metric.color === "indigo"
                      ? "text-indigo-600"
                      : metric.color === "orange"
                      ? "text-orange-600"
                      : "text-blue-600"
                  }`}
                >
                  {metric.format === "percentage"
                    ? `${metric.value}%`
                    : metric.value.toLocaleString()}
                </p>
                {metric.percentage && (
                  <p className="text-xs text-gray-500 mt-1">
                    {metric.percentage}% of total
                  </p>
                )}
              </div>
              <div
                className={`p-3 rounded-full ${
                  metric.color === "green"
                    ? "bg-green-100"
                    : metric.color === "yellow"
                    ? "bg-yellow-100"
                    : metric.color === "purple"
                    ? "bg-purple-100"
                    : "bg-blue-100"
                }`}
              >
                <metric.icon
                  className={`h-8 w-8 ${
                    metric.color === "green"
                      ? "text-green-600"
                      : metric.color === "yellow"
                      ? "text-yellow-600"
                      : metric.color === "purple"
                      ? "text-purple-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              {metric.description}
            </div>
          </div>
        ))}
      </div>

      {/* Exchange Distribution and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exchange Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GlobeAmericasIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Exchange Distribution
            </h3>
          </div>

          <div className="space-y-4">
            {exchangeStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.flag}</span>
                  <div>
                    <p className="font-medium text-gray-900">{stat.name}</p>
                    <p className="text-sm text-gray-500">
                      {stat.exchanges.join(", ")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round((stat.count / totalTickers) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bars */}
          <div className="mt-4 space-y-2">
            {exchangeStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-20">
                  {stat.name}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stat.color}`}
                    style={{ width: `${(stat.count / totalTickers) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Top Report Producers
            </h3>
          </div>

          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((company, index) => (
                <div
                  key={company.ticker}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : "bg-amber-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {company.ticker}
                      </p>
                      <p
                        className="text-sm text-gray-500 truncate max-w-32"
                        title={company.company_name}
                      >
                        {company.company_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {company.reports_count}
                    </p>
                    <p className="text-xs text-gray-500">reports</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No companies with reports available yet.
              </p>
            )}
          </div>

          {/* Average reports info */}
          {digitalReports > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Average reports per company:
                </span>
                <span className="font-semibold text-blue-600">
                  {avgReportsPerCompany.toFixed(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
