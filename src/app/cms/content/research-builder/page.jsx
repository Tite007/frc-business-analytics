"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { ResearchReportBuilder } from "@/components/FreeDocumentEditor";

export default function ResearchBuilderPage() {
  const handleSave = (reportData) => {
    console.log("Saving report:", reportData);
    // Here you would typically save to your backend
    alert("Report saved successfully!");
  };

  const handleExportPDF = (reportData) => {
    console.log("Exporting PDF:", reportData);
    // PDF export is handled automatically by the component
  };

  // Sample initial data for demonstration
  const sampleData = {
    companyName: "Kidoz Inc.",
    ticker: "KDOZ",
    rating: "BUY",
    currentPrice: "0.22",
    targetPrice: "0.70",
    date: "2025-08-30",
    executiveSummary: `<p><strong>Investment Recommendation:</strong> BUY</p>
<p><strong>Price Target:</strong> C$0.70 (218% upside potential)</p>
<p><strong>Current Price:</strong> C$0.22</p>

<h3>Key Investment Points</h3>
<ul>
<li><strong>Strong Q2 Performance:</strong> Despite a 2% YoY revenue decline in Q2, H1-2025 showed record revenue growth of 21% YoY</li>
<li><strong>Market Leadership:</strong> Outperforming major platforms with higher growth rates than YouTube (12%) and Meta (19%)</li>
<li><strong>Profitability Focus:</strong> Company remains profitable when excluding R&D costs, demonstrating operational efficiency</li>
</ul>

<h3>Financial Highlights</h3>
<p>Kidoz has demonstrated resilience in a challenging market environment, with record H1 performance offsetting Q2 softness. The company's adjusted FY EPS forecast shows continued confidence in long-term growth prospects.</p>`,
    content: `<h2>Company Overview</h2>
<p>Kidoz Inc. is a leading technology company in the children's digital advertising space, providing safe and engaging advertising solutions for family-friendly content. The company operates through its proprietary ad-tech platform that ensures brand safety while maximizing engagement with young audiences.</p>

<h2>Financial Analysis</h2>
<h3>Recent Performance</h3>
<ul>
<li><strong>Q2 2025:</strong> Revenue declined 2% YoY, missing forecasts by 4%</li>
<li><strong>H1 2025:</strong> Record revenue growth of 21% YoY</li>
<li><strong>Margins:</strong> Higher gross margins offset by increased G&A expenses</li>
<li><strong>Profitability:</strong> Remains profitable excluding R&D investments</li>
</ul>

<h3>Key Metrics Comparison</h3>
<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 16px 0;">
<thead>
<tr>
<th>Platform</th>
<th>Ad Revenue Growth (H1 2025)</th>
<th>Market Position</th>
</tr>
</thead>
<tbody>
<tr>
<td>Kidoz</td>
<td>21%</td>
<td>Niche Leader</td>
</tr>
<tr>
<td>YouTube (GOOGL)</td>
<td>12%</td>
<td>Market Leader</td>
</tr>
<tr>
<td>Meta (META)</td>
<td>19%</td>
<td>Market Leader</td>
</tr>
</tbody>
</table>

<h2>Investment Thesis</h2>
<h3>Growth Drivers</h3>
<ul>
<li><strong>Market Recovery:</strong> Expected resolution of U.S. tariff uncertainty should restore client ad spending</li>
<li><strong>Platform Innovation:</strong> Continued investment in R&D to enhance advertising effectiveness</li>
<li><strong>Market Expansion:</strong> Opportunities to capture larger share of children's digital advertising market</li>
</ul>

<h3>Competitive Advantages</h3>
<ul>
<li><strong>Specialized Focus:</strong> Deep expertise in child-safe advertising and family content</li>
<li><strong>Brand Safety:</strong> Strong reputation for maintaining brand safety standards</li>
<li><strong>Technology Platform:</strong> Proprietary ad-tech solutions tailored for young audiences</li>
</ul>

<div class="highlight-box">
<h3>💡 Key Catalyst</h3>
<p>The resolution of U.S. trade uncertainty and economic stabilization should drive a recovery in client advertising budgets, particularly benefiting specialized platforms like Kidoz that maintained market share during the downturn.</p>
</div>

<h2>Risk Factors</h2>
<div class="risk-warning">
<h3>⚠️ Investment Risks</h3>
<ul>
<li><strong>Economic Sensitivity:</strong> Revenue highly dependent on overall advertising market conditions</li>
<li><strong>Regulatory Risk:</strong> Increasing scrutiny of children's digital advertising and privacy regulations</li>
<li><strong>Market Concentration:</strong> Dependence on key clients for significant portion of revenue</li>
<li><strong>Competition:</strong> Larger platforms with greater resources may enter specialized market segments</li>
</ul>
</div>

<h2>Valuation and Price Target</h2>
<p>Our C$0.70 price target represents a significant upside opportunity based on:</p>
<ul>
<li><strong>Revenue Recovery:</strong> Expected return to growth trajectory as market conditions improve</li>
<li><strong>Margin Expansion:</strong> Operating leverage from fixed cost base as revenue grows</li>
<li><strong>Market Premium:</strong> Specialized platform deserves valuation premium to broader market</li>
</ul>

<h2>Conclusion</h2>
<p>Despite near-term headwinds, Kidoz Inc. presents a compelling investment opportunity. The company's strong H1 performance, market-leading position in children's digital advertising, and expected recovery in client spending support our <strong>BUY</strong> recommendation with a price target of <strong>C$0.70</strong>.</p>

<p>Investors should consider this name for exposure to the specialized children's digital advertising market, with expectations for significant upside as market conditions normalize.</p>`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Navigation */}
          <div className="flex items-center mb-6">
            <Link
              href="/cms/content"
              className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Back to Content</span>
            </Link>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                🚀 Free Research Report Builder
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Create professional investment research reports with direct PDF
                export - completely free!
              </p>
              <div className="mt-3 flex items-center space-x-6 text-sm">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  No subscriptions
                </div>
                <div className="flex items-center text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Direct PDF export
                </div>
                <div className="flex items-center text-purple-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Professional templates
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <ResearchReportBuilder
          onSave={handleSave}
          onExportPDF={handleExportPDF}
          initialData={sampleData}
        />
      </div>

      {/* Features Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Our Free Research Builder?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade research reports without the expensive
              subscriptions or complex software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Completely Free
              </h3>
              <p className="text-gray-600">
                No subscriptions, no limitations, no hidden costs. Create
                unlimited professional reports.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Professional Quality
              </h3>
              <p className="text-gray-600">
                Wall Street-grade formatting and layouts that rival expensive
                research platforms.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Instant Export
              </h3>
              <p className="text-gray-600">
                Direct PDF export through your browser - no external tools or
                processing delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
