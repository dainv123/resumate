"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReadinessBreakdown, ReadinessGate } from "@/lib/interview-prep";
import ReadinessGateBanner from "@/components/interview-prep/ReadinessGateBanner";

interface ReadinessRingProps {
  score: number;
  breakdown?: ReadinessBreakdown;
  isReady?: boolean;
  nextActions?: string[];
  readinessGate?: ReadinessGate;
}

export default function ReadinessRing({
  score,
  breakdown,
  isReady,
  nextActions = [],
  readinessGate,
}: ReadinessRingProps) {
  const { t } = useLanguage();
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-4 font-karla">
        {t("interviewPrep.readiness.title")}
      </h3>
      {readinessGate && (
        <div className="mb-4">
          <ReadinessGateBanner gate={readinessGate} />
        </div>
      )}
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={isReady ? "#16a34a" : "#2563eb"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-dark">{score}</span>
            <span className="text-xs text-main">/100</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          {breakdown && (
            <div className="space-y-2 mb-3">
              {(
                [
                  ["compatibility", breakdown.compatibility],
                  ["questionCoverage", breakdown.questionCoverage],
                  ["starReadiness", breakdown.starReadiness],
                  ["companyResearch", breakdown.companyResearch],
                  ["mockPerformance", breakdown.mockPerformance],
                ] as const
              ).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs text-main mb-0.5">
                    <span>{t(`interviewPrep.readiness.${key}`)}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue rounded-full transition-all"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          {isReady ? (
            <p className="text-sm text-green-700 font-medium">
              {t("interviewPrep.readiness.ready")}
            </p>
          ) : (
            nextActions.length > 0 && (
              <ul className="text-xs text-main space-y-1 list-disc list-inside">
                {nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  );
}
