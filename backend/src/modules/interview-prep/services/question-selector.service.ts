import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../../ai/providers/embedding.service';
import {
  QuestionFrequency,
  QuestionLevel,
  QuestionPack,
  QUESTION_PACK_ROLE_TAG,
} from '../constants/interview-prep.constants';
import { assignGapPriority, GapItem, RankedQuestion } from '../domain/pass-framework';
import { QuestionBank } from '../entities/question-bank.entity';
import { DailySchedulerService } from './daily-scheduler.service';
import { QuestionEmbeddingService } from './question-embedding.service';

const FREQUENCY_BOOST: Record<QuestionFrequency, number> = {
  [QuestionFrequency.VERY_COMMON]: 1.4,
  [QuestionFrequency.COMMON]: 1.1,
  [QuestionFrequency.OCCASIONAL]: 0.9,
};

const DEFAULT_QUESTION_LIMIT = 15;
const MIN_EMBEDDED_FOR_RAG = 10;

@Injectable()
export class QuestionSelectorService {
  private readonly logger = new Logger(QuestionSelectorService.name);

  constructor(
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
    private dailySchedulerService: DailySchedulerService,
    private embeddingService: EmbeddingService,
    private questionEmbeddingService: QuestionEmbeddingService,
  ) {}

  async selectFromBank(
    jobDescription: string,
    gaps: GapItem[],
    options?: { limit?: number; pack?: QuestionPack },
  ): Promise<RankedQuestion[]> {
    const limit = options?.limit ?? DEFAULT_QUESTION_LIMIT;
    const level = this.inferLevelFromJd(jobDescription);
    const eligibleLevels = this.eligibleLevels(level);
    const packTag = options?.pack
      ? QUESTION_PACK_ROLE_TAG[options.pack]
      : null;

    const candidates = await this.loadCandidates(
      jobDescription,
      gaps,
      eligibleLevels,
      packTag,
    );

    const jdSkills = this.extractMentionedSkills(jobDescription);
    const gapSkills = gaps.map((g) => g.skill.toLowerCase());
    const targetSkills = new Set([...jdSkills, ...gapSkills]);

    const scored = candidates.map((q) => {
      const skillMatch = q.skillTags.filter((tag) =>
        [...targetSkills].some(
          (s) =>
            tag.toLowerCase().includes(s) || s.includes(tag.toLowerCase()),
        ),
      ).length;
      const gapBoost = gaps.some((g) =>
        q.skillTags.some(
          (t) =>
            t.toLowerCase() === g.skill.toLowerCase() && g.priority === 'P1',
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

  private async loadCandidates(
    jobDescription: string,
    gaps: GapItem[],
    eligibleLevels: QuestionLevel[],
    packTag: string | null,
  ): Promise<QuestionBank[]> {
    const useRag =
      this.embeddingService.canEmbed() &&
      (await this.questionEmbeddingService.countEmbedded()) >=
        MIN_EMBEDDED_FOR_RAG;

    if (useRag) {
      try {
        const queryText = this.questionEmbeddingService.buildQueryText(
          jobDescription,
          gaps.map((g) => g.skill),
        );
        const queryEmbedding =
          await this.embeddingService.embedQuery(queryText);
        const rows =
          await this.questionEmbeddingService.findSimilarCandidates({
            queryEmbedding,
            levels: eligibleLevels,
            packTag,
          });
        if (rows.length > 0) {
          this.logger.log(
            `RAG candidates=${rows.length} levels=${eligibleLevels.join(',')}`,
          );
          return rows;
        }
      } catch (err) {
        this.logger.warn(
          `RAG retrieval failed — fallback to full scan: ${(err as Error).message}`,
        );
      }
    }

    return this.loadLegacyCandidates(eligibleLevels, packTag);
  }

  private async loadLegacyCandidates(
    eligibleLevels: QuestionLevel[],
    packTag: string | null,
  ): Promise<QuestionBank[]> {
    let allQuestions = await this.questionBankRepository.find();
    if (packTag) {
      allQuestions = allQuestions.filter((q) =>
        q.roleTags.includes(packTag),
      );
    }
    return allQuestions.filter((q) =>
      eligibleLevels.includes(q.level as QuestionLevel),
    );
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
      'product manager',
      'product management',
      'data scientist',
      'data analyst',
      'machine learning',
      'mobile',
      'ios',
      'android',
      'devops',
      'security',
      'qa',
      'testing',
    ];
    return skills.filter((s) => lower.includes(s));
  }
}
