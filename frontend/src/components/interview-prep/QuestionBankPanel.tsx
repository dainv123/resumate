"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Lock, Timer } from "lucide-react";
import {
  MockEvaluation,
  PrepLimits,
  QuestionAssignment,
} from "@/lib/interview-prep";
import {
  composeStarAnswer,
  isBehavioralCategory,
  pickSessionAssignmentIds,
  sortAssignmentsForPractice,
} from "@/lib/interview-prep-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProUpgradeModal, {
  ProUpgradeReason,
} from "@/components/interview-prep/ProUpgradeModal";
import { cn } from "@/lib/utils";

interface QuestionBankPanelProps {
  assignments: Array<QuestionAssignment & { label?: string }>;
  limits?: PrepLimits;
  onMockSubmit: (
    assignmentId: string,
    answer: string,
  ) => Promise<MockEvaluation | undefined>;
  mockLoading?: boolean;
  initialActiveId?: string | null;
  onInitialActiveHandled?: () => void;
  sessionRequest?: boolean;
  onSessionRequestHandled?: () => void;
}

function MockFeedbackBody({ evaluation }: { evaluation: MockEvaluation }) {
  const { t } = useLanguage();

  return (
    <div className="mb-4 space-y-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
      <p className="text-sm font-semibold text-dark">
        {t("interviewPrep.mock.resultScore").replace(
          "{{score}}",
          String(evaluation.score),
        )}
      </p>
      {evaluation.feedback && (
        <p className="text-sm text-main whitespace-pre-wrap">
          {evaluation.feedback}
        </p>
      )}
      {evaluation.matchedCriteria.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">
            {t("interviewPrep.mock.matched")}
          </p>
          <ul className="text-xs text-main list-disc pl-4 space-y-0.5">
            {evaluation.matchedCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {evaluation.missingCriteria.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-700 mb-1">
            {t("interviewPrep.mock.missing")}
          </p>
          <ul className="text-xs text-main list-disc pl-4 space-y-0.5">
            {evaluation.missingCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {evaluation.improvedAnswerOutline &&
        evaluation.improvedAnswerOutline.length > 0 && (
          <div>
            <p className="text-xs font-medium text-blue mb-1">
              {t("interviewPrep.mock.improvedOutline")}
            </p>
            <ul className="text-xs text-main list-disc pl-4 space-y-0.5">
              {evaluation.improvedAnswerOutline.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      {evaluation.followUpQuestion && (
        <div className="rounded-md bg-amber-50 border border-amber-100 p-2">
          <p className="text-xs font-medium text-amber-900">
            {t("interviewPrep.mock.followUpPrompt")}
          </p>
          <p className="text-xs text-main mt-1">{evaluation.followUpQuestion}</p>
        </div>
      )}
    </div>
  );
}

function QuestionHintsBlock({
  hints,
}: {
  hints: NonNullable<QuestionAssignment["hints"]>;
}) {
  const { t } = useLanguage();

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-main space-y-2">
      <p className="font-medium text-dark">
        {t("interviewPrep.questions.hintsTitle")}
      </p>
      {hints.sampleAnswerOutline.length > 0 && (
        <ul className="list-disc pl-4 space-y-0.5">
          {hints.sampleAnswerOutline.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {hints.followUpQuestions.length > 0 && (
        <div>
          <p className="font-medium text-dark mt-1">
            {t("interviewPrep.questions.followUps")}
          </p>
          <ul className="list-disc pl-4 space-y-0.5">
            {hints.followUpQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const EMPTY_STAR = { situation: "", task: "", action: "", result: "" };

export default function QuestionBankPanel({
  assignments,
  limits,
  onMockSubmit,
  mockLoading,
  initialActiveId,
  onInitialActiveHandled,
  sessionRequest,
  onSessionRequestHandled,
}: QuestionBankPanelProps) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sessionQueue, setSessionQueue] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [starFields, setStarFields] = useState(EMPTY_STAR);
  const [useStarMode, setUseStarMode] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [lastEvaluation, setLastEvaluation] = useState<MockEvaluation | null>(
    null,
  );
  const [showResult, setShowResult] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<ProUpgradeReason | null>(
    null,
  );

  const sorted = useMemo(
    () =>
      sortAssignmentsForPractice(assignments) as Array<
        QuestionAssignment & { label?: string }
      >,
    [assignments],
  );

  const mockEnabled = limits?.mockDrillsEnabled ?? true;
  const lockedCount = limits?.lockedQuestionCount ?? 0;
  const totalCount = limits?.totalQuestions ?? assignments.length;

  const active = assignments.find((a) => a.id === activeId);
  const lastScore = active?.mockScores?.[active.mockScores.length - 1];
  const prepMinutes = active?.prepTimeMinutes ?? 3;

  const resetMockState = () => {
    setAnswer("");
    setStarFields(EMPTY_STAR);
    setUseStarMode(false);
    setSecondsLeft(null);
    setLastEvaluation(null);
    setShowResult(false);
  };

  const openMock = (id: string) => {
    if (!mockEnabled) {
      setUpgradeReason("mockDrills");
      return;
    }
    const item = assignments.find((a) => a.id === id);
    setActiveId(id);
    resetMockState();
    setUseStarMode(isBehavioralCategory(item?.category));
    setSecondsLeft((item?.prepTimeMinutes ?? 3) * 60);
  };

  const startSession = () => {
    const queue = pickSessionAssignmentIds(assignments);
    if (!queue.length) return;
    setSessionQueue(queue.slice(1));
    openMock(queue[0]);
  };

  useEffect(() => {
    if (!initialActiveId) return;
    openMock(initialActiveId);
    onInitialActiveHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActiveId]);

  useEffect(() => {
    if (!sessionRequest) return;
    startSession();
    onSessionRequestHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionRequest]);

  useEffect(() => {
    if (secondsLeft == null || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s == null || s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const advanceSession = () => {
    if (sessionQueue.length === 0) {
      setActiveId(null);
      resetMockState();
      return;
    }
    const [next, ...rest] = sessionQueue;
    setSessionQueue(rest);
    openMock(next);
  };

  const buildAnswer = () =>
    useStarMode ? composeStarAnswer(starFields) : answer;

  const handleSubmit = async () => {
    if (!activeId) return;
    const text = buildAnswer().trim();
    if (!text) return;
    const evaluation = await onMockSubmit(activeId, text);
    if (evaluation) {
      setLastEvaluation(evaluation);
      setShowResult(true);
      setSecondsLeft(null);
    }
  };

  const closeMockModal = () => {
    setActiveId(null);
    setSessionQueue([]);
    resetMockState();
  };

  const formatTimer = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-semibold text-dark font-karla">
            {t("interviewPrep.questions.title")}
          </h3>
          {sorted.length > 0 && (
            <Button size="sm" variant="outline" onClick={startSession}>
              {t("interviewPrep.today.startSession")}
            </Button>
          )}
        </div>
        <p className="text-xs text-main mb-4">
          {t("interviewPrep.questions.visibleCount")
            .replace("{{visible}}", String(assignments.length))
            .replace("{{total}}", String(totalCount))}
        </p>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {sorted.map((a) => {
            const score = a.mockScores?.[a.mockScores.length - 1]?.score;
            const displayQuestion = a.question ?? a.label ?? a.questionId;
            return (
              <li
                key={a.id}
                className={cn(
                  "p-3 border rounded-lg",
                  score != null && score < 7
                    ? "border-amber-200 bg-amber-50/40"
                    : "border-gray-100",
                )}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-dark">{displayQuestion}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {a.category && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue/10 text-blue">
                          {a.category}
                        </span>
                      )}
                      <span className="text-xs text-main">{a.priority}</span>
                      {score != null && (
                        <span
                          className={cn(
                            "text-xs",
                            score >= 7 ? "text-green-700" : "text-amber-700",
                          )}>
                          {t("interviewPrep.questions.score").replace(
                            "{{score}}",
                            String(score),
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMock(a.id)}>
                    {mockEnabled
                      ? t("interviewPrep.questions.practice")
                      : t("interviewPrep.questions.practiceLocked")}
                  </Button>
                </div>
                {a.hints && <QuestionHintsBlock hints={a.hints} />}
              </li>
            );
          })}
        </ul>
        {lockedCount > 0 && (
          <button
            type="button"
            onClick={() => setUpgradeReason("questions")}
            className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-sm text-main hover:border-blue hover:text-blue transition-colors">
            <Lock className="h-4 w-4" />
            {t("interviewPrep.questions.locked").replace(
              "{{count}}",
              String(lockedCount),
            )}
          </button>
        )}
      </div>

      <Modal
        isOpen={!!activeId}
        onClose={closeMockModal}
        title={t("interviewPrep.mock.title")}>
        <p className="text-sm text-dark font-medium mb-2">
          {active?.question ?? active?.label ?? active?.questionId}
        </p>

        {secondsLeft != null && !showResult && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs mb-3",
              secondsLeft <= 30 ? "text-red-600" : "text-main",
            )}>
            <Timer className="h-3.5 w-3.5" />
            {t("interviewPrep.mock.timer").replace(
              "{{time}}",
              formatTimer(secondsLeft),
            )}
            <span className="text-main">
              · {t("interviewPrep.mock.suggestedTime").replace(
                "{{minutes}}",
                String(prepMinutes),
              )}
            </span>
          </div>
        )}

        {active?.hints && !showResult && (
          <div className="mb-3 rounded-lg border border-blue/20 bg-blue/5 p-3">
            <QuestionHintsBlock hints={active.hints} />
          </div>
        )}

        {showResult && lastEvaluation ? (
          <>
            <MockFeedbackBody evaluation={lastEvaluation} />
            <div className="flex gap-2">
              {sessionQueue.length > 0 ? (
                <Button onClick={advanceSession}>
                  {t("interviewPrep.mock.nextQuestion")}
                </Button>
              ) : (
                <Button onClick={closeMockModal}>
                  {t("interviewPrep.mock.done")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {lastScore != null && (
              <p className="text-xs text-green-700 mb-3">
                {t("interviewPrep.mock.lastScore").replace(
                  "{{score}}",
                  String(lastScore.score),
                )}
              </p>
            )}

            {useStarMode ? (
              <div className="space-y-3 mb-4">
                {(["situation", "task", "action", "result"] as const).map(
                  (field) => (
                    <div key={field}>
                      <label className="text-xs font-medium text-dark uppercase">
                        {t(`interviewPrep.starStories.${field}`)}
                      </label>
                      <textarea
                        rows={2}
                        value={starFields[field]}
                        onChange={(e) =>
                          setStarFields((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  ),
                )}
                <button
                  type="button"
                  className="text-xs text-main underline"
                  onClick={() => setUseStarMode(false)}>
                  {t("interviewPrep.mock.switchFreeform")}
                </button>
              </div>
            ) : (
              <>
                <textarea
                  rows={6}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                  placeholder={t("interviewPrep.mock.placeholder")}
                />
                {isBehavioralCategory(active?.category) && (
                  <button
                    type="button"
                    className="text-xs text-blue mb-4 underline"
                    onClick={() => setUseStarMode(true)}>
                    {t("interviewPrep.mock.switchStar")}
                  </button>
                )}
              </>
            )}

            <Button loading={mockLoading} onClick={handleSubmit}>
              {t("interviewPrep.mock.submit")}
            </Button>
          </>
        )}
      </Modal>

      <ProUpgradeModal
        isOpen={upgradeReason != null}
        onClose={() => setUpgradeReason(null)}
        reason={upgradeReason ?? "mockDrills"}
      />
    </>
  );
}
