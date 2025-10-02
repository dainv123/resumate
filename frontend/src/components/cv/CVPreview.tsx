"use client";

import React, { useState } from "react";
import { CV, CVData, cvApi } from "@/lib/cv";
import { formatDate } from "@/lib/utils";
import {
  Download,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  Briefcase,
} from "lucide-react";
import Button from "@/components/ui/Button";
import EditCVModal from "./EditCVModal";
import OriginalCVModal from "./OriginalCVModal";
import JobDescriptionModal from "./JobDescriptionModal";

interface CVPreviewProps {
  cv: CV;
  onEdit?: (cv: CV) => void;
  onDelete?: (cv: CV) => void;
  onTailor?: (cv: CV) => void;
  onExport?: (cv: CV, format: "pdf" | "word" | "ats") => void;
  onUpdate?: (cv: CV) => void;
}

export default function CVPreview({
  cv,
  onEdit,
  onDelete,
  onTailor,
  onExport,
  onUpdate,
}: CVPreviewProps) {
  const { parsedData } = cv;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOriginalCVModal, setShowOriginalCVModal] = useState(false);
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            {parsedData.name}
          </h4>
          <p className="text-sm text-gray-500">
            {parsedData.email} • {parsedData.phone}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version {cv.version} • Updated {formatDate(cv.updatedAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {cv.isTailored && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              <Sparkles className="h-3 w-3 mr-1" />
              Tailored
            </span>
          )}
        </div>
      </div>

      {/* CV Relationships */}
      {cv.isTailored && (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            CV Relationships
          </h4>

          <div className="space-y-2">
            {cv.originalCv && (
              <div className="text-xs text-green-700">
                <span className="font-medium">📄 Original CV:</span>{" "}
                <button
                  onClick={() => setShowOriginalCVModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  {cv.originalCv.originalFileName}
                </button>
              </div>
            )}
            {cv.jobDescription && (
              <div className="text-xs text-green-700">
                <span className="font-medium">🎯 Tailored for:</span>{" "}
                <button
                  onClick={() => setShowJobDescriptionModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline cursor-pointer flex items-center">
                  <Briefcase className="h-3 w-3 mr-1" />
                  {cv.jobDescription.title}
                </button>
              </div>
            )}
            {cv.tailoredVersions && cv.tailoredVersions.length > 0 && (
              <div className="text-xs text-green-700">
                <span className="font-medium">🔄 Tailored versions:</span>{" "}
                {cv.tailoredVersions.length} versions
              </div>
            )}
          </div>
        </div>
      )}

      {/* Improvement Notes */}
      {cv.improvementNotes && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Enhancements Applied
          </h4>

          {cv.improvementNotes.parsingImprovements &&
            cv.improvementNotes.parsingImprovements.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-blue-800 mb-2">
                  📊 Parsing Improvements:
                </h5>
                <ul className="space-y-1">
                  {cv.improvementNotes.parsingImprovements
                    .slice(0, 3)
                    .map((improvement, index) => (
                      <li key={index} className="text-xs text-blue-700">
                        {improvement}
                      </li>
                    ))}
                  {cv.improvementNotes.parsingImprovements.length > 3 && (
                    <li className="text-xs text-blue-600 font-medium">
                      +{cv.improvementNotes.parsingImprovements.length - 3} more
                      improvements
                    </li>
                  )}
                </ul>
              </div>
            )}

          {cv.improvementNotes.templateEnhancements &&
            cv.improvementNotes.templateEnhancements.length > 0 && (
              <div className="mb-3">
                <h5 className="text-xs font-medium text-blue-800 mb-2">
                  🎨 Template Enhancements:
                </h5>
                <ul className="space-y-1">
                  {cv.improvementNotes.templateEnhancements
                    .slice(0, 2)
                    .map((enhancement, index) => (
                      <li key={index} className="text-xs text-blue-700">
                        {enhancement}
                      </li>
                    ))}
                </ul>
              </div>
            )}

          {cv.improvementNotes.dataCompleteness &&
            cv.improvementNotes.dataCompleteness.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-blue-800 mb-2">
                  📈 Data Completeness:
                </h5>
                <ul className="space-y-1">
                  {cv.improvementNotes.dataCompleteness
                    .slice(0, 2)
                    .map((completeness, index) => (
                      <li key={index} className="text-xs text-blue-700">
                        {completeness}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Summary */}
      {parsedData.summary && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <p className="text-sm text-gray-600">{parsedData.summary}</p>
        </div>
      )}

      {/* Skills */}
      {parsedData.skills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {parsedData.skills.slice(0, 8).map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                {skill}
              </span>
            ))}
            {parsedData.skills.length > 8 && (
              <span className="text-xs text-gray-500">
                +{parsedData.skills.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Experience Preview */}
      {parsedData.experience.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Experience</h4>
          <div className="space-y-3">
            {parsedData.experience.slice(0, 2).map((exp, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-3">
                <p className="text-sm font-medium text-gray-900">
                  {exp.role} at {exp.company}
                </p>
                <p className="text-xs text-gray-500">{exp.duration}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {exp.description}
                </p>
              </div>
            ))}
            {parsedData.experience.length > 2 && (
              <p className="text-xs text-gray-500">
                +{parsedData.experience.length - 2} more experiences
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={() => onTailor?.(cv)}>
            <Sparkles className="h-4 w-4 mr-1" />
            Tailor
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative group">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <div className="absolute right-0 bottom-0 mt-2 w-32 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => onExport?.(cv, "pdf")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  PDF
                </button>
                <button
                  onClick={() => onExport?.(cv, "word")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Word
                </button>
                <button
                  onClick={() => onExport?.(cv, "ats")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  ATS
                </button>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(cv)}
            className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <EditCVModal
        cv={cv}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (cvId, updatedData) => {
          try {
            console.log("Saving CV:", cvId, updatedData);
            // Call the actual API to update CV
            const updatedCV = await cvApi.updateCv(cvId, {
              parsedData: updatedData,
            });
            console.log("CV updated successfully:", updatedCV);
            onUpdate?.(updatedCV);
          } catch (error) {
            console.error("Error saving CV:", error);
            throw error;
          }
        }}
      />

      {cv.originalCv && (
        <OriginalCVModal
          originalCv={cv.originalCv}
          isOpen={showOriginalCVModal}
          onClose={() => setShowOriginalCVModal(false)}
        />
      )}

      {cv.jobDescription && (
        <JobDescriptionModal
          jobDescription={cv.jobDescription}
          isOpen={showJobDescriptionModal}
          onClose={() => setShowJobDescriptionModal(false)}
        />
      )}
    </div>
  );
}
