import CompanyMetrics from "./company/CompanyMetrics";

export default function TableComponent({
  metrics,
  ticker,
  currency,
  totalReports,
}) {
  return (
    <div className="mt-4">
      <CompanyMetrics
        ticker={ticker}
        metrics={metrics || []}
        currency={currency || "USD"}
        totalReports={totalReports || (metrics ? metrics.length : 0)}
      />
    </div>
  );
}
