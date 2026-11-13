import { resolve } from 'path';

export interface EnvFileLoadOptions {
  path: string;
  override?: boolean;
}

export type EnvFileLoader = (options: EnvFileLoadOptions) => unknown;

/**
 * Directory of this module (src/config or dist/config).
 * .env.dev wins, then backend/.env, then the repo-root .env used for RDS.
 * First definition wins; existing process env is left untouched.
 */
export function runtimeEnvFilePaths(moduleDir: string): string[] {
  const backendRoot = resolve(moduleDir, '../..');
  const repoRoot = resolve(moduleDir, '../../..');
  return [
    resolve(repoRoot, '.env.dev'),
    resolve(backendRoot, '.env.dev'),
    resolve(backendRoot, '.env'),
    resolve(repoRoot, '.env'),
  ];
}

export function loadRuntimeEnvFiles(
  moduleDir: string,
  load: EnvFileLoader,
): void {
  for (const path of runtimeEnvFilePaths(moduleDir)) {
    load({ path, override: false });
  }
}

/**
 * TypeORM synchronize drops columns that are not on entities
 * (question_bank.embedding). Only run it when explicitly requested.
 * Fresh databases use `npm run db:bootstrap` or the dev entrypoint.
 */
export function shouldSynchronizeSchema(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.TYPEORM_SYNCHRONIZE === 'true';
}
