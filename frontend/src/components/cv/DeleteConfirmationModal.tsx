"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: DeleteConfirmationModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {t("cv.confirm.delete")}
        </h4>
        <p className="text-gray-600 mb-6">{t("cv.confirm.deleteMessage")}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700">
            {isLoading ? t("common.deleting") : t("cv.delete")}
          </Button>
        </div>
      </div>
    </div>
  );
}
