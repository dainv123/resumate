/**
 * Pure client-side filters for Command palette. No API calls.
 */

export function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

export function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return haystack.toLowerCase().includes(query);
}

export type SearchableCv = {
  id: string;
  originalFileName: string;
  version: number;
  isTailored: boolean;
};

export type SearchableProject = {
  id: string;
  name: string;
  role: string;
};

export function filterCvs(cvs: SearchableCv[], query: string): SearchableCv[] {
  const q = normalizeQuery(query);
  if (!q) return cvs;
  return cvs.filter((cv) => matchesQuery(cv.originalFileName, q));
}

export function filterTailoredJobs(
  cvs: SearchableCv[],
  query: string
): SearchableCv[] {
  return filterCvs(
    cvs.filter((cv) => cv.isTailored),
    query
  );
}

export function filterProjects(
  projects: SearchableProject[],
  query: string
): SearchableProject[] {
  const q = normalizeQuery(query);
  if (!q) return projects;
  return projects.filter(
    (p) => matchesQuery(p.name, q) || matchesQuery(p.role, q)
  );
}
