"use client";

import React from "react";
import { Calendar, Download, Play, Target } from "lucide-react";
import { PrepJobDescriptionSummary } from "@/lib/interview-prep";
import { daysUntilInterviewDate } from "@/lib/interview-prep-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface PrepPlanHeroProps {
  jobDescription?: PrepJobDescriptionSummary;
  cvName?: string;
  interviewDate: string;
  readinessScore: number;
  isReady?: boolean;
  roadmapPercent: number;
  questionsPracticed: number;
  questionsTotal: number;
  onStartSession: () => void;
  onExport: () => void;
  exporting?: boolean;
}

export default function PrepPlanHero({
  jobDescription,
  cvName,
  interviewDate,
  readinessScore,
  isReady,
  roadmapPercent,
  questionsPracticed,
  questionsTotal,
  onStartSession,
  onExport,
  exporting,
}: PrepPlanHeroProps) {
  const { t } = useLanguage();
  const daysLeft = daysUntilInterviewDate(interviewDate);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue/10 p-6 shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-dark/5 blur-3xl"
      />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="relative w-24 h-24 flex-shrink-0 mx-auto lg:mx-0">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              className="stroke-blue/25"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              className={isReady ? "stroke-green-500" : "stroke-blue-600"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-dark">
            <span className="text-2xl font-bold">{readinessScore}</span>
            <span className="text-[10px] text-main">/100</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 text-center lg:text-left">
          <p className="text-xs uppercase tracking-wide text-main mb-1">
            {t("interviewPrep.hero.preparingFor")}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold font-inter text-dark truncate">
            {jobDescription?.title ?? t("interviewPrep.detail.title")}
          </h1>
          <p className="text-sm text-main mt-1">
            {[jobDescription?.company, cvName && `CV: ${cvName}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-3 text-sm">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                daysLeft <= 2
                  ? "bg-yellow/15 text-yellow-700 border-yellow/30"
                  : "bg-blue/10 text-dark border-blue/20",
              )}>
              <Calendar className="h-3.5 w-3.5" />
              {daysLeft === 0
                ? t("interviewPrep.hero.interviewToday")
                : t("interviewPrep.hero.daysLeft").replace(
                    "{{days}}",
                    String(daysLeft),
                  )}
              {" · "}
              {new Date(interviewDate).toLocaleDateString()}
            </span>
            {isReady && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full">
                <Target className="h-3.5 w-3.5" />
                {t("interviewPrep.readiness.ready")}
              </span>
            )}
          </div>
        </div>

        <div className="relative flex flex-col sm:flex-row lg:flex-col gap-2 flex-shrink-0">
          <Button onClick={onStartSession}>
            <Play className="h-4 w-4 mr-2" />
            {t("interviewPrep.today.startSession")}
          </Button>
          <Button variant="outline" loading={exporting} onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            {t("interviewPrep.export.cheatSheet")}
          </Button>
        </div>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-blue/15">
        <div className="text-center sm:text-left">
          <p className="text-xs text-main">{t("interviewPrep.hero.roadmapDone")}</p>
          <p className="text-lg font-semibold text-dark">{roadmapPercent}%</p>
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs text-main">{t("interviewPrep.hero.questionsDone")}</p>
          <p className="text-lg font-semibold text-dark">
            {questionsPracticed}/{questionsTotal}
          </p>
        </div>
        <div className="text-center sm:text-left col-span-2 sm:col-span-1">
          <p className="text-xs text-main">{t("interviewPrep.readiness.title")}</p>
          <p
            className={cn(
              "text-lg font-semibold",
              isReady ? "text-green-600" : "text-dark",
            )}>
            {isReady
              ? t("interviewPrep.hero.statusReady")
              : t("interviewPrep.hero.statusBuilding")}
          </p>
        </div>
      </div>
    </div>
  );
}
