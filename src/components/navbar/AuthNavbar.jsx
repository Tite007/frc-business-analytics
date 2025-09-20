"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDistributorsDropdownOpen, setIsDistributorsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDistributorsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <nav className="bg-[#1A2C45] shadow-xl text-sm text-white font-light sticky top-0 z-50">
      <div className="mx-auto container px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between min-w-0">
          {/* Left Section: Logo */}
          <div className="flex items-center min-w-0">
            <Link href="/" className="flex items-center">
              <div className="relative w-[120px] h-[40px] flex-shrink-0">
                <Image
                  alt="FRC Logo"
                  src="/FRC_Logo_FullWhite.png"
                  width={120}
                  height={40}
                  priority={true}
                  className="object-contain w-full h-full"
                />
              </div>
            </Link>
          </div>

          {/* Center Section: Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              HOME
            </Link>
            <Link
              href="/companies"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              COMPANIES
            </Link>

            {/* Distributors Dropdown - Only show for authenticated users */}
            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDistributorsDropdownOpen(!isDistributorsDropdownOpen)}
                  className="text-white hover:text-blue-300 transition-colors duration-200 font-medium flex items-center space-x-1"
                >
                  <span>DISTRIBUTORS</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isDistributorsDropdownOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDistributorsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                      <Link
                        href="/bloomberg"
                        className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 font-medium"
                        onClick={() => setIsDistributorsDropdownOpen(false)}
                      >
                        📊 Bloomberg Terminal
                      </Link>

                      <Link
                        href="/factset"
                        className="block px-4 py-2 text-gray-800 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 font-medium"
                        onClick={() => setIsDistributorsDropdownOpen(false)}
                      >
                        📈 FactSet
                      </Link>

                      {/* Placeholder for future distributors */}
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <div className="px-4 py-2 text-gray-400 text-sm italic">
                          More distributors coming soon...
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CMS Link - Only show for admin users */}
            {user?.role === "admin" && (
              <Link
                href="/cms"
                className="bg-frc-blue hover:bg-frc-blue-hover text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>ADMIN</span>
              </Link>
            )}
          </div>

          {/* Right Section: Authentication */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              // Authenticated user menu
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-white text-sm">
                  <span>Welcome, {user.name}</span>
                  <span className="text-blue-300 ml-2">({user.role})</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              // Unauthenticated user menu
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-white hover:text-blue-300 transition-colors duration-200 font-medium"
                >
                  SIGN IN
                </Link>
                <Link
                  href="/subscribe"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap"
                >
                  GET STARTED
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white hover:text-blue-300 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 border-t border-blue-800 pt-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                HOME
              </Link>
              <Link
                href="/companies"
                className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                COMPANIES
              </Link>

              {/* Mobile Distributors Section - Only show for authenticated users */}
              {isAuthenticated && (
                <div className="py-2">
                  <div className="text-blue-200 font-medium text-sm mb-2">
                    DISTRIBUTORS
                  </div>
                  <Link
                    href="/bloomberg"
                    className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-1 pl-4 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📊 Bloomberg Terminal
                  </Link>
                  <Link
                    href="/factset"
                    className="text-white hover:text-green-300 transition-colors duration-200 font-medium py-1 pl-4 block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    📈 FactSet
                  </Link>
                  <div className="text-gray-400 text-xs italic py-1 pl-4">
                    More distributors coming soon...
                  </div>
                </div>
              )}

              {/* CMS Link for mobile - Only show for admin users */}
              {user?.role === "admin" && (
                <Link
                  href="/cms"
                  className="bg-frc-blue hover:bg-frc-blue-hover text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>ADMIN PANEL</span>
                </Link>
              )}

              {isAuthenticated && user ? (
                <button
                  onClick={handleSignOut}
                  className="text-left text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
                >
                  SIGN OUT
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SIGN IN
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
