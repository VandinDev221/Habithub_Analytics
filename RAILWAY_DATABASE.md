# Configurar PostgreSQL no Railway — "Banco de dados não configurado"

Se você vê a mensagem **"Banco de dados não configurado. No Railway: confira DATABASE_URL e rode as migrações (npm run db:migrate)."**, o backend está no ar mas **não consegue usar o banco**. Siga os passos abaixo.

## Checklist rápido

- [ ] **DATABASE_URL** está definida no **serviço do backend** (não só no Postgres): Variables → `DATABASE_URL` = referência `${{ Postgres.DATABASE_URL }}` ou connection string copiada.
- [ ] **Migrações** rodaram: o start command do backend já inclui `npm run db:migrate` (ex.: `npm run build && npm run db:migrate && npm run start`). Se não, rode uma vez: na pasta `backend`, com Railway CLI: `railway run npm run db:migrate`, ou altere o Custom Start Command para incluir `db:migrate` e faça redeploy.
- [ ] **Redeploy** do backend após alterar variáveis, para as mudanças valerem.

---

## 1. Criar o PostgreSQL no Railway

1. No **dashboard do Railway**, abra o **projeto** onde está o backend.
2. Clique em **"+ New"** (ou **Add Service**).
3. Escolha **"Database"** → **"PostgreSQL"**.
4. Aguarde o deploy. O Railway cria um serviço e gera a variável **DATABASE_URL**.

---

## 2. Conectar DATABASE_URL ao backend

O backend precisa “enxergar” a variável **DATABASE_URL** que o Postgres já tem. Você faz isso **no serviço do backend**, não no do Postgres.

### Onde clicar

1. Na tela do **projeto** no Railway você vê vários “quadrados” (cada um é um serviço): por exemplo **backend** e **Postgres** (ou **PostgreSQL**).
2. **Clique no quadrado/cartão do BACKEND** (o da sua API, não o do banco).
3. Abra a aba **Variables** (no topo ou no menu lateral daquele serviço).

### Como adicionar a variável

No serviço **Postgres**, a tela **"Connect"** / **"Connect to Postgres"** do Railway indica: crie no serviço que vai conectar ao banco uma variável com valor **`${{ Postgres.DATABASE_URL }}`**. Use isso no backend (passos abaixo).

Você vai **criar uma variável nova** no backend com nome `DATABASE_URL` e valor apontando para o Postgres. Há duas formas:

---

#### Opção A — Referência (recomendado)

1. Na aba **Variables** do backend, clique em **“New Variable”** (botão para adicionar variável).
2. No **nome** da variável, digite: **`DATABASE_URL`**.
3. No **valor** da variável, use a sintaxe de referência do Railway.  
   Digite **`${{`** (cifrão, duas chaves) e **espere**: o Railway pode mostrar um menu com os serviços e variáveis.  
   - Se aparecer o menu: escolha o serviço do **Postgres** (o nome exato que aparece no seu projeto) e depois **DATABASE_URL**.  
   - Se não aparecer o menu, digite manualmente (troque `NomeDoPostgres` pelo nome real do serviço do Postgres no seu projeto):  
     **`${{ NomeDoPostgres.DATABASE_URL }}`**  
     Exemplos de nome: `Postgres`, `PostgreSQL`, `postgres`. O nome é o que está no “cartão” do serviço do banco no projeto.
4. Salve a variável (botão **Add** / **Save** / **Confirmar**).

**Como achar o nome do serviço Postgres:** na tela do projeto, olhe o **título do cartão** do banco (Postgres, PostgreSQL, etc.). Esse é o nome que você usa em `${{ NomeDoPostgres.DATABASE_URL }}`.

---

#### Opção B — Copiar e colar a connection string

Se não achar a opção de referência ou preferir colar o valor:

1. **Pegar a URL do Postgres:**  
   Clique no serviço do **PostgreSQL** (o quadrado do banco).  
   Vá em **Variables** ou na aba **Connect** / **Data**.  
   Copie o valor de **DATABASE_URL** ou da **connection string** (algo como `postgresql://postgres:xxxxx@xxxx.railway.app:5432/railway`).

2. **Colar no backend:**  
   Volte ao serviço do **backend** → aba **Variables** → **New Variable**.  
   Nome: **`DATABASE_URL`**.  
   Valor: **cole** a connection string que você copiou.  
   Salve.

---

### Aplicar as mudanças e redeploy

No Railway, alterar variáveis deixa as mudanças **“staged”** (pendentes). É preciso **aplicar/deploy** para elas valerem.

- Se aparecer um aviso tipo **“You have staged changes”** ou **“Deploy to apply”**, clique em **Deploy** / **Apply** / **Redeploy** no serviço do backend.
- Ou use o botão **Redeploy** do próprio serviço backend depois de salvar as variáveis.

Depois que o deploy terminar, teste de novo o cadastro no site.

---

## 3. Migrações (criação das tabelas)

O `railway.toml` do backend já está com:

`npm run build && npm run db:migrate && npm run start`

Ou seja, a cada deploy as migrações rodam antes de subir o servidor e as tabelas (`users`, `habits`, etc.) são criadas. Depois do primeiro deploy com **DATABASE_URL** configurada, o cadastro e o login devem funcionar.

Se o deploy **falhar** na etapa `db:migrate`, veja os **logs** do Railway. Se aparecer algo como "relation \"users\" already exists", as tabelas já existem; nesse caso você pode trocar o start command temporariamente para só `npm run build && npm run start` ou corrigir o script de migração para ser idempotente.

---

## 4. Testar conexão e migrações

### Pelo backend já no Railway

Abra no navegador a URL do seu backend + **`/api/db-check`**:

- Ex.: `https://habithubanalytics-production-e95b.up.railway.app/api/db-check`

A resposta é um JSON com:

- **databaseUrlSet** — se `DATABASE_URL` está definida no backend
- **connectionOk** — se a conexão com o Postgres funcionou
- **tablesOk** — se a tabela `users` existe (migrações rodaram)
- **hint** — mensagem de o que fazer se algo falhar

Se `connectionOk` e `tablesOk` forem `true`, está tudo certo.

### Pelo seu PC (script no backend)

Na pasta **backend**, com a **URL pública** do Postgres (em Connect → Public Network no Railway) no `.env` como `DATABASE_URL`:

```bash
npm run db:check    # testa conexão e se as tabelas existem
npm run db:migrate  # cria as tabelas (se ainda não existirem)
```

**Atenção:** use a connection string **pública** (host tipo `xxx.proxy.rlwy.net`), não `postgres.railway.internal`, senão a conexão do seu PC falha.

Com **Railway CLI** instalado e o projeto linkado, você pode rodar no ambiente do Railway (aí vale a URL interna):

```bash
railway run npm run db:check
railway run npm run db:migrate
```

---

## Resumo

| O que fazer | Onde |
|-------------|------|
| Criar serviço PostgreSQL | Projeto Railway → + New → Database → PostgreSQL |
| Definir DATABASE_URL no backend | Serviço do backend → Variables → Add Reference (Postgres) ou colar a connection string |
| Redeploy do backend | Serviço do backend → Deploy → Redeploy (ou novo commit) |

Depois disso, teste de novo o **cadastro** em https://habithub-analytics.vercel.app/auth/register.

---

## Não encontro "New Variable" ou a referência

- **Variables em outro lugar:** Em alguns layouts o Railway mostra **Settings** → **Variables**, ou um ícone de “engrenagem” no serviço. Procure por **Variables**, **Environment**, **Env Vars** ou **Config**.
- **Raw Editor:** Se existir **“RAW Editor”** ou **“Bulk edit”** na tela de variáveis, você pode colar algo no formato:
  ```
  DATABASE_URL=postgresql://postgres:senha@host:5432/railway
  ```
  (substitua pelo valor que você copiou do serviço Postgres.)
- **Nome do serviço Postgres:** Na página do projeto, o nome que aparece no **cartão** do banco (ex.: “Postgres”, “PostgreSQL”) é o que você usa em `${{ NomeDoServico.DATABASE_URL }}`. Se o nome tiver espaço, use sem espaço ou entre aspas conforme o que o Railway aceitar.
