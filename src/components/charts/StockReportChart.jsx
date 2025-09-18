"use client";

import React, { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  annotationPlugin
);

const StockReportChart = ({ ticker }) => {
  const [stockData, setStockData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVolume, setShowVolume] = useState(true); // Show/hide volume bars

  useEffect(() => {
    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stock data and company data in parallel
      const [stockResponse, companyResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/frc/company/${ticker}/stock-data`),
        fetch(`http://localhost:8000/api/frc/company/${ticker}`)
      ]);

      if (!stockResponse.ok || !companyResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const stockData = await stockResponse.json();
      const companyData = await companyResponse.json();

      // Process stock data (sort chronologically)
      const processedStockData = stockData.stock_data
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Extract report data
      const reports = companyData.company?.data?.performance_metrics?.detailed_metrics || [];
      const processedReports = reports
        .map((report, index) => ({
          id: report.report_id,
          title: report.report_title,
          date: report.publication_date,
          reportNumber: index + 1,
          priceOnRelease: report.frc_30_day_analysis?.price_on_release,
          volumeOnRelease: report.frc_30_day_analysis?.volume_on_release,
          priceChange30Days: report.frc_30_day_analysis?.price_change_30_days_pct
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setStockData(processedStockData);
      setReportData(processedReports);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!stockData.length) return {};

    const labels = stockData.map(item => item.date);
    const prices = stockData.map(item => item.close);
    const volumes = stockData.map(item => item.volume);

    const datasets = [
      // Price Line Chart
      {
        label: 'Stock Price ($)',
        data: prices,
        type: 'line',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 6,
        yAxisID: 'y-price',
        order: 1
      }
    ];

    // Add Volume Bars if enabled
    if (showVolume) {
      datasets.push({
        label: 'Volume',
        data: volumes,
        type: 'bar',
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        borderColor: 'rgba(16, 185, 129, 0.6)',
        borderWidth: 1,
        yAxisID: 'y-volume',
        order: 2
      });
    }

    return {
      labels,
      datasets
    };
  };

  const getChartOptions = () => {
    const reportAnnotations = reportData.map((report) => ({
      type: 'line',
      mode: 'vertical',
      scaleID: 'x',
      value: report.date,
      borderColor: '#dc2626',
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        enabled: true,
        position: 'top',
        content: `Report ${report.reportNumber}`,
        backgroundColor: '#dc2626',
        color: 'white',
        font: {
          size: 10
        }
      }
    }));

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `${ticker} - Stock Price${showVolume ? ' & Volume' : ''} with Report Releases`,
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            afterBody: (context) => {
              const date = context[0].label;
              const report = reportData.find(r => r.date === date);
              if (report) {
                return [
                  '',
                  `📊 ${report.title}`,
                  `Price on Release: $${report.priceOnRelease}`,
                  `30-day Change: ${report.priceChange30Days?.toFixed(2)}%`
                ];
              }
              return [];
            }
          }
        },
        annotation: {
          annotations: reportAnnotations
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM dd'
            }
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        'y-price': {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Price ($)',
            color: '#3b82f6'
          },
          ticks: {
            color: '#3b82f6'
          }
        },
        'y-volume': {
          type: 'linear',
          display: showVolume,
          position: 'right',
          title: {
            display: true,
            text: 'Volume',
            color: '#10b981'
          },
          ticks: {
            color: '#10b981'
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
          }
        }
      }
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold">Error loading chart data</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {ticker} Stock Performance & Report Impact
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {stockData.length} data points • {reportData.length} reports tracked
            </p>
          </div>

          {/* Volume Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Show Volume</span>
            </label>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-96">
          <Chart type="line" data={getChartData()} options={getChartOptions()} />
        </div>
      </div>

      {/* Report Summary */}
      {reportData.length > 0 && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Report Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportData.map((report) => (
              <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
                  <span className="font-medium text-sm">Report {report.reportNumber}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{report.date}</p>
                <p className="text-sm font-medium text-gray-900 truncate" title={report.title}>
                  {report.title}
                </p>
                {report.priceChange30Days && (
                  <p className={`text-xs mt-2 font-medium ${
                    report.priceChange30Days > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    30-day impact: {report.priceChange30Days > 0 ? '+' : ''}{report.priceChange30Days.toFixed(2)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockReportChart;