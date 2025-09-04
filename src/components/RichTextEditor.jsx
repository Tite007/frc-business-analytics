"use client";

import React, { useEffect, useRef, forwardRef, useState } from "react";
import dynamic from "next/dynamic";

// Import ReactQuill dynamically with error handling for React 19
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[200px] bg-gray-50 animate-pulse rounded border flex items-center justify-center text-gray-500">
      Loading editor...
    </div>
  ),
});

// Import Quill styles conditionally
if (typeof window !== "undefined") {
  import("react-quill/dist/quill.snow.css");
}

// Custom toolbar modules for financial content
const toolbarModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    ["formula"], // For financial formulas
    ["clean"], // Remove formatting
  ],
  clipboard: {
    // Toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

// Formats for financial content
const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "align",
  "script",
  "code-block",
  "formula",
];

const RichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter your content...",
      height = "200px",
      readOnly = false,
      theme = "snow",
      className = "",
      modules = toolbarModules,
      ...props
    },
    ref
  ) => {
    const quillRef = useRef();
    const [isClient, setIsClient] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      setIsClient(true);
    }, []);

    useEffect(() => {
      if (ref) {
        ref.current = quillRef.current;
      }
    }, [ref]);

    const handleChange = (content, delta, source, editor) => {
      try {
        if (onChange) {
          onChange(content);
        }
      } catch (err) {
        console.warn("ReactQuill onChange error:", err);
        setError(err);
      }
    };

    // Fallback to textarea if ReactQuill fails
    if (error || !isClient) {
      return (
        <div className={`rich-text-editor-fallback ${className}`}>
          <textarea
            value={value?.replace(/<[^>]*>/g, "") || ""}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            readOnly={readOnly}
            style={{
              minHeight: height,
              width: "100%",
              padding: "12px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "14px",
              lineHeight: "1.6",
              resize: "vertical",
            }}
            {...props}
          />
          {error && (
            <div className="text-xs text-amber-600 mt-1">
              Using fallback editor (ReactQuill compatibility issue)
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`rich-text-editor ${className}`}>
        <style jsx global>{`
          .ql-editor {
            min-height: ${height};
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              "Roboto", sans-serif;
            font-size: 14px;
            line-height: 1.6;
          }

          .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: none;
            background: #f9fafb;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
          }

          .ql-container {
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-top: none;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }

          .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }

          .ql-editor:focus {
            outline: none;
          }

          /* Financial content specific styles */
          .ql-editor .financial-highlight {
            background-color: #fef3c7;
            padding: 2px 4px;
            border-radius: 4px;
          }

          .ql-editor blockquote {
            border-left: 4px solid #3b82f6;
            background-color: #eff6ff;
            padding: 12px 16px;
            margin: 16px 0;
            font-style: italic;
          }

          .ql-editor .ql-code-block-container {
            background-color: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            margin: 8px 0;
          }

          /* Table styles for financial data */
          .ql-editor table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
          }

          .ql-editor table th,
          .ql-editor table td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
          }

          .ql-editor table th {
            background-color: #f9fafb;
            font-weight: 600;
          }

          /* Professional spacing */
          .ql-editor h1,
          .ql-editor h2,
          .ql-editor h3 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
          }

          .ql-editor h1 {
            font-size: 28px;
            color: #111827;
          }

          .ql-editor h2 {
            font-size: 24px;
            color: #1f2937;
          }

          .ql-editor h3 {
            font-size: 20px;
            color: #374151;
          }

          .ql-editor p {
            margin-bottom: 12px;
          }

          .ql-editor ul,
          .ql-editor ol {
            margin: 12px 0;
            padding-left: 24px;
          }

          .ql-editor li {
            margin-bottom: 6px;
          }
        `}</style>

        <ErrorBoundary
          fallback={
            <textarea
              value={value?.replace(/<[^>]*>/g, "") || ""}
              onChange={(e) => onChange && onChange(e.target.value)}
              placeholder={placeholder}
              readOnly={readOnly}
              style={{
                minHeight: height,
                width: "100%",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
                lineHeight: "1.6",
                resize: "vertical",
              }}
              {...props}
            />
          }
        >
          <ReactQuill
            ref={quillRef}
            theme={theme}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly}
            modules={modules}
            formats={formats}
            {...props}
          />
        </ErrorBoundary>
      </div>
    );
  }
);

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("ReactQuill Error Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

RichTextEditor.displayName = "RichTextEditor";

// Simplified version for smaller content areas
export const SimpleRichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter text...",
      height = "120px",
      ...props
    },
    ref
  ) => {
    const simpleModules = {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    };

    return (
      <RichTextEditor
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
        modules={simpleModules}
        {...props}
      />
    );
  }
);

SimpleRichTextEditor.displayName = "SimpleRichTextEditor";

// Financial content specific editor
export const FinancialRichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter financial content...",
      height = "300px",
      ...props
    },
    ref
  ) => {
    const financialModules = {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
      ],
    };

    return (
      <RichTextEditor
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
        modules={financialModules}
        {...props}
      />
    );
  }
);

FinancialRichTextEditor.displayName = "FinancialRichTextEditor";

export default RichTextEditor;
