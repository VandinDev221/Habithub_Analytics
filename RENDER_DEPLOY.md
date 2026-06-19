# Deploy do backend no Render

O repositório tem **frontend/** (Next.js → Vercel) e **backend/** (Express → Render).

## Opção A — Blueprint (recomendado)

1. Acesse [render.com](https://render.com) → **New** → **Blueprint**.
2. Conecte o repositório **Habithub_Analytics**.
3. O Render lê o `render.yaml` na raiz e cria:
   - **Web Service** `habithub-api` (pasta `backend/`)
   - **PostgreSQL** `habithub-db`
4. Aguarde o deploy ficar **Live**.
5. Abra o Web Service → **Settings** → copie a **URL** (ex.: `https://habithub-api.onrender.com`).
6. Na **Vercel**, defina **NEXT_PUBLIC_API_URL** = essa URL (**sem** barra no final) → **Redeploy**.

### Conferir

| URL | Esperado |
|-----|----------|
| `https://SUA-URL.onrender.com/health` | `{"status":"ok",...}` |
| `https://SUA-URL.onrender.com/api/db-check` | `databaseUrlSet: true`, `tablesOk: true` |
| `https://habithub-analytics.vercel.app/api/backend-ping` | `{"ok":true,"backend":true,...}` |

---

## Opção B — Manual (Web Service + Postgres)

### 1. PostgreSQL

1. **New** → **PostgreSQL** → nome `habithub-db` → **Create**.
2. Na aba **Info**, copie **Internal Database URL** (use esta no Web Service no mesmo workspace Render).

Guia detalhado: **[RENDER_DATABASE.md](./RENDER_DATABASE.md)**.

### 2. Web Service (API)

1. **New** → **Web Service** → conecte o repositório.
2. Configuração:

| Campo | Valor |
|-------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm run db:migrate && npm run start` |
| **Health Check Path** | `/health` |

3. **Environment Variables** (mínimo):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Internal Database URL do Postgres |
| `JWT_SECRET` | string longa aleatória (mín. 32 caracteres) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://habithub-analytics.vercel.app` |
| `NODE_ENV` | `production` |

Opcional: `OPENAI_API_KEY` (chat “Pergunte sobre seus hábitos”).

4. **Create Web Service** e aguarde **Live**.

### 3. Vercel

**Settings → Environment Variables → Production:**

```
NEXT_PUBLIC_API_URL=https://habithub-api.onrender.com
```

(troque pela URL real do Render, sem `/` no final)

**Deployments → Redeploy.**

---

## Plano free do Render

- O serviço **hiberna** após ~15 min sem tráfego; a primeira requisição pode levar **30–60 s** (cold start).
- Postgres free expira em 90 dias (Render avisa antes) — para portfólio costuma bastar.

---

## Erros comuns

| Sintoma | Causa | Solução |
|---------|--------|---------|
| 502 em `/api/backend-ping` na Vercel | `NEXT_PUBLIC_API_URL` errada ou API dormindo | URL correta + aguarde cold start |
| 503 “Banco não configurado” | `DATABASE_URL` ausente ou migrações não rodaram | Ver [RENDER_DATABASE.md](./RENDER_DATABASE.md) |
| CORS no browser | `FRONTEND_URL` errada | `https://habithub-analytics.vercel.app` |
| Build falha | Root Directory não é `backend` | Settings → Root Directory = `backend` |

---

## Migrações via API (alternativa)

Se não quiser `db:migrate` no start command, defina **RUN_MIGRATE_SECRET** (mín. 16 caracteres) e chame uma vez:

```powershell
$secret = "SUA_RUN_MIGRATE_SECRET"
Invoke-RestMethod -Uri "https://SUA-URL.onrender.com/api/db-migrate" -Method POST -Headers @{ Authorization = "Bearer $secret" }
```
