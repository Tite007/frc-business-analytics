// Data structure interface for Financial Reports
export const FinancialReportDataStructure = {
  reportDate: "string", // e.g., "August 21, 2025"
  company: {
    name: "string", // e.g., "Zepp Health Corporation"
    ticker: "string", // e.g., "(NYSE: ZEPP)"
    sector: "string", // e.g., "Consumer Electronics"
  },
  recommendation: {
    rating: "string", // e.g., "BUY", "SELL", "HOLD"
    currentPrice: "string", // e.g., "US$39.70"
    fairValue: "string", // e.g., "US$60.23"
    risk: "string", // e.g., "3"
  },
  title: "string", // Main report title
  author: {
    name: "string", // e.g., "Sid Rajeev, B.Tech, MBA, CFA"
    title: "string", // e.g., "Head of Research"
  },
  highlights: ["array of strings"], // Key highlights as bullet points
  mainPoints: [
    {
      title: "string", // Point title
      content: "string", // Point content
    },
  ],
  additionalContent: ["array of strings"], // Additional paragraphs
  stockPerformance: {
    ytd: "string", // e.g., "1,292%"
    oneMonth: "string", // e.g., "1,232%"
    marketYtd: "string", // e.g., "9%"
    marketOneMonth: "string", // e.g., "10%"
  },
  companyData: {
    weekRange52: "string", // e.g., "US$2.12-43.93"
    sharesOutstanding: "string", // e.g., "14.4M"
    marketCap: "string", // e.g., "US$570M"
    yield: "string", // e.g., "N/A"
    forwardPE: "string", // e.g., "N/A"
    priceToBook: "string", // e.g., "2.5x"
  },
  financialData: {
    headers: ["array of strings"], // Table headers
    rows: [
      {
        label: "string", // Row label
        values: ["array of strings"], // Row values
      },
    ],
  },
  disclaimer: "string", // Footer disclaimer text
  footer: {
    copyright: "string", // e.g., "©2025 Fundamental Research Corp."
    tagline: "string", // Company tagline
    website: "string", // e.g., "www.researchfrc.com"
  },
};

// Sample data for testing
export const sampleReportData = {
  reportDate: "August 31, 2025",
  company: {
    name: "Apple Inc.",
    ticker: "(NASDAQ: AAPL)",
    sector: "Technology Hardware",
  },
  recommendation: {
    rating: "BUY",
    currentPrice: "US$175.25",
    fairValue: "US$200.00",
    risk: "2",
  },
  title: "iPhone 16 Launch Drives Strong Q4 Performance",
  author: {
    name: "John Smith, CFA",
    title: "Senior Technology Analyst",
  },
  highlights: [
    "Apple's Q4 revenue exceeded expectations, rising 8% YoY to $94.9B, driven by strong iPhone 16 sales and robust services growth.",
    "The new iPhone 16 series with advanced AI capabilities has generated significant consumer interest, with pre-orders up 15% compared to iPhone 15 launch.",
  ],
  mainPoints: [
    {
      title: "Strong iPhone 16 Adoption:",
      content:
        "The iPhone 16 series launch has been Apple's most successful in three years, with the Pro models particularly popular due to enhanced camera capabilities and AI features.",
    },
    {
      title: "Services Revenue Growth:",
      content:
        "Services segment grew 12% YoY to $22.3B, driven by App Store, iCloud, and Apple Music subscriptions reaching new highs.",
    },
    {
      title: "China Market Recovery:",
      content:
        "After several challenging quarters, Apple's China revenue showed signs of recovery, declining only 2% YoY compared to previous double-digit declines.",
    },
  ],
  additionalContent: [
    "Looking ahead, Apple's focus on AI integration across its ecosystem positions the company well for the next growth cycle. The company's <span class='font-bold'>Vision Pro</span> is also gaining traction in enterprise markets.",
  ],
  stockPerformance: {
    ytd: "22%",
    oneMonth: "8%",
    marketYtd: "18%",
    marketOneMonth: "5%",
  },
  companyData: {
    weekRange52: "US$164.08-199.62",
    sharesOutstanding: "15.3B",
    marketCap: "US$2.68T",
    yield: "0.5%",
    forwardPE: "28.5x",
    priceToBook: "45.2x",
  },
  financialData: {
    headers: ["YE Sept 30th", "2023", "2024E", "2025E"],
    rows: [
      { label: "Cash", values: ["162,000", "158,000", "155,000"] },
      { label: "Revenue", values: ["383,285", "394,328", "420,500"] },
      { label: "Gross Profit", values: ["169,148", "176,215", "189,225"] },
      { label: "Net Income", values: ["96,995", "101,500", "108,750"] },
      { label: "EPS", values: ["6.13", "6.64", "7.11"] },
    ],
  },
  disclaimer:
    "This report is for informational purposes only. See important disclosures and risk definitions on the last page.",
  footer: {
    copyright: "©2025 Fundamental Research Corp.",
    tagline:
      "22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront",
    website: "www.researchfrc.com",
  },
};

// Function to validate report data structure
export function validateReportData(data) {
  const errors = [];

  if (!data.reportDate) errors.push("reportDate is required");
  if (!data.company?.name) errors.push("company.name is required");
  if (!data.company?.ticker) errors.push("company.ticker is required");
  if (!data.company?.sector) errors.push("company.sector is required");
  if (!data.recommendation?.rating)
    errors.push("recommendation.rating is required");
  if (!data.title) errors.push("title is required");
  if (!data.author?.name) errors.push("author.name is required");
  if (!Array.isArray(data.highlights))
    errors.push("highlights must be an array");
  if (!Array.isArray(data.mainPoints))
    errors.push("mainPoints must be an array");
  if (!data.financialData?.headers)
    errors.push("financialData.headers is required");
  if (!Array.isArray(data.financialData?.rows))
    errors.push("financialData.rows must be an array");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Function to create empty report data template
export function createEmptyReportData() {
  return {
    reportDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    company: {
      name: "",
      ticker: "",
      sector: "",
    },
    recommendation: {
      rating: "HOLD",
      currentPrice: "",
      fairValue: "",
      risk: "3",
    },
    title: "",
    author: {
      name: "",
      title: "",
    },
    highlights: [],
    mainPoints: [],
    additionalContent: [],
    stockPerformance: {
      ytd: "",
      oneMonth: "",
      marketYtd: "",
      marketOneMonth: "",
    },
    companyData: {
      weekRange52: "",
      sharesOutstanding: "",
      marketCap: "",
      yield: "",
      forwardPE: "",
      priceToBook: "",
    },
    financialData: {
      headers: ["YE Dec 31st", "", "", ""],
      rows: [],
    },
    disclaimer: "",
    footer: {
      copyright: "©2025 Fundamental Research Corp.",
      tagline:
        "22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront",
      website: "www.researchfrc.com",
    },
  };
}
