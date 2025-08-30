"use client";

import { useState, useEffect } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckIcon,
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isConnectedToRealAPI, setIsConnectedToRealAPI] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    last_name: "",
    email: "",
    position: "",
    phone: "",
    role: "user",
    is_active: true,
    password: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterStatus]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Try to fetch from real backend API first
      const response = await fetch(joinUrl(API_BASE_URL, "/api/auth/users"), {
        headers,
      });
      const data = await response.json();

      // Handle the actual API response structure
      const usersArray = data.users || data || [];

      setUsers(usersArray);
      setIsConnectedToRealAPI(true);
    } catch (error) {
      console.error("Error fetching users from backend API:", error);

      // Fallback to mock data
      const mockUsers = [
        {
          _id: "1",
          email: "tsanchez0@researchfrc.com",
          name: "Test",
          last_name: "User",
          position: "System Administrator",
          phone: "+1-555-0101",
          role: "admin",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
        {
          _id: "2",
          email: "btang@researchfrc.com",
          name: "Brian",
          last_name: "Tang",
          position: "Financial Analyst",
          phone: "+1-555-0102",
          role: "user",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: "3",
          email: "sidr@researchfrc.com",
          name: "Sid",
          last_name: "Rajeev",
          position: "Research Manager",
          phone: "+1-555-0103",
          role: "analyst",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          _id: "4",
          email: "m.morales@researchfrc.com",
          name: "Martin",
          last_name: "Morales",
          position: "Data Analyst",
          phone: "+1-555-0104",
          role: "user",
          is_active: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login: null,
        },
      ];

      setUsers(mockUsers);
      setIsConnectedToRealAPI(false);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) =>
        filterStatus === "active" ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    if (!userId) {
      alert("Error: User ID not found. Cannot delete user.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        joinUrl(API_BASE_URL, `/api/auth/users/${userId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Filter out the deleted user using both possible ID fields
        setUsers(
          users.filter((user) => user._id !== userId && user.id !== userId)
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to delete user:", errorData);
        alert(
          `Failed to delete user: ${errorData.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Error deleting user: ${error.message}`);
    }
  };

  // Handle form submission for adding user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      // Prepare user data for creation
      const userData = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.position || "",
        phone: formData.phone || "",
        role: formData.role,
        is_active: formData.is_active,
        password: formData.password, // Password is required for new users
      };

      console.log("Sending create user data:", {
        ...userData,
        password: "[HIDDEN]",
      });

      const response = await fetch(joinUrl(API_BASE_URL, "/api/auth/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          name: "",
          last_name: "",
          email: "",
          position: "",
          phone: "",
          role: "user",
          is_active: true,
          password: "",
        });
        await fetchUsers(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to add user:", errorData);
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);

        // Show detailed error message
        let errorMessage = "Failed to add user";
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map(
              (err) => `${err.loc ? err.loc.join(".") : "Field"}: ${err.msg}`
            )
            .join("\n");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        alert(`Failed to add user:\n${errorMessage}`);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`Error adding user: ${error.message}`);
    }
  };

  // Handle form submission for updating user
  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Get user ID with fallback
    const userId = selectedUser._id || selectedUser.id;

    if (!userId) {
      console.error("No user ID found for update:", selectedUser);
      alert("Error: User ID not found. Cannot update user.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      // Prepare update data - only include fields that have values
      const updateData = {
        name: formData.name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.position || "",
        phone: formData.phone || "",
        role: formData.role,
        is_active: formData.is_active,
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      console.log("Sending update data:", updateData);

      const response = await fetch(
        joinUrl(API_BASE_URL, `/api/auth/users/${userId}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchUsers(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to update user:", errorData);
        console.error("Response status:", response.status);
        console.error("Response statusText:", response.statusText);

        // Show detailed error message
        let errorMessage = "Failed to update user";
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail
            .map(
              (err) => `${err.loc ? err.loc.join(".") : "Field"}: ${err.msg}`
            )
            .join("\n");
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }

        alert(`Failed to update user:\n${errorMessage}`);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Error updating user: ${error.message}`);
    }
  };

  // Open edit modal with user data
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      position: user.position || "",
      phone: user.phone || "",
      role: user.role || "user",
      is_active: user.is_active ?? true,
      password: "", // Don't pre-fill password
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Open view modal
  const openViewModal = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      user: "bg-frc-blue-light text-frc-blue",
      analyst: "bg-green-100 text-green-800",
      readonly: "bg-gray-100 text-gray-800",
    };
    return colors[role] || colors.user;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={`loading-user-${i}`}
                className="flex items-center space-x-4 py-4"
              >
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Connection Status */}
      {isConnectedToRealAPI ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-500 mr-3">✅</div>
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Real API Connected
              </h3>
              <p className="text-sm text-green-700">
                Connected to FRC backend API at {API_BASE_URL}. Displaying live
                data from your database.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-amber-500 mr-3">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                API Connection Issue
              </h3>
              <p className="text-sm text-amber-700">
                Cannot connect to backend API at {API_BASE_URL}. Using fallback
                data for development.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-frc-blue text-white px-4 py-2 rounded-lg hover:bg-frc-blue-hover transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-frc-blue focus:border-transparent text-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-frc-blue focus:border-transparent text-sm"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="analyst">Analyst</option>
            <option value="readonly">Read Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-frc-blue focus:border-transparent text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600 sm:col-span-2 lg:col-span-1 justify-center lg:justify-start">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Mobile Cards View */}
        <div className="block sm:hidden">
          {filteredUsers.map((user, index) => (
            <div
              key={user._id || user.id || `user-${index}`}
              className="border-b border-gray-200 p-4 last:border-b-0"
            >
              <div className="flex items-start space-x-3">
                <UserCircleIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name} {user.last_name}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-frc-blue hover:text-frc-blue-hover p-1 rounded"
                        title="View user"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 truncate mb-1">
                    {user.position || "No position"}
                  </div>
                  <div className="text-sm text-gray-900 truncate mb-2">
                    {user.email}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        user.is_active
                      )}`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                    {user.last_login && (
                      <span className="text-xs text-gray-500">
                        Last: {new Date(user.last_login).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user, index) => (
                <tr
                  key={user._id || user.id || `user-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.position || "No position"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      {user.phone || "No phone"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        user.is_active
                      )}`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openViewModal(user)}
                        className="text-frc-blue hover:text-frc-blue-hover p-1 rounded"
                        title="View user"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit user"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete user"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterRole !== "all" || filterStatus !== "all"
                ? "Try adjusting your search filters"
                : "Get started by adding your first user"}
            </p>
            {!searchTerm && filterRole === "all" && filterStatus === "all" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-frc-blue text-white px-4 py-2 rounded-lg hover:bg-frc-blue-hover transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add First User</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Add New User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active user
                </label>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-frc-blue text-white py-2 px-4 rounded-lg hover:bg-frc-blue-hover transition-colors text-sm font-medium"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Edit: {selectedUser.name} {selectedUser.last_name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="analyst">Analyst</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password (optional)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="edit_is_active"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active user
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                User Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg sm:text-xl font-medium text-blue-600">
                    {selectedUser.name?.charAt(0)}
                    {selectedUser.last_name?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base sm:text-lg font-medium text-gray-900 truncate">
                    {selectedUser.name} {selectedUser.last_name}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {selectedUser.position || "No position"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Email:</span>
                  <div className="text-gray-900 truncate">
                    {selectedUser.email}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Phone:</span>
                  <div className="text-gray-900 truncate">
                    {selectedUser.phone || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Role:</span>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        selectedUser.is_active
                      )}`}
                    >
                      {selectedUser.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Created:</span>
                  <div className="text-gray-900">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString()
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Login:</span>
                  <div className="text-gray-900">
                    {selectedUser.last_login
                      ? new Date(selectedUser.last_login).toLocaleDateString()
                      : "Never"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  openEditModal(selectedUser);
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Edit User
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-red-600">
                      {selectedUser.name?.charAt(0)}
                      {selectedUser.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedUser.name} {selectedUser.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedUser.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const userId = selectedUser._id || selectedUser.id;
                  if (userId) {
                    handleDeleteUser(userId);
                    setShowDeleteModal(false);
                  } else {
                    alert("Error: User ID not found. Cannot delete user.");
                  }
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete User
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
