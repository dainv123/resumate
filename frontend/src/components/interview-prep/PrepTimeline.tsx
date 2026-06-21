"use client";

import React from "react";
import { PrepDay } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrepTimelineProps {
  roadmap: PrepDay[];
  onToggleTask: (dayIndex: number, taskId: string, done: boolean) => void;
  updatingTaskId?: string | null;
}

export default function PrepTimeline({
  roadmap,
  onToggleTask,
  updatingTaskId,
}: PrepTimelineProps) {
  const { t } = useLanguage();
  const [openDays, setOpenDays] = React.useState<Record<number, boolean>>({});

  const toggleDay = (dayIndex: number) => {
    setOpenDays((prev) => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-dark mb-4 font-karla">
        {t("interviewPrep.timeline.title")}
      </h3>
      <div className="space-y-3">
        {roadmap.map((day) => {
          const isOpen = openDays[day.dayIndex] ?? day.dayIndex === 0;
          const doneCount = day.tasks.filter((t) => t.done).length;
          return (
            <div
              key={`${day.dayIndex}-${day.date}`}
              className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleDay(day.dayIndex)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                <div>
                  <p className="text-sm font-semibold text-dark">
                    {day.daysUntilInterview === 0
                      ? t("interviewPrep.timeline.interviewDay")
                      : t("interviewPrep.timeline.dayLabel")
                          .replace("{{days}}", String(day.daysUntilInterview))
                          .replace("{{date}}", day.date)}
                  </p>
                  <p className="text-xs text-main mt-0.5">{day.theme}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-main">
                  <span>
                    {doneCount}/{day.tasks.length}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>
              {isOpen && (
                <ul className="divide-y divide-gray-100">
                  {day.tasks.map((task) => {
                    const updating = updatingTaskId === task.id;
                    return (
                      <li
                        key={task.id}
                        className="flex items-start gap-3 px-4 py-3">
                        <button
                          type="button"
                          disabled={updating || day.dayIndex < 0}
                          onClick={() =>
                            onToggleTask(
                              day.dayIndex,
                              task.id,
                              !task.done,
                            )
                          }
                          className="mt-0.5 flex-shrink-0 disabled:opacity-50">
                          {task.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm text-dark",
                              task.done && "line-through text-gray-400",
                            )}>
                            {task.title}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded",
                                task.priority === "P1"
                                  ? "bg-red-100 text-red-700"
                                  : task.priority === "P2"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-gray-100 text-gray-600",
                              )}>
                              {task.priority}
                            </span>
                            <span className="text-xs text-main">
                              {task.durationMinutes}{" "}
                              {t("interviewPrep.timeline.minutes")}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
