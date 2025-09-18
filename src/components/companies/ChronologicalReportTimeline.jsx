"use client";

import { useState, useEffect } from "react";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { getCompanyReports, getReportTimeline } from "@/lib/api";

export default function ChronologicalReportTimeline({ ticker, className = "" }) {
  const [reports, setReports] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("timeline"); // "timeline" or "list"

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);

        // Fetch both reports and timeline data
        const [reportsResponse, timelineResponse] = await Promise.all([
          getCompanyReports(ticker, {
            include_pdf: true,
            include_digital: true,
          }),
          getReportTimeline(ticker)
        ]);

        if (reportsResponse.error && timelineResponse.error) {
          setError("Report data not available");
        } else {
          // Merge and sort reports chronologically
          const allReports = [];

          if (reportsResponse.reports) {
            allReports.push(...reportsResponse.reports);
          }

          if (timelineResponse.timeline_events) {
            allReports.push(...timelineResponse.timeline_events);
          }

          // Sort by date (oldest first)
          const sortedReports = allReports
            .filter(report => report.date || report.publication_date)
            .sort((a, b) => {
              const dateA = new Date(a.date || a.publication_date);
              const dateB = new Date(b.date || b.publication_date);
              return dateA - dateB;
            });

          setReports(sortedReports);
          setTimeline(timelineResponse.summary || null);
        }
      } catch (err) {
        setError(`Failed to load report timeline: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchReportData();
    }
  }, [ticker]);

  const getReportTypeInfo = (report) => {
    const isDigital = report.type === "digital" || report.has_digital_access;
    const isPdf = report.type === "pdf" || report.format === "pdf";

    if (isDigital) {
      return {
        type: "digital",
        icon: ChartBarIcon,
        color: "bg-blue-100 text-blue-800",
        borderColor: "border-blue-300",
        label: "Digital Report",
        description: "Interactive dashboard available"
      };
    } else if (isPdf) {
      return {
        type: "pdf",
        icon: DocumentTextIcon,
        color: "bg-yellow-100 text-yellow-800",
        borderColor: "border-yellow-300",
        label: "PDF Report",
        description: "Research document"
      };
    } else {
      return {
        type: "unknown",
        icon: DocumentTextIcon,
        color: "bg-gray-100 text-gray-800",
        borderColor: "border-gray-300",
        label: "Report",
        description: "Research coverage"
      };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString(),
      month: date.toLocaleDateString(undefined, { month: 'short' }),
      day: date.getDate(),
      year: date.getFullYear()
    };
  };

  const calculateCoverageStats = () => {
    if (!reports.length) return null;

    const digitalReports = reports.filter(r => getReportTypeInfo(r).type === "digital").length;
    const pdfReports = reports.filter(r => getReportTypeInfo(r).type === "pdf").length;
    const firstReport = reports[0];
    const lastReport = reports[reports.length - 1];

    const firstDate = new Date(firstReport.date || firstReport.publication_date);
    const lastDate = new Date(lastReport.date || lastReport.publication_date);
    const coverageDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24));

    return {
      totalReports: reports.length,
      digitalReports,
      pdfReports,
      coverageDays,
      firstDate,
      lastDate,
      avgReportsPerMonth: coverageDays > 0 ? (reports.length / (coverageDays / 30)).toFixed(1) : 0
    };
  };

  const stats = calculateCoverageStats();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">
            {error.includes("404") ? "Report timeline not available yet" : error}
          </p>
        </div>
      </div>
    );
  }

  if (!reports.length) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">No reports published yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CalendarDaysIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">FRC Research Timeline</h3>
              <p className="text-sm text-gray-600">Chronological report publication history</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "timeline"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Timeline
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Statistics */}
      {stats && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalReports}</div>
              <div className="text-xs text-gray-500">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.digitalReports}</div>
              <div className="text-xs text-gray-500">Digital</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pdfReports}</div>
              <div className="text-xs text-gray-500">PDF</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.coverageDays}</div>
              <div className="text-xs text-gray-500">Days Coverage</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {viewMode === "timeline" ? (
          /* Timeline View */
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            <div className="space-y-6">
              {reports.map((report, index) => {
                const typeInfo = getReportTypeInfo(report);
                const TypeIcon = typeInfo.icon;
                const date = formatDate(report.date || report.publication_date);
                const isFirst = index === 0;
                const isLast = index === reports.length - 1;

                return (
                  <div key={index} className="relative flex items-start gap-4">
                    {/* Timeline Marker */}
                    <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                      isFirst ? 'border-green-400 bg-green-100' :
                      isLast ? 'border-blue-400 bg-blue-100' :
                      'border-gray-300 bg-white'
                    }`}>
                      {isFirst ? (
                        <PlayIcon className="h-6 w-6 text-green-600" />
                      ) : isLast ? (
                        <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                      ) : (
                        <TypeIcon className="h-6 w-6 text-gray-600" />
                      )}
                    </div>

                    {/* Report Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`bg-white border rounded-lg p-4 shadow-sm ${typeInfo.borderColor}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                {typeInfo.label}
                              </span>
                              {isFirst && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  First Report
                                </span>
                              )}
                              {isLast && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Latest
                                </span>
                              )}
                            </div>

                            <h4 className="font-medium text-gray-900 mb-1">
                              {report.title || report.report_title || `${typeInfo.label} - ${date.full}`}
                            </h4>

                            <p className="text-sm text-gray-600 mb-2">
                              {report.summary || typeInfo.description}
                            </p>

                            {/* Report Metrics */}
                            {report.volume_impact && (
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <ArrowTrendingUpIcon className="h-3 w-3" />
                                  Volume: +{report.volume_impact}%
                                </span>
                                {report.price_impact && (
                                  <span>Price: {report.price_impact > 0 ? '+' : ''}{report.price_impact}%</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right ml-4">
                            <div className="text-sm font-medium text-gray-900">{date.full}</div>
                            <div className="text-xs text-gray-500">
                              {index === 0 ? 'Coverage Started' :
                               index === reports.length - 1 ? 'Most Recent' :
                               `${reports.length - index} reports ago`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {reports.map((report, index) => {
              const typeInfo = getReportTypeInfo(report);
              const TypeIcon = typeInfo.icon;
              const date = formatDate(report.date || report.publication_date);

              return (
                <div key={index} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${typeInfo.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <TypeIcon className="h-5 w-5 text-gray-600" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          <h4 className="font-medium text-gray-900 truncate">
                            {report.title || report.report_title || `Report ${index + 1}`}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {report.summary || typeInfo.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">{date.full}</div>
                      <div className="text-xs text-gray-500">
                        {report.volume_impact && `+${report.volume_impact}% volume`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Summary */}
      {stats && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600 text-center">
            <span className="font-medium text-gray-900">{stats.totalReports}</span> reports published over{" "}
            <span className="font-medium text-gray-900">{stats.coverageDays}</span> days
            {stats.avgReportsPerMonth > 0 && (
              <span> • Average <span className="font-medium text-gray-900">{stats.avgReportsPerMonth}</span> reports/month</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}