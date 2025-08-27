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

  // Extract company data - handle both response formats
  const companyData = companyResponse.company || companyResponse.data;

  // Fetch additional data in parallel if available
  let metrics = null;
  let analysis = null;

  try {
    const promises = [];

    if (
      companyData.data_available?.has_metrics ||
      companyData.has_metrics ||
      companyData.data?.metrics
    ) {
      promises.push(getCompanyData(ticker, "metrics"));
    } else {
      promises.push(Promise.resolve(null));
    }

    if (
      companyData.data_available?.has_ai_analysis ||
      companyData.data?.ai_analysis
    ) {
      promises.push(getCompanyData(ticker, "analysis"));
    } else {
      promises.push(Promise.resolve(null));
    }

    const [metricsResponse, analysisResponse] = await Promise.all(promises);
    metrics = metricsResponse;
    analysis = analysisResponse;
  } catch (error) {
    console.error("Error fetching additional data:", error);
  }

  // Extract chart data (from main response)
  const chartData =
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

      {/* Enhanced Company Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                {companyData.company_profile?.name ||
                  companyData.company_data?.name ||
                  companyData.company_name ||
                  ticker}
              </h1>
              <div className="flex items-center gap-3 text-blue-100">
                <span className="text-2xl font-semibold">{ticker}</span>
                <span className="text-lg">
                  {companyData.company_profile?.exchange ||
                    companyData.exchange ||
                    companyData.company_data?.exchange ||
                    "N/A"}
                </span>
                <span className="px-3 py-1 bg-blue-500 rounded-full text-sm font-medium">
                  {companyData.company_profile?.currency ||
                    companyData.currency ||
                    "CAD"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-800 rounded-full text-sm">
                  {companyData.company_profile?.industry ||
                    companyData.company_data?.industry ||
                    "Industry N/A"}
                </span>
                <span className="px-3 py-1 bg-indigo-800 rounded-full text-sm">
                  {companyData.company_profile?.sector ||
                    companyData.company_data?.sector ||
                    "Sector N/A"}
                </span>
              </div>
            </div>

            {/* Company Description */}
            {(companyData.company_profile?.description ||
              companyData.company_data?.description) && (
              <div className="lg:max-w-md">
                <p className="text-blue-100 text-sm leading-relaxed">
                  {(
                    companyData.company_profile?.description ||
                    companyData.company_data?.description
                  )?.slice(0, 200)}
                  {(
                    companyData.company_profile?.description ||
                    companyData.company_data?.description
                  )?.length > 200 && "..."}
                </p>
              </div>
            )}
          </div>

          {/* Data Availability Indicators */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
                {companyData.data_available?.has_chart || companyData.has_chart
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
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-300">
                {companyData.data_available?.has_metrics ||
                companyData.has_metrics
                  ? "✓"
                  : "✗"}
              </div>
              <div className="text-xs text-blue-200 font-medium">Metrics</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        {/* Data Tags */}
        <div className="flex flex-wrap gap-2 justify-center">
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

        {/* Table Component */}
        {(metricsData || companyData.data_available?.has_metrics) && (
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
    </div>
  );
}
