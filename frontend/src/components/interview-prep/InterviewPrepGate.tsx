"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isInterviewPrepEnabled } from "@/lib/feature-flags";
import { useLanguage } from "@/contexts/LanguageContext";

export default function InterviewPrepGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const enabled = isInterviewPrepEnabled();

  useEffect(() => {
    if (!enabled) {
      router.replace("/dashboard");
    }
  }, [enabled, router]);

  if (!enabled) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center space-y-4">
        <p className="text-sm text-main">{t("interviewPrep.errors.disabled")}</p>
        <Link href="/dashboard" className="text-sm text-blue hover:underline">
          {t("interviewPrep.detail.back")}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
