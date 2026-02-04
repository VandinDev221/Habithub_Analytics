# Deploy na Vercel — Leia antes de fazer deploy

Se o site **habithub-analytics.vercel.app** (ou o seu domínio) mostrar **404** ao abrir a página inicial, é porque a Vercel está buildando a **raiz** do repositório, onde **não está** o app Next.js.

O app Next.js está na pasta **`frontend/`**.

---

## Correção obrigatória (uma vez por projeto)

1. Acesse **[vercel.com](https://vercel.com)** e abra o projeto **Habithub_Analytics**.
2. Vá em **Settings** (Configurações).
3. Em **General**, encontre **Root Directory**.
4. Clique em **Edit**.
5. Digite ou selecione: **`frontend`** (só a pasta, sem barra no final).
6. Clique em **Save**.
7. Vá na aba **Deployments**, abra o menu (⋯) do último deploy e clique em **Redeploy**.

Depois do redeploy, a página inicial deve carregar normalmente.

---

## Por que isso acontece?

- Na raiz do repositório existem as pastas `frontend/` e `backend/`.
- O **frontend** (Next.js) é o que a Vercel deve publicar.
- Se a **Root Directory** ficar em branco, a Vercel usa a raiz do repo, onde não há `package.json` do Next.js nem as rotas do app → resultado é **404**.

Definir **Root Directory** = **`frontend`** faz a Vercel buildar e servir o Next.js a partir da pasta correta.
