"use client";

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { exportProfessionalCompanyReport } from '@/utils/professionalPdfExport';
import { getBloombergAnalysis } from '@/lib/api';

export default function PDFExportButton({ 
  companyData, 
  chartData, 
  metricsData, 
  analysisData, 
  bloombergData,
  ticker,
  className = ""
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      // Fetch Bloomberg data during export
      let fetchedBloombergData = bloombergData;
      
      if (!fetchedBloombergData && ticker) {
        try {
          console.log('Fetching Bloomberg readership data for ticker:', ticker);
          
          // Import the actual Bloomberg API functions
          const { getBloombergInstitutional, getBloombergSummary } = await import('@/lib/api');
          
          // Fetch the real Bloomberg institutional readership data
          const institutionalResponse = await getBloombergInstitutional(ticker, {
            show_embargoed: false, // Only get revealed records for PDF
            limit: 10,
            offset: 0,
            days: 90,
          });
          
          console.log('Bloomberg institutional response:', institutionalResponse);
          
          if (institutionalResponse?.success && institutionalResponse?.data) {
            fetchedBloombergData = {
              institutional_records: institutionalResponse.data.institutional_records || [],
              summary: institutionalResponse.data.summary
            };
            console.log('Bloomberg readership data fetched:', fetchedBloombergData);
          }
        } catch (bloombergError) {
          console.warn('Bloomberg readership data not available for PDF export:', bloombergError);
        }
      }
      
      console.log('Final Bloomberg data for PDF:', fetchedBloombergData);

      const exportData = {
        companyData,
        chartData,
        metricsData,
        analysisData,
        bloombergData: fetchedBloombergData,
        includeCharts: true,
        includeTables: true,
        includeAnalysis: true
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
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${isExporting 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
          }
          ${className}
        `}
        title="Export company report as PDF"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
        <span>
          {isExporting ? 'Generating Professional Report...' : 'Export Investment Report'}
        </span>
        
        {isExporting && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
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
  );
}