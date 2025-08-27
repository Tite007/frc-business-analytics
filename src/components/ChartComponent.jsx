"use client";

import InteractiveChart from "./charts/InteractiveChart";

export default function ChartComponent({
  chartData,
  ticker,
  companyName,
  exchange,
  currency,
}) {
  // If chartData is passed directly, use it; otherwise show loading
  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold mb-2">Stock Performance</h2>
      <InteractiveChart
        chartData={chartData}
        ticker={ticker}
        companyName={companyName}
        exchange={exchange}
        currency={currency}
        height={400}
        showControls={true}
      />
    </div>
  );
}
