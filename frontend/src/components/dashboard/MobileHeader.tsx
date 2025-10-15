"use client";

import React from "react";
import { Menu, X, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface MobileHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function MobileHeader({
  isSidebarOpen,
  onToggleSidebar,
}: MobileHeaderProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-main" />
          <span className="ml-2 text-lg font-bold text-dark font-inter">
            Resumate
          </span>
        </div>

        {/* Right side - Language switcher and menu toggle */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher className="scale-90" />
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md text-main hover:bg-gray-100 transition-colors"
            aria-label={isSidebarOpen ? "Đóng menu" : "Mở menu"}>
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* User info bar - only show if user is logged in */}
      {user && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {user?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-dark font-karla truncate">
                {user?.name}
              </p>
              <p className="text-xs text-main truncate">{user?.email}</p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue text-white">
              {user?.plan === "free" ? "Free" : "Pro"}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
