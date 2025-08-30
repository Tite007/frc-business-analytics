"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Environment variables
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  const API_BASE_URL = `${
    BACKEND_URL.endsWith("/") ? BACKEND_URL.slice(0, -1) : BACKEND_URL
  }/api/auth`;

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem("authToken");

    if (token) {
      // Verify token with API
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const { access_token, user: userData } = data;

        setUser(userData);
        setIsAuthenticated(true);

        // Store token in localStorage
        localStorage.setItem("authToken", access_token);
        localStorage.setItem("userData", JSON.stringify(userData));

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          message: data.message || data.detail || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Login failed. Please check your connection and try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        // Call logout endpoint
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
      setIsAuthenticated(false);

      // Redirect to login page
      router.push("/login");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return { success: false, message: "Not authenticated" };
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data);
        localStorage.setItem("userData", JSON.stringify(data));
        return { success: true, user: data };
      } else {
        return {
          success: false,
          message: data.message || "Profile update failed",
        };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        message: "Profile update failed. Please try again.",
      };
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const canAccessCMS = () => {
    return user?.role === "admin";
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    hasRole,
    canAccessCMS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
