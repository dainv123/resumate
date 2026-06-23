"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Loader2 } from "lucide-react";
import { interviewPrepApi } from "@/lib/interview-prep";
import { isInterviewPrepEnabled } from "@/lib/feature-flags";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveInterviewPrepPrefill } from "@/lib/interview-prep-onboarding";

const URL_PATTERN = /^https?:\/\//i;

export default function JdPasteBar() {
  const { t } = useLanguage();
  const router = useRouter();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isInterviewPrepEnabled()) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = value.trim();
    if (!input) return;

    setError("");
    setLoading(true);
    try {
      let jobDescription = input;
      if (URL_PATTERN.test(input)) {
        const resolved = await interviewPrepApi.resolveJd(input);
        jobDescription = resolved.description;
      }
      saveInterviewPrepPrefill("", jobDescription);
      router.push("/dashboard/interview-prep");
    } catch {
      setError(t("interviewPrep.p2.jdBar.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-2 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-main" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("interviewPrep.p2.jdBar.placeholder")}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue text-white disabled:opacity-50 flex items-center gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("interviewPrep.p2.jdBar.cta")}
        </button>
      </form>
      {error && <p className="max-w-4xl mx-auto text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
