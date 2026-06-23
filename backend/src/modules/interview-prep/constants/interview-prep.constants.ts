export enum QuestionCategory {
  BEHAVIORAL = 'behavioral',
  TECHNICAL = 'technical',
  SITUATIONAL = 'situational',
  SYSTEM_DESIGN = 'system-design',
  COMPANY_CULTURE = 'company-culture',
}

export enum QuestionLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
}

export enum QuestionFrequency {
  VERY_COMMON = 'very_common',
  COMMON = 'common',
  OCCASIONAL = 'occasional',
}

export enum PrepPlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum AssignmentStatus {
  PENDING = 'pending',
  DRAFTED = 'drafted',
  PRACTICED = 'practiced',
  MASTERED = 'mastered',
}

export enum GapPriority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
}

export enum PrepTaskType {
  PROCESS_MAP = 'process_map',
  COMPANY_RESEARCH = 'company_research',
  GAP_STUDY = 'gap_study',
  STAR_STORY = 'star_story',
  QUESTION_PRACTICE = 'question_practice',
  PROJECT_DEFENSE = 'project_defense',
  MOCK_DRILL = 'mock_drill',
  SYSTEM_DESIGN = 'system_design',
  DAY_BEFORE = 'day_before',
  INTERVIEW_DAY = 'interview_day',
}

export enum InterviewRoundType {
  HR_SCREEN = 'hr_screen',
  TECHNICAL = 'technical',
  HIRING_MANAGER = 'hiring_manager',
  SYSTEM_DESIGN = 'system_design',
  CULTURE_FIT = 'culture_fit',
}

export enum JobDescriptionSourceType {
  MANUAL = 'manual',
  LINKEDIN = 'linkedin',
  INDEED = 'indeed',
  GREENHOUSE = 'greenhouse',
  LEVER = 'lever',
  ITVIEC = 'itviec',
  TOPCV = 'topcv',
  OTHER = 'other',
}

export enum QuestionPack {
  STANDARD = 'standard',
  FAANG = 'faang',
}

export const QUESTION_PACK_ROLE_TAG: Record<QuestionPack, string | null> = {
  [QuestionPack.STANDARD]: null,
  [QuestionPack.FAANG]: 'faang',
};

export const INTERVIEW_PREP_LIMITS = {
  free: {
    interviewPrepPlans: 1,
    mockDrills: 3,
    visibleQuestions: 5,
    cheatSheetExport: false,
  },
  pro: {
    interviewPrepPlans: -1,
    mockDrills: -1,
    visibleQuestions: -1,
    cheatSheetExport: true,
  },
} as const;

export const READINESS_WEIGHTS = {
  compatibility: 0.3,
  questionCoverage: 0.25,
  starReadiness: 0.2,
  companyResearch: 0.15,
  mockPerformance: 0.1,
} as const;

export const READINESS_GATE_THRESHOLD = 75;

export const JD_DESCRIPTION_PREVIEW_LENGTH = 160;

export const DEFAULT_DAILY_CAPACITY_MINUTES = 60;

export const ROUND_WEIGHTS: Record<InterviewRoundType, number> = {
  [InterviewRoundType.HR_SCREEN]: 0.2,
  [InterviewRoundType.TECHNICAL]: 0.4,
  [InterviewRoundType.HIRING_MANAGER]: 0.25,
  [InterviewRoundType.SYSTEM_DESIGN]: 0.35,
  [InterviewRoundType.CULTURE_FIT]: 0.15,
};

export const CURRENT_LEVEL_SCORE: Record<string, number> = {
  missing: 0.2,
  weak: 0.5,
  strong: 0.9,
};
