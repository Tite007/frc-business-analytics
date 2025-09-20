# 📋 API Endpoints List

## Base URL

```
http://127.0.0.1:8000
```

## Interactive Documentation

```
http://127.0.0.1:8000/docs
```

## Core API Endpoints

### 1. Companies List

**GET** `/api/frc/companies`

Get list of all FRC-covered companies with filtering options.

**Parameters:**

- `exchange` (optional): Filter by exchange (NASDAQ, TSX, NEO, NYSE)
- `currency` (optional): Filter by currency (USD, CAD)
- `has_reports` (optional): Filter companies with reports (true/false)
- `has_stock_data` (optional): Filter companies with stock data (true/false)
- `limit` (optional): Limit number of results
- `offset` (optional): Pagination offset

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/companies?exchange=NASDAQ&has_reports=true&limit=10"
```

**Example Response:**

```json
[
  {
    "ticker": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ",
    "currency": "USD",
    "frc_covered": true,
    "has_reports": true,
    "has_stock_data": true,
    "sector": "Technology",
    "industry": "Consumer Electronics"
  }
]
```

### 2. Company Details

**GET** `/api/frc/company/{ticker}`

Get detailed information for a specific company.

**Parameters:**

- `ticker` (required): Company ticker symbol

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/company/AAPL"
```

**Example Response:**

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc.",
  "exchange": "NASDAQ",
  "currency": "USD",
  "frc_covered": true,
  "has_reports": true,
  "has_stock_data": true,
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "market_cap": 3000000000000,
  "description": "Apple Inc. designs, manufactures, and markets consumer electronics..."
}
```

### 3. Interactive Charts

**GET** `/api/frc/chart/{ticker}`

Get interactive chart data for stock visualization.

**Parameters:**

- `ticker` (required): Company ticker symbol
- `period` (optional): Time period (1y, 6m, 3m, 1m) - default: 1y
- `interval` (optional): Data interval (1d, 1wk, 1mo) - default: 1d

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/chart/AAPL?period=6m&interval=1d"
```

**Example Response:**

```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "currency": "USD",
  "data": {
    "2024-01-01": {
      "open": 185.64,
      "high": 186.95,
      "low": 185.13,
      "close": 185.92,
      "volume": 46311900
    },
    "2024-01-02": {
      "open": 186.54,
      "high": 188.44,
      "low": 185.55,
      "close": 187.68,
      "volume": 37149570
    }
  },
  "chart_config": {
    "title": "AAPL Stock Price",
    "xaxis_title": "Date",
    "yaxis_title": "Price (USD)"
  }
}
```

### 4. Performance Metrics

**GET** `/api/frc/metrics/{ticker}`

Get key performance metrics and financial ratios.

**Parameters:**

- `ticker` (required): Company ticker symbol
- `period` (optional): Annual, quarterly data
- `years` (optional): Number of years to include

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/metrics/AAPL"
```

**Example Response:**

```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "metrics": [
    {
      "metric_name": "Revenue Growth",
      "value": 8.2,
      "unit": "%",
      "period": "TTM"
    },
    {
      "metric_name": "P/E Ratio",
      "value": 28.5,
      "unit": "x",
      "period": "Current"
    },
    {
      "metric_name": "ROE",
      "value": 166.8,
      "unit": "%",
      "period": "TTM"
    },
    {
      "metric_name": "Debt to Equity",
      "value": 1.73,
      "unit": "x",
      "period": "Current"
    }
  ],
  "last_updated": "2024-08-27T10:30:00Z"
}
```

### 5. AI Analysis

**GET** `/api/frc/analysis/{ticker}`

Get AI-generated analysis and insights for the company.

**Parameters:**

- `ticker` (required): Company ticker symbol
- `format` (optional): Response format (text, markdown, html) - default: text

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/analysis/AAPL"
```

**Example Response:**

```json
{
  "ticker": "AAPL",
  "company_name": "Apple Inc.",
  "analysis": {
    "summary": "Apple continues to demonstrate strong financial performance with consistent revenue growth and robust cash generation...",
    "strengths": [
      "Strong brand loyalty and ecosystem",
      "Consistent cash flow generation",
      "Innovation in product development"
    ],
    "concerns": [
      "High valuation multiples",
      "Dependence on iPhone revenue",
      "Regulatory pressures"
    ],
    "recommendation": "BUY",
    "target_price": 200.0,
    "risk_level": "Medium"
  },
  "generated_at": "2024-08-27T10:30:00Z",
  "model_used": "GPT-4"
}
```

### 6. Search Companies

**GET** `/api/frc/search`

Search companies by name, ticker, or other criteria.

**Parameters:**

- `q` (required): Search query
- `limit` (optional): Limit results - default: 20
- `include_covered_only` (optional): Include only FRC-covered companies - default: true

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/search?q=apple&limit=5"
```

**Example Response:**

```json
{
  "query": "apple",
  "results": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "exchange": "NASDAQ",
      "relevance_score": 0.98,
      "match_type": "name"
    }
  ],
  "total_results": 1
}
```

### 7. Database Statistics

**GET** `/api/frc/stats`

Get overview statistics about the database and available data.

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/stats"
```

**Example Response:**

```json
{
  "total_companies": 122,
  "frc_covered_companies": 66,
  "companies_with_reports": 66,
  "companies_with_stock_data": 115,
  "exchanges": {
    "NASDAQ": 44,
    "TSX": 29,
    "NEO": 29,
    "NYSE": 4,
    "Other": 16
  },
  "currencies": {
    "USD": 52,
    "CAD": 70
  },
  "last_updated": "2024-08-27T10:30:00Z"
}
```

## Advanced Endpoints

### 8. Company Reports

**GET** `/api/frc/reports/{ticker}`

Get detailed financial reports and filings.

**Parameters:**

- `ticker` (required): Company ticker symbol
- `report_type` (optional): Type of report (annual, quarterly, earnings)
- `year` (optional): Specific year
- `limit` (optional): Number of reports to return

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/reports/AAPL?report_type=annual&limit=3"
```

### 9. Sector Analysis

**GET** `/api/frc/sector/{sector}`

Get analysis and companies within a specific sector.

**Parameters:**

- `sector` (required): Sector name (Technology, Healthcare, Finance, etc.)
- `include_metrics` (optional): Include aggregated metrics - default: false

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/sector/Technology?include_metrics=true"
```

### 10. Peer Comparison

**GET** `/api/frc/compare/{ticker}`

Compare a company with its industry peers.

**Parameters:**

- `ticker` (required): Primary company ticker
- `peers` (optional): Comma-separated list of peer tickers
- `metrics` (optional): Specific metrics to compare

**Example Request:**

```bash
curl "http://127.0.0.1:8000/api/frc/compare/AAPL?peers=MSFT,GOOGL&metrics=pe_ratio,revenue_growth"
```

## Quick Test Commands

### Test API Connection

```bash
# Test if API is running
curl -I http://127.0.0.1:8000/api/frc/stats

# Get first 5 companies
curl "http://127.0.0.1:8000/api/frc/companies?limit=5"
```

### Test Specific Company Data

```bash
# Replace AAPL with any available ticker
TICKER="AAPL"

# Get company details
curl "http://127.0.0.1:8000/api/frc/company/$TICKER"

# Get chart data
curl "http://127.0.0.1:8000/api/frc/chart/$TICKER"

# Get metrics
curl "http://127.0.0.1:8000/api/frc/metrics/$TICKER"

# Get AI analysis
curl "http://127.0.0.1:8000/api/frc/analysis/$TICKER"
```

### Test Search Functionality

```bash
# Search for technology companies
curl "http://127.0.0.1:8000/api/frc/search?q=technology"

# Search for specific ticker
curl "http://127.0.0.1:8000/api/frc/search?q=AAPL"
```

## Data Availability Summary

### ✅ Available Data (122 Companies Total)

**By Coverage:**

- **66 Companies** with FRC reports and AI analysis
- **115 Companies** with stock data and interactive charts
- **122 Companies** with basic company information

**By Exchange:**

- **NASDAQ**: 44 companies
- **TSX (Toronto)**: 29 companies
- **NEO (Neo Exchange)**: 29 companies
- **NYSE**: 4 companies
- **Other exchanges**: 16 companies

**By Currency:**

- **USD**: 52 companies
- **CAD**: 70 companies

### Sample Available Tickers

**NASDAQ (USD):**

- AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META, NFLX

**TSX (CAD):**

- SHOP.TO, CNR.TO, RY.TO, TD.TO, BNS.TO

**High-Data Companies (Reports + Charts + Analysis):**

- Apple (AAPL), Microsoft (MSFT), Shopify (SHOP.TO)
- Royal Bank of Canada (RY.TO), Canadian National Railway (CNR.TO)

## Error Handling

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (invalid parameters)
- **404**: Not Found (company/endpoint doesn't exist)
- **500**: Internal Server Error

### Example Error Response

```json
{
  "error": "Company not found",
  "message": "No company found with ticker 'INVALID'",
  "status_code": 404
}
```

## Rate Limiting

- Current implementation: No rate limiting
- Recommended for production: 100 requests per minute per IP

## Authentication

- Current implementation: No authentication required
- For production: Consider API key authentication

This comprehensive API provides all the data needed to build a robust financial analytics frontend with real-time data, interactive charts, and AI-powered insights!
