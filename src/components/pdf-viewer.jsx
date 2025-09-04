"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MagnifyingGlassPlusIcon as ZoomIn,
  MagnifyingGlassMinusIcon as ZoomOut,
  ArrowDownTrayIcon as Download,
  PrinterIcon as Printer,
  ChevronLeftIcon as ChevronLeft,
  ChevronRightIcon as ChevronRight,
  DocumentTextIcon as FileText,
} from "@heroicons/react/24/outline";

const paperSizes = [
  { name: "Letter", width: 8.5, height: 11, unit: "in" },
  { name: "A4", width: 210, height: 297, unit: "mm" },
  { name: "Legal", width: 8.5, height: 14, unit: "in" },
];

export function PDFViewer() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [selectedSize, setSelectedSize] = useState(paperSizes[0]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  // Convert paper size to pixels (assuming 96 DPI)
  const getPixelDimensions = (size) => {
    if (size.unit === "in") {
      return {
        width: size.width * 96,
        height: size.height * 96,
      };
    } else {
      // Convert mm to inches then to pixels
      return {
        width: (size.width / 25.4) * 96,
        height: (size.height / 25.4) * 96,
      };
    }
  };

  const pixelDimensions = getPixelDimensions(selectedSize);
  const scaledWidth = (pixelDimensions.width * zoom) / 100;
  const scaledHeight = (pixelDimensions.height * zoom) / 100;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                PDF Viewer
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Size:</span>
              <Select
                value={selectedSize.name}
                onValueChange={(value) => {
                  const size = paperSizes.find((s) => s.name === value);
                  if (size) setSelectedSize(size);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paperSizes.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
                      {size.name} ({size.width} × {size.height} {size.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Viewer */}
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="flex justify-center">
            <Card
              className="shadow-lg"
              style={{ width: scaledWidth, height: scaledHeight }}
            >
              <div className="w-full h-full bg-white relative overflow-hidden">
                {currentPage === 1 ? (
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-08-30%20at%203.12.20%E2%80%AFPM-OzqyN2l1pGBxyIwGXKOU3ydpUcwfx5.png"
                    alt="Financial Research Report - Page 1"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "crisp-edges" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Page {currentPage}</p>
                      <p className="text-sm">
                        Additional content would appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-64 border-l border-border bg-sidebar p-4">
          <h3 className="font-medium text-sidebar-foreground mb-4">
            Document Info
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-sidebar-foreground/70">Current Size</p>
              <p className="text-sm font-medium text-sidebar-foreground">
                {selectedSize.name} ({selectedSize.width}″ ×{" "}
                {selectedSize.height}″)
              </p>
            </div>

            <div>
              <p className="text-sm text-sidebar-foreground/70">
                Pixel Dimensions
              </p>
              <p className="text-sm font-medium text-sidebar-foreground">
                {Math.round(pixelDimensions.width)} ×{" "}
                {Math.round(pixelDimensions.height)} px
              </p>
            </div>

            <div>
              <p className="text-sm text-sidebar-foreground/70">Scaled Size</p>
              <p className="text-sm font-medium text-sidebar-foreground">
                {Math.round(scaledWidth)} × {Math.round(scaledHeight)} px
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="font-medium text-sidebar-foreground mb-3">
              Page Thumbnails
            </h4>
            <div className="space-y-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-full p-2 text-left rounded border transition-colors ${
                      currentPage === page
                        ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-accent"
                        : "bg-sidebar border-sidebar-border hover:bg-sidebar-accent/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-10 bg-white border border-sidebar-border rounded-sm flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">
                          {page}
                        </span>
                      </div>
                      <span className="text-sm">Page {page}</span>
                    </div>
                  </button>
                )
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Zoom: {zoom}% | Size: {selectedSize.name}
          </div>
        </div>
      </footer>
    </div>
  );
}
