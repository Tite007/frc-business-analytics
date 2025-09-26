"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import UnauthorizedAccess from "@/components/UnauthorizedAccess";
import {
  EyeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  SparklesIcon,
  LinkIcon,
  FunnelIcon,
  CubeTransparentIcon,
  BoltIcon
} from "@heroicons/react/24/outline";
import {
  getBloombergV3Institutions,
  getBloombergV3MostReadReports,
  getBloombergHealth,
  getAllBloombergCompanies,
  getBloombergFRCCompanyMatch
} from "@/lib/api";

export default function BloombergAnalyticsDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Analytics dashboard state
  const [dashboardData, setDashboardData] = useState({
    healthStatus: null,
    topCompanies: [],
    topInstitutions: [],
    mostReadReports: [],
    frcMatching: null,
    globalMetrics: null,
    loading: true,
    error: null
  });

  const [filters, setFilters] = useState({
    timeRange: 90,
    country: 'all',
    minReads: 5,
    includeEmbargoed: true,
    institutionLimit: 50
  });

  const [searchTicker, setSearchTicker] = useState('');
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [filters.timeRange, filters.institutionLimit, filters.minReads]);

  useEffect(() => {
    if (searchTicker && searchTicker.length > 1) {
      fetchFRCMatching(searchTicker);
    }
  }, [searchTicker]);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch comprehensive analytics data
      const [healthStatus, topCompanies, topInstitutions, mostReadReports] = await Promise.all([
        getBloombergHealth(),
        getAllBloombergCompanies(),
        getBloombergV3Institutions({ limit: filters.institutionLimit, min_reads: filters.minReads }),
        getBloombergV3MostReadReports({ days: filters.timeRange, limit: 20 })
      ]);

      setDashboardData({
        healthStatus: healthStatus || null,
        topCompanies: topCompanies?.companies || [],
        topInstitutions: topInstitutions || [],
        mostReadReports: mostReadReports?.most_read_reports || [],
        frcMatching: null,
        globalMetrics: {
          totalRecords: healthStatus?.readership_events?.total_records || 0,
          totalInstitutions: healthStatus?.collections_summary?.bloomberg_institutions || 0,
          totalReports: healthStatus?.collections_summary?.bloomberg_reports || 0,
          embargoRate: healthStatus?.readership_events ?
            (healthStatus.readership_events.embargoed_records / healthStatus.readership_events.total_records * 100) : 0
        },
        loading: false,
        error: null
      });

    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const fetchFRCMatching = async (ticker) => {
    try {
      const matchingData = await getBloombergFRCCompanyMatch(ticker, { test_mode: true });
      setDashboardData(prev => ({
        ...prev,
        frcMatching: matchingData
      }));
    } catch (error) {
      console.warn("FRC matching not available:", error.message);
    }
  };

  // Comprehensive Analytics Intelligence
  const analytics = {
    // Global platform metrics
    platformMetrics: {
      totalReadership: dashboardData.globalMetrics?.totalRecords || 0,
      activeInstitutions: dashboardData.globalMetrics?.totalInstitutions || 0,
      availableReports: dashboardData.globalMetrics?.totalReports || 0,
      embargoRate: dashboardData.globalMetrics?.embargoRate || 0
    },

    // Performance insights
    topPerformers: {
      hotTestCompany: dashboardData.topCompanies?.[0] || null,
      mostActiveInstitution: dashboardData.topInstitutions?.[0] || null,
      viralReport: dashboardData.mostReadReports?.[0] || null
    },

    // Market intelligence
    marketInsights: {
      countryDistribution: (dashboardData.topInstitutions || []).reduce((acc, inst) => {
        if (inst.customer_country && inst.customer_country !== 'Embargoed') {
          acc[inst.customer_country] = (acc[inst.customer_country] || 0) + inst.total_reads;
        }
        return acc;
      }, {}),

      avgTransparency: (dashboardData.mostReadReports || []).length > 0
        ? (dashboardData.mostReadReports || []).reduce((sum, report) => sum + (report.transparency_rate || 0), 0) / (dashboardData.mostReadReports || []).length
        : 0,

      topSectors: (dashboardData.topCompanies || []).slice(0, 5).map(company => ({
        name: company.company_name,
        ticker: company.ticker,
        readership: company.total_records,
        transparency: company.reveal_percentage
      })),

      totalReads: (dashboardData.mostReadReports || []).reduce((sum, report) => sum + (report.total_reads || 0), 0),
      totalInstitutionalReads: (dashboardData.topInstitutions || []).reduce((sum, inst) => sum + (inst.total_reads || 0), 0)
    },

    // FRC matching insights
    frcInsights: dashboardData.frcMatching ? {
      matchRate: (dashboardData.frcMatching.summary?.successful_matches / dashboardData.frcMatching.summary?.frc_reports_count * 100) || 0,
      institutionalInterest: dashboardData.frcMatching.summary?.total_institutional_interest || 0,
      reportsCovered: dashboardData.frcMatching.summary?.frc_reports_count || 0
    } : null
  };

  // Enhanced filtering and search
  const countries = [...new Set((dashboardData.topInstitutions || []).map(inst => inst.customer_country))].filter(Boolean);

  const filteredData = {
    institutions: filters.country === 'all'
      ? (dashboardData.topInstitutions || [])
      : (dashboardData.topInstitutions || []).filter(inst => inst.customer_country === filters.country),

    companies: (dashboardData.topCompanies || []).filter(company =>
      company.total_records >= filters.minReads
    ),

    reports: dashboardData.mostReadReports || []
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-medium">Initializing Bloomberg Analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Analytics Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-5"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Bloomberg Readership Analytics
                </h1>
                <p className="mt-3 text-gray-600 text-lg">
                  Comprehensive analytics on institutional readership &bull; {analytics.platformMetrics.totalReadership.toLocaleString()} total reads across {analytics.platformMetrics.activeInstitutions.toLocaleString()} institutions
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{analytics.platformMetrics.availableReports}</div>
                  <div className="text-sm text-gray-500">Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{(100 - analytics.platformMetrics.embargoRate).toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">Transparent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation & Controls */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* View Navigation */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                  { id: 'companies', label: 'Companies', icon: BuildingOfficeIcon },
                  { id: 'institutions', label: 'Institutions', icon: GlobeAltIcon },
                  { id: 'reports', label: 'Reports', icon: DocumentTextIcon },
                  { id: 'matching', label: 'FRC Match', icon: LinkIcon }
                ].map(view => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      activeView === view.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <view.icon className="h-4 w-4" />
                    {view.label}
                  </button>
                ))}
              </div>

              {/* Smart Search & Filters */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ticker for FRC matching..."
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, timeRange: parseInt(e.target.value) }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                    <option value={180}>Last 6 months</option>
                    <option value={365}>Last year</option>
                  </select>

                  <select
                    value={filters.country}
                    onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value="all">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>

                  <select
                    value={filters.institutionLimit}
                    onChange={(e) => setFilters(prev => ({ ...prev, institutionLimit: parseInt(e.target.value) }))}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  >
                    <option value={25}>Top 25 Institutions</option>
                    <option value={50}>Top 50 Institutions</option>
                    <option value={100}>Top 100 Institutions</option>
                    <option value={250}>Top 250 Institutions</option>
                    <option value={500}>Top 500 Institutions</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {dashboardData.loading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-100 mx-auto h-16 w-16"></div>
            </div>
            <p className="mt-6 text-gray-700 text-lg font-medium">Loading Bloomberg Analytics...</p>
            <p className="mt-2 text-gray-500">Analyzing {analytics.platformMetrics.totalReadership.toLocaleString()} readership events</p>
          </div>
        ) : dashboardData.error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="text-red-600 mb-4 text-xl font-semibold">🚨 System Alert</div>
            <p className="text-red-700 mb-6">{dashboardData.error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all shadow-lg font-medium"
            >
              Reconnect to Bloomberg
            </button>
          </div>
        ) : (
          <>
            {/* Overview Dashboard */}
            {activeView === 'overview' && (
              <>
                {/* Global Intelligence KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Platform Readership */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-700">Platform Readership</p>
                        <p className="text-3xl font-bold text-blue-900">{analytics.platformMetrics.totalReadership.toLocaleString()}</p>
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <ArrowTrendingUpIcon className="h-3 w-3" />
                          {analytics.platformMetrics.embargoRate.toFixed(1)}% embargoed
                        </p>
                      </div>
                      <div className="p-3 bg-blue-500 rounded-xl">
                        <EyeIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Global Institutions */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">Global Institutions</p>
                        <p className="text-3xl font-bold text-emerald-900">{analytics.platformMetrics.activeInstitutions.toLocaleString()}</p>
                        <p className="text-xs text-emerald-600 mt-1">
                          {analytics.topPerformers.mostActiveInstitution?.customer_name || 'Loading...'}
                        </p>
                      </div>
                      <div className="p-3 bg-emerald-500 rounded-xl">
                        <BuildingOfficeIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Research Coverage */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-700">Research Coverage</p>
                        <p className="text-3xl font-bold text-purple-900">{analytics.platformMetrics.availableReports}</p>
                        <p className="text-xs text-purple-600 mt-1">
                          {analytics.topPerformers.hotTestCompany?.company_name || 'Loading...'}
                        </p>
                      </div>
                      <div className="p-3 bg-purple-500 rounded-xl">
                        <DocumentTextIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Market Intelligence */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-orange-700">Transparency Rate</p>
                        <p className="text-3xl font-bold text-orange-900">{analytics.marketInsights.avgTransparency.toFixed(1)}%</p>
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <TrophyIcon className="h-3 w-3" />
                          Avg across reports
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        analytics.marketInsights.avgTransparency > 70 ? 'bg-green-500' :
                        analytics.marketInsights.avgTransparency > 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        <ChartBarIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* FRC Matching Intelligence */}
                {dashboardData.frcMatching && (
                  <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-3">
                      <LinkIcon className="h-6 w-6" />
                      FRC Research Intelligence: {searchTicker}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-3xl font-bold text-indigo-600">{analytics.frcInsights?.matchRate.toFixed(1)}%</div>
                        <div className="text-sm text-indigo-700">Match Rate</div>
                      </div>
                      <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600">{analytics.frcInsights?.institutionalInterest}</div>
                        <div className="text-sm text-purple-700">Institutional Reads</div>
                      </div>
                      <div className="text-center p-4 bg-white/60 rounded-lg">
                        <div className="text-3xl font-bold text-pink-600">{analytics.frcInsights?.reportsCovered}</div>
                        <div className="text-sm text-pink-700">Reports Covered</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Geographic Market Intelligence */}
                {Object.keys(analytics.marketInsights.countryDistribution).length > 0 && (
                  <div className="mb-8 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                      Global Market Intelligence
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {Object.entries(analytics.marketInsights.countryDistribution)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 6)
                        .map(([country, reads]) => (
                        <div key={country} className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <div className="text-2xl font-bold text-blue-900">{reads}</div>
                          <div className="text-sm font-medium text-blue-700">{country}</div>
                          <div className="text-xs text-blue-500">
                            {((reads / analytics.marketInsights.totalInstitutionalReads) * 100).toFixed(1)}% share
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Condensed Preview Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Elite Institutions Preview */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />
                        Elite Institutions
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        {filteredData.institutions.slice(0, 6).map((institution, index) => (
                          <div key={institution.institution_id} className={`flex items-center justify-between p-3 rounded-lg ${
                            institution.is_embargoed_entity
                              ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-2 border-l-orange-400'
                              : 'bg-gradient-to-r from-emerald-50 to-blue-50 border-l-2 border-l-emerald-400'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                institution.is_embargoed_entity ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                              }`}>
                                {institution.is_embargoed_entity ? '🛡️' : index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 text-sm">{institution.customer_name}</div>
                                <div className="text-xs text-gray-500">{institution.customer_country}</div>
                              </div>
                            </div>
                            <div className="text-sm font-bold text-gray-700">
                              {institution.total_reads}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setActiveView('institutions')}
                        className="w-full mt-4 text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        View All {filteredData.institutions.length} Institutions (showing top {filters.institutionLimit}) &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Viral Reports Preview */}
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/30 shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <FireIcon className="h-5 w-5 text-red-500" />
                        Viral Reports
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {filteredData.reports.slice(0, 4).map((report, index) => {
                          const daysAgo = Math.floor((Date.now() - new Date(report.post_date).getTime()) / (1000 * 60 * 60 * 24));
                          const isRecent = daysAgo <= 7;

                          return (
                            <div key={report.report_id} className={`border-l-4 rounded-lg p-4 ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-yellow-400' :
                              isRecent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-400' :
                              'bg-gray-50 border-l-gray-300'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  index === 0 ? 'bg-yellow-500 text-white' :
                                  isRecent ? 'bg-blue-500 text-white' :
                                  'bg-gray-400 text-white'
                                }`}>
                                  {index === 0 ? '🔥 #1' : `#${index + 1}`}
                                </span>
                                <h4 className="font-medium text-gray-900 text-sm truncate">{report.title}</h4>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {report.primary_ticker} &bull; {daysAgo}d ago
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-gray-900">{report.total_reads} reads</div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  report.transparency_rate > 70 ? 'bg-green-100 text-green-700' :
                                  report.transparency_rate > 30 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {report.transparency_rate?.toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setActiveView('reports')}
                        className="w-full mt-4 text-center text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        View All Viral Reports &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Detailed Views for each section */}
            {activeView === 'companies' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FireIcon className="h-6 w-6 text-red-500" />
                  Hottest Companies ({filteredData.companies.length})
                </h3>
                <div className="space-y-4">
                  {filteredData.companies.slice(0, 15).map((company, index) => (
                    <div key={company.ticker} className={`p-4 rounded-lg border-l-4 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-yellow-400' :
                      index < 3 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-400' :
                      'bg-gray-50 border-l-gray-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index < 3 ? 'bg-blue-500 text-white' :
                            'bg-gray-400 text-white'
                          }`}>
                            {index === 0 ? '🏆' : index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{company.company_name}</div>
                            <div className="text-sm text-gray-600">{company.ticker} &bull; {company.total_reports} reports</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{company.total_records}</div>
                          <div className="text-sm text-gray-500">{company.reveal_percentage}% revealed</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar detailed views for institutions, reports, and matching... */}
            {activeView === 'institutions' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <BuildingOfficeIcon className="h-6 w-6 text-emerald-600" />
                    Elite Institutions ({filteredData.institutions.length})
                  </h3>
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Showing top {filters.institutionLimit} • {analytics.platformMetrics.totalReadership.toLocaleString()} total reads
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredData.institutions.map((institution, index) => (
                    <div key={institution.institution_id} className={`p-4 rounded-lg ${
                      institution.is_embargoed_entity
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400'
                        : 'bg-gradient-to-r from-emerald-50 to-blue-50 border-l-4 border-l-emerald-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            institution.is_embargoed_entity ? 'bg-orange-500 text-white' : 'bg-emerald-500 text-white'
                          }`}>
                            {institution.is_embargoed_entity ? '🛡️' : index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{institution.customer_name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <GlobeAltIcon className="h-4 w-4" />
                              {institution.customer_country} &bull; {institution.customer_city}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{institution.total_reads}</div>
                          <div className="text-sm text-gray-500">reads</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports detailed view */}
            {activeView === 'reports' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <SparklesIcon className="h-6 w-6 text-purple-600" />
                  Viral Reports ({filteredData.reports.length})
                </h3>
                <div className="space-y-6">
                  {filteredData.reports.map((report, index) => {
                    const daysAgo = Math.floor((Date.now() - new Date(report.post_date).getTime()) / (1000 * 60 * 60 * 24));
                    const isRecent = daysAgo <= 7;
                    const popularityScore = report.total_reads * (report.transparency_rate / 100);

                    return (
                      <div key={report.report_id} className={`p-6 rounded-lg border-l-4 ${
                        index === 0 ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-purple-400' :
                        isRecent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-400' :
                        'bg-gray-50 border-l-gray-300'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                                index === 0 ? 'bg-purple-500 text-white' :
                                isRecent ? 'bg-blue-500 text-white' :
                                'bg-gray-400 text-white'
                              }`}>
                                {index === 0 ? '🔥 #1' : `#${index + 1}`}
                              </span>
                              <h4 className="font-bold text-gray-900">{report.title}</h4>
                              {isRecent && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">HOT</span>}
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                              {report.company_name} ({report.primary_ticker}) &bull; {daysAgo} days ago
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-2 bg-white/60 rounded">
                                <div className="text-lg font-bold text-blue-600">{report.total_reads}</div>
                                <div className="text-xs text-gray-500">reads</div>
                              </div>
                              <div className="text-center p-2 bg-white/60 rounded">
                                <div className="text-lg font-bold text-emerald-600">{report.unique_institutions}</div>
                                <div className="text-xs text-gray-500">institutions</div>
                              </div>
                              <div className="text-center p-2 bg-white/60 rounded">
                                <div className="text-lg font-bold text-purple-600">{popularityScore.toFixed(1)}</div>
                                <div className="text-xs text-gray-500">impact score</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                report.transparency_rate > 70 ? 'bg-green-100 text-green-800' :
                                report.transparency_rate > 30 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {report.transparency_rate?.toFixed(1)}% transparent
                              </div>

                              {report.revealed_reads < report.total_reads && (
                                <div className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                  <ShieldExclamationIcon className="h-3 w-3" />
                                  {report.total_reads - report.revealed_reads} embargoed
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FRC Matching detailed view */}
            {activeView === 'matching' && (
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <LinkIcon className="h-6 w-6 text-indigo-600" />
                  FRC Research Matching
                </h3>
                {!searchTicker ? (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Enter a ticker symbol above to analyze FRC research impact</p>
                    <p className="text-gray-500 text-sm mt-2">Examples: ZEPP, MSFT, AAPL</p>
                  </div>
                ) : dashboardData.frcMatching ? (
                  <div className="space-y-6">
                    {dashboardData.frcMatching.matches?.map((match, index) => (
                      <div key={index} className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                        <h4 className="font-bold text-indigo-900 mb-3">{match.frc_report.title}</h4>
                        <div className="text-sm text-indigo-700 mb-4">
                          Published: {match.frc_report.publication_date} &bull; Type: {match.frc_report.report_type}
                        </div>

                        {match.bloomberg_matches?.map((bmatch, idx) => (
                          <div key={idx} className="mt-4 p-4 bg-white/60 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {Math.round(bmatch.similarity_metrics.overall_match_score * 100)}%
                                </div>
                                <div className="text-xs text-gray-500">Match Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {bmatch.institutional_readership.total_reads}
                                </div>
                                <div className="text-xs text-gray-500">Total Reads</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {bmatch.institutional_readership.transparency_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Transparency</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {bmatch.institutional_readership.embargoed_reads}
                                </div>
                                <div className="text-xs text-gray-500">Embargoed</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing FRC research for {searchTicker}...</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}