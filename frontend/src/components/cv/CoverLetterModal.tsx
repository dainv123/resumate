"use client";

import React, { useState } from "react";
import { Mail, Copy, Download, CheckCircle, Lightbulb } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  coverLetter?: string;
  jobTitle?: string;
  company?: string;
  isLoading?: boolean;
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  coverLetter,
  jobTitle = "Software Engineer",
  company = "Tech Company",
  isLoading = false,
}: CoverLetterModalProps) {
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!coverLetter) return;

    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      showSuccess(t("cv.coverLetterCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      showError(t("cv.failedCopyCoverLetter"));
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;

    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${company
      .toLowerCase()
      .replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showSuccess(t("cv.coverLetterDownloaded"));
  };

  const modalTitle = (
    <div className="flex items-center">
      <Mail className="h-6 w-6 text-blue-600 mr-3" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {t("cv.coverLetter")}
        </h3>
        <p className="text-sm text-gray-600">
          {jobTitle} at {company}
        </p>
      </div>
    </div>
  );

  const modalFooter = (
    <div className="flex justify-end space-x-3 w-full">
      <Button
        onClick={handleCopyToClipboard}
        disabled={!coverLetter || copied}
        variant="outline"
        className="flex items-center space-x-2">
        {copied ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </>
        )}
      </Button>
      <Button
        onClick={handleDownload}
        disabled={!coverLetter}
        className="flex items-center space-x-2">
        <Download className="h-4 w-4" />
        <span>Download</span>
      </Button>
      <Button onClick={onClose} variant="outline">
        {t("common.close")}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="xl"
      headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("cv.generatingCoverLetter")}</p>
            </div>
          </div>
        ) : !coverLetter ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("cv.noCoverLetterAvailable")}
            </h3>
            <p className="text-gray-600">{t("cv.generateCoverLetterText")}</p>
          </div>
        ) : (
          <>
            {/* Cover Letter Content */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {coverLetter}
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-medium text-yellow-900 mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                {t("cv.personalizationTips")}
              </h3>
              <ul className="space-y-2 text-yellow-800">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t("cv.reviewAndCustomizeContent")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t("cv.addSpecificExamples")}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    Include the hiring manager&apos;s name if available
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{t("cv.proofreadGrammarAndSpelling")}</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
