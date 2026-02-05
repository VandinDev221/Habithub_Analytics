# Deploy do backend no Railway

O repositório tem **frontend/** (Next.js, deploy na Vercel) e **backend/** (Express, deploy no Railway). O Railpack/Nixpacks analisa a **raiz** do repo e não sabe qual app buildar — é preciso definir a **pasta do backend**.

## Passos no Railway

1. No projeto no **Railway**, abra o **service** (serviço) do backend.
2. Vá em **Settings** (Configurações).
3. Procure **Root Directory** (ou **Source Directory** / **App Root**).
4. Defina como: **`backend`** (só a pasta, sem barra).
5. Salve e faça **Redeploy**.

Assim o Railway passa a usar só a pasta **backend/** (onde está o `package.json` do Node). O build será `npm install` + `npm run build` e o start `npm run start` (ou o comando definido no `railway.toml`).

## Variáveis de ambiente no Railway

**Se aparecer "Banco de dados não configurado"** → siga o guia **[RAILWAY_DATABASE.md](./RAILWAY_DATABASE.md)** para criar o PostgreSQL e definir **DATABASE_URL**.

No **Variables** do service, configure pelo menos:

- **DATABASE_URL** — connection string do PostgreSQL (obrigatório; sem isso o cadastro/login retorna 500/503)
- **JWT_SECRET**
- **FRONTEND_URL** = `https://habithub-analytics.vercel.app` (para CORS)
- **OPENAI_API_KEY** (se for usar “Pergunte sobre seus hábitos”)
- **PORT** — o Railway costuma injetar automaticamente

### Rodar as migrações (obrigatório após o primeiro deploy)

Se o cadastro retornar **500** ou **503** com mensagem de banco, as tabelas ainda não existem. No Railway, em **Settings** do service → **Custom Start Command**, use: `npm run db:migrate && npm run start` (assim as migrações rodam a cada deploy). Alternativa: use o Railway CLI e rode uma vez: `railway run npm run db:migrate` na pasta do backend.

Depois do deploy, use a URL gerada pelo Railway como **NEXT_PUBLIC_API_URL** nas variáveis do frontend na Vercel. Ex.: `https://habithubanalytics-production-e95b.up.railway.app` (sem barra no final).

---

## "The train has not arrived at the station" (Not Found)

Se ao abrir a URL do backend você vê **"Not Found - The train has not arrived at the station"**, o serviço **ainda não tem um domínio público** ou o deploy não terminou.

### O que fazer

1. No **Railway**, abra o **serviço do backend** (não o do Postgres).
2. Vá na aba **Settings** e procure **Networking** / **Public Networking** / **Domains**.
3. Clique em **Generate Domain** (ou **Add domain** / **Create public URL**). O Railway vai criar uma URL tipo `https://seu-servico.up.railway.app` ou `https://seu-servico.railway.app`.
4. Aguarde o deploy concluir (ícone verde no serviço). Só depois a URL responde.
5. Use essa URL (sem barra no final) em **NEXT_PUBLIC_API_URL** na Vercel e para acessar `/api/db-check`.

Se o serviço acabou de ser criado, o primeiro deploy pode levar alguns minutos. Confira em **Deployments** se o último deploy está **Success**.
