// API endpoint for generating PDFs from financial report data
// Place this in: src/app/api/generate-pdf/route.js

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(request) {
  try {
    const { html, paperSize, fileName } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Configure PDF options
    const pdfOptions = {
      format: paperSize?.name || 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };

    // Generate PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    // Close browser
    await browser.close();

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName || 'financial-report.pdf'}"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

// Alternative endpoint using a PDF generation service like jsPDF or PDFKit
export async function POST_ALTERNATIVE(request) {
  try {
    const { html, paperSize, fileName } = await request.json();
    
    // Using html-pdf package (you'd need to install it)
    const pdf = require('html-pdf');
    const options = {
      format: paperSize?.name || 'Letter',
      orientation: 'portrait',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    };

    return new Promise((resolve, reject) => {
      pdf.create(html, options).toBuffer((err, buffer) => {
        if (err) {
          reject(NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
          ));
        } else {
          resolve(new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${fileName || 'financial-report.pdf'}"`,
            },
          }));
        }
      });
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
