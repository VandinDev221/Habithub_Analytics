# Deploy na Vercel

O app Next.js está na pasta **`frontend/`**. A Vercel precisa usar essa pasta como raiz do build.

## Configurar Root Directory

1. **[vercel.com](https://vercel.com)** → projeto **Habithub_Analytics** → **Settings**.
2. Seção **Build and Deployment** (ou **General**).
3. **Root Directory** → **Edit** → digite **`frontend`** → **Save**.
4. **Deployments** → menu (⋯) do último deploy → **Redeploy**.

Sem isso, o build usa a raiz do repositório e o site retorna **404**.
