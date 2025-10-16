"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { memo } from "react";
import { FileText, Users, Briefcase, Sparkles } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

// Memoized Feature Card Component
const FeatureCard = memo(
  ({
    icon: Icon,
    title,
    description,
    iconColor,
  }: {
    icon: any;
    title: string;
    description: string;
    iconColor: string;
  }) => (
    <div className="portfolio-card text-center">
      <Icon
        className={`h-10 w-10 lg:h-12 lg:w-12 ${iconColor} mx-auto mb-3 lg:mb-4`}
      />
      <h3
        className="text-base lg:text-lg font-semibold mb-2"
        style={{ color: "var(--dark-color)" }}>
        {title}
      </h3>
      <p
        className="text-sm lg:text-base"
        style={{ color: "var(--main-color)" }}>
        {description}
      </p>
    </div>
  )
);

FeatureCard.displayName = "FeatureCard";

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  // Loading authentication state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-main"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-main" />
              <span className="ml-2 text-lg lg:text-2xl font-bold text-dark font-inter">
                Resumate
              </span>
            </div>
            <div className="flex items-center space-x-2 lg:space-x-4">
              <LanguageSwitcher className="scale-90 lg:scale-100" />
              {user ? (
                // User đã login → show Dashboard button
                <div className="elisc_tm_button">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/dashboard");
                    }}
                    className="text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3">
                    <span className="hidden sm:inline">Go to Dashboard →</span>
                    <span className="sm:hidden">Dashboard</span>
                  </a>
                </div>
              ) : (
                // User chưa login → show Login/Register
                <>
                  <div className="elisc_tm_button" data-style="border">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/auth/login");
                      }}
                      className="text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3">
                      {t("landing.login")}
                    </a>
                  </div>
                  <div className="elisc_tm_button">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/auth/register");
                      }}
                      className="text-sm lg:text-base px-3 lg:px-6 py-2 lg:py-3">
                      {t("landing.register")}
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="text-center">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6"
            style={{ color: "var(--dark-color)" }}
            dangerouslySetInnerHTML={{
              __html: t("landing.title")
                .replace("<span>", '<span class="blueColor">')
                .replace("</span>", "</span>"),
            }}></h1>
          <p
            className="text-lg lg:text-xl mb-6 lg:mb-8 max-w-3xl mx-auto px-4"
            style={{ color: "var(--main-color)" }}>
            {t("landing.subtitle")}
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="elisc_tm_button">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/auth/register");
                }}
                className="text-lg px-8 py-4">
                Bắt đầu miễn phí
              </a>
            </div>
            <div className="elisc_tm_button" data-style="border">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/auth/login");
                }}
                className="text-lg px-8 py-4">
                Đăng nhập
              </a>
            </div>
          </div> */}
        </div>

        {/* Features */}
        <div className="mt-12 lg:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <FeatureCard
            icon={FileText}
            title={t("landing.feature1Title")}
            description={t("landing.feature1Desc")}
            iconColor="blueColor"
          />
          <FeatureCard
            icon={Briefcase}
            title={t("landing.feature2Title")}
            description={t("landing.feature2Desc")}
            iconColor="yellowColor"
          />
          <FeatureCard
            icon={Sparkles}
            title={t("landing.feature3Title")}
            description={t("landing.feature3Desc")}
            iconColor="blueColor"
          />
          <FeatureCard
            icon={Users}
            title={t("landing.feature4Title")}
            description={t("landing.feature4Desc")}
            iconColor="yellowColor"
          />
        </div>

        {/* CTA Section */}
        <div className="mt-12 lg:mt-20 text-center portfolio-card p-6 lg:p-12">
          <h2
            className="text-2xl lg:text-3xl font-bold mb-4"
            style={{ color: "var(--dark-color)" }}>
            {user ? t("landing.ctaTitleLoggedIn") : t("landing.ctaTitle")}
          </h2>
          <p
            className="text-base lg:text-lg mb-6 lg:mb-8 px-4"
            style={{ color: "var(--main-color)" }}>
            {user ? t("landing.ctaSubtitleLoggedIn") : t("landing.ctaSubtitle")}
          </p>
          <div className="elisc_tm_button">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push(user ? "/dashboard" : "/auth/register");
              }}
              className="text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4">
              {user ? t("landing.ctaButtonLoggedIn") : t("landing.ctaButton")}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 lg:py-12"
        style={{ backgroundColor: "var(--dark-color)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 blueColor" />
            <span
              className="ml-2 text-lg lg:text-2xl font-bold"
              style={{ color: "#fff" }}>
              Resumate
            </span>
          </div>
          <p
            className="text-sm lg:text-base px-4"
            style={{ color: "var(--blue-color)" }}>
            {t("landing.footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
