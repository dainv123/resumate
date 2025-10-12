"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface QuotaExceededErrorProps {
  feature: string;
  used: number;
  limit: number;
  resetsAt: string;
  upgrade?: {
    available: boolean;
    plan?: string;
    price?: string;
    newLimit?: number;
  };
  onClose?: () => void;
}

export default function QuotaExceededError({
  feature,
  used,
  limit,
  resetsAt,
  upgrade,
  onClose,
}: QuotaExceededErrorProps) {
  const { t } = useLanguage();

  const resetDate = new Date(resetsAt);
  const now = new Date();
  const daysUntilReset = Math.ceil(
    (resetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const featureNames: Record<string, string> = {
    cvUploads: t("features.cvUploads", "CV Uploads"),
    projects: t("features.projects", "Projects"),
    jobTailors: t("features.jobTailors", "Job Tailors"),
    exports: t("features.exports", "Exports"),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
          {t("errors.quotaExceededTitle", "Monthly Limit Reached")}
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          {t(
            "errors.quotaExceededMessage",
            `You've used all ${limit} ${
              featureNames[feature] || feature
            } for this month.`
          )}
        </p>

        {/* Usage Stats */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {featureNames[feature] || feature}
            </span>
            <span className="text-sm font-bold text-red-600 dark:text-red-400">
              {used}/{limit}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
            <div
              className="bg-red-500 h-3 rounded-full transition-all"
              style={{ width: `${(used / limit) * 100}%` }}
            />
          </div>

          {/* Reset date */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {t("errors.quotaResetsIn", `Resets in ${daysUntilReset} days`)}
            <br />
            <span className="text-gray-400 dark:text-gray-500">
              {resetDate.toLocaleDateString()}
            </span>
          </p>
        </div>

        {/* Upgrade offer */}
        {upgrade?.available && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {t("upgrade.title", `Upgrade to ${upgrade.plan}`)}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                  {t(
                    "upgrade.description",
                    `Get ${upgrade.newLimit} ${featureNames[feature]} per month`
                  )}
                </p>
                {upgrade.price && (
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {upgrade.price}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>{t("common.note", "Note")}:</strong>{" "}
            {t(
              "errors.quotaNote",
              "Your quota will automatically reset at the beginning of next month."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              {t("common.close", "Close")}
            </button>
          )}
          {upgrade?.available && (
            <button
              onClick={() => (window.location.href = "/dashboard/settings")}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-lg">
              {t("common.upgradeNow", "Upgrade Now")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
