"use client";

import React from "react";
import {
  X,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Target,
} from "lucide-react";
import { JobDescription } from "@/lib/cv";

interface JobDescriptionModalProps {
  jobDescription: JobDescription;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDescriptionModal({
  jobDescription,
  isOpen,
  onClose,
}: JobDescriptionModalProps) {
  if (!isOpen || !jobDescription) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center">
            <Briefcase className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Job Description
              </h3>
              <p className="text-sm text-gray-600">{jobDescription.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Job Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-700">Title:</span>
                  <span className="ml-2 text-gray-900">
                    {jobDescription.title}
                  </span>
                </div>
                {jobDescription.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Company:</span>
                    <span className="ml-2 text-gray-900">
                      {jobDescription.company}
                    </span>
                  </div>
                )}
                {jobDescription.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Location:</span>
                    <span className="ml-2 text-gray-900">
                      {jobDescription.location}
                    </span>
                  </div>
                )}
                {jobDescription.salary && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">Salary:</span>
                    <span className="ml-2 text-gray-900">
                      {jobDescription.salary}
                    </span>
                  </div>
                )}
                {jobDescription.experience && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="font-medium text-gray-700">
                      Experience:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {jobDescription.experience}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {jobDescription.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {jobDescription.requirements && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Requirements
                </h3>
                <div className="space-y-4">
                  {jobDescription.requirements.skills &&
                    jobDescription.requirements.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Required Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {jobDescription.requirements.skills.map(
                            (skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {skill}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {jobDescription.requirements.education &&
                    jobDescription.requirements.education.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Education Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {jobDescription.requirements.education.map(
                            (edu, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                {edu}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {jobDescription.requirements.experience &&
                    jobDescription.requirements.experience.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Experience Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {jobDescription.requirements.experience.map(
                            (exp, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                {exp}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {jobDescription.requirements.certifications &&
                    jobDescription.requirements.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Certification Requirements
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {jobDescription.requirements.certifications.map(
                            (cert, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                {cert}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* Keywords */}
            {jobDescription.keywords && jobDescription.keywords.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {jobDescription.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(jobDescription.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">
                    Last Updated:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {new Date(jobDescription.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
