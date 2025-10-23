"use client";

import React from "react";
import { CV } from "@/lib/cv";
import CVCard from "./CVCard";

interface CVGridProps {
  cvs: CV[];
  onEdit?: (cvId: string) => void;
  onDelete?: (cvId: string) => void;
  onDuplicate?: (cvId: string) => void;
  onTailor?: (cvId: string) => void;
  onExport?: (cvId: string, format: "pdf" | "word" | "ats") => void;
  viewMode?: "grid" | "list";
  className?: string;
}

/**
 * Reusable component for displaying CV cards in a grid or list
 * SRP: Handles only layout and rendering
 * Usage: Can use this in dashboard, list pages, search results, etc.
 */
export default function CVGrid({
  cvs,
  onEdit,
  onDelete,
  onDuplicate,
  onTailor,
  onExport,
  viewMode = "grid",
  className = "",
}: CVGridProps) {
  return (
    <div
      className={
        viewMode === "grid"
          ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`
          : `space-y-4 ${className}`
      }>
      {cvs.map((cv) => (
        <CVCard
          key={cv.id}
          cv={cv}
          onEdit={() => onEdit?.(cv.id)}
          onDelete={() => onDelete?.(cv.id)}
          onDuplicate={() => onDuplicate?.(cv.id)}
          onTailor={() => onTailor?.(cv.id)}
          onExport={(format) => onExport?.(cv.id, format)}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}
