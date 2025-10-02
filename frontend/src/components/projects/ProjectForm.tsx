"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateProjectData, UpdateProjectData, Project } from "@/lib/projects";
import Button from "@/components/ui/Button";
import { X } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  role: z.string().min(1, "Role is required"),
  techStack: z.array(z.string()).min(1, "At least one technology is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  results: z.string().optional(),
  demoLink: z.string().url().optional().or(z.literal("")),
  githubLink: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) {
  const [techStack, setTechStack] = React.useState<string[]>(
    project?.techStack || []
  );
  const [newTech, setNewTech] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || "",
      role: project?.role || "",
      description: project?.description || "",
      results: project?.results || "",
      demoLink: project?.demoLink || "",
      githubLink: project?.githubLink || "",
      imageUrl: project?.imageUrl || "",
    },
  });

  const addTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      const updatedTechStack = [...techStack, newTech.trim()];
      setTechStack(updatedTechStack);
      setValue("techStack", updatedTechStack);
      setNewTech("");
    }
  };

  const removeTech = (tech: string) => {
    const updatedTechStack = techStack.filter((t) => t !== tech);
    setTechStack(updatedTechStack);
    setValue("techStack", updatedTechStack);
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    const formData = {
      ...data,
      techStack,
      demoLink: data.demoLink || undefined,
      githubLink: data.githubLink || undefined,
      imageUrl: data.imageUrl || undefined,
      results: data.results || undefined,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Project Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700">
          Project Name *
        </label>
        <input
          {...register("name")}
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter project name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700">
          Your Role *
        </label>
        <input
          {...register("role")}
          type="text"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Frontend Developer, Full Stack Developer"
        />
        {errors.role && (
          <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tech Stack *
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {tech}
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="ml-2 text-blue-600 hover:text-blue-800">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTech())
            }
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add technology"
          />
          <Button type="button" onClick={addTech} variant="outline">
            Add
          </Button>
        </div>
        {errors.techStack && (
          <p className="mt-1 text-sm text-red-600">
            {errors.techStack.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700">
          Description *
        </label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe what you built and your contributions"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Results */}
      <div>
        <label
          htmlFor="results"
          className="block text-sm font-medium text-gray-700">
          Results/Achievements
        </label>
        <textarea
          {...register("results")}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Improved performance by 50%, Increased user engagement by 30%"
        />
        {errors.results && (
          <p className="mt-1 text-sm text-red-600">{errors.results.message}</p>
        )}
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="demoLink"
            className="block text-sm font-medium text-gray-700">
            Demo Link
          </label>
          <input
            {...register("demoLink")}
            type="url"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://demo.example.com"
          />
          {errors.demoLink && (
            <p className="mt-1 text-sm text-red-600">
              {errors.demoLink.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="githubLink"
            className="block text-sm font-medium text-gray-700">
            GitHub Link
          </label>
          <input
            {...register("githubLink")}
            type="url"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://github.com/username/repo"
          />
          {errors.githubLink && (
            <p className="mt-1 text-sm text-red-600">
              {errors.githubLink.message}
            </p>
          )}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700">
          Project Image URL
        </label>
        <input
          {...register("imageUrl")}
          type="url"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://example.com/project-image.jpg"
        />
        {errors.imageUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.imageUrl.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isLoading}>
          {project ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
