// SERVER-SIDE VERSION - Use this when backend is deployed to public URL
// Rename this file to page.jsx when you have a publicly accessible backend

import ChartComponent from "@/components/ChartComponent";
import TableComponent from "@/components/TableComponent";
import AnalysisComponent from "@/components/AnalysisComponent";
import { getCompanyData } from "@/lib/api";
import Link from "next/link";

export async function generateMetadata({ params }) {
  // In Next.js 15, params must be awaited
  const resolvedParams = await params;
  const ticker = resolvedParams.company.toUpperCase();
  const companyResponse = await getCompanyData(ticker, "company");
  const companyData = companyResponse?.company || companyResponse?.data;
  return {
    title: `${
      companyData?.company_profile?.name ||
      companyData?.company_data?.name ||
      ticker
    } Profile`,
  };
}

export default async function CompanyPage({ params }) {
  // In Next.js 15, params must be awaited
  const resolvedParams = await params;
  const ticker = resolvedParams.company.toUpperCase();

  // Get company details first
  const companyResponse = await getCompanyData(ticker, "company");

  // Enhanced error handling
  if (
    !companyResponse ||
    companyResponse.error ||
    (!companyResponse.success && companyResponse.status !== "success")
  ) {
    // Log the error details for debugging
    console.error("Company data fetch failed:", {
      ticker,
      response: companyResponse,
      error: companyResponse?.error,
      message: companyResponse?.message,
      status: companyResponse?.status,
      baseURL: companyResponse?.baseURL,
    });

    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Companies
          </Link>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {companyResponse?.error
              ? "API Connection Error"
              : "Company Not Found"}
          </h1>
          <p className="text-gray-600 mb-4">
            {companyResponse?.error
              ? `Failed to connect to backend API: ${
                  companyResponse.message || "Unknown error"
                }`
              : `${ticker} is not found or not covered by FRC analysis.`}
          </p>
          {companyResponse?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-red-800 mb-2">
                Debug Information:
              </h3>
              <div className="text-sm text-red-700 space-y-1">
                <p>
                  <strong>API Base URL:</strong> {companyResponse.baseURL}
                </p>
                <p>
                  <strong>Status:</strong> {companyResponse.status}
                </p>
                <p>
                  <strong>Error:</strong> {companyResponse.message}
                </p>
              </div>
            </div>
          )}
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 inline-block"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  // Extract the actual company data from the response (handle both formats)
  const companyData = companyResponse.company || companyResponse.data;

  // Fetch additional data in parallel (only if not included in main response)
  const [chartResponse, metrics, analysis] = await Promise.all([
    companyData.data_available?.has_chart || companyData.has_chart
      ? getCompanyData(ticker, "chart")
      : null,
    (companyData.data_available?.has_metrics || companyData.has_metrics) &&
    !companyData.data?.metrics
      ? getCompanyData(ticker, "metrics")
      : null,
    companyData.data_available?.has_ai_analysis &&
    !companyData.data?.ai_analysis
      ? getCompanyData(ticker, "analysis")
      : null,
  ]).catch((error) => {
    console.error("Error fetching additional data:", error);
    return [null, null, null];
  });

  // Safely extract chart data (check both possible field names and chart API response)
  const chartData =
    chartResponse?.chart_data ||
    companyData.chart_json ||
    companyData.chart_data ||
    companyData.data?.chart_json ||
    companyData.data?.chart_data;

  // Extract metrics and analysis (from main response or additional fetch)
  const metricsData =
    companyData.data?.metrics ||
    metrics?.metrics ||
    (metrics?.company || metrics?.data)?.metrics;
  const analysisData =
    companyData.data?.ai_analysis ||
    (analysis?.company || analysis?.data)?.ai_analysis ||
    analysis?.analysis;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← Back to Companies
          </Link>
        </div>

        {/* Enhanced Company Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  {companyData.company_data?.name ||
                    companyData.company_name ||
                    ticker}{" "}
                  <span className="text-blue-200">({ticker})</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    {companyData.exchange || "N/A"}
                  </span>
                  <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    {companyData.currency || "USD"}
                  </span>
                  <span className="px-4 py-2 bg-emerald-500 text-white rounded-full text-sm font-bold">
                    ✓ FRC Covered
                  </span>
                </div>

                {/* Industry & Sector Info */}
                <div className="flex flex-wrap items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏭 Industry</span>
                    <span className="text-sm font-medium">
                      {companyData.industry ||
                        companyData.company_data?.industry ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏢 Sector</span>
                    <span className="text-sm font-medium">
                      {companyData.sector ||
                        companyData.company_data?.sector ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Availability Grid */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-2">
                {(companyData.data_available?.has_reports ||
                  companyData.reports_count > 0 ||
                  companyData.data?.reports?.length > 0) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-purple-300">📄</span>
                    <span className="text-sm font-medium">
                      Reports (
                      {companyData.reports?.length ||
                        companyData.reports_count ||
                        companyData.data?.reports?.length ||
                        0}
                      )
                    </span>
                  </div>
                )}

                {(companyData.data_available?.has_chart ||
                  companyData.has_chart) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-green-300">📊</span>
                    <span className="text-sm font-medium">Charts</span>
                  </div>
                )}

                {(companyData.data_available?.has_metrics ||
                  companyData.has_metrics) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-blue-300">📈</span>
                    <span className="text-sm font-medium">Metrics</span>
                  </div>
                )}

                {companyData.data_available?.has_ai_analysis && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-orange-300">🤖</span>
                    <span className="text-sm font-medium">AI Analysis</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white divide-opacity-20">
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {companyData.stock_data?.length ||
                    companyData.stock_data_points ||
                    "N/A"}
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  Stock Data Points
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {companyData.reports?.length ||
                    companyData.reports_count ||
                    companyData.data?.reports?.length ||
                    0}
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  Reports Available
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-300">
                  {companyData.data_available?.has_chart ||
                  companyData.has_chart
                    ? "✓"
                    : "✗"}
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  Stock Performance
                </div>
              </div>
              <div className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-300">
                  {companyData.data_available?.has_ai_analysis ? "✓" : "✗"}
                </div>
                <div className="text-xs text-blue-200 font-medium">
                  AI Analysis
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {/* Chart Component */}
          {(chartData ||
            companyData.data_available?.has_chart ||
            companyData.has_chart) && (
            <ChartComponent
              chartData={chartData}
              ticker={ticker}
              companyName={companyData.company_name}
              exchange={companyData.exchange}
              currency={
                metrics?.currency ||
                companyData.company_profile?.currency ||
                companyData.currency ||
                "CAD"
              }
            />
          )}

          {/* Detailed Metrics Table */}
          {(metricsData ||
            companyData.data_available?.has_metrics ||
            companyData.has_metrics) && (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Report Performance Metrics ({(metricsData || []).length}{" "}
                  reports)
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Report Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Report Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Company
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Ticker
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Price on Release
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Publication Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Avg Volume Post 5 Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Avg Volume Post 10 Days
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-300">
                        Volume Change 30 Days (%)
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Volume Change Pre-Post 30 Days (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(metricsData || []).map((report, index) => (
                      <tr
                        key={`${ticker}-${report["Report Number"]}`}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors duration-150`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                          {report["Report Number"]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200 max-w-xs">
                          <div
                            className="truncate"
                            title={report["Report Title"]}
                          >
                            {report["Report Title"]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                          {companyData.company_profile?.name ||
                            companyData.company_data?.name ||
                            companyData.company_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold border-r border-gray-200">
                          {ticker}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {report["Price on Release"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {report["Publication Date"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {report["Avg Volume Post 5 Days"]?.toLocaleString() ||
                            "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                          {report[
                            "Avg Volume Post 10 Days"
                          ]?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                          <span
                            className={`font-semibold ${
                              report["Volume Change 30 Days (%)"] > 0
                                ? "text-green-600"
                                : report["Volume Change 30 Days (%)"] < 0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {report["Volume Change 30 Days (%)"]?.toFixed(2) ||
                              "0.00"}
                            %
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`font-semibold ${
                              report["Volume Change Pre-Post 30 Days (%)"] > 0
                                ? "text-green-600"
                                : report["Volume Change Pre-Post 30 Days (%)"] <
                                  0
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {report[
                              "Volume Change Pre-Post 30 Days (%)"
                            ]?.toFixed(2) || "0.00"}
                            %
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!metricsData || metricsData.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No metrics data available for this company.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metrics Component */}
          {(metricsData ||
            companyData.data_available?.has_metrics ||
            companyData.has_metrics) && (
            <TableComponent
              metrics={metricsData || []}
              ticker={ticker}
              currency={
                metrics?.currency ||
                companyData.company_profile?.currency ||
                companyData.currency ||
                "CAD"
              }
              totalReports={
                metrics?.total_reports ||
                companyData.reports?.length ||
                companyData.reports_count ||
                companyData.data?.reports?.length ||
                0
              }
            />
          )}

          {/* Analysis Component */}
          {(analysisData || companyData.data_available?.has_ai_analysis) && (
            <AnalysisComponent
              analysis={analysisData || ""}
              ticker={ticker}
              status={analysis?.status || "success"}
              generatedDate={
                analysis?.data?.generated_date || companyData.analysis_date
              }
            />
          )}

          {/* No data message */}
          {!chartData && !metricsData && !analysisData && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Limited Data Available
              </h3>
              <p className="text-gray-500">
                This company has basic information but no additional charts,
                metrics, or analysis data available yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
