"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  Project,
  CreateProjectData,
  UpdateProjectData,
} from "@/lib/projects";
import { cvApi } from "@/lib/cv";
import ProjectForm from "@/components/projects/ProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import Button from "@/components/ui/Button";
import { Plus, Briefcase, AlertCircle } from "lucide-react";

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getUserProjects,
  });

  const { data: cvs = [] } = useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const addToCvMutation = useMutation({
    mutationFn: ({ project, cvId }: { project: Project; cvId: string }) =>
      projectsApi.addProjectToCv(project.id, cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
  });

  const removeFromCvMutation = useMutation({
    mutationFn: ({ project, cvId }: { project: Project; cvId: string }) =>
      projectsApi.removeProjectFromCv(project.id, cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (project: Project) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(project.id);
    }
  };

  const handleAddToCv = (project: Project) => {
    if (cvs.length === 0) {
      alert("Please upload a CV first");
      return;
    }

    if (cvs.length === 1) {
      addToCvMutation.mutate({ project, cvId: cvs[0].id });
    } else {
      // TODO: Show CV selection modal
      const cvId = prompt("Enter CV ID to add project to:");
      if (cvId) {
        addToCvMutation.mutate({ project, cvId });
      }
    }
  };

  const handleRemoveFromCv = (project: Project) => {
    if (cvs.length === 1) {
      removeFromCvMutation.mutate({ project, cvId: cvs[0].id });
    } else {
      // TODO: Show CV selection modal
      const cvId = prompt("Enter CV ID to remove project from:");
      if (cvId) {
        removeFromCvMutation.mutate({ project, cvId });
      }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Projects</h3>
          <p className="text-gray-600">
            Manage your projects and generate professional CV bullets
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>
            <ProjectForm
              project={editingProject || undefined}
              onSubmit={
                editingProject ? handleUpdateProject : handleCreateProject
              }
              onCancel={handleCancel}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first project to start building your portfolio
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddToCv={handleAddToCv}
              onRemoveFromCv={handleRemoveFromCv}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Project Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {projects.length}
              </div>
              <div className="text-sm text-gray-500">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {projects.filter((p) => p.isAddedToCv).length}
              </div>
              <div className="text-sm text-gray-500">Added to CV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {projects.reduce((acc, p) => acc + p.techStack.length, 0)}
              </div>
              <div className="text-sm text-gray-500">Technologies Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
