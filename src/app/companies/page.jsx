"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { getCompanies } from "@/lib/api";
import { InformationCircleIcon, XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import EnhancedCompaniesTable from "@/components/companies/EnhancedCompaniesTable";
import CompaniesSummaryDashboard from "@/components/companies/CompaniesSummaryDashboard";

export default function CompaniesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        // Fetch all companies with a high limit to ensure we get all 122
        const response = await getCompanies({ limit: 200 });
        console.log("Fetched companies response:", response);
        if (response && response.companies) {
          // Show all FRC-covered companies (don't filter by status)
          const allCompanies = response.companies;
          setCompanies(allCompanies);
        }
      } catch (err) {
        setError("Failed to load companies");
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  // Categorize companies by exchange for tab counts
  const { usCompaniesCount, canadianCompaniesCount } = useMemo(() => {
    let usCount = 0;
    let canadaCount = 0;

    companies.forEach((company) => {
      // Handle both array and string exchange formats
      const exchanges = Array.isArray(company.exchange) ? company.exchange : [company.exchange];

      // Check if any of the exchanges are US exchanges
      const isUS = exchanges.some(exchange =>
        exchange === "NASDAQ" ||
        exchange === "NYSE" ||
        exchange === "NYSE Arca" ||
        exchange === "New York Stock Exchange" ||
        exchange === "NASDAQ Global Market" ||
        exchange === "NASDAQ Capital Market" ||
        exchange === "AMEX" ||
        exchange === "OTC"
      );

      // Check if any of the exchanges are Canadian exchanges
      const isCanadian = exchanges.some(exchange =>
        exchange === "TSX" ||
        exchange === "TSXV" ||
        exchange === "Toronto Stock Exchange" ||
        exchange === "TSX Venture Exchange" ||
        exchange === "CNQ" ||
        exchange === "NEO"
      );

      if (isUS) {
        usCount++;
      } else if (isCanadian) {
        canadaCount++;
      }
    });

    return {
      usCompaniesCount: usCount,
      canadianCompaniesCount: canadaCount,
    };
  }, [companies]);

  // Handle scroll to table
  const handleViewAllCompanies = () => {
    setShowSummary(false);
    // Small delay to ensure the component re-renders before scrolling
    setTimeout(() => {
      const tableElement = document.getElementById("companies-table");
      if (tableElement) {
        tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Show loading while auth is being loaded
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-500 mb-6">
            Please log in to access this page.
          </p>
          <a
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center">
            {/* Welcome Message */}
            {user && (
              <div className="mb-4">
                <p className="text-lg text-gray-600">
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-800">
                    {user.name || user.email}
                  </span>
                  !
                </p>
              </div>
            )}

            {/* Page Title with Info Button */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                FRC Companies Dashboard
              </h1>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                title="Learn how to search and explore companies"
              >
                <InformationCircleIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive database of{" "}
              <span className="font-semibold text-blue-600">
                {companies.length}
              </span>{" "}
              FRC-covered companies with digital reports and analytics
            </p>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                  <InformationCircleIcon className="h-6 w-6" />
                  How to Use the Companies Dashboard
                </h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 rounded-full hover:bg-blue-200 text-blue-600 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Search Tips */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🔍 Search Tips
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Search by <strong>company name</strong>: "HydroGraph"</li>
                    <li>• Search by <strong>ticker symbol</strong>: "HGC"</li>
                    <li>• Search is <strong>case-insensitive</strong></li>
                    <li>• Partial matches work: "Hydro" finds "HydroGraph"</li>
                    <li>• Use the tabs to filter by exchange</li>
                  </ul>
                </div>

                {/* Data Availability */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📊 Available Data
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• <strong>Company profiles</strong> and basic info</li>
                    <li>• <strong>FRC research reports</strong> (digital & PDF)</li>
                    <li>• <strong>Stock price charts</strong> with report markers</li>
                    <li>• <strong>Volume impact analysis</strong></li>
                    <li>• <strong>AI-generated insights</strong></li>
                    <li>• <strong>Bloomberg readership data</strong></li>
                  </ul>
                </div>

                {/* Exchange Categories */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🏛️ Exchange Categories
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div>
                      <strong>🇺🇸 US Markets:</strong>
                      <div className="text-xs mt-1">NYSE, NASDAQ, AMEX, OTC</div>
                    </div>
                    <div>
                      <strong>🇨🇦 Canadian Markets:</strong>
                      <div className="text-xs mt-1">TSX, TSXV, CNQ, NEO</div>
                    </div>
                    <div>
                      <strong>🌍 All Companies:</strong>
                      <div className="text-xs mt-1">Combined view of all markets</div>
                    </div>
                  </div>
                </div>

                {/* Company Status */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    📈 Data Quality Indicators
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span><strong>Full Data:</strong> Charts + Reports + Analysis</li>
                    <li>• <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span><strong>Reports Only:</strong> Research reports available</li>
                    <li>• <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><strong>Basic Info:</strong> Company profile only</li>
                    <li>• <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span><strong>Bloomberg Data:</strong> Institutional readership</li>
                  </ul>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    ⚡ Quick Actions
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Click <strong>company name</strong> to view full dashboard</li>
                    <li>• Use <strong>Clear</strong> button to reset search</li>
                    <li>• Switch between <strong>exchange tabs</strong></li>
                    <li>• Companies are sorted <strong>alphabetically</strong></li>
                    <li>• Pagination available for large lists</li>
                  </ul>
                </div>

                {/* Data Sources */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🔗 Data Sources
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• <strong>FRC Research:</strong> Proprietary analysis & reports</li>
                    <li>• <strong>Market Data:</strong> Real-time stock prices & volume</li>
                    <li>• <strong>Bloomberg Terminal:</strong> Institutional readership</li>
                    <li>• <strong>AI Analysis:</strong> Machine learning insights</li>
                    <li>• <strong>Exchange Data:</strong> Official listing information</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-600 text-white rounded-lg">
                <p className="text-center font-medium">
                  💡 <strong>Pro Tip:</strong> Use the search bar above to quickly find specific companies, then click on any company name to access detailed analytics, research reports, and performance data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Dashboard - Show conditionally */}
        {showSummary && companies.length > 0 && (
          <CompaniesSummaryDashboard
            companies={companies}
            onViewAll={handleViewAllCompanies}
          />
        )}

        {/* Unified Search Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-3 mb-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Search All Companies</h3>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Search help"
                >
                  <InformationCircleIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies by name or ticker (e.g., 'HydroGraph', 'HGC', 'Tesla', 'TSLA')..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300 bg-white"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Quick Search Examples */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500">Quick examples:</span>
                {["HydroGraph", "Tesla", "Shopify", "Apple"].map((example) => (
                  <button
                    key={example}
                    onClick={() => setSearchTerm(example)}
                    className="px-3 py-1 text-xs bg-white hover:bg-gray-50 text-gray-700 rounded-full border transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results Summary */}
            {searchTerm && (
              <div className="lg:min-w-[280px]">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-sm font-medium text-gray-900 mb-2">Search Results</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇺🇸</span>
                        <span>US Companies</span>
                      </span>
                      <span className="font-medium text-blue-600">
                        {companies.filter(c => {
                          const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                          const isUS = exchanges.some(exchange =>
                            exchange === "NASDAQ" || exchange === "NYSE" || exchange === "NYSE Arca" ||
                            exchange === "New York Stock Exchange" || exchange === "NASDAQ Global Market" ||
                            exchange === "NASDAQ Capital Market" || exchange === "AMEX" || exchange === "OTC"
                          );
                          return isUS && (
                            c.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                          );
                        }).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-lg">🇨🇦</span>
                        <span>Canadian Companies</span>
                      </span>
                      <span className="font-medium text-blue-600">
                        {companies.filter(c => {
                          const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                          const isCanadian = exchanges.some(exchange =>
                            exchange === "TSX" || exchange === "TSXV" || exchange === "Toronto Stock Exchange" ||
                            exchange === "TSX Venture Exchange" || exchange === "CNQ" || exchange === "NEO"
                          );
                          return isCanadian && (
                            c.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                          );
                        }).length}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between font-medium">
                        <span>Total Found</span>
                        <span className="text-blue-700">
                          {companies.filter(c =>
                            c.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                          ).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Companies Tabs */}
        <div
          id="companies-table"
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Companies by Exchange
            </h2>
            <p className="text-gray-600 mt-1">
              Browse companies organized by their stock exchange - each tab has its own search
            </p>
          </div>

          <div className="p-6">
            <Tabs
              variant="underlined"
              color="primary"
              size="lg"
              classNames={{
                tabList:
                  "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-blue-600",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-blue-600",
              }}
            >
              <Tab
                key="usa"
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🇺🇸</span>
                    <span className="font-medium">United States</span>
                    <Chip size="sm" color="primary" variant="flat">
                      {usCompaniesCount}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={companies}
                    title="US Companies (NYSE, NASDAQ)"
                    totalCompaniesCount={companies.length}
                    exchangeType="us"
                    searchTerm={searchTerm}
                    showPagination={true}
                    itemsPerPage={10}
                  />
                </div>
              </Tab>

              <Tab
                key="canada"
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🇨🇦</span>
                    <span className="font-medium">Canada</span>
                    <Chip size="sm" color="primary" variant="flat">
                      {canadianCompaniesCount}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={companies}
                    title="Canadian Companies (TSX, TSXV)"
                    totalCompaniesCount={companies.length}
                    exchangeType="canada"
                    searchTerm={searchTerm}
                    showPagination={true}
                    itemsPerPage={10}
                  />
                </div>
              </Tab>

              <Tab
                key="all"
                title={
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🌍</span>
                    <span className="font-medium">All Companies</span>
                    <Chip size="sm" color="primary" variant="flat">
                      {companies.length}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={companies}
                    title="All Companies"
                    totalCompaniesCount={companies.length}
                    exchangeType="all"
                    searchTerm={searchTerm}
                    showPagination={true}
                    itemsPerPage={10}
                  />
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>

      </div>
    </div>
  );
}
