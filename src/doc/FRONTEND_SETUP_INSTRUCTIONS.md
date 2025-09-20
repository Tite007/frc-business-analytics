# 🚀 Frontend Setup Instructions for Claude Sonnet 4

## 📋 Project Overview

You are building a **React/Next.js frontend** for the **FRC Business Analytics Dashboard** that connects to a fully functional FastAPI backend with comprehensive FRC company data.

## 🌐 Backend API Information

### API Server Details

- **Base URL**: `http://127.0.0.1:8000`
- **Status**: ✅ Fully operational with 122 FRC companies
- **CORS**: ✅ Properly configured for frontend development
- **Documentation**: `http://127.0.0.1:8000/docs` (Swagger/OpenAPI)
- **Data Source**: MongoDB with complete company profiles, reports, metrics, charts, and AI analysis

### ⚡ CORS Configuration Fixed

The backend now includes proper CORS headers that allow:

- **All Origins**: Frontend can connect from any localhost port
- **All Methods**: GET, POST, PUT, DELETE, OPTIONS
- **All Headers**: No restrictions on request headers
- **Preflight Requests**: Properly handled for complex requests

### Database Statistics

- **Total FRC Companies**: 122
- **Companies with Reports**: 66
- **Companies with Stock Data**: 115
- **Companies with Interactive Charts**: 115
- **Companies with AI Analysis**: 61
- **Exchanges**: NASDAQ (44), TSX (29), NEO (29), NYSE (4), others
- **Currencies**: CAD (70), USD (52)

## 🔌 Complete API Endpoints List

### 1. 🏠 Root & System Endpoints

```bash
GET /                           # API information
GET /health                     # Health check
```

### 2. 🏢 Company Data Endpoints

```bash
# List all companies with filtering
GET /api/frc/companies
GET /api/frc/companies?has_reports=true
GET /api/frc/companies?exchange=NASDAQ
GET /api/frc/companies?currency=USD
GET /api/frc/companies?limit=10&offset=0

# Get specific company details
GET /api/frc/company/{ticker}           # e.g., /api/frc/company/ZEPP
GET /api/frc/company/{company_name}     # e.g., /api/frc/company/Apple Inc.
```

### 3. 📊 Data-Specific Endpoints

```bash
# Interactive charts (Plotly.js compatible)
GET /api/frc/chart/{ticker}             # e.g., /api/frc/chart/ZEPP

# Performance metrics
GET /api/frc/metrics/{ticker}           # e.g., /api/frc/metrics/AAPL

# AI analysis
GET /api/frc/analysis/{ticker}          # e.g., /api/frc/analysis/ZEPP
```

### 4. 🔍 Search & Statistics

```bash
# Search companies
GET /api/frc/search?q={query}           # e.g., /api/frc/search?q=apple

# Get comprehensive statistics
GET /api/frc/stats
```

## 📁 Recommended Frontend Structure

```
frontend/
├── components/
│   ├── company/
│   │   ├── CompanyList.tsx           # List all companies
│   │   ├── CompanyCard.tsx           # Individual company card
│   │   ├── CompanyDetail.tsx         # Detailed company view
│   │   ├── CompanySearch.tsx         # Search functionality
│   │   └── CompanyFilters.tsx        # Filter companies
│   ├── charts/
│   │   ├── InteractiveChart.tsx      # Plotly.js chart component
│   │   ├── MetricsChart.tsx          # Performance metrics charts
│   │   └── ComparisonChart.tsx       # Compare multiple companies
│   ├── dashboard/
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   ├── StatsOverview.tsx         # Statistics overview
│   │   └── RecentActivity.tsx        # Recent updates
│   └── layout/
│       ├── Header.tsx                # Navigation header
│       ├── Sidebar.tsx               # Sidebar navigation
│       └── Layout.tsx                # Main layout wrapper
├── hooks/
│   ├── useCompanies.ts               # Companies data hook
│   ├── useCompanyDetail.ts           # Single company hook
│   ├── useSearch.ts                  # Search functionality hook
│   └── useStats.ts                   # Statistics hook
├── services/
│   └── api.ts                        # API service layer
├── types/
│   └── index.ts                      # TypeScript types
└── pages/
    ├── index.tsx                     # Dashboard home
    ├── companies/
    │   ├── index.tsx                 # Companies list page
    │   └── [ticker].tsx              # Individual company page
    └── search.tsx                    # Search results page
```

## 🔧 Required Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "next": "^14.0.0",
    "typescript": "^5.0.0",
    "plotly.js": "^2.26.0",
    "react-plotly.js": "^2.6.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "clsx": "^2.0.0"
  }
}
```

## 🎯 Key Frontend Features to Build

### 1. 📊 Dashboard Overview

- Statistics cards (total companies, success rates, etc.)
- Recent company updates
- Exchange and currency distribution charts
- Quick search bar

### 2. 🏢 Companies Management

- **Filterable company list** with pagination
- **Search functionality** (real-time search)
- **Company cards** showing key metrics
- **Detailed company pages** with all data

### 3. 📈 Interactive Charts

- **Stock price charts** using Plotly.js
- **Performance metrics visualization**
- **Comparison tools** for multiple companies
- **Export functionality** for charts

### 4. 🤖 AI Analysis Display

- **Rich text display** of AI analysis
- **Confidence scores** and insights
- **Analysis date and status**

## 💻 Code Examples for Integration

### API Service Layer (`services/api.ts`)

```typescript
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export interface Company {
  ticker: string;
  company_name: string;
  status: string;
  exchange: string;
  currency: string;
  industry: string;
  sector: string;
  reports_count: number;
  stock_data_points: number;
  has_chart: boolean;
  has_metrics: boolean;
  analysis_date: string;
}

export interface CompaniesResponse {
  success: boolean;
  total_companies: number;
  companies: Company[];
  filters_applied: Record<string, any>;
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

export interface Stats {
  success: boolean;
  total_companies: number;
  with_reports: number;
  with_stock_data: number;
  with_charts: number;
  with_metrics: number;
  by_status: Record<string, number>;
  by_exchange: Record<string, number>;
  by_currency: Record<string, number>;
}

// API Functions
export const apiService = {
  // Get all companies
  getCompanies: async (params?: {
    status?: string;
    has_reports?: boolean;
    has_stock_data?: boolean;
    exchange?: string;
    currency?: string;
    limit?: number;
    offset?: number;
  }): Promise<CompaniesResponse> => {
    const response = await api.get("/api/frc/companies", { params });
    return response.data;
  },

  // Get single company
  getCompany: async (identifier: string) => {
    const response = await api.get(`/api/frc/company/${identifier}`);
    return response.data;
  },

  // Get chart data
  getChartData: async (ticker: string): Promise<ChartData> => {
    const response = await api.get(`/api/frc/chart/${ticker}`);
    return response.data;
  },

  // Get metrics
  getMetrics: async (ticker: string) => {
    const response = await api.get(`/api/frc/metrics/${ticker}`);
    return response.data;
  },

  // Get AI analysis
  getAnalysis: async (ticker: string) => {
    const response = await api.get(`/api/frc/analysis/${ticker}`);
    return response.data;
  },

  // Search companies
  searchCompanies: async (query: string, limit: number = 10) => {
    const response = await api.get("/api/frc/search", {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Get statistics
  getStats: async (): Promise<Stats> => {
    const response = await api.get("/api/frc/stats");
    return response.data;
  },
};
```

### React Hook Example (`hooks/useCompanies.ts`)

```typescript
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";

export const useCompanies = (filters?: {
  status?: string;
  has_reports?: boolean;
  exchange?: string;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["companies", filters],
    queryFn: () => apiService.getCompanies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCompany = (ticker: string) => {
  return useQuery({
    queryKey: ["company", ticker],
    queryFn: () => apiService.getCompany(ticker),
    enabled: !!ticker,
  });
};

export const useChartData = (ticker: string) => {
  return useQuery({
    queryKey: ["chart", ticker],
    queryFn: () => apiService.getChartData(ticker),
    enabled: !!ticker,
  });
};
```

### Company List Component Example

```tsx
"use client";

import React, { useState } from "react";
import { useCompanies } from "../hooks/useCompanies";
import { Company } from "../services/api";

const CompanyList: React.FC = () => {
  const [filters, setFilters] = useState({
    has_reports: undefined,
    exchange: "",
    limit: 20,
  });

  const { data, isLoading, error } = useCompanies(filters);

  if (isLoading) return <div>Loading companies...</div>;
  if (error) return <div>Error loading companies</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.exchange}
          onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">All Exchanges</option>
          <option value="NASDAQ">NASDAQ</option>
          <option value="TSX">TSX</option>
          <option value="NYSE">NYSE</option>
        </select>

        <button
          onClick={() => setFilters({ ...filters, has_reports: true })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Companies with Reports
        </button>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.companies.map((company: Company) => (
          <CompanyCard key={company.ticker} company={company} />
        ))}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        Showing {data?.companies.length} of {data?.total_companies} companies
      </div>
    </div>
  );
};
```

### Interactive Chart Component

```tsx
"use client";

import React from "react";
import Plot from "react-plotly.js";
import { useChartData } from "../hooks/useCompanies";

interface InteractiveChartProps {
  ticker: string;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ ticker }) => {
  const { data, isLoading, error } = useChartData(ticker);

  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading chart</div>;
  if (!data?.has_data) return <div>No chart data available</div>;

  return (
    <div className="w-full">
      <Plot
        data={data.chart_data.data}
        layout={{
          ...data.chart_data.layout,
          width: undefined,
          height: 400,
          autosize: true,
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
        }}
        className="w-full"
      />
    </div>
  );
};
```

## 🎨 UI/UX Recommendations

### Design System

- **Use Tailwind CSS** for styling
- **Dark/Light mode** support
- **Responsive design** (mobile-first)
- **Loading states** and error handling
- **Clean, professional** financial dashboard aesthetic

### Key Components Needed

1. **Statistics Cards** - Show key metrics
2. **Company Search** - Autocomplete with real-time results
3. **Filter Sidebar** - Exchange, currency, status filters
4. **Data Tables** - Sortable, paginated company lists
5. **Chart Widgets** - Interactive Plotly.js charts
6. **AI Analysis Panel** - Rich text display with formatting

### Performance Considerations

- **React Query** for caching and data fetching
- **Virtual scrolling** for large company lists
- **Lazy loading** for charts and heavy components
- **Debounced search** to avoid excessive API calls

## 🚀 Getting Started Steps

1. **Set up Next.js project** with TypeScript
2. **Install required dependencies** (React Query, Plotly.js, Tailwind)
3. **Create API service layer** using the endpoints above
4. **Build core components** (CompanyList, CompanyDetail, Charts)
5. **Implement search and filtering**
6. **Add interactive charts** with Plotly.js
7. **Style with Tailwind CSS**
8. **Add error handling and loading states**

## 🔗 API Test Commands

Test the backend before building frontend:

```bash
# Test basic endpoints
curl "http://127.0.0.1:8000/api/frc/stats"
curl "http://127.0.0.1:8000/api/frc/companies?limit=5"
curl "http://127.0.0.1:8000/api/frc/company/ZEPP"
curl "http://127.0.0.1:8000/api/frc/search?q=apple"

# Test filtering
curl "http://127.0.0.1:8000/api/frc/companies?has_reports=true&limit=3"
curl "http://127.0.0.1:8000/api/frc/companies?exchange=NASDAQ"
```

## ✅ Success Criteria

Your frontend should allow users to:

- ✅ **Browse all 122 FRC companies** with filtering
- ✅ **Search companies** by name or ticker
- ✅ **View detailed company profiles** with all available data
- ✅ **See interactive charts** for stock performance
- ✅ **Read AI analysis** and performance metrics
- ✅ **Filter by exchange, currency, and data availability**
- ✅ **Responsive design** working on all devices

**The backend is fully ready - focus on creating an intuitive, fast, and beautiful frontend experience!** 🚀
