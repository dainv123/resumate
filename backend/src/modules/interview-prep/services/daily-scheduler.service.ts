import { Injectable } from '@nestjs/common';
import { GapPriority, PrepTaskType } from '../constants/interview-prep.constants';
import {
  addDays,
  countDaysUntilInterview,
  createTaskId,
  formatDateISO,
  GapItem,
  PrepDay,
  PrepTask,
  ProcessMap,
  RankedQuestion,
  SchedulerInput,
} from '../domain/pass-framework';

const PASS_THEMES = [
  'Research — company & role',
  'Assess — gap analysis',
  'Stories — STAR & project defense',
  'Answer bank — high-impact questions',
  'Simulate — mock drills',
  'Simulate — weak areas',
  'Polish — day before',
];

@Injectable()
export class DailySchedulerService {
  buildRoadmap(input: SchedulerInput): PrepDay[] {
    const today = input.today ?? new Date();
    const daysRemaining = countDaysUntilInterview(input.interviewDate, today);

    if (daysRemaining === 0) {
      return [this.buildInterviewDay(today, input.processMap)];
    }

    const effectiveDays = Math.max(daysRemaining, 1);
    const isCrashCourse = effectiveDays <= 3;

    const taskPool = this.buildTaskPool(input, isCrashCourse);
    const sortedTasks = taskPool.sort((a, b) => {
      const priorityOrder = { P1: 0, P2: 1, P3: 2 };
      const pDiff =
        priorityOrder[a.priority] - priorityOrder[b.priority];
      if (pDiff !== 0) return pDiff;
      return b.impactScore - a.impactScore;
    });

    const roadmap: PrepDay[] = [];
    let taskIndex = 0;

    for (let i = 0; i < effectiveDays; i++) {
      const daysUntil = effectiveDays - i;
      const date = addDays(today, i);
      const isLastDay = daysUntil === 1;
      const isDayBefore = daysUntil === 2;
      const isInterviewDay = false;

      if (isLastDay) {
        roadmap.push(this.buildDayBeforeDay(date, daysUntil, i));
        continue;
      }

      if (isDayBefore && !isCrashCourse) {
        roadmap.push(this.buildMockReviewDay(date, daysUntil, i, sortedTasks));
        continue;
      }

      const theme = this.resolveTheme(i, effectiveDays, isCrashCourse);
      const dayTasks: PrepTask[] = [];
      let usedMinutes = 0;

      while (
        taskIndex < sortedTasks.length &&
        usedMinutes + sortedTasks[taskIndex].durationMinutes <=
          input.dailyCapacityMinutes
      ) {
        const task = { ...sortedTasks[taskIndex], done: false };
        dayTasks.push(task);
        usedMinutes += task.durationMinutes;
        taskIndex++;
      }

      if (dayTasks.length === 0 && taskIndex < sortedTasks.length) {
        const task = { ...sortedTasks[taskIndex], done: false };
        dayTasks.push(task);
        taskIndex++;
      }

      roadmap.push({
        dayIndex: i,
        daysUntilInterview: daysUntil,
        date: formatDateISO(date),
        theme,
        tasks: dayTasks,
      });
    }

    if (!roadmap.some((d) => d.daysUntilInterview === 1)) {
      roadmap.push(
        this.buildDayBeforeDay(addDays(today, effectiveDays - 1), 1, effectiveDays - 1),
      );
    }

    roadmap.push(this.buildInterviewDay(addDays(input.interviewDate, 0), input.processMap));

    return roadmap;
  }

  private buildTaskPool(
    input: SchedulerInput,
    crashCourse: boolean,
  ): PrepTask[] {
    const tasks: PrepTask[] = [];
    let idx = 0;

    tasks.push({
      id: createTaskId('process', idx++),
      type: PrepTaskType.PROCESS_MAP,
      title: 'Map interview rounds & focus areas',
      durationMinutes: 30,
      priority: GapPriority.P1,
      impactScore: 3,
      done: false,
    });

    tasks.push({
      id: createTaskId('research', idx++),
      type: PrepTaskType.COMPANY_RESEARCH,
      title: 'Research company, product & recent news',
      durationMinutes: 45,
      priority: GapPriority.P1,
      impactScore: 2.5,
      done: false,
    });

    for (const gap of input.gaps) {
      if (crashCourse && gap.priority !== GapPriority.P1) continue;
      tasks.push({
        id: createTaskId('gap', idx++),
        type: PrepTaskType.GAP_STUDY,
        title: `Study gap: ${gap.skill}`,
        durationMinutes: gap.priority === GapPriority.P1 ? 60 : 30,
        priority: gap.priority,
        impactScore: gap.impactScore,
        refId: gap.skill,
        done: false,
      });
    }

    tasks.push({
      id: createTaskId('star', idx++),
      type: PrepTaskType.STAR_STORY,
      title: 'Draft & refine STAR stories from your CV',
      durationMinutes: 60,
      priority: GapPriority.P1,
      impactScore: 2.8,
      done: false,
    });

    tasks.push({
      id: createTaskId('defense', idx++),
      type: PrepTaskType.PROJECT_DEFENSE,
      title: 'Prepare project deep-dive defense sheets',
      durationMinutes: 45,
      priority: GapPriority.P1,
      impactScore: 2.6,
      done: false,
    });

    for (const q of input.questions) {
      if (crashCourse && q.priority !== GapPriority.P1) continue;
      tasks.push({
        id: createTaskId('q', idx++),
        type: PrepTaskType.QUESTION_PRACTICE,
        title: `Practice: ${truncate(q.question, 60)}`,
        durationMinutes: q.prepTimeMinutes,
        priority: q.priority,
        impactScore: q.impactScore,
        refId: q.questionId,
        done: false,
      });
    }

    if (!crashCourse) {
      tasks.push({
        id: createTaskId('mock', idx++),
        type: PrepTaskType.MOCK_DRILL,
        title: 'Timed mock interview round',
        durationMinutes: 45,
        priority: GapPriority.P1,
        impactScore: 2.4,
        done: false,
      });
      tasks.push({
        id: createTaskId('mock2', idx++),
        type: PrepTaskType.MOCK_DRILL,
        title: 'Second mock — focus weak answers',
        durationMinutes: 45,
        priority: GapPriority.P2,
        impactScore: 2,
        done: false,
      });
    }

    return tasks;
  }

  private resolveTheme(
    dayIndex: number,
    totalDays: number,
    crashCourse: boolean,
  ): string {
    if (crashCourse) {
      const crashThemes = [
        'Crash — company & gaps',
        'Crash — stories & questions',
        'Crash — mock & polish',
      ];
      return crashThemes[Math.min(dayIndex, crashThemes.length - 1)];
    }
    const themeIndex = Math.min(
      Math.floor((dayIndex / totalDays) * PASS_THEMES.length),
      PASS_THEMES.length - 1,
    );
    return PASS_THEMES[themeIndex];
  }

  private buildDayBeforeDay(
    date: Date,
    daysUntil: number,
    dayIndex: number,
  ): PrepDay {
    return {
      dayIndex,
      daysUntilInterview: daysUntil,
      date: formatDateISO(date),
      theme: 'Polish — day before',
      tasks: [
        {
          id: createTaskId('daybefore', 0),
          type: PrepTaskType.DAY_BEFORE,
          title: 'Re-mock 3 weakest answers only',
          durationMinutes: 30,
          priority: GapPriority.P1,
          impactScore: 2,
          done: false,
        },
        {
          id: createTaskId('daybefore', 1),
          type: PrepTaskType.DAY_BEFORE,
          title: 'Review cheat sheet & questions for interviewer',
          durationMinutes: 20,
          priority: GapPriority.P1,
          impactScore: 1.8,
          done: false,
        },
        {
          id: createTaskId('daybefore', 2),
          type: PrepTaskType.DAY_BEFORE,
          title: 'Logistics: tech check, outfit, route/link',
          durationMinutes: 15,
          priority: GapPriority.P2,
          impactScore: 1,
          done: false,
        },
      ],
    };
  }

  private buildMockReviewDay(
    date: Date,
    daysUntil: number,
    dayIndex: number,
    tasks: PrepTask[],
  ): PrepDay {
    const weakTasks = tasks
      .filter((t) => t.type === PrepTaskType.QUESTION_PRACTICE)
      .slice(0, 3);

    return {
      dayIndex,
      daysUntilInterview: daysUntil,
      date: formatDateISO(date),
      theme: 'Simulate — weak areas',
      tasks: [
        {
          id: createTaskId('mockreview', 0),
          type: PrepTaskType.MOCK_DRILL,
          title: 'Re-practice lowest-scored questions',
          durationMinutes: 45,
          priority: GapPriority.P1,
          impactScore: 2.2,
          done: false,
        },
        ...weakTasks.map((t, i) => ({
          ...t,
          id: createTaskId('weak', i),
          done: false,
        })),
      ],
    };
  }

  private buildInterviewDay(date: Date, processMap: ProcessMap): PrepDay {
    const roundSummary = processMap.rounds
      .map((r) => r.label)
      .join(', ');

    return {
      dayIndex: -1,
      daysUntilInterview: 0,
      date: formatDateISO(date),
      theme: 'Interview day',
      tasks: [
        {
          id: createTaskId('interview', 0),
          type: PrepTaskType.INTERVIEW_DAY,
          title: `Quick review: ${roundSummary}`,
          durationMinutes: 20,
          priority: GapPriority.P1,
          impactScore: 1,
          done: false,
        },
        {
          id: createTaskId('interview', 1),
          type: PrepTaskType.INTERVIEW_DAY,
          title: 'Recall 3 STAR headlines — no new learning',
          durationMinutes: 10,
          priority: GapPriority.P1,
          impactScore: 1,
          done: false,
        },
      ],
    };
  }

  rankQuestions(
    questionIds: RankedQuestion[],
    gaps: GapItem[],
    limit: number,
  ): RankedQuestion[] {
    const gapSkills = new Set(gaps.map((g) => g.skill.toLowerCase()));

    return questionIds
      .map((q) => {
        const skillMatch = q.question
          .toLowerCase()
          .split(' ')
          .some((word) =>
            [...gapSkills].some((g) => word.includes(g) || g.includes(word)),
          );
        const boost = skillMatch ? 1.5 : 1;
        return {
          ...q,
          impactScore: q.impactScore * boost,
          priority: assignPriorityFromScore(q.impactScore * boost),
        };
      })
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit);
  }
}

function assignPriorityFromScore(score: number): GapPriority {
  if (score >= 2) return GapPriority.P1;
  if (score >= 1) return GapPriority.P2;
  return GapPriority.P3;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}
