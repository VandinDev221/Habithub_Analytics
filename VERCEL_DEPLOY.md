# Deploy na Vercel

## 1. Root Directory (obrigatório — evita 404 em páginas e em /api/backend-auth/*)

O app Next.js está na pasta **`frontend/`**. Se a Vercel buildar a partir da **raiz** do repositório, você verá **404** em rotas como `/api/backend-auth/register` e nas páginas do app.

**Como configurar:** no projeto na Vercel → **Settings** → **Build and Deployment** (ou **General**) → **Root Directory** → **Edit** → digite **`frontend`** (só a palavra, sem barra) → **Save**. Depois faça **Redeploy**.

---

## 2. Variáveis de ambiente (evitar 500 em /api/auth/session e ERR_CONNECTION_REFUSED)

Em **Settings** → **Environment Variables**, adicione as variáveis abaixo. Use **Production** (e, se quiser, Preview) para cada uma.

### Obrigatórias para o site não quebrar

| Nome | Valor | Observação |
|------|--------|------------|
| **NEXTAUTH_URL** | `https://habithub-analytics.vercel.app` | URL do seu site na Vercel (troque pelo seu domínio se for outro). |
| **NEXTAUTH_SECRET** | uma string longa e aleatória | Gere com: `openssl rand -base64 32` no terminal. Sem isso, `/api/auth/session` pode retornar **500**. |
| **NEXT_PUBLIC_API_URL** | URL do seu backend em produção | Ex.: `https://sua-api.railway.app` ou `https://sua-api.onrender.com`. **Não** use `http://localhost:4000` em produção, senão aparece **ERR_CONNECTION_REFUSED** ao registrar/login. |

### Opcionais (login com Google/GitHub)

- **GOOGLE_CLIENT_ID** e **GOOGLE_CLIENT_SECRET**
- **GITHUB_CLIENT_ID** e **GITHUB_CLIENT_SECRET**

Depois de salvar as variáveis, faça um **Redeploy** para elas valerem.

---

## Resumo dos erros

- **500 em `/api/auth/session`** → falta **NEXTAUTH_SECRET** ou **NEXTAUTH_URL** errado (tem que ser a URL do site na Vercel).
- **ERR_CONNECTION_REFUSED em localhost:4000** → em produção **NEXT_PUBLIC_API_URL** tem que apontar para o backend deployado (Railway, Render, etc.), não para `localhost:4000`. Se o backend ainda não estiver em produção, cadastro e login por email vão falhar até você subir a API e colocar a URL aqui.
