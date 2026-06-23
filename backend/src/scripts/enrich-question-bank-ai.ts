/**
 * AI-enrich rubric, outline, and follow-ups for question bank entries with template metadata.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register src/scripts/enrich-question-bank-ai.ts
 *   npx ts-node ... enrich-question-bank-ai.ts --limit 10 --dry-run
 *   npx ts-node ... enrich-question-bank-ai.ts --file question-bank-expansion.seed.json
 *
 * Requires GOOGLE_AI_API_KEY in backend/.env or repo root .env
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fillQuestionBankEnrichPrompt } from '../modules/ai/prompts/question-bank-enrich.prompts';
import {
  QUESTION_BANK_ENRICH_BATCH_SIZE,
  QUESTION_BANK_ENRICH_SOURCE,
  QUESTION_BANK_SEED_FILES,
  QUESTION_BANK_TEMPLATE_RUBRIC_EXCELLENT,
} from '../modules/interview-prep/constants/question-bank-enrich.constants';

type QuestionSeed = {
  id: string;
  category: string;
  level: string;
  question: string;
  evaluationRubric: { excellent: string[]; good: string[]; weak: string[] };
  sampleAnswerOutline: string[];
  followUpQuestions: string[];
  prepTimeMinutes: number;
  source?: string;
};

type EnrichedItem = {
  id: string;
  evaluationRubric: QuestionSeed['evaluationRubric'];
  sampleAnswerOutline: string[];
  followUpQuestions: string[];
  prepTimeMinutes: number;
};

function loadEnv(): void {
  const candidates = [
    join(__dirname, '../../.env'),
    join(__dirname, '../../../.env'),
  ];
  for (const path of candidates) {
    try {
      const lines = readFileSync(path, 'utf-8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      }
      return;
    } catch {
      /* try next */
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let dryRun = false;
  let file: string | undefined;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit') limit = Number(args[++i]);
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--force') force = true;
    else if (args[i] === '--file') file = args[++i];
  }

  return { limit, dryRun, file, force };
}

function needsEnrichment(q: QuestionSeed, force: boolean): boolean {
  if (force) return q.source !== QUESTION_BANK_ENRICH_SOURCE;
  if (q.source === QUESTION_BANK_ENRICH_SOURCE) return false;
  const first = q.evaluationRubric?.excellent?.[0];
  return QUESTION_BANK_TEMPLATE_RUBRIC_EXCELLENT.some((t) => t === first);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function enrichBatch(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  batch: QuestionSeed[],
): Promise<EnrichedItem[]> {
  const payload = batch.map((q) => ({
    id: q.id,
    category: q.category,
    level: q.level,
    question: q.question,
  }));

  const prompt = fillQuestionBankEnrichPrompt(JSON.stringify(payload, null, 2));
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON object in AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as { items: EnrichedItem[] };
  return parsed.items;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  loadEnv();
  const { limit, dryRun, file, force } = parseArgs();

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('GOOGLE_AI_API_KEY not set');
    process.exit(1);
  }

  const modelName = process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
  const model = apiKey
    ? new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: modelName })
    : null;

  const dataDir = join(__dirname, '..', 'modules', 'interview-prep', 'data');
  const seedFiles = file ? [file] : [...QUESTION_BANK_SEED_FILES];

  const pending: Array<{ file: string; question: QuestionSeed; index: number }> = [];

  for (const filename of seedFiles) {
    const path = join(dataDir, filename);
    const items = JSON.parse(readFileSync(path, 'utf-8')) as QuestionSeed[];
    items.forEach((question, index) => {
      if (needsEnrichment(question, force)) {
        pending.push({ file: filename, question, index });
      }
    });
  }

  const toProcess = pending.slice(0, limit);
  console.log(
    `Found ${pending.length} questions to enrich, processing ${toProcess.length}${dryRun ? ' (dry-run)' : ''}`,
  );

  if (dryRun) {
    toProcess.slice(0, 5).forEach((p) => console.log(`  - ${p.question.id}: ${p.question.question}`));
    if (toProcess.length > 5) console.log(`  ... and ${toProcess.length - 5} more`);
    return;
  }

  const fileCache = new Map<string, QuestionSeed[]>();
  for (const filename of seedFiles) {
    fileCache.set(
      filename,
      JSON.parse(readFileSync(join(dataDir, filename), 'utf-8')) as QuestionSeed[],
    );
  }

  const batches = chunk(toProcess, QUESTION_BANK_ENRICH_BATCH_SIZE);
  let enriched = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const questions = batch.map((b) => b.question);
    console.log(`Batch ${i + 1}/${batches.length} (${questions.map((q) => q.id).join(', ')})`);

    let items: EnrichedItem[];
    try {
      items = await enrichBatch(model!, questions);
    } catch (err) {
      console.warn(`  Retry after error: ${(err as Error).message}`);
      await sleep(2000);
      items = await enrichBatch(model!, questions);
    }

    const byId = new Map(items.map((item) => [item.id, item]));

    for (const entry of batch) {
      const update = byId.get(entry.question.id);
      if (!update) {
        console.warn(`  Missing AI output for ${entry.question.id}`);
        continue;
      }

      const fileItems = fileCache.get(entry.file)!;
      fileItems[entry.index] = {
        ...fileItems[entry.index],
        evaluationRubric: update.evaluationRubric,
        sampleAnswerOutline: update.sampleAnswerOutline,
        followUpQuestions: update.followUpQuestions,
        prepTimeMinutes: update.prepTimeMinutes,
        source: QUESTION_BANK_ENRICH_SOURCE,
      };
      enriched += 1;
    }

    if (i < batches.length - 1) await sleep(1200);
  }

  for (const [filename, items] of fileCache) {
    writeFileSync(join(dataDir, filename), JSON.stringify(items, null, 2));
    console.log(`Wrote ${filename}`);
  }

  console.log(`Done. Enriched ${enriched} questions. Restart backend to upsert DB.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
