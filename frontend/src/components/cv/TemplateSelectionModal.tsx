"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Download, FileText, Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: any;
  onExport: (cv: any, format: string, template: string) => void;
}

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  cv,
  onExport,
}: TemplateSelectionModalProps) {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "word" | "ats">(
    "pdf"
  );

  const templates = [
    {
      id: "professional",
      name: t("cv.templates.professional.name"),
      description: t("cv.templates.professional.description"),
      preview: t("cv.templates.professional.preview"),
      color: "#2c3e50",
    },
    {
      id: "two-column",
      name: t("cv.templates.twoColumn.name"),
      description: t("cv.templates.twoColumn.description"),
      preview: t("cv.templates.twoColumn.preview"),
      color: "#2c5f5f",
    },
  ];

  const formatLabels: Record<string, { label: string; description: string }> = {
    pdf: {
      label: "PDF",
      description: t("cv.templates.formats.portableDocument"),
    },
    word: {
      label: "WORD",
      description: t("cv.templates.formats.microsoftWord"),
    },
    ats: {
      label: "ATS",
      description: t("cv.templates.formats.atsFriendlyText"),
    },
  };

  const handleExport = () => {
    onExport(cv, selectedFormat, selectedTemplate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t("cv.templates.chooseTemplateFormat")}
      footer={
        <div className="flex justify-start space-x-3 w-full">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleExport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            {t("common.export")} {selectedFormat.toUpperCase()}
          </Button>
        </div>
      }>
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t("cv.templates.exportFormat")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(["pdf", "word", "ats"] as const).map((format) => (
              <button
                key={format}
                onClick={() => setSelectedFormat(format)}
                className={`p-3 border rounded-lg text-center transition-colors ${
                  selectedFormat === format
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}>
                <div className="font-medium">{formatLabels[format].label}</div>
                <div className="text-sm text-gray-600">
                  {formatLabels[format].description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            {t("cv.templates.templateDesign")}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedTemplate === template.id
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}>
                <div className="flex items-start space-x-3">
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1"
                    style={{ backgroundColor: template.color }}
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {template.preview}
                    </p>
                  </div>
                  {selectedTemplate === template.id && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900">{t("cv.templates.templatePreview")}</h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedTemplate === "two-column"
                  ? t("cv.templates.twoColumnPreviewText")
                  : t("cv.templates.professionalPreviewText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
