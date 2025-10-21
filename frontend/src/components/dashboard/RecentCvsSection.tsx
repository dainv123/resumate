"use client";

import React, { useState } from "react";
import { useCvsPaginated } from "@/hooks/useCvs";
import { useLanguage } from "@/contexts/LanguageContext";
import CVCard from "@/components/cv/CVCard";
import Button from "@/components/ui/Button";
import { Eye, Plus } from "lucide-react";
import Link from "next/link";

interface RecentCvsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function RecentCvsSection({
  limit = 6,
  showViewAll = true,
}: RecentCvsSectionProps) {
  const { t } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, error } = useCvsPaginated({
    page: 1,
    limit: showAll ? 20 : limit,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const allCvs = data?.data ?? [];
  const displayCvs = showAll ? allCvs : allCvs.slice(0, limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("dashboard.recentCvs")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load recent CVs</p>
      </div>
    );
  }

  if (allCvs.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("dashboard.recentCvs")}
          </h2>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            {t("dashboard.noCvs")}
          </h3>
          <p className="text-yellow-600 mb-4">
            {t("dashboard.noCvsDescription")}
          </p>
          <Link href="/dashboard/cv/create">
            <Button className="inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>{t("dashboard.createFirstCv")}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("dashboard.recentCvs")}
        </h2>
        {showViewAll && !showAll && allCvs.length > limit && (
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
            className="text-sm">
            {t("dashboard.viewAll")} ({allCvs.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayCvs.map((cv) => (
          <CVCard
            key={cv.id}
            cv={cv}
            onEdit={() => console.log("Edit CV:", cv.id)}
            onDelete={() => console.log("Delete CV:", cv.id)}
            onDuplicate={() => console.log("Duplicate CV:", cv.id)}
            onTailor={() => console.log("Tailor CV:", cv.id)}
            onExport={(format, template) =>
              console.log("Export CV:", cv.id, format, template)
            }
          />
        ))}
      </div>

      {/* Load More Button - Removed since we're using pagination now */}

      {/* View All Link */}
      {!showAll && allCvs.length > limit && (
        <div className="text-center">
          <Link href="/dashboard/cv">
            <Button
              variant="outline"
              className="inline-flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{t("dashboard.viewAllCvs")}</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
