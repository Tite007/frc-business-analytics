"use client";

import React, { useMemo } from "react";
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

const FRCReportsChart = ({
  chartData,
  ticker,
  companyName,
  height = 600,
  showVolume = false,
}) => {
  const plotData = useMemo(() => {
    if (!chartData || !chartData.chart_data) {
      return { data: [], layout: {}, annotations: [] };
    }

    const data = chartData.chart_data;

    // Prepare main price trace
    const priceTrace = {
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

    // Prepare volume trace if requested
    const volumeTrace = showVolume ? {
      x: data.map(d => d.date),
      y: data.map(d => d.volume),
      type: 'bar',
      name: 'Volume',
      yaxis: 'y2',
      marker: {
        color: 'rgba(156, 163, 175, 0.3)'
      },
      hovertemplate:
        '<b>%{x}</b><br>' +
        'Volume: %{y:,.0f}<br>' +
        '<extra></extra>'
    } : null;

    // Create report date annotations
    const reportDates = [];
    const reportCoverage = chartData.reports_coverage;

    if (reportCoverage && reportCoverage.total_reports > 0) {
      // For this example, I'll create evenly spaced report dates
      // In production, you'd get these from your API
      const startDate = new Date(reportCoverage.oldest_report);
      const endDate = new Date(reportCoverage.newest_report);
      const totalReports = reportCoverage.total_reports;

      for (let i = 0; i < totalReports; i++) {
        const reportDate = new Date(
          startDate.getTime() +
          (i * (endDate.getTime() - startDate.getTime()) / (totalReports - 1))
        );
        reportDates.push({
          date: reportDate.toISOString().split('T')[0],
          reportNumber: i + 1
        });
      }
    }

    // Create vertical lines and annotations for reports
    const shapes = reportDates.map(report => ({
      type: 'line',
      x0: report.date,
      x1: report.date,
      y0: 0,
      y1: 1,
      yref: 'paper',
      line: {
        color: '#dc2626',
        width: 2,
        dash: 'dash'
      }
    }));

    const annotations = reportDates.map(report => ({
      x: report.date,
      y: 1,
      yref: 'paper',
      text: `Report ${report.reportNumber}`,
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 2,
      arrowcolor: '#dc2626',
      ax: 0,
      ay: -30,
      font: {
        size: 10,
        color: '#dc2626'
      },
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#dc2626',
      borderwidth: 1
    }));

    const traces = [priceTrace];
    if (volumeTrace) traces.push(volumeTrace);

    const layout = {
      title: {
        text: `${companyName || chartData.company_name} (${ticker}) - Stock Price with FRC Reports`,
        font: { size: 16 }
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
          ]
        }
      },
      yaxis: {
        title: 'Price ($)',
        side: 'left'
      },
      ...(showVolume && {
        yaxis2: {
          title: 'Volume',
          overlaying: 'y',
          side: 'right',
          showgrid: false
        }
      }),
      shapes: shapes,
      annotations: annotations,
      hovermode: 'x unified',
      legend: {
        x: 0,
        y: 1,
        traceorder: 'normal'
      },
      margin: { l: 60, r: 60, t: 80, b: 60 }
    };

    return { data: traces, layout, annotations };
  }, [chartData, ticker, companyName, showVolume]);

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
    <div className="w-full bg-white rounded-lg shadow-sm border">
      {/* Chart Header with Summary */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {companyName || chartData.company_name} ({ticker})
            </h3>
            <p className="text-sm text-gray-500">
              {chartData.total_data_points.toLocaleString()} data points •
              {chartData.reports_coverage.total_reports} FRC reports
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              <div>Data Range: {chartData.date_range.start} to {chartData.date_range.end}</div>
              <div>Reports: {chartData.reports_coverage.oldest_report} to {chartData.reports_coverage.newest_report}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-blue-600"></div>
            <span>Stock Price</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed border-red-600"></div>
            <span className="text-red-600">FRC Report Release</span>
          </div>
          {showVolume && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gray-300 opacity-30"></div>
              <span>Volume</span>
            </div>
          )}
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
              filename: `${ticker}_frc_reports_chart`,
              height: 800,
              width: 1200,
              scale: 2,
            },
          }}
          style={{ width: "100%", height: `${height}px` }}
        />
      </div>

      {/* Chart Summary Stats */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Current Price</div>
            <div className="text-blue-600">
              ${chartData.chart_data[chartData.chart_data.length - 1]?.price?.toFixed(2) || 'N/A'}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Price Range</div>
            <div className="text-gray-600">
              ${Math.min(...chartData.chart_data.map(d => d.low)).toFixed(2)} -
              ${Math.max(...chartData.chart_data.map(d => d.high)).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Total Reports</div>
            <div className="text-red-600">{chartData.reports_coverage.total_reports}</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Coverage Period</div>
            <div className="text-gray-600">{chartData.reports_coverage.date_span_days} days</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRCReportsChart;