"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Collapse } from "@/components/ui/Collapse";
import {
  Award,
  CheckSquare,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { CompatibilityAnalysis } from "@/lib/cv";

interface CompatibilityAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: CompatibilityAnalysis | null;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export default function CompatibilityAnalysisModal({
  isOpen,
  onClose,
  analysis,
  title,
  size = "xl",
  footer,
  children,
}: CompatibilityAnalysisModalProps) {
  const { t } = useLanguage();

  const handleClose = () => {
    onClose();
  };

  // If children are provided, use custom implementation
  if (children) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={title || t("jobTailor.analysisTitle")}
        size={size}
        footer={footer}>
        {children}
      </Modal>
    );
  }

  // Default implementation
  if (!analysis) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t("jobTailor.analysisTitle")}
      size="xl"
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <Button onClick={handleClose}>{t("common.close")}</Button>
        </div>
      }>
      <div className="space-y-6">
        {/* Score */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
            <div className="text-4xl font-bold text-blue-600">
              {analysis.score}
              <span className="text-lg text-gray-400">/10</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {t("jobTailor.compatibilityScore")}
          </h3>
          <p className="text-sm text-gray-600">
            {analysis.score >= 8 && t("jobTailor.excellentMatch")}
            {analysis.score >= 6 && analysis.score < 8 && t("jobTailor.goodMatch")}
            {analysis.score >= 4 && analysis.score < 6 && t("jobTailor.fairMatch")}
            {analysis.score < 4 && t("jobTailor.lowMatch")}
          </p>
        </div>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <Collapse
            title={t("jobTailor.strengths")}
            icon={<Award className="h-4 w-4 text-green-600" />}
            badge={analysis.strengths.length}
            defaultOpen={true}>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </Collapse>
        )}

        {/* Matched Skills */}
        {analysis.matchedSkills.length > 0 && (
          <Collapse
            title={t("jobTailor.matchedSkills")}
            icon={<CheckSquare className="h-4 w-4 text-green-600" />}
            badge={analysis.matchedSkills.length}
            defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {skill}
                </span>
              ))}
            </div>
          </Collapse>
        )}

        {/* Missing Skills */}
        {analysis.missingSkills.length > 0 && (
          <Collapse
            title={t("jobTailor.missingSkills")}
            icon={<XCircle className="h-4 w-4 text-red-600" />}
            badge={analysis.missingSkills.length}
            defaultOpen={true}>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  {skill}
                </span>
              ))}
            </div>
          </Collapse>
        )}

        {/* Matched Experience */}
        {analysis.matchedExperience.length > 0 && (
          <Collapse
            title={t("jobTailor.relevantExperience")}
            icon={<CheckSquare className="h-4 w-4 text-blue-600" />}
            badge={analysis.matchedExperience.length}
            defaultOpen={false}>
            <ul className="space-y-2">
              {analysis.matchedExperience.map((exp, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{exp}</span>
                </li>
              ))}
            </ul>
          </Collapse>
        )}

        {/* Missing Requirements */}
        {analysis.missingRequirements.length > 0 && (
          <Collapse
            title={t("jobTailor.missingRequirements")}
            icon={<XCircle className="h-4 w-4 text-orange-600" />}
            badge={analysis.missingRequirements.length}
            defaultOpen={false}>
            <ul className="space-y-2">
              {analysis.missingRequirements.map((req, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </li>
              ))}
            </ul>
          </Collapse>
        )}

        {/* Suggestions */}
        {analysis.suggestions.length > 0 && (
          <Collapse
            title={t("jobTailor.suggestions")}
            icon={<Lightbulb className="h-4 w-4 text-yellow-600" />}
            badge={analysis.suggestions.length}
            defaultOpen={true}>
            <ul className="space-y-2">
              {analysis.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </Collapse>
        )}
      </div>
    </Modal>
  );
}
