import { CheatSheetExportService } from './cheat-sheet-export.service';
import { PlanStarStory } from '../../domain/interview-prep-ai.types';

describe('CheatSheetExportService', () => {
  let service: CheatSheetExportService;

  const sampleData = {
    interviewDate: '2026-07-01',
    readinessScore: 72,
    starStories: [
      {
        id: 'star-1',
        question: 'Tell me about a challenge',
        mapsToQuestions: [],
        situation: 'Situation text',
        task: 'Task text',
        action: 'Action text',
        result: 'Result text',
        projectRef: 'Project X',
        ready: true,
      },
    ] as PlanStarStory[],
    projectDefenses: [],
    questions: [{ priority: 'P1', text: 'Explain React hooks' }],
    roadmap: [
      {
        dayIndex: 0,
        daysUntilInterview: 1,
        date: '2026-06-30',
        theme: 'Polish',
        tasks: [
          {
            id: 't1',
            type: 'day_before',
            title: 'Review cheat sheet',
            durationMinutes: 30,
            priority: 'P1' as const,
            impactScore: 2,
            done: false,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    service = new CheatSheetExportService();
  });

  it('builds HTML with STAR stories and questions', () => {
    const html = service.buildHtml(sampleData);

    expect(html).toContain('Interview Cheat Sheet');
    expect(html).toContain('Tell me about a challenge');
    expect(html).toContain('Explain React hooks');
    expect(html).toContain('Readiness: 72/100');
  });

  it('escapes HTML in user content', () => {
    const html = service.buildHtml({
      ...sampleData,
      questions: [{ priority: 'P1', text: '<script>alert(1)</script>' }],
    });

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
