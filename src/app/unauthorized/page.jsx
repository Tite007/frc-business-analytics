"use client";

import Link from "next/link";
import Image from "next/image";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      {/* Logo */}
      <div className="mb-8">
        <Image
          alt="FRC Logo"
          src="/FRC_Logo_FullBlue.png"
          width={200}
          height={64}
          priority={true}
          className="object-contain"
        />
      </div>

      {/* Main Content */}
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Access Denied Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please sign in with
          proper credentials or contact your administrator.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            Go Home
          </Link>

          <Link
            href="/login"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 inline-block"
          >
            Sign In
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact support at{" "}
            <a
              href="mailto:support@researchfrc.com"
              className="text-blue-600 hover:text-blue-800"
            >
              support@researchfrc.com
            </a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          © 2025 Fundamental Research Corp. All rights reserved.
        </p>
      </div>
    </div>
  );
}
