"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/cv";
import Button from "@/components/ui/Button";
import { Edit, Share2, Copy, Download, Settings, Trash2, Pencil } from "lucide-react";
import { TemplateConfig } from "@/types/cv.types";

interface CVActionsProps {
  cv: any;
  onShowDeleteConfirm: () => void;
  onShowTemplateConfig: (format: "pdf" | "word" | "ats") => void;
  onShowJobDescription?: () => void;
  onShowMatchingAnalysis?: () => void;
  onShowCoverLetter?: () => void;
  onRename?: () => void;
  onExport: (
    format: "pdf" | "word" | "ats",
    template?: string,
    templateConfig?: TemplateConfig
  ) => Promise<void>;
}

export default function CVActions({
  cv,
  onShowDeleteConfirm,
  onShowTemplateConfig,
  onShowJobDescription,
  onShowMatchingAnalysis,
  onShowCoverLetter,
  onRename,
  onExport,
}: CVActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { showSuccess } = useToast();
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: cvApi.duplicateCv,
    onSuccess: (newCv) => {
      showSuccess(t("dashboard.duplicateCvSuccess"));
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const handleDuplicate = () => {
    if (cv) {
      duplicateMutation.mutate(cv.id);
    }
  };

  const handleExportWithConfig = (format: "pdf" | "word" | "ats") => {
    onShowTemplateConfig(format);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {t("cv.actions")}
      </h4>

      <div className="space-y-3">
        {/* Edit - Always available */}
        <Button
          onClick={() => router.push(`/dashboard/cv/${cv.id}/edit`)}
          className="w-full flex items-center justify-center space-x-2">
          <Edit className="h-4 w-4" />
          <span>{t("cv.edit")}</span>
        </Button>

        {onRename ? (
          <Button
            variant="outline"
            onClick={onRename}
            className="w-full flex items-center justify-center space-x-2">
            <Pencil className="h-4 w-4" />
            <span>{t("cv.rename")}</span>
          </Button>
        ) : null}

        {/* Tailor - Always available */}
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/job-tailor?cvId=${cv.id}`)}
          className="w-full flex items-center justify-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>{t("cv.tailor")}</span>
        </Button>

        {/* Job Description - Only show if job description exists */}
        {cv.jobDescription &&
          cv.jobDescription.title !== "No job description available" && (
            <Button
              variant="outline"
              onClick={onShowJobDescription}
              className="w-full flex items-center justify-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>{t("cv.viewJobDescription")}</span>
            </Button>
          )}

        {/* Matching Analysis - Only show if analysis exists */}
        {cv.matchingAnalysis && cv.matchingAnalysis.score > 0 && (
          <Button
            variant="outline"
            onClick={onShowMatchingAnalysis}
            className="w-full flex items-center justify-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>{t("cv.matchingAnalysis")}</span>
          </Button>
        )}

        {/* Cover Letter - Only show if cover letter exists */}
        {cv.coverLetter && cv.coverLetter.trim() !== "" && (
          <Button
            variant="outline"
            onClick={onShowCoverLetter}
            className="w-full flex items-center justify-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>{t("cv.coverLetter")}</span>
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleDuplicate}
          disabled={duplicateMutation.isPending}
          className="w-full flex items-center justify-center space-x-2">
          <Copy className="h-4 w-4" />
          <span>
            {duplicateMutation.isPending
              ? t("common.loading")
              : t("cv.duplicate")}
          </span>
        </Button>

        {/* Export - Only show if CV has been parsed */}
        {cv.parsedData && (
          <div className="pt-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t("cv.export")}
            </h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportWithConfig("pdf")}
                className="w-full flex items-center justify-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>{t("cv.customPDF")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("pdf")}
                className="w-full flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>{t("cv.pdf")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("word")}
                className="w-full flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>{t("cv.word")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onExport("ats")}
                className="w-full flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>{t("cv.ats")}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Delete - Always available */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShowDeleteConfirm}
          className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          <span>{t("cv.delete")}</span>
        </Button>
      </div>
    </div>
  );
}
