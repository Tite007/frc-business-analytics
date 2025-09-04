# Dynamic Financial Report System

A comprehensive system for generating dynamic financial reports with PDF export capabilities. This system transforms your static financial report template into a dynamic, data-driven component that can generate professional PDFs.

## Features

- 🎨 **Dynamic Content**: All text, data, and content is driven by data props
- 📄 **PDF Export**: Generate professional PDFs with proper formatting
- 🖨️ **Print Support**: Print-optimized layouts
- 📊 **Flexible Data Structure**: Structured data format for all report components
- 🎯 **TypeScript Ready**: Full type definitions for data structures
- 📱 **Responsive Design**: Works on different screen sizes
- 🔧 **Customizable**: Easy to modify and extend

## Quick Start

### 1. Basic Usage

```jsx
import { DynamicFinancialReport } from "@/components/DynamicFinancialReport";
import { sampleReportData } from "@/lib/financialReportData";

function MyReportPage() {
  const handleExportPDF = (data, paperSize) => {
    // Your PDF export logic
    console.log("Exporting PDF with data:", data);
  };

  return (
    <DynamicFinancialReport
      reportData={sampleReportData}
      onExportPDF={handleExportPDF}
      onPrint={(data, paperSize) => window.print()}
    />
  );
}
```

### 2. Creating Custom Report Data

```jsx
import { createEmptyReportData, validateReportData } from "@/lib/financialReportData";

// Create a new empty report
const newReport = createEmptyReportData();

// Customize with your data
newReport.company.name = "Apple Inc.";
newReport.company.ticker = "(NASDAQ: AAPL)";
newReport.company.sector = "Technology";
newReport.title = "Strong Q4 Performance Drives Growth";

// Add highlights
newReport.highlights = [
  "Revenue exceeded expectations, rising 8% YoY to $94.9B",
  "iPhone 16 series showing strong adoption rates"
];

// Add main points
newReport.mainPoints = [
  {
    title: "Strong Product Cycle:",
    content: "iPhone 16 series launch has been Apple's most successful in three years..."
  }
];

// Validate the data
const validation = validateReportData(newReport);
if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
}
```

## Data Structure

The report data follows a structured format:

```javascript
{
  reportDate: "August 31, 2025",
  company: {
    name: "Company Name",
    ticker: "(EXCHANGE: TICK)",
    sector: "Industry Sector"
  },
  recommendation: {
    rating: "BUY", // BUY, SELL, HOLD
    currentPrice: "US$175.25",
    fairValue: "US$200.00",
    risk: "2" // 1-5 scale
  },
  title: "Report Title",
  author: {
    name: "Analyst Name, CFA",
    title: "Senior Analyst"
  },
  highlights: ["Array of key highlights"],
  mainPoints: [
    {
      title: "Point Title:",
      content: "Point content..."
    }
  ],
  // ... additional fields
}
```

## Components

### DynamicFinancialReport
The main component that renders the financial report.

**Props:**
- `reportData` (object): The report data structure
- `onExportPDF` (function): Callback for PDF export
- `onPrint` (function): Callback for printing

### PDFReportLayout_Dynamic
A wrapper component that provides backward compatibility with existing code.

## Utilities

### Data Management
- `createEmptyReportData()`: Creates an empty report template
- `validateReportData(data)`: Validates report data structure
- `sampleReportData`: Sample data for testing

### HTML Generation
- `generateFinancialReportHTML(data, paperSize)`: Generates HTML for display
- `generatePDFOptimizedHTML(data, paperSize)`: Generates PDF-optimized HTML

### API Integration
- `generateCompleteReport(ticker, analystInput)`: Complete workflow for report generation
- `downloadReportPDF(reportData, paperSize)`: Download PDF functionality

## PDF Export Setup

### Option 1: Using Puppeteer (Recommended)

1. Install dependencies:
```bash
npm install puppeteer
```

2. Use the provided API endpoint (`/api/generate-pdf`) or create your own.

### Option 2: Client-side PDF Generation

```jsx
import { generatePDFOptimizedHTML } from "@/lib/reportHTMLGenerator";

const exportToPDF = async (reportData, paperSize) => {
  const htmlContent = generatePDFOptimizedHTML(reportData, paperSize);
  
  // Open in new window for user to save as PDF
  const newWindow = window.open();
  newWindow.document.write(htmlContent);
  newWindow.document.close();
};
```

## API Integration

The system includes comprehensive API integration utilities:

```jsx
import { useFinancialReport } from "@/lib/reportAPI";

function ReportGenerator() {
  const { reportData, loading, generateReport, exportToPDF } = useFinancialReport("AAPL");

  const handleGenerate = async () => {
    const analystInput = {
      recommendation: "BUY",
      fairValue: "200.00",
      reportTitle: "Strong Q4 Performance",
      highlights: ["Revenue growth", "Market expansion"]
    };
    
    await generateReport(analystInput);
  };

  return (
    <div>
      {loading ? (
        <div>Generating report...</div>
      ) : (
        <DynamicFinancialReport
          reportData={reportData}
          onExportPDF={(data, size) => exportToPDF(size)}
        />
      )}
    </div>
  );
}
```

## File Structure

```
src/
├── components/
│   ├── DynamicFinancialReport.jsx     # Main report component
│   └── PDFReportLayout_Dynamic.jsx    # Backward compatibility wrapper
├── lib/
│   ├── financialReportData.js         # Data structures and validation
│   ├── reportHTMLGenerator.js         # HTML generation utilities
│   └── reportAPI.js                   # API integration utilities
├── app/
│   ├── financial-report-demo/
│   │   └── page.jsx                   # Demo page
│   └── api/
│       └── generate-pdf/
│           └── route.js               # PDF generation API
```

## Examples

### 1. Demo Page
Visit `/financial-report-demo` to see a complete example with:
- Live preview
- Data structure viewer
- HTML generation
- Usage examples

### 2. Integration with Existing Code
Replace your existing `PDFReportLayout` imports:

```jsx
// Old
import PDFReportLayout from "@/components/PDFReportLayout";

// New
import PDFReportLayout from "@/components/PDFReportLayout_Dynamic";
```

### 3. Custom Data Sources
```jsx
// Fetch data from your API
const fetchReportData = async (companyId) => {
  const response = await fetch(`/api/reports/${companyId}`);
  return response.json();
};

// Use in component
const [reportData, setReportData] = useState(null);

useEffect(() => {
  fetchReportData("123").then(setReportData);
}, []);
```

## Customization

### Adding New Fields
1. Update the data structure in `financialReportData.js`
2. Modify the component in `DynamicFinancialReport.jsx`
3. Update the HTML generator in `reportHTMLGenerator.js`

### Styling Changes
- Modify the Tailwind classes in `DynamicFinancialReport.jsx`
- Update the CSS in `reportHTMLGenerator.js` for PDF export

### New Paper Sizes
Add to the `paperSizes` array in `DynamicFinancialReport.jsx`:

```jsx
const paperSizes = [
  { name: "Letter", width: 8.5, height: 11, unit: "in" },
  { name: "A4", width: 210, height: 297, unit: "mm" },
  { name: "Custom", width: 9, height: 12, unit: "in" }, // Add your size
];
```

## Production Considerations

1. **PDF Service**: Use a production-ready PDF service like Puppeteer, PDFShift, or similar
2. **Caching**: Cache generated reports for performance
3. **Validation**: Always validate incoming data
4. **Error Handling**: Implement comprehensive error handling
5. **Security**: Sanitize HTML content for security

## Support

For questions or issues, refer to the demo page at `/financial-report-demo` which includes:
- Live examples
- Data structure reference
- Usage patterns
- Integration guides
