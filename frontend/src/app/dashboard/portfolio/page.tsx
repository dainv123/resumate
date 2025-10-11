"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { portfolioApi, CreatePortfolioData } from "@/lib/portfolio";
import Button from "@/components/ui/Button";
import { Eye, Share2, Check, ChevronRight, ChevronLeft } from "lucide-react";
import TemplateSelector, {
  type TemplateConfig,
} from "@/components/portfolio/TemplateSelector";
import CvSelector from "@/components/portfolio/CvSelector";
import SectionCustomizer from "@/components/portfolio/SectionCustomizer";

type Step = 1 | 2 | 3 | 4;

export default function PortfolioPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig | null>(
    null
  );
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [customSections, setCustomSections] = useState<any>({});
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  // Results
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  // Check existing portfolio
  const { data: existingPortfolio } = useQuery({
    queryKey: ["portfolio", "check"],
    queryFn: portfolioApi.checkPortfolio,
  });

  // Preview mutation
  const previewMutation = useMutation({
    mutationFn: portfolioApi.generatePortfolioHTML,
    onSuccess: (data) => {
      setPreviewHtml(data.html);
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: portfolioApi.savePortfolio,
    onSuccess: (data) => {
      setPortfolioUrl(data.generatedUrl);
    },
  });

  const handleTemplateSelect = (templateId: string, config: TemplateConfig) => {
    setSelectedTemplate(templateId);
    setTemplateConfig(config);
    setCustomSections({}); // Reset custom sections when changing template
  };

  const handlePreview = () => {
    const data: CreatePortfolioData = {
      template: selectedTemplate as any,
      selectedCvId: selectedCvId || undefined,
      customSections:
        Object.keys(customSections).length > 0 ? customSections : undefined,
      bio: bio || undefined,
      avatar: avatar || undefined,
      linkedinUrl: linkedinUrl || undefined,
      githubUrl: githubUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      customDomain: customDomain || undefined,
    };

    previewMutation.mutate(data);
  };

  const handleSave = () => {
    const data: CreatePortfolioData = {
      template: selectedTemplate as any,
      selectedCvId: selectedCvId || undefined,
      customSections:
        Object.keys(customSections).length > 0 ? customSections : undefined,
      bio: bio || undefined,
      avatar: avatar || undefined,
      linkedinUrl: linkedinUrl || undefined,
      githubUrl: githubUrl || undefined,
      websiteUrl: websiteUrl || undefined,
      customDomain: customDomain || undefined,
    };

    saveMutation.mutate(data);
  };

  const handlePreviewInNewTab = () => {
    if (previewHtml) {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(previewHtml);
        newWindow.document.close();
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
    alert("Copied to clipboard!");
  };

  const canProceedToStep = (step: Step): boolean => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!selectedTemplate;
      case 3:
        return !!selectedTemplate && !!selectedCvId;
      case 4:
        return !!selectedTemplate && !!selectedCvId;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: "Template" },
      { number: 2, label: "CV" },
      { number: 3, label: "Customize" },
      { number: 4, label: "Details" },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                currentStep === step.number
                  ? "border-blue-600 bg-blue-600 text-white"
                  : currentStep > step.number
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-gray-300 text-gray-400"
              }`}>
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="font-semibold">{step.number}</span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 ${
                  currentStep > step.number ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
          />
        );

      case 2:
        return (
          <CvSelector
            selectedCvId={selectedCvId}
            onSelectCv={setSelectedCvId}
          />
        );

      case 3:
        return templateConfig ? (
          <SectionCustomizer
            templateConfig={templateConfig}
            customSections={customSections}
            onCustomSectionsChange={setCustomSections}
          />
        ) : null;

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold mb-2">Personal Details</h4>
              <p className="text-gray-600">Add your bio and social links</p>
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 mb-2">
                Bio / Tagline
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Software Engineer | Full-stack Developer | Tech Enthusiast"
              />
            </div>

            {/* Avatar */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                id="avatar"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/your-photo.jpg"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="linkedinUrl"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>

              <div>
                <label
                  htmlFor="githubUrl"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/yourname"
                />
              </div>

              <div>
                <label
                  htmlFor="websiteUrl"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  id="websiteUrl"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <label
                  htmlFor="customDomain"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Domain (Optional)
                </label>
                <input
                  type="text"
                  id="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="portfolio.yourname.com"
                />
              </div>
            </div>

            {/* Preview & Save Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                loading={previewMutation.isPending}
                className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                loading={saveMutation.isPending}
                className="flex-1">
                <Check className="w-4 h-4 mr-2" />
                Save & Publish
              </Button>
            </div>

            {/* Preview Modal */}
            {previewHtml && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-green-900">
                      Preview Ready!
                    </h5>
                    <p className="text-sm text-green-700">
                      Your portfolio is ready to view
                    </p>
                  </div>
                  <Button onClick={handlePreviewInNewTab} size="sm">
                    Open Preview
                  </Button>
                </div>
              </div>
            )}

            {/* Success Message */}
            {portfolioUrl && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">
                  Portfolio Published! 🎉
                </h5>
                <p className="text-sm text-blue-700 mb-3">
                  Your portfolio is now live and accessible at:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={portfolioUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(portfolioUrl)}
                    size="sm"
                    variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-3xl font-bold text-gray-900">Create Portfolio</h3>
        <p className="text-gray-600 mt-1">
          Build a professional portfolio to showcase your work and skills
        </p>
      </div>

      {/* Existing Portfolio Notice */}
      {existingPortfolio?.exists && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <h5 className="font-medium text-blue-900">
                You already have a portfolio
              </h5>
              <p className="text-sm text-blue-700 mt-1">
                Creating a new portfolio will override your existing one.
              </p>
              <a
                href={existingPortfolio.portfolio?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                View current portfolio →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={() =>
            setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
          }
          variant="outline"
          disabled={currentStep === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            onClick={() =>
              setCurrentStep((prev) => Math.min(4, prev + 1) as Step)
            }
            disabled={!canProceedToStep((currentStep + 1) as Step)}>
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <div className="text-sm text-gray-500">Complete the form above</div>
        )}
      </div>
    </div>
  );
}
