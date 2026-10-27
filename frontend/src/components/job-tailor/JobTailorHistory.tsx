"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  cvApi,
  CV,
  CvMatchingAnalysis,
  CvCoverLetter,
  CompatibilityAnalysis,
} from "@/lib/cv";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart3,
  Mail,
  Sparkles,
  Eye,
  RotateCcw,
  Link2,
  Briefcase,
} from "lucide-react";

export type JobTailorHistoryAction = "analyze" | "cover-letter" | "tailor";

export interface JobTailorHistoryRow {
  id: string;
  action: JobTailorHistoryAction;
  createdAt: string;
  jobTitle: string;
  company?: string;
  jobDescription: string;
  jobDescriptionId?: string;
  cvId?: string;
  cvLabel: string;
  score?: number;
  analysis?: CompatibilityAnalysis;
  coverLetter?: string;
  tailoredCvId?: string;
}

export function buildJobTailorLink(row: Pick<JobTailorHistoryRow, "cvId" | "jobDescriptionId">): string {
  const params = new URLSearchParams();
  if (row.cvId) params.set("cvId", row.cvId);
  if (row.jobDescriptionId) params.set("jobDescriptionId", row.jobDescriptionId);
  const qs = params.toString();
  return qs ? `/dashboard/job-tailor?${qs}` : "/dashboard/job-tailor";
}

interface JobTailorHistoryProps {
  cvs: CV[];
  tailoredCvs: CV[];
  onViewAnalysis: (analysis: CompatibilityAnalysis) => void;
  onViewCoverLetter: (content: string) => void;
  onViewJobDescription: (row: JobTailorHistoryRow) => void;
  onReuse: (row: JobTailorHistoryRow) => void;
  onCopyLink: (row: JobTailorHistoryRow) => void;
  onOpenTailoredCv: (cvId: string) => void;
}

const DEFAULT_JOB_TITLE = "Job Description";

function isPlaceholderJobTitle(title?: string) {
  const t = title?.trim().toLowerCase() || "";
  return !t || t === "job" || t === "job description";
}

/** Prefer stored title; never fall back to raw JD paste blobs. */
function jdLabel(
  snapshot?: { title?: string; company?: string; description?: string },
  jd?: { title?: string; company?: string; description?: string },
) {
  const stored = snapshot?.title || jd?.title;
  const title = isPlaceholderJobTitle(stored) ? DEFAULT_JOB_TITLE : stored!;
  const company = snapshot?.company || jd?.company;
  const description = snapshot?.description || jd?.description || "";
  return { title, company, description };
}

/** Always CV file name — not contact name — so rows match across actions. */
function cvFileName(
  cv?: { id?: string; originalFileName?: string } | null,
  sourceById?: Map<string, CV>,
  sourceCvId?: string | null,
) {
  if (sourceCvId && sourceById?.get(sourceCvId)?.originalFileName) {
    return sourceById.get(sourceCvId)!.originalFileName;
  }
  return cv?.originalFileName || "—";
}

function toCompatibility(a: CvMatchingAnalysis): CompatibilityAnalysis {
  return {
    score: a.score,
    matchedSkills: a.matchedSkills || [],
    missingSkills: a.missingSkills || [],
    matchedExperience: [],
    missingRequirements: [],
    suggestions: a.suggestions || [],
    strengths: a.strengths || [],
  };
}

export default function JobTailorHistory({
  cvs,
  tailoredCvs,
  onViewAnalysis,
  onViewCoverLetter,
  onViewJobDescription,
  onReuse,
  onCopyLink,
  onOpenTailoredCv,
}: JobTailorHistoryProps) {
  const { t, language } = useLanguage();

  const { data: analyses = [], isLoading: loadingAnalyses } = useQuery({
    queryKey: ["job-tailor-analyses"],
    queryFn: () => cvApi.getUserAnalyses(),
  });

  const { data: coverLetters = [], isLoading: loadingLetters } = useQuery({
    queryKey: ["job-tailor-cover-letters"],
    queryFn: () => cvApi.getUserCoverLetters(),
  });

  const cvsById = useMemo(
    () => new Map(cvs.map((cv) => [cv.id, cv])),
    [cvs],
  );

  const rows = useMemo(() => {
    const items: JobTailorHistoryRow[] = [];

    for (const a of analyses as CvMatchingAnalysis[]) {
      const { title, company, description } = jdLabel(
        a.jobDescriptionSnapshot,
        a.jobDescription,
      );
      items.push({
        id: `analyze-${a.id}`,
        action: "analyze",
        createdAt: a.createdAt,
        jobTitle: title,
        company,
        jobDescription: a.jobDescription?.description || description,
        jobDescriptionId: a.jobDescriptionId,
        cvId: a.cvId,
        cvLabel: cvFileName(a.cv, cvsById, a.cvId),
        score: a.score,
        analysis: toCompatibility(a),
      });
    }

    for (const c of coverLetters as CvCoverLetter[]) {
      const { title, company, description } = jdLabel(
        c.jobDescriptionSnapshot,
        c.jobDescription,
      );
      items.push({
        id: `cover-${c.id}`,
        action: "cover-letter",
        createdAt: c.createdAt,
        jobTitle: title,
        company,
        jobDescription: c.jobDescription?.description || description,
        jobDescriptionId: c.jobDescriptionId,
        cvId: c.cvId,
        cvLabel: cvFileName(c.cv, cvsById, c.cvId),
        coverLetter: c.content,
      });
    }

    for (const cv of tailoredCvs) {
      const { title, company, description } = jdLabel(
        undefined,
        cv.jobDescription,
      );
      items.push({
        id: `tailor-${cv.id}`,
        action: "tailor",
        createdAt: cv.createdAt,
        jobTitle: title,
        company,
        jobDescription: description,
        jobDescriptionId: cv.jobDescriptionId,
        cvId: cv.originalCvId,
        cvLabel: cvFileName(cv, cvsById, cv.originalCvId),
        tailoredCvId: cv.id,
      });
    }

    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [analyses, coverLetters, tailoredCvs, cvsById]);

  const loading = loadingAnalyses || loadingLetters;
  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [language],
  );

  const actionLabel = (action: JobTailorHistoryAction) => {
    switch (action) {
      case "analyze":
        return t("jobTailor.history.actionAnalyze");
      case "cover-letter":
        return t("jobTailor.history.actionCoverLetter");
      case "tailor":
        return t("jobTailor.history.actionTailor");
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  };

  const ActionIcon = ({ action }: { action: JobTailorHistoryAction }) => {
    if (action === "analyze")
      return <BarChart3 className="h-4 w-4 text-blue-600" />;
    if (action === "cover-letter")
      return <Mail className="h-4 w-4 text-green-600" />;
    return <Sparkles className="h-4 w-4 text-purple-600" />;
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {t("jobTailor.history.title")}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {t("jobTailor.history.subtitle")}
          </p>
        </div>
        <span className="text-xs text-gray-400">
          {t("jobTailor.history.count", { count: rows.length })}
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500">
          {t("jobTailor.history.loading")}
        </div>
      ) : rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          {t("jobTailor.history.empty")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">
                  {t("jobTailor.history.colDate")}
                </th>
                <th className="px-5 py-3 font-medium">
                  {t("jobTailor.history.colAction")}
                </th>
                <th className="px-5 py-3 font-medium">
                  {t("jobTailor.history.colJob")}
                </th>
                <th className="px-5 py-3 font-medium">
                  {t("jobTailor.history.colCv")}
                </th>
                <th className="px-5 py-3 font-medium">
                  {t("jobTailor.history.colResult")}
                </th>
                <th className="px-5 py-3 font-medium text-right">
                  {t("jobTailor.history.colActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80">
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {dateFmt.format(new Date(row.createdAt))}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-gray-900">
                      <ActionIcon action={row.action} />
                      {actionLabel(row.action)}
                    </span>
                  </td>
                  <td className="px-5 py-3 max-w-[220px]">
                    {row.jobDescriptionId || row.jobDescription ? (
                      <button
                        type="button"
                        onClick={() => onViewJobDescription(row)}
                        className="text-left group max-w-full"
                      >
                        <div className="font-medium text-main group-hover:underline truncate">
                          {row.jobTitle}
                        </div>
                        {row.company ? (
                          <div className="text-xs text-gray-500 truncate">
                            {row.company}
                          </div>
                        ) : null}
                      </button>
                    ) : (
                      <>
                        <div className="font-medium text-gray-900 truncate">
                          {row.jobTitle}
                        </div>
                        {row.company ? (
                          <div className="text-xs text-gray-500 truncate">
                            {row.company}
                          </div>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-700 max-w-[160px] truncate">
                    {row.cvLabel}
                  </td>
                  <td className="px-5 py-3 text-gray-700">
                    {row.action === "analyze" && row.score != null
                      ? t("jobTailor.history.score", { score: row.score })
                      : row.action === "cover-letter"
                        ? t("jobTailor.history.letterReady")
                        : t("jobTailor.history.cvReady")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {row.action === "analyze" && row.analysis ? (
                        <button
                          type="button"
                          onClick={() => onViewAnalysis(row.analysis!)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("jobTailor.history.view")}
                        </button>
                      ) : null}
                      {row.action === "cover-letter" && row.coverLetter ? (
                        <button
                          type="button"
                          onClick={() => onViewCoverLetter(row.coverLetter!)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-600 hover:text-green-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("jobTailor.history.view")}
                        </button>
                      ) : null}
                      {row.action === "tailor" && row.tailoredCvId ? (
                        <button
                          type="button"
                          onClick={() => onOpenTailoredCv(row.tailoredCvId!)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {t("jobTailor.history.view")}
                        </button>
                      ) : null}
                      {row.jobDescriptionId || row.jobDescription ? (
                        <button
                          type="button"
                          onClick={() => onViewJobDescription(row)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                        >
                          <Briefcase className="h-3.5 w-3.5" />
                          {t("jobTailor.history.viewJd")}
                        </button>
                      ) : null}
                      {row.jobDescriptionId || row.jobDescription ? (
                        <button
                          type="button"
                          onClick={() => onReuse(row)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {t("jobTailor.history.reuse")}
                        </button>
                      ) : null}
                      {row.jobDescriptionId ? (
                        <button
                          type="button"
                          onClick={() => onCopyLink(row)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
                          title={buildJobTailorLink(row)}
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          {t("jobTailor.history.copyLink")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
