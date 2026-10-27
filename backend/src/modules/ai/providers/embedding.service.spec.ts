import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from './embedding.service';
import { OpenRouterService } from './openrouter.service';

describe('EmbeddingService', () => {
  it('defaults to google provider and 768 dims', () => {
    const config = {
      get: jest.fn((key: string, fallback?: string) => fallback),
    } as unknown as ConfigService;
    const openRouter = {
      isConfigured: jest.fn().mockReturnValue(false),
    } as unknown as OpenRouterService;

    const service = new EmbeddingService(config, openRouter);

    expect(service.getProvider()).toBe('google');
    expect(service.getDimensions()).toBe(768);
    expect(service.getModel()).toBe('text-embedding-004');
  });

  it('canEmbed is true for google when GOOGLE_AI_API_KEY set', () => {
    const config = {
      get: jest.fn((key: string, fallback?: string) => {
        if (key === 'GOOGLE_AI_API_KEY') return 'test-key';
        if (key === 'AI_EMBEDDING_PROVIDER') return 'google';
        if (key === 'AI_EMBEDDING_ENABLED') return 'true';
        return fallback;
      }),
    } as unknown as ConfigService;

    const service = new EmbeddingService(config, {
      isConfigured: () => false,
    } as OpenRouterService);

    expect(service.canEmbed()).toBe(true);
  });
});
