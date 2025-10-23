"use client";

import React from "react";
import {
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  Clock,
  Target,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Lightbulb,
} from "lucide-react";
import { JobDescription } from "@/lib/cv";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface JobDescriptionModalProps {
  jobDescription: JobDescription;
  isOpen: boolean;
  onClose: () => void;
  coverLetter?: string;
  matchingAnalysis?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    strengths: string[];
  };
}

export default function JobDescriptionModal({
  jobDescription,
  isOpen,
  onClose,
  coverLetter,
  matchingAnalysis,
}: JobDescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerClassName="bg-gradient-to-r from-green-50 to-blue-50"
      title={
        <div className="flex items-center">
          <Briefcase className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Job Description
            </h3>
            <p className="text-sm text-gray-600">
              {jobDescription?.title || "No job title"}
            </p>
          </div>
        </div>
      }
      footer={
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      }>
      {/* Content */}
      <div className="space-y-6">
        {!jobDescription ||
        jobDescription.title === "No job description available" ? (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Job Description Available
            </h4>
            <p className="text-gray-600">
              This CV hasn&apos;t been associated with a job description yet. Use the
              Job Tailor feature to analyze this CV against a specific job
              posting.
            </p>
          </div>
        ) : (
          <>
            {/* Job Details */}
            {/* <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Job Details
              </h4>
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
            </div> */}

            {/* Job Description */}
            <div>
              {/* <h4 className="text-lg font-medium text-gray-900 mb-2">
                Description
              </h4> */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {jobDescription.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {/* {jobDescription.requirements && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Requirements
                </h4>
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
            )} */}

            {/* Keywords */}
            {/* {jobDescription.keywords && jobDescription.keywords.length > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Keywords
                </h4>
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
            )} */}

            {/* Cover Letter */}
            {coverLetter && coverLetter.trim() !== "" && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Cover Letter
                </h4>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Matching Analysis */}
            {matchingAnalysis && matchingAnalysis.score > 0 && (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                  Matching Analysis
                </h4>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  {/* Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">Match Score:</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {matchingAnalysis.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${matchingAnalysis.score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  {matchingAnalysis.matchedSkills && matchingAnalysis.matchedSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        Matched Skills ({matchingAnalysis.matchedSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchingAnalysis.matchedSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {matchingAnalysis.missingSkills && matchingAnalysis.missingSkills.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <XCircle className="h-4 w-4 mr-1 text-red-600" />
                        Missing Skills ({matchingAnalysis.missingSkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchingAnalysis.missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths */}
                  {matchingAnalysis.strengths && matchingAnalysis.strengths.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-1 text-blue-600" />
                        Strengths
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {matchingAnalysis.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {matchingAnalysis.suggestions && matchingAnalysis.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Lightbulb className="h-4 w-4 mr-1 text-yellow-600" />
                        Suggestions for Improvement
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {matchingAnalysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Metadata
              </h4>
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
          </>
        )}
      </div>
    </Modal>
  );
}
