"use client";

import { useState, useEffect } from "react";
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Helper function to safely join URLs
const joinUrl = (base, path) => {
  const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

// Mock data for categories and subcategories
const initialCategories = [
  {
    id: "1",
    name: "Research Reports",
    description: "Comprehensive equity research reports and market analysis",
    type: "research_report",
    color: "blue",
    subcategories: [],
    contentCount: 45,
    createdAt: "2024-01-15",
    updatedAt: "2024-03-20",
  },
  {
    id: "2",
    name: "Analysts' Ideas",
    description: "Weekly analyst insights and investment recommendations",
    type: "analyst_idea",
    color: "green",
    subcategories: [
      {
        id: "2-1",
        name: "Gold",
        description: "Gold mining and precious metals insights",
        contentCount: 12,
        createdAt: "2024-02-01",
      },
      {
        id: "2-2",
        name: "Crypto",
        description: "Cryptocurrency market analysis and trends",
        contentCount: 8,
        createdAt: "2024-02-15",
      },
    ],
    contentCount: 20,
    createdAt: "2024-01-20",
    updatedAt: "2024-03-18",
  },
  {
    id: "3",
    name: "Mining",
    description: "Mining sector analysis across various commodities",
    type: "sector_analysis",
    color: "yellow",
    subcategories: [
      {
        id: "3-1",
        name: "Gold",
        description: "Gold mining companies and market analysis",
        contentCount: 15,
        createdAt: "2024-01-25",
      },
      {
        id: "3-2",
        name: "Lithium",
        description: "Lithium extraction and battery metals sector",
        contentCount: 12,
        createdAt: "2024-02-05",
      },
      {
        id: "3-3",
        name: "Copper",
        description: "Copper mining operations and market trends",
        contentCount: 18,
        createdAt: "2024-02-10",
      },
    ],
    contentCount: 45,
    createdAt: "2024-01-25",
    updatedAt: "2024-03-22",
  },
  {
    id: "4",
    name: "Tech",
    description: "Technology sector analysis and company evaluations",
    type: "sector_analysis",
    color: "purple",
    subcategories: [],
    contentCount: 32,
    createdAt: "2024-02-01",
    updatedAt: "2024-03-19",
  },
];

export default function CategoriesManagementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(["2", "3"])
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const [showEditSubcategoryModal, setShowEditSubcategoryModal] =
    useState(false);
  const [showDeleteSubcategoryModal, setShowDeleteSubcategoryModal] =
    useState(false);

  // Selected items
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    type: "research_report",
    color: "blue",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
    parentId: "",
  });

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Category Management Functions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newCategory = {
        id: Date.now().toString(),
        ...categoryForm,
        subcategories: [],
        contentCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };

      setCategories([...categories, newCategory]);
      setShowAddCategoryModal(false);
      setCategoryForm({
        name: "",
        description: "",
        type: "research_report",
        color: "blue",
      });
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                ...categoryForm,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : cat
        )
      );
      setShowEditCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error editing category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    setLoading(true);
    try {
      setCategories(categories.filter((cat) => cat.id !== selectedCategory.id));
      setShowDeleteCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Subcategory Management Functions
  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newSubcategory = {
        id: Date.now().toString(),
        name: subcategoryForm.name,
        description: subcategoryForm.description,
        contentCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };

      setCategories(
        categories.map((cat) =>
          cat.id === subcategoryForm.parentId
            ? {
                ...cat,
                subcategories: [...cat.subcategories, newSubcategory],
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : cat
        )
      );

      setShowAddSubcategoryModal(false);
      setSubcategoryForm({
        name: "",
        description: "",
        parentId: "",
      });
    } catch (error) {
      console.error("Error adding subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubcategory = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                subcategories: cat.subcategories.map((sub) =>
                  sub.id === selectedSubcategory.id
                    ? {
                        ...sub,
                        name: subcategoryForm.name,
                        description: subcategoryForm.description,
                      }
                    : sub
                ),
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : cat
        )
      );

      setShowEditSubcategoryModal(false);
      setSelectedSubcategory(null);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error editing subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async () => {
    setLoading(true);
    try {
      setCategories(
        categories.map((cat) =>
          cat.id === selectedCategory.id
            ? {
                ...cat,
                subcategories: cat.subcategories.filter(
                  (sub) => sub.id !== selectedSubcategory.id
                ),
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : cat
        )
      );

      setShowDeleteSubcategoryModal(false);
      setSelectedSubcategory(null);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error deleting subcategory:", error);
    } finally {
      setLoading(false);
    }
  };

  // Modal openers
  const openEditCategoryModal = (category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      type: category.type,
      color: category.color,
    });
    setShowEditCategoryModal(true);
  };

  const openDeleteCategoryModal = (category) => {
    setSelectedCategory(category);
    setShowDeleteCategoryModal(true);
  };

  const openAddSubcategoryModal = (categoryId) => {
    setSubcategoryForm({ ...subcategoryForm, parentId: categoryId });
    setShowAddSubcategoryModal(true);
  };

  const openEditSubcategoryModal = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      description: subcategory.description,
      parentId: category.id,
    });
    setShowEditSubcategoryModal(true);
  };

  const openDeleteSubcategoryModal = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setShowDeleteSubcategoryModal(true);
  };

  // Utility functions
  const getColorClasses = (color) => {
    const colorMap = {
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      green: "bg-green-100 text-green-800 border-green-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      red: "bg-red-100 text-red-800 border-red-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      pink: "bg-pink-100 text-pink-800 border-pink-200",
    };
    return colorMap[color] || colorMap.blue;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "research_report":
        return DocumentTextIcon;
      case "analyst_idea":
        return LightBulbIcon;
      default:
        return FolderIcon;
    }
  };

  return (
    <div className="space-y-6">
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
              Category Management
            </h1>
            <p className="text-gray-600">
              Manage content categories and subcategories
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddCategoryModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories and subcategories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Categories
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100">
              <TagIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Subcategories
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.reduce(
                  (total, cat) => total + cat.subcategories.length,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Content</p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.reduce((total, cat) => total + cat.contentCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100">
              <CheckIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Categories
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Categories & Subcategories
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const TypeIcon = getTypeIcon(category.type);

            return (
              <div key={category.id} className="p-6">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </button>

                    <div className="p-2 rounded-lg bg-gray-100">
                      <TypeIcon className="h-6 w-6 text-gray-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {category.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getColorClasses(
                            category.color
                          )}`}
                        >
                          {category.type.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{category.contentCount} content items</span>
                        <span>
                          {category.subcategories.length} subcategories
                        </span>
                        <span>Created {category.createdAt}</span>
                        <span>Updated {category.updatedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openAddSubcategoryModal(category.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Add Subcategory"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditCategoryModal(category)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteCategoryModal(category)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                {isExpanded && category.subcategories.length > 0 && (
                  <div className="mt-4 ml-9 space-y-3">
                    {category.subcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <FolderIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {subcategory.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                              {subcategory.description}
                            </p>
                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                              <span>{subcategory.contentCount} items</span>
                              <span>Created {subcategory.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 ml-3">
                          <button
                            onClick={() =>
                              openEditSubcategoryModal(category, subcategory)
                            }
                            className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit Subcategory"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              openDeleteSubcategoryModal(category, subcategory)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Subcategory"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* No subcategories message */}
                {isExpanded && category.subcategories.length === 0 && (
                  <div className="mt-4 ml-9 p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                    <FolderIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm mb-2">No subcategories yet</p>
                    <button
                      onClick={() => openAddSubcategoryModal(category.id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add the first subcategory
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "No categories match your search."
                : "No categories found."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create your first category
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add New Category
              </h3>
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Research Reports, Mining, Tech"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={categoryForm.type}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="research_report">Research Report</option>
                  <option value="analyst_idea">Analyst Ideas</option>
                  <option value="sector_analysis">Sector Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "blue",
                    "green",
                    "purple",
                    "red",
                    "yellow",
                    "indigo",
                    "orange",
                    "pink",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCategoryForm({ ...categoryForm, color })
                      }
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        categoryForm.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300"
                      } ${
                        getColorClasses(color).split(" ")[0]
                      } hover:scale-105`}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Category
              </h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  value={categoryForm.type}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="research_report">Research Report</option>
                  <option value="analyst_idea">Analyst Ideas</option>
                  <option value="sector_analysis">Sector Analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    "blue",
                    "green",
                    "purple",
                    "red",
                    "yellow",
                    "indigo",
                    "orange",
                    "pink",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setCategoryForm({ ...categoryForm, color })
                      }
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        categoryForm.color === color
                          ? "border-gray-900 scale-110"
                          : "border-gray-300"
                      } ${
                        getColorClasses(color).split(" ")[0]
                      } hover:scale-105`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Category"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Category Modal */}
      {showDeleteCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Category
              </h3>
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Are you sure you want to delete this category? This action
                    cannot be undone.
                  </p>
                  <p className="text-xs text-red-600">
                    This will also delete all subcategories and may affect
                    existing content.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">
                  {selectedCategory.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCategory.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{selectedCategory.contentCount} content items</span>
                  <span>
                    {selectedCategory.subcategories.length} subcategories
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteCategory}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Category"}
              </button>
              <button
                onClick={() => setShowDeleteCategoryModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Subcategory Modal */}
      {showAddSubcategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Subcategory
              </h3>
              <button
                onClick={() => setShowAddSubcategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <input
                  type="text"
                  value={
                    categories.find(
                      (cat) => cat.id === subcategoryForm.parentId
                    )?.name || ""
                  }
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Gold, Lithium, Copper"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  placeholder="Brief description..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Subcategory"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubcategoryModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcategory Modal */}
      {showEditSubcategoryModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit Subcategory
              </h3>
              <button
                onClick={() => setShowEditSubcategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubcategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <input
                  type="text"
                  value={selectedCategory?.name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  required
                  value={subcategoryForm.name}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) =>
                    setSubcategoryForm({
                      ...subcategoryForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Subcategory"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditSubcategoryModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subcategory Modal */}
      {showDeleteSubcategoryModal && selectedSubcategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Subcategory
              </h3>
              <button
                onClick={() => setShowDeleteSubcategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Are you sure you want to delete this subcategory? This
                    action cannot be undone.
                  </p>
                  <p className="text-xs text-red-600">
                    This may affect existing content in this subcategory.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">
                  {selectedSubcategory.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSubcategory.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Parent: {selectedCategory?.name}</span>
                  <span>{selectedSubcategory.contentCount} content items</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleDeleteSubcategory}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Subcategory"}
              </button>
              <button
                onClick={() => setShowDeleteSubcategoryModal(false)}
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
