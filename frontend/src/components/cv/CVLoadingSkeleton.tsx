"use client";

import React from "react";

interface CVLoadingSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

/**
 * Reusable loading skeleton for CV grid
 * SRP: Shows loading state
 * Usage: Can use this in any CV list/grid
 */
export default function CVLoadingSkeleton({
  count = 6,
  viewMode = "grid",
}: CVLoadingSkeletonProps) {
  return (
    <div
      className={
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          : "space-y-4"
      }>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
