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

  const fallbackURL = "https://dashboard.researchfrc.com";

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
        url = `/api/frc/chart/${ticker}`;
        break;
      case "stock":
        url = `/api/stock/${ticker}`;
        break;
      case "metrics":
        url = `/api/frc/metrics/${ticker}`;
        break;
      case "analysis":
        url = `/api/frc/analysis/${ticker}`;
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
    return null;
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

// Bloomberg Readership API Functions
export async function getBloombergReadership(ticker, days = 90) {
  try {
    const response = await api.get(`/api/readership/${ticker}`, {
      params: { days },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg readership:", error);
    // Include status code in error message for better handling
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg readership endpoints not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getBloombergInstitutional(ticker, options = {}) {
  try {
    // Build query parameters object for axios
    const queryParams = {
      days: options.days || 90,
      show_embargoed: options.show_embargoed !== false,
      limit: options.limit || 100,
    };

    // Add offset parameter for pagination
    if (options.offset !== undefined) {
      queryParams.offset = options.offset;
    }

    const response = await api.get(`/api/readership/${ticker}/institutional`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg institutional data:", error);
    // Include status code in error message for better handling
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg readership endpoints not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getBloombergSummary(ticker) {
  try {
    const response = await api.get(`/api/readership/${ticker}/summary`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg summary:", error);
    // Include status code in error message for better handling
    const statusCode = error.response?.status;
    const errorMessage =
      statusCode === 404
        ? `Bloomberg readership endpoints not available (404)`
        : error.message;
    return { error: true, message: errorMessage, status: statusCode };
  }
}

export async function getBloombergTrends(ticker, days = 90) {
  try {
    const response = await api.get(`/api/readership/${ticker}/trends`, {
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

export async function getBloombergAnalysis(ticker, options = {}) {
  try {
    const queryParams = {};

    // Add generate_if_missing parameter if specified
    if (options.generate_if_missing) {
      queryParams.generate_if_missing = true;
    }

    const response = await api.get(`/api/bloomberg/analysis/${ticker}`, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Bloomberg analysis:", error);
    // Include status code in error message for better handling
    const statusCode = error.response?.status;
    const errorMessage = error.response?.data?.detail || error.message;

    if (statusCode === 404) {
      console.log(`Bloomberg analysis endpoint not available for ${ticker}`);
    }

    return { error: true, message: errorMessage, status: statusCode };
  }
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
