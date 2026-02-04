# Deploy na Vercel — Corrigir 404

O app Next.js está na pasta **`frontend/`**. Se a Vercel buildar a raiz do repo, o site retorna **404**. É obrigatório configurar **Root Directory**.

## Onde configurar (uma vez)

1. Abra: **https://vercel.com** → seu time → projeto **habithub-analytics** → aba **Settings**.
2. No menu lateral, clique em **General** (ou **Build and Deployment**).
3. Role até achar **Root Directory**.
   - Se não aparecer: na própria página de Settings, use a **caixa de busca** (se existir) e digite **Root** — o campo Root Directory deve ser listado.
4. Clique em **Edit** ao lado de Root Directory.
5. Digite exatamente: **`frontend`** (sem barra no final).
6. **Save**.
7. Vá em **Deployments** → no último deploy, clique nos **três pontinhos (⋯)** → **Redeploy**.

Sem **Root Directory** = **`frontend`**, a Vercel não acha o Next.js e o site continua em 404.

## Na raiz do repo

Há um **`package.json`** e **`vercel.json`** na raiz com comandos que rodam em `frontend/`. Eles não substituem o Root Directory: o painel precisa estar com **Root Directory** = **`frontend`** para o deploy funcionar.
