"use client";

import React, { useState } from "react";
import { CV, cvApi } from "@/lib/cv";
import { formatDate } from "@/lib/utils";
import {
  Download,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  Briefcase,
  Copy,
  Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";
import EditCVModal from "./EditCVModal";
import OriginalCVModal from "./OriginalCVModal";
import JobDescriptionModal from "./JobDescriptionModal";
import TemplateSelectionModal from "./TemplateSelectionModal";
import VersionHistoryModal from "./VersionHistoryModal";

interface CVPreviewProps {
  cv: CV;
  // onEdit?: (cv: CV) => void;
  onDelete?: (cv: CV) => void;
  onDuplicate?: (cv: CV) => void;
  onTailor?: (cv: CV) => void;
  onExport?: (
    cv: CV,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => void;
  onUpdate?: (cv: CV) => void;
}

export default function CVPreview({
  cv,
  // onEdit,
  onDelete,
  onDuplicate,
  onTailor,
  onExport,
  onUpdate,
}: CVPreviewProps) {
  const { parsedData } = cv;
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOriginalCVModal, setShowOriginalCVModal] = useState(false);
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showVersionHistoryModal, setShowVersionHistoryModal] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900">
            {parsedData.name}
          </h4>
          <p className="text-sm text-gray-500">
            {parsedData.email} • {parsedData.phone}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-400">
              Version {cv.version} • Updated {formatDate(cv.updatedAt)}
            </p>
            <button
              onClick={() => setShowVersionHistoryModal(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-purple-600 bg-purple-50 rounded transition-colors hover:bg-purple-100"
              title="View Version History">
              <Clock className="h-3 w-3" />
              <span>History</span>
            </button>
          </div>
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
        <Collapse
          title="CV Relationships"
          icon={<Sparkles className="h-4 w-4 text-green-600" />}
          defaultOpen={false}
          className="mb-6 border-green-200"
          headerClassName="bg-gradient-to-r from-green-50 to-emerald-50"
          contentClassName="bg-white">
          <div className="space-y-2">
            {cv.originalCv && (
              <div className="text-xs text-green-700">
                <span className="font-medium">📄 Original CV:</span>{" "}
                <button
                  onClick={() => setShowOriginalCVModal(true)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center max-w-full"
                  title={cv.originalCv.originalFileName}>
                  <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {cv.originalCv.originalFileName}
                  </span>
                </button>
              </div>
            )}
            {cv.jobDescription && (
              <div className="text-xs text-green-700">
                <span className="font-medium">🎯 Tailored for:</span>{" "}
                <button
                  onClick={() => setShowJobDescriptionModal(true)}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer flex items-center max-w-full"
                  title={cv.jobDescription.title}>
                  <Briefcase className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{cv.jobDescription.title}</span>
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
        </Collapse>
      )}

      {/* Improvement Notes */}
      {cv.improvementNotes && (
        <Collapse
          title="AI Enhancements Applied"
          icon={<Sparkles className="h-4 w-4 text-blue-600" />}
          badge={
            (cv.improvementNotes.parsingImprovements?.length || 0) +
            ((cv.improvementNotes as any).structureImprovements?.length || 0) +
            ((cv.improvementNotes as any).contentImprovements?.length || 0)
          }
          defaultOpen={false}
          className="mb-6 border-blue-200"
          headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50"
          contentClassName="bg-white">
          <div>
            {/* Top Key Improvements - Show first 3 most important */}
            {(() => {
              const allImprovements = [
                ...(cv.improvementNotes.parsingImprovements || []).map(
                  (imp) => ({
                    text: imp,
                    category: "📊 Parsing",
                  })
                ),
                ...(
                  (cv.improvementNotes as any).structureImprovements || []
                ).map((imp: string) => ({
                  text: imp,
                  category: "🏗️ Structure",
                })),
                ...((cv.improvementNotes as any).contentImprovements || []).map(
                  (imp: string) => ({
                    text: imp,
                    category: "✍️ Content",
                  })
                ),
              ];

              const topImprovements = allImprovements.slice(0, 3);

              return topImprovements.length > 0 ? (
                <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">
                    🎯 Key Improvements:
                  </h5>
                  <ul className="space-y-1.5">
                    {topImprovements.map((imp, index) => (
                      <li
                        key={index}
                        className="text-xs text-blue-800 flex items-start">
                        <span className="text-blue-600 mr-2 flex-shrink-0">
                          •
                        </span>
                        <span>
                          <span className="font-medium text-blue-900">
                            {imp.category}:
                          </span>{" "}
                          {imp.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {allImprovements.length > 3 && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      +{allImprovements.length - 3} more improvements below
                    </p>
                  )}
                </div>
              ) : null;
            })()}

            {cv.improvementNotes.parsingImprovements &&
              cv.improvementNotes.parsingImprovements.length > 0 && (
                <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">
                    📊 Parsing Improvements:
                  </h5>
                  <ul className="space-y-1.5">
                    {cv.improvementNotes.parsingImprovements
                      .slice(0, 3)
                      .map((improvement, index) => (
                        <li
                          key={index}
                          className="text-xs text-blue-800 flex items-start">
                          <span className="text-blue-600 mr-2 flex-shrink-0">
                            •
                          </span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    {cv.improvementNotes.parsingImprovements.length > 3 && (
                      <li className="text-xs text-blue-600 font-medium flex items-start">
                        <span className="text-blue-600 mr-2 flex-shrink-0">
                          •
                        </span>
                        <span>
                          +{cv.improvementNotes.parsingImprovements.length - 3}{" "}
                          more improvements
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

            {cv.improvementNotes.templateEnhancements &&
              cv.improvementNotes.templateEnhancements.length > 0 && (
                <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">
                    🎨 Template Enhancements:
                  </h5>
                  <ul className="space-y-1.5">
                    {cv.improvementNotes.templateEnhancements
                      .slice(0, 2)
                      .map((enhancement, index) => (
                        <li
                          key={index}
                          className="text-xs text-blue-800 flex items-start">
                          <span className="text-blue-600 mr-2 flex-shrink-0">
                            •
                          </span>
                          <span>{enhancement}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

            {cv.improvementNotes.dataCompleteness &&
              cv.improvementNotes.dataCompleteness.length > 0 && (
                <div className="mb-4 p-3 bg-white bg-opacity-60 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-900 mb-2">
                    📈 Data Completeness:
                  </h5>
                  <ul className="space-y-1.5">
                    {cv.improvementNotes.dataCompleteness
                      .slice(0, 2)
                      .map((completeness, index) => (
                        <li
                          key={index}
                          className="text-xs text-blue-800 flex items-start">
                          <span className="text-blue-600 mr-2 flex-shrink-0">
                            •
                          </span>
                          <span>{completeness}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
          </div>
        </Collapse>
      )}

      {/* Summary */}
      {parsedData.summary && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <p className="text-sm text-gray-600">{parsedData.summary}</p>
        </div>
      )}

      {/* Skills */}
      {parsedData.skills && Object.keys(parsedData.skills).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(parsedData.skills)
              .flat()
              .slice(0, 8)
              .map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                  {skill}
                </span>
              ))}
            {Object.values(parsedData.skills).flat().length > 8 && (
              <span className="text-xs text-gray-500">
                +{Object.values(parsedData.skills).flat().length - 8} more
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
                  {(exp as any)?.role || (exp as any)?.title} at{" "}
                  {(exp as any)?.company}
                </p>
                <p className="text-xs text-gray-500">
                  {(exp as any)?.duration}
                </p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {(exp as any)?.description}
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateModal(true)}
            data-tour="export-button">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate?.(cv)}
            className="text-blue-600 hover:text-blue-700">
            <Copy className="h-4 w-4" />
          </Button>

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

      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        cv={cv}
        onExport={(cv, format, template) =>
          onExport?.(cv, format as any, template)
        }
      />

      <VersionHistoryModal
        isOpen={showVersionHistoryModal}
        onClose={() => setShowVersionHistoryModal(false)}
        cvId={cv.id}
        onRestore={() => {
          // Refresh CV list after restore
          onUpdate?.(cv);
        }}
      />
    </div>
  );
}
