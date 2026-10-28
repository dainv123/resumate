export interface NormalizedCompatibilityAnalysis {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedExperience: string[];
  missingRequirements: string[];
  suggestions: string[];
  strengths: string[];
  reused?: boolean;
}

/**
 * Model JSON is not schema-checked. Missing or null arrays used to crash
 * interview-plan creation (`array.map`) and fail the new analysis INSERT
 * (`jsonb` NOT NULL / integer score). Fractional scores such as 7.5 are
 * rejected by the integer column.
 */
export function normalizeCompatibilityAnalysis(
  raw: Partial<NormalizedCompatibilityAnalysis> | null | undefined,
): NormalizedCompatibilityAnalysis {
  const normalized: NormalizedCompatibilityAnalysis = {
    score: normalizeScore(raw?.score),
    matchedSkills: asStringArray(raw?.matchedSkills),
    missingSkills: asStringArray(raw?.missingSkills),
    matchedExperience: asStringArray(raw?.matchedExperience),
    missingRequirements: asStringArray(raw?.missingRequirements),
    suggestions: asStringArray(raw?.suggestions),
    strengths: asStringArray(raw?.strengths),
  };

  if (typeof raw?.reused === 'boolean') {
    normalized.reused = raw.reused;
  }

  return normalized;
}

export function asStringArray(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  if (!Array.isArray(value)) return [];

  const skills: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) skills.push(trimmed);
      continue;
    }
    if (typeof item === 'number' && Number.isFinite(item)) {
      skills.push(String(item));
    }
  }
  return skills;
}

function normalizeScore(value: unknown): number {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN;
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}
