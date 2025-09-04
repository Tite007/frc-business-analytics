// Puppeteer PDF generation service for enterprise-grade PDF quality
// This creates PDFs using Chrome's rendering engine for pixel-perfect output

export class PuppeteerPDFService {
  constructor() {
    this.isServer = typeof window === "undefined";
  }

  async generateHighQualityPDF(reportData, options = {}) {
    try {
      if (this.isServer) {
        // Server-side generation using Puppeteer
        return await this.generateServerSidePDF(reportData, options);
      } else {
        // Client-side fallback using fetch to API endpoint
        return await this.generateClientSidePDF(reportData, options);
      }
    } catch (error) {
      console.error("Error generating high-quality PDF:", error);
      throw error;
    }
  }

  async generateServerSidePDF(reportData, options) {
    const puppeteer = await import("puppeteer");

    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    });

    try {
      const page = await browser.newPage();

      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2, // High DPI for crisp text
      });

      // Generate HTML content
      const htmlContent = this.generateProfessionalHTML(reportData);

      // Set content with optimized CSS
      await page.setContent(htmlContent, {
        waitUntil: ["networkidle0", "domcontentloaded"],
      });

      // Generate PDF with high-quality settings
      const pdfBuffer = await page.pdf({
        format: options.format || "Letter",
        printBackground: true,
        margin: {
          top: "0.75in",
          bottom: "0.75in",
          left: "0.5in",
          right: "0.5in",
        },
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        scale: 1.0, // Ensure 1:1 scale for crisp text
      });

      return pdfBuffer;
    } finally {
      await browser.close();
    }
  }

  async generateClientSidePDF(reportData, options) {
    // Call server-side API endpoint
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reportData, options }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    return await response.arrayBuffer();
  }

  generateProfessionalHTML(reportData) {
    const {
      date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      companyName = "Company Name",
      tickers = [{ symbol: "TICKER", exchange: "NASDAQ" }],
      sector = "Technology",
      rating = "BUY",
      currentPrice = "$0.00",
      fairValue = "$0.00",
      risk = "4",
      title = "Research Report Title",
      highlights = [],
      analystInfo = {
        name: "Analyst Name",
        title: "Senior Analyst",
      },
      companyData = {},
      performanceData = [],
      disclaimer = "Important disclosures and risk definitions on last page.",
    } = reportData;

    const formatTickers = (tickers) => {
      return tickers
        .map((ticker) => `${ticker.symbol} (${ticker.exchange})`)
        .join(", ");
    };

    const getRatingColor = (rating) => {
      switch (rating?.toUpperCase()) {
        case "BUY":
          return "#16a34a";
        case "HOLD":
          return "#ca8a04";
        case "SELL":
          return "#dc2626";
        default:
          return "#6b7280";
      }
    };

    const highlightsList =
      highlights.length > 0
        ? highlights
        : [
            "Q2 revenue grew 47% year-over-year, driven by strong customer adoption",
            "Gross margins expanded to 73%, up from 68% in the prior year",
            "Management raised full-year guidance across all key metrics",
          ];

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Financial Report - ${companyName}</title>
    <style>
        @page {
            size: Letter;
            margin: 0.75in 0.5in;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.4;
            color: #000000;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .pdf-container {
            width: 100%;
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            font-size: 12pt;
            line-height: 1.4;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1a2c45;
            padding: 16px 24px;
            margin: 0 -18px 24px -18px;
            border-radius: 6px;
            color: white;
        }

        .header-logo {
            font-size: 14px;
            font-weight: bold;
        }

        .header-date {
            font-size: 14px;
            font-weight: bold;
        }

        /* Company Section */
        .company-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
        }

        .company-info {
            flex: 1;
            padding-right: 40px;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #b45309;
            margin-bottom: 8px;
        }

        .ticker {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 16px;
        }

        .report-title {
            font-size: 18px;
            font-weight: bold;
            color: #000000;
            line-height: 1.3;
        }

        .rating-section {
            text-align: right;
        }

        .rating-badge {
            display: inline-block;
            background: ${getRatingColor(rating)};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .price-info {
            font-size: 12px;
            color: #6b7280;
            line-height: 1.4;
        }

        .price-info div {
            margin-bottom: 4px;
        }

        /* Sector Section */
        .sector-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 16px 0 24px 0;
            padding-bottom: 20px;
            border-bottom: 1px solid #d1d5db;
        }

        .sector-badge {
            background: #f3f4f6;
            color: #374151;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
        }

        .company-link {
            font-size: 11px;
            color: #2563eb;
            text-decoration: underline;
        }

        /* Content Section */
        .content-section {
            display: flex;
            gap: 32px;
        }

        .main-content {
            flex: 1;
        }

        .sidebar {
            width: 220px;
            flex-shrink: 0;
        }

        /* Highlights */
        .highlights-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 12px;
            color: #000000;
        }

        .highlights-list {
            margin-bottom: 24px;
        }

        .highlight-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 8px;
            font-size: 11px;
            line-height: 1.4;
        }

        .bullet-point {
            color: #6b7280;
            margin-right: 8px;
            flex-shrink: 0;
            margin-top: 2px;
        }

        .highlight-text {
            flex: 1;
            color: #000000;
        }

        /* Sidebar */
        .sidebar-section {
            margin-bottom: 20px;
        }

        .sidebar-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #000000;
        }

        .analyst-name {
            font-size: 11px;
            font-weight: bold;
            color: #000000;
        }

        .analyst-title {
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 16px;
        }

        /* Chart Placeholder */
        .chart-placeholder {
            width: 100%;
            height: 120px;
            background: #f3f4f6;
            border: 1px solid #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
        }

        .chart-text {
            font-size: 10px;
            color: #6b7280;
        }

        /* Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
            font-size: 9px;
        }

        .data-table th {
            background: #f9fafb;
            color: #000000;
            font-weight: bold;
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            text-align: left;
            font-size: 8px;
        }

        .data-table td {
            padding: 6px 8px;
            border: 1px solid #d1d5db;
            color: #000000;
            font-size: 8px;
        }

        .data-table .text-right {
            text-align: right;
        }

        .data-table .font-medium {
            font-weight: 600;
        }

        /* Footer */
        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #d1d5db;
            font-size: 10px;
            color: #6b7280;
        }

        .footer-disclaimer {
            margin-bottom: 12px;
        }

        .footer-info {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;
        }

        /* Print optimizations */
        @media print {
            .pdf-container {
                max-width: none;
                margin: 0;
            }
            
            body {
                font-size: 10pt;
            }
            
            .company-name {
                font-size: 20px;
            }
            
            .report-title {
                font-size: 16px;
            }
            
            .rating-badge {
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <!-- Header -->
        <div class="header">
            <div class="header-logo">FUNDAMENTAL RESEARCH CORP</div>
            <div class="header-date">${date}</div>
        </div>

        <!-- Company Section -->
        <div class="company-section">
            <div class="company-info">
                <div class="company-name">${companyName}</div>
                <div class="ticker">(${formatTickers(tickers)})</div>
                <div class="report-title">${title}</div>
            </div>
            <div class="rating-section">
                <div class="rating-badge">${rating}</div>
                <div class="price-info">
                    <div>Current Price: <strong>${currentPrice}</strong></div>
                    <div>Fair Value: <strong>${fairValue}</strong></div>
                    <div>Risk*: <strong>${risk}</strong></div>
                </div>
            </div>
        </div>

        <!-- Sector Section -->
        <div class="sector-section">
            <div class="sector-badge">Sector: ${sector}</div>
            <div class="company-link">Click here for more research on the company</div>
        </div>

        <!-- Content Section -->
        <div class="content-section">
            <!-- Main Content -->
            <div class="main-content">
                <div class="highlights-title">Highlights</div>
                <div class="highlights-list">
                    ${highlightsList
                      .map(
                        (highlight) => `
                        <div class="highlight-item">
                            <div class="bullet-point">•</div>
                            <div class="highlight-text">${highlight}</div>
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>

            <!-- Sidebar -->
            <div class="sidebar">
                <!-- Analyst Info -->
                <div class="sidebar-section">
                    <div class="analyst-name">${analystInfo.name}</div>
                    <div class="analyst-title">${analystInfo.title}</div>
                </div>

                <!-- Chart -->
                <div class="sidebar-section">
                    <div class="sidebar-title">Price and Volume (1-year)</div>
                    <div class="chart-placeholder">
                        <div class="chart-text">Chart Area</div>
                    </div>
                </div>

                <!-- Performance Table -->
                <div class="sidebar-section">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th class="text-right">YTD</th>
                                <th class="text-right">1M</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${
                              performanceData.length > 0
                                ? performanceData
                                    .map(
                                      (item) => `
                                <tr>
                                    <td class="font-medium">${item.security}</td>
                                    <td class="text-right">${item.ytd}</td>
                                    <td class="text-right">${item.twelveMonth}</td>
                                </tr>
                            `
                                    )
                                    .join("")
                                : `
                                <tr>
                                    <td class="font-medium">ZEPP</td>
                                    <td class="text-right">1,292%</td>
                                    <td class="text-right">1,232%</td>
                                </tr>
                                <tr>
                                    <td class="font-medium">NYSE</td>
                                    <td class="text-right">9%</td>
                                    <td class="text-right">10%</td>
                                </tr>
                            `
                            }
                        </tbody>
                    </table>
                </div>

                <!-- Company Data -->
                <div class="sidebar-section">
                    <div class="sidebar-title">Company Data</div>
                    <table class="data-table">
                        <tbody>
                            <tr>
                                <td class="font-medium">52 Week Range</td>
                                <td class="text-right">${
                                  companyData.weekRange || "US$2.12-43.93"
                                }</td>
                            </tr>
                            <tr>
                                <td class="font-medium">Shares O/S</td>
                                <td class="text-right">${
                                  companyData.sharesOS || "14.4M"
                                }</td>
                            </tr>
                            <tr>
                                <td class="font-medium">Market Cap.</td>
                                <td class="text-right">${
                                  companyData.marketCap || "US$570M"
                                }</td>
                            </tr>
                            <tr>
                                <td class="font-medium">Yield (forward)</td>
                                <td class="text-right">${
                                  companyData.yieldForward || "N/A"
                                }</td>
                            </tr>
                            <tr>
                                <td class="font-medium">P/E (forward)</td>
                                <td class="text-right">${
                                  companyData.peForward || "N/A"
                                }</td>
                            </tr>
                            <tr>
                                <td class="font-medium">P/B</td>
                                <td class="text-right">${
                                  companyData.pb || "2.5x"
                                }</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-disclaimer">
                <strong>*</strong> ${disclaimer}
            </div>
            <div class="footer-info">
                <span>©2025 Fundamental Research Corp.</span>
                <span>"22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront"</span>
                <span>www.researchfrc.com</span>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  downloadPDF(pdfBuffer, filename = "financial-report.pdf") {
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default PuppeteerPDFService;
