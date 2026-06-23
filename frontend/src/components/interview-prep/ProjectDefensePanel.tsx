"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Shield } from "lucide-react";
import { ProjectDefenseSheet } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProjectDefensePanelProps {
  defenses: ProjectDefenseSheet[];
}

export default function ProjectDefensePanel({
  defenses,
}: ProjectDefensePanelProps) {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  if (!defenses.length) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2 font-karla">
        <Shield className="h-4 w-4 text-blue" />
        {t("interviewPrep.defense.title")}
      </h3>
      <ul className="space-y-2">
        {defenses.map((d, index) => {
          const open = openIndex === index;
          return (
            <li
              key={d.projectName}
              className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                <div>
                  <p className="text-sm font-medium text-dark">{d.projectName}</p>
                  <p className="text-xs text-main">{d.role}</p>
                </div>
                {open ? (
                  <ChevronUp className="h-4 w-4 text-main flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-main flex-shrink-0" />
                )}
              </button>
              {open && (
                <div className="px-4 py-3 space-y-3 text-xs text-main border-t border-gray-100">
                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {t("interviewPrep.defense.architecture")}
                    </p>
                    <p>{d.architectureDecision}</p>
                  </div>
                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {t("interviewPrep.defense.hardest")}
                    </p>
                    <p>{d.hardestProblem}</p>
                  </div>
                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {t("interviewPrep.defense.outcome")}
                    </p>
                    <p>{d.outcome}</p>
                  </div>
                  {d.followUpQuestions?.length > 0 && (
                    <div>
                      <p className="font-medium text-dark mb-1">
                        {t("interviewPrep.questions.followUps")}
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5">
                        {d.followUpQuestions.map((q) => (
                          <li key={q}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
