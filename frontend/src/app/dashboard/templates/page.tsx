"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import TemplateGallery from "@/components/template-gallery/TemplateGallery";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TemplatesPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout
      title={t("templateGallery.title")}
      subtitle={t("templateGallery.subtitle")}
      showBackButton={true}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TemplateGallery />
      </div>
    </DashboardLayout>
  );
}
