"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cvApi } from "@/lib/cv";
import Button from "@/components/ui/Button";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface CVUploadProps {
  onSuccess?: (cv: any) => void;
  onError?: (error: string) => void;
}

export default function CVUpload({ onSuccess, onError }: CVUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: cvApi.uploadCv,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      setUploadedFile(null);
      onSuccess?.(data);
    },
    onError: (error: any) => {
      onError?.(error.response?.data?.message || "Upload failed");
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(uploadedFile);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}>
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? "Drop your CV here" : "Upload your CV"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop your CV file, or click to select
        </p>
        <p className="text-xs text-gray-400">
          Supports PDF and DOCX files up to 10MB
        </p>
      </div>

      {/* File Preview */}
      {uploadedFile && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {uploadedFile && (
        <div className="flex justify-center">
          <Button onClick={handleUpload} loading={isUploading} className="px-8">
            {isUploading ? "Uploading..." : "Upload CV"}
          </Button>
        </div>
      )}

      {/* Success Message */}
      {uploadMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800">
              CV uploaded successfully! AI is analyzing your CV content.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            {uploadMutation.error?.response?.data?.message || "Upload failed"}
          </p>
        </div>
      )}
    </div>
  );
}
