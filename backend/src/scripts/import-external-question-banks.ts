/**
 * Import MIT external question banks as supplements (does not replace curated seeds).
 *
 * Sources:
 *  - FAQGURU (MIT) — general SE FAQ topics
 *  - Ajit DS Q&A (MIT) — primary Data/ML pack
 *  - HF/Kaggle ML-DS CSV (MIT) — deduped unique rows only (~20; low diversity)
 *
 * Usage (from backend/):
 *   npm run import:external-question-banks
 *   npm run import:external-question-banks -- --faqguru-max 200 --mlds-max 250
 *
 * Writes:
 *   data/question-bank-external-faqguru.seed.json
 *   data/question-bank-external-mlds.seed.json
 *   data/EXTERNAL_ATTRIBUTION.md
 *
 * Then restart API (seeder upserts) and optionally:
 *   npm run backfill:question-embeddings
 */
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  EXTERNAL_DEFAULT_FOLLOW_UPS,
  EXTERNAL_DEFAULT_OUTLINE,
  EXTERNAL_DEFAULT_RUBRIC,
  EXTERNAL_IMPORT_DEFAULTS,
  FAQGURU_TOPIC_FILES,
  MLDS_AJIT_TOPIC_FILES,
  QUESTION_BANK_EXTERNAL_ATTRIBUTION,
  QUESTION_BANK_EXTERNAL_SOURCE,
} from '../modules/interview-prep/constants/question-bank-external.constants';
import { QUESTION_BANK_SEED_FILES } from '../modules/interview-prep/constants/question-bank-enrich.constants';

type SeedQuestion = {
  id: string;
  category: string;
  subcategory: string;
  level: string;
  roleTags: string[];
  skillTags: string[];
  difficulty: number;
  frequency: string;
  question: string;
  evaluationRubric: typeof EXTERNAL_DEFAULT_RUBRIC;
  sampleAnswerOutline: string[];
  followUpQuestions: string[];
  prepTimeMinutes: number;
  source: string;
};

const DATA_DIR = join(
  __dirname,
  '..',
  'modules',
  'interview-prep',
  'data',
);
const RAW_DIR = join(DATA_DIR, 'external-raw');

const FAQGURU_BASE =
  'https://raw.githubusercontent.com/FAQGURU/FAQGURU/master/topics/en';
const AJIT_BASE =
  'https://raw.githubusercontent.com/ajitsingh98/Data-Science-Interview-Questions-Answers/main';
const MLDS_CSV_URL =
  'https://huggingface.co/datasets/haoxianc/shamimhasan8_ml-and-ds-coding-interview-question-bank/resolve/main/coding_interview_question_bank.csv?download=true';

function argNum(name: string, fallback: number): number {
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) {
    return Number(process.argv[idx + 1]);
  }
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return Number(eq.split('=')[1]);
  return fallback;
}

function normalizeQuestion(q: string): string {
  return q
    .replace(/\s*\(Sample \d+\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function slugId(prefix: string, question: string): string {
  const hash = createHash('sha1')
    .update(prefix + '|' + normalizeQuestion(question))
    .digest('hex')
    .slice(0, 10);
  return `${prefix}-${hash}`;
}

function difficultyFromLabel(label: string): number {
  const l = label.toLowerCase();
  if (l.includes('hard') || l === 'senior') return 4;
  if (l.includes('easy') || l === 'junior') return 2;
  return 3;
}

function levelFromDifficulty(diff: number): string {
  if (diff <= 2) return 'junior';
  if (diff >= 4) return 'senior';
  return 'mid';
}

function makeSeed(partial: {
  prefix: string;
  question: string;
  subcategory: string;
  skillTags: string[];
  roleTags: string[];
  source: string;
  difficulty?: number;
  category?: string;
}): SeedQuestion {
  const difficulty = partial.difficulty ?? 3;
  return {
    id: slugId(partial.prefix, partial.question),
    category: partial.category ?? 'technical',
    subcategory: partial.subcategory,
    level: levelFromDifficulty(difficulty),
    roleTags: partial.roleTags,
    skillTags: partial.skillTags,
    difficulty,
    frequency: 'common',
    question: partial.question.trim(),
    evaluationRubric: { ...EXTERNAL_DEFAULT_RUBRIC },
    sampleAnswerOutline: [...EXTERNAL_DEFAULT_OUTLINE],
    followUpQuestions: [...EXTERNAL_DEFAULT_FOLLOW_UPS],
    prepTimeMinutes: 15,
    source: partial.source,
  };
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${url}`);
  }
  return res.text();
}

function loadExistingNormalizedQuestions(): Set<string> {
  const set = new Set<string>();
  for (const file of [
    ...QUESTION_BANK_SEED_FILES,
    'question-bank-external-faqguru.seed.json',
    'question-bank-external-mlds.seed.json',
  ]) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) continue;
    try {
      const items = JSON.parse(readFileSync(path, 'utf-8')) as SeedQuestion[];
      for (const item of items) {
        if (item.question) set.add(normalizeQuestion(item.question));
      }
    } catch {
      /* ignore */
    }
  }
  return set;
}

function parseFaqguruMarkdown(md: string, topic: string): SeedQuestion[] {
  const skillTag = topic
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace('typescript', 'typescript');
  const out: SeedQuestion[] = [];
  const seen = new Set<string>();

  const re = /^\[([^\]]+)\]\(#[^)]+\)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const question = m[1].trim();
    if (question.length < 12) continue;
    if (/^table of contents$/i.test(question)) continue;
    const key = normalizeQuestion(question);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(
      makeSeed({
        prefix: 'ext-faq',
        question,
        subcategory: skillTag,
        skillTags: [skillTag],
        roleTags: ['software-engineer'],
        source: QUESTION_BANK_EXTERNAL_SOURCE.FAQGURU,
      }),
    );
  }
  return out;
}

function parseAjitMarkdown(md: string, file: string): SeedQuestion[] {
  const subcategory = file.replace(/\.md$/i, '').replace(/_/g, '-');
  const out: SeedQuestion[] = [];
  const seen = new Set<string>();
  const re = /^###\s+Q:\s*(.+)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    let question = m[1].trim();
    // Drop trailing nested "1. What's the risk..." style — keep first sentence/title
    if (question.length < 8) continue;
    const key = normalizeQuestion(question);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(
      makeSeed({
        prefix: 'ext-mlds',
        question,
        subcategory,
        skillTags: ['machine-learning', 'data-science', subcategory.slice(0, 40)],
        roleTags: ['data-scientist', 'machine-learning'],
        source: QUESTION_BANK_EXTERNAL_SOURCE.MLDS_AJIT,
        category: 'technical',
      }),
    );
  }
  return out;
}

function parseMldsCsv(csv: string): SeedQuestion[] {
  const lines = csv.trim().split(/\r?\n/).slice(1);
  const byQ = new Map<string, { question: string; difficulty: string; category: string }>();

  for (const line of lines) {
    // id,question,difficulty,category,date — questions have no embedded commas in this dataset
    const parts = line.split(',');
    if (parts.length < 5) continue;
    const questionRaw = parts.slice(1, parts.length - 3).join(',');
    const difficulty = parts[parts.length - 3];
    const category = parts[parts.length - 2];
    const question = questionRaw.replace(/\s*\(Sample \d+\)\s*$/i, '').trim();
    const key = normalizeQuestion(question);
    if (!byQ.has(key)) {
      byQ.set(key, { question, difficulty, category });
    }
  }

  return [...byQ.values()].map((row) =>
    makeSeed({
      prefix: 'ext-mlds-kg',
      question: row.question,
      subcategory: row.category.toLowerCase().replace(/\s+/g, '-'),
      skillTags: [
        'machine-learning',
        'data-science',
        row.category.toLowerCase(),
      ],
      roleTags: ['data-scientist', 'machine-learning'],
      source: QUESTION_BANK_EXTERNAL_SOURCE.MLDS_KAGGLE,
      difficulty: difficultyFromLabel(row.difficulty),
    }),
  );
}

function takeNew(
  items: SeedQuestion[],
  existing: Set<string>,
  max: number,
): SeedQuestion[] {
  const out: SeedQuestion[] = [];
  for (const item of items) {
    if (out.length >= max) break;
    const key = normalizeQuestion(item.question);
    if (existing.has(key)) continue;
    existing.add(key);
    out.push(item);
  }
  return out;
}

function writeAttribution(): void {
  const a = QUESTION_BANK_EXTERNAL_ATTRIBUTION;
  const md = `# External question bank attribution

Curated core seeds remain authoritative. These files are **supplements** only.

## FAQGURU
- Repo: ${a.faqguru.url}
- License: ${a.faqguru.license}
- Seed: \`question-bank-external-faqguru.seed.json\`
- Source tag: \`${QUESTION_BANK_EXTERNAL_SOURCE.FAQGURU}\`

## ML / Data Science
### Ajit Kumar Singh — Data Science Interview Questions & Answers
- Repo: ${a.mldsAjit.url}
- License: ${a.mldsAjit.license}
- Note: ${a.mldsAjit.note}
- Source tag: \`${QUESTION_BANK_EXTERNAL_SOURCE.MLDS_AJIT}\`

### Kaggle / Hugging Face ML-DS bank
- Kaggle: ${a.mldsKaggle.url}
- HF: ${a.mldsKaggle.hf}
- License: ${a.mldsKaggle.license}
- Note: ${a.mldsKaggle.note}
- Source tag: \`${QUESTION_BANK_EXTERNAL_SOURCE.MLDS_KAGGLE}\`

Combined seed: \`question-bank-external-mlds.seed.json\`

Regenerate: \`npm run import:external-question-banks\`
`;
  writeFileSync(join(DATA_DIR, 'EXTERNAL_ATTRIBUTION.md'), md);
}

async function main() {
  const faqguruMax = argNum(
    '--faqguru-max',
    EXTERNAL_IMPORT_DEFAULTS.faqguruMax,
  );
  const mldsMax = argNum('--mlds-max', EXTERNAL_IMPORT_DEFAULTS.mldsMax);

  mkdirSync(RAW_DIR, { recursive: true });
  const existing = loadExistingNormalizedQuestions();
  // Prefer not blocking re-import of previous external files when regenerating:
  // drop prior external-normalized keys by reloading only curated cores
  existing.clear();
  for (const file of QUESTION_BANK_SEED_FILES) {
    const path = join(DATA_DIR, file);
    if (!existsSync(path)) continue;
    const items = JSON.parse(readFileSync(path, 'utf-8')) as SeedQuestion[];
    for (const item of items) {
      if (item.question) existing.add(normalizeQuestion(item.question));
    }
  }

  console.log(`Curated unique questions for dedupe: ${existing.size}`);

  const faqguruAll: SeedQuestion[] = [];
  for (const file of FAQGURU_TOPIC_FILES) {
    const url = `${FAQGURU_BASE}/${file}`;
    try {
      const md = await fetchText(url);
      writeFileSync(join(RAW_DIR, `faqguru-${file}`), md);
      faqguruAll.push(...parseFaqguruMarkdown(md, file));
      console.log(`FAQGURU ${file}: parsed ok`);
    } catch (err) {
      console.warn(`FAQGURU skip ${file}: ${(err as Error).message}`);
    }
  }
  const faqguru = takeNew(faqguruAll, existing, faqguruMax);
  writeFileSync(
    join(DATA_DIR, 'question-bank-external-faqguru.seed.json'),
    JSON.stringify(faqguru, null, 2),
  );
  console.log(`Wrote FAQGURU seed: ${faqguru.length} (from ${faqguruAll.length})`);

  const mldsAll: SeedQuestion[] = [];
  for (const file of MLDS_AJIT_TOPIC_FILES) {
    const url = `${AJIT_BASE}/${file}`;
    try {
      const md = await fetchText(url);
      writeFileSync(join(RAW_DIR, `ajit-${file}`), md);
      mldsAll.push(...parseAjitMarkdown(md, file));
      console.log(`Ajit DS ${file}: parsed ok`);
    } catch (err) {
      console.warn(`Ajit skip ${file}: ${(err as Error).message}`);
    }
  }

  try {
    const csv = await fetchText(MLDS_CSV_URL);
    writeFileSync(join(RAW_DIR, 'coding_interview_question_bank.csv'), csv);
    const kg = parseMldsCsv(csv);
    mldsAll.push(...kg);
    console.log(`Kaggle/HF unique questions: ${kg.length}`);
  } catch (err) {
    console.warn(`Kaggle/HF skip: ${(err as Error).message}`);
  }

  const mlds = takeNew(mldsAll, existing, mldsMax);
  writeFileSync(
    join(DATA_DIR, 'question-bank-external-mlds.seed.json'),
    JSON.stringify(mlds, null, 2),
  );
  console.log(`Wrote MLDS seed: ${mlds.length} (from ${mldsAll.length})`);

  writeAttribution();
  console.log('Wrote EXTERNAL_ATTRIBUTION.md');
  console.log(
    'Next: restart backend (seeder upserts) → npm run backfill:question-embeddings',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
