import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Enhanced Professional PDF Report Generator for Updated Branch
 * Adapted for new API structure and data format
 */
export async function exportProfessionalCompanyReport(
  data,
  ticker,
  options = {}
) {
  try {
    const { companyData, metricsData, analysisData, bloombergData, chartData } = data;

    // Initialize PDF (A4, Portrait)
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;

    let currentY = 0;

    // Modern color palette
    const colors = {
      primary: [26, 44, 69], // Professional navy
      accent: [0, 102, 204], // Modern blue
      text: [33, 37, 41], // Deep charcoal
      lightText: [108, 117, 125], // Medium gray
      success: [34, 139, 34], // Forest green
      danger: [220, 38, 38], // Strong red
      modernGray: [248, 250, 252], // Light background
    };

    const setColor = (colorArray) =>
      pdf.setTextColor(colorArray[0], colorArray[1], colorArray[2]);
    const setFillColor = (colorArray) =>
      pdf.setFillColor(colorArray[0], colorArray[1], colorArray[2]);
    const setDrawColor = (colorArray) =>
      pdf.setDrawColor(colorArray[0], colorArray[1], colorArray[2]);

    const checkPageSpace = (neededSpace) => {
      if (currentY + neededSpace > pageHeight - 30) {
        pdf.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // 1. PROFESSIONAL HEADER
    const addHeader = async () => {
      // Header background
      setFillColor(colors.primary);
      pdf.rect(0, 0, pageWidth, 35, "F");

      // Accent line
      setFillColor(colors.accent);
      pdf.rect(0, 33, pageWidth, 2, "F");

      // Header border
      setDrawColor([255, 255, 255]);
      pdf.setLineWidth(0.2);
      pdf.line(0, 35, pageWidth, 35);

      // FRC Logo
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve) => {
          img.onload = () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              const logoWidth = 28;
              const logoHeight = (img.height / img.width) * logoWidth;

              pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                margin,
                5,
                logoWidth,
                logoHeight
              );
              resolve();
            } catch (error) {
              console.warn("Logo canvas error:", error);
              resolve();
            }
          };
          img.onerror = () => resolve();
          img.src = "/FRC_Logo_FullWhite.png";
        });
      } catch (error) {
        console.warn("Logo loading failed:", error);
      }

      // Company information
      const companyName = String(companyData?.company_name || ticker).toUpperCase();
      const exchange = String(companyData?.exchange || "TSX");
      const currency = String(companyData?.currency || "CAD");
      const country = String(companyData?.country || "Canada");

      // Company name and ticker
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");

      const primaryText = `${companyName} (${ticker})`;
      const primaryWidth = pdf.getTextWidth(primaryText);
      pdf.text(primaryText, pageWidth - margin - primaryWidth, 14);

      // Market info
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(220, 220, 220);

      const marketInfo = `${exchange} • ${currency} • ${country}`;
      const marketWidth = pdf.getTextWidth(marketInfo);
      pdf.text(marketInfo, pageWidth - margin - marketWidth, 22);

      // Report date
      const reportDate = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(200, 200, 200);
      const dateText = `Investment Research Report • ${reportDate}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, pageWidth - margin - dateWidth, 29);

      currentY = 45;
    };

    // 2. DYNAMIC COVERAGE OVERVIEW SECTION (Matching new UI)
    const addCoverageOverviewSection = () => {
      checkPageSpace(60);

      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("COVERAGE OVERVIEW", margin, currentY);
      currentY += 10;

      // Dynamic coverage status
      const totalReports = companyData?.reports_count || metricsData?.length || 0;
      const stockDataPoints = companyData?.stock_data_points || companyData?.data_quality?.stock_data_points || 0;
      const isFRCCovered = companyData?.frc_covered || companyData?.company_data?.frc_covered || totalReports > 0;
      const hasDigitalReports = companyData?.status === "success" || companyData?.has_digital_reports || false;

      // Calculate coverage timeline
      const firstReportDate = companyData?.first_report_date ||
                             companyData?.data?.reports_summary?.reports_list?.[0]?.published_date ||
                             metricsData?.[0]?.["Publication Date"];
      const latestReportDate = companyData?.last_report_date ||
                             companyData?.data?.reports_summary?.reports_list?.[
                               companyData?.data?.reports_summary?.reports_list?.length - 1
                             ]?.published_date ||
                             metricsData?.[metricsData?.length - 1]?.["Publication Date"];

      let coverageDays = 0;
      if (firstReportDate && latestReportDate) {
        const first = new Date(firstReportDate);
        const latest = new Date(latestReportDate);
        coverageDays = Math.floor((latest - first) / (1000 * 60 * 60 * 24));
      }

      // Coverage status section
      const statusText = isFRCCovered && hasDigitalReports ? "Active Coverage" :
                        isFRCCovered ? "FRC Coverage" : "Monitoring";
      const statusDesc = isFRCCovered && hasDigitalReports ? "Digital reports & analytics" :
                        isFRCCovered ? "Research reports available" : "Under evaluation";

      setFillColor([240, 248, 255]);
      pdf.rect(margin, currentY, contentWidth, 25, "F");
      setDrawColor([200, 220, 240]);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, currentY, contentWidth, 25);

      setColor(colors.primary);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(statusText, margin + 6, currentY + 8);

      setColor([100, 100, 100]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(statusDesc, margin + 6, currentY + 16);

      // FRC Coverage badge
      setFillColor(isFRCCovered ? [34, 139, 34] : [255, 165, 0]);
      pdf.roundedRect(pageWidth - margin - 40, currentY + 4, 35, 8, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text("FRC Coverage", pageWidth - margin - 38, currentY + 9);

      currentY += 30;

      // Data overview cards (2x2 grid)
      const cardWidth = (contentWidth - 15) / 2;
      const cardHeight = 20;

      // Total Reports
      setFillColor([240, 248, 255]);
      pdf.rect(margin, currentY, cardWidth, cardHeight, "F");
      setDrawColor([200, 220, 240]);
      pdf.rect(margin, currentY, cardWidth, cardHeight);

      setColor(colors.primary);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Total Reports:", margin + 4, currentY + 8);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(totalReports), margin + 4, currentY + 16);

      // Stock Data Points
      const card2X = margin + cardWidth + 15;
      setFillColor([248, 240, 255]);
      pdf.rect(card2X, currentY, cardWidth, cardHeight, "F");
      setDrawColor([220, 200, 240]);
      pdf.rect(card2X, currentY, cardWidth, cardHeight);

      setColor(colors.primary);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Stock Data:", card2X + 4, currentY + 8);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${stockDataPoints.toLocaleString()} points`, card2X + 4, currentY + 16);

      currentY += cardHeight + 10;

      // Coverage Timeline (if data available)
      if (firstReportDate) {
        setColor(colors.primary);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Coverage Timeline", margin, currentY);
        currentY += 8;

        const formatDate = (dateStr) => {
          try {
            return new Date(dateStr).toLocaleDateString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric"
            });
          } catch {
            return "N/A";
          }
        };

        // Timeline info
        setColor([80, 80, 80]);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(`First Report: ${formatDate(firstReportDate)}`, margin + 4, currentY);
        currentY += 5;
        pdf.text(`Latest Report: ${formatDate(latestReportDate)}`, margin + 4, currentY);
        if (coverageDays > 0) {
          currentY += 5;
          pdf.text(`Coverage Period: ${coverageDays} days`, margin + 4, currentY);
        }
        currentY += 10;
      }

      currentY += 10;
    };

    // 3. CHART SECTION
    const addChartSection = async () => {
      checkPageSpace(70);

      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PERFORMANCE CHART", margin, currentY);
      currentY += 10;

      try {
        // Wait for chart to be rendered
        await new Promise((resolve) => setTimeout(resolve, 2000));

        let chartCaptured = false;

        // Try multiple chart selectors for different chart libraries
        const chartSelectors = [
          ".js-plotly-plot",
          '[data-testid="chart-container"]',
          ".chart-container",
          "canvas", // For Chart.js
          ".recharts-wrapper", // For Recharts
        ];

        let chartElement = null;
        for (const selector of chartSelectors) {
          chartElement = document.querySelector(selector);
          if (chartElement) {
            console.log(`Found chart with selector: ${selector}`);
            break;
          }
        }

        if (chartElement) {
          try {
            const canvas = await html2canvas(chartElement, {
              backgroundColor: "#ffffff",
              scale: 1.5,
              useCORS: true,
              allowTaint: true,
              logging: false,
              width: chartElement.scrollWidth,
              height: chartElement.scrollHeight,
            });

            if (canvas.width > 0 && canvas.height > 0) {
              const imgData = canvas.toDataURL("image/png");
              const chartWidth = contentWidth;
              const chartHeight = (canvas.height * chartWidth) / canvas.width;
              const maxChartHeight = 120;
              const finalChartHeight = Math.min(chartHeight, maxChartHeight);

              checkPageSpace(finalChartHeight + 10);

              pdf.addImage(
                imgData,
                "PNG",
                margin,
                currentY,
                chartWidth,
                finalChartHeight
              );
              currentY += finalChartHeight + 20;
              chartCaptured = true;
            }
          } catch (captureError) {
            console.warn("Chart capture failed:", captureError);
          }
        }

        // Placeholder if no chart captured
        if (!chartCaptured) {
          setFillColor([245, 245, 245]);
          pdf.rect(margin, currentY, contentWidth, 80, "F");

          setColor(colors.lightText);
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "italic");
          pdf.text(
            "Chart not available for export",
            margin + contentWidth / 2 - 40,
            currentY + 45
          );
          currentY += 100;
        }
      } catch (error) {
        console.warn("Chart section error:", error);
        currentY += 20;
      }
    };

    // 4. METRICS TABLE - Updated for new data structure
    const addMetricsTable = () => {
      if (!metricsData || metricsData.length === 0) return;

      checkPageSpace(40);

      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PERFORMANCE METRICS", margin, currentY);
      currentY += 8;

      // Updated headers based on new data structure
      const headers = [
        "#",
        "Date",
        "Report Title",
        "Volume Pre",
        "Volume Post",
        "Volume Δ%",
        "Price Impact"
      ];
      const colWidths = [8, 18, 60, 20, 20, 18, 16];

      // Header
      setFillColor(colors.primary);
      pdf.rect(margin, currentY - 1, contentWidth, 8, "F");

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");

      let startX = margin;
      headers.forEach((header, index) => {
        pdf.text(header, startX + 2, currentY + 4);
        startX += colWidths[index];
      });
      currentY += 8;

      // Data rows
      const limitedData = metricsData.slice(0, 10);
      limitedData.forEach((report, rowIndex) => {
        checkPageSpace(8);

        if (rowIndex % 2 === 0) {
          setFillColor([250, 250, 252]);
          pdf.rect(margin, currentY, contentWidth, 8, "F");
        }

        setColor(colors.text);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");

        // Extract data using the available field names
        const reportNum = report["Report Number"] || rowIndex + 1;
        const pubDate = report["Publication Date"] || report["Date"] || "";
        const title = (report["Report Title"] || "Report").substring(0, 40);

        // Volume data - try multiple field name variants
        const preVol = report["Avg Volume Pre 30 Days"] ||
                      report["Volume Pre"] ||
                      report["Pre Volume"] || 0;
        const postVol = report["Avg Volume Post 30 Days"] ||
                       report["Volume Post"] ||
                       report["Post Volume"] || 0;

        // Calculate volume change
        const volChange = preVol > 0 ? ((postVol - preVol) / preVol) * 100 : 0;

        // Price impact
        const priceImpact = report["Volume Change 30 Days (%)"] ||
                          report["Price Change"] ||
                          volChange;

        const formatVolume = (vol) => {
          if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
          if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
          return vol.toFixed(0);
        };

        const rowData = [
          String(reportNum),
          new Date(pubDate || Date.now()).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
          }),
          title,
          formatVolume(preVol),
          formatVolume(postVol),
          `${volChange >= 0 ? "+" : ""}${volChange.toFixed(1)}%`,
          `${priceImpact >= 0 ? "+" : ""}${priceImpact.toFixed(1)}%`
        ];

        startX = margin;
        rowData.forEach((value, colIndex) => {
          // Color coding for performance
          if (colIndex === 5 || colIndex === 6) {
            const numValue = parseFloat(value);
            if (numValue > 0) setColor(colors.success);
            else if (numValue < 0) setColor(colors.danger);
            else setColor([100, 100, 100]);
            pdf.setFont("helvetica", "bold");
          } else {
            setColor([50, 50, 50]);
            pdf.setFont("helvetica", "normal");
          }

          // Right-align numeric columns
          if (colIndex >= 3) {
            const textWidth = pdf.getTextWidth(value);
            pdf.text(value, startX + colWidths[colIndex] - textWidth - 2, currentY + 5);
          } else {
            pdf.text(value, startX + 1.5, currentY + 5);
          }

          startX += colWidths[colIndex];
        });

        currentY += 8;
      });

      currentY += 15;
    };

    // 5. BLOOMBERG SECTION - Updated for new API structure
    const addBloombergSection = () => {
      checkPageSpace(40);

      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("BLOOMBERG INSTITUTIONAL ANALYSIS", margin, currentY);
      currentY += 8;

      if (bloombergData && !bloombergData.error) {
        // Handle secondary ticker case
        if (bloombergData.isSecondaryTicker) {
          setColor(colors.lightText);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "italic");
          pdf.text(bloombergData.message || "Bloomberg data available under different ticker", margin, currentY);
          if (bloombergData.primaryTicker) {
            currentY += 8;
            pdf.text(`Primary ticker: ${bloombergData.primaryTicker}`, margin, currentY);
          }
          currentY += 20;
          return;
        }

        const records = bloombergData.institutional_records || [];
        const summary = bloombergData.summary || {};

        if (records.length > 0) {
          // Summary stats
          const totalInstitutions = summary.unique_institutions ||
                                  [...new Set(records.map(r => r.customer_name))].length;
          const totalReads = summary.total_readership_records || records.length;

          setColor(colors.primary);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(`Total Institutional Reads: ${totalReads}`, margin, currentY);
          currentY += 6;
          pdf.text(`Unique Institutions: ${totalInstitutions}`, margin, currentY);
          currentY += 12;

          // Top institutions table (limited for space)
          const topRecords = records.slice(0, 5);

          const bloombergHeaders = ["Institution", "Location", "Report", "Date"];
          const bloombergColWidths = [50, 35, 45, 20];

          // Bloomberg table header
          setFillColor([35, 45, 62]);
          pdf.rect(margin, currentY - 1, contentWidth, 9, "F");

          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");

          let bloombergStartX = margin;
          bloombergHeaders.forEach((header) => {
            pdf.text(header, bloombergStartX + 2, currentY + 5);
            bloombergStartX += bloombergColWidths[bloombergHeaders.indexOf(header)];
          });
          currentY += 9;

          // Bloomberg data rows
          topRecords.forEach((record, index) => {
            checkPageSpace(10);

            if (index % 2 === 0) {
              setFillColor([250, 250, 252]);
              pdf.rect(margin, currentY, contentWidth, 10, "F");
            }

            setColor([40, 40, 40]);
            pdf.setFontSize(7.5);
            pdf.setFont("helvetica", "normal");

            const institutionName = String(record.customer_name || "N/A").substring(0, 32);
            const location = `${record.customer_city || "N/A"}, ${record.customer_country || "N/A"}`.substring(0, 25);
            const reportTitle = String(record.report_title || "N/A").substring(0, 30);
            const accessDate = record.access_date
              ? new Date(record.access_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric"
                })
              : "N/A";

            const bloombergRowData = [institutionName, location, reportTitle, accessDate];

            bloombergStartX = margin;
            bloombergRowData.forEach((value, colIndex) => {
              if (colIndex === 0) pdf.setFont("helvetica", "bold");
              else pdf.setFont("helvetica", "normal");

              pdf.text(value, bloombergStartX + 2, currentY + 6);
              bloombergStartX += bloombergColWidths[colIndex];
            });

            currentY += 10;
          });

          currentY += 8;
        } else {
          setColor(colors.lightText);
          pdf.setFontSize(11);
          pdf.setFont("helvetica", "italic");
          pdf.text("No Bloomberg institutional readership data available", margin, currentY);
          currentY += 20;
        }
      } else {
        setColor(colors.lightText);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        pdf.text("Bloomberg institutional data not available for this company", margin, currentY);
        currentY += 20;
      }
    };

    // 6. AI ANALYSIS SECTION
    const addAIAnalysisSection = () => {
      checkPageSpace(40);

      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("FRC AI INVESTMENT ANALYSIS", margin, currentY);
      currentY += 8;

      // Analysis header
      setFillColor(colors.modernGray);
      pdf.rect(margin, currentY, contentWidth, 12, "F");
      setDrawColor([200, 200, 200]);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, currentY, contentWidth, 12);

      setColor(colors.primary);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("FRC AI-Powered Investment Intelligence", margin + 6, currentY + 8);

      currentY += 18;

      setColor(colors.text);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      let analysisText = "";

      // Extract analysis text
      if (analysisData) {
        if (typeof analysisData === "string") {
          analysisText = analysisData;
        } else if (analysisData.ai_analysis) {
          analysisText = analysisData.ai_analysis;
        } else if (analysisData.analysis) {
          analysisText = analysisData.analysis;
        }
      }

      // Generate default analysis if none provided
      if (!analysisText || analysisText.trim().length === 0) {
        const companyName = companyData?.company_name || ticker;
        const reportCount = companyData?.reports_count || metricsData?.length || 0;
        const bloombergCount = bloombergData?.summary?.unique_institutions || 0;

        analysisText = `FRC AI Analysis for ${companyName} (${ticker}):

COVERAGE ASSESSMENT:
• ${reportCount > 0 ? `Active coverage with ${reportCount} research reports published` : 'Currently under monitoring - no active research coverage'}
• ${bloombergCount > 0 ? `Strong institutional engagement with ${bloombergCount} Bloomberg Terminal readers` : 'Limited institutional visibility on Bloomberg Terminal'}
• Exchange listing: ${companyData?.exchange || 'TSX'} (${companyData?.currency || 'CAD'})

INVESTMENT CONSIDERATIONS:
• Research Impact: ${reportCount > 5 ? 'Well-covered by FRC research team' : reportCount > 0 ? 'Emerging coverage with selective analysis' : 'Monitoring phase - potential future coverage'}
• Institutional Interest: ${bloombergCount > 10 ? 'High professional investor attention' : bloombergCount > 0 ? 'Moderate institutional following' : 'Limited institutional visibility'}
• Market Position: ${companyData?.frc_covered ? 'Established FRC coverage' : 'Under evaluation for potential coverage'}

RISK FACTORS:
Standard market volatility applies. This analysis is based on FRC research data and Bloomberg Terminal institutional readership patterns.
Past performance and research interest do not guarantee future results.

This AI-generated analysis combines quantitative metrics with institutional engagement patterns to provide comprehensive investment context.`;
      }

      // Clean and format analysis text
      const cleanText = analysisText
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/[^\x00-\x7F]/g, "")
        .trim();

      const paragraphs = cleanText
        .split("\n\n")
        .filter((p) => p.trim().length > 0);

      paragraphs.forEach((paragraph) => {
        checkPageSpace(12);

        const trimmedParagraph = paragraph.trim();
        const lines = trimmedParagraph.split("\n");

        // Check if this is a section header
        const isHeader = lines[0].includes(":") && lines[0].length < 50 &&
                        (lines[0].toUpperCase() === lines[0] || lines[0].includes("ASSESSMENT") || lines[0].includes("CONSIDERATIONS"));

        if (isHeader && lines.length > 1) {
          // Section header
          setColor(colors.primary);
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "bold");
          pdf.text(lines[0], margin + 2, currentY);
          currentY += 8;

          // Section content
          setColor([50, 50, 50]);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length === 0) continue;

            checkPageSpace(6);

            if (line.startsWith("•") || line.startsWith("-")) {
              // Bullet points
              const bulletText = line.substring(1).trim();
              const textLines = pdf.splitTextToSize(bulletText, contentWidth - 20);

              // Bullet symbol
              setColor(colors.accent);
              pdf.text("•", margin + 6, currentY);

              // Bullet content
              setColor([50, 50, 50]);
              textLines.forEach((textLine, idx) => {
                pdf.text(textLine, margin + 12, currentY + idx * 5);
              });

              currentY += textLines.length * 5 + 2;
            } else {
              // Regular text
              const textLines = pdf.splitTextToSize(line, contentWidth - 8);
              textLines.forEach((textLine) => {
                checkPageSpace(6);
                pdf.text(textLine, margin + 4, currentY);
                currentY += 5;
              });
            }
          }

          currentY += 8;
        } else {
          // Regular paragraph
          setColor([60, 60, 60]);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");

          const textLines = pdf.splitTextToSize(trimmedParagraph, contentWidth - 8);
          textLines.forEach((line) => {
            checkPageSpace(6);
            pdf.text(line, margin + 4, currentY);
            currentY += 5;
          });

          currentY += 6;
        }
      });

      currentY += 10;
    };

    // 7. FOOTER
    const addFooter = () => {
      const totalPages = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);

        // Footer line
        setDrawColor([200, 200, 200]);
        pdf.setLineWidth(0.1);
        pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

        // Footer content
        setColor(colors.lightText);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");

        pdf.text(
          "FRC Business Analytics | Investment Research",
          margin,
          pageHeight - 15
        );
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - margin - 20,
          pageHeight - 15
        );
        pdf.text(
          "Confidential - For Professional Use Only",
          margin,
          pageHeight - 8
        );
      }
    };

    // Generate the complete report
    await addHeader();
    addCoverageOverviewSection(); // Updated to new dynamic section
    await addChartSection();
    addMetricsTable();
    addBloombergSection();
    addAIAnalysisSection();
    addFooter();

    // Generate filename
    const filename = `FRC_Investment_Report_${ticker}_${
      new Date().toISOString().split("T")[0]
    }.pdf`;

    // Save the PDF
    pdf.save(filename);

    return {
      success: true,
      filename,
      pages: pdf.internal.getNumberOfPages(),
    };
  } catch (error) {
    console.error("PDF generation error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}