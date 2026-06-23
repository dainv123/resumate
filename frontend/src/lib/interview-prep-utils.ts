import { PrepDay, QuestionAssignment } from '@/lib/interview-prep';

export function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function findTodayPrepDay(roadmap: PrepDay[]): PrepDay | undefined {
  const today = formatLocalDateISO(new Date());
  return (
    roadmap.find((day) => day.date === today) ??
    roadmap.find((day) => day.daysUntilInterview > 0)
  );
}

export function getLastMockScore(
  assignment: QuestionAssignment,
): number | undefined {
  const scores = assignment.mockScores;
  if (!scores?.length) return undefined;
  return scores[scores.length - 1].score;
}

export function sortAssignmentsForPractice(
  assignments: QuestionAssignment[],
): QuestionAssignment[] {
  return [...assignments].sort((a, b) => {
    const scoreA = getLastMockScore(a);
    const scoreB = getLastMockScore(b);
    const weakA = scoreA == null ? 0 : scoreA < 7 ? 1 : 2;
    const weakB = scoreB == null ? 0 : scoreB < 7 ? 1 : 2;
    if (weakA !== weakB) return weakA - weakB;
    const priorityOrder = { P1: 0, P2: 1, P3: 2 };
    const pDiff =
      priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return b.impactScore - a.impactScore;
  });
}

export function pickSessionAssignmentIds(
  assignments: QuestionAssignment[],
  limit = 5,
): string[] {
  return sortAssignmentsForPractice(assignments)
    .filter((a) => getLastMockScore(a) == null || (getLastMockScore(a) ?? 10) < 7)
    .slice(0, limit)
    .map((a) => a.id);
}

export function isBehavioralCategory(category?: string): boolean {
  return category === 'behavioral' || category === 'company-culture';
}

export function composeStarAnswer(fields: {
  situation: string;
  task: string;
  action: string;
  result: string;
}): string {
  return [
    fields.situation.trim() && `Situation: ${fields.situation.trim()}`,
    fields.task.trim() && `Task: ${fields.task.trim()}`,
    fields.action.trim() && `Action: ${fields.action.trim()}`,
    fields.result.trim() && `Result: ${fields.result.trim()}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function daysUntilInterviewDate(interviewDate: string): number {
  const end = new Date(interviewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
}

export function countRoadmapProgress(roadmap: PrepDay[]) {
  const tasks = roadmap.flatMap((d) => d.tasks);
  const done = tasks.filter((t) => t.done).length;
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  };
}

export function countQuestionProgress(assignments: QuestionAssignment[]) {
  const practiced = assignments.filter(
    (a) => (a.mockScores?.length ?? 0) > 0,
  ).length;
  const mastered = assignments.filter((a) => a.status === 'mastered').length;
  return { practiced, mastered, total: assignments.length };
}

export const PREP_SECTION_IDS = {
  overview: 'prep-section-overview',
  practice: 'prep-section-practice',
  prepare: 'prep-section-prepare',
  roadmap: 'prep-section-roadmap',
} as const;

export type PrepSectionId =
  (typeof PREP_SECTION_IDS)[keyof typeof PREP_SECTION_IDS];

export function scrollToPrepSection(id: PrepSectionId) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
