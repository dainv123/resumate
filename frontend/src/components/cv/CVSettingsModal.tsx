"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Eye, Download, Save, X } from "lucide-react";

interface CVSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CVSettingsModal({
  isOpen,
  onClose,
}: CVSettingsModalProps) {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    showVersionHistory: true,
    showTailoredCvsSeparately: true,
    autoSaveChanges: false,
    includeMetadataInExports: true,
    autoDownloadAfterExport: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    // Save settings logic here
    onClose();
  };

  const footerContent = (
    <div className="flex justify-end space-x-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex items-center gap-2">
        <X className="w-4 h-4" />
        {t("common.cancel")}
      </Button>
      <Button
        onClick={handleSave}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
        <Save className="w-4 h-4" />
        {t("common.save")}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("cv.settings")}
      footer={footerContent}>
      <div className="space-y-6">
        {/* Display Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <Eye className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">
              {t("cv.displaySettings")}
            </h4>
          </div>

          <div className="space-y-3">
            {/* Setting Item 1 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showVersionHistory}
                  onChange={() => handleToggle("showVersionHistory")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {t("cv.showVersionHistory")}
              </span>
            </label>

            {/* Setting Item 2 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showTailoredCvsSeparately}
                  onChange={() => handleToggle("showTailoredCvsSeparately")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {t("cv.showTailoredCvsSeparately")}
              </span>
            </label>

            {/* Setting Item 3 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoSaveChanges}
                  onChange={() => handleToggle("autoSaveChanges")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {t("cv.autoSaveChanges")}
              </span>
            </label>
          </div>
        </div>

        {/* Export Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
            <Download className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">
              {t("cv.exportSettings")}
            </h4>
          </div>

          <div className="space-y-3">
            {/* Setting Item 4 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={settings.includeMetadataInExports}
                  onChange={() => handleToggle("includeMetadataInExports")}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {t("cv.includeMetadataInExports")}
              </span>
            </label>

            {/* Setting Item 5 */}
            <label className="flex items-center p-3 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoDownloadAfterExport}
                  onChange={() => handleToggle("autoDownloadAfterExport")}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {t("cv.autoDownloadAfterExport")}
              </span>
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}
