"use client";

import React, { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  interviewPrepApi,
  PostInterviewOutcome,
} from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

const OUTCOMES: PostInterviewOutcome[] = [
  "passed",
  "failed",
  "waiting",
  "declined",
];

interface PostInterviewSurveyModalProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function PostInterviewSurveyModal({
  planId,
  isOpen,
  onClose,
  onSubmitted,
}: PostInterviewSurveyModalProps) {
  const { t } = useLanguage();
  const [outcome, setOutcome] = useState<PostInterviewOutcome>("waiting");
  const [difficulty, setDifficulty] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await interviewPrepApi.submitSurvey(planId, { outcome, difficulty, notes });
    setLoading(false);
    onSubmitted();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("interviewPrep.p2.survey.title")}>
      <p className="text-sm text-main mb-4">{t("interviewPrep.p2.survey.subtitle")}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t("interviewPrep.p2.survey.outcome")}
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as PostInterviewOutcome)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {OUTCOMES.map((o) => (
              <option key={o} value={o}>
                {t(`interviewPrep.p2.survey.outcomes.${o}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t("interviewPrep.p2.survey.difficulty")}
          </label>
          <input
            type="range"
            min={1}
            max={5}
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-main mt-1">{difficulty}/5</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t("interviewPrep.p2.survey.notes")}
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder={t("interviewPrep.p2.survey.notesPlaceholder")}
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose}>
          {t("interviewPrep.p2.survey.skip")}
        </Button>
        <Button loading={loading} onClick={handleSubmit}>
          {t("interviewPrep.p2.survey.submit")}
        </Button>
      </div>
    </Modal>
  );
}
