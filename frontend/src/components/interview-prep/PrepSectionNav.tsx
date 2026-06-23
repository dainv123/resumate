"use client";

import React, { useEffect, useState } from "react";
import {
  PREP_SECTION_IDS,
  PrepSectionId,
  scrollToPrepSection,
} from "@/lib/interview-prep-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const SECTIONS: PrepSectionId[] = [
  PREP_SECTION_IDS.overview,
  PREP_SECTION_IDS.practice,
  PREP_SECTION_IDS.prepare,
  PREP_SECTION_IDS.roadmap,
];

const LABEL_KEYS: Record<PrepSectionId, string> = {
  [PREP_SECTION_IDS.overview]: "interviewPrep.sections.overview",
  [PREP_SECTION_IDS.practice]: "interviewPrep.sections.practice",
  [PREP_SECTION_IDS.prepare]: "interviewPrep.sections.prepare",
  [PREP_SECTION_IDS.roadmap]: "interviewPrep.sections.roadmap",
};

export default function PrepSectionNav() {
  const { t } = useLanguage();
  const [active, setActive] = useState<PrepSectionId>(PREP_SECTION_IDS.overview);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        { rootMargin: "-120px 0px -60% 0px", threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav className="sticky top-0 z-30 -mx-6 px-6 py-2 bg-gray-50/95 backdrop-blur border-b border-gray-200 mb-6">
      <div className="flex gap-1 overflow-x-auto max-w-6xl mx-auto scrollbar-hide">
        {SECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToPrepSection(id)}
            className={cn(
              "flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
              active === id
                ? "bg-blue text-white"
                : "text-main hover:bg-white hover:text-dark",
            )}>
            {t(LABEL_KEYS[id])}
          </button>
        ))}
      </div>
    </nav>
  );
}
