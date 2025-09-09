# Bloomberg Readership Frontend Integration Guide

## Overview

This document provides complete frontend integration instructions for the Bloomberg Readership system. The system tracks institutional interest in company reports and provides detailed readership analytics including firm details, geographic distribution, and embargo status.

## 🎯 Features for Company Profile Page

### Core Bloomberg Readership Components:

1. **📊 Readership Summary Widget** - Total reads, institutions, countries
2. **🏢 Institutional Readership Table** - Detailed institutional breakdown
3. **🌍 Geographic Distribution Chart** - Countries and regions reading reports
4. **📈 Readership Trends Graph** - Time-based reading patterns
5. **🔒 Embargo Status Indicator** - Real-time embargo vs revealed data

---

## 📡 API Endpoints

### Base URL

```
Production: https://your-server.com/api
Development: http://localhost:8000
```

### Authentication

No authentication required for readership endpoints (public data).

---

## 🔗 API Endpoints Documentation

### 1. **Get Company Readership Data**

```http
GET /readership/{ticker}
```

**Parameters:**

- `ticker` (required): Company ticker symbol (e.g., "ZEPP", "SYH.V")
- `days` (optional): Number of days to look back (default: 90, max: 365)

**Response:**

```json
{
  "success": true,
  "data": {
    "ticker": "ZEPP",
    "total_readers": 27,
    "readership_30d": 15,
    "readership_90d": 25,
    "readership_365d": 27,
    "unique_institutions": 17,
    "unique_countries": 9,
    "embargoed_count": 8,
    "revealed_count": 19,
    "top_countries": [
      { "country": "United States", "count": 12, "percentage": 44.4 },
      { "country": "Canada", "count": 6, "percentage": 22.2 },
      { "country": "United Kingdom", "count": 4, "percentage": 14.8 }
    ],
    "top_institutions": [
      { "institution": "Goldman Sachs", "count": 3, "percentage": 11.1 },
      { "institution": "Morgan Stanley", "count": 2, "percentage": 7.4 }
    ],
    "last_updated": "2025-09-09T13:00:00Z"
  }
}
```

### 2. **Get Institutional Readership Table**

```http
GET /readership/{ticker}/institutional
```

**Parameters:**

- `ticker` (required): Company ticker symbol
- `days` (optional): Days to look back (default: 90)
- `show_embargoed` (optional): Include embargoed records (default: true)
- `limit` (optional): Max records to return (default: 100, max: 1000)

**Response:**

```json
{
  "success": true,
  "data": {
    "ticker": "ZEPP",
    "institutional_records": [
      {
        "firm_number": "12345",
        "customer_number": "67890",
        "customer_name": "Goldman Sachs Asset Management",
        "customer_country": "United States",
        "customer_state": "New York",
        "customer_city": "New York",
        "primary_ticker": "ZEPP",
        "access_date": "2025-09-08T14:30:00Z",
        "is_embargoed": false,
        "embargo_lift_date": "2025-08-15T00:00:00Z"
      }
    ],
    "total_records": 27,
    "summary": {
      "unique_institutions": 17,
      "unique_countries": 9,
      "embargoed_count": 8,
      "revealed_count": 19,
      "top_countries": [...],
      "top_institutions": [...]
    },
    "date_range": {
      "start_date": "2025-06-11T00:00:00Z",
      "end_date": "2025-09-09T00:00:00Z",
      "days": 90
    }
  }
}
```

### 3. **Get Readership Summary**

```http
GET /readership/{ticker}/summary
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ticker": "ZEPP",
    "summary": {
      "total_readership_records": 27,
      "unique_institutions": 17,
      "unique_countries": 9,
      "primary_country": "United States",
      "primary_institution": "Goldman Sachs Asset Management",
      "embargo_status": {
        "embargoed_records": 8,
        "revealed_records": 19,
        "embargo_percentage": 29.6
      },
      "time_periods": {
        "last_7_days": 3,
        "last_30_days": 15,
        "last_90_days": 25,
        "last_365_days": 27
      }
    }
  }
}
```

### 4. **Get Readership Trends**

```http
GET /readership/{ticker}/trends
```

**Parameters:**

- `days` (optional): Time period for trends (default: 90)

**Response:**

```json
{
  "success": true,
  "data": {
    "ticker": "ZEPP",
    "trends": [
      {
        "date": "2025-09-01",
        "reads_count": 5,
        "unique_institutions": 3,
        "new_institutions": 1
      },
      {
        "date": "2025-09-02",
        "reads_count": 2,
        "unique_institutions": 2,
        "new_institutions": 0
      }
    ],
    "period_summary": {
      "total_days": 90,
      "active_days": 45,
      "average_daily_reads": 0.3,
      "peak_day": {
        "date": "2025-08-22",
        "reads": 8
      }
    }
  }
}
```

---

## 🎨 Frontend Implementation Examples

### React Component Examples

#### 1. **Readership Summary Widget**

```jsx
// Readership Summary Component
import React, { useState, useEffect } from "react";

const ReadlershipSummary = ({ ticker }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReadershipSummary();
  }, [ticker]);

  const fetchReadershipSummary = async () => {
    try {
      const response = await fetch(`/api/readership/${ticker}/summary`);
      const result = await response.json();

      if (result.success) {
        setData(result.data.summary);
      }
    } catch (error) {
      console.error("Error fetching readership summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading readership data...</div>;
  if (!data) return <div className="no-data">No readership data available</div>;

  return (
    <div className="readership-summary">
      <h3>📊 Institutional Readership</h3>

      <div className="summary-stats">
        <div className="stat-item">
          <div className="stat-value">{data.total_readership_records}</div>
          <div className="stat-label">Total Reads</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{data.unique_institutions}</div>
          <div className="stat-label">Institutions</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{data.unique_countries}</div>
          <div className="stat-label">Countries</div>
        </div>

        <div className="stat-item embargo-status">
          <div className="stat-value">
            {data.embargo_status.revealed_records}/
            {data.embargo_status.embargoed_records}
          </div>
          <div className="stat-label">Revealed/Embargoed</div>
        </div>
      </div>

      <div className="primary-readers">
        <div className="primary-item">
          <strong>🌍 Top Country:</strong> {data.primary_country}
        </div>
        <div className="primary-item">
          <strong>🏢 Top Institution:</strong> {data.primary_institution}
        </div>
      </div>

      <div className="time-breakdown">
        <h4>📈 Recent Activity</h4>
        <div className="time-stats">
          <span>
            Last 7 days: <strong>{data.time_periods.last_7_days}</strong>
          </span>
          <span>
            Last 30 days: <strong>{data.time_periods.last_30_days}</strong>
          </span>
          <span>
            Last 90 days: <strong>{data.time_periods.last_90_days}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReadlershipSummary;
```

#### 2. **Institutional Readership Table**

```jsx
// Institutional Readership Table Component
import React, { useState, useEffect } from "react";

const InstitutionalTable = ({ ticker }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmbargoed, setShowEmbargoed] = useState(true);
  const [sortField, setSortField] = useState("access_date");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    fetchInstitutionalData();
  }, [ticker, showEmbargoed]);

  const fetchInstitutionalData = async () => {
    try {
      const response = await fetch(
        `/api/readership/${ticker}/institutional?show_embargoed=${showEmbargoed}&limit=100`
      );
      const result = await response.json();

      if (result.success) {
        setData(result.data.institutional_records);
      }
    } catch (error) {
      console.error("Error fetching institutional data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortData = (field) => {
    const direction =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...data].sort((a, b) => {
      if (direction === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setData(sorted);
  };

  if (loading)
    return <div className="loading">Loading institutional data...</div>;
  if (!data.length)
    return (
      <div className="no-data">No institutional readership data available</div>
    );

  return (
    <div className="institutional-table">
      <div className="table-header">
        <h3>🏢 Institutional Readership Details</h3>

        <div className="table-controls">
          <label>
            <input
              type="checkbox"
              checked={showEmbargoed}
              onChange={(e) => setShowEmbargoed(e.target.checked)}
            />
            Show Embargoed Records
          </label>
        </div>
      </div>

      <div className="table-container">
        <table className="readership-table">
          <thead>
            <tr>
              <th onClick={() => sortData("customer_name")}>
                Institution{" "}
                {sortField === "customer_name" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => sortData("customer_country")}>
                Country{" "}
                {sortField === "customer_country" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => sortData("customer_city")}>City</th>
              <th onClick={() => sortData("firm_number")}>Firm #</th>
              <th onClick={() => sortData("customer_number")}>Customer #</th>
              <th onClick={() => sortData("access_date")}>
                Access Date{" "}
                {sortField === "access_date" &&
                  (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr
                key={index}
                className={record.is_embargoed ? "embargoed" : "revealed"}
              >
                <td>
                  <div className="institution-name">{record.customer_name}</div>
                </td>
                <td>
                  <span className="country-flag">
                    {getCountryFlag(record.customer_country)}
                  </span>
                  {record.customer_country}
                </td>
                <td>{record.customer_city || "N/A"}</td>
                <td>
                  <code>{record.firm_number}</code>
                </td>
                <td>
                  <code>{record.customer_number}</code>
                </td>
                <td>{formatDate(record.access_date)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      record.is_embargoed ? "embargoed" : "revealed"
                    }`}
                  >
                    {record.is_embargoed ? "🔒 Embargoed" : "👁️ Revealed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="record-count">
          Showing {data.length} institutional readership records
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getCountryFlag = (country) => {
  const flags = {
    "United States": "🇺🇸",
    Canada: "🇨🇦",
    "United Kingdom": "🇬🇧",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Japan: "🇯🇵",
    Australia: "🇦🇺",
  };
  return flags[country] || "🌍";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default InstitutionalTable;
```

#### 3. **Geographic Distribution Chart**

```jsx
// Geographic Distribution Component (using Chart.js)
import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";

const GeographicChart = ({ ticker }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchGeographicData();
  }, [ticker]);

  const fetchGeographicData = async () => {
    try {
      const response = await fetch(`/api/readership/${ticker}`);
      const result = await response.json();

      if (result.success && result.data.top_countries) {
        const countries = result.data.top_countries.slice(0, 8); // Top 8 countries
        const others = result.data.top_countries.slice(8);

        const labels = countries.map((c) => c.country);
        const data = countries.map((c) => c.count);

        // Add "Others" if there are more countries
        if (others.length > 0) {
          const otherTotal = others.reduce((sum, c) => sum + c.count, 0);
          labels.push("Others");
          data.push(otherTotal);
        }

        setChartData({
          labels,
          datasets: [
            {
              data,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                "#FF6384",
                "#C9CBCF",
                "#4BC0C0",
              ],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching geographic data:", error);
    }
  };

  if (!chartData)
    return <div className="loading">Loading geographic data...</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} reads (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="geographic-chart">
      <h3>🌍 Geographic Distribution</h3>
      <div className="chart-container" style={{ height: "300px" }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default GeographicChart;
```

#### 4. **Readership Trends Graph**

```jsx
// Readership Trends Component (using Chart.js)
import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const ReadlershipTrends = ({ ticker }) => {
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState(90);

  useEffect(() => {
    fetchTrendsData();
  }, [ticker, period]);

  const fetchTrendsData = async () => {
    try {
      const response = await fetch(
        `/api/readership/${ticker}/trends?days=${period}`
      );
      const result = await response.json();

      if (result.success && result.data.trends) {
        const trends = result.data.trends;

        setChartData({
          labels: trends.map((t) => new Date(t.date).toLocaleDateString()),
          datasets: [
            {
              label: "Daily Reads",
              data: trends.map((t) => t.reads_count),
              borderColor: "#36A2EB",
              backgroundColor: "rgba(54, 162, 235, 0.1)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Unique Institutions",
              data: trends.map((t) => t.unique_institutions),
              borderColor: "#FF6384",
              backgroundColor: "rgba(255, 99, 132, 0.1)",
              fill: false,
              tension: 0.4,
            },
          ],
        });
      }
    } catch (error) {
      console.error("Error fetching trends data:", error);
    }
  };

  if (!chartData) return <div className="loading">Loading trends data...</div>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: "Count",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="readership-trends">
      <div className="trends-header">
        <h3>📈 Readership Trends</h3>

        <div className="period-selector">
          <label>Period: </label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
          >
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={180}>Last 6 Months</option>
            <option value={365}>Last Year</option>
          </select>
        </div>
      </div>

      <div className="chart-container" style={{ height: "400px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ReadlershipTrends;
```

---

## 💅 CSS Styles

```css
/* Bloomberg Readership Styles */
.readership-summary {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 4px;
}

.embargo-status .stat-value {
  color: #e67e22;
}

.institutional-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.table-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-container {
  overflow-x: auto;
}

.readership-table {
  width: 100%;
  border-collapse: collapse;
}

.readership-table th {
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  border-bottom: 2px solid #dee2e6;
}

.readership-table th:hover {
  background: #e9ecef;
}

.readership-table td {
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
}

.readership-table tr:hover {
  background: #f8f9fa;
}

.readership-table tr.embargoed {
  background: rgba(255, 193, 7, 0.1);
}

.readership-table tr.revealed {
  background: rgba(40, 167, 69, 0.05);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.embargoed {
  background: #fff3cd;
  color: #856404;
}

.status-badge.revealed {
  background: #d1eddb;
  color: #155724;
}

.country-flag {
  margin-right: 8px;
}

.institution-name {
  font-weight: 500;
}

.geographic-chart,
.readership-trends {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.trends-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.period-selector select {
  padding: 6px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.chart-container {
  position: relative;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-style: italic;
}
```

---

## 🎛️ Integration into Company Profile Page

### Main Company Profile Component

```jsx
// Company Profile Page with Bloomberg Readership
import React from "react";
import ReadlershipSummary from "./ReadlershipSummary";
import InstitutionalTable from "./InstitutionalTable";
import GeographicChart from "./GeographicChart";
import ReadlershipTrends from "./ReadlershipTrends";

const CompanyProfile = ({ ticker }) => {
  return (
    <div className="company-profile">
      {/* Existing company info */}
      <div className="company-header">
        <h1>{ticker} - Company Profile</h1>
      </div>

      {/* Bloomberg Readership Section */}
      <div className="readership-section">
        <h2>📊 Institutional Interest & Readership</h2>

        {/* Top row - Summary and Geographic */}
        <div className="readership-row">
          <div className="readership-col-6">
            <ReadlershipSummary ticker={ticker} />
          </div>
          <div className="readership-col-6">
            <GeographicChart ticker={ticker} />
          </div>
        </div>

        {/* Trends chart */}
        <ReadlershipTrends ticker={ticker} />

        {/* Institutional table */}
        <InstitutionalTable ticker={ticker} />
      </div>

      {/* Rest of company profile */}
    </div>
  );
};

export default CompanyProfile;
```

---

## 🚀 Quick Implementation Checklist

### For Frontend Agent:

1. **✅ Install Dependencies**

   ```bash
   npm install chart.js react-chartjs-2
   ```

2. **✅ Copy Components**

   - Copy all React components provided above
   - Modify styling to match your design system
   - Adjust API base URL for your environment

3. **✅ Add to Company Profile**

   - Import Bloomberg components
   - Add readership section to company profile page
   - Pass ticker prop to components

4. **✅ Test API Endpoints**

   - Test with sample ticker (e.g., "ZEPP")
   - Verify all endpoints return data
   - Handle loading and error states

5. **✅ Styling Integration**

   - Copy CSS styles
   - Adapt to your design system
   - Ensure responsive design

6. **✅ Optional Enhancements**
   - Add export functionality for institutional table
   - Implement real-time updates
   - Add filtering and search capabilities

---

## 📞 Support & Testing

### Test URLs:

```
Health Check: /api/health
ZEPP Readership: /api/readership/ZEPP
ZEPP Institutional: /api/readership/ZEPP/institutional
ZEPP Summary: /api/readership/ZEPP/summary
ZEPP Trends: /api/readership/ZEPP/trends
```

### Expected Data Flow:

1. User visits company profile page
2. Frontend fetches readership data via APIs
3. Components render institutional table and charts
4. Data updates show embargo status and institutional interest
5. Users can interact with filters and time periods

This integration provides comprehensive institutional readership analytics directly on company profile pages, helping users understand which institutions are reading and analyzing company reports.
