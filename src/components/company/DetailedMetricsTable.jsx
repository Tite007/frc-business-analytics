export default function DetailedMetricsTable({
  metricsData,
  companyData,
  ticker,
}) {
  if (!metricsData || metricsData.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-5xl mb-4">📊</div>
        <p className="text-gray-500 text-lg font-medium">
          No metrics data available for this company.
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Check back later as we continuously update our data.
        </p>
      </div>
    );
  }

  const getCompanyName = () => {
    return (
      companyData.company_name ||
      companyData.company_data?.name ||
      companyData.data?.company_profile?.name ||
      ticker
    );
  };

  const tableHeaders = [
    { label: "Report #", color: "blue-400" },
    { label: "Report Title", color: "emerald-400" },
    { label: "Company", color: "purple-400" },
    { label: "Ticker", color: "indigo-400" },
    { label: "Price on Release", color: "green-400" },
    { label: "Publication Date", color: "orange-400" },
    { label: "Avg Volume 5D", color: "cyan-400" },
    { label: "Avg Volume 10D", color: "teal-400" },
    { label: "Volume Δ 30D (%)", color: "rose-400" },
    { label: "Pre-Post Δ 30D (%)", color: "amber-400" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
      {/* Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Report Performance Metrics
            </h3>
            <p className="text-gray-600">
              Comprehensive analysis of {metricsData.length} report
              {metricsData.length !== 1 ? "s" : ""} performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {metricsData.length} Reports
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-inner rounded-lg">
        <table className="min-w-full border-collapse border border-gray-400">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0 z-10">
            <tr className="border-b-2 border-slate-600">
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide shadow-sm ${
                    index < tableHeaders.length - 1
                      ? "border-r-2 border-slate-600"
                      : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 bg-${header.color} rounded-full shadow-sm`}
                    ></div>
                    <span className="font-semibold">{header.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {metricsData.map((report, index) => (
              <tr
                key={`${ticker}-${report["Report Number"]}`}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50 transition-colors duration-150 border-b-2 border-gray-400`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2 border-gray-400">
                  {report["Report Number"]}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 border-r-2 border-gray-400 max-w-xs">
                  <div className="truncate" title={report["Report Title"]}>
                    {report["Report Title"]}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2 border-gray-400">
                  {getCompanyName()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold border-r-2 border-gray-400">
                  {ticker}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                  {report["Price on Release"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                  {report["Publication Date"]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                  {report["Avg Volume Post 5 Days"]?.toLocaleString() || "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                  {report["Avg Volume Post 10 Days"]?.toLocaleString() || "0"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm border-r-2 border-gray-400">
                  <span
                    className={`font-semibold ${
                      report["Volume Change 30 Days (%)"] >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {report["Volume Change 30 Days (%)"] >= 0 ? "+" : ""}
                    {report["Volume Change 30 Days (%)"]?.toFixed(2) || "0.00"}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`font-semibold ${
                      report["Volume Change Pre-Post 30 Days (%)"] >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {report["Volume Change Pre-Post 30 Days (%)"] >= 0
                      ? "+"
                      : ""}
                    {report["Volume Change Pre-Post 30 Days (%)"]?.toFixed(2) ||
                      "0.00"}
                    %
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
