"use client";

/**
 * Data sources (READ-ONLY — do not modify):
 * - useAuth() → user, logout — frontend/src/contexts/AuthContext.tsx
 * - useTheme() → theme, setTheme — frontend/src/contexts/ThemeContext.tsx
 * - usePathname() — next/navigation
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QuickAddMenu from "./QuickAddMenu";
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from "./nav-config";

export { THEME_PREFERENCE_KEY };
export type { ThemePreference };

type TopbarProps = {
  onOpenMobileNav: () => void;
  onOpenCommandPalette: () => void;
};

function sectionLabel(pathname: string): string | null {
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV];
  const match = all.find((item) => {
    if (item.href === "/dashboard") return pathname === "/dashboard";
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
  return match?.label ?? null;
}

function itemLabel(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 2) return null;
  const last = parts[parts.length - 1];
  if (!last || last === "edit" || last === "create" || last === "compare") {
    return last ? last.charAt(0).toUpperCase() + last.slice(1) : null;
  }
  return last.length > 12 ? `${last.slice(0, 8)}…` : last;
}

function initials(name?: string, email?: string) {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  return email?.[0]?.toUpperCase() ?? "?";
}

export function applyThemePreference(
  preference: ThemePreference,
  setTheme: (t: "light" | "dark") => void
) {
  localStorage.setItem(THEME_PREFERENCE_KEY, preference);
  if (preference === "system") {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(dark ? "dark" : "light");
    return;
  }
  setTheme(preference);
}

export default function Topbar({
  onOpenMobileNav,
  onOpenCommandPalette,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const section = sectionLabel(pathname);
  const item = itemLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={onOpenMobileNav}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {section && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item ? (
                  <BreadcrumbLink href={pathname.split("/").slice(0, 3).join("/") || "/dashboard"}>
                    {section}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{section}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}
          {item && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{item}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <button
        type="button"
        aria-label="Open command palette"
        onClick={onOpenCommandPalette}
        className={cn(
          "hidden h-9 w-full max-w-[320px] items-center gap-2 rounded-sm border border-input bg-muted/40 px-3 text-left text-body-sm text-muted-foreground transition-colors duration-[var(--motion-fast)] hover:bg-muted md:flex"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">Search or jump to…</span>
        <kbd className="pointer-events-none hidden rounded border border-border bg-background px-1.5 py-0.5 text-caption text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open command palette"
        onClick={onOpenCommandPalette}
      >
        <Search className="h-4 w-4" />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        <QuickAddMenu />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Profile"
            >
              <Avatar>
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback>
                  {initials(user?.name, user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="truncate">
              {user?.name || user?.email || "Account"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onSelect={() => applyThemePreference("light", setTheme)}
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => applyThemePreference("dark", setTheme)}
                >
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => applyThemePreference("system", setTheme)}
                >
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                logout();
                toast("Signed out");
                router.push("/auth/login");
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
