import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { pgPool } from '../config/db.js';

async function migrate(): Promise<void> {
  const cwd = process.cwd();
  // No deploy (Railway): build copia schema para dist/db; rodamos "node dist/db/migrate.js" com cwd = backend
  const schemaPath =
    existsSync(join(cwd, 'dist', 'db', 'schema.sql'))
      ? join(cwd, 'dist', 'db', 'schema.sql')
      : join(cwd, 'src', 'db', 'schema.sql');
  const sql = readFileSync(schemaPath, 'utf-8');
  await pgPool.query(sql);
  console.log('Migration completed.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
