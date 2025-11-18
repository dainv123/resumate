"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import TemplateGallery from "@/components/template-gallery/TemplateGallery";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function TemplatesPage() {
  const { t } = useLanguage();

  return (
    <DashboardLayout
      title={t("templateGallery.title")}
      subtitle={t("templateGallery.subtitle")}
      showBackButton={true}
      // backUrl="/dashboard"
      headerActions={
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("common.backToDashboard")}
          </Button>
        </Link>
      }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TemplateGallery />
      </div>
    </DashboardLayout>
  );
}
