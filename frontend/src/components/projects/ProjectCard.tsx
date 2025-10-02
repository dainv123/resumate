"use client";

import React from "react";
import { Project } from "@/lib/projects";
import { formatDate } from "@/lib/utils";
import {
  Edit,
  Trash2,
  ExternalLink,
  Github,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onAddToCv?: (project: Project) => void;
  onRemoveFromCv?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  onEdit,
  onDelete,
  onAddToCv,
  onRemoveFromCv,
}: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{project.role}</p>
          <p className="text-xs text-gray-500">
            Created {formatDate(project.createdAt)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {project.isAddedToCv ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              In CV
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <XCircle className="h-3 w-3 mr-1" />
              Not in CV
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Tech Stack */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1">
          {project.techStack.slice(0, 6).map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              {tech}
            </span>
          ))}
          {project.techStack.length > 6 && (
            <span className="text-xs text-gray-500">
              +{project.techStack.length - 6} more
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {project.results && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Results:</span> {project.results}
          </p>
        </div>
      )}

      {/* Links */}
      <div className="flex items-center space-x-4 mb-4">
        {project.demoLink && (
          <a
            href={project.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
            <ExternalLink className="h-4 w-4 mr-1" />
            Demo
          </a>
        )}
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <Github className="h-4 w-4 mr-1" />
            Code
          </a>
        )}
      </div>

      {/* CV Bullets Preview */}
      {project.cvBullets.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">CV Bullets:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {project.cvBullets.slice(0, 2).map((bullet, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-400 mr-2">•</span>
                <span className="line-clamp-2">{bullet}</span>
              </li>
            ))}
            {project.cvBullets.length > 2 && (
              <li className="text-gray-500">
                +{project.cvBullets.length - 2} more bullets
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit?.(project)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>

          {project.isAddedToCv ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoveFromCv?.(project)}
              className="text-orange-600 hover:text-orange-700">
              Remove from CV
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddToCv?.(project)}
              className="text-green-600 hover:text-green-700">
              Add to CV
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete?.(project)}
          className="text-red-600 hover:text-red-700">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
