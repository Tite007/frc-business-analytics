"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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

const blockTypes = [
  {
    id: "header",
    name: "FRC Header",
    description: "Standard FRC branding header",
    icon: BookmarkIcon,
    template: { logoPath: "", headerText: "FRC Research" },
  },
  {
    id: "title-metadata",
    name: "Title & Metadata",
    description: "Company name, ticker, rating, and target price",
    icon: DocumentTextIcon,
    template: {
      companyName: "",
      ticker: "",
      rating: "",
      targetPrice: "",
      currentPrice: "",
      date: new Date().toLocaleDateString(),
    },
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "Key highlights and investment thesis",
    icon: ClipboardDocumentListIcon,
    template: { content: "" },
  },
  {
    id: "financial-metrics",
    name: "Financial Metrics",
    description: "Key financial data and ratios",
    icon: ChartBarIcon,
    template: {
      revenue: "",
      netIncome: "",
      eps: "",
      peRatio: "",
      pbRatio: "",
      roe: "",
      debt: "",
      marketCap: "",
    },
  },
  {
    id: "analyst-notes-content",
    name: "Rich Text Block",
    description: "Professional analysis content with rich formatting",
    icon: NewspaperIcon,
    template: { content: "" },
  },
  {
    id: "chart-block",
    name: "Chart Block",
    description: "Interactive charts and visualizations",
    icon: ChartBarIcon,
    template: {
      chartType: "line",
      title: "",
      data: [],
      xAxis: "",
      yAxis: "",
    },
  },
  {
    id: "data-table",
    name: "Data Table",
    description: "Financial tables and structured data",
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
    id: "text-content",
    name: "Text Content",
    description: "Plain text content block",
    icon: DocumentIcon,
    template: { content: "" },
  },
  {
    id: "page-break",
    name: "Page Break",
    description: "Force new page in PDF output",
    icon: Bars3Icon,
    template: {},
  },
];

export default function BlockBasedReportEditor() {
  const [reportBlocks, setReportBlocks] = useState([
    { id: "header-1", type: "header", data: blockTypes[0].template },
    {
      id: "title-1",
      type: "title-metadata",
      data: blockTypes[1].template,
    },
    {
      id: "summary-1",
      type: "executive-summary",
      data: blockTypes[2].template,
    },
    {
      id: "metrics-1",
      type: "financial-metrics",
      data: blockTypes[3].template,
    },
    {
      id: "content-1",
      type: "analyst-notes-content",
      data: blockTypes[4].template,
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
    const newBlock = {
      id: `${type}-${Date.now()}`,
      type,
      data: { ...blockType.template },
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

  const generatePDF = () => {
    console.log("Generating PDF...", reportBlocks);
  };

  const convertBlocksToReportData = (blocks, metadata) => {
    return {
      blocks,
      metadata,
      createdAt: new Date().toISOString(),
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBlock(index);
                            }}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
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
                </div>
                <ReportPreview blocks={reportBlocks} />
              </div>
            )}

            {viewMode === "pdf-layout" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    PDF Layout Preview
                  </h2>
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    Export PDF
                  </h2>
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

// Placeholder components - you'll need to implement these
function HeaderBlockEditor({ block, onUpdate }) {
  return <div className="p-4">Header Block Editor - Implement me!</div>;
}

function TitleMetadataEditor({ block, onUpdate }) {
  return <div className="p-4">Title Metadata Editor - Implement me!</div>;
}

function ExecutiveSummaryEditor({ block, onUpdate }) {
  return <div className="p-4">Executive Summary Editor - Implement me!</div>;
}

function FinancialMetricsEditor({ block, onUpdate }) {
  return <div className="p-4">Financial Metrics Editor - Implement me!</div>;
}

function AnalystNotesContentEditor({ block, onUpdate }) {
  return (
    <div className="p-4">Analyst Notes Content Editor - Implement me!</div>
  );
}

function ChartBlockEditor({ block, onUpdate }) {
  return <div className="p-4">Chart Block Editor - Implement me!</div>;
}

function DataTableEditor({ block, onUpdate }) {
  return <div className="p-4">Data Table Editor - Implement me!</div>;
}

function ImageBlockEditor({ block, onUpdate }) {
  return <div className="p-4">Image Block Editor - Implement me!</div>;
}

function TextContentEditor({ block, onUpdate }) {
  return <div className="p-4">Text Content Editor - Implement me!</div>;
}

function PageBreakEditor({ block, onUpdate }) {
  return <div className="p-4">Page Break Editor - Implement me!</div>;
}

function ReportPreview({ blocks }) {
  return <div className="p-4">Report Preview - Implement me!</div>;
}

function PDFReportLayout({ reportData, onGeneratePDF }) {
  return <div className="p-4">PDF Report Layout - Implement me!</div>;
}

function PDFLayoutView({ blocks, onGeneratePDF }) {
  return <div className="p-4">PDF Layout View - Implement me!</div>;
}
