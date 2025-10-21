"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import AiCvWizard from "@/components/ai-cv-wizard/AiCvWizard";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AiWizardPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout
      title={t("aiCvWizard.title")}
      subtitle={t("aiCvWizard.subtitle")}
      // backUrl="/dashboard"
    >
      <AiCvWizard />
    </DashboardLayout>
  );
}
