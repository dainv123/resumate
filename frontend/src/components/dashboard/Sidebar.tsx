"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  Briefcase,
  Sparkles,
  Users,
  Settings,
  LogOut,
  User,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const homeNavigationItems = [{ key: "home", href: "/", icon: "" }];

const navigationItems = [
  { key: "dashboard", href: "/dashboard", icon: Home },
  { key: "myCV", href: "/dashboard/cv", icon: FileText },
  { key: "projects", href: "/dashboard/projects", icon: Briefcase },
  { key: "jobTailor", href: "/dashboard/job-tailor", icon: Sparkles },
  { key: "portfolio", href: "/dashboard/portfolio", icon: Users },
  { key: "analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const bottomNavigationItems = [
  { key: "settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg flex flex-col">
      {/* Logo - Fixed at top */}
      <Link
        href={homeNavigationItems[0].href}
        className="flex items-center px-6 py-4 border-b flex-shrink-0">
        <FileText className="h-8 w-8 text-main" />
        <span className="ml-2 text-xl font-bold text-dark font-inter">
          Resumate
        </span>
      </Link>

      {/* User Info - Fixed below logo */}
      <div className="px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {user?.avatar ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-dark font-karla">
              {user?.name}
            </p>
            <p className="text-xs text-main">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue text-white">
              {user?.plan === "free" ? "Free Plan" : "Pro Plan"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable middle section */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          // Simple exact match for active state
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors font-karla",
                isActive
                  ? "bg-blue text-white"
                  : "text-main hover:bg-gray-50 hover:text-dark"
              )}>
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-main group-hover:text-dark"
                )}
              />
              {t(`nav.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout - Fixed at bottom */}
      <div className="px-4 py-4 border-t space-y-1 flex-shrink-0">
        <div className="py-2">
          <LanguageSwitcher className=" w-full" />
        </div>
        {bottomNavigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              data-tour={item.key === "settings" ? "settings-nav" : undefined}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors font-karla",
                isActive
                  ? "bg-blue text-white"
                  : "text-main hover:bg-gray-50 hover:text-dark"
              )}>
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-main group-hover:text-dark"
                )}
              />
              {t(`nav.${item.key}`)}
            </Link>
          );
        })}
        <button
          onClick={logout}
          className="group flex items-center w-full px-3 py-2 text-sm font-medium text-main rounded-md hover:bg-gray-50 hover:text-dark font-karla transition-colors">
          <LogOut className="mr-3 h-5 w-5 text-main group-hover:text-dark" />
          {t("nav.logout")}
        </button>
      </div>
    </div>
  );
}
