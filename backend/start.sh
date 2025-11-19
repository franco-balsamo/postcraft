#!/bin/sh
set -e

echo "[start] Running database migrations..."
node -e "import('./src/config/db.js').then(m => m.runMigrations()).catch(e => { console.error(e); process.exit(1); })"

echo "[start] Starting application..."
exec node src/app.js
