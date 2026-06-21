export const INTERVIEW_PREP_ENV = {
  ENABLED: 'INTERVIEW_PREP_ENABLED',
  DEFAULT_ENABLED: 'true',
} as const;

export const INTERVIEW_PREP_AI_COST = {
  estimatePerPlanUsd: { min: 0.1, max: 0.15 },
  note: 'Parallel AI calls on createPlan: compatibility, process map, STAR, project defense',
} as const;
