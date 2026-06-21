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
