import { config } from 'dotenv';
import { resolve } from 'path';

// Carrega .env da raiz do projeto (onde está o .env) e depois do backend
config({ path: resolve(process.cwd(), '..', '.env') });
config({ path: resolve(process.cwd(), '.env') });

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
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

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Habithub API running at http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
