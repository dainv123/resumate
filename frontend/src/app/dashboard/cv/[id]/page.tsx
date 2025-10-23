"use client";

import React, { useState, Suspense, lazy } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { cvApi } from "@/lib/cv";
import Button from "@/components/ui/Button";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { TemplateConfig } from "@/types/cv.types";

// Lazy load components
const CVDisplay = lazy(() => import("@/components/cv/CVDisplay"));
const CVActions = lazy(() => import("@/components/cv/CVActions"));
const CVRelationships = lazy(() => import("@/components/cv/CVRelationships"));
const CVMetadata = lazy(() => import("@/components/cv/CVMetadata"));
const DeleteConfirmationModal = lazy(
  () => import("@/components/cv/DeleteConfirmationModal")
);
const TemplateConfigModal = lazy(
  () => import("@/components/cv/TemplateConfigModal")
);
const JobDescriptionModal = lazy(
  () => import("@/components/cv/JobDescriptionModal")
);
const MatchingAnalysisModal = lazy(
  () => import("@/components/cv/MatchingAnalysisModal")
);
const CoverLetterModal = lazy(() => import("@/components/cv/CoverLetterModal"));

export default function CVDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTemplateConfig, setShowTemplateConfig] = useState(false);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [showMatchingAnalysis, setShowMatchingAnalysis] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "word" | "ats">(
    "pdf"
  );

  const {
    data: cv,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cv", id],
    queryFn: () => cvApi.getCvWithRelatedData(id as string),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: cvApi.deleteCv,
    onSuccess: () => {
      showSuccess(t("dashboard.deleteCvSuccess"));
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      router.push("/dashboard/cv");
    },
  });

  const handleDelete = () => {
    if (cv) {
      deleteMutation.mutate(cv.id);
    }
  };

  const handleExport = async (
    format: "pdf" | "word" | "ats",
    template = "professional",
    templateConfig?: TemplateConfig
  ) => {
    if (!cv) return;

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case "pdf":
          if (templateConfig) {
            blob = await cvApi.exportToPDFWithConfig(cv.id, {
              template,
              ...templateConfig,
            });
          } else {
            blob = await cvApi.exportToPDF(cv.id, template);
          }
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}.pdf`;
          break;
        case "word":
          blob = await cvApi.exportToWord(cv.id);
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}.docx`;
          break;
        case "ats":
          blob = await cvApi.exportToATS(cv.id);
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}_ats.txt`;
          break;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      showError(t("dashboard.exportCvFailed"));
    }
  };

  const handleExportWithConfig = (format: "pdf" | "word" | "ats") => {
    setExportFormat(format);
    setShowTemplateConfig(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("common.error")}
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message || t("cv.notFound")}
          </p>
          <Button onClick={() => router.push("/dashboard/cv")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  // const headerActions = (
  //   <>
  //     <Button
  //       variant="outline"
  //       onClick={() => router.push(`/dashboard/cv/${cv.id}/edit`)}
  //       className="flex items-center space-x-2">
  //       <Edit className="h-4 w-4" />
  //       <span>{t("cv.edit")}</span>
  //     </Button>
  //     <div className="flex items-center space-x-1">
  //       <Button
  //         variant="outline"
  //         onClick={() => handleExportWithConfig("pdf")}
  //         className="flex items-center space-x-2">
  //         <Settings className="h-4 w-4" />
  //         <span>Custom PDF</span>
  //       </Button>
  //       <Button
  //         variant="outline"
  //         onClick={() => handleExport("pdf")}
  //         className="flex items-center space-x-2">
  //         <Download className="h-4 w-4" />
  //         <span>PDF</span>
  //       </Button>
  //       <Button
  //         variant="outline"
  //         onClick={() => handleExport("word")}
  //         className="flex items-center space-x-2">
  //         <Download className="h-4 w-4" />
  //         <span>Word</span>
  //       </Button>
  //     </div>
  //   </>
  // );

  return (
    <DashboardLayout
      title={t("cv.viewDetail")}
      subtitle={t("cv.viewDetailSubtitle", { fileName: cv.originalFileName })}
      // backUrl="/dashboard/cv"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Suspense fallback={<LoadingSkeleton type="cv" />}>
              <CVDisplay cv={cv} showActions={false} />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<LoadingSkeleton type="card" />}>
              <CVActions
                cv={cv}
                onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
                onShowTemplateConfig={handleExportWithConfig}
                onShowJobDescription={() => setShowJobDescription(true)}
                onShowMatchingAnalysis={() => setShowMatchingAnalysis(true)}
                onShowCoverLetter={() => setShowCoverLetter(true)}
                onExport={handleExport}
              />
            </Suspense>

            <Suspense fallback={<LoadingSkeleton type="card" />}>
              <CVRelationships cv={cv} />
            </Suspense>

            <Suspense fallback={<LoadingSkeleton type="card" />}>
              <CVMetadata cv={cv} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Suspense fallback={<LoadingSkeleton type="modal" />}>
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      </Suspense>

      {/* Template Config Modal */}
      <Suspense fallback={<LoadingSkeleton type="modal" />}>
        <TemplateConfigModal
          isOpen={showTemplateConfig}
          onClose={() => setShowTemplateConfig(false)}
          onExport={async (templateConfig) => {
            await handleExport(exportFormat, "professional", templateConfig);
          }}
          currentTemplate="professional"
          cvId={cv?.id || ""}
        />
      </Suspense>

      {/* Job Description Modal */}
      <Suspense fallback={<LoadingSkeleton type="modal" />}>
        <JobDescriptionModal
          isOpen={showJobDescription}
          onClose={() => setShowJobDescription(false)}
          jobDescription={
            cv?.jobDescription || {
              id: "",
              userId: "",
              title: "No job description available",
              company: "",
              location: "",
              salary: "",
              experience: "",
              description:
                "No job description has been associated with this CV.",
              requirements: {
                skills: [],
                education: [],
                experience: [],
                certifications: [],
              },
              keywords: [],
              createdAt: "",
              updatedAt: "",
            }
          }
          coverLetter={cv?.coverLetter}
          matchingAnalysis={cv?.matchingAnalysis}
        />
      </Suspense>

      {/* Matching Analysis Modal */}
      <Suspense fallback={<LoadingSkeleton type="modal" />}>
        <MatchingAnalysisModal
          isOpen={showMatchingAnalysis}
          onClose={() => setShowMatchingAnalysis(false)}
          jobTitle={cv?.jobDescription?.title || "No job title"}
          company={cv?.jobDescription?.company || "No company"}
          analysis={
            cv?.matchingAnalysis || {
              score: 0,
              matchedSkills: [],
              missingSkills: [],
              suggestions: ["No analysis available for this CV."],
              strengths: [],
            }
          }
        />
      </Suspense>

      {/* Cover Letter Modal */}
      <Suspense fallback={<LoadingSkeleton type="modal" />}>
        <CoverLetterModal
          isOpen={showCoverLetter}
          onClose={() => setShowCoverLetter(false)}
          coverLetter={cv?.coverLetter}
          jobTitle={cv?.jobDescription?.title || "No job title"}
          company={cv?.jobDescription?.company || "No company"}
        />
      </Suspense>
    </DashboardLayout>
  );
}
