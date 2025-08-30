"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UnauthorizedAccess from "./UnauthorizedAccess";

export function ProtectedRoute({
  children,
  requiredRole = null,
  adminOnly = false,
  showUnauthorizedComponent = false,
}) {
  const { user, loading, isAuthenticated, canAccessCMS } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login with callback
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Admin only route (like CMS) - redirect to unauthorized page
    if (adminOnly && !canAccessCMS()) {
      if (showUnauthorizedComponent) return; // Let component handle it
      router.push("/unauthorized");
      return;
    }

    // Specific role required - redirect to unauthorized page
    if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
      if (showUnauthorizedComponent) return; // Let component handle it
      router.push("/unauthorized");
      return;
    }
  }, [
    user,
    loading,
    isAuthenticated,
    requiredRole,
    adminOnly,
    canAccessCMS,
    router,
    showUnauthorizedComponent,
  ]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  // If admin only and user can't access CMS
  if (adminOnly && !canAccessCMS()) {
    if (showUnauthorizedComponent) {
      return (
        <UnauthorizedAccess
          title="Admin Access Required"
          message="The CMS (Content Management System) is restricted to administrators only."
          requiredRole="Admin"
          redirectTo="/"
        />
      );
    }
    return null; // Redirect is happening
  }

  // If specific role required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    if (showUnauthorizedComponent) {
      return (
        <UnauthorizedAccess
          title="Insufficient Permissions"
          message={`You need ${requiredRole} privileges to access this page.`}
          requiredRole={requiredRole}
          redirectTo="/"
        />
      );
    }
    return null; // Redirect is happening
  }

  // All checks passed
  return children;
}

export default ProtectedRoute;
