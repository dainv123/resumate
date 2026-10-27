"use client";

import { useState, useEffect } from "react";
import type { TemplateSection, TemplateConfig } from "./TemplateSelector";
import { useLanguage } from "@/contexts/LanguageContext";

interface SectionCustomizerProps {
  templateConfig: TemplateConfig;
  customSections?: Partial<TemplateSection>;
  onCustomSectionsChange: (sections: Partial<TemplateSection>) => void;
}

export default function SectionCustomizer({
  templateConfig,
  customSections = {},
  onCustomSectionsChange,
}: SectionCustomizerProps) {
  const { t } = useLanguage();
  const [sections, setSections] = useState<Partial<TemplateSection>>(() => {
    // Initialize with template defaults merged with custom sections
    return { ...templateConfig.sections, ...customSections };
  });

  useEffect(() => {
    // Update when template changes
    setSections({ ...templateConfig.sections, ...customSections });
  }, [templateConfig, customSections]);

  const handleToggle = (sectionKey: keyof TemplateSection) => {
    const newSections = {
      ...sections,
      [sectionKey]: !sections[sectionKey],
    };
    setSections(newSections);

    // Only send changed sections, not all
    const changedSections: Partial<TemplateSection> = {};
    Object.entries(newSections).forEach(([key, value]) => {
      if (value !== templateConfig.sections[key as keyof TemplateSection]) {
        changedSections[key as keyof TemplateSection] = value;
      }
    });
    onCustomSectionsChange(changedSections);
  };

  const getSectionInfo = (): {
    [key in keyof TemplateSection]: {
      label: string;
      description: string;
      icon: string;
    };
  } => ({
    hero: {
      label: t("portfolioSections.sectionCustomizer.sections.hero.label"),
      description: t("portfolioSections.sectionCustomizer.sections.hero.description"),
      icon: "🎯",
    },
    about: {
      label: t("portfolioSections.sectionCustomizer.sections.about.label"),
      description: t("portfolioSections.sectionCustomizer.sections.about.description"),
      icon: "📝",
    },
    skills: {
      label: t("portfolioSections.sectionCustomizer.sections.skills.label"),
      description: t("portfolioSections.sectionCustomizer.sections.skills.description"),
      icon: "💡",
    },
    experience: {
      label: t("portfolioSections.sectionCustomizer.sections.experience.label"),
      description: t("portfolioSections.sectionCustomizer.sections.experience.description"),
      icon: "💼",
    },
    education: {
      label: t("portfolioSections.sectionCustomizer.sections.education.label"),
      description: t("portfolioSections.sectionCustomizer.sections.education.description"),
      icon: "🎓",
    },
    projects: {
      label: t("portfolioSections.sectionCustomizer.sections.projects.label"),
      description: t("portfolioSections.sectionCustomizer.sections.projects.description"),
      icon: "🚀",
    },
    certifications: {
      label: t("portfolioSections.sectionCustomizer.sections.certifications.label"),
      description: t("portfolioSections.sectionCustomizer.sections.certifications.description"),
      icon: "📜",
    },
    awards: {
      label: t("portfolioSections.sectionCustomizer.sections.awards.label"),
      description: t("portfolioSections.sectionCustomizer.sections.awards.description"),
      icon: "🏆",
    },
    contact: {
      label: t("portfolioSections.sectionCustomizer.sections.contact.label"),
      description: t("portfolioSections.sectionCustomizer.sections.contact.description"),
      icon: "📧",
    },
  });

  const sectionInfo = getSectionInfo();

  if (!templateConfig.allowCustomization) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h4 className="font-medium text-yellow-900">{t("portfolioSections.sectionCustomizer.fixedTemplate")}</h4>
            <p className="text-sm text-yellow-700 mt-1">
              {t("portfolioSections.sectionCustomizer.fixedTemplateDesc", { name: templateConfig.name })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">{t("portfolioSections.sectionCustomizer.title")}</h3>
        <p className="text-gray-600">
          {t("portfolioSections.sectionCustomizer.subtitle")}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> {t("portfolioSections.sectionCustomizer.tip")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(sectionInfo) as Array<keyof TemplateSection>).map(
          (sectionKey) => {
            const info = sectionInfo[sectionKey];
            const isEnabled = sections[sectionKey] ?? false;
            const isTemplateDefault = templateConfig.sections[sectionKey];

            return (
              <div
                key={sectionKey}
                onClick={() => handleToggle(sectionKey)}
                className={`
                relative cursor-pointer rounded-lg border-2 p-4 transition-all
                ${
                  isEnabled
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 opacity-60"
                }
                hover:shadow-md
              `}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0">{info.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {info.label}
                      </h4>
                      {!isTemplateDefault && isEnabled && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          {t("portfolioSections.sectionCustomizer.addedBadge")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {info.description}
                    </p>
                  </div>

                  {/* Toggle */}
                  <div className="flex-shrink-0">
                    <div
                      className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${isEnabled ? "bg-blue-600" : "bg-gray-300"}
                    `}>
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${isEnabled ? "translate-x-7" : "translate-x-1"}
                      `}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
