"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Globe,
  Link2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CVData } from "@/types/cv.types";
import { CVUtils } from "@/utils/cv.utils";

interface CvParsedContentProps {
  data: CVData;
}

export default function CvParsedContent({ data }: CvParsedContentProps) {
  const { t } = useLanguage();
  const presentLabel = t("cv.present");

  const renderTags = (items: string[], color: string) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span key={index} className={`px-2 py-1 text-xs rounded-full ${color}`}>
          {item}
        </span>
      ))}
    </div>
  );

  const renderBullets = (items: string[]) =>
    items.length > 0 ? (
      <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : null;

  return (
    <div className="space-y-6">
      {data.contact && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {t("cv.contactInfo")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{data.contact.email}</span>
              </div>
            )}
            {data.contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{data.contact.phone}</span>
              </div>
            )}
            {data.contact.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {data.contact.location}
                </span>
              </div>
            )}
            {data.contact.linkedin && (
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-gray-500" />
                <a
                  href={data.contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800">
                  {t("cv.linkedin")}
                </a>
              </div>
            )}
            {data.contact.github && (
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-gray-500" />
                <a
                  href={data.contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800">
                  {t("cv.github")}
                </a>
              </div>
            )}
            {data.contact.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <a
                  href={data.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800">
                  {data.contact.website}
                </a>
              </div>
            )}
            {data.dateOfBirth && (
              <div className="text-sm text-gray-700">{data.dateOfBirth}</div>
            )}
          </div>
        </div>
      )}

      {data.summary && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {t("cv.summary")}
          </h4>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {data.experience.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            {t("cv.experience")}
          </h4>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={exp.id || index} className="border-l-4 border-blue-200 pl-4">
                <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                <p className="text-sm text-gray-600">{exp.company}</p>
                {CVUtils.getExperiencePeriod(exp, presentLabel) && (
                  <p className="text-xs text-gray-500">
                    {CVUtils.getExperiencePeriod(exp, presentLabel)}
                  </p>
                )}
                {exp.teamSize && (
                  <p className="text-xs text-gray-500 mt-1">
                    {t("jobTailor.teamSize")}: {exp.teamSize}
                  </p>
                )}
                {exp.companyDescription && (
                  <p className="text-sm text-gray-600 mt-2 italic">
                    {exp.companyDescription}
                  </p>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                )}
                {exp.responsibilities?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-800">
                      {t("cv.responsibilities")}
                    </p>
                    {renderBullets(exp.responsibilities)}
                  </div>
                )}
                {exp.achievements?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-800">
                      {t("cv.achievements")}
                    </p>
                    {renderBullets(exp.achievements)}
                  </div>
                )}
                {exp.technologies?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {t("cv.sections.technologies")}
                    </p>
                    {renderTags(exp.technologies, "bg-blue-100 text-blue-800")}
                  </div>
                )}
                {exp.subProjects && exp.subProjects.length > 0 && (
                  <div className="mt-3 space-y-3">
                    <p className="text-sm font-medium text-gray-800">
                      {t("cv.subProjects")}
                    </p>
                    {exp.subProjects.map((sub, subIndex) => (
                      <div
                        key={sub.id || subIndex}
                        className="rounded-md bg-gray-50 p-3">
                        <p className="font-medium text-gray-900">{sub.name}</p>
                        {sub.role && (
                          <p className="text-xs text-gray-600">{sub.role}</p>
                        )}
                        {renderBullets(sub.responsibilities || [])}
                        {(sub.techStack?.length ?? 0) > 0 &&
                          renderTags(
                            sub.techStack || [],
                            "bg-slate-200 text-slate-800",
                          )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            {t("cv.education")}
          </h4>
          <div className="space-y-3">
            {data.education.map((edu, index) => (
              <div key={edu.id || index} className="border-l-4 border-green-200 pl-4">
                <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                {CVUtils.getEducationPeriod(edu) && (
                  <p className="text-xs text-gray-500">
                    {CVUtils.getEducationPeriod(edu)}
                  </p>
                )}
                {edu.gpa && (
                  <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills && CVUtils.hasAnySkills(data.skills) && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            {t("cv.skills")}
          </h4>
          <div className="space-y-3">
            {data.skills.technical.length > 0 && (
              <div className="border-l-4 border-purple-200 pl-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {t("cv.technicalSkills")}
                </h5>
                {renderTags(data.skills.technical, "bg-blue-100 text-blue-800")}
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div className="border-l-4 border-purple-200 pl-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {t("cv.softSkills")}
                </h5>
                {renderTags(data.skills.soft, "bg-green-100 text-green-800")}
              </div>
            )}
            {data.skills.languages.length > 0 && (
              <div className="border-l-4 border-purple-200 pl-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {t("cv.languages")}
                </h5>
                {renderTags(
                  data.skills.languages,
                  "bg-yellow-100 text-yellow-800",
                )}
              </div>
            )}
            {data.skills.tools.length > 0 && (
              <div className="border-l-4 border-purple-200 pl-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  {t("cv.tools")}
                </h5>
                {renderTags(data.skills.tools, "bg-red-100 text-red-800")}
              </div>
            )}
          </div>
        </div>
      )}

      {data.projects.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-orange-600" />
            {t("cv.projects")}
          </h4>
          <div className="space-y-3">
            {data.projects.map((project, index) => (
              <div
                key={project.id || index}
                className="border-l-4 border-orange-200 pl-4">
                <h5 className="font-semibold text-gray-900">{project.name}</h5>
                {project.duration && (
                  <p className="text-xs text-gray-500">{project.duration}</p>
                )}
                {project.description && (
                  <p className="text-sm text-gray-700 mt-1">
                    {project.description}
                  </p>
                )}
                {project.results && project.results.length > 0 && (
                  <p className="text-sm text-gray-700 mt-1">
                    {project.results.join(" ")}
                  </p>
                )}
                {project.technologies.length > 0 &&
                  renderTags(
                    project.technologies,
                    "bg-orange-100 text-orange-800",
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            {t("cv.certifications")}
          </h4>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div
                key={cert.id || index}
                className="border-l-4 border-amber-200 pl-4">
                <p className="font-medium text-gray-900">{cert.name}</p>
                <p className="text-sm text-gray-600">{cert.issuer}</p>
                {cert.date && (
                  <p className="text-xs text-gray-500">{cert.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
