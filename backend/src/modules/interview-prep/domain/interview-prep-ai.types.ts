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

export interface MockEvaluationResult {
  score: number;
  matchedCriteria: string[];
  missingCriteria: string[];
  feedback: string;
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
