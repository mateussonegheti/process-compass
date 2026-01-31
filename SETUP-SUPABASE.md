# Configuração do Supabase Externo

Este guia documenta como configurar o projeto para usar seu Supabase externo.

## ✅ Passos Já Concluídos

1. **Variáveis de ambiente atualizadas** (`.env`)
2. **Project ID atualizado** (`supabase/config.toml`)

## 🔧 Próximos Passos

### 1. Linkar o Supabase CLI ao seu projeto

```bash
# Login no Supabase CLI (se ainda não estiver logado)
npx supabase login

# Linkar ao seu projeto externo
npx supabase link --project-ref suvbaofilczyxquuinwj
```

Quando solicitado, você precisará fornecer a **database password** do seu projeto Supabase.

### 2. Aplicar as Migrations ao Banco de Dados

```bash
# Aplicar todas as migrations ao banco remoto
npx supabase db push
```

Este comando aplicará todas as migrations da pasta `supabase/migrations/` ao seu banco de dados externo.

### 3. Verificar a Aplicação das Migrations

```bash
# Ver histórico de migrations
npx supabase migration list

# Verificar status do banco
npx supabase db diff
```

### 4. (Opcional) Fazer Deploy da Edge Function

Se você usa a função `delete-user`:

```bash
# Deploy todas as functions
npx supabase functions deploy

# Ou apenas uma específica
npx supabase functions deploy delete-user
```

## 🗄️ Estrutura do Banco de Dados

As seguintes migrations serão aplicadas (em ordem):

1. `20260112133809_df2ef4ef-9fe6-4672-a24c-51fb517ee4a6.sql` - Estrutura inicial
2. `20260112140310_f60be855-67dc-49fd-928a-e89c1c31d572.sql` - Ajustes
3. `20260112143617_3f7b9fe7-5b09-447b-839e-594b0487bb39.sql` - RLS policies
4. `20260112143717_77952337-a8f1-4181-867d-adf8eebbbd76.sql` - Storage
5. `20260112160901_ed3a4392-e224-4d21-b769-3067cb0cc1a5.sql` - Ajustes adicionais
6. `20260119150455_04cb4cb1-ade1-44bd-9bc1-7d23e50988d0.sql` - Mais ajustes
7. `20260126_add_queue_control.sql` - Sistema de fila
8. `20260129144958_5e362a43-1e9b-4dfe-a64d-c7c16dcb8a75.sql` - Ajustes recentes
9. `20260129150258_5d3cab1e-2f7d-472c-93e5-cf9267349f75.sql` - Mais ajustes
10. `20260129150933_09cd6a97-481a-4349-ad5a-00231880c4b7.sql` - Últimos ajustes

## 🚀 Testar a Aplicação

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação deve agora conectar ao seu Supabase externo em `https://suvbaofilczyxquuinwj.supabase.co`

## 📝 Commits Recomendados

Após aplicar as migrations e testar:

```bash
# Adicionar mudanças (config.toml é versionado, .env não)
git add supabase/config.toml

# Commit
git commit -m "config: atualizar project_id para Supabase externo"

# Push
git push origin main
```

## ⚠️ Importante

- ✅ O arquivo `.env` está no `.gitignore` - suas credenciais **não serão commitadas**
- ✅ Apenas o `project_id` no `config.toml` será commitado
- ✅ Para GitHub Pages, configure as variáveis no GitHub Secrets:
  - `Settings → Secrets and variables → Actions`
  - Adicione: `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`

## 🔍 Verificação Rápida

Para garantir que está tudo funcionando:

```bash
# Testar conexão com o banco
npx supabase db remote list-tables

# Ver status do projeto
npx supabase status
```

## 🆘 Troubleshooting

### Erro: "Failed to link project"
- Verifique se está logado: `npx supabase login`
- Verifique o project_id no portal Supabase

### Erro ao fazer push das migrations
- Certifique-se que tem permissões no projeto
- Verifique a database password

### Frontend não conecta
- Verifique se as variáveis no `.env` estão corretas
- Reinicie o servidor dev (`npm run dev`)
- Verifique o console do browser para erros

## 📚 Recursos

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [GitHub Actions Secrets](https://docs.github.com/pt/actions/security-guides/encrypted-secrets)
