"use client";

import { useState, useEffect } from "react";
import { DocumentTextIcon, CalendarIcon, EyeIcon } from "@heroicons/react/24/outline";
import { getBloombergReadership } from "@/lib/api";

export default function ReportsOverview({ ticker = null }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        if (ticker) {
          const data = await getBloombergReadership(ticker);

          if (data.success && data.data.readership_data) {
            // Group by report and count reads
            const reportMap = {};
            data.data.readership_data.forEach(record => {
              const reportKey = record.report_title || `Report ${record.report_id}`;
              if (!reportMap[reportKey]) {
                reportMap[reportKey] = {
                  title: reportKey,
                  date: record.publication_date,
                  reads: 0,
                  institutions: new Set()
                };
              }
              reportMap[reportKey].reads++;
              if (record.institution_name) {
                reportMap[reportKey].institutions.add(record.institution_name);
              }
            });

            // Convert to array and add institution count
            const reportsArray = Object.values(reportMap).map(report => ({
              ...report,
              institutionCount: report.institutions.size
            }));

            setReports(reportsArray.sort((a, b) => b.reads - a.reads));
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
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {report.date && (
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {new Date(report.date).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <EyeIcon className="h-4 w-4" />
                        {report.reads} reads
                      </div>
                      <div>
                        {report.institutionCount} institutions
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