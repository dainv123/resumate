"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, Users, Briefcase, Sparkles } from "lucide-react";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-main" />
              <span className="ml-2 text-2xl font-bold text-dark font-inter">
                Resumate
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              {user ? (
                // User đã login → show Dashboard button
                <div className="elisc_tm_button">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/dashboard");
                    }}>
                    Go to Dashboard →
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
                      }}>
                      {t("landing.login")}
                    </a>
                  </div>
                  <div className="elisc_tm_button">
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push("/auth/register");
                      }}>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1
            className="text-4xl md:text-6xl font-bold mb-6"
            style={{ color: "var(--dark-color)" }}
            dangerouslySetInnerHTML={{
              __html: t("landing.title")
                .replace("<span>", '<span className="blueColor">')
                .replace("</span>", "</span>"),
            }}></h1>
          <p
            className="text-xl mb-8 max-w-3xl mx-auto"
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
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="portfolio-card text-center">
            <FileText className="h-12 w-12 blueColor mx-auto mb-4" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--dark-color)" }}>
              {t("landing.feature1Title")}
            </h3>
            <p style={{ color: "var(--main-color)" }}>
              {t("landing.feature1Desc")}
            </p>
          </div>

          <div className="portfolio-card text-center">
            <Briefcase className="h-12 w-12 yellowColor mx-auto mb-4" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--dark-color)" }}>
              {t("landing.feature2Title")}
            </h3>
            <p style={{ color: "var(--main-color)" }}>
              {t("landing.feature2Desc")}
            </p>
          </div>

          <div className="portfolio-card text-center">
            <Sparkles className="h-12 w-12 blueColor mx-auto mb-4" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--dark-color)" }}>
              {t("landing.feature3Title")}
            </h3>
            <p style={{ color: "var(--main-color)" }}>
              {t("landing.feature3Desc")}
            </p>
          </div>

          <div className="portfolio-card text-center">
            <Users className="h-12 w-12 yellowColor mx-auto mb-4" />
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "var(--dark-color)" }}>
              {t("landing.feature4Title")}
            </h3>
            <p style={{ color: "var(--main-color)" }}>
              {t("landing.feature4Desc")}
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center portfolio-card p-12">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--dark-color)" }}>
            {user ? t("landing.ctaTitleLoggedIn") : t("landing.ctaTitle")}
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--main-color)" }}>
            {user ? t("landing.ctaSubtitleLoggedIn") : t("landing.ctaSubtitle")}
          </p>
          <div className="elisc_tm_button">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push(user ? "/dashboard" : "/auth/register");
              }}
              className="text-lg px-8 py-4">
              {user ? t("landing.ctaButtonLoggedIn") : t("landing.ctaButton")}
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="py-12"
        style={{ backgroundColor: "var(--dark-color)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 blueColor" />
            <span className="ml-2 text-2xl font-bold" style={{ color: "#fff" }}>
              Resumate
            </span>
          </div>
          <p style={{ color: "var(--blue-color)" }}>{t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
