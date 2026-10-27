import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Prefer .env.dev over .env for CLI (migration / schema:sync)
dotenv.config({ path: resolve(__dirname, '../../../.env') });
dotenv.config({
  path: resolve(__dirname, '../../../.env.dev'),
  override: true,
});

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
