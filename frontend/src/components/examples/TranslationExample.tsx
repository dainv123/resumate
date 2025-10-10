/**
 * Translation Example Component
 *
 * This is an example showing how to use the i18n system
 * You can use this as a reference for implementing translations in other components
 */

"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export default function TranslationExample() {
  const { t, language } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
          <Globe className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">i18n Example</h3>
          <p className="text-sm text-gray-600">
            Current language:{" "}
            <span className="font-semibold">
              {language === "vi" ? "Tiếng Việt" : "English"}
            </span>
          </p>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-3">
        {/* Common translations */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Common translations:
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm">
              {t("common.save")}
            </button>
            <button className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm">
              {t("common.cancel")}
            </button>
            <button className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm">
              {t("common.delete")}
            </button>
          </div>
        </div>

        {/* Job Tailor translations */}
        <div className="bg-white rounded-lg p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Job Tailor translations:
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Title:</strong> {t("jobTailor.title")}
            </p>
            <p>
              <strong>Description:</strong> {t("jobTailor.description")}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Key:{" "}
              <code className="bg-gray-100 px-1 rounded">
                t(&quot;jobTailor.title&quot;)
              </code>
            </p>
          </div>
        </div>

        {/* Usage guide */}
        <div className="bg-purple-100 rounded-lg p-4">
          <p className="text-sm font-semibold text-purple-900 mb-2">
            💡 How to use:
          </p>
          <ol className="text-xs text-purple-800 space-y-1 list-decimal list-inside">
            <li>
              Import: <code className="bg-white px-1 rounded">useLanguage</code>{" "}
              hook
            </li>
            <li>
              Get translation function:{" "}
              <code className="bg-white px-1 rounded">
                const &#123; t &#125; = useLanguage()
              </code>
            </li>
            <li>
              Use:{" "}
              <code className="bg-white px-1 rounded">
                &#123;t(&quot;section.key&quot;)&#125;
              </code>
            </li>
          </ol>
        </div>
      </div>

      {/* Code example */}
      <details className="bg-gray-900 text-gray-100 rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-semibold mb-2">
          📝 View code example
        </summary>
        <pre className="text-xs mt-2 overflow-x-auto">
          {`import { useLanguage } from "@/contexts/LanguageContext";

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("jobTailor.title")}</h1>
      <p>{t("jobTailor.description")}</p>
      <button>{t("common.save")}</button>
    </div>
  );
}`}
        </pre>
      </details>
    </div>
  );
}
