// CLIENT-SIDE VERSION - Use this for client-side rendering
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ChartComponent from "@/components/ChartComponent";
import TableComponent from "@/components/TableComponent";
import AnalysisComponent from "@/components/AnalysisComponent";
import { getCompanyData } from "@/lib/api";
import Link from "next/link";

export default function CompanyPage() {
  const params = useParams();
  const ticker = params?.company?.toUpperCase();

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            Loading {ticker} data...
          </h2>
          <p className="text-gray-500 mt-2">
            Please wait while we fetch the company information.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    // Special handling for CMS redirect
    if (error.isCMSRedirect) {
      return (
        <div className="container mx-auto p-4">
          <div className="text-center py-16">
            <div className="text-blue-500 text-6xl mb-4">🔄</div>
            <h1 className="text-3xl font-bold text-blue-600 mb-4">
              Redirecting to CMS
            </h1>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/cms"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Go to CMS Now
              </Link>
              <Link
                href="/companies"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Browse Companies
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // Special handling for PDF-only companies
    if (error.isPdfOnly && error.company) {
      return (
        <div className="container mx-auto p-4">
          <div className="mb-4">
            <Link
              href="/companies"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ← Back to Companies
            </Link>
          </div>
          <div className="text-center py-16">
            <div className="text-amber-500 text-6xl mb-4">📄</div>
            <h1 className="text-3xl font-bold text-amber-600 mb-4">
              PDF Reports Available
            </h1>
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {error.company.company_name} ({ticker})
              </h2>
              <div className="flex justify-center gap-4 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {error.company.exchange}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {error.company.currency}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {error.company.industry}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              This company is covered by FRC with PDF reports available. Digital
              reports and interactive features are not yet available for this
              company.
            </p>

            {error.company.has_chart && (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <span>📊</span>
                  <span className="text-sm font-medium">
                    Stock data available
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                For access to PDF reports, please contact FRC directly.
              </p>
              <div className="flex justify-center gap-4">
                <Link
                  href="/companies"
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
                >
                  ← Back to Companies
                </Link>
                <button
                  onClick={() =>
                    window.open(
                      "mailto:contact@researchfrc.com?subject=PDF Report Request for " +
                        ticker,
                      "_blank"
                    )
                  }
                  className="bg-amber-600 text-white px-6 py-3 rounded hover:bg-amber-700"
                >
                  Request PDF Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Companies
          </Link>
        </div>
        <div className="text-center py-16">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            {error?.error ? "API Connection Error" : "Company Not Found"}
          </h1>
          <p className="text-gray-600 mb-4">
            {error?.error
              ? `Failed to connect to backend API: ${
                  error.message || "Unknown error"
                }`
              : `${ticker} is not found or not covered by FRC analysis.`}
          </p>
          {error?.error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-2xl mx-auto">
              <h3 className="font-semibold text-red-800 mb-2">
                Debug Information:
              </h3>
              <div className="text-sm text-red-700 space-y-1">
                <p>
                  <strong>API Base URL:</strong> {error.baseURL}
                </p>
                <p>
                  <strong>Status:</strong> {error.status}
                </p>
                <p>
                  <strong>Error:</strong> {error.message}
                </p>
              </div>
            </div>
          )}
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4 inline-block"
          >
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  // No company data
  if (!companyData) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ← Back to Companies
          </Link>
        </div>
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-gray-600 mb-4">
            No Data Available
          </h1>
          <p className="text-gray-500 mb-4">
            No company data could be loaded for {ticker}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="xl:container mx-auto max-w-7xl ">
        {/* Back Navigation */}
        <div className="mb-8">
          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
          >
            ← Back to Companies
          </Link>
        </div>

        {/* Enhanced Company Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl overflow-hidden shadow-xl mb-10">
          <div className="p-8 lg:p-12 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-8 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  {companyData.company_name ||
                    companyData.data?.company_profile?.name ||
                    companyData.company_data?.name ||
                    ticker}{" "}
                  <span className="text-blue-200">({ticker})</span>
                </h1>
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="px-5 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full text-sm font-medium">
                    {companyData.exchange ||
                      companyData.data?.company_profile?.exchange ||
                      "N/A"}
                  </span>
                  <span className="px-5 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-black rounded-full text-sm font-medium">
                    {companyData.currency ||
                      companyData.data?.company_profile?.currency ||
                      "USD"}
                  </span>
                  <span className="px-5 py-3 bg-emerald-500 text-white rounded-full text-sm font-bold">
                    ✓ FRC Covered
                  </span>
                </div>

                {/* Industry & Sector Info */}
                <div className="flex flex-wrap items-center gap-8 text-blue-100">
                  <div className="flex items-center gap-3">
                    <span className="text-base">🏭 Industry</span>
                    <span className="text-base font-medium">
                      {companyData.data?.company_profile?.industry ||
                        companyData.industry ||
                        companyData.company_data?.industry ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base">🏢 Sector</span>
                    <span className="text-base font-medium">
                      {companyData.data?.company_profile?.sector ||
                        companyData.sector ||
                        companyData.company_data?.sector ||
                        "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Availability Grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-3">
                {(companyData.data_available?.has_reports ||
                  companyData.reports_count > 0 ||
                  companyData.data?.reports?.length > 0) && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-2xl">📄</span>
                    <span className="text-sm font-medium text-black">
                      Reports (
                      {companyData.reports?.length ||
                        companyData.reports_count ||
                        companyData.data?.reports?.length ||
                        0}
                      )
                    </span>
                  </div>
                )}

                {(companyData.data_available?.has_chart ||
                  companyData.has_chart) && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-2xl">📊</span>
                    <span className="text-sm font-medium text-black">
                      Charts
                    </span>
                  </div>
                )}

                {(companyData.data_available?.has_metrics ||
                  companyData.has_metrics) && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-2xl">📈</span>
                    <span className="text-sm font-medium text-black">
                      Metrics
                    </span>
                  </div>
                )}

                {companyData.data_available?.has_ai_analysis && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg">
                    <span className="text-2xl">🤖</span>
                    <span className="text-sm font-medium text-black">
                      AI Analysis
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white divide-opacity-20">
              <div className="p-6 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-black mb-1">
                  {companyData.stock_data?.length ||
                    companyData.stock_data_points ||
                    "N/A"}
                </div>
                <div className="text-xs text-black font-medium opacity-80">
                  Stock Data Points
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-black mb-1">
                  {companyData.reports?.length ||
                    companyData.reports_count ||
                    companyData.data?.reports?.length ||
                    0}
                </div>
                <div className="text-xs text-black font-medium opacity-80">
                  Reports Available
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-emerald-600 mb-1">
                  {companyData.data_available?.has_chart ||
                  companyData.has_chart
                    ? "✓"
                    : "✗"}
                </div>
                <div className="text-xs  text-black font-medium opacity-80">
                  Stock Performance
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">
                  {companyData.data_available?.has_ai_analysis ? "✓" : "✗"}
                </div>
                <div className="text-xs text-black font-medium opacity-80">
                  AI Analysis
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8">
          {/* Chart Component */}
          {(chartData ||
            companyData.data_available?.has_chart ||
            companyData.has_chart) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
              <div className="p-6">
                <ChartComponent
                  chartData={chartData}
                  ticker={ticker}
                  companyName={
                    companyData.company_name ||
                    companyData.data?.company_profile?.name ||
                    ticker
                  }
                  exchange={
                    companyData.data?.company_profile?.exchange ||
                    companyData.exchange
                  }
                  currency={
                    companyData.data?.company_profile?.currency ||
                    companyData.currency ||
                    "CAD"
                  }
                />
              </div>
            </div>
          )}

          {/* Detailed Metrics Table */}
          {(metricsData ||
            companyData.data_available?.has_metrics ||
            companyData.has_metrics) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
              <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Report Performance Metrics
                    </h3>
                    <p className="text-gray-600">
                      Comprehensive analysis of {(metricsData || []).length}{" "}
                      report{(metricsData || []).length !== 1 ? "s" : ""}{" "}
                      performance
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {(metricsData || []).length} Reports
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto shadow-inner rounded-lg">
                <table className="min-w-full border-collapse border border-gray-400">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0 z-10">
                    <tr className="border-b-2 border-slate-600">
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Report #</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Report Title</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Company</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Ticker</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">
                            Price on Release
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-orange-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">
                            Publication Date
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Avg Volume 5D</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-teal-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">Avg Volume 10D</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-rose-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">
                            Volume Δ 30D (%)
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide shadow-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></div>
                          <span className="font-semibold">
                            Pre-Post Δ 30D (%)
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {(metricsData || []).map((report, index) => (
                      <tr
                        key={`${ticker}-${report["Report Number"]}`}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors duration-150 border-b-2 border-gray-400`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2 border-gray-400">
                          {report["Report Number"]}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 border-r-2 border-gray-400 max-w-xs">
                          <div
                            className="truncate"
                            title={report["Report Title"]}
                          >
                            {report["Report Title"]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r-2 border-gray-400">
                          {companyData.company_name ||
                            companyData.data?.company_profile?.name ||
                            companyData.company_data?.name ||
                            ticker}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold border-r-2 border-gray-400">
                          {ticker}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                          {report["Price on Release"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                          {report["Publication Date"]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                          {report["Avg Volume Post 5 Days"]?.toLocaleString() ||
                            "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                          {report[
                            "Avg Volume Post 10 Days"
                          ]?.toLocaleString() || "0"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm border-r-2 border-gray-400">
                          <span
                            className={`font-semibold ${
                              report["Volume Change 30 Days (%)"] >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {report["Volume Change 30 Days (%)"] >= 0
                              ? "+"
                              : ""}
                            {report["Volume Change 30 Days (%)"]?.toFixed(2) ||
                              "0.00"}
                            %
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`font-semibold ${
                              report["Volume Change Pre-Post 30 Days (%)"] >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {report["Volume Change Pre-Post 30 Days (%)"] >= 0
                              ? "+"
                              : ""}
                            {report[
                              "Volume Change Pre-Post 30 Days (%)"
                            ]?.toFixed(2) || "0.00"}
                            %
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {(!metricsData || metricsData.length === 0) && (
                <div className="text-center py-16">
                  <div className="text-gray-400 text-5xl mb-4">📊</div>
                  <p className="text-gray-500 text-lg font-medium">
                    No metrics data available for this company.
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Check back later as we continuously update our data.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Metrics Component */}
          {(metricsData ||
            companyData.data_available?.has_metrics ||
            companyData.has_metrics) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
              <TableComponent
                metrics={metricsData || []}
                ticker={ticker}
                currency={
                  companyData.data?.company_profile?.currency ||
                  companyData.currency ||
                  "CAD"
                }
                totalReports={
                  companyData.reports?.length ||
                  companyData.reports_count ||
                  companyData.data?.reports?.length ||
                  0
                }
              />
            </div>
          )}

          {/* Analysis Component */}
          {(analysisData || companyData.data_available?.has_ai_analysis) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-8">
              <AnalysisComponent
                analysis={analysisData || ""}
                ticker={ticker}
                status="success"
                generatedDate={companyData.analysis_date}
              />
            </div>
          )}

          {/* No data message */}
          {!chartData && !metricsData && !analysisData && (
            <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200 mt-8">
              <div className="text-gray-400 text-7xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-gray-600 mb-4">
                Limited Data Available
              </h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                This company has basic information but no additional charts,
                metrics, or analysis data available yet.
              </p>
              <p className="text-gray-400 text-sm mt-4">
                We're continuously expanding our coverage. Check back soon!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
