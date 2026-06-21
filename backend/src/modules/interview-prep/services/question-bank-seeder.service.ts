import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { QuestionBank } from '../entities/question-bank.entity';

@Injectable()
export class QuestionBankSeederService implements OnModuleInit {
  private readonly logger = new Logger(QuestionBankSeederService.name);

  constructor(
    @InjectRepository(QuestionBank)
    private questionBankRepository: Repository<QuestionBank>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<number> {
    const count = await this.questionBankRepository.count();
    if (count > 0) {
      return count;
    }

    const seedPath = join(__dirname, '..', 'data', 'question-bank.seed.json');
    const raw = readFileSync(seedPath, 'utf-8');
    const items: Partial<QuestionBank>[] = JSON.parse(raw);

    await this.questionBankRepository.save(items);
    this.logger.log(`Seeded ${items.length} question bank entries`);
    return items.length;
  }
}
