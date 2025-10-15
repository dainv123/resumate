import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PerformanceOptimizer from "@/components/ui/PerformanceOptimizer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: "Resumate - Update CV in 1 Minute | Cập nhật CV trong 1 phút",
    template: "%s | Resumate",
  },
  description:
    "AI-powered CV & Portfolio builder for freelancers. Update your CV automatically from new projects or job descriptions. Tạo CV chuyên nghiệp với AI, tối ưu hóa cho từ khóa công việc.",
  keywords: [
    // English keywords
    "CV builder",
    "Resume builder",
    "Portfolio builder",
    "Freelancer tools",
    "AI CV generator",
    "CV maker online",
    "Professional resume",
    "Job application",
    "Career tools",
    "CV optimization",
    "Resume templates",
    "Portfolio website",
    // Vietnamese keywords
    "Tạo CV",
    "CV online",
    "AI CV",
    "CV chuyên nghiệp",
    "Portfolio online",
    "Freelancer Việt Nam",
    "Tìm việc",
    "Ứng tuyển",
    "CV đẹp",
    "Mẫu CV",
  ],
  authors: [{ name: "Resumate Team" }],
  creator: "Resumate",
  publisher: "Resumate",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "Resumate - AI CV Builder | Tạo CV với AI",
    description:
      "AI-powered CV & Portfolio builder. Create professional resumes automatically. Tạo CV chuyên nghiệp với AI, tối ưu hóa cho từ khóa công việc.",
    url: "/",
    siteName: "Resumate",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Resumate - AI CV Builder | Tạo CV với AI",
      },
    ],
    locale: "en_US",
    type: "website",
    alternateLocale: ["vi_VN"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumate - AI CV Builder | Tạo CV với AI",
    description:
      "AI-powered CV & Portfolio builder. Create professional resumes automatically. Tạo CV chuyên nghiệp với AI.",
    images: ["/og-image.jpg"],
    creator: "@resumate",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Karla:wght@300;400;500;600;700&family=Kristi&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Resumate" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Resumate",
              alternateName: "Resumate - AI CV Builder",
              description:
                "AI-powered CV & Portfolio builder for freelancers. Tạo CV chuyên nghiệp với AI, tối ưu hóa cho từ khóa công việc.",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              inLanguage: ["en", "vi"],
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
              creator: {
                "@type": "Organization",
                name: "Resumate Team",
                url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              },
              featureList: [
                "AI-powered CV generation",
                "Automatic CV optimization",
                "Portfolio management",
                "Job description integration",
                "Tạo CV tự động với AI",
                "Tối ưu hóa CV cho từ khóa công việc",
                "Quản lý Portfolio",
                "Tích hợp với Job Description",
              ],
              audience: {
                "@type": "Audience",
                audienceType: "Freelancers, Job Seekers, Professionals",
              },
              keywords:
                "CV builder, Resume builder, AI CV, Portfolio, Freelancer tools, Tạo CV, CV online, CV chuyên nghiệp",
            }),
          }}
        />
      </head>
      <body>
        <GoogleAnalytics />
        <PerformanceOptimizer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
