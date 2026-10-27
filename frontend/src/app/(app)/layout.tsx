import AppShell from "@/components/layout/AppShell";

/** Future route-group mount — live shell is `app/dashboard/layout.tsx` until routes migrate. */
export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
