import {
  Home,
  Briefcase,
  FileText,
  FolderKanban,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

/** READ-ONLY route targets — presentation only; do not invent APIs. */
export const PRIMARY_NAV: AppNavItem[] = [
  { id: "today", label: "Today", href: "/dashboard", icon: Home },
  { id: "jobs", label: "Jobs", href: "/dashboard/job-tailor", icon: Briefcase },
  { id: "cvs", label: "CVs", href: "/dashboard/cv", icon: FileText },
  {
    id: "projects",
    label: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
  },
];

export const SECONDARY_NAV: AppNavItem[] = [
  { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const SIDEBAR_COLLAPSED_KEY = "resumate.sidebar.collapsed";
export const THEME_PREFERENCE_KEY = "resumate.theme.preference";

export type ThemePreference = "light" | "dark" | "system";
