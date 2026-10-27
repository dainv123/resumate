"use client";

import React, { useState, useRef, useCallback } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useCvsPaginated, useCvsInfinite } from "@/hooks/useCvs";
import { cvApi, PaginatedResult, CV } from "@/lib/cv";
import CVCard from "./CVCard";
import RenameCvModal from "./RenameCvModal";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { Search, SortAsc, SortDesc, Grid, List, Trash2 } from "lucide-react";

interface CvManagerProps {
  mode?: "paginated" | "infinite";
  onSelectCv?: (cv: any) => void;
  selectedCvId?: string;
  showControls?: boolean;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "originalFileName";
  sortOrder?: "ASC" | "DESC";
  viewMode?: "grid" | "list";
}

interface CvListContentProps {
  mode: "paginated" | "infinite";
  onSelectCv?: (cv: any) => void;
  selectedCvId?: string;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  viewMode?: "grid" | "list";
  selectedIds: Set<string>;
  onToggleSelect: (cvId: string) => void;
  onSelectAll: (cvIds: string[]) => void;
  onClearSelection: () => void;
  onBulkDelete: (cvIds: string[]) => Promise<void>;
  isBulkDeleting: boolean;
  onEditCv?: (cvId: string) => void;
  onRenameCv?: (cv: CV) => void;
  onDeleteCv?: (cvId: string) => void;
  onDuplicateCv?: (cvId: string) => void;
  onTailorCv?: (cvId: string) => void;
  onExportCv?: (
    cvId: string,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => void;
}

function CvListContent({
  mode,
  onSelectCv,
  limit,
  search,
  sortBy,
  sortOrder,
  viewMode = "grid",
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  isBulkDeleting,
  onEditCv,
  onRenameCv,
  onDeleteCv,
  onDuplicateCv,
  onTailorCv,
  onExportCv,
}: CvListContentProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const paginatedQuery = useCvsPaginated({
    page: currentPage,
    limit,
    search,
    sortBy,
    sortOrder:
      sortOrder === "DESC" ? "DESC" : sortOrder === "ASC" ? "ASC" : sortOrder,
  });

  const infiniteQuery = useCvsInfinite({
    limit,
    search,
    sortBy,
    sortOrder:
      sortOrder === "DESC" ? "DESC" : sortOrder === "ASC" ? "ASC" : sortOrder,
  });

  const { data, isLoading, error, refetch } =
    mode === "paginated" ? paginatedQuery : infiniteQuery;

  const cvs = React.useMemo(() => {
    if (mode === "paginated") {
      const paginatedData = data as PaginatedResult<CV>;
      return paginatedData?.data || [];
    }
    const infiniteData = data as InfiniteData<PaginatedResult<CV>>;
    return infiniteData?.pages?.flatMap((page) => page.data) || [];
  }, [mode, data]);

  const visibleIds = React.useMemo(() => cvs.map((cv) => cv.id), [cvs]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const selectedCount = selectedIds.size;

  const lastCvElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (infiniteQuery.isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && infiniteQuery.hasNextPage) {
            infiniteQuery.fetchNextPage();
          }
        },
        { rootMargin: "100px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [infiniteQuery]
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-2">⚠️</div>
        <p className="text-red-800">Failed to load CVs</p>
        <Button onClick={() => refetch()} className="mt-4" variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (
    !data ||
    (mode === "paginated"
      ? (data as PaginatedResult<CV>).data.length === 0
      : (data as InfiniteData<PaginatedResult<CV>>).pages[0]?.data.length === 0)
  ) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
        <div className="text-4xl mb-3">📄</div>
        <h5 className="text-lg font-medium text-yellow-800 mb-2">
          {t("cv.noCvs")}
        </h5>
        <p className="text-yellow-600">{t("cv.noCvsDescription")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-select toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={() =>
                allVisibleSelected
                  ? onClearSelection()
                  : onSelectAll(visibleIds)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              {allVisibleSelected
                ? t("common.deselectAll")
                : t("common.selectAll")}
            </span>
          </label>
          {selectedCount > 0 && (
            <span className="text-sm text-gray-600">
              {t("cv.selectedCount", { count: selectedCount })}
            </span>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isBulkDeleting}>
              {t("dashboard.clearSelection")}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete(Array.from(selectedIds))}
              disabled={isBulkDeleting}
              loading={isBulkDeleting}
              className="flex items-center space-x-1">
              <Trash2 className="h-4 w-4" />
              <span>{t("cv.deleteSelected")}</span>
            </Button>
          </div>
        )}
      </div>

      {/* CV Display */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr"
            : "space-y-4"
        }>
        {cvs.map((cv: CV, index: number) => (
          <div
            key={cv.id}
            ref={
              mode === "infinite" && index === cvs.length - 1
                ? lastCvElementRef
                : null
            }
            className="h-full">
            <CVCard
              cv={cv}
              isSelected={selectedIds.has(cv.id)}
              onToggleSelect={() => onToggleSelect(cv.id)}
              onSelect={() => onSelectCv?.(cv)}
              onEdit={() => onEditCv?.(cv.id)}
              onRename={() => onRenameCv?.(cv)}
              onDelete={() => onDeleteCv?.(cv.id)}
              onDuplicate={() => onDuplicateCv?.(cv.id)}
              onTailor={() => onTailorCv?.(cv.id)}
              onExport={(format, template) =>
                onExportCv?.(cv.id, format, template)
              }
              viewMode={viewMode}
            />
          </div>
        ))}
      </div>

      {/* Pagination for paginated mode */}
      {mode === "paginated" && (
        <div className="space-y-4">
          {(data as PaginatedResult<CV>)?.totalPages &&
            (data as PaginatedResult<CV>).totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(
                    currentPage * limit,
                    (data as PaginatedResult<CV>)?.total || 0
                  )}{" "}
                  of {(data as PaginatedResult<CV>)?.total || 0} CVs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of{" "}
                    {(data as PaginatedResult<CV>)?.totalPages || 0}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          (data as PaginatedResult<CV>)?.totalPages || 1,
                          prev + 1
                        )
                      )
                    }
                    disabled={
                      currentPage ===
                      ((data as PaginatedResult<CV>)?.totalPages || 1)
                    }>
                    Next
                  </Button>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Load More for infinite mode */}
      {mode === "infinite" && (
        <div className="flex flex-col items-center space-y-4">
          {infiniteQuery.hasNextPage && (
            <Button
              variant="outline"
              onClick={() => infiniteQuery.fetchNextPage()}
              disabled={infiniteQuery.isFetchingNextPage}
              className="min-w-32">
              {infiniteQuery.isFetchingNextPage ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                "Manual Load More"
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CvManager({
  mode = "paginated",
  onSelectCv,
  selectedCvId,
  showControls = true,
  limit = 12,
  search: externalSearch,
  sortBy: externalSortBy,
  sortOrder: externalSortOrder,
  viewMode: externalViewMode,
}: CvManagerProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState(externalSearch || "");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "originalFileName"
  >(externalSortBy || "updatedAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">(
    externalSortOrder || "DESC"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    externalViewMode || "grid"
  );
  const [selectedCv, setSelectedCv] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [renamingCv, setRenamingCv] = useState<CV | null>(null);

  React.useEffect(() => {
    if (externalSearch !== undefined) setSearch(externalSearch);
  }, [externalSearch]);

  React.useEffect(() => {
    if (externalSortBy !== undefined) setSortBy(externalSortBy);
  }, [externalSortBy]);

  React.useEffect(() => {
    if (externalSortOrder !== undefined) {
      setSortOrder((externalSortOrder as any) === "asc" ? "ASC" : "DESC");
    }
  }, [externalSortOrder]);

  React.useEffect(() => {
    if (externalViewMode !== undefined) setViewMode(externalViewMode);
  }, [externalViewMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  const handleSelectCv = (cv: any) => {
    setSelectedCv(cv);
    onSelectCv?.(cv);
  };

  const handleToggleSelect = (cvId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(cvId)) next.delete(cvId);
      else next.add(cvId);
      return next;
    });
  };

  const handleSelectAll = (cvIds: string[]) => {
    setSelectedIds(new Set(cvIds));
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const invalidateCvs = () => {
    queryClient.invalidateQueries({ queryKey: ["cvs"] });
  };

  const handleEditCv = (cvId: string) => {
    router.push(`/dashboard/cv/${cvId}/edit`);
  };

  const handleRenameCv = async (name: string) => {
    if (!renamingCv) return;
    try {
      await cvApi.updateCv(renamingCv.id, { originalFileName: name });
      invalidateCvs();
      showSuccess(t("cv.renameSuccess"));
    } catch (error) {
      console.error("Rename CV failed:", error);
      showError(t("cv.renameFailed"));
      throw error;
    }
  };

  const handleDeleteCv = async (cvId: string) => {
    if (!window.confirm(t("dashboard.deleteCvConfirm"))) return;
    try {
      await cvApi.deleteCv(cvId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(cvId);
        return next;
      });
      invalidateCvs();
      showSuccess(t("dashboard.deleteCvSuccess"));
    } catch (error) {
      console.error("Delete CV failed:", error);
      showError(t("dashboard.deleteCvFailed"));
    }
  };

  const handleBulkDelete = async (cvIds: string[]) => {
    if (
      !window.confirm(t("cv.deleteSelectedConfirm", { count: cvIds.length }))
    ) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        cvIds.map((id) => cvApi.deleteCv(id))
      );
      const failed = results.filter((r) => r.status === "rejected").length;
      const succeeded = cvIds.length - failed;

      invalidateCvs();
      setSelectedIds(new Set());

      if (failed === 0) {
        showSuccess(t("cv.deleteSelectedSuccess", { count: succeeded }));
      } else if (succeeded === 0) {
        showError(t("cv.deleteSelectedFailed"));
      } else {
        showError(
          t("cv.deleteSelectedPartial", {
            succeeded,
            failed,
          })
        );
      }
    } catch (error) {
      console.error("Bulk delete CV failed:", error);
      showError(t("cv.deleteSelectedFailed"));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDuplicateCv = async (cvId: string) => {
    try {
      await cvApi.duplicateCv(cvId);
      invalidateCvs();
      showSuccess(t("dashboard.duplicateCvSuccess"));
    } catch (error) {
      console.error("Duplicate CV failed:", error);
      showError(t("dashboard.duplicateCvFailed"));
    }
  };

  const handleTailorCv = (cvId: string) => {
    router.push(`/dashboard/job-tailor?cvId=${cvId}`);
  };

  const handleExportCv = async (
    cvId: string,
    format: "pdf" | "word" | "ats",
    template?: string
  ) => {
    try {
      let blob: Blob;

      switch (format) {
        case "pdf":
          blob = await cvApi.exportToPDF(cvId, template);
          break;
        case "word":
          blob = await cvApi.exportToWord(cvId);
          break;
        case "ats":
          blob = await cvApi.exportToATS(cvId);
          break;
        default:
          throw new Error("Unsupported export format");
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv_${cvId}.${format === "word" ? "docx" : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export failed:", error);
      showError(t("cv.exportCvFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {showControls && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder={t("cv.searchCvsPlaceholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="updatedAt">{t("cv.sortByUpdatedAt")}</option>
                <option value="createdAt">{t("cv.sortByCreatedAt")}</option>
                <option value="originalFileName">
                  {t("cv.sortByFileName")}
                </option>
              </select>

              <Button
                variant="outline"
                onClick={toggleSortOrder}
                className="flex items-center space-x-1">
                {sortOrder === "ASC" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span>
                  {sortOrder === "ASC" ? t("cv.sortAsc") : t("cv.sortDesc")}
                </span>
              </Button>
            </div>

            <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center space-x-1">
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center space-x-1">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <CvListContent
        mode={mode}
        onSelectCv={handleSelectCv}
        selectedCvId={selectedCvId || selectedCv?.id}
        limit={limit}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onEditCv={handleEditCv}
        onRenameCv={setRenamingCv}
        onDeleteCv={handleDeleteCv}
        onDuplicateCv={handleDuplicateCv}
        onTailorCv={handleTailorCv}
        onExportCv={handleExportCv}
      />

      <RenameCvModal
        isOpen={!!renamingCv}
        currentName={renamingCv?.originalFileName || ""}
        onClose={() => setRenamingCv(null)}
        onSave={handleRenameCv}
      />
    </div>
  );
}
