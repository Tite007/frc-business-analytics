import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Professional PDF generation service using pdf-lib for high-quality vector PDFs
// This creates truly professional PDFs with precise control over layout and typography

class ProfessionalPDFService {
  constructor() {
    this.pageWidth = 612; // Letter size: 8.5" × 11" at 72 DPI
    this.pageHeight = 792;
    this.margins = {
      top: 72,
      bottom: 72,
      left: 54,
      right: 54,
    };
  }

  async generateFinancialReport(reportData) {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Embed fonts for professional typography
      const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Create first page
      const page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);

      let yPosition = this.pageHeight - this.margins.top;

      // Draw header
      yPosition = await this.drawHeader(
        page,
        reportData,
        timesRoman,
        timesBold,
        yPosition
      );

      // Draw company section
      yPosition = await this.drawCompanySection(
        page,
        reportData,
        timesRoman,
        timesBold,
        yPosition
      );

      // Draw content sections
      yPosition = await this.drawMainContent(
        page,
        reportData,
        timesRoman,
        timesBold,
        yPosition
      );

      // Draw footer
      await this.drawFooter(page, reportData, timesRoman, yPosition);

      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();

      return pdfBytes;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  async drawHeader(page, reportData, font, boldFont, yPosition) {
    const { date } = reportData;

    // Draw header background
    page.drawRectangle({
      x: this.margins.left - 18,
      y: yPosition - 45,
      width: this.pageWidth - this.margins.left - this.margins.right + 36,
      height: 40,
      color: rgb(0.1, 0.17, 0.27), // #1a2c45
    });

    // Company logo text (replace with actual logo when available)
    page.drawText("FUNDAMENTAL RESEARCH CORP", {
      x: this.margins.left,
      y: yPosition - 25,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // Date
    page.drawText(date || new Date().toLocaleDateString(), {
      x: this.pageWidth - this.margins.right - 100,
      y: yPosition - 25,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    return yPosition - 65;
  }

  async drawCompanySection(page, reportData, font, boldFont, yPosition) {
    const {
      companyName = "Company Name",
      tickers = [{ symbol: "TICKER", exchange: "NASDAQ" }],
      title = "Research Report Title",
      rating = "BUY",
      currentPrice = "$0.00",
      fairValue = "$0.00",
      risk = "4",
      sector = "Technology",
    } = reportData;

    // Company name
    page.drawText(companyName, {
      x: this.margins.left,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: rgb(0.7, 0.51, 0.04), // amber-700
    });

    // Ticker
    const tickerText = tickers
      .map((t) => `${t.symbol} (${t.exchange})`)
      .join(", ");
    page.drawText(`(${tickerText})`, {
      x: this.margins.left,
      y: yPosition - 25,
      size: 10,
      font: font,
      color: rgb(0.42, 0.45, 0.5), // gray-600
    });

    // Report title
    page.drawText(title, {
      x: this.margins.left,
      y: yPosition - 55,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Rating badge (simplified as text for pdf-lib)
    const ratingColor = this.getRatingColor(rating);
    page.drawRectangle({
      x: this.pageWidth - this.margins.right - 80,
      y: yPosition - 30,
      width: 60,
      height: 25,
      color: ratingColor,
      borderRadius: 12,
    });

    page.drawText(rating, {
      x: this.pageWidth - this.margins.right - 65,
      y: yPosition - 22,
      size: 12,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    // Price info
    const priceInfo = [
      `Current Price: ${currentPrice}`,
      `Fair Value: ${fairValue}`,
      `Risk*: ${risk}`,
    ];

    priceInfo.forEach((info, index) => {
      page.drawText(info, {
        x: this.pageWidth - this.margins.right - 120,
        y: yPosition - 60 - index * 12,
        size: 9,
        font: font,
        color: rgb(0.42, 0.45, 0.5),
      });
    });

    // Sector badge
    page.drawRectangle({
      x: this.margins.left,
      y: yPosition - 105,
      width: 100,
      height: 18,
      color: rgb(0.95, 0.96, 0.97), // gray-100
    });

    page.drawText(`Sector: ${sector}`, {
      x: this.margins.left + 5,
      y: yPosition - 98,
      size: 8,
      font: boldFont,
      color: rgb(0.22, 0.25, 0.31),
    });

    // Company link
    page.drawText("Click here for more research on the company", {
      x: this.pageWidth - this.margins.right - 180,
      y: yPosition - 98,
      size: 8,
      font: font,
      color: rgb(0.15, 0.39, 0.93), // blue-600
    });

    // Divider line
    page.drawLine({
      start: { x: this.margins.left, y: yPosition - 125 },
      end: { x: this.pageWidth - this.margins.right, y: yPosition - 125 },
      thickness: 1,
      color: rgb(0.82, 0.84, 0.87), // gray-300
    });

    return yPosition - 145;
  }

  async drawMainContent(page, reportData, font, boldFont, yPosition) {
    const { highlights = [] } = reportData;

    // Highlights section
    page.drawText("Highlights", {
      x: this.margins.left,
      y: yPosition,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    let currentY = yPosition - 20;
    const defaultHighlights =
      highlights.length > 0
        ? highlights
        : [
            "Q2 revenue grew 47% year-over-year, driven by strong customer adoption",
            "Gross margins expanded to 73%, up from 68% in the prior year",
            "Management raised full-year guidance across all key metrics",
          ];

    defaultHighlights.forEach((highlight, index) => {
      // Bullet point
      page.drawText("•", {
        x: this.margins.left,
        y: currentY,
        size: 8,
        font: font,
        color: rgb(0.42, 0.45, 0.5),
      });

      // Highlight text (simplified line wrapping)
      const maxWidth = 340; // Left column width
      const wrappedText = this.wrapText(highlight, 9, font, maxWidth);

      wrappedText.forEach((line, lineIndex) => {
        page.drawText(line, {
          x: this.margins.left + 10,
          y: currentY - lineIndex * 12,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });
      });

      currentY -= wrappedText.length * 12 + 6;
    });

    // Sidebar content
    this.drawSidebar(page, reportData, font, boldFont, yPosition);

    return currentY;
  }

  drawSidebar(page, reportData, font, boldFont, startY) {
    const sidebarX = this.margins.left + 380;
    const {
      analystInfo = {},
      performanceData = [],
      companyData = {},
    } = reportData;

    let yPos = startY;

    // Analyst info
    page.drawText(analystInfo.name || "Analyst Name", {
      x: sidebarX,
      y: yPos,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(analystInfo.title || "Senior Analyst", {
      x: sidebarX,
      y: yPos - 12,
      size: 9,
      font: font,
      color: rgb(0.42, 0.45, 0.5),
    });

    yPos -= 40;

    // Chart placeholder
    page.drawText("Price and Volume (1-year)", {
      x: sidebarX,
      y: yPos,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    page.drawRectangle({
      x: sidebarX,
      y: yPos - 90,
      width: 160,
      height: 80,
      color: rgb(0.95, 0.96, 0.97),
      borderColor: rgb(0.82, 0.84, 0.87),
      borderWidth: 1,
    });

    page.drawText("Chart Area", {
      x: sidebarX + 60,
      y: yPos - 55,
      size: 8,
      font: font,
      color: rgb(0.42, 0.45, 0.5),
    });

    yPos -= 110;

    // Performance table
    this.drawTable(
      page,
      sidebarX,
      yPos,
      [
        ["", "YTD", "1M"],
        ["ZEPP", "1,292%", "1,232%"],
        ["NYSE", "9%", "10%"],
      ],
      font,
      boldFont
    );

    yPos -= 80;

    // Company data table
    page.drawText("Company Data", {
      x: sidebarX,
      y: yPos,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yPos -= 15;

    this.drawTable(
      page,
      sidebarX,
      yPos,
      [
        ["52 Week Range", companyData.weekRange || "US$2.12-43.93"],
        ["Shares O/S", companyData.sharesOS || "14.4M"],
        ["Market Cap.", companyData.marketCap || "US$570M"],
        ["P/E (forward)", companyData.peForward || "N/A"],
        ["P/B", companyData.pb || "2.5x"],
      ],
      font,
      boldFont
    );
  }

  drawTable(page, x, y, data, font, boldFont) {
    const cellHeight = 12;
    const cellWidth = 80;

    data.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        const cellY = y - rowIndex * cellHeight;
        const cellX = x + cellIndex * cellWidth;

        // Draw cell border
        page.drawRectangle({
          x: cellX,
          y: cellY - cellHeight + 2,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0.82, 0.84, 0.87),
          borderWidth: 0.5,
          color: rowIndex === 0 ? rgb(0.98, 0.98, 0.99) : rgb(1, 1, 1),
        });

        // Draw cell text
        page.drawText(cell, {
          x: cellX + 3,
          y: cellY - 8,
          size: 7,
          font: rowIndex === 0 ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      });
    });
  }

  async drawFooter(page, reportData, font, yPosition) {
    const { disclaimer } = reportData;
    const footerY = this.margins.bottom + 40;

    // Disclaimer
    page.drawText(
      `* ${
        disclaimer || "Important disclosures and risk definitions on last page."
      }`,
      {
        x: this.margins.left,
        y: footerY + 20,
        size: 8,
        font: font,
        color: rgb(0.42, 0.45, 0.5),
      }
    );

    // Footer info
    const footerTexts = [
      "©2025 Fundamental Research Corp.",
      '"22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront"',
      "www.researchfrc.com",
    ];

    const spacing =
      (this.pageWidth - this.margins.left - this.margins.right) / 3;
    footerTexts.forEach((text, index) => {
      page.drawText(text, {
        x: this.margins.left + index * spacing,
        y: footerY,
        size: 8,
        font: font,
        color: rgb(0.42, 0.45, 0.5),
      });
    });
  }

  getRatingColor(rating) {
    switch (rating?.toUpperCase()) {
      case "BUY":
        return rgb(0.09, 0.64, 0.29); // green-600
      case "HOLD":
        return rgb(0.79, 0.54, 0.02); // yellow-600
      case "SELL":
        return rgb(0.86, 0.15, 0.15); // red-600
      default:
        return rgb(0.42, 0.45, 0.5); // gray-500
    }
  }

  // Simple text wrapping function
  wrapText(text, fontSize, font, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      // Simplified width calculation (would need proper font metrics in real implementation)
      const estimatedWidth = testLine.length * fontSize * 0.6;

      if (estimatedWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // Download the PDF
  downloadPDF(pdfBytes, filename = "financial-report.pdf") {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
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

export default ProfessionalPDFService;
