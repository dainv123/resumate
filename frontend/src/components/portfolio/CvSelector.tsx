"use client";

import { useState, useEffect } from "react";
import { getAllCvs } from "@/lib/cv";

interface CvItem {
  id: string;
  originalFileName: string;
  version: number;
  isTailored: boolean;
  tailoredForJob?: string;
  createdAt: string;
  updatedAt: string;
}

interface CvSelectorProps {
  selectedCvId?: string;
  onSelectCv: (cvId: string) => void;
}

export default function CvSelector({
  selectedCvId,
  onSelectCv,
}: CvSelectorProps) {
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCvs = async () => {
    try {
      setLoading(true);
      const data = await getAllCvs();
      setCvs(data);

      // Auto-select latest CV if none selected
      if (!selectedCvId && data.length > 0) {
        onSelectCv(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch CVs:", err);
      setError("Failed to load CVs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (cvs.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">📄</div>
        <h4 className="font-medium text-yellow-900 mb-2">No CVs Found</h4>
        <p className="text-sm text-yellow-700 mb-4">
          You need to upload a CV before creating a portfolio.
        </p>
        <a
          href="/dashboard/cv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Upload CV
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold mb-2">Select CV</h3>
        <p className="text-gray-600">
          Choose which CV to use for your portfolio data (experience, skills,
          education)
        </p>
      </div>

      <div className="space-y-3">
        {cvs.map((cv) => (
          <div
            key={cv.id}
            onClick={() => onSelectCv(cv.id)}
            className={`
              relative cursor-pointer rounded-lg border-2 p-4 transition-all
              ${
                selectedCvId === cv.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-blue-400 bg-white"
              }
              hover:shadow-md
            `}>
            <div className="flex items-start gap-4">
              {/* CV Icon */}
              <div
                className={`
                flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                ${selectedCvId === cv.id ? "bg-blue-100" : "bg-gray-100"}
              `}>
                📄
              </div>

              {/* CV Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 truncate">
                    {cv.originalFileName}
                  </h4>
                  {/* {selectedCvId === cv.id && (
                    <svg
                      className="w-5 h-5 text-blue-600 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )} */}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    Version {cv.version}
                  </span>
                  {cv.isTailored && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                      Tailored
                    </span>
                  )}
                  {cvs[0].id === cv.id && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      Latest
                    </span>
                  )}
                </div>

                {/* Tailored Info */}
                {cv.isTailored && cv.tailoredForJob && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Tailored for:</span>{" "}
                    {cv.tailoredForJob}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500">
                  Created: {formatDate(cv.createdAt)}
                  {cv.updatedAt !== cv.createdAt &&
                    ` • Updated: ${formatDate(cv.updatedAt)}`}
                </p>
              </div>

              {/* Radio Button */}
              <div className="flex-shrink-0">
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedCvId === cv.id
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }
                  `}>
                  {selectedCvId === cv.id && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>

            {/* Selection Overlay */}
            {/* {selectedCvId === cv.id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Selected
              </div>
            )} */}
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Tip:</strong> If you have multiple CVs tailored for different
          jobs, you can select the most relevant one for your portfolio.
        </p>
      </div>
    </div>
  );
}
