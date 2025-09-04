"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  TableCellsIcon,
  CodeBracketIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

// Free Professional Document Editor Component
export default function FreeDocumentEditor({
  value = "",
  onChange,
  placeholder = "Start writing your professional document...",
  height = 400,
  className = "",
  readOnly = false,
}) {
  const editorRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [viewMode, setViewMode] = useState("editor"); // editor, preview, split

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
      updateCounts();
    }
  }, [value]);

  // Update word and character counts
  const updateCounts = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || "";
      setCharacterCount(text.length);
      setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
    }
  };

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateCounts();
    }
  };

  // Execute document commands
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  // Check if command is active
  const isCommandActive = (command) => {
    return document.queryCommandState(command);
  };

  // Insert custom content
  const insertContent = (html) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const fragment = range.createContextualFragment(html);
        range.insertNode(fragment);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      handleInput();
    }
  };

  // Insert table
  const insertTable = () => {
    const rows = prompt("Number of rows:", "3");
    const cols = prompt("Number of columns:", "3");
    if (rows && cols) {
      let tableHTML =
        '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 16px 0;">';
      tableHTML += "<thead><tr>";
      for (let j = 0; j < cols; j++) {
        tableHTML +=
          '<th style="background-color: #f3f4f6; font-weight: bold; text-align: left;">Header</th>';
      }
      tableHTML += "</tr></thead><tbody>";
      for (let i = 0; i < rows - 1; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < cols; j++) {
          tableHTML += "<td>Cell content</td>";
        }
        tableHTML += "</tr>";
      }
      tableHTML += "</tbody></table>";
      insertContent(tableHTML);
    }
  };

  // Insert link
  const insertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      const text = window.getSelection().toString() || url;
      insertContent(
        `<a href="${url}" style="color: #2563eb; text-decoration: underline;">${text}</a>`
      );
    }
  };

  // Insert image
  const insertImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      insertContent(
        `<img src="${url}" alt="Image" style="max-width: 100%; height: auto; margin: 8px 0;" />`
      );
    }
  };

  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    title,
    command,
    value,
    active,
    onClick,
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick || (() => execCommand(command, value))}
      className={`p-2 rounded-md transition-all duration-200 ${
        active
          ? "bg-blue-500 text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className={`border border-gray-300 rounded-lg bg-white ${className}`}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <div className="border-b border-gray-200 p-3">
          <div className="flex flex-wrap items-center gap-1">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 mr-4">
              <ToolbarButton
                icon={BoldIcon}
                title="Bold (Ctrl+B)"
                command="bold"
                active={isCommandActive("bold")}
              />
              <ToolbarButton
                icon={ItalicIcon}
                title="Italic (Ctrl+I)"
                command="italic"
                active={isCommandActive("italic")}
              />
              <ToolbarButton
                icon={UnderlineIcon}
                title="Underline (Ctrl+U)"
                command="underline"
                active={isCommandActive("underline")}
              />
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 mr-4 border-l border-gray-300 pl-4">
              <ToolbarButton
                icon={ListBulletIcon}
                title="Bullet List"
                command="insertUnorderedList"
                active={isCommandActive("insertUnorderedList")}
              />
              <ToolbarButton
                icon={NumberedListIcon}
                title="Numbered List"
                command="insertOrderedList"
                active={isCommandActive("insertOrderedList")}
              />
            </div>

            {/* Formatting */}
            <div className="flex items-center gap-1 mr-4 border-l border-gray-300 pl-4">
              <select
                onChange={(e) => execCommand("formatBlock", e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                defaultValue=""
              >
                <option value="">Format</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="p">Paragraph</option>
                <option value="blockquote">Quote</option>
              </select>

              <select
                onChange={(e) => execCommand("fontName", e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                defaultValue=""
              >
                <option value="">Font</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>

              <input
                type="color"
                title="Text Color"
                onChange={(e) => execCommand("foreColor", e.target.value)}
                className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            {/* Insert Content */}
            <div className="flex items-center gap-1 mr-4 border-l border-gray-300 pl-4">
              <ToolbarButton
                icon={LinkIcon}
                title="Insert Link"
                onClick={insertLink}
              />
              <ToolbarButton
                icon={PhotoIcon}
                title="Insert Image"
                onClick={insertImage}
              />
              <ToolbarButton
                icon={TableCellsIcon}
                title="Insert Table"
                onClick={insertTable}
              />
            </div>

            {/* View Options */}
            <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
              <button
                type="button"
                onClick={() =>
                  setViewMode(viewMode === "editor" ? "preview" : "editor")
                }
                className={`p-2 rounded-md transition-all duration-200 ${
                  viewMode === "preview"
                    ? "bg-green-500 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                title={viewMode === "editor" ? "Preview" : "Edit"}
              >
                {viewMode === "editor" ? (
                  <EyeIcon className="h-4 w-4" />
                ) : (
                  <DocumentTextIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="relative">
        {viewMode === "editor" && !readOnly ? (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={() => setIsActive(true)}
            onBlur={() => setIsActive(false)}
            className={`w-full p-4 outline-none resize-none overflow-auto ${
              isActive ? "ring-2 ring-blue-500 ring-opacity-20" : ""
            }`}
            style={{
              minHeight: `${height}px`,
              fontFamily: "Times New Roman, Times, serif",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
            data-placeholder={placeholder}
          />
        ) : (
          <div
            className="w-full p-4 bg-gray-50 border-l-4 border-blue-500"
            style={{
              minHeight: `${height}px`,
              fontFamily: "Times New Roman, Times, serif",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
            dangerouslySetInnerHTML={{ __html: value || placeholder }}
          />
        )}

        {/* Placeholder styling */}
        <style jsx>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            font-style: italic;
          }
        `}</style>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 text-xs text-gray-600 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span>Words: {wordCount}</span>
          <span>Characters: {characterCount}</span>
          <span className={`${isActive ? "text-green-600" : "text-gray-500"}`}>
            {isActive ? "● Editing" : "○ Ready"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowToolbar(!showToolbar)}
            className="text-gray-500 hover:text-gray-700"
            title={showToolbar ? "Hide Toolbar" : "Show Toolbar"}
          >
            {showToolbar ? "Hide Toolbar" : "Show Toolbar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Professional Document Editor with Predefined Templates
export function ProfessionalDocumentEditor({
  value,
  onChange,
  template = "research-report",
  ...props
}) {
  const [selectedTemplate, setSelectedTemplate] = useState(template);

  const templates = {
    "research-report": {
      name: "Research Report",
      content: `<h1>Executive Summary</h1>
<p>Provide a compelling investment thesis and key highlights here.</p>

<h2>Company Overview</h2>
<p>Brief description of the company, its business model, and market position.</p>

<h2>Financial Analysis</h2>
<p>Key financial metrics and performance indicators.</p>

<h2>Investment Thesis</h2>
<ul>
<li><strong>Growth Drivers:</strong> Identify key catalysts for growth</li>
<li><strong>Competitive Advantages:</strong> Describe sustainable competitive moats</li>
<li><strong>Market Opportunity:</strong> Quantify the addressable market</li>
</ul>

<h2>Risks</h2>
<ul>
<li>Market risk factors</li>
<li>Company-specific risks</li>
<li>Regulatory considerations</li>
</ul>

<h2>Conclusion</h2>
<p>Investment recommendation and price target rationale.</p>`,
    },
    "executive-summary": {
      name: "Executive Summary",
      content: `<h1>Executive Summary</h1>
<p><strong>Investment Recommendation:</strong> [BUY/HOLD/SELL]</p>
<p><strong>Price Target:</strong> $[X.XX]</p>
<p><strong>Current Price:</strong> $[X.XX]</p>

<h2>Key Investment Points</h2>
<ul>
<li>Point 1: Brief description</li>
<li>Point 2: Brief description</li>
<li>Point 3: Brief description</li>
</ul>

<h2>Financial Highlights</h2>
<p>Recent financial performance and key metrics.</p>`,
    },
    blank: {
      name: "Blank Document",
      content: "",
    },
  };

  const applyTemplate = (templateKey) => {
    const template = templates[templateKey];
    if (template && onChange) {
      onChange(template.content);
      setSelectedTemplate(templateKey);
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <label className="text-sm font-medium text-gray-700">Template:</label>
        <select
          value={selectedTemplate}
          onChange={(e) => applyTemplate(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(templates).map(([key, template]) => (
            <option key={key} value={key}>
              {template.name}
            </option>
          ))}
        </select>
        <div className="flex-1"></div>
        <span className="text-xs text-gray-500">
          💡 Free Professional Document Editor - No limitations
        </span>
      </div>

      {/* Editor */}
      <FreeDocumentEditor value={value} onChange={onChange} {...props} />
    </div>
  );
}

// Export both components
export { FreeDocumentEditor };

// Research Report Builder with Direct PDF Export
export function ResearchReportBuilder({
  onSave,
  onExportPDF,
  initialData = {},
}) {
  const [reportData, setReportData] = useState({
    companyName: "",
    ticker: "",
    rating: "BUY",
    currentPrice: "",
    targetPrice: "",
    date: new Date().toISOString().split("T")[0],
    executiveSummary: "",
    content: "",
    ...initialData,
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Generate HTML for PDF export
  const generatePDFHTML = () => {
    const ratingColor =
      reportData.rating === "BUY"
        ? "#16a34a"
        : reportData.rating === "HOLD"
        ? "#eab308"
        : "#dc2626";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${reportData.companyName} - Research Report</title>
    <style>
        @page {
            size: Letter;
            margin: 0.75in 0.5in;
        }
        
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #003366;
            padding-bottom: 10pt;
            margin-bottom: 20pt;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
        }
        
        .frc-logo {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 8pt 12pt;
            font-weight: bold;
            font-size: 10pt;
            border-radius: 4pt;
            margin-right: 15pt;
        }
        
        .company-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20pt;
        }
        
        .company-info h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #1e40af;
            margin: 0 0 5pt 0;
        }
        
        .ticker {
            font-size: 12pt;
            color: #666;
            margin: 0;
        }
        
        .rating-box {
            text-align: center;
            min-width: 120pt;
        }
        
        .rating {
            background: ${ratingColor};
            color: white;
            padding: 8pt 16pt;
            font-weight: bold;
            font-size: 14pt;
            border-radius: 4pt;
            display: inline-block;
            margin-bottom: 8pt;
        }
        
        .price-info {
            font-size: 10pt;
            line-height: 1.3;
        }
        
        .content-section {
            margin-bottom: 24pt;
        }
        
        .content-section h2 {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4pt;
            margin-bottom: 12pt;
        }
        
        .content-section h3 {
            font-size: 12pt;
            font-weight: bold;
            color: #374151;
            margin-bottom: 8pt;
        }
        
        .executive-summary {
            background: #f8fafc;
            border-left: 4pt solid #1e40af;
            padding: 12pt;
            margin-bottom: 20pt;
        }
        
        .financial-metrics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12pt;
            margin: 20pt 0;
        }
        
        .metric-card {
            border: 1px solid #e5e7eb;
            padding: 8pt;
            text-align: center;
            border-radius: 4pt;
        }
        
        .metric-label {
            font-size: 9pt;
            color: #666;
            margin-bottom: 4pt;
        }
        
        .metric-value {
            font-size: 12pt;
            font-weight: bold;
            color: #1e40af;
        }
        
        .footer {
            border-top: 1px solid #ddd;
            padding-top: 12pt;
            margin-top: 30pt;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 16pt 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 6pt 8pt;
            text-align: left;
        }
        
        th {
            background: #f3f4f6;
            font-weight: bold;
        }
        
        ul, ol {
            margin: 8pt 0;
            padding-left: 20pt;
        }
        
        li {
            margin-bottom: 4pt;
        }
        
        .highlight-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 12pt;
            margin: 16pt 0;
            border-radius: 4pt;
        }
        
        .risk-warning {
            background: #fef2f2;
            border: 1px solid #ef4444;
            padding: 12pt;
            margin: 16pt 0;
            border-radius: 4pt;
        }
    </style>
</head>
<body>
    <!-- Page 1: Cover & Summary -->
    <div class="header">
        <div class="logo-section">
            <div class="frc-logo">
                Fundamental<br>Research<br>Corp.
            </div>
            <div>
                <strong>Research Report</strong><br>
                <span style="font-size: 10pt; color: #666;">Professional Investment Analysis</span>
            </div>
        </div>
        <div style="text-align: right; color: #666; font-size: 11pt;">
            ${new Date(reportData.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
        </div>
    </div>
    
    <div class="company-header">
        <div class="company-info">
            <h1>${reportData.companyName || "Company Name"}</h1>
            <p class="ticker">${
              reportData.ticker ? `(${reportData.ticker})` : "(TICKER)"
            }</p>
        </div>
        <div class="rating-box">
            <div class="rating">${reportData.rating}</div>
            <div class="price-info">
                <div><strong>Current:</strong> $${
                  reportData.currentPrice || "0.00"
                }</div>
                <div><strong>Target:</strong> $${
                  reportData.targetPrice || "0.00"
                }</div>
                <div><strong>Upside:</strong> ${
                  reportData.currentPrice && reportData.targetPrice
                    ? (
                        ((parseFloat(reportData.targetPrice) -
                          parseFloat(reportData.currentPrice)) /
                          parseFloat(reportData.currentPrice)) *
                        100
                      ).toFixed(1)
                    : "0.0"
                }%</div>
            </div>
        </div>
    </div>
    
    ${
      reportData.executiveSummary
        ? `
    <div class="executive-summary">
        <h2 style="margin-top: 0; border: none; color: #1e40af;">Executive Summary</h2>
        <div>${reportData.executiveSummary}</div>
    </div>
    `
        : ""
    }
    
    <div class="content-section">
        <h2>Investment Analysis</h2>
        <div>${
          reportData.content ||
          "<p>Detailed investment analysis will appear here...</p>"
        }</div>
    </div>
    
    <div class="footer">
        <div style="margin-bottom: 8pt;">
            <strong>Important Disclosures:</strong> This report is for informational purposes only. 
            Past performance does not guarantee future results. See full disclaimers on final page.
        </div>
        <div>
            ©${new Date().getFullYear()} Fundamental Research Corp. | www.researchfrc.com | 
            "22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront"
        </div>
    </div>
</body>
</html>`;
  };

  // Export to PDF using browser's print functionality
  const exportToPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      // Create a new window with the formatted HTML
      const printWindow = window.open("", "_blank");
      const htmlContent = generatePDFHTML();

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          setIsGeneratingPDF(false);
        }, 500);
      };

      if (onExportPDF) {
        onExportPDF(reportData);
      }
    } catch (error) {
      console.error("PDF export failed:", error);
      setIsGeneratingPDF(false);
    }
  };

  // Alternative: Export HTML file for manual PDF conversion
  const exportToHTML = () => {
    const htmlContent = generatePDFHTML();
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportData.companyName || "Research-Report"}-${
      reportData.date
    }.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const updateReportData = (field, value) => {
    setReportData((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BuildingOfficeIcon },
    { id: "financials", name: "Financials", icon: ChartBarIcon },
    { id: "content", name: "Analysis", icon: DocumentTextIcon },
    { id: "export", name: "Export", icon: DocumentArrowDownIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              📊 Research Report Builder
            </h1>
            <p className="text-gray-600 mt-2">
              Create professional investment research reports with built-in PDF
              export
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToHTML}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Export HTML
            </button>
            <button
              onClick={exportToPDF}
              disabled={isGeneratingPDF}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Report Completion:</span>
            <span className="font-medium">
              {Math.round(
                (Object.values(reportData).filter(
                  (v) => v && v.toString().trim()
                ).length /
                  Object.keys(reportData).length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(
                  (Object.values(reportData).filter(
                    (v) => v && v.toString().trim()
                  ).length /
                    Object.keys(reportData).length) *
                    100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Company Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={reportData.companyName}
                  onChange={(e) =>
                    updateReportData("companyName", e.target.value)
                  }
                  placeholder="Apple Inc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Ticker *
                </label>
                <input
                  type="text"
                  value={reportData.ticker}
                  onChange={(e) =>
                    updateReportData("ticker", e.target.value.toUpperCase())
                  }
                  placeholder="AAPL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Date
                </label>
                <input
                  type="date"
                  value={reportData.date}
                  onChange={(e) => updateReportData("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Investment Rating
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <select
                  value={reportData.rating}
                  onChange={(e) => updateReportData("rating", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STRONG BUY">Strong Buy</option>
                  <option value="BUY">Buy</option>
                  <option value="HOLD">Hold</option>
                  <option value="SELL">Sell</option>
                  <option value="STRONG SELL">Strong Sell</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={reportData.currentPrice}
                    onChange={(e) =>
                      updateReportData("currentPrice", e.target.value)
                    }
                    placeholder="145.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={reportData.targetPrice}
                    onChange={(e) =>
                      updateReportData("targetPrice", e.target.value)
                    }
                    placeholder="175.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {reportData.currentPrice && reportData.targetPrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Price Analysis
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Upside Potential:</span>
                      <span className="font-medium">
                        {(
                          ((parseFloat(reportData.targetPrice) -
                            parseFloat(reportData.currentPrice)) /
                            parseFloat(reportData.currentPrice)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price Difference:</span>
                      <span className="font-medium">
                        $
                        {(
                          parseFloat(reportData.targetPrice) -
                          parseFloat(reportData.currentPrice)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "financials" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Metrics
            </h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                💡 <strong>Coming Soon:</strong> Interactive financial metrics
                input. For now, include financial data in your analysis content.
              </p>
            </div>
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Executive Summary
              </h3>
              <ProfessionalDocumentEditor
                value={reportData.executiveSummary}
                onChange={(content) =>
                  updateReportData("executiveSummary", content)
                }
                template="executive-summary"
                placeholder="Write a compelling executive summary highlighting your investment thesis, key financial metrics, and recommendation..."
                height={250}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Analysis
              </h3>
              <ProfessionalDocumentEditor
                value={reportData.content}
                onChange={(content) => updateReportData("content", content)}
                template="research-report"
                placeholder="Provide detailed investment analysis including company overview, financial analysis, growth drivers, risks, and conclusion..."
                height={500}
              />
            </div>
          </div>
        )}

        {activeTab === "export" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Export Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-green-600" />
                  PDF Export
                </h4>
                <p className="text-gray-600 mb-4">
                  Generate a professional PDF research report using your
                  browser's print functionality.
                </p>
                <button
                  onClick={exportToPDF}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? "Generating PDF..." : "Export to PDF"}
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-blue-600" />
                  HTML Export
                </h4>
                <p className="text-gray-600 mb-4">
                  Download formatted HTML file that can be converted to PDF
                  using any tool.
                </p>
                <button
                  onClick={exportToHTML}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                  Export to HTML
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <EyeIcon className="h-5 w-5 mr-2 text-purple-600" />
                Report Preview
              </h4>
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatePDFHTML() }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
