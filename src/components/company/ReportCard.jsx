"use client";

import {
  CalendarIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon
} from "@heroicons/react/24/outline";

export default function ReportCard({ report, ticker }) {
  const isDigital = report.report_source === "digital";
  const isPDF = report.report_source === "pdf";

  const handleViewReport = () => {
    if (isPDF && report.pdf_url) {
      window.open(report.pdf_url, '_blank');
    } else if (isDigital) {
      // Handle digital report viewing - could open modal or navigate to report page
      console.log("Opening digital report:", report);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Report Type Badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isDigital
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {isDigital ? 'Digital' : 'PDF'}
            </span>

            {report.source_ticker && report.source_ticker !== 'database' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                <TagIcon className="h-3 w-3 mr-1" />
                Found via {report.source_ticker}
              </span>
            )}
          </div>

          {/* Report Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {report.title}
          </h3>

          {/* Publication Date */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <CalendarIcon className="h-4 w-4 mr-1" />
            {formatDate(report.published_date)}
          </div>

          {/* Investment Strategy (for digital reports) */}
          {isDigital && report.investment_strategy && (
            <div className="mb-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                report.investment_strategy === 'Buy'
                  ? 'bg-blue-100 text-blue-800'
                  : report.investment_strategy === 'Sell'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {report.investment_strategy}
              </span>
            </div>
          )}

          {/* Content Preview (for digital reports) */}
          {isDigital && report.content && (
            <div className="text-sm text-gray-600 mb-3">
              <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: report.content.substring(0, 200) + '...'
                }}
              />
            </div>
          )}
        </div>

        {/* View Button */}
        <div className="ml-4">
          <button
            onClick={handleViewReport}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isDigital
                ? 'text-green-700 bg-green-100 hover:bg-green-200'
                : 'text-red-700 bg-red-100 hover:bg-red-200'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4 mr-1" />
            {isPDF ? 'View PDF' : 'View Report'}
            <ArrowTopRightOnSquareIcon className="h-3 w-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}