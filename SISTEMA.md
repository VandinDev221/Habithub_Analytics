# Habithub Analytics — Como o sistema funciona

Este documento descreve a arquitetura, o fluxo de dados e as funcionalidades do **Habithub Analytics**, um sistema full stack para rastreio de hábitos com analytics e insights com IA.

---

## 1. Visão geral

O Habithub Analytics permite que usuários:

- **Criem e gerenciem hábitos** (nome, categoria, cor, meta diária/semanal)
- **Registrem check-ins diários** com humor (😊 😐 😢)
- **Visualizem estatísticas** (streak, taxa de sucesso, gráficos)
- **Recebam insights com IA** (melhor dia da semana, probabilidade de sucesso, recomendações)
- **Exportem dados** em CSV ou JSON

**Stack:** Next.js 15 (frontend), Node.js + Express + TypeScript (backend), PostgreSQL (dados principais), NextAuth.js (login) + JWT (API).

---

## 2. Arquitetura

```
Habithub_Analytics/
├── frontend/          → Next.js 15 (App Router), React, Tailwind, NextAuth
├── backend/          → Express, TypeScript, PostgreSQL
├── docker-compose.yml
├── .env / .env.example
└── SISTEMA.md (este arquivo)
```

- **Frontend** roda em `http://localhost:3000` (dev). Páginas públicas (landing, login, registro) e área autenticada (dashboard, hábitos, analytics, configurações).
- **Backend** roda em `http://localhost:4000` (dev). API REST com autenticação JWT; documentação Swagger em `/api-docs`.
- **Banco** PostgreSQL (usuários, hábitos, logs). Migração via `npm run db:migrate` na pasta `backend`.

---

## 3. Autenticação e proxy

### 3.1 Login

- **Email/senha:** formulário em `/auth/login` → NextAuth (Credentials) chama o backend `POST /api/auth/login` → backend valida e devolve JWT.
- **Google / GitHub:** NextAuth (OAuth) → após login social, o frontend chama `POST /api/auth/oauth-user` para criar/atualizar usuário no backend e obter um JWT.

O **JWT do backend** é guardado na sessão do NextAuth (callback `jwt` → `token.accessToken`; callback `session` → `session.accessToken`).

### 3.2 Chamadas autenticadas ao backend

O frontend **não envia o JWT do backend diretamente** no cliente. Em vez disso:

1. O usuário faz uma ação (ex.: listar hábitos, criar hábito).
2. O frontend chama a **API do Next.js** em `/api/proxy/...` (ex.: `GET /api/proxy/habits`), com **cookies** (sessão NextAuth).
3. O **proxy** (`frontend/app/api/proxy/[...path]/route.ts`):
   - Lê o cookie da sessão NextAuth (`getToken({ req, secret })`).
   - Extrai o `accessToken` (JWT do backend) do payload.
   - Encaminha a requisição ao backend (`http://localhost:4000/api/...`) com o header `Authorization: Bearer <accessToken>`.
4. O backend valida o JWT (middleware `auth`) e processa a rota.

Assim, o JWT do backend nunca precisa ser exposto no cliente; apenas o cookie de sessão do NextAuth é enviado ao mesmo domínio (localhost:3000).

### 3.3 Segredo JWT no backend

O backend usa um **único** `JWT_SECRET` para assinar (login) e verificar (rotas protegidas), definido em `backend/src/config/auth.ts`. O mesmo valor deve estar no `.env` (raiz ou `backend/.env`) como `JWT_SECRET`.

---

## 4. Funcionalidades por área

### 4.1 Páginas públicas

| Página        | Rota            | Descrição                                                                 |
|---------------|------------------|----------------------------------------------------------------------------|
| Landing       | `/`              | Título, descrição, botões "Entrar" e "Cadastrar" (ou "Ir para o Dashboard" se logado). |
| Login         | `/auth/login`    | Formulário email/senha + opções de login com Google e GitHub.            |
| Cadastro      | `/auth/register`| Registro com email, senha e nome; chama `POST /api/auth/register` no backend. |

### 4.2 Dashboard (área logada)

Todas as rotas abaixo ficam sob `/dashboard`, com layout comum (menu lateral, etc.) e exigem sessão (redirect para login se não autenticado).

| Página        | Rota                  | Descrição                                                                 |
|---------------|------------------------|----------------------------------------------------------------------------|
| Dashboard     | `/dashboard`           | Resumo: total de hábitos, streak atual, taxa de sucesso, completados no período; link para hábitos e analytics. |
| Hábitos       | `/dashboard/habits`    | CRUD de hábitos + check-in diário com seleção de humor (😊 😐 😢) e botões Concluído/Pular. |
| Analytics     | `/dashboard/analytics` | Gráfico de linha (completos nos últimos 30 dias), gráfico de pizza (categorias), cards de estatísticas e bloco de **insights com IA**. |
| Configurações | `/dashboard/settings`  | Página de configurações do usuário (perfil, preferências).                 |

### 4.3 Hábitos (CRUD e logs)

- **Listar:** `GET /api/habits` (via proxy).
- **Criar:** `POST /api/habits` — corpo: `name`, opcionalmente `category`, `color`, `goal` (ex.: daily, weekly).
- **Atualizar:** `PUT /api/habits/:id` — corpo parcial (nome, categoria, cor, meta).
- **Excluir:** `DELETE /api/habits/:id`.
- **Registrar check-in:** `POST /api/habits/:id/log` — corpo: `date`, `completed`, opcionalmente `mood`, `notes`.
- **Listar logs:** `GET /api/habits/:id/logs` — opcionalmente `from` e `to` na query.

Todas essas rotas são protegidas pelo middleware JWT no backend.

### 4.4 Analytics

- **Dados agregados:** `GET /api/analytics` — opcionalmente `from` e `to` na query.  
  Retorna hábitos do usuário, logs por hábito, categorias com contagem e estatísticas (total de hábitos, total completados, taxa de sucesso, streak, intervalo de datas).  
  O dashboard e a página de Analytics consomem esses dados para cards e gráficos (Recharts: linha e pizza).

### 4.5 Insights com IA

**O que é:** "Insights com IA" = **análise automática do histórico de check-ins** + **recomendações em texto** geradas a partir dos seus dados. O sistema usa regras e estatísticas (dia da semana, completados/total) para montar essas frases — **hoje não usa ChatGPT, OpenAI nem outro modelo de linguagem**; é lógica programada no backend (`backend/src/controllers/aiController.ts`). No futuro a parte de texto pode ser trocada por um modelo externo (ex.: OpenAI).

- **Gerar insights:** `POST /api/ai/insights` (sem corpo obrigatório).  
  O backend analisa os logs dos últimos 30 dias e devolve:
  - **successProbability:** probabilidade estimada de sucesso (%).
  - **insights:** lista de frases, por exemplo:
    - *"Com base nos últimos 30 dias, a probabilidade estimada de sucesso é X%."*
    - *"Você tem mais sucesso às [Segundas/…] (Y% de conclusão)."*
    - *"Recomendação: mantenha o horário e o contexto que estão funcionando."* (quando a taxa é ≥ 70%)
    - *"Recomendação: tente fixar um horário fixo (ex: 9h) para os hábitos mais importantes."* (quando a taxa é menor)
  - **bestDay:** melhor dia da semana para conclusão (ex.: "Segunda").

**Resumo:** hoje = análise automática do histórico + recomendações por regras; depois = pode ser estendido para OpenAI ou um ml-service.

### 4.6 Pergunte sobre seus hábitos (LLM)

**O que é:** o usuário pode fazer uma **pergunta em texto livre** sobre seus hábitos (ex.: "Por que falho mais às sextas?", "Qual hábito devo priorizar?"). O backend monta um **contexto** a partir dos dados do usuário (hábitos, logs dos últimos 30 dias, estatísticas, melhor dia da semana) e envia à **OpenAI** (modelo configurável, padrão `gpt-4o-mini`). A resposta é breve e em português.

- **Perguntar:** `POST /api/ai/ask` — corpo: `{ "question": "sua pergunta" }` (máx. 500 caracteres).  
  Resposta: `{ "answer": "texto gerado pela IA" }`.
- **Requisito:** `OPENAI_API_KEY` no `.env` do backend. Se não estiver configurada, a API retorna 503.
- **Contexto enviado ao LLM:** lista de hábitos (nome, categoria), estatísticas (taxa de sucesso, streak, melhor dia), resumo por hábito (completados/total, humores).
- **UI:** na página **Analytics**, bloco "Pergunte sobre seus hábitos" com campo de texto e botão Enviar; a resposta é exibida abaixo.

### 4.7 Exportação

- **Exportar dados:** `GET /api/export/:format` com `format` = `csv` ou `json`.  
  Retorna os dados do usuário (hábitos e logs) no formato pedido. Usado, por exemplo, pelo botão “Exportar” na página de Analytics.

---

## 5. Banco de dados (PostgreSQL)

### 5.1 Tabelas principais

- **users** — `id`, `email`, `name`, `avatar`, `password_hash`, `settings` (JSONB), `is_admin`, `created_at`, `updated_at`.
- **habits** — `id`, `user_id` (FK users), `name`, `category`, `color`, `goal`, `reminder_time`, `created_at`, `updated_at`.
- **habit_logs** — `id`, `habit_id` (FK habits), `date`, `completed`, `mood`, `notes`, `created_at`; UNIQUE(habit_id, date).

Índices em `user_id`, `habit_id` e `date` para consultas rápidas. Schema em `backend/src/db/schema.sql`; migração via script em `backend/src/db/migrate.ts` (`npm run db:migrate`).

---

## 6. APIs principais (resumo)

| Método | Rota (backend)        | Autenticação | Descrição                    |
|--------|------------------------|-------------|------------------------------|
| POST   | /api/auth/register     | Não         | Cadastrar usuário            |
| POST   | /api/auth/login        | Não         | Login email/senha → JWT      |
| POST   | /api/auth/oauth-user   | Não         | Criar/atualizar usuário OAuth → JWT |
| GET    | /api/auth/me           | JWT         | Dados do usuário logado      |
| GET    | /api/habits            | JWT         | Listar hábitos               |
| POST   | /api/habits            | JWT         | Criar hábito                 |
| PUT    | /api/habits/:id        | JWT         | Atualizar hábito             |
| DELETE | /api/habits/:id        | JWT         | Remover hábito               |
| POST   | /api/habits/:id/log    | JWT         | Registrar check-in          |
| GET    | /api/habits/:id/logs   | JWT         | Listar logs do hábito        |
| GET    | /api/analytics         | JWT         | Dados para gráficos/dashboard |
| POST   | /api/ai/insights        | JWT         | Insights com IA              |
| POST   | /api/ai/ask             | JWT         | Perguntar sobre hábitos (LLM) |
| GET    | /api/export/:format     | JWT         | Exportar CSV ou JSON         |

No frontend, as chamadas às rotas acima são feitas via **proxy** (`/api/proxy/...`), exceto register/login e oauth-user, que são chamadas diretas ao backend pelo NextAuth no servidor.

---

## 7. Fluxo de dados (exemplo: criar hábito)

1. Usuário logado acessa **Hábitos** e clica em “Novo hábito”.
2. Preenche nome (e opcionalmente categoria, cor, meta) e envia o formulário.
3. Frontend chama `api('/api/habits', { method: 'POST', body: JSON.stringify(...), useProxy: true })`.
4. Isso gera `POST http://localhost:3000/api/proxy/habits` com cookie da sessão NextAuth.
5. O proxy lê o JWT da sessão, pega o `accessToken` (JWT do backend) e faz `POST http://localhost:4000/api/habits` com `Authorization: Bearer <accessToken>` e o mesmo body.
6. Backend valida o JWT, cria o hábito no PostgreSQL e responde 201 com o hábito criado.
7. O proxy repassa a resposta ao frontend; o React Query invalida a lista de hábitos e a UI atualiza.

---

## 8. Tecnologias e ferramentas

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, NextAuth.js, TanStack React Query, Recharts, date-fns, lucide-react.
- **Backend:** Node.js, Express, TypeScript, pg (PostgreSQL), bcryptjs, jsonwebtoken, compression, Swagger (api-docs), openai (para POST /api/ai/ask).
- **Banco:** PostgreSQL (schema e migração no repositório).
- **Dev:** dotenv, docker-compose (opcional para DB).

---

## 9. Variáveis de ambiente importantes

- **Backend:** `JWT_SECRET`, `JWT_EXPIRES_IN`, `DATABASE_URL` (ou `PG_*`), `FRONTEND_URL`, `PORT`. Para "Pergunte sobre seus hábitos": `OPENAI_API_KEY` (obrigatória), `OPENAI_MODEL` (opcional, default `gpt-4o-mini`).
- **Frontend:** `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_API_URL`. Para OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.

Detalhes e exemplos em `.env.example` e em `frontend/.env.local.example`.

---

Este arquivo descreve o comportamento atual do sistema; para rodar o projeto localmente e comandos de script, consulte o `README.md`.
