export const AiCvParseProvider = {
  Google: 'google',
  OpenRouter: 'openrouter',
} as const;

export type AiCvParseProviderValue =
  (typeof AiCvParseProvider)[keyof typeof AiCvParseProvider];

export const OPENROUTER_API_BASE_URL = 'https://openrouter.ai/api/v1';

export const DEFAULT_OPENROUTER_CV_MODEL = 'google/gemini-2.5-flash';

export const OPENROUTER_MAX_TOKENS = 4096;

/** @deprecated use OPENROUTER_MAX_TOKENS */
export const OPENROUTER_CV_PARSE_MAX_TOKENS = OPENROUTER_MAX_TOKENS;

export const OPENROUTER_APP_TITLE = 'Resumate';

export {
  EmbeddingDefaults,
  EmbeddingEnv,
  EmbeddingProvider,
} from './embedding.constants';
