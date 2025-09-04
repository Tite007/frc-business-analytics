"use client";

import { useState, useEffect } from "react";
import {
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://dashboard.researchfrc.com";

// Helper function to safely join URLs
const joinUrl = (base, path) => {
  const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${apiPath}`;
};

export default function CMSPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalReports: 0,
    activeUsers: 0,
    loading: true,
    error: null,
    isConnectedToRealAPI: false,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
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

  // Fetch all data
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Fetch from real backend API
      const [usersRes, companiesRes] = await Promise.all([
        fetch(joinUrl(API_BASE_URL, "/api/auth/users"), { headers }),
        fetch(joinUrl(API_BASE_URL, "/api/frc/companies"), { headers }),
      ]);

      const usersData = await usersRes.json();
      const companiesData = await companiesRes.json();

      // Handle the actual API response structure
      const usersArray = usersData.users || usersData || [];
      const companies = companiesData.companies || companiesData || [];

      setUsers(usersArray);
      setFilteredUsers(usersArray);

      setStats({
        totalUsers: Array.isArray(usersArray) ? usersArray.length : 0,
        totalCompanies: Array.isArray(companies)
          ? companies.length
          : companiesData.total_companies || 0,
        totalReports: Array.isArray(companies)
          ? companies.reduce(
              (acc, company) => acc + (company.reports_count || 0),
              0
            )
          : 0,
        activeUsers: Array.isArray(usersArray)
          ? usersArray.filter((u) => u.is_active).length
          : 0,
        loading: false,
        error: null,
        isConnectedToRealAPI: true,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from backend API:", error);

      // Fallback to development mode with mock data
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
        },
        {
          _id: "3",
          email: "sidr@researchfrc.com",
          name: "Sid",
          last_name: "Rajeev",
          position: "Research Manager",
          phone: "+1-555-0103",
          role: "user",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          _id: "4",
          email: "m.morales@researchfrc.com",
          name: "Martin",
          last_name: "Morales",
          position: "Data Analyst",
          phone: "+1-555-0104",
          role: "user",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setUsers(mockUsers);
      setFilteredUsers(mockUsers);

      setStats({
        totalUsers: 4,
        totalCompanies: 122,
        totalReports: 500,
        activeUsers: 4,
        loading: false,
        error: error.message,
        isConnectedToRealAPI: false,
      });

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Handle form submission for adding user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(joinUrl(API_BASE_URL, "/api/auth/users"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
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
        await fetchData(); // Refresh data
      } else {
        console.error("Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Handle form submission for updating user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        joinUrl(API_BASE_URL, `/api/auth/users/${selectedUser._id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        await fetchData(); // Refresh data
      } else {
        console.error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        joinUrl(API_BASE_URL, `/api/auth/users/${selectedUser._id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        await fetchData(); // Refresh data
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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

  const quickActions = [
    {
      name: "Add New User",
      onClick: () => setShowAddModal(true),
      icon: PlusIcon,
      color: "bg-blue-500 hover:bg-blue-600",
      description: "Create a new user account",
    },
    {
      name: "Export Users",
      onClick: () => {
        const csv =
          "data:text/csv;charset=utf-8," +
          "Name,Email,Role,Position,Active\n" +
          users
            .map(
              (u) =>
                `${u.name} ${u.last_name},${u.email},${u.role},${u.position},${u.is_active}`
            )
            .join("\n");
        const link = document.createElement("a");
        link.href = encodeURI(csv);
        link.download = "users.csv";
        link.click();
      },
      icon: DocumentTextIcon,
      color: "bg-green-500 hover:bg-green-600",
      description: "Export user data to CSV",
    },
    {
      name: "Refresh Data",
      onClick: fetchData,
      icon: ChartBarIcon,
      color: "bg-purple-500 hover:bg-purple-600",
      description: "Reload all data",
    },
  ];

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Active Users",
      value: stats.activeUsers,
      icon: UsersIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Total Companies",
      value: stats.totalCompanies,
      icon: BuildingOfficeIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      name: "Reports Generated",
      value: stats.totalReports,
      icon: DocumentTextIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={`loading-card-${i}`}
              className="bg-white p-6 rounded-lg shadow"
            >
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
      {/* API Connection Status */}
      {stats.isConnectedToRealAPI ? (
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
                data. {stats.error && `Error: ${stats.error}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            User Management Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complete user management and system overview
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-3 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${stat.color}`} />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                  {stat.name}
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            Quick Actions
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={action.onClick}
                className={`${action.color} text-white p-3 sm:p-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 sm:space-x-3 hover:scale-105 transform text-left`}
              >
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">
                    {action.name}
                  </div>
                  <div className="text-xs sm:text-sm opacity-90 truncate">
                    {action.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            All Users ({filteredUsers.length})
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-4 py-2 w-full sm:w-auto border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Mobile Cards View */}
        <div className="block sm:hidden">
          {filteredUsers.map((user, index) => (
            <div
              key={user._id || user.id || `user-${index}`}
              className="border-b border-gray-200 p-4"
            >
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.name?.charAt(0)}
                      {user.last_name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user.name} {user.last_name}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {user.position || "No position"}
                  </div>
                  <div className="text-sm text-gray-900 truncate">
                    {user.email}
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "analyst"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
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
                  Created
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
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name?.charAt(0)}
                            {user.last_name?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : user.role === "analyst"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="text-red-600 hover:text-red-900 inline-flex items-center ml-3"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "No users match your search." : "No users found."}
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">
            System Status
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {/* API Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div
                  className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                    stats.isConnectedToRealAPI ? "bg-green-500" : "bg-amber-500"
                  }`}
                ></div>
                <span className="text-sm font-medium truncate">
                  Backend API
                </span>
              </div>
              <span
                className={`text-sm ${
                  stats.isConnectedToRealAPI
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {stats.isConnectedToRealAPI ? "Connected" : "Fallback Mode"}
              </span>
            </div>

            {/* Database Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div
                  className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                    stats.isConnectedToRealAPI ? "bg-green-500" : "bg-amber-500"
                  }`}
                ></div>
                <span className="text-sm font-medium truncate">Database</span>
              </div>
              <span
                className={`text-sm ${
                  stats.isConnectedToRealAPI
                    ? "text-green-600"
                    : "text-amber-600"
                }`}
              >
                {stats.isConnectedToRealAPI ? "MongoDB Connected" : "Offline"}
              </span>
            </div>

            {/* Authentication Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 rounded-full mr-3 bg-green-500 flex-shrink-0"></div>
                <span className="text-sm font-medium truncate">
                  Authentication
                </span>
              </div>
              <span className="text-sm text-green-600">Active</span>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 rounded-full mr-3 bg-blue-500 flex-shrink-0"></div>
                <span className="text-sm font-medium truncate">
                  Last Updated
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
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
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Edit: {selectedUser.name} {selectedUser.last_name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <form
              onSubmit={handleUpdateUser}
              className="space-y-3 sm:space-y-4"
            >
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
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Update User
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                Delete User
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-red-600">
                      {selectedUser.name?.charAt(0)}
                      {selectedUser.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {selectedUser.name} {selectedUser.last_name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {selectedUser.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedUser.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete User
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
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
