"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading correlation heatmap...</p>
      </div>
    </div>
  ),
});

export default function VolumeCorrelationHeatmap({ metricsData, ticker }) {
  const heatmapData = useMemo(() => {
    if (!metricsData || metricsData.length === 0) return null;

    const reports = metricsData.map(report => report._raw).filter(Boolean);
    if (reports.length === 0) return null;

    // Prepare metrics for correlation analysis
    const metrics = [
      'Volume Spike (%)',
      'Volume Change (%)',
      'Price Change 30D (%)',
      'Price Change 15D (%)',
      'Volatility (%)',
      'Volume Pre (Avg)',
      'Volume Post (Avg)'
    ];

    const data = reports.map(report => [
      report.frc_30_day_analysis?.volume_spike_30_days_pct || 0,
      report.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0,
      report.frc_30_day_analysis?.price_change_30_days_pct || 0,
      report.frc_15_day_analysis?.price_change_15_days_pct || 0,
      report.volatility_analysis?.annualized_volatility_pct || 0,
      report.frc_30_day_analysis?.avg_volume_pre_30_days || 0,
      report.frc_30_day_analysis?.avg_volume_post_30_days || 0
    ]);

    // Calculate correlation matrix
    const correlationMatrix = [];
    const metricLabels = [];

    for (let i = 0; i < metrics.length; i++) {
      correlationMatrix[i] = [];
      metricLabels[i] = metrics[i];

      for (let j = 0; j < metrics.length; j++) {
        if (i === j) {
          correlationMatrix[i][j] = 1.0;
        } else {
          // Calculate Pearson correlation coefficient
          const x = data.map(row => row[i]);
          const y = data.map(row => row[j]);
          correlationMatrix[i][j] = calculateCorrelation(x, y);
        }
      }
    }

    return {
      z: correlationMatrix,
      x: metricLabels,
      y: metricLabels
    };
  }, [metricsData]);

  // Helper function to calculate Pearson correlation
  function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  const summaryStats = useMemo(() => {
    if (!metricsData || metricsData.length === 0) return null;

    const reports = metricsData.map(report => report._raw).filter(Boolean);
    if (reports.length === 0) return null;

    const volumeChanges = reports.map(r => r.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0);
    const priceChanges = reports.map(r => r.frc_30_day_analysis?.price_change_30_days_pct || 0);
    const volumeSpikes = reports.map(r => r.frc_30_day_analysis?.volume_spike_30_days_pct || 0);

    return {
      avgVolumeChange: volumeChanges.reduce((a, b) => a + b, 0) / volumeChanges.length,
      avgPriceChange: priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length,
      avgVolumeSpike: volumeSpikes.reduce((a, b) => a + b, 0) / volumeSpikes.length,
      volumePriceCorrelation: calculateCorrelation(volumeChanges, priceChanges),
      strongPositiveVolume: volumeChanges.filter(v => v > 20).length,
      strongNegativeVolume: volumeChanges.filter(v => v < -20).length,
      neutralVolume: volumeChanges.filter(v => Math.abs(v) <= 20).length
    };
  }, [metricsData]);

  if (!heatmapData || !summaryStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Correlation Heatmap</h3>
          <p className="text-gray-500">Insufficient data for correlation analysis</p>
        </div>
      </div>
    );
  }

  const plotData = [{
    z: heatmapData.z,
    x: heatmapData.x,
    y: heatmapData.y,
    type: 'heatmap',
    colorscale: [
      [0, '#ef4444'],      // Strong negative correlation (red)
      [0.25, '#f97316'],   // Weak negative correlation (orange)
      [0.5, '#fbbf24'],    // No correlation (yellow)
      [0.75, '#84cc16'],   // Weak positive correlation (lime)
      [1, '#10b981']       // Strong positive correlation (green)
    ],
    colorbar: {
      title: 'Correlation Strength',
      titleside: 'right',
      tickmode: 'array',
      tickvals: [-1, -0.5, 0, 0.5, 1],
      ticktext: ['Strong -', 'Weak -', 'None', 'Weak +', 'Strong +']
    },
    hoverongaps: false,
    hovertemplate:
      '<b>%{y}</b> vs <b>%{x}</b><br>' +
      'Correlation: %{z:.3f}<br>' +
      '<extra></extra>'
  }];

  const layout = {
    title: {
      text: `${ticker} - Volume & Price Correlation Analysis`,
      font: { size: 16, color: '#1f2937' }
    },
    xaxis: {
      title: '',
      tickangle: -45,
      side: 'bottom'
    },
    yaxis: {
      title: '',
      autorange: 'reversed'
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
    margin: { l: 120, r: 100, t: 60, b: 120 }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Volume & Price Correlation Heatmap</h3>
        <p className="text-sm text-gray-600">
          Correlation matrix showing relationships between volume changes, price movements, and volatility metrics.
          Green indicates positive correlation, red indicates negative correlation.
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {summaryStats.volumePriceCorrelation.toFixed(3)}
          </div>
          <div className="text-xs text-blue-800">Volume-Price Correlation</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-green-600">
            {summaryStats.strongPositiveVolume}
          </div>
          <div className="text-xs text-green-800">Strong Positive Volume</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-gray-600">
            {summaryStats.neutralVolume}
          </div>
          <div className="text-xs text-gray-800">Neutral Volume Impact</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-red-600">
            {summaryStats.strongNegativeVolume}
          </div>
          <div className="text-xs text-red-800">Strong Negative Volume</div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="w-full">
        <Plot
          data={plotData}
          layout={{
            ...layout,
            autosize: true,
            height: 500
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoom2d'],
            toImageButtonOptions: {
              format: 'png',
              filename: `${ticker}_correlation_heatmap`,
              height: 600,
              width: 800,
              scale: 1
            }
          }}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Interpretation Guide:</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Strong Correlation (±0.7 to ±1.0):</span>
            <p className="text-gray-600">Variables move together consistently</p>
          </div>
          <div>
            <span className="font-medium">Moderate Correlation (±0.3 to ±0.7):</span>
            <p className="text-gray-600">Some relationship exists between variables</p>
          </div>
          <div>
            <span className="font-medium">Weak Correlation (-0.3 to +0.3):</span>
            <p className="text-gray-600">Little to no linear relationship</p>
          </div>
        </div>
      </div>
    </div>
  );
}