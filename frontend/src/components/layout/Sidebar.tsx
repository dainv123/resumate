"use client";

/**
 * Data sources (READ-ONLY — do not modify):
 * - usePathname() from next/navigation
 * - Nav hrefs from nav-config (legacy dashboard routes)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-config";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  loading?: boolean;
  onNavigate?: () => void;
  className?: string;
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  loading = false,
  onNavigate,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card text-card-foreground transition-[width] duration-[var(--motion-base)] ease-out",
        collapsed ? "w-16" : "w-60",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b border-border px-3",
          collapsed ? "justify-center" : "gap-2"
        )}
      >
        <FileText className="h-5 w-5 shrink-0 text-foreground" />
        {!collapsed && (
          <span className="text-h2 font-semibold text-foreground">Resumate</span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {loading ? (
          <div className="space-y-2 p-1">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : (
          <>
            {PRIMARY_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-body transition-colors duration-[var(--motion-fast)]",
                    collapsed && "justify-center px-0",
                    active
                      ? "border-l-2 border-primary bg-primary/10 text-primary"
                      : "border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
              if (!collapsed) return link;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}

            <Separator className="my-2" />

            {SECONDARY_NAV.map((item) => {
              const active = isActive(pathname, item.href);
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-body transition-colors duration-[var(--motion-fast)]",
                    collapsed && "justify-center px-0",
                    active
                      ? "border-l-2 border-primary bg-primary/10 text-primary"
                      : "border-l-2 border-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
              if (!collapsed) return link;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </>
        )}
      </nav>

      <div className="hidden border-t border-border p-2 lg:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-full"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <ChevronsLeft className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {collapsed ? "Expand sidebar" : "Collapse sidebar"}
          </TooltipContent>
        </Tooltip>
      </div>
    </aside>
  );
}
