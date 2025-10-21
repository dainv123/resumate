"use client";

import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CvManager from "@/components/cv/CvManager";
import CVUpload from "@/components/cv/CVUpload";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  Plus,
  Settings,
  Download,
  Upload,
  Search,
  SortAsc,
  SortDesc,
  Grid,
  List,
} from "lucide-react";
import { cvApi } from "@/lib/cv";

export default function CVPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [mode, setMode] = useState<"paginated" | "infinite">("paginated");
  const [selectedCv, setSelectedCv] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "updatedAt" | "originalFileName"
  >("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Handlers
  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    // Refresh CV list will be handled by CvManager
  };

  const handleUploadError = (error: string) => {
    console.error("Upload error:", error);
    // Could show toast notification here
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Get all CVs first
      const cvs = await cvApi.getUserCvs();

      // Export each CV (this is a simplified approach)
      for (const cv of cvs) {
        try {
          const blob = await cvApi.exportToPDF(cv.id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${cv.originalFileName}_export.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } catch (error) {
          console.error(`Failed to export CV ${cv.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Export all failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateNewCv = () => {
    router.push("/dashboard/ai-wizard");
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search will be handled by the CvManager component
  };

  return (
    <DashboardLayout
      title={t("cv.cvManagement")}
      subtitle={t("cv.subtitle")}
      showBackButton={false}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4">
          {/* Top Row: Mode Selection + Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={mode === "paginated" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setMode("paginated")}
                  className="text-sm">
                  {t("cv.pagination")}
                </Button>
                <Button
                  variant={mode === "infinite" ? "outline" : "default"}
                  size="sm"
                  onClick={() => setMode("infinite")}
                  className="text-sm">
                  {t("cv.infiniteScroll")}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowUploadModal(true)}>
                <Upload className="h-4 w-4" />
                <span>{t("cv.uploadCV")}</span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={handleExportAll}
                disabled={isExporting}>
                <Download className="h-4 w-4" />
                <span>
                  {isExporting ? t("common.loading") : t("cv.exportAll")}
                </span>
              </Button>
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                onClick={() => setShowSettingsModal(true)}>
                <Settings className="h-4 w-4" />
                <span>Settings </span>
              </Button>
              <Button
                className="flex items-center space-x-2"
                onClick={handleCreateNewCv}>
                <Plus className="h-4 w-4" />
                <span>{t("cv.createNewCv")}</span>
              </Button>
            </div>
          </div>

          {/* Search and Sort Controls */}
          <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder={t("dashboard.searchCvsPlaceholder")}
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
                  <option value="updatedAt">
                    {t("dashboard.sortByUpdatedAt")}
                  </option>
                  <option value="createdAt">
                    {t("dashboard.sortByCreatedAt")}
                  </option>
                  <option value="originalFileName">
                    {t("dashboard.sortByFileName")}
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
                    {sortOrder === "asc"
                      ? t("dashboard.sortAsc")
                      : t("dashboard.sortDesc")}
                  </span>
                </Button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex items-center space-x-1">
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex items-center space-x-1">
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CV Manager */}
        <CvManager
          mode={mode}
          onSelectCv={setSelectedCv}
          selectedCvId={selectedCv?.id}
          showControls={false}
          limit={12}
          search={search}
          sortBy={sortBy}
          sortOrder={sortOrder}
          viewMode={viewMode}
        />

        {/* Quick Stats */}
        {/* {selectedCv && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t("cv.cvDetails")}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>{t("cv.file")}:</strong> {selectedCv.originalFileName}
                </p>
                <p>
                  <strong>{t("cv.version")}:</strong> {selectedCv.version}
                </p>
                <p>
                  <strong>{t("cv.type")}:</strong>{" "}
                  {selectedCv.isTailored ? "Tailored" : "Original"}
                </p>
                <p>
                  <strong>{t("cv.created")}:</strong>{" "}
                  {new Date(selectedCv.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t("cv.actions")}
              </h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.viewCV")}
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.editCV")}
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.duplicateCV")}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-2">Export</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.exportPDF")}
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.exportWord")}
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  {t("cv.exportATS")}
                </Button>
              </div>
            </div>
          </div>
        )} */}

        {/* Help Section */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3">CV Management Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Pagination Mode:</h4>
              <ul className="space-y-1">
                <li>• Use for precise navigation</li>
                <li>• Better for large datasets</li>
                <li>• SEO-friendly URLs</li>
                <li>• Lower memory usage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Infinite Scroll Mode:</h4>
              <ul className="space-y-1">
                <li>• Seamless browsing experience</li>
                <li>• Auto-loads more content</li>
                <li>• Mobile-friendly</li>
                <li>• Modern UX pattern</li>
              </ul>
            </div>
          </div>
        </div> */}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload CV">
        <CVUpload onSuccess={handleUploadSuccess} onError={handleUploadError} />
      </Modal>

      {/* Settings Modal */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="CV Settings">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Display Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Show version history
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Show tailored CVs separately
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Auto-save changes
              </label>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Export Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" defaultChecked />
                Include metadata in exports
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                Auto-download after export
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsModal(false)}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
