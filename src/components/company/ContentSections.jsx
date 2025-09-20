import EnhancedDashboard from "./EnhancedDashboard";

export default function  ContentSections({
  chartData,
  metricsData,
  analysisData,
  companyData,
  ticker,
}) {
  return (
    <EnhancedDashboard
      chartData={chartData}
      metricsData={metricsData}
      analysisData={analysisData}
      companyData={companyData}
      ticker={ticker}
    />
  );
}
