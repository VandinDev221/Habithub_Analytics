import { config } from 'dotenv';
import { resolve, join } from 'path';

// Carrega .env da raiz do projeto (onde está o .env) e depois do backend
config({ path: resolve(process.cwd(), '..', '.env') });
config({ path: resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import { readFileSync, existsSync } from 'fs';
import { pgPool } from './config/db.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(compression());

const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
if (!allowedOrigins.includes('https://habithub-analytics.vercel.app')) {
  allowedOrigins.push('https://habithub-analytics.vercel.app');
}

// Preflight (OPTIONS) respondido primeiro, com CORS, para evitar falha em proxies
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (allowedOrigins[0]) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(204);
  }
  next();
});

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, origin);
      return cb(null, allowedOrigins[0]);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
  })
);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

/** Diagnóstico: DATABASE_URL definida? Conexão OK? Tabela users existe? */
app.get('/api/db-check', async (_req, res) => {
  const databaseUrlSet = Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
  let connectionOk = false;
  let tablesOk = false;
  let error: string | null = null;
  if (databaseUrlSet) {
    try {
      await pgPool.query('SELECT 1');
      connectionOk = true;
      const { rows } = await pgPool.query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') AS exists"
      );
      tablesOk = rows[0]?.exists === true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }
  res.json({
    databaseUrlSet,
    connectionOk,
    tablesOk,
    hint: !databaseUrlSet
      ? 'Defina DATABASE_URL nas Variables do serviço do backend no Railway (referência: ${{ Postgres.DATABASE_URL }})'
      : !connectionOk
        ? `Conexão falhou: ${error}. Confira se a referência ao Postgres está correta (nome do serviço).`
        : !tablesOk
          ? 'Tabelas não existem. Rode as migrações: no start command use "npm run db:migrate && npm run start" ou rode "railway run npm run db:migrate"'
          : null,
    error: error ?? undefined,
  });
});

/** Roda migrações uma vez (protegido por RUN_MIGRATE_SECRET). POST /api/db-migrate com header Authorization: Bearer <RUN_MIGRATE_SECRET> */
app.post('/api/db-migrate', async (req, res) => {
  const secret = process.env.RUN_MIGRATE_SECRET;
  if (!secret || secret.length < 16) {
    return res.status(501).json({
      error: 'RUN_MIGRATE_SECRET não definida (mín. 16 caracteres). Defina nas Variables do Railway e chame com Authorization: Bearer <valor>.',
    });
  }
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? req.body?.secret ?? '';
  if (token !== secret) {
    return res.status(403).json({ error: 'Secret inválido.' });
  }
  try {
    const cwd = process.cwd();
    const schemaPath = existsSync(join(cwd, 'dist', 'db', 'schema.sql'))
      ? join(cwd, 'dist', 'db', 'schema.sql')
      : join(cwd, 'src', 'db', 'schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');
    await pgPool.query(sql);
    return res.json({ ok: true, message: 'Migrações aplicadas.' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[db-migrate]', e);
    return res.status(500).json({ error: 'Falha ao rodar migrações.', detail: msg });
  }
});

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Habithub API running at http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
