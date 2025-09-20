# FRC Business Analytics PDF Export System Documentation

## Overview

The FRC Business Analytics platform includes a comprehensive PDF export system that generates professional investment research reports. This documentation covers the design patterns, data structures, and implementation details for the `professionalPdfExport.js` system.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Structures](#data-structures)
3. [PDF Sections](#pdf-sections)
4. [Design Patterns](#design-patterns)
5. [Component Integration](#component-integration)
6. [Styling Guidelines](#styling-guidelines)
7. [Development Guide](#development-guide)
8. [Troubleshooting](#troubleshooting)

## Architecture Overview

### File Structure
```
src/
├── utils/
│   └── professionalPdfExport.js     # Main PDF generation logic
├── components/
│   ├── company/
│   │   ├── PDFExportButton.jsx      # Export trigger component
│   │   ├── CompanyMetrics.jsx       # Performance metrics source
│   │   └── BloombergReadershipTable.jsx # Bloomberg data source
│   └── charts/
│       └── AdvancedFRCChart.jsx     # Chart component for export
```

### Technology Stack
- **jsPDF**: Core PDF generation library (v3.0.3+)
- **html2canvas**: Chart capture for PDF embedding
- **React**: Component framework for data sources

## Data Structures

### Main Export Function Parameters
```javascript
exportProfessionalCompanyReport(data, ticker, options)
```

**Parameters:**
- `data`: Object containing all component data
- `ticker`: Company ticker symbol (string)
- `options`: Configuration options (object)

### Data Object Structure
```javascript
const data = {
  companyData: {
    company_name: "Company Name",
    ticker: "TICKER",
    exchange: "TSX",
    currency: "CAD",
    country: "Canada",
    reports_count: 5,
    status: "success", // or "frc_covered_no_digital_reports"
    frc_covered: true,
    stock_data_points: 1500,
    first_report_date: "2022-12-13",
    last_report_date: "2025-09-19"
  },
  metricsData: [
    {
      "Report Number": 1,
      "Report Title": "Investment Analysis Report",
      "Publication Date": "2024-01-15",
      "Price on Release": 25.50,
      "Price After 30 Days": 27.80,
      "Price Change 30 Days (%)": 9.02,
      "Volume Change 30 Days (%)": 15.5,
      "Avg Volume Pre 30 Days": 50000,
      "Avg Volume Post 30 Days": 57750,
      "_raw": {
        "frc_30_day_analysis": {
          "price_on_release": 25.50,
          "price_after_30_days": 27.80,
          "price_change_30_days_pct": 9.02,
          "volume_change_30_days_pct": 15.5
        }
      }
    }
  ],
  chartData: {
    chart_data: [...], // Chart data for visualization
    reports_coverage: {...} // Report coverage information
  },
  analysisData: "AI-generated investment analysis text...",
  bloombergData: {
    revealed_records: [...], // Individual readership records
    embargoed_records: [...], // Embargoed readership records
    institutional_records: [...], // Fallback records array
    summary: {
      total_records: 147,
      revealed_records: 104,
      embargoed_records: 43,
      unique_institutions: 66
    }
  }
}
```

## PDF Sections

The PDF report consists of 6 main sections, generated in sequence:

### 1. Professional Header (`addHeader`)
**Purpose**: Company branding and identification

**Components**:
- FRC logo with error handling
- Company name and ticker in header
- Market information (exchange, currency, country)
- Report generation date
- Professional color scheme

**Design Elements**:
- Navy header background (`colors.primary`)
- Blue accent line (`colors.accent`)
- White text on dark background
- Logo positioning and sizing

### 2. Data Coverage Section (`addDataCoverageSection`)
**Purpose**: Show data coverage timeline

**Components**:
- Date range banner (start date to end date)
- Coverage period in days
- Professional rounded rectangle styling

**Data Sources**:
- `companyData.first_report_date`
- `companyData.last_report_date`
- `metricsData[0]["Publication Date"]` (fallback)
- Default: "2022-12-13" to current date

### 3. Chart Section (`addChartSection`)
**Purpose**: Embed interactive charts

**Process**:
1. Wait for chart rendering (2 second delay)
2. Search for chart elements using multiple selectors
3. Capture chart using html2canvas
4. Embed in PDF with size constraints
5. Show placeholder if capture fails

**Chart Selectors**:
```javascript
const chartSelectors = [
  ".js-plotly-plot",
  '[data-testid="chart-container"]',
  ".chart-container",
  "canvas",
  ".recharts-wrapper"
];
```

### 4. Performance Analytics (`addMetricsTable`)
**Purpose**: Display performance metrics matching CompanyMetrics component

**Features**:
- Summary cards (Total Reports, Avg Price Impact, Avg Volume Change, Coverage Period)
- Chronologically sorted table (oldest first)
- Enhanced data extraction from `_raw.frc_30_day_analysis`
- Color-coded performance badges
- Professional card design with rounded rectangles

**Table Structure**:
```
# | Report Details | 30 Days Before | 30 Days After | Impact Change
```

### 5. Bloomberg Institutional Readership (`addBloombergSection`)
**Purpose**: Show institutional readership data

**Data Processing**:
1. Combine `revealed_records` and `embargoed_records`
2. Group by institution for top 10 ranking
3. Calculate total reads per institution
4. Show summary statistics when individual records unavailable

**Features**:
- Summary cards (Total Reads, Institutions, Embargoed, Revealed)
- Top 10 institutions table with readership counts
- Location information (country, city)
- Recent report activity
- Status indicators (Revealed/Mixed/Embargoed)

**Fallback Behavior**:
When `institutional_records: []` is empty, shows summary message with aggregate statistics.

### 6. AI Analysis Section (`addAIAnalysisSection`)
**Purpose**: Present AI-generated investment analysis

**Features**:
- Professional header with branding
- Structured text formatting
- Section headers and bullet points
- Default analysis generation when none provided
- Text cleaning and formatting

## Design Patterns

### Color Scheme
```javascript
const colors = {
  primary: [26, 44, 69],     // Professional navy
  accent: [0, 102, 204],     // Modern blue
  text: [33, 37, 41],        // Deep charcoal
  lightText: [108, 117, 125], // Medium gray
  success: [34, 139, 34],    // Forest green
  danger: [220, 38, 38],     // Strong red
  modernGray: [248, 250, 252] // Light background
};
```

### Typography Hierarchy
- **Section Headers**: 14pt, bold, primary color
- **Subsection Headers**: 12pt, bold, primary color
- **Body Text**: 9-10pt, normal, text color
- **Labels**: 7-8pt, normal, lightText color
- **Small Text**: 6-7pt, normal, gray

### Layout Patterns
- **Margins**: 20mm on all sides
- **Content Width**: Page width minus 2x margin
- **Card Height**: 16-20mm for summary cards
- **Row Height**: 8-12mm for table rows
- **Spacing**: 10-15mm between sections

### Component Design Patterns

#### Summary Cards
```javascript
// Card structure
setFillColor(backgroundColor);
pdf.roundedRect(x, y, width, height, 2, 2, "F");
setDrawColor(borderColor);
pdf.setLineWidth(0.3);
pdf.roundedRect(x, y, width, height, 2, 2, "S");

// Value display
setColor(valueColor);
pdf.setFontSize(12);
pdf.setFont("helvetica", "bold");
pdf.text(value, x + 4, y + 8);

// Label display
pdf.setFontSize(6);
pdf.setFont("helvetica", "normal");
pdf.text(label, x + 4, y + 13);
```

#### Table Headers
```javascript
// Dark header background
setFillColor([51, 65, 85]);
pdf.rect(x, y, width, height, "F");

// White text
setColor([255, 255, 255]);
pdf.setFontSize(8);
pdf.setFont("helvetica", "bold");
```

#### Status Badges
```javascript
// Badge background
setFillColor(badgeBackgroundColor);
pdf.roundedRect(x, y, width, height, 1, 1, "F");

// Badge text
setColor(badgeTextColor);
pdf.setFontSize(5);
pdf.setFont("helvetica", "bold");
pdf.text(statusText, x + 2, y + 3);
```

## Component Integration

### CompanyMetrics Integration
The PDF Performance Analytics section mirrors the CompanyMetrics component:

**Shared Features**:
- Chronological sorting (oldest first)
- Summary statistics calculation
- Enhanced data extraction from `_raw.frc_30_day_analysis`
- Color-coded performance indicators
- Professional card layout

**Data Mapping**:
```javascript
// Enhanced data extraction
const rawReport = report._raw || report;
const frc30 = rawReport.frc_30_day_analysis || {};

const priceOnRelease = frc30.price_on_release || report["Price on Release"];
const priceAfter30Days = frc30.price_after_30_days || report["Price After 30 Days"];
const priceChange30d = frc30.price_change_30_days_pct || report["Price Change 30 Days (%)"];
```

### BloombergReadershipTable Integration
The PDF Bloomberg section matches the table component:

**Shared Features**:
- Data structure handling (`revealed_records` + `embargoed_records`)
- Institution grouping and ranking
- Summary statistics display
- Status indicators (Revealed/Embargoed)
- Location information display

**Data Processing**:
```javascript
// Combine records like the component
if (bloombergData.revealed_records) {
  records = [...bloombergData.revealed_records];
}
if (bloombergData.embargoed_records) {
  records = [...records, ...bloombergData.embargoed_records];
}

// Group by institution
const institutionGroups = {};
records.forEach(record => {
  const institution = record.customer_name || "Unknown Institution";
  if (!institutionGroups[institution]) {
    institutionGroups[institution] = {
      name: institution,
      total_reads: 0,
      records: []
    };
  }
  institutionGroups[institution].records.push(record);
  institutionGroups[institution].total_reads++;
});
```

## Styling Guidelines

### Professional Standards
1. **Consistency**: Use defined color palette throughout
2. **Hierarchy**: Clear visual hierarchy with typography
3. **Spacing**: Consistent margins and padding
4. **Alignment**: Proper text and element alignment
5. **Branding**: FRC branding elements and colors

### Best Practices
1. **Error Handling**: Always include fallbacks for missing data
2. **Responsive Design**: Handle varying content lengths
3. **Performance**: Optimize chart capture and processing
4. **Accessibility**: Use readable fonts and colors
5. **Pagination**: Proper page breaks and content flow

### Color Usage Guidelines
- **Primary**: Headers, important text, branding
- **Accent**: Links, highlights, secondary elements
- **Success**: Positive performance, revealed status
- **Danger**: Negative performance, warnings
- **Text**: Body content, standard information
- **LightText**: Labels, secondary information

## Development Guide

### Adding New Sections

1. **Create Section Function**:
```javascript
const addNewSection = () => {
  checkPageSpace(estimatedHeight);

  // Section header
  setColor(colors.primary);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("SECTION TITLE", margin, currentY);
  currentY += 10;

  // Section content
  // ... implementation

  currentY += 15; // Bottom spacing
};
```

2. **Add to Generation Sequence**:
```javascript
// In main function
await addHeader();
addDataCoverageSection();
await addChartSection();
addMetricsTable();
addBloombergSection();
addNewSection(); // Add here
addAIAnalysisSection();
addFooter();
```

### Modifying Existing Sections

1. **Identify Section Function**: Find the relevant `add*Section()` function
2. **Understand Data Flow**: Check data parameter usage
3. **Test with Real Data**: Use actual API responses
4. **Maintain Design Consistency**: Follow established patterns
5. **Update Documentation**: Document changes made

### Testing Guidelines

1. **Data Scenarios**:
   - Empty data sets
   - Large data sets
   - Missing optional fields
   - Error conditions

2. **Visual Testing**:
   - Page breaks and pagination
   - Text overflow and truncation
   - Chart capture success/failure
   - Color and styling consistency

3. **Integration Testing**:
   - Component data mapping
   - Real API responses
   - Different company types and statuses

## Troubleshooting

### Common Issues

#### Chart Capture Fails
**Symptoms**: "Chart not available for export" placeholder
**Solutions**:
1. Check chart selector accuracy
2. Increase wait time for chart rendering
3. Verify chart library compatibility
4. Test html2canvas configuration

#### Bloomberg Data Missing
**Symptoms**: Bloomberg section not appearing
**Solutions**:
1. Verify data structure in logs
2. Check `summary.total_records` existence
3. Ensure proper data extraction from API
4. Test with both individual records and summary-only data

#### Performance Metrics Table Empty
**Symptoms**: No metrics displayed
**Solutions**:
1. Check `metricsData` array structure
2. Verify chronological sorting
3. Test enhanced data extraction (`_raw` field)
4. Ensure proper field name mapping

#### PDF Generation Errors
**Symptoms**: PDF fails to generate or save
**Solutions**:
1. Check browser compatibility
2. Verify jsPDF version compatibility
3. Test data parameter completeness
4. Review console errors for specific issues

### Debug Mode

Add logging to track PDF generation:

```javascript
// Add at start of sections
console.log('Generating section:', 'SectionName', { data: relevantData });

// Add before data processing
console.log('Data structure:', {
  hasData: !!data,
  dataKeys: Object.keys(data || {})
});
```

### Performance Optimization

1. **Chart Capture**: Reduce wait times where possible
2. **Data Processing**: Minimize array operations
3. **Memory Usage**: Clean up large objects after use
4. **File Size**: Optimize image compression settings

## Version History

### Current Version (Latest)
- Enhanced Bloomberg institutional readership section
- Top 10 institutions by readership count
- Improved data coverage section
- CompanyMetrics component integration
- Professional design updates

### Previous Versions
- Basic Bloomberg table implementation
- Simple metrics table
- Chart capture functionality
- Initial PDF structure

## Future Enhancements

### Planned Features
1. **Interactive Elements**: Clickable links and navigation
2. **Advanced Charts**: Multiple chart types and configurations
3. **Customization Options**: User-configurable sections
4. **Export Formats**: Additional format support (Excel, Word)
5. **Batch Processing**: Multiple company reports

### Technical Improvements
1. **Performance**: Faster chart capture and processing
2. **Error Handling**: More robust error recovery
3. **Data Validation**: Enhanced input validation
4. **Testing**: Automated testing framework
5. **Documentation**: Interactive documentation with examples

---

**Last Updated**: December 2024
**Maintained By**: FRC Business Analytics Team
**Contact**: For questions or updates, refer to project documentation or team leads.