"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RateLimitErrorProps {
  retryAfter: number;
  limit: number;
  onRetry?: () => void;
  onClose?: () => void;
}

export default function RateLimitError({
  retryAfter,
  limit,
  onRetry,
  onClose,
}: RateLimitErrorProps) {
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState(retryAfter);

  useEffect(() => {
    if (countdown <= 0) {
      if (onRetry) {
        onRetry();
      }
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onRetry) {
            setTimeout(onRetry, 100);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onRetry]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-white mb-2">
          {t("errors.rateLimitTitle", "Too Many Requests")}
        </h3>

        {/* Message */}
        <p className="text-center text-gray-600 dark:text-gray-400 mb-4">
          {t(
            "errors.rateLimitMessage",
            `You've exceeded the rate limit of ${limit} requests per minute.`
          )}
        </p>

        {/* Countdown */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {countdown}s
            </span>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            {countdown > 0
              ? t(
                  "errors.rateLimitRetrying",
                  `Retrying in ${countdown} seconds...`
                )
              : t("errors.rateLimitRetryingNow", "Retrying now...")}
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: `${((retryAfter - countdown) / retryAfter) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>{t("common.tip", "Tip")}:</strong>{" "}
            {t(
              "errors.rateLimitTip",
              "Consider upgrading your plan for higher rate limits."
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              {t("common.cancel", "Cancel")}
            </button>
          )}
          <button
            onClick={() => (window.location.href = "/dashboard/settings")}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {t("common.upgradePlan", "Upgrade Plan")}
          </button>
        </div>
      </div>
    </div>
  );
}
