import { normalizeCompatibilityAnalysis } from './normalize-compatibility';

describe('normalizeCompatibilityAnalysis', () => {
  it('turns omitted and null skill lists into arrays and rounds fractional scores', () => {
    const result = normalizeCompatibilityAnalysis({
      score: 7.5,
      matchedSkills: null as unknown as string[],
      missingSkills: undefined,
      suggestions: 'Add Kubernetes, quantify impact',
      strengths: ['Systems design'],
    });

    expect(result.score).toBe(8);
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual([]);
    expect(result.matchedExperience).toEqual([]);
    expect(result.missingRequirements).toEqual([]);
    expect(result.suggestions).toEqual([
      'Add Kubernetes',
      'quantify impact',
    ]);
    expect(result.strengths).toEqual(['Systems design']);
  });

  it('parses numeric score strings and drops non-string list entries', () => {
    const result = normalizeCompatibilityAnalysis({
      score: '8' as unknown as number,
      matchedSkills: ['React', '', { name: 'AWS' } as unknown as string, 3],
      missingSkills: 'PostgreSQL',
    });

    expect(result.score).toBe(8);
    expect(result.matchedSkills).toEqual(['React', '3']);
    expect(result.missingSkills).toEqual(['PostgreSQL']);
  });

  it('uses zero when the score is not a number', () => {
    expect(normalizeCompatibilityAnalysis({ score: 'high' as unknown as number }).score).toBe(0);
    expect(normalizeCompatibilityAnalysis(null).score).toBe(0);
  });
});
