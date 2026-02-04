import { readFileSync } from 'fs';
import { join } from 'path';
import { pgPool } from '../config/db.js';

async function migrate(): Promise<void> {
  const sql = readFileSync(join(process.cwd(), 'src', 'db', 'schema.sql'), 'utf-8');
  await pgPool.query(sql);
  console.log('Migration completed.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
