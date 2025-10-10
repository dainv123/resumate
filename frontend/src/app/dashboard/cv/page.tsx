"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi, CV } from "@/lib/cv";
import CVUpload from "@/components/cv/CVUpload";
import CVPreview from "@/components/cv/CVPreview";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Plus, FileText, AlertCircle } from "lucide-react";

export default function CVPage() {
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
    if (confirm("Are you sure you want to delete this CV?")) {
      deleteMutation.mutate(cv.id);
    }
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
          <h3 className="text-2xl font-bold text-gray-900">My CVs</h3>
          <p className="text-gray-600">
            Manage and update your CVs with AI-powered features
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Upload CV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {cvStats.total}
          </div>
          <div className="text-sm text-blue-800">Total CVs</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {cvStats.parsed}
          </div>
          <div className="text-sm text-green-800">Parsed</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {cvStats.unparsed}
          </div>
          <div className="text-sm text-yellow-800">Unparsed</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {cvStats.recent}
          </div>
          <div className="text-sm text-purple-800">This Week</div>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload New CV"
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
          selectedCv ? `Edit CV: ${selectedCv.originalFileName}` : "Edit CV"
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
            ? `CV Details: ${selectedCv.originalFileName}`
            : "CV Details"
        }
        size="xl"
        footer={<Button onClick={() => setShowView(false)}>Close</Button>}>
        {selectedCv && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Name
                </label>
                <p className="text-gray-900">{selectedCv.originalFileName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Date
                </label>
                <p className="text-gray-900">
                  {new Date(selectedCv.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {selectedCv.parsedData ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Parsed Information
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
                        Experience
                      </label>
                      <div className="space-y-2">
                        {selectedCv.parsedData.experience.map((exp, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3">
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
                            {exp.technologies &&
                              exp.technologies.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1">
                                    Technologies:
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedCv.parsedData.skills && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="space-y-3">
                      {selectedCv.parsedData.skills.technical &&
                        selectedCv.parsedData.skills.technical.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              Technical Skills:
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
                              Soft Skills:
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
                              Languages:
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
                        Projects
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
                        Certifications
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
                <p className="text-gray-500">CV has not been parsed yet</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search CVs..."
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
          <option value="all">All CVs</option>
          <option value="parsed">Parsed</option>
          <option value="unparsed">Unparsed</option>
        </select>
        <Button onClick={handleRefresh} variant="outline" className="h-full">
          Refresh
        </Button>
      </div>

      {/* CVs List */}
      <div>
        {filteredCvs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No CVs uploaded yet
            </h3>
            <p className="text-gray-600 mb-6">
              Upload your first CV to get started with AI-powered features
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Your First CV
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
            Exporting...
          </div>
        </div>
      )}
    </div>
  );
}
