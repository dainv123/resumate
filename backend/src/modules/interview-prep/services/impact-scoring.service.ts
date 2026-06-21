import { Injectable } from '@nestjs/common';
import {
  GapPriority,
  InterviewRoundType,
} from '../constants/interview-prep.constants';
import {
  assignGapPriority,
  computeGapImpactScore,
  GapCurrentLevel,
  GapItem,
} from '../domain/pass-framework';

export interface CompatibilityInput {
  matchedSkills: string[];
  missingSkills: string[];
}

export interface JdKeywordInput {
  skill: string;
  mentions: number;
}

@Injectable()
export class ImpactScoringService {
  scoreGaps(
    jdKeywords: JdKeywordInput[],
    compatibility: CompatibilityInput,
    primaryRound: InterviewRoundType = InterviewRoundType.TECHNICAL,
  ): GapItem[] {
    const matchedSet = new Set(
      compatibility.matchedSkills.map((s) => s.toLowerCase()),
    );

    const gaps: GapItem[] = jdKeywords.map(({ skill, mentions }) => {
      const normalized = skill.toLowerCase();
      const currentLevel = this.resolveCurrentLevel(
        normalized,
        matchedSet,
        compatibility.missingSkills,
      );
      const impactScore = computeGapImpactScore(
        mentions,
        primaryRound,
        currentLevel,
      );

      return {
        skill,
        jdMentions: mentions,
        currentLevel,
        impactScore,
        priority: assignGapPriority(impactScore),
        roundType: primaryRound,
      };
    });

    return gaps.sort((a, b) => b.impactScore - a.impactScore);
  }

  countJdMentions(jobDescription: string, skills: string[]): JdKeywordInput[] {
    const lowerJd = jobDescription.toLowerCase();
    return skills.map((skill) => ({
      skill,
      mentions: this.countOccurrences(lowerJd, skill.toLowerCase()),
    }));
  }

  extractSkillsFromText(jobDescription: string): string[] {
    const techPatterns = [
      'React',
      'Vue',
      'Angular',
      'TypeScript',
      'JavaScript',
      'Node.js',
      'Python',
      'Java',
      'Go',
      'AWS',
      'Docker',
      'Kubernetes',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'GraphQL',
      'REST',
      'System Design',
      'Leadership',
      'Communication',
      'Agile',
      'Scrum',
      'CI/CD',
      'Microservices',
      'Next.js',
      'NestJS',
    ];

    return techPatterns.filter((skill) =>
      jobDescription.toLowerCase().includes(skill.toLowerCase()),
    );
  }

  private resolveCurrentLevel(
    skill: string,
    matchedSet: Set<string>,
    missingSkills: string[],
  ): GapCurrentLevel {
    const missingSet = new Set(missingSkills.map((s) => s.toLowerCase()));
    if (missingSet.has(skill)) return 'missing';
    if (matchedSet.has(skill)) return 'strong';
    return 'weak';
  }

  private countOccurrences(text: string, term: string): number {
    if (!term) return 0;
    let count = 0;
    let index = 0;
    while ((index = text.indexOf(term, index)) !== -1) {
      count++;
      index += term.length;
    }
    return count || (text.includes(term) ? 1 : 0);
  }

  getP1Gaps(gaps: GapItem[]): GapItem[] {
    return gaps.filter((g) => g.priority === GapPriority.P1);
  }
}
