"use client";

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface StructuredDataProps {
  type?: "website" | "software" | "webapp";
  pageType?: "homepage" | "feature" | "dashboard";
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  type = "software", 
  pageType = "homepage" 
}) => {
  const { t } = useLanguage();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === "software" ? "SoftwareApplication" : "WebSite",
      name: "Resumate",
      description: t("seo.schema.mainDescription"),
      url: baseUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "1250"
      },
      keywords: t("seo.schema.keywords"),
      inLanguage: ["vi-VN", "en-US"],
      author: {
        "@type": "Organization",
        name: "Resumate Team",
        url: baseUrl
      },
      publisher: {
        "@type": "Organization",
        name: "Resumate",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`
        }
      }
    };

    if (type === "software") {
      return {
        ...baseData,
        "@type": "SoftwareApplication",
        featureList: [
          t("seo.schema.features.aiCvGeneration"),
          t("seo.schema.features.cvTemplates"),
          t("seo.schema.features.portfolioBuilder"),
          t("seo.schema.features.jobTailorAuto"),
          t("seo.schema.features.exportFormats"),
          t("seo.schema.features.analyticsTracking")
        ],
        screenshot: `${baseUrl}/screenshot.jpg`,
        softwareVersion: "1.0.0",
        releaseNotes: t("seo.schema.releaseNotes")
      };
    }

    if (pageType === "homepage") {
      return {
        ...baseData,
        "@type": "WebSite",
        potentialAction: {
          "@type": "SearchAction",
          target: `${baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        mainEntity: {
          "@type": "SoftwareApplication",
          name: "Resumate CV Builder",
          description: t("seo.schema.homepageDescription")
        }
      };
    }

    return baseData;
  };

  const structuredData = getStructuredData();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
};

export default StructuredData;
