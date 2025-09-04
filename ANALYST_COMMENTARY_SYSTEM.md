# Analyst Commentary System Documentation

## Overview

The Enhanced PDF Report Layout now includes a **professional left sidebar commentary system** that matches institutional research report standards. This system automatically extracts analyst commentary from content blocks and displays them in a structured sidebar alongside the main report content.

## Features

### 1. **Left Sidebar Layout**

- **30% width allocation** for analyst commentary
- **70% width allocation** for main content
- Professional styling with FRC branding colors
- Print-optimized spacing and typography

### 2. **Intelligent Commentary Extraction**

The system automatically identifies and categorizes analyst commentary from:

#### **Rich Text Blocks**

- Scans for keywords: "investment thesis", "key risks", "catalysts", "valuation"
- Extracts relevant text content (200-250 character summaries)
- Categorizes into professional sections

#### **Analyst Notes Blocks**

- Processes detailed analyst commentary
- Creates structured sidebar notes
- Links back to main content sections

### 3. **Commentary Categories**

#### **Investment Thesis**

- Key investment rationale
- Value proposition
- Strategic advantages
- **Styling**: Blue accent (#1e40af)

#### **Key Catalysts**

- Growth drivers
- Near-term opportunities
- Positive developments
- **Styling**: Green accent (#059669)

#### **Key Risks**

- Primary risk factors
- Market concerns
- Operational challenges
- **Styling**: Yellow/Orange accent (#d97706)

#### **Valuation**

- Methodology overview
- Key assumptions
- Price target rationale
- **Styling**: Purple accent (#7c3aed)

#### **Financial Performance**

- Results analysis
- Trend commentary
- Metric explanations
- **Styling**: Indigo accent (#4338ca)

## Implementation

### Data Structure

```javascript
analystComments: [
  {
    section: "investment-thesis",
    title: "Investment Thesis",
    text: "Commentary text content...",
    reference: "Reference to main content",
  },
  {
    section: "catalysts",
    title: "Key Catalysts",
    text: "Catalyst description...",
    reference: "Growth outlook",
  },
  // ... additional comments
];
```

### Automatic Extraction Logic

```javascript
// Keywords trigger automatic categorization:
'investment thesis' → Investment Thesis section
'key risk' → Key Risks section
'catalyst' → Key Catalysts section
'valuation' → Valuation section
'financial performance' → Financial Performance section
```

### Professional Styling

```css
/* Sidebar container */
.analyst-sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 12px;
}

/* Individual comments */
.sidebar-comment {
  background: color-coded backgrounds
  border-left: 2px solid matching accent
  padding: 8px;
  border-radius: 4px;
}
```

## Usage Instructions

### 1. **Content Creation**

When writing content in rich text blocks, include keywords to trigger automatic categorization:

**Example:**

```
Investment Thesis: The company's strong moat in COPPA-compliant advertising...

Key Risks: Regulatory changes affecting digital advertising to children...

Catalysts: Expected normalization of advertiser spending patterns...
```

### 2. **Manual Commentary**

For more control, use the Analyst Notes Content block type to add specific commentary that will appear in the sidebar.

### 3. **PDF Generation**

The commentary system is automatically activated when:

- Viewing in "PDF Layout" mode
- Generating printable PDFs
- Exporting final reports

## Professional Standards

### Typography

- **Sidebar**: 10pt body text, 11pt headings
- **Categories**: Color-coded with professional accent colors
- **References**: Italic, smaller font for source attribution

### Layout

- **Responsive**: Adapts to Letter (8.5"×11"), A4 (210×297mm), Legal (8.5"×14") formats
- **Print-Ready**: Optimized margins and spacing for professional printing
- **Page Breaks**: Intelligent content flow management

### Content Guidelines

- **Length**: Commentary truncated to 200-250 characters for optimal display
- **Professional Tone**: Formal financial analysis language
- **Categorization**: Clear section organization
- **References**: Links back to main content sections

## Advanced Features

### 1. **Smart Content Recognition**

- Analyzes HTML content from TinyMCE editors
- Extracts meaningful text while preserving formatting context
- Handles multiple commentary types within single blocks

### 2. **Fallback Commentary**

If no specific commentary is found, generates professional default sections:

- Investment overview
- Growth outlook
- Risk assessment
- Valuation methodology

### 3. **Reference Linking**

Each commentary piece includes reference information linking back to:

- Specific content sections
- Financial tables
- Charts and data
- Main analysis

## Integration with Existing System

### Block Types Supported

- ✅ **Rich Text**: Auto-extraction from content
- ✅ **Analyst Notes**: Direct commentary input
- ✅ **Title Metadata**: Analyst information
- ✅ **Financial Metrics**: Data references
- ✅ **Data Tables**: Financial analysis links

### PDF Layout Modes

- **Editor Mode**: Content creation and editing
- **Preview Mode**: Standard content preview
- **PDF Layout Mode**: Professional report layout with sidebar
- **Export Mode**: Final PDF generation

## Technical Implementation

### Component Structure

```
PDFReportLayout
├── Header (FRC branding)
├── Company Info + Rating Box
├── Two-Column Layout
│   ├── Left Sidebar (30%)
│   │   ├── Analyst Info
│   │   └── Commentary Sections
│   └── Main Content (70%)
│       ├── Highlights
│       ├── Company Data
│       └── Charts/Tables
└── Footer (Disclaimers)
```

### Print Optimization

```css
@media print {
  .analyst-sidebar {
    background-color: #f8fafc !important;
  }
  .sidebar-comment {
    background-color: #e0f2fe !important;
  }
}
```

## Example Output

The system generates professional research reports with:

- **Left sidebar**: Structured analyst commentary
- **Main content**: Charts, tables, and detailed analysis
- **Professional styling**: FRC branding and institutional formatting
- **Print-ready**: Optimized for professional distribution

This creates a sophisticated research report format that matches the quality and structure of institutional equity research publications.

## Future Enhancements

- **Interactive linking** between sidebar comments and main content
- **Expandable commentary** sections for detailed analysis
- **Multi-page commentary** flow for longer reports
- **Chart annotations** directly linked to sidebar commentary
- **Custom commentary templates** for different report types
