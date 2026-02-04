# Deploy na Vercel — Leia antes de fazer deploy

O app Next.js está na pasta **`frontend/`**, não na raiz do repositório. A opção **Root Directory** **não** pode ser definida em `vercel.json` (o schema da Vercel não aceita). Ela fica **só no painel** da Vercel.

---

## Onde configurar Root Directory no painel

1. Acesse **[vercel.com](https://vercel.com)** e abra o projeto **Habithub_Analytics**.
2. Vá em **Settings** (Configurações).
3. Abra a seção **Build and Deployment** (não é "General" — role até encontrar).
4. Em **Root Directory**, clique em **Edit**, digite **`frontend`** e salve.
5. Aba **Deployments** → nos três pontinhos (⋯) do último deploy → **Redeploy**.

Depois do redeploy, a página inicial deve carregar normalmente.

---

## Por que isso acontece?

- Na raiz do repositório existem as pastas `frontend/` e `backend/`.
- O **frontend** (Next.js) é o que a Vercel deve publicar.
- Se a **Root Directory** ficar em branco, a Vercel usa a raiz do repo, onde não há `package.json` do Next.js nem as rotas do app → resultado é **404**.

Definir **Root Directory** = **`frontend`** faz a Vercel buildar e servir o Next.js a partir da pasta correta.
