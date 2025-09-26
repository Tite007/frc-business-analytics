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
      case "chart-data":
        url = `/api/frc/company/${ticker}/chart-data`;
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
        url = `/api/frc/company/${ticker}/reports`;
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
          performance_summary: response.data.performance_summary,
        };
      }
    }

    // Handle chart endpoint
    if (endpoint === "chart") {
      if (response.data.success) {
        return {
          success: true,
          chart_data: response.data.chart_data || {},
          chart_config: response.data.chart_config,
        };
      }
    }

    // Handle chart-data endpoint (returns full chart data with reports)
    if (endpoint === "chart-data") {
      if (response.data.success) {
        return response.data; // Return the full response as is
      }
    }

    // Handle analysis endpoint
    if (endpoint === "analysis") {
      if (response.data.success) {
        return {
          success: true,
          ai_analysis: response.data.ai_analysis || "",
          analysis_metadata: response.data.analysis_metadata,
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
  let url;
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

    url = `/api/frc/companies${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await api.get(url);

    // Return the full response object which contains { success, companies, total_companies }
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    console.error("URL attempted:", url || "URL not constructed");
    console.error("Full error details:", error.response || error);

    // Return empty result structure to prevent crashes
    return {
      success: false,
      companies: [],
      total_companies: 0,
      error:
        error.response?.status === 404
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
    const response = await api.get("/api/bloomberg/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg health:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg Statistics Overview
export async function getBloombergStats() {
  try {
    const response = await api.get("/api/bloomberg/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg stats:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// All Companies with Bloomberg Coverage
export async function getBloombergCompanies(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.sort_by) queryParams.sort_by = options.sort_by;

    const response = await api.get("/api/bloomberg/companies", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg companies:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Cache for Bloomberg-enabled tickers (populated dynamically)
let bloombergEnabledTickers = null;
let bloombergCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get list of all tickers with Bloomberg data (dynamic)
export async function getBloombergEnabledTickers() {
  try {
    // Check cache first
    const now = Date.now();
    if (
      bloombergEnabledTickers &&
      bloombergCacheTime &&
      now - bloombergCacheTime < CACHE_DURATION
    ) {
      return bloombergEnabledTickers;
    }

    // Fetch fresh data
    const response = await api.get("/api/bloomberg/companies");
    const companies = response.data?.companies || response.data || [];

    // Extract ticker list and group by company name
    const tickersByCompany = {};
    const allTickers = [];

    companies.forEach((company) => {
      const ticker = company.ticker;
      const companyName = company.company_name;

      allTickers.push(ticker);

      if (companyName) {
        if (!tickersByCompany[companyName]) {
          tickersByCompany[companyName] = [];
        }
        tickersByCompany[companyName].push(ticker);
      }
    });

    // Cache the results
    bloombergEnabledTickers = {
      allTickers,
      tickersByCompany,
      companies,
    };
    bloombergCacheTime = now;

    return bloombergEnabledTickers;
  } catch (error) {
    console.error("Error fetching Bloomberg enabled tickers:", error);
    return {
      allTickers: [],
      tickersByCompany: {},
      companies: [],
    };
  }
}

// Find primary ticker for a company (dynamic)
export async function getBloombergPrimaryTicker(
  companyName,
  currentTicker = null
) {
  try {
    const bloombergData = await getBloombergEnabledTickers();
    const companyTickers = bloombergData.tickersByCompany[companyName] || [];

    if (companyTickers.length === 0) {
      return null; // No Bloomberg data for this company
    }

    if (companyTickers.length === 1) {
      return companyTickers[0]; // Only one ticker, it's the primary
    }

    // Multiple tickers - use priority logic or current ticker if it has data
    if (currentTicker && companyTickers.includes(currentTicker)) {
      return currentTicker; // Current ticker has Bloomberg data
    }

    // Default to first ticker found (could be enhanced with exchange priority logic)
    return companyTickers[0];
  } catch (error) {
    console.error("Error getting primary Bloomberg ticker:", error);
    return null;
  }
}

// Check if ticker has Bloomberg data (dynamic)
export async function hasBloombergData(ticker) {
  try {
    const bloombergData = await getBloombergEnabledTickers();
    return bloombergData.allTickers.includes(ticker);
  } catch (error) {
    console.error("Error checking Bloomberg data availability:", error);
    return false;
  }
}

// Bloomberg Readership Data (Smart Search)
export async function getBloombergReadership(ticker, companyName = null, options = {}) {
  try {
    // Use smart search instead of direct company lookup
    const response = await api.get(`/api/bloomberg/smart-company-search/${encodeURIComponent(ticker)}`, {
      params: {
        fuzzy_threshold: options.fuzzy_threshold || 0.6
      }
    });

    if (response.data.success) {
      return {
        success: true,
        matchType: response.data.match_type,
        confidence: response.data.confidence,
        matchedTicker: response.data.matched_ticker,
        companyName: response.data.company_name,
        data: response.data.bloomberg_data
      };
    } else {
      return {
        success: false,
        message: response.data.message,
        suggestions: response.data.suggestions
      };
    }
  } catch (error) {
    console.error("Bloomberg readership error:", error);
    return {
      error: true,
      message: error.response?.data?.detail || error.message,
      status: error.response?.status
    };
  }
}

// Helper function to check if ticker is primary for Bloomberg (dynamic)
export async function isBloombergPrimaryTicker(ticker, companyName) {
  try {
    const primaryTicker = await getBloombergPrimaryTicker(companyName, ticker);
    return !primaryTicker || primaryTicker === ticker;
  } catch (error) {
    console.error("Error checking if ticker is primary:", error);
    return true; // Default to true to avoid blocking
  }
}

// Legacy alias for getBloombergReadership (backward compatibility)
export async function getBloombergInstitutional(
  ticker,
  companyName = null,
  options = {}
) {
  return await getBloombergReadership(ticker, companyName, options);
}

// Bloomberg Analytics/Summary Data (Dynamic approach)
export async function getBloombergAnalytics(
  ticker,
  companyName = null,
  options = {}
) {
  try {
    // Check if current ticker has Bloomberg data
    const hasData = await hasBloombergData(ticker);

    if (!hasData && companyName) {
      // Try to find primary ticker for this company
      const primaryTicker = await getBloombergPrimaryTicker(
        companyName,
        ticker
      );

      if (primaryTicker && primaryTicker !== ticker) {
        // This is a secondary ticker - return link to primary ticker's data
        return {
          success: false,
          isSecondaryTicker: true,
          primaryTicker: primaryTicker,
          message: `Bloomberg analytics available under ticker: ${primaryTicker}`,
        };
      }
    }

    // Use the working Bloomberg endpoint for analytics
    const queryParams = {};
    if (options.include_embargoed !== undefined)
      queryParams.include_embargoed = options.include_embargoed;
    if (options.days) queryParams.days = options.days;
    if (options.generate_if_missing)
      queryParams.generate_if_missing = options.generate_if_missing;

    const response = await api.get(`/api/bloomberg/analytics/${ticker}`, {
      params: queryParams,
    });

    return {
      success: true,
      isPrimaryTicker: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching Bloomberg analytics:", error);
    const statusCode = error.response?.status;

    if (statusCode === 404 && companyName) {
      // Try to find primary ticker for this company
      const primaryTicker = await getBloombergPrimaryTicker(
        companyName,
        ticker
      );

      if (primaryTicker && primaryTicker !== ticker) {
        return {
          success: false,
          isSecondaryTicker: true,
          primaryTicker: primaryTicker,
          message: `Bloomberg analytics available under ticker: ${primaryTicker}`,
        };
      }
    }

    const errorMessage = error.response?.data?.detail || error.message;
    return {
      error: true,
      message:
        statusCode === 404
          ? `No Bloomberg analytics data found for ticker '${ticker}'`
          : errorMessage,
      status: statusCode,
    };
  }
}

// Generate New Bloomberg Analysis
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
        ? `Cannot generate Bloomberg analysis for ticker '${ticker}'`
        : error.response?.data?.detail || error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

// Get All Bloomberg Companies with Readership Data
export async function getAllBloombergCompanies() {
  try {
    const response = await api.get("/api/bloomberg/companies");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg companies list:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Get FRC Enriched Bloomberg Companies with matched names
export async function getBloombergCompaniesEnriched() {
  try {
    const response = await api.get("/api/bloomberg/companies-frc-enriched");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg companies enriched:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Get FRC Report Readership Analysis
export async function getFRCReportReadership() {
  try {
    const response = await api.get("/api/bloomberg/frc-report-readership");
    return response.data;
  } catch (error) {
    console.error("Error fetching FRC report readership:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// =============================================================================
// NEW BLOOMBERG v3 ENHANCED API FUNCTIONS
// Bloomberg Enhanced Integration with 3-collection structure
// =============================================================================

// Bloomberg v3 Reports Endpoint
export async function getBloombergV3Reports(options = {}) {
  try {
    const queryParams = {};
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;
    if (options.limit) queryParams.limit = options.limit;
    if (options.offset) queryParams.offset = options.offset;
    if (options.sort_by) queryParams.sort_by = options.sort_by;
    if (options.sort_order) queryParams.sort_order = options.sort_order;

    const response = await api.get("/api/v3/bloomberg/reports", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg v3 reports:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Report Readership by ID
export async function getBloombergV3ReportReadership(reportId, options = {}) {
  try {
    const queryParams = {};
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;

    const response = await api.get(`/api/v3/bloomberg/reports/${reportId}/readership`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Bloomberg v3 report readership for ${reportId}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Institutions Endpoint
export async function getBloombergV3Institutions(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.offset) queryParams.offset = options.offset;
    if (options.sort_by) queryParams.sort_by = options.sort_by;
    if (options.sort_order) queryParams.sort_order = options.sort_order;
    if (options.country) queryParams.country = options.country;

    const response = await api.get("/api/v3/bloomberg/institutions", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg v3 institutions:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Institution Readership by ID
export async function getBloombergV3InstitutionReadership(institutionId, options = {}) {
  try {
    const queryParams = {};
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;
    if (options.limit) queryParams.limit = options.limit;
    if (options.offset) queryParams.offset = options.offset;

    const response = await api.get(`/api/v3/bloomberg/institutions/${institutionId}/readership`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Bloomberg v3 institution readership for ${institutionId}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Analytics by Ticker
export async function getBloombergV3Analytics(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.days) queryParams.days = options.days;
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;

    const response = await api.get(`/api/v3/bloomberg/analytics/ticker/${ticker}`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Bloomberg v3 analytics for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Most Read Reports
export async function getBloombergV3MostReadReports(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.days) queryParams.days = options.days;
    if (options.min_reads) queryParams.min_reads = options.min_reads;

    const response = await api.get("/api/v3/bloomberg/analytics/most-read-reports", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg v3 most read reports:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Sync Status
export async function getBloombergV3SyncStatus() {
  try {
    const response = await api.get("/api/v3/bloomberg/sync/status");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg v3 sync status:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg v3 Trigger Incremental Sync
export async function triggerBloombergV3IncrementalSync() {
  try {
    const response = await api.post("/api/v3/bloomberg/sync/incremental");
    return response.data;
  } catch (error) {
    console.error("Error triggering Bloomberg v3 incremental sync:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// =============================================================================
// BLOOMBERG-FRC MATCHING SYSTEM API FUNCTIONS
// Smart report matching between FRC research and Bloomberg readership
// =============================================================================

// Bloomberg-FRC Company Matching
export async function getBloombergFRCCompanyMatch(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.similarity_threshold) queryParams.similarity_threshold = options.similarity_threshold;
    if (options.date_window_days) queryParams.date_window_days = options.date_window_days;
    if (options.test_mode !== undefined) queryParams.test_mode = options.test_mode;

    const response = await api.get(`/api/bloomberg-frc/match/company/${encodeURIComponent(ticker)}`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Bloomberg-FRC company match for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg-FRC Analytics Matching
export async function getBloombergFRCAnalyticsMatch(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.similarity_threshold) queryParams.similarity_threshold = options.similarity_threshold;
    if (options.date_window_days) queryParams.date_window_days = options.date_window_days;
    if (options.test_mode !== undefined) queryParams.test_mode = options.test_mode;

    const response = await api.get(`/api/bloomberg-frc/match/analytics/${encodeURIComponent(ticker)}`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Bloomberg-FRC analytics match for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg-FRC Health Check
export async function getBloombergFRCHealth() {
  try {
    const response = await api.get("/api/bloomberg-frc/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg-FRC health:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// =============================================================================
// ENHANCED BLOOMBERG MAIN API FUNCTIONS (Updated with new response structures)
// =============================================================================

// Enhanced Bloomberg Health with collection summaries
export async function getBloombergEnhancedHealth() {
  try {
    const response = await api.get("/api/bloomberg/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching enhanced Bloomberg health:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Enhanced Bloomberg Company Data with joined collections
export async function getBloombergEnhancedCompany(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;
    if (options.limit) queryParams.limit = options.limit;
    if (options.offset) queryParams.offset = options.offset;

    const response = await api.get(`/api/bloomberg/company/${encodeURIComponent(ticker)}`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching enhanced Bloomberg company data for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Enhanced Bloomberg Company Raw Data with aggregations
export async function getBloombergEnhancedCompanyRaw(ticker, options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = Math.min(options.limit, 500); // Max 500 per docs
    if (options.include_embargoed !== undefined) queryParams.include_embargoed = options.include_embargoed;

    const response = await api.get(`/api/bloomberg/company/${encodeURIComponent(ticker)}/raw`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching enhanced Bloomberg company raw data for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Enhanced Bloomberg Companies with metadata
export async function getBloombergEnhancedCompanies(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.sort_by) queryParams.sort_by = options.sort_by;
    if (options.country) queryParams.country = options.country;
    if (options.min_reads) queryParams.min_reads = options.min_reads;

    const response = await api.get("/api/bloomberg/companies", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching enhanced Bloomberg companies:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Enhanced Bloomberg Institutions with updated structure
export async function getBloombergEnhancedInstitutions(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.country) queryParams.country = options.country;
    if (options.sort_by) queryParams.sort_by = options.sort_by;

    const response = await api.get("/api/bloomberg/institutions", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching enhanced Bloomberg institutions:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// =============================================================================
// PAGINATION AND CACHING HELPERS
// =============================================================================

// Cache for Bloomberg-FRC matching results
let bloombergFRCCache = new Map();
const BLOOMBERG_FRC_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cached Bloomberg-FRC Company Matching
export async function getCachedBloombergFRCMatch(ticker, options = {}) {
  const cacheKey = `${ticker}-${JSON.stringify(options)}`;
  const cached = bloombergFRCCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < BLOOMBERG_FRC_CACHE_TTL) {
    return cached.data;
  }

  const data = await getBloombergFRCCompanyMatch(ticker, options);
  bloombergFRCCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

// Clear Bloomberg-FRC cache
export function clearBloombergFRCCache() {
  bloombergFRCCache.clear();
}

// Get cache statistics
export function getBloombergFRCCacheStats() {
  return {
    size: bloombergFRCCache.size,
    entries: Array.from(bloombergFRCCache.keys()),
    ttl: BLOOMBERG_FRC_CACHE_TTL
  };
}

// Paginated Bloomberg v3 Reports
export async function getPaginatedBloombergV3Reports(page = 1, limit = 50, options = {}) {
  const offset = (page - 1) * limit;
  return await getBloombergV3Reports({ ...options, limit, offset });
}

// Paginated Bloomberg v3 Institutions
export async function getPaginatedBloombergV3Institutions(page = 1, limit = 50, options = {}) {
  const offset = (page - 1) * limit;
  return await getBloombergV3Institutions({ ...options, limit, offset });
}

// =============================================================================
// EXISTING BLOOMBERG DASHBOARD API FUNCTIONS
// =============================================================================

// Bloomberg Dashboard Overview - KPI Cards and Summary
export async function getBloombergDashboardOverview() {
  try {
    const response = await api.get("/api/bloomberg/dashboard/overview");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg dashboard overview:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg Top Companies - Chart-ready data with FRC indicators
export async function getBloombergDashboardTopCompanies() {
  try {
    const response = await api.get("/api/bloomberg/dashboard/top-companies");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg top companies:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg FRC Metrics - FRC-specific analysis and charts
export async function getBloombergDashboardFRCMetrics() {
  try {
    const response = await api.get("/api/bloomberg/dashboard/frc-metrics");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg FRC metrics:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg Geographic Distribution - World map and regional data
export async function getBloombergDashboardGeographic() {
  try {
    const response = await api.get("/api/bloomberg/dashboard/geographic-distribution");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg geographic distribution:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg Trending Activity - Real-time activity feed
export async function getBloombergDashboardTrending() {
  try {
    const response = await api.get("/api/bloomberg/dashboard/trending-activity");
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg trending activity:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// =============================================================================
// NEW PAGINATED REPORT APIS
// =============================================================================

// FRC Companies Reports - Paginated companies with their reports
export async function getBloombergFRCCompaniesReports(params = {}) {
  try {
    const { page = 1, limit = 5 } = params;
    const response = await api.get(`/api/bloomberg/dashboard/frc-companies-reports?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching FRC companies reports:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Report Profiles - Paginated detailed report analysis
export async function getBloombergReportProfiles(params = {}) {
  try {
    const { page = 1, limit = 20, sort_by = 'popularity' } = params;
    const response = await api.get(`/api/bloomberg/dashboard/report-profiles?page=${page}&limit=${limit}&sort_by=${sort_by}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg report profiles:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Bloomberg Institutions Directory
export async function getBloombergInstitutions(options = {}) {
  try {
    const queryParams = {};
    if (options.limit) queryParams.limit = options.limit;
    if (options.country) queryParams.country = options.country;

    const response = await api.get("/api/bloomberg/institutions", {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg institutions:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
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
    const errorMessage =
      statusCode === 404
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

    const response = await api.get(`/api/proxy/bloomberg/company/${ticker}/raw`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg raw data:", error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status,
    };
  }
}

// Legacy alias for getBloombergReadership (backward compatibility)
export async function getBloombergSummary(ticker) {
  return await getBloombergReadership(ticker);
}

export async function getBloombergTrends(ticker, days = 90) {
  try {
    const response = await api.get(`/api/proxy/bloomberg/company/${ticker}`, {
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
      getBloombergReadership(ticker, { include_embargoed: true }),
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
        embargoed_count: Math.round(
          ((analytics.total_reads || 0) * (analytics.embargo_rate || 0)) / 100
        ),
        revealed_count: analytics.revealed_reads || 0,
        embargoed_percentage: analytics.embargo_rate || 0,
        revealed_percentage: Math.round(100 - (analytics.embargo_rate || 0)),
        unique_institutions:
          readership.summary?.unique_institutions ||
          Object.keys(analytics.geographic_distribution || {}).length,
      },

      // Enhanced geographic analysis
      top_countries: Object.entries(analytics.geographic_distribution || {})
        .map(([country, count]) => ({
          country: getCountryName(country), // Helper to expand country codes
          code: country,
          count,
          percentage: Math.round((count / (analytics.total_reads || 1)) * 100),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10), // Top 10 countries

      // Top institutions from readership data
      top_institutions: (readership.revealed_institutions || [])
        .slice(0, 5)
        .map((institution, index) => ({
          institution,
          count: readership.revealed_institutions?.length - index || 1,
          percentage: Math.round(
            ((readership.revealed_institutions?.length - index) /
              (readership.revealed_institutions?.length || 1)) *
              100
          ),
        })),

      // Enhanced insights
      key_insights: generateBloombergInsights(
        analytics,
        interpretation,
        readership
      ),

      // Rich AI analysis
      ai_analysis: generateAIAnalysis(analytics, interpretation, readership),

      // Timeline data for charts
      reading_timeline: analytics.reading_timeline || {},

      // Additional metadata
      analysis_date: new Date().toISOString().split("T")[0],
      last_updated: analyticsResponse.timestamp || new Date().toISOString(),
      embargo_system: readership.embargo_system || {},
    };

    return {
      success: true,
      data: analysisData,
    };
  } catch (error) {
    console.error("Error generating Bloomberg analysis:", error);
    return {
      error: true,
      message: error.message || "Failed to generate Bloomberg analysis",
      status: error.response?.status,
    };
  }
}

// Helper function to expand country codes to full names
function getCountryName(code) {
  const countryMap = {
    US: "United States",
    CN: "China",
    HK: "Hong Kong",
    ENG: "United Kingdom",
    SP: "Spain",
    TI: "Taiwan",
    IN: "India",
    F: "France",
    CND: "Canada",
    CH: "Switzerland",
    J: "Japan",
    KS: "South Korea",
    I: "Italy",
    BR: "Brazil",
    A: "Austria",
    D: "Germany",
    B: "Belgium",
    NL: "Netherlands",
    E: "Spain",
    L: "Luxembourg",
    TH: "Thailand",
    SA: "Saudi Arabia",
    PE: "Peru",
  };
  return countryMap[code] || code;
}

// Generate intelligent insights from Bloomberg data
function generateBloombergInsights(analytics, interpretation, readership) {
  const insights = [];

  // Embargo rate insights
  if (analytics.embargo_rate > 20) {
    insights.push(
      `High embargo rate (${analytics.embargo_rate}%) indicates significant recent institutional interest`
    );
  } else if (analytics.embargo_rate < 5) {
    insights.push(
      `Low embargo rate (${analytics.embargo_rate}%) suggests established institutional following`
    );
  }

  // Geographic insights
  const topCountries = Object.keys(
    analytics.geographic_distribution || {}
  ).length;
  if (topCountries > 15) {
    insights.push(
      `Global institutional interest with ${topCountries} countries represented`
    );
  } else if (topCountries > 5) {
    insights.push(
      `Regional institutional focus across ${topCountries} key markets`
    );
  }

  // Reading volume insights
  if (analytics.total_reads > 500) {
    insights.push(
      `High institutional engagement with ${analytics.total_reads} total reads`
    );
  } else if (analytics.total_reads > 100) {
    insights.push(
      `Moderate institutional attention with ${analytics.total_reads} reads`
    );
  }

  // Timeline insights
  const timeline = analytics.reading_timeline || {};
  const months = Object.keys(timeline);
  if (months.length > 12) {
    insights.push(
      `Sustained institutional interest over ${months.length} months`
    );
  }

  return insights.length > 0
    ? insights
    : ["Limited Bloomberg readership data available"];
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
    analysis += `Primary geographical interest comes from ${topCountries.join(
      ", "
    )}. `;
  }

  // Timeline analysis
  const timeline = analytics.reading_timeline || {};
  const recentMonths = Object.entries(timeline)
    .filter(([month]) => month.startsWith("2024") || month.startsWith("2025"))
    .reduce((sum, [, count]) => sum + count, 0);

  if (recentMonths > totalReads * 0.3) {
    analysis += `Recent reading activity has been strong, with ${Math.round(
      (recentMonths / totalReads) * 100
    )}% of reads occurring in the past year.`;
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
    const response = await api.get(
      `/api/frc/company/${ticker}/reports/timeline`
    );
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

    const response = await api.get(
      `/api/frc/company/${ticker}/coverage-impact`,
      {
        params: queryParams,
      }
    );
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

// Get chart data with report timeline
export async function getChartData(ticker) {
  try {
    // Get company data and reports separately
    const [companyResponse, reportsResponse] = await Promise.all([
      getCompanyData(ticker, "company"),
      getCompanyData(ticker, "reports")
    ]);

    if (companyResponse && companyResponse.company && companyResponse.company.chart_data) {
      const company = companyResponse.company;

      // Extract actual reports with full details and sort by date first
      const actualReports = reportsResponse?.reports ? reportsResponse.reports
        .sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date))
        .map((report, index) => ({
          id: index + 1,
          title: report.title,
          publication_date: report.publication_date,
          date: report.publication_date,
          description: report.title,
          reportNumber: index + 1, // This will be 1 for oldest, 2, 3... up to newest
          report_type: report.report_type,
          is_pdf: report.is_pdf,
          pdf_path: report.pdf_path
        })) : [];

      // Calculate oldest and newest report dates from actual reports
      const reportDates = actualReports.map(r => r.publication_date).filter(Boolean);
      const oldestReportDate = reportDates.length > 0 ? reportDates[0] : null;
      const newestReportDate = reportDates.length > 0 ? reportDates[reportDates.length - 1] : null;

      // Use chart data range for oldest/newest (not report dates)
      const oldestReport = company.chart_data[0]?.date;
      const newestReport = company.chart_data[company.chart_data.length - 1]?.date;

      return {
        success: true,
        chart_data: company.chart_data,
        company_name: company.company_data?.name || company.company_name,
        total_data_points: company.stock_data_points || company.chart_data.length,
        currency: company.company_data?.currency || 'USD',
        reports_coverage: {
          total_reports: actualReports.length,
          digital_reports: reportsResponse?.digital_reports || 0,
          pdf_reports: reportsResponse?.pdf_reports || 0,
          date_span_days: company.chart_data.length || 0,
          oldest_report: oldestReport,
          newest_report: newestReport,
          oldest_report_date: oldestReportDate,
          newest_report_date: newestReportDate,
          coverage_period_days: oldestReportDate && newestReportDate ?
            Math.ceil((new Date(newestReportDate) - new Date(oldestReportDate)) / (1000 * 60 * 60 * 24)) : 0
        },
        actual_reports: actualReports,
        reports_stats: {
          total: reportsResponse?.total_reports || 0,
          digital: reportsResponse?.digital_reports || 0,
          pdf: reportsResponse?.pdf_reports || 0
        },
        data: company
      };
    }
    return { error: true, message: "No chart data available" };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return { error: true, message: error.message };
  }
}

// =============================================================================
// FINANCIAL MODELING PREP API FUNCTIONS
// Real-time stock quotes and financial data
// =============================================================================

// Get real-time stock quote from Financial Modeling Prep
export async function getFinancialModelingPrepQuote(ticker) {
  try {
    const FMP_API_KEY = '4efd33045b70a3f91c002844c1673d0c';
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${FMP_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        error: true,
        message: `No live data available for ticker ${ticker}`
      };
    }

    const quote = data[0];

    return {
      success: true,
      data: {
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        change: quote.change,
        changePercentage: quote.changesPercentage,
        volume: quote.volume,
        dayLow: quote.dayLow,
        dayHigh: quote.dayHigh,
        yearHigh: quote.yearHigh,
        yearLow: quote.yearLow,
        marketCap: quote.marketCap,
        priceAvg50: quote.priceAvg50,
        priceAvg200: quote.priceAvg200,
        exchange: quote.exchange,
        open: quote.open,
        previousClose: quote.previousClose,
        timestamp: quote.timestamp,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error fetching FMP quote for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status
    };
  }
}

// NEW BLOOMBERG COMPANY NAME RESOLUTION API FUNCTIONS
// Smart company name search and resolution for ticker mismatch handling

// Bloomberg Company Name Search
export async function getBloombergCompanyNameSearch(companyName, options = {}) {
  try {
    const response = await api.get(`/api/bloomberg/company-name-search/${encodeURIComponent(companyName)}`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error(`Error searching Bloomberg company name '${companyName}':`, error);
    return {
      success: false,
      error: error.response?.status === 404
        ? `No Bloomberg data found for company '${companyName}'`
        : error.message,
    };
  }
}

// Bloomberg Company Resolution (Complete solution for name->data)
export async function getBloombergResolveCompany(companyName, options = {}) {
  try {
    const response = await api.get(`/api/bloomberg/resolve-company/${encodeURIComponent(companyName)}`, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error(`Error resolving Bloomberg company '${companyName}':`, error);
    return {
      success: false,
      error: error.response?.status === 404
        ? `Could not resolve Bloomberg data for company '${companyName}'`
        : error.message,
    };
  }
}
