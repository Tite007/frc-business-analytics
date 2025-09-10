import ChartComponent from "@/components/ChartComponent";
import TableComponent from "@/components/TableComponent";
import AnalysisComponent from "@/components/AnalysisComponent";
import BloombergReadershipTable from "@/components/BloombergReadershipTable";
import BloombergAnalysis from "@/components/BloombergAnalysis";
import DetailedMetricsTable from "./DetailedMetricsTable";

export default function ContentSections({
  chartData,
  metricsData,
  analysisData,
  companyData,
  ticker,
}) {
  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.data?.company_profile?.name ||
      ticker
    );
  };

  const getExchange = () => {
    return companyData.data?.company_profile?.exchange || companyData.exchange;
  };

  const getCurrency = () => {
    return (
      companyData.data?.company_profile?.currency ||
      companyData.currency ||
      "CAD"
    );
  };

  const getTotalReports = () => {
    return (
      companyData.reports?.length ||
      companyData.reports_count ||
      companyData.data?.reports?.length ||
      0
    );
  };

  const hasChartData =
    chartData || companyData.data_available?.has_chart || companyData.has_chart;

  const hasMetricsData =
    metricsData ||
    companyData.data_available?.has_metrics ||
    companyData.has_metrics;

  const hasAnalysisData =
    analysisData || companyData.data_available?.has_ai_analysis;

  const hasAnyData = hasChartData || hasMetricsData || hasAnalysisData;

  return (
    <div className="space-y-8">
      {/* Chart Component */}
      {hasChartData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <ChartComponent
              chartData={chartData}
              ticker={ticker}
              companyName={getCompanyName()}
              exchange={getExchange()}
              currency={getCurrency()}
            />
          </div>
        </div>
      )}

      {/* Detailed Metrics Table */}
      {hasMetricsData && (
        <DetailedMetricsTable
          metricsData={metricsData || []}
          companyData={companyData}
          ticker={ticker}
        />
      )}

      {/* Metrics Component */}
      {hasMetricsData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
          <TableComponent
            metrics={metricsData || []}
            ticker={ticker}
            currency={getCurrency()}
            totalReports={getTotalReports()}
          />
        </div>
      )}

      {/* Bloomberg Readership Table */}
      <BloombergReadershipTable ticker={ticker} />

      {/* Bloomberg AI Analysis */}
      <BloombergAnalysis ticker={ticker} />

      {/* Analysis Component */}
      {hasAnalysisData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
          <AnalysisComponent
            analysis={analysisData || ""}
            ticker={ticker}
            status="success"
            generatedDate={companyData.analysis_date}
          />
        </div>
      )}

      {/* No data message */}
      {!hasAnyData && (
        <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
          <div className="text-gray-400 text-7xl mb-6">📊</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">
            Limited Data Available
          </h3>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            This company has basic information but no additional charts,
            metrics, or analysis data available yet.
          </p>
          <p className="text-gray-400 text-sm mt-4">
            We're continuously expanding our coverage. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
}
