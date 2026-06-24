import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  DEFAULT_OPENROUTER_CV_MODEL,
  OPENROUTER_API_BASE_URL,
  OPENROUTER_APP_TITLE,
  OPENROUTER_CV_PARSE_MAX_TOKENS,
} from '../constants/ai-provider.constants';

@Injectable()
export class OpenRouterService {
  private readonly logger = new Logger(OpenRouterService.name);
  private client: OpenAI | null = null;

  constructor(private configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('OPENROUTER_API_KEY'));
  }

  private getModel(): string {
    return (
      this.configService.get<string>('OPENROUTER_MODEL') ||
      DEFAULT_OPENROUTER_CV_MODEL
    );
  }

  private getClient(): OpenAI {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }

    if (!this.client) {
      this.client = new OpenAI({
        apiKey,
        baseURL: OPENROUTER_API_BASE_URL,
        defaultHeaders: {
          'HTTP-Referer':
            this.configService.get<string>('FRONTEND_URL') ||
            'https://resumate.click',
          'X-Title': OPENROUTER_APP_TITLE,
        },
      });
    }

    return this.client;
  }

  async generateText(prompt: string): Promise<string> {
    const model = this.getModel();
    this.logger.log(
      `[CV_PARSE] openrouter_call model=${model} promptChars=${prompt.length}`,
    );

    const completion = await this.getClient().chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: OPENROUTER_CV_PARSE_MAX_TOKENS,
    });

    const text = completion.choices[0]?.message?.content ?? '';
    if (!text) {
      throw new Error('Empty response from OpenRouter');
    }

    return text;
  }
}
