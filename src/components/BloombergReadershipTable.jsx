"use client";

import React, { useState, useEffect } from "react";
import {
  EyeIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  TrophyIcon,
  FireIcon,
  CubeTransparentIcon
} from "@heroicons/react/24/outline";
import {
  getBloombergV3Analytics,
  getBloombergFRCCompanyMatch,
  getBloombergV3Reports,
  getBloombergResolveCompany
} from "@/lib/api";

const BloombergReadershipTable = ({ ticker, companyName }) => {
  const [dashboardData, setDashboardData] = useState({
    analytics: null,
    reports: [],
    frcMatching: null,
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    sortBy: "post_date",
    sortOrder: "desc",
    timeRange: 90
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 20
  });

  useEffect(() => {
    if (ticker) {
      fetchCompanyReadership();
    }
  }, [ticker, companyName, filters.timeRange]);

  const fetchCompanyReadership = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // First, try to get analytics for the specific ticker
      let analytics = await getBloombergV3Analytics(ticker).catch(() => null);

      // If no data found with ticker and we have a company name, try resolve-company API
      if ((!analytics || !analytics.top_institutions || analytics.top_institutions.length === 0) && companyName) {
        console.log(`No data found for ticker ${ticker}, trying company name: ${companyName}`);

        const resolvedData = await getBloombergResolveCompany(companyName).catch(() => null);

        if (resolvedData && resolvedData.success) {
          // Transform the resolved data to match analytics structure
          analytics = {
            summary: {
              total_reads: resolvedData.readership_analytics?.total_reads || 0,
              unique_institutions: resolvedData.readership_analytics?.unique_institutions || 0,
              total_reports: resolvedData.readership_analytics?.reports_analyzed || 0,
              average_transparency_rate: resolvedData.readership_analytics?.transparency_rate || 0,
              embargo_rate: ((resolvedData.readership_analytics?.embargoed_reads || 0) / (resolvedData.readership_analytics?.total_reads || 1)) * 100
            },
            top_institutions: (resolvedData.institutions || []).map((inst, index) => ({
              institution_name: inst,
              read_count: Math.floor((resolvedData.readership_analytics?.total_reads || 0) / (resolvedData.institutions?.length || 1))
            })),
            recent_reads: resolvedData.recent_activity || []
          };

          console.log(`✅ Successfully resolved data for ${companyName} using Bloomberg ticker: ${resolvedData.company_match?.bloomberg_ticker}`);
        }
      }

      // Fetch additional data in parallel
      const [reports, frcMatching] = await Promise.all([
        // Get reports for the company
        getBloombergV3Reports({
          ticker: ticker,
          limit: 50,
          sort_by: filters.sortBy,
          sort_order: filters.sortOrder === "desc" ? -1 : 1
        }).catch(() => []),

        // Get FRC matching data
        getBloombergFRCCompanyMatch(ticker, { test_mode: true }).catch(() => null)
      ]);

      setDashboardData({
        analytics: analytics || null,
        reports: reports || [],
        frcMatching: frcMatching || null,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error("Error fetching company readership data:", error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  // Calculate analytics from the data
  const analytics = {
    summary: dashboardData.analytics ? {
      totalReads: dashboardData.analytics.summary?.total_reads || 0,
      totalInstitutions: dashboardData.analytics.summary?.unique_institutions || 0,
      totalReports: dashboardData.analytics.summary?.total_reports || dashboardData.reports.length,
      transparencyRate: dashboardData.analytics.summary?.average_transparency_rate || 0,
      embargoRate: dashboardData.analytics.summary?.embargo_rate || 0
    } : null,

    topInstitutions: dashboardData.analytics?.top_institutions || [],
    recentActivity: dashboardData.reports.filter(report => {
      const daysAgo = (Date.now() - new Date(report.post_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    }),

    countryDistribution: {},

    frcInsights: dashboardData.frcMatching ? {
      matchRate: (dashboardData.frcMatching.summary?.successful_matches / dashboardData.frcMatching.summary?.frc_reports_count * 100) || 0,
      institutionalInterest: dashboardData.frcMatching.summary?.total_institutional_interest || 0,
      reportsCovered: dashboardData.frcMatching.summary?.frc_reports_count || 0
    } : null
  };

  // Filter and paginate institutions
  const filteredInstitutions = analytics.topInstitutions;

  const totalPages = Math.ceil(filteredInstitutions.length / pagination.itemsPerPage);
  const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
  const currentPageData = filteredInstitutions.slice(startIndex, startIndex + pagination.itemsPerPage);


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Show placeholder if no data
  if (!dashboardData.loading && !dashboardData.error && !analytics.summary && dashboardData.reports.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                Bloomberg Readership Analytics
              </h3>
              <p className="text-gray-600">
                Institutional readership data for {ticker} ({companyName || 'Company'})
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <h4 className="text-xl font-bold text-gray-600 mb-2">
            No Bloomberg Readership Data
          </h4>
          <p className="text-gray-500 mb-4">
            No institutional readership data is currently available for {ticker}.
          </p>
          <p className="text-gray-400 text-sm">
            This company may not have Bloomberg Terminal coverage or readership data may be pending.
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (dashboardData.loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            Bloomberg Readership Analytics
          </h3>
          <p className="text-gray-600">Loading readership data for {ticker}...</p>
        </div>
        <div className="p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Analyzing institutional interest...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardData.error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <DocumentTextIcon className="h-6 w-6 text-red-600" />
            Bloomberg Readership Analytics
          </h3>
          <p className="text-red-600">Error loading readership data</p>
        </div>
        <div className="p-16 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">Failed to load Bloomberg data</p>
          <p className="text-gray-500 text-sm mt-2">{dashboardData.error}</p>
          <button
            onClick={fetchCompanyReadership}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Header with Company Analytics */}
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                Bloomberg Institutional Readership
              </h3>
              <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                {ticker}
              </div>
            </div>
            <p className="text-gray-600">
              Institutional readership analytics for {companyName || ticker} from Bloomberg Terminal
            </p>
          </div>

          {/* Enhanced KPI Cards */}
          {analytics.summary && (
            <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center bg-white/70 rounded-lg p-3 border border-blue-100">
                <div className="text-xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <EyeIcon className="h-4 w-4" />
                  {analytics.summary.totalReads.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total Reads</div>
              </div>
              <div className="text-center bg-white/70 rounded-lg p-3 border border-emerald-100">
                <div className="text-xl font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  {analytics.summary.totalInstitutions}
                </div>
                <div className="text-xs text-gray-600">Institutions</div>
              </div>
              <div className="text-center bg-white/70 rounded-lg p-3 border border-purple-100">
                <div className="text-xl font-bold text-purple-600 flex items-center justify-center gap-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  {analytics.summary.totalReports}
                </div>
                <div className="text-xs text-gray-600">Reports</div>
              </div>
              <div className="text-center bg-white/70 rounded-lg p-3 border border-orange-100">
                <div className={`text-xl font-bold flex items-center justify-center gap-1 ${
                  analytics.summary.transparencyRate > 70 ? 'text-green-600' :
                  analytics.summary.transparencyRate > 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  <CubeTransparentIcon className="h-4 w-4" />
                  {analytics.summary.transparencyRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Transparency</div>
              </div>
            </div>
          )}
        </div>

        {/* FRC Matching Intelligence */}
        {analytics.frcInsights && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <FireIcon className="h-4 w-4" />
              FRC Research Impact Analysis
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{analytics.frcInsights.matchRate.toFixed(1)}%</div>
                <div className="text-xs text-indigo-700">Match Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{analytics.frcInsights.institutionalInterest}</div>
                <div className="text-xs text-purple-700">Inst. Reads</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-600">{analytics.frcInsights.reportsCovered}</div>
                <div className="text-xs text-pink-700">Reports</div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 text-sm">
              <FunnelIcon className="h-4 w-4 text-gray-400" />
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => setPagination(prev => ({ ...prev, itemsPerPage: Number(e.target.value), currentPage: 1 }))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>

          {filteredInstitutions.length > 0 && (
            <div className="mt-2 sm:mt-0 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(startIndex + pagination.itemsPerPage, filteredInstitutions.length)} of {filteredInstitutions.length} institutions
              </span>
            </div>
          )}
        </div>
      </div>


      {/* Institutions Table */}
      {filteredInstitutions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-slate-600">
                  <div className="flex items-center gap-2">
                    <TrophyIcon className="h-3 w-3" />
                    <span>Rank</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-slate-600">
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="h-3 w-3" />
                    <span>Institution</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-slate-600">
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="h-3 w-3" />
                    <span>Location</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-slate-600">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-3 w-3" />
                    <span>Reads</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r border-slate-600">
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="h-3 w-3" />
                    <span>Share</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                  <div className="flex items-center gap-2">
                    <ShieldExclamationIcon className="h-3 w-3" />
                    <span>Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentPageData.map((institution, index) => {
                const actualIndex = startIndex + index;
                const readCount = institution.read_count || 0;
                const sharePercent = analytics.summary ? (readCount / analytics.summary.totalReads * 100) : 0;

                return (
                  <tr
                    key={`inst-${actualIndex}`}
                    className={`${actualIndex % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150 border-b border-gray-200`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        actualIndex < 3 ? 'bg-yellow-500 text-white' :
                        actualIndex < 10 ? 'bg-blue-500 text-white' :
                        'bg-gray-400 text-white'
                      }`}>
                        {actualIndex === 0 ? '🏆' : actualIndex + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-200">
                      <div className="max-w-xs">
                        <div className="font-semibold truncate" title={institution.institution_name}>
                          {institution.institution_name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      <div className="flex items-center">
                        <span className="mr-2 text-lg">🌍</span>
                        <div>
                          <div className="font-medium">N/A</div>
                          <div className="text-xs text-gray-500">Location not available</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <div className="font-bold text-blue-600">{readCount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm border-r border-gray-200">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(sharePercent, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{sharePercent.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        👁️ Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-5xl mb-4">🏢</div>
          <p className="text-gray-500 text-lg font-medium">
            No institutional data available
          </p>
          <p className="text-gray-400 text-sm mt-2">
            This company doesn't have institutional readership data.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 text-sm rounded border ${
                  pagination.currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
                disabled={pagination.currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded border ${
                  pagination.currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Footer */}
      {analytics.recentActivity.length > 0 && (
        <div className="px-8 py-4 bg-blue-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">Recent Activity:</span>
              <span>{analytics.recentActivity.length} reports published in last 30 days</span>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloombergReadershipTable;