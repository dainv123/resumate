"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  FileText,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { CV } from "@/lib/cv";
import { interviewPrepApi, QuestionPack } from "@/lib/interview-prep";
import {
  defaultInterviewDate,
  peekInterviewPrepPrefill,
} from "@/lib/interview-prep-onboarding";
import { CreatePrepFormValues } from "@/components/interview-prep/CreatePrepForm";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";

const CAPACITY_OPTIONS = [30, 60, 90] as const;
const STEP_COUNT = 4;

interface InterviewPrepOnboardingWizardProps {
  cvs: CV[];
  loading?: boolean;
  onSubmit: (values: CreatePrepFormValues) => void;
  onSkip: () => void;
}

export default function InterviewPrepOnboardingWizard({
  cvs,
  loading,
  onSubmit,
  onSkip,
}: InterviewPrepOnboardingWizardProps) {
  const { t } = useLanguage();
  const prefill = useMemo(() => peekInterviewPrepPrefill(), []);
  const [step, setStep] = useState(0);
  const [cvId, setCvId] = useState(prefill?.cvId ?? "");
  const [jobDescription, setJobDescription] = useState(
    prefill?.jobDescription ?? "",
  );
  const [jdUrl, setJdUrl] = useState("");
  const [jdMode, setJdMode] = useState<"text" | "url">(
    prefill?.jobDescription ? "text" : "text",
  );
  const [resolving, setResolving] = useState(false);
  const [interviewDate, setInterviewDate] = useState(defaultInterviewDate());
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState(60);
  const [questionPack, setQuestionPack] = useState<QuestionPack>("standard");

  useEffect(() => {
    if (!cvId && cvs.length > 0) {
      const master = cvs.find((c) => !c.isTailored) ?? cvs[0];
      setCvId(master.id);
    }
  }, [cvs, cvId]);

  const resolveUrl = async () => {
    if (!jdUrl.trim()) return;
    setResolving(true);
    try {
      const resolved = await interviewPrepApi.resolveJd(jdUrl.trim());
      setJobDescription(resolved.description);
      setJdMode("text");
    } finally {
      setResolving(false);
    }
  };

  const jdReady = jobDescription.trim().length > 50 || jdUrl.trim().length > 0;
  const canNext =
    step === 0 ||
    (step === 1 && cvs.length > 0 && !!cvId) ||
    (step === 2 && jdReady) ||
    step === 3;

  const handleNext = () => {
    if (step < STEP_COUNT - 1) {
      setStep(step + 1);
      return;
    }
    onSubmit({
      jobDescription: jobDescription.trim() || jdUrl.trim(),
      cvId,
      interviewDate,
      dailyCapacityMinutes,
      questionPack,
    });
  };

  const selectedCv = cvs.find((c) => c.id === cvId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-5 w-5 text-blue" />
            <h2 className="text-lg font-bold text-dark font-inter">
              {t("interviewPrep.onboarding.title")}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-main">
              {t("interviewPrep.onboarding.step")
                .replace("{{current}}", String(step + 1))
                .replace("{{total}}", String(STEP_COUNT))}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue transition-all duration-300"
                style={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {step === 0 && (
            <>
              <p className="text-sm text-main leading-relaxed">
                {t("interviewPrep.onboarding.intro")}
              </p>
              <ul className="space-y-2 text-sm text-dark">
                <li className="flex gap-2">
                  <FileText className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
                  {t("interviewPrep.onboarding.bulletJd")}
                </li>
                <li className="flex gap-2">
                  <Sparkles className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
                  {t("interviewPrep.onboarding.bulletRoadmap")}
                </li>
                <li className="flex gap-2">
                  <Calendar className="h-4 w-4 text-blue flex-shrink-0 mt-0.5" />
                  {t("interviewPrep.onboarding.bulletMock")}
                </li>
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-sm text-main">
                {t("interviewPrep.onboarding.pickCv")}
              </p>
              {cvs.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="mb-3">{t("interviewPrep.onboarding.noCv")}</p>
                  <Link href="/dashboard/cv/create">
                    <Button size="sm">{t("interviewPrep.onboarding.uploadCv")}</Button>
                  </Link>
                </div>
              ) : (
                <select
                  value={cvId}
                  onChange={(e) => setCvId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.parsedData?.contact?.name || cv.originalFileName}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm text-main">
                {t("interviewPrep.onboarding.pasteJd")}
              </p>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setJdMode("text")}
                  className={`text-xs px-3 py-1 rounded-full ${
                    jdMode === "text"
                      ? "bg-blue text-white"
                      : "bg-gray-100 text-main"
                  }`}>
                  {t("interviewPrep.p2.form.jdText")}
                </button>
                <button
                  type="button"
                  onClick={() => setJdMode("url")}
                  className={`text-xs px-3 py-1 rounded-full ${
                    jdMode === "url"
                      ? "bg-blue text-white"
                      : "bg-gray-100 text-main"
                  }`}>
                  {t("interviewPrep.p2.form.jdUrl")}
                </button>
              </div>
              {jdMode === "text" ? (
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder={t("interviewPrep.form.jdPlaceholder")}
                />
              ) : (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder={t("interviewPrep.p2.form.jdUrlPlaceholder")}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    loading={resolving}
                    onClick={resolveUrl}>
                    {t("interviewPrep.p2.form.resolveUrl")}
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-sm text-main mb-3">
                {t("interviewPrep.onboarding.schedule")}
              </p>
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-main space-y-1 mb-4">
                <p>
                  <span className="font-medium text-dark">CV:</span>{" "}
                  {selectedCv?.parsedData?.contact?.name ||
                    selectedCv?.originalFileName}
                </p>
                <p className="line-clamp-2">
                  <span className="font-medium text-dark">JD:</span>{" "}
                  {(jobDescription || jdUrl).slice(0, 120)}…
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    {t("interviewPrep.form.interviewDate")}
                  </label>
                  <input
                    type="date"
                    value={interviewDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-1">
                    {t("interviewPrep.form.capacity")}
                  </label>
                  <select
                    value={dailyCapacityMinutes}
                    onChange={(e) =>
                      setDailyCapacityMinutes(Number(e.target.value))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {CAPACITY_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {t("interviewPrep.form.capacityMinutes").replace(
                          "{{minutes}}",
                          String(m),
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            {step > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("interviewPrep.onboarding.back")}
              </Button>
            ) : (
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-main hover:text-dark">
                {t("interviewPrep.onboarding.skip")}
              </button>
            )}
          </div>
          <Button
            loading={loading && step === STEP_COUNT - 1}
            disabled={!canNext || (step === 1 && cvs.length === 0)}
            onClick={handleNext}>
            {step === STEP_COUNT - 1 ? (
              t("interviewPrep.onboarding.createPlan")
            ) : (
              <>
                {t("interviewPrep.onboarding.next")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
