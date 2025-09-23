"use client";

import { useState, useEffect } from "react";
import { DocumentTextIcon, CalendarIcon, EyeIcon, ShieldExclamationIcon } from "@heroicons/react/24/outline";
import { getBloombergV3Reports, getBloombergV3MostReadReports } from "@/lib/api";

export default function ReportsOverview({ ticker = null }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        if (ticker) {
          // Get reports for specific ticker
          const response = await getBloombergV3Reports({ ticker, limit: 10, sort_by: "post_date", sort_order: -1 });
          if (response && Array.isArray(response)) {
            setReports(response);
          }
        } else {
          // Get most read reports for overview
          const response = await getBloombergV3MostReadReports({ days: 30, limit: 10 });
          if (response && response.most_read_reports) {
            setReports(response.most_read_reports);
          }
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [ticker]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!ticker) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">
          Select a company to view reports
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5" />
          Reports for {ticker}
        </h3>
      </div>

      <div className="p-6">
        {reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reports found for {ticker}
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {report.title}
                    </h4>
                    <div className="text-xs text-gray-600 mb-2">
                      {report.company_name} ({report.primary_ticker})
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {new Date(report.post_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {report.total_reads} reads
                      </div>
                      {report.unique_institutions && (
                        <div>
                          {report.unique_institutions} institutions
                        </div>
                      )}
                      {report.embargoed_reads > 0 && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <ShieldExclamationIcon className="h-4 w-4" />
                          {report.embargoed_reads} embargoed
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.transparency_rate > 70 ? 'bg-green-100 text-green-800' :
                        report.transparency_rate > 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.transparency_rate?.toFixed(1)}% transparency
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}