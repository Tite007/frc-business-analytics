# API Integration Guide

## 🔌 Backend API Reference

**Base URL**: `http://localhost:8000`

---

## 📋 Core Endpoints

### **1. Company Profile**
```
GET /api/frc/company/{ticker}
```

**Purpose**: Get basic company information and data availability flags

**Response Structure**:
```json
{
  "success": true,
  "company": {
    "ticker": "ZEPP",
    "company_name": "ZEPP Health Corporation",
    "exchange": "NYSE",
    "currency": "USD",
    "reports_count": 10,
    "has_chart": true,
    "has_metrics": true,
    "frc_covered": true,
    "analysis_date": "2024-01-15"
  }
}
```

**Usage**:
```javascript
const companyData = await getCompanyData("ZEPP", "company");
if (companyData.success) {
  console.log(companyData.company.company_name);
}
```

---

### **2. Performance Metrics**
```
GET /api/frc/company/{ticker}/metrics
```

**Purpose**: Get detailed report performance analysis

**Response Structure**:
```json
{
  "success": true,
  "ticker": "ZEPP",
  "metrics_count": 10,
  "detailed_metrics": [
    {
      "report_id": 321,
      "report_title": "Revenue Soars",
      "publication_date": "2025-08-21",
      "report_type": "digital",
      "frc_30_day_analysis": {
        "price_on_release": 40.0,
        "price_after_30_days": 46.6,
        "price_change_30_days_pct": 16.5,
        "avg_volume_pre_30_days": 583176,
        "avg_volume_post_30_days": 453069,
        "volume_change_pre_post_30_days_pct": -22.31
      },
      "window_5_days": {
        "avg_volume_post": 21823,
        "price_spike_pct": 5.2
      },
      "window_10_days": {
        "avg_volume_post": 19165
      },
      "volatility_analysis": {
        "annualized_volatility_pct": 45.2
      }
    }
  ]
}
```

**Critical Fields**:
- `price_on_release` - Stock price when FRC published the report
- `price_after_30_days` - Stock price 30 days later
- `avg_volume_pre_30_days` - Average daily volume 30 days before report
- `avg_volume_post_30_days` - Average daily volume 30 days after report
- `volume_change_pre_post_30_days_pct` - Volume change percentage

**Usage**:
```javascript
const metrics = await getCompanyData("ZEPP", "metrics");
if (metrics.success) {
  const reports = metrics.detailed_metrics;
  reports.forEach(report => {
    const frc30 = report.frc_30_day_analysis;
    console.log(`Report: ${report.report_title}`);
    console.log(`Price Impact: ${frc30.price_change_30_days_pct}%`);
    console.log(`Volume Impact: ${frc30.volume_change_pre_post_30_days_pct}%`);
  });
}
```

---

### **3. Chart Data**
```
GET /api/frc/company/{ticker}/chart-data
```

**Purpose**: Get stock price and volume time series data

**Response Structure**:
```json
{
  "success": true,
  "chart_data": [
    {
      "date": "2024-01-15",
      "price": 25.43,
      "volume": 156789,
      "close": 25.43,
      "high": 26.12,
      "low": 25.01,
      "open": 25.67
    }
  ],
  "reports_coverage": {
    "total_reports": 4,
    "oldest_report": "2023-11-23",
    "newest_report": "2025-08-21",
    "date_span_days": 637
  }
}
```

**Usage**:
```javascript
const chartData = await getChartData("ZEPP");
if (chartData.success) {
  const prices = chartData.chart_data.map(d => d.price);
  const dates = chartData.chart_data.map(d => d.date);
}
```

---

### **4. Companies List**
```
GET /api/frc/companies?limit=50&has_metrics=true
```

**Purpose**: Get list of all companies with filtering options

**Query Parameters**:
- `limit` - Number of companies to return
- `exchange` - Filter by exchange (NYSE, NASDAQ, TSX)
- `currency` - Filter by currency (USD, CAD)
- `has_reports` - Filter companies with reports
- `has_metrics` - Filter companies with metrics data
- `search` - Search by ticker or company name

**Response Structure**:
```json
{
  "success": true,
  "total_companies": 156,
  "companies": [
    {
      "ticker": "ZEPP",
      "company_name": "ZEPP Health Corporation",
      "exchange": "NYSE",
      "currency": "USD",
      "reports_count": 10,
      "has_chart": true,
      "has_metrics": true
    }
  ]
}
```

---

### **5. Bloomberg Data**
```
GET /api/bloomberg/company/{ticker}
```

**Purpose**: Get Bloomberg Terminal readership analytics

**Response Structure**:
```json
{
  "success": true,
  "ticker": "ZEPP",
  "summary": {
    "total_reads": 1247,
    "unique_institutions": 89,
    "embargo_rate": 23.4
  },
  "revealed_institutions": [
    "Goldman Sachs",
    "Morgan Stanley",
    "BlackRock"
  ],
  "geographic_distribution": {
    "US": 456,
    "UK": 234,
    "CN": 123
  }
}
```

---

## 🔧 Frontend API Integration

### **API Client Setup (`src/lib/api.js`)**

**Base Configuration**:
```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
});

export async function getCompanyData(ticker, endpoint = "companies") {
  try {
    const response = await api.get(`/api/frc/company/${ticker}`);
    return response.data;
  } catch (error) {
    return {
      error: true,
      message: error.message,
      status: error.response?.status
    };
  }
}
```

**Data Fetching Pattern**:
```javascript
export async function getMetricsData(ticker) {
  try {
    const response = await api.get(`/api/frc/company/${ticker}/metrics`);

    if (response.data.success) {
      return {
        success: true,
        metrics: response.data.detailed_metrics,
        count: response.data.metrics_count
      };
    } else {
      return {
        error: true,
        message: "No metrics data available"
      };
    }
  } catch (error) {
    console.error(`Error fetching metrics for ${ticker}:`, error);
    return {
      error: true,
      message: error.message,
      status: error.response?.status
    };
  }
}
```

---

## 🔄 Data Transformation Patterns

### **1. Raw API Data → Component Props**

**Transform metrics data for table display**:
```javascript
const transformMetrics = (apiMetrics) => {
  return apiMetrics.map((report, index) => {
    const frc30 = report.frc_30_day_analysis || {};

    return {
      // Standard fields for tables
      "Report Number": report.report_id,
      "Report Title": report.report_title,
      "Publication Date": report.publication_date,
      "Price on Release": frc30.price_on_release || 0,
      "Price After 30 Days": frc30.price_after_30_days || 0,
      "Price Change 30 Days (%)": frc30.price_change_30_days_pct || 0,
      "Avg Volume Pre 30 Days": frc30.avg_volume_pre_30_days || 0,
      "Avg Volume Post 30 Days": frc30.avg_volume_post_30_days || 0,
      "Volume Change 30 Days (%)": frc30.volume_change_pre_post_30_days_pct || 0,

      // Keep raw data for advanced use
      _raw: report,

      // Add computed fields
      chronologicalOrder: index + 1
    };
  });
};
```

### **2. Chronological Sorting**
```javascript
const sortByDate = (reports) => {
  return [...reports].sort((a, b) => {
    const dateA = new Date(a["Publication Date"] || a.publication_date);
    const dateB = new Date(b["Publication Date"] || b.publication_date);
    return dateA - dateB; // Oldest first
  });
};
```

### **3. Chart Data Transformation**
```javascript
const transformChartData = (apiChartData) => {
  const dates = apiChartData.map(d => d.date);
  const prices = apiChartData.map(d => d.price || d.close);
  const volumes = apiChartData.map(d => d.volume);

  return {
    data: [
      {
        x: dates,
        y: prices,
        type: 'scatter',
        mode: 'lines',
        name: 'Price',
        line: { color: '#3b82f6' }
      },
      {
        x: dates,
        y: volumes,
        type: 'bar',
        name: 'Volume',
        yaxis: 'y2',
        opacity: 0.3
      }
    ],
    layout: {
      title: 'Stock Performance',
      yaxis: { title: 'Price' },
      yaxis2: { title: 'Volume', overlaying: 'y', side: 'right' }
    }
  };
};
```

---

## 🧪 API Testing & Debugging

### **1. Test API Responses**
```bash
# Test company endpoint
curl -s "http://localhost:8000/api/frc/company/ZEPP" | jq '.'

# Test metrics endpoint
curl -s "http://localhost:8000/api/frc/company/ZEPP/metrics" | jq '.detailed_metrics[0]'

# Test with invalid ticker (should return 404)
curl -s "http://localhost:8000/api/frc/company/INVALID" | jq '.'
```

### **2. Frontend Debugging**
```javascript
// Add console logging to track data flow
useEffect(() => {
  const fetchData = async () => {
    console.log(`🔍 Fetching data for ${ticker}`);

    const response = await getCompanyData(ticker, "metrics");
    console.log(`📊 API Response:`, response);

    if (response.success) {
      console.log(`✅ Got ${response.detailed_metrics.length} reports`);
      setMetrics(response.detailed_metrics);
    } else {
      console.error(`❌ Error:`, response.message);
      setError(response);
    }
  };

  fetchData();
}, [ticker]);
```

### **3. Common Issues & Solutions**

**Issue**: Volume data showing as 0
```javascript
// ❌ Wrong field name
const volume = frc30.pre_30_day_avg_volume; // undefined

// ✅ Correct field name
const volume = frc30.avg_volume_pre_30_days; // actual value
```

**Issue**: Reports in wrong order
```javascript
// ❌ Using array index
reports.map((report, index) => ({ order: index + 1 }))

// ✅ Sort by date first
const sorted = sortByDate(reports);
sorted.map((report, index) => ({ order: index + 1 }))
```

**Issue**: API errors not handled
```javascript
// ❌ No error handling
const data = await getCompanyData(ticker);
setData(data.detailed_metrics); // crashes if error

// ✅ Proper error handling
const response = await getCompanyData(ticker);
if (response.success) {
  setData(response.detailed_metrics);
} else {
  setError(response.message);
}
```

---

## 📊 Data Quality Guidelines

### **1. Required Data Validation**
```javascript
const validateMetricsData = (report) => {
  const frc30 = report.frc_30_day_analysis;

  return {
    hasPrice: !!(frc30?.price_on_release && frc30?.price_after_30_days),
    hasVolume: !!(frc30?.avg_volume_pre_30_days && frc30?.avg_volume_post_30_days),
    hasDate: !!report.publication_date,
    hasTitle: !!report.report_title
  };
};
```

### **2. Data Completeness Check**
```javascript
const getDataQuality = (metrics) => {
  const total = metrics.length;
  const complete = metrics.filter(report => {
    const validation = validateMetricsData(report);
    return validation.hasPrice && validation.hasVolume && validation.hasDate;
  }).length;

  return {
    total,
    complete,
    percentage: Math.round((complete / total) * 100)
  };
};
```

---

## 🚀 Performance Optimization

### **1. Efficient Data Fetching**
```javascript
// ✅ Fetch data in parallel when possible
const [companyData, metricsData, chartData] = await Promise.all([
  getCompanyData(ticker, "company"),
  getCompanyData(ticker, "metrics"),
  getCompanyData(ticker, "chart-data")
]);
```

### **2. Caching Strategy**
```javascript
// Simple caching to avoid duplicate requests
const cache = new Map();

const getCachedData = async (ticker, endpoint) => {
  const key = `${ticker}-${endpoint}`;

  if (cache.has(key)) {
    return cache.get(key);
  }

  const data = await getCompanyData(ticker, endpoint);
  cache.set(key, data);

  return data;
};
```

### **3. Error Recovery**
```javascript
const fetchWithRetry = async (ticker, endpoint, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await getCompanyData(ticker, endpoint);
      if (result.success) return result;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * i));
    }
  }
};
```

---

## 📝 Integration Checklist

**Before submitting API integration code**:

- [ ] **API response structure** matches documented format
- [ ] **Error handling** for 404, 500, network errors
- [ ] **Data validation** with fallbacks for missing fields
- [ ] **Loading states** displayed during API calls
- [ ] **Consistent field names** used throughout component
- [ ] **Console.log removed** from production code
- [ ] **Performance tested** with large datasets
- [ ] **Mobile responsive** display of data

**Testing scenarios**:
- [ ] Valid ticker with full data
- [ ] Valid ticker with partial data
- [ ] Invalid ticker (404 error)
- [ ] Network timeout/failure
- [ ] Backend server down
- [ ] Large dataset (50+ reports)
- [ ] Empty dataset (0 reports)

---

## 🎯 Best Practices Summary

1. **Always check API response format first** - Use curl to verify structure
2. **Use exact field names from API** - Don't guess, check the actual response
3. **Handle all error states gracefully** - Network, 404, empty data
4. **Transform data in hooks, not components** - Keep components clean
5. **Sort data consistently** - Chronological order by date
6. **Validate data before using** - Provide fallbacks for missing fields
7. **Log errors, not successes** - Help with debugging, avoid noise
8. **Test with real API data** - Don't rely on mock data alone