import { Test, TestingModule } from '@nestjs/testing';
import { ImpactScoringService } from './impact-scoring.service';
import { GapPriority } from '../constants/interview-prep.constants';
import { InterviewRoundType } from '../constants/interview-prep.constants';

describe('ImpactScoringService', () => {
  let service: ImpactScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImpactScoringService],
    }).compile();

    service = module.get(ImpactScoringService);
  });

  it('scores missing skills higher than strong skills', () => {
    const jdKeywords = [
      { skill: 'React', mentions: 3 },
      { skill: 'AWS', mentions: 2 },
    ];
    const compatibility = {
      matchedSkills: ['React', 'TypeScript'],
      missingSkills: ['AWS'],
    };

    const gaps = service.scoreGaps(jdKeywords, compatibility);

    const reactGap = gaps.find((g) => g.skill === 'React');
    const awsGap = gaps.find((g) => g.skill === 'AWS');

    expect(reactGap?.currentLevel).toBe('strong');
    expect(awsGap?.currentLevel).toBe('missing');
    expect(awsGap!.impactScore).toBeGreaterThan(reactGap!.impactScore);
  });

  it('assigns P1 priority to high impact gaps', () => {
    const gaps = service.scoreGaps(
      [{ skill: 'Kubernetes', mentions: 5 }],
      { matchedSkills: [], missingSkills: ['Kubernetes'] },
      InterviewRoundType.TECHNICAL,
    );

    expect(gaps[0].priority).toBe(GapPriority.P1);
  });

  it('extracts known skills from job description text', () => {
    const jd =
      'We need React, TypeScript, Node.js, and AWS experience with Agile teams.';
    const skills = service.extractSkillsFromText(jd);

    expect(skills).toContain('React');
    expect(skills).toContain('TypeScript');
    expect(skills).toContain('AWS');
    expect(skills).toContain('Agile');
  });

  it('counts JD mentions for skills', () => {
    const jd = 'React is required. React experience with React hooks.';
    const counts = service.countJdMentions(jd, ['React']);

    expect(counts[0].mentions).toBeGreaterThanOrEqual(3);
  });

  it('returns P1 gaps only via getP1Gaps', () => {
    const gaps = service.scoreGaps(
      [
        { skill: 'React', mentions: 1 },
        { skill: 'AWS', mentions: 5 },
      ],
      {
        matchedSkills: ['React'],
        missingSkills: ['AWS'],
      },
    );

    const p1 = service.getP1Gaps(gaps);
    expect(p1.every((g) => g.priority === GapPriority.P1)).toBe(true);
    expect(p1.some((g) => g.skill === 'AWS')).toBe(true);
  });

  it('does not throw when the model omits skill arrays', () => {
    const gaps = service.scoreGaps([{ skill: 'React', mentions: 2 }], {
      matchedSkills: null as unknown as string[],
      missingSkills: undefined as unknown as string[],
    });

    expect(gaps).toHaveLength(1);
    expect(gaps[0].currentLevel).toBe('weak');
  });
});
