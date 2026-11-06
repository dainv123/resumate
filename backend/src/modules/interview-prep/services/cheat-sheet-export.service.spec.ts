import * as fs from 'fs';
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

  it('gives concurrent cheat sheet exports distinct temp files', async () => {
    const writes: Array<{ file: string; html: string }> = [];
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    jest
      .spyOn(fs.promises, 'writeFile')
      .mockImplementation(async (file, data) => {
        writes.push({ file: String(file), html: String(data) });
      });
    jest.spyOn(fs.promises, 'unlink').mockResolvedValue(undefined);

    const alice = {
      ...sampleData,
      starStories: [
        {
          ...sampleData.starStories[0],
          situation: 'Alice shipped the migration',
        },
      ],
    };
    const bob = {
      ...sampleData,
      starStories: [
        {
          ...sampleData.starStories[0],
          situation: 'Bob kept the on-call rotation',
        },
      ],
    };

    // The shared temp path is chosen before Puppeteer runs. allSettled so a
    // later render failure still leaves both writes to compare.
    await Promise.allSettled([
      service.exportToPdf(alice),
      service.exportToPdf(bob),
    ]);

    expect(writes).toHaveLength(2);
    expect(new Set(writes.map((write) => write.file)).size).toBe(2);
    expect(
      writes.every((write) =>
        /cheat-sheet-[0-9a-f-]{36}\.html$/.test(write.file),
      ),
    ).toBe(true);
    expect(
      writes.some((write) =>
        write.html.includes('Alice shipped the migration'),
      ),
    ).toBe(true);
    expect(
      writes.some((write) =>
        write.html.includes('Bob kept the on-call rotation'),
      ),
    ).toBe(true);
    expect(writes[0].html).not.toBe(writes[1].html);

    jest.restoreAllMocks();
  });
});
