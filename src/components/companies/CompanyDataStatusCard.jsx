"use client";

import {
  DocumentTextIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

export default function CompanyDataStatusCard({ company }) {
  // Calculate data availability score (0-100)
  const calculateDataScore = () => {
    let score = 0;
    if (company.reports_count > 0) score += 40;
    if (company.has_chart) score += 20;
    if (company.has_metrics) score += 20;
    if (company.stock_data_points > 0) score += 20;
    return score;
  };

  const dataScore = calculateDataScore();

  // Determine overall status
  const getOverallStatus = () => {
    if (dataScore >= 80) return {
      level: "complete",
      color: "green",
      icon: CheckCircleIcon,
      label: "Complete Data",
      description: "Full analysis available"
    };
    if (dataScore >= 60) return {
      level: "good",
      color: "blue",
      icon: InformationCircleIcon,
      label: "Good Coverage",
      description: "Most data available"
    };
    if (dataScore >= 40) return {
      level: "partial",
      color: "yellow",
      icon: ExclamationTriangleIcon,
      label: "Partial Data",
      description: "Limited coverage"
    };
    return {
      level: "minimal",
      color: "gray",
      icon: ExclamationTriangleIcon,
      label: "Minimal Data",
      description: "Basic info only"
    };
  };

  const status = getOverallStatus();
  const StatusIcon = status.icon;

  // Report type breakdown
  const reportTypes = {
    digital: company.status === "success" ? company.reports_count || 0 : 0,
    pdf: company.status === "frc_covered_no_digital_reports" ? 1 : 0,
    total: (company.reports_count || 0)
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${
      status.color === "green" ? "border-green-500" :
      status.color === "blue" ? "border-blue-500" :
      status.color === "yellow" ? "border-yellow-500" : "border-gray-400"
    } p-4 shadow-sm hover:shadow-md transition-shadow`}>

      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`h-5 w-5 ${
            status.color === "green" ? "text-green-600" :
            status.color === "blue" ? "text-blue-600" :
            status.color === "yellow" ? "text-yellow-600" : "text-gray-500"
          }`} />
          <span className={`text-sm font-medium ${
            status.color === "green" ? "text-green-800" :
            status.color === "blue" ? "text-blue-800" :
            status.color === "yellow" ? "text-yellow-800" : "text-gray-700"
          }`}>
            {status.label}
          </span>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${
          status.color === "green" ? "bg-green-100 text-green-700" :
          status.color === "blue" ? "bg-blue-100 text-blue-700" :
          status.color === "yellow" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
        }`}>
          {dataScore}% Complete
        </div>
      </div>

      {/* Data breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Reports */}
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4 text-gray-500" />
          <div className="text-xs">
            <div className="font-medium text-gray-900">
              {reportTypes.total} Report{reportTypes.total !== 1 ? 's' : ''}
            </div>
            {reportTypes.digital > 0 && (
              <div className="text-green-600">{reportTypes.digital} Digital</div>
            )}
            {reportTypes.pdf > 0 && (
              <div className="text-orange-600">{reportTypes.pdf} PDF</div>
            )}
          </div>
        </div>

        {/* Chart & Metrics */}
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-4 w-4 text-gray-500" />
          <div className="text-xs">
            <div className="flex gap-1">
              {company.has_chart && <span className="text-green-600">📊</span>}
              {company.has_metrics && <span className="text-blue-600">📈</span>}
              {!company.has_chart && !company.has_metrics && (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div className="text-gray-600">
              {company.stock_data_points > 0 ?
                `${company.stock_data_points} points` :
                'No data'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Last updated */}
      {company.analysis_date && (
        <div className="flex items-center gap-1 text-xs text-gray-500 border-t pt-2">
          <ClockIcon className="h-3 w-3" />
          Updated {new Date(company.analysis_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}