"use client";

import React, { useState } from "react";
import { useCvsPaginated } from "@/hooks/useCvs";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCVActions } from "@/hooks/useCVActions";
import CVGrid from "@/components/cv/CVGrid";
import CVLoadingSkeleton from "@/components/cv/CVLoadingSkeleton";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const { data, isLoading, error } = useCvsPaginated({
    page: 1,
    limit: showAll ? 20 : limit,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  const {
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleTailor,
    handleExport,
    deleteMutation,
  } = useCVActions();

  const allCvs = data?.data ?? [];
  const displayCvs = showAll ? allCvs : allCvs.slice(0, limit);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("dashboard.recentCvs")}
        </h2>
        <CVLoadingSkeleton count={limit} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{t("cv.loadError")}</p>
      </div>
    );
  }

  // Empty state
  if (allCvs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("dashboard.recentCvs")}
        </h2>
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
    <>
      <div className="space-y-4">
        {/* Header */}
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

        {/* Grid */}
        <CVGrid
          cvs={displayCvs}
          onEdit={handleEdit}
          onDelete={(id) => setShowDeleteConfirm(id)}
          onDuplicate={handleDuplicate}
          onTailor={handleTailor}
          onExport={(id, format) => handleExport(id, allCvs, format)}
        />

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

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t("cv.deleteConfirmTitle")}
            </h3>
            <p className="text-gray-600 mb-6">{t("cv.deleteConfirmMessage")}</p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                disabled={deleteMutation.isPending}>
                {deleteMutation.isPending
                  ? t("common.deleting")
                  : t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
