// Enhanced PDF generator with optimized html2canvas + jsPDF settings
// This provides a high-quality fallback without requiring additional libraries

export class EnhancedPDFGenerator {
  constructor() {
    this.defaultOptions = {
      // High-quality canvas options
      canvas: {
        scale: 3, // Very high resolution for crisp text
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        dpi: 300, // Professional print DPI
        letterRendering: true, // Better text rendering
        removeContainer: true, // Clean rendering environment
        imageTimeout: 15000, // Longer timeout for complex content
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: false, // More reliable rendering
        textRenderingOptimization: true,
        onclone: (clonedDoc) => {
          // Optimize cloned document for PDF rendering
          const clonedElement = clonedDoc.querySelector("[data-pdf-content]");
          if (clonedElement) {
            // Ensure all fonts are loaded and optimized
            clonedElement.style.fontDisplay = "block";
            clonedElement.style.textRendering = "optimizeLegibility";
            clonedElement.style.fontSmooth = "always";
            clonedElement.style.webkitFontSmoothing = "antialiased";
            clonedElement.style.mozOsxFontSmoothing = "grayscale";

            // Force font loading
            const allElements = clonedElement.querySelectorAll("*");
            allElements.forEach((el) => {
              const style = window.getComputedStyle(el);
              if (style.fontFamily) {
                el.style.fontFamily = style.fontFamily;
              }
            });
          }
        },
        ignoreElements: (element) => {
          return (
            element.classList?.contains("ignore-pdf") ||
            element.classList?.contains("no-print") ||
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE" ||
            element.style?.display === "none" ||
            false
          );
        },
      },

      // PDF document options
      pdf: {
        orientation: "portrait",
        unit: "mm",
        format: "letter",
        compress: true,
        userUnit: 1.0,
        precision: 16, // High precision for vector graphics
      },

      // Image quality settings
      image: {
        format: "JPEG",
        quality: 0.98, // Very high quality
        compression: "FAST", // Fast compression for better quality
      },
    };
  }

  async generatePDF(element, filename, options = {}) {
    try {
      console.log("Starting enhanced PDF generation...");

      // Merge options with defaults
      const config = this.mergeOptions(options);

      // Pre-process element for optimal rendering
      await this.preprocessElement(element);

      // Fix color functions that html2canvas doesn't support
      const colorFixes = this.fixUnsupportedColors(element);

      // Import libraries dynamically
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      console.log("Generating high-resolution canvas...");

      // Generate high-quality canvas
      const canvas = await html2canvas(element, config.canvas);

      console.log(`Canvas generated: ${canvas.width}x${canvas.height}`);

      // Create PDF with professional settings
      const pdf = new jsPDF(config.pdf);

      // Add metadata
      this.addPDFMetadata(pdf, filename);

      // Convert canvas to high-quality image
      const imgData = canvas.toDataURL(
        `image/${config.image.format}`,
        config.image.quality
      );

      // Calculate optimal dimensions
      const dimensions = this.calculateOptimalDimensions(
        pdf,
        canvas.width,
        canvas.height
      );

      // Add image to PDF with optimal positioning
      pdf.addImage(
        imgData,
        config.image.format,
        dimensions.x,
        dimensions.y,
        dimensions.width,
        dimensions.height,
        "",
        config.image.compression
      );

      // Restore original colors
      this.restoreOriginalColors(colorFixes);

      console.log("Enhanced PDF generation complete");

      return {
        pdf,
        save: () => pdf.save(filename),
        output: (type) => pdf.output(type),
        blob: () => pdf.output("blob"),
        arrayBuffer: () => pdf.output("arraybuffer"),
      };
    } catch (error) {
      console.error("Enhanced PDF generation failed:", error);
      throw error;
    }
  }

  mergeOptions(userOptions) {
    return {
      canvas: { ...this.defaultOptions.canvas, ...userOptions.canvas },
      pdf: { ...this.defaultOptions.pdf, ...userOptions.pdf },
      image: { ...this.defaultOptions.image, ...userOptions.image },
    };
  }

  async preprocessElement(element) {
    // Wait for fonts to load
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Force a reflow to ensure all styles are applied
    element.offsetHeight;

    // Ensure all images are loaded
    const images = element.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
        setTimeout(resolve, 3000); // Timeout after 3 seconds
      });
    });

    await Promise.all(imagePromises);
  }

  fixUnsupportedColors(element) {
    const fixes = [];

    const processElement = (el) => {
      const computedStyle = window.getComputedStyle(el);
      const originalStyles = {};
      let hasChanges = false;

      // Check for unsupported color functions
      ["color", "backgroundColor", "borderColor", "fill", "stroke"].forEach(
        (prop) => {
          const value = computedStyle[prop];
          if (value && this.isUnsupportedColorFunction(value)) {
            originalStyles[prop] = el.style[prop] || "";
            el.style[prop] = this.getColorFallback(prop, value);
            hasChanges = true;
          }
        }
      );

      if (hasChanges) {
        fixes.push({ element: el, originalStyles });
      }

      // Process children
      Array.from(el.children).forEach(processElement);
    };

    processElement(element);
    return fixes;
  }

  isUnsupportedColorFunction(value) {
    return (
      value.includes("oklab") ||
      value.includes("oklch") ||
      value.includes("color(") ||
      value.includes("lab(") ||
      value.includes("lch(")
    );
  }

  getColorFallback(property, value) {
    // Provide high-quality color fallbacks
    if (property === "backgroundColor") {
      if (value.includes("oklab")) return "#ffffff";
      return "#f8f9fa"; // Light gray fallback
    } else if (property === "color") {
      if (value.includes("oklab")) return "#000000";
      return "#212529"; // Dark gray fallback
    } else if (property === "borderColor") {
      return "#dee2e6"; // Medium gray fallback
    }
    return "#000000"; // Default black fallback
  }

  restoreOriginalColors(fixes) {
    fixes.forEach(({ element, originalStyles }) => {
      Object.keys(originalStyles).forEach((prop) => {
        if (originalStyles[prop]) {
          element.style[prop] = originalStyles[prop];
        } else {
          element.style.removeProperty(prop);
        }
      });
    });
  }

  calculateOptimalDimensions(pdf, canvasWidth, canvasHeight) {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvasWidth / canvasHeight;

    // Calculate dimensions maintaining aspect ratio
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / canvasAspectRatio;

    // If height exceeds page height, scale to fit page height
    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * canvasAspectRatio;
    }

    // Center the content
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    return {
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: imgWidth,
      height: imgHeight,
    };
  }

  addPDFMetadata(pdf, filename) {
    const now = new Date();
    pdf.setProperties({
      title: filename.replace(".pdf", ""),
      subject: "Financial Research Report",
      author: "Fundamental Research Corp",
      creator: "FRC Business Analytics Platform - Enhanced PDF Generator",
      producer: "Enhanced PDF Generator v2.0",
      keywords: "financial analysis, research report, high quality",
      creationDate: now,
      modDate: now,
    });
  }

  // Static utility method for quick PDF generation
  static async generateFromElement(element, filename, options = {}) {
    const generator = new EnhancedPDFGenerator();
    return await generator.generatePDF(element, filename, options);
  }
}

export default EnhancedPDFGenerator;
