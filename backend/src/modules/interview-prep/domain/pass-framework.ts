import {
  GapPriority,
  InterviewRoundType,
  PrepTaskType,
  ROUND_WEIGHTS,
} from '../constants/interview-prep.constants';

export type GapCurrentLevel = 'missing' | 'weak' | 'strong';

export interface EvaluationRubric {
  excellent: string[];
  good: string[];
  weak: string[];
}

export interface GapItem {
  skill: string;
  jdMentions: number;
  currentLevel: GapCurrentLevel;
  impactScore: number;
  priority: GapPriority;
  roundType: InterviewRoundType;
}

export interface ProcessRound {
  type: InterviewRoundType;
  label: string;
  durationMinutes: number;
  weight: number;
  focusAreas: string[];
}

export interface ProcessMap {
  rounds: ProcessRound[];
  totalEstimatedDays: number;
}

export interface PrepTask {
  id: string;
  type: PrepTaskType;
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

export interface RankedQuestion {
  questionId: string;
  question: string;
  category: string;
  impactScore: number;
  priority: GapPriority;
  prepTimeMinutes: number;
}

export interface SchedulerInput {
  interviewDate: Date;
  today?: Date;
  dailyCapacityMinutes: number;
  gaps: GapItem[];
  questions: RankedQuestion[];
  processMap: ProcessMap;
}

export function computeGapImpactScore(
  jdMentions: number,
  roundType: InterviewRoundType,
  currentLevel: GapCurrentLevel,
): number {
  const roundWeight = ROUND_WEIGHTS[roundType] ?? 0.25;
  const levelDivisor =
    currentLevel === 'missing' ? 0.2 : currentLevel === 'weak' ? 0.5 : 0.9;
  return Math.round(((jdMentions * roundWeight) / levelDivisor) * 100) / 100;
}

export function assignGapPriority(impactScore: number): GapPriority {
  if (impactScore >= 2) return GapPriority.P1;
  if (impactScore >= 1) return GapPriority.P2;
  return GapPriority.P3;
}

export function countDaysUntilInterview(
  interviewDate: Date,
  today: Date = new Date(),
): number {
  const start = startOfDay(today);
  const end = startOfDay(interviewDate);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function defaultProcessMap(): ProcessMap {
  return {
    rounds: [
      {
        type: InterviewRoundType.HR_SCREEN,
        label: 'HR Screen',
        durationMinutes: 30,
        weight: ROUND_WEIGHTS[InterviewRoundType.HR_SCREEN],
        focusAreas: ['motivation', 'culture fit', 'salary expectations'],
      },
      {
        type: InterviewRoundType.TECHNICAL,
        label: 'Technical Interview',
        durationMinutes: 60,
        weight: ROUND_WEIGHTS[InterviewRoundType.TECHNICAL],
        focusAreas: ['coding', 'project deep dive', 'tech stack'],
      },
      {
        type: InterviewRoundType.HIRING_MANAGER,
        label: 'Hiring Manager',
        durationMinutes: 45,
        weight: ROUND_WEIGHTS[InterviewRoundType.HIRING_MANAGER],
        focusAreas: ['leadership', 'team fit', 'career goals'],
      },
    ],
    totalEstimatedDays: 7,
  };
}

export function createTaskId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
