import React from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
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
            <Link
              href="/analysis"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              ANALYSIS
            </Link>
            <Link
              href="/reports"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium"
            >
              REPORTS
            </Link>
          </div>

          {/* Right Section: CTA Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
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

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white hover:text-blue-300 transition-colors duration-200">
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

        {/* Mobile Navigation Menu (Hidden by default) */}
        <div className="md:hidden mt-4 border-t border-blue-800 pt-4 hidden">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
            >
              HOME
            </Link>
            <Link
              href="/companies"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
            >
              COMPANIES
            </Link>
            <Link
              href="/analysis"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
            >
              ANALYSIS
            </Link>
            <Link
              href="/reports"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
            >
              REPORTS
            </Link>
            <Link
              href="/sign-in"
              className="text-white hover:text-blue-300 transition-colors duration-200 font-medium py-2"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
