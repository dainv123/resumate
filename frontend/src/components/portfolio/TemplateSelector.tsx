"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { portfolioApi, PortfolioTemplateMetadata } from "@/lib/portfolio";

export interface TemplateSection {
  hero: boolean;
  about: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  projects: boolean;
  certifications: boolean;
  awards: boolean;
  contact: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection;
  allowCustomization: boolean;
  previewImage?: string;
}

interface TemplateSelectorProps {
  selectedTemplate?: string;
  onSelectTemplate: (templateId: string, config: TemplateConfig) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const { t } = useLanguage();

  // Use React Query with caching to prevent duplicate calls
  const {
    data: templatesData = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-templates"],
    queryFn: portfolioApi.getTemplates,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (templates rarely change)
    retry: 2,
  });

  // Transform templates
  const templates = useMemo(() => {
    return templatesData.map((t: PortfolioTemplateMetadata) => ({
      id: t.name,
      name: t.displayName,
      description: t.description,
      sections: t.metadata.sections,
      allowCustomization: t.metadata.allowCustomization,
      previewImage: undefined,
    }));
  }, [templatesData]);

  const error = queryError ? t("portfolio.templateSelection.error") : null;

  const getSectionsList = (sections: TemplateSection): string[] => {
    const sectionNames: { [key in keyof TemplateSection]: string } = {
      hero: "Hero",
      about: "About",
      skills: "Skills",
      experience: "Experience",
      education: "Education",
      projects: "Projects",
      certifications: "Certifications",
      awards: "Awards",
      contact: "Contact",
    };

    return (
      Object.entries(sections)
        ?.filter(([, enabled]) => enabled)
        ?.map(([key]) => sectionNames[key as keyof TemplateSection]) || []
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold mb-2">⚠️ {t("common.error")}</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t("portfolio.templateSelection.retry")}
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-gray-600 text-center">
          <p className="text-lg font-semibold mb-2">
            📭 {t("portfolio.templateSelection.noTemplates")}
          </p>
          <p className="text-sm">
            {t("portfolio.templateSelection.contactAdmin")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-xl font-semibold mb-2">
          {t("portfolio.templateSelection.title")}
        </h4>
        <p className="text-gray-600">
          {t("portfolio.templateSelection.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template.id, template)}
            className={`
              relative cursor-pointer rounded-lg border-2 p-6 transition-all hover:shadow-lg
              ${
                selectedTemplate === template.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400"
              }
            `}>
            {/* Template Preview Image */}
            {template.previewImage && (
              <div className="mb-4 rounded-md overflow-hidden">
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Template Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold">{template.name}</h5>
                {selectedTemplate === template.id && (
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <p className="text-sm text-gray-600">{template.description}</p>

              {/* Sections Preview */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {t("portfolio.templateSelection.includes")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {getSectionsList(template.sections).map((section) => (
                    <span
                      key={section}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {section}
                    </span>
                  ))}
                </div>
              </div>

              {/* Customization Badge */}
              {template.allowCustomization && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{t("portfolio.templateSelection.customizable")}</span>
                </div>
              )}
            </div>

            {/* Selection Overlay */}
            {/* {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Selected
              </div>
            )} */}
          </div>
        ))}
      </div>
    </div>
  );
}
