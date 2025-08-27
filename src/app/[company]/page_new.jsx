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

  if (
    !companyResponse ||
    (!companyResponse.success && companyResponse.status !== "success")
  ) {
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
            Company Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {ticker} is not found or not covered by FRC analysis.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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
    analysis?.ai_analysis;

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
                  {companyData.company_profile?.name ||
                    companyData.company_data?.name ||
                    companyData.company_name}{" "}
                  <span className="text-blue-200">({ticker})</span>
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    {companyData.company_profile?.exchange ||
                      companyData.exchange ||
                      companyData.company_data?.exchange?.[0]}
                  </span>
                  <span className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                    {companyData.company_profile?.currency ||
                      companyData.currency ||
                      "CAD"}
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
                      {companyData.company_profile?.industry ||
                        "Other Industrial Metals & Mining"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏢 Sector</span>
                    <span className="text-sm font-medium">
                      {companyData.company_profile?.sector || "Basic Materials"}
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
