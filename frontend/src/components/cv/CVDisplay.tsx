"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CV } from "@/lib/cv";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Download,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  Briefcase,
  Copy,
  Clock,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Code,
  Globe,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";

export type CVDisplayMode = "short" | "full";

interface CVDisplayProps {
  cv: CV;
  mode?: CVDisplayMode;
  showActions?: boolean;
  showRelationships?: boolean;
  showVersionHistory?: boolean;
  showViewButton?: boolean;
  historyLabel?: string;
  tailoredLabel?: string;
  onEdit?: (cv: CV) => void;
  onDelete?: (cv: CV) => void;
  onDuplicate?: (cv: CV) => void;
  onTailor?: (cv: CV) => void;
  onExport?: (
    cv: CV,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => void;
  onUpdate?: (cv: CV) => void;
  className?: string;
}

export default function CVDisplay({
  cv,
  mode = "short",
  showActions = true,
  showRelationships = false,
  showVersionHistory = false,
  historyLabel,
  tailoredLabel,
  onEdit,
  onDelete,
  onDuplicate,
  onTailor,
  onExport,
  className = "",
}: CVDisplayProps) {
  const { t } = useLanguage();
  const router = useRouter();

  // Use translation keys if provided, otherwise use defaults
  const effectiveHistoryLabel =
    historyLabel || t("cvSections.statusLabels.history");
  const effectiveTailoredLabel =
    tailoredLabel || t("cvSections.statusLabels.tailored");

  // Render short mode - compact view
  const renderShortMode = () => {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/20 transition-shadow ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {cv.parsedData?.contact?.name || cv.originalFileName}
              </h4>
              {cv.isTailored && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {effectiveTailoredLabel}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {cv.parsedData?.contact?.email || t("cv.noEmail")}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {t("cv.version")} {cv.version} • {t("cv.updatedAt")}{" "}
              {formatDate(cv.updatedAt)}
            </p>
          </div>

          {showActions && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                className="p-2">
                <Eye className="h-4 w-4" />
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(cv)}
                  className="p-2">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {cv.parsedData?.experience &&
            Array.isArray(cv.parsedData.experience) && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-gray-600">
                  {cv.parsedData.experience.length} {t("cv.experience")}
                </span>
              </div>
            )}
          {cv.parsedData?.education &&
            Array.isArray(cv.parsedData.education) && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">
                  {cv.parsedData.education.length} {t("cv.education")}
                </span>
              </div>
            )}
          {cv.parsedData?.skills?.technical &&
            Array.isArray(cv.parsedData.skills.technical) && (
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                <span className="text-gray-600">
                  {cv.parsedData.skills.technical.length} {t("cv.skills")}
                </span>
              </div>
            )}
          {cv.parsedData?.projects && Array.isArray(cv.parsedData.projects) && (
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">
                {cv.parsedData.projects.length} {t("cv.projects")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render full mode - detailed view
  const renderFullMode = () => {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <h3 className="text-xl font-bold text-gray-900 truncate">
                {cv.parsedData?.contact?.name || cv.originalFileName}
              </h3>
              {cv.isTailored && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {effectiveTailoredLabel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-gray-400">
                {t("cv.version")} {cv.version} • {t("cv.updatedAt")}{" "}
                {formatDate(cv.updatedAt)}
              </p>
              {showVersionHistory && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-purple-600 bg-purple-50 rounded">
                  <Clock className="h-3 w-3" />
                  <span>{effectiveHistoryLabel}</span>
                </span>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                className="flex items-center space-x-2">
                <Eye className="h-4 w-4 mr-1" />
                <span>{t("cv.view")}</span>
              </Button>
              {onEdit && (
                <Button
                  variant="outline"
                  onClick={() => onEdit(cv)}
                  className="flex items-center space-x-2">
                  <Edit className="h-4 w-4 mr-1" />
                  <span>{t("cv.edit")}</span>
                </Button>
              )}
              {onTailor && (
                <Button
                  variant="outline"
                  onClick={() => onTailor(cv)}
                  className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span>{t("cv.tailor")}</span>
                </Button>
              )}
              {onExport && (
                <Button
                  variant="outline"
                  onClick={() => onExport(cv, "pdf")}
                  className="flex items-center space-x-2">
                  <Download className="h-4 w-4 mr-1" />
                  <span>{t("cv.export")}</span>
                </Button>
              )}
              {onDuplicate && (
                <Button
                  variant="outline"
                  onClick={() => onDuplicate(cv)}
                  className="flex items-center space-x-2">
                  <Copy className="h-4 w-4 mr-1" />
                  <span>{t("cv.duplicate")}</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  onClick={() => onDelete(cv)}
                  className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* CV Relationships */}
        {showRelationships && (
          <Collapse
            title={t("cv.relationships.title")}
            icon={<Sparkles className="h-4 w-4 text-green-600" />}
            defaultOpen={false}
            className="mb-6 border-green-200"
            headerClassName="bg-gradient-to-r from-green-50 to-emerald-50"
            contentClassName="bg-white">
            <div className="space-y-2">
              {cv.originalCv && (
                <div className="text-xs text-green-700">
                  <span className="font-medium">{t("cv.originalCv")}:</span>{" "}
                  <span className="text-blue-600 flex items-center max-w-full">
                    <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {cv.originalCv.originalFileName}
                    </span>
                  </span>
                </div>
              )}
              {cv.jobDescription && (
                <div className="text-xs text-green-700">
                  <span className="font-medium">{t("cv.tailoredFor")}:</span>{" "}
                  <span className="text-blue-600 flex items-center max-w-full">
                    <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{cv.jobDescription.title}</span>
                  </span>
                </div>
              )}
              {cv.tailoredVersions && cv.tailoredVersions.length > 0 && (
                <div className="text-xs text-green-700">
                  <span className="font-medium">
                    {t("cv.tailoredVersions")}:
                  </span>{" "}
                  <span className="text-blue-600">
                    {cv.tailoredVersions.length} {t("cv.versions")}
                  </span>
                </div>
              )}
            </div>
          </Collapse>
        )}

        {/* CV Content */}
        {cv.parsedData ? (
          <div className="space-y-6">
            {/* Contact Information */}
            {cv.parsedData.contact && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  {t("cv.contactInfo")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cv.parsedData.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {cv.parsedData.contact.email}
                      </span>
                    </div>
                  )}
                  {cv.parsedData.contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {cv.parsedData.contact.phone}
                      </span>
                    </div>
                  )}
                  {cv.parsedData.contact.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {cv.parsedData.contact.location}
                      </span>
                    </div>
                  )}
                  {cv.parsedData.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a
                        href={cv.parsedData.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800">
                        {cv.parsedData.contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {cv.parsedData.summary && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("cv.summary")}
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {cv.parsedData.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {cv.parsedData.experience &&
              Array.isArray(cv.parsedData.experience) &&
              cv.parsedData.experience.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    {t("cv.experience")}
                  </h4>
                  <div className="space-y-4">
                    {cv.parsedData.experience.map((exp, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-200 pl-4">
                        <h5 className="font-semibold text-gray-900">
                          {exp.title}
                        </h5>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-500">
                          {exp.startDate} - {exp.endDate || t("cv.present")}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-700 mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Education */}
            {cv.parsedData.education &&
              Array.isArray(cv.parsedData.education) &&
              cv.parsedData.education.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    {t("cv.education")}
                  </h4>
                  <div className="space-y-3">
                    {cv.parsedData.education.map((edu, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-green-200 pl-4">
                        <h5 className="font-semibold text-gray-900">
                          {edu.degree}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                        </p>
                        <p className="text-xs text-gray-500">
                          {edu.startDate} - {edu.endDate || t("cv.present")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Skills */}
            {cv.parsedData.skills &&
              cv.parsedData.skills.technical.length > 0 &&
              cv.parsedData.skills.soft.length > 0 &&
              cv.parsedData.skills.languages.length > 0 &&
              cv.parsedData.skills.tools.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    {t("cv.skills")}
                  </h4>
                  <div className="space-y-3">
                    {cv.parsedData.skills.technical &&
                      Array.isArray(cv.parsedData.skills.technical) &&
                      cv.parsedData.skills.technical.length > 0 && (
                        <div className="border-l-4 border-purple-200 pl-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {t("cv.technicalSkills")}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {cv.parsedData.skills.technical.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {skill}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {cv.parsedData.skills.soft &&
                      Array.isArray(cv.parsedData.skills.soft) &&
                      cv.parsedData.skills.soft.length > 0 && (
                        <div className="border-l-4 border-purple-200 pl-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {t("cv.softSkills")}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {cv.parsedData.skills.soft.map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    {cv.parsedData.skills.languages &&
                      Array.isArray(cv.parsedData.skills.languages) &&
                      cv.parsedData.skills.languages.length > 0 && (
                        <div className="border-l-4 border-purple-200 pl-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {t("cv.languages")}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {cv.parsedData.skills.languages.map(
                              (language, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                                  {language}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    {cv.parsedData.skills.tools &&
                      Array.isArray(cv.parsedData.skills.tools) &&
                      cv.parsedData.skills.tools.length > 0 && (
                        <div className="border-l-4 border-purple-200 pl-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            {t("cv.tools")}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {cv.parsedData.skills.tools.map((tool, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}

            {/* Projects */}
            {cv.parsedData.projects &&
              Array.isArray(cv.parsedData.projects) &&
              cv.parsedData.projects.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5 text-orange-600" />
                    {t("cv.projects")}
                  </h4>
                  <div className="space-y-3">
                    {cv.parsedData.projects.map((project, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-orange-200 pl-4">
                        <h5 className="font-semibold text-gray-900">
                          {project.name}
                        </h5>
                        {project.description && (
                          <p className="text-sm text-gray-700 mt-1">
                            {project.description}
                          </p>
                        )}
                        {project.technologies &&
                          Array.isArray(project.technologies) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">{t("cv.notParsed")}</p>
          </div>
        )}
      </div>
    );
  };

  return mode === "short" ? renderShortMode() : renderFullMode();
}
