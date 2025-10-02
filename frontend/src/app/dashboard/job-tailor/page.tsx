"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi, CV } from "@/lib/cv";
import Button from "@/components/ui/Button";
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
} from "lucide-react";

export default function JobTailorPage() {
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredCv, setTailoredCv] = useState<CV | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [showOnlyTailored, setShowOnlyTailored] = useState(false);
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
    },
    onError: (error: Error) => {
      console.error("Tailoring failed:", error);
    },
  });

  const handleTailor = async () => {
    if (!selectedCv || !jobDescription.trim()) {
      alert("Please select a CV and enter a job description");
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
        <h3 className="text-2xl font-bold text-gray-900">Job Tailor</h3>
        <p className="text-gray-600">
          Tailor your CV to match specific job descriptions using AI
        </p>
      </div>

      {cvs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No CVs available
          </h3>
          <p className="text-gray-600 mb-6">
            Please upload a CV first to use the job tailoring feature
          </p>
          <Button onClick={() => (window.location.href = "/dashboard/cv")}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CV
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
                  Select CV to Tailor
                </label>
                <span className="text-xs text-gray-500">
                  {filteredAndSortedCvs.length} of {cvs.length} CVs
                </span>
              </div>

              {/* Search and Sort Controls */}
              <div className="mb-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search CVs by name or filename..."
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
                    <span className="text-xs text-gray-500">Sort by:</span>
                    <div className="flex gap-1">
                      {[
                        { value: "newest", label: "Newest" },
                        { value: "oldest", label: "Oldest" },
                        { value: "name", label: "Name" },
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
                    <span>Show only tailored CVs</span>
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
                          ? "No CVs match your search"
                          : "No CVs available"}
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
                                <h4 className="font-semibold text-gray-900">
                                  {cv.parsedData.name}
                                </h4>
                                <p className="text-sm text-gray-500">
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

            {/* Tailor Button */}
            <div className="space-y-3">
              <Button
                onClick={handleTailor}
                loading={isTailoring}
                disabled={!selectedCv || !jobDescription.trim()}
                className="w-full h-12 text-base font-semibold">
                <Sparkles className="h-5 w-5 mr-2" />
                {isTailoring
                  ? "AI is tailoring your CV..."
                  : "Tailor CV with AI"}
              </Button>

              {/* Progress indicator */}
              {isTailoring && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Analyzing job requirements...
                      </p>
                      <p className="text-xs text-blue-700">
                        This may take 30-60 seconds
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
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <p className="text-green-800">
                      CV tailored successfully! Your CV has been optimized for
                      this job.
                    </p>
                  </div>
                </div>

                {/* Tailored CV Preview */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Tailored CV Preview
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name</p>
                      <p className="text-sm text-gray-900">
                        {tailoredCv.parsedData.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">
                        {tailoredCv.parsedData.email}
                      </p>
                    </div>
                    {tailoredCv.parsedData.summary && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Summary
                        </p>
                        <p className="text-sm text-gray-900">
                          {tailoredCv.parsedData.summary}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(
                          tailoredCv.parsedData.skills?.technical
                        ) &&
                        tailoredCv.parsedData.skills.technical.length > 0 ? (
                          <>
                            {tailoredCv.parsedData.skills.technical
                              .slice(0, 8)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {skill}
                                </span>
                              ))}
                            {tailoredCv.parsedData.skills.technical.length >
                              8 && (
                              <span className="text-xs text-gray-500">
                                +
                                {tailoredCv.parsedData.skills.technical.length -
                                  8}{" "}
                                more
                              </span>
                            )}
                          </>
                        ) : Array.isArray(tailoredCv.parsedData.skills) ? (
                          <>
                            {tailoredCv.parsedData.skills
                              .slice(0, 8)
                              .map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {skill}
                                </span>
                              ))}
                            {tailoredCv.parsedData.skills.length > 8 && (
                              <span className="text-xs text-gray-500">
                                +{tailoredCv.parsedData.skills.length - 8} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">
                            No skills found
                          </span>
                        )}
                      </div>
                    </div>
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
    </div>
  );
}
