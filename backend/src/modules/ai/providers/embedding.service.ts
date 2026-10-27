import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, TaskType } from '@google/generative-ai';
import {
  EmbeddingDefaults,
  EmbeddingEnv,
  EmbeddingProvider,
  EmbeddingProviderValue,
} from '../constants/embedding.constants';
import { OpenRouterService } from './openrouter.service';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private googleClient: GoogleGenerativeAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly openRouterService: OpenRouterService,
  ) {}

  isEnabled(): boolean {
    return (
      this.configService.get<string>(
        EmbeddingEnv.ENABLED,
        EmbeddingDefaults.ENABLED,
      ) !== 'false'
    );
  }

  getProvider(): EmbeddingProviderValue {
    const raw = (
      this.configService.get<string>(EmbeddingEnv.PROVIDER) ||
      EmbeddingDefaults.PROVIDER
    ).toLowerCase();

    if (raw === EmbeddingProvider.OpenRouter) {
      return EmbeddingProvider.OpenRouter;
    }
    return EmbeddingProvider.Google;
  }

  getModel(): string {
    if (this.getProvider() === EmbeddingProvider.OpenRouter) {
      return (
        this.configService.get<string>(EmbeddingEnv.OPENROUTER_MODEL) ||
        EmbeddingDefaults.OPENROUTER_MODEL
      );
    }
    return (
      this.configService.get<string>(EmbeddingEnv.GOOGLE_MODEL) ||
      EmbeddingDefaults.GOOGLE_MODEL
    );
  }

  /** Must match question_bank.embedding vector(N) after migration 0006. */
  getDimensions(): number {
    const fromEnv = this.configService.get<string>('AI_EMBEDDING_DIMENSIONS');
    if (fromEnv) return Number(fromEnv);
    return EmbeddingDefaults.DIMENSIONS;
  }

  canEmbed(): boolean {
    if (!this.isEnabled()) return false;
    if (this.getProvider() === EmbeddingProvider.OpenRouter) {
      return this.openRouterService.isConfigured();
    }
    return Boolean(this.configService.get<string>('GOOGLE_AI_API_KEY'));
  }

  async embedTexts(texts: string[]): Promise<number[][]> {
    if (!this.canEmbed()) {
      throw new Error(
        'Embeddings unavailable — set GOOGLE_AI_API_KEY (provider=google) or OPENROUTER_API_KEY (provider=openrouter)',
      );
    }

    const vectors =
      this.getProvider() === EmbeddingProvider.OpenRouter
        ? await this.openRouterService.embedTexts(texts, this.getModel())
        : await this.embedWithGoogle(texts);

    const expected = this.getDimensions();
    for (const vector of vectors) {
      if (vector.length !== expected) {
        throw new Error(
          `Embedding dim ${vector.length} != expected ${expected} (model=${this.getModel()}, check AI_EMBEDDING_DIMENSIONS / migration)`,
        );
      }
    }

    return vectors;
  }

  async embedQuery(text: string): Promise<number[]> {
    const [vector] = await this.embedTexts([text]);
    return vector;
  }

  toVectorLiteral(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  private getGoogleClient(): GoogleGenerativeAI {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY is not configured');
    }
    if (!this.googleClient) {
      this.googleClient = new GoogleGenerativeAI(apiKey);
    }
    return this.googleClient;
  }

  private async embedWithGoogle(texts: string[]): Promise<number[][]> {
    const modelName = this.getModel();
    this.logger.log(
      `[EMBED] google_call model=${modelName} batch=${texts.length}`,
    );

    const model = this.getGoogleClient().getGenerativeModel({
      model: modelName,
    });

    // batchEmbedContents — free-tier friendly vs N round-trips
    const result = await model.batchEmbedContents({
      requests: texts.map((text) => ({
        content: { role: 'user', parts: [{ text }] },
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      })),
    });

    const embeddings = result.embeddings ?? [];
    if (embeddings.length !== texts.length) {
      throw new Error(
        `Google embed batch size mismatch: got ${embeddings.length}, expected ${texts.length}`,
      );
    }

    return embeddings.map((row) => {
      const values = row.values;
      if (!values?.length) {
        throw new Error('Empty embedding from Google AI');
      }
      return values;
    });
  }
}
