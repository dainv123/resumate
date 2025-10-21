"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  Project,
  CreateProjectData,
  UpdateProjectData,
} from "@/lib/projects";
import { useCvsPaginated } from "@/hooks/useCvs";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import CVMultiSelectionModal from "@/components/projects/CVMultiSelectionModal";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showManageCVsModal, setShowManageCVsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const { t } = useLanguage();

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getUserProjects,
  });

  const { data: cvsData } = useCvsPaginated({
    limit: 100,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const cvs = cvsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess(t("projects.createProjectSuccess"));
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess(t("projects.updateProjectSuccess"));
      setEditingProject(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess(t("projects.deleteProjectSuccess"));
      setShowForm(false);
    },
  });

  const syncCVsMutation = useMutation({
    mutationFn: async ({
      project,
      newCvIds,
    }: {
      project: Project;
      newCvIds: string[];
    }) => {
      const currentCvIds = project.cvIds || [];
      const cvsToAdd = newCvIds.filter((id) => !currentCvIds.includes(id));
      const cvsToRemove = currentCvIds.filter((id) => !newCvIds.includes(id));

      // Add to new CVs
      for (const cvId of cvsToAdd) {
        await projectsApi.addProjectToCv(project.id, cvId);
      }

      // Remove from old CVs
      for (const cvId of cvsToRemove) {
        await projectsApi.removeProjectFromCv(project.id, cvId);
      }

      return { cvsToAdd, cvsToRemove };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      showSuccess(t("projects.cvsUpdatedSuccess"));
      setShowManageCVsModal(false);
      setSelectedProject(null);
    },
    onError: () => {
      showError(t("common.error"));
    },
  });

  const handleCreateProject = (data: CreateProjectData) => {
    createMutation.mutate(data);
  };

  const handleUpdateProject = (data: UpdateProjectData) => {
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    }
  };

  const handleSubmit = (data: CreateProjectData | UpdateProjectData) => {
    if (editingProject) {
      handleUpdateProject(data as UpdateProjectData);
    } else {
      handleCreateProject(data as CreateProjectData);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (project: Project) => {
    if (confirm(t("projects.deleteConfirm"))) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleManageCVs = (project: Project) => {
    if (cvs.length === 0) {
      showError(t("projects.uploadCVFirst"));
      return;
    }

    setSelectedProject(project);
    setShowManageCVsModal(true);
  };

  const handleConfirmCVSelection = (newCvIds: string[]) => {
    if (selectedProject) {
      syncCVsMutation.mutate({
        project: selectedProject,
        newCvIds,
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProject(null);
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
          <p className="text-red-800">Failed to load projects</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title={t("projects.title")}
      subtitle={t("projects.subtitle")}
      showBackButton={false}
      headerActions={
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          {t("projects.addProject")}
        </Button>
      }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Form Modal */}
        <Modal
          isOpen={showForm}
          onClose={handleCancel}
          title={editingProject ? t("projects.edit") : t("projects.addNew")}
          size="xl"
          footer={
            <div className="flex justify-end space-x-3 w-full">
              <Button type="button" variant="outline" onClick={handleCancel}>
                {t("projects.cancel")}
              </Button>
              <Button
                type="submit"
                form="project-form"
                loading={createMutation.isPending || updateMutation.isPending}>
                {editingProject ? t("projects.update") : t("projects.create")}
              </Button>
            </div>
          }>
          <ProjectForm
            project={editingProject || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
            showActions={false}
          />
        </Modal>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("projects.noProjects")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("projects.noProjectsSubtitle")}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("projects.addFirstProject")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                cvs={cvs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageCVs={handleManageCVs}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {projects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {t("projects.statistics")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("projects.totalProjects")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter((p) => p.cvIds && p.cvIds.length > 0).length}
                </div>
                <div className="text-sm text-gray-500">
                  {t("projects.addedToCV")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {projects.reduce((acc, p) => acc + p.techStack.length, 0)}
                </div>
                <div className="text-sm text-gray-500">
                  {t("projects.technologiesUsed")}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CV Multi-Selection Modal */}
        <CVMultiSelectionModal
          isOpen={showManageCVsModal}
          onClose={() => {
            setShowManageCVsModal(false);
            setSelectedProject(null);
          }}
          cvs={cvs}
          selectedCvIds={selectedProject?.cvIds || []}
          onConfirm={handleConfirmCVSelection}
          isLoading={syncCVsMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
