"use client";

import React from "react";

interface StructuredDataProps {
  type?: "website" | "software" | "webapp";
  pageType?: "homepage" | "feature" | "dashboard";
}

const StructuredData: React.FC<StructuredDataProps> = ({ 
  type = "software", 
  pageType = "homepage" 
}) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === "software" ? "SoftwareApplication" : "WebSite",
      name: "Resumate",
      description: "AI tạo CV chuyên nghiệp từ Job Description chỉ trong 30 giây. Không cần upload CV cũ, chỉ cần paste JD là có CV hoàn chỉnh!",
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
      keywords: "tạo CV nhanh, AI CV, CV 30 giây, tạo CV online, AI tạo CV, CV từ Job Description, CV chuyên nghiệp",
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
          "AI tạo CV từ Job Description",
          "CV templates chuyên nghiệp", 
          "Portfolio builder",
          "Job tailor tự động",
          "Export đa định dạng (PDF, Word, ATS)",
          "Analytics và tracking"
        ],
        screenshot: `${baseUrl}/screenshot.jpg`,
        softwareVersion: "1.0.0",
        releaseNotes: "Phiên bản đầu tiên với AI CV Wizard và Template Gallery"
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
          description: "AI tạo CV nhanh trong 30 giây"
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
