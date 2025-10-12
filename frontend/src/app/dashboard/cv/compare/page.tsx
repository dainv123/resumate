"use client";

import React, { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { cvApi, CV } from "@/lib/cv";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

function CompareContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const v1Id = searchParams.get("v1"); // e.g., "xxx-v2"
  const v2Id = searchParams.get("v2"); // e.g., "xxx"

  // Extract base CV ID and version numbers
  const { baseId: baseId1, versionNum: v1Num } = useMemo(() => {
    if (!v1Id) return { baseId: null, versionNum: null };
    const parts = v1Id.split("-v");
    return {
      baseId: parts[0],
      versionNum: parts[1] ? parseInt(parts[1]) : null,
    };
  }, [v1Id]);

  const { baseId: baseId2, versionNum: v2Num } = useMemo(() => {
    if (!v2Id) return { baseId: null, versionNum: null };
    const parts = v2Id.split("-v");
    return {
      baseId: parts[0],
      versionNum: parts[1] ? parseInt(parts[1]) : null,
    };
  }, [v2Id]);

  // Determine if we need to fetch 1 or 2 CVs
  const isSameCv = baseId1 === baseId2;

  // Fetch CV(s)
  const { data: cv1, isLoading: loading1 } = useQuery({
    queryKey: ["cv", baseId1],
    queryFn: () => cvApi.getCvById(baseId1!),
    enabled: !!baseId1,
    staleTime: 5 * 60 * 1000,
  });

  const { data: cv2, isLoading: loading2 } = useQuery({
    queryKey: ["cv", baseId2],
    queryFn: () => cvApi.getCvById(baseId2!),
    enabled: !!baseId2 && !isSameCv, // Only fetch if different CV
    staleTime: 5 * 60 * 1000,
  });

  // Extract the correct versions from version history
  const version1 = useMemo(() => {
    if (!cv1) return null;

    // If no version number specified, use current version
    if (v1Num === null) return cv1;

    // Find version in history
    const historicalVersion = cv1.versionHistory?.find(
      (vh: any) => vh.version === v1Num
    );

    if (historicalVersion) {
      // Return a CV-like object with the historical data
      return {
        ...cv1,
        version: historicalVersion.version,
        parsedData: historicalVersion.parsedData,
        updatedAt: historicalVersion.updatedAt,
      };
    }

    return cv1;
  }, [cv1, v1Num]);

  const version2 = useMemo(() => {
    const sourceCv = isSameCv ? cv1 : cv2;
    if (!sourceCv) return null;

    // If no version number specified, use current version
    if (v2Num === null) return sourceCv;

    // Find version in history
    const historicalVersion = sourceCv.versionHistory?.find(
      (vh: any) => vh.version === v2Num
    );

    if (historicalVersion) {
      return {
        ...sourceCv,
        version: historicalVersion.version,
        parsedData: historicalVersion.parsedData,
        updatedAt: historicalVersion.updatedAt,
      };
    }

    return sourceCv;
  }, [cv1, cv2, v2Num, isSameCv]);

  const loading = loading1 || (loading2 && !isSameCv);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t("compare.loading")}</div>
      </div>
    );
  }

  if (!version1 || !version2) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{t("compare.failed")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GitCompare className="h-8 w-8 text-purple-600" />
                {t("compare.title")}
              </h3>
              <p className="text-gray-600 mt-1">
                {t("compare.comparing", {
                  v1: version1.version,
                  v2: version2.version,
                })}
              </p>
            </div>
            <Link href="/dashboard/cv">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("compare.backToCVs")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version 1 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <h4 className="font-semibold text-blue-900">
              Version {version1.version}
            </h4>
            <p className="text-sm text-blue-700">
              Updated: {new Date(version1.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CVDataDisplay cv={version1} />
          </div>
        </div>

        {/* Version 2 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 border-b border-purple-200 p-4">
            <h4 className="font-semibold text-purple-900">
              Version {version2.version}
            </h4>
            <p className="text-sm text-purple-700">
              Updated: {new Date(version2.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CVDataDisplay cv={version2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CVDataDisplay({ cv }: { cv: CV }) {
  const { t } = useLanguage();
  const { parsedData } = cv;

  return (
    <>
      {/* Personal Info */}
      <div>
        <h5 className="font-semibold text-gray-900 mb-2">
          {t("compare.personalInfo")}
        </h5>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Name:</strong> {parsedData.name}
          </p>
          <p>
            <strong>Email:</strong> {parsedData.email}
          </p>
          <p>
            <strong>Phone:</strong> {parsedData.phone}
          </p>
          {parsedData.address && (
            <p>
              <strong>Address:</strong> {parsedData.address}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {parsedData.summary && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">
            {t("compare.summary")}
          </h5>
          <p className="text-sm text-gray-700">{parsedData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {parsedData.experience?.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">
            {t("compare.experience")}
          </h5>
          <div className="space-y-3">
            {parsedData.experience.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-blue-200 pl-3">
                <p className="font-medium text-sm">{exp.title}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">{exp.duration}</p>

                {/* Main Responsibilities */}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                    {exp.responsibilities.slice(0, 3).map((resp, i) => (
                      <li key={i}>• {resp}</li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {exp.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sub Projects */}
                {Array.isArray(exp.subProjects) &&
                  exp.subProjects.length > 0 && (
                    <div className="mt-2 space-y-2 bg-purple-50/20 p-2 rounded">
                      <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                        {t("compare.subProjects", {
                          count: exp.subProjects.length,
                        })}
                      </p>
                      {exp.subProjects.map((subProj, subIdx) => (
                        <div
                          key={`subproj-${idx}-${subIdx}`}
                          className="border-l-2 border-purple-300 pl-3 py-1.5 bg-white/50 rounded-r">
                          {/* Sub-project Name & Role */}
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-900 flex-1">
                              {subProj.name ||
                                t("compare.subProjectDefault", {
                                  number: subIdx + 1,
                                })}
                            </p>
                            {subProj.role && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                                {subProj.role}
                              </span>
                            )}
                          </div>

                          {/* Sub-project Tech Stack */}
                          {Array.isArray(subProj.techStack) &&
                            subProj.techStack.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {subProj.techStack.map((tech, techIdx) => (
                                  <span
                                    key={`tech-${idx}-${subIdx}-${techIdx}`}
                                    className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded border border-purple-200">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}

                          {/* Sub-project Responsibilities */}
                          {Array.isArray(subProj.responsibilities) &&
                            subProj.responsibilities.length > 0 && (
                              <ul className="text-xs text-gray-700 mt-1.5 space-y-1">
                                {subProj.responsibilities.map(
                                  (resp, respIdx) => (
                                    <li
                                      key={`resp-${idx}-${subIdx}-${respIdx}`}
                                      className="flex items-start gap-1.5">
                                      <span className="text-purple-500 font-bold mt-0.5 flex-shrink-0">
                                        ▸
                                      </span>
                                      <span className="flex-1">{resp}</span>
                                    </li>
                                  )
                                )}
                              </ul>
                            )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <div className="mt-1">
                    <p className="text-xs font-medium text-green-700">
                      {t("compare.achievements")}
                    </p>
                    <ul className="text-xs text-gray-700 space-y-0.5">
                      {exp.achievements.map((ach, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-500">★</span>
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {parsedData.skills && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">
            {t("compare.skills")}
          </h5>
          <div className="space-y-2">
            {parsedData.skills.technical?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {t("compare.technical")}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.skills.technical.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {parsedData.skills.soft?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {t("compare.soft")}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.skills.soft.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {parsedData.education?.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">
            {t("compare.education")}
          </h5>
          <div className="space-y-2">
            {parsedData.education.map((edu, idx) => (
              <div key={idx}>
                <p className="font-medium text-sm">{edu.degree}</p>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <p className="text-xs text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {parsedData.projects?.length > 0 && (
        <div>
          <h5 className="font-semibold text-gray-900 mb-2">
            {t("compare.projects")}
          </h5>
          <div className="space-y-2">
            {parsedData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="font-medium text-sm">{proj.name}</p>
                <p className="text-xs text-gray-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
