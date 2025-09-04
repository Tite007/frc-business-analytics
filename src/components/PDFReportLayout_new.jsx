"use client";

import React, { useState } from "react";
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
  MagnifyingGlassPlusIcon as ZoomInIcon,
  MagnifyingGlassMinusIcon as ZoomOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Professional PDF Report Layout Component with Mac-Style Controls
// Enhanced with better positioning, responsiveness, and Mac design principles
export default function PDFReportLayout({ reportData, onGeneratePDF }) {
  const [pageFormat, setPageFormat] = useState("letter"); // letter, a4, legal
  const [showPreview, setShowPreview] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Dynamic input states for editable fields
  const [analystName, setAnalystName] = useState("");
  const [analystTitle, setAnalystTitle] = useState("");
  const [analystCredentials, setAnalystCredentials] = useState("");
  const [chartImageUrl, setChartImageUrl] = useState("");
  const [performanceTableData, setPerformanceTableData] = useState([
    { security: "ZEPP", ytd: "1,292%", twelveMonth: "1,232%" },
    { security: "NYSE", ytd: "9%", twelveMonth: "10%" },
  ]);
  const [companyDataInputs, setCompanyDataInputs] = useState({
    weekRange: "US$2.12-43.93",
    sharesOS: "14.4M",
    marketCap: "US$570M",
    yieldForward: "N/A",
    peForward: "N/A",
    pb: "2.5x",
    evEbitda: "N/A",
    beta: "N/A",
    revenueTTM: "N/A",
    ebitdaTTM: "N/A",
    roe: "N/A",
    debtEquity: "N/A",
  });

  // PDF Generation Function
  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const element = document.querySelector(".pdf-report");
      if (!element) {
        console.error("PDF report element not found");
        return;
      }

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      // Calculate PDF dimensions based on page format
      const pageSizeConfig = pageSizes[pageFormat];
      let pdfWidth, pdfHeight;

      if (pageSizeConfig.width.includes("in")) {
        pdfWidth = parseFloat(pageSizeConfig.width) * 72; // Convert inches to points
        pdfHeight = parseFloat(pageSizeConfig.height) * 72;
      } else {
        // Convert mm to points
        pdfWidth = (parseFloat(pageSizeConfig.width) / 25.4) * 72;
        pdfHeight = (parseFloat(pageSizeConfig.height) / 25.4) * 72;
      }

      // Create PDF
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "pt",
        format: [pdfWidth, pdfHeight],
      });

      // Calculate scaling to fit content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;

      // Center the image on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, scaledWidth, scaledHeight);

      // Generate filename with timestamp
      const companyName = reportData?.companyName || "Report";
      const timestamp =
        typeof window !== "undefined"
          ? new Date().toISOString().slice(0, 10)
          : "2025-08-30"; // Static timestamp for SSR
      const filename = `${companyName.replace(
        /[^a-z0-9]/gi,
        "_"
      )}_Report_${timestamp}.pdf`;

      pdf.save(filename);

      console.log("PDF generated successfully:", filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Page size configurations
  const pageSizes = {
    letter: { width: "8.5in", height: "11in", name: 'Letter (8.5" x 11")' },
    a4: { width: "210mm", height: "297mm", name: "A4 (210 x 297 mm)" },
    legal: { width: "8.5in", height: "14in", name: 'Legal (8.5" x 14")' },
  };

  const currentSize = pageSizes[pageFormat];

  // Zoom and pagination handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Convert paper size to pixels (assuming 96 DPI) and apply zoom
  const getPixelDimensions = (size) => {
    let baseWidth, baseHeight;
    if (size.width.includes("in")) {
      baseWidth = parseFloat(size.width) * 96;
      baseHeight = parseFloat(size.height) * 96;
    } else {
      // Convert mm to inches then to pixels
      baseWidth = (parseFloat(size.width) / 25.4) * 96;
      baseHeight = (parseFloat(size.height) / 25.4) * 96;
    }

    return {
      width: (baseWidth * zoom) / 100,
      height: (baseHeight * zoom) / 100,
    };
  };

  const pixelDimensions = getPixelDimensions(currentSize);

  // Extract data with defaults
  const {
    // Header data
    date = "August 30, 2025", // Use static date to prevent hydration issues

    // Company info
    companyName = "Company Name",
    tickers = [{ symbol: "TICKER", exchange: "NASDAQ" }],
    sector = "Technology",

    // Rating and pricing
    rating = "BUY",
    currentPrice = "$0.00",
    fairValue = "$0.00",
    risk = "4",

    // Content
    title = "Research Report Title",
    executiveSummary = "",
    highlights = [],
    htmlContent = "", // Add htmlContent with default value
    analystInfo = {
      name: analystName || "Analyst Name",
      title: analystTitle || "Senior Analyst",
      credentials: analystCredentials || "CFA",
    },

    // Analyst commentary system
    analystComments = [],

    // Charts and data
    priceChart = null,
    priceChartImage = chartImageUrl || null, // Use dynamic chart image
    companyData = { ...companyDataInputs }, // Use dynamic company data
    financialTable = [],
    performanceData = performanceTableData, // Use dynamic performance data

    // Footer
    disclaimer = "Important disclosures and risk definitions on last page.",

    // Additional content sections for multi-page reports
    additionalSections = [],
  } = reportData || {};

  // Calculate total pages based on content
  const calculateTotalPages = () => {
    let pages = 1; // Base page

    // Add pages for additional sections (2 sections per page)
    if (additionalSections && additionalSections.length > 0) {
      pages += Math.ceil(additionalSections.length / 2);
    }

    // Add extra page if financial table is very large
    if (financialTable && financialTable.length > 10) {
      pages += 1;
    }

    return Math.max(pages, 2); // Minimum 2 pages
  };

  const totalPages = calculateTotalPages();

  const formatTickers = (tickers) => {
    return tickers
      .map((ticker) => `${ticker.symbol} (${ticker.exchange})`)
      .join(", ");
  };

  const getRatingColor = (rating) => {
    switch (rating?.toUpperCase()) {
      case "BUY":
        return "bg-green-600 text-white";
      case "HOLD":
        return "bg-yellow-600 text-white";
      case "SELL":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const printStyles = `
    @page {
      size: ${currentSize.width} ${currentSize.height};
      margin: 0.75in 0.5in 0.75in 0.5in;
    }
    
    @media print {
      .no-print { display: none !important; }
      
      /* Page-by-page structure */
      .pdf-report { 
        page-break-inside: avoid;
      }
      
      .page-section { 
        page-break-inside: avoid;
        margin-bottom: 24pt;
      }
      
      .page-break-before { 
        page-break-before: always;
      }
      
      .page-break-after { 
        page-break-after: always;
      }
      
      /* Allow natural content flow */
      .content-section {
        page-break-inside: auto;
        orphans: 3;
        widows: 3;
      }
      
      /* Professional Typography - Match Word Document */
      body { 
        font-family: 'Times New Roman', 'Times', serif;
        font-size: 10pt; 
        line-height: 1.2; 
        color: #000000;
      }
      
      /* Headings - Match Word Document exactly */
      h1 { 
        font-size: 18pt; 
        font-weight: bold; 
        font-family: 'Times New Roman', 'Times', serif;
        color: #000000;
        margin-bottom: 6pt;
        margin-top: 0pt;
        letter-spacing: 0pt;
        page-break-after: avoid;
      }
      h2 { 
        font-size: 14pt; 
        font-weight: bold; 
        font-family: 'Times New Roman', 'Times', serif;
        color: #000000;
        margin-bottom: 4pt;
        margin-top: 8pt;
        letter-spacing: 0pt;
        page-break-after: avoid;
      }
      h3 { 
        font-size: 11pt; 
        font-weight: bold; 
        font-family: 'Times New Roman', 'Times', serif;
        color: #000000;
        margin-bottom: 4pt;
        margin-top: 8pt;
        letter-spacing: 0pt;
        page-break-after: avoid;
      }
      
      /* Professional Color Scheme - Match Word Document */
      .rating-box { border: 2px solid #000000 !important; }
      .analyst-sidebar-screen { 
        background: #ffffff !important;
        border: 1px solid #000000 !important;
      }
      .sidebar-comment-screen { 
        background: #ffffff !important;
        border: 1px solid #000000 !important;
      }
      
      /* Table Styling - Match Word Document */
      table { 
        border-collapse: collapse !important; 
        width: 100% !important;
        page-break-inside: auto;
        font-family: 'Times New Roman', 'Times', serif !important;
      }
      
      thead {
        page-break-inside: avoid;
        page-break-after: avoid;
      }
      
      tbody tr {
        page-break-inside: avoid;
      }
      
      th { 
        background: #000000 !important;
        color: white !important;
        font-weight: bold !important;
        font-size: 9pt !important;
      }
      td, th { 
        border: 1px solid #000000 !important; 
        padding: 4pt 6pt !important;
        font-size: 9pt !important;
        font-family: 'Times New Roman', 'Times', serif !important;
      }
      
      /* Content styling to match Word */
      p {
        margin-bottom: 6pt !important;
        margin-top: 0pt !important;
        line-height: 1.2 !important;
        font-family: 'Times New Roman', 'Times', serif !important;
      }
      
      /* Footer positioning */
      .report-footer {
        margin-top: 32pt;
        page-break-inside: avoid;
      }
    }
  `;

  return (
    <div className="w-full min-h-screen bg-gray-50 relative">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Mac-Style Floating Toolbar */}
      <div className="no-print fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl px-6 py-3">
          <div className="flex items-center space-x-6">
            {/* Page Size Control */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Format
              </label>
              <select
                value={pageFormat}
                onChange={(e) => setPageFormat(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(pageSizes).map(([key, size]) => (
                  <option key={key} value={key}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Zoom Out"
              >
                <ZoomOutIcon className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 min-w-12 text-center font-medium">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Zoom In"
              >
                <ZoomInIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Page Navigation */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Previous Page"
              >
                <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 min-w-16 text-center font-medium">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                title="Next Page"
              >
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                title={showPreview ? "Hide Preview" : "Show Preview"}
              >
                <EyeIcon className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 shadow-sm"
                title="Print Report"
              >
                <PrinterIcon className="h-4 w-4" />
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm disabled:opacity-50"
                title="Generate PDF"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                {isGeneratingPDF && <span className="ml-1 text-xs">...</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Info Panel - Left Side */}
      <div className="no-print fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden xl:block">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl p-4 w-56">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            Document Info
          </h3>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Current Size
              </p>
              <p className="text-sm font-medium text-gray-900">
                {currentSize.name}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Dimensions
              </p>
              <p className="text-sm font-medium text-gray-900">
                {Math.round(pixelDimensions.width)} ×{" "}
                {Math.round(pixelDimensions.height)} px
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Zoom Level
              </p>
              <p className="text-sm font-medium text-gray-900">{zoom}%</p>
            </div>
          </div>

          {/* Page Thumbnails */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3 text-center">
              Pages
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      currentPage === page
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                        : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-6 h-8 border rounded-sm flex items-center justify-center ${
                          currentPage === page
                            ? "border-blue-300 bg-blue-100"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        <span className="text-xs">{page}</span>
                      </div>
                      <span className="text-xs">Page {page}</span>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="w-full min-h-screen pt-20 pb-8 px-4 lg:px-8 xl:ml-72">
          {/* Main Document Container */}
          <div className="flex justify-center">
            <div
              className="pdf-report shadow-2xl bg-white border border-gray-200/50 rounded-lg overflow-auto"
              style={{
                width: `${pixelDimensions.width}px`,
                minHeight: `${pixelDimensions.height}px`,
                fontSize: `${(10 * zoom) / 100}pt`,
                lineHeight: "1.2",
                fontFamily: "'Times New Roman', 'Times', serif",
                color: "#000000",
                padding: `${(36 * zoom) / 100}px ${(24 * zoom) / 100}px`,
                display: "block",
              }}
            >
              {currentPage === 1 ? (
                // Page 1 Content
                <div className="w-full min-h-full">
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-1">
                        <div
                          className="bg-blue-400 rounded-sm"
                          style={{
                            width: `${(32 * zoom) / 100}px`,
                            height: `${(8 * zoom) / 100}px`,
                          }}
                        ></div>
                        <div
                          className="bg-blue-300 rounded-sm"
                          style={{
                            width: `${(24 * zoom) / 100}px`,
                            height: `${(8 * zoom) / 100}px`,
                          }}
                        ></div>
                        <div
                          className="bg-blue-200 rounded-sm"
                          style={{
                            width: `${(12 * zoom) / 100}px`,
                            height: `${(8 * zoom) / 100}px`,
                          }}
                        ></div>
                      </div>
                      <div>
                        <div
                          className="text-white bg-blue-400 px-1 py-0.5 font-medium leading-tight"
                          style={{
                            fontSize: `${(7 * zoom) / 100}px`,
                          }}
                        >
                          Fundamental
                          <br />
                          Research
                          <br />
                          Corp.
                        </div>
                      </div>
                    </div>
                    <div
                      className="text-right text-gray-600 font-medium"
                      style={{
                        fontSize: `${(10 * zoom) / 100}px`,
                      }}
                    >
                      {date}
                    </div>
                  </div>

                  {/* Company Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1
                        className="font-bold text-amber-700 mb-1"
                        style={{
                          fontSize: `${(16 * zoom) / 100}px`,
                        }}
                      >
                        {companyName}
                      </h1>
                      <p
                        className="text-gray-600"
                        style={{
                          fontSize: `${(9 * zoom) / 100}px`,
                        }}
                      >
                        ({formatTickers(tickers)})
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`px-2 py-1 font-bold mb-1 ${getRatingColor(
                          rating
                        )}`}
                        style={{
                          fontSize: `${(12 * zoom) / 100}px`,
                        }}
                      >
                        {rating}
                      </div>
                      <div
                        className="text-gray-600 space-y-0.5"
                        style={{
                          fontSize: `${(9 * zoom) / 100}px`,
                        }}
                      >
                        <div>
                          Current Price:{" "}
                          <span className="font-medium">{currentPrice}</span>
                        </div>
                        <div>
                          Fair Value:{" "}
                          <span className="font-medium">{fairValue}</span>
                        </div>
                        <div>
                          Risk*: <span className="font-medium">{risk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Title */}
                  <h2
                    className="font-bold mb-3"
                    style={{
                      fontSize: `${(14 * zoom) / 100}px`,
                    }}
                  >
                    {title}
                  </h2>

                  {/* Content Section */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      {/* Sector Info */}
                      <div
                        className="flex items-center gap-2 mb-3"
                        style={{
                          fontSize: `${(9 * zoom) / 100}px`,
                        }}
                      >
                        <span
                          className="border border-gray-400 px-1 py-0.5"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          +
                        </span>
                        <span className="text-gray-600">Sector: {sector}</span>
                      </div>

                      {/* Highlights */}
                      <div className="mb-3">
                        <h3
                          className="font-bold mb-2"
                          style={{
                            fontSize: `${(10 * zoom) / 100}px`,
                          }}
                        >
                          Highlights
                        </h3>
                        <div
                          className="space-y-1"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          {highlights.length > 0 ? (
                            highlights.slice(0, 6).map((highlight, index) => (
                              <div key={index} className="flex gap-1">
                                <span>➤</span>
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      highlight.length > 200
                                        ? highlight.substring(0, 200) + "..."
                                        : highlight,
                                  }}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="flex gap-1">
                              <span>➤</span>
                              <p>
                                Sample highlight content will appear here when
                                data is provided.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar */}
                    <div
                      style={{
                        width: `${(140 * zoom) / 100}px`,
                      }}
                    >
                      <div className="text-right mb-3">
                        <a
                          href="#"
                          className="text-blue-600 underline"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          Click here for more research on the company
                        </a>
                      </div>

                      <div className="mb-3">
                        <p
                          className="font-bold"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          {analystInfo.name}
                        </p>
                        <p
                          className="text-gray-600"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          {analystInfo.title}
                        </p>
                      </div>

                      {/* Price Chart Placeholder */}
                      <div className="mb-3">
                        <h4
                          className="font-bold mb-1"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          Price and Volume (1-year)
                        </h4>
                        <div
                          className="w-full bg-gray-100 border flex items-center justify-center"
                          style={{
                            height: `${(60 * zoom) / 100}px`,
                          }}
                        >
                          <div
                            className="text-gray-500"
                            style={{
                              fontSize: `${(8 * zoom) / 100}px`,
                            }}
                          >
                            Chart Area
                          </div>
                        </div>
                      </div>

                      {/* Performance Data */}
                      <div
                        className="space-y-1 mb-3"
                        style={{
                          fontSize: `${(8 * zoom) / 100}px`,
                        }}
                      >
                        {performanceData.length > 0 ? (
                          performanceData.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.security}</span>
                              <div className="text-right">
                                <div>YTD: {item.ytd}</div>
                                <div>1M: {item.twelveMonth}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>ZEPP</span>
                              <div className="text-right">
                                <div>YTD: 1,292%</div>
                                <div>1M: 1,232%</div>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span>NYSE</span>
                              <div className="text-right">
                                <div>9%</div>
                                <div>10%</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Company Data */}
                      <div className="mt-3">
                        <h4
                          className="font-bold mb-1"
                          style={{
                            fontSize: `${(8 * zoom) / 100}px`,
                          }}
                        >
                          Company Data
                        </h4>
                        <div
                          className="space-y-0.5"
                          style={{
                            fontSize: `${(7 * zoom) / 100}px`,
                          }}
                        >
                          <div className="flex justify-between">
                            <span>52 Week Range</span>
                            <span>{companyData.weekRange}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shares O/S</span>
                            <span>{companyData.sharesOS}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Market Cap.</span>
                            <span>{companyData.marketCap}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Yield (forward)</span>
                            <span>{companyData.yieldForward}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>P/E (forward)</span>
                            <span>{companyData.peForward}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>P/B</span>
                            <span>{companyData.pb}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Table */}
                  {financialTable.length > 0 && (
                    <div className="mt-4">
                      <h3
                        className="font-bold mb-2"
                        style={{
                          fontSize: `${(10 * zoom) / 100}px`,
                        }}
                      >
                        Key Financial Data (US$, 000s; except EPS)
                      </h3>
                      <table
                        className="w-full border-collapse"
                        style={{
                          fontSize: `${(7 * zoom) / 100}px`,
                        }}
                      >
                        <thead>
                          <tr className="border-b">
                            {financialTable[0] &&
                              Object.keys(financialTable[0])
                                .slice(0, 8)
                                .map((key) => (
                                  <th
                                    key={key}
                                    className="text-left py-1 px-1 bg-gray-100 border text-xs"
                                  >
                                    {key}
                                  </th>
                                ))}
                          </tr>
                        </thead>
                        <tbody>
                          {financialTable.slice(0, 4).map((row, index) => (
                            <tr key={index}>
                              {Object.values(row)
                                .slice(0, 8)
                                .map((value, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="text-right py-1 px-1 border text-xs"
                                  >
                                    {value}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Additional Content for Multi-page */}
                  {additionalSections && additionalSections.length > 0 && (
                    <div className="mt-4">
                      <div
                        style={{ fontSize: `${(8 * zoom) / 100}px` }}
                        dangerouslySetInnerHTML={{
                          __html: additionalSections
                            .slice(0, 1)
                            .map((section) =>
                              section.content.length > 500
                                ? section.content.substring(0, 500) + "..."
                                : section.content
                            )
                            .join("\n\n"),
                        }}
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div
                    className="mt-4 pt-2 border-t text-gray-600"
                    style={{
                      fontSize: `${(7 * zoom) / 100}px`,
                    }}
                  >
                    <p className="mb-1">
                      <span className="text-red-600 font-bold">*</span>{" "}
                      {disclaimer}
                    </p>
                    <div className="flex justify-between items-center">
                      <span>©2025 Fundamental Research Corp.</span>
                      <span>
                        "22+ Years of Bringing Undiscovered Investment
                        Opportunities to the Forefront"
                      </span>
                      <span>www.researchfrc.com</span>
                    </div>
                  </div>
                </div>
              ) : (
                // Page 2+ Content
                <div className="w-full min-h-full p-4">
                  {/* Page Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <div>
                      <h1
                        className="font-bold text-amber-700"
                        style={{
                          fontSize: `${(14 * zoom) / 100}px`,
                        }}
                      >
                        {companyName} - Page {currentPage}
                      </h1>
                    </div>
                    <div
                      className="text-gray-600"
                      style={{
                        fontSize: `${(10 * zoom) / 100}px`,
                      }}
                    >
                      Continued Analysis
                    </div>
                  </div>

                  {/* Additional Content Sections */}
                  {additionalSections && additionalSections.length > 0 && (
                    <div
                      className="space-y-4"
                      style={{ fontSize: `${(8 * zoom) / 100}px` }}
                    >
                      {additionalSections
                        .slice((currentPage - 2) * 2, currentPage * 2)
                        .map((section, index) => (
                          <div key={index} className="content-section">
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  section.content.length > 800
                                    ? section.content.substring(0, 800) + "..."
                                    : section.content,
                              }}
                            />
                          </div>
                        ))}

                      {/* Show financial table on later pages if it's large */}
                      {currentPage === 2 && financialTable.length > 4 && (
                        <div className="mt-4">
                          <h3
                            className="font-bold mb-2"
                            style={{
                              fontSize: `${(10 * zoom) / 100}px`,
                            }}
                          >
                            Extended Financial Data (US$, 000s; except EPS)
                          </h3>
                          <table
                            className="w-full border-collapse"
                            style={{
                              fontSize: `${(7 * zoom) / 100}px`,
                            }}
                          >
                            <thead>
                              <tr className="border-b">
                                {financialTable[0] &&
                                  Object.keys(financialTable[0])
                                    .slice(0, 8)
                                    .map((key) => (
                                      <th
                                        key={key}
                                        className="text-left py-1 px-1 bg-gray-100 border text-xs"
                                      >
                                        {key}
                                      </th>
                                    ))}
                              </tr>
                            </thead>
                            <tbody>
                              {financialTable.slice(4, 8).map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row)
                                    .slice(0, 8)
                                    .map((value, cellIndex) => (
                                      <td
                                        key={cellIndex}
                                        className="text-right py-1 px-1 border text-xs"
                                      >
                                        {value}
                                      </td>
                                    ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Default content if no additional sections */}
                  {(!additionalSections || additionalSections.length === 0) && (
                    <div className="text-center text-gray-500">
                      <div
                        className="font-bold mb-4"
                        style={{
                          fontSize: `${(16 * zoom) / 100}px`,
                        }}
                      >
                        Page {currentPage}
                      </div>
                      <p
                        style={{
                          fontSize: `${(12 * zoom) / 100}px`,
                        }}
                      >
                        Additional content would appear here
                      </p>
                    </div>
                  )}

                  {/* Page Footer */}
                  <div
                    className="mt-6 pt-2 border-t text-gray-600 absolute bottom-4 left-4 right-4"
                    style={{
                      fontSize: `${(7 * zoom) / 100}px`,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span>©2025 Fundamental Research Corp.</span>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <span>www.researchfrc.com</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Mobile Controls */}
      <div className="no-print fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl px-4 py-2">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <ZoomOutIcon className="h-5 w-5" />
            </button>
            <span className="text-sm">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
            >
              <ZoomInIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample data structure for testing
export const sampleReportData = {
  date: "August 22, 2025",
  companyName: "Kidoz Inc.",
  tickers: [
    { symbol: "KDOZ", exchange: "TSXV" },
    { symbol: "KDOZF", exchange: "OTC" },
  ],
  sector: "Ad Tech",
  rating: "BUY",
  currentPrice: "C$0.22",
  fairValue: "C$0.70",
  risk: "4",
  title: "Q2 Revenue Softens, H1 Hits Record; Tailwinds Ahead",
  highlights: [
    "After reporting record Q1 revenue (up 53% YoY), Q2 revenue pulled back 2% YoY, missing our forecast by 4%, primarily due to reduced client ad spending amid U.S. tariff uncertainty, and economic and trade concerns.",
    "Higher gross margins were offset by lower revenue and increased G&A expenses, which drove down EBITDA, and net losses widened in Q2. Excluding R&D costs, the company remains profitable.",
    "In H1-2025, Kidoz reported record revenue growth of 21% YoY. By comparison, major platforms YouTube (NASDAQ: GOOGL) and Meta (NASDAQ: META) saw ad revenue growth of 12% and 19%, respectively. Kidoz has adjusted its FY EPS (ex-R&D) forecast from 46% YoY.",
  ],
  analystInfo: {
    name: "Sid Rajeev, B.Tech, MBA, CFA",
    title: "Head of Research",
    credentials: "CFA",
  },
  companyData: {
    weekRange: "US$2.12-43.93",
    sharesOS: "14.4M",
    marketCap: "US$570M",
    yieldForward: "N/A",
    peForward: "N/A",
    pb: "2.5x",
    evEbitda: "N/A",
    beta: "N/A",
    revenueTTM: "N/A",
    ebitdaTTM: "N/A",
    roe: "N/A",
    debtEquity: "N/A",
  },
  performanceData: [
    { security: "ZEPP", ytd: "1,292%", twelveMonth: "1,232%" },
    { security: "NYSE", ytd: "9%", twelveMonth: "10%" },
  ],
  financialTable: [
    {
      Period: "2023",
      Cash: "1,459,224",
      "Working Capital": "3,220,646",
      "Total Assets": "11,987,080",
      "LT Debt to Capital": "0.0%",
      Revenue: "13,526,824",
      "Net Income": "(2,112,056)",
      EPS: "-0.015",
    },
    {
      Period: "2024",
      Cash: "2,780,517",
      "Working Capital": "4,219,588",
      "Total Assets": "11,734,233",
      "LT Debt to Capital": "0.0%",
      Revenue: "14,004,527",
      "Net Income": "353,140",
      EPS: "0.003",
    },
    {
      Period: "2025E",
      Cash: "3,737,896",
      "Working Capital": "5,820,052",
      "Total Assets": "12,853,174",
      "LT Debt to Capital": "0.0%",
      Revenue: "17,537,500",
      "Net Income": "1,499,696",
      EPS: "0.011",
    },
    {
      Period: "2026E",
      Cash: "6,110,169",
      "Working Capital": "8,125,094",
      "Total Assets": "15,394,104",
      "LT Debt to Capital": "0.0%",
      Revenue: "19,062,500",
      "Net Income": "2,198,251",
      EPS: "0.017",
    },
  ],
  disclaimer:
    "Kidoz Inc. has paid FRC a fee for research coverage and distribution of reports. See last page for other important disclosures, rating, and risk definitions. All figures in US$ unless otherwise specified.",
};
