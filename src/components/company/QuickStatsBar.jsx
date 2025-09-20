export default function QuickStatsBar({ companyData }) {
  const stats = [
    {
      value:
        companyData.stock_data_points ||
        companyData.data?.stock_data?.length ||
        companyData.data?.chart_data?.length ||
        companyData.stock_data?.length ||
        "N/A",
      label: "Stock Data Points",
    },
    {
      value:
        companyData.reports_count ||
        companyData.data?.reports_summary?.total_reports ||
        companyData.data?.performance_metrics?.reports_with_metrics ||
        companyData.detailed_metrics?.length ||
        companyData.reports?.length ||
        0,
      label: "Reports Available",
    },
    {
      value:
        companyData.has_chart ||
        companyData.data_quality?.has_chart ||
        companyData.data_available?.has_chart
          ? "✓"
          : "✗",
      label: "Stock Performance",
      isStatus: true,
      colorClass:
        companyData.has_chart ||
        companyData.data_quality?.has_chart ||
        companyData.data_available?.has_chart
          ? "text-emerald-600"
          : "text-red-600",
    },
    {
      value:
        companyData.has_metrics ||
        companyData.data_quality?.has_metrics ||
        companyData.data_available?.has_metrics ||
        (companyData.detailed_metrics?.length > 0)
          ? "✓"
          : "✗",
      label: "Enhanced Metrics",
      isStatus: true,
      colorClass:
        companyData.has_metrics ||
        companyData.data_quality?.has_metrics ||
        companyData.data_available?.has_metrics ||
        (companyData.detailed_metrics?.length > 0)
          ? "text-purple-600"
          : "text-red-600",
    },
    {
      value: companyData.ai_analysis || companyData.data_available?.has_ai_analysis ? "✓" : "✗",
      label: "AI Analysis",
      isStatus: true,
      colorClass: companyData.ai_analysis || companyData.data_available?.has_ai_analysis
        ? "text-blue-600"
        : "text-red-600",
    },
  ];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20">
      <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-white divide-opacity-20">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 text-center">
            <div
              className={`text-2xl lg:text-3xl font-bold mb-1 ${
                stat.isStatus ? stat.colorClass : "text-black"
              }`}
            >
              {stat.value}
            </div>
            <div className="text-xs text-black font-medium opacity-80">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
