"use client";

import React from "react";
import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { InterviewPrepPlanSummary } from "@/lib/interview-prep";
import { daysUntilInterviewDate } from "@/lib/interview-prep-utils";
import PrepJobContext from "@/components/interview-prep/PrepJobContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface PrepPlanCardProps {
  plan: InterviewPrepPlanSummary;
}

export default function PrepPlanCard({ plan }: PrepPlanCardProps) {
  const { t } = useLanguage();
  const score = plan.readinessScore ?? 0;
  const daysLeft = daysUntilInterviewDate(plan.interviewDate);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Link
      href={`/dashboard/interview-prep/${plan.id}`}
      className="block p-4 bg-white border border-gray-200 rounded-xl hover:border-blue hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
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

        <ChevronRight className="h-5 w-5 text-main flex-shrink-0 group-hover:text-blue transition-colors" />
      </div>
    </Link>
  );
}
