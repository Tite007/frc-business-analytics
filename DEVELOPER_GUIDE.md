# FRC Business Analytics - Developer Guide

## 🎯 Project Purpose
**Goal**: Measure FRC report impact on stock performance
**Logic**: Compare stock price & volume BEFORE vs AFTER each FRC report

---

## 🚀 Quick Start

### Run Development
```bash
npm run dev
# Access: http://localhost:3000
# API: http://localhost:8000
```

### Test API
```bash
curl "http://localhost:8000/api/frc/company/ZEPP/metrics" | jq '.detailed_metrics[0]'
```

---

## 📊 Key API Endpoints

| Endpoint | Purpose | Key Data |
|----------|---------|----------|
| `/api/frc/company/{ticker}` | Company info | `company_name`, `reports_count` |
| `/api/frc/company/{ticker}/metrics` | Report performance | `frc_30_day_analysis` |
| `/api/frc/companies` | Company list | Array of companies |

### Critical Data Structure
```json
{
  "frc_30_day_analysis": {
    "price_on_release": 40.0,
    "price_after_30_days": 46.6,
    "avg_volume_pre_30_days": 583176,
    "avg_volume_post_30_days": 453069,
    "volume_change_pre_post_30_days_pct": -22.31
  }
}
```

---

## 🎨 Design Standards

### Colors
- **Blue**: `#3b82f6` (primary)
- **Green**: `#10b981` (gains)
- **Red**: `#ef4444` (losses)
- **Gray**: `#f8fafc` (backgrounds)

### Component Structure
```javascript
"use client";
import { useState, useEffect } from "react";

export default function ComponentName({ ticker }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Always handle: loading, error, no data
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return <div className="bg-white rounded-lg border">{/* content */}</div>;
}
```

---

## 🔧 Data Patterns

### Sort Reports Chronologically
```javascript
const sortedReports = [...reports].sort((a, b) => {
  return new Date(a.publication_date) - new Date(b.publication_date);
});
```

### Data Transformation (in hooks, not components)
```javascript
const transformedMetrics = apiData.map((report, index) => ({
  "Report Title": report.report_title,
  "Price Change": report.frc_30_day_analysis?.price_change_30_days_pct || 0,
  "Volume Change": report.frc_30_day_analysis?.volume_change_pre_post_30_days_pct || 0,
  chronologicalOrder: index + 1,
  _raw: report // Keep original for advanced use
}));
```

### Error Handling
```javascript
try {
  const response = await getCompanyData(ticker, "metrics");
  if (response.error) {
    setError(response.message);
  } else if (response.success) {
    setData(response.detailed_metrics);
  }
} catch (err) {
  setError(`Failed to load: ${err.message}`);
}
```

---

## 📁 File Organization

```
src/
├── components/
│   ├── company/          # Single company components
│   ├── companies/        # Multi-company components
│   └── charts/           # Chart components
├── hooks/
│   └── useCompanyData.js # Main data fetching
├── lib/
│   └── api.js           # API functions
└── app/
    └── [company]/       # Company pages
```

---

## ✅ Development Checklist

**Before starting:**
- [ ] Check API response structure with curl
- [ ] Understand what data you need to display
- [ ] Look at similar existing components

**Implementation:**
- [ ] Handle loading/error/empty states
- [ ] Use correct API field names (`avg_volume_pre_30_days` not `pre_30_day_avg_volume`)
- [ ] Sort reports chronologically
- [ ] Apply standard colors and styling
- [ ] Test with real data, not hardcoded values

**Before submitting:**
- [ ] No console.logs in production code
- [ ] Works on mobile and desktop
- [ ] Follows existing component patterns
- [ ] Handles edge cases (no data, API errors)

---

## 🚨 Common Issues

**Volume shows 0**: Wrong field names
```javascript
// ❌ Wrong
const volume = frc30.pre_30_day_avg_volume;

// ✅ Correct
const volume = frc30.avg_volume_pre_30_days;
```

**Reports in wrong order**: Not sorting by date
```javascript
// ✅ Always sort first
const sorted = reports.sort((a, b) => new Date(a.publication_date) - new Date(b.publication_date));
```

**Crashes on API errors**: No error handling
```javascript
// ✅ Always check for errors
if (response.error) {
  setError(response.message);
  return;
}
```

---

## 🎯 Key Business Logic

### Report Impact Analysis
1. **Get report publication date**
2. **Calculate 30 days before** (baseline period)
3. **Calculate 30 days after** (impact period)
4. **Compare price/volume** between periods
5. **Show percentage change**

### Chronological Ordering
- **#1** = Oldest report (first FRC coverage)
- **#2** = Second oldest report
- **#3** = Third oldest report
- Ignore database IDs, use publication date

### Data Display Priority
1. **Price impact** (most important)
2. **Volume impact** (secondary)
3. **Report details** (context)
4. **Chronological order** (timeline)

---

## 💡 Quick Commands

```bash
# Check API structure
curl "http://localhost:8000/api/frc/company/ZEPP/metrics" | jq '.detailed_metrics[0].frc_30_day_analysis'

# Start development
npm run dev

# Build production
npm run build

# Check for unused imports
npm run lint
```

---

## 🎯 Success Criteria

A feature is ready when:
1. **Shows real API data** (not hardcoded)
2. **Handles errors gracefully** (doesn't crash)
3. **Looks consistent** with existing design
4. **Works on mobile**
5. **Reports are chronologically ordered**
6. **Performance data is accurate**

---

**Remember**: Keep it simple. Focus on displaying the data clearly. Follow existing patterns. When in doubt, check how other components handle similar data.