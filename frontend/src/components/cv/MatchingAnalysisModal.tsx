"use client";

import React from "react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";

interface MatchingAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    suggestions: string[];
    strengths: string[];
  };
  jobTitle?: string;
  company?: string;
}

export default function MatchingAnalysisModal({
  isOpen,
  onClose,
  analysis,
  jobTitle = "Software Engineer",
  company = "Tech Company",
}: MatchingAnalysisModalProps) {
  // Use provided analysis or show empty state
  const data = analysis || {
    score: 0,
    matchedSkills: [],
    missingSkills: [],
    suggestions: ["No analysis data available"],
    strengths: [],
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    return "Needs Improvement";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerClassName="bg-gradient-to-r from-blue-50 to-purple-50"
      title={
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              CV-Job Matching Analysis
            </h3>
            <p className="text-sm text-gray-600">
              {jobTitle} at {company}
            </p>
          </div>
        </div>
      }
      footer={
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      }>
      <div className="space-y-6">
        {/* Overall Score */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Compatibility Score
            </h3>
            <Badge className={`px-3 py-1 ${getScoreColor(data.score)}`}>
              {data.score}%
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {data.score}%
            </div>
            <div className={`text-lg font-medium ${getScoreColor(data.score)}`}>
              {getScoreLabel(data.score)}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Matched Skills */}
        {data.matchedSkills.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-medium text-green-900 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Matched Skills ({data.matchedSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.matchedSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-100 text-green-800 border-green-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {data.missingSkills.length > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-lg font-medium text-red-900 mb-3 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Missing Skills ({data.missingSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-red-100 text-red-800 border-red-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {data.strengths.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Your Strengths
            </h3>
            <ul className="space-y-2">
              {data.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-blue-800">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions */}
        {data.suggestions.length > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-medium text-yellow-900 mb-3 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {data.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-yellow-800">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {data.score === 0 &&
          data.matchedSkills.length === 0 &&
          data.missingSkills.length === 0 &&
          data.strengths.length === 0 && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Analysis Available
              </h3>
              <p className="text-gray-600">
                This CV hasn&apos;t been analyzed against a job description yet. Use
                the Job Tailor feature to get detailed matching analysis.
              </p>
            </div>
          )}
      </div>
    </Modal>
  );
}
