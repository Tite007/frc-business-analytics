# FRC Business Analytics - Development Standards

## 🎯 Project Overview

**Goal**: Build an enterprise-level financial analytics platform that displays FRC report impact on stock performance.

**Core Logic**: Measure trading volume and price changes BEFORE vs AFTER each FRC report to quantify market impact.

---

## 📊 Data Flow Architecture

```
API Backend (localhost:8000)
    ↓
Frontend API Layer (src/lib/api.js)
    ↓
React Hooks (src/hooks/useCompanyData.js)
    ↓
UI Components (src/components/*)
    ↓
User Interface
```

---

## 🔧 API Integration Standards

### **1. API Response Structure**

All API endpoints follow this pattern:
```json
{
  "success": true,
  "ticker": "ZEPP",
  "data": {
    // Main content here
  },
  "metadata": {
    // Additional info
  }
}
```

### **2. Key API Endpoints**

| Endpoint | Purpose | Response Structure |
|----------|---------|-------------------|
| `/api/frc/company/{ticker}` | Company profile | `{success, company: {...}}` |
| `/api/frc/company/{ticker}/metrics` | Performance data | `{success, detailed_metrics: [...]}` |
| `/api/frc/company/{ticker}/chart-data` | Stock data | `{success, chart_data: [...]}` |
| `/api/frc/companies` | Company list | `{success, companies: [...]}` |

### **3. Metrics Data Structure**

**Critical Fields in `frc_30_day_analysis`:**
```json
{
  "price_on_release": 40.0,
  "price_after_30_days": 46.6,
  "price_change_30_days_pct": 16.5,
  "avg_volume_pre_30_days": 583176,
  "avg_volume_post_30_days": 453069,
  "volume_change_pre_post_30_days_pct": -22.31
}
```

---

## 🎨 UI/UX Design Standards

### **Design Principles**
1. **Clean & Professional**: Enterprise-grade appearance
2. **Data-Focused**: Information hierarchy prioritizes metrics
3. **Consistent Colors**: Blue primary, green/red for gains/losses
4. **Responsive**: Mobile-first approach

### **Component Structure**
```
src/components/
├── company/              # Company-specific components
├── companies/            # Multi-company components
├── charts/              # Chart components
├── ui/                  # Reusable UI elements
└── layout/              # Navigation, headers, etc.
```

### **Color Palette**
```css
/* Primary Colors */
--blue-primary: #3b82f6
--blue-secondary: #1e40af

/* Status Colors */
--green-positive: #10b981  /* Gains */
--red-negative: #ef4444   /* Losses */
--orange-neutral: #f59e0b /* Neutral/Mixed */

/* Background */
--gray-background: #f8fafc
--white-cards: #ffffff
```

---

## 📁 File Organization Standards

### **Component Naming**
- **PascalCase**: `CompanyMetrics.jsx`
- **Descriptive**: `FRCCoverageImpactAnalysis.jsx`
- **Feature-based**: Group by functionality, not file type

### **Hook Naming**
- **Prefix with `use`**: `useCompanyData.js`
- **Single responsibility**: One data source per hook
- **Clear purpose**: `useBloombergData.js`, `useChartData.js`

### **API Function Naming**
```javascript
// Good
getCompanyData(ticker, "metrics")
getBloombergReadership(ticker)
getChartData(ticker)

// Bad
fetchData(ticker, type)
getData(id)
getStuff(params)
```

---

## 🔄 Data Transformation Patterns

### **1. API Response → Component Props**

**Pattern**: Transform API data in hooks, not components
```javascript
// ✅ Good - Transform in hook
const transformedMetrics = apiData.map(report => ({
  "Report Number": report.report_id,
  "Report Title": report.report_title,
  "Price Change": report.frc_30_day_analysis?.price_change_30_days_pct,
  // Raw data for advanced use
  _raw: report
}));

// ❌ Bad - Transform in component
{reports.map(r => r.frc_30_day_analysis.price_change_30_days_pct)}
```

### **2. Chronological Sorting**
**Always sort reports by date (oldest first)**:
```javascript
const sortedReports = [...reports].sort((a, b) => {
  return new Date(a["Publication Date"]) - new Date(b["Publication Date"]);
});
```

### **3. Data Validation**
**Always provide fallbacks**:
```javascript
const price = frc30.price_on_release || report["Price on Release"] || 0;
const volume = frc30.avg_volume_pre_30_days || 0;
```

---

## 🧪 Testing Standards

### **1. Component Testing Focus**
- **Data rendering**: Does the component display API data correctly?
- **Error states**: How does it handle missing/invalid data?
- **User interactions**: Do buttons, tabs, filters work?

### **2. API Testing Focus**
- **Response structure**: Does API return expected format?
- **Error handling**: 404s, timeouts, invalid tickers
- **Data integrity**: Are calculations correct?

### **3. Simple Test Examples**
```javascript
// Test data display
expect(screen.getByText("$40.00")).toBeInTheDocument();

// Test error handling
expect(screen.getByText("No data available")).toBeInTheDocument();

// Test sorting
expect(reports[0].chronologicalOrder).toBe(1);
```

---

## 🚀 Development Workflow

### **1. Before Starting a Feature**
1. **Understand the goal**: What business problem are we solving?
2. **Check the API**: What data is available? What format?
3. **Review existing patterns**: How do similar features work?
4. **Plan the component**: What props, what state, what logic?

### **2. Implementation Steps**
1. **API Integration**: Get the data flowing
2. **Basic Display**: Show the data (ugly is fine initially)
3. **Apply Standards**: Use design system, error handling
4. **Test & Polish**: Edge cases, responsive design

### **3. Code Review Checklist**
- [ ] Follows naming conventions
- [ ] Uses consistent styling/colors
- [ ] Handles loading/error states
- [ ] Has proper data validation
- [ ] Includes meaningful comments
- [ ] No console.logs in production

---

## 📋 Common Patterns & Examples

### **1. Standard Component Structure**
```javascript
"use client";
import { useState, useEffect } from "react";
import { getCompanyData } from "@/lib/api";

export default function ComponentName({ ticker, className = "" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data
  }, [ticker]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return <NoDataMessage />;

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Component content */}
    </div>
  );
}
```

### **2. Standard Table Structure**
```javascript
<table className="w-full border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-100">
      <th className="border border-gray-300 px-4 py-3 text-left">Column</th>
    </tr>
  </thead>
  <tbody>
    {sortedData.map((item, index) => (
      <tr key={index} className="hover:bg-gray-50">
        <td className="border border-gray-300 px-4 py-3">{item.value}</td>
      </tr>
    ))}
  </tbody>
</table>
```

### **3. Standard Error Handling**
```javascript
try {
  const response = await getCompanyData(ticker, "metrics");
  if (response.error) {
    setError(response.message);
  } else if (response.success) {
    setData(response.detailed_metrics);
  }
} catch (err) {
  setError(`Failed to load data: ${err.message}`);
}
```

---

## 🎯 Key Metrics to Display

### **Financial Impact**
- Price on release vs. 30 days after
- Volume before vs. after (30-day averages)
- Percentage changes for both

### **Report Information**
- Chronological order (#1, #2, #3...)
- Publication date
- Report title
- Report type (PDF/Digital)

### **Performance Summary**
- Total reports count
- Average price impact
- Average volume impact
- Success rate (positive impacts)

---

## 🔧 Quick Reference Commands

### **Development**
```bash
# Start development server
npm run dev

# Check API response
curl -s "http://localhost:8000/api/frc/company/ZEPP/metrics" | jq '.'

# Run tests
npm test

# Build for production
npm run build
```

### **Common Debug Steps**
1. **Check API response**: Use curl or browser dev tools
2. **Console.log the data**: See what's actually being passed
3. **Check network tab**: Verify API calls are successful
4. **Validate data structure**: Ensure field names match expectations

---

## 📝 Documentation Standards

### **Component Documentation**
```javascript
/**
 * CompanyMetrics - Displays FRC report performance analysis
 *
 * @param {string} ticker - Company ticker symbol (e.g., "ZEPP")
 * @param {Array} metrics - Array of report metrics from API
 * @param {string} currency - Currency code (e.g., "USD")
 * @param {number} totalReports - Total number of reports
 *
 * Shows chronologically ordered reports with before/after analysis
 */
```

### **API Function Documentation**
```javascript
/**
 * Get company performance metrics
 *
 * @param {string} ticker - Company ticker
 * @param {string} endpoint - API endpoint type ("metrics", "chart", etc.)
 * @returns {Object} API response with success/error status
 */
```

---

## 🎯 Success Criteria

A feature is complete when:
1. **Data displays correctly** from real API
2. **Follows design standards** (colors, layout, typography)
3. **Handles edge cases** (loading, errors, empty data)
4. **Works on mobile** and desktop
5. **Code is clean** and follows patterns
6. **Tests pass** (if applicable)

---

## 🚨 Red Flags to Avoid

- **Hardcoded data** instead of API integration
- **Inconsistent styling** (different colors, fonts, spacing)
- **Missing error handling** (blank screens on failure)
- **Console errors** in browser dev tools
- **Poor mobile experience** (horizontal scrolling, tiny text)
- **Overly complex logic** (keep it simple and clear)

---

**Remember**: The goal is to build a professional financial analytics platform. Every component should feel like it belongs to the same cohesive application. When in doubt, prioritize clarity and consistency over complexity.