"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  interviewPrepApi,
  InterviewPrepPlanDetail,
  isInterviewPrepPaywallError,
  PlanStarStory,
  PrepDay,
} from "@/lib/interview-prep";
import PrepTimeline from "@/components/interview-prep/PrepTimeline";
import ReadinessRing from "@/components/interview-prep/ReadinessRing";
import StarStoriesPanel from "@/components/interview-prep/StarStoriesPanel";
import QuestionBankPanel from "@/components/interview-prep/QuestionBankPanel";
import ProUpgradeModal from "@/components/interview-prep/ProUpgradeModal";
import InterviewPrepGate from "@/components/interview-prep/InterviewPrepGate";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import { ArrowLeft, Download, Shield } from "lucide-react";

function buildQuestionLabels(roadmap: PrepDay[]): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const day of roadmap) {
    for (const task of day.tasks) {
      if (task.refId && task.type === "question_practice") {
        labels[task.refId] = task.title.replace(/^Practice: /, "");
      }
    }
  }
  return labels;
}

export default function InterviewPrepDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const planId = params.id as string;
  const queryClient = useQueryClient();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [savingStoryIndex, setSavingStoryIndex] = useState<number | null>(
    null,
  );
  const [showMockPaywall, setShowMockPaywall] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["interview-prep", planId],
    queryFn: () => interviewPrepApi.getPlan(planId),
    enabled: !!planId,
  });

  const invalidate = (updated: InterviewPrepPlanDetail) => {
    queryClient.setQueryData(["interview-prep", planId], updated);
    queryClient.invalidateQueries({ queryKey: ["interview-prep"] });
  };

  const taskMutation = useMutation({
    mutationFn: ({
      dayIndex,
      taskId,
      done,
    }: {
      dayIndex: number;
      taskId: string;
      done: boolean;
    }) => interviewPrepApi.updateTask(planId, dayIndex, taskId, done),
    onMutate: ({ taskId }) => setUpdatingTaskId(taskId),
    onSettled: () => setUpdatingTaskId(null),
    onSuccess: invalidate,
  });

  const starMutation = useMutation({
    mutationFn: ({
      index,
      payload,
    }: {
      index: number;
      payload: Partial<PlanStarStory>;
    }) => interviewPrepApi.updateStarStory(planId, index, payload),
    onMutate: ({ index }) => setSavingStoryIndex(index),
    onSettled: () => setSavingStoryIndex(null),
    onSuccess: invalidate,
  });

  const regenerateMutation = useMutation({
    mutationFn: (index: number) =>
      interviewPrepApi.regenerateStarStory(planId, index),
    onMutate: (index) => setSavingStoryIndex(index),
    onSettled: () => setSavingStoryIndex(null),
    onSuccess: invalidate,
  });

  const mockMutation = useMutation({
    mutationFn: ({
      assignmentId,
      answer,
    }: {
      assignmentId: string;
      answer: string;
    }) => interviewPrepApi.submitMockAnswer(planId, assignmentId, answer),
    onSuccess: invalidate,
    onError: (error) => {
      if (isInterviewPrepPaywallError(error)) {
        setShowMockPaywall(true);
      }
    },
  });

  const handleExportCheatSheet = async () => {
    if (!plan?.limits?.cheatSheetExportEnabled) {
      setShowExportPaywall(true);
      return;
    }
    setExporting(true);
    try {
      const blob = await interviewPrepApi.exportCheatSheetPdf(planId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `interview-cheat-sheet-${planId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setShowExportPaywall(true);
    } finally {
      setExporting(false);
    }
  };

  const questionLabels = useMemo(
    () => buildQuestionLabels(plan?.roadmap ?? []),
    [plan?.roadmap],
  );

  const assignmentsWithLabels = useMemo(
    () =>
      (plan?.questionAssignments ?? []).map((a) => ({
        ...a,
        label: questionLabels[a.questionId] ?? a.questionId,
      })),
    [plan?.questionAssignments, questionLabels],
  );

  if (isLoading || !plan) {
    return (
      <div className="p-6 text-sm text-main">
        {t("interviewPrep.detail.loading")}
      </div>
    );
  }

  return (
    <InterviewPrepGate>
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link
        href="/dashboard/interview-prep"
        className="inline-flex items-center gap-1 text-sm text-main hover:text-dark">
        <ArrowLeft className="h-4 w-4" />
        {t("interviewPrep.detail.back")}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark font-inter">
            {t("interviewPrep.detail.title")}
          </h1>
          <p className="text-sm text-main mt-1">
            {t("interviewPrep.detail.interviewOn").replace(
              "{{date}}",
              new Date(plan.interviewDate).toLocaleDateString(),
            )}
          </p>
        </div>
        <Button
          variant="outline"
          loading={exporting}
          onClick={handleExportCheatSheet}
          className="flex-shrink-0">
          <Download className="h-4 w-4 mr-2" />
          {t("interviewPrep.export.cheatSheet")}
        </Button>
      </div>

      <ReadinessRing
        score={plan.readinessScore ?? 0}
        breakdown={plan.readinessBreakdown}
        isReady={plan.isReady}
        nextActions={plan.nextActions}
        readinessGate={plan.readinessGate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PrepTimeline
            roadmap={plan.roadmap}
            updatingTaskId={updatingTaskId}
            onToggleTask={(dayIndex, taskId, done) =>
              taskMutation.mutate({ dayIndex, taskId, done })
            }
          />
          <StarStoriesPanel
            stories={plan.starStories}
            savingIndex={savingStoryIndex}
            onSave={async (index, payload) => {
              await starMutation.mutateAsync({ index, payload });
            }}
            onRegenerate={async (index) => {
              await regenerateMutation.mutateAsync(index);
            }}
          />
        </div>
        <div className="space-y-6">
          <QuestionBankPanel
            assignments={assignmentsWithLabels}
            limits={plan.limits}
            mockLoading={mockMutation.isPending}
            onMockSubmit={async (assignmentId, answer) => {
              await mockMutation.mutateAsync({ assignmentId, answer });
            }}
          />
          {plan.projectDefenses?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-dark mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue" />
                {t("interviewPrep.defense.title")}
              </h3>
              <ul className="space-y-3">
                {plan.projectDefenses.map((d) => (
                  <li
                    key={d.projectName}
                    className="text-sm border border-gray-100 rounded-lg p-3">
                    <p className="font-medium text-dark">{d.projectName}</p>
                    <p className="text-xs text-main mt-1">{d.role}</p>
                    <p className="text-xs text-main mt-2 line-clamp-3">
                      {d.hardestProblem}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <ProUpgradeModal
        isOpen={showMockPaywall}
        onClose={() => setShowMockPaywall(false)}
        reason="mockDrills"
      />
      <ProUpgradeModal
        isOpen={showExportPaywall}
        onClose={() => setShowExportPaywall(false)}
        reason="export"
      />
    </div>
    </InterviewPrepGate>
  );
}
