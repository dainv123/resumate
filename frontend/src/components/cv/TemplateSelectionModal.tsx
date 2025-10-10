"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Download, FileText, Palette } from "lucide-react";

interface TemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: any;
  onExport: (cv: any, format: string, template: string) => void;
}

const templates = [
  {
    id: "professional",
    name: "Professional",
    description: "Clean, traditional single-column layout",
    preview: "Single column with header, sections, and standard formatting",
    color: "#2c3e50",
  },
  {
    id: "two-column",
    name: "Modern Two-Column",
    description: "Professional two-column design with skills progress bars",
    preview:
      "Left column: Contact info & skills, Right column: Experience & education",
    color: "#2c5f5f",
  },
];

export default function TemplateSelectionModal({
  isOpen,
  onClose,
  cv,
  onExport,
}: TemplateSelectionModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "word" | "ats">(
    "pdf"
  );

  const handleExport = () => {
    onExport(cv, selectedFormat, selectedTemplate);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title="Choose Template & Format"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export {selectedFormat.toUpperCase()}
          </Button>
        </div>
      }>
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Format
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
                <div className="font-medium">{format.toUpperCase()}</div>
                <div className="text-sm text-gray-600">
                  {format === "pdf" && "Portable Document"}
                  {format === "word" && "Microsoft Word"}
                  {format === "ats" && "ATS-Friendly Text"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Template Design
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
              <h4 className="font-medium text-blue-900">Template Preview</h4>
              <p className="text-sm text-blue-700 mt-1">
                {selectedTemplate === "two-column"
                  ? "Modern two-column layout with dark teal sidebar, skills progress bars, and professional styling like the image you showed."
                  : "Traditional single-column layout with clean typography and standard sections."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
