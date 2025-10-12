"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface UsageIndicatorProps {
  feature: string;
  used: number;
  limit: number;
  resetsAt?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export default function UsageIndicator({
  feature,
  used,
  limit,
  resetsAt,
  showDetails = true,
  compact = false,
}: UsageIndicatorProps) {
  const { t } = useLanguage();
  const [daysUntilReset, setDaysUntilReset] = useState(0);

  useEffect(() => {
    if (resetsAt) {
      const resetDate = new Date(resetsAt);
      const now = new Date();
      const days = Math.ceil(
        (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      setDaysUntilReset(days);
    }
  }, [resetsAt]);

  const percentage = limit === -1 ? 0 : (used / limit) * 100;
  const isUnlimited = limit === -1;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= limit;

  const featureNames: Record<string, string> = {
    cvUploads: t("features.cvUploads", "CV Uploads"),
    projects: t("features.projects", "Projects"),
    jobTailors: t("features.jobTailors", "Job Tailors"),
    exports: t("features.exports", "Exports"),
  };

  const getStatusColor = () => {
    if (isUnlimited) return "text-green-600 dark:text-green-400";
    if (isAtLimit) return "text-red-600 dark:text-red-400";
    if (isNearLimit) return "text-yellow-600 dark:text-yellow-400";
    return "text-blue-600 dark:text-blue-400";
  };

  const getProgressColor = () => {
    if (isUnlimited) return "bg-green-500";
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-blue-500";
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {featureNames[feature] || feature}:
        </span>
        <span className={`font-semibold ${getStatusColor()}`}>
          {isUnlimited ? "∞" : `${used}/${limit}`}
        </span>
        {!isUnlimited && (
          <div className="flex-1 min-w-[60px] max-w-[100px] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`${getProgressColor()} h-1.5 rounded-full transition-all`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {featureNames[feature] || feature}
        </h4>
        <span className={`text-lg font-bold ${getStatusColor()}`}>
          {isUnlimited ? (
            <span className="flex items-center space-x-1">
              <span>∞</span>
              <span className="text-xs font-normal">Unlimited</span>
            </span>
          ) : (
            `${used}/${limit}`
          )}
        </span>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden mb-2">
          <div
            className={`${getProgressColor()} h-2.5 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      {/* Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>
            {isUnlimited ? (
              t("usage.unlimited", "No limits")
            ) : isAtLimit ? (
              <span className="text-red-600 dark:text-red-400 font-medium">
                {t("usage.limitReached", "Limit reached")}
              </span>
            ) : (
              t("usage.remaining", `${limit - used} remaining`)
            )}
          </span>
          {resetsAt && !isUnlimited && (
            <span>{t("usage.resetsIn", `Resets in ${daysUntilReset}d`)}</span>
          )}
        </div>
      )}

      {/* Warning message */}
      {isAtLimit && !isUnlimited && (
        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
          <p className="text-xs text-red-700 dark:text-red-300">
            {t("usage.upgradePrompt", "Upgrade your plan to continue")}
          </p>
        </div>
      )}
    </div>
  );
}
