"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  FolderIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Mock data for content items
const mockContent = {
  1: {
    // Research Reports
    "1-1": [
      // Mining
      {
        id: "content-1",
        title: "Gold Mining Sector Analysis Q4 2024",
        description:
          "Comprehensive analysis of gold mining companies performance",
        status: "published",
        author: "John Smith",
        createdAt: "2024-03-15",
        updatedAt: "2024-03-20",
        views: 234,
        type: "research_report",
      },
      {
        id: "content-2",
        title: "Copper Market Outlook 2025",
        description: "Market trends and price predictions for copper",
        status: "draft",
        author: "Sarah Johnson",
        createdAt: "2024-03-10",
        updatedAt: "2024-03-18",
        views: 89,
        type: "research_report",
      },
    ],
    "1-2": [
      // Technology
      {
        id: "content-3",
        title: "AI Software Companies Valuation",
        description: "Deep dive into AI sector valuations",
        status: "published",
        author: "Mike Chen",
        createdAt: "2024-03-12",
        updatedAt: "2024-03-16",
        views: 456,
        type: "research_report",
      },
    ],
  },
  2: {
    // Analyst Ideas
    "2-1": [
      // Mining
      {
        id: "idea-1",
        title: "Weekly Pick: Newmont Corporation",
        description: "Why we're bullish on gold miners this week",
        status: "published",
        author: "Alex Rodriguez",
        createdAt: "2024-03-18",
        updatedAt: "2024-03-18",
        views: 167,
        type: "analyst_idea",
      },
    ],
  },
};

const categoryNames = {
  1: "Research Reports",
  2: "Analyst Ideas",
};

const subcategoryNames = {
  "1-1": "Mining",
  "1-2": "Technology",
  "1-3": "Real Estate",
  "2-1": "Mining",
  "2-2": "Technology",
  "2-3": "Crypto",
};

export default function CategoryContentPage() {
  const params = useParams();
  const router = useRouter();
  const { categoryId, subcategoryId } = params;

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const categoryContent = mockContent[categoryId] || {};
      const subcategoryContent = categoryContent[subcategoryId] || [];
      setContent(subcategoryContent);
      setLoading(false);
    }, 500);
  }, [categoryId, subcategoryId]);

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
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

  const handleDelete = async () => {
    // TODO: Implement delete functionality
    setContent(content.filter((item) => item.id !== selectedContent.id));
    setShowDeleteModal(false);
    setSelectedContent(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link href="/cms/content" className="hover:text-gray-700">
          Content
        </Link>
        <span>/</span>
        <Link href="/cms/content" className="hover:text-gray-700">
          {categoryNames[categoryId]}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">
          {subcategoryNames[subcategoryId]}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {subcategoryNames[subcategoryId]} Content
            </h1>
            <p className="text-gray-600">
              Manage content in {categoryNames[categoryId]} ›{" "}
              {subcategoryNames[subcategoryId]}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/cms/content/${categoryId}/${subcategoryId}/create`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Content
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <DocumentTextIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-semibold text-gray-900">
                {content.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <EyeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {content.filter((item) => item.status === "published").length}
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
                {content.filter((item) => item.status === "draft").length}
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
                {content.reduce((total, item) => total + item.views, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Content Items ({filteredContent.length})
          </h2>
        </div>

        {filteredContent.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                        <Link
                          href={`/cms/content/${categoryId}/${subcategoryId}/${item.id}`}
                        >
                          {item.title}
                        </Link>
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{item.description}</p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Created {item.createdAt}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{item.views} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/cms/content/${categoryId}/${subcategoryId}/${item.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Content"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/cms/content/${categoryId}/${subcategoryId}/${item.id}/edit`}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Content"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedContent(item);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Content"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "No content matches your filters."
                : "No content in this subcategory yet."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Link
                href={`/cms/content/${categoryId}/${subcategoryId}/create`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Content
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
                ×
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
