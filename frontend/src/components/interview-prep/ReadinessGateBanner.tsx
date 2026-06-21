"use client";

import React from "react";
import { Target } from "lucide-react";
import { ReadinessGate } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReadinessGateBannerProps {
  gate: ReadinessGate;
}

export default function ReadinessGateBanner({ gate }: ReadinessGateBannerProps) {
  const { t } = useLanguage();

  if (gate.isReady) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        {t("interviewPrep.readinessGate.passed")}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-2">
        <Target className="h-4 w-4 text-amber-700 mt-0.5 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-amber-900">
            {t("interviewPrep.readinessGate.notReady")
              .replace("{{threshold}}", String(gate.threshold))
              .replace("{{points}}", String(gate.pointsToGo))}
          </p>
          {gate.nextActions.length > 0 && (
            <ul className="mt-2 text-xs text-amber-800 space-y-1 list-disc list-inside">
              {gate.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
