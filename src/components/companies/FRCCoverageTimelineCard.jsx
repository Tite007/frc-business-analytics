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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Tooltip component for information display
const InfoTooltip = ({ title, formula, explanation }) => {
  return (
    <div className="group relative inline-block">
      <InformationCircleIcon className="h-3 w-3 text-gray-400 hover:text-blue-600 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg min-w-80 max-w-96">
        <div className="font-semibold text-blue-200 mb-2">{title}</div>
        <div className="mb-2">
          <span className="font-medium">Formula:</span>
          <div className="font-mono bg-gray-800 p-2 rounded mt-1 text-green-300">
            {formula}
          </div>
        </div>
        <div>
          <span className="font-medium">Explanation:</span>
          <div className="mt-1 text-gray-300">{explanation}</div>
        </div>
        {/* Tooltip arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

export default function FRCCoverageTimelineCard({ company, chartData }) {
  // Calculate coverage metrics using actual API data
  const calculateCoverageMetrics = () => {
    // Use chartData if available (from chart-data API), otherwise fall back to company data
    const reportsData = chartData?.reports_coverage || {};
    const stockData = chartData?.chart_data || [];

    const hasReports = (reportsData.total_reports || company.reports_count || 0) > 0;
    const hasDigitalReports = company.status === "success";
    const hasPdfReports = company.status === "frc_covered_no_digital_reports";
    const hasStockData = stockData.length > 0 || (company.stock_data_points || 0) > 0;

    // Use actual API data for dates
    const firstReportDate = reportsData.oldest_report || company.first_report_date || company.analysis_date;
    const lastReportDate = reportsData.newest_report || company.last_report_date || company.analysis_date;
    const coverageDurationDays = reportsData.date_span_days ||
      (firstReportDate && lastReportDate ?
        Math.floor((new Date(lastReportDate) - new Date(firstReportDate)) / (1000 * 60 * 60 * 24)) : 0);

    return {
      hasReports,
      hasDigitalReports,
      hasPdfReports,
      hasStockData,
      firstReportDate,
      lastReportDate,
      coverageDurationDays,
      totalReports: reportsData.total_reports || company.reports_count || 0,
      digitalReports: hasDigitalReports ? (reportsData.total_reports || company.reports_count || 0) : 0,
      pdfReports: hasPdfReports ? 1 : 0,
      stockDataPoints: chartData?.total_data_points || company.stock_data_points || 0,
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
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Total Reports:</span>
              <span className="font-medium text-gray-900">{metrics.totalReports}</span>
              <InfoTooltip
                title="Total Research Reports"
                formula="COUNT = Total number of reports published"
                explanation="We count all FRC research reports published for this company, including both digital interactive reports and PDF documents."
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Stock Data:</span>
              <span className="font-medium text-blue-600">
                {metrics.hasStockData ? `${metrics.stockDataPoints.toLocaleString()} points` : 'None'}
              </span>
              <InfoTooltip
                title="Market Data Points"
                formula="COUNT = Stock price and volume data points"
                explanation="Individual daily market data points (price, volume, etc.) collected for analysis and chart visualization over the coverage period."
              />
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
            <InfoTooltip
              title="Research Coverage Timeline"
              formula="Date Range = Last Report Date - First Report Date"
              explanation="Timeline showing the period from our first research report to our most recent report for this company, indicating sustained coverage."
            />
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
            <InfoTooltip
              title="Pre vs Post Coverage Analysis"
              formula="Comparison = Pre-Coverage Period vs Coverage Period"
              explanation="We analyze market performance during 90 days before our first report (baseline) versus the entire coverage period to measure FRC research impact."
            />
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
            <InfoTooltip
              title="Research Report Formats"
              formula="Categorization = Digital Interactive + PDF Documents"
              explanation="Digital reports offer interactive charts and real-time data, while PDF reports provide traditional downloadable research documents with comprehensive analysis."
            />
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