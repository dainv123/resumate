/**
 * Embed question_bank rows into pgvector for Interview Prep RAG.
 *
 * Usage (from backend/):
 *   npm run backfill:question-embeddings
 *   npx ts-node -r tsconfig-paths/register src/scripts/backfill-question-embeddings.ts --limit 50
 *
 * Requires: OPENROUTER_API_KEY, migration 1761500000005 applied, Postgres with pgvector.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { QuestionEmbeddingService } from '../modules/interview-prep/services/question-embedding.service';
import { EmbeddingService } from '../modules/ai/providers/embedding.service';

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit'));
  const limit = limitArg
    ? Number(limitArg.split('=')[1] || process.argv[process.argv.indexOf(limitArg) + 1])
    : undefined;

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  try {
    const embeddingService = app.get(EmbeddingService);
    if (!embeddingService.canEmbed()) {
      throw new Error(
        'Cannot embed: set GOOGLE_AI_API_KEY (AI_EMBEDDING_PROVIDER=google) or OPENROUTER_API_KEY (openrouter); AI_EMBEDDING_ENABLED!=false',
      );
    }

    console.log(
      `provider=${embeddingService.getProvider()} model=${embeddingService.getModel()} dims=${embeddingService.getDimensions()}`,
    );

    const questionEmbedding = app.get(QuestionEmbeddingService);
    const before = await questionEmbedding.countEmbedded();
    const done = await questionEmbedding.embedMissing({ limit });
    const after = await questionEmbedding.countEmbedded();

    console.log(
      JSON.stringify({ embeddedThisRun: done, before, after, limit: limit ?? null }),
    );
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
