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
    (!companyResponse.success && companyResponse.status !== "success") ||
    (!companyResponse.company && !companyResponse.data)
  ) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Company Not Found
          </h1>
          <p className="text-gray-500 mb-4">
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
    (metrics?.company || metrics?.data)?.metrics ||
    metrics?.metrics;
  const analysisData =
    companyData.data?.ai_analysis ||
    (analysis?.company || analysis?.data)?.ai_analysis ||
    analysis?.ai_analysis;

  return (
    <div className="container mx-auto p-4">
      {/* Back Navigation */}
      <div className="mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Companies
        </Link>
      </div>
      {/* Company Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {companyData.company_profile?.name ||
                companyData.company_data?.name}{" "}
              ({ticker})
            </h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {companyData.company_profile?.exchange ||
                  companyData.company_data?.exchange?.[0]}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {companyData.company_profile?.currency || "CAD"}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                FRC Covered
              </span>
            </div>
          </div>

          {/* Data Availability Indicators */}
          <div className="flex flex-wrap gap-2">
            {(companyData.data_available?.has_reports ||
              companyData.reports_count > 0 ||
              companyData.data?.reports?.length > 0) && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                📄 Reports (
                {companyData.reports?.length ||
                  companyData.reports_count ||
                  companyData.data?.reports?.length ||
                  0}
                )
              </span>
            )}
            {(companyData.data_available?.has_chart ||
              companyData.has_chart ||
              companyData.data?.chart_json) && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                📊 Charts
              </span>
            )}
            {(companyData.data_available?.has_metrics ||
              companyData.has_metrics ||
              companyData.data?.metrics) && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                📈 Metrics
              </span>
            )}
            {(companyData.data_available?.has_ai_analysis ||
              companyData.data?.ai_analysis) && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                🤖 AI Analysis
              </span>
            )}
          </div>
        </div>

        {/* Company Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-sm text-blue-600 font-medium">Industry</div>
            <div className="text-lg font-semibold text-blue-700">
              {companyData.company_profile?.industry ||
                companyData.company_data?.industry ||
                "N/A"}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-600 font-medium">Sector</div>
            <div className="text-lg font-semibold text-green-700">
              {companyData.company_profile?.sector ||
                companyData.company_data?.sector ||
                "N/A"}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-sm text-purple-600 font-medium">
              Stock Data Points
            </div>
            <div className="text-lg font-semibold text-purple-700">
              {companyData.stock_data?.length ||
                companyData.stock_data_points ||
                0}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-sm text-orange-600 font-medium">Reports</div>
            <div className="text-sm font-semibold text-orange-700">
              {companyData.reports?.length ||
                companyData.reports_count ||
                companyData.data?.reports?.length ||
                0}{" "}
              Available
            </div>
          </div>
        </div>
      </div>
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
          currency={companyData.company_profile?.currency || "CAD"}
          totalReports={
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
      )}{" "}
      {/* No data message */}
      {!chartData && !metricsData && !analysisData && (
        <div className="text-center py-8">
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
  );
}
