# 🔧 API Service for Frontend Integration

## 📡 Complete API Service

Create `services/api.ts` to handle all backend communication:

```typescript
// services/api.ts
import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Type definitions matching your backend
export interface Company {
  company_name: string;
  ticker: string;
  exchange: string;
  currency: string;
  reports_count: number;
  stock_data_points: number;
  status: string;
  analysis_date: string;
  data?: {
    reports: Report[];
    metrics: Metric[];
    stock_data: StockData[];
  };
}

export interface Report {
  title: string;
  published_date: string;
  url?: string;
  report_type?: string;
  quarter?: string;
  year?: number;
}

export interface Metric {
  report_title: string;
  published_date: string;
  price_before_report: number;
  price_after_30_days: number;
  price_change_percentage: number;
  volume_change_percentage: number;
}

export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  success: boolean;
  ticker: string;
  company_name: string;
  chart_data: {
    data: any[];
    layout: any;
  };
  exchange: string;
  currency: string;
  has_data: boolean;
}

export interface MetricsResponse {
  success: boolean;
  ticker: string;
  metrics: Metric[];
  currency: string;
  total_reports: number;
}

export interface AnalysisResponse {
  success: boolean;
  ticker: string;
  analysis: string;
  status: string;
  generated_date: string;
}

export interface CompanyResponse {
  success: boolean;
  company: Company;
  data_available: {
    has_reports: boolean;
    has_stock_data: boolean;
    has_chart: boolean;
    has_metrics: boolean;
    has_ai_analysis: boolean;
  };
}

export interface CompaniesListResponse {
  success: boolean;
  total_companies: number;
  companies: Array<{
    company_name: string;
    ticker: string;
    exchange: string;
    currency: string;
    reports_count: number;
    has_chart: boolean;
  }>;
}

// API Service Class
export class ApiService {
  
  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      const response: AxiosResponse = await api.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Backend service unavailable');
    }
  }

  // Get all companies with filtering
  async getCompanies(params?: {
    skip?: number;
    limit?: number;
    exchange?: string;
    has_chart?: boolean;
    search?: string;
  }): Promise<CompaniesListResponse> {
    try {
      const response: AxiosResponse<CompaniesListResponse> = await api.get('/api/frc/companies', {
        params: params || {}
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch companies');
    }
  }

  // Get specific company by ticker
  async getCompany(ticker: string): Promise<CompanyResponse> {
    try {
      const response: AxiosResponse<CompanyResponse> = await api.get(`/api/frc/company/${ticker}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch company data for ${ticker}`);
    }
  }

  // Get company chart data
  async getChartData(ticker: string): Promise<ChartData> {
    try {
      const response: AxiosResponse<ChartData> = await api.get(`/api/frc/chart/${ticker}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch chart data for ${ticker}`);
    }
  }

  // Get company metrics
  async getMetrics(ticker: string): Promise<MetricsResponse> {
    try {
      const response: AxiosResponse<MetricsResponse> = await api.get(`/api/frc/metrics/${ticker}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch metrics for ${ticker}`);
    }
  }

  // Get AI analysis
  async getAnalysis(ticker: string): Promise<AnalysisResponse> {
    try {
      const response: AxiosResponse<AnalysisResponse> = await api.get(`/api/frc/analysis/${ticker}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch analysis for ${ticker}`);
    }
  }

  // Search companies
  async searchCompanies(query: string, limit: number = 10): Promise<CompaniesListResponse> {
    try {
      const response: AxiosResponse<CompaniesListResponse> = await api.get('/api/frc/companies', {
        params: { search: query, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search companies with query: ${query}`);
    }
  }

  // Get companies by exchange
  async getCompaniesByExchange(exchange: string): Promise<CompaniesListResponse> {
    try {
      const response: AxiosResponse<CompaniesListResponse> = await api.get('/api/frc/companies', {
        params: { exchange }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch companies from ${exchange}`);
    }
  }

  // Get summary statistics
  async getSummaryStats(): Promise<{
    total_companies: number;
    companies_with_charts: number;
    total_reports: number;
    exchanges: string[];
  }> {
    try {
      const response: AxiosResponse = await api.get('/api/frc/summary');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch summary statistics');
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export default
export default apiService;
```

## 🔌 React Query Hooks

Create `hooks/useApi.ts` for easy data fetching:

```typescript
// hooks/useApi.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  apiService, 
  Company, 
  CompaniesListResponse,
  CompanyResponse,
  ChartData,
  MetricsResponse,
  AnalysisResponse 
} from '../services/api';

// Hook for companies list
export const useCompanies = (params?: {
  skip?: number;
  limit?: number;
  exchange?: string;
  has_chart?: boolean;
  search?: string;
}) => {
  return useQuery<CompaniesListResponse, Error>({
    queryKey: ['companies', params],
    queryFn: () => apiService.getCompanies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for single company
export const useCompany = (ticker: string): UseQueryResult<CompanyResponse, Error> => {
  return useQuery<CompanyResponse, Error>({
    queryKey: ['company', ticker],
    queryFn: () => apiService.getCompany(ticker),
    enabled: !!ticker,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for chart data
export const useChartData = (ticker: string): UseQueryResult<ChartData, Error> => {
  return useQuery<ChartData, Error>({
    queryKey: ['chart', ticker],
    queryFn: () => apiService.getChartData(ticker),
    enabled: !!ticker,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for metrics
export const useMetrics = (ticker: string): UseQueryResult<MetricsResponse, Error> => {
  return useQuery<MetricsResponse, Error>({
    queryKey: ['metrics', ticker],
    queryFn: () => apiService.getMetrics(ticker),
    enabled: !!ticker,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for AI analysis
export const useAnalysis = (ticker: string): UseQueryResult<AnalysisResponse, Error> => {
  return useQuery<AnalysisResponse, Error>({
    queryKey: ['analysis', ticker],
    queryFn: () => apiService.getAnalysis(ticker),
    enabled: !!ticker,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Hook for search
export const useSearchCompanies = (query: string, limit: number = 10) => {
  return useQuery<CompaniesListResponse, Error>({
    queryKey: ['searchCompanies', query, limit],
    queryFn: () => apiService.searchCompanies(query, limit),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook for summary stats
export const useSummaryStats = () => {
  return useQuery({
    queryKey: ['summaryStats'],
    queryFn: () => apiService.getSummaryStats(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
  });
};
```

## 🌐 Environment Configuration

Create `.env.local`:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_NAME=FRC Stock Analysis Dashboard
NEXT_PUBLIC_COMPANY_NAME=Fundamental Research Corp
```

## 🔧 Query Client Setup

Create `lib/queryClient.ts`:

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

## 🎯 Usage in Components

```tsx
// Example usage in a component
'use client';

import React from 'react';
import { useCompanies, useCompany, useChartData } from '../hooks/useApi';
import InteractiveChart from '../components/charts/InteractiveChart';

const CompanyDashboard = ({ ticker }: { ticker: string }) => {
  const { data: company, isLoading, error } = useCompany(ticker);
  const { data: chartData, isLoading: chartLoading } = useChartData(ticker);

  if (isLoading) return <div>Loading company data...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{company?.company.company_name}</h1>
      <InteractiveChart ticker={ticker} />
    </div>
  );
};
```

## ✅ Complete API Integration

This setup provides:

1. **✅ Type-safe API calls** with full TypeScript support
2. **✅ Automatic error handling** and retries
3. **✅ Caching and optimization** with React Query
4. **✅ Environment configuration** for different deployments
5. **✅ Ready-to-use hooks** for all your backend endpoints

Your frontend will seamlessly integrate with your FastAPI backend and Plotly charts! 🚀
