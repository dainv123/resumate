import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { loadRuntimeEnvFiles } from './runtime-env';

// Fill gaps only — never override Docker/compose/shell env already set.
// Local .env.dev and backend/.env win over the repo-root RDS .env.
loadRuntimeEnvFiles(__dirname, (options) => dotenv.config(options));

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get<string>('DB_USERNAME', 'postgres'),
  password: configService.get<string>('DB_PASSWORD', 'password'),
  database: configService.get<string>('DB_NAME', 'resumate'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // Always false for migrations / schema:sync CLI
  logging: process.env.NODE_ENV === 'development',
  ssl:
    configService.get<string>('DB_SSL') === 'false'
      ? false
      : configService.get<string>('NODE_ENV') === 'production'
        ? { rejectUnauthorized: false }
        : false,
  extra: {
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  },
});

export default AppDataSource;
