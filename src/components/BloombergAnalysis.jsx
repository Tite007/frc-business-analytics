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
          errorMessage.includes("No Bloomberg readership data found")
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
        errorMessage.includes("Request failed with status code 404")
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

  // Don't render if no data and no error (means Bloomberg analysis isn't available)
  if (!loading && !error && !analysisData) {
    return null;
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

      {/* Stats Grid */}
      <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total_records || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reads</div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-red-600">
              {stats.embargoed_count || 0}
            </div>
            <div className="text-sm text-gray-600">
              Embargoed ({stats.embargoed_percentage || 0}%)
            </div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {stats.revealed_count || 0}
            </div>
            <div className="text-sm text-gray-600">
              Revealed ({stats.revealed_percentage || 0}%)
            </div>
          </div>

          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">
              {stats.unique_institutions || 0}
            </div>
            <div className="text-sm text-gray-600">Institutions</div>
          </div>
        </div>
      </div>

      {/* Top Countries and Institutions */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Top Countries */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🌍 Top Countries
            </h4>
            <div className="space-y-3">
              {topCountries.slice(0, 5).map((country, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {country.count} reads
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${country.percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {country.percentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Institutions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🏛️ Top Institutions
            </h4>
            <div className="space-y-3">
              {topInstitutions.slice(0, 5).map((institution, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-600 mr-3">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm truncate max-w-32">
                      {institution.institution}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {institution.count} reads
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${institution.percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      {institution.percentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
