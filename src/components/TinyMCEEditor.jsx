"use client";

import React, { useRef, forwardRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

// TinyMCE Rich Text Editor with Financial Content Features (Free Plan)
const TinyMCEEditor = forwardRef(
  (
    {
      value = "",
      onChange,
      placeholder = "Enter your content...",
      height = 400,
      plugins = "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist help",
      toolbar = "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat | help",
      menubar = "file edit view insert format tools table help",
      readonly = false,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef(null);

    const handleEditorChange = (content, editor) => {
      if (onChange) {
        onChange(content);
      }
    };

    const initConfig = {
      height: height,
      menubar: menubar,
      plugins: plugins,
      toolbar: toolbar,
      content_style: `
      body { 
        font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
        font-size: 14px; 
        line-height: 1.6; 
        color: #1f2937;
      }
      h1, h2, h3, h4, h5, h6 { 
        color: #111827; 
        font-weight: 600; 
        margin-top: 1.5em; 
        margin-bottom: 0.5em; 
      }
      h1 { font-size: 2.25em; }
      h2 { font-size: 1.875em; }
      h3 { font-size: 1.5em; }
      p { margin-bottom: 1em; }
      blockquote { 
        border-left: 4px solid #3b82f6; 
        background: #eff6ff; 
        padding: 1em 1.5em; 
        margin: 1em 0; 
        font-style: italic; 
      }
      .financial-highlight { 
        background-color: #fef3c7; 
        padding: 0.25em 0.5em; 
        border-radius: 0.25em; 
        font-weight: 600; 
      }
      .price-target { 
        color: #059669; 
        font-weight: 600; 
      }
      .rating-buy { 
        color: #059669; 
        font-weight: 600; 
        background: #d1fae5; 
        padding: 0.25em 0.5em; 
        border-radius: 0.25em; 
      }
      .rating-hold { 
        color: #d97706; 
        font-weight: 600; 
        background: #fef3c7; 
        padding: 0.25em 0.5em; 
        border-radius: 0.25em; 
      }
      .rating-sell { 
        color: #dc2626; 
        font-weight: 600; 
        background: #fecaca; 
        padding: 0.25em 0.5em; 
        border-radius: 0.25em; 
      }
      table { 
        border-collapse: collapse; 
        width: 100%; 
        margin: 1em 0; 
      }
      table th, table td { 
        border: 1px solid #e5e7eb; 
        padding: 0.75em; 
        text-align: left; 
      }
      table th { 
        background-color: #f9fafb; 
        font-weight: 600; 
      }
    `,
      formats: {
        financial_highlight: {
          inline: "span",
          classes: "financial-highlight",
        },
        price_target: {
          inline: "span",
          classes: "price-target",
        },
        rating_buy: {
          inline: "span",
          classes: "rating-buy",
        },
        rating_hold: {
          inline: "span",
          classes: "rating-hold",
        },
        rating_sell: {
          inline: "span",
          classes: "rating-sell",
        },
      },
      style_formats: [
        {
          title: "Financial Formats",
          items: [
            { title: "Highlight Important", format: "financial_highlight" },
            { title: "Price Target", format: "price_target" },
            { title: "Rating: BUY", format: "rating_buy" },
            { title: "Rating: HOLD", format: "rating_hold" },
            { title: "Rating: SELL", format: "rating_sell" },
          ],
        },
        {
          title: "Headings",
          items: [
            { title: "Executive Summary", block: "h1" },
            { title: "Analysis Section", block: "h2" },
            { title: "Key Metrics", block: "h3" },
            { title: "Subsection", block: "h4" },
          ],
        },
        {
          title: "Text",
          items: [
            { title: "Paragraph", block: "p" },
            { title: "Important Quote", block: "blockquote" },
          ],
        },
      ],
      placeholder: placeholder,
      readonly: readonly,
      branding: false,
      promotion: false,
      setup: (editor) => {
        // Custom financial content buttons
        editor.ui.registry.addButton("financial_metrics", {
          text: "Financial Metrics",
          onAction: () => {
            editor.insertContent(`
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Current</th>
                  <th>Previous</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Revenue</td>
                  <td>$XXX.X M</td>
                  <td>$XXX.X M</td>
                  <td>+X.X%</td>
                </tr>
                <tr>
                  <td>Net Income</td>
                  <td>$XX.X M</td>
                  <td>$XX.X M</td>
                  <td>+X.X%</td>
                </tr>
                <tr>
                  <td>EPS</td>
                  <td>$X.XX</td>
                  <td>$X.XX</td>
                  <td>+X.X%</td>
                </tr>
              </tbody>
            </table>
          `);
          },
        });

        editor.ui.registry.addButton("price_target_template", {
          text: "Price Target",
          onAction: () => {
            editor.insertContent(
              `<p><strong class="price-target">Price Target: $XXX.XX</strong></p>`
            );
          },
        });

        editor.ui.registry.addButton("rating_template", {
          text: "Rating",
          onAction: () => {
            editor.insertContent(
              `<p><span class="rating-buy">BUY</span> | <span class="rating-hold">HOLD</span> | <span class="rating-sell">SELL</span></p>`
            );
          },
        });

        editor.ui.registry.addButton("company_analysis_template", {
          text: "Company Template",
          onAction: () => {
            editor.insertContent(`
            <h1>Company Analysis</h1>
            
            <h2>Executive Summary</h2>
            <p>[Executive summary content here...]</p>
            
            <h2>Investment Thesis</h2>
            <blockquote>
              <p>[Key investment thesis and rationale...]</p>
            </blockquote>
            
            <h2>Financial Highlights</h2>
            <ul>
              <li><strong>Revenue Growth:</strong> X.X% YoY</li>
              <li><strong>Gross Margin:</strong> XX.X%</li>
              <li><strong>P/E Ratio:</strong> XX.X</li>
              <li><strong>Market Cap:</strong> $X.XB</li>
            </ul>
            
            <h2>Key Risks</h2>
            <ul>
              <li>[Risk factor 1]</li>
              <li>[Risk factor 2]</li>
              <li>[Risk factor 3]</li>
            </ul>
            
            <p><strong class="price-target">Price Target: $XXX.XX</strong></p>
            <p><span class="rating-buy">Rating: BUY</span></p>
          `);
          },
        });

        // Enhanced toolbar with financial tools
        if (plugins.includes("anchor")) {
          editor.ui.registry.addMenuButton("financial_tools", {
            text: "Financial Tools",
            fetch: (callback) => {
              const items = [
                {
                  type: "menuitem",
                  text: "Financial Metrics Table",
                  onAction: () =>
                    editor.execCommand(
                      "mceInsertContent",
                      false,
                      `
                  <table>
                    <thead>
                      <tr><th>Metric</th><th>Value</th><th>Change</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Revenue</td><td>$XXX.X M</td><td>+X.X%</td></tr>
                      <tr><td>Net Income</td><td>$XX.X M</td><td>+X.X%</td></tr>
                    </tbody>
                  </table>
                `
                    ),
                },
                {
                  type: "menuitem",
                  text: "Price Target",
                  onAction: () =>
                    editor.execCommand(
                      "mceInsertContent",
                      false,
                      '<p><strong class="price-target">Price Target: $XXX.XX</strong></p>'
                    ),
                },
                {
                  type: "menuitem",
                  text: "Rating Template",
                  onAction: () =>
                    editor.execCommand(
                      "mceInsertContent",
                      false,
                      '<p><span class="rating-buy">Rating: BUY</span></p>'
                    ),
                },
                {
                  type: "menuitem",
                  text: "Risk Factors List",
                  onAction: () =>
                    editor.execCommand(
                      "mceInsertContent",
                      false,
                      `
                  <h3>Key Risks</h3>
                  <ul>
                    <li>Market volatility</li>
                    <li>Regulatory changes</li>
                    <li>Competition risk</li>
                  </ul>
                `
                    ),
                },
              ];
              callback(items);
            },
          });
        }

        if (ref) {
          ref.current = editor;
        }
        editorRef.current = editor;
      },
    };

    return (
      <div className="tinymce-editor-wrapper">
        <Editor
          apiKey="zris53mu5hrxuotjmo6unfgtc9arkc77ahs5dpq3o6ltw9ku"
          onInit={(evt, editor) => {
            editorRef.current = editor;
            if (ref) {
              ref.current = editor;
            }
          }}
          value={value}
          onEditorChange={handleEditorChange}
          init={initConfig}
          {...props}
        />
      </div>
    );
  }
);

TinyMCEEditor.displayName = "TinyMCEEditor";

// Simple version for smaller content areas (Free Plan)
export const SimpleTinyMCEEditor = forwardRef((props, ref) => {
  return (
    <TinyMCEEditor
      {...props}
      ref={ref}
      height={200}
      plugins="autolink lists link charmap searchreplace visualblocks wordcount help"
      toolbar="undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link | removeformat | help"
      menubar={false}
    />
  );
});

SimpleTinyMCEEditor.displayName = "SimpleTinyMCEEditor";

// Financial version with all financial tools (Free Plan)
export const FinancialTinyMCEEditor = forwardRef((props, ref) => {
  return (
    <TinyMCEEditor
      {...props}
      ref={ref}
      height={400}
      plugins="anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist help"
      toolbar="undo redo | blocks fontsize | bold italic underline | link image table | align | numlist bullist | financial_tools price_target_template rating_template | financial_metrics company_analysis_template | removeformat | help"
      menubar="edit view insert format tools table help"
    />
  );
});

FinancialTinyMCEEditor.displayName = "FinancialTinyMCEEditor";

export default TinyMCEEditor;
