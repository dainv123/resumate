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
import {
  countQuestionProgress,
  countRoadmapProgress,
  findTodayPrepDay,
  PREP_SECTION_IDS,
} from "@/lib/interview-prep-utils";
import PrepTimeline from "@/components/interview-prep/PrepTimeline";
import ReadinessRing from "@/components/interview-prep/ReadinessRing";
import StarStoriesPanel from "@/components/interview-prep/StarStoriesPanel";
import QuestionBankPanel from "@/components/interview-prep/QuestionBankPanel";
import ProUpgradeModal from "@/components/interview-prep/ProUpgradeModal";
import InterviewPrepGate from "@/components/interview-prep/InterviewPrepGate";
import PrepJobContext from "@/components/interview-prep/PrepJobContext";
import ProcessMapPanel from "@/components/interview-prep/ProcessMapPanel";
import CompanyResearchPanel from "@/components/interview-prep/CompanyResearchPanel";
import TodayFocusPanel from "@/components/interview-prep/TodayFocusPanel";
import PostInterviewSurveyModal from "@/components/interview-prep/PostInterviewSurveyModal";
import PrepPlanHero from "@/components/interview-prep/PrepPlanHero";
import PrepSectionNav from "@/components/interview-prep/PrepSectionNav";
import GapAnalysisPanel from "@/components/interview-prep/GapAnalysisPanel";
import ProjectDefensePanel from "@/components/interview-prep/ProjectDefensePanel";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";

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

function PrepDetailSkeleton() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="h-48 bg-gray-200 rounded-2xl" />
      <div className="h-10 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-40 bg-gray-200 rounded-xl" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export default function InterviewPrepDetailPage() {
  const { t, language } = useLanguage();
  const params = useParams();
  const planId = params.id as string;
  const queryClient = useQueryClient();
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [savingStoryIndex, setSavingStoryIndex] = useState<number | null>(null);
  const [showMockPaywall, setShowMockPaywall] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [togglingSectionId, setTogglingSectionId] = useState<string | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyDismissed, setSurveyDismissed] = useState(false);
  const [practiceQuestionId, setPracticeQuestionId] = useState<string | null>(null);
  const [sessionRequest, setSessionRequest] = useState(false);

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
    }) =>
      interviewPrepApi.submitMockAnswer(planId, assignmentId, answer, language),
    onSuccess: (data) => {
      invalidate(data);
      return data.mockEvaluation;
    },
    onError: (error) => {
      if (isInterviewPrepPaywallError(error)) {
        setShowMockPaywall(true);
      }
    },
  });

  const companyResearchMutation = useMutation({
    mutationFn: ({
      sectionId,
      checked,
    }: {
      sectionId: string;
      checked: boolean;
    }) =>
      interviewPrepApi.updateCompanyResearchSection(planId, sectionId, checked),
    onMutate: ({ sectionId }) => setTogglingSectionId(sectionId),
    onSettled: () => setTogglingSectionId(null),
    onSuccess: invalidate,
  });

  const interviewPassed =
    plan &&
    !plan.postInterviewSurvey &&
    !surveyDismissed &&
    new Date(plan.interviewDate) < new Date(new Date().toDateString());

  React.useEffect(() => {
    if (interviewPassed) setShowSurvey(true);
  }, [interviewPassed]);

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

  const daysUntilInterview = useMemo(() => {
    const todayDay = findTodayPrepDay(plan?.roadmap ?? []);
    return todayDay?.daysUntilInterview ?? 0;
  }, [plan?.roadmap]);

  const roadmapProgress = useMemo(
    () => countRoadmapProgress(plan?.roadmap ?? []),
    [plan?.roadmap],
  );

  const questionProgress = useMemo(
    () => countQuestionProgress(plan?.questionAssignments ?? []),
    [plan?.questionAssignments],
  );

  const startSession = () => {
    setSessionRequest(true);
    document
      .getElementById(PREP_SECTION_IDS.practice)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  if (isLoading || !plan) {
    return (
      <InterviewPrepGate>
        <PrepDetailSkeleton />
      </InterviewPrepGate>
    );
  }

  return (
    <InterviewPrepGate>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto">
          <Link
            href="/dashboard/interview-prep"
            className="inline-flex items-center gap-1 text-sm text-main hover:text-dark mb-4">
            <ArrowLeft className="h-4 w-4" />
            {t("interviewPrep.detail.back")}
          </Link>

          <PrepPlanHero
            jobDescription={plan.jobDescription}
            cvName={plan.cvName}
            interviewDate={plan.interviewDate}
            readinessScore={plan.readinessScore ?? 0}
            isReady={plan.isReady}
            roadmapPercent={roadmapProgress.percent}
            questionsPracticed={questionProgress.practiced}
            questionsTotal={questionProgress.total}
            onStartSession={startSession}
            onExport={handleExportCheatSheet}
            exporting={exporting}
          />
        </div>

        <PrepSectionNav />

        <div className="px-6 max-w-6xl mx-auto pb-12 space-y-10">
          <section
            id={PREP_SECTION_IDS.overview}
            className="scroll-mt-28 space-y-6">
            <TodayFocusPanel
              roadmap={plan.roadmap}
              assignments={assignmentsWithLabels}
              daysUntilInterview={daysUntilInterview}
              onPracticeQuestion={(id) => {
                setPracticeQuestionId(id);
                document
                  .getElementById(PREP_SECTION_IDS.practice)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              onStartSession={startSession}
            />

            <PrepJobContext
              jobDescription={plan.jobDescription}
              cvName={plan.cvName}
            />

            <ReadinessRing
              score={plan.readinessScore ?? 0}
              breakdown={plan.readinessBreakdown}
              isReady={plan.isReady}
              nextActions={plan.nextActions}
              readinessGate={plan.readinessGate}
            />

            <GapAnalysisPanel
              gaps={plan.gaps}
              compatibility={plan.compatibility}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProcessMapPanel processMap={plan.processMap} />
              <CompanyResearchPanel
                jobDescription={plan.jobDescription}
                companyResearch={plan.companyResearch}
                togglingSectionId={togglingSectionId}
                onToggleSection={(sectionId, checked) =>
                  companyResearchMutation.mutate({ sectionId, checked })
                }
              />
            </div>
          </section>

          <section id={PREP_SECTION_IDS.practice} className="scroll-mt-28">
            <h2 className="text-lg font-semibold text-dark mb-4 font-karla">
              {t("interviewPrep.sections.practice")}
            </h2>
            <QuestionBankPanel
              assignments={assignmentsWithLabels}
              limits={plan.limits}
              mockLoading={mockMutation.isPending}
              initialActiveId={practiceQuestionId}
              onInitialActiveHandled={() => setPracticeQuestionId(null)}
              sessionRequest={sessionRequest}
              onSessionRequestHandled={() => setSessionRequest(false)}
              onMockSubmit={async (assignmentId, answer) => {
                const result = await mockMutation.mutateAsync({
                  assignmentId,
                  answer,
                });
                return result.mockEvaluation;
              }}
            />
          </section>

          <section
            id={PREP_SECTION_IDS.prepare}
            className="scroll-mt-28 space-y-6">
            <h2 className="text-lg font-semibold text-dark font-karla">
              {t("interviewPrep.sections.prepare")}
            </h2>
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
            <ProjectDefensePanel defenses={plan.projectDefenses ?? []} />
          </section>

          <section id={PREP_SECTION_IDS.roadmap} className="scroll-mt-28">
            <h2 className="text-lg font-semibold text-dark mb-4 font-karla">
              {t("interviewPrep.sections.roadmap")}
            </h2>
            <PrepTimeline
              roadmap={plan.roadmap}
              updatingTaskId={updatingTaskId}
              onToggleTask={(dayIndex, taskId, done) =>
                taskMutation.mutate({ dayIndex, taskId, done })
              }
            />
          </section>
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
      <PostInterviewSurveyModal
        planId={planId}
        isOpen={showSurvey}
        onClose={() => {
          setShowSurvey(false);
          setSurveyDismissed(true);
        }}
        onSubmitted={() =>
          queryClient.invalidateQueries({ queryKey: ["interview-prep", planId] })
        }
      />
    </InterviewPrepGate>
  );
}
