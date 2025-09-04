"use client";

import React, { useState, useEffect } from "react";
import PDFReportLayout, {
  sampleReportData,
} from "../../components/PDFReportLayout_new";
import ClientOnly from "../../components/ClientOnly";

// Test data generator for multiple pages
const generateTestData = (pageCount = 20) => {
  const baseData = { ...sampleReportData };

  // Generate long highlights array
  const highlights = [];
  for (let i = 1; i <= Math.min(pageCount * 3, 50); i++) {
    highlights.push(
      `This is highlight number ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`
    );
  }

  // Generate large financial table with deterministic values
  const financialTable = [];
  const baseYears = [
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029,
  ];
  for (let i = 0; i < Math.min(pageCount, 10); i++) {
    // Use deterministic values based on index instead of Math.random()
    const seed = i + 1;
    financialTable.push({
      Period: baseYears[i] || 2029 + i,
      Cash: `${(seed * 1000000 + seed * 234567).toFixed(0)}`,
      "Working Capital": `${(seed * 1500000 + seed * 345678).toFixed(0)}`,
      "Total Assets": `${(seed * 5000000 + seed * 456789).toFixed(0)}`,
      "LT Debt to Capital": `${((seed * 3) % 30).toFixed(1)}%`,
      Revenue: `${(seed * 10000000 + seed * 567890).toFixed(0)}`,
      "Net Income": `${(seed % 2 === 0
        ? seed * 1000000
        : -seed * 500000
      ).toFixed(0)}`,
      EPS: `${(seed % 2 === 0 ? seed * 0.1 : -(seed * 0.05)).toFixed(3)}`,
      "EBITDA Margin": `${((seed * 4) % 40).toFixed(1)}%`,
      ROE: `${((seed * 2.5) % 25).toFixed(1)}%`,
      "Debt/Equity": `${((seed * 0.15) % 1.5).toFixed(2)}`,
    });
  }

  // Generate additional content sections with deterministic content
  const additionalSections = [];
  for (let i = 1; i <= pageCount; i++) {
    const sectionSeed = i + 10; // Different seed for variety
    additionalSections.push({
      title: `Analysis Section ${i}`,
      content: `
        <h3>Detailed Analysis ${i}</h3>
        <p>This is a comprehensive analysis section number ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        
        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        
        <h4>Key Metrics for Section ${i}</h4>
        <ul>
          <li>Revenue Growth: ${(((sectionSeed * 5) % 50) + 5).toFixed(1)}%</li>
          <li>Market Share: ${(((sectionSeed * 2) % 20) + 10).toFixed(1)}%</li>
          <li>Customer Satisfaction: ${(
            ((sectionSeed * 1.5) % 20) +
            80
          ).toFixed(1)}%</li>
          <li>Operational Efficiency: ${(((sectionSeed * 3) % 30) + 70).toFixed(
            1
          )}%</li>
        </ul>
        
        <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        
        <h4>Risk Assessment ${i}</h4>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
        
        <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
      `,
    });
  }

  return {
    ...baseData,
    title: `Comprehensive ${pageCount}-Page Analysis Report`,
    highlights,
    financialTable,
    additionalSections,
    htmlContent: additionalSections
      .map((section) => section.content)
      .join("\n\n"),
  };
};

export default function TestPDFPage() {
  const [pageCount, setPageCount] = useState(5);
  const [testData, setTestData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize data on client side to prevent hydration issues
  useEffect(() => {
    setTestData(generateTestData(5));
    setIsLoaded(true);
  }, []);

  const handlePageCountChange = (newCount) => {
    setPageCount(newCount);
    setTestData(generateTestData(newCount));
  };

  // Don't render until client-side hydration is complete
  if (!isLoaded || !testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-gray-900 mb-2">
            Loading PDF Test...
          </div>
          <div className="text-sm text-gray-600">Initializing test data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Controls */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            PDF Generation Test
          </h1>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Test Page Count:
            </label>
            <select
              value={pageCount}
              onChange={(e) => handlePageCountChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 Page</option>
              <option value={2}>2 Pages</option>
              <option value={5}>5 Pages</option>
              <option value={10}>10 Pages</option>
              <option value={15}>15 Pages</option>
              <option value={20}>20 Pages</option>
              <option value={30}>30 Pages</option>
              <option value={50}>50 Pages</option>
            </select>
            <div className="text-sm text-gray-600">
              Current test data: {testData.highlights.length} highlights,{" "}
              {testData.financialTable.length} financial rows
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              PDF Generation Test Information:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • This test generates content equivalent to {pageCount} pages of
                analysis
              </li>
              <li>
                • PDF generation uses html2canvas + jsPDF for high-quality
                output
              </li>
              <li>
                • Each page includes: highlights, financial data, charts, and
                detailed analysis
              </li>
              <li>
                • Performance will depend on content complexity and browser
                memory
              </li>
              <li>
                • Click "Generate PDF" button in the toolbar to test PDF
                creation
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* PDF Layout Component */}
      <ClientOnly
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-900 mb-2">
                Loading PDF Preview...
              </div>
              <div className="text-sm text-gray-600">
                Initializing components
              </div>
            </div>
          </div>
        }
      >
        <PDFReportLayout
          reportData={testData}
          onGeneratePDF={() => console.log("PDF generation handled internally")}
        />
      </ClientOnly>
    </div>
  );
}
