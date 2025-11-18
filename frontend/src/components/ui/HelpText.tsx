"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface HelpTextProps {
  children: React.ReactNode;
}

export function HelpText({ children }: HelpTextProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Help">
        ?
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-64 p-3 mt-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg -left-32 md:left-0">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export function CustomDomainHelp() {
  const { t } = useLanguage();
  
  return (
    <HelpText>
      <div className="space-y-2">
        <p className="font-semibold">{t("cv.customDomainOptional")}</p>
        <p>
          {t("cv.customDomainHelp")}
        </p>
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-amber-600">
            {t("cv.requirements")}
          </p>
          <ul className="mt-1 ml-4 text-xs list-disc space-y-1">
            <li>{t("cv.mustOwnDomain")}</li>
            <li>{t("cv.configureDNS")}</li>
            <li>{t("cv.contactSupport")}</li>
          </ul>
        </div>
        <p className="text-xs text-gray-500 italic">
          {t("cv.customDomainNote")}
        </p>
      </div>
    </HelpText>
  );
}
