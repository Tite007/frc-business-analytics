"use client";

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportProfessionalCompanyReport } from '@/utils/professionalPdfExport';
import { getBloombergV3Analytics, getBloombergResolveCompany } from '@/lib/api';

export default function PDFExportButton({
  companyData,
  chartData,
  metricsData,
  analysisData,
  bloombergData,
  ticker,
  className = "",
  ...props
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      // Fetch Bloomberg data during export if not provided
      let fetchedBloombergData = bloombergData;

      if (!fetchedBloombergData && ticker) {
        try {
          console.log('Fetching Bloomberg data for ticker:', ticker);

          // Get company name for the Bloomberg lookup
          const companyName = companyData?.company_name ||
                              companyData?.data?.company_profile?.name ||
                              ticker;

          // First, try to get analytics for the specific ticker
          let analytics = await getBloombergV3Analytics(ticker).catch(() => null);

          // If no data found with ticker and we have a company name, try resolve-company API
          if ((!analytics || !analytics.top_institutions || analytics.top_institutions.length === 0) && companyName) {
            console.log(`No data found for ticker ${ticker}, trying company name: ${companyName}`);

            const resolvedData = await getBloombergResolveCompany(companyName).catch(() => null);

            if (resolvedData && resolvedData.success) {
              console.log(`✅ Successfully resolved data for ${companyName} using Bloomberg ticker: ${resolvedData.company_match?.bloomberg_ticker}`);

              // Use the resolve-company API response directly
              fetchedBloombergData = resolvedData;
            }
          } else if (analytics) {
            // Use analytics API response
            fetchedBloombergData = analytics;
          }

          console.log('Bloomberg data fetched for PDF:', fetchedBloombergData);
        } catch (bloombergError) {
          console.warn('Bloomberg data not available for PDF export:', bloombergError);
        }
      }

      console.log('Final Bloomberg data for PDF:', fetchedBloombergData);

      // Prepare export data with the new structure
      const exportData = {
        companyData: {
          // Extract company information from the new API structure
          company_name: companyData?.company_name ||
                       companyData?.data?.company_profile?.name ||
                       ticker,
          ticker: ticker,
          exchange: companyData?.exchange ||
                   companyData?.data?.company_profile?.exchange ||
                   'TSX',
          currency: companyData?.currency ||
                   companyData?.data?.company_profile?.currency ||
                   'CAD',
          country: companyData?.country ||
                  companyData?.data?.company_profile?.country ||
                  'Canada',
          status: companyData?.status || 'unknown',
          reports_count: companyData?.reports_count ||
                        companyData?.data?.reports?.length ||
                        metricsData?.length ||
                        0,
          // Additional company metadata
          frc_covered: companyData?.frc_covered || false,
          analysis_date: companyData?.analysis_date,
          first_coverage_date: companyData?.first_report_date,
          last_update_date: companyData?.last_report_date
        },
        chartData: chartData || {},
        metricsData: metricsData || [],
        analysisData: analysisData || "",
        bloombergData: fetchedBloombergData,
        // PDF export options
        includeCharts: true,
        includeTables: true,
        includeAnalysis: true,
        includeBloombergData: !!fetchedBloombergData
      };

      const result = await exportProfessionalCompanyReport(exportData, ticker);

      if (result.success) {
        setExportStatus({
          type: 'success',
          message: `PDF exported successfully! (${result.pages} pages)`
        });
      } else {
        setExportStatus({
          type: 'error',
          message: `Export failed: ${result.error}`
        });
      }
    } catch (error) {
      console.error('PDF export error:', error);
      setExportStatus({
        type: 'error',
        message: 'Failed to generate PDF report'
      });
    } finally {
      setIsExporting(false);
      // Clear status after 5 seconds
      setTimeout(() => setExportStatus(null), 5000);
    }
  };

  return (
    <>
      {/* Global progress indicator */}
      {isExporting && (
        <div className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg border border-blue-500">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">📄 Generating PDF Report</span>
              <span className="text-xs text-blue-100">Please wait while we prepare your report...</span>
            </div>
          </div>
          {/* Progress bar animation */}
          <div className="mt-2 w-full bg-blue-500 rounded-full h-1">
            <div className="bg-white h-1 rounded-full animate-pulse" style={{animation: 'progressPulse 2s ease-in-out infinite'}}></div>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Loading overlay for button */}
        {isExporting && (
          <div className="absolute inset-0 bg-blue-600 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span className="font-medium text-sm whitespace-nowrap">Generating...</span>
            </div>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 min-w-max relative
            ${isExporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-30'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
            }
            ${className}
          `}
          title={isExporting ? "Generating PDF report..." : "Export company report as PDF"}
          {...props}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          <span className="whitespace-nowrap">Export Report</span>
        </button>

        {/* Status message */}
        {exportStatus && (
          <div className={`
            absolute top-full left-0 mt-2 p-3 rounded-lg shadow-lg z-50 min-w-max
            ${exportStatus.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
            }
          `}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                exportStatus.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">{exportStatus.message}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}