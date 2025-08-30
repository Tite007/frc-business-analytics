"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { format } from "date-fns";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id);
    }
  }, [params.id]);

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message || "Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("An error occurred while fetching user details");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/auth/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...user,
          is_active: !user.is_active,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser((prev) => ({ ...prev, is_active: !prev.is_active }));
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Error updating user status");
    }
  };

  const handleDeleteUser = async () => {
    if (
      !user ||
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/auth/users/${user._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/cms/users");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      user: "bg-blue-100 text-blue-800",
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
      <div className="animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/cms/users"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Not Found</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">
            {error || "The requested user could not be found."}
          </p>
          <Link
            href="/cms/users"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/cms/users"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">View and manage user information</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/cms/users/${user._id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <PencilIcon className="h-4 w-4" />
            <span>Edit User</span>
          </Link>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-full p-2">
              <UserCircleIcon className="h-20 w-20 text-gray-400" />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">
                {user.name} {user.last_name}
              </h2>
              <p className="text-blue-100">
                {user.position || "No position specified"}
              </p>
              <div className="mt-2 flex items-center space-x-4">
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                    user.is_active
                  )}`}
                >
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {user.created_at
                        ? format(new Date(user.created_at), "MMMM dd, yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="text-gray-900">
                      {user.last_login
                        ? format(
                            new Date(user.last_login),
                            "MMMM dd, yyyy 'at' h:mm a"
                          )
                        : "Never logged in"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="text-gray-900">
                      {user.updated_at
                        ? format(new Date(user.updated_at), "MMMM dd, yyyy")
                        : "Unknown"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg font-medium ${
              user.is_active
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {user.is_active ? "Deactivate User" : "Activate User"}
          </button>

          <Link
            href={`/cms/users/${user._id}/edit`}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200"
          >
            Edit User Information
          </Link>

          <button
            onClick={handleDeleteUser}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
