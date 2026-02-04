# Habithub Analytics

Sistema de Análise de Hábitos com IA — projeto full stack para portfólio.

## Visão Geral

Sistema web que permite rastrear hábitos, visualizar analytics preditivos e receber insights personalizados via IA.

## Stack

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express, TypeScript |
| **Banco de Dados** | PostgreSQL (principal), MongoDB (logs), Redis (cache) |
| **IA** | TensorFlow.js / microserviço Python (predições) |
| **Auth** | NextAuth.js (Google, GitHub) + JWT |
| **DevOps** | Docker, GitHub Actions, Vercel (front), Railway/Render (back) |

## Estrutura do Projeto

```
habithub-analytics/
├── frontend/          # Next.js 15
├── backend/           # Express + TypeScript
├── ml-service/        # Python/Flask (opcional)
├── docker-compose.yml
└── README.md
```

## Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- Docker e Docker Compose (para PostgreSQL, MongoDB, Redis)
- Contas OAuth: Google e GitHub (para login social)

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd Habithub_Analytics
cp .env.example .env
# Editar .env com suas chaves
```

### 2. Subir bancos com Docker

```bash
docker-compose up -d
```

### 3. Backend

```bash
cd backend
npm install
npm run db:migrate   # cria tabelas no PostgreSQL
npm run dev
```

### 4. Frontend

Crie `frontend/.env.local` com as variáveis de NextAuth (copie de `.env.example` na raiz).

```bash
cd frontend
npm install
npm run dev
```

**Nota:** Para login com Google/GitHub, configure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` e `NEXTAUTH_SECRET` no `.env.local` do frontend. O backend precisa de `DATABASE_URL` (PostgreSQL) e `JWT_SECRET`.

- Frontend: http://localhost:3000  
- Backend API: http://localhost:4000  
- Swagger: http://localhost:4000/api-docs  

## Decisões Arquiteturais

- **PostgreSQL**: usuários, hábitos e habit_logs (dados estruturados e relacionais).
- **MongoDB**: eventos analíticos e padrões (schema flexível para logs e IA).
- **Redis**: sessões e cache de dashboard para reduzir carga no banco.
- **NextAuth no frontend**: OAuth e sessão; backend valida JWT para APIs.

## API Principal

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/habits | Listar hábitos do usuário |
| POST | /api/habits | Criar hábito |
| PUT | /api/habits/:id | Atualizar hábito |
| DELETE | /api/habits/:id | Remover hábito |
| POST | /api/habits/:id/log | Registrar check-in |
| GET | /api/analytics | Dados para gráficos |
| POST | /api/ai/insights | Gerar insights com IA |
| GET | /api/export/:format | Exportar dados (PDF/CSV) |

Documentação completa: **Swagger/OpenAPI** em `/api-docs`.

## Deploy

- **Frontend**: Vercel (ex.: `habithub-analytics.vercel.app`)
- **Backend**: Railway ou Render
- **Bancos**: Neon (PostgreSQL), MongoDB Atlas, Redis (Upstash ou similar)

### ⚠️ 404 na Vercel (página em branco ou NOT_FOUND)

O app Next.js fica na pasta **`frontend/`**. Se a **Root Directory** na Vercel não for ajustada, o site retorna **404**.

**Solução (obrigatória):** em **[vercel.com](https://vercel.com)** → seu projeto → **Settings** → **General** → **Root Directory** → **Edit** → digite **`frontend`** → **Save** → **Deployments** → **Redeploy**.

Guia passo a passo: **[VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)**.

## Licença

MIT — uso livre para portfólio e estudos.
