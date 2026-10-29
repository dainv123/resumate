"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { cvApi, CV } from "@/lib/cv";
import { CVData } from "@/types/cv.types";
import Button from "@/components/ui/Button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DynamicFormEditor from "@/components/cv/DynamicFormEditor";
import { Save, Eye } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function CVEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(true); // Start in edit mode
  const [formData, setFormData] = useState<CVData | null>(null);

  const {
    data: cv,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["cv", id],
    queryFn: () => cvApi.getCvById(id as string),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CV>) => cvApi.updateCv(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cv", id] });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      showSuccess(t("cv.edit.success"));
      setIsEditing(false);
    },
    onError: () => {
      showError(t("cv.edit.error"));
    },
  });

  // Initialize form data when CV loads
  useEffect(() => {
    if (cv?.parsedData) {
      setFormData(cv.parsedData);
    }
  }, [cv?.parsedData]);

  const handleSave = () => {
    if (!formData) return;

    updateMutation.mutate({ parsedData: formData });
  };

  const handlePreview = () => {
    window.open(`/dashboard/cv/${id}`, "_blank");
  };

  const handleUpdate = (path: string, value: string | string[] | object) => {
    if (!formData) return;

    setFormData((prev) => {
      if (!prev) return prev;

      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData;

      // Handle array indices in path (e.g., "projects[0].name")
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        // Check if this key contains array index
        if (key.includes("[") && key.includes("]")) {
          const arrayKey = key.substring(0, key.indexOf("["));
          const index = parseInt(
            key.substring(key.indexOf("[") + 1, key.indexOf("]"))
          );

          if (!(current as any)[arrayKey]) {
            (current as any)[arrayKey] = [];
          } else {
            // Deep clone array
            (current as any)[arrayKey] = [
              ...((current as any)[arrayKey] as unknown[]),
            ];
          }

          const array = (current as any)[arrayKey] as unknown[];
          if (!array[index]) {
            array[index] = {};
          } else {
            // Deep clone array item
            array[index] = { ...(array[index] as Record<string, unknown>) };
          }

          current = array[index] as any;
        } else {
          // Regular object key
          if (!(current as any)[key]) {
            (current as any)[key] = {};
          } else {
            // Deep clone nested objects
            (current as any)[key] = { ...(current as any)[key] };
          }
          current = (current as any)[key] as any;
        }
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey.includes("[") && lastKey.includes("]")) {
        const arrayKey = lastKey.substring(0, lastKey.indexOf("["));
        const index = parseInt(
          lastKey.substring(lastKey.indexOf("[") + 1, lastKey.indexOf("]"))
        );
        const array = (current as any)[arrayKey] as unknown[];
        array[index] = value;
      } else {
        (current as any)[lastKey] = value;
      }

      return newData;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t("common.error")}
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message || t("cv.notFound")}
          </p>
          <Button onClick={() => router.push("/dashboard/cv")}>
            {t("common.back")}
          </Button>
        </div>
      </div>
    );
  }

  const headerActions = (
    <>
      <Button
        variant="outline"
        onClick={handlePreview}
        className="flex items-center space-x-2">
        <Eye className="h-4 w-4" />
        <span>{t("cv.view")}</span>
      </Button>
      {!isEditing && (
        <Button
          onClick={() => setIsEditing(true)}
          className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{t("cv.edit")}</span>
        </Button>
      )}
    </>
  );

  return (
    <DashboardLayout
      title={t("cv.editCV")}
      subtitle={cv.originalFileName}
      backUrl={`/dashboard/cv/${id}`}
      headerActions={headerActions}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {formData && (
          <DynamicFormEditor
            formData={formData}
            onUpdate={handleUpdate}
            isEditing={isEditing}
          />
        )}

        {/* Sticky Footer */}
        {isEditing && (
          <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                💡 Tip: Hover vào các trường để xem thêm tùy chọn
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="px-6">
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-6">
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending
                    ? t("common.saving")
                    : t("common.save")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
