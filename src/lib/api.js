import axios from "axios";

const api = axios.create({
  baseURL: "", // Use relative URLs to leverage Next.js rewrites
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
