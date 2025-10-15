import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PerformanceOptimizer from "@/components/ui/PerformanceOptimizer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

export const metadata: Metadata = {
  title: {
    default: "Resumate - Update CV của bạn trong 1 phút",
    template: "%s | Resumate",
  },
  description:
    "Ứng dụng giúp freelancer cập nhật CV & Portfolio tự động từ project mới hoặc Job Description. Tạo CV chuyên nghiệp với AI, tối ưu hóa cho từ khóa công việc.",
  keywords: [
    "CV",
    "Resume",
    "Portfolio",
    "Freelancer",
    "Tạo CV",
    "CV online",
    "AI CV",
    "Job application",
    "Career",
    "Professional CV",
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
    title: "Resumate - Update CV của bạn trong 1 phút",
    description:
      "Ứng dụng giúp freelancer cập nhật CV & Portfolio tự động từ project mới hoặc Job Description",
    url: "/",
    siteName: "Resumate",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Resumate - Tạo CV chuyên nghiệp",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumate - Update CV của bạn trong 1 phút",
    description:
      "Ứng dụng giúp freelancer cập nhật CV & Portfolio tự động từ project mới hoặc Job Description",
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
              description:
                "Ứng dụng giúp freelancer cập nhật CV & Portfolio tự động từ project mới hoặc Job Description",
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "VND",
              },
              creator: {
                "@type": "Organization",
                name: "Resumate Team",
              },
              featureList: [
                "Tạo CV tự động với AI",
                "Tối ưu hóa CV cho từ khóa công việc",
                "Quản lý Portfolio",
                "Tích hợp với Job Description",
              ],
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
