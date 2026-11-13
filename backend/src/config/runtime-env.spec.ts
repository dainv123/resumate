import { loadRuntimeEnvFiles, shouldSynchronizeSchema } from './runtime-env';

describe('runtime env', () => {
  it('does not schema-sync in development unless explicitly enabled', () => {
    expect(shouldSynchronizeSchema({ NODE_ENV: 'development' })).toBe(false);
    expect(
      shouldSynchronizeSchema({
        NODE_ENV: 'development',
        TYPEORM_SYNCHRONIZE: 'false',
      }),
    ).toBe(false);
    expect(
      shouldSynchronizeSchema({
        NODE_ENV: 'production',
        TYPEORM_SYNCHRONIZE: 'true',
      }),
    ).toBe(true);
  });

  it('loads local env files before the root RDS file and never overrides', () => {
    const calls: Array<{ path: string; override?: boolean }> = [];

    loadRuntimeEnvFiles('/repo/backend/src/config', (options) => {
      calls.push(options);
    });

    expect(calls).toEqual([
      { path: '/repo/.env.dev', override: false },
      { path: '/repo/backend/.env.dev', override: false },
      { path: '/repo/backend/.env', override: false },
      { path: '/repo/.env', override: false },
    ]);
  });
});
