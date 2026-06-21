"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/cv";
import {
  interviewPrepApi,
  CreateInterviewPrepPayload,
  isInterviewPrepPaywallError,
} from "@/lib/interview-prep";
import CreatePrepForm from "@/components/interview-prep/CreatePrepForm";
import ProUpgradeModal from "@/components/interview-prep/ProUpgradeModal";
import InterviewPrepGate from "@/components/interview-prep/InterviewPrepGate";
import { useLanguage } from "@/contexts/LanguageContext";
import { GraduationCap, Calendar, ChevronRight } from "lucide-react";

export default function InterviewPrepListPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPlanPaywall, setShowPlanPaywall] = useState(false);

  const { data: cvs = [] } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["interview-prep"],
    queryFn: interviewPrepApi.listPlans,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateInterviewPrepPayload) =>
      interviewPrepApi.createPlan(payload),
    onSuccess: (plan) => {
      queryClient.invalidateQueries({ queryKey: ["interview-prep"] });
      router.push(`/dashboard/interview-prep/${plan.id}`);
    },
    onError: (error) => {
      if (isInterviewPrepPaywallError(error)) {
        setShowPlanPaywall(true);
      }
    },
  });

  return (
    <InterviewPrepGate>
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-dark font-inter flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-blue" />
          {t("interviewPrep.title")}
        </h1>
        <p className="text-main mt-1">{t("interviewPrep.subtitle")}</p>
      </div>

      <CreatePrepForm
        cvs={cvs.filter((c) => !c.isTailored)}
        loading={createMutation.isPending}
        onSubmit={(values) => createMutation.mutate(values)}
      />

      <div>
        <h2 className="text-lg font-semibold text-dark mb-4 font-karla">
          {t("interviewPrep.list.title")}
        </h2>
        {isLoading ? (
          <p className="text-sm text-main">{t("interviewPrep.list.loading")}</p>
        ) : plans.length === 0 ? (
          <p className="text-sm text-main">{t("interviewPrep.list.empty")}</p>
        ) : (
          <ul className="space-y-3">
            {plans.map((plan) => (
              <li key={plan.id}>
                <Link
                  href={`/dashboard/interview-prep/${plan.id}`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue hover:shadow-sm transition-all">
                  <div>
                    <p className="text-sm font-medium text-dark flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-main" />
                      {new Date(plan.interviewDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-main mt-1">
                      {t("interviewPrep.list.readiness").replace(
                        "{{score}}",
                        String(plan.readinessScore ?? 0),
                      )}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-main" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProUpgradeModal
        isOpen={showPlanPaywall}
        onClose={() => setShowPlanPaywall(false)}
        reason="plans"
      />
    </div>
    </InterviewPrepGate>
  );
}
