"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function QuickAccessMenu({
  activeTab,
  setActiveTab,
  hasChartData,
  hasMetricsData,
  hasAnalysisData,
  totalReports,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: "overview",
      name: "Overview",
      icon: ChartBarIcon,
      available: hasChartData || hasMetricsData || hasAnalysisData,
      description: "Charts and quick metrics",
    },
    {
      id: "metrics",
      name: "Performance Metrics",
      icon: TableCellsIcon,
      available: hasMetricsData,
      description: `${totalReports} detailed reports`,
      count: totalReports,
    },
    {
      id: "analysis",
      name: "AI Analysis",
      icon: DocumentChartBarIcon,
      available: hasAnalysisData,
      description: "AI-generated insights",
    },
    {
      id: "bloomberg",
      name: "Bloomberg Data",
      icon: EyeIcon,
      available: true,
      description: "Market readership data",
    },
  ];

  const availableItems = menuItems.filter((item) => item.available);
  const activeItem = menuItems.find((item) => item.id === activeTab);

  return (
    <div className="lg:hidden mb-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Current Selection Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            {activeItem && (
              <>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <activeItem.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    {activeItem.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeItem.description}
                  </p>
                </div>
                {activeItem.count && (
                  <span className="ml-auto bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    {activeItem.count}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Switch Section</span>
            {isOpen ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="border-t border-gray-200">
            {availableItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 border-r-4 border-blue-500"
                    : ""
                } ${
                  index !== availableItems.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    activeTab === item.id ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 ${
                      activeTab === item.id ? "text-blue-600" : "text-gray-600"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      activeTab === item.id ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>

                {item.count && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === item.id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {activeTab === item.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
