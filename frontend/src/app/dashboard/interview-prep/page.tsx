"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/cv";
import {
  interviewPrepApi,
  CreateInterviewPrepPayload,
  isInterviewPrepPaywallError,
} from "@/lib/interview-prep";
import {
  consumeInterviewPrepPrefill,
  markPrepOnboardingDone,
  shouldShowPrepWizard,
} from "@/lib/interview-prep-onboarding";
import CreatePrepForm from "@/components/interview-prep/CreatePrepForm";
import InterviewPrepOnboardingWizard from "@/components/interview-prep/InterviewPrepOnboardingWizard";
import ProUpgradeModal from "@/components/interview-prep/ProUpgradeModal";
import InterviewPrepGate from "@/components/interview-prep/InterviewPrepGate";
import PrepPlanCard from "@/components/interview-prep/PrepPlanCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, Upload } from "lucide-react";
import Button from "@/components/ui/Button";

export default function InterviewPrepListPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPlanPaywall, setShowPlanPaywall] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const { data: cvs = [], isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
  });

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["interview-prep"],
    queryFn: interviewPrepApi.listPlans,
  });

  const masterCvs = cvs.filter((c) => !c.isTailored);

  useEffect(() => {
    if (cvsLoading || plansLoading) return;
    setShowWizard(shouldShowPrepWizard(plans.length, masterCvs.length));
  }, [cvsLoading, plansLoading, plans.length, masterCvs.length]);

  const finishOnboarding = () => {
    markPrepOnboardingDone();
    setShowWizard(false);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateInterviewPrepPayload) =>
      interviewPrepApi.createPlan(payload),
    onSuccess: (plan) => {
      consumeInterviewPrepPrefill();
      finishOnboarding();
      queryClient.invalidateQueries({ queryKey: ["interview-prep"] });
      router.push(`/dashboard/interview-prep/${plan.id}`);
    },
    onError: (error) => {
      if (isInterviewPrepPaywallError(error)) {
        setShowPlanPaywall(true);
      }
    },
  });

  const handleCreate = (values: CreateInterviewPrepPayload) => {
    createMutation.mutate({ ...values, language });
  };

  return (
    <InterviewPrepGate>
      {showWizard && (
        <InterviewPrepOnboardingWizard
          cvs={masterCvs}
          loading={createMutation.isPending}
          onSubmit={handleCreate}
          onSkip={finishOnboarding}
        />
      )}

      <div
        className={`p-6 max-w-5xl mx-auto space-y-8 ${showWizard ? "pointer-events-none opacity-40" : ""}`}>
        <div>
          <h1 className="text-2xl font-bold text-dark font-inter flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-blue" />
            {t("interviewPrep.title")}
          </h1>
          <p className="text-main mt-1">{t("interviewPrep.subtitle")}</p>
        </div>

        {!cvsLoading && masterCvs.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-amber-900">
                {t("interviewPrep.onboarding.needCvTitle")}
              </p>
              <p className="text-xs text-amber-800 mt-1">
                {t("interviewPrep.onboarding.needCvDesc")}
              </p>
            </div>
            <Link href="/dashboard/cv/create">
              <Button size="sm">
                <Upload className="h-4 w-4 mr-1" />
                {t("interviewPrep.onboarding.uploadCv")}
              </Button>
            </Link>
          </div>
        )}

        {!showWizard && masterCvs.length > 0 && (
          <CreatePrepForm
            cvs={masterCvs}
            loading={createMutation.isPending}
            onSubmit={handleCreate}
          />
        )}

        {!showWizard && masterCvs.length > 0 && plans.length === 0 && (
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="text-sm text-blue hover:underline">
            {t("interviewPrep.onboarding.reopenWizard")}
          </button>
        )}

        <div>
          <h2 className="text-lg font-semibold text-dark mb-4 font-karla">
            {t("interviewPrep.list.title")}
          </h2>
          {plansLoading ? (
            <p className="text-sm text-main">{t("interviewPrep.list.loading")}</p>
          ) : plans.length === 0 ? (
            <p className="text-sm text-main">{t("interviewPrep.list.empty")}</p>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <PrepPlanCard plan={plan} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ProUpgradeModal
        isOpen={showPlanPaywall}
        onClose={() => setShowPlanPaywall(false)}
        reason="plans"
      />
    </InterviewPrepGate>
  );
}
