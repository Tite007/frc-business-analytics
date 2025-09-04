import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Professional PDF Document using React-PDF for high-quality output
// This produces vector-based PDFs with crisp text and professional formatting

// Register fonts for better typography
Font.register({
  family: "Times-Roman",
  src: "https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJvaAJSA_JN3Q.woff2",
});

// Professional styling that matches financial reports
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 36, // 0.5 inch margins
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.4,
  },

  // Header section
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a2c45",
    padding: 16,
    marginBottom: 24,
    borderRadius: 4,
  },
  headerLogo: {
    width: 120,
    height: 32,
  },
  headerDate: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Company section
  companySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyInfo: {
    flex: 1,
    paddingRight: 40,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#b45309", // amber-700
    marginBottom: 8,
  },
  ticker: {
    fontSize: 10,
    color: "#6b7280", // gray-500
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    lineHeight: 1.3,
  },

  // Rating section
  ratingSection: {
    alignItems: "flex-end",
  },
  ratingBadge: {
    backgroundColor: "#16a34a", // green-600 for BUY
    color: "#FFFFFF",
    padding: "8 16",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  priceInfo: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.4,
  },

  // Sector info
  sectorSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: "1 solid #d1d5db",
  },
  sectorBadge: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    padding: "4 12",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },
  companyLink: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "underline",
  },

  // Content sections
  contentSection: {
    flexDirection: "row",
    gap: 24,
  },
  mainContent: {
    flex: 1,
  },
  sidebar: {
    width: 180,
  },

  // Highlights section
  highlightsTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },
  highlightsList: {
    marginBottom: 20,
  },
  highlightItem: {
    flexDirection: "row",
    marginBottom: 6,
    fontSize: 9,
    lineHeight: 1.4,
  },
  bulletPoint: {
    width: 8,
    fontSize: 8,
    color: "#6b7280",
    marginRight: 6,
  },
  highlightText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: "#000000",
  },

  // Sidebar sections
  sidebarSection: {
    marginBottom: 16,
  },
  sidebarTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000",
  },
  analystName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  analystTitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 12,
  },

  // Chart placeholder
  chartPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#f3f4f6",
    border: "1 solid #d1d5db",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  chartText: {
    fontSize: 8,
    color: "#6b7280",
  },

  // Tables
  table: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #d1d5db",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    padding: 4,
    fontSize: 7,
    fontWeight: "bold",
    borderRight: "1 solid #d1d5db",
  },
  tableCell: {
    padding: 4,
    fontSize: 7,
    borderRight: "1 solid #d1d5db",
    flex: 1,
  },
  tableCellRight: {
    padding: 4,
    fontSize: 7,
    textAlign: "right",
    flex: 1,
  },

  // Financial table
  financialTable: {
    marginTop: 20,
    border: "1 solid #d1d5db",
  },
  financialTableTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
  },

  // Footer
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTop: "1 solid #d1d5db",
    fontSize: 8,
    color: "#6b7280",
  },
  footerDisclaimer: {
    marginBottom: 8,
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const ProfessionalPDFDocument = ({ reportData }) => {
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
    financialTable = [],
    disclaimer = "Important disclosures and risk definitions on last page.",
  } = reportData || {};

  const formatTickers = (tickers) => {
    return tickers
      .map((ticker) => `${ticker.symbol} (${ticker.exchange})`)
      .join(", ");
  };

  const getRatingColor = (rating) => {
    switch (rating?.toUpperCase()) {
      case "BUY":
        return "#16a34a"; // green-600
      case "HOLD":
        return "#ca8a04"; // yellow-600
      case "SELL":
        return "#dc2626"; // red-600
      default:
        return "#6b7280"; // gray-500
    }
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerDate}>FUNDAMENTAL RESEARCH CORP</Text>
          </View>
          <Text style={styles.headerDate}>{date}</Text>
        </View>

        {/* Company Section */}
        <View style={styles.companySection}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.ticker}>({formatTickers(tickers)})</Text>
            <Text style={styles.reportTitle}>{title}</Text>
          </View>

          <View style={styles.ratingSection}>
            <View
              style={[
                styles.ratingBadge,
                { backgroundColor: getRatingColor(rating) },
              ]}
            >
              <Text>{rating}</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text>Current Price: {currentPrice}</Text>
              <Text>Fair Value: {fairValue}</Text>
              <Text>Risk*: {risk}</Text>
            </View>
          </View>
        </View>

        {/* Sector Section */}
        <View style={styles.sectorSection}>
          <View style={styles.sectorBadge}>
            <Text>Sector: {sector}</Text>
          </View>
          <Text style={styles.companyLink}>
            Click here for more research on the company
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Highlights */}
            <Text style={styles.highlightsTitle}>Highlights</Text>
            <View style={styles.highlightsList}>
              {highlights.length > 0 ? (
                highlights.map((highlight, index) => (
                  <View key={index} style={styles.highlightItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.highlightItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.highlightText}>
                      Q2 revenue grew 47% year-over-year, driven by strong
                      customer adoption
                    </Text>
                  </View>
                  <View style={styles.highlightItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.highlightText}>
                      Gross margins expanded to 73%, up from 68% in the prior
                      year
                    </Text>
                  </View>
                  <View style={styles.highlightItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.highlightText}>
                      Management raised full-year guidance across all key
                      metrics
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Sidebar */}
          <View style={styles.sidebar}>
            {/* Analyst Info */}
            <View style={styles.sidebarSection}>
              <Text style={styles.analystName}>{analystInfo.name}</Text>
              <Text style={styles.analystTitle}>{analystInfo.title}</Text>
            </View>

            {/* Chart Placeholder */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Price and Volume (1-year)</Text>
              <View style={styles.chartPlaceholder}>
                <Text style={styles.chartText}>Chart Area</Text>
              </View>
            </View>

            {/* Performance Table */}
            <View style={styles.sidebarSection}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={[styles.tableHeader, { flex: 1 }]}></Text>
                  <Text style={[styles.tableHeader, { flex: 1 }]}>YTD</Text>
                  <Text style={[styles.tableHeader, { flex: 1 }]}>1M</Text>
                </View>
                {performanceData.length > 0 ? (
                  performanceData.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.security}</Text>
                      <Text style={styles.tableCellRight}>{item.ytd}</Text>
                      <Text style={styles.tableCellRight}>
                        {item.twelveMonth}
                      </Text>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>ZEPP</Text>
                      <Text style={styles.tableCellRight}>1,292%</Text>
                      <Text style={styles.tableCellRight}>1,232%</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>NYSE</Text>
                      <Text style={styles.tableCellRight}>9%</Text>
                      <Text style={styles.tableCellRight}>10%</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Company Data */}
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarTitle}>Company Data</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>52 Week Range</Text>
                  <Text style={styles.tableCellRight}>
                    {companyData.weekRange || "US$2.12-43.93"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Shares O/S</Text>
                  <Text style={styles.tableCellRight}>
                    {companyData.sharesOS || "14.4M"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>Market Cap.</Text>
                  <Text style={styles.tableCellRight}>
                    {companyData.marketCap || "US$570M"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>P/E (forward)</Text>
                  <Text style={styles.tableCellRight}>
                    {companyData.peForward || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCell}>P/B</Text>
                  <Text style={styles.tableCellRight}>
                    {companyData.pb || "2.5x"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Financial Table */}
        {financialTable.length > 0 && (
          <View style={styles.financialTable}>
            <Text style={styles.financialTableTitle}>
              Key Financial Data (US$, 000s; except EPS)
            </Text>
            {/* Financial table implementation would go here */}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerDisclaimer}>* {disclaimer}</Text>
          <View style={styles.footerInfo}>
            <Text>©2025 Fundamental Research Corp.</Text>
            <Text>
              "22+ Years of Bringing Undiscovered Investment Opportunities to
              the Forefront"
            </Text>
            <Text>www.researchfrc.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProfessionalPDFDocument;
