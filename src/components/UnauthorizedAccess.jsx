"use client";

import { useRouter } from "next/navigation";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function UnauthorizedAccess({
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  requiredRole = null,
  redirectTo = "/",
}) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push(redirectTo);
  };

  const handleGoLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <ExclamationTriangleIcon
              className="h-8 w-8 text-red-600"
              aria-hidden="true"
            />
          </div>

          {/* Content */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

            <p className="text-gray-600 mb-6">{message}</p>

            {requiredRole && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <UserIcon className="h-5 w-5 text-amber-400 mr-2 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-800">
                      <strong>Required role:</strong> {requiredRole}
                    </p>
                    <p className="text-amber-700 mt-1">
                      Please contact your administrator if you need access to
                      this section.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoHome}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Go to Homepage
              </button>

              <button
                onClick={handleGoLogin}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Login with Different Account
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                If you believe this is an error, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
