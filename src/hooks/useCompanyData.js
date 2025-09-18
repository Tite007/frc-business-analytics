import { useState, useEffect } from "react";
import { getCompanyData } from "@/lib/api";

export function useCompanyData(ticker) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (!ticker) return;

    // Handle CMS route confusion
    if (ticker === "CMS") {
      setError({
        isCMSRedirect: true,
        message: "CMS is not a valid company ticker. Redirecting to CMS...",
      });
      setLoading(false);
      // Redirect to CMS after a short delay
      setTimeout(() => {
        window.location.href = "/cms";
      }, 2000);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get company details first
        const companyResponse = await getCompanyData(ticker, "company");

        // Enhanced error handling
        if (
          !companyResponse ||
          companyResponse.error ||
          (!companyResponse.success && companyResponse.status !== "success")
        ) {
          // Check if this is a company with PDF reports only
          if (
            companyResponse?.status === 404 ||
            companyResponse?.message?.includes("not found")
          ) {
            // Try to fetch basic company info from the companies list
            try {
              const companiesResponse = await getCompanyData(null, "companies");
              const company = companiesResponse?.companies?.find(
                (c) => c.ticker?.toUpperCase() === ticker
              );

              if (company) {
                setError({
                  isPdfOnly: true,
                  company: company,
                  message: "This company has PDF reports only",
                });
                setLoading(false);
                return;
              }
            } catch (listError) {
              console.error("Failed to fetch company list:", listError);
            }
          }

          // Log the error details for debugging
          console.error("Company data fetch failed:", {
            ticker,
            response: companyResponse,
            error: companyResponse?.error,
            message: companyResponse?.message,
            status: companyResponse?.status,
            baseURL: companyResponse?.baseURL,
          });

          setError(companyResponse);
          setLoading(false);
          return;
        }

        // Extract the actual company data from the response (handle both formats)
        const fetchedCompanyData =
          companyResponse.company || companyResponse.data;
        setCompanyData(fetchedCompanyData);

        // Fetch additional data in parallel (only if not included in main response)
        const [chartResponse, metrics, analysis] = await Promise.all([
          fetchedCompanyData.data_available?.has_chart ||
          fetchedCompanyData.has_chart ||
          (fetchedCompanyData.data?.stock_data && fetchedCompanyData.data.stock_data.length > 0) ||
          (fetchedCompanyData.stock_data && fetchedCompanyData.stock_data.length > 0)
            ? getCompanyData(ticker, "chart")
            : null,
          (fetchedCompanyData.data_available?.has_metrics ||
            fetchedCompanyData.has_metrics) &&
          !fetchedCompanyData.data?.metrics
            ? getCompanyData(ticker, "metrics")
            : null,
          fetchedCompanyData.data_available?.has_ai_analysis &&
          !fetchedCompanyData.data?.ai_analysis
            ? getCompanyData(ticker, "analysis")
            : null,
        ]);

        // Extract raw chart data - try multiple sources
        const rawChartData =
          chartResponse?.chart_data ||
          fetchedCompanyData.chart_json ||
          fetchedCompanyData.chart_data ||
          fetchedCompanyData.data?.chart_json ||
          fetchedCompanyData.data?.chart_data ||
          fetchedCompanyData.data?.stock_data || // Use stock_data from MongoDB
          fetchedCompanyData.stock_data || // Direct stock_data property
          fetchedCompanyData.data?.chart_data || // Try chart_data array from MongoDB
          // If chart endpoint returns empty, try comprehensive endpoint
          ((!chartResponse?.chart_data || Object.keys(chartResponse?.chart_data || {}).length === 0) &&
            (fetchedCompanyData.data?.stock_data || fetchedCompanyData.data?.chart_data));

        // Transform chart data to Plotly format if needed
        let fetchedChartData = null;

        // Debug logging
        console.log(`📊 Chart data sources for ${ticker}:`, {
          chartResponse: chartResponse?.chart_data ? "✅" : "❌",
          chart_json: fetchedCompanyData.chart_json ? "✅" : "❌",
          chart_data: fetchedCompanyData.chart_data ? "✅" : "❌",
          nested_chart_data: fetchedCompanyData.data?.chart_data ? `✅ (${fetchedCompanyData.data?.chart_data?.length} records)` : "❌",
          stock_data: fetchedCompanyData.data?.stock_data ? `✅ (${fetchedCompanyData.data?.stock_data?.length} records)` : "❌",
          direct_stock_data: fetchedCompanyData.stock_data ? `✅ (${fetchedCompanyData.stock_data?.length} records)` : "❌",
          has_chart_flag: fetchedCompanyData.has_chart ? "✅" : "❌",
          data_quality_chart: fetchedCompanyData.data_quality?.has_chart ? "✅" : "❌",
          rawChartData: rawChartData ? (Array.isArray(rawChartData) ? `Array(${rawChartData.length})` : typeof rawChartData) : "❌"
        });

        if (rawChartData) {
          // If already in Plotly format (has .data and .layout)
          if (rawChartData.data && rawChartData.layout) {
            fetchedChartData = rawChartData;
          }
          // If it's an array of price/volume data, transform it
          else if (Array.isArray(rawChartData) && rawChartData.length > 0) {
            const dates = rawChartData.map(d => d.date);
            // Handle both formats: {price, volume} and {close, volume}
            const prices = rawChartData.map(d => d.price || d.close || d.high || d.low || d.open);
            const volumes = rawChartData.map(d => d.volume);

            fetchedChartData = {
              data: [
                {
                  x: dates,
                  y: prices,
                  type: 'scatter',
                  mode: 'lines',
                  name: 'Price',
                  line: { color: '#3b82f6', width: 2 },
                  yaxis: 'y1'
                },
                {
                  x: dates,
                  y: volumes,
                  type: 'bar',
                  name: 'Volume',
                  opacity: 0.3,
                  marker: { color: '#10b981' },
                  yaxis: 'y2'
                }
              ],
              layout: {
                title: `${ticker} Stock Performance`,
                xaxis: {
                  title: 'Date',
                  type: 'date'
                },
                yaxis: {
                  title: `Price (${fetchedCompanyData.currency || 'USD'})`,
                  side: 'left'
                },
                yaxis2: {
                  title: 'Volume',
                  overlaying: 'y',
                  side: 'right'
                },
                showlegend: true,
                hovermode: 'x unified'
              }
            };
          }
        } else {
          console.warn(`⚠️ No chart data available for ${ticker} - all sources returned empty`);
        }

        // Extract and transform metrics data to match component expectations
        let fetchedMetricsData = null;
        if (metrics?.metrics) {
          // Transform new metrics format to legacy format expected by components
          fetchedMetricsData = metrics.metrics.map((report) => ({
            "Report Number": report.report_id,
            "Report Title": report.report_title,
            "Publication Date": report.publication_date,
            "Price on Release": report.frc_30_day_analysis?.price_on_release || 0,
            "Volume Change 30 Days (%)": report.frc_30_day_analysis?.volume_spike_30_days_pct || 0,
            "Volume Change Pre-Post 30 Days (%)": report.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0,
            "Avg Volume Post 5 Days": report.window_5_days?.avg_volume_post || 0,
            "Avg Volume Post 10 Days": report.window_10_days?.avg_volume_post || 0,
            "Price Change 30 Days (%)": report.frc_30_day_analysis?.price_change_30_days_pct || 0,
            "Price Change 15 Days (%)": report.frc_15_day_analysis?.price_change_15_days_pct || 0,
            "Volatility (%)": report.volatility_analysis?.annualized_volatility_pct || 0,
            "Report Type": report.report_type || "digital",
            // Add raw data for potential future use
            _raw: report
          }));
        } else if (fetchedCompanyData.data?.enhanced_metrics_v3) {
          // Also check for enhanced_metrics_v3 in company data
          fetchedMetricsData = fetchedCompanyData.data.enhanced_metrics_v3.map((report) => ({
            "Report Number": report.report_id,
            "Report Title": report.report_title,
            "Publication Date": report.publication_date,
            "Price on Release": report.frc_30_day_analysis?.price_on_release || 0,
            "Volume Change 30 Days (%)": report.frc_30_day_analysis?.volume_spike_30_days_pct || 0,
            "Volume Change Pre-Post 30 Days (%)": report.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0,
            "Avg Volume Post 5 Days": 0, // Not available in enhanced_metrics_v3
            "Avg Volume Post 10 Days": 0, // Not available in enhanced_metrics_v3
            "Price Change 30 Days (%)": report.frc_30_day_analysis?.price_change_30_days_pct || 0,
            "Price Change 15 Days (%)": report.frc_15_day_analysis?.price_change_15_days_pct || 0,
            "Volatility (%)": report.volatility_analysis?.annualized_volatility_pct || 0,
            "Report Type": report.report_type || "digital",
            // Add raw data for potential future use
            _raw: report
          }));
        }

        // Extract analysis data
        const fetchedAnalysisData =
          analysis?.ai_analysis ||
          fetchedCompanyData.data?.ai_analysis ||
          fetchedCompanyData.ai_analysis;

        setChartData(fetchedChartData);
        setMetricsData(fetchedMetricsData);
        setAnalysisData(fetchedAnalysisData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError({ error: true, message: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  return {
    loading,
    error,
    companyData,
    chartData,
    metricsData,
    analysisData,
  };
}
