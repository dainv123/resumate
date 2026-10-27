"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { cvApi, QuickBuildCvData } from "@/lib/cv";
import {
  Eye,
  Download,
  Star,
  Sparkles,
  Briefcase,
  Palette,
  Code,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface Template {
  id: string;
  name: string;
  type: "professional" | "creative" | "technical";
  description: string;
  features: string[];
  preview: string;
  badge?: "popular" | "new" | "recommended";
  colors: string[];
}

const TemplateGallery: React.FC = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates: Template[] = [
    {
      id: "professional",
      name: t("templateGallery.professional.name"),
      type: "professional",
      description: t("templateGallery.professional.description"),
      features: [
        "Clean & Modern",
        "ATS-friendly",
        "2-column layout",
        "Corporate style",
      ],
      preview: "/api/preview/professional",
      badge: "popular",
      colors: ["#2563eb", "#1e40af", "#1e3a8a"],
    },
    {
      id: "creative",
      name: t("templateGallery.creative.name"),
      type: "creative",
      description: t("templateGallery.creative.description"),
      features: [
        "Colorful design",
        "Visual elements",
        "Creative layout",
        "Portfolio showcase",
      ],
      preview: "/api/preview/creative",
      badge: "new",
      colors: ["#7c3aed", "#5b21b6", "#4c1d95"],
    },
    {
      id: "technical",
      name: t("templateGallery.technical.name"),
      type: "technical",
      description: t("templateGallery.technical.description"),
      features: [
        "Code-friendly",
        "Skills focus",
        "Project emphasis",
        "Tech stack display",
      ],
      preview: "/api/preview/technical",
      badge: "recommended",
      colors: ["#059669", "#047857", "#065f46"],
    },
  ];

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case "professional":
        return <Briefcase className="h-6 w-6" />;
      case "creative":
        return <Palette className="h-6 w-6" />;
      case "technical":
        return <Code className="h-6 w-6" />;
      default:
        return <Sparkles className="h-6 w-6" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "popular":
        return "bg-orange-100 text-orange-800";
      case "new":
        return "bg-green-100 text-green-800";
      case "recommended":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = async (template: Template) => {
    setIsGenerating(true);
    try {
      // Create sample CV data for the template
      const sampleData: QuickBuildCvData = {
        name: "John Doe",
        email: "john.doe@example.com",
        targetRole: "Software Engineer",
        jobDescription:
          "Looking for a software engineer position with focus on web development",
        template: template.id,
      };

      const generatedCv = await cvApi.quickBuildCv(sampleData);
      showSuccess(`${template.name} template applied successfully!`);

      // Redirect to CV editor or dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error using template:", error);
      showError("Failed to apply template");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      {/* <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("templateGallery.title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {t("templateGallery.subtitle")}
        </p>
      </div> */}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* Template Preview */}
            <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div className="absolute top-4 right-4">
                {template.badge && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                      template.badge
                    )}`}>
                    {t(`templateGallery.${template.badge}`)}
                  </span>
                )}
              </div>

              {/* Template Visual */}
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="mb-4 text-gray-400">
                    {getTemplateIcon(template.type)}
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-300 rounded w-20 mx-auto"></div>
                    <div className="h-2 bg-gray-300 rounded w-16 mx-auto"></div>
                    <div className="h-2 bg-gray-300 rounded w-12 mx-auto"></div>
                  </div>
                </div>
              </div>

              {/* Color Palette */}
              <div className="absolute bottom-4 left-4 flex space-x-1">
                {template.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900">
                  {template.name}
                </h3>
                <div className="flex items-center text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm font-medium">4.8</span>
                </div>
              </div>

              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {template.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Key Features:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePreview(template)}
                  className="flex-1 flex items-center justify-center gap-2">
                  <Eye className="h-4 w-4" />
                  {t("templateGallery.preview")}
                </Button>
                <Button
                  onClick={() => handleUseTemplate(template)}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("templateGallery.useTemplate")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`${selectedTemplate?.name} Template Preview`}
        size="xl">
        {selectedTemplate && (
          <div className="space-y-6">
            {/* Template Preview */}
            <div className="bg-gray-50 rounded-lg p-8 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-6 text-gray-400">
                  {getTemplateIcon(selectedTemplate.type)}
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-300 rounded w-32 mx-auto"></div>
                  <div className="h-3 bg-gray-300 rounded w-24 mx-auto"></div>
                  <div className="h-3 bg-gray-300 rounded w-28 mx-auto"></div>
                  <div className="h-3 bg-gray-300 rounded w-20 mx-auto"></div>
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  Template preview will be available soon
                </p>
              </div>
            </div>

            {/* Template Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Description
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Features</h4>
                <ul className="space-y-2">
                  {selectedTemplate.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
                className="flex-1">
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleUseTemplate(selectedTemplate);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Sparkles className="h-4 w-4" />
                {t("templateGallery.useTemplate")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateGallery;
