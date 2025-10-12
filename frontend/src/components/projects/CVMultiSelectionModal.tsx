"use client";

import React, { useState, useMemo, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CV } from "@/lib/cv";
import { formatDate } from "@/lib/utils";
import { FileText, Search, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CVMultiSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvs: CV[];
  selectedCvIds: string[];
  onConfirm: (selectedCvIds: string[]) => void;
  isLoading?: boolean;
}

export default function CVMultiSelectionModal({
  isOpen,
  onClose,
  cvs,
  selectedCvIds: initialSelectedCvIds,
  onConfirm,
  isLoading = false,
}: CVMultiSelectionModalProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCvIds, setSelectedCvIds] =
    useState<string[]>(initialSelectedCvIds);

  // Sync with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCvIds(initialSelectedCvIds);
    }
  }, [isOpen, initialSelectedCvIds]);

  // Filter CVs based on search
  const filteredCvs = useMemo(() => {
    if (!searchTerm.trim()) return cvs;

    const search = searchTerm.toLowerCase();
    return cvs.filter(
      (cv) =>
        cv.parsedData.name.toLowerCase().includes(search) ||
        cv.originalFileName.toLowerCase().includes(search)
    );
  }, [cvs, searchTerm]);

  const handleToggleCv = (cvId: string) => {
    setSelectedCvIds((prev) =>
      prev.includes(cvId) ? prev.filter((id) => id !== cvId) : [...prev, cvId]
    );
  };

  const handleSelectAll = () => {
    setSelectedCvIds(filteredCvs.map((cv) => cv.id));
  };

  const handleDeselectAll = () => {
    setSelectedCvIds([]);
  };

  const handleConfirm = () => {
    onConfirm(selectedCvIds);
    // Modal will close automatically when API call succeeds (handled by parent component)
  };

  const handleClose = () => {
    setSearchTerm("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("projects.selectCVsToManage")}
      size="lg"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-600">
            {t("projects.selectedCount", { count: selectedCvIds.length })}
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleClose}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              loading={isLoading}>
              {t("projects.updateCVs")}
            </Button>
          </div>
        </div>
      }>
      <div className="space-y-4">
        {/* Search */}
        {cvs.length > 3 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("projects.searchCVs")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Bulk actions */}
        {filteredCvs.length > 0 && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              {t("projects.selectMultipleCVsDescription")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="text-blue-600 hover:text-blue-700 font-medium">
                {t("common.selectAll")}
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-blue-600 hover:text-blue-700 font-medium">
                {t("common.deselectAll")}
              </button>
            </div>
          </div>
        )}

        {/* CV List with checkboxes */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredCvs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                {searchTerm
                  ? t("projects.noCVsMatch")
                  : t("projects.noCVsAvailable")}
              </p>
            </div>
          ) : (
            filteredCvs.map((cv) => (
              <label
                key={cv.id}
                className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedCvIds.includes(cv.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}>
                <input
                  type="checkbox"
                  checked={selectedCvIds.includes(cv.id)}
                  onChange={() => handleToggleCv(cv.id)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {cv.parsedData.name}
                    </h4>
                    {cv.isTailored && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {t("cv.tailored")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {cv.originalFileName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      {t("cv.version")} {cv.version}
                    </span>
                    <span>•</span>
                    <span>
                      {t("cv.updated")} {formatDate(cv.updatedAt)}
                    </span>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        {/* Stats */}
        {filteredCvs.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {t("projects.showingCVs", {
              count: filteredCvs.length,
              total: cvs.length,
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
