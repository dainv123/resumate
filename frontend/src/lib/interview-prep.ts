import api from './api';

export type QuestionPack = 'standard' | 'faang';

export interface ResolvedJobDescription {
  description: string;
  title: string;
  company?: string;
  location?: string;
  sourceUrl: string;
  sourceType: string;
}

export interface CompanyResearchSection {
  id: string;
  title: string;
  summary: string;
  checked?: boolean;
}

export interface CompanyResearchBrief {
  sections: CompanyResearchSection[];
  generatedAt: string;
}

export type PostInterviewOutcome = 'passed' | 'failed' | 'waiting' | 'declined';

export interface PostInterviewSurvey {
  outcome: PostInterviewOutcome;
  difficulty: number;
  notes?: string;
  submittedAt: string;
}

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

export interface QuestionHints {
  sampleAnswerOutline: string[];
  followUpQuestions: string[];
}

export interface MockScoreEntry {
  score: number;
  feedback: string;
  matchedCriteria?: string[];
  missingCriteria?: string[];
  improvedAnswerOutline?: string[];
  followUpQuestion?: string;
  attemptedAt: string;
}

export interface ProcessMapRound {
  type: string;
  label: string;
  durationMinutes: number;
  weight: number;
  focusAreas: string[];
}

export interface ProcessMap {
  rounds: ProcessMapRound[];
  totalEstimatedDays?: number;
}

export interface QuestionAssignment {
  id: string;
  planId: string;
  questionId: string;
  question?: string;
  category?: string;
  prepTimeMinutes?: number;
  priority: GapPriority;
  impactScore: number;
  userAnswer?: string;
  status: string;
  mockScores?: MockScoreEntry[];
  hints?: QuestionHints;
}

export interface PrepJobDescriptionSummary {
  id: string;
  title: string;
  company?: string;
  preview: string;
  description?: string;
  sourceUrl?: string;
  sourceType?: string;
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
  jobDescription?: PrepJobDescriptionSummary;
  cvName?: string;
}

export interface InterviewPrepPlanDetail extends InterviewPrepPlanSummary {
  processMap: ProcessMap;
  roadmap: PrepDay[];
  starStories: PlanStarStory[];
  projectDefenses: ProjectDefenseSheet[];
  companyResearch?: CompanyResearchBrief;
  postInterviewSurvey?: PostInterviewSurvey;
  questionPack?: QuestionPack;
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
  language?: string;
  questionPack?: QuestionPack;
}

export interface MockEvaluation {
  score: number;
  matchedCriteria: string[];
  missingCriteria: string[];
  feedback: string;
  improvedAnswerOutline?: string[];
  followUpQuestion?: string;
}

export const interviewPrepApi = {
  resolveJd: async (url: string): Promise<ResolvedJobDescription> => {
    const { data } = await api.post('/interview-prep/resolve-jd', { url });
    return data;
  },

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
    language?: string,
  ): Promise<InterviewPrepPlanDetail & { mockEvaluation?: MockEvaluation }> => {
    const { data } = await api.post(`/interview-prep/${planId}/mock`, {
      assignmentId,
      answer,
      language,
    });
    return data;
  },

  updateCompanyResearchSection: async (
    planId: string,
    sectionId: string,
    checked: boolean,
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.patch(
      `/interview-prep/${planId}/company-research/${sectionId}`,
      { checked },
    );
    return data;
  },

  submitSurvey: async (
    planId: string,
    payload: {
      outcome: PostInterviewOutcome;
      difficulty: number;
      notes?: string;
    },
  ): Promise<InterviewPrepPlanDetail> => {
    const { data } = await api.post(`/interview-prep/${planId}/survey`, payload);
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
