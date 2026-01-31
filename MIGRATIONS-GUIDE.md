# 🚀 Guia Rápido: Aplicar Migrations ao Supabase Remoto

## Opção 1: Usar Access Token (Recomendado para Dev Containers)

### Passo 1: Obter Access Token
1. Acesse: https://supabase.com/dashboard/account/tokens
2. Clique em "Generate new token"
3. Dê um nome (ex: "process-compass-dev")
4. Copie o token gerado

### Passo 2: Configurar no terminal
```bash
# Defina o token como variável de ambiente
export SUPABASE_ACCESS_TOKEN="seu_token_aqui"

# Linkar ao projeto
npx supabase link --project-ref suvbaofilczyxquuinwj

# Aplicar migrations
npx supabase db push
```

---

## Opção 2: Aplicar Migrations Manualmente (Mais Simples)

Se preferir não usar a CLI, você pode aplicar as migrations diretamente no SQL Editor do Supabase:

### Passo 1: Acesse o SQL Editor
https://supabase.com/dashboard/project/suvbaofilczyxquuinwj/sql/new

### Passo 2: Execute cada migration em ordem:

1. **20260112133809** - Estrutura inicial
2. **20260112140310** - Ajustes
3. **20260112143617** - RLS policies
4. **20260112143717** - Storage
5. **20260112160901** - Ajustes adicionais
6. **20260119150455** - Mais ajustes
7. **20260126_add_queue_control** - Sistema de fila (⚠️ IMPORTANTE)
8. **20260129144958** - Ajustes recentes
9. **20260129150258** - Mais ajustes
10. **20260129150933** - Últimos ajustes

### Como executar:
- Abra cada arquivo `.sql` da pasta `supabase/migrations/`
- Copie todo o conteúdo
- Cole no SQL Editor
- Clique em "Run"

⚠️ **Execute na ordem dos timestamps!**

---

## Opção 3: Importar SQL Export Completo

Se quiser importar tudo de uma vez:

1. Use o arquivo: `public/export/cogede-database-export-completo.sql`
2. Acesse: https://supabase.com/dashboard/project/suvbaofilczyxquuinwj/sql/new
3. Cole o conteúdo completo
4. Execute

---

## ✅ Após Aplicar as Migrations

### Testar a conexão:
```bash
npm run dev
```

Acesse: http://localhost:8080/process-compass/

### Fazer commit:
```bash
git add supabase/config.toml SETUP-SUPABASE.md
git commit -m "config: migrar para Supabase externo"
git push origin main
```

---

## 🔍 Verificar se funcionou

1. **No Supabase Dashboard**:
   - Vá em: Database → Tables
   - Você deve ver as tabelas: `processos_fila`, `avaliacoes_documentais`, `users`, etc.

2. **Na aplicação**:
   - Login deve funcionar
   - Dashboard deve carregar dados
   - Sistema de fila deve funcionar

---

## 📝 GitHub Actions (Deploy)

Para o deploy automático no GitHub Pages funcionar:

1. Vá em: https://github.com/mateussonegheti/process-compass/settings/secrets/actions
2. Adicione os secrets:
   - `VITE_SUPABASE_URL` = `https://suvbaofilczyxquuinwj.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 🆘 Precisa de Ajuda?

**Erro comum**: "relation does not exist"
- Solução: Certifique-se de executar as migrations na ordem correta

**Erro comum**: "permission denied"
- Solução: Verifique as RLS policies (migration 20260112143617)

**Erro comum**: "connection refused"
- Solução: Verifique se as variáveis no `.env` estão corretas
