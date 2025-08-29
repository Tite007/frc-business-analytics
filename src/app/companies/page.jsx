"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getCompanies } from "@/lib/api";
import Link from "next/link";
import { Tabs, Tab } from "@heroui/tabs";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

export default function CompaniesPage() {
  const { data: session, status } = useSession();
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usCompanies, setUsCompanies] = useState([]);
  const [canadianCompanies, setCanadianCompanies] = useState([]);

  // Function to categorize and sort companies
  const categorizeCompanies = (companiesData) => {
    const us = [];
    const canada = [];

    companiesData.forEach((company) => {
      // Categorize based on exchange
      if (
        company.exchange === "NASDAQ" ||
        company.exchange === "NYSE" ||
        company.exchange === "NYSE Arca"
      ) {
        us.push(company);
      } else if (company.exchange === "TSX" || company.exchange === "TSXV") {
        canada.push(company);
      }
    });

    // Sort alphabetically by company name
    const sortByName = (a, b) =>
      (a.company_name || "").localeCompare(b.company_name || "");

    setUsCompanies(us.sort(sortByName));
    setCanadianCompanies(canada.sort(sortByName));
  };

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
          setFilteredCompanies(allCompanies);
          categorizeCompanies(allCompanies);
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

  useEffect(() => {
    const filtered = companies.filter(
      (company) =>
        company.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(filtered);
    categorizeCompanies(filtered);
  }, [searchTerm, companies]);

  // Table columns configuration
  const columns = [
    { name: "COMPANY", uid: "company_name", sortable: true },
    { name: "TICKER", uid: "ticker", sortable: true },
    { name: "EXCHANGE", uid: "exchange", sortable: true },
    { name: "CURRENCY", uid: "currency" },
    { name: "STATUS", uid: "status" },
    { name: "REPORT TYPE", uid: "report_type" },
    { name: "REPORTS", uid: "reports_count", sortable: true },
    { name: "ACTIONS", uid: "actions" },
  ];

  // Render cell content based on column key
  const renderCell = useCallback((company, columnKey) => {
    const cellValue = company[columnKey];

    switch (columnKey) {
      case "company_name":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize">{cellValue}</p>
          </div>
        );
      case "ticker":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-sm capitalize text-blue-600 font-mono">
              {cellValue || "N/A"}
            </p>
          </div>
        );
      case "exchange":
        return (
          <Chip className="capitalize" color="primary" size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "currency":
        return (
          <Chip className="capitalize" color="success" size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "status":
        const getStatusColor = (status) => {
          switch (status) {
            case "success":
              return "success";
            case "frc_covered_no_digital_reports":
              return "warning";
            case "frc_covered_no_stock_data":
              return "secondary";
            default:
              return "default";
          }
        };

        const getStatusText = (status) => {
          switch (status) {
            case "success":
              return "Complete Data";
            case "frc_covered_no_digital_reports":
              return "No Digital Reports";
            case "frc_covered_no_stock_data":
              return "No Stock Data";
            default:
              return status;
          }
        };

        return (
          <Chip
            className="capitalize"
            color={getStatusColor(cellValue)}
            size="sm"
            variant="flat"
          >
            {getStatusText(cellValue)}
          </Chip>
        );
      case "report_type":
        const getReportType = (company) => {
          if (company.status === "success") {
            return { type: "Digital Reports", color: "success", icon: "💻" };
          } else if (company.status === "frc_covered_no_digital_reports") {
            return { type: "PDF Reports", color: "warning", icon: "📄" };
          } else if (company.status === "frc_covered_no_stock_data") {
            return { type: "Reports Only", color: "secondary", icon: "📊" };
          } else {
            return { type: "Unknown", color: "default", icon: "❓" };
          }
        };

        const reportInfo = getReportType(company);

        return (
          <div className="flex items-center gap-2">
            <span className="text-lg">{reportInfo.icon}</span>
            <Chip
              className="capitalize"
              color={reportInfo.color}
              size="sm"
              variant="flat"
            >
              {reportInfo.type}
            </Chip>
          </div>
        );
      case "reports_count":
        const companyHasReports = cellValue > 0;
        return (
          <div className="flex flex-col">
            <p
              className={`text-bold text-sm ${
                companyHasReports ? "text-green-600" : "text-gray-500"
              }`}
            >
              {companyHasReports
                ? `${cellValue} reports`
                : "No reports available"}
            </p>
            {!companyHasReports && (
              <p className="text-xs text-gray-400">
                FRC covered, no digital reports
              </p>
            )}
          </div>
        );
      case "actions":
        const hasReports = company.reports_count > 0;
        const hasDigitalReports = company.status === "success";
        const hasPdfReports =
          company.status === "frc_covered_no_digital_reports";
        const hasStockData = company.status !== "frc_covered_no_stock_data";

        return (
          <div className="relative flex justify-end items-center gap-2">
            {hasDigitalReports ? (
              <Button
                as={Link}
                href={`/${company.ticker}`}
                color="primary"
                size="sm"
                variant="flat"
              >
                View Digital Report
              </Button>
            ) : hasPdfReports ? (
              <Button
                color="warning"
                size="sm"
                variant="flat"
                title="PDF reports available - Contact FRC for access"
              >
                PDF Reports Available
              </Button>
            ) : hasStockData ? (
              <Button
                color="secondary"
                size="sm"
                variant="flat"
                title="Stock data available - Limited report access"
              >
                View Stock Data
              </Button>
            ) : (
              <Button
                color="default"
                size="sm"
                variant="flat"
                isDisabled
                title="No data available at this time"
              >
                No Data Available
              </Button>
            )}
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // Component for rendering company table using HeroUI Table
  const CompanyTable = ({ companies, title }) => {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            {title} ({companies.length})
          </h3>
        </div>

        <Table
          aria-label={title}
          isStriped
          color="primary"
          selectionMode="none"
          classNames={{
            wrapper: "min-h-[222px]",
            th: [
              "bg-transparent",
              "text-default-500",
              "border-b",
              "border-divider",
            ],
            td: [
              // changing the rows border radius
              // first
              "group-data-[first=true]:first:before:rounded-none",
              "group-data-[first=true]:last:before:rounded-none",
              // middle
              "group-data-[middle=true]:before:rounded-none",
              // last
              "group-data-[last=true]:first:before:rounded-none",
              "group-data-[last=true]:last:before:rounded-none",
            ],
          }}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={companies}
            emptyContent={
              <p className="text-gray-500">
                No companies found matching your search criteria.
              </p>
            }
          >
            {(item) => (
              <TableRow key={item.ticker || item.company_name}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  // Show loading while session is being loaded
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="space-y-6 sm:space-y-8 lg:space-y-12">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 sm:py-12 md:py-16 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 xl:-mx-16 2xl:-mx-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Welcome Message */}
            {session && (
              <div className="mb-4 sm:mb-6">
                <p className="text-sm sm:text-base md:text-lg text-blue-200">
                  Welcome back,{" "}
                  <span className="font-semibold text-white">
                    {session.user?.name || session.user?.email}
                  </span>
                  !
                </p>
              </div>
            )}

            {/* Page Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              FRC Covered Companies
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4 sm:px-0">
              Explore our comprehensive database of{" "}
              <span className="font-semibold text-white">
                {companies.length}
              </span>{" "}
              FRC-covered companies. We offer{" "}
              <span className="font-semibold text-white">
                {companies.filter((c) => c.status === "success").length}{" "}
                companies
              </span>{" "}
              with full digital reports and interactive charts, plus{" "}
              <span className="font-semibold text-white">
                {
                  companies.filter(
                    (c) => c.status === "frc_covered_no_digital_reports"
                  ).length
                }{" "}
                additional companies
              </span>{" "}
              with PDF reports available through FRC.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
                <div className="text-2xl font-bold text-black mb-1">
                  {companies.length}
                </div>
                <div className="text-xs text-blue-400 font-medium">
                  Total Companies
                </div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
                <div className="text-2xl font-bold text-black mb-1">
                  {companies.filter((c) => c.status === "success").length}
                </div>
                <div className="text-xs text-blue-400 font-medium">
                  Digital Reports
                </div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
                <div className="text-2xl font-bold text-black mb-1">
                  {
                    companies.filter(
                      (c) => c.status === "frc_covered_no_digital_reports"
                    ).length
                  }
                </div>
                <div className="text-xs text-blue-400 font-medium">
                  PDF Reports
                </div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-30">
                <div className="text-2xl font-bold text-black mb-1">
                  {
                    companies.filter(
                      (c) =>
                        c.reports_count > 0 ||
                        c.status === "frc_covered_no_digital_reports"
                    ).length
                  }
                </div>
                <div className="text-xs text-blue-400 font-medium">
                  With Reports
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 lg:p-8">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 lg:mb-6 text-gray-900">
          Find Companies
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ticker or company name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 sm:p-4 lg:p-5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base lg:text-lg transition-all duration-300 pl-4 sm:pl-5 lg:pl-6"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 lg:pr-5">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Companies Tabs */}
      <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50 border-b">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            Companies by Exchange
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Browse companies organized by their stock exchange
          </p>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Tabs
            variant="underlined"
            color="primary"
            size="lg"
            classNames={{
              tabList:
                "gap-3 sm:gap-4 lg:gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-blue-600",
              tab: "max-w-fit px-0 h-10 sm:h-12 lg:h-14",
              tabContent: "group-data-[selected=true]:text-blue-600",
            }}
          >
            <Tab
              key="usa"
              title={
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                  <span className="text-lg sm:text-xl">🇺🇸</span>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">
                    United States
                  </span>
                  <Chip size="sm" color="primary" variant="flat">
                    {usCompanies.length}
                  </Chip>
                </div>
              }
            >
              <div className="mt-4 sm:mt-6 lg:mt-8">
                <CompanyTable
                  companies={usCompanies}
                  title="US Companies (NYSE, NASDAQ)"
                />
              </div>
            </Tab>

            <Tab
              key="canada"
              title={
                <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
                  <span className="text-lg sm:text-xl">🇨🇦</span>
                  <span className="text-xs sm:text-sm lg:text-base font-medium">
                    Canada
                  </span>
                  <Chip size="sm" color="primary" variant="flat">
                    {canadianCompanies.length}
                  </Chip>
                </div>
              }
            >
              <div className="mt-4 sm:mt-6 lg:mt-8">
                <CompanyTable
                  companies={canadianCompanies}
                  title="Canadian Companies (TSX, TSXV)"
                />
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
