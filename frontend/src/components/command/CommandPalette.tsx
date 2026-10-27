"use client";

/**
 * Data sources (READ-ONLY — do not modify):
 * - useCvsPaginated — frontend/src/hooks/useCvs.ts
 * - useQuery(["projects"], projectsApi.getUserProjects) — frontend/src/lib/projects.ts
 * - useTheme().setTheme — frontend/src/contexts/ThemeContext.tsx
 * - PRIMARY_NAV / SECONDARY_NAV — frontend/src/components/layout/nav-config.ts (import only)
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Briefcase,
  FileText,
  FolderKanban,
  Moon,
  Plus,
  Sun,
  Laptop,
} from "lucide-react";
import { useCvsPaginated } from "@/hooks/useCvs";
import { projectsApi } from "@/lib/projects";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PRIMARY_NAV,
  SECONDARY_NAV,
  THEME_PREFERENCE_KEY,
  type ThemePreference,
} from "@/components/layout/nav-config";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui-command";
import {
  filterCvs,
  filterProjects,
  filterTailoredJobs,
  normalizeQuery,
} from "./command-search";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function applyThemePreference(
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

const CREATE_ACTIONS = [
  { id: "new-job", label: "New job", href: "/dashboard/job-tailor" },
  { id: "new-cv", label: "New CV", href: "/dashboard/cv" },
  { id: "new-project", label: "New project", href: "/dashboard/projects" },
] as const;

export default function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [deferredQuery, setDeferredQuery] = useState("");

  const {
    data: cvsData,
    isLoading: cvsLoading,
    isError: cvsError,
    refetch: refetchCvs,
  } = useCvsPaginated({
    limit: 50,
    sortBy: "updatedAt",
    sortOrder: "DESC",
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.getUserProjects,
    enabled: open,
  });

  const cvs = useMemo(() => cvsData?.data ?? [], [cvsData]);
  const isLoading = cvsLoading || projectsLoading;
  const isError = cvsError || projectsError;
  const q = normalizeQuery(deferredQuery);
  const searching = q.length > 0;

  const jobHits = useMemo(
    () => (searching ? filterTailoredJobs(cvs, q) : []),
    [cvs, q, searching]
  );
  const cvHits = useMemo(
    () => (searching ? filterCvs(cvs, q) : []),
    [cvs, q, searching]
  );
  const projectHits = useMemo(
    () => (searching ? filterProjects(projects, q) : []),
    [projects, q, searching]
  );

  const noResults =
    searching &&
    !isLoading &&
    jobHits.length === 0 &&
    cvHits.length === 0 &&
    projectHits.length === 0;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDeferredQuery("");
      return;
    }
    const t = window.setTimeout(() => setDeferredQuery(query), 150);
    return () => window.clearTimeout(t);
  }, [query, open]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const setThemeAction = (preference: ThemePreference, label: string) => {
    applyThemePreference(preference, setTheme);
    toast(`Theme: ${label}`);
    onOpenChange(false);
  };

  const retry = () => {
    void refetchCvs();
    void refetchProjects();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label="Command palette"
        className={cn(
          "overflow-hidden p-0 gap-0 max-w-lg w-[calc(100%-2rem)] sm:w-full",
          "[&>button]:hidden"
        )}
      >
        <Command shouldFilter={false} className="rounded-lg border-0">
          <CommandInput
            placeholder="Search jobs, CVs, projects…"
            value={query}
            onValueChange={setQuery}
            autoFocus
          />

          {isError && (
            <div
              role="alert"
              className="mx-2 mt-2 flex flex-col gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-body-sm text-foreground">
                Couldn&apos;t load results.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Retry
              </Button>
            </div>
          )}

          <CommandList>
            {!searching && (
              <>
                <CommandGroup heading="Navigation">
                  {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                    const Icon = item.icon;
                    return (
                      <CommandItem
                        key={item.id}
                        value={`nav-${item.id}`}
                        onSelect={() => go(item.href)}
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Create">
                  {CREATE_ACTIONS.map((action) => (
                    <CommandItem
                      key={action.id}
                      value={`create-${action.id}`}
                      onSelect={() => go(action.href)}
                    >
                      <Plus />
                      <span>{action.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="Theme">
                  <CommandItem
                    value="theme-light"
                    onSelect={() => setThemeAction("light", "Light")}
                  >
                    <Sun />
                    <span>Light</span>
                  </CommandItem>
                  <CommandItem
                    value="theme-dark"
                    onSelect={() => setThemeAction("dark", "Dark")}
                  >
                    <Moon />
                    <span>Dark</span>
                  </CommandItem>
                  <CommandItem
                    value="theme-system"
                    onSelect={() => setThemeAction("system", "System")}
                  >
                    <Laptop />
                    <span>System</span>
                  </CommandItem>
                </CommandGroup>

                {isLoading && (
                  <div className="space-y-2 p-2" aria-hidden>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}
              </>
            )}

            {searching && (
              <>
                {isLoading && (
                  <div className="space-y-2 p-2" aria-hidden>
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                )}

                {!isLoading && jobHits.length > 0 && (
                  <CommandGroup heading="Jobs">
                    {jobHits.map((cv) => (
                      <CommandItem
                        key={`job-${cv.id}`}
                        value={`job-${cv.id}-${cv.originalFileName}`}
                        onSelect={() =>
                          go(`/dashboard/job-tailor?cvId=${cv.id}`)
                        }
                      >
                        <Briefcase />
                        <span className="truncate">
                          {cv.originalFileName} · Tailored
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!isLoading && cvHits.length > 0 && (
                  <CommandGroup heading="CVs">
                    {cvHits.map((cv) => (
                      <CommandItem
                        key={`cv-${cv.id}`}
                        value={`cv-${cv.id}-${cv.originalFileName}`}
                        onSelect={() => go(`/dashboard/cv/${cv.id}`)}
                      >
                        <FileText />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{cv.originalFileName}</span>
                          <span className="text-caption text-muted-foreground">
                            Version {cv.version}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {!isLoading && projectHits.length > 0 && (
                  <CommandGroup heading="Projects">
                    {projectHits.map((project) => (
                      <CommandItem
                        key={`project-${project.id}`}
                        value={`project-${project.id}-${project.name}`}
                        onSelect={() => go("/dashboard/projects")}
                      >
                        <FolderKanban />
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{project.name}</span>
                          <span className="text-caption text-muted-foreground truncate">
                            {project.role}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {noResults && (
                  <CommandEmpty>No results.</CommandEmpty>
                )}

                <CommandSeparator />

                <CommandGroup heading="Create">
                  {CREATE_ACTIONS.map((action) => (
                    <CommandItem
                      key={`search-create-${action.id}`}
                      value={`search-create-${action.id}`}
                      onSelect={() => go(action.href)}
                    >
                      <Plus />
                      <span>{action.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
