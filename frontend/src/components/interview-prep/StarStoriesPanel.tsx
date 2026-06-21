"use client";

import React, { useState } from "react";
import { PlanStarStory } from "@/lib/interview-prep";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";

interface StarStoriesPanelProps {
  stories: PlanStarStory[];
  onSave: (
    index: number,
    payload: Partial<PlanStarStory>,
  ) => Promise<void>;
  onRegenerate: (index: number) => Promise<void>;
  savingIndex?: number | null;
}

export default function StarStoriesPanel({
  stories,
  onSave,
  onRegenerate,
  savingIndex,
}: StarStoriesPanelProps) {
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<PlanStarStory[]>(stories);

  React.useEffect(() => {
    setDrafts(stories);
  }, [stories]);

  const updateField = (
    index: number,
    field: keyof PlanStarStory,
    value: string | boolean,
  ) => {
    setDrafts((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  if (stories.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-main">
        {t("interviewPrep.starStories.empty")}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="text-sm font-semibold text-dark font-karla">
        {t("interviewPrep.starStories.title")}
      </h3>
      {drafts.map((story, index) => (
        <div
          key={story.id}
          className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-dark">{story.question}</p>
            {story.ready && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                {t("interviewPrep.starStories.ready")}
              </span>
            )}
          </div>
          {(["situation", "task", "action", "result"] as const).map(
            (field) => (
              <div key={field}>
                <label className="text-xs font-medium text-main uppercase">
                  {t(`interviewPrep.starStories.${field}`)}
                </label>
                <textarea
                  rows={2}
                  value={story[field]}
                  onChange={(e) => updateField(index, field, e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ),
          )}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              loading={savingIndex === index}
              onClick={() =>
                onSave(index, {
                  situation: drafts[index].situation,
                  task: drafts[index].task,
                  action: drafts[index].action,
                  result: drafts[index].result,
                })
              }>
              {t("interviewPrep.starStories.save")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={savingIndex === index}
              onClick={() => onRegenerate(index)}>
              {t("interviewPrep.starStories.regenerate")}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              loading={savingIndex === index}
              onClick={() =>
                onSave(index, {
                  situation: drafts[index].situation,
                  task: drafts[index].task,
                  action: drafts[index].action,
                  result: drafts[index].result,
                  ready: true,
                })
              }>
              {t("interviewPrep.starStories.markReady")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
