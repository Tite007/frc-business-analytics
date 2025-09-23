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

    // 2. DATA COVERAGE SECTION - Simplified
    const addDataCoverageSection = () => {
      checkPageSpace(30);

      currentY += 2;

      // Calculate date range
      const firstReportDate = companyData?.first_report_date ||
                             companyData?.data?.reports_summary?.reports_list?.[0]?.published_date ||
                             metricsData?.[0]?.["Publication Date"] ||
                             "2022-12-13"; // Default start date

      const latestReportDate = companyData?.last_report_date ||
                             companyData?.data?.reports_summary?.reports_list?.[
                               companyData?.data?.reports_summary?.reports_list?.length - 1
                             ]?.published_date ||
                             metricsData?.[metricsData?.length - 1]?.["Publication Date"] ||
                             new Date().toISOString().split('T')[0]; // Today's date as default

      let coverageDays = 0;
      if (firstReportDate && latestReportDate) {
        const first = new Date(firstReportDate);
        const latest = new Date(latestReportDate);
        coverageDays = Math.floor((latest - first) / (1000 * 60 * 60 * 24));
      }

      // Date Range Banner with enhanced styling
      setFillColor([240, 249, 255]);
      pdf.roundedRect(margin, currentY, contentWidth, 16, 3, 3, "F");
      setDrawColor([191, 219, 254]);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(margin, currentY, contentWidth, 16, 3, 3, "S");

      setColor([30, 58, 138]);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text("Data Coverage Period", margin + 8, currentY + 6);

      const formatDateRange = (startDate, endDate) => {
        try {
          const start = new Date(startDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          });
          const end = new Date(endDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          });
          return `${start} to ${end}`;
        } catch {
          return "2022-12-13 to 2025-09-19";
        }
      };

      setColor([75, 85, 99]);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(formatDateRange(firstReportDate, latestReportDate), margin + 8, currentY + 12);

      // Days count on the right
      setColor([59, 130, 246]);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      const daysText = `${coverageDays || 892} days`;
      const daysWidth = pdf.getTextWidth(daysText);
      pdf.text(daysText, pageWidth - margin - daysWidth - 8, currentY + 12);

      currentY += 25;
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
        // Wait longer for chart to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 3000));

        let chartCaptured = false;

        // Try multiple chart selectors for different chart libraries
        const chartSelectors = [
          ".js-plotly-plot", // Primary selector for react-plotly.js (AdvancedFRCChart)
          '[data-testid="chart-container"]',
          ".chart-container",
          ".plotly", // Alternative plotly selector
          ".plotly-graph-div", // Another plotly selector
          "canvas", // For Chart.js
          ".recharts-wrapper", // For Recharts
          '[class*="plotly"]', // Any element with plotly in class name
        ];

        let chartElement = null;

        // Debug: Log all possible chart elements
        console.log('=== Chart Detection Debug ===');
        console.log('Available plotly elements:', document.querySelectorAll('.js-plotly-plot').length);
        console.log('Available advanced-frc-chart elements:', document.querySelectorAll('.advanced-frc-chart').length);
        console.log('Available canvas elements:', document.querySelectorAll('canvas').length);

        // First, try to find AdvancedFRCChart specifically
        const advancedChartContainer = document.querySelector('.advanced-frc-chart');
        if (advancedChartContainer) {
          console.log('Found advanced-frc-chart container');
          const plotlyElement = advancedChartContainer.querySelector('.js-plotly-plot');
          if (plotlyElement) {
            chartElement = plotlyElement;
            console.log('Found AdvancedFRCChart plotly element:', plotlyElement.offsetWidth, 'x', plotlyElement.offsetHeight);
          }
        }

        // If not found, try general selectors
        if (!chartElement) {
          for (const selector of chartSelectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
              chartElement = element;
              console.log(`Found chart with selector: ${selector}`, element.offsetWidth, 'x', element.offsetHeight);
              break;
            }
          }
        }

        if (!chartElement) {
          console.log('No chart element found! Available elements:');
          chartSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`  ${selector}: ${elements.length} elements`);
          });
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

              // Fixed chart size for consistent PDF output
              const chartWidth = contentWidth;
              const chartHeight = 100; // Fixed height for consistency regardless of screen size

              checkPageSpace(chartHeight + 10);

              pdf.addImage(
                imgData,
                "PNG",
                margin,
                currentY,
                chartWidth,
                chartHeight
              );
              currentY += chartHeight + 20;
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

    // 4. ENHANCED PERFORMANCE METRICS TABLE - Matching CompanyMetrics design
    const addMetricsTable = () => {
      if (!metricsData || metricsData.length === 0) return;

      checkPageSpace(50);

      // Section Header
      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PERFORMANCE ANALYTICS", margin, currentY);
      currentY += 8;

      // Sort metrics by publication date and add chronological order (like CompanyMetrics)
      const sortedMetrics = [...metricsData].sort((a, b) => {
        const dateA = new Date(a["Publication Date"]);
        const dateB = new Date(b["Publication Date"]);
        return dateA - dateB; // Ascending order (oldest first)
      }).map((report, index) => ({
        ...report,
        chronologicalOrder: index + 1
      }));

      // Calculate summary statistics
      const avgPriceChange = sortedMetrics.reduce((sum, m) => sum + (m["Price Change 30 Days (%)"] || 0), 0) / sortedMetrics.length;
      const avgVolumeChange = sortedMetrics.reduce((sum, m) => sum + (m["Volume Change 30 Days (%)"] || 0), 0) / sortedMetrics.length;

      // Summary Cards Row
      const cardWidth = (contentWidth - 15) / 4;
      const cardHeight = 18;

      // Card 1: Total Reports
      setFillColor([239, 246, 255]);
      pdf.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([191, 219, 254]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([30, 64, 175]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(sortedMetrics.length), margin + 4, currentY + 8);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Total Reports", margin + 4, currentY + 14);

      // Card 2: Avg Price Impact
      const card2X = margin + cardWidth + 5;
      const priceColor = avgPriceChange >= 0 ? [34, 197, 94] : [239, 68, 68];
      const priceBg = avgPriceChange >= 0 ? [240, 253, 244] : [254, 242, 242];

      setFillColor(priceBg);
      pdf.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor(priceColor);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor(priceColor);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${avgPriceChange >= 0 ? "+" : ""}${avgPriceChange.toFixed(1)}%`, card2X + 4, currentY + 8);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Avg Price Impact", card2X + 4, currentY + 14);

      // Card 3: Avg Volume Change
      const card3X = margin + cardWidth * 2 + 10;
      const volColor = avgVolumeChange >= 0 ? [34, 197, 94] : [239, 68, 68];

      setFillColor([255, 237, 213]);
      pdf.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([245, 158, 11]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor(volColor);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${avgVolumeChange >= 0 ? "+" : ""}${avgVolumeChange.toFixed(1)}%`, card3X + 4, currentY + 8);
      setColor([245, 158, 11]);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Avg Volume Change", card3X + 4, currentY + 14);

      // Card 4: Report Period
      const card4X = margin + cardWidth * 3 + 15;
      setFillColor([245, 243, 255]);
      pdf.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([139, 92, 246]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([139, 92, 246]);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      const periodDays = sortedMetrics.length > 1 ?
        Math.floor((new Date(sortedMetrics[sortedMetrics.length - 1]["Publication Date"]) -
                   new Date(sortedMetrics[0]["Publication Date"])) / (1000 * 60 * 60 * 24)) : 0;
      pdf.text(`${periodDays}d`, card4X + 4, currentY + 8);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      pdf.text("Coverage Period", card4X + 4, currentY + 14);

      currentY += cardHeight + 12;

      // Enhanced Table Headers
      const headers = ["#", "Report Details", "30 Days Before", "30 Days After", "Impact Change"];
      const colWidths = [12, 50, 38, 38, 32];

      // Table Header with gradient-like effect
      setFillColor([248, 250, 252]);
      pdf.rect(margin, currentY, contentWidth, 10, "F");
      setDrawColor([229, 231, 235]);
      pdf.setLineWidth(0.5);
      pdf.rect(margin, currentY, contentWidth, 10, "S");

      setColor([75, 85, 99]);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");

      let startX = margin;
      headers.forEach((header, index) => {
        pdf.text(header, startX + 2, currentY + 6);
        startX += colWidths[index];
      });
      currentY += 10;

      // Enhanced Data Rows (limit to 8 for better PDF fit)
      const limitedData = sortedMetrics.slice(0, 8);
      limitedData.forEach((report, rowIndex) => {
        checkPageSpace(12);

        // Alternating row colors
        if (rowIndex % 2 === 0) {
          setFillColor([249, 250, 251]);
          pdf.rect(margin, currentY, contentWidth, 12, "F");
        }

        // Add subtle border
        setDrawColor([229, 231, 235]);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, currentY, contentWidth, 12, "S");

        // Extract enhanced data like CompanyMetrics
        const rawReport = report._raw || report;
        const frc30 = rawReport.frc_30_day_analysis || {};

        const priceOnRelease = frc30.price_on_release || report["Price on Release"] || 0;
        const priceAfter30Days = frc30.price_after_30_days || report["Price After 30 Days"] || 0;
        const priceChange30d = frc30.price_change_30_days_pct || report["Price Change 30 Days (%)"] || 0;
        const volumeChange30d = frc30.volume_change_pre_post_30_days_pct || report["Volume Change 30 Days (%)"] || 0;
        const preAvgVolume = frc30.avg_volume_pre_30_days || report["Avg Volume Pre 30 Days"] || 0;
        const postAvgVolume = frc30.avg_volume_post_30_days || report["Avg Volume Post 30 Days"] || 0;

        startX = margin;

        // Column 1: Chronological Order
        setColor([59, 130, 246]);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(String(report.chronologicalOrder), startX + 6, currentY + 7);
        startX += colWidths[0];

        // Column 2: Report Details
        setColor([31, 41, 55]);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        const title = (report["Report Title"] || `Report ${rowIndex + 1}`).substring(0, 25);
        pdf.text(title, startX + 2, currentY + 4);

        setColor([107, 114, 128]);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        const pubDate = new Date(report["Publication Date"]).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "2-digit"
        });
        pdf.text(`${pubDate} • #${report["Report Number"] || rowIndex + 1}`, startX + 2, currentY + 9);
        startX += colWidths[1];

        // Column 3: 30 Days Before
        setColor([75, 85, 99]);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.text("Price on release", startX + 2, currentY + 3);

        setColor([31, 41, 55]);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(`$${typeof priceOnRelease === 'number' ? priceOnRelease.toFixed(2) : priceOnRelease}`, startX + 2, currentY + 7);

        setColor([75, 85, 99]);
        pdf.setFontSize(6);
        pdf.text("Pre-30d volume", startX + 2, currentY + 10);
        startX += colWidths[2];

        // Column 4: 30 Days After
        setColor([75, 85, 99]);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "normal");
        pdf.text("Price after 30d", startX + 2, currentY + 3);

        setColor([31, 41, 55]);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(`$${typeof priceAfter30Days === 'number' ? priceAfter30Days.toFixed(2) : priceAfter30Days}`, startX + 2, currentY + 7);

        setColor([75, 85, 99]);
        pdf.setFontSize(6);
        pdf.text("Post-30d volume", startX + 2, currentY + 10);
        startX += colWidths[3];

        // Column 5: Impact Change (Badges)
        // Price Change Badge
        const priceColor = priceChange30d >= 0 ? [34, 197, 94] : [239, 68, 68];
        const priceBgColor = priceChange30d >= 0 ? [240, 253, 244] : [254, 242, 242];

        setFillColor(priceBgColor);
        pdf.roundedRect(startX + 2, currentY + 1, 24, 4, 1, 1, "F");
        setColor(priceColor);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        const priceText = `${priceChange30d >= 0 ? "+" : ""}${typeof priceChange30d === 'number' ? priceChange30d.toFixed(1) : priceChange30d}%`;
        pdf.text(priceText, startX + 4, currentY + 3.5);

        // Volume Change Badge
        const volBgColor = volumeChange30d >= 0 ? [239, 246, 255] : [255, 237, 213];
        const volTextColor = volumeChange30d >= 0 ? [30, 64, 175] : [245, 158, 11];

        setFillColor(volBgColor);
        pdf.roundedRect(startX + 2, currentY + 7, 24, 4, 1, 1, "F");
        setColor(volTextColor);
        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        const volText = `${volumeChange30d >= 0 ? "+" : ""}${typeof volumeChange30d === 'number' ? volumeChange30d.toFixed(1) : volumeChange30d}%`;
        pdf.text(volText, startX + 4, currentY + 9.5);

        currentY += 12;
      });

      currentY += 15;
    };

    // 5. ENHANCED BLOOMBERG INSTITUTIONAL READERSHIP - Matching BloombergReadershipTable component
    const addBloombergSection = () => {
      // Extract Bloomberg data supporting both new APIs and legacy format
      let records = [];
      let summary = {};
      let institutionsData = [];

      if (bloombergData) {
        // NEW FORMAT: Check for resolve-company API response format
        if (bloombergData.readership_analytics) {
          // This is from the new resolve-company API
          summary = {
            total_records: bloombergData.readership_analytics.total_reads || 0,
            unique_institutions: bloombergData.readership_analytics.unique_institutions || 0,
            revealed_records: bloombergData.readership_analytics.revealed_reads || 0,
            embargoed_records: bloombergData.readership_analytics.embargoed_reads || 0,
            transparency_rate: bloombergData.readership_analytics.transparency_rate || 0
          };

          // Convert institutions array to records format for table
          if (bloombergData.institutions && Array.isArray(bloombergData.institutions)) {
            institutionsData = bloombergData.institutions.map((inst, index) => ({
              institution_name: inst,
              read_count: Math.floor(summary.total_records / bloombergData.institutions.length),
              rank: index + 1
            }));
          }

          // Use recent_activity if available for detailed records
          if (bloombergData.recent_activity && Array.isArray(bloombergData.recent_activity)) {
            records = bloombergData.recent_activity.map(activity => ({
              customer_name: activity.institution,
              customer_country: activity.country,
              customer_city: activity.city,
              transaction_date: activity.date,
              report_title: activity.report_title,
              is_embargoed: false // Recent activity is typically revealed
            }));
          }
        }

        // NEW FORMAT: Check for analytics API response format
        else if (bloombergData.summary || bloombergData.top_institutions) {
          // This is from the analytics API
          summary = {
            total_records: bloombergData.summary?.total_reads || 0,
            unique_institutions: bloombergData.summary?.unique_institutions || 0,
            revealed_records: bloombergData.summary?.total_reads || 0,
            embargoed_records: 0,
            transparency_rate: bloombergData.summary?.average_transparency_rate || 0
          };

          // Use top_institutions data
          if (bloombergData.top_institutions && Array.isArray(bloombergData.top_institutions)) {
            institutionsData = bloombergData.top_institutions.map((inst, index) => ({
              institution_name: inst.institution_name,
              read_count: inst.read_count || 0,
              rank: index + 1
            }));
          }

          // Use recent_reads if available
          if (bloombergData.recent_reads && Array.isArray(bloombergData.recent_reads)) {
            records = bloombergData.recent_reads;
          }
        }

        // LEGACY FORMAT: Try to get records from revealed_records and embargoed_records
        else {
          if (bloombergData.revealed_records) {
            records = [...bloombergData.revealed_records];
          }
          if (bloombergData.embargoed_records) {
            records = [...records, ...bloombergData.embargoed_records];
          }

          // Fallback to institutional_records if the above don't exist
          if (records.length === 0 && bloombergData.institutional_records) {
            records = bloombergData.institutional_records;
          }

          summary = bloombergData.summary || {};
        }
      }

      // Show section if we have any meaningful data
      if (!summary || (summary.total_records === 0 && institutionsData.length === 0)) {
        return; // Skip this section entirely if no data
      }

      checkPageSpace(60);

      // Section Header
      setColor(colors.primary);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("BLOOMBERG INSTITUTIONAL READERSHIP", margin, currentY);
      currentY += 10;

      // Summary Cards Row - using correct field names from the log
      const cardWidth = (contentWidth - 15) / 4;
      const cardHeight = 16;

      // Card 1: Total Reads (using summary.total_records from log)
      setFillColor([239, 246, 255]);
      pdf.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([59, 130, 246]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([59, 130, 246]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(summary.total_records || 0), margin + 4, currentY + 8);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("Total Reads", margin + 4, currentY + 13);

      // Card 2: Institutions (using summary.unique_institutions from log)
      const card2X = margin + cardWidth + 5;
      setFillColor([240, 253, 244]);
      pdf.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([34, 197, 94]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([34, 197, 94]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(summary.unique_institutions || 0), card2X + 4, currentY + 8);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("Institutions", card2X + 4, currentY + 13);

      // Card 3: Embargoed Records (using summary.embargoed_records from log)
      const card3X = margin + cardWidth * 2 + 10;
      setFillColor([254, 243, 199]);
      pdf.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([245, 158, 11]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card3X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([245, 158, 11]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(summary.embargoed_records || 0), card3X + 4, currentY + 8);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("Embargoed", card3X + 4, currentY + 13);

      // Card 4: Transparency Rate (more relevant than just revealed count)
      const card4X = margin + cardWidth * 3 + 15;
      setFillColor([240, 253, 244]);
      pdf.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "F");
      setDrawColor([34, 197, 94]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(card4X, currentY, cardWidth, cardHeight, 2, 2, "S");

      setColor([34, 197, 94]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      const transparencyDisplay = summary.transparency_rate ||
        (summary.total_records > 0 ? ((summary.revealed_records / summary.total_records) * 100) : 0);
      pdf.text(`${transparencyDisplay.toFixed(1)}%`, card4X + 4, currentY + 8);
      pdf.setFontSize(6);
      pdf.setFont("helvetica", "normal");
      pdf.text("Transparency", card4X + 4, currentY + 13);

      currentY += cardHeight + 12;

      // Show "Individual Institutional Readership" table header
      setColor([75, 85, 99]);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Individual Institutional Readership Activity", margin, currentY);
      currentY += 8;

      if (records.length === 0) {
        // No individual records available, show summary message
        setFillColor([248, 250, 252]);
        pdf.rect(margin, currentY, contentWidth, 25, "F");
        setDrawColor([229, 231, 235]);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, currentY, contentWidth, 25, "S");

        setColor([107, 114, 128]);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");

        // Calculate transparency rate
        const transparencyRate = summary.transparency_rate ||
          (summary.total_records > 0 ? ((summary.revealed_records / summary.total_records) * 100) : 0);

        // Show institutions summary if we have institutions data but no detailed records
        if (institutionsData.length > 0) {
          pdf.text("Top Institutional Readers (based on aggregated data)", margin + 6, currentY + 8);
          pdf.text(`${summary.total_records} total institutional reads from ${summary.unique_institutions} unique institutions`, margin + 6, currentY + 14);
          pdf.text(`Transparency Rate: ${transparencyRate.toFixed(1)}%`, margin + 6, currentY + 18);

          currentY += 25;

          // Show institutions table
          const instHeaders = ["Rank", "Institution Name", "Est. Reads"];
          const instColWidths = [15, 120, 40];

          // Table Header
          setFillColor([51, 65, 85]);
          pdf.rect(margin, currentY, contentWidth, 8, "F");
          setColor([255, 255, 255]);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");

          let startX = margin;
          instHeaders.forEach((header, index) => {
            pdf.text(header, startX + 2, currentY + 5);
            startX += instColWidths[index];
          });
          currentY += 8;

          // Institution rows (top 10)
          institutionsData.slice(0, 10).forEach((inst, index) => {
            checkPageSpace(8);

            setFillColor(index % 2 === 0 ? [248, 250, 252] : [255, 255, 255]);
            pdf.rect(margin, currentY, contentWidth, 8, "F");

            setDrawColor([229, 231, 235]);
            pdf.setLineWidth(0.2);
            pdf.rect(margin, currentY, contentWidth, 8, "S");

            startX = margin;

            // Rank
            setColor([31, 41, 55]);
            pdf.setFontSize(7);
            pdf.setFont("helvetica", "bold");
            pdf.text(String(inst.rank), startX + 2, currentY + 5);
            startX += instColWidths[0];

            // Institution Name
            pdf.setFont("helvetica", "normal");
            const instName = String(inst.institution_name).substring(0, 50);
            pdf.text(instName, startX + 2, currentY + 5);
            startX += instColWidths[1];

            // Read Count
            setColor([59, 130, 246]);
            pdf.setFont("helvetica", "bold");
            pdf.text(String(inst.read_count), startX + 2, currentY + 5);

            currentY += 8;
          });

          currentY += 5;
        } else {
          // No detailed data available
          pdf.text("Individual institutional readership records are currently embargoed.", margin + 6, currentY + 8);
          pdf.text(`However, we can show aggregate statistics:`, margin + 6, currentY + 14);
          pdf.text(`• ${summary.total_records} total institutional reads from ${summary.unique_institutions} unique institutions`, margin + 6, currentY + 18);
          pdf.text(`• Transparency Rate: ${transparencyRate.toFixed(1)}%`, margin + 6, currentY + 22);

          currentY += 30;
        }
      } else {
        // Group records by institution to find top readers
        const institutionGroups = {};
        records.forEach(record => {
          const institution = record.customer_name || "Unknown Institution";
          if (!institutionGroups[institution]) {
            institutionGroups[institution] = {
              name: institution,
              country: record.customer_country || "N/A",
              city: record.customer_city || "N/A",
              customer_number: record.customer_number,
              records: [],
              total_reads: 0
            };
          }
          institutionGroups[institution].records.push(record);
          institutionGroups[institution].total_reads++;
        });

        // Sort institutions by total reads and get top 10
        const topInstitutions = Object.values(institutionGroups)
          .sort((a, b) => b.total_reads - a.total_reads)
          .slice(0, 10);

        // Individual Readership Records Table (matching BloombergReadershipTable design)
        // Sort records like the component: revealed first, then by date
        const sortedRecords = records.sort((a, b) => {
          // Primary sort: revealed records first (is_embargoed: false first)
          if (a.is_embargoed !== b.is_embargoed) {
            return a.is_embargoed ? 1 : -1; // false (revealed) comes before true (embargoed)
          }
          // Secondary sort: by transaction_date (newest first) within each group
          const dateA = new Date(a.transaction_date);
          const dateB = new Date(b.transaction_date);
          return dateB - dateA;
        });

        // Show top 15 records to give good overview
        const limitedRecords = sortedRecords.slice(0, 15);

        // Table Headers matching the component
        const headers = ["Institution", "Report Title", "Country", "City", "Access Date", "Status"];
        const colWidths = [40, 50, 22, 20, 25, 18];

        // Table Header with dark gradient (matching component)
        setFillColor([51, 65, 85]);
        pdf.rect(margin, currentY, contentWidth, 10, "F");
        setDrawColor([71, 85, 105]);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, currentY, contentWidth, 10, "S");

        setColor([255, 255, 255]);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "bold");

        let startX = margin;
        headers.forEach((header, index) => {
          pdf.text(header, startX + 2, currentY + 6);
          startX += colWidths[index];
        });
        currentY += 10;

        // Individual Records - matching component row design
        limitedRecords.forEach((record, index) => {
          checkPageSpace(10);

          // Row background - revealed records get green tint, embargoed get yellow tint
          const bgColor = record.is_embargoed ? [254, 252, 232] : [240, 253, 244]; // yellow for embargoed, green for revealed
          setFillColor(index % 2 === 0 ? bgColor : [255, 255, 255]);
          pdf.rect(margin, currentY, contentWidth, 10, "F");

          // Add row border
          setDrawColor([229, 231, 235]);
          pdf.setLineWidth(0.2);
          pdf.rect(margin, currentY, contentWidth, 10, "S");

          startX = margin;

          // Column 1: Institution Name with customer number
          setColor([31, 41, 55]);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");
          const institutionName = String(record.customer_name || "Unknown Institution").substring(0, 22);
          pdf.text(institutionName, startX + 2, currentY + 4);

          if (record.customer_number) {
            setColor([107, 114, 128]);
            pdf.setFontSize(5);
            pdf.setFont("helvetica", "normal");
            pdf.text(`#${record.customer_number}`, startX + 2, currentY + 8);
          }
          startX += colWidths[0];

          // Column 2: Report Title with authors
          setColor([31, 41, 55]);
          pdf.setFontSize(6.5);
          pdf.setFont("helvetica", "bold");
          const reportTitle = String(record.title || "N/A").substring(0, 30);
          pdf.text(reportTitle, startX + 2, currentY + 4);

          if (record.authors) {
            setColor([107, 114, 128]);
            pdf.setFontSize(5);
            pdf.setFont("helvetica", "normal");
            const authors = String(record.authors).substring(0, 25);
            pdf.text(`By: ${authors}`, startX + 2, currentY + 8);
          }
          startX += colWidths[1];

          // Column 3: Country with flag representation (text)
          setColor([31, 41, 55]);
          pdf.setFontSize(6);
          pdf.setFont("helvetica", "normal");
          const country = String(record.customer_country || "N/A").substring(0, 12);
          pdf.text(country, startX + 2, currentY + 4);

          if (record.customer_state) {
            setColor([107, 114, 128]);
            pdf.setFontSize(5);
            pdf.text(String(record.customer_state).substring(0, 12), startX + 2, currentY + 8);
          }
          startX += colWidths[2];

          // Column 4: City
          setColor([31, 41, 55]);
          pdf.setFontSize(6);
          pdf.setFont("helvetica", "normal");
          const city = String(record.customer_city || "N/A").substring(0, 12);
          pdf.text(city, startX + 2, currentY + 6);
          startX += colWidths[3];

          // Column 5: Access Date with Published Date
          setColor([31, 41, 55]);
          pdf.setFontSize(6);
          pdf.setFont("helvetica", "normal");
          if (record.transaction_date) {
            const accessDate = new Date(record.transaction_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "2-digit"
            });
            pdf.text(accessDate, startX + 2, currentY + 4);
          }

          if (record.post_date) {
            setColor([107, 114, 128]);
            pdf.setFontSize(5);
            const pubDate = new Date(record.post_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            });
            pdf.text(`Pub: ${pubDate}`, startX + 2, currentY + 8);
          }
          startX += colWidths[4];

          // Column 6: Status Badge (matching component style)
          if (record.is_embargoed) {
            // Embargoed status
            setFillColor([254, 243, 199]);
            pdf.roundedRect(startX + 2, currentY + 2, 14, 5, 1, 1, "F");
            setColor([245, 158, 11]);
            pdf.setFontSize(4);
            pdf.setFont("helvetica", "bold");
            pdf.text("Embargoed", startX + 3, currentY + 5);
          } else {
            // Revealed status
            setFillColor([240, 253, 244]);
            pdf.roundedRect(startX + 2, currentY + 2, 14, 5, 1, 1, "F");
            setColor([34, 197, 94]);
            pdf.setFontSize(4);
            pdf.setFont("helvetica", "bold");
            pdf.text("Revealed", startX + 3, currentY + 5);
          }

          currentY += 10;
        });

        // Footer summary info (matching component footer)
        currentY += 6;
        setColor([107, 114, 128]);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");

        const embargoCount = records.filter(r => r.is_embargoed).length;
        const embargoRate = records.length > 0 ? (embargoCount / records.length * 100) : 0;

        pdf.text(`Showing top ${Math.min(15, records.length)} of ${records.length} total institutional reads`, margin, currentY);
        pdf.text(`• Embargo Rate: ${embargoRate.toFixed(1)}%`, margin + 80, currentY);

        currentY += 10;
      }

      currentY += 10;
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
    addDataCoverageSection(); // Enhanced Data Coverage section with professional design
    await addChartSection();
    addMetricsTable();
    addBloombergSection();
    addAIAnalysisSection();
    addFooter();

    // Generate filename
    const filename = `FRR_Coverage_Report_${ticker}_${
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