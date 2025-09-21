"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading advanced chart...</p>
      </div>
    </div>
  ),
});

const AdvancedFRCChart = ({
  chartData,
  reportDates = [], // Array of actual report dates from API
  ticker,
  companyName,
  height = 700,
  showVolume = true,
  showCandlestick = false,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [highlightedReport, setHighlightedReport] = useState(null);

  const plotData = useMemo(() => {
    if (!chartData || !chartData.chart_data) {
      return { data: [], layout: {}, annotations: [] };
    }

    const data = chartData.chart_data;

    // Create main price trace (line or candlestick)
    const priceTrace = showCandlestick ? {
      x: data.map(d => d.date),
      open: data.map(d => d.open),
      high: data.map(d => d.high),
      low: data.map(d => d.low),
      close: data.map(d => d.price),
      type: 'candlestick',
      name: 'OHLC',
      increasing: { line: { color: '#10b981' } },
      decreasing: { line: { color: '#ef4444' } },
      hovertemplate:
        '<b>%{x}</b><br>' +
        'Open: $%{open:.2f}<br>' +
        'High: $%{high:.2f}<br>' +
        'Low: $%{low:.2f}<br>' +
        'Close: $%{close:.2f}<br>' +
        '<extra></extra>'
    } : {
      x: data.map(d => d.date),
      y: data.map(d => d.price),
      type: 'scatter',
      mode: 'lines',
      name: 'Stock Price',
      line: {
        color: '#2563eb',
        width: 2
      },
      hovertemplate:
        '<b>%{x}</b><br>' +
        'Price: $%{y:.2f}<br>' +
        '<extra></extra>'
    };

    // Volume trace
    const volumeTrace = showVolume ? {
      x: data.map(d => d.date),
      y: data.map(d => d.volume),
      type: 'bar',
      name: 'Volume',
      yaxis: 'y2',
      marker: {
        color: data.map(d => d.price > d.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)')
      },
      hovertemplate:
        '<b>%{x}</b><br>' +
        'Volume: %{y:,.0f}<br>' +
        '<extra></extra>'
    } : null;

    // Process report dates - use provided dates or generate from API data
    let processedReportDates = reportDates;
    if (!reportDates.length && chartData.reports_coverage?.total_reports > 0) {
      // Generate evenly spaced dates if no specific dates provided
      const startDate = chartData.reports_coverage.oldest_report
        ? new Date(chartData.reports_coverage.oldest_report)
        : new Date(data[0]?.date || Date.now());
      const endDate = chartData.reports_coverage.newest_report
        ? new Date(chartData.reports_coverage.newest_report)
        : new Date(data[data.length - 1]?.date || Date.now());
      const totalReports = chartData.reports_coverage.total_reports;

      // Validate dates before proceeding
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        processedReportDates = [];
      } else {
        processedReportDates = Array.from({ length: totalReports }, (_, i) => {
          const reportDate = new Date(
            startDate.getTime() +
            (i * (endDate.getTime() - startDate.getTime()) / Math.max(totalReports - 1, 1))
          );
          return {
            date: reportDate.toISOString().split('T')[0],
            reportNumber: i + 1,
            title: `FRC Report ${i + 1}`,
            description: `Research report published on ${reportDate.toDateString()}`
          };
        });
      }
    }

    // Create shapes for vertical lines
    const shapes = processedReportDates.map(report => ({
      type: 'line',
      x0: report.date,
      x1: report.date,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: {
        color: highlightedReport === report.reportNumber ? '#dc2626' : '#f59e0b',
        width: highlightedReport === report.reportNumber ? 3 : 2,
        dash: 'dash'
      }
    }));

    // Create annotations for report labels
    const annotations = processedReportDates.map((report, index) => ({
      x: report.date,
      y: 1,
      yref: 'paper',
      text: `R${report.reportNumber}`,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 2,
      arrowcolor: highlightedReport === report.reportNumber ? '#dc2626' : '#f59e0b',
      ax: 0,
      ay: -30 - (index % 2) * 15, // Alternate heights to avoid overlap
      font: {
        size: 10,
        color: highlightedReport === report.reportNumber ? '#dc2626' : '#f59e0b',
        family: 'Arial Black'
      },
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: highlightedReport === report.reportNumber ? '#dc2626' : '#f59e0b',
      borderwidth: 1,
      borderpad: 2
    }));

    const traces = [priceTrace];
    if (volumeTrace) traces.push(volumeTrace);

    const layout = {
      title: {
        text: `${companyName || chartData.company_name} (${ticker}) - Price Analysis with FRC Coverage`,
        font: { size: 18, family: 'Arial, sans-serif' }
      },
      xaxis: {
        title: 'Date',
        type: 'date',
        rangeslider: { visible: false },
        rangeselector: {
          buttons: [
            { count: 30, label: '30d', step: 'day', stepmode: 'backward' },
            { count: 90, label: '3m', step: 'day', stepmode: 'backward' },
            { count: 6, label: '6m', step: 'month', stepmode: 'backward' },
            { count: 1, label: '1y', step: 'year', stepmode: 'backward' },
            { step: 'all', label: 'All' }
          ],
          active: selectedTimeRange === 'all' ? 4 : 0
        },
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      yaxis: {
        title: `Price (${chartData.currency || 'USD'})`,
        side: 'left',
        showgrid: true,
        gridcolor: 'rgba(0,0,0,0.1)'
      },
      ...(showVolume && {
        yaxis2: {
          title: 'Volume',
          overlaying: 'y',
          side: 'right',
          showgrid: false,
          range: [0, Math.max(...data.map(d => d.volume)) * 4] // Scale volume appropriately
        }
      }),
      shapes: shapes,
      annotations: annotations,
      hovermode: 'x unified',
      legend: {
        x: 0,
        y: 1.1,
        orientation: 'h'
      },
      margin: { l: 70, r: 70, t: 100, b: 70 },
      showlegend: true
    };

    return { data: traces, layout, reportDates: processedReportDates };
  }, [chartData, reportDates, ticker, companyName, showVolume, showCandlestick, highlightedReport, selectedTimeRange]);

  if (!chartData || !chartData.chart_data || chartData.chart_data.length === 0) {
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
    <div className="w-full bg-white rounded-lg shadow-lg border">
      {/* Enhanced Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {companyName || chartData.company_name}
            </h2>
            <p className="text-lg text-blue-600 font-semibold">{ticker}</p>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📊 {chartData.total_data_points.toLocaleString()} data points</span>
              <span>📋 {chartData.reports_coverage.total_reports} FRC reports</span>
              <span>📅 {chartData.reports_coverage.date_span_days} days coverage</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              ${chartData.chart_data[chartData.chart_data.length - 1]?.price?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Current Price</div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show Volume</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showCandlestick}
                onChange={(e) => setShowCandlestick(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Candlestick View</span>
            </label>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-600"></div>
              <span>Stock Price</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-amber-500"></div>
              <span className="text-amber-600">FRC Reports</span>
            </div>
            {showVolume && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-gray-300 opacity-50"></div>
                <span>Volume</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="p-4">
        <Plot
          data={plotData.data}
          layout={{
            ...plotData.layout,
            width: undefined,
            height: height,
            autosize: true,
            paper_bgcolor: "white",
            plot_bgcolor: "white",
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ["pan2d", "lasso2d"],
            toImageButtonOptions: {
              format: "png",
              filename: `${ticker}_advanced_frc_chart`,
              height: 1000,
              width: 1600,
              scale: 2,
            },
          }}
          style={{ width: "100%", height: `${height}px` }}
          onHover={(data) => {
            // Handle hover events if needed
          }}
        />
      </div>

      {/* Reports Timeline */}
      {plotData.reportDates.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-3">FRC Reports Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plotData.reportDates.map((report) => (
              <div
                key={report.reportNumber}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  highlightedReport === report.reportNumber
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-amber-400 hover:bg-amber-50'
                }`}
                onClick={() => setHighlightedReport(
                  highlightedReport === report.reportNumber ? null : report.reportNumber
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">
                    Report {report.reportNumber}
                  </span>
                  <span className="text-sm text-gray-500">{report.date}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {report.description || `FRC analysis published`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${chartData.chart_data[chartData.chart_data.length - 1]?.price?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Latest Price</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${Math.max(...chartData.chart_data.map(d => d.high)).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">52W High</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${Math.min(...chartData.chart_data.map(d => d.low)).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">52W Low</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {chartData.reports_coverage.total_reports}
            </div>
            <div className="text-sm text-gray-500">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Math.round(chartData.total_data_points / chartData.reports_coverage.total_reports)}
            </div>
            <div className="text-sm text-gray-500">Avg Days/Report</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFRCChart;