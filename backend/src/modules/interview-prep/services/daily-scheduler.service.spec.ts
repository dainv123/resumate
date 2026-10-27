import { Test, TestingModule } from '@nestjs/testing';
import { DailySchedulerService } from './daily-scheduler.service';
import {
  defaultProcessMap,
  GapItem,
  ProcessMap,
  RankedQuestion,
} from '../domain/pass-framework';
import {
  GapPriority,
  PrepTaskType,
} from '../constants/interview-prep.constants';

describe('DailySchedulerService', () => {
  let service: DailySchedulerService;

  const processMap: ProcessMap = defaultProcessMap();

  const sampleGaps: GapItem[] = [
    {
      skill: 'AWS',
      jdMentions: 3,
      currentLevel: 'missing',
      impactScore: 3,
      priority: GapPriority.P1,
      roundType: 'technical' as any,
    },
    {
      skill: 'React',
      jdMentions: 2,
      currentLevel: 'strong',
      impactScore: 0.5,
      priority: GapPriority.P3,
      roundType: 'technical' as any,
    },
  ];

  const sampleQuestions: RankedQuestion[] = [
    {
      questionId: 'fe-react-hooks-002',
      question: 'Explain useEffect vs useLayoutEffect',
      category: 'technical',
      impactScore: 2,
      priority: GapPriority.P1,
      prepTimeMinutes: 20,
    },
    {
      questionId: 'beh-conflict-003',
      question: 'Describe a conflict with a teammate',
      category: 'behavioral',
      impactScore: 1.5,
      priority: GapPriority.P2,
      prepTimeMinutes: 20,
    },
    {
      questionId: 'fe-react-state-001',
      question: 'How do you manage complex client state?',
      category: 'technical',
      impactScore: 2.2,
      priority: GapPriority.P1,
      prepTimeMinutes: 20,
    },
    {
      questionId: 'sys-scale-001',
      question: 'Design a URL shortener',
      category: 'system-design',
      impactScore: 2.1,
      priority: GapPriority.P1,
      prepTimeMinutes: 20,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailySchedulerService],
    }).compile();

    service = module.get(DailySchedulerService);
  });

  it('builds roadmap with interview day at the end', () => {
    const today = new Date('2026-06-01');
    const interviewDate = new Date('2026-06-08');

    const roadmap = service.buildRoadmap({
      interviewDate,
      today,
      dailyCapacityMinutes: 90,
      gaps: sampleGaps,
      questions: sampleQuestions,
      processMap,
    });

    const lastDay = roadmap[roadmap.length - 1];
    expect(lastDay.daysUntilInterview).toBe(0);
    expect(lastDay.theme).toBe('Interview day');
    expect(lastDay.tasks.some((t) => t.type === 'interview_day')).toBe(true);
  });

  it('puts P1 question-practice tasks on day 1', () => {
    const today = new Date('2026-06-01');
    const interviewDate = new Date('2026-06-08');

    const roadmap = service.buildRoadmap({
      interviewDate,
      today,
      dailyCapacityMinutes: 60,
      gaps: sampleGaps,
      questions: sampleQuestions,
      processMap,
    });

    const day1 = roadmap.find((d) => d.dayIndex === 0);
    expect(day1).toBeDefined();

    const day1P1Questions = day1!.tasks.filter(
      (t) =>
        t.type === PrepTaskType.QUESTION_PRACTICE &&
        t.priority === GapPriority.P1,
    );
    expect(day1P1Questions.length).toBeGreaterThanOrEqual(2);
    expect(day1P1Questions[0].title).toMatch(/^Practice:/);
  });

  it('schedules P1 gap tasks before lower priority in crash course', () => {
    const today = new Date('2026-06-05');
    const interviewDate = new Date('2026-06-08');

    const roadmap = service.buildRoadmap({
      interviewDate,
      today,
      dailyCapacityMinutes: 120,
      gaps: sampleGaps,
      questions: sampleQuestions,
      processMap,
    });

    const allTasks = roadmap.flatMap((d) => d.tasks);
    const gapTasks = allTasks.filter((t) => t.type === 'gap_study');
    const awsTask = gapTasks.find((t) => t.refId === 'AWS');

    expect(awsTask).toBeDefined();
    expect(awsTask?.priority).toBe(GapPriority.P1);
  });

  it('includes day-before tasks with no new learning', () => {
    const today = new Date('2026-06-01');
    const interviewDate = new Date('2026-06-08');

    const roadmap = service.buildRoadmap({
      interviewDate,
      today,
      dailyCapacityMinutes: 60,
      gaps: sampleGaps,
      questions: sampleQuestions,
      processMap,
    });

    const dayBefore = roadmap.find((d) => d.daysUntilInterview === 1);
    expect(dayBefore).toBeDefined();
    expect(dayBefore!.tasks.some((t) => t.type === 'day_before')).toBe(true);
  });

  it('respects daily capacity — days should not exceed capacity wildly', () => {
    const today = new Date('2026-06-01');
    const interviewDate = new Date('2026-06-15');
    const capacity = 30;

    const roadmap = service.buildRoadmap({
      interviewDate,
      today,
      dailyCapacityMinutes: capacity,
      gaps: sampleGaps,
      questions: sampleQuestions,
      processMap,
    });

    const regularDays = roadmap.filter(
      (d) =>
        d.daysUntilInterview > 2 &&
        !d.theme.startsWith('Simulate') &&
        !d.theme.startsWith('Polish') &&
        d.daysUntilInterview < 14,
    );

    for (const day of regularDays) {
      const totalMinutes = day.tasks.reduce(
        (sum, t) => sum + t.durationMinutes,
        0,
      );
      expect(totalMinutes).toBeLessThanOrEqual(capacity + 30);
    }
  });

  it('ranks questions by impact with gap skill boost', () => {
    const ranked = service.rankQuestions(sampleQuestions, sampleGaps, 10);
    expect(ranked.length).toBeLessThanOrEqual(10);
    expect(ranked[0].impactScore).toBeGreaterThanOrEqual(
      ranked[1]?.impactScore ?? 0,
    );
  });
});
