"use client";

import React, { useState } from "react";
import Modal, { ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Palette, Layout, Eye, Download } from "lucide-react";
import { TemplateConfig } from "@/types/cv.types";
import { useToast } from "@/contexts/ToastContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface TemplateConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: TemplateConfig) => Promise<void>;
  currentTemplate?: string;
  cvId: string;
}

const TemplateConfigModal: React.FC<TemplateConfigModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const { showError } = useToast();
  const { t } = useLanguage();
  const [config, setConfig] = useState<TemplateConfig>({
    layout: "single-column",
    sections: {
      contact: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      awards: true,
      publications: true,
      volunteer: true,
      languages: true,
    },
    styling: {
      primaryColor: "#7c3aed",
      secondaryColor: "#5b21b6",
      fontFamily: "Inter, sans-serif",
      fontSize: "medium",
    },
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!onExport || typeof onExport !== "function") {
      console.error("onExport is not a function:", onExport);
      return;
    }

    setIsExporting(true);
    try {
      await onExport(config);
      onClose();
    } catch (error) {
      console.error("Export failed:", error);
      showError("Failed to export CV. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateSections = (section: string, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [section]: enabled,
      },
    }));
  };

  const updateStyling = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      styling: {
        ...prev.styling,
        [key]: value,
      },
    }));
  };

  const colorPresets = [
    {
      name: t("templateConfig.colorPresets.professionalBlue"),
      primary: "#2563eb",
      secondary: "#1d4ed8",
    },
    {
      name: t("templateConfig.colorPresets.purple"),
      primary: "#7c3aed",
      secondary: "#5b21b6",
    },
    {
      name: t("templateConfig.colorPresets.green"),
      primary: "#059669",
      secondary: "#047857",
    },
    {
      name: t("templateConfig.colorPresets.red"),
      primary: "#dc2626",
      secondary: "#b91c1c",
    },
    {
      name: t("templateConfig.colorPresets.orange"),
      primary: "#ea580c",
      secondary: "#c2410c",
    },
    {
      name: t("templateConfig.colorPresets.gray"),
      primary: "#374151",
      secondary: "#1f2937",
    },
  ];

  const fontOptions = [
    { name: t("templateConfig.fontOptions.inter"), value: "Inter, sans-serif" },
    {
      name: t("templateConfig.fontOptions.roboto"),
      value: "Roboto, sans-serif",
    },
    {
      name: t("templateConfig.fontOptions.openSans"),
      value: "Open Sans, sans-serif",
    },
    { name: t("templateConfig.fontOptions.lato"), value: "Lato, sans-serif" },
    {
      name: t("templateConfig.fontOptions.poppins"),
      value: "Poppins, sans-serif",
    },
    {
      name: t("templateConfig.fontOptions.sourceSansPro"),
      value: "Source Sans Pro, sans-serif",
    },
  ];

  const sectionLabels = {
    contact: t("templateConfig.sections.contact"),
    summary: t("templateConfig.sections.summary"),
    experience: t("templateConfig.sections.experience"),
    education: t("templateConfig.sections.education"),
    skills: t("templateConfig.sections.skills"),
    projects: t("templateConfig.sections.projects"),
    certifications: t("templateConfig.sections.certifications"),
    awards: t("templateConfig.sections.awards"),
    publications: t("templateConfig.sections.publications"),
    volunteer: t("templateConfig.sections.volunteer"),
    languages: t("templateConfig.sections.languages"),
  };

  const modalTitle = (
    <div className="flex items-center gap-2">
      <Layout className="h-6 w-6" />
      <h3>{t("templateConfig.title")}</h3>
    </div>
  );

  const modalFooter = (
    <ModalFooter className="w-full">
      <Button variant="outline" onClick={onClose} className="px-6">
        {t("templateConfig.buttons.cancel")}
      </Button>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-2 px-6">
        {isExporting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t("templateConfig.buttons.exporting")}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {t("templateConfig.buttons.exportPDF")}
          </>
        )}
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="2xl"
      closeOnOverlayClick={true}
      showCloseButton={true}>
      <div className="space-y-6">
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="layout" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              {t("templateConfig.tabs.layout")}
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t("templateConfig.tabs.sections")}
            </TabsTrigger>
            <TabsTrigger value="styling" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              {t("templateConfig.tabs.styling")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("templateConfig.layout.title")}</CardTitle>
                <CardDescription>
                  {t("templateConfig.layout.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="layout">
                    {t("templateConfig.layout.style")}
                  </Label>
                  <Select
                    value={config.layout}
                    onValueChange={(value) => updateConfig("layout", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-column">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-12 border-2 border-dashed rounded flex flex-col gap-1 p-1">
                            <div className="h-1 bg-gray-300 rounded"></div>
                            <div className="h-1 bg-gray-300 rounded"></div>
                            <div className="h-1 bg-gray-300 rounded"></div>
                          </div>
                          {t("templateConfig.layout.singleColumn")}
                        </div>
                      </SelectItem>
                      <SelectItem value="two-column">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-12 border-2 border-dashed rounded flex gap-1 p-1">
                            <div className="w-1/2 flex flex-col gap-1">
                              <div className="h-1 bg-gray-300 rounded"></div>
                              <div className="h-1 bg-gray-300 rounded"></div>
                            </div>
                            <div className="w-1/2 flex flex-col gap-1">
                              <div className="h-1 bg-gray-300 rounded"></div>
                              <div className="h-1 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                          {t("templateConfig.layout.twoColumn")}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {t("templateConfig.layout.preview")}
                  </h4>
                  <div
                    className={`${
                      config.layout === "two-column"
                        ? "grid grid-cols-2 gap-4"
                        : "space-y-2"
                    }`}>
                    <div className="h-4 bg-blue-200 rounded"></div>
                    <div className="h-4 bg-blue-200 rounded"></div>
                    <div className="h-4 bg-blue-200 rounded"></div>
                    {config.layout === "two-column" && (
                      <>
                        <div className="h-4 bg-blue-200 rounded"></div>
                        <div className="h-4 bg-blue-200 rounded"></div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("templateConfig.sections.title")}</CardTitle>
                <CardDescription>
                  {t("templateConfig.sections.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(sectionLabels).map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={key} className="font-medium">
                          {label}
                        </Label>
                        {/* {key === "contact" && (
                            <Badge
                              variant="secondary"
                              className="text-xs"></Badge>
                          )} */}
                      </div>
                      <Switch
                        id={key}
                        checked={
                          config.sections[key as keyof typeof config.sections]
                        }
                        onCheckedChange={(checked) =>
                          updateSections(key, checked)
                        }
                        disabled={key === "contact"} // Contact is always required
                      />
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900">
                    {t("templateConfig.sections.tips")}
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t("templateConfig.sections.tip1")}</li>
                    <li>• {t("templateConfig.sections.tip2")}</li>
                    <li>• {t("templateConfig.sections.tip3")}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("templateConfig.styling.title")}</CardTitle>
                <CardDescription>
                  {t("templateConfig.styling.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">
                      {t("templateConfig.styling.colorPresets")}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => {
                            updateStyling("primaryColor", preset.primary);
                            updateStyling("secondaryColor", preset.secondary);
                          }}
                          className={`p-3 border rounded-lg text-left hover:border-blue-500 transition-colors ${
                            config.styling.primaryColor === preset.primary
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: preset.primary,
                              }}></div>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor: preset.secondary,
                              }}></div>
                          </div>
                          <div className="text-sm font-medium">
                            {preset.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">
                        {t("templateConfig.styling.primaryColor")}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="primaryColor"
                          type="color"
                          value={config.styling.primaryColor}
                          onChange={(e) =>
                            updateStyling("primaryColor", e.target.value)
                          }
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.styling.primaryColor}
                          onChange={(e) =>
                            updateStyling("primaryColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border rounded"
                          placeholder="#7c3aed"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">
                        {t("templateConfig.styling.secondaryColor")}
                      </Label>
                      <div className="flex items-center gap-2">
                        <input
                          id="secondaryColor"
                          type="color"
                          value={config.styling.secondaryColor}
                          onChange={(e) =>
                            updateStyling("secondaryColor", e.target.value)
                          }
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.styling.secondaryColor}
                          onChange={(e) =>
                            updateStyling("secondaryColor", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border rounded"
                          placeholder="#5b21b6"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">
                      {t("templateConfig.styling.fontFamily")}
                    </Label>
                    <Select
                      value={config.styling.fontFamily}
                      onValueChange={(value) =>
                        updateStyling("fontFamily", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>
                              {font.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fontSize">
                      {t("templateConfig.styling.fontSize")}
                    </Label>
                    <Select
                      value={config.styling.fontSize}
                      onValueChange={(value) =>
                        updateStyling("fontSize", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">
                          {t("templateConfig.styling.small")}
                        </SelectItem>
                        <SelectItem value="medium">
                          {t("templateConfig.styling.medium")}
                        </SelectItem>
                        <SelectItem value="large">
                          {t("templateConfig.styling.large")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">
                    {t("templateConfig.styling.stylePreview")}
                  </h4>
                  <div
                    className="p-4 border rounded"
                    style={{
                      color: config.styling.primaryColor,
                      fontFamily: config.styling.fontFamily,
                      fontSize:
                        config.styling.fontSize === "small"
                          ? "14px"
                          : config.styling.fontSize === "large"
                          ? "18px"
                          : "16px",
                    }}>
                    <h3 className="font-bold mb-2">John Doe</h3>
                    <p className="text-sm opacity-80">Software Engineer</p>
                    <p className="text-sm mt-2">
                      {t("templateConfig.styling.previewText")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Modal>
  );
};

export default TemplateConfigModal;
