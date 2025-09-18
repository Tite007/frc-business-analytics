import axios from "axios";

// Use the backend URL from environment variable with fallback
const getBaseURL = () => {
  const envURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Debug: Log all environment variables that start with NEXT_PUBLIC
  console.log(
    "All NEXT_PUBLIC env vars:",
    Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC"))
  );
  console.log("NEXT_PUBLIC_BACKEND_URL value:", envURL);
  console.log("Type of envURL:", typeof envURL);

  const fallbackURL = "http://localhost:8000";

  // Handle various edge cases
  if (!envURL || envURL.trim() === "") {
    console.warn(
      "NEXT_PUBLIC_BACKEND_URL is empty, using fallback:",
      fallbackURL
    );
    return fallbackURL;
  }

  const baseURL = envURL.trim();
  console.log("Using API Base URL:", baseURL);
  return baseURL;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

// Enhanced API functions for the FRC backend
export async function getCompanyData(ticker, endpoint = "companies") {
  let url;
  try {
    switch (endpoint) {
      case "companies":
        url = "/api/frc/companies";
        break;
      case "company":
        // Use the FRC company profile endpoint
        url = `/api/frc/company/${ticker}`;
        break;
      case "profile":
        url = `/api/frc/company/${ticker}`;
        break;
      case "chart":
        url = `/api/frc/company/${ticker}/chart`;
        break;
      case "stock":
        url = `/api/stock/${ticker}`;
        break;
      case "metrics":
        url = `/api/frc/company/${ticker}/metrics`;
        break;
      case "analysis":
        url = `/api/frc/company/${ticker}/analysis`;
        break;
      case "reports":
        url = `/api/reports/${ticker}`;
        break;
      case "stats":
        url = "/api/frc/stats";
        break;
      default:
        url = `/api/frc/${endpoint}/${ticker}`;
    }

    console.log(`Making API request to: ${api.defaults.baseURL}${url}`);
    const response = await api.get(url);

    // Handle the response based on the endpoint
    if (endpoint === "company") {
      // The FRC company endpoint should return a single company object
      if (response.data.success && response.data.company) {
        const companyData = response.data.company;
        return {
          success: true,
          company: companyData,
          data_available: {
            has_reports: companyData.reports_count > 0,
            has_chart: companyData.has_chart || false,
            has_metrics: companyData.has_metrics || false,
            has_ai_analysis:
              companyData.status === "success" && companyData.analysis_date,
          },
        };
      } else {
        return {
          error: true,
          message: `Company with ticker '${ticker}' not found`,
          status: 404,
        };
      }
    }

    // Handle metrics endpoint
    if (endpoint === "metrics") {
      if (response.data.success) {
        return {
          success: true,
          metrics: response.data.detailed_metrics || [],
          performance_summary: response.data.performance_summary
        };
      }
    }

    // Handle chart endpoint
    if (endpoint === "chart") {
      if (response.data.success) {
        return {
          success: true,
          chart_data: response.data.chart_data || {},
          chart_config: response.data.chart_config
        };
      }
    }

    // Handle analysis endpoint
    if (endpoint === "analysis") {
      if (response.data.success) {
        return {
          success: true,
          ai_analysis: response.data.ai_analysis || "",
          analysis_metadata: response.data.analysis_metadata
        };
      }
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} for ${ticker}:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      baseURL: api.defaults.baseURL,
      url: url,
      code: error.code,
    });

    // Return error details for better debugging
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
      baseURL: api.defaults.baseURL,
      url: url,
      code: error.code,
    };
  }
}

// Search companies
export async function searchCompanies(query, limit = 20) {
  try {
    // Use the FRC companies endpoint with search parameter
    const response = await api.get(
      `/api/frc/companies?search=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching companies:", error);
    return null;
  }
}

// Get database statistics
export async function getStats() {
  try {
    const response = await api.get("/api/frc/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

// Get companies with filtering
export async function getCompanies(filters = {}) {
  try {
    const params = new URLSearchParams();

    if (filters.exchange) params.append("exchange", filters.exchange);
    if (filters.currency) params.append("currency", filters.currency);
    if (filters.has_reports !== undefined)
      params.append("has_reports", filters.has_reports);
    if (filters.has_stock_data !== undefined)
      params.append("has_stock_data", filters.has_stock_data);
    if (filters.has_chart !== undefined)
      params.append("has_chart", filters.has_chart);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.skip) params.append("skip", filters.skip);
    if (filters.search) params.append("search", filters.search);

    const url = `/api/frc/companies${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await api.get(url);

    // Return the full response object which contains { success, companies, total_companies }
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    console.error("URL attempted:", url);
    console.error("Full error details:", error.response || error);
    
    // Return empty result structure to prevent crashes
    return {
      success: false,
      companies: [],
      total_companies: 0,
      error: error.response?.status === 404 
        ? "Companies endpoint not available (404)" 
        : `API Error: ${error.message}`,
    };
  }
}

// User Management API Functions
export async function getUsers() {
  try {
    const response = await api.get("/api/auth/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return { error: true, message: error.message };
  }
}

export async function getUser(userId) {
  try {
    const response = await api.get(`/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    return { error: true, message: error.message };
  }
}

export async function createUser(userData) {
  try {
    const response = await api.post("/api/auth/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return { error: true, message: error.message };
  }
}

export async function updateUser(userId, userData) {
  try {
    const response = await api.put(`/api/auth/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: true, message: error.message };
  }
}

export async function deleteUser(userId) {
  try {
    const response = await api.delete(`/api/auth/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: true, message: error.message };
  }
}

export async function loginUser(credentials) {
  try {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    return { error: true, message: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/api/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return { error: true, message: error.message };
  }
}

// ============================================================================
// BLOOMBERG READERSHIP API FUNCTIONS
// Comprehensive Bloomberg Terminal readership data integration
// ============================================================================

// Bloomberg API Health Check
export async function getBloombergHealth() {
  try {
    const response = await api.get('/api/bloomberg/health');
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg health:", error);
    return { error: true, message: error.message, status: error.response?.status };
  }
}

// Bloomberg Statistics Overview
export async function getBloombergStats() {
  try {
    const response = await api.get('/api/bloomberg/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg stats:", error);
    return { error: true, message: error.message, status: error.response?.status };
  }
}

// All Companies with Bloomberg Coverage
export async function getBloombergCompanies(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.sort_by) queryParams.sort_by = options.sort_by;

    const response = await api.get('/api/bloomberg/companies', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg companies:", error);
    return { error: true, message: error.message, status: error.response?.status };
  }
}

// Detailed Company Bloomberg Data
export async function getBloombergReadership(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;
    if (options.days) queryParams.days = options.days;

    const response = await api.get(`/api/bloomberg/company/${ticker}`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg readership:", error);
    const statusCode = error.response?.status;
    const errorMessage = statusCode === 404
      ? `Bloomberg readership endpoints not available (404)`
      : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// Legacy alias for getBloombergReadership (backward compatibility)
export async function getBloombergInstitutional(ticker, options = {}) {
  return await getBloombergReadership(ticker, options);
}

// Bloomberg Analytics for Company
export async function getBloombergAnalytics(ticker) {
  try {
    const response = await api.get(`/api/bloomberg/analytics/${ticker}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg analytics:", error);
    const statusCode = error.response?.status;
    const errorMessage = statusCode === 404
      ? `Bloomberg analytics endpoint not available (404)`
      : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// Bloomberg Institutions Directory
export async function getBloombergInstitutions(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.country) queryParams.country = options.country;

    const response = await api.get('/api/bloomberg/institutions', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg institutions:", error);
    return { error: true, message: error.message, status: error.response?.status };
  }
}

// Bloomberg Reports Analysis for Company
export async function getBloombergReports(ticker) {
  try {
    const response = await api.get(`/api/bloomberg/reports/${ticker}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg reports:", error);
    const statusCode = error.response?.status;
    const errorMessage = statusCode === 404
      ? `Bloomberg reports endpoint not available (404)`
      : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// Raw Bloomberg Data (for advanced analysis)
export async function getBloombergRawData(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = Math.min(options.limit, 500); // Max 500 per docs

    const response = await api.get(`/api/bloomberg/company/${ticker}/raw`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg raw data:", error);
    return { error: true, message: error.message, status: error.response?.status };
  }
}

// Legacy alias for getBloombergReadership (backward compatibility)
export async function getBloombergSummary(ticker) {
  return await getBloombergReadership(ticker);
}

export async function getBloombergTrends(ticker, days = 90) {
  try {
    const response = await api.get(`/api/bloomberg/company/${ticker}`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg trends:", error);
    // Include status code in error message for better handling
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg readership endpoints not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// Enhanced Bloomberg Analysis (combines analytics + readership data)
export async function getBloombergAnalysis(ticker, options = {}) {
  try {
    // Get both analytics and readership data for comprehensive analysis
    const [analyticsResponse, readershipResponse] = await Promise.all([
      getBloombergAnalytics(ticker),
      getBloombergReadership(ticker, { include_embargoed: true })
    ]);

    // Handle analytics error
    if (analyticsResponse.error) {
      return analyticsResponse;
    }

    // Handle readership error (less critical)
    if (readershipResponse.error) {
      console.warn("Readership data unavailable for", ticker);
    }

    const analytics = analyticsResponse.analytics || {};
    const interpretation = analyticsResponse.interpretation || {};
    const readership = readershipResponse.success ? readershipResponse : {};

    // Build comprehensive analysis data structure
    const analysisData = {
      stats: {
        total_records: analytics.total_reads || 0,
        embargoed_count: Math.round((analytics.total_reads || 0) * (analytics.embargo_rate || 0) / 100),
        revealed_count: analytics.revealed_reads || 0,
        embargoed_percentage: analytics.embargo_rate || 0,
        revealed_percentage: Math.round(100 - (analytics.embargo_rate || 0)),
        unique_institutions: readership.summary?.unique_institutions || Object.keys(analytics.geographic_distribution || {}).length,
      },

      // Enhanced geographic analysis
      top_countries: Object.entries(analytics.geographic_distribution || {})
        .map(([country, count]) => ({
          country: getCountryName(country), // Helper to expand country codes
          code: country,
          count,
          percentage: Math.round((count / (analytics.total_reads || 1)) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 countries

      // Top institutions from readership data
      top_institutions: (readership.revealed_institutions || [])
        .slice(0, 5)
        .map((institution, index) => ({
          institution,
          count: readership.revealed_institutions?.length - index || 1,
          percentage: Math.round(((readership.revealed_institutions?.length - index) / (readership.revealed_institutions?.length || 1)) * 100)
        })),

      // Enhanced insights
      key_insights: generateBloombergInsights(analytics, interpretation, readership),

      // Rich AI analysis
      ai_analysis: generateAIAnalysis(analytics, interpretation, readership),

      // Timeline data for charts
      reading_timeline: analytics.reading_timeline || {},

      // Additional metadata
      analysis_date: new Date().toISOString().split('T')[0],
      last_updated: analyticsResponse.timestamp || new Date().toISOString(),
      embargo_system: readership.embargo_system || {}
    };

    return {
      success: true,
      data: analysisData
    };

  } catch (error) {
    console.error("Error generating Bloomberg analysis:", error);
    return {
      error: true,
      message: error.message || "Failed to generate Bloomberg analysis",
      status: error.response?.status
    };
  }
}

// Helper function to expand country codes to full names
function getCountryName(code) {
  const countryMap = {
    'US': 'United States', 'CN': 'China', 'HK': 'Hong Kong', 'ENG': 'United Kingdom',
    'SP': 'Spain', 'TI': 'Taiwan', 'IN': 'India', 'F': 'France', 'CND': 'Canada',
    'CH': 'Switzerland', 'J': 'Japan', 'KS': 'South Korea', 'I': 'Italy', 'BR': 'Brazil',
    'A': 'Austria', 'D': 'Germany', 'B': 'Belgium', 'NL': 'Netherlands', 'E': 'Spain',
    'L': 'Luxembourg', 'TH': 'Thailand', 'SA': 'Saudi Arabia', 'PE': 'Peru'
  };
  return countryMap[code] || code;
}

// Generate intelligent insights from Bloomberg data
function generateBloombergInsights(analytics, interpretation, readership) {
  const insights = [];

  // Embargo rate insights
  if (analytics.embargo_rate > 20) {
    insights.push(`High embargo rate (${analytics.embargo_rate}%) indicates significant recent institutional interest`);
  } else if (analytics.embargo_rate < 5) {
    insights.push(`Low embargo rate (${analytics.embargo_rate}%) suggests established institutional following`);
  }

  // Geographic insights
  const topCountries = Object.keys(analytics.geographic_distribution || {}).length;
  if (topCountries > 15) {
    insights.push(`Global institutional interest with ${topCountries} countries represented`);
  } else if (topCountries > 5) {
    insights.push(`Regional institutional focus across ${topCountries} key markets`);
  }

  // Reading volume insights
  if (analytics.total_reads > 500) {
    insights.push(`High institutional engagement with ${analytics.total_reads} total reads`);
  } else if (analytics.total_reads > 100) {
    insights.push(`Moderate institutional attention with ${analytics.total_reads} reads`);
  }

  // Timeline insights
  const timeline = analytics.reading_timeline || {};
  const months = Object.keys(timeline);
  if (months.length > 12) {
    insights.push(`Sustained institutional interest over ${months.length} months`);
  }

  return insights.length > 0 ? insights : ['Limited Bloomberg readership data available'];
}

// Generate comprehensive AI analysis
function generateAIAnalysis(analytics, interpretation, readership) {
  const totalReads = analytics.total_reads || 0;
  const embargoRate = analytics.embargo_rate || 0;
  const countries = Object.keys(analytics.geographic_distribution || {}).length;
  const institutions = readership.summary?.unique_institutions || 0;

  let analysis = `Bloomberg Terminal Analysis: This company has generated ${totalReads} institutional reads`;

  if (institutions > 0) {
    analysis += ` from ${institutions} unique institutions`;
  }

  analysis += ` across ${countries} countries. `;

  // Embargo analysis
  if (embargoRate > 25) {
    analysis += `The high embargo rate of ${embargoRate}% indicates substantial recent institutional activity, suggesting growing interest from professional investors. `;
  } else if (embargoRate < 5) {
    analysis += `The low embargo rate of ${embargoRate}% reflects established institutional coverage with most reader details publicly available. `;
  }

  // Geographic analysis
  const topCountries = Object.entries(analytics.geographic_distribution || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([code, count]) => `${getCountryName(code)} (${count} reads)`);

  if (topCountries.length > 0) {
    analysis += `Primary geographical interest comes from ${topCountries.join(', ')}. `;
  }

  // Timeline analysis
  const timeline = analytics.reading_timeline || {};
  const recentMonths = Object.entries(timeline)
    .filter(([month]) => month.startsWith('2024') || month.startsWith('2025'))
    .reduce((sum, [, count]) => sum + count, 0);

  if (recentMonths > totalReads * 0.3) {
    analysis += `Recent reading activity has been strong, with ${Math.round((recentMonths / totalReads) * 100)}% of reads occurring in the past year.`;
  }

  return analysis;
}

export async function getBloombergAnalysisSummary(ticker) {
  try {
    const response = await api.get(`/api/bloomberg/analysis/${ticker}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg analysis summary:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg analysis summary endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function generateBloombergAnalysis(ticker) {
  try {
    const response = await api.post(
      `/api/bloomberg/analysis/${ticker}/generate`
    );
    return response.data;
  } catch (error) {
    console.error("Error generating Bloomberg analysis:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg analysis generation endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getAllBloombergAnalyses() {
  try {
    const response = await api.get(`/api/bloomberg/analyses`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all Bloomberg analyses:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg analyses list endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// FRC Report Timeline API Functions
export async function getReportTimeline(ticker) {
  try {
    const response = await api.get(`/api/frc/company/${ticker}/reports/timeline`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report timeline:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Report timeline endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getCompanyReports(ticker, options = {}) {
  try {
    const queryParams = {};

    if (options.include_pdf !== undefined) {
      queryParams.include_pdf = options.include_pdf;
    }
    if (options.include_digital !== undefined) {
      queryParams.include_digital = options.include_digital;
    }
    if (options.start_date) {
      queryParams.start_date = options.start_date;
    }
    if (options.end_date) {
      queryParams.end_date = options.end_date;
    }
    if (options.limit) {
      queryParams.limit = options.limit;
    }

    const response = await api.get(`/api/frc/company/${ticker}/reports`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching company reports:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Company reports endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getCoverageImpactAnalysis(ticker, options = {}) {
  try {
    const queryParams = {
      pre_coverage_days: options.pre_coverage_days || 90,
      post_coverage_days: options.post_coverage_days || null, // null = all available data
      include_volume_analysis: options.include_volume_analysis !== false,
      include_price_analysis: options.include_price_analysis !== false,
    };

    const response = await api.get(`/api/frc/company/${ticker}/coverage-impact`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching coverage impact analysis:", error);
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Coverage impact analysis endpoint not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}
