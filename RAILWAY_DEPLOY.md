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

No **Variables** do service, configure pelo menos:

- **DATABASE_URL** (ou **PG_HOST**, **PG_USER**, **PG_PASSWORD**, **PG_DATABASE**) — PostgreSQL
- **JWT_SECRET**
- **FRONTEND_URL** = `https://habithub-analytics.vercel.app` (para CORS)
- **OPENAI_API_KEY** (se for usar “Pergunte sobre seus hábitos”)
- **PORT** — o Railway costuma injetar; se precisar, use a variável que eles indicam (ex.: `PORT`)

Depois do deploy, use a URL gerada pelo Railway (ex.: `https://habithub-analytics-production.up.railway.app`) como **NEXT_PUBLIC_API_URL** nas variáveis do frontend na Vercel.
