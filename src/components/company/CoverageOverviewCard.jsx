"use client";

import {
  ChartBarIcon,
  DocumentTextIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

export default function CoverageOverviewCard({
  companyData,
  metricsData,
  ticker,
  className = ""
}) {

  // Calculate dynamic data from the API responses - NO HARDCODED VALUES
  const calculateCoverageData = () => {
    const totalReports = companyData?.reports_count || metricsData?.length || 0;
    const stockDataPoints = companyData?.stock_data_points ||
                           companyData?.data_quality?.stock_data_points ||
                           0; // No default, purely dynamic

    // Calculate coverage timeline
    const firstReportDate = companyData?.first_report_date ||
                           companyData?.data?.reports_summary?.reports_list?.[0]?.published_date ||
                           metricsData?.[0]?.["Publication Date"];

    const latestReportDate = companyData?.last_report_date ||
                            companyData?.data?.reports_summary?.reports_list?.[
                              companyData?.data?.reports_summary?.reports_list?.length - 1
                            ]?.published_date ||
                            metricsData?.[metricsData?.length - 1]?.["Publication Date"];

    // Calculate coverage period in days
    let coverageDays = 0;
    if (firstReportDate && latestReportDate) {
      const first = new Date(firstReportDate);
      const latest = new Date(latestReportDate);
      coverageDays = Math.floor((latest - first) / (1000 * 60 * 60 * 24));
    }

    // Determine coverage status
    const isFRCCovered = companyData?.frc_covered ||
                        companyData?.company_data?.frc_covered ||
                        totalReports > 0;

    const hasDigitalReports = companyData?.status === "success" ||
                             companyData?.has_digital_reports ||
                             false;

    return {
      totalReports,
      stockDataPoints,
      firstReportDate,
      latestReportDate,
      coverageDays,
      isFRCCovered,
      hasDigitalReports,
      exchange: companyData?.exchange || "TSX",
      companyName: companyData?.company_name ||
                  companyData?.data?.company_profile?.name ||
                  ticker
    };
  };

  const data = calculateCoverageData();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  const getCoverageStatusInfo = () => {
    if (data.isFRCCovered && data.hasDigitalReports) {
      return {
        label: "Active Coverage",
        description: "Digital reports & analytics",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        badgeColor: "bg-green-100 text-green-800"
      };
    } else if (data.isFRCCovered) {
      return {
        label: "FRC Coverage",
        description: "Research reports available",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        badgeColor: "bg-blue-100 text-blue-800"
      };
    } else {
      return {
        label: "Monitoring",
        description: "Under evaluation",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        badgeColor: "bg-gray-100 text-gray-800"
      };
    }
  };

  const statusInfo = getCoverageStatusInfo();

  return (
    <div className={`bg-white rounded-xl shadow-lg border ${statusInfo.borderColor} ${className}`}>
      {/* Header */}
      <div className={`${statusInfo.bgColor} px-6 py-4 rounded-t-xl border-b ${statusInfo.borderColor}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <CheckBadgeIcon className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{statusInfo.label}</h3>
                <p className="text-sm text-gray-600">{statusInfo.description}</p>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.badgeColor}`}>
            FRC Coverage
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Left Column - Reports & Data */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Reports:</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{data.totalReports}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Stock Data:</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {data.stockDataPoints.toLocaleString()} points
              </span>
            </div>
          </div>

          {/* Right Column - Timeline */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Coverage Timeline
              </h4>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">First Report:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(data.firstReportDate)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Latest Report:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(data.latestReportDate)}
                  </span>
                </div>

                {data.coverageDays > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600">Coverage Period:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {data.coverageDays} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Impact Analysis Available */}
        {data.totalReports > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Impact Analysis Available</span>
                  <p className="text-xs text-gray-600">Pre-coverage vs post-coverage performance data</p>
                </div>
              </div>

              <div className="text-right">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <div className="text-gray-500">Pre-Coverage</div>
                    <div className="font-medium text-gray-900">90 days</div>
                    <div className="text-gray-500">Market baseline</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Post-Coverage</div>
                    <div className="font-medium text-blue-600">{data.coverageDays || 'N/A'} days</div>
                    <div className="text-gray-500">Analysis period</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}