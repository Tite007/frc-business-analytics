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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                AI Analysis Report
              </h3>
              <p className="text-gray-600 text-sm">
                Fundamental Research Corp. Intelligence
              </p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🤖</div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">
              No AI Analysis Available
            </h4>
            <p className="text-gray-500">
              AI analysis for {ticker} is currently being processed or not
              available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Function to format the analysis text into professional sections
  const formatAnalysis = (text) => {
    if (!text) return [];

    // Split by common section patterns
    const sections = [];
    let currentSection = { title: "", content: "" };

    const lines = text.split("\n").filter((line) => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if this line is a section header (starts with - ** or contains ** patterns)
      if (line.match(/^-\s*\*\*.*\*\*:?/) || line.match(/^\*\*.*\*\*:?/)) {
        // Save previous section if it has content
        if (currentSection.content.trim()) {
          sections.push({ ...currentSection });
        }

        // Start new section
        const title = line.replace(/^-?\s*\*\*(.*?)\*\*:?/, "$1").trim();
        currentSection = {
          title: title,
          content: "",
        };
      } else {
        // Add to current section content
        currentSection.content += line + "\n";
      }
    }

    // Add the last section
    if (currentSection.content.trim()) {
      sections.push(currentSection);
    }

    // If no sections were found, treat the whole text as one section
    if (sections.length === 0) {
      sections.push({
        title: "Analysis Summary",
        content: text,
      });
    }

    return sections;
  };

  const analysisSection = formatAnalysis(analysis);
  const isLongAnalysis = analysis.length > 1000;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Professional Header */}
      <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                AI Analysis Report
              </h3>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-sm">
                  Fundamental Research Corp. Intelligence
                </span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="text-sm font-mono text-blue-600">
                  {ticker}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                status === "success"
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}
            >
              {status === "success" ? "✓ Complete" : "⚠ Processing"}
            </span>
            {generatedDate && (
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                {new Date(generatedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Content */}
      <div className="p-8">
        <div className="space-y-8">
          {analysisSection
            .slice(0, isExpanded ? analysisSection.length : 3)
            .map((section, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {section.title}
                </h4>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    {section.content
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((paragraph, pIndex) => {
                        const trimmedParagraph = paragraph.trim();

                        if (!trimmedParagraph) return null;

                        // Handle bullet points
                        if (trimmedParagraph.startsWith("- ")) {
                          return (
                            <div
                              key={pIndex}
                              className="flex items-start gap-3 ml-4"
                            >
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                              <p className="text-gray-700 leading-relaxed">
                                {trimmedParagraph.substring(2)}
                              </p>
                            </div>
                          );
                        }

                        // Handle sub-bullets with indentation
                        if (trimmedParagraph.match(/^\s+-\s/)) {
                          return (
                            <div
                              key={pIndex}
                              className="flex items-start gap-3 ml-8"
                            >
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></span>
                              <p className="text-gray-600 leading-relaxed text-sm">
                                {trimmedParagraph.replace(/^\s+-\s/, "")}
                              </p>
                            </div>
                          );
                        }

                        // Regular paragraphs
                        return (
                          <p
                            key={pIndex}
                            className="text-gray-700 leading-relaxed"
                          >
                            {trimmedParagraph}
                          </p>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}

          {isLongAnalysis && !isExpanded && analysisSection.length > 3 && (
            <div className="text-center py-6 border-t border-gray-200">
              <p className="text-gray-500 mb-4">
                {analysisSection.length - 3} more section
                {analysisSection.length - 3 !== 1 ? "s" : ""} available
              </p>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {isLongAnalysis && (
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors duration-200 border border-blue-200"
            >
              {isExpanded ? (
                <>
                  <span>📄</span>
                  <span>Show Less</span>
                  <span>↑</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Read Complete Analysis</span>
                  <span>↓</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer Information */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>📊 Analysis powered by FRC AI</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>Based on historical performance data</span>
            </div>
            {generatedDate && (
              <span>
                Last updated:{" "}
                {new Date(generatedDate).toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;
