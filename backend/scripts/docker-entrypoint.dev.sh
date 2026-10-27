#!/bin/sh
# Dev container boot: wait Postgres → (optional first-time schema:sync) → migration:run → Nest.
# shortcut: no baseline migration for users/cvs — sync once on empty DB, then migrations own deltas (pgvector).
# Do NOT schema:sync every boot: sync drops non-entity columns like question_bank.embedding.
set -e

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_USERNAME="${DB_USERNAME:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-resumate_dev}"

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

NEED_SYNC="$(node <<'NODE'
const { Client } = require('pg');
const c = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'resumate_dev',
});
c.connect()
  .then(() =>
    c.query(
      `SELECT COUNT(*)::int AS n FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = 'users'`,
    ),
  )
  .then((r) => {
    process.stdout.write(r.rows[0].n === 0 ? '1' : '0');
    return c.end();
  })
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
NODE
)"

if [ "$NEED_SYNC" = "1" ]; then
  echo "Empty DB — syncing entity schema once..."
  npx typeorm-ts-node-commonjs schema:sync -d src/config/database.config.ts
else
  echo "Schema present — skip schema:sync (preserves pgvector columns)."
fi

echo "Running migrations..."
npm run migration:run

echo "Starting Nest..."
exec npm run start:dev
