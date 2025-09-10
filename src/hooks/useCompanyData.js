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
          fetchedCompanyData.has_chart
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

        // Safely extract chart data
        const fetchedChartData =
          chartResponse?.chart_data ||
          fetchedCompanyData.chart_json ||
          fetchedCompanyData.chart_data ||
          fetchedCompanyData.data?.chart_json ||
          fetchedCompanyData.data?.chart_data;

        // Extract metrics and analysis
        const fetchedMetricsData =
          fetchedCompanyData.data?.metrics ||
          metrics?.metrics ||
          (metrics?.company || metrics?.data)?.metrics;

        const fetchedAnalysisData =
          fetchedCompanyData.data?.ai_analysis ||
          (analysis?.company || analysis?.data)?.ai_analysis ||
          analysis?.analysis;

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
