import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { QuestionBank } from '../entities/question-bank.entity';
import { QUESTION_BANK_ENRICH_SOURCE } from '../constants/question-bank-enrich.constants';
import { QUESTION_BANK_EXTERNAL_SEED_FILES } from '../constants/question-bank-external.constants';

@Injectable()
export class QuestionBankSeederService implements OnModuleInit {
  private readonly logger = new Logger(QuestionBankSeederService.name);

  constructor(
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
    await this.seedUpsertFiles([
      'question-bank-p2.seed.json',
      'question-bank-expansion.seed.json',
      ...QUESTION_BANK_EXTERNAL_SEED_FILES,
    ]);
  }

  async seedIfEmpty(): Promise<number> {
    const count = await this.questionBankRepository.count();
    if (count > 0) {
      return count;
    }

    return this.loadSeedFile('question-bank.seed.json');
  }

  async seedUpsertFiles(filenames: string[]): Promise<number> {
    let total = 0;
    for (const filename of filenames) {
      total += await this.loadSeedFile(filename, true);
    }
    return total;
  }

  /** @deprecated use seedUpsertFiles */
  async seedPhase2(): Promise<number> {
    return this.seedUpsertFiles(['question-bank-p2.seed.json']);
  }

  private async loadSeedFile(
    filename: string,
    upsert = false,
  ): Promise<number> {
    const seedPath = join(__dirname, '..', 'data', filename);
    let raw: string;
    try {
      raw = readFileSync(seedPath, 'utf-8');
    } catch {
      return 0;
    }

    const items: Partial<QuestionBank>[] = JSON.parse(raw);
    if (!upsert) {
      await this.questionBankRepository.save(items);
      this.logger.log(`Seeded ${items.length} question bank entries from ${filename}`);
      return items.length;
    }

    let inserted = 0;
    let updated = 0;
    for (const item of items) {
      const exists = await this.questionBankRepository.findOne({
        where: { id: item.id },
      });
      if (!exists) {
        await this.questionBankRepository.save(item);
        inserted += 1;
      } else if (item.source === QUESTION_BANK_ENRICH_SOURCE) {
        await this.questionBankRepository.update(item.id, {
          evaluationRubric: item.evaluationRubric,
          sampleAnswerOutline: item.sampleAnswerOutline,
          followUpQuestions: item.followUpQuestions,
          prepTimeMinutes: item.prepTimeMinutes,
          source: item.source,
        });
        updated += 1;
      }
    }
    if (inserted > 0 || updated > 0) {
      this.logger.log(
        `Question bank ${filename}: ${inserted} inserted, ${updated} enriched updates`,
      );
    }
    return inserted + updated;
  }
}
