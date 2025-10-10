"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateProjectData, UpdateProjectData, Project } from "@/lib/projects";
import Button from "@/components/ui/Button";
import { Collapse } from "@/components/ui/Collapse";
import Input, { Textarea } from "@/components/ui/Input";
import {
  X,
  FileText,
  User,
  Code2,
  FileType,
  Trophy,
  Link2,
  Image as ImageIcon,
} from "lucide-react";

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
  showActions?: boolean; // Control whether to show built-in actions
}

export default function ProjectForm({
  project,
  onSubmit,
  onCancel,
  isLoading = false,
  showActions = true,
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
    <form
      id="project-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4">
      {/* Section 1: Basic Information */}
      <Collapse
        title="Basic Information"
        icon={<FileText className="h-4 w-4 text-blue-600" />}
        defaultOpen={true}>
        <div className="space-y-4">
          <Input
            {...register("name")}
            label="Project Name"
            className="input-base mt-1"
            placeholder="Enter project name"
            error={errors.name?.message}
            required
          />

          <Input
            {...register("role")}
            label="Your Role"
            placeholder="e.g., Frontend Developer, Full Stack Developer"
            error={errors.role?.message}
            required
          />
        </div>
      </Collapse>

      {/* Section 2: Tech Stack */}
      <Collapse
        title="Tech Stack"
        icon={<Code2 className="h-4 w-4 text-purple-600" />}
        badge={techStack.length}
        defaultOpen={true}>
        <div className="space-y-4">
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
            <Input
              type="text"
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTech())
              }
              placeholder="Add technology (Press Enter)"
              className="flex-1"
            />
            <Button type="button" onClick={addTech} variant="outline" size="sm">
              Add
            </Button>
          </div>
          {errors.techStack && (
            <p className="mt-1 text-sm text-red-600">
              {errors.techStack.message}
            </p>
          )}
        </div>
      </Collapse>

      {/* Section 3: Description & Results */}
      <Collapse
        title="Description & Results"
        icon={<FileType className="h-4 w-4 text-green-600" />}
        defaultOpen={true}>
        <div className="space-y-4">
          <Textarea
            {...register("description")}
            label="Description"
            rows={4}
            placeholder="Describe what you built and your contributions"
            error={errors.description?.message}
            required
          />

          <Textarea
            {...register("results")}
            label="Results/Achievements"
            rows={3}
            placeholder="e.g., Improved performance by 50%, Increased user engagement by 30%"
            error={errors.results?.message}
          />
        </div>
      </Collapse>

      {/* Section 4: Links & Media */}
      <Collapse
        title="Links & Media"
        icon={<Link2 className="h-4 w-4 text-orange-600" />}
        defaultOpen={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              {...register("demoLink")}
              type="url"
              label="Demo Link"
              placeholder="https://demo.example.com"
              error={errors.demoLink?.message}
            />

            <Input
              {...register("githubLink")}
              type="url"
              label="GitHub Link"
              placeholder="https://github.com/username/repo"
              error={errors.githubLink?.message}
            />
          </div>

          <Input
            {...register("imageUrl")}
            type="url"
            label="Project Image URL"
            placeholder="https://example.com/project-image.jpg"
            error={errors.imageUrl?.message}
          />
        </div>
      </Collapse>

      {/* Actions - Only show if showActions is true */}
      {showActions && (
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {project ? "Update Project" : "Create Project"}
          </Button>
        </div>
      )}
    </form>
  );
}
