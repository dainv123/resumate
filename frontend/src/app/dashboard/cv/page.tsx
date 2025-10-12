"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { cvApi, CV } from "@/lib/cv";
import CVUpload from "@/components/cv/CVUpload";
import CVPreview from "@/components/cv/CVPreview";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Plus, FileText, AlertCircle, RefreshCw } from "lucide-react";

export default function CVPage() {
  const { t } = useLanguage();
  const [showUpload, setShowUpload] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedCv, setSelectedCv] = useState<CV | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "parsed" | "unparsed"
  >("all");
  const queryClient = useQueryClient();

  const {
    data: cvs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
  });

  const deleteMutation = useMutation({
    mutationFn: cvApi.deleteCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: cvApi.duplicateCv,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async ({
      cv,
      format,
      template = "professional",
    }: {
      cv: CV;
      format: "pdf" | "word" | "ats";
      template?: string;
    }) => {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case "pdf":
          blob = await cvApi.exportToPDF(cv.id, template);
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
    },
  });

  const handleUploadSuccess = (cv: unknown) => {
    setShowUpload(false);
    setSelectedCv(cv as CV);
  };

  const handleEdit = (cv: CV) => {
    setSelectedCv(cv);
    setShowEdit(true);
  };

  const handleDelete = (cv: CV) => {
    if (confirm(t("cv.confirm.delete"))) {
      deleteMutation.mutate(cv.id);
    }
  };

  const handleDuplicate = (cv: CV) => {
    duplicateMutation.mutate(cv.id);
  };

  const handleTailor = (cv: CV) => {
    // Navigate to job tailor page with CV ID
    window.location.href = `/dashboard/job-tailor?cvId=${cv.id}`;
  };

  const handleExport = (
    cv: CV,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => {
    exportMutation.mutate({ cv, format, template });
  };

  // const handleView = (cv: CV) => {
  //   setSelectedCv(cv);
  //   setShowView(true);
  // };

  // const duplicateMutation = useMutation({
  //   mutationFn: async (cvId: string) => {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/cv/${cvId}/duplicate`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token")}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     if (!response.ok) throw new Error("Failed to duplicate CV");
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["cvs"] });
  //     alert("CV duplicated successfully!");
  //   },
  //   onError: () => {
  //     alert("Failed to duplicate CV");
  //   },
  // });

  // const handleDuplicate = (cv: CV) => {
  //   if (confirm("Are you sure you want to duplicate this CV?")) {
  //     duplicateMutation.mutate(cv.id);
  //   }
  // };

  // const handleShare = (cv: CV) => {
  //   // Generate shareable link
  //   const shareUrl = `${window.location.origin}/cv/${cv.id}`;
  //   navigator.clipboard.writeText(shareUrl);
  //   alert("CV link copied to clipboard!");
  // };

  const handleRefresh = () => {
    // Refresh CV list
    queryClient.invalidateQueries({ queryKey: ["cvs"] });
  };

  // const handleBulkDelete = (cvIds: string[]) => {
  //   if (confirm(`Are you sure you want to delete ${cvIds.length} CVs?`)) {
  //     cvIds.forEach((id) => deleteMutation.mutate(id));
  //   }
  // };

  // Filter and search CVs
  const filteredCvs = cvs.filter((cv) => {
    const matchesSearch =
      cv.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cv.parsedData?.name &&
        cv.parsedData.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "parsed" && cv.parsedData) ||
      (filterStatus === "unparsed" && !cv.parsedData);

    return matchesSearch && matchesFilter;
  });

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (status: "all" | "parsed" | "unparsed") => {
    setFilterStatus(status);
  };

  // CV Statistics
  const cvStats = {
    total: cvs.length,
    parsed: cvs.filter((cv) => cv.parsedData).length,
    unparsed: cvs.filter((cv) => !cv.parsedData).length,
    recent: cvs.filter((cv) => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(cv.createdAt) > oneWeekAgo;
    }).length,
    totalSubProjects: cvs.reduce((count, cv) => {
      if (
        cv.parsedData?.experience &&
        Array.isArray(cv.parsedData.experience)
      ) {
        return (
          count +
          cv.parsedData.experience.reduce((expCount, exp) => {
            return (
              expCount +
              (Array.isArray(exp.subProjects) ? exp.subProjects.length : 0)
            );
          }, 0)
        );
      }
      return count;
    }, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <p className="text-red-800">Failed to load CVs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{t("cv.title")}</h3>
          <p className="text-gray-600">{t("cv.subtitle")}</p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t("cv.uploadCV")}
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {cvStats.total}
          </div>
          <div className="text-sm text-blue-800">{t("cv.stats.totalCVs")}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {cvStats.parsed}
          </div>
          <div className="text-sm text-green-800">{t("cv.stats.parsed")}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {cvStats.unparsed}
          </div>
          <div className="text-sm text-yellow-800">
            {t("cv.stats.unparsed")}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {cvStats.totalSubProjects}
          </div>
          <div className="text-sm text-purple-800">
            {t("cv.stats.subProjects")}
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">
            {cvStats.recent}
          </div>
          <div className="text-sm text-indigo-800">
            {t("cv.stats.thisWeek")}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title={t("cv.modals.uploadTitle")}
        size="lg">
        <CVUpload
          onSuccess={handleUploadSuccess}
          onError={(error) => console.error("Upload error:", error)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEdit && !!selectedCv}
        onClose={() => setShowEdit(false)}
        title={
          selectedCv
            ? t("cv.modals.editTitle", {
                fileName: selectedCv.originalFileName,
              })
            : t("modal.editCV")
        }
        size="xl"
        footer={
          <>
            <Button onClick={() => setShowEdit(false)} variant="outline">
              Cancel
            </Button>
            <Button>Save Changes</Button>
          </>
        }>
        {selectedCv && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Name
              </label>
              <input
                type="text"
                defaultValue={selectedCv.originalFileName}
                className="input-base"
              />
            </div>
            {selectedCv.parsedData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCv.parsedData.name || ""}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedCv.parsedData.email || ""}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedCv.parsedData.phone || ""}
                    className="input-base"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showView && !!selectedCv}
        onClose={() => setShowView(false)}
        title={
          selectedCv
            ? t("cv.modals.viewTitle", {
                fileName: selectedCv.originalFileName,
              })
            : t("cv.modals.viewTitle", { fileName: "" })
        }
        size="xl"
        footer={
          <Button onClick={() => setShowView(false)}>
            {t("common.close")}
          </Button>
        }>
        {selectedCv && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("cv.modals.fileName")}
                </label>
                <p className="text-gray-900">{selectedCv.originalFileName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("cv.modals.uploadDate")}
                </label>
                <p className="text-gray-900">
                  {new Date(selectedCv.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedCv.parsedData ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("cv.modals.parsedInfo")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCv.parsedData.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <p className="text-gray-900">
                        {selectedCv.parsedData.name}
                      </p>
                    </div>
                  )}
                  {selectedCv.parsedData.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedCv.parsedData.email}
                      </p>
                    </div>
                  )}
                  {selectedCv.parsedData.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">
                        {selectedCv.parsedData.phone}
                      </p>
                    </div>
                  )}
                </div>

                {selectedCv.parsedData.experience &&
                  selectedCv.parsedData.experience.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("cv.sections.experience")}
                      </label>
                      <div className="space-y-3">
                        {selectedCv.parsedData.experience.map((exp, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900">
                              {exp.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {exp.company}
                            </p>
                            <p className="text-sm text-gray-500">
                              {exp.duration}
                            </p>
                            {exp.location && (
                              <p className="text-sm text-gray-500">
                                📍 {exp.location}
                              </p>
                            )}

                            {/* Technologies */}
                            {exp.technologies &&
                              exp.technologies.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">
                                    {t("cv.sections.technologies")}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {exp.technologies.map((tech, techIndex) => (
                                      <span
                                        key={techIndex}
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                            {/* Sub-Projects */}
                            {Array.isArray(exp.subProjects) &&
                              exp.subProjects.length > 0 && (
                                <div className="mt-3 space-y-2 bg-purple-50 p-3 rounded-lg">
                                  <p className="text-xs font-semibold text-purple-800 uppercase">
                                    {t("cv.sections.subProjects", {
                                      count: exp.subProjects.length,
                                    })}
                                  </p>
                                  {exp.subProjects.map((subProj, subIdx) => (
                                    <div
                                      key={subIdx}
                                      className="border-l-2 border-purple-300 pl-3 py-2 bg-white rounded-r">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h5 className="text-sm font-semibold text-gray-900">
                                          {subProj.name ||
                                            t("cv.sections.subProjectDefault", {
                                              number: subIdx + 1,
                                            })}
                                        </h5>
                                        {subProj.role && (
                                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                                            {subProj.role}
                                          </span>
                                        )}
                                      </div>

                                      {/* Sub-project Tech Stack */}
                                      {Array.isArray(subProj.techStack) &&
                                        subProj.techStack.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {subProj.techStack.map(
                                              (tech, techIdx) => (
                                                <span
                                                  key={techIdx}
                                                  className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded border border-purple-200">
                                                  {tech}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* Sub-project Responsibilities */}
                                      {Array.isArray(
                                        subProj.responsibilities
                                      ) &&
                                        subProj.responsibilities.length > 0 && (
                                          <ul className="text-xs text-gray-700 mt-2 space-y-1">
                                            {subProj.responsibilities.map(
                                              (resp, respIdx) => (
                                                <li
                                                  key={respIdx}
                                                  className="flex items-start gap-1.5">
                                                  <span className="text-purple-500 font-bold mt-0.5">
                                                    ▸
                                                  </span>
                                                  <span>{resp}</span>
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        )}
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedCv.parsedData.skills && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("cv.sections.skills")}
                    </label>
                    <div className="space-y-3">
                      {selectedCv.parsedData.skills.technical &&
                        selectedCv.parsedData.skills.technical.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {t("cv.sections.technicalSkills")}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedCv.parsedData.skills.technical.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {selectedCv.parsedData.skills.soft &&
                        selectedCv.parsedData.skills.soft.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {t("cv.sections.softSkills")}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedCv.parsedData.skills.soft.map(
                                (skill, index) => (
                                  <span
                                    key={index}
                                    className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      {selectedCv.parsedData.skills.languages &&
                        selectedCv.parsedData.skills.languages.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {t("cv.sections.languages")}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {selectedCv.parsedData.skills.languages.map(
                                (lang, index) => (
                                  <span
                                    key={index}
                                    className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                    {lang}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {selectedCv.parsedData.projects &&
                  selectedCv.parsedData.projects.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("cv.sections.projects")}
                      </label>
                      <div className="space-y-2">
                        {selectedCv.parsedData.projects.map(
                          (project, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900">
                                {project.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {project.description}
                              </p>
                              {project.techStack &&
                                project.techStack.length > 0 && (
                                  <div className="mt-2">
                                    <div className="flex flex-wrap gap-1">
                                      {project.techStack.map(
                                        (tech, techIndex) => (
                                          <span
                                            key={techIndex}
                                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {tech}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {selectedCv.parsedData.certifications &&
                  selectedCv.parsedData.certifications.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("cv.sections.certifications")}
                      </label>
                      <div className="space-y-2">
                        {selectedCv.parsedData.certifications.map(
                          (cert, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900">
                                {cert.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {cert.issuer}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cert.date}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t("cv.modals.notParsed")}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder={t("cv.search")}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 input-base"
        />
        <select
          value={filterStatus}
          onChange={(e) =>
            handleFilterChange(e.target.value as "all" | "parsed" | "unparsed")
          }
          className="input-base w-auto">
          <option value="all">{t("cv.filter.all")}</option>
          <option value="parsed">{t("cv.filter.parsed")}</option>
          <option value="unparsed">{t("cv.filter.unparsed")}</option>
        </select>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="h-full py-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("cv.refresh")}
        </Button>
      </div>

      {/* CVs List */}
      <div>
        {filteredCvs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("cv.empty.noCVs")}
            </h3>
            <p className="text-gray-600 mb-6">{t("cv.empty.description")}</p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("cv.empty.uploadFirst")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCvs.map((cv) => (
              <CVPreview
                key={cv.id}
                cv={cv}
                // onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onTailor={handleTailor}
                onExport={handleExport}
                onUpdate={() => {
                  // Refresh CVs after update
                  queryClient.invalidateQueries({ queryKey: ["cvs"] });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Export Loading */}
      {exportMutation.isPending && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {t("cv.exporting")}
          </div>
        </div>
      )}
    </div>
  );
}
