"use client";

import { useState, useEffect } from "react";
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  LightBulbIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Helper function to safely join URLs
const joinUrl = (base, path) => {
  const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

// Mock data for all content items
const mockAllContent = [
  {
    id: "1",
    title: "Gold Mining Sector Analysis Q4 2024",
    description:
      "Comprehensive analysis of gold mining companies performance in the fourth quarter",
    category: "Research Reports",
    subcategory: "Gold",
    status: "published",
    author: "John Smith",
    publishedDate: "2024-03-15",
    createdDate: "2024-03-10",
    lastModified: "2024-03-20",
    views: 234,
    tags: ["gold", "mining", "Q4", "analysis"],
    type: "research_report",
  },
  {
    id: "2",
    title: "Copper Market Outlook 2025",
    description:
      "Market trends and price predictions for copper in the upcoming year",
    category: "Research Reports",
    subcategory: "Copper",
    status: "draft",
    author: "Sarah Johnson",
    publishedDate: null,
    createdDate: "2024-03-08",
    lastModified: "2024-03-18",
    views: 89,
    tags: ["copper", "market", "outlook", "2025"],
    type: "research_report",
  },
  {
    id: "3",
    title: "AI Software Companies Valuation Deep Dive",
    description: "Deep dive into AI sector valuations and growth prospects",
    category: "Tech",
    subcategory: null,
    status: "published",
    author: "Mike Chen",
    publishedDate: "2024-03-12",
    createdDate: "2024-03-05",
    lastModified: "2024-03-16",
    views: 456,
    tags: ["AI", "tech", "valuation", "software"],
    type: "research_report",
  },
  {
    id: "4",
    title: "Weekly Pick: Newmont Corporation",
    description: "Why we're bullish on gold miners this week - analyst insight",
    category: "Analysts' Ideas",
    subcategory: "Gold",
    status: "published",
    author: "Alex Rodriguez",
    publishedDate: "2024-03-18",
    createdDate: "2024-03-18",
    lastModified: "2024-03-18",
    views: 167,
    tags: ["newmont", "gold", "weekly pick", "bullish"],
    type: "analyst_idea",
  },
  {
    id: "5",
    title: "Lithium Market Disruption Analysis",
    description:
      "How new extraction technologies are disrupting the lithium market",
    category: "Mining",
    subcategory: "Lithium",
    status: "published",
    author: "Emma Davis",
    publishedDate: "2024-03-14",
    createdDate: "2024-03-09",
    lastModified: "2024-03-14",
    views: 298,
    tags: ["lithium", "disruption", "technology", "extraction"],
    type: "research_report",
  },
  {
    id: "6",
    title: "Crypto Weekly: Bitcoin ETF Impact",
    description:
      "Analysis of Bitcoin ETF approval impact on cryptocurrency markets",
    category: "Analysts' Ideas",
    subcategory: "Crypto",
    status: "published",
    author: "David Kim",
    publishedDate: "2024-03-16",
    createdDate: "2024-03-16",
    lastModified: "2024-03-16",
    views: 189,
    tags: ["bitcoin", "ETF", "crypto", "market impact"],
    type: "analyst_idea",
  },
  {
    id: "7",
    title: "Tech Sector Q1 Performance Review",
    description: "Quarterly performance analysis of major technology companies",
    category: "Tech",
    subcategory: null,
    status: "draft",
    author: "Lisa Wang",
    publishedDate: null,
    createdDate: "2024-03-20",
    lastModified: "2024-03-22",
    views: 45,
    tags: ["tech", "Q1", "performance", "review"],
    type: "research_report",
  },
  {
    id: "8",
    title: "Copper Supply Chain Challenges 2024",
    description:
      "Examining global copper supply chain disruptions and opportunities",
    category: "Mining",
    subcategory: "Copper",
    status: "published",
    author: "Robert Chen",
    publishedDate: "2024-03-11",
    createdDate: "2024-03-06",
    lastModified: "2024-03-11",
    views: 312,
    tags: ["copper", "supply chain", "challenges", "2024"],
    type: "research_report",
  },
];

// Available categories and subcategories
const categories = [
  { name: "Research Reports", subcategories: [] },
  { name: "Analysts' Ideas", subcategories: ["Gold", "Crypto"] },
  { name: "Mining", subcategories: ["Gold", "Lithium", "Copper"] },
  { name: "Tech", subcategories: [] },
];

export default function ContentPage() {
  const [allContent, setAllContent] = useState(mockAllContent);
  const [filteredContent, setFilteredContent] = useState(mockAllContent);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedAuthor, setSelectedAuthor] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  // Sorting states
  const [sortField, setSortField] = useState("lastModified");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // Get unique values for filters
  const uniqueAuthors = [...new Set(allContent.map((item) => item.author))];
  const uniqueSubcategories = [
    ...new Set(allContent.map((item) => item.subcategory).filter(Boolean)),
  ];

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allContent];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubcategory !== "all") {
      filtered = filtered.filter(
        (item) => item.subcategory === selectedSubcategory
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    // Author filter
    if (selectedAuthor !== "all") {
      filtered = filtered.filter((item) => item.author === selectedAuthor);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      const filterDate = new Date();

      switch (dateRange) {
        case "today":
          filterDate.setDate(now.getDate());
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }

      filtered = filtered.filter(
        (item) => new Date(item.lastModified) >= filterDate
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField.includes("Date") || sortField === "lastModified") {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle numeric fields
      if (sortField === "views") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle string fields
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredContent(filtered);
  }, [
    allContent,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedStatus,
    selectedAuthor,
    dateRange,
    sortField,
    sortDirection,
  ]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedStatus("all");
    setSelectedAuthor("all");
    setDateRange("all");
  };

  // Get status badge classes
  const getStatusBadge = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Research Reports":
        return DocumentTextIcon;
      case "Analysts' Ideas":
        return LightBulbIcon;
      default:
        return FolderIcon;
    }
  };

  // Handle content deletion
  const handleDelete = () => {
    setAllContent(allContent.filter((item) => item.id !== selectedContent.id));
    setShowDeleteModal(false);
    setSelectedContent(null);
  };

  // Get available subcategories for selected category
  const getAvailableSubcategories = () => {
    if (selectedCategory === "all") return uniqueSubcategories;
    return allContent
      .filter((item) => item.category === selectedCategory)
      .map((item) => item.subcategory)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Content Management
          </h1>
          <p className="text-gray-600">
            Manage all your research reports, analyst ideas, and content across
            categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/cms/content/categories"
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FolderIcon className="h-5 w-5 mr-2" />
            Manage Categories
          </Link>
          <Link
            href="/cms/content/create-professional"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Content
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters & Search
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, tags, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("all"); // Reset subcategory when category changes
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={selectedCategory === "all"}
              >
                <option value="all">All Subcategories</option>
                {getAvailableSubcategories().map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Author Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <select
                value={selectedAuthor}
                onChange={(e) => setSelectedAuthor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Authors</option>
                {uniqueAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="quarter">Past Quarter</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
                <span className="font-medium">{filteredContent.length}</span> of{" "}
                <span className="font-medium">{allContent.length}</span> items
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allContent.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {
                  allContent.filter((item) => item.status === "published")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <PencilIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allContent.filter((item) => item.status === "draft").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <EyeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">
                {allContent
                  .reduce((total, item) => total + item.views, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Content</h2>
        </div>

        {filteredContent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subcategory
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("author")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Author</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("publishedDate")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Published</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("lastModified")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Modified</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Views</span>
                      <ChevronUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContent.map((item) => {
                  const CategoryIcon = getCategoryIcon(item.category);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-1 rounded bg-gray-100">
                            <CategoryIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {item.description}
                            </div>
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {item.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{item.tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {item.subcategory || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              {item.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm text-gray-900">
                              {item.author}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.publishedDate ? (
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(item.publishedDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not published</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(item.lastModified).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {item.views.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/cms/content/${item.id}/view`}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                            title="View Content"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/cms/content/${item.id}/edit`}
                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                            title="Edit Content"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedContent(item);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete Content"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm ||
              selectedCategory !== "all" ||
              selectedStatus !== "all"
                ? "No content matches your current filters."
                : "No content found."}
            </p>
            {!searchTerm &&
              selectedCategory === "all" &&
              selectedStatus === "all" && (
                <Link
                  href="/cms/content/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Content
                </Link>
              )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Content
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this content? This action cannot
                be undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">
                  {selectedContent.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedContent.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{selectedContent.category}</span>
                  {selectedContent.subcategory && (
                    <span>• {selectedContent.subcategory}</span>
                  )}
                  <span>• {selectedContent.author}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Content
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
