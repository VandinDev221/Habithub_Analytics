# Variáveis de ambiente na Vercel — passo a passo

1. Abra **https://vercel.com** → projeto **habithub-analytics** → **Settings**.
2. No menu da esquerda, clique em **Environment Variables**.
3. Para cada variável abaixo: em **Key** coloque o nome; em **Value** coloque o valor; marque **Production** (e Preview se quiser); clique em **Save**.

---

## Variáveis para adicionar

### NEXTAUTH_URL
- **Key:** `NEXTAUTH_URL`
- **Value:** `https://habithub-analytics.vercel.app`  
  (troque se seu domínio for outro, ex.: `https://meudominio.com`)

### NEXTAUTH_SECRET
- **Key:** `NEXTAUTH_SECRET`
- **Value:** use uma chave longa e aleatória. Exemplo gerado (pode usar este):
  ```
  YjbfrP7ubeib8zHbYrQ0LvNDain+hFwzw+HUxAy1oxw=
  ```
  Para gerar outro no PowerShell: `[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])`

### NEXT_PUBLIC_API_URL
- **Key:** `NEXT_PUBLIC_API_URL`
- **Value:** URL do seu backend em produção. Exemplos:
  - Railway: `https://habithub-api-production.up.railway.app`
  - Render: `https://habithub-api.onrender.com`
  - Outro: a URL base da API (sem `/api` no final)
  
  **Se o backend ainda não estiver deployado,** coloque um placeholder (ex.: `https://seu-backend.onrender.com`) e depois atualize quando subir a API.

---

## Opcionais (login com Google)

- **Key:** `GOOGLE_CLIENT_ID` → **Value:** (do Google Cloud Console)
- **Key:** `GOOGLE_CLIENT_SECRET` → **Value:** (do Google Cloud Console)

## Opcionais (login com GitHub)

- **Key:** `GITHUB_CLIENT_ID` → **Value:** (do GitHub OAuth App)
- **Key:** `GITHUB_CLIENT_SECRET` → **Value:** (do GitHub OAuth App)

---

Depois de salvar todas, vá em **Deployments** → **Redeploy** no último deploy para as variáveis valerem.
