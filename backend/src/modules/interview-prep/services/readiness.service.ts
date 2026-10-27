import { Injectable } from '@nestjs/common';
import {
  READINESS_GATE_THRESHOLD,
  READINESS_WEIGHTS,
} from '../constants/interview-prep.constants';
import { AssignmentStatus } from '../constants/interview-prep.constants';
import { PrepDay } from '../domain/pass-framework';
import { PlanStarStory } from '../domain/interview-prep-ai.types';
import { ReadinessBreakdown } from '../entities/interview-prep-plan.entity';
import { InterviewQuestionAssignment } from '../entities/interview-question-assignment.entity';

export interface ReadinessResult {
  score: number;
  breakdown: ReadinessBreakdown;
  isReady: boolean;
  nextActions: string[];
}

@Injectable()
export class ReadinessService {
  calculate(
    roadmap: PrepDay[],
    assignments: InterviewQuestionAssignment[],
    compatibilityScore: number,
    starStories: PlanStarStory[] = [],
  ): ReadinessResult {
    const breakdown: ReadinessBreakdown = {
      compatibility: this.normalizeCompatibility(compatibilityScore),
      questionCoverage: this.calcQuestionCoverage(assignments),
      starReadiness: this.calcStarReadiness(starStories, roadmap),
      companyResearch: this.calcResearchProgress(roadmap),
      mockPerformance: this.calcMockPerformance(assignments),
    };

    const score = Math.round(
      breakdown.compatibility * READINESS_WEIGHTS.compatibility +
        breakdown.questionCoverage * READINESS_WEIGHTS.questionCoverage +
        breakdown.starReadiness * READINESS_WEIGHTS.starReadiness +
        breakdown.companyResearch * READINESS_WEIGHTS.companyResearch +
        breakdown.mockPerformance * READINESS_WEIGHTS.mockPerformance,
    );

    const nextActions = this.buildNextActions(breakdown, roadmap);

    return {
      score,
      breakdown,
      isReady: score >= READINESS_GATE_THRESHOLD,
      nextActions,
    };
  }

  private normalizeCompatibility(scoreOutOf10: number): number {
    return Math.min(100, Math.round((scoreOutOf10 / 10) * 100));
  }

  private calcQuestionCoverage(
    assignments: InterviewQuestionAssignment[],
  ): number {
    if (assignments.length === 0) return 0;
    const practiced = assignments.filter(
      (a) => a.status === 'practiced' || a.status === 'mastered',
    ).length;
    return Math.round((practiced / assignments.length) * 100);
  }

  private calcStarReadiness(
    starStories: PlanStarStory[],
    roadmap: PrepDay[],
  ): number {
    if (starStories.length > 0) {
      const ready = starStories.filter((s) => s.ready).length;
      return Math.round((ready / starStories.length) * 100);
    }
    return this.calcTaskTypeProgress(roadmap, 'star_story');
  }

  private calcTaskTypeProgress(
    roadmap: PrepDay[],
    taskType: string,
  ): number {
    const tasks = roadmap.flatMap((d) => d.tasks).filter((t) => t.type === taskType);
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }

  private calcResearchProgress(roadmap: PrepDay[]): number {
    const types = ['process_map', 'company_research'];
    const tasks = roadmap
      .flatMap((d) => d.tasks)
      .filter((t) => types.includes(t.type));
    if (tasks.length === 0) return 0;
    const done = tasks.filter((t) => t.done).length;
    return Math.round((done / tasks.length) * 100);
  }

  private calcMockPerformance(
    assignments: InterviewQuestionAssignment[],
  ): number {
    const scores = assignments.flatMap((a) => a.mockScores ?? []).map((m) => m.score);
    if (scores.length === 0) return 0;
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return Math.round((avg / 10) * 100);
  }

  private buildNextActions(
    breakdown: ReadinessBreakdown,
    roadmap: PrepDay[],
  ): string[] {
    const actions: string[] = [];

    if (breakdown.companyResearch < 100) {
      actions.push('Complete company & process research tasks');
    }
    if (breakdown.starReadiness < 100) {
      actions.push('Draft and mark STAR stories as ready');
    }
    if (breakdown.questionCoverage < 80) {
      actions.push('Practice more assigned interview questions');
    }
    if (breakdown.mockPerformance < 70) {
      actions.push('Run timed mock drills on weak answers');
    }
    if (breakdown.compatibility < 70) {
      actions.push('Address top P1 skill gaps from compatibility analysis');
    }

    const pendingP1 = roadmap
      .flatMap((d) => d.tasks)
      .filter((t) => t.priority === 'P1' && !t.done);
    if (pendingP1.length > 0 && actions.length < 3) {
      actions.push(`Complete: ${pendingP1[0].title}`);
    }

    return actions.slice(0, 3);
  }
}
