"use client";

import { useState } from "react";
import { DynamicFinancialReport } from "./DynamicFinancialReport";
import { sampleReportData, createEmptyReportData } from "@/lib/financialReportData";
import { generatePDFOptimizedHTML } from "@/lib/reportHTMLGenerator";

// Updated PDFReportLayout that uses the new dynamic system
export default function PDFReportLayout({ reportData, onGeneratePDF, isPreviewMode = false }) {
  // Use provided reportData or fall back to sample data
  const [currentReportData, setCurrentReportData] = useState(reportData || sampleReportData);

  // Handle PDF generation
  const handleExportPDF = async (data, paperSize) => {
    try {
      if (onGeneratePDF) {
        // Use the provided PDF generation handler
        onGeneratePDF(data, paperSize);
      } else {
        // Default PDF generation using HTML
        const htmlContent = generatePDFOptimizedHTML(data, paperSize);
        
        // For now, open in new window - in production you'd send to PDF service
        const newWindow = window.open();
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        
        console.log("PDF export initiated with data:", data);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Handle print
  const handlePrint = (data, paperSize) => {
    try {
      const htmlContent = generatePDFOptimizedHTML(data, paperSize);
      
      // Create a temporary iframe for printing
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.write(htmlContent);
      doc.close();
      
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  // Update report data
  const updateReportData = (newData) => {
    setCurrentReportData(newData);
  };

  if (isPreviewMode) {
    // In preview mode, just show the report without controls
    return (
      <div className="w-full h-full">
        <DynamicFinancialReport
          reportData={currentReportData}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <DynamicFinancialReport
        reportData={currentReportData}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
      />
    </div>
  );
}

// Export the component for backward compatibility
export { DynamicFinancialReport as FinancialReport };
