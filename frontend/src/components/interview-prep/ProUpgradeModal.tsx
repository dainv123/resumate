"use client";

import React from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export type ProUpgradeReason = "plans" | "questions" | "mockDrills" | "export";

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: ProUpgradeReason;
}

export default function ProUpgradeModal({
  isOpen,
  onClose,
  reason,
}: ProUpgradeModalProps) {
  const { t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <span className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          {t("interviewPrep.proUpgrade.title")}
        </span>
      }>
      <p className="text-sm text-main mb-4">
        {t(`interviewPrep.proUpgrade.${reason}`)}
      </p>
      <ul className="text-sm text-dark space-y-2 mb-6 list-disc list-inside">
        <li>{t("interviewPrep.proUpgrade.benefitPlans")}</li>
        <li>{t("interviewPrep.proUpgrade.benefitQuestions")}</li>
        <li>{t("interviewPrep.proUpgrade.benefitMock")}</li>
        <li>{t("interviewPrep.proUpgrade.benefitExport")}</li>
      </ul>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>
          {t("interviewPrep.proUpgrade.dismiss")}
        </Button>
        <Link href="/dashboard/settings">
          <Button onClick={onClose}>
            {t("interviewPrep.proUpgrade.cta")}
          </Button>
        </Link>
      </div>
    </Modal>
  );
}
