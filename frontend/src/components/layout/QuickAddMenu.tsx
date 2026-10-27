"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StubKind = "job" | "cv" | "project" | null;

const STUBS: Record<
  Exclude<StubKind, null>,
  { title: string; body: string; primary: string; href: string }
> = {
  job: {
    title: "Add job",
    body: "Job creation opens in the Jobs screen next.",
    primary: "Go to Jobs",
    href: "/dashboard/job-tailor",
  },
  cv: {
    title: "Add CV",
    body: "CV creation opens in the CVs screen next.",
    primary: "Go to CVs",
    href: "/dashboard/cv",
  },
  project: {
    title: "Add project",
    body: "Project creation opens in the Projects screen next.",
    primary: "Go to Projects",
    href: "/dashboard/projects",
  },
};

export default function QuickAddMenu() {
  const router = useRouter();
  const [stub, setStub] = useState<StubKind>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            New
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setStub("job")}>
            New job
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStub("cv")}>
            New CV
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setStub("project")}>
            New project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={stub !== null} onOpenChange={(open) => !open && setStub(null)}>
        {stub && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{STUBS[stub].title}</DialogTitle>
              <DialogDescription>{STUBS[stub].body}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStub(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  const href = STUBS[stub].href;
                  setStub(null);
                  router.push(href);
                }}
              >
                {STUBS[stub].primary}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
