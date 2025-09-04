"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// Import Rich Text Editors
import TinyMCEEditor, {
  SimpleTinyMCEEditor,
  FinancialTinyMCEEditor,
} from "../../../../components/TinyMCEEditor";

// Import PDF Report Layout
import PDFReportLayout, {
  sampleReportData,
} from "../../../../components/PDFReportLayout";

// Block Types for Research Reports
const blockTypes = [
  {
    id: "header",
    name: "Header Section",
    icon: DocumentTextIcon,
    description: "FRC branding header with logo and company info",
  },
  {
    id: "title-metadata",
    name: "Title & Metadata",
    icon: ClipboardDocumentListIcon,
    description: "Report title, date, analyst, company details",
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    icon: DocumentTextIcon,
    description: "Key findings and investment thesis",
  },
  {
    id: "financial-metrics",
    name: "Financial Metrics",
    icon: CurrencyDollarIcon,
    description: "Key financial data and ratios",
  },
  {
    id: "analyst-notes-content",
    name: "Content + Analyst Notes",
    icon: ChatBubbleLeftRightIcon,
    description: "Main content with sidebar analyst commentary",
  },
  {
    id: "chart-block",
    name: "Chart Block",
    icon: ChartBarIcon,
    description: "Financial charts and visualizations",
  },
  {
    id: "data-table",
    name: "Data Table",
    icon: TableCellsIcon,
    description: "Financial tables and data",
  },
  {
    id: "image-block",
    name: "Image Block",
    icon: PhotoIcon,
    description: "Images, screenshots, diagrams",
  },
  {
    id: "text-content",
    name: "Rich Text",
    icon: DocumentTextIcon,
    description: "Rich text content block",
  },
  {
    id: "page-break",
    name: "Page Break",
    icon: Squares2X2Icon,
    description: "Force new page in PDF",
  },
];

// Mock categories for research reports
const mockCategories = [
  {
    id: "research-reports",
    name: "Research Reports",
    color: "blue",
    subcategories: [],
  },
  {
    id: "analysts-ideas",
    name: "Analysts' Ideas",
    color: "green",
    subcategories: [],
  },
  {
    id: "mining",
    name: "Mining",
    color: "amber",
    subcategories: [
      { id: "gold", name: "Gold", color: "yellow" },
      { id: "lithium", name: "Lithium", color: "purple" },
      { id: "copper", name: "Copper", color: "orange" },
    ],
  },
  {
    id: "tech",
    name: "Tech",
    color: "indigo",
    subcategories: [{ id: "crypto", name: "Crypto", color: "emerald" }],
  },
];

export default function BlockBasedReportEditor() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subcategory: "",
    status: "draft",
    tags: [],
  });

  const [reportBlocks, setReportBlocks] = useState([
    {
      id: "block-1",
      type: "header",
      data: {
        logoUrl: "/FRC_Logo_FullBlue.png",
        companyInfo: "FRC Capital Markets",
        reportType: "Equity Research Report",
      },
    },
    {
      id: "block-2",
      type: "title-metadata",
      data: {
        title: "",
        company: "",
        ticker: "",
        analyst: "",
        date: new Date().toISOString().split("T")[0],
        reportCategory: "Research Report",
        sector: "",
      },
    },
  ]);

  const [selectedBlock, setSelectedBlock] = useState(0);
  const [viewMode, setViewMode] = useState("editor"); // editor, preview, pdf, pdf-layout
  const [isSaving, setIsSaving] = useState(false);

  const addBlock = (blockType) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      data: getDefaultBlockData(blockType),
    };

    setReportBlocks((prev) => [...prev, newBlock]);
    setSelectedBlock(reportBlocks.length);
  };

  const getDefaultBlockData = (blockType) => {
    switch (blockType) {
      case "executive-summary":
        return {
          content: "",
          keyPoints: ["", "", ""],
          investmentThesis: "",
          rating: "BUY",
          priceTarget: "",
        };
      case "financial-metrics":
        return {
          currentPrice: "",
          fairValue: "",
          marketCap: "",
          peRatio: "",
          pbRatio: "",
          dividend: "",
          risk: "Medium",
        };
      case "analyst-notes-content":
        return {
          mainContent: "",
          analystNotes: "",
          sidebarTitle: "Analyst Commentary",
        };
      case "chart-block":
        return {
          title: "",
          chartType: "line",
          chartData: null,
          description: "",
        };
      case "data-table":
        return {
          title: "",
          headers: ["Metric", "Current", "Previous", "Change"],
          rows: [["", "", "", ""]],
          notes: "",
        };
      case "image-block":
        return {
          imageUrl: "",
          caption: "",
          altText: "",
          width: "100%",
        };
      case "text-content":
        return {
          content: "",
        };
      default:
        return {};
    }
  };

  const updateBlockData = (blockIndex, field, value) => {
    setReportBlocks((prev) =>
      prev.map((block, index) =>
        index === blockIndex
          ? { ...block, data: { ...block.data, [field]: value } }
          : block
      )
    );
  };

  const deleteBlock = (blockIndex) => {
    if (reportBlocks.length > 1) {
      setReportBlocks((prev) =>
        prev.filter((_, index) => index !== blockIndex)
      );
      setSelectedBlock(Math.max(0, selectedBlock - 1));
    }
  };

  const moveBlock = (fromIndex, toIndex) => {
    const newBlocks = [...reportBlocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setReportBlocks(newBlocks);
  };

  const handleSave = async (status = "draft") => {
    setIsSaving(true);
    try {
      const reportData = {
        ...formData,
        status,
        blocks: reportBlocks,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Date.now().toString(),
      };

      console.log("Saving block-based report:", reportData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Report saved successfully!");
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    console.log("Generating PDF with blocks:", reportBlocks);
    alert(
      "PDF generation will create professional report with controlled pagination"
    );
  };

  // Convert blocks to report data format for PDF layout with analyst commentary
  const convertBlocksToReportData = (blocks, metadata) => {
    const headerBlock = blocks.find((b) => b.type === "header");
    const titleBlock = blocks.find((b) => b.type === "title-metadata");
    const executiveBlock = blocks.find((b) => b.type === "executive-summary");
    const metricsBlock = blocks.find((b) => b.type === "financial-metrics");
    const analystBlock = blocks.find((b) => b.type === "analyst-notes-content");
    const dataTableBlocks = blocks.filter((b) => b.type === "data-table");

    // Extract highlights from analyst notes or executive summary
    const highlights = [];
    if (analystBlock?.data?.analystNotes) {
      // Parse HTML to extract bullet points
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = analystBlock.data.analystNotes;
      const listItems = tempDiv.querySelectorAll("li");
      listItems.forEach((li) => highlights.push(li.textContent));
    }

    // NEW: Extract analyst commentary from blocks
    const extractAnalystComments = () => {
      const comments = [];

      blocks.forEach((block, index) => {
        // Check for specific analyst commentary in rich text blocks
        if (block.type === "rich-text" && block.data?.content) {
          const content = block.data.content;
          const textContent = content.replace(/<[^>]*>/g, "").trim();

          // Look for investment thesis markers
          if (
            content.toLowerCase().includes("investment thesis") ||
            content.toLowerCase().includes("investment rationale")
          ) {
            comments.push({
              section: "investment-thesis",
              title: "Investment Thesis",
              text:
                textContent.substring(0, 200) +
                (textContent.length > 200 ? "..." : ""),
              reference: "Investment overview",
            });
          }

          // Look for risk markers
          else if (
            content.toLowerCase().includes("key risk") ||
            content.toLowerCase().includes("primary risk") ||
            content.toLowerCase().includes("risk factor")
          ) {
            comments.push({
              section: "risks",
              title: "Key Risks",
              text:
                textContent.substring(0, 200) +
                (textContent.length > 200 ? "..." : ""),
              reference: "Risk assessment",
            });
          }

          // Look for catalyst markers
          else if (
            content.toLowerCase().includes("catalyst") ||
            content.toLowerCase().includes("driver") ||
            content.toLowerCase().includes("tailwind")
          ) {
            comments.push({
              section: "catalysts",
              title: "Key Catalysts",
              text:
                textContent.substring(0, 200) +
                (textContent.length > 200 ? "..." : ""),
              reference: "Growth drivers",
            });
          }

          // Look for valuation markers
          else if (
            content.toLowerCase().includes("valuation") ||
            content.toLowerCase().includes("fair value") ||
            content.toLowerCase().includes("price target")
          ) {
            comments.push({
              section: "valuation",
              title: "Valuation",
              text:
                textContent.substring(0, 200) +
                (textContent.length > 200 ? "..." : ""),
              reference: "Valuation methodology",
            });
          }

          // Look for financial performance markers
          else if (
            content.toLowerCase().includes("financial performance") ||
            content.toLowerCase().includes("revenue") ||
            content.toLowerCase().includes("earnings")
          ) {
            comments.push({
              section: "financial-performance",
              title: "Financial Performance",
              text:
                textContent.substring(0, 200) +
                (textContent.length > 200 ? "..." : ""),
              reference: "Financial analysis",
            });
          }
        }

        // Extract from analyst notes content
        if (
          block.type === "analyst-notes-content" &&
          block.data?.analystNotes
        ) {
          const content = block.data.analystNotes;
          const textContent = content.replace(/<[^>]*>/g, "").trim();

          if (textContent.length > 50) {
            comments.push({
              section: "analyst-notes",
              title: "Analyst Commentary",
              text:
                textContent.substring(0, 250) +
                (textContent.length > 250 ? "..." : ""),
              reference: "Detailed analysis",
            });
          }
        }
      });

      // If no specific comments found, create default professional commentary
      if (comments.length === 0) {
        comments.push(
          {
            section: "investment-thesis",
            title: "Investment Thesis",
            text: "Our recommendation is based on strong fundamentals, competitive positioning, and attractive valuation metrics relative to industry peers.",
            reference: "Investment overview",
          },
          {
            section: "catalysts",
            title: "Key Catalysts",
            text: "Near-term catalysts include operational improvements, market expansion opportunities, and potential strategic developments.",
            reference: "Growth outlook",
          },
          {
            section: "risks",
            title: "Key Risks",
            text: "Primary risks include market volatility, competitive pressures, regulatory changes, and execution challenges.",
            reference: "Risk assessment",
          },
          {
            section: "valuation",
            title: "Valuation",
            text: "Our valuation approach considers multiple methodologies including DCF analysis, peer comparisons, and asset-based valuations.",
            reference: "Valuation methodology",
          }
        );
      }

      return comments.slice(0, 6); // Limit to 6 comments for sidebar space
    };

    // Parse tickers if in specific format
    const tickers = [];
    if (titleBlock?.data?.ticker) {
      const tickerString = titleBlock.data.ticker;
      // Handle formats like "KDOZ (TSXV), KDOZF (OTC)"
      const tickerMatches = tickerString.match(/([A-Z]+)\s*\(([^)]+)\)/g);
      if (tickerMatches) {
        tickerMatches.forEach((match) => {
          const [, symbol, exchange] = match.match(/([A-Z]+)\s*\(([^)]+)\)/);
          tickers.push({ symbol: symbol.trim(), exchange: exchange.trim() });
        });
      } else {
        // Simple format
        tickers.push({ symbol: tickerString, exchange: "N/A" });
      }
    }

    // Convert financial table data
    const financialTable = [];
    dataTableBlocks.forEach((block) => {
      if (block.data.headers && block.data.rows) {
        const headers = block.data.headers;
        block.data.rows.forEach((row) => {
          const rowObj = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index] || "";
          });
          financialTable.push(rowObj);
        });
      }
    });

    return {
      // Header data
      date:
        titleBlock?.data?.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),

      // Company info
      companyName: titleBlock?.data?.company || "Company Name",
      tickers:
        tickers.length > 0
          ? tickers
          : [{ symbol: "TICKER", exchange: "EXCHANGE" }],
      sector: titleBlock?.data?.sector || "Technology",

      // Rating and pricing
      rating: executiveBlock?.data?.rating || titleBlock?.data?.rating || "BUY",
      currentPrice:
        metricsBlock?.data?.currentPrice ||
        titleBlock?.data?.currentPrice ||
        "$0.00",
      fairValue:
        metricsBlock?.data?.fairValue || titleBlock?.data?.fairValue || "$0.00",
      risk: metricsBlock?.data?.risk || titleBlock?.data?.risk || "4",

      // Content
      title:
        titleBlock?.data?.title || metadata.title || "Research Report Title",
      highlights:
        highlights.length > 0
          ? highlights
          : [
              "Key financial metrics and performance indicators",
              "Investment thesis and strategic outlook",
              "Risk assessment and market positioning",
            ],
      analystInfo: {
        name:
          titleBlock?.data?.analyst ||
          titleBlock?.data?.analystName ||
          "Research Team",
        title: titleBlock?.data?.analystTitle || "Senior Research Analyst",
        credentials: titleBlock?.data?.analystCredentials || "CFA",
      },

      // NEW: Analyst commentary system
      analystComments: extractAnalystComments(),

      // Company data - from metrics block
      companyData: {
        weekRange: metricsBlock?.data?.weekRange || "N/A",
        sharesOS: metricsBlock?.data?.sharesOS || "N/A",
        marketCap: metricsBlock?.data?.marketCap || "N/A",
        yield: metricsBlock?.data?.dividend || "N/A",
        peForward: metricsBlock?.data?.peRatio || "N/A",
        pb: metricsBlock?.data?.pbRatio || "N/A",
        evEbitda: metricsBlock?.data?.evEbitda || "N/A",
      },

      // Financial table
      financialTable: financialTable,

      // HTML Content - Combine all text content blocks
      htmlContent: blocks
        .filter((block) => 
          block.type === "rich-text" || 
          block.type === "analyst-notes-content" ||
          block.type === "executive-summary"
        )
        .map((block) => {
          if (block.type === "rich-text") return block.data?.content || "";
          if (block.type === "analyst-notes-content") return block.data?.analystNotes || "";
          if (block.type === "executive-summary") return block.data?.summary || "";
          return "";
        })
        .filter(content => content.trim().length > 0)
        .join("<br/><br/>"),

      // Footer
      disclaimer:
        titleBlock?.data?.disclaimer ||
        "Important disclosures and risk definitions on last page. All figures in US$ unless otherwise specified.",
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
                Create Wall Street-grade research reports with ease - no formatting skills required
              </p>
              <div className="mt-3 flex items-center space-x-6 text-sm">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Auto-formatting
                </div>
                <div className="flex items-center text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Smart blocks
                </div>
                <div className="flex items-center text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Instant PDF
                </div>
              </div>
            </div>

            {/* View Mode Toggle - Mac Style */}
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "editor"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "preview"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("pdf-layout")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "pdf-layout"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  PDF Layout
                </button>
                <button
                  onClick={() => setViewMode("pdf")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    viewMode === "pdf"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Mac-style Quick Start Guide */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                🚀 Quick Start Guide
              </h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900">Company Info</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Start with "Title & Metadata" to set company name, ticker, and analyst details
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900">Financial Data</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Add "Financial Metrics" for price targets, ratios, and valuation data
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900">Write Analysis</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Use "Rich Text" blocks for analysis and "Data Tables" for financial data
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mr-3">
                    4
                  </div>
                  <h3 className="font-semibold text-gray-900">Export PDF</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Switch to "PDF Layout" and click "Generate PDF" when ready
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Left Sidebar - Block Structure */}
          <div className="col-span-3">
          <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Mac Style */}
          <div className="col-span-3">
            {/* Report Structure Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  📝 Report Structure
                  <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {reportBlocks.length} blocks
                  </span>
                </h3>
              </div>

              {/* Block List */}
              <div className="p-4">
                <div className="space-y-2 mb-6 max-h-80 overflow-y-auto">
                  {reportBlocks.map((block, index) => {
                    const blockType = blockTypes.find((t) => t.id === block.type);
                    return (
                      <div
                        key={block.id}
                        className={`group p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedBlock === index
                            ? "border-blue-300 bg-blue-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedBlock(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center min-w-0 flex-1">
                            {React.createElement(
                              blockType?.icon || DocumentTextIcon,
                              {
                                className: `h-5 w-5 mr-3 flex-shrink-0 ${
                                  selectedBlock === index ? "text-blue-600" : "text-gray-400"
                                }`,
                              }
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {blockType?.name || block.type}
                              </div>
                              <div className="text-xs text-gray-500">
                                Block {index + 1}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index > 0) moveBlock(index, index - 1);
                              }}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded"
                              title="Move up"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index < reportBlocks.length - 1)
                                  moveBlock(index, index + 1);
                              }}
                              disabled={index === reportBlocks.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 rounded"
                              title="Move down"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {reportBlocks.length > 2 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBlock(index);
                                }}
                                className="p-1 text-red-400 hover:text-red-600 rounded"
                                title="Delete block"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Block Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    ➕ Add New Block
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {blockTypes.map((blockType) => (
                      <button
                        key={blockType.id}
                        onClick={() => addBlock(blockType.id)}
                        className="group p-3 text-xs border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left"
                        title={blockType.description}
                      >
                        <div className="flex items-center">
                          {React.createElement(blockType.icon, {
                            className: "h-4 w-4 text-gray-400 group-hover:text-blue-600 mr-3 transition-colors",
                          })}
                          <div className="flex-1">
                            <div className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
                              {blockType.name}
                            </div>
                            <div className="text-gray-500 group-hover:text-blue-600 transition-colors mt-1">
                              {blockType.description}
                            </div>
                          </div>
                          <PlusIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  ⚙️ Report Settings
                </h3>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>📄 Report Title</span>
                    <span className="text-xs text-red-500">Required</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Q2 Earnings Beat, Strong Growth Outlook"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use action words like "Beats", "Soars", "Launches" for engaging titles
                  </p>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
                    <span>🏷️ Category</span>
                    <span className="text-xs text-blue-600">Optional</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select category</option>
                    {mockCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Progress Indicator */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                    <span className="font-medium">Report Completion</span>
                    <span className="font-semibold">{Math.round((reportBlocks.filter(block => 
                      Object.values(block.data).some(value => 
                        typeof value === 'string' ? value.trim() : value
                      )
                    ).length / reportBlocks.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{
                        width: `${Math.round((reportBlocks.filter(block => 
                          Object.values(block.data).some(value => 
                            typeof value === 'string' ? value.trim() : value
                          )
                        ).length / reportBlocks.length) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete {reportBlocks.length - reportBlocks.filter(block => 
                      Object.values(block.data).some(value => 
                        typeof value === 'string' ? value.trim() : value
                      )
                    ).length} more blocks for a comprehensive report
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {viewMode === "editor" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        {React.createElement(currentBlockType?.icon || DocumentTextIcon, {
                          className: "h-6 w-6 mr-3 text-blue-600",
                        })}
                        Block {selectedBlock + 1}: {currentBlockType?.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {currentBlockType?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Block {selectedBlock + 1} of {reportBlocks.length}</div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedBlock(Math.max(0, selectedBlock - 1))}
                          disabled={selectedBlock === 0}
                          className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed bg-white rounded-md border border-gray-300 hover:bg-gray-50 transition-all"
                          title="Previous block"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => setSelectedBlock(Math.min(reportBlocks.length - 1, selectedBlock + 1))}
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
                  <h2 className="text-xl font-semibold text-gray-900">Report Preview</h2>
                </div>
                <ReportPreview blocks={reportBlocks} />
              </div>
            )}

            {viewMode === "pdf-layout" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">PDF Layout Preview</h2>
                </div>
                <PDFReportLayout
                  reportData={convertBlocksToReportData(reportBlocks, formData)}
                  onGeneratePDF={generatePDF}
                />
              </div>
            )}

            {viewMode === "pdf" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Export PDF</h2>
                </div>
                <div className="p-6">
                  <PDFLayoutView
                    blocks={reportBlocks}
                    onGeneratePDF={generatePDF}
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
                        <span className="w-4 h-4 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">1</span>
                        Fill "Title & Metadata" with company info
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-green-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">2</span>
                        Add "Financial Metrics" for price data
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-purple-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">3</span>
                        Use "Rich Text" blocks for analysis
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">4</span>
                        Switch to "PDF Layout" to preview
                      </li>
                      <li className="flex items-start">
                        <span className="w-4 h-4 bg-red-500 text-white rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 font-bold">5</span>
                        Click "Generate PDF" when ready
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Block Types</h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li>• <strong>Title & Metadata:</strong> Company basics</li>
                      <li>• <strong>Financial Metrics:</strong> Price/valuation</li>
                      <li>• <strong>Rich Text:</strong> Analysis content</li>
                      <li>• <strong>Data Table:</strong> Financial tables</li>
                      <li>• <strong>Chart Block:</strong> Visual data</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tips</h4>
                    <ul className="text-gray-700 space-y-1 text-xs">
                      <li>• Use specific numbers and percentages</li>
                      <li>• Include timeframes (Q2 2024, FY2023)</li>
                      <li>• Add bullet points for key highlights</li>
                      <li>• Preview often in PDF Layout mode</li>
                      <li>• Save drafts frequently</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Report Quality</h4>
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
                  {Math.round((reportBlocks.filter(block => 
                    Object.values(block.data).some(value => 
                      typeof value === 'string' ? value.trim() : value
                    )
                  ).length / reportBlocks.length) * 100)}% Complete
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                    style={{
                      width: `${Math.round((reportBlocks.filter(block => 
                        Object.values(block.data).some(value => 
                          typeof value === 'string' ? value.trim() : value
                        )
                      ).length / reportBlocks.length) * 100)}%`
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
    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}

// Header Block Editor
function HeaderBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        FRC Header Configuration
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Info
          </label>
          <input
            type="text"
            value={block.data.companyInfo || ""}
            onChange={(e) => onUpdate("companyInfo", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="FRC Capital Markets"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <input
            type="text"
            value={block.data.reportType || ""}
            onChange={(e) => onUpdate("reportType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Equity Research Report"
          />
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h4 className="font-semibold text-blue-900">Header Preview</h4>
            <p className="text-sm text-blue-700">{block.data.companyInfo}</p>
            <p className="text-xs text-blue-600">{block.data.reportType}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Title & Metadata Editor
function TitleMetadataEditor({ block, onUpdate }) {
  const [showTips, setShowTips] = useState(true);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          📋 Report Title & Company Information
        </h3>
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showTips ? '🙈 Hide Tips' : '💡 Show Tips'}
        </button>
      </div>

      {showTips && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">✨ Writing Tips</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>📝 <strong>Great Title Examples:</strong> "Q2 Revenue Beats, Guidance Raised", "Acquisition Accelerates Growth Strategy"</li>
            <li>🎯 <strong>Ticker Format:</strong> Use "AAPL (NASDAQ)" or "AAPL (NASDAQ), AAPL.DE (XETRA)" for multiple exchanges</li>
            <li>👤 <strong>Analyst Format:</strong> "John Smith, CFA" or "Jane Doe, B.Sc, MBA, CFA"</li>
            <li>🏢 <strong>Sector Examples:</strong> "Technology", "Healthcare", "Financial Services", "Consumer Discretionary"</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📝 Report Title</span>
            <span className="text-xs text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={block.data.title || ""}
            onChange={(e) => onUpdate("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Q2 Revenue Softens, H1 Hits Record; Tailwinds Ahead"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Use action words and specific metrics for engaging titles
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>🏢 Company Name</span>
            <span className="text-xs text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={block.data.company || ""}
            onChange={(e) => onUpdate("company", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Kidoz Inc."
          />
          <p className="text-xs text-gray-500 mt-1">
            📊 Enter the full legal company name
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📈 Ticker Symbols</span>
            <span className="text-xs text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={block.data.ticker || ""}
            onChange={(e) => onUpdate("ticker", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="KDOZ (TSXV), KDOZF (OTC)"
          />
          <p className="text-xs text-gray-500 mt-1">
            💼 <strong>Format:</strong> SYMBOL (EXCHANGE), SYMBOL2 (EXCHANGE2)
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>👤 Analyst Name</span>
            <span className="text-xs text-blue-600">Optional</span>
          </label>
          <input
            type="text"
            value={block.data.analyst || ""}
            onChange={(e) => onUpdate("analyst", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="Sid Rajeev, B.Tech, MBA, CFA"
          />
          <p className="text-xs text-gray-500 mt-1">
            🎓 Include credentials: CFA, MBA, etc.
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📅 Report Date</span>
            <span className="text-xs text-green-600">Auto-filled</span>
          </label>
          <input
            type="date"
            value={block.data.date || ""}
            onChange={(e) => onUpdate("date", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            📊 Date when report was created
          </p>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          <span>🏭 Sector</span>
          <span className="text-xs text-blue-600">Optional but recommended</span>
        </label>
        <input
          type="text"
          value={block.data.sector || ""}
          onChange={(e) => onUpdate("sector", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Technology"
          list="sector-suggestions"
        />
        <datalist id="sector-suggestions">
          <option value="Technology" />
          <option value="Healthcare" />
          <option value="Financial Services" />
          <option value="Consumer Discretionary" />
          <option value="Consumer Staples" />
          <option value="Energy" />
          <option value="Materials" />
          <option value="Industrials" />
          <option value="Utilities" />
          <option value="Real Estate" />
          <option value="Communication Services" />
        </datalist>
        <p className="text-xs text-gray-500 mt-1">
          📋 Industry classification helps readers understand the company context
        </p>
      </div>

      {/* Enhanced Preview */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
          👁️ Live Preview - How it appears in your report
        </h4>
        <div className="bg-white p-4 rounded border shadow-sm">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {block.data.company || "Company Name"} {block.data.ticker && `(${block.data.ticker.split(',')[0].trim()})`}
          </div>
          <div className="text-base font-semibold text-blue-800 mb-2">
            {block.data.title || "Report Title"}
          </div>
          <div className="text-xs text-gray-600 grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Sector:</span> {block.data.sector || "N/A"}
            </div>
            <div>
              <span className="font-medium">Date:</span> {block.data.date ? new Date(block.data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not set"}
            </div>
            <div>
              <span className="font-medium">Analyst:</span> {block.data.analyst || "Not specified"}
            </div>
            <div>
              <span className="font-medium">Tickers:</span> {block.data.ticker || "Not specified"}
            </div>
          </div>
        </div>
        {(!block.data.company || !block.data.title || !block.data.ticker) && (
          <div className="mt-2 text-xs text-amber-700 bg-amber-100 p-2 rounded">
            ⚠️ <strong>Missing required fields:</strong> Please fill out Company Name, Report Title, and Ticker Symbols for a complete report.
          </div>
        )}
      </div>
    </div>
  );
}

// Executive Summary Editor
function ExecutiveSummaryEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Executive Summary</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Summary Content
        </label>
        <FinancialTinyMCEEditor
          value={block.data.content || ""}
          onChange={(content) => onUpdate("content", content)}
          placeholder="Executive summary of the research report..."
          height={250}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Investment Thesis
          </label>
          <SimpleTinyMCEEditor
            value={block.data.investmentThesis || ""}
            onChange={(content) => onUpdate("investmentThesis", content)}
            placeholder="Investment thesis and rationale..."
            height={150}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating & Price Target
          </label>
          <div className="space-y-2">
            <select
              value={block.data.rating || "BUY"}
              onChange={(e) => onUpdate("rating", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="BUY">BUY</option>
              <option value="HOLD">HOLD</option>
              <option value="SELL">SELL</option>
            </select>
            <input
              type="text"
              value={block.data.priceTarget || ""}
              onChange={(e) => onUpdate("priceTarget", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Price Target: $150.00"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Financial Metrics Editor
function FinancialMetricsEditor({ block, onUpdate }) {
  const [showTips, setShowTips] = useState(true);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          💰 Financial Metrics & Valuation
        </h3>
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showTips ? '🙈 Hide Tips' : '💡 Show Tips'}
        </button>
      </div>

      {showTips && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <h4 className="text-sm font-semibold text-green-900 mb-2">📊 Financial Data Guidelines</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>💵 <strong>Prices:</strong> Use currency symbols: "$150.50", "€45.20", "¥1,250"</li>
            <li>📈 <strong>Market Cap:</strong> Use abbreviations: "$2.5B", "$150M", "$45.2T"</li>
            <li>📊 <strong>Ratios:</strong> Include "x" for multiples: "25.5x", "1.8x", "N/A" for not applicable</li>
            <li>💎 <strong>Risk Levels:</strong> 1=Very Low, 2=Low, 3=Moderate, 4=High, 5=Very High</li>
            <li>📋 <strong>Percentages:</strong> Include % symbol: "2.5%", "0.0%" for no dividend</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📊 Current Price</span>
            <span className="text-xs text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={block.data.currentPrice || ""}
            onChange={(e) => onUpdate("currentPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="$145.50"
          />
          <p className="text-xs text-gray-500 mt-1">
            💰 Latest trading price with currency
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>🎯 Fair Value</span>
            <span className="text-xs text-red-500">Required</span>
          </label>
          <input
            type="text"
            value={block.data.fairValue || ""}
            onChange={(e) => onUpdate("fairValue", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="$160.00"
          />
          <p className="text-xs text-gray-500 mt-1">
            🔍 Your price target / valuation
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>🏢 Market Cap</span>
            <span className="text-xs text-blue-600">Recommended</span>
          </label>
          <input
            type="text"
            value={block.data.marketCap || ""}
            onChange={(e) => onUpdate("marketCap", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="$2.3B"
          />
          <p className="text-xs text-gray-500 mt-1">
            📈 Total market value (B=Billion, M=Million)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📊 P/E Ratio</span>
            <span className="text-xs text-blue-600">Optional</span>
          </label>
          <input
            type="text"
            value={block.data.peRatio || ""}
            onChange={(e) => onUpdate("peRatio", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="25.5x"
          />
          <p className="text-xs text-gray-500 mt-1">
            📈 Price-to-Earnings multiple
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>📋 P/B Ratio</span>
            <span className="text-xs text-blue-600">Optional</span>
          </label>
          <input
            type="text"
            value={block.data.pbRatio || ""}
            onChange={(e) => onUpdate("pbRatio", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="8.2x"
          />
          <p className="text-xs text-gray-500 mt-1">
            📊 Price-to-Book multiple
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>💎 Dividend Yield</span>
            <span className="text-xs text-blue-600">Optional</span>
          </label>
          <input
            type="text"
            value={block.data.dividend || ""}
            onChange={(e) => onUpdate("dividend", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="2.5%"
          />
          <p className="text-xs text-gray-500 mt-1">
            💰 Annual dividend as % of price
          </p>
        </div>
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <span>⚠️ Risk Level</span>
            <span className="text-xs text-orange-600">Important</span>
          </label>
          <select
            value={block.data.risk || "3"}
            onChange={(e) => onUpdate("risk", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1 - Very Low</option>
            <option value="2">2 - Low</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - High</option>
            <option value="5">5 - Very High</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            🎯 Investment risk assessment
          </p>
        </div>
      </div>

      {/* Additional Financial Metrics */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
          📋 Additional Company Data
          <span className="ml-2 text-xs text-gray-500">(Used in company data section)</span>
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📈 52-Week Range
            </label>
            <input
              type="text"
              value={block.data.weekRange || ""}
              onChange={(e) => onUpdate("weekRange", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="$12.50 - $185.20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Shares Outstanding
            </label>
            <input
              type="text"
              value={block.data.sharesOS || ""}
              onChange={(e) => onUpdate("sharesOS", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="14.4M"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💼 EV/EBITDA
            </label>
            <input
              type="text"
              value={block.data.evEbitda || ""}
              onChange={(e) => onUpdate("evEbitda", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="15.2x"
            />
          </div>
        </div>
      </div>

      {/* Metrics Preview */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
        <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
          👁️ Financial Data Preview
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Current Price", value: block.data.currentPrice, icon: "📊" },
            { label: "Fair Value", value: block.data.fairValue, icon: "🎯" },
            { label: "Market Cap", value: block.data.marketCap, icon: "🏢" },
            { label: "P/E Ratio", value: block.data.peRatio, icon: "📈" },
            { label: "P/B Ratio", value: block.data.pbRatio, icon: "📋" },
            { label: "Dividend", value: block.data.dividend, icon: "💎" },
            { label: "Risk Level", value: block.data.risk ? `${block.data.risk}/5` : "", icon: "⚠️" },
          ]
            .filter((item) => item.value)
            .map((item, index) => (
              <div key={index} className="bg-white p-2 rounded border shadow-sm text-center">
                <div className="text-xs text-gray-600 mb-1">{item.icon} {item.label}</div>
                <div className="text-sm font-semibold text-gray-900">
                  {item.value}
                </div>
              </div>
            ))}
        </div>
        {(!block.data.currentPrice || !block.data.fairValue) && (
          <div className="mt-3 text-xs text-amber-700 bg-amber-100 p-2 rounded">
            ⚠️ <strong>Tip:</strong> Current Price and Fair Value are required for the rating box in your report.
          </div>
        )}
      </div>
    </div>
  );
}

// Analyst Notes + Content Editor (Key Feature!)
function AnalystNotesContentEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Content with Analyst Commentary
      </h3>
      <p className="text-sm text-gray-600">
        This creates the two-column layout: main content on the right, analyst
        notes on the left sidebar
      </p>

      <div className="grid grid-cols-3 gap-6">
        {/* Analyst Notes (Left Sidebar) */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Analyst Commentary (Left Sidebar)
          </label>
          <input
            type="text"
            value={block.data.sidebarTitle || ""}
            onChange={(e) => onUpdate("sidebarTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            placeholder="Sidebar Title"
          />
          <SimpleTinyMCEEditor
            value={block.data.analystNotes || ""}
            onChange={(content) => onUpdate("analystNotes", content)}
            placeholder="Analyst commentary and notes that will appear in the left sidebar..."
            height={300}
          />
        </div>

        {/* Main Content (Right Side) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Content (Right Side)
          </label>
          <FinancialTinyMCEEditor
            value={block.data.mainContent || ""}
            onChange={(content) => onUpdate("mainContent", content)}
            placeholder="Main content that will appear on the right side. This can include detailed analysis, charts, tables, and other content..."
            height={400}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Layout Preview
        </h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="col-span-1 bg-blue-50 p-2 rounded border">
            <div className="font-medium text-blue-900 mb-1">
              {block.data.sidebarTitle || "Analyst Commentary"}
            </div>
            <div className="text-blue-700">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    block.data.analystNotes?.substring(0, 100) + "..." ||
                    "No content yet...",
                }}
              />
            </div>
          </div>
          <div className="col-span-2 bg-white p-2 rounded border">
            <div className="text-gray-700">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    block.data.mainContent?.substring(0, 200) + "..." ||
                    "No content yet...",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart Block Editor
function ChartBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Chart Block</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Title
          </label>
          <input
            type="text"
            value={block.data.title || ""}
            onChange={(e) => onUpdate("title", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Revenue Growth Over Time"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chart Type
          </label>
          <select
            value={block.data.chartType || "line"}
            onChange={(e) => onUpdate("chartType", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="area">Area Chart</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chart Description
        </label>
        <SimpleTinyMCEEditor
          value={block.data.description || ""}
          onChange={(content) => onUpdate("description", content)}
          placeholder="Description of what this chart shows..."
          height={120}
        />
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-medium text-amber-900 mb-2">Chart Integration</h4>
        <p className="text-sm text-amber-800">
          Chart.js integration will be added here for interactive chart creation
          and data input.
        </p>
        <button className="mt-2 px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700">
          Create Chart
        </button>
      </div>
    </div>
  );
}

// Data Table Editor
function DataTableEditor({ block, onUpdate }) {
  const [showTips, setShowTips] = useState(true);

  const addRow = () => {
    const columnCount = (block.data.headers || []).length || 4;
    const newRow = new Array(columnCount).fill("");
    const newRows = [...(block.data.rows || []), newRow];
    onUpdate("rows", newRows);
  };

  const addColumn = () => {
    const newHeaders = [...(block.data.headers || []), "New Column"];
    const newRows = (block.data.rows || []).map((row) => [...row, ""]);
    onUpdate("headers", newHeaders);
    onUpdate("rows", newRows);
  };

  const removeRow = (rowIndex) => {
    const newRows = (block.data.rows || []).filter((_, index) => index !== rowIndex);
    onUpdate("rows", newRows);
  };

  const removeColumn = (colIndex) => {
    const newHeaders = (block.data.headers || []).filter((_, index) => index !== colIndex);
    const newRows = (block.data.rows || []).map((row) => 
      row.filter((_, index) => index !== colIndex)
    );
    onUpdate("headers", newHeaders);
    onUpdate("rows", newRows);
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const newRows = [...(block.data.rows || [])];
    if (!newRows[rowIndex]) newRows[rowIndex] = [];
    newRows[rowIndex][colIndex] = value;
    onUpdate("rows", newRows);
  };

  const updateHeader = (index, value) => {
    const newHeaders = [...(block.data.headers || [])];
    newHeaders[index] = value;
    onUpdate("headers", newHeaders);
  };

  // Preset table templates
  const applyTemplate = (templateType) => {
    let headers, rows;
    
    switch (templateType) {
      case 'financial':
        headers = ['Metric', 'Current Year', 'Previous Year', 'Change %'];
        rows = [
          ['Revenue ($M)', '', '', ''],
          ['Net Income ($M)', '', '', ''],
          ['EPS ($)', '', '', ''],
          ['EBITDA Margin (%)', '', '', '']
        ];
        break;
      case 'quarterly':
        headers = ['', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024'];
        rows = [
          ['Revenue ($M)', '', '', '', ''],
          ['EPS ($)', '', '', '', ''],
          ['Gross Margin (%)', '', '', '', '']
        ];
        break;
      case 'comparison':
        headers = ['Metric', 'Company', 'Peer Average', 'Industry'];
        rows = [
          ['P/E Ratio', '', '', ''],
          ['P/B Ratio', '', '', ''],
          ['ROE (%)', '', '', ''],
          ['Debt/Equity', '', '', '']
        ];
        break;
      default:
        return;
    }
    
    onUpdate("headers", headers);
    onUpdate("rows", rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          📊 Financial Data Table
        </h3>
        <button
          onClick={() => setShowTips(!showTips)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
        >
          {showTips ? '🙈 Hide Tips' : '💡 Show Tips'}
        </button>
      </div>

      {showTips && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
          <h4 className="text-sm font-semibold text-orange-900 mb-2">📋 Table Best Practices</h4>
          <ul className="text-xs text-orange-800 space-y-1">
            <li>💰 <strong>Numbers:</strong> Use consistent formatting: "$2.5M", "15.3%", "2.8x"</li>
            <li>📊 <strong>Headers:</strong> Be specific: "Revenue (USD Millions)" vs just "Revenue"</li>
            <li>📈 <strong>Comparisons:</strong> Include prior periods, estimates, or peer data</li>
            <li>🎯 <strong>Key Metrics:</strong> Focus on most important financial indicators</li>
            <li>📝 <strong>Notes:</strong> Add context below the table for assumptions or sources</li>
          </ul>
        </div>
      )}

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          <span>📝 Table Title</span>
          <span className="text-xs text-blue-600">Appears above the table</span>
        </label>
        <input
          type="text"
          value={block.data.title || ""}
          onChange={(e) => onUpdate("title", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Financial Summary (USD Millions)"
        />
      </div>

      {/* Table Templates */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          🚀 Quick Templates
          <span className="ml-2 text-xs text-gray-500">Click to use a preset table</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => applyTemplate('financial')}
            className="text-xs bg-blue-50 border border-blue-200 rounded p-2 hover:bg-blue-100 text-left"
          >
            💼 <strong>Financial Metrics</strong><br/>
            <span className="text-gray-600">Revenue, EPS, margins</span>
          </button>
          <button
            onClick={() => applyTemplate('quarterly')}
            className="text-xs bg-green-50 border border-green-200 rounded p-2 hover:bg-green-100 text-left"
          >
            📅 <strong>Quarterly Results</strong><br/>
            <span className="text-gray-600">Q1-Q4 performance</span>
          </button>
          <button
            onClick={() => applyTemplate('comparison')}
            className="text-xs bg-purple-50 border border-purple-200 rounded p-2 hover:bg-purple-100 text-left"
          >
            ⚖️ <strong>Peer Comparison</strong><br/>
            <span className="text-gray-600">vs. competitors</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">
            📊 Table Data
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={addColumn}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              ➕ Column
            </button>
            <button
              onClick={addRow}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              ➕ Row
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {(block.data.headers || []).map((header, index) => (
                  <th key={index} className="px-3 py-2 relative group">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(index, e.target.value)}
                      className="w-full text-xs font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                      placeholder={`Header ${index + 1}`}
                    />
                    {(block.data.headers || []).length > 1 && (
                      <button
                        onClick={() => removeColumn(index)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove column"
                      >
                        ×
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(block.data.rows || []).map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-gray-50">
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className="px-3 py-2 relative">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          updateCell(rowIndex, colIndex, e.target.value)
                        }
                        className="w-full text-xs text-gray-900 bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                        placeholder="Enter data"
                      />
                    </td>
                  ))}
                  {(block.data.rows || []).length > 1 && (
                    <td className="px-2 py-2">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 text-xs text-gray-500">
          💡 <strong>Tip:</strong> Click on cells to edit. Hover over headers/rows to see delete options.
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          <span>📝 Table Notes</span>
          <span className="text-xs text-gray-500">Optional context or sources</span>
        </label>
        <SimpleTinyMCEEditor
          value={block.data.notes || ""}
          onChange={(content) => onUpdate("notes", content)}
          placeholder="Add notes about data sources, assumptions, or methodology..."
          height={100}
        />
      </div>

      {/* Table Preview */}
      <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
          👁️ Table Preview
        </h4>
        {(block.data.headers || []).length > 0 && (block.data.rows || []).length > 0 ? (
          <div className="bg-white rounded border shadow-sm overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 border-b">
              <div className="text-sm font-semibold text-gray-900">
                {block.data.title || "Untitled Table"}
              </div>
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-700">
                {(block.data.headers || []).length} columns × {(block.data.rows || []).length} rows
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            Add headers and data to see preview
          </div>
        )}
      </div>
    </div>
  );
}

// Image Block Editor
function ImageBlockEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Image Block</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image Upload
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm text-gray-600 mb-2">Upload an image</p>
          <input
            type="file"
            accept="image/*"
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption
          </label>
          <input
            type="text"
            value={block.data.caption || ""}
            onChange={(e) => onUpdate("caption", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Image caption"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Width
          </label>
          <select
            value={block.data.width || "100%"}
            onChange={(e) => onUpdate("width", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="100%">Full Width</option>
            <option value="75%">75% Width</option>
            <option value="50%">50% Width</option>
            <option value="25%">25% Width</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Text Content Editor
function TextContentEditor({ block, onUpdate }) {
  const [showTips, setShowTips] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  
  const handleContentChange = (content) => {
    onUpdate("content", content);
    // Calculate word count
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
  };

  React.useEffect(() => {
    // Initialize word count
    const text = (block.data.content || '').replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    setWordCount(words);
  }, [block.data.content]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          📝 Rich Text Content
        </h3>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-500">
            📊 Words: {wordCount}
          </span>
          <button
            onClick={() => setShowTips(!showTips)}
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showTips ? '🙈 Hide Tips' : '💡 Show Tips'}
          </button>
        </div>
      </div>

      {showTips && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">✍️ Writing Best Practices</h4>
          <div className="grid grid-cols-2 gap-4 text-xs text-purple-800">
            <div>
              <h5 className="font-semibold mb-1">📊 Financial Content</h5>
              <ul className="space-y-1">
                <li>• Use specific numbers: "Revenue increased 23% to $2.1B"</li>
                <li>• Include timeframes: "Q2 2024", "FY2023"</li>
                <li>• Compare to estimates: "Beat consensus by $0.05"</li>
                <li>• Mention key metrics: EBITDA, gross margin, etc.</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-1">🎯 Investment Analysis</h5>
              <ul className="space-y-1">
                <li>• State clear investment thesis</li>
                <li>• Identify key catalysts and risks</li>
                <li>• Use bullet points for key highlights</li>
                <li>• Include competitive positioning</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Content Templates */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          📋 Quick Content Templates
          <span className="ml-2 text-xs text-gray-500">Click to insert</span>
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              const template = `<h3>Investment Thesis</h3>
<p>We maintain our <strong>BUY</strong> rating based on:</p>
<ul>
<li>Strong financial performance with revenue growth of XX%</li>
<li>Expanding market opportunities in [sector]</li>
<li>Attractive valuation at current levels</li>
</ul>`;
              handleContentChange((block.data.content || '') + template);
            }}
            className="text-xs bg-blue-50 border border-blue-200 rounded p-2 hover:bg-blue-100 text-left"
          >
            🎯 Investment Thesis
          </button>
          <button
            onClick={() => {
              const template = `<h3>Key Risks</h3>
<ul>
<li><strong>Market Risk:</strong> Exposure to market volatility</li>
<li><strong>Operational Risk:</strong> Execution challenges</li>
<li><strong>Regulatory Risk:</strong> Changes in regulation</li>
</ul>`;
              handleContentChange((block.data.content || '') + template);
            }}
            className="text-xs bg-red-50 border border-red-200 rounded p-2 hover:bg-red-100 text-left"
          >
            ⚠️ Risk Assessment
          </button>
          <button
            onClick={() => {
              const template = `<h3>Financial Highlights</h3>
<p><strong>Q2 2024 Results:</strong></p>
<ul>
<li>Revenue: $XXX million (+XX% YoY)</li>
<li>EBITDA: $XXX million (XX% margin)</li>
<li>EPS: $X.XX (vs. $X.XX consensus)</li>
</ul>`;
              handleContentChange((block.data.content || '') + template);
            }}
            className="text-xs bg-green-50 border border-green-200 rounded p-2 hover:bg-green-100 text-left"
          >
            📊 Financial Results
          </button>
          <button
            onClick={() => {
              const template = `<h3>Catalysts</h3>
<ul>
<li><strong>Near-term:</strong> Product launch in Q4</li>
<li><strong>Medium-term:</strong> Market expansion</li>
<li><strong>Long-term:</strong> Strategic partnerships</li>
</ul>`;
              handleContentChange((block.data.content || '') + template);
            }}
            className="text-xs bg-yellow-50 border border-yellow-200 rounded p-2 hover:bg-yellow-100 text-left"
          >
            🚀 Growth Catalysts
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
          <span>📝 Content</span>
          <span className="text-xs text-gray-500">
            Rich text editor with professional features
          </span>
        </label>
        <TinyMCEEditor
          value={block.data.content || ""}
          onChange={handleContentChange}
          placeholder="Start writing your analysis here... Use the templates above for structured content, or the toolbar for formatting options."
          height={400}
        />
      </div>

      {/* Writing Guidelines */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <h4 className="font-medium text-green-900 mb-2 flex items-center">
          ✨ TinyMCE Professional Features
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-semibold text-green-800 mb-1">📝 Formatting Tools</h5>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• <strong>Headers:</strong> H1, H2, H3 for section organization</li>
              <li>• <strong>Lists:</strong> Bullet points and numbered lists</li>
              <li>• <strong>Tables:</strong> Financial data presentation</li>
              <li>• <strong>Links:</strong> Reference external sources</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-green-800 mb-1">🎯 Content Tips</h5>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Use <strong>bold</strong> for key metrics and conclusions</li>
              <li>• Organize with clear headings and subheadings</li>
              <li>• Include specific data points and percentages</li>
              <li>• Keep paragraphs concise for readability</li>
            </ul>
          </div>
        </div>
        
        {wordCount > 0 && (
          <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
            📊 <strong>Content Stats:</strong> {wordCount} words 
            {wordCount > 500 && <span className="text-green-700"> - Great length for detailed analysis!</span>}
            {wordCount < 100 && <span className="text-amber-700"> - Consider adding more detail for comprehensive coverage</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Page Break Editor
function PageBreakEditor({ block, onUpdate }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Page Break</h3>
      <div className="p-4 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg text-center">
        <Squares2X2Icon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          This will create a page break in the PDF output
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Content after this block will start on a new page
        </p>
      </div>
    </div>
  );
}

// Report Preview Component
function ReportPreview({ blocks }) {
  return (
    <div
      className="p-8 max-w-4xl mx-auto"
      style={{ minHeight: "800px", backgroundColor: "white" }}
    >
      {blocks.map((block, index) => (
        <div key={block.id} className="mb-8">
          <BlockPreview block={block} />
        </div>
      ))}
    </div>
  );
}

function BlockPreview({ block }) {
  switch (block.type) {
    case "header":
      return (
        <div
          className="text-white p-6 rounded-lg mb-6"
          style={{ backgroundColor: "#1a2c45" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {block.data.companyInfo || "FRC Capital Markets"}
              </h1>
              <p className="text-blue-200">
                {block.data.reportType || "Equity Research Report"}
              </p>
            </div>
            <div className="text-right">
              <img
                src="/FRC_Logo_FullWhite.png"
                alt="FRC Logo"
                className="h-8"
              />
            </div>
          </div>
        </div>
      );

    case "title-metadata":
      return (
        <div className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {block.data.title}
          </h1>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p>
                <strong>Company:</strong> {block.data.company}
              </p>
              <p>
                <strong>Ticker:</strong> {block.data.ticker}
              </p>
            </div>
            <div>
              <p>
                <strong>Analyst:</strong> {block.data.analyst}
              </p>
              <p>
                <strong>Date:</strong> {block.data.date}
              </p>
            </div>
          </div>
        </div>
      );

    case "executive-summary":
      return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            Executive Summary
          </h2>
          <div className="prose text-gray-700 mb-4">
            <div
              dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
            />
          </div>
          {block.data.investmentThesis && (
            <div className="mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                Investment Thesis
              </h3>
              <div className="text-gray-700">
                <div
                  dangerouslySetInnerHTML={{
                    __html: block.data.investmentThesis,
                  }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                block.data.rating === "BUY"
                  ? "bg-green-100 text-green-800"
                  : block.data.rating === "HOLD"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {block.data.rating || "BUY"}
            </span>
            {block.data.priceTarget && (
              <span className="text-gray-700 font-medium">
                {block.data.priceTarget}
              </span>
            )}
          </div>
        </div>
      );

    case "financial-metrics":
      return (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Financial Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Current Price", value: block.data.currentPrice },
              { label: "Fair Value", value: block.data.fairValue },
              { label: "Market Cap", value: block.data.marketCap },
              { label: "P/E Ratio", value: block.data.peRatio },
              { label: "P/B Ratio", value: block.data.pbRatio },
              { label: "Dividend Yield", value: block.data.dividend },
              { label: "Risk Level", value: block.data.risk },
            ]
              .filter((item) => item.value)
              .map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {item.value}
                  </div>
                </div>
              ))}
          </div>
        </div>
      );

    case "analyst-notes-content":
      return (
        <div className="grid grid-cols-4 gap-6 mb-6">
          {/* Left Sidebar - Analyst Notes */}
          <div className="col-span-1 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">
              {block.data.sidebarTitle || "Analyst Commentary"}
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div
                dangerouslySetInnerHTML={{
                  __html: block.data.analystNotes || "",
                }}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-3">
            <div className="prose max-w-none text-gray-700">
              <div
                dangerouslySetInnerHTML={{
                  __html: block.data.mainContent || "",
                }}
              />
            </div>
          </div>
        </div>
      );

    case "chart-block":
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {block.data.title}
          </h3>
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Chart: {block.data.chartType || "Line Chart"}
            </p>
            {block.data.description && (
              <div className="text-sm text-gray-500 mt-2">
                <div
                  dangerouslySetInnerHTML={{ __html: block.data.description }}
                />
              </div>
            )}
          </div>
        </div>
      );

    case "data-table":
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {block.data.title}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  {(block.data.headers || []).map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(block.data.rows || []).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.data.notes && (
            <div className="text-sm text-gray-600 mt-2">
              <div dangerouslySetInnerHTML={{ __html: block.data.notes }} />
            </div>
          )}
        </div>
      );

    case "image-block":
      return (
        <div className="mb-6 text-center">
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 inline-block">
            <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Image Block</p>
            {block.data.caption && (
              <p className="text-sm text-gray-500 mt-2">{block.data.caption}</p>
            )}
          </div>
        </div>
      );

    case "text-content":
      return (
        <div className="mb-6">
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: block.data.content || "" }}
            />
          </div>
        </div>
      );

    case "page-break":
      return (
        <div className="mb-6 py-4">
          <div className="border-t-2 border-dashed border-gray-300 relative">
            <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
              Page Break
            </span>
          </div>
        </div>
      );

    default:
      return <div>Unknown block type: {block.type}</div>;
  }
}

// PDF Layout View Component
function PDFLayoutView({ blocks, onGeneratePDF }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          PDF Layout Preview
        </h2>
        <button
          onClick={onGeneratePDF}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
          Generate Professional PDF
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            PDF Output Features
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Professional FRC branding and letterhead</li>
            <li>• Controlled pagination with page breaks</li>
            <li>• Two-column layouts for analyst commentary</li>
            <li>• High-quality charts and tables</li>
            <li>• Consistent margins and typography</li>
            <li>• Headers, footers, and page numbers</li>
          </ul>
        </div>

        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="border border-gray-300 p-4 rounded-lg bg-gray-50"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">
                Block {index + 1}:{" "}
                {blockTypes.find((t) => t.id === block.type)?.name}
              </span>
              <span className="text-sm text-gray-500">
                {block.type === "page-break"
                  ? "Forces new page"
                  : "Continues on current page"}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Type: {block.type} | Data fields: {Object.keys(block.data).length}
            </div>
            {block.type === "analyst-notes-content" && (
              <div className="mt-2 text-xs text-blue-600">
                ⚡ Two-column layout: Analyst notes (left) + Main content
                (right)
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">
          Ready for Professional Output
        </h3>
        <p className="text-sm text-green-800">
          This report structure matches institutional research report standards
          with controlled pagination, professional branding, and the exact
          layout shown in your reference PDF.
        </p>
      </div>
    </div>
  );
}
