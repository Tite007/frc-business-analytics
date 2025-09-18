"use client";

import {
  CalendarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/24/outline";

export default function FRCCoverageTimelineCard({ company }) {
  // Calculate coverage metrics
  const calculateCoverageMetrics = () => {
    const hasReports = (company.reports_count || 0) > 0;
    const hasDigitalReports = company.status === "success";
    const hasPdfReports = company.status === "frc_covered_no_digital_reports";
    const hasStockData = (company.stock_data_points || 0) > 0;

    // Simulate coverage timeline data (in real implementation, this would come from API)
    const firstReportDate = company.first_report_date || company.analysis_date;
    const lastReportDate = company.last_report_date || company.analysis_date;
    const coverageDurationDays = firstReportDate && lastReportDate ?
      Math.floor((new Date(lastReportDate) - new Date(firstReportDate)) / (1000 * 60 * 60 * 24)) : 0;

    return {
      hasReports,
      hasDigitalReports,
      hasPdfReports,
      hasStockData,
      firstReportDate,
      lastReportDate,
      coverageDurationDays,
      totalReports: company.reports_count || 0,
      digitalReports: hasDigitalReports ? (company.reports_count || 0) : 0,
      pdfReports: hasPdfReports ? 1 : 0,
    };
  };

  const metrics = calculateCoverageMetrics();

  // Determine coverage status
  const getCoverageStatus = () => {
    if (!metrics.hasReports) {
      return {
        level: "not_covered",
        color: "gray",
        icon: StopIcon,
        label: "Not Covered",
        description: "No FRC research coverage",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-300"
      };
    }

    if (metrics.hasDigitalReports) {
      return {
        level: "active_digital",
        color: "green",
        icon: CheckCircleIcon,
        label: "Active Coverage",
        description: "Digital reports & analytics",
        bgColor: "bg-green-50",
        borderColor: "border-green-300"
      };
    }

    if (metrics.hasPdfReports) {
      return {
        level: "pdf_coverage",
        color: "blue",
        icon: DocumentTextIcon,
        label: "PDF Coverage",
        description: "PDF research reports",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300"
      };
    }

    return {
      level: "limited",
      color: "yellow",
      icon: ExclamationTriangleIcon,
      label: "Limited Data",
      description: "Partial coverage",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300"
    };
  };

  const status = getCoverageStatus();
  const StatusIcon = status.icon;

  // Calculate pre-coverage and post-coverage periods for analysis
  const getAnalysisPeriods = () => {
    if (!metrics.firstReportDate) return null;

    const firstReport = new Date(metrics.firstReportDate);
    const preCoverageStart = new Date(firstReport);
    preCoverageStart.setDate(preCoverageStart.getDate() - 90); // 90 days before first report

    const postCoverageEnd = metrics.lastReportDate ?
      new Date(metrics.lastReportDate) :
      new Date(); // Today if no last report date

    return {
      preCoverage: {
        start: preCoverageStart,
        end: firstReport,
        days: 90
      },
      coverage: {
        start: firstReport,
        end: postCoverageEnd,
        days: metrics.coverageDurationDays
      }
    };
  };

  const analysisPeriods = getAnalysisPeriods();

  return (
    <div className={`${status.bgColor} rounded-lg border-l-4 ${status.borderColor} p-4 shadow-sm hover:shadow-md transition-shadow`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 text-${status.color}-600`} />
          <span className={`text-sm font-medium text-${status.color}-800`}>
            {status.label}
          </span>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full bg-${status.color}-100 text-${status.color}-700`}>
          FRC Coverage
        </div>
      </div>

      {/* Coverage Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">{status.description}</p>

        {metrics.hasReports && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Total Reports:</span>
              <span className="font-medium text-gray-900 ml-1">{metrics.totalReports}</span>
            </div>
            <div>
              <span className="text-gray-500">Stock Data:</span>
              <span className="font-medium text-blue-600 ml-1">
                {metrics.hasStockData ? `${company.stock_data_points} points` : 'None'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      {metrics.hasReports && metrics.firstReportDate && (
        <div className="border-t border-gray-200 pt-3">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <CalendarIcon className="h-3 w-3" />
            <span className="font-medium">Coverage Timeline</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* First Report */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayIcon className="h-3 w-3 text-green-600" />
                <span className="text-gray-600">First Report:</span>
              </div>
              <span className="font-medium text-gray-900">
                {new Date(metrics.firstReportDate).toLocaleDateString()}
              </span>
            </div>

            {/* Latest Report */}
            {metrics.lastReportDate && metrics.lastReportDate !== metrics.firstReportDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-3 w-3 text-blue-600" />
                  <span className="text-gray-600">Latest Report:</span>
                </div>
                <span className="font-medium text-gray-900">
                  {new Date(metrics.lastReportDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Coverage Duration */}
            {metrics.coverageDurationDays > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-3 w-3 text-purple-600" />
                  <span className="text-gray-600">Coverage Period:</span>
                </div>
                <span className="font-medium text-purple-600">
                  {metrics.coverageDurationDays} days
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Potential Section */}
      {analysisPeriods && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <ChartBarIcon className="h-3 w-3" />
            <span className="font-medium">Impact Analysis Available</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white rounded p-2 border border-gray-100">
              <div className="text-gray-500">Pre-Coverage</div>
              <div className="font-medium text-gray-700">{analysisPeriods.preCoverage.days} days</div>
              <div className="text-gray-400 text-[10px]">Market baseline</div>
            </div>
            <div className="bg-white rounded p-2 border border-gray-100">
              <div className="text-gray-500">Post-Coverage</div>
              <div className="font-medium text-blue-600">{analysisPeriods.coverage.days} days</div>
              <div className="text-gray-400 text-[10px]">FRC impact period</div>
            </div>
          </div>
        </div>
      )}

      {/* Report Type Breakdown */}
      {metrics.hasReports && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <DocumentTextIcon className="h-3 w-3" />
            <span className="font-medium">Report Types</span>
          </div>

          <div className="flex gap-2">
            {metrics.digitalReports > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                {metrics.digitalReports} Digital
              </span>
            )}
            {metrics.pdfReports > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {metrics.pdfReports} PDF
              </span>
            )}
            {!metrics.hasReports && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                No Reports
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}