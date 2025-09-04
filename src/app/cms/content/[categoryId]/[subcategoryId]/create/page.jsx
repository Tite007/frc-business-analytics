"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  DocumentTextIcon,
  PhotoIcon,
  TableCellsIcon,
  ChartBarIcon,
  CheckIcon as SaveIcon,
  EyeIcon,
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

// Mock data for categories
const categoryNames = {
  1: "Research Reports",
  2: "Analyst Ideas",
};

const subcategoryNames = {
  "1-1": "Mining",
  "1-2": "Technology",
  "1-3": "Real Estate",
  "2-1": "Mining",
  "2-2": "Technology",
  "2-3": "Crypto",
};

// Content block types
const BLOCK_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  TABLE: "table",
  CHART: "chart",
  DIVIDER: "divider",
};

export default function ContentCreatePage() {
  const params = useParams();
  const router = useRouter();
  const { categoryId, subcategoryId } = params;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [contentData, setContentData] = useState({
    title: "",
    description: "",
    status: "draft",
    tags: [],
    coverImage: null,
    blocks: [
      {
        id: Date.now(),
        type: BLOCK_TYPES.TEXT,
        content: "",
        order: 0,
      },
    ],
  });

  const [newTag, setNewTag] = useState("");

  // Add a new content block
  const addBlock = (type) => {
    const newBlock = {
      id: Date.now(),
      type,
      content: getDefaultContent(type),
      order: contentData.blocks.length,
    };

    setContentData({
      ...contentData,
      blocks: [...contentData.blocks, newBlock],
    });
  };

  // Get default content for block type
  const getDefaultContent = (type) => {
    switch (type) {
      case BLOCK_TYPES.TEXT:
        return "";
      case BLOCK_TYPES.IMAGE:
        return { url: "", caption: "", alt: "" };
      case BLOCK_TYPES.TABLE:
        return {
          headers: ["Column 1", "Column 2", "Column 3"],
          rows: [
            ["Data 1", "Data 2", "Data 3"],
            ["Data 4", "Data 5", "Data 6"],
          ],
        };
      case BLOCK_TYPES.CHART:
        return {
          type: "line",
          title: "Chart Title",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr"],
            datasets: [
              {
                label: "Dataset 1",
                data: [10, 20, 30, 40],
              },
            ],
          },
        };
      default:
        return "";
    }
  };

  // Update block content
  const updateBlock = (blockId, newContent) => {
    setContentData({
      ...contentData,
      blocks: contentData.blocks.map((block) =>
        block.id === blockId ? { ...block, content: newContent } : block
      ),
    });
  };

  // Delete block
  const deleteBlock = (blockId) => {
    setContentData({
      ...contentData,
      blocks: contentData.blocks.filter((block) => block.id !== blockId),
    });
  };

  // Move block up/down
  const moveBlock = (blockId, direction) => {
    const blocks = [...contentData.blocks];
    const currentIndex = blocks.findIndex((block) => block.id === blockId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex >= 0 && newIndex < blocks.length) {
      [blocks[currentIndex], blocks[newIndex]] = [
        blocks[newIndex],
        blocks[currentIndex],
      ];
      blocks.forEach((block, index) => {
        block.order = index;
      });

      setContentData({ ...contentData, blocks });
    }
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !contentData.tags.includes(newTag.trim())) {
      setContentData({
        ...contentData,
        tags: [...contentData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setContentData({
      ...contentData,
      tags: contentData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Save content
  const saveContent = async (status = "draft") => {
    setSaving(true);
    try {
      // TODO: Implement API call to save content
      const dataToSave = {
        ...contentData,
        status,
        categoryId,
        subcategoryId,
        updatedAt: new Date().toISOString(),
      };

      console.log("Saving content:", dataToSave);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (status === "published") {
        router.push(`/cms/content/${categoryId}/${subcategoryId}`);
      }
    } catch (error) {
      console.error("Error saving content:", error);
    } finally {
      setSaving(false);
    }
  };

  // Render block based on type
  const renderBlock = (block) => {
    const blockClasses =
      "border border-gray-200 rounded-lg p-4 bg-white relative group hover:border-blue-300 transition-colors";

    switch (block.type) {
      case BLOCK_TYPES.TEXT:
        return (
          <div key={block.id} className={blockClasses}>
            <BlockControls
              block={block}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, e.target.value)}
              placeholder="Start writing your content..."
              className="w-full min-h-[200px] border-none resize-none focus:outline-none text-gray-700"
            />
          </div>
        );

      case BLOCK_TYPES.IMAGE:
        return (
          <div key={block.id} className={blockClasses}>
            <BlockControls
              block={block}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Upload an image or paste URL
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`image-${block.id}`}
                />
                <label
                  htmlFor={`image-${block.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Choose Image
                </label>
              </div>
              <input
                type="text"
                placeholder="Image caption"
                value={block.content.caption || ""}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    caption: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case BLOCK_TYPES.TABLE:
        return (
          <div key={block.id} className={blockClasses}>
            <BlockControls
              block={block}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Data Table</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => {
                      const newContent = { ...block.content };
                      newContent.headers.push(
                        `Column ${newContent.headers.length + 1}`
                      );
                      newContent.rows.forEach((row) => row.push("New Data"));
                      updateBlock(block.id, newContent);
                    }}
                    className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded"
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      const newContent = { ...block.content };
                      newContent.rows.push(
                        new Array(newContent.headers.length).fill("New Data")
                      );
                      updateBlock(block.id, newContent);
                    }}
                    className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded"
                  >
                    Add Row
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      {block.content.headers.map((header, index) => (
                        <th
                          key={index}
                          className="border border-gray-300 px-3 py-2"
                        >
                          <input
                            type="text"
                            value={header}
                            onChange={(e) => {
                              const newHeaders = [...block.content.headers];
                              newHeaders[index] = e.target.value;
                              updateBlock(block.id, {
                                ...block.content,
                                headers: newHeaders,
                              });
                            }}
                            className="w-full border-none bg-transparent text-center font-medium focus:outline-none"
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.content.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-gray-300 px-3 py-2"
                          >
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => {
                                const newRows = [...block.content.rows];
                                newRows[rowIndex][cellIndex] = e.target.value;
                                updateBlock(block.id, {
                                  ...block.content,
                                  rows: newRows,
                                });
                              }}
                              className="w-full border-none bg-transparent text-center focus:outline-none"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case BLOCK_TYPES.CHART:
        return (
          <div key={block.id} className={blockClasses}>
            <BlockControls
              block={block}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Chart title"
                value={block.content.title || ""}
                onChange={(e) =>
                  updateBlock(block.id, {
                    ...block.content,
                    title: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              />

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  Chart configuration will go here
                </p>
                <p className="text-sm text-gray-400">
                  Upload Excel file or configure chart data
                </p>
              </div>
            </div>
          </div>
        );

      case BLOCK_TYPES.DIVIDER:
        return (
          <div key={block.id} className={blockClasses}>
            <BlockControls
              block={block}
              onMove={moveBlock}
              onDelete={deleteBlock}
            />
            <div className="border-t-2 border-gray-300 my-4"></div>
          </div>
        );

      default:
        return null;
    }
  };

  // Block controls component
  const BlockControls = ({ block, onMove, onDelete }) => (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-gray-300 rounded-lg p-1 flex space-x-1">
      <button
        onClick={() => onMove(block.id, "up")}
        className="p-1 text-gray-400 hover:text-gray-600"
        title="Move up"
      >
        ↑
      </button>
      <button
        onClick={() => onMove(block.id, "down")}
        className="p-1 text-gray-400 hover:text-gray-600"
        title="Move down"
      >
        ↓
      </button>
      <button
        onClick={() => onDelete(block.id)}
        className="p-1 text-gray-400 hover:text-red-600"
        title="Delete block"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Content</h1>
            <p className="text-gray-600">
              {categoryNames[categoryId]} › {subcategoryNames[subcategoryId]}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {showPreview ? "Edit" : "Preview"}
          </button>
          <button
            onClick={() => saveContent("draft")}
            disabled={saving}
            className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => saveContent("published")}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CloudArrowUpIcon className="h-4 w-4 mr-2" />
            {saving ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Content Metadata */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={contentData.title}
                onChange={(e) =>
                  setContentData({ ...contentData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter content title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={contentData.description}
                onChange={(e) =>
                  setContentData({
                    ...contentData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Brief description..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {contentData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tag..."
                />
                <button
                  onClick={addTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Content Blocks */}
          <div className="space-y-4">
            {contentData.blocks.map((block) => renderBlock(block))}
          </div>

          {/* Add Block Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add Content Block
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => addBlock(BLOCK_TYPES.TEXT)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DocumentTextIcon className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Text</span>
              </button>

              <button
                onClick={() => addBlock(BLOCK_TYPES.IMAGE)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <PhotoIcon className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Image</span>
              </button>

              <button
                onClick={() => addBlock(BLOCK_TYPES.TABLE)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <TableCellsIcon className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Table</span>
              </button>

              <button
                onClick={() => addBlock(BLOCK_TYPES.CHART)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-8 w-8 text-gray-600 mb-2" />
                <span className="text-sm font-medium">Chart</span>
              </button>

              <button
                onClick={() => addBlock(BLOCK_TYPES.DIVIDER)}
                className="flex flex-col items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="h-8 w-8 flex items-center justify-center mb-2">
                  <div className="h-0.5 w-6 bg-gray-600"></div>
                </div>
                <span className="text-sm font-medium">Divider</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Preview Mode */
        <div className="bg-white rounded-lg shadow p-8">
          <div className="max-w-3xl mx-auto">
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {contentData.title || "Untitled Content"}
              </h1>
              <p className="text-gray-600 mb-4">
                {contentData.description || "No description provided."}
              </p>
              {contentData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contentData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              {contentData.blocks.map((block) => (
                <div key={block.id}>
                  {block.type === BLOCK_TYPES.TEXT && (
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{block.content}</p>
                    </div>
                  )}
                  {block.type === BLOCK_TYPES.IMAGE && (
                    <div className="text-center">
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12">
                        <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Image placeholder</p>
                      </div>
                      {block.content.caption && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          {block.content.caption}
                        </p>
                      )}
                    </div>
                  )}
                  {block.type === BLOCK_TYPES.DIVIDER && (
                    <div className="border-t border-gray-300 my-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
