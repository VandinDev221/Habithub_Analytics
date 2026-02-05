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
- **Value:** URL do backend (Railway), **com** `https://` e **sem** barra no final. Exemplo:
  - **Railway (este projeto):** `https://habithubanalytics-production-e95b.up.railway.app`
  - Outro: a URL base da API (ex.: `https://sua-api.onrender.com`)

---

## Opcionais (login com Google)

- **Key:** `GOOGLE_CLIENT_ID` → **Value:** (do Google Cloud Console)
- **Key:** `GOOGLE_CLIENT_SECRET` → **Value:** (do Google Cloud Console)

## Opcionais (login com GitHub)

- **Key:** `GITHUB_CLIENT_ID` → **Value:** (do GitHub OAuth App)
- **Key:** `GITHUB_CLIENT_SECRET` → **Value:** (do GitHub OAuth App)

---

## Conferir se o frontend fala com o backend

Depois do deploy, abra no navegador:

**`https://habithub-analytics.vercel.app/api/backend-ping`**

- Se retornar **`{"ok":true,"backend":true,...}`** → a Vercel está conseguindo chamar o backend (Railway). Cadastro e login devem funcionar.
- Se retornar **`{"ok":false,"error":"Backend inacessível..."}`** → confira **NEXT_PUBLIC_API_URL** (URL do backend sem barra no final) e se a API está no ar no Railway. Faça **Redeploy** após alterar variáveis.

---

Depois de salvar todas, vá em **Deployments** → **Redeploy** no último deploy para as variáveis valerem.
