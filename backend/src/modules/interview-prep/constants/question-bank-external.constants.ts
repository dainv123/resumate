/** MIT external supplements — never replace curated core. */
export const QUESTION_BANK_EXTERNAL_SOURCE = {
  FAQGURU: 'external:faqguru',
  MLDS_KAGGLE: 'external:mlds-kaggle',
  MLDS_AJIT: 'external:mlds-ajit',
} as const;

export const QUESTION_BANK_EXTERNAL_SEED_FILES = [
  'question-bank-external-faqguru.seed.json',
  'question-bank-external-mlds.seed.json',
] as const;

export const QUESTION_BANK_EXTERNAL_ATTRIBUTION = {
  faqguru: {
    name: 'FAQGURU',
    url: 'https://github.com/FAQGURU/FAQGURU',
    license: 'MIT',
  },
  mldsKaggle: {
    name: 'ML & DS Coding Interview Question Bank (Kaggle / HF mirror)',
    url: 'https://www.kaggle.com/datasets/shamimhasan8/ml-and-ds-coding-interview-question-bank',
    hf: 'https://huggingface.co/datasets/haoxianc/shamimhasan8_ml-and-ds-coding-interview-question-bank',
    license: 'MIT',
    note: 'HF CSV has only ~20 unique questions (Sample N repeats); importer dedupes.',
  },
  mldsAjit: {
    name: 'Data Science Interview Questions & Answers',
    url: 'https://github.com/ajitsingh98/Data-Science-Interview-Questions-Answers',
    license: 'MIT',
    note: 'Primary Data/ML pack content (structured ### Q: markdown).',
  },
} as const;

/** FAQGURU topics (en) mapped into software-engineer skill tags */
export const FAQGURU_TOPIC_FILES = [
  'javascript.md',
  'react.md',
  'nodejs.md',
  'typeScript.md',
  'sql.md',
  'data-structures.md',
  'design-patterns.md',
  'aws.md',
  'git.md',
  'graphql.md',
  'mongodb.md',
  'css.md',
  'html5.md',
] as const;

/** Ajit DS repo markdown files for Data pack */
export const MLDS_AJIT_TOPIC_FILES = [
  'machine_learning_fundamentals.md',
  'deep_learning_fundamentals.md',
  'descriptive_statistics.md',
  'inferential_statistics.md',
  'probability.md',
  'sql_for_data_science.md',
  'feature_engineering_and_selection.md',
  'performance_metrics.md',
  'linear_regression_and_regularization.md',
  'logistic_regression_and_classification.md',
  'natural_language_processing_and_llms.md',
  'machine_learning_system_design.md',
  'computer_science_and_coding.md',
] as const;

export const EXTERNAL_IMPORT_DEFAULTS = {
  faqguruMax: 250,
  mldsMax: 300,
} as const;

export const EXTERNAL_DEFAULT_RUBRIC = {
  excellent: [
    'Accurate definition with trade-offs and a concrete example',
  ],
  good: ['Correct high-level answer missing depth or example'],
  weak: ['Vague or incorrect explanation'],
} as const;

export const EXTERNAL_DEFAULT_OUTLINE = [
  'Define the concept',
  'When / why it matters',
  'Trade-offs or pitfalls',
  'Example from experience',
] as const;

export const EXTERNAL_DEFAULT_FOLLOW_UPS = [
  'Can you give a practical example?',
  'What are the trade-offs?',
] as const;
