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
  MagnifyingGlassIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import FRCCoverageTimelineCard from "./FRCCoverageTimelineCard";

export default function EnhancedCompaniesTable({
  companies,
  title,
  totalCompaniesCount = 0,
  exchangeType = "all", // "us", "canada", "all"
  searchTerm = "", // Received from parent
  showPagination = false,
  itemsPerPage = 10,
}) {
  const [sortBy, setSortBy] = useState("company_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(itemsPerPage);

  // Filter, sort and paginate companies
  const { filteredCompanies, sortedCompanies, paginatedCompanies, totalPages } = useMemo(() => {
    // First filter by exchange type
    let exchangeFiltered = companies;
    if (exchangeType === 'us') {
      exchangeFiltered = companies.filter(company => {
        const exchanges = Array.isArray(company.exchange) ? company.exchange : [company.exchange];
        return exchanges.some(exchange =>
          exchange === "NASDAQ" || exchange === "NYSE" || exchange === "NYSE Arca" ||
          exchange === "New York Stock Exchange" || exchange === "NASDAQ Global Market" ||
          exchange === "NASDAQ Capital Market" || exchange === "AMEX" || exchange === "OTC"
        );
      });
    } else if (exchangeType === 'canada') {
      exchangeFiltered = companies.filter(company => {
        const exchanges = Array.isArray(company.exchange) ? company.exchange : [company.exchange];
        return exchanges.some(exchange =>
          exchange === "TSX" || exchange === "TSXV" || exchange === "Toronto Stock Exchange" ||
          exchange === "TSX Venture Exchange" || exchange === "CNQ" || exchange === "NEO"
        );
      });
    }

    // Then filter by search term
    const filtered = exchangeFiltered.filter(company =>
      !searchTerm ||
      company.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort companies
    const sorted = [...filtered].sort((a, b) => {
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
        filteredCompanies: filtered,
        sortedCompanies: sorted,
        paginatedCompanies: paginated,
        totalPages: total,
      };
    }

    return {
      filteredCompanies: filtered,
      sortedCompanies: sorted,
      paginatedCompanies: sorted,
      totalPages: 1,
    };
  }, [companies, searchTerm, sortBy, sortOrder, currentPage, rowsPerPage, showPagination]);

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
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
        >
          <ChartBarIcon className="h-3 w-3" />
          View Dashboard
        </Link>
      );
    } else if (hasPdfReports) {
      return (
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-xs font-medium"
          title="PDF reports available - Contact FRC for access"
        >
          <DocumentTextIcon className="h-3 w-3" />
          PDF Only
        </button>
      );
    } else if (hasStockData) {
      return (
        <button
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-xs font-medium"
          title="Stock data available - Limited report access"
        >
          <GlobeAmericasIcon className="h-3 w-3" />
          Stock Only
        </button>
      );
    } else {
      return (
        <button
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-xs font-medium"
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
      {paginatedCompanies.map((company) => {
        const volumeImpact = company.volume_impact_30d || null;
        const priceImpact = company.price_impact_30d || null;

        return (
          <div key={company.ticker} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg font-mono truncate">
                    {company.ticker}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {Array.isArray(company.exchange) ? (
                      company.exchange.map((ex, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white bg-opacity-20 backdrop-blur-sm rounded text-xs font-medium">
                          {ex}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 bg-white bg-opacity-20 backdrop-blur-sm rounded text-xs font-medium">
                        {company.exchange}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-white bg-opacity-20 backdrop-blur-sm px-2 py-1 rounded text-sm font-medium">
                    {company.currency}
                  </span>
                  <div className="text-xs text-blue-100 mt-1">
                    ID: {company._id}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
              {/* Company Name */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">
                  Company
                </h4>
                <p className="text-gray-900 text-sm font-medium line-clamp-2" title={company.company_name}>
                  {company.company_name}
                </p>
              </div>

              {/* Impact Metrics Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* FRC Reports */}
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">
                    {company.reports_count || 0}
                  </div>
                  <div className="text-xs text-gray-600">FRC Reports</div>
                  {company.frc_covered && (
                    <div className="text-xs text-green-600 font-medium mt-1">✅ Covered</div>
                  )}
                </div>

                {/* Volume Impact */}
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <div className={`text-lg font-bold ${
                    volumeImpact !== null
                      ? volumeImpact > 0 ? "text-green-600" : volumeImpact < 0 ? "text-red-600" : "text-gray-600"
                      : "text-gray-400"
                  }`}>
                    {volumeImpact !== null ? `${volumeImpact > 0 ? "+" : ""}${volumeImpact.toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">Volume 30d</div>
                </div>

                {/* Price Impact */}
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <div className={`text-lg font-bold ${
                    priceImpact !== null
                      ? priceImpact > 0 ? "text-green-600" : priceImpact < 0 ? "text-red-600" : "text-gray-600"
                      : "text-gray-400"
                  }`}>
                    {priceImpact !== null ? `${priceImpact > 0 ? "+" : ""}${priceImpact.toFixed(1)}%` : "N/A"}
                  </div>
                  <div className="text-xs text-gray-600">Price 30d</div>
                </div>
              </div>

              {/* Stock Data Points */}
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Stock Data:</span>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold text-sm ${
                    (company.stock_data_points || 0) > 0 ? "text-blue-600" : "text-gray-400"
                  }`}>
                    {company.stock_data_points ? `${(company.stock_data_points / 1000).toFixed(1)}k` : "0"}
                  </span>
                  <div className="flex gap-1">
                    {company.has_chart && <span className="text-green-600 text-xs" title="Chart Available">📊</span>}
                    {company.has_metrics && <span className="text-blue-600 text-xs" title="Metrics Available">📈</span>}
                  </div>
                </div>
              </div>

              {/* Last Analysis Date */}
              {company.analysis_date && (
                <div className="text-xs text-gray-500 text-center p-2 bg-gray-50 rounded">
                  Last analysis: {new Date(company.analysis_date).toLocaleDateString()}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex justify-center">
                {getActionButton(company)}
              </div>
            </div>
          </div>
        );
      })}
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
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "company_name") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("company_name");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  <BuildingOfficeIcon className="h-3 w-3" />
                  Company
                  {sortBy === "company_name" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-3 w-3" />
                    ) : (
                      <ChevronDownIcon className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide cursor-pointer hover:bg-slate-600"
                onClick={() => {
                  if (sortBy === "ticker") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("ticker");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-1">
                  Ticker / Exchange
                  {sortBy === "ticker" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon className="h-3 w-3" />
                    ) : (
                      <ChevronDownIcon className="h-3 w-3" />
                    ))}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <DocumentTextIcon className="h-3 w-3" />
                  FRC Reports
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <CurrencyDollarIcon className="h-3 w-3" />
                  Impact Metrics
                  <span className="text-green-300 text-xs">30d</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide">
                Stock Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  Last Analysis
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedCompanies.map((company, index) => {
              const volumeImpact = company.volume_impact_30d || null;
              const priceImpact = company.price_impact_30d || null;

              return (
                <React.Fragment key={company.ticker}>
                  <tr
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors duration-150`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <div className="font-medium text-sm leading-tight">
                          {company.company_name}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {company.currency} • ID: {company._id}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div>
                        <div className="font-mono text-blue-600 font-semibold text-sm">
                          {company.ticker}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(company.exchange) ? (
                            company.exchange.map((ex, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {ex}
                              </span>
                            ))
                          ) : (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {company.exchange}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-semibold text-lg ${
                            (company.reports_count || 0) > 0
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          {company.reports_count || 0}
                        </span>
                        {company.frc_covered && (
                          <span className="text-xs text-green-600 font-medium">FRC</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {volumeImpact !== null || priceImpact !== null ? (
                          <div className="flex flex-col items-center">
                            {volumeImpact !== null && (
                              <span className={`text-xs font-medium ${
                                volumeImpact > 0 ? "text-green-600" : volumeImpact < 0 ? "text-red-600" : "text-gray-600"
                              }`}>
                                📊 {volumeImpact > 0 ? "+" : ""}{volumeImpact.toFixed(1)}% Vol
                              </span>
                            )}
                            {priceImpact !== null && (
                              <span className={`text-xs font-medium ${
                                priceImpact > 0 ? "text-green-600" : priceImpact < 0 ? "text-red-600" : "text-gray-600"
                              }`}>
                                💰 {priceImpact > 0 ? "+" : ""}{priceImpact.toFixed(1)}% Price
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                            onClick={() => window.open(`/api/frc/company/${company.ticker}/metrics`, '_blank')}
                            title="Fetch live impact metrics"
                          >
                            📈 Load Metrics
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={`font-semibold text-xs ${
                            (company.stock_data_points || 0) > 0
                              ? "text-blue-600"
                              : "text-gray-400"
                          }`}
                        >
                          {company.stock_data_points ? `${(company.stock_data_points / 1000).toFixed(1)}k` : "0"}
                        </span>
                        <div className="flex gap-1">
                          {company.has_chart && (
                            <span className="text-green-600 text-xs" title="Chart Available">📊</span>
                          )}
                          {company.has_metrics && (
                            <span className="text-blue-600 text-xs" title="Metrics Available">📈</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {company.analysis_date ? (
                        <div className="text-center">
                          <div className="font-medium">
                            {new Date(company.analysis_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-500">
                            {new Date(company.analysis_date).toLocaleDateString('en-US', {
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getActionButton(company)}
                        <button
                          onClick={() => toggleRowExpansion(company.ticker)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="View Details"
                        >
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
                      <td colSpan="7" className="px-4 py-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              📊 {company.ticker} - Detailed Analysis
                            </h4>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              Source: FRC Database • ID: {company._id}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Volume Impact Metrics */}
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                📈 Volume Impact (30-day)
                              </h5>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-blue-600">
                                  {volumeImpact !== null ? `${volumeImpact > 0 ? "+" : ""}${volumeImpact.toFixed(2)}%` : "N/A"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Average volume change after FRC report publication
                                </div>
                                {volumeImpact !== null && (
                                  <div className="text-xs">
                                    <span className={`font-medium ${volumeImpact > 0 ? "text-green-600" : "text-red-600"}`}>
                                      {volumeImpact > 0 ? "🔺 Increased" : "🔻 Decreased"} trading activity
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Price Impact Metrics */}
                            <div className="bg-green-50 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
                                💰 Price Impact (30-day)
                              </h5>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-green-600">
                                  {priceImpact !== null ? `${priceImpact > 0 ? "+" : ""}${priceImpact.toFixed(2)}%` : "N/A"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Price movement after FRC coverage
                                </div>
                                {priceImpact !== null && (
                                  <div className="text-xs">
                                    <span className={`font-medium ${priceImpact > 0 ? "text-green-600" : "text-red-600"}`}>
                                      {priceImpact > 0 ? "📈 Positive" : "📉 Negative"} market reaction
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Trading Information */}
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
                                🏛️ Trading Details
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Exchange:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Array.isArray(company.exchange) ? (
                                      company.exchange.map((ex, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                          {ex}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                        {company.exchange}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-600">Currency:</span>
                                  <span className="font-mono font-semibold ml-2">{company.currency}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Stock Data:</span>
                                  <span className="font-semibold ml-2 text-blue-600">
                                    {company.stock_data_points ? `${(company.stock_data_points / 1000).toFixed(1)}k points` : "No data"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* FRC Coverage Status */}
                            <div className="bg-purple-50 rounded-lg p-3">
                              <h5 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-1">
                                📊 FRC Coverage
                              </h5>
                              <div className="space-y-2">
                                <div className="text-2xl font-bold text-purple-600">
                                  {company.reports_count || 0}
                                </div>
                                <div className="text-xs text-gray-600 mb-2">
                                  Total FRC reports published
                                </div>
                                <div className="flex flex-col gap-1">
                                  {company.frc_covered && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                      ✅ FRC Covered
                                    </span>
                                  )}
                                  {company.has_chart && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                      📊 Charts Available
                                    </span>
                                  )}
                                  {company.has_metrics && (
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-medium">
                                      📈 Metrics Available
                                    </span>
                                  )}
                                </div>
                                {company.analysis_date && (
                                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                    Last analysis: {new Date(company.analysis_date).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* API Access Information */}
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500">
                            <h6 className="text-sm font-semibold text-gray-800 mb-2">🔗 API Access Points</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                              <div>
                                <span className="text-gray-600">Metrics:</span>
                                <span className="ml-2 text-blue-600">/api/frc/company/{company.ticker}/metrics</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Reports:</span>
                                <span className="ml-2 text-blue-600">/api/frc/company/{company.ticker}/reports</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Chart Data:</span>
                                <span className="ml-2 text-blue-600">/api/frc/company/{company.ticker}/chart-data</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Full Profile:</span>
                                <span className="ml-2 text-blue-600">/api/frc/company/{company.ticker}</span>
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
              {searchTerm
                ? `${filteredCompanies.length} of ${
                    exchangeType === 'us' ?
                      companies.filter(c => {
                        const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                        return exchanges.some(exchange =>
                          exchange === "NASDAQ" || exchange === "NYSE" || exchange === "NYSE Arca" ||
                          exchange === "New York Stock Exchange" || exchange === "NASDAQ Global Market" ||
                          exchange === "NASDAQ Capital Market" || exchange === "AMEX" || exchange === "OTC"
                        );
                      }).length :
                    exchangeType === 'canada' ?
                      companies.filter(c => {
                        const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                        return exchanges.some(exchange =>
                          exchange === "TSX" || exchange === "TSXV" || exchange === "Toronto Stock Exchange" ||
                          exchange === "TSX Venture Exchange" || exchange === "CNQ" || exchange === "NEO"
                        );
                      }).length :
                    companies.length
                  } companies matching "${searchTerm}"`
                : `${exchangeType === 'us' ?
                    companies.filter(c => {
                      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                      return exchanges.some(exchange =>
                        exchange === "NASDAQ" || exchange === "NYSE" || exchange === "NYSE Arca" ||
                        exchange === "New York Stock Exchange" || exchange === "NASDAQ Global Market" ||
                        exchange === "NASDAQ Capital Market" || exchange === "AMEX" || exchange === "OTC"
                      );
                    }).length :
                  exchangeType === 'canada' ?
                    companies.filter(c => {
                      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                      return exchanges.some(exchange =>
                        exchange === "TSX" || exchange === "TSXV" || exchange === "Toronto Stock Exchange" ||
                        exchange === "TSX Venture Exchange" || exchange === "CNQ" || exchange === "NEO"
                      );
                    }).length :
                  companies.length
                } compan${
                  (exchangeType === 'us' ?
                    companies.filter(c => {
                      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                      return exchanges.some(exchange =>
                        exchange === "NASDAQ" || exchange === "NYSE" || exchange === "NYSE Arca" ||
                        exchange === "New York Stock Exchange" || exchange === "NASDAQ Global Market" ||
                        exchange === "NASDAQ Capital Market" || exchange === "AMEX" || exchange === "OTC"
                      );
                    }).length :
                  exchangeType === 'canada' ?
                    companies.filter(c => {
                      const exchanges = Array.isArray(c.exchange) ? c.exchange : [c.exchange];
                      return exchanges.some(exchange =>
                        exchange === "TSX" || exchange === "TSXV" || exchange === "Toronto Stock Exchange" ||
                        exchange === "TSX Venture Exchange" || exchange === "CNQ" || exchange === "NEO"
                      );
                    }).length :
                  companies.length) !== 1 ? "ies" : "y"
                } available`
              }
              {showPagination &&
                totalPages > 1 &&
                ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">

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
        <TableView />
        <PaginationControls />

        {/* Data Source Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span>📊 Data Source: FRC Database</span>
              <span>•</span>
              <span>🔗 API: /api/frc/companies</span>
              <span>•</span>
              <span>📈 Volume & Price Impact: 30-day post-publication analysis</span>
              <span>•</span>
              <span>⏰ Updated: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="mt-1 text-gray-400">
              Each ticker represents a unique exchange listing. Multi-exchange companies show separate metrics per ticker.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
