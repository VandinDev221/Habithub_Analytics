/**
 * Testa conexão com o PostgreSQL e verifica se as tabelas (migrações) existem.
 * Uso: npm run db:check (com DATABASE_URL no .env ou no ambiente)
 *      ou com External Database URL do Render no .env
 */
import 'dotenv/config';
import { pgPool } from '../config/db.js';

async function check(): Promise<void> {
  const urlSet = Boolean(process.env.DATABASE_URL?.trim());
  console.log('DATABASE_URL definida:', urlSet ? 'sim' : 'não');
  if (!urlSet) {
    console.error('Defina DATABASE_URL (Render → Postgres → External Database URL).');
    process.exit(1);
  }

  try {
    await pgPool.query('SELECT 1');
    console.log('Conexão com o banco: OK');

    const { rows } = await pgPool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'habits', 'habit_logs') ORDER BY table_name"
    );
    const tables = rows.map((r) => r.table_name);
    const expected = ['habit_logs', 'habits', 'users'];
    const missing = expected.filter((t) => !tables.includes(t));

    if (missing.length === 0) {
      console.log('Tabelas (migrações): OK — users, habits, habit_logs existem.');
    } else {
      console.log('Tabelas encontradas:', tables.length ? tables.join(', ') : 'nenhuma');
      console.error('Faltam:', missing.join(', '));
      console.error('Rode as migrações: npm run db:migrate (ou start command no Render).');
      process.exit(1);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : (err && typeof (err as { message?: string }).message === 'string' ? (err as { message: string }).message : String(err));
    const code = err && typeof (err as { code?: string }).code === 'string' ? (err as { code: string }).code : '';
    console.error('Erro na conexão:', msg || code || '(sem mensagem)');
    if (String(err).includes('internal') || (msg + code).includes('ENOTFOUND') || (msg + code).includes('internal')) {
      console.error('Dica: rodando no seu PC, use a External Database URL do Render, não a Internal URL.');
    }
    process.exit(1);
  } finally {
    await pgPool.end();
  }
}

check();
