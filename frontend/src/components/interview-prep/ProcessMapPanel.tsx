"use client";

import React from "react";
import { GitBranch, Clock } from "lucide-react";
import { ProcessMap } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProcessMapPanelProps {
  processMap: ProcessMap;
}

export default function ProcessMapPanel({ processMap }: ProcessMapPanelProps) {
  const { t } = useLanguage();
  const rounds = processMap.rounds ?? [];

  if (rounds.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2 font-karla">
        <GitBranch className="h-4 w-4 text-blue" />
        {t("interviewPrep.processMap.title")}
      </h3>
      <ul className="space-y-3">
        {rounds.map((round, index) => (
          <li
            key={`${round.type}-${index}`}
            className="border border-gray-100 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-dark">{round.label}</p>
              <span className="text-xs text-main flex items-center gap-1 flex-shrink-0">
                <Clock className="h-3 w-3" />
                {round.durationMinutes} {t("interviewPrep.timeline.minutes")}
              </span>
            </div>
            {round.focusAreas?.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {round.focusAreas.map((area) => (
                  <li
                    key={area}
                    className="text-xs bg-blue/10 text-blue px-2 py-0.5 rounded-full">
                    {area}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
