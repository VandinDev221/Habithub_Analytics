# PostgreSQL no Render — "Banco de dados não configurado"

Se aparecer **"Banco de dados não configurado. No Render: confira DATABASE_URL e rode as migrações"**, o backend está no ar mas **não consegue usar o banco**.

## Checklist rápido

- [ ] Postgres **Live** no Render
- [ ] Web Service com **DATABASE_URL** = **Internal Database URL** do Postgres
- [ ] **Start Command** inclui migrações: `npm run db:migrate && npm run start`
- [ ] `/api/db-check` retorna `tablesOk: true`

---

## 1. Criar PostgreSQL

1. Render Dashboard → **New** → **PostgreSQL**.
2. Nome: `habithub-db` (ou outro).
3. **Create Database** → aguarde status **Available**.

---

## 2. Conectar ao Web Service

1. Abra o Postgres → aba **Info**.
2. Copie **Internal Database URL** (formato `postgresql://user:pass@dpg-xxx-a/habithub`).
3. Abra o **Web Service** do backend → **Environment**.
4. Adicione ou edite:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Internal Database URL (cole inteira) |

5. **Save Changes** → o Render faz redeploy automático.

**Importante:** use a URL **Internal** no Web Service no mesmo workspace Render. A **External** serve para ferramentas fora do Render (pgAdmin no seu PC).

---

## 3. Rodar migrações

O `render.yaml` e a doc usam start command:

```bash
npm run db:migrate && npm run start
```

Isso cria as tabelas (`users`, `habits`, etc.) a cada deploy.

### Conferir

Abra no navegador:

```
https://SUA-URL.onrender.com/api/db-check
```

Resposta esperada:

```json
{
  "databaseUrlSet": true,
  "connectionOk": true,
  "tablesOk": true,
  "hint": null
}
```

---

## 4. Migração manual (Shell do Render)

1. Web Service → **Shell** (disponível em planos pagos) **ou** use o endpoint protegido:

Defina `RUN_MIGRATE_SECRET` (mín. 16 caracteres) no Environment e:

```powershell
Invoke-RestMethod -Uri "https://SUA-URL.onrender.com/api/db-migrate" -Method POST -Headers @{ Authorization = "Bearer SUA_SECRET" }
```

2. Teste `/api/db-check` de novo.

---

## 5. Diagnóstico local do banco (opcional)

Na pasta `backend`, com a **External Database URL** no `.env`:

```bash
npm run db:check
npm run db:migrate
```

Use a URL **External** do Render (aba Info → External Database URL), não a Internal.

---

## Resumo

| Passo | Onde |
|-------|------|
| Criar Postgres | Render → New → PostgreSQL |
| `DATABASE_URL` | Web Service → Environment → Internal URL |
| Migrações | Start command com `npm run db:migrate` |
| Validar | `/api/db-check` → `tablesOk: true` |
| Vercel | `NEXT_PUBLIC_API_URL` = URL do Web Service |
