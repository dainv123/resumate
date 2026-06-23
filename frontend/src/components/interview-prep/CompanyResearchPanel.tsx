"use client";

import React from "react";
import { Building2, CheckCircle2, Circle } from "lucide-react";
import {
  CompanyResearchBrief,
  PrepJobDescriptionSummary,
} from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

interface CompanyResearchPanelProps {
  jobDescription?: PrepJobDescriptionSummary;
  companyResearch?: CompanyResearchBrief;
  onToggleSection?: (sectionId: string, checked: boolean) => void;
  togglingSectionId?: string | null;
}

export default function CompanyResearchPanel({
  jobDescription,
  companyResearch,
  onToggleSection,
  togglingSectionId,
}: CompanyResearchPanelProps) {
  const { t } = useLanguage();
  const sections = companyResearch?.sections ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-1 flex items-center gap-2 font-karla">
        <Building2 className="h-4 w-4 text-blue" />
        {t("interviewPrep.companyResearch.title")}
      </h3>
      {jobDescription?.company && (
        <p className="text-xs text-main mb-3">
          {t("interviewPrep.companyResearch.target").replace(
            "{{company}}",
            jobDescription.company,
          )}
        </p>
      )}

      {sections.length > 0 ? (
        <ul className="space-y-3">
          {sections.map((section) => {
            const busy = togglingSectionId === section.id;
            return (
              <li
                key={section.id}
                className="border border-gray-100 rounded-lg p-3">
                <button
                  type="button"
                  disabled={busy || !onToggleSection}
                  onClick={() =>
                    onToggleSection?.(section.id, !section.checked)
                  }
                  className="flex items-start gap-2 w-full text-left disabled:opacity-60">
                  {section.checked ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-main mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-dark">{section.title}</p>
                    <p className="text-xs text-main mt-1 whitespace-pre-wrap">
                      {section.summary}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-2">
          {(
            [
              "interviewPrep.companyResearch.items.mission",
              "interviewPrep.companyResearch.items.product",
              "interviewPrep.companyResearch.items.news",
              "interviewPrep.companyResearch.items.culture",
              "interviewPrep.companyResearch.items.questions",
            ] as const
          ).map((key) => (
            <li key={key} className="flex items-start gap-2 text-sm text-main">
              <span className="text-blue mt-0.5">•</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
