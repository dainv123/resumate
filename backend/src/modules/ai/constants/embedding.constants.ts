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
  /** Free-tier friendly default (text-embedding-004 shut down Jan 2026) */
  PROVIDER: EmbeddingProvider.Google,
  GOOGLE_MODEL: 'gemini-embedding-001',
  OPENROUTER_MODEL: 'openai/text-embedding-3-small',
  /**
   * Keep 768 to match question_bank.embedding vector(768).
   * gemini-embedding-001 defaults to 3072 — request outputDimensionality=768.
   */
  DIMENSIONS: 768,
  ENABLED: 'true',
} as const;

/** OpenRouter 3-small is 1536 — only use if DB column matches */
export const OPENROUTER_EMBEDDING_3_SMALL_DIMS = 1536;

export const QUESTION_VECTOR_CANDIDATE_LIMIT = 50;
