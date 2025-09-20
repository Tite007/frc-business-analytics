"use client";

import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
} from "@heroicons/react/24/outline";

export default function MobileDataControls({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onExport,
  resultsCount,
  totalCount,
  onPDFExport,
}) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {/* Mobile Controls Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileMenu(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Bars3Icon className="h-5 w-5" />
          Search & Filter ({resultsCount}/{totalCount})
        </button>
      </div>

      {/* Mobile Slide-out Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          />

          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Search & Filter</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Reports
                </label>
                <input
                  type="text"
                  placeholder="Search by title or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Publication Date</option>
                  <option value="volume">Volume Change</option>
                  <option value="prepost">Pre-Post Change</option>
                  <option value="number">Report Number</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder("desc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "desc"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Descending
                  </button>
                  <button
                    onClick={() => setSortOrder("asc")}
                    className={`flex-1 px-3 py-2 rounded-lg border ${
                      sortOrder === "asc"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Ascending
                  </button>
                </div>
              </div>

              {/* Results Summary */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{resultsCount}</span>{" "}
                  of <span className="font-semibold">{totalCount}</span> reports
                </div>
                {searchTerm && (
                  <div className="text-sm text-gray-500 mt-1">
                    Filtered by: "{searchTerm}"
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    CSV Export
                  </button>
                  {onPDFExport && (
                    <button
                      onClick={onPDFExport}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      PDF Report
                    </button>
                  )}
                </div>

                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
