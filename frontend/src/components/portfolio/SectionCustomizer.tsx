"use client";

import { useState, useEffect } from "react";
import type { TemplateSection, TemplateConfig } from "./TemplateSelector";

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

  const sectionInfo: {
    [key in keyof TemplateSection]: {
      label: string;
      description: string;
      icon: string;
    };
  } = {
    hero: {
      label: "Hero Section",
      description: "Main header with name and bio",
      icon: "🎯",
    },
    about: {
      label: "About Me",
      description: "Professional summary/bio",
      icon: "📝",
    },
    skills: {
      label: "Skills",
      description: "Technical and soft skills",
      icon: "💡",
    },
    experience: {
      label: "Work Experience",
      description: "Employment history",
      icon: "💼",
    },
    education: {
      label: "Education",
      description: "Academic background",
      icon: "🎓",
    },
    projects: {
      label: "Projects",
      description: "Portfolio projects showcase",
      icon: "🚀",
    },
    certifications: {
      label: "Certifications",
      description: "Professional certifications",
      icon: "📜",
    },
    awards: {
      label: "Awards",
      description: "Recognition and achievements",
      icon: "🏆",
    },
    contact: {
      label: "Contact Links",
      description: "Social media and contact info",
      icon: "📧",
    },
  };

  if (!templateConfig.allowCustomization) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div>
            <h4 className="font-medium text-yellow-900">Fixed Template</h4>
            <p className="text-sm text-yellow-700 mt-1">
              The &ldquo;{templateConfig.name}&rdquo; template has a fixed
              layout and cannot be customized. All sections will be displayed
              based on your available data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Customize Sections</h3>
        <p className="text-gray-600">
          Choose which sections to display in your portfolio. Deselected
          sections will be hidden.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> Sections will only appear if you have data for
          them. For example, if you don&apos;t have any certifications, that
          section won&apos;t be shown even if enabled.
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
                          Added
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
