"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { PrepJobDescriptionSummary } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrepJobContextProps {
  jobDescription?: PrepJobDescriptionSummary;
  cvName?: string;
  cvId?: string;
  compact?: boolean;
}

function CvLink({
  cvId,
  cvName,
  className,
}: {
  cvId?: string;
  cvName?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  if (!cvName) return null;
  const label = t("interviewPrep.jd.cv").replace("{{name}}", cvName);
  if (!cvId) {
    return <p className={className}>{label}</p>;
  }
  return (
    <Link
      href={`/dashboard/cv/${cvId}`}
      className={`inline-flex items-center gap-1 hover:underline ${className ?? ""}`}
      title={cvName}
    >
      <span className="break-all">{label}</span>
      <ExternalLink className="h-3 w-3 flex-shrink-0" />
    </Link>
  );
}

export default function PrepJobContext({
  jobDescription,
  cvName,
  cvId,
  compact = false,
}: PrepJobContextProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  if (!jobDescription) return null;

  const hasFullDescription =
    !!jobDescription.description &&
    jobDescription.description !== jobDescription.preview;

  if (compact) {
    return (
      <div className="min-w-0">
        <p className="text-sm font-semibold text-dark break-words">
          {jobDescription.title}
        </p>
        {(jobDescription.company || cvName) && (
          <div className="text-xs text-main mt-0.5 space-y-0.5">
            {jobDescription.company ? (
              <p className="truncate">{jobDescription.company}</p>
            ) : null}
            <CvLink
              cvId={cvId}
              cvName={cvName}
              className="text-xs text-blue font-medium"
            />
          </div>
        )}
        <p className="text-xs text-main mt-1 line-clamp-2 whitespace-pre-wrap">
          {jobDescription.preview}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue/10 flex items-center justify-center flex-shrink-0">
          <Briefcase className="h-5 w-5 text-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-main uppercase tracking-wide">
            {t("interviewPrep.jd.label")}
          </p>
          <p className="text-base font-semibold text-dark font-inter mt-0.5 break-words">
            {jobDescription.title}
          </p>
          {jobDescription.company && (
            <p className="text-sm text-main mt-0.5">{jobDescription.company}</p>
          )}
          <CvLink
            cvId={cvId}
            cvName={cvName}
            className="text-sm text-blue font-medium mt-1"
          />
          <p
            className={`text-sm text-main mt-2 whitespace-pre-wrap ${
              compact && !expanded ? "line-clamp-2" : ""
            }`}>
            {expanded && jobDescription.description
              ? jobDescription.description
              : jobDescription.preview}
          </p>
          {!compact && hasFullDescription && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue hover:text-blue/80">
              {expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  {t("interviewPrep.jd.showLess")}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  {t("interviewPrep.jd.viewFull")}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
