"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading volume timeline...</p>
      </div>
    </div>
  ),
});

export default function VolumeTimelineChart({ metricsData, chartData, ticker }) {
  const timelineData = useMemo(() => {
    if (!metricsData || metricsData.length === 0 || !chartData) return null;

    // Get the chart data for volume information
    const stockData = Array.isArray(chartData) ? chartData : chartData.data || [];

    if (stockData.length === 0) return null;

    // Extract report release dates and their impact
    const reportData = metricsData.map(report => {
      const rawReport = report._raw;
      if (!rawReport) return null;

      return {
        date: rawReport.publication_date,
        priceOnRelease: rawReport.frc_30_day_analysis?.price_on_release || 0,
        volumeOnRelease: rawReport.frc_30_day_analysis?.volume_on_release || 0,
        volumeSpike: rawReport.frc_30_day_analysis?.volume_spike_30_days_pct || 0,
        volumeChange: rawReport.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0,
        priceChange30d: rawReport.frc_30_day_analysis?.price_change_30_days_pct || 0,
        title: rawReport.report_title
      };
    }).filter(Boolean);

    if (reportData.length === 0) return null;

    // Prepare volume data
    const dates = stockData.map(d => d.date || d.x);
    const volumes = stockData.map(d => d.volume || d.y);
    const prices = stockData.map(d => d.price || d.close);

    // Create traces
    const traces = [
      {
        x: dates,
        y: volumes,
        type: 'bar',
        name: 'Trading Volume',
        opacity: 0.6,
        marker: { color: '#3b82f6' },
        yaxis: 'y1',
        hovertemplate: '<b>Volume:</b> %{y:,.0f}<br><b>Date:</b> %{x}<extra></extra>'
      },
      {
        x: dates,
        y: prices,
        type: 'scatter',
        mode: 'lines',
        name: 'Stock Price',
        line: { color: '#10b981', width: 2 },
        yaxis: 'y2',
        hovertemplate: '<b>Price:</b> $%{y:.2f}<br><b>Date:</b> %{x}<extra></extra>'
      }
    ];

    // Add report markers
    reportData.forEach((report, index) => {
      // Find closest volume data point
      const reportDate = new Date(report.date);
      const closestDataPoint = stockData.find(d =>
        Math.abs(new Date(d.date || d.x) - reportDate) < 24 * 60 * 60 * 1000 // within 1 day
      );

      if (closestDataPoint) {
        traces.push({
          x: [report.date],
          y: [closestDataPoint.volume || closestDataPoint.y],
          type: 'scatter',
          mode: 'markers',
          name: `Report ${index + 1}`,
          marker: {
            color: report.volumeChange > 0 ? '#10b981' : '#ef4444',
            size: Math.max(8, Math.min(20, Math.abs(report.volumeChange) / 2)),
            symbol: 'diamond',
            line: { color: 'white', width: 2 }
          },
          yaxis: 'y1',
          hovertemplate:
            `<b>Report Release</b><br>` +
            `<b>Title:</b> ${report.title}<br>` +
            `<b>Volume Change:</b> ${report.volumeChange.toFixed(1)}%<br>` +
            `<b>Volume Spike:</b> ${report.volumeSpike.toFixed(1)}%<br>` +
            `<b>Price Impact:</b> ${report.priceChange30d.toFixed(1)}%<br>` +
            `<extra></extra>`,
          showlegend: false
        });
      }
    });

    const layout = {
      title: {
        text: `${ticker} - Volume Analysis Around Report Releases`,
        font: { size: 16, color: '#1f2937' }
      },
      xaxis: {
        title: 'Date',
        type: 'date',
        gridcolor: '#f3f4f6'
      },
      yaxis: {
        title: 'Trading Volume',
        side: 'left',
        gridcolor: '#f3f4f6',
        tickformat: ',.0f'
      },
      yaxis2: {
        title: 'Stock Price ($)',
        overlaying: 'y',
        side: 'right',
        gridcolor: 'rgba(0,0,0,0)',
        tickformat: '$.2f'
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0,
        y: -0.2
      },
      hovermode: 'x unified',
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      annotations: reportData.map((report, index) => ({
        x: report.date,
        y: 1.05,
        xref: 'x',
        yref: 'paper',
        text: `📊 R${index + 1}`,
        showarrow: true,
        arrowhead: 2,
        arrowsize: 1,
        arrowwidth: 2,
        arrowcolor: report.volumeChange > 0 ? '#10b981' : '#ef4444',
        bgcolor: 'white',
        bordercolor: report.volumeChange > 0 ? '#10b981' : '#ef4444',
        borderwidth: 1,
        font: { size: 10 }
      }))
    };

    return { data: traces, layout };
  }, [metricsData, chartData, ticker]);

  if (!timelineData) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Volume Timeline Analysis</h3>
          <p className="text-gray-500">Insufficient data for volume timeline visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Volume Timeline Analysis</h3>
        <p className="text-sm text-gray-600">
          Trading volume and price movements with report release markers.
          Diamond markers show report releases with size indicating volume impact strength.
        </p>
      </div>

      <div className="w-full">
        <Plot
          data={timelineData.data}
          layout={{
            ...timelineData.layout,
            autosize: true,
            height: 500,
            margin: { l: 60, r: 60, t: 60, b: 100 }
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            toImageButtonOptions: {
              format: 'png',
              filename: `${ticker}_volume_timeline`,
              height: 600,
              width: 1000,
              scale: 1
            }
          }}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 opacity-60"></div>
          <span>Trading Volume</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-2 bg-green-500 rounded"></div>
          <span>Stock Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 transform rotate-45"></div>
          <span>Report Releases</span>
        </div>
      </div>
    </div>
  );
}