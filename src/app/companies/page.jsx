"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { getCompanies } from "@/lib/api";
import { MagnifyingGlassIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import EnhancedCompaniesTable from "@/components/companies/EnhancedCompaniesTable";
import CompaniesSummaryDashboard from "@/components/companies/CompaniesSummaryDashboard";

export default function CompaniesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSummary, setShowSummary] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

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

  // Filter and categorize companies
  const { filteredCompanies, usCompanies, canadianCompanies } = useMemo(() => {
    let filtered = companies;

    // Apply search filter if there's a search term
    if (searchTerm) {
      filtered = companies.filter(
        (company) =>
          company.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Categorize by exchange
    const us = [];
    const canada = [];

    filtered.forEach((company) => {
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
        us.push(company);
      } else if (isCanadian) {
        canada.push(company);
      }
    });

    // Sort alphabetically by company name
    const sortByName = (a, b) =>
      (a.company_name || "").localeCompare(b.company_name || "");

    return {
      filteredCompanies: filtered,
      usCompanies: us.sort(sortByName),
      canadianCompanies: canada.sort(sortByName),
    };
  }, [searchTerm, companies]);

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

        {/* Enhanced Search Section */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-6 mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MagnifyingGlassIcon className="h-5 w-5 text-blue-600" />
              Search Companies
            </h2>
            <p className="text-sm text-gray-600">
              Search through {companies.length} FRC-covered companies by name or ticker symbol
              {!showInfo && (
                <button
                  onClick={() => setShowInfo(true)}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline"
                >
                  (Need help?)
                </button>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="e.g., 'HydroGraph' or 'HGC' or 'Tesla' or 'TSLA'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300 bg-white"
              />
            </div>

            <div className="flex gap-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white"
                >
                  Clear
                </button>
              )}

              <button
                onClick={() => setShowInfo(!showInfo)}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                title="Search tips and help"
              >
                <InformationCircleIcon className="h-4 w-4" />
                Help
              </button>
            </div>
          </div>

          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-800 font-medium">
                  🔍 Found {filteredCompanies.length} companies matching "{searchTerm}"
                </span>
                {filteredCompanies.length > 0 && (
                  <span className="text-xs text-blue-600">
                    ({usCompanies.filter(c =>
                      c.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length} US, {canadianCompanies.filter(c =>
                      c.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length} Canadian)
                  </span>
                )}
              </div>

              {filteredCompanies.length === 0 && (
                <div className="mt-2 text-sm text-blue-700">
                  💡 Try searching for partial names like "Hydro" or common tickers like "AAPL", "TSLA", "SHOP"
                </div>
              )}
            </div>
          )}

          {/* Quick Search Examples */}
          {!searchTerm && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Quick examples:</span>
              {["HydroGraph", "Tesla", "Shopify", "HGC", "TSLA", "SHOP"].map((example) => (
                <button
                  key={example}
                  onClick={() => setSearchTerm(example)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          )}
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
              Browse companies organized by their stock exchange
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
                      {usCompanies.length}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={usCompanies}
                    title="US Companies (NYSE, NASDAQ)"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
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
                      {canadianCompanies.length}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={canadianCompanies}
                    title="Canadian Companies (TSX, TSXV)"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
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
                      {filteredCompanies.length}
                    </Chip>
                  </div>
                }
              >
                <div className="mt-6">
                  <EnhancedCompaniesTable
                    companies={filteredCompanies}
                    title="All Companies"
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
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
