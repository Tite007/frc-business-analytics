"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer, FileText } from "lucide-react";

const paperSizes = [
  { name: "Letter", width: 8.5, height: 11, unit: "in" },
  { name: "A4", width: 210, height: 297, unit: "mm" },
  { name: "Legal", width: 8.5, height: 14, unit: "in" },
];

export function DynamicFinancialReport({ reportData, onExportPDF, onPrint }) {
  const [selectedSize, setSelectedSize] = useState(paperSizes[0]);

  // Convert paper size to pixels (assuming 96 DPI)
  const getPixelDimensions = (size) => {
    if (size.unit === "in") {
      return {
        width: size.width * 96,
        height: size.height * 96,
      };
    } else {
      // Convert mm to inches then to pixels
      return {
        width: (size.width / 25.4) * 96,
        height: (size.height / 25.4) * 96,
      };
    }
  };

  const pixelDimensions = getPixelDimensions(selectedSize);

  // Default data structure if no reportData is provided
  const defaultData = {
    reportDate: "August 21, 2025",
    company: {
      name: "Zepp Health Corporation",
      ticker: "(NYSE: ZEPP)",
      sector: "Consumer Electronics",
    },
    recommendation: {
      rating: "BUY",
      currentPrice: "US$39.70",
      fairValue: "US$60.23",
      risk: "3",
    },
    title: "Revenue Soars, Institutional Support Fuels Rally",
    author: {
      name: "Sid Rajeev, B.Tech, MBA, CFA",
      title: "Head of Research",
    },
    highlights: [
      "Zepp's Q2 revenue blew past expectations, rising 60% YoY to $59M, well above management's $50–55M guidance, and 17% ahead of our estimate. Net losses narrowed 29%, beating our estimate by 13%.",
      "ZEPP is up 1,544% in the past two months, hitting a four-year high. The rally comes as no surprise. In our prior reports, we had flagged that Zepp was trading below its liquid asset value, with the market largely ignoring its underlying potential. We attribute the stock spike to four main factors:",
    ],
    mainPoints: [
      {
        title: "Strong Amazon Prime Day Performance (NASDAQ: AMZN):",
        content:
          "Zepp recorded its best-ever Prime Day in July 2025. In the U.S., Amazfit was ranked the second most improved wearables brand YoY, while sales in EMEA rose 15% YoY.",
      },
      {
        title: "Institutional Support Boosts Confidence:",
        content:
          "Point72 Asset Management, led by billionaire Steve Cohen, disclosed a 6% stake last month. Together with Allspring Global (formerly Wells Fargo Asset Management) and FTLH (Fidelity), these three institutions now own over 24% of ZEPP, significantly increasing investor confidence.",
      },
      {
        title: "Viomi Technology's Rapid Interest:",
        content:
          "Viomi Technology (NASDAQ: VIOT) announced a special dividend and surged 177% in the past two months. Both Viomi and Zepp are Chinese tech companies with strategic partnerships with Xiaomi (SEHK: 1810; up 169% YoY). Viomi's strong performance likely renewed interest in Xiaomi-affiliated stocks like Zepp.",
      },
      {
        title: "Positive Sector-Wide Momentum:",
        content:
          "A broader uptrend in Chinese tech stocks supports Zepp's rally. The S&P China Select ADR Index is up 24% YTD, outperforming the S&P 500's 9% gain.",
      },
    ],
    additionalContent: [
      "Industry sources report that global smartwatch shipments rose over 10% YoY in Q2, with most major players delivering solid gains. Consensus forecasts project 6% growth in 2025, and 8% in 2026, driven by product upgrades, increased health awareness, AI integration, and growing wearables adoption.",
    ],
    stockPerformance: {
      ytd: "1,292%",
      oneMonth: "1,232%",
      marketYtd: "9%",
      marketOneMonth: "10%",
    },
    companyData: {
      weekRange52: "US$2.12-43.93",
      sharesOutstanding: "14.4M",
      marketCap: "US$570M",
      yield: "N/A",
      forwardPE: "N/A",
      priceToBook: "2.5x",
    },
    financialData: {
      headers: ["YE Dec 31st", "2024", "2025E", "2026E"],
      rows: [
        { label: "Cash", values: ["110,735", "97,642", "87,094"] },
        { label: "Working Capital", values: ["56,197", "96,399", "87,457"] },
        { label: "Total Assets", values: ["528,593", "526,127", "526,265"] },
        { label: "LT-Debt", values: ["75,241", "143,018", "143,018"] },
        { label: "Revenue", values: ["182,603", "237,475", "271,511"] },
        { label: "Gross Profit", values: ["70,234", "91,428", "108,604"] },
        { label: "Net Income", values: ["-75,733", "-30,069", "-11,684"] },
        { label: "EPS", values: ["-0.29", "-0.12", "-0.05"] },
      ],
    },
    disclaimer:
      "Zepp Health has paid FRC a fee for research coverage and distribution of reports. See last page for other important disclosures, rating, and risk definitions. All figures in US$ unless otherwise specified.",
    footer: {
      copyright: "©2025 Fundamental Research Corp.",
      tagline:
        "22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront",
      website: "www.researchfrc.com",
    },
  };

  // Use provided data or fall back to default
  const data = reportData || defaultData;

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF(data, selectedSize);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(data, selectedSize);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header Controls */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Financial Report Layout
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <Select
                value={selectedSize.name}
                onValueChange={(value) => {
                  const size = paperSizes.find((s) => s.name === value);
                  if (size) setSelectedSize(size);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperSizes.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.name} ({size.width} × {size.height} {size.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </header>

      {/* Document Layout */}
      <main className="flex-1 overflow-auto bg-muted/30 p-6">
        <div className="flex justify-center">
          <Card
            id="financial-report-content"
            className="shadow-lg bg-white p-8"
            style={{
              width: pixelDimensions.width,
              height: pixelDimensions.height,
              fontSize: "12px",
              lineHeight: "1.4",
            }}
          >
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <div className="w-16 h-3 bg-blue-400 rounded-sm"></div>
                  <div className="w-12 h-3 bg-blue-300 rounded-sm"></div>
                  <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
                </div>
                <div>
                  <div className="text-white bg-blue-400 px-2 py-1 text-xs font-medium">
                    Fundamental
                    <br />
                    Research
                    <br />
                    Corp.
                  </div>
                </div>
              </div>
              <div className="text-right text-gray-600 font-medium">
                {data.reportDate}
              </div>
            </div>

            {/* Company Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-amber-700 mb-1">
                  {data.company.name}
                </h1>
                <p className="text-gray-600 text-sm">{data.company.ticker}</p>
              </div>
              <div className="text-right">
                <div className="bg-blue-600 text-white px-3 py-1 text-lg font-bold mb-1">
                  {data.recommendation.rating}
                </div>
                <div className="text-sm text-gray-600">
                  <div>
                    Current Price:{" "}
                    <span className="font-medium">
                      {data.recommendation.currentPrice}
                    </span>
                  </div>
                  <div>
                    Fair Value:{" "}
                    <span className="font-medium">
                      {data.recommendation.fairValue}
                    </span>
                  </div>
                  <div>
                    Risk*:{" "}
                    <span className="font-medium">
                      {data.recommendation.risk}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h2 className="text-lg font-bold mb-4">{data.title}</h2>

            {/* Content Section */}
            <div className="flex gap-6">
              <div className="flex-1">
                {/* Sector Info */}
                <div className="flex items-center gap-2 mb-4 text-sm">
                  <span className="border border-gray-400 px-2 py-1">+</span>
                  <span className="text-gray-600">
                    Sector: {data.company.sector}
                  </span>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <h3 className="font-bold text-sm mb-2">Highlights</h3>
                  <div className="text-xs space-y-2">
                    {data.highlights.map((highlight, index) => (
                      <div key={index} className="flex gap-2">
                        <span>➤</span>
                        <p>{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Points */}
                <div className="text-xs space-y-3">
                  {data.mainPoints.map((point, index) => (
                    <div key={index}>
                      <span className="font-bold">
                        {String.fromCharCode(97 + index)}) {point.title}
                      </span>{" "}
                      {point.content}
                    </div>
                  ))}

                  {data.additionalContent.map((content, index) => (
                    <div key={index} className="flex gap-2">
                      <span>➤</span>
                      <p dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="w-48">
                <div className="text-right mb-4">
                  <a href="#" className="text-blue-600 underline text-xs">
                    Click here for more research on the company
                  </a>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-bold">{data.author.name}</p>
                  <p className="text-xs text-gray-600">{data.author.title}</p>
                </div>

                {/* Price Chart Placeholder */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold mb-2">
                    Price and Volume (1-year)
                  </h4>
                  <div className="w-full h-24 bg-gray-100 border flex items-center justify-center">
                    <div className="text-xs text-gray-500">Chart Area</div>
                  </div>
                </div>

                {/* Stock Data */}
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>{data.company.ticker.replace(/[()]/g, "")}</span>
                    <div className="text-right">
                      <div>YTD: {data.stockPerformance.ytd}</div>
                      <div>1M: {data.stockPerformance.oneMonth}</div>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>NYSE</span>
                    <div className="text-right">
                      <div>{data.stockPerformance.marketYtd}</div>
                      <div>{data.stockPerformance.marketOneMonth}</div>
                    </div>
                  </div>
                </div>

                {/* Company Data */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold mb-2">Company Data</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>52 Week Range</span>
                      <span>{data.companyData.weekRange52}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares O/S</span>
                      <span>{data.companyData.sharesOutstanding}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Market Cap.</span>
                      <span>{data.companyData.marketCap}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yield (forward)</span>
                      <span>{data.companyData.yield}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P/E (forward)</span>
                      <span>{data.companyData.forwardPE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P/B</span>
                      <span>{data.companyData.priceToBook}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Table */}
            <div className="mt-6">
              <h3 className="text-sm font-bold mb-2">
                Key Financial Data (US$, 000s; except EPS)
              </h3>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    {data.financialData.headers.map((header, index) => (
                      <th
                        key={index}
                        className={
                          index === 0 ? "text-left py-1" : "text-right py-1"
                        }
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {data.financialData.rows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.label}</td>
                      {row.values.map((value, valueIndex) => (
                        <td key={valueIndex} className="text-right">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t text-xs text-gray-600">
              <p className="mb-2">
                <span className="text-red-600 font-bold">*</span>{" "}
                {data.disclaimer}
              </p>
              <div className="flex justify-between items-center">
                <span>{data.footer.copyright}</span>
                <span>"{data.footer.tagline}"</span>
                <span>{data.footer.website}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
