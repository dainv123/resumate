export const QUESTION_BANK_ENRICH_SOURCE = 'ai-enriched';

export const QUESTION_BANK_SEED_FILES = [
  'question-bank.seed.json',
  'question-bank-p2.seed.json',
  'question-bank-expansion.seed.json',
] as const;

export const QUESTION_BANK_ENRICH_BATCH_SIZE = 5;

export const QUESTION_BANK_TEMPLATE_RUBRIC_EXCELLENT = [
  'Structured answer with concrete example and measurable outcome',
  'Clear structure',
  'Requirements, scale, API, data model, bottlenecks, trade-offs',
] as const;
