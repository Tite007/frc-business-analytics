//latest
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  DocumentIcon,
  TableCellsIcon,
  ChartBarIcon,
  PhotoIcon,
  NewspaperIcon,
  BookmarkIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { FinancialTinyMCEEditor } from "@/components/TinyMCEEditor";
import PDFReportLayout from "@/components/PDFReportLayout";

const blockTypes = [
  {
    id: "header",
    name: "FRC Header",
    description: "Standard FRC branding header with logo and date",
    icon: BookmarkIcon,
    template: {
      logoPath: "/FRC_Logo_FullWhite.png",
      headerText: "Fundamental Research Corp.",
      reportDate: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
  },
  {
    id: "title-metadata",
    name: "Title & Metadata",
    description: "Company name, ticker, sector, and report title",
    icon: DocumentTextIcon,
    template: {
      companyName: "",
      tickers: [{ exchange: "", symbol: "", isPrimary: true }],
      sector: "",
      reportTitle: "",
      rating: "",
      targetPrice: "",
      currentPrice: "",
      risk: "3",
      date: new Date().toLocaleDateString(),
      // Legacy fields for backward compatibility
      ticker: "",
      exchange: "",
    },
  },
  {
    id: "executive-summary",
    name: "Highlights",
    description: "Key highlights and investment thesis bullet points",
    icon: ClipboardDocumentListIcon,
    template: {
      content: "",
      highlights: [
        "Record Q1 revenue performance with significant year-over-year growth",
        "Strong margin expansion and operational efficiency improvements",
        "Positive sector outlook with favorable industry tailwinds",
        "Solid balance sheet position supporting growth initiatives",
      ],
    },
  },
  {
    id: "financial-metrics",
    name: "Financial Metrics",
    description: "Key financial data table and company metrics",
    icon: ChartBarIcon,
    template: {
      // Financial table data
      financialTable: {
        title: "Key Financial Data (FYE - Dec 31)",
        currency: "US$",
        years: ["2023", "2024", "2025E", "2026E"],
        metrics: [
          { name: "Cash", values: ["", "", "", ""] },
          { name: "Working Capital", values: ["", "", "", ""] },
          { name: "Total Assets", values: ["", "", "", ""] },
          {
            name: "LT Debt to Capital",
            values: ["0.0%", "0.0%", "0.0%", "0.0%"],
          },
          { name: "Revenue", values: ["", "", "", ""] },
          { name: "Net Income", values: ["", "", "", ""] },
          { name: "EPS", values: ["", "", "", ""] },
        ],
      },
      // Company data sidebar
      companyData: {
        weekRange: "",
        sharesOS: "",
        marketCap: "",
        currentYield: "N/A",
        peForward: "N/A",
        pbRatio: "",
      },
    },
  },
  {
    id: "sidebar-content",
    name: "Sidebar Content",
    description:
      "Author info, price chart, performance data, and company metrics",
    icon: NewspaperIcon,
    template: {
      // Author Information
      authorName: "",
      authorTitle: "Head of Research",
      authorCredentials: "B.Tech, MBA, CFA",

      // Price & Volume Chart
      chartTitle: "Price and Volume (1-year)",
      chartImageUrl: "",

      // Performance Table
      performanceTable: {
        title: "Performance Comparison",
        columns: ["", "YTD", "12M"],
        rows: [
          ["KIDZ", "50%", "25%"],
          ["TSXV", "13%", "15%"],
          ["Sector*", "-20%", "-26%"],
          ["GDXJ", "55%", "65%"],
        ],
      },

      // Company Data
      companyData: {
        weekRange: "",
        sharesOS: "",
        marketCap: "",
        yieldForward: "N/A",
        peForward: "N/A",
        pbRatio: "",
      },
    },
  },
  {
    id: "analyst-notes-content",
    name: "Rich Text Block",
    description: "Detailed analysis content with rich formatting",
    icon: NewspaperIcon,
    template: { content: "" },
  },
  {
    id: "data-table",
    name: "Data Table",
    description: "Custom financial tables and structured data",
    icon: TableCellsIcon,
    template: {
      title: "",
      headers: ["Metric", "Value", "Previous", "Change"],
      rows: [["", "", "", ""]],
    },
  },
  {
    id: "image-block",
    name: "Image Block",
    description: "Charts, graphs, and supporting images",
    icon: PhotoIcon,
    template: { url: "", caption: "", alt: "" },
  },
  {
    id: "page-break",
    name: "Page Break",
    description: "Force new page in PDF output",
    icon: Bars3Icon,
    template: {},
  },
  {
    id: "footer",
    name: "Report Footer",
    description: "Standard FRC footer with disclaimers",
    icon: DocumentIcon,
    template: {
      disclaimer: "Important disclosures and risk definitions on last page.",
      copyright:
        "©2025 Fundamental Research Corp. '22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront'",
      website: "www.researchfrc.com",
    },
  },
];

export default function BlockBasedReportEditor() {
  const [reportBlocks, setReportBlocks] = useState([
    {
      id: "header-1",
      type: "header",
      data: {
        logoPath: "/FRC_Logo_FullWhite.png",
        headerText: "Fundamental Research Corp.",
        reportDate: "August 30, 2025",
      },
    },
    {
      id: "title-1",
      type: "title-metadata",
      data: {
        companyName: "Kidoz Inc.",
        tickers: [
          { exchange: "TSXV", symbol: "KDOZ", isPrimary: true },
          { exchange: "OTC", symbol: "KDOZF", isPrimary: false },
        ],
        sector: "Ad Tech",
        reportTitle: "Q2 Revenue Softens, H1 Hits Record; Tailwinds Ahead",
        rating: "BUY",
        targetPrice: "0.70",
        currentPrice: "0.22",
        risk: "4",
        date: "2025-08-30",
        // Legacy fields for backward compatibility
        ticker: "KDOZ",
        exchange: "TSXV",
        otcTicker: "KDOZF",
      },
    },
    {
      id: "summary-1",
      type: "executive-summary",
      data: {
        content:
          "After reporting record Q1 revenue (up 53% YoY), Q2 revenue pulled back 2% YoY to $3.8M (vs. our $4.1M estimate). However, H1 revenue hit a record $11.6M, up 25% YoY. Gross margins improved to 55% vs. 51% in Q1 and 46% in Q2'23. Excluding one-time R&D costs in Q1, H1 adjusted EBITDA improved to -$0.7M vs. -$2.1M in H1'23.",
      },
    },
    {
      id: "highlights-1",
      type: "analyst-notes-content",
      data: {
        content: `<h3>Key Investment Highlights:</h3>
        <ul>
        <li><strong>Record H1 Performance:</strong> Despite Q2 softness, H1 2024 revenue of $11.6M represents a 25% YoY increase and sets a new record for the company</li>
        <li><strong>Margin Expansion:</strong> Gross margins improved to 55% in Q2 vs. 46% in Q2'23, demonstrating operational leverage and pricing power</li>
        <li><strong>Meta & YouTube Comparisons:</strong> Management highlighted Kidoz's competitive advantages in child-safe advertising compared to larger platforms</li>
        <li><strong>Strong Balance Sheet:</strong> Maintained solid cash position with minimal debt, providing flexibility for growth investments</li>
        <li><strong>Australia Expansion:</strong> Successful launch in Australian market showing international growth potential</li>
        <li><strong>Sector Tailwinds:</strong> Digital advertising sector forecast to grow 13% in 2024, benefiting specialized platforms like Kidoz</li>
        </ul>`,
      },
    },
    {
      id: "metrics-1",
      type: "financial-metrics",
      data: {
        financialTable: {
          title: "Key Financial Data (FYE - Dec 31)",
          currency: "US$",
          years: ["2023", "2024", "2025E", "2026E"],
          metrics: [
            { name: "Cash", values: ["2.1M", "1.8M", "2.5M", "3.2M"] },
            {
              name: "Working Capital",
              values: ["1.5M", "1.2M", "1.8M", "2.5M"],
            },
            { name: "Total Assets", values: ["8.2M", "7.9M", "9.1M", "11.5M"] },
            {
              name: "LT Debt to Capital",
              values: ["0.0%", "0.0%", "0.0%", "0.0%"],
            },
            { name: "Revenue", values: ["18.5M", "23.2M", "28.5E", "35.0E"] },
            { name: "Net Income", values: ["-3.1M", "-1.8M", "0.5E", "2.8E"] },
            { name: "EPS", values: ["-0.024", "-0.014", "0.004E", "0.021E"] },
          ],
        },
        companyData: {
          weekRange: "C$0.10-0.37",
          sharesOS: "131M",
          marketCap: "C$29M",
          currentYield: "N/A",
          peForward: "N/A",
          pbRatio: "4.2x",
        },
      },
    },
    {
      id: "sidebar-1",
      type: "sidebar-content",
      data: {
        authorName: "Sid Rajeev",
        authorTitle: "Head of Research",
        authorCredentials: "B.Tech, MBA, CFA",
        chartTitle: "Price and Volume (1-year)",
        chartImageUrl: "",
        performanceTable: {
          title: "Performance Comparison",
          columns: ["", "YTD", "12M"],
          rows: [
            ["ZEPP", "124%", "25%"],
            ["NYSE", "9%", "10%"],
            ["Sector*", "-5%", "8%"],
            ["Tech Index", "15%", "18%"],
          ],
        },
        companyData: {
          weekRange: "US$2.12-43.93",
          sharesOS: "14.4M",
          marketCap: "US$570M",
          yieldForward: "N/A",
          peForward: "N/A",
          pbRatio: "2.5x",
        },
      },
    },
  ]);

  const [selectedBlock, setSelectedBlock] = useState(0);
  const [viewMode, setViewMode] = useState("editor");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showTips, setShowTips] = useState(true);

  const updateBlockData = (blockIndex, field, value) => {
    setReportBlocks((prev) => {
      const updated = [...prev];
      updated[blockIndex] = {
        ...updated[blockIndex],
        data: { ...updated[blockIndex].data, [field]: value },
      };
      return updated;
    });
  };

  const addBlock = (type) => {
    const blockType = blockTypes.find((t) => t.id === type);
    let blockData = { ...blockType.template };

    // Ensure header blocks always have the FRC logo
    if (type === "header") {
      blockData = {
        ...blockData,
        logoPath: "/FRC_Logo_FullWhite.png",
        headerText: blockData.headerText || "Fundamental Research Corp.",
      };
    }

    const newBlock = {
      id: `${type}-${Date.now()}`,
      type,
      data: blockData,
    };
    setReportBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(reportBlocks.length);
  };

  const removeBlock = (index) => {
    if (reportBlocks.length > 1) {
      setReportBlocks((prev) => prev.filter((_, i) => i !== index));
      setSelectedBlock(Math.max(0, selectedBlock - 1));
    }
  };

  const moveBlockUp = (index) => {
    if (index > 0) {
      setReportBlocks((prev) => {
        const newBlocks = [...prev];
        [newBlocks[index - 1], newBlocks[index]] = [
          newBlocks[index],
          newBlocks[index - 1],
        ];
        return newBlocks;
      });
      setSelectedBlock(index - 1);
    }
  };

  const moveBlockDown = (index) => {
    if (index < reportBlocks.length - 1) {
      setReportBlocks((prev) => {
        const newBlocks = [...prev];
        [newBlocks[index], newBlocks[index + 1]] = [
          newBlocks[index + 1],
          newBlocks[index],
        ];
        return newBlocks;
      });
      setSelectedBlock(index + 1);
    }
  };

  const handleSave = async (status) => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log(`Report saved as ${status}`, { reportBlocks, formData });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    try {
      console.log("Generating Professional PDF...", reportBlocks);

      // Show loading state
      const button = document.querySelector("[data-pdf-export]");
      if (button) {
        button.textContent = "Generating Professional PDF...";
        button.disabled = true;
      }

      // Try professional PDF generation first
      try {
        // Option 1: Use pdf-lib for professional vector PDFs
        const { default: ProfessionalPDFService } = await import(
          "/src/lib/ProfessionalPDFService.js"
        );
        const pdfService = new ProfessionalPDFService();
        const reportData = convertBlocksToReportData(reportBlocks, {});

        const pdfBytes = await pdfService.generateFinancialReport(reportData);
        const fileName = `${reportData.companyName || "Report"}_${
          reportData.date || new Date().toISOString().split("T")[0]
        }.pdf`;

        pdfService.downloadPDF(pdfBytes, fileName);
        console.log(`Professional PDF generated: ${fileName}`);
        return;
      } catch (professionalError) {
        console.warn(
          "Professional PDF generation failed, falling back to enhanced html2canvas:",
          professionalError
        );
      }

      // Fallback: Use Enhanced PDF Generator for highest quality
      try {
        const { default: EnhancedPDFGenerator } = await import(
          "/src/lib/EnhancedPDFGenerator.js"
        );

        // Find the PDF layout element
        const pdfElement = document.querySelector("[data-pdf-content]");
        if (!pdfElement) {
          console.error("PDF content element not found");
          alert(
            "PDF content not found. Please make sure you are viewing the PDF layout."
          );
          return;
        }

        // Get the title for filename
        const reportData = convertBlocksToReportData(reportBlocks, {});
        const fileName = `${reportData.companyName || "Report"}_${
          reportData.date || new Date().toISOString().split("T")[0]
        }.pdf`;

        console.log("Using Enhanced PDF Generator for high-quality output...");

        // Generate PDF with enhanced quality settings
        const result = await EnhancedPDFGenerator.generateFromElement(
          pdfElement,
          fileName,
          {
            canvas: {
              scale: 3, // Ultra-high resolution
              dpi: 300,
            },
            image: {
              quality: 0.98, // Very high quality
            },
          }
        );

        // Save the PDF
        result.save();
        console.log(`Enhanced high-quality PDF saved as: ${fileName}`);
        return;
      } catch (enhancedError) {
        console.warn(
          "Enhanced PDF generation failed, using basic fallback:",
          enhancedError
        );
      }

      // Final fallback: Basic but optimized html2canvas + jsPDF
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      // Find the PDF layout element
      const pdfElement = document.querySelector("[data-pdf-content]");
      if (!pdfElement) {
        console.error("PDF content element not found");
        alert(
          "PDF content not found. Please make sure you are viewing the PDF layout."
        );
        return;
      }

      // Get the title for filename
      const reportData = convertBlocksToReportData(reportBlocks, {});
      const fileName = `${reportData.companyName || "Report"}_${
        reportData.date || new Date().toISOString().split("T")[0]
      }.pdf`;

      // Basic optimized settings
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
        compress: true,
      });

      const canvas = await html2canvas(pdfElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.width / canvas.height;

      let imgWidth = pdfWidth;
      let imgHeight = pdfWidth / canvasAspectRatio;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      pdf.addImage(
        imgData,
        "JPEG",
        Math.max(0, xOffset),
        Math.max(0, yOffset),
        imgWidth,
        imgHeight
      );
      pdf.save(fileName);

      console.log(`Basic PDF saved as: ${fileName}`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again or contact support.");
    } finally {
      // Reset button state
      const button = document.querySelector("[data-pdf-export]");
      if (button) {
        button.textContent = "Export PDF";
        button.disabled = false;
      }
    }
  };

  const convertBlocksToReportData = (blocks, metadata) => {
    // Extract highlights from analyst notes and executive summary
    const highlights = [];
    let htmlContent = "";
    let financialTable = [];
    let executiveSummary = "";

    // Process each block
    blocks.forEach((block) => {
      switch (block.type) {
        case "executive-summary":
          if (block.data.content) {
            // Store executive summary content separately
            executiveSummary = block.data.content;

            // Pass the full content as highlights (preserve all formatting)
            highlights.push(block.data.content);
          }
          break;

        case "analyst-notes-content":
          if (block.data.content) {
            // Extract plain text for highlights
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = block.data.content;
            const textContent = tempDiv.textContent || tempDiv.innerText || "";

            // Split into sentences and take first few as highlights
            const sentences = textContent
              .split(".")
              .filter((s) => s.trim().length > 20);
            highlights.push(
              ...sentences.slice(0, 3).map((s) => s.trim() + ".")
            );

            // Add to HTML content
            htmlContent += block.data.content + "<br/><br/>";
          }
          break;

        case "data-table":
          if (block.data.rows && block.data.headers) {
            // Convert table to array format
            const tableData = block.data.rows.map((row) => {
              const rowObj = {};
              block.data.headers.forEach((header, index) => {
                rowObj[header] = row[index] || "";
              });
              return rowObj;
            });
            financialTable = tableData;
          }
          break;
      }
    });

    // Get different block types
    const titleBlock = blocks.find((b) => b.type === "title-metadata");
    const metricsBlock = blocks.find((b) => b.type === "financial-metrics");
    const headerBlock = blocks.find((b) => b.type === "header");
    const sidebarBlock = blocks.find((b) => b.type === "sidebar-content");
    const footerBlock = blocks.find((b) => b.type === "footer");

    // Build tickers array from new structure
    let tickers = [];
    if (titleBlock?.data.tickers && Array.isArray(titleBlock.data.tickers)) {
      // Use new tickers array structure
      tickers = titleBlock.data.tickers
        .filter((ticker) => ticker.exchange && ticker.symbol)
        .map((ticker) => ({
          symbol: ticker.symbol,
          exchange: ticker.exchange,
          isPrimary: ticker.isPrimary || false,
        }));
    } else {
      // Fallback to old structure for backward compatibility
      if (titleBlock?.data.ticker && titleBlock?.data.exchange) {
        tickers.push({
          symbol: titleBlock.data.ticker,
          exchange: titleBlock.data.exchange,
          isPrimary: true,
        });
      }
      if (titleBlock?.data.otcTicker) {
        tickers.push({
          symbol: titleBlock.data.otcTicker,
          exchange: "OTC",
          isPrimary: false,
        });
      }
    }

    return {
      // Header - Always include FRC logo
      logo: headerBlock?.data.logoPath || "/FRC_Logo_FullWhite.png",
      headerText: headerBlock?.data.headerText || "Fundamental Research Corp.",

      // Date
      date: titleBlock?.data.date
        ? new Date(titleBlock.data.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),

      // Company Info
      companyName: titleBlock?.data.companyName || "Company Name",
      tickers:
        tickers.length > 0
          ? tickers
          : [{ symbol: "TICKER", exchange: "NASDAQ" }],
      sector: titleBlock?.data.sector || "Technology",
      title: titleBlock?.data.reportTitle || "Research Report",

      // Rating & Pricing
      rating: titleBlock?.data.rating || "BUY",
      currentPrice: titleBlock?.data.currentPrice
        ? titleBlock.data.currentPrice.toString().startsWith("C$")
          ? titleBlock.data.currentPrice
          : `C$${titleBlock.data.currentPrice}`
        : "C$0.00",
      fairValue: titleBlock?.data.targetPrice
        ? titleBlock.data.targetPrice.toString().startsWith("C$")
          ? titleBlock.data.targetPrice
          : `C$${titleBlock.data.targetPrice}`
        : "C$0.00",
      risk: titleBlock?.data.risk || "3",

      // Content
      executiveSummary: executiveSummary || "",
      highlights: highlights.length > 0 ? highlights : [],
      htmlContent,

      // Analyst Info
      analystInfo: {
        name: sidebarBlock?.data.authorName || "Senior Analyst",
        title: sidebarBlock?.data.authorTitle || "Head of Research",
        credentials: sidebarBlock?.data.authorCredentials || "CFA",
      },

      // Company Data from sidebar block only
      companyData: sidebarBlock?.data.companyData || {
        weekRange: "N/A",
        sharesOS: "N/A",
        marketCap: "N/A",
        yieldForward: "N/A",
        peForward: "N/A",
        pb: "N/A",
      },

      // Performance data from sidebar block - formatted as proper table
      performanceTable: sidebarBlock?.data.performanceTable || {
        title: "Performance Comparison",
        columns: ["", "YTD", "12M"],
        rows: [
          ["ZEPP", "1,292%", "1,232%"],
          ["NYSE", "9%", "10%"],
        ],
      },

      // Chart info from sidebar block
      chartTitle: sidebarBlock?.data.chartTitle || "Price and Volume (1-year)",
      chartImageUrl: sidebarBlock?.data.chartImageUrl || "",

      // Financial table from financial metrics block
      financialTable: metricsBlock?.data.financialTable || {},

      // Footer
      disclaimer:
        footerBlock?.data.disclaimer ||
        "Important disclosures and risk definitions on last page.",
      copyright:
        footerBlock?.data.copyright ||
        "©2025 Fundamental Research Corp. '22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront'",
      website: footerBlock?.data.website || "www.researchfrc.com",

      // Additional metadata
      createdAt: new Date().toISOString(),
      blocks,
    };
  };

  const currentBlock = reportBlocks[selectedBlock];
  const currentBlockType = blockTypes.find((t) => t.id === currentBlock?.type);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mac-style Header with Quick Start Guide */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Navigation */}
          <div className="flex items-center mb-6">
            <Link
              href="/cms/content"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Content</span>
            </Link>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                📊 Professional Report Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create Wall Street-grade research reports with ease - no
                formatting skills required
              </p>
              <div className="mt-3 flex items-center space-x-6 text-sm">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Auto-formatting
                </div>
                <div className="flex items-center text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Professional templates
                </div>
                <div className="flex items-center text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Instant PDF export
                </div>
              </div>
            </div>

            {/* Mac-style Window Controls */}
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🚀 Quick Start Guide
              </h2>
              <button
                onClick={() => setShowTips(!showTips)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showTips ? "Hide Tips" : "Show Tips"}
              </button>
            </div>

            {showTips && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full text-sm flex items-center justify-center font-bold mb-2">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Setup Title
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Add company name, ticker, and target price
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full text-sm flex items-center justify-center font-bold mb-2">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Add Metrics
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Include financial data and key ratios
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full text-sm flex items-center justify-center font-bold mb-2">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Write Analysis
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Use rich text blocks for detailed analysis
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full text-sm flex items-center justify-center font-bold mb-2">
                    4
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Preview Layout
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Check PDF layout before publishing
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full text-sm flex items-center justify-center font-bold mb-2">
                    5
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Export PDF
                  </h3>
                  <p className="text-gray-600 text-xs">
                    Generate professional report instantly
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Mac-style View Toggle */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {[
                { id: "editor", name: "Editor", icon: PencilIcon },
                { id: "preview", name: "Preview", icon: EyeIcon },
                { id: "pdf-layout", name: "PDF Layout", icon: DocumentIcon },
                { id: "pdf", name: "Export", icon: DocumentDuplicateIcon },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === mode.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <mode.icon className="h-4 w-4 mr-2" />
                  {mode.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg border border-gray-300"
            >
              <Bars3Icon className="h-4 w-4 mr-2" />
              Blocks
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Mac-style Sidebar */}
          <div
            className={`col-span-12 lg:col-span-3 ${
              !sidebarOpen ? "hidden lg:block" : ""
            }`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  📋 Report Blocks
                  <div className="ml-auto flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                </h3>
              </div>

              <div className="p-4">
                {/* Current Blocks */}
                <div className="space-y-2 mb-6">
                  {reportBlocks.map((block, index) => {
                    const blockType = blockTypes.find(
                      (t) => t.id === block.type
                    );
                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(index)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedBlock === index
                            ? "bg-blue-50 border-blue-200 ring-2 ring-blue-500 ring-opacity-20"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {React.createElement(
                              blockType?.icon || DocumentTextIcon,
                              {
                                className: `h-4 w-4 mr-2 ${
                                  selectedBlock === index
                                    ? "text-blue-600"
                                    : "text-gray-500"
                                }`,
                              }
                            )}
                            <span
                              className={`text-sm font-medium ${
                                selectedBlock === index
                                  ? "text-blue-900"
                                  : "text-gray-900"
                              }`}
                            >
                              {index + 1}. {blockType?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlockUp(index);
                              }}
                              disabled={index === 0}
                              className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <ChevronRightIcon className="h-4 w-4 transform -rotate-90" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlockDown(index);
                              }}
                              disabled={index === reportBlocks.length - 1}
                              className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move down"
                            >
                              <ChevronRightIcon className="h-4 w-4 transform rotate-90" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBlock(index);
                              }}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete block"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Block Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    Add New Block
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {blockTypes.slice(1).map((type) => (
                      <button
                        key={type.id}
                        onClick={() => addBlock(type.id)}
                        className="flex items-center p-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <PlusIcon className="h-4 w-4 mr-2 text-green-600" />
                        <type.icon className="h-4 w-4 mr-2 text-gray-500" />
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">
            {viewMode === "editor" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        {React.createElement(
                          currentBlockType?.icon || DocumentTextIcon,
                          {
                            className: "h-6 w-6 mr-3 text-blue-600",
                          }
                        )}
                        Block {selectedBlock + 1}: {currentBlockType?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentBlockType?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">
                        Block {selectedBlock + 1} of {reportBlocks.length}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setSelectedBlock(Math.max(0, selectedBlock - 1))
                          }
                          disabled={selectedBlock === 0}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-all"
                          title="Previous block"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() =>
                            setSelectedBlock(
                              Math.min(
                                reportBlocks.length - 1,
                                selectedBlock + 1
                              )
                            )
                          }
                          disabled={selectedBlock === reportBlocks.length - 1}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-all"
                          title="Next block"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Block Editor Components */}
                  <BlockEditor
                    block={currentBlock}
                    onUpdate={(field, value) =>
                      updateBlockData(selectedBlock, field, value)
                    }
                  />
                </div>
              </div>
            )}

            {viewMode === "preview" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Report Preview
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Preview how your content will appear in the final report
                  </p>
                </div>
                <div className="p-6">
                  <div
                    style={{
                      transform: "scale(0.8)",
                      transformOrigin: "top left",
                    }}
                  >
                    <PDFReportLayout
                      reportData={convertBlocksToReportData(
                        reportBlocks,
                        formData
                      )}
                      onGeneratePDF={generatePDF}
                      isPreviewMode={true}
                    />
                  </div>
                </div>
              </div>
            )}

            {viewMode === "pdf-layout" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Professional PDF Layout Preview
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Wall Street-grade report formatting with automated layout
                  </p>
                </div>
                <PDFReportLayout
                  reportData={convertBlocksToReportData(reportBlocks, formData)}
                  onGeneratePDF={generatePDF}
                  isPreviewMode={true}
                />
              </div>
            )}

            {viewMode === "pdf" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Export Professional PDF
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Generate institutional-quality research report
                  </p>
                </div>
                <div className="p-6">
                  <PDFLayoutView
                    blocks={reportBlocks}
                    onGeneratePDF={generatePDF}
                    reportData={convertBlocksToReportData(
                      reportBlocks,
                      formData
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mac-style Actions Footer */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Help & Instructions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                🎓 Quick Help Guide
                <div className="ml-auto flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      🚀 Getting Started
                    </h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">
                          1
                        </span>
                        Fill "Title & Metadata" with company info
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-green-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">
                          2
                        </span>
                        Add "Financial Metrics" for price data
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">
                          3
                        </span>
                        Use "Rich Text" blocks for analysis
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">
                          4
                        </span>
                        Switch to "PDF Layout" to preview
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">
                          5
                        </span>
                        Click "Generate PDF" when ready
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      📊 Block Types
                    </h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li>
                        • <strong>Title & Metadata:</strong> Company basics
                      </li>
                      <li>
                        • <strong>Financial Metrics:</strong> Price/valuation
                      </li>
                      <li>
                        • <strong>Rich Text:</strong> Analysis content
                      </li>
                      <li>
                        • <strong>Data Table:</strong> Financial tables
                      </li>
                      <li>
                        • <strong>Chart Block:</strong> Visual data
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      💡 Pro Tips
                    </h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li>• Use specific numbers and percentages</li>
                      <li>• Include timeframes (Q2 2024, FY2023)</li>
                      <li>• Add bullet points for key highlights</li>
                      <li>• Preview often in PDF Layout mode</li>
                      <li>• Save drafts frequently</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🎯 Report Quality
                    </h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li>• Include investment thesis</li>
                      <li>• State clear catalysts and risks</li>
                      <li>• Use professional language</li>
                      <li>• Provide specific price targets</li>
                      <li>• Reference peer comparisons</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  📊 Report Status
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {reportBlocks.length}
                </div>
                <div className="text-sm text-gray-500 mb-1">Blocks</div>
                <div className="text-xs text-gray-500 mb-3">
                  {Math.round(
                    (reportBlocks.filter((block) =>
                      Object.values(block.data).some((value) =>
                        typeof value === "string" ? value.trim() : value
                      )
                    ).length /
                      reportBlocks.length) *
                      100
                  )}
                  % Complete
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (reportBlocks.filter((block) =>
                          Object.values(block.data).some((value) =>
                            typeof value === "string" ? value.trim() : value
                          )
                        ).length /
                          reportBlocks.length) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 font-medium"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "💾 Save Draft"}
                </button>
                <button
                  onClick={() => handleSave("published")}
                  disabled={isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-medium shadow-sm"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  {isSaving ? "Publishing..." : "🚀 Publish Report"}
                </button>
                <div className="text-xs text-gray-500 text-center mt-3">
                  💡 Save drafts to keep your work safe
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({ block, onUpdate }) {
  if (!block) return null;

  switch (block.type) {
    case "header":
      return <HeaderBlockEditor block={block} onUpdate={onUpdate} />;
    case "title-metadata":
      return <TitleMetadataEditor block={block} onUpdate={onUpdate} />;
    case "executive-summary":
      return <ExecutiveSummaryEditor block={block} onUpdate={onUpdate} />;
    case "financial-metrics":
      return <FinancialMetricsEditor block={block} onUpdate={onUpdate} />;
    case "sidebar-content":
      return <SidebarContentEditor block={block} onUpdate={onUpdate} />;
    case "analyst-notes-content":
      return <AnalystNotesContentEditor block={block} onUpdate={onUpdate} />;
    case "chart-block":
      return <ChartBlockEditor block={block} onUpdate={onUpdate} />;
    case "data-table":
      return <DataTableEditor block={block} onUpdate={onUpdate} />;
    case "image-block":
      return <ImageBlockEditor block={block} onUpdate={onUpdate} />;
    case "text-content":
      return <TextContentEditor block={block} onUpdate={onUpdate} />;
    case "page-break":
      return <PageBreakEditor block={block} onUpdate={onUpdate} />;
    case "footer":
      return <FooterEditor block={block} onUpdate={onUpdate} />;
    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}

// Block Editor Implementations
function HeaderBlockEditor({ block, onUpdate }) {
  // Ensure the logo path is always set
  React.useEffect(() => {
    if (!block.data.logoPath) {
      onUpdate("logoPath", "/FRC_Logo_FullWhite.png");
    }
    if (!block.data.headerText) {
      onUpdate("headerText", "Fundamental Research Corp.");
    }
  }, [block.data.logoPath, block.data.headerText, onUpdate]);

  return (
    <div className="space-y-4">
      {/* FRC Logo Preview - Always Present */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FRC Logo (Automatically Included)
        </label>
        <div className="bg-blue-900 p-4 rounded-md flex items-center justify-center">
          <img
            src="/FRC_Logo_FullWhite.png"
            alt="FRC Logo"
            className="h-12 object-contain"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          The FRC logo is automatically included in all reports and cannot be
          changed.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Header Text
        </label>
        <input
          type="text"
          value={block.data.headerText || "Fundamental Research Corp."}
          onChange={(e) => onUpdate("headerText", e.target.value)}
          placeholder="Fundamental Research Corp."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          You can customize the header text, but it will default to "Fundamental
          Research Corp."
        </p>
      </div>
    </div>
  );
}

function TitleMetadataEditor({ block, onUpdate }) {
  // Initialize tickers array if it doesn't exist
  const tickers = block.data.tickers || [
    { exchange: "", symbol: "", isPrimary: true },
  ];

  const addTicker = () => {
    const newTickers = [
      ...tickers,
      { exchange: "", symbol: "", isPrimary: false },
    ];
    onUpdate("tickers", newTickers);
  };

  const removeTicker = (index) => {
    if (tickers.length > 1) {
      const newTickers = tickers.filter((_, i) => i !== index);
      onUpdate("tickers", newTickers);
    }
  };

  const updateTicker = (index, field, value) => {
    const newTickers = [...tickers];
    newTickers[index] = { ...newTickers[index], [field]: value };

    // If setting as primary, unset others
    if (field === "isPrimary" && value) {
      newTickers.forEach((ticker, i) => {
        if (i !== index) ticker.isPrimary = false;
      });
    }

    onUpdate("tickers", newTickers);
  };

  return (
    <div className="space-y-6">
      {/* Company Basic Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📊 Company Information
        </h3>
        <p className="text-sm text-blue-600">
          Enter the company name, sector, and report details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={block.data.companyName || ""}
            onChange={(e) => onUpdate("companyName", e.target.value)}
            placeholder="Kidoz Inc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector
          </label>
          <input
            type="text"
            value={block.data.sector || ""}
            onChange={(e) => onUpdate("sector", e.target.value)}
            placeholder="Ad Tech"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stock Ticker Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-green-800">
            📈 Stock Ticker Information
          </h3>
          <button
            type="button"
            onClick={addTicker}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            + Add Ticker
          </button>
        </div>
        <p className="text-sm text-green-600 mb-4">
          Add all stock exchanges where the company is listed. Mark one as
          primary.
        </p>

        <div className="space-y-3">
          {tickers.map((ticker, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-white rounded-md border"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Exchange
                </label>
                <input
                  type="text"
                  value={ticker.exchange || ""}
                  onChange={(e) =>
                    updateTicker(
                      index,
                      "exchange",
                      e.target.value.toUpperCase()
                    )
                  }
                  placeholder="NYSE, NASDAQ, TSX, etc."
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  value={ticker.symbol || ""}
                  onChange={(e) =>
                    updateTicker(index, "symbol", e.target.value.toUpperCase())
                  }
                  placeholder="KDOZ"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Listing
                </label>
                <div className="flex items-center h-8">
                  <input
                    type="checkbox"
                    checked={ticker.isPrimary || false}
                    onChange={(e) =>
                      updateTicker(index, "isPrimary", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Primary</span>
                </div>
              </div>
              <div className="flex items-end">
                {tickers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicker(index)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Title/Subtitle
        </label>
        <input
          type="text"
          value={block.data.reportTitle || ""}
          onChange={(e) => onUpdate("reportTitle", e.target.value)}
          placeholder="Q2 Revenue Softens, H1 Hits Record; Tailwinds Ahead"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Rating and Valuation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          🎯 Investment Rating & Valuation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <select
              value={block.data.rating || ""}
              onChange={(e) => onUpdate("rating", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Rating</option>
              <option value="STRONG BUY">STRONG BUY</option>
              <option value="BUY">BUY</option>
              <option value="HOLD">HOLD</option>
              <option value="SELL">SELL</option>
              <option value="STRONG SELL">STRONG SELL</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fair Value *
            </label>
            <input
              type="number"
              step="0.01"
              value={block.data.targetPrice || ""}
              onChange={(e) => onUpdate("targetPrice", e.target.value)}
              placeholder="0.70"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price
            </label>
            <input
              type="number"
              step="0.01"
              value={block.data.currentPrice || ""}
              onChange={(e) => onUpdate("currentPrice", e.target.value)}
              placeholder="0.22"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Rating (1-5)
            </label>
            <select
              value={block.data.risk || ""}
              onChange={(e) => onUpdate("risk", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Risk</option>
              <option value="1">1 (Low Risk)</option>
              <option value="2">2</option>
              <option value="3">3 (Medium)</option>
              <option value="4">4</option>
              <option value="5">5 (High Risk)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Report Date
        </label>
        <input
          type="date"
          value={block.data.date || new Date().toISOString().split("T")[0]}
          onChange={(e) => onUpdate("date", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function ExecutiveSummaryEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          ✨ Highlights
        </h3>
        <p className="text-sm text-blue-600">
          Write the key investment highlights for your report. This will appear
          prominently in the PDF preview as bullet points in the highlights
          section.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Highlights Content
        </label>
        <FinancialTinyMCEEditor
          value={block.data.content || ""}
          onChange={(content) => onUpdate("content", content)}
          placeholder="Write your key investment highlights here... Use bullet points or numbered lists for best formatting. Include major catalysts, financial strengths, and competitive advantages."
          height={300}
        />
        <p className="text-xs text-gray-500 mt-2">
          This content will appear as the Highlights section in your report
          preview and PDF. Use bullet points for best visual impact.
        </p>
      </div>
    </div>
  );
}

function FinancialMetricsEditor({ block, onUpdate }) {
  const updateFinancialTableMetric = (metricIndex, valueIndex, value) => {
    const newData = { ...block.data };
    if (!newData.financialTable) {
      newData.financialTable = {
        title: "Key Financial Data (FYE - Dec 31)",
        currency: "US$",
        years: ["2023", "2024", "2025E", "2026E"],
        metrics: [],
      };
    }
    if (!newData.financialTable.metrics[metricIndex]) {
      newData.financialTable.metrics[metricIndex] = {
        name: "",
        values: ["", "", "", ""],
      };
    }
    newData.financialTable.metrics[metricIndex].values[valueIndex] = value;
    onUpdate("financialTable", newData.financialTable);
  };

  const updateFinancialTableMetricName = (metricIndex, name) => {
    const newData = { ...block.data };
    if (!newData.financialTable.metrics[metricIndex]) {
      newData.financialTable.metrics[metricIndex] = {
        name: "",
        values: ["", "", "", ""],
      };
    }
    newData.financialTable.metrics[metricIndex].name = name;
    onUpdate("financialTable", newData.financialTable);
  };

  const financialTable = block.data.financialTable || {
    title: "Key Financial Data (FYE - Dec 31)",
    currency: "US$",
    years: ["2023", "2024", "2025E", "2026E"],
    metrics: [
      { name: "Cash", values: ["", "", "", ""] },
      { name: "Working Capital", values: ["", "", "", ""] },
      { name: "Total Assets", values: ["", "", "", ""] },
      { name: "LT Debt to Capital", values: ["0.0%", "0.0%", "0.0%", "0.0%"] },
      { name: "Revenue", values: ["", "", "", ""] },
      { name: "Net Income", values: ["", "", "", ""] },
      { name: "EPS", values: ["", "", "", ""] },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Financial Table Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📊 Financial Data Table
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          This creates the main financial metrics table that appears in your
          report.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Title
              </label>
              <input
                type="text"
                value={financialTable.title}
                onChange={(e) => {
                  const newTable = { ...financialTable, title: e.target.value };
                  onUpdate("financialTable", newTable);
                }}
                placeholder="Key Financial Data (FYE - Dec 31)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={financialTable.currency}
                onChange={(e) => {
                  const newTable = {
                    ...financialTable,
                    currency: e.target.value,
                  };
                  onUpdate("financialTable", newTable);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="US$">US$</option>
                <option value="C$">C$</option>
                <option value="€">€</option>
                <option value="£">£</option>
              </select>
            </div>
          </div>

          {/* Years Header */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years/Periods
            </label>
            <div className="grid grid-cols-4 gap-2">
              {financialTable.years.map((year, index) => (
                <input
                  key={index}
                  type="text"
                  value={year}
                  onChange={(e) => {
                    const newYears = [...financialTable.years];
                    newYears[index] = e.target.value;
                    const newTable = { ...financialTable, years: newYears };
                    onUpdate("financialTable", newTable);
                  }}
                  placeholder={`Year ${index + 1}`}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium"
                />
              ))}
            </div>
          </div>

          {/* Financial Metrics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Metrics
            </label>
            <div className="space-y-2">
              {financialTable.metrics.map((metric, metricIndex) => (
                <div key={metricIndex} className="grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={metric.name}
                    onChange={(e) =>
                      updateFinancialTableMetricName(
                        metricIndex,
                        e.target.value
                      )
                    }
                    placeholder="Metric Name"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                  />
                  {metric.values.map((value, valueIndex) => (
                    <input
                      key={valueIndex}
                      type="text"
                      value={value}
                      onChange={(e) =>
                        updateFinancialTableMetric(
                          metricIndex,
                          valueIndex,
                          e.target.value
                        )
                      }
                      placeholder="Value"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalystNotesContentEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Analysis Content
        </label>
        <FinancialTinyMCEEditor
          value={block.data.content || ""}
          onChange={(content) => onUpdate("content", content)}
          placeholder="Write your detailed analysis here... Include investment thesis, financial analysis, competitive positioning, risks, and catalysts."
          height={400}
        />
      </div>
    </div>
  );
}

function SidebarContentEditor({ block, onUpdate }) {
  const updatePerformanceData = (index, field, value) => {
    const newData = [...(block.data.performanceData || [])];
    if (!newData[index]) {
      newData[index] = {
        period: "",
        stockSymbol: "",
        stockPerformance: "",
        indexName: "",
        indexPerformance: "",
      };
    }
    newData[index][field] = value;
    onUpdate("performanceData", newData);
  };

  const updateCompanyData = (field, value) => {
    const newData = { ...block.data.companyData };
    newData[field] = value;
    onUpdate("companyData", newData);
  };

  return (
    <div className="space-y-6">
      {/* Author Information Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
          👤 Author Information
        </h3>
        <p className="text-sm text-purple-600 mb-4">
          This appears in the top-right sidebar of the report.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Author Name *
            </label>
            <input
              type="text"
              value={block.data.authorName || ""}
              onChange={(e) => onUpdate("authorName", e.target.value)}
              placeholder="Sid Rajeev"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={block.data.authorTitle || ""}
              onChange={(e) => onUpdate("authorTitle", e.target.value)}
              placeholder="Head of Research"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credentials
          </label>
          <input
            type="text"
            value={block.data.authorCredentials || ""}
            onChange={(e) => onUpdate("authorCredentials", e.target.value)}
            placeholder="B.Tech, MBA, CFA"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Price & Volume Chart Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
          📈 Price & Volume Chart
        </h3>
        <p className="text-sm text-blue-600 mb-4">
          Chart title and image for the price/volume section.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={block.data.chartTitle || ""}
              onChange={(e) => onUpdate("chartTitle", e.target.value)}
              placeholder="Price and Volume (1-year)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chart Image URL (Optional)
            </label>
            <input
              type="text"
              value={block.data.chartImageUrl || ""}
              onChange={(e) => onUpdate("chartImageUrl", e.target.value)}
              placeholder="https://example.com/chart.png or /images/price-chart.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to show placeholder chart
            </p>
          </div>

          {block.data.chartImageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Chart Preview:
              </p>
              <div className="border border-gray-300 rounded-md p-2 bg-gray-50">
                <img
                  src={block.data.chartImageUrl}
                  alt="Price Chart Preview"
                  className="max-w-full h-auto max-h-32 object-contain mx-auto"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div className="text-center text-gray-500 text-sm hidden">
                  Chart image could not be loaded
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Data Table Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
          📊 Performance Data Table
        </h3>
        <p className="text-sm text-green-600 mb-4">
          Stock vs index performance data that appears below the chart.
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2 text-sm font-medium text-gray-700">
            <div>Period</div>
            <div>Stock Symbol</div>
            <div>Stock %</div>
            <div>Index Name</div>
            <div>Index %</div>
          </div>

          {(block.data.performanceData || []).map((data, index) => (
            <div key={index} className="grid grid-cols-5 gap-2">
              <input
                type="text"
                value={data.period}
                onChange={(e) =>
                  updatePerformanceData(index, "period", e.target.value)
                }
                placeholder="YTD"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                type="text"
                value={data.stockSymbol}
                onChange={(e) =>
                  updatePerformanceData(index, "stockSymbol", e.target.value)
                }
                placeholder="ZEPP"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                type="text"
                value={data.stockPerformance}
                onChange={(e) =>
                  updatePerformanceData(
                    index,
                    "stockPerformance",
                    e.target.value
                  )
                }
                placeholder="124%"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                type="text"
                value={data.indexName}
                onChange={(e) =>
                  updatePerformanceData(index, "indexName", e.target.value)
                }
                placeholder="NYSE"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <input
                type="text"
                value={data.indexPerformance}
                onChange={(e) =>
                  updatePerformanceData(
                    index,
                    "indexPerformance",
                    e.target.value
                  )
                }
                placeholder="9%"
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Company Data Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
          🏢 Company Data
        </h3>
        <p className="text-sm text-orange-600 mb-4">
          Key company metrics that appear in the bottom-right sidebar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              52-Week Range
            </label>
            <input
              type="text"
              value={block.data.companyData?.weekRange || ""}
              onChange={(e) => updateCompanyData("weekRange", e.target.value)}
              placeholder="US$2.12-43.93"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shares Outstanding
            </label>
            <input
              type="text"
              value={block.data.companyData?.sharesOS || ""}
              onChange={(e) => updateCompanyData("sharesOS", e.target.value)}
              placeholder="14.4M"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Market Cap
            </label>
            <input
              type="text"
              value={block.data.companyData?.marketCap || ""}
              onChange={(e) => updateCompanyData("marketCap", e.target.value)}
              placeholder="US$570M"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yield (Forward)
            </label>
            <input
              type="text"
              value={block.data.companyData?.yieldForward || ""}
              onChange={(e) =>
                updateCompanyData("yieldForward", e.target.value)
              }
              placeholder="N/A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              P/E (Forward)
            </label>
            <input
              type="text"
              value={block.data.companyData?.peForward || ""}
              onChange={(e) => updateCompanyData("peForward", e.target.value)}
              placeholder="N/A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              P/B Ratio
            </label>
            <input
              type="text"
              value={block.data.companyData?.pbRatio || ""}
              onChange={(e) => updateCompanyData("pbRatio", e.target.value)}
              placeholder="2.5x"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Chart Block Coming Soon
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Interactive chart functionality is being developed. For now, you
              can add chart images using the Image Block.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Title
          </label>
          <input
            type="text"
            value={block.data.title || ""}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder="Revenue Growth Chart"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </label>
          <select
            value={block.data.chartType || ""}
            onChange={(e) => onUpdate("chartType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function DataTableEditor({ block, onUpdate }) {
  const addRow = () => {
    const newRows = [
      ...(block.data.rows || []),
      new Array(block.data.headers?.length || 4).fill(""),
    ];
    onUpdate("rows", newRows);
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...(block.data.headers || [])];
    newHeaders[index] = value;
    onUpdate("headers", newHeaders);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...(block.data.rows || [])];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    onUpdate("rows", newRows);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Table Title
        </label>
        <input
          type="text"
          value={block.data.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Financial Metrics Table"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Headers
        </label>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {(
            block.data.headers || ["Metric", "Value", "Previous", "Change"]
          ).map((header, index) => (
            <input
              key={index}
              type="text"
              value={header}
              onChange={(e) => updateHeader(index, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Table Data
          </label>
          <button
            onClick={addRow}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add Row
          </button>
        </div>

        <div className="space-y-2">
          {(block.data.rows || [["", "", "", ""]]).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 md:grid-cols-4 gap-2"
            >
              {row.map((cell, colIndex) => (
                <input
                  key={colIndex}
                  type="text"
                  value={cell}
                  onChange={(e) =>
                    updateCell(rowIndex, colIndex, e.target.value)
                  }
                  placeholder={`Row ${rowIndex + 1}, Col ${colIndex + 1}`}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          type="text"
          value={block.data.url || ""}
          onChange={(e) => onUpdate("url", e.target.value)}
          placeholder="https://example.com/chart.png or /images/chart.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Caption
        </label>
        <input
          type="text"
          value={block.data.caption || ""}
          onChange={(e) => onUpdate("caption", e.target.value)}
          placeholder="Figure 1: Revenue growth over time"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text (for accessibility)
        </label>
        <input
          type="text"
          value={block.data.alt || ""}
          onChange={(e) => onUpdate("alt", e.target.value)}
          placeholder="Chart showing 15% revenue growth"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {block.data.url && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <img
              src={block.data.url}
              alt={block.data.alt || "Preview"}
              className="max-w-full h-auto max-h-64 object-contain mx-auto"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <div className="text-center text-gray-500 text-sm hidden">
              Image could not be loaded. Please check the URL.
            </div>
            {block.data.caption && (
              <p className="text-sm text-gray-600 text-center mt-2 italic">
                {block.data.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TextContentEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Content
        </label>
        <textarea
          value={block.data.content || ""}
          onChange={(e) => onUpdate("content", e.target.value)}
          placeholder="Enter plain text content here..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function PageBreakEditor({ block, onUpdate }) {
  return (
    <div className="text-center py-8">
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <Bars3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Page Break</h3>
        <p className="text-gray-600">
          This will force a new page in the PDF output.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          No configuration needed for this block.
        </p>
      </div>
    </div>
  );
}

function PriceChartEditor({ block, onUpdate }) {
  const updatePerformanceData = (index, field, value) => {
    const newData = [...(block.data.performanceData || [])];
    if (!newData[index]) {
      newData[index] = { period: "", stock: "", index: "" };
    }
    newData[index][field] = value;
    onUpdate("performanceData", newData);
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Price Chart Block
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Configure the stock performance data. Chart visualization will be
              generated automatically.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chart Title
        </label>
        <input
          type="text"
          value={block.data.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          placeholder="Price and Volume (1-year)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Performance Data
        </label>
        <div className="space-y-2">
          {(
            block.data.performanceData || [
              { period: "YTD", stock: "", index: "" },
              { period: "12M", stock: "", index: "" },
            ]
          ).map((data, index) => (
            <div key={index} className="grid grid-cols-3 gap-4">
              <input
                type="text"
                value={data.period}
                onChange={(e) =>
                  updatePerformanceData(index, "period", e.target.value)
                }
                placeholder="Period"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={data.stock}
                onChange={(e) =>
                  updatePerformanceData(index, "stock", e.target.value)
                }
                placeholder="Stock % (e.g., 50%)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={data.index}
                onChange={(e) =>
                  updatePerformanceData(index, "index", e.target.value)
                }
                placeholder="Index % (e.g., 13%)"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FooterEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          📄 Report Footer
        </h3>
        <p className="text-sm text-gray-600">
          Standard FRC footer with disclaimers and copyright information.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Disclaimer Text
        </label>
        <textarea
          value={block.data.disclaimer || ""}
          onChange={(e) => onUpdate("disclaimer", e.target.value)}
          placeholder="Important disclosures and risk definitions on last page."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Copyright Text
        </label>
        <input
          type="text"
          value={block.data.copyright || ""}
          onChange={(e) => onUpdate("copyright", e.target.value)}
          placeholder="©2025 Fundamental Research Corp. '22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront'"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <input
          type="text"
          value={block.data.website || ""}
          onChange={(e) => onUpdate("website", e.target.value)}
          placeholder="www.researchfrc.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function PDFLayoutView({ blocks, onGeneratePDF, reportData }) {
  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Ready to Export Professional PDF
        </h3>
        <p className="text-gray-600 mb-4">
          Your report is formatted with Wall Street-grade professional standards
          and ready for distribution.
        </p>
        <button
          onClick={onGeneratePDF}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium flex items-center mx-auto"
        >
          <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
          Generate Professional PDF
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium text-gray-900 mb-2">PDF Export Features:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <ul className="space-y-1">
            <li>• Professional Wall Street-style formatting</li>
            <li>• Automated page sizing (Letter/A4/Legal)</li>
            <li>• Institutional-quality typography</li>
            <li>• Print-optimized layout</li>
          </ul>
          <ul className="space-y-1">
            <li>• Rich text formatting preserved</li>
            <li>• Professional tables and charts</li>
            <li>• FRC branding and footer</li>
            <li>• Rating colors and highlighting</li>
          </ul>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
          <h4 className="font-medium text-gray-900">Live Preview</h4>
        </div>
        <div
          className="p-4"
          style={{ transform: "scale(0.7)", transformOrigin: "top left" }}
        >
          <PDFReportLayout
            reportData={reportData}
            onGeneratePDF={onGeneratePDF}
            isPreviewMode={true}
          />
        </div>
      </div>
    </div>
  );
}
