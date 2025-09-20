export default function DataAvailabilityGrid({ companyData }) {
  const reportCount =
    companyData.reports_count ||
    companyData.data?.reports_summary?.total_reports ||
    companyData.detailed_metrics?.length ||
    companyData.reports?.length ||
    0;

  const stockDataCount =
    companyData.stock_data_points ||
    companyData.data?.stock_data?.length ||
    companyData.data?.chart_data?.length ||
    0;

  const availabilityItems = [
    {
      condition:
        companyData.data_quality?.has_reports ||
        companyData.data_available?.has_reports ||
        reportCount > 0,
      icon: "📄",
      label: `Reports (${reportCount})`,
    },
    {
      condition:
        companyData.has_chart ||
        companyData.data_quality?.has_chart ||
        companyData.data_available?.has_chart ||
        stockDataCount > 0,
      icon: "📊",
      label: `Charts (${stockDataCount} points)`,
    },
    {
      condition:
        companyData.has_metrics ||
        companyData.data_quality?.has_metrics ||
        companyData.data_available?.has_metrics ||
        (companyData.detailed_metrics?.length > 0),
      icon: "📈",
      label: `Enhanced Metrics (${companyData.detailed_metrics?.length || 0})`,
    },
    {
      condition:
        companyData.ai_analysis ||
        companyData.data_available?.has_ai_analysis,
      icon: "🤖",
      label: "AI Analysis",
    },
    {
      condition: companyData.processing_summary?.companies_successful > 0,
      icon: "⚡",
      label: `Enhanced Calculation v${companyData.enhanced_calculation_version || '3.0'}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-3">
      {availabilityItems
        .filter((item) => item.condition)
        .map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-black">{item.label}</span>
          </div>
        ))}
    </div>
  );
}
