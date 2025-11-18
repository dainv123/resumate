"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { cvApi } from "@/lib/cv";
import { CVData } from "@/types/cv.types";
import { CVUtils } from "@/utils/cv.utils";
import Button from "@/components/ui/Button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DynamicFormEditor from "@/components/cv/DynamicFormEditor";
import { Save, Eye } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

// Use system's standard CV data structure
const getDefaultCVData = (): CVData => CVUtils.createEmptyCV();

export default function CVCreatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [isEditing] = useState(true); // Always in edit mode for create
  const [formData, setFormData] = useState<CVData>(getDefaultCVData());
  const [originalFileName, setOriginalFileName] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: { parsedData: CVData; originalFileName: string }) => {
      // Use the new createCv API
      return cvApi.createCv(data.originalFileName, data.parsedData);
    },
    onSuccess: (newCv) => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      showSuccess(t("dashboard.createCvSuccess"));
      // Redirect to detail page of the newly created CV
      router.push(`/dashboard/cv/${newCv.id}`);
    },
    onError: (error: any) => {
      showError(error?.message || t("dashboard.createCvFailed"));
    },
  });

  const handleSave = () => {
    if (!formData) return;

    createMutation.mutate({
      parsedData: formData,
      originalFileName,
    });
  };

  const handlePreview = () => {
    // Open preview in new tab
    const previewWindow = window.open("", "_blank");
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>CV Preview - ${originalFileName}</title>
            <style>
              body { font-family: Inter, sans-serif; margin: 20px; line-height: 1.6; }
              .header { border-bottom: 2px solid #3B82F6; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section-title { font-size: 18px; font-weight: bold; color: #3B82F6; margin-bottom: 10px; }
              .contact-info { display: flex; flex-wrap: wrap; gap: 15px; }
              .contact-item { margin-right: 20px; }
              .experience-item, .education-item { margin-bottom: 15px; padding: 10px; border-left: 3px solid #3B82F6; padding-left: 15px; }
              .skills { display: flex; flex-wrap: wrap; gap: 8px; }
              .skill-tag { background: #E5E7EB; padding: 4px 8px; border-radius: 4px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${formData.contact.name || "Your Name"}</h1>
              <div class="contact-info">
                ${
                  formData.contact.email
                    ? `<div class="contact-item">📧 ${formData.contact.email}</div>`
                    : ""
                }
                ${
                  formData.contact.phone
                    ? `<div class="contact-item">📞 ${formData.contact.phone}</div>`
                    : ""
                }
                ${
                  formData.contact.location
                    ? `<div class="contact-item">📍 ${formData.contact.location}</div>`
                    : ""
                }
                ${
                  formData.contact.linkedin
                    ? `<div class="contact-item">💼 <a href="${formData.contact.linkedin}">LinkedIn</a></div>`
                    : ""
                }
                ${
                  formData.contact.github
                    ? `<div class="contact-item">💻 <a href="${formData.contact.github}">GitHub</a></div>`
                    : ""
                }
                ${
                  formData.contact.website
                    ? `<div class="contact-item">🌐 <a href="${formData.contact.website}">Website</a></div>`
                    : ""
                }
              </div>
            </div>
            
            ${
              formData.summary
                ? `
              <div class="section">
                <div class="section-title">Summary</div>
                <p>${formData.summary}</p>
              </div>
            `
                : ""
            }
            
            ${
              formData.experience.length > 0
                ? `
              <div class="section">
                <div class="section-title">Experience</div>
                ${formData.experience
                  .map(
                    (exp) => `
                  <div class="experience-item">
                    <strong>${exp.title}</strong> at ${exp.company}
                    ${
                      exp.startDate
                        ? `<br><small>${exp.startDate} - ${
                            exp.endDate || "Present"
                          }</small>`
                        : ""
                    }
                    ${exp.description ? `<p>${exp.description}</p>` : ""}
                    ${
                      exp.responsibilities.length > 0
                        ? `
                      <ul>
                        ${exp.responsibilities
                          .map((resp) => `<li>${resp}</li>`)
                          .join("")}
                      </ul>
                    `
                        : ""
                    }
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            ${
              formData.education.length > 0
                ? `
              <div class="section">
                <div class="section-title">Education</div>
                ${formData.education
                  .map(
                    (edu) => `
                  <div class="education-item">
                    <strong>${edu.degree}</strong> - ${edu.institution}
                    ${edu.endDate ? `<br><small>${edu.endDate}</small>` : ""}
                    ${edu.gpa ? `<br><small>GPA: ${edu.gpa}</small>` : ""}
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            ${
              formData.skills.technical.length > 0 ||
              formData.skills.soft.length > 0 ||
              formData.skills.tools.length > 0 ||
              formData.skills.languages.length > 0
                ? `
              <div class="section">
                <div class="section-title">Skills</div>
                ${
                  formData.skills.technical.length > 0
                    ? `
                  <p><strong>Technical Skills:</strong></p>
                  <div class="skills">
                    ${formData.skills.technical
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
                ${
                  formData.skills.tools.length > 0
                    ? `
                  <p><strong>Tools & Technologies:</strong></p>
                  <div class="skills">
                    ${formData.skills.tools
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
                ${
                  formData.skills.languages.length > 0
                    ? `
                  <p><strong>Programming Languages:</strong></p>
                  <div class="skills">
                    ${formData.skills.languages
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
                ${
                  formData.skills.soft.length > 0
                    ? `
                  <p><strong>Soft Skills:</strong></p>
                  <div class="skills">
                    ${formData.skills.soft
                      .map((skill) => `<span class="skill-tag">${skill}</span>`)
                      .join("")}
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }
            
            ${
              formData.projects.length > 0
                ? `
              <div class="section">
                <div class="section-title">Projects</div>
                ${formData.projects
                  .map(
                    (project) => `
                  <div class="experience-item">
                    <strong>${project.name}</strong>
                    ${
                      project.description ? `<p>${project.description}</p>` : ""
                    }
                    ${
                      project.technologies.length > 0
                        ? `
                      <div class="skills">
                        ${project.technologies
                          .map(
                            (tech) => `<span class="skill-tag">${tech}</span>`
                          )
                          .join("")}
                      </div>
                    `
                        : ""
                    }
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </body>
        </html>
      `);
    }
  };

  const handleUpdate = (path: string, value: string | string[] | object) => {
    if (!formData) return;

    setFormData((prev) => {
      if (!prev) return prev;

      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;

      // Handle array indices in path (e.g., "projects[0].name")
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        // Check if this key contains array index
        if (key.includes("[") && key.includes("]")) {
          const arrayKey = key.substring(0, key.indexOf("["));
          const index = parseInt(
            key.substring(key.indexOf("[") + 1, key.indexOf("]"))
          );

          if (!(current as any)[arrayKey]) {
            (current as any)[arrayKey] = [];
          } else {
            // Deep clone array
            (current as any)[arrayKey] = [
              ...((current as any)[arrayKey] as unknown[]),
            ];
          }

          const array = (current as any)[arrayKey] as unknown[];
          if (!array[index]) {
            array[index] = {};
          } else {
            // Deep clone array item
            array[index] = { ...(array[index] as Record<string, unknown>) };
          }

          current = array[index] as any;
        } else {
          // Regular object key
          if (!(current as any)[key]) {
            (current as any)[key] = {};
          } else {
            // Deep clone nested objects
            (current as any)[key] = { ...(current as any)[key] };
          }
          current = (current as any)[key] as any;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey.includes("[") && lastKey.includes("]")) {
        const arrayKey = lastKey.substring(0, lastKey.indexOf("["));
        const index = parseInt(
          lastKey.substring(lastKey.indexOf("[") + 1, lastKey.indexOf("]"))
        );
        const array = (current as any)[arrayKey] as unknown[];
        array[index] = value;
      } else {
        (current as any)[lastKey] = value;
      }

      return newData;
    });
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginalFileName(e.target.value);
  };

  const headerActions = (
    <>
      <Button
        variant="outline"
        onClick={handlePreview}
        className="flex items-center space-x-2">
        <Eye className="h-4 w-4" />
        <span>{t("cv.preview")}</span>
      </Button>
    </>
  );

  return (
    <DashboardLayout
      title={t("cv.createNewCV")}
      subtitle={t("cv.createNewCVSubtitle")}
      headerActions={headerActions}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CV Name Input */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 border-gray-200">
          <label
            htmlFor="cv-name"
            className="block text-sm font-medium text-gray-700 mb-2">
            {t("cv.cvName")}
          </label>
          <input
            id="cv-name"
            type="text"
            value={originalFileName}
            onChange={handleFileNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t("cv.enterCvName")}
          />
        </div>

        {/* Form Editor */}
        <DynamicFormEditor
          formData={formData}
          onUpdate={handleUpdate}
          isEditing={isEditing}
        />

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">💡 {t("cv.createTip")}</div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/cv")}
                className="px-6">
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="px-6">
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending
                  ? t("common.creating")
                  : t("cv.create")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
