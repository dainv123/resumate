export const EmbeddingProvider = {
  Google: 'google',
  OpenRouter: 'openrouter',
} as const;

export type EmbeddingProviderValue =
  (typeof EmbeddingProvider)[keyof typeof EmbeddingProvider];

export const EmbeddingEnv = {
  PROVIDER: 'AI_EMBEDDING_PROVIDER',
  OPENROUTER_MODEL: 'OPENROUTER_EMBEDDING_MODEL',
  GOOGLE_MODEL: 'GOOGLE_EMBEDDING_MODEL',
  ENABLED: 'AI_EMBEDDING_ENABLED',
} as const;

export const EmbeddingDefaults = {
  /** Free-tier friendly default */
  PROVIDER: EmbeddingProvider.Google,
  GOOGLE_MODEL: 'text-embedding-004',
  OPENROUTER_MODEL: 'openai/text-embedding-3-small',
  /**
   * Default dims for Google text-embedding-004.
   * OpenRouter path must use a 768-dim model OR set AI_EMBEDDING_DIMENSIONS
   * and re-run migration to match.
   */
  DIMENSIONS: 768,
  ENABLED: 'true',
} as const;

/** OpenRouter 3-small is 1536 — only use if DB column matches */
export const OPENROUTER_EMBEDDING_3_SMALL_DIMS = 1536;

export const QUESTION_VECTOR_CANDIDATE_LIMIT = 50;
