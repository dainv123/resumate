import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GapPriority,
  QuestionFrequency,
  QuestionLevel,
} from '../constants/interview-prep.constants';
import { assignGapPriority, GapItem, RankedQuestion } from '../domain/pass-framework';
import { QuestionBank } from '../entities/question-bank.entity';
import { DailySchedulerService } from './daily-scheduler.service';

const FREQUENCY_BOOST: Record<QuestionFrequency, number> = {
  [QuestionFrequency.VERY_COMMON]: 1.4,
  [QuestionFrequency.COMMON]: 1.1,
  [QuestionFrequency.OCCASIONAL]: 0.9,
};

const DEFAULT_QUESTION_LIMIT = 15;

@Injectable()
export class QuestionSelectorService {
  constructor(
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
    private dailySchedulerService: DailySchedulerService,
  ) {}

  async selectFromBank(
    jobDescription: string,
    gaps: GapItem[],
    limit = DEFAULT_QUESTION_LIMIT,
  ): Promise<RankedQuestion[]> {
    const level = this.inferLevelFromJd(jobDescription);
    const jdSkills = this.extractMentionedSkills(jobDescription);
    const gapSkills = gaps.map((g) => g.skill.toLowerCase());
    const targetSkills = new Set([...jdSkills, ...gapSkills]);

    const allQuestions = await this.questionBankRepository.find();
    const eligibleLevels = this.eligibleLevels(level);

    const scored = allQuestions
      .filter((q) => eligibleLevels.includes(q.level as QuestionLevel))
      .map((q) => {
        const skillMatch = q.skillTags.filter((tag) =>
          [...targetSkills].some(
            (s) =>
              tag.toLowerCase().includes(s) ||
              s.includes(tag.toLowerCase()),
          ),
        ).length;
        const gapBoost = gaps.some((g) =>
          q.skillTags.some(
            (t) =>
              t.toLowerCase() === g.skill.toLowerCase() &&
              g.priority === 'P1',
          ),
        )
          ? 1.5
          : 1;
        const frequencyBoost =
          FREQUENCY_BOOST[q.frequency as QuestionFrequency] ?? 1;
        const impactScore =
          (1 + skillMatch * 0.8) * gapBoost * frequencyBoost;

        return {
          questionId: q.id,
          question: q.question,
          category: q.category,
          impactScore,
          priority: assignGapPriority(impactScore),
          prepTimeMinutes: q.prepTimeMinutes,
        } satisfies RankedQuestion;
      });

    return this.dailySchedulerService.rankQuestions(scored, gaps, limit);
  }

  inferLevelFromJd(jobDescription: string): QuestionLevel {
    const lower = jobDescription.toLowerCase();
    if (/\b(principal|staff|lead|architect)\b/.test(lower)) {
      return QuestionLevel.LEAD;
    }
    if (/\bsenior\b/.test(lower)) return QuestionLevel.SENIOR;
    if (/\b(junior|intern|graduate|entry)\b/.test(lower)) {
      return QuestionLevel.JUNIOR;
    }
    return QuestionLevel.MID;
  }

  private eligibleLevels(level: QuestionLevel): QuestionLevel[] {
    const order = [
      QuestionLevel.JUNIOR,
      QuestionLevel.MID,
      QuestionLevel.SENIOR,
      QuestionLevel.LEAD,
    ];
    const idx = order.indexOf(level);
    const result = new Set<QuestionLevel>([level]);
    if (idx > 0) result.add(order[idx - 1]);
    if (idx < order.length - 1) result.add(order[idx + 1]);
    return [...result];
  }

  private extractMentionedSkills(jobDescription: string): string[] {
    const lower = jobDescription.toLowerCase();
    const skills = [
      'react',
      'typescript',
      'javascript',
      'node.js',
      'python',
      'aws',
      'docker',
      'kubernetes',
      'postgresql',
      'system design',
      'leadership',
      'communication',
      'graphql',
      'next.js',
    ];
    return skills.filter((s) => lower.includes(s));
  }
}
