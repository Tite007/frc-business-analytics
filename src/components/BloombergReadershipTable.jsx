"use client";

import React, { useState, useEffect } from "react";
import { getBloombergInstitutional, getBloombergSummary } from "@/lib/api";

const BloombergReadershipTable = ({ ticker }) => {
  const [institutionalData, setInstitutionalData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmbargoed, setShowEmbargoed] = useState(true);
  const [sortField, setSortField] = useState("access_date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    if (ticker) {
      setCurrentPage(1); // Reset to first page when ticker or filters change
      fetchBloombergData();
    }
  }, [ticker, showEmbargoed]);

  const fetchBloombergData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ALL institutional data first (no pagination on server side)
      const institutionalResponse = await getBloombergInstitutional(ticker, {
        show_embargoed: showEmbargoed,
        limit: 1000, // Get all records
        offset: 0,
        days: 90,
      });

      // Handle 404 or not found errors - this means Bloomberg endpoints aren't available
      if (institutionalResponse?.error) {
        const errorMessage = institutionalResponse.message || "";
        if (
          errorMessage.includes("404") ||
          errorMessage.includes("not found") ||
          errorMessage.includes("Request failed with status code 404")
        ) {
          // Bloomberg endpoints not available - hide component
          console.log("Bloomberg endpoints not available for", ticker);
          setInstitutionalData([]);
          setSummaryData(null);
          setLoading(false);
          return;
        } else {
          throw new Error(
            institutionalResponse.message || "Failed to fetch Bloomberg data"
          );
        }
      }

      // If we have successful institutional data
      if (institutionalResponse?.success && institutionalResponse?.data) {
        const rawData = institutionalResponse.data.institutional_records || [];

        // Sort data to show revealed records first, then embargoed records
        const sortedData = rawData.sort((a, b) => {
          // Primary sort: revealed records first (is_embargoed: false first)
          if (a.is_embargoed !== b.is_embargoed) {
            return a.is_embargoed ? 1 : -1; // false (revealed) comes before true (embargoed)
          }

          // Secondary sort: by access_date (newest first) within each group
          const dateA = new Date(a.access_date);
          const dateB = new Date(b.access_date);
          return dateB - dateA;
        });

        setInstitutionalData(sortedData);
        setTotalRecords(sortedData.length); // Use actual data length for client-side pagination

        // Use summary from institutional response if available
        if (institutionalResponse.data.summary) {
          setSummaryData(institutionalResponse.data.summary);
        }

        // Try to fetch summary data separately if not included in institutional response
        if (!institutionalResponse.data.summary) {
          try {
            const summaryResponse = await getBloombergSummary(ticker);
            if (summaryResponse?.success && summaryResponse?.data) {
              setSummaryData(summaryResponse.data.summary);
            }
          } catch (summaryErr) {
            // Summary endpoint failed, but we still have institutional data
            console.warn("Bloomberg summary endpoint failed:", summaryErr);
          }
        }
      } else {
        // No data available
        setInstitutionalData([]);
        setSummaryData(null);
      }
    } catch (err) {
      console.error("Error fetching Bloomberg data:", err);
      // For 404 or endpoint not found errors, hide the component
      const errorMessage = err.message || "";
      if (
        errorMessage.includes("404") ||
        errorMessage.includes("not found") ||
        errorMessage.includes("Request failed with status code 404")
      ) {
        setInstitutionalData([]);
        setSummaryData(null);
        setError(null); // Clear error to hide component
      } else {
        setError(err.message);
        setInstitutionalData([]);
        setSummaryData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const sortData = (field) => {
    if (institutionalData.length === 0) return;

    const direction =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...institutionalData].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Handle date sorting
      if (field === "access_date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (direction === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setInstitutionalData(sorted);
  };

  const getCountryFlag = (country) => {
    const flags = {
      "United States": "🇺🇸",
      Canada: "🇨🇦",
      "United Kingdom": "🇬🇧",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Japan: "🇯🇵",
      Australia: "🇦🇺",
      Switzerland: "🇨🇭",
      Netherlands: "🇳🇱",
      Italy: "🇮🇹",
      Spain: "🇪🇸",
      Sweden: "🇸🇪",
      Norway: "🇳🇴",
      Denmark: "🇩🇰",
      Finland: "🇫🇮",
      Belgium: "🇧🇪",
      Austria: "🇦🇹",
      Ireland: "🇮🇪",
      Luxembourg: "🇱🇺",
      Portugal: "🇵🇹",
    };
    return flags[country] || "🌍";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return "↕️";
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Client-side pagination functions
  const totalPages = Math.ceil(totalRecords / itemsPerPage);
  const startRecord = (currentPage - 1) * itemsPerPage + 1;
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords);

  // Get current page data
  const currentPageData = institutionalData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Don't render if no data and no error (means Bloomberg endpoints aren't available or ticker doesn't have Bloomberg data)
  if (!loading && !error && institutionalData.length === 0 && !summaryData) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Bloomberg Institutional Readership
          </h3>
          <p className="text-gray-600">Loading Bloomberg readership data...</p>
        </div>
        <div className="p-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">
            Fetching institutional interest data...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-red-50 to-pink-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            📊 Bloomberg Institutional Readership
          </h3>
          <p className="text-red-600">Error loading Bloomberg data</p>
        </div>
        <div className="p-16 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium">
            Failed to load Bloomberg data
          </p>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <button
            onClick={fetchBloombergData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with Summary Stats */}
      <div className="px-8 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Bloomberg Institutional Readership
            </h3>
            <p className="text-gray-600">
              Institutional interest and readership analytics from Bloomberg
              Terminal
            </p>
          </div>

          {/* Summary Stats */}
          {summaryData && (
            <div className="mt-4 lg:mt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center bg-white bg-opacity-70 rounded-lg p-3">
                <div className="text-xl font-bold text-blue-600">
                  {summaryData.total_readership_records || 0}
                </div>
                <div className="text-xs text-gray-600">Total Reads</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 rounded-lg p-3">
                <div className="text-xl font-bold text-green-600">
                  {summaryData.unique_institutions || 0}
                </div>
                <div className="text-xs text-gray-600">Institutions</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 rounded-lg p-3">
                <div className="text-xl font-bold text-purple-600">
                  {summaryData.unique_countries || 0}
                </div>
                <div className="text-xs text-gray-600">Countries</div>
              </div>
              <div className="text-center bg-white bg-opacity-70 rounded-lg p-3">
                <div className="text-xl font-bold text-orange-600">
                  {summaryData.embargo_status?.revealed_records || 0}
                </div>
                <div className="text-xs text-gray-600">Revealed</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showEmbargoed}
                onChange={(e) => setShowEmbargoed(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span>Show Embargoed Records</span>
            </label>

            {/* Items per page */}
            <div className="flex items-center gap-2 text-sm">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => changeItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>per page</span>
            </div>

            {/* Sorting info */}
            <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              <span>📊</span>
              <span>Revealed records shown first</span>
            </div>
          </div>

          {totalRecords > 0 && (
            <div className="mt-2 sm:mt-0 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Showing {startRecord}-{endRecord} of {totalRecords} records
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {institutionalData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-400">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-700 sticky top-0 z-10">
              <tr className="border-b-2 border-slate-600">
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 cursor-pointer hover:bg-slate-600"
                  onClick={() => sortData("customer_name")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span>Institution {getSortIcon("customer_name")}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 cursor-pointer hover:bg-slate-600"
                  onClick={() => sortData("report_title")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                    <span>Report Title {getSortIcon("report_title")}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 cursor-pointer hover:bg-slate-600"
                  onClick={() => sortData("customer_country")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span>Country {getSortIcon("customer_country")}</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span>City</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span>Firm #</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 cursor-pointer hover:bg-slate-600"
                  onClick={() => sortData("access_date")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <span>Access Date {getSortIcon("access_date")}</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide border-r-2 border-slate-600 cursor-pointer hover:bg-slate-600"
                  onClick={() => sortData("report_published_date")}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <span>
                      Published Date {getSortIcon("report_published_date")}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wide">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span>Status</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {currentPageData.map((record, index) => (
                <tr
                  key={`${record.customer_number}-${index}`}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${
                    record.is_embargoed ? "bg-yellow-50" : "bg-green-50"
                  } hover:bg-blue-50 transition-colors duration-150 border-b-2 border-gray-400`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 border-r-2 border-gray-400">
                    <div className="max-w-xs">
                      <div
                        className="font-semibold truncate"
                        title={record.customer_name}
                      >
                        {record.customer_name || "N/A"}
                      </div>
                      {record.customer_number && (
                        <div className="text-xs text-gray-500 font-mono">
                          #{record.customer_number}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 border-r-2 border-gray-400">
                    <div className="max-w-xs">
                      <div
                        className="font-medium truncate"
                        title={record.report_title}
                      >
                        {record.report_title || "N/A"}
                      </div>
                      {record.report_authors && (
                        <div className="text-xs text-gray-500">
                          By: {record.report_authors}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                    <div className="flex items-center">
                      <span className="mr-2 text-lg">
                        {getCountryFlag(record.customer_country)}
                      </span>
                      <span>{record.customer_country || "N/A"}</span>
                    </div>
                    {record.customer_state && (
                      <div className="text-xs text-gray-500">
                        {record.customer_state}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                    {record.customer_city || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 border-r-2 border-gray-400">
                    {record.firm_number || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                    {formatDate(record.access_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r-2 border-gray-400">
                    {record.report_published_date
                      ? formatDate(record.report_published_date)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.is_embargoed
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {record.is_embargoed ? (
                        <>🔒 Embargoed</>
                      ) : (
                        <>👁️ Revealed</>
                      )}
                    </span>
                    {record.embargo_lift_date && record.is_embargoed && (
                      <div className="text-xs text-gray-500 mt-1">
                        Lift: {formatDate(record.embargo_lift_date)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <p className="text-gray-500 text-lg font-medium">
            No Bloomberg readership data available
          </p>
          <p className="text-gray-400 text-sm mt-2">
            This company may not have institutional readership data or the data
            may be embargoed.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalRecords > itemsPerPage && (
        <div className="px-8 py-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-600">
              Showing {startRecord}-{endRecord} of {totalRecords} records
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 text-sm rounded border ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                }`}
              >
                Previous
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {/* First page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => goToPage(1)}
                      className="px-3 py-1 text-sm rounded border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="text-gray-400">...</span>
                    )}
                  </>
                )}

                {/* Current page and neighbors */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded border ${
                        pageNum === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Last page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="px-3 py-1 text-sm rounded border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 text-sm rounded border ${
                  currentPage === totalPages
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

      {/* Footer with additional info */}
      {summaryData && institutionalData.length > 0 && (
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-600">
            <div className="flex items-center gap-6">
              {summaryData.primary_country && (
                <span>
                  <strong>Top Country:</strong>{" "}
                  {getCountryFlag(summaryData.primary_country)}{" "}
                  {summaryData.primary_country}
                </span>
              )}
              {summaryData.embargo_status && (
                <span>
                  <strong>Embargo Rate:</strong>{" "}
                  {summaryData.embargo_status.embargo_percentage?.toFixed(1) ||
                    0}
                  %
                </span>
              )}
            </div>
            <div className="mt-2 sm:mt-0">
              <span className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloombergReadershipTable;
