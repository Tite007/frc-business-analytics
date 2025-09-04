"use client";

import React, { useState, useRef, forwardRef, useCallback } from "react";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListBulletIcon,
  NumberedListIcon,
  LinkIcon,
  PhotoIcon,
  CodeBracketIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

// Simple, React 19 compatible rich text editor
const SimpleRichTextEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter your content...",
      height = "200px",
      showToolbar = true,
      className = "",
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef(null);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    // Format text with markdown-like syntax
    const insertFormat = useCallback(
      (before, after = "") => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);

        const newText =
          value.substring(0, start) +
          before +
          selectedText +
          after +
          value.substring(end);

        onChange(newText);

        // Restore cursor position
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + before.length,
            end + before.length
          );
        }, 0);
      },
      [value, onChange]
    );

    const formatActions = [
      {
        label: "Bold",
        icon: BoldIcon,
        action: () => insertFormat("**", "**"),
      },
      {
        label: "Italic",
        icon: ItalicIcon,
        action: () => insertFormat("*", "*"),
      },
      {
        label: "Heading 1",
        text: "H1",
        action: () => insertFormat("# "),
      },
      {
        label: "Heading 2",
        text: "H2",
        action: () => insertFormat("## "),
      },
      {
        label: "Heading 3",
        text: "H3",
        action: () => insertFormat("### "),
      },
      {
        label: "Quote",
        icon: ChatBubbleBottomCenterTextIcon,
        action: () => insertFormat("> "),
      },
      {
        label: "Bullet List",
        icon: ListBulletIcon,
        action: () => insertFormat("- "),
      },
      {
        label: "Numbered List",
        icon: NumberedListIcon,
        action: () => insertFormat("1. "),
      },
      {
        label: "Link",
        icon: LinkIcon,
        action: () => insertFormat("[", "](url)"),
      },
      {
        label: "Code",
        icon: CodeBracketIcon,
        action: () => insertFormat("`", "`"),
      },
    ];

    // Convert markdown-like syntax to HTML for preview
    const convertToHTML = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^### (.*$)/gm, "<h3>$1</h3>")
        .replace(/^## (.*$)/gm, "<h2>$1</h2>")
        .replace(/^# (.*$)/gm, "<h1>$1</h1>")
        .replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>")
        .replace(/^- (.*$)/gm, "<li>$1</li>")
        .replace(/^1\. (.*$)/gm, "<li>$1</li>")
        .replace(/`(.*?)`/g, "<code>$1</code>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\n/g, "<br>");
    };

    return (
      <div className={`simple-rich-editor ${className}`}>
        {showToolbar && (
          <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
            {formatActions.map((action, index) => (
              <button
                key={index}
                type="button"
                onClick={action.action}
                title={action.label}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded border border-transparent hover:border-gray-300 transition-colors flex items-center justify-center min-w-[32px]"
              >
                {action.icon ? (
                  <action.icon className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{action.text}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <textarea
          ref={(el) => {
            textareaRef.current = el;
            if (ref) ref.current = el;
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
            showToolbar ? "rounded-b-lg border-t-0" : "rounded-lg"
          }`}
          style={{
            minHeight: height,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: "14px",
            lineHeight: "1.6",
          }}
          {...props}
        />

        {value && (
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-xs text-gray-500 mb-2">Preview:</div>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: convertToHTML(value) }}
              style={{ fontSize: "13px" }}
            />
          </div>
        )}

        <style jsx>{`
          .prose h1 {
            font-size: 1.5em;
            font-weight: 600;
            margin: 0.5em 0;
          }
          .prose h2 {
            font-size: 1.3em;
            font-weight: 600;
            margin: 0.5em 0;
          }
          .prose h3 {
            font-size: 1.1em;
            font-weight: 600;
            margin: 0.5em 0;
          }
          .prose blockquote {
            border-left: 4px solid #3b82f6;
            background: #eff6ff;
            padding: 0.5em 1em;
            margin: 0.5em 0;
            font-style: italic;
          }
          .prose code {
            background: #f3f4f6;
            padding: 0.2em 0.4em;
            border-radius: 0.25em;
            font-family: "Monaco", "Courier New", monospace;
          }
          .prose li {
            margin: 0.25em 0;
          }
          .prose strong {
            font-weight: 600;
          }
          .prose em {
            font-style: italic;
          }
          .prose a {
            color: #3b82f6;
            text-decoration: underline;
          }
        `}</style>
      </div>
    );
  }
);

SimpleRichTextEditor.displayName = "SimpleRichTextEditor";

// Enhanced version with more features
export const EnhancedRichTextEditor = forwardRef((props, ref) => {
  return <SimpleRichTextEditor {...props} ref={ref} showToolbar={true} />;
});

EnhancedRichTextEditor.displayName = "EnhancedRichTextEditor";

// Financial version with specific financial formatting
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
    const textareaRef = useRef(null);

    const insertFinancialFormat = useCallback(
      (text) => {
        const textarea = ref?.current || textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        const newText = value.substring(0, start) + text + value.substring(end);
        onChange(newText);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + text.length, start + text.length);
        }, 0);
      },
      [value, onChange, ref]
    );

    const financialTemplates = [
      { label: "Price Target", text: "**Price Target:** $XXX.XX" },
      { label: "Rating", text: "**Rating:** BUY/HOLD/SELL" },
      { label: "Risk Level", text: "**Risk:** Low/Medium/High" },
      { label: "Fair Value", text: "**Fair Value:** $XXX.XX" },
      { label: "P/E Ratio", text: "**P/E Ratio:** XX.X" },
      { label: "Market Cap", text: "**Market Cap:** $XXXb" },
    ];

    return (
      <div>
        <div className="mb-2 flex flex-wrap gap-2">
          {financialTemplates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertFinancialFormat(template.text)}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              {template.label}
            </button>
          ))}
        </div>

        <SimpleRichTextEditor
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          height={height}
          showToolbar={true}
          {...props}
        />
      </div>
    );
  }
);

FinancialRichTextEditor.displayName = "FinancialRichTextEditor";

export default SimpleRichTextEditor;
