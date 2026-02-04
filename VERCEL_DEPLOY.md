# Deploy na Vercel — Leia antes de fazer deploy

O app Next.js está na pasta **`frontend/`**, não na raiz do repositório.

Na raiz do projeto existe um **`vercel.json`** com `"rootDirectory": "frontend"`. Assim a Vercel usa essa pasta automaticamente ao fazer o deploy. **Faça commit e push desse arquivo** para o repositório conectado à Vercel e faça um novo deploy (ou aguarde o deploy automático).

Se mesmo assim o site mostrar **404**, confira no painel:

---

## Correção manual no painel (se precisar)

1. Acesse **[vercel.com](https://vercel.com)** e abra o projeto **Habithub_Analytics**.
2. Vá em **Settings** (Configurações).
3. Procure a seção **Build and Deployment** (ou **General**).
4. Encontre **Root Directory** → **Edit** → digite **`frontend`** → **Save**.
5. Aba **Deployments** → menu (⋯) do último deploy → **Redeploy**.

Depois do redeploy, a página inicial deve carregar normalmente.

---

## Por que isso acontece?

- Na raiz do repositório existem as pastas `frontend/` e `backend/`.
- O **frontend** (Next.js) é o que a Vercel deve publicar.
- Se a **Root Directory** ficar em branco, a Vercel usa a raiz do repo, onde não há `package.json` do Next.js nem as rotas do app → resultado é **404**.

Definir **Root Directory** = **`frontend`** faz a Vercel buildar e servir o Next.js a partir da pasta correta.
