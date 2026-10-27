import { SpacedRepetitionService } from './spaced-repetition.service';
import { GapPriority, PrepTaskType } from '../constants/interview-prep.constants';
import { PrepDay } from '../domain/pass-framework';

describe('SpacedRepetitionService', () => {
  let service: SpacedRepetitionService;

  const baseRoadmap: PrepDay[] = [
    {
      dayIndex: 0,
      daysUntilInterview: 3,
      date: '2026-06-25',
      theme: 'Practice',
      tasks: [],
    },
    {
      dayIndex: 1,
      daysUntilInterview: 2,
      date: '2026-06-26',
      theme: 'Simulate',
      tasks: [],
    },
    {
      dayIndex: 2,
      daysUntilInterview: 1,
      date: '2026-06-27',
      theme: 'Polish',
      tasks: [],
    },
  ];

  beforeEach(() => {
    service = new SpacedRepetitionService();
  });

  it('adds retry tasks on D-2 and D-1 for weak questions', () => {
    const result = service.injectWeakQuestionRetries(baseRoadmap, [
      {
        questionId: 'fe-react-hooks-002',
        title: 'Explain useEffect',
        prepTimeMinutes: 20,
      },
    ]);

    const d2 = result.find((d) => d.daysUntilInterview === 2);
    const d1 = result.find((d) => d.daysUntilInterview === 1);

    expect(d2?.tasks.some((t) => t.refId === 'fe-react-hooks-002')).toBe(true);
    expect(d1?.tasks.some((t) => t.refId === 'fe-react-hooks-002')).toBe(true);
    expect(d2?.tasks[0].priority).toBe(GapPriority.P1);
    expect(d2?.tasks[0].type).toBe(PrepTaskType.QUESTION_PRACTICE);
  });

  it('does not duplicate retry for same question on same day', () => {
    const withExisting: PrepDay[] = [
      {
        ...baseRoadmap[1],
        tasks: [
          {
            id: 'existing',
            type: PrepTaskType.QUESTION_PRACTICE,
            title: 'Practice: React',
            durationMinutes: 20,
            priority: GapPriority.P1,
            impactScore: 2,
            refId: 'fe-react-hooks-002',
            done: false,
          },
        ],
      },
    ];

    const result = service.injectWeakQuestionRetries(
      [baseRoadmap[0], ...withExisting, baseRoadmap[2]],
      [
        {
          questionId: 'fe-react-hooks-002',
          title: 'Explain useEffect',
          prepTimeMinutes: 20,
        },
      ],
    );

    const d2 = result.find((d) => d.daysUntilInterview === 2);
    expect(
      d2?.tasks.filter((t) => t.refId === 'fe-react-hooks-002').length,
    ).toBe(1);
  });

  it('collects assignments with score below threshold', () => {
    const weak = service.collectWeakQuestions(
      [
        {
          questionId: 'q1',
          mockScores: [{ score: 5 }],
        },
        {
          questionId: 'q2',
          mockScores: [{ score: 8 }],
        },
      ],
      {
        q1: { title: 'Question 1', prepTimeMinutes: 15 },
      },
    );

    expect(weak).toHaveLength(1);
    expect(weak[0].questionId).toBe('q1');
  });
});
