import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmbeddingService } from '../../ai/providers/embedding.service';
import { QUESTION_VECTOR_CANDIDATE_LIMIT } from '../../ai/constants/embedding.constants';
import { QuestionLevel } from '../constants/interview-prep.constants';
import { QuestionBank } from '../entities/question-bank.entity';

const EMBED_BATCH_SIZE = 32;

@Injectable()
export class QuestionEmbeddingService {
  private readonly logger = new Logger(QuestionEmbeddingService.name);

  constructor(
    @InjectRepository(QuestionBank)
    private readonly questionBankRepository: Repository<QuestionBank>,
    private readonly embeddingService: EmbeddingService,
  ) {}

  buildDocumentText(question: QuestionBank): string {
    const skills = (question.skillTags ?? []).join(',');
    const outline = (question.sampleAnswerOutline ?? []).join('; ');
    return [
      `category:${question.category}`,
      question.subcategory ? `subcategory:${question.subcategory}` : '',
      `level:${question.level}`,
      `skills:${skills}`,
      `Q:${question.question}`,
      outline ? `outline:${outline}` : '',
    ]
      .filter(Boolean)
      .join(' | ');
  }

  buildQueryText(jobDescription: string, gapSkills: string[]): string {
    const gaps =
      gapSkills.length > 0 ? `gaps: ${gapSkills.join(', ')}` : '';
    const jd = jobDescription.slice(0, 4000);
    return [jd, gaps].filter(Boolean).join('\n');
  }

  async countEmbedded(): Promise<number> {
    const raw = await this.questionBankRepository.query(
      `SELECT COUNT(*)::int AS c FROM question_bank WHERE embedding IS NOT NULL`,
    );
    return Number(raw[0]?.c ?? 0);
  }

  async findSimilarCandidates(params: {
    queryEmbedding: number[];
    levels: QuestionLevel[];
    packTag: string | null;
    limit?: number;
  }): Promise<QuestionBank[]> {
    const limit = params.limit ?? QUESTION_VECTOR_CANDIDATE_LIMIT;
    const vector = this.embeddingService.toVectorLiteral(params.queryEmbedding);

    const rows: QuestionBank[] = await this.questionBankRepository.query(
      `
      SELECT
        id,
        category,
        subcategory,
        level,
        "roleTags",
        "skillTags",
        difficulty,
        frequency,
        question,
        "evaluationRubric",
        "sampleAnswerOutline",
        "followUpQuestions",
        "prepTimeMinutes",
        source,
        "embeddingModel",
        "embeddedAt",
        "createdAt",
        "updatedAt"
      FROM question_bank
      WHERE embedding IS NOT NULL
        AND level = ANY($2::varchar[])
        AND ($3::text IS NULL OR "roleTags" ? $3)
      ORDER BY embedding <=> $1::vector
      LIMIT $4
      `,
      [vector, params.levels, params.packTag, limit],
    );

    return rows;
  }

  async embedMissing(options?: { limit?: number }): Promise<number> {
    if (!this.embeddingService.canEmbed()) {
      this.logger.warn('Skipping embed — EmbeddingService not configured');
      return 0;
    }

    const model = this.embeddingService.getModel();
    const qb = this.questionBankRepository
      .createQueryBuilder('q')
      .where('q.embeddedAt IS NULL')
      .orderBy('q.id', 'ASC');

    if (options?.limit) {
      qb.take(options.limit);
    }

    const pending = await qb.getMany();
    if (pending.length === 0) {
      this.logger.log('No questions pending embedding');
      return 0;
    }

    let done = 0;
    for (let i = 0; i < pending.length; i += EMBED_BATCH_SIZE) {
      const batch = pending.slice(i, i + EMBED_BATCH_SIZE);
      const texts = batch.map((q) => this.buildDocumentText(q));
      const vectors = await this.embeddingService.embedTexts(texts);

      for (let j = 0; j < batch.length; j++) {
        const literal = this.embeddingService.toVectorLiteral(vectors[j]);
        await this.questionBankRepository.query(
          `
          UPDATE question_bank
          SET embedding = $1::vector,
              "embeddingModel" = $2,
              "embeddedAt" = NOW()
          WHERE id = $3
          `,
          [literal, model, batch[j].id],
        );
        done += 1;
      }

      this.logger.log(
        `Embedded ${done}/${pending.length} questions (model=${model})`,
      );
    }

    return done;
  }
}
