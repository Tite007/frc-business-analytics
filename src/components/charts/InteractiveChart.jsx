"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading chart...</p>
      </div>
    </div>
  ),
});

const InteractiveChart = ({
  chartData,
  ticker,
  companyName,
  exchange,
  currency,
  height = 500,
  showControls = true,
}) => {
  // Log for debugging
  console.log("InteractiveChart received chartData:", chartData);

  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-4">📊⚠️</div>
          <p className="text-yellow-600">
            No chart data available for {ticker}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Stock data may not be available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      {/* Chart Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {companyName || chartData.company_name} ({ticker})
            </h3>
            <p className="text-sm text-gray-500">
              {exchange || chartData.exchange} •{" "}
              {currency || chartData.currency}
            </p>
          </div>
          {showControls && (
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                📈 Analyze
              </button>
              <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                💾 Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="p-4">
        <Plot
          data={chartData.data}
          layout={{
            ...chartData.layout,
            width: undefined, // Let it be responsive
            height: height,
            autosize: true,
            margin: { l: 60, r: 60, t: 60, b: 60 },
            paper_bgcolor: "white",
            plot_bgcolor: "white",
          }}
          config={{
            responsive: true,
            displayModeBar: showControls,
            displaylogo: false,
            modeBarButtonsToRemove: ["pan2d", "lasso2d"],
            toImageButtonOptions: {
              format: "png",
              filename: `${ticker}_chart`,
              height: 800,
              width: 1200,
              scale: 1,
            },
          }}
          style={{ width: "100%", height: `${height}px` }}
        />
      </div>
    </div>
  );
};

export default InteractiveChart;
