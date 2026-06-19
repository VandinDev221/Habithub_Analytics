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
- **Value:** URL do backend no **Render**, **com** `https://` e **sem** barra no final. Exemplo:
  - `https://habithub-api.onrender.com`
  - (copie a URL do Web Service em Render → Settings)

---

## Login com Google e GitHub (obrigatório para OAuth)

As variáveis abaixo precisam estar na **Vercel** (Settings → Environment Variables → Production). Depois de salvar, faça **Redeploy**.

| Key | Onde obter |
|-----|------------|
| **GOOGLE_CLIENT_ID** | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client |
| **GOOGLE_CLIENT_SECRET** | mesmo client OAuth do Google |
| **GITHUB_CLIENT_ID** | GitHub → Settings → Developer settings → OAuth Apps |
| **GITHUB_CLIENT_SECRET** | mesmo OAuth App do GitHub |

### URLs de callback (copie exatamente — só produção)

No **Google Cloud Console** → OAuth client → Authorized redirect URIs:

```
https://habithub-analytics.vercel.app/api/auth/callback/google
```

No **GitHub OAuth App** → Authorization callback URL:

```
https://habithub-analytics.vercel.app/api/auth/callback/github
```

Se o domínio na Vercel for outro, troque `habithub-analytics.vercel.app` pelo seu domínio em **NEXTAUTH_URL** e nas URLs acima.

### Erro `OAuthSignin` ao clicar Google/GitHub

- **GOOGLE_CLIENT_ID** ou **GITHUB_CLIENT_ID** vazio/incorreto na Vercel
- **Secret** errado ou com espaço extra ao colar
- Redirect URI no Google/GitHub **diferente** da URL acima
- Variável salva mas **Redeploy** não feito

---

## Conferir se o frontend fala com o backend

Depois do deploy, abra no navegador:

**`https://habithub-analytics.vercel.app/api/backend-ping`**

- Se retornar **`{"ok":true,"backend":true,...}`** → a Vercel está conseguindo chamar o backend (Render). Cadastro e login devem funcionar.
- Se retornar **`{"ok":false,"error":"Backend inacessível..."}`** → confira **NEXT_PUBLIC_API_URL** (URL do Render sem barra no final) e se a API está **Live**. No plano free, a primeira requisição após idle pode demorar ~1 min (cold start). Faça **Redeploy** na Vercel após alterar variáveis.

---

Depois de salvar todas, vá em **Deployments** → **Redeploy** no último deploy para as variáveis valerem.
