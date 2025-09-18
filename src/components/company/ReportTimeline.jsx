"use client";

import { useState, useMemo } from "react";
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import ReportCard from "./ReportCard";

export default function ReportTimeline({ enhancedData, ticker }) {
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Extract reports from enhanced data
  const reports = enhancedData?.reports || [];
  const reportSummary = enhancedData?.report_summary || {};

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports;

    // Apply report type filter
    if (reportTypeFilter !== "all") {
      filtered = filtered.filter(report => report.report_source === reportTypeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.source_ticker?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort reports
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "date":
          aVal = new Date(a.published_date);
          bVal = new Date(b.published_date);
          break;
        case "title":
          aVal = a.title?.toLowerCase() || "";
          bVal = b.title?.toLowerCase() || "";
          break;
        case "type":
          aVal = a.report_source;
          bVal = b.report_source;
          break;
        default:
          aVal = a.id;
          bVal = b.id;
      }

      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    return filtered;
  }, [reports, reportTypeFilter, searchTerm, sortBy, sortOrder]);

  // Export function
  const exportReports = () => {
    const csvContent = [
      ["ID", "Title", "Date", "Type", "Source Ticker"],
      ...filteredReports.map(report => [
        report.id,
        report.title,
        report.published_date,
        report.report_source,
        report.source_ticker || ""
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ticker}_reports_history.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!enhancedData || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reports Available</h3>
        <p className="text-gray-500">
          No reports have been found for this company yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {enhancedData.reports_count || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reportSummary.digital_reports || 0}
            </div>
            <div className="text-sm text-gray-600">Digital Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {reportSummary.pdf_reports || 0}
            </div>
            <div className="text-sm text-gray-600">PDF Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {enhancedData.analysis_period ?
                Math.ceil((new Date(enhancedData.analysis_period.to) - new Date(enhancedData.analysis_period.from)) / (365.25 * 24 * 60 * 60 * 1000))
                : 0}
            </div>
            <div className="text-sm text-gray-600">Years of Data</div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={reportTypeFilter}
              onChange={(e) => setReportTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Reports</option>
              <option value="digital">Digital Only</option>
              <option value="pdf">PDF Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="type">Sort by Type</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            <button
              onClick={exportReports}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {(searchTerm || reportTypeFilter !== "all") && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredReports.length} of {reports.length} reports
            {searchTerm && ` (filtered by "${searchTerm}")`}
            {reportTypeFilter !== "all" && ` (${reportTypeFilter} reports only)`}
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <ReportCard
              key={`${report.report_source}-${report.id}`}
              report={report}
              ticker={ticker}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No reports match your current filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setReportTypeFilter("all");
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}