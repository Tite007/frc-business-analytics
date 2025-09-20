# Enhanced Content Management System - Implementation Plan

## Phase 1: Advanced Content Editor Integration

### TinyMCE Integration Setup

```bash
npm install @tinymce/tinymce-react
npm install @tinymce/tinymce-plugin-table
npm install @tinymce/tinymce-plugin-image
npm install @tinymce/tinymce-plugin-charts
```

### Enhanced Content Editor Component

```jsx
import { Editor } from "@tinymce/tinymce-react";
import { useState } from "react";

const AdvancedContentEditor = ({ content, onChange }) => {
  const [editorContent, setEditorContent] = useState(content);

  const editorConfig = {
    height: 600,
    menubar: true,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "code",
      "help",
      "wordcount",
      "pagebreak",
      "template",
      "exportpdf",
      "powerpaste",
      "chart",
    ],
    toolbar: [
      "undo redo | blocks | bold italic forecolor | alignleft aligncenter",
      "alignright alignjustify | bullist numlist outdent indent |",
      "removeformat | table | image | media | chart | pagebreak | template",
      "exportpdf | fullscreen | preview | help",
    ],
    content_style: `
      body { 
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
        font-size: 14px;
        line-height: 1.6;
      }
      .page-break { 
        page-break-before: always; 
        border-top: 2px dashed #ccc;
        padding-top: 20px;
        margin-top: 20px;
      }
    `,
    templates: [
      {
        title: "Financial Summary Table",
        description: "Standard financial metrics table",
        content: `
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f8f9fa;">
              <tr>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Metric</th>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Current</th>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Previous</th>
                <th style="border: 1px solid #dee2e6; padding: 12px;">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 12px;">Revenue</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">$X.X M</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">$X.X M</td>
                <td style="border: 1px solid #dee2e6; padding: 12px;">+X.X%</td>
              </tr>
            </tbody>
          </table>
        `,
      },
      {
        title: "Executive Summary Section",
        description: "Standard executive summary layout",
        content: `
          <div class="executive-summary" style="background: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
            <h2 style="color: #007bff; margin-top: 0;">Executive Summary</h2>
            <p><strong>Investment Thesis:</strong> [Your thesis here]</p>
            <p><strong>Price Target:</strong> $XX.XX</p>
            <p><strong>Rating:</strong> [BUY/HOLD/SELL]</p>
            <p><strong>Risk Level:</strong> [LOW/MEDIUM/HIGH]</p>
          </div>
        `,
      },
    ],
    image_upload_handler: async (blobInfo, progress) => {
      // Custom image upload to your storage
      const formData = new FormData();
      formData.append("file", blobInfo.blob(), blobInfo.filename());

      const response = await fetch("/api/cms/media/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      return result.data.file_url;
    },
    file_picker_callback: (callback, value, meta) => {
      // Custom file picker for documents, charts, etc.
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute(
        "accept",
        meta.filetype === "image" ? "image/*" : "*/*"
      );

      input.onchange = function () {
        const file = this.files[0];
        // Upload and get URL
        uploadFile(file).then((url) => {
          callback(url, { title: file.name });
        });
      };

      input.click();
    },
  };

  return (
    <div className="advanced-editor">
      <Editor
        apiKey="your-tinymce-api-key" // Get from TinyMCE
        init={editorConfig}
        value={editorContent}
        onEditorChange={(content) => {
          setEditorContent(content);
          onChange(content);
        }}
      />
    </div>
  );
};
```

## Phase 2: Page Layout Designer

### Page-by-Page Layout Control

```jsx
const PageLayoutDesigner = ({ content, onLayoutChange }) => {
  const [pages, setPages] = useState([
    {
      id: "front-page",
      type: "cover",
      template: "research-report-cover",
      data: {
        title: "",
        subtitle: "",
        author: "",
        date: "",
        logo: "/FRC_Logo_FullBlue.png",
      },
    },
    {
      id: "executive-summary",
      type: "content",
      template: "executive-summary",
      data: {
        content: "",
        charts: [],
        tables: [],
      },
    },
  ]);

  const pageTemplates = {
    "research-report-cover": {
      name: "Research Report Cover",
      fields: ["title", "subtitle", "author", "date", "company", "ticker"],
    },
    "executive-summary": {
      name: "Executive Summary",
      fields: ["content", "key-metrics-table", "rating-box"],
    },
    "financial-analysis": {
      name: "Financial Analysis",
      fields: ["content", "financial-table", "charts"],
    },
    "charts-and-data": {
      name: "Charts & Data",
      fields: ["title", "charts", "data-tables", "notes"],
    },
  };

  const addPage = (template) => {
    const newPage = {
      id: `page-${Date.now()}`,
      type: "content",
      template,
      data: {},
    };
    setPages([...pages, newPage]);
  };

  return (
    <div className="page-layout-designer">
      <div className="pages-sidebar">
        <h3>Pages</h3>
        {pages.map((page, index) => (
          <PageThumbnail
            key={page.id}
            page={page}
            index={index}
            onEdit={() => editPage(page.id)}
            onDelete={() => deletePage(page.id)}
          />
        ))}

        <div className="add-page-section">
          <h4>Add New Page</h4>
          {Object.entries(pageTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => addPage(key)}
              className="template-button"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      <div className="page-editor">
        <PageEditor
          page={selectedPage}
          template={pageTemplates[selectedPage?.template]}
          onChange={updatePageData}
        />
      </div>

      <div className="preview-panel">
        <PDFPreview pages={pages} />
      </div>
    </div>
  );
};
```

## Phase 3: Advanced Chart Integration

### Chart.js Integration for Financial Charts

```jsx
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FinancialChartEditor = ({ onChartCreate }) => {
  const [chartType, setChartType] = useState("line");
  const [chartData, setChartData] = useState({
    labels: ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024"],
    datasets: [
      {
        label: "Revenue ($M)",
        data: [12, 19, 15, 25, 28],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Financial Performance",
        font: { size: 16, weight: "bold" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value + "M";
          },
        },
      },
    },
  };

  const exportChart = async () => {
    const canvas = document.querySelector("canvas");
    const imageData = canvas.toDataURL("image/png");

    // Upload chart image
    const response = await fetch("/api/cms/charts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageData,
        chartConfig: {
          type: chartType,
          data: chartData,
          options: chartOptions,
        },
      }),
    });

    const result = await response.json();
    onChartCreate(result.data);
  };

  return (
    <div className="chart-editor">
      <div className="chart-controls">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="line">Line Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="doughnut">Pie Chart</option>
        </select>

        <DataEditor data={chartData} onChange={setChartData} />

        <button onClick={exportChart} className="export-btn">
          Add to Report
        </button>
      </div>

      <div className="chart-preview">
        {chartType === "line" && (
          <Line data={chartData} options={chartOptions} />
        )}
        {chartType === "bar" && <Bar data={chartData} options={chartOptions} />}
        {chartType === "doughnut" && (
          <Doughnut data={chartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
};
```

## Phase 4: Excel Integration

### Excel Import/Export Functionality

```jsx
import * as XLSX from "xlsx";

const ExcelIntegration = ({ onTableCreate }) => {
  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Get first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Create HTML table
      const htmlTable = createHTMLTable(jsonData);
      onTableCreate(htmlTable);
    };

    reader.readAsArrayBuffer(file);
  };

  const createHTMLTable = (data) => {
    let html =
      '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';

    data.forEach((row, rowIndex) => {
      html += "<tr>";
      row.forEach((cell, cellIndex) => {
        const tag = rowIndex === 0 ? "th" : "td";
        const style =
          rowIndex === 0
            ? "background-color: #f8f9fa; font-weight: bold; border: 1px solid #dee2e6; padding: 12px;"
            : "border: 1px solid #dee2e6; padding: 12px;";

        html += `<${tag} style="${style}">${cell || ""}</${tag}>`;
      });
      html += "</tr>";
    });

    html += "</table>";
    return html;
  };

  return (
    <div className="excel-integration">
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleExcelUpload}
        className="file-input"
      />
      <p>Upload Excel file to convert to HTML table</p>
    </div>
  );
};
```

## Phase 5: PDF Generation Engine

### Advanced PDF Generation with Custom Layouts

```jsx
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const PDFGenerator = ({ content, metadata, pages }) => {
  const styles = StyleSheet.create({
    page: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: 40,
      fontFamily: "Helvetica",
    },
    frontPage: {
      flexDirection: "column",
      backgroundColor: "#ffffff",
      padding: 0,
      position: "relative",
    },
    header: {
      backgroundColor: "#1e40af",
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 300,
    },
    logo: {
      width: 200,
      height: 60,
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#ffffff",
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: "#e5e7eb",
      textAlign: "center",
    },
    pageNumber: {
      position: "absolute",
      bottom: 30,
      right: 40,
      fontSize: 10,
      color: "#6b7280",
    },
  });

  const ResearchReportPDF = () => (
    <Document>
      {/* Front Page */}
      <Page size="A4" style={styles.frontPage}>
        <View style={styles.header}>
          <Image src="/FRC_Logo_FullWhite.png" style={styles.logo} />
          <Text style={styles.title}>{metadata.title}</Text>
          <Text style={styles.subtitle}>{metadata.category}</Text>
          <Text style={styles.subtitle}>
            {new Date(metadata.date).toLocaleDateString()}
          </Text>
        </View>

        <View style={{ padding: 40, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
            Executive Summary
          </Text>
          <Text style={{ fontSize: 12, lineHeight: 1.5 }}>
            {metadata.executiveSummary}
          </Text>
        </View>
      </Page>

      {/* Content Pages */}
      {pages.map((page, index) => (
        <Page key={page.id} size="A4" style={styles.page} wrap>
          <ContentPage page={page} pageNumber={index + 2} />
          <Text style={styles.pageNumber}>Page {index + 2}</Text>
        </Page>
      ))}
    </Document>
  );

  return (
    <div className="pdf-generator">
      <div className="pdf-preview">
        <ResearchReportPDF />
      </div>

      <div className="pdf-actions">
        <PDFDownloadLink
          document={<ResearchReportPDF />}
          fileName={`${metadata.title.replace(/\s+/g, "_")}.pdf`}
          className="download-btn"
        >
          {({ blob, url, loading, error }) =>
            loading ? "Generating PDF..." : "Download PDF"
          }
        </PDFDownloadLink>
      </div>
    </div>
  );
};
```

## Implementation Roadmap

### Week 1: Enhanced Editor

- [ ] Install and configure TinyMCE
- [ ] Create advanced editor component
- [ ] Add custom templates for financial content
- [ ] Implement image and file upload

### Week 2: Page Layout System

- [ ] Build page-by-page designer
- [ ] Create template system
- [ ] Add drag-drop functionality
- [ ] Implement page preview

### Week 3: Charts & Data Integration

- [ ] Integrate Chart.js for financial charts
- [ ] Add Excel import functionality
- [ ] Create chart editor interface
- [ ] Build data visualization tools

### Week 4: PDF Engine

- [ ] Implement React-PDF generation
- [ ] Create custom page templates
- [ ] Add branding and styling
- [ ] Build download functionality

### Week 5: Polish & Testing

- [ ] Optimize performance
- [ ] Add export options
- [ ] Test with real financial data
- [ ] User training and documentation

```

```
