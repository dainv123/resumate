"use client";

import React, { useState } from "react";
import { Lock } from "lucide-react";
import {
  MockEvaluation,
  PrepLimits,
  QuestionAssignment,
} from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ProUpgradeModal, {
  ProUpgradeReason,
} from "@/components/interview-prep/ProUpgradeModal";

interface QuestionBankPanelProps {
  assignments: Array<QuestionAssignment & { label?: string }>;
  limits?: PrepLimits;
  onMockSubmit: (
    assignmentId: string,
    answer: string,
  ) => Promise<MockEvaluation | undefined>;
  mockLoading?: boolean;
}

function MockFeedbackBody({
  evaluation,
  lastScore,
}: {
  evaluation?: MockEvaluation;
  lastScore?: QuestionAssignment["mockScores"] extends (infer E)[] | undefined
    ? E
    : never;
}) {
  const { t } = useLanguage();
  const data = evaluation ?? lastScore;
  if (!data) return null;

  const score = evaluation?.score ?? (lastScore as { score: number }).score;
  const feedback = evaluation?.feedback ?? lastScore?.feedback;
  const matched =
    evaluation?.matchedCriteria ?? lastScore?.matchedCriteria ?? [];
  const missing =
    evaluation?.missingCriteria ?? lastScore?.missingCriteria ?? [];

  return (
    <div className="mb-4 space-y-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
      <p className="text-sm font-semibold text-dark">
        {t("interviewPrep.mock.resultScore").replace("{{score}}", String(score))}
      </p>
      {feedback && (
        <p className="text-sm text-main whitespace-pre-wrap">{feedback}</p>
      )}
      {matched.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">
            {t("interviewPrep.mock.matched")}
          </p>
          <ul className="text-xs text-main list-disc pl-4 space-y-0.5">
            {matched.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-700 mb-1">
            {t("interviewPrep.mock.missing")}
          </p>
          <ul className="text-xs text-main list-disc pl-4 space-y-0.5">
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
      <p className="font-medium text-dark">{t("interviewPrep.questions.hintsTitle")}</p>
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

export default function QuestionBankPanel({
  assignments,
  limits,
  onMockSubmit,
  mockLoading,
}: QuestionBankPanelProps) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [lastEvaluation, setLastEvaluation] = useState<MockEvaluation | null>(
    null,
  );
  const [showResult, setShowResult] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<ProUpgradeReason | null>(
    null,
  );

  const mockEnabled = limits?.mockDrillsEnabled ?? true;
  const lockedCount = limits?.lockedQuestionCount ?? 0;
  const totalCount = limits?.totalQuestions ?? assignments.length;

  const active = assignments.find((a) => a.id === activeId);
  const lastScore = active?.mockScores?.[active.mockScores.length - 1];

  const openMock = (id: string) => {
    if (!mockEnabled) {
      setUpgradeReason("mockDrills");
      return;
    }
    setActiveId(id);
    setAnswer("");
    setLastEvaluation(null);
    setShowResult(false);
  };

  const handleSubmit = async () => {
    if (!activeId || !answer.trim()) return;
    const evaluation = await onMockSubmit(activeId, answer);
    if (evaluation) {
      setLastEvaluation(evaluation);
      setShowResult(true);
    }
  };

  const closeMockModal = () => {
    setActiveId(null);
    setAnswer("");
    setLastEvaluation(null);
    setShowResult(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-dark mb-1 font-karla">
          {t("interviewPrep.questions.title")}
        </h3>
        <p className="text-xs text-main mb-4">
          {t("interviewPrep.questions.visibleCount")
            .replace("{{visible}}", String(assignments.length))
            .replace("{{total}}", String(totalCount))}
        </p>
        <ul className="space-y-2 max-h-96 overflow-y-auto">
          {assignments.map((a) => {
            const score = a.mockScores?.[a.mockScores.length - 1]?.score;
            return (
              <li
                key={a.id}
                className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-dark">{a.label ?? a.question ?? a.questionId}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-main">{a.priority}</span>
                      {score != null && (
                        <span className="text-xs text-blue">
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
        <p className="text-sm text-main mb-2">
          {active?.label ?? active?.question ?? active?.questionId}
        </p>

        {showResult && lastEvaluation ? (
          <>
            <MockFeedbackBody evaluation={lastEvaluation} />
            <Button onClick={closeMockModal}>{t("interviewPrep.mock.done")}</Button>
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
            <textarea
              rows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
              placeholder={t("interviewPrep.mock.placeholder")}
            />
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
