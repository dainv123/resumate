import { Injectable } from '@nestjs/common';
import { GapPriority, PrepTaskType } from '../constants/interview-prep.constants';
import { createTaskId, PrepDay } from '../domain/pass-framework';

export interface WeakQuestionRetry {
  questionId: string;
  title: string;
  prepTimeMinutes: number;
}

const WEAK_SCORE_THRESHOLD = 7;

@Injectable()
export class SpacedRepetitionService {
  injectWeakQuestionRetries(
    roadmap: PrepDay[],
    weakQuestions: WeakQuestionRetry[],
  ): PrepDay[] {
    if (weakQuestions.length === 0) return roadmap;

    const updated = roadmap.map((day) => ({
      ...day,
      tasks: [...day.tasks],
    }));

    for (const q of weakQuestions) {
      this.addRetryTask(updated, 2, q);
      this.addRetryTask(updated, 1, q);
    }

    return updated;
  }

  collectWeakQuestions(
    assignments: Array<{
      questionId: string;
      mockScores?: Array<{ score: number }>;
    }>,
    questionTitles: Record<string, { title: string; prepTimeMinutes: number }>,
  ): WeakQuestionRetry[] {
    return assignments
      .filter((a) => {
        const last = a.mockScores?.[a.mockScores.length - 1];
        return last != null && last.score < WEAK_SCORE_THRESHOLD;
      })
      .map((a) => ({
        questionId: a.questionId,
        title: questionTitles[a.questionId]?.title ?? a.questionId,
        prepTimeMinutes:
          questionTitles[a.questionId]?.prepTimeMinutes ?? 15,
      }));
  }

  private addRetryTask(
    roadmap: PrepDay[],
    daysUntilInterview: number,
    question: WeakQuestionRetry,
  ): void {
    const day = roadmap.find(
      (d) => d.daysUntilInterview === daysUntilInterview,
    );
    if (!day) return;

    const exists = day.tasks.some((t) => t.refId === question.questionId);
    if (exists) return;

    day.tasks.push({
      id: createTaskId(`retry-d${daysUntilInterview}`, day.tasks.length),
      type: PrepTaskType.QUESTION_PRACTICE,
      title: `Re-practice: ${truncate(question.title, 50)}`,
      durationMinutes: question.prepTimeMinutes,
      priority: GapPriority.P1,
      impactScore: 2.5,
      refId: question.questionId,
      done: false,
    });
  }
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

export { WEAK_SCORE_THRESHOLD };
