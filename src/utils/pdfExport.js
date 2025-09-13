import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility function to export company report as PDF
 * @param {Object} data - Company data object
 * @param {string} ticker - Company ticker symbol
 * @param {Object} options - Export options
 */
export async function exportCompanyReportToPDF(data, ticker, options = {}) {
  try {
    const {
      companyData,
      chartData,
      metricsData,
      analysisData,
      includeCharts = true,
      includeTables = true,
      includeAnalysis = true,
    } = data;

    // Initialize PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let currentY = margin;

    // Function to add new page if needed
    const checkPageSpace = (neededSpace) => {
      if (currentY + neededSpace > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Function to load and add logo
    const addLogo = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        return new Promise((resolve, reject) => {
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              
              const logoWidth = 40;
              const logoHeight = (img.height / img.width) * logoWidth;
              
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, currentY, logoWidth, logoHeight);
              currentY += logoHeight + 10;
              resolve();
            } catch (error) {
              console.warn('Could not add logo to PDF:', error);
              resolve(); // Continue without logo
            }
          };
          
          img.onerror = () => {
            console.warn('Could not load logo image');
            resolve(); // Continue without logo
          };
          
          img.src = '/FRC_Logo_FullWhite.png';
        });
      } catch (error) {
        console.warn('Error loading logo:', error);
      }
    };

    // Add logo
    await addLogo();

    // Add header with company information
    const addCompanyHeader = () => {
      const companyName = companyData?.company_name || 
                          companyData?.data?.company_profile?.name || 
                          ticker;
      const exchange = companyData?.exchange || 
                      companyData?.data?.company_profile?.exchange || 
                      'N/A';
      const currency = companyData?.currency || 
                      companyData?.data?.company_profile?.currency || 
                      'USD';

      // Company name and ticker
      pdf.setFontSize(24);
      pdf.setTextColor(31, 81, 147); // Blue color
      pdf.text(`${companyName} (${ticker})`, margin, currentY);
      currentY += 12;

      // Exchange and currency badges
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Exchange: ${exchange} | Currency: ${currency}`, margin, currentY);
      currentY += 15;

      // Report title and date
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Financial Research Report', margin, currentY);
      currentY += 8;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const reportDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Generated on ${reportDate}`, margin, currentY);
      currentY += 20;
    };

    addCompanyHeader();

    // Add company overview section
    const addCompanyOverview = () => {
      checkPageSpace(30);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Company Overview', margin, currentY);
      currentY += 10;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);

      // Extract industry and sector from the actual API response structure
      const industry = companyData?.data?.company_profile?.industry || 
                      companyData?.company_profile?.industry ||
                      companyData?.industry || 
                      companyData?.data?.industry ||
                      'N/A';
      const sector = companyData?.data?.company_profile?.sector || 
                    companyData?.company_profile?.sector ||
                    companyData?.sector || 
                    companyData?.data?.sector ||
                    'N/A';

      // Get metrics count from actual data
      const reportsCount = metricsData?.length || 
                          companyData?.reports_count ||
                          companyData?.data?.reports_count ||
                          companyData?.reports?.length ||
                          0;

      const overviewText = [
        `Industry: ${industry}`,
        `Sector: ${sector}`,
        `Reports Available: ${reportsCount}`,
        `FRC Coverage: Active`
      ];

      overviewText.forEach(text => {
        pdf.text(text, margin + 5, currentY);
        currentY += 6;
      });

      currentY += 10;
    };

    addCompanyOverview();

    // Add charts section (if chart data exists)
    const addChartsSection = async () => {
      if (!includeCharts) return;
      
      checkPageSpace(30);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Performance Charts', margin, currentY);
      currentY += 15;

      // Try to capture chart from DOM
      try {
        const chartElement = document.querySelector('[data-testid="chart-container"]') || 
                            document.querySelector('.chart-container') ||
                            document.querySelector('#chart-container');
        
        if (chartElement) {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            useCORS: true,
            allowTaint: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          checkPageSpace(imgHeight + 10);
          
          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } else {
          pdf.setFontSize(11);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Chart data not available for export', margin + 5, currentY);
          currentY += 15;
        }
      } catch (error) {
        console.warn('Could not capture chart:', error);
        pdf.setFontSize(11);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Chart could not be captured', margin + 5, currentY);
        currentY += 15;
      }
    };

    await addChartsSection();

    // Add metrics table section
    const addMetricsSection = () => {
      if (!includeTables || !metricsData || metricsData.length === 0) return;

      checkPageSpace(30);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Key Metrics Summary', margin, currentY);
      currentY += 15;

      // Table headers
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      const headers = ['Date', 'Volume Change 30d (%)', 'Pre-Post Change (%)', 'Report Type'];
      const colWidths = [35, 40, 40, 45];
      let startX = margin;

      // Draw headers
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, currentY - 3, contentWidth, 8, 'F');
      
      headers.forEach((header, index) => {
        pdf.text(header, startX + 2, currentY + 2);
        startX += colWidths[index];
      });
      currentY += 10;

      // Draw data rows (limit to first 10 for space)
      const limitedData = metricsData.slice(0, 10);
      limitedData.forEach((row, rowIndex) => {
        if (checkPageSpace(6)) {
          // Redraw headers after page break
          pdf.setFillColor(240, 240, 240);
          pdf.rect(margin, currentY - 3, contentWidth, 8, 'F');
          startX = margin;
          headers.forEach((header, index) => {
            pdf.text(header, startX + 2, currentY + 2);
            startX += colWidths[index];
          });
          currentY += 10;
        }

        startX = margin;
        
        // Handle different possible date formats and field names from your API
        const dateField = row.date || row.Date || row.report_date || row.created_at || 'N/A';
        const formattedDate = dateField !== 'N/A' ? 
          new Date(dateField).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          }).replace(/\//g, '-') : 'N/A';

        // Handle different field names for volume changes from your actual API response
        const volumeChange30 = row['Volume Change 30 Days (%)'] || 
                              row.volume_change_30d || 
                              row.volumeChange30Days || 
                              row.volume_change_30_days || 
                              0;

        const prePostChange = row['Volume Change Pre-Post 30 Days (%)'] || 
                             row.pre_post_change_30d || 
                             row.prePostChange30Days || 
                             row.volume_change_pre_post || 
                             0;

        const reportType = row.report_type || 
                          row.type || 
                          row.reportType || 
                          row.category ||
                          'Report';

        const values = [
          formattedDate,
          `${Number(volumeChange30).toFixed(2)}%`,
          `${Number(prePostChange).toFixed(2)}%`,
          String(reportType).substring(0, 15)
        ];

        // Alternate row background
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(margin, currentY - 3, contentWidth, 6, 'F');
        }

        values.forEach((value, index) => {
          pdf.text(String(value).substring(0, 20), startX + 2, currentY + 2);
          startX += colWidths[index];
        });
        currentY += 6;
      });

      if (metricsData.length > 10) {
        currentY += 5;
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`... and ${metricsData.length - 10} more entries`, margin, currentY);
      }

      currentY += 20;
    };

    addMetricsSection();

    // Add Bloomberg analysis section
    const addBloombergSection = () => {
      checkPageSpace(30);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Bloomberg Readership Data', margin, currentY);
      currentY += 15;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      
      const bloombergText = [
        '• Bloomberg Terminal readership tracking',
        '• Professional investor engagement metrics',
        '• Market sentiment indicators',
        '• Institutional coverage analysis'
      ];

      bloombergText.forEach(text => {
        pdf.text(text, margin + 5, currentY);
        currentY += 6;
      });

      currentY += 15;
    };

    addBloombergSection();

    // Add AI analysis section
    const addAnalysisSection = () => {
      if (!includeAnalysis) return;

      checkPageSpace(40);
      
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('AI Analysis Summary', margin, currentY);
      currentY += 15;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);

      let analysisText = 'AI-powered analysis of financial data and market trends...';
      
      // Handle different possible structures for analysis data from your API
      if (analysisData) {
        if (typeof analysisData === 'string') {
          analysisText = analysisData;
        } else if (analysisData.summary) {
          analysisText = analysisData.summary;
        } else if (analysisData.analysis) {
          analysisText = analysisData.analysis;
        } else if (analysisData.text) {
          analysisText = analysisData.text;
        } else if (analysisData.content) {
          analysisText = analysisData.content;
        } else if (analysisData.ai_analysis) {
          analysisText = analysisData.ai_analysis;
        }
      }

      // If no analysis data is available, show a default message
      if (!analysisData || analysisText === 'AI-powered analysis of financial data and market trends...') {
        analysisText = `FRC AI analysis for ${ticker} provides comprehensive insights into market performance, trading volume patterns, and institutional investor behavior. Our proprietary algorithms analyze multiple data points including Bloomberg readership metrics, volume changes, and market sentiment indicators to deliver actionable investment intelligence.`;
      }

      // Split text to fit within margins
      const lines = pdf.splitTextToSize(analysisText, contentWidth - 10);
      
      lines.forEach(line => {
        if (checkPageSpace(6)) {
          // Continue on new page
        }
        pdf.text(line, margin + 5, currentY);
        currentY += 6;
      });

      currentY += 15;
    };

    addAnalysisSection();

    // Add footer
    const addFooter = () => {
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          'Generated by FRC Business Analytics Platform',
          margin,
          pageHeight - 10
        );
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 10
        );
      }
    };

    addFooter();

    // Generate filename
    const filename = `FRC_Report_${ticker}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    pdf.save(filename);

    return {
      success: true,
      filename,
      pages: pdf.internal.getNumberOfPages()
    };

  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Helper function to capture a DOM element as image for PDF
 * @param {string} selector - CSS selector for the element
 * @param {Object} options - html2canvas options
 */
export async function captureElementAsImage(selector, options = {}) {
  try {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      ...options
    });

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing element:', error);
    return null;
  }
}