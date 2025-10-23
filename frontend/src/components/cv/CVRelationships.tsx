"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import { ChevronRight, FileText, Zap } from "lucide-react";

interface CVRelationshipsProps {
  cv: any;
}

export default function CVRelationships({ cv }: CVRelationshipsProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const hasRelationships =
    cv.originalCvId || (cv.tailoredCvs && cv.tailoredCvs.length > 0);

  return (
    <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <h4 className="text-lg font-bold text-gray-900">
          {t("cv.relationships")}
        </h4>
      </div>

      {hasRelationships ? (
        <div className="space-y-4">
          {/* Original CV */}
          {cv.originalCvId && (
            <div className="group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                  {t("cv.originalCv")}
                </span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-amber-300 hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {t("cv.originalCvDescription")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/cv/${cv.originalCvId}`)}
                    className="ml-3 flex items-center gap-2 whitespace-nowrap hover:bg-amber-50 hover:border-amber-300">
                    {t("cv.viewOriginal")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tailored CVs */}
          {cv.tailoredCvs && cv.tailoredCvs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  {t("cv.tailoredCvs")} <span className="ml-1.5 font-bold text-blue-600">({cv.tailoredCvs.length})</span>
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cv.tailoredCvs.map((tailoredCv: any) => (
                  <div
                    key={tailoredCv.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 group/card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {tailoredCv.originalFileName}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(tailoredCv.createdAt).toLocaleDateString()}
                        </p>
                        {tailoredCv.jobDescription && (
                          <div className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1.5 rounded-md inline-block max-w-[250px] truncate">
                            <span className="font-medium">{t("cv.tailoredFor")}:</span>{" "}
                            {tailoredCv.jobDescription.title}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/cv/${tailoredCv.id}`)
                        }
                        className="ml-3 flex items-center gap-2 whitespace-nowrap hover:bg-blue-50 hover:border-blue-300">
                        {t("cv.view")}
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* No relationships message */
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-3 bg-gray-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {t("cv.noRelationships")}
          </p>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
}
