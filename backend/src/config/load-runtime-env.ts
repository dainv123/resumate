import { config as loadEnv } from 'dotenv';
import { loadRuntimeEnvFiles } from './runtime-env';

// Imported first from main.ts so files are applied before AppModule reads process.env.
loadRuntimeEnvFiles(__dirname, loadEnv);
