"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CVMetadataProps {
  cv: any;
}

export default function CVMetadata({ cv }: CVMetadataProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6 border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {t("cv.detail")}
      </h4>
      <div className="space-y-2 text-sm">
        <div>
          <strong>{t("cv.created")}:</strong>{" "}
          {new Date(cv.createdAt).toLocaleDateString()}
        </div>
        <div>
          <strong>{t("cv.updated")}:</strong>{" "}
          {new Date(cv.updatedAt).toLocaleDateString()}
        </div>
        <div>
          <strong>{t("cv.version")}:</strong> {cv.version}
        </div>
        {cv.isTailored && (
          <div>
            <strong>{t("cv.tailored")}:</strong>{" "}
            {cv.tailoredForJob ? t("common.yes") : t("common.no")}
          </div>
        )}
      </div>
    </div>
  );
}
