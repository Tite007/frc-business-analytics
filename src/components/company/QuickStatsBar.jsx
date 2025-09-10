export default function QuickStatsBar({ companyData }) {
  const stats = [
    {
      value:
        companyData.stock_data?.length ||
        companyData.stock_data_points ||
        "N/A",
      label: "Stock Data Points",
    },
    {
      value:
        companyData.reports?.length ||
        companyData.reports_count ||
        companyData.data?.reports?.length ||
        0,
      label: "Reports Available",
    },
    {
      value:
        companyData.data_available?.has_chart || companyData.has_chart
          ? "✓"
          : "✗",
      label: "Stock Performance",
      isStatus: true,
      colorClass:
        companyData.data_available?.has_chart || companyData.has_chart
          ? "text-emerald-600"
          : "text-red-600",
    },
    {
      value: companyData.data_available?.has_ai_analysis ? "✓" : "✗",
      label: "AI Analysis",
      isStatus: true,
      colorClass: companyData.data_available?.has_ai_analysis
        ? "text-purple-600"
        : "text-red-600",
    },
  ];

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white divide-opacity-20">
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
