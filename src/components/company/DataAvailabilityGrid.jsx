export default function DataAvailabilityGrid({ companyData }) {
  const availabilityItems = [
    {
      condition:
        companyData.data_available?.has_reports ||
        companyData.reports_count > 0 ||
        companyData.data?.reports?.length > 0,
      icon: "📄",
      label: `Reports (${
        companyData.reports?.length ||
        companyData.reports_count ||
        companyData.data?.reports?.length ||
        0
      })`,
    },
    {
      condition: companyData.data_available?.has_chart || companyData.has_chart,
      icon: "📊",
      label: "Charts",
    },
    {
      condition:
        companyData.data_available?.has_metrics || companyData.has_metrics,
      icon: "📈",
      label: "Metrics",
    },
    {
      condition: companyData.data_available?.has_ai_analysis,
      icon: "🤖",
      label: "AI Analysis",
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
