"use client";

import React from "react";
import { CalendarCheck, Target } from "lucide-react";
import {
  PrepDay,
  QuestionAssignment,
} from "@/lib/interview-prep";
import {
  findTodayPrepDay,
  getLastMockScore,
  sortAssignmentsForPractice,
} from "@/lib/interview-prep-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface TodayFocusPanelProps {
  roadmap: PrepDay[];
  assignments: Array<QuestionAssignment & { label?: string }>;
  daysUntilInterview: number;
  onPracticeQuestion: (assignmentId: string) => void;
  onStartSession?: () => void;
}

export default function TodayFocusPanel({
  roadmap,
  assignments,
  daysUntilInterview,
  onPracticeQuestion,
  onStartSession,
}: TodayFocusPanelProps) {
  const { t } = useLanguage();
  const todayDay = findTodayPrepDay(roadmap);
  const pendingTasks = todayDay?.tasks.filter((task) => !task.done) ?? [];
  const practiceQueue = (
    sortAssignmentsForPractice(assignments) as Array<
      QuestionAssignment & { label?: string }
    >
  ).slice(0, 3);
  const weakCount = assignments.filter((a) => {
    const score = getLastMockScore(a);
    return score != null && score < 7;
  }).length;

  return (
    <div className="bg-gradient-to-br from-blue/5 to-white rounded-xl border border-blue/20 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-dark font-karla flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-blue" />
            {t("interviewPrep.today.title")}
          </h3>
          <p className="text-xs text-main mt-1">
            {daysUntilInterview === 0
              ? t("interviewPrep.today.interviewToday")
              : t("interviewPrep.today.daysLeft").replace(
                  "{{days}}",
                  String(daysUntilInterview),
                )}
          </p>
          {todayDay && (
            <p className="text-xs text-dark mt-1 font-medium">{todayDay.theme}</p>
          )}
        </div>
        {onStartSession && practiceQueue.length > 0 && (
          <Button size="sm" onClick={onStartSession}>
            {t("interviewPrep.today.startSession")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-dark mb-2">
            {t("interviewPrep.today.tasks")}
          </p>
          {pendingTasks.length === 0 ? (
            <p className="text-xs text-main">{t("interviewPrep.today.noTasks")}</p>
          ) : (
            <ul className="space-y-2">
              {pendingTasks.slice(0, 4).map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-2 text-xs text-main">
                  <span
                    className={cn(
                      "mt-0.5 h-2 w-2 rounded-full flex-shrink-0",
                      task.priority === "P1"
                        ? "bg-red-500"
                        : task.priority === "P2"
                          ? "bg-amber-500"
                          : "bg-gray-300",
                    )}
                  />
                  <span>{task.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-dark mb-2 flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            {t("interviewPrep.today.practiceNext")}
          </p>
          {practiceQueue.length === 0 ? (
            <p className="text-xs text-main">{t("interviewPrep.today.allPracticed")}</p>
          ) : (
            <ul className="space-y-2">
              {practiceQueue.map((a) => {
                const score = getLastMockScore(a);
                return (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-2">
                    <p className="text-xs text-main line-clamp-2 flex-1">
                      {a.question ?? a.label ?? a.questionId}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 text-xs h-7"
                      onClick={() => onPracticeQuestion(a.id)}>
                      {score != null
                        ? t("interviewPrep.today.retry")
                        : t("interviewPrep.questions.practice")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
          {weakCount > 0 && (
            <p className="text-xs text-amber-700 mt-2">
              {t("interviewPrep.today.weakCount").replace(
                "{{count}}",
                String(weakCount),
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
