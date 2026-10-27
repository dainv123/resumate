"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface RenameCvModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export default function RenameCvModal({
  isOpen,
  currentName,
  onClose,
  onSave,
}: RenameCvModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setName(currentName);
  }, [isOpen, currentName]);

  const trimmed = name.trim();
  const canSave = trimmed.length > 0 && trimmed !== currentName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t("cv.renameTitle")}
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave || saving}>
            {saving ? t("cv.renaming") : t("cv.renameSave")}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t("cv.cvName")}
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/30 focus:border-main"
          placeholder={t("cv.enterCvName")}
        />
        <p className="text-xs text-gray-500">{t("cv.renameHint")}</p>
      </form>
    </Modal>
  );
}
