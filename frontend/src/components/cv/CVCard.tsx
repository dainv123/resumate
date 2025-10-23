"use client";

import React from "react";
import { CV } from "@/lib/cv";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Eye,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Download,
  FileText,
  Calendar,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface CVCardProps {
  cv: CV;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onTailor?: () => void;
  onExport?: (format: "pdf" | "word" | "ats", template?: string) => void;
  viewMode?: "grid" | "list";
}

export default function CVCard({
  cv,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
  onTailor,
  onExport,
  viewMode = "grid",
}: CVCardProps) {
  const { t } = useLanguage();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const getStatusColor = (cv: CV) => {
    if (cv.isTailored) return "bg-purple-100 text-purple-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (cv: CV) => {
    if (cv.isTailored) return t("cvSections.statusLabels.tailored");
    return t("cvSections.statusLabels.original");
  };

  return (
    <div
      className={`h-full flex flex-col bg-white rounded-lg border-2 interactive-card ${
        isSelected ? "border-blue-500 shadow-md" : "border-gray-200"
      } ${viewMode === "list" ? "flex items-center p-4" : ""}`}
      onClick={onSelect}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}>
      {viewMode === "grid" ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start justify-between w-full min-w-0">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <h5
                    className="font-medium text-gray-900 truncate"
                    title={cv.originalFileName}>
                    {cv.originalFileName}
                  </h5>
                  <p className="text-sm text-gray-500">{t("cv.version")} {cv.version}</p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  cv
                )}`}>
                {getStatusText(cv)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* List View Header */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-medium text-gray-900 truncate max-w-[300px]"
                title={cv.originalFileName}>
                {cv.originalFileName}
              </h3>
              <p className="text-sm text-gray-500">
                {t("cv.version")} {cv.version} • {getStatusText(cv)}
              </p>
              <p className="text-xs text-gray-400">
                {t("cv.updatedAt")}: {formatDate(cv.updatedAt)}
              </p>
            </div>
          </div>
        </>
      )}

      {viewMode === "grid" && (
        <>
          {/* Content */}
          <div className="flex-1 p-4 space-y-3">
            {/* Metadata */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{t("cv.createdAt")}: {formatDate(cv.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{t("cv.updatedAt")}: {formatDate(cv.updatedAt)}</span>
              </div>
              {cv.isTailored && cv.tailoredForJob && (
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 flex-shrink-0" />
                  <span
                    className="truncate max-w-full"
                    title={cv.tailoredForJob}>
                    {t("cv.tailoredForJob")}: {cv.tailoredForJob}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Link href={`/dashboard/cv/${cv.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{t("cv.view")}</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                className="flex items-center space-x-1">
                <Edit className="h-4 w-4" />
                <span>{t("cv.edit")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.();
                }}
                className="flex items-center space-x-1">
                <Copy className="h-4 w-4" />
                <span>{t("cv.copy")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTailor?.();
                }}
                className="flex items-center space-x-1">
                <Sparkles className="h-4 w-4" />
                <span>{t("cv.tailor")}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport?.("pdf");
                }}
                className="flex items-center space-x-1">
                <Download className="h-4 w-4" />
                <span>{t("cv.export")}</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{t("cv.id")}: {cv.id.slice(0, 8)}...</span>
              <span>{cv.isTailored ? t("cvSections.statusLabels.tailored") : t("cvSections.statusLabels.original")}</span>
            </div>
          </div>
        </>
      )}

      {viewMode === "list" && (
        <>
          {/* List View Actions - Same functionality as grid */}
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/cv/${cv.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{t("cv.view")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="flex items-center space-x-1">
              <Edit className="h-4 w-4" />
              <span>{t("cv.edit")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate?.();
              }}
              className="flex items-center space-x-1">
              <Copy className="h-4 w-4" />
              <span>{t("cv.copy")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTailor?.();
              }}
              className="flex items-center space-x-1">
              <Sparkles className="h-4 w-4" />
              <span>{t("cv.tailor")}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onExport?.("pdf");
              }}
              className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{t("cv.export")}</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
