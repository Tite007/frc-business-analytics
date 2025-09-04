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
} from "@heroicons/react/24/outline";

// Mock categories data (same as in other components)
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

// Page templates for PDF generation
const pageTemplates = [
  {
    id: "cover-page",
    name: "Cover Page",
    description: "Professional report cover with branding",
    icon: DocumentTextIcon,
    fields: ["title", "subtitle", "author", "date", "company"],
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    description: "Key findings and recommendations",
    icon: DocumentTextIcon,
    fields: ["content", "key-metrics", "rating"],
  },
  {
    id: "financial-analysis",
    name: "Financial Analysis",
    description: "Financial tables and metrics",
    icon: TableCellsIcon,
    fields: ["content", "financial-table", "charts"],
  },
  {
    id: "charts-data",
    name: "Charts & Data",
    description: "Visual data representation",
    icon: ChartBarIcon,
    fields: ["title", "charts", "data-tables", "commentary"],
  },
  {
    id: "content-page",
    name: "Content Page",
    description: "General content with rich formatting",
    icon: DocumentTextIcon,
    fields: ["content"],
  },
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function EnhancedCreateContentPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    status: "draft",
    tags: [],
    content: "",
    coverImage: null,
    attachments: [],
  });

  const [pages, setPages] = useState([
    {
      id: "page-1",
      template: "cover-page",
      title: "Cover Page",
      data: {
        title: "",
        subtitle: "",
        author: "",
        date: new Date().toISOString().split("T")[0],
        company: "",
      },
    },
  ]);

  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState("editor"); // editor, preview, pdf
  const [newTag, setNewTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Get available subcategories based on selected category
  const availableSubcategories = formData.category
    ? mockCategories.find((cat) => cat.id === formData.category)
        ?.subcategories || []
    : [];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handlePageDataChange = (pageIndex, field, value) => {
    setPages((prev) =>
      prev.map((page, index) =>
        index === pageIndex
          ? { ...page, data: { ...page.data, [field]: value } }
          : page
      )
    );
  };

  const addPage = (templateId) => {
    const template = pageTemplates.find((t) => t.id === templateId);
    const newPage = {
      id: `page-${Date.now()}`,
      template: templateId,
      title: template.name,
      data: {},
    };

    setPages((prev) => [...prev, newPage]);
    setCurrentPage(pages.length);
  };

  const deletePage = (pageIndex) => {
    if (pages.length > 1) {
      setPages((prev) => prev.filter((_, index) => index !== pageIndex));
      setCurrentPage(Math.max(0, currentPage - 1));
    }
  };

  const movePageUp = (pageIndex) => {
    if (pageIndex > 0) {
      setPages((prev) => {
        const newPages = [...prev];
        [newPages[pageIndex - 1], newPages[pageIndex]] = [
          newPages[pageIndex],
          newPages[pageIndex - 1],
        ];
        return newPages;
      });
    }
  };

  const movePageDown = (pageIndex) => {
    if (pageIndex < pages.length - 1) {
      setPages((prev) => {
        const newPages = [...prev];
        [newPages[pageIndex], newPages[pageIndex + 1]] = [
          newPages[pageIndex + 1],
          newPages[pageIndex],
        ];
        return newPages;
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status = "draft") => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const contentData = {
        ...formData,
        status,
        pages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: Date.now().toString(),
      };

      console.log("Saving enhanced content:", contentData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      window.location.href = "/cms/content";
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const generatePDF = async () => {
    // This would integrate with React-PDF or similar
    console.log("Generating PDF with pages:", pages);
    alert("PDF generation would be implemented here with React-PDF");
  };

  const currentPageData = pages[currentPage];
  const currentTemplate = pageTemplates.find(
    (t) => t.id === currentPageData?.template
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/cms/content"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Content
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enhanced Content Editor
              </h1>
              <p className="text-gray-600 mt-2">
                Create professional research reports with page-by-page control
                and PDF generation
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-white rounded-lg border">
                <button
                  onClick={() => setViewMode("editor")}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    viewMode === "editor"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === "preview"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("pdf")}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    viewMode === "pdf"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  PDF Layout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Pages */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Document Structure
              </h3>

              {/* Page List */}
              <div className="space-y-2 mb-4">
                {pages.map((page, index) => (
                  <div
                    key={page.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentPage === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setCurrentPage(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {React.createElement(
                          currentTemplate?.icon || DocumentTextIcon,
                          {
                            className: "h-4 w-4 text-gray-500 mr-2",
                          }
                        )}
                        <span className="text-sm font-medium">
                          {page.title}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePageUp(index);
                          }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            movePageDown(index);
                          }}
                          disabled={index === pages.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                        {pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(index);
                            }}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <XMarkIcon className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Page Templates */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Add Page
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {pageTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addPage(template.id)}
                      className="p-2 text-xs border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      title={template.description}
                    >
                      {React.createElement(template.icon, {
                        className: "h-4 w-4 mx-auto mb-1 text-gray-400",
                      })}
                      <div className="text-gray-600">{template.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Metadata */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Document Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Research Report Title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange("category", e.target.value);
                      handleInputChange("subcategory", "");
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select category</option>
                    {mockCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-9">
            {viewMode === "editor" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Page {currentPage + 1}: {currentPageData?.title}
                  </h2>
                  <div className="text-sm text-gray-500">
                    Template: {currentTemplate?.name}
                  </div>
                </div>

                {/* Page Editor based on template */}
                {currentPageData?.template === "cover-page" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Report Title
                        </label>
                        <input
                          type="text"
                          value={currentPageData.data.title || ""}
                          onChange={(e) =>
                            handlePageDataChange(
                              currentPage,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Main report title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={currentPageData.data.subtitle || ""}
                          onChange={(e) =>
                            handlePageDataChange(
                              currentPage,
                              "subtitle",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Report subtitle"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Author
                        </label>
                        <input
                          type="text"
                          value={currentPageData.data.author || ""}
                          onChange={(e) =>
                            handlePageDataChange(
                              currentPage,
                              "author",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Report author"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          value={currentPageData.data.date || ""}
                          onChange={(e) =>
                            handlePageDataChange(
                              currentPage,
                              "date",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Rich Content Editor for other templates */}
                {currentPageData?.template !== "cover-page" && (
                  <div>
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>Enhanced Editor Coming Soon:</strong> This will
                        integrate TinyMCE or similar rich text editor with
                        support for charts, tables, Excel import, and advanced
                        formatting.
                      </p>
                    </div>

                    <textarea
                      rows={20}
                      value={currentPageData.data.content || ""}
                      onChange={(e) =>
                        handlePageDataChange(
                          currentPage,
                          "content",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono"
                      placeholder="Page content... (Will be replaced with rich editor)"
                    />

                    {/* Placeholder for additional tools */}
                    <div className="mt-4 flex space-x-2">
                      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <TableCellsIcon className="h-4 w-4 mr-2" />
                        Add Table
                      </button>
                      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        Add Chart
                      </button>
                      <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === "preview" && (
              <div
                className="bg-white rounded-lg shadow-sm border p-8"
                style={{ minHeight: "800px" }}
              >
                <div className="prose max-w-none">
                  <h1 className="text-3xl font-bold mb-2">
                    {currentPageData?.data.title || formData.title}
                  </h1>
                  {currentPageData?.data.subtitle && (
                    <h2 className="text-xl text-gray-600 mb-4">
                      {currentPageData.data.subtitle}
                    </h2>
                  )}
                  {currentPageData?.data.author && (
                    <p className="text-sm text-gray-500 mb-6">
                      By {currentPageData.data.author}
                    </p>
                  )}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: (currentPageData?.data.content || "").replace(
                        /\n/g,
                        "<br>"
                      ),
                    }}
                  />
                </div>
              </div>
            )}

            {viewMode === "pdf" && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    PDF Layout Preview
                  </h2>
                  <button
                    onClick={generatePDF}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Generate PDF
                  </button>
                </div>

                <div className="space-y-4">
                  {pages.map((page, index) => (
                    <div
                      key={page.id}
                      className="border border-gray-300 p-4 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">
                          Page {index + 1}: {page.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {
                            pageTemplates.find((t) => t.id === page.template)
                              ?.name
                          }
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Template: {page.template} | Data fields:{" "}
                        {Object.keys(page.data).length}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    PDF Features (Coming Soon)
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Professional FRC branding and layouts</li>
                    <li>• Automatic page numbering and headers/footers</li>
                    <li>• High-quality chart and table rendering</li>
                    <li>• Custom page breaks and formatting</li>
                    <li>• Table of contents generation</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Document has {pages.length} page{pages.length !== 1 ? "s" : ""}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              {isSaving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
