"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  BellIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/cms", icon: ChartBarIcon },
  { name: "Users", href: "/cms/users", icon: UsersIcon },
  { name: "Content", href: "/cms/content", icon: FolderIcon },
  { name: "Companies", href: "/cms/companies", icon: BuildingOfficeIcon },
  { name: "Reports", href: "/cms/reports", icon: DocumentTextIcon },
  { name: "Analytics", href: "/cms/analytics", icon: ChartPieIcon },
  { name: "Notifications", href: "/cms/notifications", icon: BellIcon },
  { name: "Settings", href: "/cms/settings", icon: CogIcon },
];

export default function CMSSidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop and Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:translate-x-0 lg:w-20 w-64"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-frc-blue">
            <div className="flex items-center">
              {isOpen ? (
                <>
                  <img
                    src="/FRC_Logo_FullWhite.png"
                    alt="FRC Logo"
                    className="h-6 sm:h-8 w-auto transition-all duration-300"
                  />
                  <span className="ml-2 text-white font-bold text-sm sm:text-lg">
                    CMS
                  </span>
                </>
              ) : (
                <img
                  src="/FRC_Isotype.png"
                  alt="FRC Logo"
                  className="h-6 sm:h-8 w-6 sm:w-8 transition-all duration-300"
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
            {/* Back to User Dashboard */}
            <Link
              href="/"
              className="flex items-center px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 text-white bg-green-600 hover:bg-green-700 mb-3 sm:mb-4"
              onClick={() => onClose()}
            >
              <svg
                className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 ${
                  isOpen ? "mr-2 sm:mr-3" : "mx-auto"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {isOpen && (
                <span className="transition-opacity duration-300">
                  <span className="hidden sm:inline">Back to Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </span>
              )}
            </Link>

            {/* Divider */}
            {isOpen && (
              <div className="border-t border-gray-200 my-3 sm:my-4"></div>
            )}

            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/cms" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-frc-blue text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={() => onClose()}
                >
                  <item.icon
                    className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 ${
                      isOpen ? "mr-2 sm:mr-3" : "mx-auto"
                    }`}
                  />
                  {isOpen && (
                    <span className="transition-opacity duration-300 truncate">
                      {item.name}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-2 sm:p-4 border-t">
            <div
              className={`flex items-center ${
                isOpen ? "justify-between" : "justify-center"
              }`}
            >
              {isOpen && (
                <div className="text-xs text-gray-500">
                  <span className="hidden sm:inline">FRC CMS v1.0</span>
                  <span className="sm:hidden">v1.0</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
