"use client";

import React from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { GapPriority, InterviewPrepPlanDetail } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface GapAnalysisPanelProps {
  gaps?: InterviewPrepPlanDetail["gaps"];
  compatibility?: InterviewPrepPlanDetail["compatibility"];
}

const priorityClass: Record<GapPriority, string> = {
  P1: "bg-red-100 text-red-800",
  P2: "bg-amber-100 text-amber-800",
  P3: "bg-gray-100 text-gray-700",
};

export default function GapAnalysisPanel({
  gaps = [],
  compatibility,
}: GapAnalysisPanelProps) {
  const { t } = useLanguage();

  if (!gaps.length && !compatibility) return null;

  const topGaps = [...gaps]
    .sort((a, b) => {
      const order = { P1: 0, P2: 1, P3: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-3 font-karla flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        {t("interviewPrep.gaps.title")}
      </h3>

      {compatibility && (
        <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
          <div>
            <p className="text-xs text-main">{t("interviewPrep.gaps.cvFit")}</p>
            <p className="text-lg font-bold text-dark">
              {compatibility.score}/10
            </p>
          </div>
          {compatibility.matchedSkills.length > 0 && (
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs text-main mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                {t("interviewPrep.gaps.matched")}
              </p>
              <p className="text-xs text-dark line-clamp-2">
                {compatibility.matchedSkills.slice(0, 8).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {topGaps.length > 0 ? (
        <ul className="space-y-2">
          {topGaps.map((gap) => (
            <li
              key={gap.skill}
              className="flex items-center justify-between gap-2 text-sm border border-gray-100 rounded-lg px-3 py-2">
              <span className="text-dark font-medium">{gap.skill}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                  priorityClass[gap.priority],
                )}>
                {gap.priority}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-main">{t("interviewPrep.gaps.empty")}</p>
      )}
    </div>
  );
}
