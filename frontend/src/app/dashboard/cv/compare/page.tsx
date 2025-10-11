"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cvApi, CV } from "@/lib/cv";
import { ArrowLeft, GitCompare } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

function CompareContent() {
  const searchParams = useSearchParams();
  const v1Id = searchParams.get("v1");
  const v2Id = searchParams.get("v2");

  const [version1, setVersion1] = useState<CV | null>(null);
  const [version2, setVersion2] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [v1Id, v2Id]);

  const loadVersions = async () => {
    if (!v1Id || !v2Id) return;

    try {
      setLoading(true);
      const [v1, v2] = await Promise.all([
        cvApi.getCvById(v1Id.split("-v")[0]),
        cvApi.getCvById(v2Id.split("-v")[0]),
      ]);
      setVersion1(v1);
      setVersion2(v2);
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading comparison...</div>
      </div>
    );
  }

  if (!version1 || !version2) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">
          Failed to load versions for comparison
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between gap-4 w-full">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <GitCompare className="h-8 w-8 text-purple-600" />
                Version Comparison
              </h2>
              <p className="text-gray-600 mt-1">
                Comparing Version {version1.version} vs Version{" "}
                {version2.version}
              </p>
            </div>
            <Link href="/dashboard/cv">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to CVs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version 1 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-blue-50 border-b border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900">
              Version {version1.version}
            </h3>
            <p className="text-sm text-blue-700">
              Updated: {new Date(version1.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CVDataDisplay cv={version1} />
          </div>
        </div>

        {/* Version 2 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="bg-purple-50 border-b border-purple-200 p-4">
            <h3 className="font-semibold text-purple-900">
              Version {version2.version}
            </h3>
            <p className="text-sm text-purple-700">
              Updated: {new Date(version2.updatedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <CVDataDisplay cv={version2} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CVDataDisplay({ cv }: { cv: CV }) {
  const { parsedData } = cv;

  return (
    <>
      {/* Personal Info */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">
          Personal Information
        </h4>
        <div className="space-y-1 text-sm">
          <p>
            <strong>Name:</strong> {parsedData.name}
          </p>
          <p>
            <strong>Email:</strong> {parsedData.email}
          </p>
          <p>
            <strong>Phone:</strong> {parsedData.phone}
          </p>
          {parsedData.address && (
            <p>
              <strong>Address:</strong> {parsedData.address}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {parsedData.summary && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
          <p className="text-sm text-gray-700">{parsedData.summary}</p>
        </div>
      )}

      {/* Experience */}
      {parsedData.experience?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
          <div className="space-y-3">
            {parsedData.experience.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-blue-200 pl-3">
                <p className="font-medium text-sm">{exp.title}</p>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">{exp.duration}</p>
                {exp.responsibilities && (
                  <ul className="text-xs text-gray-700 mt-1 space-y-0.5">
                    {exp.responsibilities.slice(0, 3).map((resp, i) => (
                      <li key={i}>• {resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {parsedData.skills && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
          <div className="space-y-2">
            {parsedData.skills.technical?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500">Technical:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.skills.technical.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {parsedData.skills.soft?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500">Soft:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.skills.soft.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education */}
      {parsedData.education?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
          <div className="space-y-2">
            {parsedData.education.map((edu, idx) => (
              <div key={idx}>
                <p className="font-medium text-sm">{edu.degree}</p>
                <p className="text-sm text-gray-600">{edu.school}</p>
                <p className="text-xs text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {parsedData.projects?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Projects</h4>
          <div className="space-y-2">
            {parsedData.projects.map((proj, idx) => (
              <div key={idx}>
                <p className="font-medium text-sm">{proj.name}</p>
                <p className="text-xs text-gray-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <CompareContent />
    </Suspense>
  );
}
