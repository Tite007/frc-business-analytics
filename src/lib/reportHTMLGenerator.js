// Utility for generating HTML from financial report data for PDF export

export function generateFinancialReportHTML(reportData, paperSize = { width: 8.5, height: 11, unit: "in" }) {
  // Convert paper size to pixels for CSS
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

  const pixelDimensions = getPixelDimensions(paperSize);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Financial Report - ${reportData.company.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f8f9fa;
      padding: 24px;
      color: #1f2937;
    }
    
    .report-container {
      max-width: ${pixelDimensions.width}px;
      width: 100%;
      height: ${pixelDimensions.height}px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 32px;
      font-size: 12px;
      line-height: 1.4;
    }
    
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .logo-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    
    .logo-bars {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .logo-bar {
      border-radius: 2px;
    }
    
    .logo-bar-1 { width: 64px; height: 12px; background: #60a5fa; }
    .logo-bar-2 { width: 48px; height: 12px; background: #93c5fd; }
    .logo-bar-3 { width: 16px; height: 12px; background: #bfdbfe; }
    
    .logo-text {
      background: #60a5fa;
      color: white;
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 500;
      line-height: 1.2;
    }
    
    .report-date {
      color: #6b7280;
      font-weight: 500;
    }
    
    .company-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .company-info h1 {
      font-size: 24px;
      font-weight: bold;
      color: #d97706;
      margin-bottom: 4px;
    }
    
    .company-ticker {
      color: #6b7280;
      font-size: 14px;
    }
    
    .recommendation-box {
      text-align: right;
    }
    
    .rating-badge {
      background: #2563eb;
      color: white;
      padding: 4px 12px;
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 4px;
      display: inline-block;
    }
    
    .recommendation-details {
      font-size: 14px;
      color: #6b7280;
    }
    
    .recommendation-details div {
      margin-bottom: 2px;
    }
    
    .recommendation-details span {
      font-weight: 500;
    }
    
    .main-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    
    .content-section {
      display: flex;
      gap: 24px;
    }
    
    .main-content {
      flex: 1;
    }
    
    .sidebar {
      width: 192px;
    }
    
    .sector-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    
    .sector-plus {
      border: 1px solid #9ca3af;
      padding: 2px 8px;
    }
    
    .sector-text {
      color: #6b7280;
    }
    
    .highlights {
      margin-bottom: 16px;
    }
    
    .highlights h3 {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .highlights-list {
      font-size: 12px;
    }
    
    .highlight-item {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .main-points {
      font-size: 12px;
    }
    
    .main-point {
      margin-bottom: 12px;
    }
    
    .main-point-title {
      font-weight: bold;
    }
    
    .additional-content {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .sidebar-link {
      text-align: right;
      margin-bottom: 16px;
    }
    
    .sidebar-link a {
      color: #2563eb;
      text-decoration: underline;
      font-size: 12px;
    }
    
    .author-info {
      margin-bottom: 16px;
    }
    
    .author-name {
      font-size: 12px;
      font-weight: bold;
    }
    
    .author-title {
      font-size: 12px;
      color: #6b7280;
    }
    
    .chart-placeholder {
      margin-bottom: 16px;
    }
    
    .chart-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .chart-area {
      width: 100%;
      height: 96px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      font-size: 12px;
    }
    
    .stock-data {
      font-size: 12px;
      margin-bottom: 16px;
    }
    
    .stock-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }
    
    .stock-values {
      text-align: right;
    }
    
    .stock-values div {
      margin-bottom: 2px;
    }
    
    .company-data {
      margin-top: 16px;
    }
    
    .company-data-title {
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .company-data-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .financial-table-section {
      margin-top: 24px;
    }
    
    .financial-table-title {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .financial-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    
    .financial-table th {
      border-bottom: 1px solid #d1d5db;
      padding: 4px 0;
    }
    
    .financial-table th:first-child {
      text-align: left;
    }
    
    .financial-table th:not(:first-child) {
      text-align: right;
    }
    
    .financial-table td {
      padding: 2px 0;
    }
    
    .financial-table td:not(:first-child) {
      text-align: right;
    }
    
    .footer-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #d1d5db;
      font-size: 12px;
      color: #6b7280;
    }
    
    .disclaimer {
      margin-bottom: 8px;
    }
    
    .disclaimer .risk-asterisk {
      color: #dc2626;
      font-weight: bold;
    }
    
    .footer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .report-container {
        box-shadow: none;
        height: auto;
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="logo-section">
        <div class="logo-bars">
          <div class="logo-bar logo-bar-1"></div>
          <div class="logo-bar logo-bar-2"></div>
          <div class="logo-bar logo-bar-3"></div>
        </div>
        <div class="logo-text">
          Fundamental<br>
          Research<br>
          Corp.
        </div>
      </div>
      <div class="report-date">
        ${reportData.reportDate}
      </div>
    </div>

    <!-- Company Header -->
    <div class="company-header">
      <div class="company-info">
        <h1>${reportData.company.name}</h1>
        <p class="company-ticker">${reportData.company.ticker}</p>
      </div>
      <div class="recommendation-box">
        <div class="rating-badge">
          ${reportData.recommendation.rating}
        </div>
        <div class="recommendation-details">
          <div>
            Current Price: <span>${reportData.recommendation.currentPrice}</span>
          </div>
          <div>
            Fair Value: <span>${reportData.recommendation.fairValue}</span>
          </div>
          <div>
            Risk*: <span>${reportData.recommendation.risk}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Title -->
    <h2 class="main-title">
      ${reportData.title}
    </h2>

    <!-- Content Section -->
    <div class="content-section">
      <div class="main-content">
        <!-- Sector Info -->
        <div class="sector-info">
          <span class="sector-plus">+</span>
          <span class="sector-text">
            Sector: ${reportData.company.sector}
          </span>
        </div>

        <!-- Highlights -->
        <div class="highlights">
          <h3>Highlights</h3>
          <div class="highlights-list">
            ${reportData.highlights.map(highlight => `
              <div class="highlight-item">
                <span>➤</span>
                <p>${highlight}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Main Points -->
        <div class="main-points">
          ${reportData.mainPoints.map((point, index) => `
            <div class="main-point">
              <span class="main-point-title">
                ${String.fromCharCode(97 + index)}) ${point.title}
              </span> 
              ${point.content}
            </div>
          `).join('')}

          ${reportData.additionalContent.map(content => `
            <div class="additional-content">
              <span>➤</span>
              <p>${content}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="sidebar">
        <div class="sidebar-link">
          <a href="#">Click here for more research on the company</a>
        </div>

        <div class="author-info">
          <p class="author-name">
            ${reportData.author.name}
          </p>
          <p class="author-title">${reportData.author.title}</p>
        </div>

        <!-- Price Chart Placeholder -->
        <div class="chart-placeholder">
          <h4 class="chart-title">
            Price and Volume (1-year)
          </h4>
          <div class="chart-area">
            Chart Area
          </div>
        </div>

        <!-- Stock Data -->
        <div class="stock-data">
          <div class="stock-row">
            <span>${reportData.company.ticker.replace(/[()]/g, '')}</span>
            <div class="stock-values">
              <div>YTD: ${reportData.stockPerformance.ytd}</div>
              <div>1M: ${reportData.stockPerformance.oneMonth}</div>
            </div>
          </div>
          <div class="stock-row">
            <span>NYSE</span>
            <div class="stock-values">
              <div>${reportData.stockPerformance.marketYtd}</div>
              <div>${reportData.stockPerformance.marketOneMonth}</div>
            </div>
          </div>
        </div>

        <!-- Company Data -->
        <div class="company-data">
          <h4 class="company-data-title">Company Data</h4>
          <div class="company-data-row">
            <span>52 Week Range</span>
            <span>${reportData.companyData.weekRange52}</span>
          </div>
          <div class="company-data-row">
            <span>Shares O/S</span>
            <span>${reportData.companyData.sharesOutstanding}</span>
          </div>
          <div class="company-data-row">
            <span>Market Cap.</span>
            <span>${reportData.companyData.marketCap}</span>
          </div>
          <div class="company-data-row">
            <span>Yield (forward)</span>
            <span>${reportData.companyData.yield}</span>
          </div>
          <div class="company-data-row">
            <span>P/E (forward)</span>
            <span>${reportData.companyData.forwardPE}</span>
          </div>
          <div class="company-data-row">
            <span>P/B</span>
            <span>${reportData.companyData.priceToBook}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Table -->
    <div class="financial-table-section">
      <h3 class="financial-table-title">
        Key Financial Data (US$, 000s; except EPS)
      </h3>
      <table class="financial-table">
        <thead>
          <tr>
            ${reportData.financialData.headers.map(header => `
              <th>${header}</th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          ${reportData.financialData.rows.map(row => `
            <tr>
              <td>${row.label}</td>
              ${row.values.map(value => `
                <td>${value}</td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <p class="disclaimer">
        <span class="risk-asterisk">*</span> ${reportData.disclaimer}
      </p>
      <div class="footer-info">
        <span>${reportData.footer.copyright}</span>
        <span>
          "${reportData.footer.tagline}"
        </span>
        <span>${reportData.footer.website}</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Function to generate PDF-optimized HTML (simplified for better PDF rendering)
export function generatePDFOptimizedHTML(reportData, paperSize = { width: 8.5, height: 11, unit: "in" }) {
  const baseHTML = generateFinancialReportHTML(reportData, paperSize);
  
  // Add PDF-specific optimizations
  return baseHTML.replace(
    '<style>',
    `<style>
    @page {
      size: ${paperSize.width}${paperSize.unit} ${paperSize.height}${paperSize.unit};
      margin: 0.5in;
    }
    `
  );
}

// Function to get report data as JSON for API calls
export function serializeReportData(reportData) {
  return JSON.stringify(reportData, null, 2);
}

// Function to parse report data from JSON
export function parseReportData(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing report data:', error);
    return null;
  }
}
