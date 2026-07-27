"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight, Trash2 } from "lucide-react";
import { InterviewPrepPlanSummary } from "@/lib/interview-prep";
import { daysUntilInterviewDate } from "@/lib/interview-prep-utils";
import PrepJobContext from "@/components/interview-prep/PrepJobContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

interface PrepPlanCardProps {
  plan: InterviewPrepPlanSummary;
  onDelete?: (planId: string) => void;
  deleting?: boolean;
}

export default function PrepPlanCard({
  plan,
  onDelete,
  deleting = false,
}: PrepPlanCardProps) {
  const { t } = useLanguage();
  const score = plan.readinessScore ?? 0;
  const daysLeft = daysUntilInterviewDate(plan.interviewDate);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-stretch gap-1 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue hover:shadow-md transition-all group">
      <Link
        href={`/dashboard/interview-prep/${plan.id}`}
        className="flex items-start gap-4 min-w-0 flex-1">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-dark">
            {score}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {plan.jobDescription && (
            <PrepJobContext
              jobDescription={plan.jobDescription}
              cvName={plan.cvName}
              compact
            />
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium",
                daysLeft <= 3
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-main",
              )}>
              <Calendar className="h-3 w-3" />
              {daysLeft === 0
                ? t("interviewPrep.hero.interviewToday")
                : t("interviewPrep.hero.daysLeft").replace(
                    "{{days}}",
                    String(daysLeft),
                  )}
            </span>
            <span className="text-main">
              {new Date(plan.interviewDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-main flex-shrink-0 self-center group-hover:text-blue transition-colors" />
      </Link>

      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          disabled={deleting}
          loading={deleting}
          onClick={() => onDelete(plan.id)}
          className="self-center text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{t("common.delete")}</span>
        </Button>
      )}
    </div>
  );
}
