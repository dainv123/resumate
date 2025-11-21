"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Copy, Mail, Lightbulb } from "lucide-react";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetter?: string;
  title?: string;
  size?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  coverLetter,
  title,
  size = "xl",
  footer,
  children,
}: CoverLetterModalProps) {
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      showSuccess(t("jobTailor.coverLetter.copied") || "Copied to clipboard!");
    }
  };

  const handleClose = () => {
    onClose();
  };

  // If children are provided, use custom implementation
  if (children) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title || t("jobTailor.coverLetter.title")}
        size={size}
        footer={footer}>
        {children}
      </Modal>
    );
  }

  // Default implementation
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("jobTailor.coverLetter.title")}
      size="xl"
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="outline" onClick={handleClose}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Copy className="h-4 w-4" />
            {t("jobTailor.coverLetter.copy")}
          </Button>
        </div>
      }>
      <div className="space-y-4">
        {/* Description */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Mail className="h-4 w-4" />
            <span className="font-medium">
              {t("jobTailor.coverLetter.desc")}
            </span>
          </div>
        </div>

        {/* Cover Letter Content */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
            {coverLetter}
          </pre>
        </div>

        {/* Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">
                {t("jobTailor.coverLetter.tips")}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>{t("jobTailor.coverLetter.tip1")}</li>
                <li>{t("jobTailor.coverLetter.tip2")}</li>
                <li>{t("jobTailor.coverLetter.tip3")}</li>
                <li>{t("jobTailor.coverLetter.tip4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
