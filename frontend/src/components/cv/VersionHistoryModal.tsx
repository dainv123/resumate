"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Clock, GitCompare, RotateCcw, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cvApi, CV } from "@/lib/cv";
import { useLanguage } from "@/contexts/LanguageContext";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvId: string;
  onRestore?: () => void;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  cvId,
  onRestore,
}: VersionHistoryModalProps) {
  const { t } = useLanguage();
  const [versions, setVersions] = useState<CV[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && cvId) {
      loadVersions();
    }
  }, [isOpen, cvId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      setError(null);
      const versions = await cvApi.getCvVersions(cvId);
      setVersions(versions);
    } catch (err) {
      setError(t("cv.failedLoadVersionHistory"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVersion = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter((id) => id !== versionId));
    } else {
      // Only allow selecting 2 versions for comparison
      setSelectedVersions([...selectedVersions, versionId].slice(-2));
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      // Open comparison view in new window
      window.open(
        `/dashboard/cv/compare?v1=${selectedVersions[0]}&v2=${selectedVersions[1]}`,
        "_blank"
      );
    }
  };

  const handleRestore = async (version: CV) => {
    if (
      window.confirm(
        t("cvSections.versionHistory.restoreConfirm")
      )
    ) {
      try {
        await cvApi.restoreVersion(cvId, version.version);
        onRestore?.(); // Trigger refresh
        onClose();
        // Reload versions to show updated list
        loadVersions();
      } catch (error) {
        setError(t("cvSections.versionHistory.failedRestore"));
        console.error(error);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("cvSections.versionHistory.title")}
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={handleCompare}
            disabled={selectedVersions.length !== 2}>
            <GitCompare className="h-4 w-4 mr-2" />
            {t("cvSections.versionHistory.compareButton", { count: selectedVersions.length })}
          </Button>
          <Button onClick={onClose}>{t("cvSections.versionHistory.closeButton")}</Button>
        </div>
      }>
      <div className="space-y-4">
        {loading && (
          <div className="text-center py-8 text-gray-500">
            {t("cvSections.versionHistory.loading")}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && versions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t("cvSections.versionHistory.noVersions")}
          </div>
        )}

        {!loading && !error && versions.length > 0 && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Tip:</strong> {t("cvSections.versionHistory.compareSelectedTip")}
              </p>
            </div>

            {versions.map((version) => (
              <div
                key={version.id}
                className={`p-4 border rounded-lg transition-all cursor-pointer ${
                  selectedVersions.includes(version.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleSelectVersion(version.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => handleSelectVersion(version.id)}
                      className="mt-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {t("cvSections.versionHistory.versionLabel")} {version.version}
                        </span>
                        {version.isTailored && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {t("cvSections.versionHistory.tailoredBadge")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("cvSections.versionHistory.createdLabel")}: {formatDate(version.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("cvSections.versionHistory.updatedLabel")}: {formatDate(version.updatedAt)}
                      </p>
                      {version.tailoredForJob && (
                        <p className="text-xs text-gray-500 mt-1">
                          <strong>{t("cvSections.versionHistory.forLabel")}:</strong>{" "}
                          {version.tailoredForJob.substring(0, 50)}
                          {version.tailoredForJob.length > 50 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                     onClick={() => {
                       handleRestore(version);
                     }}
                    disabled={(version as any).isHistorical === false}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    {(version as any).isHistorical === false
                      ? t("cvSections.versionHistory.currentButton")
                      : t("cvSections.versionHistory.restoreButton")}
                  </Button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
}
