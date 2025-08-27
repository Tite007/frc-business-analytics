"use client";

import React, { useState } from "react";

const AIAnalysis = ({
  ticker,
  analysis,
  status = "success",
  generatedDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!analysis || analysis.trim().length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
        <p className="text-gray-500">No AI analysis available</p>
      </div>
    );
  }

  const isLongAnalysis = analysis.length > 500;
  const displayText = isExpanded ? analysis : analysis.substring(0, 500);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Analysis</h3>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === "success"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            🤖 {status}
          </span>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayText}
          {isLongAnalysis && !isExpanded && "..."}
        </div>

        {isLongAnalysis && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? "📄 Show Less" : "📄 Read More"}
          </button>
        )}
      </div>

      {generatedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Generated on {new Date(generatedDate).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
