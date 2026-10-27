"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, MapPin, Globe } from "lucide-react";

const LanguageDetectionLoader: React.FC = () => {
  const { isDetectingLanguage, language } = useLanguage();

  if (!isDetectingLanguage) return null;

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-4 text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <MapPin className="h-8 w-8 text-blue-500" />
            <Globe className="h-4 w-4 text-green-500 absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {language === "vi"
            ? "Đang phát hiện ngôn ngữ..."
            : "Detecting language..."}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {language === "vi"
            ? "Chúng tôi đang xác định vị trí của bạn để hiển thị giao diện phù hợp"
            : "We're detecting your location to show the appropriate interface"}
        </p>

        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      </div>
    </div>
  );
};

export default LanguageDetectionLoader;
