import {
  assignGapPriority,
  computeGapImpactScore,
  countDaysUntilInterview,
  defaultProcessMap,
} from './pass-framework';
import {
  GapPriority,
  InterviewRoundType,
} from '../constants/interview-prep.constants';

describe('pass-framework', () => {
  describe('computeGapImpactScore', () => {
    it('returns higher score for missing skills', () => {
      const missing = computeGapImpactScore(
        3,
        InterviewRoundType.TECHNICAL,
        'missing',
      );
      const strong = computeGapImpactScore(
        3,
        InterviewRoundType.TECHNICAL,
        'strong',
      );
      expect(missing).toBeGreaterThan(strong);
    });
  });

  describe('assignGapPriority', () => {
    it('maps impact scores to P1/P2/P3', () => {
      expect(assignGapPriority(2.5)).toBe(GapPriority.P1);
      expect(assignGapPriority(1.2)).toBe(GapPriority.P2);
      expect(assignGapPriority(0.5)).toBe(GapPriority.P3);
    });
  });

  describe('countDaysUntilInterview', () => {
    it('counts days between today and interview', () => {
      const today = new Date('2026-06-01');
      const interview = new Date('2026-06-08');
      expect(countDaysUntilInterview(interview, today)).toBe(7);
    });

    it('returns 0 for same day interview', () => {
      const d = new Date('2026-06-08');
      expect(countDaysUntilInterview(d, d)).toBe(0);
    });
  });

  describe('defaultProcessMap', () => {
    it('includes HR, technical, and hiring manager rounds', () => {
      const map = defaultProcessMap();
      expect(map.rounds.length).toBe(3);
      expect(map.rounds.map((r) => r.type)).toContain(
        InterviewRoundType.TECHNICAL,
      );
    });
  });
});
