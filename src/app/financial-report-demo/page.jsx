"use client";

import { useState } from "react";
import { DynamicFinancialReport } from "@/components/DynamicFinancialReport";
import {
  sampleReportData,
  createEmptyReportData,
} from "@/lib/financialReportData";
import {
  generateFinancialReportHTML,
  generatePDFOptimizedHTML,
} from "@/lib/reportHTMLGenerator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancialReportDemo() {
  const [currentReportData, setCurrentReportData] = useState(sampleReportData);
  const [generatedHTML, setGeneratedHTML] = useState("");

  // Handle PDF export
  const handleExportPDF = async (data, paperSize) => {
    try {
      // Generate HTML for PDF
      const htmlContent = generatePDFOptimizedHTML(data, paperSize);

      // Here you would typically send this to a PDF generation service
      // For demo purposes, we'll just open the HTML in a new window
      const newWindow = window.open();
      newWindow.document.write(htmlContent);
      newWindow.document.close();

      console.log("PDF export initiated with data:", data);
      console.log("Paper size:", paperSize);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  // Handle print
  const handlePrint = (data, paperSize) => {
    try {
      // Generate print-optimized HTML
      const htmlContent = generateFinancialReportHTML(data, paperSize);

      // Create a temporary iframe for printing
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.write(htmlContent);
      doc.close();

      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);

      console.log("Print initiated with data:", data);
    } catch (error) {
      console.error("Error printing:", error);
    }
  };

  // Generate HTML preview
  const generateHTMLPreview = () => {
    const html = generateFinancialReportHTML(currentReportData);
    setGeneratedHTML(html);
  };

  // Load sample data
  const loadSampleData = () => {
    setCurrentReportData(sampleReportData);
  };

  // Create new empty report
  const createNewReport = () => {
    setCurrentReportData(createEmptyReportData());
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Financial Report System Demo
          </h1>
          <p className="text-muted-foreground">
            This demo shows how to use the dynamic financial report component
            with different data sources.
          </p>
        </div>

        <Tabs defaultValue="preview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="preview">Live Preview</TabsTrigger>
            <TabsTrigger value="data">Data Structure</TabsTrigger>
            <TabsTrigger value="html">Generated HTML</TabsTrigger>
            <TabsTrigger value="usage">Usage Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={loadSampleData} variant="outline">
                Load Sample Data
              </Button>
              <Button onClick={createNewReport} variant="outline">
                Create New Report
              </Button>
            </div>

            <DynamicFinancialReport
              reportData={currentReportData}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
            />
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Current Report Data Structure
              </h3>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(currentReportData, null, 2)}
              </pre>
            </Card>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={generateHTMLPreview}>
                Generate HTML Preview
              </Button>
            </div>

            {generatedHTML && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Generated HTML for PDF Export
                </h3>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm max-h-96">
                  {generatedHTML}
                </pre>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                How to Use the Dynamic Financial Report
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">1. Basic Usage</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`import { DynamicFinancialReport } from "@/components/DynamicFinancialReport";
import { sampleReportData } from "@/lib/financialReportData";

function MyPage() {
  const handleExportPDF = (data, paperSize) => {
    // Your PDF export logic here
    console.log("Exporting PDF with data:", data);
  };

  const handlePrint = (data, paperSize) => {
    // Your print logic here
    console.log("Printing with data:", data);
  };

  return (
    <DynamicFinancialReport
      reportData={sampleReportData}
      onExportPDF={handleExportPDF}
      onPrint={handlePrint}
    />
  );
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">
                    2. Creating Custom Report Data
                  </h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`import { createEmptyReportData, validateReportData } from "@/lib/financialReportData";

// Create a new empty report
const newReport = createEmptyReportData();

// Customize with your data
newReport.company.name = "Your Company Name";
newReport.company.ticker = "(NYSE: TICK)";
newReport.title = "Your Report Title";

// Validate the data
const validation = validateReportData(newReport);
if (!validation.isValid) {
  console.log("Validation errors:", validation.errors);
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. PDF Export with API</h4>
                  <pre className="bg-muted p-4 rounded-lg text-sm">
                    {`import { generatePDFOptimizedHTML } from "@/lib/reportHTMLGenerator";

const exportToPDF = async (reportData, paperSize) => {
  const htmlContent = generatePDFOptimizedHTML(reportData, paperSize);
  
  // Send to your PDF generation API
  const response = await fetch('/api/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      html: htmlContent,
      paperSize: paperSize
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'financial-report.pdf';
  a.click();
};`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">
                    4. Data Structure Overview
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>
                      <strong>reportDate:</strong> Date of the report
                    </li>
                    <li>
                      <strong>company:</strong> Company information (name,
                      ticker, sector)
                    </li>
                    <li>
                      <strong>recommendation:</strong> Investment recommendation
                      details
                    </li>
                    <li>
                      <strong>title:</strong> Main report title
                    </li>
                    <li>
                      <strong>author:</strong> Author information
                    </li>
                    <li>
                      <strong>highlights:</strong> Array of key highlights
                    </li>
                    <li>
                      <strong>mainPoints:</strong> Array of main discussion
                      points
                    </li>
                    <li>
                      <strong>stockPerformance:</strong> Stock performance
                      metrics
                    </li>
                    <li>
                      <strong>companyData:</strong> Company financial metrics
                    </li>
                    <li>
                      <strong>financialData:</strong> Financial table data
                    </li>
                    <li>
                      <strong>disclaimer:</strong> Legal disclaimer text
                    </li>
                    <li>
                      <strong>footer:</strong> Footer information
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
