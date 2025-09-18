"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/components/AuthContext";
import { getCompanies } from "@/lib/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
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

            {/* Page Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FRC Companies Dashboard
            </h1>

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

        {/* Summary Dashboard - Show conditionally */}
        {showSummary && companies.length > 0 && (
          <CompaniesSummaryDashboard
            companies={companies}
            onViewAll={handleViewAllCompanies}
          />
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name or ticker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-300"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {searchTerm && (
            <div className="mt-4 text-sm text-gray-600">
              Found {filteredCompanies.length} companies matching "{searchTerm}"
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
