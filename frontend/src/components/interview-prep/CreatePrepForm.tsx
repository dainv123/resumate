"use client";

import React, { useEffect, useState } from "react";
import { CV } from "@/lib/cv";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import { GraduationCap } from "lucide-react";

const CAPACITY_OPTIONS = [30, 60, 90] as const;
const PREFILL_KEY = "interviewPrepPrefill";

export interface CreatePrepFormValues {
  jobDescription: string;
  cvId: string;
  interviewDate: string;
  dailyCapacityMinutes: number;
}

interface CreatePrepFormProps {
  cvs: CV[];
  loading?: boolean;
  onSubmit: (values: CreatePrepFormValues) => void;
}

export default function CreatePrepForm({
  cvs,
  loading,
  onSubmit,
}: CreatePrepFormProps) {
  const { t } = useLanguage();
  const [jobDescription, setJobDescription] = useState("");
  const [cvId, setCvId] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [dailyCapacityMinutes, setDailyCapacityMinutes] = useState<number>(60);

  useEffect(() => {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PREFILL_KEY);
    try {
      const prefill = JSON.parse(raw) as {
        cvId?: string;
        jobDescription?: string;
      };
      if (prefill.jobDescription) setJobDescription(prefill.jobDescription);
      if (prefill.cvId) setCvId(prefill.cvId);
    } catch {
      /* ignore invalid prefill */
    }
  }, []);

  useEffect(() => {
    if (!cvId && cvs.length > 0) {
      const master = cvs.find((c) => !c.isTailored) ?? cvs[0];
      setCvId(master.id);
    }
  }, [cvs, cvId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ jobDescription, cvId, interviewDate, dailyCapacityMinutes });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <GraduationCap className="h-5 w-5 text-blue" />
        <h2 className="text-lg font-semibold text-dark font-karla">
          {t("interviewPrep.create.title")}
        </h2>
      </div>
      <p className="text-sm text-main">{t("interviewPrep.create.subtitle")}</p>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">
          {t("interviewPrep.form.cv")}
        </label>
        <select
          value={cvId}
          onChange={(e) => setCvId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          required>
          <option value="">{t("interviewPrep.form.selectCv")}</option>
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.parsedData.contact?.name || cv.originalFileName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-dark mb-1">
          {t("interviewPrep.form.jd")}
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          placeholder={t("interviewPrep.form.jdPlaceholder")}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1">
            {t("interviewPrep.form.interviewDate")}
          </label>
          <input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            required
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

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        {t("interviewPrep.create.submit")}
      </Button>
    </form>
  );
}

export function saveInterviewPrepPrefill(cvId: string, jobDescription: string) {
  sessionStorage.setItem(
    PREFILL_KEY,
    JSON.stringify({ cvId, jobDescription }),
  );
}
