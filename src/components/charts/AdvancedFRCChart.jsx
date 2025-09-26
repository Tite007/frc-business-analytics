"use client";

import React from "react";
import LightweightFRCChart from "./LightweightFRCChart";

const AdvancedFRCChart = ({
  chartData,
  reportDates = [], // Array of actual report dates from API
  ticker,
  companyName,
  exchange = null,
  height = 700,
  showVolume = true,
  showCandlestick = false,
  selectedReports = [],
  onReportToggle = null,
}) => {
  // Use the new Lightweight Charts implementation
  return (
    <LightweightFRCChart
      chartData={chartData}
      reportDates={reportDates}
      ticker={ticker}
      companyName={companyName}
      exchange={exchange}
      height={height}
      showVolume={showVolume}
      selectedReports={selectedReports}
      onReportToggle={onReportToggle}
    />
  );
};

export default AdvancedFRCChart;