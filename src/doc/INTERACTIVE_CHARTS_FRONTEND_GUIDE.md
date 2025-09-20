# 📊 Interactive Charts & Company Profiles Frontend Guide

## 🎯 Overview

Your backend already generates **Plotly.js compatible charts** and stores them in the MongoDB database. The frontend needs to:

1. **Fetch chart data** from `/api/frc/chart/{ticker}` endpoint
2. **Render interactive charts** using `react-plotly.js`
3. **Build company profile pages** with reports, metrics, and analysis
4. **Display all data** in a cohesive dashboard layout

## 🔌 Backend Chart Data Structure

Your backend `dashboard.py` creates charts with this structure:

```python
# Backend returns this format
{
    'success': True,
    'ticker': 'ZEPP',
    'company_name': 'Zepp Health Corporation',
    'chart_json': '{"data": [...], "layout": {...}}',  # Plotly JSON
    'chart_dict': {...},  # Chart as dictionary
    'exchange': 'NYSE',
    'currency': 'USD',
    'generated_at': '2025-08-27T...'
}
```

The API endpoint `/api/frc/chart/{ticker}` returns:

```json
{
  "success": true,
  "ticker": "ZEPP",
  "company_name": "Zepp Health Corporation",
  "chart_data": {
    "data": [
      {
        "x": ["2024-08-27", "2024-08-28", ...],
        "y": [2.34, 2.45, ...],
        "type": "scatter",
        "mode": "lines",
        "name": "Close Price"
      }
    ],
    "layout": {
      "title": "Stock Performance for Zepp Health Corporation (ZEPP)",
      "xaxis": {"title": "Date"},
      "yaxis": {"title": "Price (USD)"}
    }
  },
  "exchange": "NYSE",
  "currency": "USD",
  "has_data": true
}
```

## 🚀 Frontend Implementation

### 1. 📦 Install Required Dependencies

```bash
npm install react-plotly.js plotly.js @tanstack/react-query axios
```

### 2. 📊 Interactive Chart Component

Create `components/charts/InteractiveChart.tsx`:

```tsx
'use client';

import React from 'react';
import Plot from 'react-plotly.js';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';

interface InteractiveChartProps {
  ticker: string;
  height?: number;
  showControls?: boolean;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ 
  ticker, 
  height = 500,
  showControls = true 
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['chart', ticker],
    queryFn: () => apiService.getChartData(ticker),
    enabled: !!ticker,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chart for {ticker}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">📊❌</div>
          <p className="text-red-600">Error loading chart for {ticker}</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  if (!data?.has_data || !data?.chart_data) {
    return (
      <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg">
        <div className="text-center">
          <div className="text-yellow-500 text-4xl mb-4">📊⚠️</div>
          <p className="text-yellow-600">No chart data available for {ticker}</p>
          <p className="text-sm text-gray-500 mt-2">Stock data may not be available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border">
      {/* Chart Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {data.company_name} ({data.ticker})
            </h3>
            <p className="text-sm text-gray-500">
              {data.exchange} • {data.currency}
            </p>
          </div>
          {showControls && (
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                📈 Fullscreen
              </button>
              <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                💾 Export
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="p-4">
        <Plot
          data={data.chart_data.data}
          layout={{
            ...data.chart_data.layout,
            width: undefined, // Let it be responsive
            height: height,
            autosize: true,
            margin: { l: 60, r: 60, t: 60, b: 60 },
            paper_bgcolor: 'white',
            plot_bgcolor: 'white',
          }}
          config={{
            responsive: true,
            displayModeBar: showControls,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
            toImageButtonOptions: {
              format: 'png',
              filename: `${ticker}_chart`,
              height: 800,
              width: 1200,
              scale: 1
            }
          }}
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>
    </div>
  );
};

export default InteractiveChart;
```

### 3. 🏢 Company Profile Page Component

Create `components/company/CompanyProfile.tsx`:

```tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import InteractiveChart from '../charts/InteractiveChart';
import CompanyMetrics from './CompanyMetrics';
import CompanyReports from './CompanyReports';
import AIAnalysis from './AIAnalysis';

interface CompanyProfileProps {
  ticker: string;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ ticker }) => {
  // Fetch company details
  const { data: company, isLoading, error } = useQuery({
    queryKey: ['company', ticker],
    queryFn: () => apiService.getCompany(ticker),
    enabled: !!ticker,
  });

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['metrics', ticker],
    queryFn: () => apiService.getMetrics(ticker),
    enabled: !!ticker,
  });

  // Fetch AI analysis
  const { data: analysis } = useQuery({
    queryKey: ['analysis', ticker],
    queryFn: () => apiService.getAnalysis(ticker),
    enabled: !!ticker,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-300 rounded"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company?.success) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Company Not Found</h1>
          <p className="text-gray-600">Could not load data for ticker: {ticker}</p>
        </div>
      </div>
    );
  }

  const companyData = company.company;
  const dataAvailable = company.data_available;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Company Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {companyData.company_name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xl font-semibold text-blue-600">
                {companyData.ticker}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {companyData.exchange}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {companyData.currency}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                companyData.status === 'success' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {companyData.status}
              </span>
            </div>
          </div>
          
          {/* Data Availability Indicators */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {dataAvailable.has_reports && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  📄 Reports
                </span>
              )}
              {dataAvailable.has_stock_data && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                  📈 Stock Data
                </span>
              )}
              {dataAvailable.has_chart && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  📊 Charts
                </span>
              )}
              {dataAvailable.has_ai_analysis && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                  🤖 AI Analysis
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Chart and Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Interactive Chart */}
          {dataAvailable.has_chart ? (
            <InteractiveChart ticker={ticker} height={400} />
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📊</div>
              <p className="text-gray-600">No chart data available</p>
            </div>
          )}

          {/* Performance Metrics */}
          {dataAvailable.has_metrics && metrics?.success && (
            <CompanyMetrics 
              ticker={ticker}
              metrics={metrics.metrics}
              currency={metrics.currency}
              totalReports={metrics.total_reports}
            />
          )}

        </div>

        {/* Right Column - Reports and Analysis */}
        <div className="space-y-6">
          
          {/* Company Reports */}
          {dataAvailable.has_reports && companyData.data?.reports && (
            <CompanyReports 
              ticker={ticker}
              reports={companyData.data.reports}
              companyName={companyData.company_name}
            />
          )}

          {/* AI Analysis */}
          {dataAvailable.has_ai_analysis && analysis?.success && (
            <AIAnalysis 
              ticker={ticker}
              analysis={analysis.analysis}
              status={analysis.status}
              generatedDate={analysis.generated_date}
            />
          )}

          {/* Company Info Card */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Company Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ticker:</span>
                <span className="font-semibold">{companyData.ticker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Exchange:</span>
                <span>{companyData.exchange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span>{companyData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reports:</span>
                <span>{companyData.reports_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock Data Points:</span>
                <span>{companyData.stock_data_points || 0}</span>
              </div>
              {companyData.analysis_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-sm">
                    {new Date(companyData.analysis_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
```

### 4. 📈 Company Metrics Component

Create `components/company/CompanyMetrics.tsx`:

```tsx
'use client';

import React from 'react';

interface Metric {
  report_title: string;
  published_date: string;
  price_before_report: number;
  price_after_30_days: number;
  price_change_percentage: number;
  volume_change_percentage: number;
}

interface CompanyMetricsProps {
  ticker: string;
  metrics: Metric[];
  currency: string;
  totalReports: number;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ 
  ticker, 
  metrics, 
  currency, 
  totalReports 
}) => {
  if (!metrics || metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <p className="text-gray-500">No metrics data available</p>
      </div>
    );
  }

  // Calculate average performance
  const avgPriceChange = metrics.reduce((sum, m) => sum + m.price_change_percentage, 0) / metrics.length;
  const avgVolumeChange = metrics.reduce((sum, m) => sum + m.volume_change_percentage, 0) / metrics.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Reports</div>
          <div className="text-2xl font-bold text-blue-700">{totalReports}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Avg Price Change</div>
          <div className={`text-2xl font-bold ${avgPriceChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {avgPriceChange >= 0 ? '+' : ''}{avgPriceChange.toFixed(1)}%
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Avg Volume Change</div>
          <div className={`text-2xl font-bold ${avgVolumeChange >= 0 ? 'text-purple-700' : 'text-red-700'}`}>
            {avgVolumeChange >= 0 ? '+' : ''}{avgVolumeChange.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-900">Report</th>
              <th className="text-left py-2 font-medium text-gray-900">Date</th>
              <th className="text-right py-2 font-medium text-gray-900">Before ({currency})</th>
              <th className="text-right py-2 font-medium text-gray-900">After 30d ({currency})</th>
              <th className="text-right py-2 font-medium text-gray-900">Price Change</th>
              <th className="text-right py-2 font-medium text-gray-900">Volume Change</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3">
                  <div className="font-medium text-gray-900 truncate max-w-48">
                    {metric.report_title}
                  </div>
                </td>
                <td className="py-3 text-gray-600">
                  {new Date(metric.published_date).toLocaleDateString()}
                </td>
                <td className="py-3 text-right font-mono">
                  {metric.price_before_report?.toFixed(2) || 'N/A'}
                </td>
                <td className="py-3 text-right font-mono">
                  {metric.price_after_30_days?.toFixed(2) || 'N/A'}
                </td>
                <td className={`py-3 text-right font-semibold ${
                  metric.price_change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.price_change_percentage >= 0 ? '+' : ''}
                  {metric.price_change_percentage?.toFixed(1) || 'N/A'}%
                </td>
                <td className={`py-3 text-right font-semibold ${
                  metric.volume_change_percentage >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {metric.volume_change_percentage >= 0 ? '+' : ''}
                  {metric.volume_change_percentage?.toFixed(1) || 'N/A'}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyMetrics;
```

### 5. 📄 Company Reports Component

Create `components/company/CompanyReports.tsx`:

```tsx
'use client';

import React from 'react';

interface Report {
  title: string;
  published_date: string;
  url?: string;
  report_type?: string;
  quarter?: string;
  year?: number;
}

interface CompanyReportsProps {
  ticker: string;
  reports: Report[];
  companyName: string;
}

const CompanyReports: React.FC<CompanyReportsProps> = ({ 
  ticker, 
  reports, 
  companyName 
}) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Research Reports</h3>
        <p className="text-gray-500">No reports available</p>
      </div>
    );
  }

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => 
    new Date(b.published_date).getTime() - new Date(a.published_date).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Research Reports</h3>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
          {reports.length} report{reports.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {sortedReports.map((report, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {report.title}
                </h4>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    📅 {new Date(report.published_date).toLocaleDateString()}
                  </span>
                  
                  {report.report_type && (
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                      {report.report_type}
                    </span>
                  )}
                  
                  {report.quarter && report.year && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {report.quarter} {report.year}
                    </span>
                  )}
                </div>
              </div>
              
              {report.url && (
                <a 
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  📄 View
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyReports;
```

### 6. 🤖 AI Analysis Component

Create `components/company/AIAnalysis.tsx`:

```tsx
'use client';

import React, { useState } from 'react';

interface AIAnalysisProps {
  ticker: string;
  analysis: string;
  status: string;
  generatedDate: string;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ 
  ticker, 
  analysis, 
  status, 
  generatedDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!analysis || analysis.trim().length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
        <p className="text-gray-500">No AI analysis available</p>
      </div>
    );
  }

  const isLongAnalysis = analysis.length > 500;
  const displayText = isExpanded ? analysis : analysis.substring(0, 500);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AI Analysis</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs ${
            status === 'success' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            🤖 {status}
          </span>
        </div>
      </div>

      <div className="prose prose-sm max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {displayText}
          {isLongAnalysis && !isExpanded && '...'}
        </div>
        
        {isLongAnalysis && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? '📄 Show Less' : '📄 Read More'}
          </button>
        )}
      </div>

      {generatedDate && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Generated on {new Date(generatedDate).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
```

### 7. 🔗 Next.js Page for Company Profile

Create `pages/companies/[ticker].tsx` (or `app/companies/[ticker]/page.tsx` for App Router):

```tsx
'use client';

import { useRouter } from 'next/router';
import CompanyProfile from '../../components/company/CompanyProfile';
import Layout from '../../components/layout/Layout';

const CompanyPage = () => {
  const router = useRouter();
  const { ticker } = router.query;

  if (!ticker || typeof ticker !== 'string') {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Company Ticker</h1>
            <p className="text-gray-600">Please provide a valid ticker symbol.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <CompanyProfile ticker={ticker.toUpperCase()} />
    </Layout>
  );
};

export default CompanyPage;
```

## 🎯 Usage Examples

### Navigation to Company Profile
```tsx
// From company list
<Link href={`/companies/${company.ticker}`}>
  <div className="cursor-pointer hover:bg-gray-50 p-4 rounded">
    <h3>{company.company_name}</h3>
    <p>{company.ticker}</p>
  </div>
</Link>
```

### Standalone Chart Usage
```tsx
// Use anywhere in your app
<InteractiveChart ticker="ZEPP" height={300} showControls={false} />
```

## ✅ Complete Integration

With these components, your frontend will:

1. **✅ Fetch chart data** from your backend's `/api/frc/chart/{ticker}` endpoint
2. **✅ Render interactive Plotly.js charts** with your exact backend chart format  
3. **✅ Display company profiles** with reports, metrics, and AI analysis
4. **✅ Handle loading states** and errors gracefully
5. **✅ Be fully responsive** and professional looking

Your backend's `dashboard.py` chart generation will work seamlessly with these React components! 🚀
