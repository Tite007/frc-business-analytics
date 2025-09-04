"use client";

import React, { useState } from "react";
import {
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

// Professional PDF Report Layout Component
// Matches FRC research report format with automatic page sizing
export default function PDFReportLayout({ reportData, onGeneratePDF }) {
  const [pageFormat, setPageFormat] = useState("letter"); // letter, a4, legal
  const [showPreview, setShowPreview] = useState(true);

  // Page size configurations
  const pageSizes = {
    letter: { width: "8.5in", height: "11in", name: 'Letter (8.5" x 11")' },
    a4: { width: "210mm", height: "297mm", name: "A4 (210 x 297 mm)" },
    legal: { width: "8.5in", height: "14in", name: 'Legal (8.5" x 14")' },
  };

  const currentSize = pageSizes[pageFormat];

  // Extract data with defaults
  const {
    // Header data
    date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),

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
    highlights = [],
    htmlContent = "", // Add htmlContent with default value
    analystInfo = {
      name: "Analyst Name",
      title: "Senior Analyst",
      credentials: "CFA",
    },

    // Analyst commentary system
    analystComments = [],

    // Charts and data
    priceChart = null,
    companyData = {},
    financialTable = [],

    // Footer
    disclaimer = "Important disclosures and risk definitions on last page.",
  } = reportData || {};

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
      margin: 1in 0.75in 1in 0.75in;
    }
    
    @media print {
      .no-print { display: none !important; }
      .pdf-page { 
        page-break-after: always;
        height: calc(${currentSize.height} - 2in);
        width: calc(${currentSize.width} - 1.5in);
      }
      .pdf-page:last-child { page-break-after: avoid; }
      
      /* Professional Typography */
      body { 
        font-family: 'Georgia', 'Times New Roman', serif;
        font-size: 11pt; 
        line-height: 1.4; 
        color: #1a1a1a;
      }
      
      /* Headings - Wall Street Standards */
      h1 { 
        font-size: 20pt; 
        font-weight: bold; 
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #1a2c45;
        margin-bottom: 8pt;
        letter-spacing: -0.5pt;
      }
      h2 { 
        font-size: 16pt; 
        font-weight: bold; 
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #2c3e50;
        margin-bottom: 6pt;
        letter-spacing: -0.3pt;
      }
      h3 { 
        font-size: 13pt; 
        font-weight: bold; 
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #34495e;
        margin-bottom: 4pt;
        text-transform: uppercase;
        letter-spacing: 0.5pt;
      }
      
      /* Professional Color Scheme */
      .rating-box { border: 3px solid #1a2c45 !important; }
      .analyst-sidebar-screen { 
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
        border: 2px solid #e2e8f0 !important;
      }
      .sidebar-comment-screen { 
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
      }
      
      /* Table Styling */
      table { 
        border-collapse: collapse !important; 
        width: 100% !important;
      }
      th { 
        background: linear-gradient(135deg, #1a2c45 0%, #2c4168 100%) !important;
        color: white !important;
        font-weight: bold !important;
      }
      td, th { 
        border: 1px solid #e2e8f0 !important; 
        padding: 8pt !important;
        font-size: 10pt !important;
      }
      
      /* Enhanced Margins */
      .pdf-page { 
        margin: 0 !important;
        padding: 1in 0.75in !important;
      }
    }
  `;

  return (
    <div className="w-full">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Control Panel */}
      <div className="no-print mb-6 bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Size
              </label>
              <select
                value={pageFormat}
                onChange={(e) => setPageFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                {Object.entries(pageSizes).map(([key, size]) => (
                  <option key={key} value={key}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              <div>Current: {currentSize.name}</div>
              <div>
                Size: {currentSize.width} × {currentSize.height}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print Report
            </button>
            <button
              onClick={onGeneratePDF}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Generate PDF
            </button>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div
          className="pdf-page shadow-2xl mx-auto bg-white border border-gray-200"
          style={{
            width: currentSize.width,
            minHeight: currentSize.height,
            fontSize: "11pt",
            lineHeight: "1.4",
            fontFamily: "Georgia, Times New Roman, serif",
            color: "#1a1a1a",
            padding: "1in 0.75in",
          }}
        >
          {/* Institutional Header */}
          <div
            className="institutional-header flex items-center justify-between mb-8 pb-6 text-white rounded-lg"
            style={{
              background: "linear-gradient(135deg, #1a2c45 0%, #2c4168 100%)",
              padding: "20px 24px",
              marginLeft: "-0.75in",
              marginRight: "-0.75in",
              marginTop: "-1in",
              marginBottom: "32px",
              boxShadow: "0 4px 12px rgba(26, 44, 69, 0.3)",
            }}
          >
            <div className="flex items-center">
              <div className="mr-6">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center text-white font-bold text-lg border-2 border-white border-opacity-30">
                  FRC
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-wide">
                  Fundamental Research Corp.
                </div>
                <div className="text-sm opacity-90 font-medium">
                  Professional Equity Research • Est. 2003
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold tracking-tight">{date}</div>
              <div className="text-sm opacity-90">Research Report</div>
            </div>
          </div>

          {/* Enhanced Company Information Section */}
          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Left: Company Information (3 columns) */}
            <div className="col-span-3">
              <h1
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  color: "#1a2c45",
                  letterSpacing: "-0.3px",
                }}
              >
                {companyName}
              </h1>
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">
                  ({formatTickers(tickers)})
                </span>
              </div>
              <h2
                className="text-lg font-semibold text-gray-800 mb-3 leading-tight"
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  color: "#2c3e50",
                }}
              >
                {title}
              </h2>
              <div className="text-sm">
                <span className="font-semibold text-gray-800">Sector:</span>
                <span className="ml-2 text-gray-700">{sector}</span>
              </div>
            </div>

            {/* Right: Rating Box (1 column) */}
            <div className="col-span-1">
              <div
                className="border-2 rounded-lg p-4 text-center h-full flex flex-col justify-center"
                style={{
                  borderColor: "#1a2c45",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 4px 8px rgba(26, 44, 69, 0.1)",
                }}
              >
                <div
                  className={`px-3 py-2 rounded text-sm font-bold mb-3 ${getRatingColor(
                    rating
                  )}`}
                  style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                >
                  {rating}
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="text-gray-600 font-medium">
                      Current Price:
                    </div>
                    <div className="font-bold text-gray-900">
                      {currentPrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Fair Value:</div>
                    <div className="font-bold text-blue-700">{fairValue}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-medium">Risk:</div>
                    <div className="font-bold text-gray-900">{risk}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout - Matching Screenshot */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* Left: Highlights Section (Larger Column) */}
            <div className="col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3
                  className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  Highlights
                </h3>
                <div className="space-y-2">
                  {highlights.length > 0 ? (
                    highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2 text-xs mt-1 font-bold">
                          ▶
                        </span>
                        <span className="text-xs text-gray-800 leading-relaxed">
                          {highlight}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      No highlights available in current report.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Analyst Info + Chart Placeholder */}
            <div className="col-span-1 space-y-4">
              {/* Analyst Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-blue-900 mb-2">
                  {analystInfo.name}
                </h4>
                <div className="text-xs text-blue-700 mb-1">
                  {analystInfo.title}
                </div>
                <div className="text-xs text-blue-600">
                  {analystInfo.credentials}
                </div>
              </div>

              {/* Price Chart Placeholder */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-gray-900 mb-2">
                  Price & Volume (1-Year)
                </h4>
                <div className="border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                  <span className="text-xs text-gray-500">Chart</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Data Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3
              className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Company Data
            </h3>
            <div className="grid grid-cols-4 gap-4 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">52-Week Range:</span>
                  <span className="font-medium">
                    {companyData.weekRange || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares O/S:</span>
                  <span className="font-medium">
                    {companyData.sharesOS || "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Cap:</span>
                  <span className="font-medium">
                    {companyData.marketCap || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Yield:</span>
                  <span className="font-medium">
                    {companyData.yield || "N/A"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E (forward):</span>
                  <span className="font-medium">
                    {companyData.peForward || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">P/B:</span>
                  <span className="font-medium">{companyData.pb || "N/A"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">EV/EBITDA:</span>
                  <span className="font-medium">
                    {companyData.evEbitda || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Financial Data Table (Full Width) */}
          {financialTable.length > 0 && (
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
              <h3
                className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                Key Financial Data (FYE - Dec 31)
              </h3>
              <div className="overflow-hidden">
                <table className="w-full text-xs border border-gray-300 rounded">
                  <thead
                    className="text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #1a2c45 0%, #2c4168 100%)",
                    }}
                  >
                    <tr>
                      {financialTable[0] &&
                        Object.keys(financialTable[0]).map((key) => (
                          <th
                            key={key}
                            className="px-3 py-2 text-left font-bold border-r border-white border-opacity-20 last:border-r-0"
                          >
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {financialTable.map((row, index) => (
                      <tr
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        {Object.values(row).map((value, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 border-r border-gray-200 last:border-r-0 font-medium"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Enhanced Report Content */}
          {htmlContent && htmlContent.trim().length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3
                className="text-sm font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                Detailed Analysis & Research Commentary
              </h3>
              <div
                className="prose prose-sm max-w-none text-xs leading-relaxed"
                style={{
                  fontFamily: "Georgia, Times New Roman, serif",
                  color: "#1a1a1a",
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}

          {/* Professional Footer */}
          <div
            className="text-center py-4 text-white rounded mt-6"
            style={{
              background: "linear-gradient(135deg, #1a2c45 0%, #2c4168 100%)",
            }}
          >
            <div className="text-xs font-medium mb-1">{disclaimer}</div>
            <div className="text-xs opacity-75">
              © {new Date().getFullYear()} Fundamental Research Corp. All rights
              reserved.
            </div>
          </div>
        </div>
      )}
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
    weekRange: "C$0.10-$0.37",
    sharesOS: "191M",
    marketCap: "C$29M",
    yield: "N/A",
    peForward: "N/A",
    pb: "-3%",
    evEbitda: "N/A",
  },
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
