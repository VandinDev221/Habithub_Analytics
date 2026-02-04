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

app.use('/api', routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Habithub API running at http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api-docs`);
});
