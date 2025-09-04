"use client";

import React, { useRef, forwardRef, useState } from "react";

const RichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter your content...",
      height = "200px",
      readOnly = false,
      className = "",
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef();
    const [focused, setFocused] = useState(false);

    React.useEffect(() => {
      if (ref) {
        ref.current = textareaRef.current;
      }
    }, [ref]);

    const handleChange = (e) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className={`rich-text-editor ${className}`}>
        <style jsx>{`
          .editor-container {
            border: 2px solid ${focused ? "#3b82f6" : "#e5e7eb"};
            border-radius: 8px;
            transition: border-color 0.2s ease;
            background: white;
          }

          .editor-toolbar {
            background: #f9fafb;
            border-bottom: 1px solid #e5e7eb;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            padding: 8px 12px;
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .toolbar-button {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s ease;
          }

          .toolbar-button:hover {
            background: #f3f4f6;
            border-color: #9ca3af;
          }

          .toolbar-button.active {
            background: #3b82f6;
            border-color: #3b82f6;
            color: white;
          }

          .editor-textarea {
            width: 100%;
            min-height: ${height};
            border: none;
            outline: none;
            padding: 12px;
            font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
              Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.6;
            resize: vertical;
            border-bottom-left-radius: 6px;
            border-bottom-right-radius: 6px;
          }

          .editor-textarea:focus {
            outline: none;
          }

          .editor-textarea::placeholder {
            color: #9ca3af;
          }
        `}</style>

        <div className="editor-container">
          <div className="editor-toolbar">
            <button
              type="button"
              className="toolbar-button"
              onClick={() => {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                const newText =
                  textarea.value.substring(0, start) +
                  `**${selectedText}**` +
                  textarea.value.substring(end);
                onChange && onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 2, end + 2);
                }, 0);
              }}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                const newText =
                  textarea.value.substring(0, start) +
                  `*${selectedText}*` +
                  textarea.value.substring(end);
                onChange && onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 1, end + 1);
                }, 0);
              }}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const newText =
                  textarea.value.substring(0, start) +
                  "\n• " +
                  textarea.value.substring(start);
                onChange && onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 3, start + 3);
                }, 0);
              }}
            >
              • List
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const newText =
                  textarea.value.substring(0, start) +
                  "\n1. " +
                  textarea.value.substring(start);
                onChange && onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 4, start + 4);
                }, 0);
              }}
            >
              1. List
            </button>
            <button
              type="button"
              className="toolbar-button"
              onClick={() => {
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selectedText = textarea.value.substring(start, end);
                const newText =
                  textarea.value.substring(0, start) +
                  `[${selectedText}](url)` +
                  textarea.value.substring(end);
                onChange && onChange(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(end + 3, end + 6);
                }, 0);
              }}
            >
              🔗 Link
            </button>
          </div>

          <textarea
            ref={textareaRef}
            className="editor-textarea"
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            readOnly={readOnly}
            {...props}
          />
        </div>
      </div>
    );
  }
);

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
    return (
      <RichTextEditor
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
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
    return (
      <RichTextEditor
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={height}
        {...props}
      />
    );
  }
);

FinancialRichTextEditor.displayName = "FinancialRichTextEditor";

export default RichTextEditor;
