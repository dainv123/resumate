#!/bin/sh
# Dev container boot: wait for Postgres → entity schema → migrations (pgvector) → Nest.
# shortcut: migrations alone cannot create core tables (cvs/users); schema:sync first.
# Upgrade: single baseline migration that bootstraps full schema, then drop schema:sync.
set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"

echo "Waiting for Postgres at ${DB_HOST}:${DB_PORT}..."
node <<'NODE'
const net = require('net');
const host = process.env.DB_HOST || 'postgres';
const port = Number(process.env.DB_PORT || 5432);
(async () => {
  for (let i = 0; i < 60; i++) {
    try {
      await new Promise((resolve, reject) => {
        const s = net.connect(port, host, () => {
          s.end();
          resolve();
        });
        s.on('error', reject);
      });
      process.exit(0);
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  console.error('Postgres not ready');
  process.exit(1);
})();
NODE

echo "Syncing entity schema..."
npx typeorm-ts-node-commonjs schema:sync -d src/config/database.config.ts

echo "Running migrations..."
npm run migration:run

echo "Starting Nest..."
exec npm run start:dev
