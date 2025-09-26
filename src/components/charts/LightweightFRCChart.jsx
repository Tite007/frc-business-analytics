"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { createChart, ColorType, LineSeries, HistogramSeries, createSeriesMarkers } from "lightweight-charts";
import { InformationCircleIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { getFinancialModelingPrepQuote } from "@/lib/api";

// TradingView ticker formatting utility - dynamic based on API data
const formatTradingViewTicker = (ticker, exchange, chartData) => {
  if (!ticker) return '';

  // Get exchange info from multiple possible sources
  const exchangeInfo = exchange ||
    chartData?.exchange ||
    chartData?.company_data?.exchange ||
    chartData?.market_info?.exchange ||
    null;

  // If we have exchange info, use it directly in TradingView format
  if (exchangeInfo) {
    // Clean up exchange name for TradingView format
    const cleanExchange = exchangeInfo.toUpperCase()
      .replace(/\s+/g, '') // Remove spaces
      .replace('NASDAQ', 'NASDAQ')
      .replace('NYSE', 'NYSE')
      .replace('AMEX', 'AMEX');

    return `${cleanExchange}:${ticker.toUpperCase()}`;
  }

  // If no exchange info available, return ticker as-is
  return ticker.toUpperCase();
};

// Tooltip component for information display
const InfoTooltip = ({ title, formula, explanation }) => {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-80 max-w-96">
        <div className="font-semibold text-blue-200 mb-2">{title}</div>
        <div className="mb-2">
          <span className="font-medium">Formula:</span>
          <div className="font-mono bg-gray-800 p-2 rounded mt-1 text-green-300">
            {formula}
          </div>
        </div>
        <div>
          <span className="font-medium">Explanation:</span>
          <div className="mt-1 text-gray-300">{explanation}</div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

const LightweightFRCChart = ({
  chartData,
  reportDates = [],
  ticker,
  companyName,
  exchange = null,
  height = 700,
  showVolume = true,
  selectedReports = [],
  onReportToggle = null,
}) => {
  const chartContainerRef = useRef();
  const chart = useRef();
  const [livePrice, setLivePrice] = useState(null);
  const [livePriceLoading, setLivePriceLoading] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Memoize selectedReports to prevent dependency array issues
  const memoizedSelectedReports = useMemo(() => selectedReports, [JSON.stringify(selectedReports)]);

  // Auto-select all reports on first load to show full picture
  useEffect(() => {
    if (reportDates && reportDates.length > 0 && onReportToggle && !hasAutoSelected && selectedReports.length === 0) {
      console.log('Auto-selecting all reports for full picture view');
      setHasAutoSelected(true);

      // Select all reports automatically
      reportDates.forEach((report, index) => {
        const reportNumber = report.reportNumber || report.id || (index + 1);
        setTimeout(() => {
          onReportToggle({
            id: reportNumber,
            date: report.date || report.publication_date,
            title: report.title || `Report ${reportNumber}`,
            reportNumber: reportNumber,
            isSelected: true,
            autoSelect: true
          });
        }, index * 100); // Stagger the selections slightly
      });
    }
  }, [reportDates, onReportToggle, hasAutoSelected, selectedReports.length]);

  // Fetch live price data
  useEffect(() => {
    const fetchLivePrice = async () => {
      if (!ticker) return;

      setLivePriceLoading(true);
      try {
        const response = await getFinancialModelingPrepQuote(ticker);
        if (response.success) {
          setLivePrice(response.data);
        } else {
          console.warn('Live price not available:', response.message);
        }
      } catch (error) {
        console.error('Error fetching live price:', error);
      } finally {
        setLivePriceLoading(false);
      }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || !chartData.chart_data) return;

    // Create chart
    chart.current = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'white' },
        textColor: '#333333',
      },
      width: chartContainerRef.current.clientWidth,
      height: height - 100, // Account for controls
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: '#cccccc',
      },
      timeScale: {
        borderColor: '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Prepare data for Lightweight Charts (Line series)
    const lineData = chartData.chart_data.map(item => ({
      time: item.date,
      value: item.price,
    }));

    // Add line series using the correct API from docs
    const lineSeries = chart.current.addSeries(LineSeries, {
      color: '#2563eb',
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: '#2563eb',
      crosshairMarkerBackgroundColor: '#2563eb',
    });

    lineSeries.setData(lineData);

    // Add volume series if enabled
    if (showVolume) {
      const volumeData = chartData.chart_data.map(item => ({
        time: item.date,
        value: item.volume || 0,
        color: (item.price >= (item.open || item.price)) ? '#10b98180' : '#ef444480',
      }));

      const volumeSeries = chart.current.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume', // Create separate scale for volume
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#26a69a',
        crosshairMarkerBackgroundColor: '#26a69a',
      });

      volumeSeries.setData(volumeData);

      // Configure volume scale to show on right side and take bottom 25% of chart
      chart.current.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.75,
          bottom: 0,
        },
        visible: true,
        position: 'right',
      });
    }

    // Add FRC report markers
    if (reportDates && reportDates.length > 0) {
      const processedReportDates = reportDates.map((report, index) => ({
        date: report.date || report.publication_date,
        reportNumber: report.reportNumber || report.id || (index + 1),
        title: report.title || `Report ${report.reportNumber || (index + 1)}`,
        description: report.description || report.title || `Research report ${report.reportNumber || (index + 1)}`,
        is_pdf: report.is_pdf
      })).filter(report => report.date);

      const markers = processedReportDates.map(report => {
        const isSelected = memoizedSelectedReports.includes(report.reportNumber);
        return {
          time: report.date,
          position: 'aboveBar',
          color: isSelected
            ? '#dc2626' // Red for selected reports
            : report.is_pdf ? '#8b5cf6' : '#f59e0b', // Purple for PDF, amber for digital
          shape: 'circle',
          text: `R${report.reportNumber}`, // Show "R1", "R2", etc.
          size: isSelected ? 3 : 2, // Bigger size for selected reports
          id: report.reportNumber,
        };
      });

      // Create series markers using v5 API
      createSeriesMarkers(lineSeries, markers);

      // Add vertical lines for ALL reports (connecting markers to price line)
      processedReportDates.forEach(report => {
        const isSelected = memoizedSelectedReports.includes(report.reportNumber);

        try {
          // Find the actual price at this report date - try exact match first
          let dataPoint = chartData.chart_data.find(d => d.date === report.date);

          // If no exact match, find the closest date
          if (!dataPoint) {
            const reportTime = new Date(report.date).getTime();
            let closestPoint = null;
            let minTimeDiff = Infinity;

            chartData.chart_data.forEach(d => {
              const dataTime = new Date(d.date).getTime();
              const timeDiff = Math.abs(dataTime - reportTime);
              if (timeDiff < minTimeDiff) {
                minTimeDiff = timeDiff;
                closestPoint = d;
              }
            });

            dataPoint = closestPoint;
            console.log(`Report ${report.reportNumber} (${report.date}): Using closest data point ${dataPoint?.date} (${Math.round(minTimeDiff / (1000 * 60 * 60 * 24))} days diff)`);
          }

          if (dataPoint) {
            // Create a vertical line from the price point to above the chart
            const verticalLineSeries = chart.current.addSeries(LineSeries, {
              color: isSelected ? '#dc2626' : (report.is_pdf ? '#8b5cf680' : '#f59e0b80'),
              lineWidth: isSelected ? 2 : 1,
              lineStyle: isSelected ? 0 : 1, // Solid for selected, dashed for unselected
              crosshairMarkerVisible: false,
              priceScaleId: '',
              lastValueVisible: false,
              priceLineVisible: false,
            });

            // Get the price range to determine how high the line should go
            const priceRange = chartData.chart_data.reduce((acc, d) => ({
              min: Math.min(acc.min, d.low || d.price),
              max: Math.max(acc.max, d.high || d.price)
            }), { min: Infinity, max: -Infinity });

            // Create vertical line from the actual price point upward
            const actualPrice = dataPoint.price || dataPoint.close || dataPoint.value;
            const lineTop = priceRange.max * 1.15; // Extend above the highest price

            // Use the report date for the line (not the data point date)
            verticalLineSeries.setData([
              { time: report.date, value: actualPrice }, // Start at actual price
              { time: report.date, value: lineTop }      // End above chart
            ]);

            console.log(`Created line for Report ${report.reportNumber}: ${report.date} at price ${actualPrice}`);
          } else {
            console.warn(`No data point found for Report ${report.reportNumber} at date ${report.date}`);
          }
        } catch (error) {
          console.warn(`Could not create vertical line for report ${report.reportNumber}:`, error);
        }
      });
    }

    // Add click event handler for marker interaction
    if (onReportToggle) {
      chart.current.subscribeClick((param) => {
        if (param.point && reportDates && reportDates.length > 0) {
          // Find if click was near a report marker
          const clickTime = param.time;
          const processedReportDates = reportDates.map((report, index) => ({
            date: report.date || report.publication_date,
            reportNumber: report.reportNumber || report.id || (index + 1),
            title: report.title || `Report ${report.reportNumber || (index + 1)}`,
            is_pdf: report.is_pdf
          })).filter(report => report.date);

          // Check if click is close to any report date (within reasonable tolerance)
          const clickedReport = processedReportDates.find(report => {
            const reportTime = new Date(report.date).getTime() / 1000;
            const clickTimeMs = new Date(clickTime).getTime() / 1000;
            const timeDiff = Math.abs(reportTime - clickTimeMs);
            // Allow clicks within 3 days tolerance for easier interaction
            return timeDiff < 3 * 24 * 60 * 60;
          });

          if (clickedReport) {
            onReportToggle({
              id: clickedReport.reportNumber,
              date: clickedReport.date,
              title: clickedReport.title,
              reportNumber: clickedReport.reportNumber,
              isSelected: !memoizedSelectedReports.includes(clickedReport.reportNumber)
            });
          }
        }
      });
    }

    // Handle resize
    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, [chartData, reportDates, height, showVolume, memoizedSelectedReports]);

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
    <div className="w-full bg-white rounded-lg shadow-lg border lightweight-frc-chart">
      {/* Enhanced Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {companyName || chartData.company_name}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-lg text-blue-600 font-semibold">{ticker}</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">TradingView:</span>
                <code className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono">
                  {formatTradingViewTicker(ticker, exchange, chartData)}
                </code>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
              <span>📊 {chartData.total_data_points?.toLocaleString() || chartData.chart_data.length} data points</span>
              <span>📋 {chartData.reports_coverage?.total_reports || 0} FRC reports</span>
              <span>📅 {chartData.reports_coverage?.date_span_days || 0} days coverage</span>
              {exchange && <span>🏦 {exchange}</span>}
            </div>
          </div>
          <div className="text-right">
            {/* Live Price Display */}
            {livePrice ? (
              <div className="space-y-1">
                <div className="flex items-center justify-end gap-2">
                  <div className="text-3xl font-bold text-gray-900">
                    ${livePrice.price?.toFixed(2) || 'N/A'}
                  </div>
                  {livePrice.change !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${
                      livePrice.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {livePrice.change >= 0 ? (
                        <ArrowUpIcon className="h-3 w-3" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3" />
                      )}
                      <span>{livePrice.change >= 0 ? '+' : ''}${livePrice.change?.toFixed(2)}</span>
                      <span>({livePrice.changePercentage >= 0 ? '+' : ''}{livePrice.changePercentage?.toFixed(2)}%)</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-green-600 font-medium">Live Price</div>
                <div className="text-xs text-gray-400">
                  Last updated: {new Date(livePrice.lastUpdated).toLocaleTimeString()}
                </div>
              </div>
            ) : livePriceLoading ? (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                </div>
                <div className="text-sm text-gray-500">Loading live price...</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-3xl font-bold text-gray-900">
                  ${chartData.chart_data[chartData.chart_data.length - 1]?.price?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Historical Price</div>
                <div className="text-xs text-orange-500">Live data unavailable</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-0.5 bg-blue-600"></div>
              <span>Stock Price</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-2 bg-gray-400 opacity-60"></div>
              <span>Volume</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-amber-500"></div>
              <span className="text-amber-600">Digital Reports</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500"></div>
              <span className="text-purple-600">PDF Reports</span>
            </div>
            {memoizedSelectedReports.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-600"></div>
                <span className="text-red-600">Selected ({memoizedSelectedReports.length})</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartContainerRef} style={{ height: `${height - 150}px` }} />

      {/* Report Timeline Cards */}
      {reportDates && reportDates.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">FRC Reports Timeline</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onReportToggle) {
                    // Select all reports to show full picture
                    reportDates.forEach((report, index) => {
                      const reportNumber = report.reportNumber || report.id || (index + 1);
                      if (!memoizedSelectedReports.includes(reportNumber)) {
                        onReportToggle({
                          id: reportNumber,
                          date: report.date || report.publication_date,
                          title: report.title || `Report ${reportNumber}`,
                          reportNumber: reportNumber,
                          isSelected: true
                        });
                      }
                    });
                  }
                }}
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors font-medium"
              >
                🎯 Show All Reports
              </button>
              <button
                onClick={() => {
                  if (onReportToggle) {
                    // Clear all selections
                    memoizedSelectedReports.forEach(reportId => {
                      onReportToggle({
                        id: reportId,
                        date: '',
                        title: '',
                        reportNumber: reportId,
                        isSelected: false,
                        clearAll: true
                      });
                    });
                  }
                }}
                className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                🔄 Clear All
              </button>
              <button
                onClick={() => {
                  if (chart.current) {
                    chart.current.timeScale().fitContent();
                  }
                }}
                className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                📊 Fit All
              </button>
              <span className="text-xs text-gray-500">{reportDates.length} reports</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {reportDates.map((report, index) => {
              const reportNumber = report.reportNumber || report.id || (index + 1);
              const isSelected = memoizedSelectedReports.includes(reportNumber);
              const reportDate = new Date(report.date || report.publication_date);

              return (
                <div
                  key={reportNumber}
                  data-report-id={reportNumber}
                  className={`flex-shrink-0 cursor-pointer transition-all transform hover:scale-105 ${
                    isSelected ? 'scale-110' : ''
                  }`}
                  onClick={() => {
                    // Toggle selection
                    if (onReportToggle) {
                      onReportToggle({
                        id: reportNumber,
                        date: report.date || report.publication_date,
                        title: report.title || `Report ${reportNumber}`,
                        reportNumber: reportNumber,
                        isSelected: !isSelected
                      });
                    }

                    // Navigate chart to report date
                    if (chart.current) {
                      try {
                        const reportDate = report.date || report.publication_date;
                        const dataIndex = chartData.chart_data.findIndex(item => item.date === reportDate);

                        if (dataIndex >= 0) {
                          // Set visible range to show ~60 days around the report (30 days before and after)
                          const startIndex = Math.max(0, dataIndex - 30);
                          const endIndex = Math.min(chartData.chart_data.length - 1, dataIndex + 30);

                          chart.current.timeScale().setVisibleRange({
                            from: chartData.chart_data[startIndex].date,
                            to: chartData.chart_data[endIndex].date
                          });

                          // Also scroll the report into view in the timeline if needed
                          setTimeout(() => {
                            const badge = document.querySelector(`[data-report-id="${reportNumber}"]`);
                            if (badge) {
                              badge.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                            }
                          }, 100);
                        }
                      } catch (error) {
                        console.warn('Could not navigate to report date:', error);
                      }
                    }
                  }}
                >
                  {/* Badge-style design */}
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border-2 font-medium text-sm transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-500 text-white shadow-lg'
                      : report.is_pdf
                      ? 'border-purple-300 bg-purple-100 text-purple-700 hover:border-purple-500 hover:bg-purple-200'
                      : 'border-amber-300 bg-amber-100 text-amber-700 hover:border-amber-500 hover:bg-amber-200'
                  }`}>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                      isSelected
                        ? 'bg-white text-red-500'
                        : 'bg-white text-gray-600'
                    }`}>
                      {reportNumber}
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">Report {reportNumber}</div>
                      <div className={`text-xs ${isSelected ? 'text-red-100' : 'text-gray-500'}`}>
                        {reportDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isSelected
                        ? 'bg-white bg-opacity-20 text-white'
                        : report.is_pdf
                        ? 'bg-purple-200 text-purple-800'
                        : 'bg-amber-200 text-amber-800'
                    }`}>
                      {report.is_pdf ? 'PDF' : 'Digital'}
                    </div>
                  </div>

                  {/* Interactive indicator */}
                  {isSelected && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="p-4 border-t">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            {livePrice ? (
              <>
                <div className="text-2xl font-bold text-green-600">
                  ${livePrice.price?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-green-600">Live Price</div>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  ${chartData.chart_data[chartData.chart_data.length - 1]?.price?.toFixed(2) || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Latest Historical</div>
              </>
            )}
          </div>
          {livePrice && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                livePrice.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {livePrice.change >= 0 ? '+' : ''}${livePrice.change?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Daily Change</div>
            </div>
          )}
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
              {chartData.reports_coverage?.total_reports || 0}
            </div>
            <div className="text-sm text-gray-500">Total Reports</div>
          </div>
          {livePrice && (
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {livePrice.volume?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">Live Volume</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LightweightFRCChart;