import api from './api';

export type GapPriority = 'P1' | 'P2' | 'P3';

export interface PrepTask {
  id: string;
  type: string;
  title: string;
  durationMinutes: number;
  priority: GapPriority;
  impactScore: number;
  refId?: string;
  done: boolean;
}

export interface PrepDay {
  dayIndex: number;
  daysUntilInterview: number;
  date: string;
  theme: string;
  tasks: PrepTask[];
}

export interface ReadinessBreakdown {
  compatibility: number;
  questionCoverage: number;
  starReadiness: number;
  companyResearch: number;
  mockPerformance: number;
}

export interface ReadinessGate {
  threshold: number;
  isReady: boolean;
  pointsToGo: number;
  nextActions: string[];
}

export interface PrepLimits {
  plan: string;
  totalQuestions: number;
  visibleQuestions: number;
  lockedQuestionCount: number;
  mockDrillsEnabled: boolean;
  cheatSheetExportEnabled: boolean;
}

export interface PlanStarStory {
  id: string;
  question: string;
  mapsToQuestions: string[];
  situation: string;
  task: string;
  action: string;
  result: string;
  projectRef: string;
  ready: boolean;
}

export interface ProjectDefenseSheet {
  projectName: string;
  role: string;
  architectureDecision: string;
  hardestProblem: string;
  outcome: string;
  wouldDoDifferently: string;
  followUpQuestions: string[];
}

export interface QuestionAssignment {
  id: string;
  planId: string;
  questionId: string;
  priority: GapPriority;
  impactScore: number;
  userAnswer?: string;
  status: string;
  mockScores?: Array<{
    score: number;
    feedback: string;
    attemptedAt: string;
  }>;
}

export interface InterviewPrepPlanSummary {
  id: string;
  userId: string;
  jobDescriptionId: string;
  cvId: string;
  interviewDate: string;
  dailyCapacityMinutes: number;
  readinessScore?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewPrepPlanDetail extends InterviewPrepPlanSummary {
  processMap: Record<string, unknown>;
  roadmap: PrepDay[];
  starStories: PlanStarStory[];
  projectDefenses: ProjectDefenseSheet[];
  readinessBreakdown?: ReadinessBreakdown;
  isReady: boolean;
  nextActions: string[];
  readinessGate?: ReadinessGate;
  limits?: PrepLimits;
  questionAssignments: QuestionAssignment[];
  gaps?: Array<{
    skill: string;
    priority: GapPriority;
    impactScore: number;
  }>;
  compatibility?: {
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
  };
}

export interface CreateInterviewPrepPayload {
  jobDescription: string;
  cvId: string;
  interviewDate: string;
  dailyCapacityMinutes?: number;
}

export interface MockEvaluation {
  score: number;
  matchedCriteria: string[];
  missingCriteria: string[];
  feedback: string;
}

export const interviewPrepApi = {
  listPlans: async (): Promise<InterviewPrepPlanSummary[]> => {
    const { data } = await api.get('/interview-prep');
    return data;
  },

  getPlan: async (id: string): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.get(`/interview-prep/${id}`);
    return data;
  },

  createPlan: async (
    payload: CreateInterviewPrepPayload,
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.post('/interview-prep', payload);
    return data;
  },

  updateTask: async (
    planId: string,
    dayIndex: number,
    taskId: string,
    done: boolean,
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.patch(
      `/interview-prep/${planId}/tasks/${dayIndex}/${taskId}`,
      { done },
    );
    return data;
  },

  updateStarStory: async (
    planId: string,
    storyIndex: number,
    payload: Partial<PlanStarStory>,
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.patch(
      `/interview-prep/${planId}/star-stories/${storyIndex}`,
      payload,
    );
    return data;
  },

  regenerateStarStory: async (
    planId: string,
    storyIndex: number,
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.post(
      `/interview-prep/${planId}/star-stories/${storyIndex}/regenerate`,
    );
    return data;
  },

  submitMockAnswer: async (
    planId: string,
    assignmentId: string,
    answer: string,
  ): Promise<InterviewPrepPlanDetail & { mockEvaluation?: MockEvaluation }> => {
    const { data } = await api.post(`/interview-prep/${planId}/mock`, {
      assignmentId,
      answer,
    });
    return data;
  },

  exportCheatSheetPdf: async (planId: string): Promise<Blob> => {
    const { data } = await api.get(
      `/interview-prep/${planId}/export/cheat-sheet/pdf`,
      { responseType: 'blob' },
    );
    return data;
  },
};

export function isInterviewPrepPaywallError(error: unknown): boolean {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return typeof message === "string" && /limit reached/i.test(message);
}
