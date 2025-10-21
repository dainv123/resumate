"use client";

import React, { useState } from "react";
import { CV } from "@/lib/cv";
import CVDisplay, { CVDisplayMode } from "./CVDisplay";
import Button from "@/components/ui/Button";
import { Eye, List, Grid } from "lucide-react";

interface CVDisplayExampleProps {
  cvs: CV[];
  onEdit?: (cv: CV) => void;
  onDelete?: (cv: CV) => void;
  onDuplicate?: (cv: CV) => void;
  onTailor?: (cv: CV) => void;
  onExport?: (
    cv: CV,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => void;
  onUpdate?: (cv: CV) => void;
}

export default function CVDisplayExample({
  cvs,
  onEdit,
  onDelete,
  onDuplicate,
  onTailor,
  onExport,
  onUpdate,
}: CVDisplayExampleProps) {
  const [displayMode, setDisplayMode] = useState<CVDisplayMode>("short");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            CV Display Examples
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Display Mode:
            </span>
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDisplayMode("short")}
                className={`px-3 py-1 text-sm rounded-l-lg transition-colors ${
                  displayMode === "short"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}>
                Short
              </button>
              <button
                onClick={() => setDisplayMode("full")}
                className={`px-3 py-1 text-sm rounded-r-lg transition-colors ${
                  displayMode === "full"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}>
                Full
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-l-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}>
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-r-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CV Display */}
      {cvs.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No CVs found
          </h3>
          <p className="text-gray-600">Upload your first CV to get started</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
          {cvs.map((cv) => (
            <CVDisplay
              key={cv.id}
              cv={cv}
              mode={displayMode}
              showActions={true}
              showRelationships={displayMode === "full"}
              showVersionHistory={displayMode === "full"}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onTailor={onTailor}
              onExport={onExport}
              onUpdate={onUpdate}
              className={viewMode === "list" ? "w-full" : ""}
            />
          ))}
        </div>
      )}

      {/* Usage Examples */}
      <div className="mt-12 p-6 bg-gray-50 dark:bg-slate-800 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Usage Examples
        </h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              Short Mode (Compact Cards):
            </h4>
            <pre className="bg-white dark:bg-slate-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs overflow-x-auto text-gray-900 dark:text-gray-100">
              {`<CVDisplay
  cv={cv}
  mode="short"
  showActions={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              Full Mode (Detailed View):
            </h4>
            <pre className="bg-white dark:bg-slate-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs overflow-x-auto text-gray-900 dark:text-gray-100">
              {`<CVDisplay
  cv={cv}
  mode="full"
  showActions={true}
  showRelationships={true}
  showVersionHistory={true}
  onEdit={handleEdit}
  onTailor={handleTailor}
  onExport={handleExport}
/>`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
              Read-only Mode:
            </h4>
            <pre className="bg-white dark:bg-slate-700 p-3 rounded border border-gray-200 dark:border-gray-600 text-xs overflow-x-auto text-gray-900 dark:text-gray-100">
              {`<CVDisplay
  cv={cv}
  mode="full"
  showActions={false}
  showRelationships={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
