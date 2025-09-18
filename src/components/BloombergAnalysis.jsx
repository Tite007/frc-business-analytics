"use client";

import React, { useState, useEffect } from "react";
import { getBloombergAnalysis } from "@/lib/api";

const BloombergAnalysis = ({ ticker }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ticker) {
      fetchBloombergAnalysis();
    }
  }, [ticker]);

  const fetchBloombergAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getBloombergAnalysis(ticker, {
        generate_if_missing: true,
      });

      // Handle 404 or not found errors
      if (response?.error) {
        const errorMessage = response.message || "";
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("Request failed with status code 404") ||
          errorMessage.includes("No analysis found") ||
          errorMessage.includes("No Bloomberg readership data found") ||
          errorMessage.includes("Bloomberg analysis endpoint not available")
        ) {
          // Bloomberg analysis not available - hide component
          console.log("Bloomberg analysis not available for", ticker);
          setAnalysisData(null);
          setLoading(false);
          return;
        } else {
          throw new Error(
            response.message || "Failed to fetch Bloomberg analysis"
          );
        }
      }

      if (response?.success && response?.data) {
        setAnalysisData(response.data);
      } else {
        setAnalysisData(null);
      }
    } catch (err) {
      console.error("Error fetching Bloomberg analysis:", err);
      const errorMessage = err.message || "";
      const statusCode = err.response?.status;

      if (
        statusCode === 404 ||
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("Request failed with status code 404") ||
        errorMessage.includes("Bloomberg analysis endpoint not available")
      ) {
        // Bloomberg analysis endpoint not available - hide component
        console.log("Bloomberg analysis endpoint not available for", ticker);
        setAnalysisData(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show placeholder if no data available (Bloomberg endpoint not available)
  if (!loading && !error && !analysisData) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                🤖 Bloomberg AI Analysis
              </h3>
              <p className="text-gray-600">
                AI-powered insights from Bloomberg Terminal readership data
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">🔄</div>
          <h4 className="text-xl font-bold text-gray-600 mb-2">
            Bloomberg Analysis Not Available
          </h4>
          <p className="text-gray-500 mb-4">
            Bloomberg AI analysis endpoints are not currently available for this
            environment.
          </p>
          <p className="text-gray-400 text-sm">
            This feature requires Bloomberg Terminal integration and may be
            available in the production environment.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bloomberg AI Analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">
            Failed to load Bloomberg Analysis
          </p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <button
            onClick={fetchBloombergAnalysis}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = analysisData.stats || {};
  const topCountries = analysisData.top_countries || [];
  const topInstitutions = analysisData.top_institutions || [];
  const keyInsights = analysisData.key_insights || [];
  const readingTimeline = analysisData.reading_timeline || {};
  const embargoSystem = analysisData.embargo_system || {};

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🤖 Bloomberg AI Analysis
            </h3>
            <p className="text-gray-600">
              AI-powered institutional readership intelligence and market
              insights
            </p>
          </div>

          {/* Analysis Date */}
          <div className="mt-4 lg:mt-0 text-sm text-gray-500">
            <div>Analysis Date: {analysisData.analysis_date}</div>
            <div>
              Last Updated:{" "}
              {new Date(analysisData.last_updated).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_records || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reads</div>
            <div className="text-xs text-gray-400 mt-1">Terminal Activity</div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-purple-600">
              {stats.unique_institutions || 0}
            </div>
            <div className="text-sm text-gray-600">Institutions</div>
            <div className="text-xs text-gray-400 mt-1">Unique Readers</div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
            <div className="text-2xl font-bold text-green-600">
              {stats.revealed_count || 0}
            </div>
            <div className="text-sm text-gray-600">
              Revealed ({stats.revealed_percentage || 0}%)
            </div>
            <div className="text-xs text-gray-400 mt-1">Public Data</div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-600">
              {stats.embargoed_count || 0}
            </div>
            <div className="text-sm text-gray-600">
              Embargoed ({stats.embargoed_percentage?.toFixed(1) || 0}%)
            </div>
            <div className="text-xs text-gray-400 mt-1">Recent Activity</div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
            <div className="text-2xl font-bold text-indigo-600">
              {topCountries.length || 0}
            </div>
            <div className="text-sm text-gray-600">Countries</div>
            <div className="text-xs text-gray-400 mt-1">Global Reach</div>
          </div>
        </div>

        {/* Embargo System Info */}
        {embargoSystem.description && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center text-sm text-blue-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <span className="font-medium">Embargo System:</span>
              <span className="ml-2">{embargoSystem.description}</span>
            </div>
          </div>
        )}
      </div>

      {/* Top Countries and Institutions */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Enhanced Top Countries */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🌍 Geographic Distribution
            </h4>
            <div className="space-y-3">
              {topCountries.slice(0, 8).map((country, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{country.country}</div>
                      {country.code && country.code !== country.country && (
                        <div className="text-xs text-gray-500">{country.code}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-3 min-w-fit">
                      {country.count} reads
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(country.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 min-w-fit">
                      {country.percentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Top Institutions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏛️ Leading Institutions
            </h4>
            <div className="space-y-3">
              {topInstitutions.length > 0 ? (
                topInstitutions.slice(0, 6).map((institution, index) => (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center flex-1">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600 mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate pr-2" title={institution.institution}>
                          {institution.institution}
                        </div>
                        <div className="text-xs text-gray-500">Revealed Institution</div>
                      </div>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="text-sm text-gray-600 mr-2">
                        {institution.count} reads
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(institution.percentage || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔒</div>
                  <p className="text-sm">Institution data under embargo</p>
                  <p className="text-xs text-gray-400 mt-1">Details will be revealed after 30-day period</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reading Timeline */}
      {Object.keys(readingTimeline).length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📈 Reading Activity Timeline
          </h4>
          <div className="space-y-4">
            {/* Timeline Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-end justify-between h-32 space-x-1">
                {Object.entries(readingTimeline)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(-12) // Show last 12 months
                  .map(([month, count]) => {
                    const maxCount = Math.max(...Object.values(readingTimeline));
                    const height = Math.max((count / maxCount) * 100, 5);
                    return (
                      <div key={month} className="flex flex-col items-center group">
                        <div
                          className="bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors cursor-pointer w-6"
                          style={{ height: `${height}%` }}
                          title={`${month}: ${count} reads`}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left whitespace-nowrap">
                          {month}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Timeline Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-lg font-bold text-indigo-600">
                  {Object.keys(readingTimeline).length}
                </div>
                <div className="text-sm text-gray-600">Active Months</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-lg font-bold text-indigo-600">
                  {Math.max(...Object.values(readingTimeline))}
                </div>
                <div className="text-sm text-gray-600">Peak Month</div>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-lg font-bold text-indigo-600">
                  {Math.round(Object.values(readingTimeline).reduce((a, b) => a + b, 0) / Object.keys(readingTimeline).length)}
                </div>
                <div className="text-sm text-gray-600">Avg/Month</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      {keyInsights.length > 0 && (
        <div className="px-8 py-6 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            💡 Key Insights
          </h4>
          <div className="space-y-3">
            {keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-medium text-yellow-600 mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {analysisData.ai_analysis && (
        <div className="px-8 py-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🧠 AI Analysis
          </h4>
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
            <div className="prose prose-sm max-w-none text-gray-700">
              {analysisData.ai_analysis.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-3 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloombergAnalysis;
