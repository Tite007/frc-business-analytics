// API Integration for Financial Reports
// This file shows how to integrate the dynamic financial report system with your backend

// 1. Data fetching functions
export async function fetchCompanyData(ticker) {
  try {
    const response = await fetch(`/api/companies/${ticker}`);
    if (!response.ok) throw new Error('Failed to fetch company data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching company data:', error);
    throw error;
  }
}

export async function fetchFinancialData(ticker, years = 3) {
  try {
    const response = await fetch(`/api/companies/${ticker}/financials?years=${years}`);
    if (!response.ok) throw new Error('Failed to fetch financial data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial data:', error);
    throw error;
  }
}

export async function fetchStockPerformance(ticker) {
  try {
    const response = await fetch(`/api/companies/${ticker}/performance`);
    if (!response.ok) throw new Error('Failed to fetch stock performance');
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock performance:', error);
    throw error;
  }
}

// 2. Report data transformation functions
export function transformCompanyDataToReportFormat(companyData, financialData, performanceData, analystData) {
  return {
    reportDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    company: {
      name: companyData.name,
      ticker: `(${companyData.exchange}: ${companyData.ticker})`,
      sector: companyData.sector
    },
    recommendation: {
      rating: analystData.recommendation || "HOLD",
      currentPrice: `US$${companyData.currentPrice}`,
      fairValue: `US$${analystData.fairValue}`,
      risk: analystData.riskRating || "3"
    },
    title: analystData.reportTitle,
    author: {
      name: analystData.author.name,
      title: analystData.author.title
    },
    highlights: analystData.highlights || [],
    mainPoints: analystData.mainPoints || [],
    additionalContent: analystData.additionalContent || [],
    stockPerformance: {
      ytd: performanceData.ytd,
      oneMonth: performanceData.oneMonth,
      marketYtd: performanceData.marketYtd,
      marketOneMonth: performanceData.marketOneMonth
    },
    companyData: {
      weekRange52: `US$${companyData.weekLow52}-${companyData.weekHigh52}`,
      sharesOutstanding: companyData.sharesOutstanding,
      marketCap: `US$${companyData.marketCap}`,
      yield: companyData.dividendYield || "N/A",
      forwardPE: companyData.forwardPE || "N/A",
      priceToBook: companyData.priceToBook || "N/A"
    },
    financialData: {
      headers: ["YE Dec 31st", ...financialData.years],
      rows: financialData.metrics.map(metric => ({
        label: metric.label,
        values: metric.values
      }))
    },
    disclaimer: analystData.disclaimer || "Standard disclaimer text here.",
    footer: {
      copyright: "©2025 Fundamental Research Corp.",
      tagline: "22+ Years of Bringing Undiscovered Investment Opportunities to the Forefront",
      website: "www.researchfrc.com"
    }
  };
}

// 3. PDF generation functions
export async function generateReportPDF(reportData, paperSize = { name: "Letter", width: 8.5, height: 11, unit: "in" }) {
  try {
    const { generatePDFOptimizedHTML } = await import('@/lib/reportHTMLGenerator');
    const htmlContent = generatePDFOptimizedHTML(reportData, paperSize);
    
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        paperSize: paperSize,
        fileName: `${reportData.company.name.replace(/\s+/g, '_')}_Financial_Report.pdf`
      })
    });
    
    if (!response.ok) throw new Error('Failed to generate PDF');
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function downloadReportPDF(reportData, paperSize) {
  try {
    const pdfBlob = await generateReportPDF(reportData, paperSize);
    const url = window.URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.company.name.replace(/\s+/g, '_')}_Financial_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

// 4. Complete report generation workflow
export async function generateCompleteReport(ticker, analystInput) {
  try {
    // Fetch all required data
    const [companyData, financialData, performanceData] = await Promise.all([
      fetchCompanyData(ticker),
      fetchFinancialData(ticker),
      fetchStockPerformance(ticker)
    ]);
    
    // Transform data to report format
    const reportData = transformCompanyDataToReportFormat(
      companyData,
      financialData,
      performanceData,
      analystInput
    );
    
    return reportData;
  } catch (error) {
    console.error('Error generating complete report:', error);
    throw error;
  }
}

// 5. Save report to database
export async function saveReportToDatabase(reportData, reportId = null) {
  try {
    const url = reportId ? `/api/reports/${reportId}` : '/api/reports';
    const method = reportId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData)
    });
    
    if (!response.ok) throw new Error('Failed to save report');
    
    return await response.json();
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
}

// 6. Load report from database
export async function loadReportFromDatabase(reportId) {
  try {
    const response = await fetch(`/api/reports/${reportId}`);
    if (!response.ok) throw new Error('Failed to load report');
    return await response.json();
  } catch (error) {
    console.error('Error loading report:', error);
    throw error;
  }
}

// 7. Example React Hook for using in components
export function useFinancialReport(ticker, initialAnalystInput = null) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (analystInput) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateCompleteReport(ticker, analystInput || initialAnalystInput);
      setReportData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async (reportId = null) => {
    if (!reportData) throw new Error('No report data to save');
    return await saveReportToDatabase(reportData, reportId);
  };

  const exportToPDF = async (paperSize) => {
    if (!reportData) throw new Error('No report data to export');
    return await downloadReportPDF(reportData, paperSize);
  };

  return {
    reportData,
    loading,
    error,
    generateReport,
    saveReport,
    exportToPDF,
    setReportData
  };
}

// 8. Example usage in a React component
export function ExampleUsage() {
  const {
    reportData,
    loading,
    error,
    generateReport,
    exportToPDF
  } = useFinancialReport("AAPL");

  const handleGenerateReport = async () => {
    const analystInput = {
      recommendation: "BUY",
      fairValue: "200.00",
      riskRating: "2",
      reportTitle: "Strong iPhone 16 Sales Drive Q4 Performance",
      author: {
        name: "John Smith, CFA",
        title: "Senior Technology Analyst"
      },
      highlights: [
        "Revenue exceeded expectations...",
        "iPhone 16 pre-orders up 15%..."
      ],
      mainPoints: [
        {
          title: "Strong Product Cycle:",
          content: "iPhone 16 series showing strong adoption..."
        }
      ]
    };

    await generateReport(analystInput);
  };

  if (loading) return <div>Generating report...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {!reportData ? (
        <button onClick={handleGenerateReport}>
          Generate Report
        </button>
      ) : (
        <DynamicFinancialReport
          reportData={reportData}
          onExportPDF={(data, paperSize) => exportToPDF(paperSize)}
          onPrint={(data, paperSize) => window.print()}
        />
      )}
    </div>
  );
}
