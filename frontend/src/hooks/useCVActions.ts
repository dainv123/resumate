import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cvApi, CV } from "@/lib/cv";

/**
 * Custom hook for CV actions
 * SRP: Handles all CV operations (edit, delete, duplicate, export, tailor)
 * Reusable: Can use this hook anywhere (dashboard, list, detail page, etc.)
 */
export const useCVActions = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const queryClient = useQueryClient();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: cvApi.deleteCv,
    onSuccess: () => {
      showSuccess(t("dashboard.deleteCvSuccess"));
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
    onError: () => {
      showError(t("dashboard.deleteCvFailed"));
    },
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: cvApi.duplicateCv,
    onSuccess: () => {
      showSuccess(t("dashboard.duplicateCvSuccess"));
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
    onError: () => {
      showError(t("dashboard.duplicateCvFailed"));
    },
  });

  const handleEdit = (cvId: string) => {
    router.push(`/dashboard/cv/${cvId}/edit`);
  };

  const handleDelete = (cvId: string) => {
    deleteMutation.mutate(cvId);
  };

  const handleDuplicate = (cvId: string) => {
    duplicateMutation.mutate(cvId);
  };

  const handleTailor = (cvId: string) => {
    router.push(`/dashboard/cv/${cvId}`);
  };

  const handleExport = async (
    cvId: string,
    cvs: CV[],
    format: "pdf" | "word" | "ats",
    template = "professional"
  ) => {
    try {
      let blob: Blob;
      let filename: string;
      const cv = cvs.find((c) => c.id === cvId);
      if (!cv) return;

      switch (format) {
        case "pdf":
          blob = await cvApi.exportToPDF(cvId, template);
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}.pdf`;
          break;
        case "word":
          blob = await cvApi.exportToWord(cvId);
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}.docx`;
          break;
        case "ats":
          blob = await cvApi.exportToATS(cvId);
          filename = `${cv.originalFileName.replace(/\.[^/.]+$/, "")}_ats.txt`;
          break;
      }

      // Download file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(t("dashboard.exportCvSuccess"));
    } catch (error) {
      console.error("Export failed:", error);
      showError(t("dashboard.exportCvFailed"));
    }
  };

  return {
    handleEdit,
    handleDelete,
    handleDuplicate,
    handleTailor,
    handleExport,
    deleteMutation,
    duplicateMutation,
  };
};
