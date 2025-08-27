import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000",
});

// Enhanced API functions for the FRC backend
export async function getCompanyData(ticker, endpoint = "companies") {
  try {
    let url;
    switch (endpoint) {
      case "companies":
        url = "/api/frc/companies";
        break;
      case "company":
        url = `/api/frc/company/${ticker}`;
        break;
      case "chart":
        url = `/api/frc/chart/${ticker}`;
        break;
      case "metrics":
        url = `/api/frc/metrics/${ticker}`;
        break;
      case "analysis":
        url = `/api/frc/analysis/${ticker}`;
        break;
      case "reports":
        url = `/api/frc/reports/${ticker}`;
        break;
      default:
        url = `/api/frc/${endpoint}/${ticker}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} for ${ticker}:`, error);
    return null;
  }
}

// Search companies
export async function searchCompanies(query, limit = 20) {
  try {
    const response = await api.get(
      `/api/frc/search?q=${encodeURIComponent(query)}&limit=${limit}`
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
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.offset) params.append("offset", filters.offset);

    const url = `/api/frc/companies${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    const response = await api.get(url);

    // Return the full response object which contains { success, companies, total_companies, filters_applied }
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    return null;
  }
}
