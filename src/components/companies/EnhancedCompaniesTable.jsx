"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ArrowDownTrayIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  GlobeAmericasIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import FRCCoverageTimelineCard from "./FRCCoverageTimelineCard";

export default function EnhancedCompaniesTable({
  companies,
  title,
  searchTerm,
  showPagination = false,
  itemsPerPage = 10,
}) {
  const [viewMode, setViewMode] = useState("table"); // "table" or "cards"
  const [sortBy, setSortBy] = useState("company_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);

  // Sort and paginate companies
  const { sortedCompanies, paginatedCompanies, totalPages } = useMemo(() => {
    // Sort companies
    const sorted = [...companies].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "company_name":
          aVal = a.company_name || "";
          bVal = b.company_name || "";
          break;
        case "ticker":
          aVal = a.ticker || "";
          bVal = b.ticker || "";
          break;
        case "reports_count":
          aVal = a.reports_count || 0;
          bVal = b.reports_count || 0;
          break;
        case "analysis_date":
          aVal = new Date(a.analysis_date || 0);
          bVal = new Date(b.analysis_date || 0);
          break;
        case "stock_data_points":
          aVal = a.stock_data_points || 0;
          bVal = b.stock_data_points || 0;
          break;
        default:
          aVal = a[sortBy] || "";
          bVal = b[sortBy] || "";
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    // Paginate if enabled
    if (showPagination) {
      const total = Math.ceil(sorted.length / rowsPerPage);
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginated = sorted.slice(startIndex, endIndex);

      return {
        sortedCompanies: sorted,
        paginatedCompanies: paginated,
        totalPages: total,
      };
    }

    return {
      sortedCompanies: sorted,
      paginatedCompanies: sorted,
      totalPages: 1,
    };
  }, [companies, sortBy, sortOrder, currentPage, rowsPerPage, showPagination]);

  // Reset to first page when companies change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [companies]);

  const toggleRowExpansion = (ticker) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(ticker)) {
      newExpanded.delete(ticker);
    } else {
      newExpanded.add(ticker);
    }
    setExpandedRows(newExpanded);
  };

  const exportData = () => {
    const csvContent = [
      ["Company", "Ticker", "Exchange", "Currency", "Status", "Reports Count", "Stock Data Points", "Has Chart", "Has Metrics", "Analysis Date"],
      ...sortedCompanies.map((company) => [
        company.company_name,
        company.ticker,
        Array.isArray(company.exchange) ? company.exchange.join(";") : company.exchange,
        company.currency,
        company.status,
        company.reports_count || 0,
        company.stock_data_points || 0,
        company.has_chart ? "Yes" : "No",
        company.has_metrics ? "Yes" : "No",
        company.analysis_date || "N/A"
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "_")}_companies.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusInfo = (company) => {
    switch (company.status) {
      case "success":
        return {
          text: "Complete Data",
          color: "bg-green-100 text-green-800",
          icon: "✅",
          description: "Full digital reports and interactive charts available",
        };
      case "frc_covered_no_digital_reports":
        return {
          text: "PDF Reports",
          color: "bg-yellow-100 text-yellow-800",
          icon: "📄",
          description: "PDF reports available through FRC",
        };
      case "frc_covered_no_stock_data":
        return {
          text: "Reports Only",
          color: "bg-gray-100 text-gray-800",
          icon: "📊",
          description: "Limited report access available",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-600",
          icon: "❓",
          description: "Status unknown",
        };
    }
  };

  const getActionButton = (company) => {
    const hasDigitalReports = company.status === "success";
    const hasPdfReports = company.status === "frc_covered_no_digital_reports";
    const hasStockData = company.status !== "frc_covered_no_stock_data";

    if (hasDigitalReports) {
      return (
        <Link
          href={`/${company.ticker}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <ChartBarIcon className="h-4 w-4" />
          View Dashboard
        </Link>
      );
    } else if (hasPdfReports) {
      return (
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
          title="PDF reports available - Contact FRC for access"
        >
          <DocumentTextIcon className="h-4 w-4" />
          PDF Available
        </button>
      );
    } else if (hasStockData) {
      return (
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          title="Stock data available - Limited report access"
        >
          <GlobeAmericasIcon className="h-4 w-4" />
          Stock Data
        </button>
      );
    } else {
      return (
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
          disabled
          title="No data available at this time"
        >
          No Data
        </button>
      );
    }
  };

  // Pagination Controls Component
  const PaginationControls = () => {
    if (!showPagination || totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const start = Math.max(1, currentPage - 2);
        const end = Math.min(totalPages, start + maxVisiblePages - 1);

        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-700">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, sortedCompanies.length)} of{" "}
            {sortedCompanies.length} companies
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            First
          </button>
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm rounded-md border ${
                currentPage === page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Last
          </button>
        </div>
      </div>
    );
  };

  // Card View Component
  const CardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedCompanies.map((company) => (
        <div key={company.ticker} className="space-y-4">
          {/* Company Info Header */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg truncate">
                    {company.ticker}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {Array.isArray(company.exchange) ? company.exchange.join(", ") : company.exchange}
                  </p>
                </div>
                <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {company.currency}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
              {/* Company Name */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  Company Name
                </h4>
                <p
                  className="text-gray-900 text-sm font-medium line-clamp-2"
                  title={company.company_name}
                >
                  {company.company_name}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">{getActionButton(company)}</div>
            </div>
          </div>

          {/* FRC Coverage Timeline Card */}
          <FRCCoverageTimelineCard company={company} />
        </div>
      ))}
    </div>
  );

  // Table View Component
  const TableView = () => (
    <div className="overflow-hidden border border-gray-200 rounded-xl">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "company_name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("company_name");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  Company
                  {sortBy === "company_name" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "ticker") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("ticker");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Ticker
                  {sortBy === "ticker" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Exchange
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Status
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "reports_count") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("reports_count");
                    setSortOrder("desc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  Reports
                  {sortBy === "reports_count" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "stock_data_points") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("stock_data_points");
                    setSortOrder("desc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Data Points
                  {sortBy === "stock_data_points" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Data Available
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "analysis_date") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("analysis_date");
                    setSortOrder("desc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Last Updated
                  {sortBy === "analysis_date" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCompanies.map((company, index) => {
              const statusInfo = getStatusInfo(company);
              return (
                <React.Fragment key={company.ticker}>
                  <tr
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {company.company_name}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {company.currency}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 font-semibold">
                      {company.ticker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {Array.isArray(company.exchange) ? company.exchange.join(", ") : company.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{statusInfo.icon}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span
                        className={`font-semibold ${
                          (company.reports_count || 0) > 0
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {company.reports_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <span
                        className={`font-semibold ${
                          (company.stock_data_points || 0) > 0
                            ? "text-blue-600"
                            : "text-gray-400"
                        }`}
                      >
                        {company.stock_data_points || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1">
                        {company.has_chart && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium" title="Chart Available">
                            📊
                          </span>
                        )}
                        {company.has_metrics && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium" title="Metrics Available">
                            📈
                          </span>
                        )}
                        {company.frc_covered && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium" title="FRC Covered">
                            ✅
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {company.analysis_date ? (
                        <div>
                          <div className="font-medium">
                            {new Date(company.analysis_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(company.analysis_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {getActionButton(company)}
                        <button
                          onClick={() => toggleRowExpansion(company.ticker)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          {expandedRows.has(company.ticker) ? (
                            <ChevronUpIcon className="h-4 w-4" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows.has(company.ticker) && (
                    <tr className="bg-blue-50">
                      <td colSpan="9" className="px-6 py-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Company Details - {company.company_name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Status Information
                              </h5>
                              <p className="text-sm text-gray-600 mb-2">
                                {statusInfo.description}
                              </p>
                              <div className="text-sm text-gray-600">
                                <div>Status: <span className="font-medium">{company.status}</span></div>
                                <div>FRC Covered: <span className="font-medium">{company.frc_covered ? "Yes" : "No"}</span></div>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Trading Information
                              </h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  Exchange:{" "}
                                  <span className="font-medium">
                                    {Array.isArray(company.exchange) ? company.exchange.join(", ") : company.exchange}
                                  </span>
                                </div>
                                <div>
                                  Currency:{" "}
                                  <span className="font-medium">
                                    {company.currency}
                                  </span>
                                </div>
                                <div>
                                  Ticker:{" "}
                                  <span className="font-medium font-mono">
                                    {company.ticker}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 mb-2">
                                Data Availability
                              </h5>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>
                                  Reports:{" "}
                                  <span className="font-medium text-green-600">
                                    {company.reports_count || 0}
                                  </span>
                                </div>
                                <div>
                                  Stock Data Points:{" "}
                                  <span className="font-medium text-blue-600">
                                    {company.stock_data_points || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  {company.has_chart && <span className="text-green-600">📊 Charts</span>}
                                  {company.has_metrics && <span className="text-blue-600">📈 Metrics</span>}
                                </div>
                                {company.analysis_date && (
                                  <div className="text-xs text-gray-500 mt-2">
                                    Last updated: {new Date(company.analysis_date).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Table */}
      <div className="lg:hidden">
        <CardView />
      </div>
    </div>
  );

  if (companies.length === 0) {
    return (
      <div className="text-center py-16">
        <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">
          No companies found{searchTerm && ` matching "${searchTerm}"`}.
        </p>
        {searchTerm && (
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search terms.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">
              {companies.length} compan{companies.length !== 1 ? "ies" : "y"}{" "}
              available
              {showPagination &&
                totalPages > 1 &&
                ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "cards"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Cards
              </button>
            </div>

            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {companies.length} Companies
            </span>

            <button
              onClick={exportData}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {viewMode === "table" ? <TableView /> : <CardView />}
        <PaginationControls />
      </div>
    </div>
  );
}
