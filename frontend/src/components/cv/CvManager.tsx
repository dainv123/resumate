"use client";

import React, { useState, useRef, useCallback } from "react";
import { InfiniteData } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useCvsPaginated, useCvsInfinite } from "@/hooks/useCvs";
import { cvApi, PaginatedResult, CV } from "@/lib/cv";
import CVCard from "./CVCard";
import Button from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";
import { Search, SortAsc, SortDesc, Grid, List } from "lucide-react";

interface CvManagerProps {
  mode?: "paginated" | "infinite";
  onSelectCv?: (cv: any) => void;
  selectedCvId?: string;
  showControls?: boolean;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "originalFileName";
  sortOrder?: "asc" | "desc";
  viewMode?: "grid" | "list";
}

interface CvListContentProps {
  mode: "paginated" | "infinite";
  onSelectCv?: (cv: any) => void;
  selectedCvId?: string;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  viewMode?: "grid" | "list";
  onEditCv?: (cvId: string) => void;
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
  selectedCvId,
  limit,
  search,
  sortBy,
  sortOrder,
  viewMode = "grid",
  onEditCv,
  onDeleteCv,
  onDuplicateCv,
  onTailorCv,
  onExportCv,
}: CvListContentProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use appropriate hook based on mode
  const paginatedQuery = useCvsPaginated({
    page: currentPage,
    limit,
    search,
    sortBy,
    sortOrder:
      sortOrder === "desc" ? "DESC" : sortOrder === "asc" ? "ASC" : sortOrder,
  });

  const infiniteQuery = useCvsInfinite({
    limit,
    search,
    sortBy,
    sortOrder:
      sortOrder === "desc" ? "DESC" : sortOrder === "asc" ? "ASC" : sortOrder,
  });

  const { data, isLoading, error, refetch } =
    mode === "paginated" ? paginatedQuery : infiniteQuery;

  // Get CVs based on mode - MUST be before early returns
  const cvs = React.useMemo(() => {
    if (mode === "paginated") {
      const paginatedData = data as PaginatedResult<CV>;
      return paginatedData?.data || [];
    } else {
      // Infinite scroll mode
      const infiniteData = data as InfiniteData<PaginatedResult<CV>>;
      return infiniteData?.pages?.flatMap((page) => page.data) || [];
    }
  }, [mode, data]);

  // Auto-load more when scroll reaches the load more element - MUST be before early returns
  const lastCvElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (infiniteQuery.isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && infiniteQuery.hasNextPage) {
            console.log("Auto-loading more CVs...");
            infiniteQuery.fetchNextPage();
          }
        },
        {
          rootMargin: "100px", // Start loading 100px before the element comes into view
        }
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
      {/* CV Display */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
        {cvs.map((cv, index) => (
          <div
            key={cv.id}
            ref={
              mode === "infinite" && index === cvs.length - 1
                ? lastCvElementRef
                : null
            }>
            <CVCard
              cv={cv}
              isSelected={selectedCvId === cv.id}
              onSelect={() => onSelectCv?.(cv)}
              onEdit={() => onEditCv?.(cv.id)}
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
          {/* Debug info */}
          {/* <div className="text-xs text-gray-500">
            Current page: {currentPage} | Total pages: {data?.totalPages || 0} |
            Total items: {data?.total || 0} | Items per page: {limit}
          </div> */}

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
          {/* Debug info */}
          {/* <div className="text-xs text-gray-500">
            Pages loaded: {data?.pages?.length || 0} | Has next:{" "}
            {infiniteQuery.hasNextPage ? "Yes" : "No"} | Is fetching:{" "}
            {infiniteQuery.isFetchingNextPage ? "Yes" : "No"} | Auto-scroll:
            Enabled
          </div> */}

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

          {/* Loading indicator when auto-loading */}
          {/* {infiniteQuery.isFetchingNextPage && (
            <div className="text-sm text-blue-600">Loading more CVs...</div>
          )} */}

          {/* {!infiniteQuery.hasNextPage &&
            data?.pages &&
            data.pages.length > 0 && (
              <div className="text-sm text-gray-600">
                All CVs loaded ({cvs.length} total)
              </div>
            )} */}
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
  const { showSuccess, showError } = useToast();
  const [search, setSearch] = useState(externalSearch || "");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "originalFileName"
  >(externalSortBy || "updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    externalSortOrder || "desc"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">(
    externalViewMode || "grid"
  );
  const [selectedCv, setSelectedCv] = useState<any>(null);

  // Sync external props with internal state
  React.useEffect(() => {
    if (externalSearch !== undefined) setSearch(externalSearch);
  }, [externalSearch]);

  React.useEffect(() => {
    if (externalSortBy !== undefined) setSortBy(externalSortBy);
  }, [externalSortBy]);

  React.useEffect(() => {
    if (externalSortOrder !== undefined) setSortOrder(externalSortOrder);
  }, [externalSortOrder]);

  React.useEffect(() => {
    if (externalViewMode !== undefined) setViewMode(externalViewMode);
  }, [externalViewMode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will be handled by the list components
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSelectCv = (cv: any) => {
    setSelectedCv(cv);
    onSelectCv?.(cv);
  };

  // CV Action Handlers
  const handleEditCv = (cvId: string) => {
    router.push(`/dashboard/cv/${cvId}/edit`);
  };

  const handleDeleteCv = async (cvId: string) => {
    if (window.confirm(t("cv.deleteCvConfirm"))) {
      try {
        await cvApi.deleteCv(cvId);
        showSuccess(t("cv.deleteCvSuccess"));
      } catch (error) {
        console.error("Delete CV failed:", error);
        showError(t("cv.deleteCvFailed"));
      }
    }
  };

  const handleDuplicateCv = async (cvId: string) => {
    try {
      await cvApi.duplicateCv(cvId);
      showSuccess(t("cv.duplicateCvSuccess"));
    } catch (error) {
      console.error("Duplicate CV failed:", error);
      showError(t("cv.duplicateCvFailed"));
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

      // Create download link
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
      {/* Controls */}
      {showControls && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
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

            {/* Sort Controls */}
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
                {sortOrder === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                <span>
                  {sortOrder === "asc" ? t("cv.sortAsc") : t("cv.sortDesc")}
                </span>
              </Button>
            </div>

            {/* View Mode Toggle */}
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

      {/* Selected CV Info */}
      {/* {selectedCv && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-medium text-blue-900">
                {t("cv.selectedCv")}
              </h5>
              <p className="text-blue-800">
                <strong>{selectedCv.originalFileName}</strong> -{" "}
                {t("cv.version")} {selectedCv.version} -
                {selectedCv.version} -
                {selectedCv.isTailored
                  ? t("cv.tailored")
                  : t("cv.original")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCv(null)}
              className="text-blue-600 hover:text-blue-800">
              {t("cv.clearSelection")}
            </Button>
          </div>
        </div>
      )} */}

      {/* CV List */}
      <CvListContent
        mode={mode}
        onSelectCv={handleSelectCv}
        selectedCvId={selectedCvId || selectedCv?.id}
        limit={limit}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        onEditCv={handleEditCv}
        onDeleteCv={handleDeleteCv}
        onDuplicateCv={handleDuplicateCv}
        onTailorCv={handleTailorCv}
        onExportCv={handleExportCv}
      />

      {/* Mode Info */}
      {/* <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <h4 className="font-medium mb-2">
          {t("cv.currentMode")}:{" "}
          {mode === "paginated"
            ? t("cv.pagination")
            : t("cv.infiniteScroll")}
        </h4>
        <ul className="space-y-1">
          {mode === "paginated" ? (
            <>
              <li>
                • <strong>{t("cv.pageBased")}</strong>{" "}
                {t("cv.pageBasedDescription")}
              </li>
              <li>
                • <strong>{t("cv.controlledLoading")}</strong>{" "}
                {t("cv.controlledLoadingDescription")}
              </li>
              <li>
                • <strong>{t("cv.memoryEfficient")}</strong>{" "}
                {t("cv.memoryEfficientDescription")}
              </li>
              <li>
                • <strong>{t("cv.seoFriendly")}</strong>{" "}
                {t("cv.seoFriendlyDescription")}
              </li>
            </>
          ) : (
            <>
              <li>
                • <strong>{t("cv.seamlessScrolling")}</strong>{" "}
                {t("cv.seamlessScrollingDescription")}
              </li>
              <li>
                • <strong>{t("cv.autoLoading")}</strong>{" "}
                {t("cv.autoLoadingDescription")}
              </li>
              <li>
                • <strong>{t("cv.mobileFriendly")}</strong>{" "}
                {t("cv.mobileFriendlyDescription")}
              </li>
              <li>
                • <strong>{t("cv.modernUX")}</strong>{" "}
                {t("cv.modernUXDescription")}
              </li>
            </>
          )}
        </ul>
      </div> */}
    </div>
  );
}
