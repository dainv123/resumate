"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  portfolioApi,
  PortfolioTemplate,
  CreatePortfolioData,
} from "@/lib/portfolio";
import Button from "@/components/ui/Button";
import { Users, Eye, Share2, Download, Sparkles } from "lucide-react";

export default function PortfolioPage() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplate>(
    PortfolioTemplate.MODERN
  );
  const [customDomain, setCustomDomain] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);

  const generateHtmlMutation = useMutation({
    mutationFn: portfolioApi.generatePortfolioHTML,
    onSuccess: (data) => {
      setGeneratedHtml(data.html);
    },
  });

  const generateUrlMutation = useMutation({
    mutationFn: portfolioApi.generatePortfolioUrl,
    onSuccess: (data) => {
      setPortfolioUrl(data.url);
    },
  });

  const handleGeneratePortfolio = () => {
    const data: CreatePortfolioData = {
      template: selectedTemplate,
      customDomain: customDomain || undefined,
      bio: bio || undefined,
      linkedinUrl: linkedinUrl || undefined,
      githubUrl: githubUrl || undefined,
      websiteUrl: websiteUrl || undefined,
    };

    generateHtmlMutation.mutate(data);
    generateUrlMutation.mutate({ customDomain: customDomain || undefined });
  };

  const handlePreview = () => {
    if (generatedHtml) {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(generatedHtml);
        newWindow.document.close();
      }
    }
  };

  const handleDownload = () => {
    if (generatedHtml) {
      const blob = new Blob([generatedHtml], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "portfolio.html";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleShare = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      alert("Portfolio URL copied to clipboard!");
    }
  };

  const templates = [
    {
      id: PortfolioTemplate.BASIC,
      name: "Basic",
      description: "Clean and simple design",
      preview: "bg-gray-100",
    },
    {
      id: PortfolioTemplate.MODERN,
      name: "Modern",
      description: "Contemporary with gradients",
      preview: "bg-gradient-to-br from-blue-100 to-purple-100",
    },
    {
      id: PortfolioTemplate.CREATIVE,
      name: "Creative",
      description: "Bold and artistic design",
      preview: "bg-gradient-to-br from-pink-100 to-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Portfolio</h3>
        <p className="text-gray-600">
          Create a professional portfolio to showcase your work
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration */}
        <div className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Template
            </label>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded ${template.preview}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {template.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Domain */}
          <div>
            <label
              htmlFor="customDomain"
              className="block text-sm font-medium text-gray-700">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              id="customDomain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="yourname.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use default URL: {user?.email?.split("@")[0]}
              .resumate.app
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="linkedinUrl"
                className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                id="linkedinUrl"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/in/yourname"
              />
            </div>

            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-gray-700">
                GitHub URL
              </label>
              <input
                type="url"
                id="githubUrl"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://github.com/yourname"
              />
            </div>

            <div>
              <label
                htmlFor="websiteUrl"
                className="block text-sm font-medium text-gray-700">
                Website URL
              </label>
              <input
                type="url"
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePortfolio}
            loading={
              generateHtmlMutation.isPending || generateUrlMutation.isPending
            }
            className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Portfolio
          </Button>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Portfolio URL */}
          {portfolioUrl && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Portfolio URL</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={portfolioUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          {generatedHtml && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Choose a template that matches your style</li>
              <li>• Add your bio and social links</li>
              <li>• Generate your portfolio automatically</li>
              <li>• Share the link or download the HTML</li>
            </ul>
          </div>

          {/* Features */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">
              Portfolio Features
            </h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Responsive design for all devices</li>
              <li>• Auto-generated from your CV and projects</li>
              <li>• Professional templates</li>
              <li>• Easy to share and embed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
