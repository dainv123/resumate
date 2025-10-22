"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";

interface CVRelationshipsProps {
  cv: any;
}

export default function CVRelationships({ cv }: CVRelationshipsProps) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6 border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">
        {t("cv.relationships")}
      </h4>

      {/* Original CV */}
      {cv.originalCvId && (
        <div className="mb-4">
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            {t("cv.originalCv")}
          </h5>
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {t("cv.originalCvDescription")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/cv/${cv.originalCvId}`)}
                className="ml-3">
                {t("cv.viewOriginal")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tailored CVs */}
      {cv.tailoredCvs && cv.tailoredCvs.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">
            {t("cv.tailoredCvs")} ({cv.tailoredCvs.length})
          </h5>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {cv.tailoredCvs.map((tailoredCv: any) => (
              <div
                key={tailoredCv.id}
                className="bg-gray-50 rounded-lg p-3 border hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                      {tailoredCv.originalFileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tailoredCv.createdAt).toLocaleDateString()}
                    </p>
                    {tailoredCv.jobDescription && (
                      <p className="text-xs text-blue-600 mt-1">
                        {t("cv.tailoredFor")}: {tailoredCv.jobDescription.title}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/cv/${tailoredCv.id}`)
                    }
                    className="ml-3">
                    {t("cv.view")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No relationships message */}
      {!cv.originalCvId && (!cv.tailoredCvs || cv.tailoredCvs.length === 0) && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">{t("cv.noRelationships")}</p>
        </div>
      )}
    </div>
  );
}
