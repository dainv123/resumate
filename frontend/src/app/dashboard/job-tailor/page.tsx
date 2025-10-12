"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi, CV, CompatibilityAnalysis } from "@/lib/cv";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Collapse } from "@/components/ui/Collapse";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import {
  Sparkles,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  Clock,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Mail,
  CheckSquare,
  XCircle,
  Lightbulb,
  Award,
  Phone,
  MapPin,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Linkedin,
  Calendar,
  Heart,
  FileCheck,
  BookOpen,
  ExternalLink,
} from "lucide-react";

export default function JobTailorPage() {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredCv, setTailoredCv] = useState<CV | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [showOnlyTailored, setShowOnlyTailored] = useState(false);
  const [compatibilityAnalysis, setCompatibilityAnalysis] =
    useState<CompatibilityAnalysis | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: cvs = [], isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
  });

  // Filter and sort CVs
  const filteredAndSortedCvs = React.useMemo(() => {
    const filtered = cvs.filter((cv) => {
      const matchesSearch =
        cv.parsedData.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cv.originalFileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTailoredFilter = !showOnlyTailored || cv.isTailored;
      return matchesSearch && matchesTailoredFilter;
    });

    // Sort CVs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          );
        case "name":
          return a.parsedData.name.localeCompare(b.parsedData.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [cvs, searchTerm, sortBy, showOnlyTailored]);

  const tailorMutation = useMutation({
    mutationFn: ({
      cvId,
      jobDescription,
    }: {
      cvId: string;
      jobDescription: string;
    }) => cvApi.tailorCv(cvId, jobDescription),
    onSuccess: (data) => {
      setTailoredCv(data);
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      showSuccess(t("jobTailor.success"));
    },
    onError: (error: Error) => {
      console.error("Tailoring failed:", error);
      showError(t("jobTailor.failedToTailor"));
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: ({
      cvId,
      jobDescription,
    }: {
      cvId: string;
      jobDescription: string;
    }) => cvApi.analyzeCompatibility(cvId, jobDescription),
    onSuccess: (data) => {
      setCompatibilityAnalysis(data);
      setShowAnalysisModal(true);
    },
  });

  const coverLetterMutation = useMutation({
    mutationFn: ({
      cvId,
      jobDescription,
    }: {
      cvId: string;
      jobDescription: string;
    }) => cvApi.generateCoverLetter(cvId, jobDescription),
    onSuccess: (data) => {
      setCoverLetter(data.coverLetter);
      setShowCoverLetterModal(true);
    },
  });

  const handleTailor = async () => {
    if (!selectedCv || !jobDescription.trim()) {
      showError(t("jobTailor.selectCVAndJD"));
      return;
    }

    setIsTailoring(true);
    try {
      await tailorMutation.mutateAsync({
        cvId: selectedCv.id,
        jobDescription: jobDescription.trim(),
      });
    } finally {
      setIsTailoring(false);
    }
  };

  const handleAnalyzeCompatibility = async () => {
    if (!selectedCv || !jobDescription.trim()) {
      showError(t("jobTailor.selectCVAndJD"));
      return;
    }

    await analyzeMutation.mutateAsync({
      cvId: selectedCv.id,
      jobDescription: jobDescription.trim(),
    });
  };

  const handleGenerateCoverLetter = async () => {
    if (!selectedCv || !jobDescription.trim()) {
      showError(t("jobTailor.selectCVAndJD"));
      return;
    }

    await coverLetterMutation.mutateAsync({
      cvId: selectedCv.id,
      jobDescription: jobDescription.trim(),
    });
  };

  const handleCopyCoverLetter = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  const handleExport = async (format: "pdf" | "word" | "ats") => {
    if (!tailoredCv) return;

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case "pdf":
          blob = await cvApi.exportToPDF(tailoredCv.id);
          filename = `${tailoredCv.originalFileName.replace(
            /\.[^/.]+$/,
            ""
          )}_tailored.pdf`;
          break;
        case "word":
          blob = await cvApi.exportToWord(tailoredCv.id);
          filename = `${tailoredCv.originalFileName.replace(
            /\.[^/.]+$/,
            ""
          )}_tailored.docx`;
          break;
        case "ats":
          blob = await cvApi.exportToATS(tailoredCv.id);
          filename = `${tailoredCv.originalFileName.replace(
            /\.[^/.]+$/,
            ""
          )}_tailored_ats.txt`;
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">
          {t("jobTailor.title")}
        </h3>
        <p className="text-gray-600">{t("jobTailor.description")}</p>
      </div>

      {cvs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("jobTailor.noCVsAvailable")}
          </h3>
          <p className="text-gray-600 mb-6">{t("jobTailor.uploadCVPrompt")}</p>
          <Button onClick={() => (window.location.href = "/dashboard/cv")}>
            <Upload className="h-4 w-4 mr-2" />
            {t("jobTailor.uploadCV")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* CV Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  {t("jobTailor.selectCV")}
                </label>
                <span className="text-xs text-gray-500">
                  {t("jobTailor.cvsCount", {
                    count: filteredAndSortedCvs.length,
                    total: cvs.length,
                  })}
                </span>
              </div>

              {/* Search and Sort Controls */}
              <div className="mb-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("jobTailor.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-main/20 focus:border-main text-sm"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Sort and Filter Options */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {t("jobTailor.sortBy")}
                    </span>
                    <div className="flex gap-1">
                      {[
                        {
                          value: "newest",
                          label: t("jobTailor.sortNewest"),
                        },
                        {
                          value: "oldest",
                          label: t("jobTailor.sortOldest"),
                        },
                        { value: "name", label: t("jobTailor.sortName") },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setSortBy(
                              option.value as "newest" | "oldest" | "name"
                            )
                          }
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            sortBy === option.value
                              ? "bg-main text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Toggle */}
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyTailored}
                      onChange={(e) => setShowOnlyTailored(e.target.checked)}
                      className="rounded border-gray-300 text-main focus:ring-main"
                    />
                    <span>{t("jobTailor.showOnlyTailored")}</span>
                  </label>
                </div>
              </div>

              {/* CV List with Scrollable Container */}
              <div className="relative">
                {/* Scroll indicator */}
                {filteredAndSortedCvs.length > 5 && (
                  <div className="absolute top-0 right-0 z-10 bg-gradient-to-b from-white to-transparent h-6 w-full pointer-events-none"></div>
                )}

                <div className="space-y-3 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50/50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                  {filteredAndSortedCvs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">
                        {searchTerm
                          ? t("jobTailor.noCVsMatch")
                          : t("jobTailor.noCVsAvailable")}
                      </p>
                    </div>
                  ) : (
                    filteredAndSortedCvs.map((cv) => (
                      <div
                        key={cv.id}
                        className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedCv?.id === cv.id
                            ? "border-main bg-main/5 shadow-lg shadow-main/10"
                            : "border-gray-200 hover:border-main/50 hover:shadow-md"
                        }`}
                        onClick={() => setSelectedCv(cv)}>
                        {/* Selection indicator */}
                        {selectedCv?.id === cv.id && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-main rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}

                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-main/10 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-main" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 truncate">
                                  {cv.parsedData.name}
                                </h4>
                                <p
                                  className="text-sm text-gray-500 truncate max-w-[300px]"
                                  title={cv.originalFileName}>
                                  Version {cv.version} • {cv.originalFileName}
                                </p>
                              </div>
                            </div>

                            {/* CV Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Updated{" "}
                                  {new Date(cv.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {cv.parsedData.skills && (
                                <div className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  <span>
                                    {Array.isArray(
                                      cv.parsedData.skills.technical
                                    )
                                      ? cv.parsedData.skills.technical.length
                                      : Array.isArray(cv.parsedData.skills)
                                      ? cv.parsedData.skills.length
                                      : 0}{" "}
                                    skills
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {cv.isTailored && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Tailored
                              </span>
                            )}

                            {/* Quick actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement preview
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Preview CV">
                                <Eye className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom scroll indicator */}
                {filteredAndSortedCvs.length > 5 && (
                  <div className="absolute bottom-0 right-0 z-10 bg-gradient-to-t from-white to-transparent h-6 w-full pointer-events-none"></div>
                )}
              </div>

              {/* Scroll Info */}
              {filteredAndSortedCvs.length > 5 && (
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-main rounded-full"></div>
                    <span>{filteredAndSortedCvs.length} CVs available</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16l-4-4m0 0l4-4m-4 4h18"
                      />
                    </svg>
                    <span>Scroll to see more</span>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Job Description
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .readText()
                        .then((text) => {
                          setJobDescription(text);
                        })
                        .catch(() => {
                          // Fallback for browsers that don't support clipboard API
                        });
                    }}
                    className="text-xs text-main hover:text-main/80 flex items-center gap-1">
                    <Copy className="h-3 w-3" />
                    Paste from clipboard
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={12}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-main/20 focus:border-main transition-all duration-200 resize-none"
                  placeholder="Paste the job description here...

Example:
• 3+ years of experience in React development
• Strong knowledge of TypeScript and Node.js
• Experience with cloud platforms (AWS, Azure)
• Excellent communication skills
• Bachelor's degree in Computer Science or related field"
                />

                {/* Character count and analysis */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <div className="text-xs text-gray-400 bg-white px-2 py-1 rounded">
                    {jobDescription.length} characters
                  </div>
                  {jobDescription.length > 100 && (
                    <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                      <Target className="h-3 w-3 inline mr-1" />
                      Good length
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>AI will analyze keywords and requirements</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Optimize for ATS compatibility</span>
                </div>
              </div>
            </div>

            {/* AI Actions */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  {t("jobTailor.aiPoweredTools")}
                </h4>

                <div className="space-y-2">
                  {/* Analyze Compatibility */}
                  <button
                    onClick={handleAnalyzeCompatibility}
                    disabled={
                      !selectedCv ||
                      !jobDescription.trim() ||
                      analyzeMutation.isPending
                    }
                    className="group w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {t("jobTailor.analyzeCompatibility")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("jobTailor.analyzeDesc")}
                        </p>
                      </div>
                    </div>
                    {analyzeMutation.isPending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                    ) : (
                      <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    )}
                  </button>

                  {/* Generate Cover Letter */}
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={
                      !selectedCv ||
                      !jobDescription.trim() ||
                      coverLetterMutation.isPending
                    }
                    className="group w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mail className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {t("jobTailor.generateCoverLetter")}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t("jobTailor.coverLetterDesc")}
                        </p>
                      </div>
                    </div>
                    {coverLetterMutation.isPending ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
                    ) : (
                      <div className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    )}
                  </button>

                  {/* Tailor CV - Primary Action */}
                  <button
                    onClick={handleTailor}
                    disabled={
                      !selectedCv || !jobDescription.trim() || isTailoring
                    }
                    className="group w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">
                          {isTailoring
                            ? t("jobTailor.tailoring")
                            : t("jobTailor.tailorCV")}
                        </p>
                        <p className="text-xs text-white/80">
                          {t("jobTailor.tailorDesc")}
                        </p>
                      </div>
                    </div>
                    {isTailoring ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    ) : (
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl">
                        →
                      </div>
                    )}
                  </button>
                </div>

                {/* Helper text */}
                {(!selectedCv || !jobDescription.trim()) && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      {!selectedCv &&
                        !jobDescription.trim() &&
                        t("jobTailor.selectCVPrompt")}
                      {!selectedCv &&
                        jobDescription.trim() &&
                        t("jobTailor.selectCVOnly")}
                      {selectedCv &&
                        !jobDescription.trim() &&
                        t("jobTailor.enterJobOnly")}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress indicator with steps */}
              {(isTailoring ||
                analyzeMutation.isPending ||
                coverLetterMutation.isPending) && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-blue-900 mb-1">
                        {isTailoring && "✨ Tailoring Your CV"}
                        {analyzeMutation.isPending &&
                          "📊 Analyzing Compatibility"}
                        {coverLetterMutation.isPending &&
                          "✉️ Generating Cover Letter"}
                      </p>
                      <p className="text-sm text-blue-700 mb-2">
                        Our AI is processing your request...
                      </p>
                      <div className="text-xs text-blue-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>Reading job requirements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>Analyzing your CV</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                          <span>Generating results</span>
                        </div>
                      </div>
                      <p className="text-xs text-blue-500 mt-3 italic">
                        ⏱️ This typically takes 30-60 seconds
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {tailorMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">
                    Failed to tailor CV. Please try again.
                  </p>
                </div>
              </div>
            )}

            {tailoredCv && (
              <div className="space-y-4">
                {/* Tailored CV Preview - Full */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        Tailored CV Preview
                      </h3>
                      <span className="text-xs text-gray-500">
                        Review before download
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                    {/* Header Info */}
                    <div className="border-b border-gray-200 pb-4">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tailoredCv.parsedData.name}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {tailoredCv.parsedData.email}
                        </span>
                        {tailoredCv.parsedData.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {tailoredCv.parsedData.phone}
                          </span>
                        )}
                        {tailoredCv.parsedData.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {tailoredCv.parsedData.address}
                          </span>
                        )}
                        {tailoredCv.parsedData.linkedin && (
                          <span className="flex items-center gap-1">
                            <Linkedin className="h-4 w-4" />
                            {tailoredCv.parsedData.linkedin}
                          </span>
                        )}
                        {tailoredCv.parsedData.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {tailoredCv.parsedData.dateOfBirth}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {tailoredCv.parsedData.summary && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          Professional Summary
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {tailoredCv.parsedData.summary}
                        </p>
                      </div>
                    )}

                    {/* Skills */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        Skills
                      </h3>
                      <div className="space-y-2">
                        {tailoredCv.parsedData.skills?.technical &&
                          tailoredCv.parsedData.skills.technical.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Technical Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {tailoredCv.parsedData.skills.technical.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {tailoredCv.parsedData.skills?.soft &&
                          tailoredCv.parsedData.skills.soft.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Soft Skills
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {tailoredCv.parsedData.skills.soft.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        {tailoredCv.parsedData.skills?.languages &&
                          tailoredCv.parsedData.skills.languages.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Languages
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {tailoredCv.parsedData.skills.languages.map(
                                  (skill, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                      {skill}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Experience */}
                    {tailoredCv.parsedData.experience &&
                      tailoredCv.parsedData.experience.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-green-600" />
                            Work Experience
                          </h3>
                          <div className="space-y-4">
                            {tailoredCv.parsedData.experience.map(
                              (exp, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-blue-200 pl-4">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-gray-900">
                                      {exp.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {exp.duration}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {exp.company}
                                  </p>
                                  {exp.teamSize && (
                                    <p className="text-xs text-gray-500 mb-1">
                                      <span className="font-medium">
                                        Team Size:
                                      </span>{" "}
                                      {exp.teamSize}
                                    </p>
                                  )}
                                  {exp.companyDescription && (
                                    <p className="text-xs text-gray-600 italic mb-2">
                                      {exp.companyDescription}
                                    </p>
                                  )}
                                  {exp.responsibilities &&
                                    exp.responsibilities.length > 0 && (
                                      <ul className="text-sm text-gray-700 space-y-1 mb-2">
                                        {exp.responsibilities.map(
                                          (resp, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-start gap-2">
                                              <span className="text-blue-500 mt-1">
                                                •
                                              </span>
                                              <span>{resp}</span>
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                  {exp.achievements &&
                                    exp.achievements.length > 0 && (
                                      <div className="mb-2">
                                        <p className="text-xs font-medium text-green-700 mb-1">
                                          Achievements:
                                        </p>
                                        <ul className="text-sm text-gray-700 space-y-1">
                                          {exp.achievements.map((ach, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-start gap-2">
                                              <span className="text-green-500 mt-1">
                                                ✓
                                              </span>
                                              <span>{ach}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  {exp.subProjects &&
                                    exp.subProjects.length > 0 && (
                                      <div className="mt-3 ml-3 space-y-2">
                                        <p className="text-xs font-medium text-purple-700 mb-2">
                                          Sub-Projects:
                                        </p>
                                        {exp.subProjects.map((sub, subIdx) => (
                                          <div
                                            key={subIdx}
                                            className="border-l-2 border-purple-200 pl-3 pb-2">
                                            <p className="text-sm font-medium text-gray-800">
                                              {sub.name}
                                              {sub.role && ` - ${sub.role}`}
                                            </p>
                                            {sub.responsibilities &&
                                              sub.responsibilities.length >
                                                0 && (
                                                <ul className="text-xs text-gray-700 space-y-0.5 mt-1">
                                                  {sub.responsibilities.map(
                                                    (resp, respIdx) => (
                                                      <li
                                                        key={respIdx}
                                                        className="flex items-start gap-2">
                                                        <span className="text-purple-500 mt-0.5">
                                                          •
                                                        </span>
                                                        <span>{resp}</span>
                                                      </li>
                                                    )
                                                  )}
                                                </ul>
                                              )}
                                            {sub.techStack &&
                                              sub.techStack.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {sub.techStack.map(
                                                    (tech, techIdx) => (
                                                      <span
                                                        key={techIdx}
                                                        className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded">
                                                        {tech}
                                                      </span>
                                                    )
                                                  )}
                                                </div>
                                              )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  {exp.technologies &&
                                    exp.technologies.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {exp.technologies.map((tech, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                            {tech}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Education */}
                    {tailoredCv.parsedData.education &&
                      tailoredCv.parsedData.education.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-indigo-600" />
                            Education
                          </h3>
                          <div className="space-y-3">
                            {tailoredCv.parsedData.education.map(
                              (edu, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-indigo-200 pl-4">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-gray-900">
                                      {edu.degree}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                      {edu.year}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {edu.school}
                                  </p>
                                  {edu.gpa && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      GPA: {edu.gpa}
                                    </p>
                                  )}
                                  {edu.honors && (
                                    <p className="text-xs text-indigo-600 mt-1">
                                      {edu.honors}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Projects */}
                    {tailoredCv.parsedData.projects &&
                      tailoredCv.parsedData.projects.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Code className="h-4 w-4 text-orange-600" />
                            Projects
                          </h3>
                          <div className="space-y-3">
                            {tailoredCv.parsedData.projects.map(
                              (project, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium text-gray-900">
                                      {project.name}
                                    </h4>
                                    {project.duration && (
                                      <span className="text-xs text-gray-500">
                                        {project.duration}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2">
                                    {project.description}
                                  </p>
                                  {project.results && (
                                    <p className="text-xs text-green-600 italic mb-2">
                                      <span className="font-medium">
                                        Results:
                                      </span>{" "}
                                      {project.results}
                                    </p>
                                  )}
                                  {project.link && (
                                    <a
                                      href={project.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                                      <ExternalLink className="h-3 w-3" />
                                      View Project
                                    </a>
                                  )}
                                  {project.techStack &&
                                    project.techStack.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {project.techStack.map((tech, idx) => (
                                          <span
                                            key={idx}
                                            className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                            {tech}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Certifications */}
                    {tailoredCv.parsedData.certifications &&
                      tailoredCv.parsedData.certifications.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-600" />
                            Certifications
                          </h3>
                          <div className="space-y-2">
                            {tailoredCv.parsedData.certifications.map(
                              (cert, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-2 bg-yellow-50 rounded-lg">
                                  <Award className="h-4 w-4 text-yellow-600 mt-0.5" />
                                  <div>
                                    <p className="font-medium text-sm text-gray-900">
                                      {cert.name}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {cert.issuer} • {cert.date}
                                    </p>
                                    {cert.link && (
                                      <a
                                        href={cert.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1">
                                        <ExternalLink className="h-3 w-3" />
                                        View Certificate
                                      </a>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Awards */}
                    {tailoredCv.parsedData.awards &&
                      tailoredCv.parsedData.awards.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FileCheck className="h-4 w-4 text-amber-600" />
                            Awards
                          </h3>
                          <div className="space-y-2">
                            {tailoredCv.parsedData.awards.map(
                              (award, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-amber-200 pl-3">
                                  <p className="font-medium text-sm text-gray-900">
                                    {award.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {award.issuer} • {award.date}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Publications */}
                    {tailoredCv.parsedData.publications &&
                      tailoredCv.parsedData.publications.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Publications
                          </h3>
                          <div className="space-y-3">
                            {tailoredCv.parsedData.publications.map(
                              (pub, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-blue-200 pl-3">
                                  <p className="font-medium text-sm text-gray-900">
                                    {pub.title}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {pub.journal} • {pub.date}
                                  </p>
                                  {pub.authors && (
                                    <p className="text-xs text-gray-500 italic mt-1">
                                      Authors: {pub.authors}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Volunteer Experience */}
                    {tailoredCv.parsedData.volunteer &&
                      tailoredCv.parsedData.volunteer.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-600" />
                            Volunteer Experience
                          </h3>
                          <div className="space-y-3">
                            {tailoredCv.parsedData.volunteer.map(
                              (vol, index) => (
                                <div
                                  key={index}
                                  className="border-l-2 border-pink-200 pl-3">
                                  <div className="flex justify-between items-start mb-1">
                                    <p className="font-medium text-sm text-gray-900">
                                      {vol.role} - {vol.organization}
                                    </p>
                                    <span className="text-xs text-gray-500">
                                      {vol.duration}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    {vol.description}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Preview Footer */}
                  <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-500 text-center">
                      This is a preview of your tailored CV. Download below to
                      get the formatted version.
                    </p>
                  </div>
                </div>

                {/* Export Options */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Export Tailored CV
                      </h3>
                      <p className="text-sm text-gray-600">
                        Download in your preferred format
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleExport("pdf")}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-main hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            PDF Format
                          </p>
                          <p className="text-xs text-gray-500">
                            Professional layout, print-ready
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-main" />
                    </button>

                    <button
                      onClick={() => handleExport("word")}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-main hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            Word Document
                          </p>
                          <p className="text-xs text-gray-500">
                            Editable format for further customization
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-main" />
                    </button>

                    <button
                      onClick={() => handleExport("ats")}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-main hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">
                            ATS Optimized
                          </p>
                          <p className="text-xs text-gray-500">
                            Plain text format for ATS systems
                          </p>
                        </div>
                      </div>
                      <Download className="h-4 w-4 text-gray-400 group-hover:text-main" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            {!tailoredCv && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      How AI Tailoring Works
                    </h3>
                    <p className="text-sm text-blue-700">
                      Get your CV optimized in 4 simple steps
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Select Your CV
                      </p>
                      <p className="text-sm text-blue-700">
                        Choose from your uploaded CVs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Paste Job Description
                      </p>
                      <p className="text-sm text-blue-700">
                        Copy the job posting details
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI Analysis</p>
                      <p className="text-sm text-blue-700">
                        Our AI matches keywords and skills
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">
                        Download & Apply
                      </p>
                      <p className="text-sm text-blue-700">
                        Export in PDF, Word, or ATS format
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-blue-800">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Pro Tip:</span>
                    <span>
                      Include specific keywords from the job description for
                      better matching
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compatibility Analysis Modal */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="CV-Job Compatibility Analysis"
        size="xl"
        footer={
          <Button onClick={() => setShowAnalysisModal(false)}>Close</Button>
        }>
        {compatibilityAnalysis && (
          <div className="space-y-6">
            {/* Score */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
                <div className="text-4xl font-bold text-blue-600">
                  {compatibilityAnalysis.score}
                  <span className="text-lg text-gray-400">/10</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {t("jobTailor.compatibilityScore")}
              </h3>
              <p className="text-sm text-gray-600">
                {compatibilityAnalysis.score >= 8 &&
                  t("jobTailor.excellentMatch")}
                {compatibilityAnalysis.score >= 6 &&
                  compatibilityAnalysis.score < 8 &&
                  t("jobTailor.goodMatch")}
                {compatibilityAnalysis.score >= 4 &&
                  compatibilityAnalysis.score < 6 &&
                  t("jobTailor.fairMatch")}
                {compatibilityAnalysis.score < 4 && t("jobTailor.lowMatch")}
              </p>
            </div>

            {/* Strengths */}
            {compatibilityAnalysis.strengths.length > 0 && (
              <Collapse
                title={t("jobTailor.strengths")}
                icon={<Award className="h-4 w-4 text-green-600" />}
                badge={compatibilityAnalysis.strengths.length}
                defaultOpen={true}>
                <ul className="space-y-2">
                  {compatibilityAnalysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckSquare className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Collapse>
            )}

            {/* Matched Skills */}
            {compatibilityAnalysis.matchedSkills.length > 0 && (
              <Collapse
                title={t("jobTailor.matchedSkills")}
                icon={<CheckSquare className="h-4 w-4 text-green-600" />}
                badge={compatibilityAnalysis.matchedSkills.length}
                defaultOpen={true}>
                <div className="flex flex-wrap gap-2">
                  {compatibilityAnalysis.matchedSkills.map((skill, index) => (
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
            {compatibilityAnalysis.missingSkills.length > 0 && (
              <Collapse
                title={t("jobTailor.missingSkills")}
                icon={<XCircle className="h-4 w-4 text-red-600" />}
                badge={compatibilityAnalysis.missingSkills.length}
                defaultOpen={true}>
                <div className="flex flex-wrap gap-2">
                  {compatibilityAnalysis.missingSkills.map((skill, index) => (
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
            {compatibilityAnalysis.matchedExperience.length > 0 && (
              <Collapse
                title={t("jobTailor.relevantExperience")}
                icon={<CheckSquare className="h-4 w-4 text-blue-600" />}
                badge={compatibilityAnalysis.matchedExperience.length}
                defaultOpen={false}>
                <ul className="space-y-2">
                  {compatibilityAnalysis.matchedExperience.map((exp, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{exp}</span>
                    </li>
                  ))}
                </ul>
              </Collapse>
            )}

            {/* Missing Requirements */}
            {compatibilityAnalysis.missingRequirements.length > 0 && (
              <Collapse
                title={t("jobTailor.missingRequirements")}
                icon={<XCircle className="h-4 w-4 text-orange-600" />}
                badge={compatibilityAnalysis.missingRequirements.length}
                defaultOpen={false}>
                <ul className="space-y-2">
                  {compatibilityAnalysis.missingRequirements.map(
                    (req, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{req}</span>
                      </li>
                    )
                  )}
                </ul>
              </Collapse>
            )}

            {/* Suggestions */}
            {compatibilityAnalysis.suggestions.length > 0 && (
              <Collapse
                title={t("jobTailor.suggestions")}
                icon={<Lightbulb className="h-4 w-4 text-yellow-600" />}
                badge={compatibilityAnalysis.suggestions.length}
                defaultOpen={true}>
                <ul className="space-y-2">
                  {compatibilityAnalysis.suggestions.map(
                    (suggestion, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    )
                  )}
                </ul>
              </Collapse>
            )}
          </div>
        )}
      </Modal>

      {/* Cover Letter Modal */}
      <Modal
        isOpen={showCoverLetterModal}
        onClose={() => setShowCoverLetterModal(false)}
        title={t("jobTailor.coverLetter")}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={handleCopyCoverLetter}>
              <Copy className="h-4 w-4 mr-2" />
              Copy to Clipboard
            </Button>
            <Button onClick={() => setShowCoverLetterModal(false)}>
              Close
            </Button>
          </>
        }>
        {coverLetter && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <Mail className="h-4 w-4" />
                <span className="font-medium">
                  Professional cover letter generated based on your CV and the
                  job description
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                {coverLetter}
              </pre>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">💡 Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>
                      Personalize the greeting with the hiring manager&apos;s
                      name if known
                    </li>
                    <li>Adjust the tone to match the company culture</li>
                    <li>Add specific examples from your experience</li>
                    <li>Proofread carefully before sending</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
