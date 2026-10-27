"use client";

/**
 * Data sources (READ-ONLY — do not modify):
 * - useAuth() → user, loading — frontend/src/contexts/AuthContext.tsx
 * - useTheme() → setTheme — frontend/src/contexts/ThemeContext.tsx
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import CommandPalette from "@/components/command/CommandPalette";
import Sidebar from "./Sidebar";
import Topbar, { applyThemePreference } from "./Topbar";
import {
  SIDEBAR_COLLAPSED_KEY,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from "./nav-config";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const { user, loading } = useAuth();
  const { setTheme } = useTheme();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [shellError, setShellError] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      setCollapsed(raw === "1");
      const pref = localStorage.getItem(
        THEME_PREFERENCE_KEY
      ) as ThemePreference | null;
      if (pref === "light" || pref === "dark" || pref === "system") {
        applyThemePreference(pref, setTheme);
      }
    } catch {
      setShellError(true);
    }
  }, [setTheme]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const pref = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyThemePreference("system", setTheme);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setTheme]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  };

  if (!loading && !user) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-background text-foreground">
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
            loading={loading}
          />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0">
            <Sidebar
              collapsed={false}
              onToggleCollapsed={() => undefined}
              loading={loading}
              onNavigate={() => setMobileOpen(false)}
              className="border-0"
            />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "flex min-h-screen flex-1 flex-col transition-[padding] duration-[var(--motion-base)] ease-out",
            collapsed ? "lg:pl-16" : "lg:pl-60"
          )}
        >
          <Topbar
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenCommandPalette={() => setCommandOpen(true)}
          />

          <main className="flex-1 px-4 py-4 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1200px]">
              {shellError && (
                <div
                  role="alert"
                  className="mb-4 flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-h3 text-foreground">
                      Something went wrong.
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      The app shell failed to load.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>

        <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      </div>
    </TooltipProvider>
  );
}
