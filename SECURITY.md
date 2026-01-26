# 🔐 Guia de Segurança - Process Compass

## Resumo de Segurança

Este documento explica como o Process Compass protege seus dados e as boas práticas para manter a segurança.

---

## ✅ Está Seguro?

**SIM!** Contanto que você siga as práticas recomendadas abaixo.

### Por quê?

1. **Chaves públicas no navegador são normais**
   - O Supabase foi projetado para usar chaves públicas no frontend
   - Isso é seguro porque o RLS (Row Level Security) valida cada requisição

2. **Você nunca expõe chaves secretas**
   - A `SERVICE_ROLE_KEY` fica no backend (não está no código)
   - Senhas de usuários são hasheadas pelo Supabase Auth

3. **Dados são protegidos por múltiplas camadas**
   - Autenticação: Supabase Auth valida quem é você
   - Autorização: RLS verifica o que você pode acessar
   - Criptografia: Dados em trânsito (HTTPS) e em repouso

---

## 🚨 Vulnerabilidades Encontradas e Corrigidas

### 1. ❌ Requisições HTTP diretas ao Supabase
**Status**: ✅ CORRIGIDO

Antes (inseguro):
```typescript
const headers = {
  'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
};
const response = await fetch(url, { method: 'PATCH', headers, body: payload });
```

Depois (seguro):
```typescript
await supabase
  .from("processos_fila")
  .update(data)
  .eq("codigo_processo", value);
```

**Por quê importa**: Usar o cliente Supabase garante:
- ✅ Melhor tratamento de erros
- ✅ Integração com RLS
- ✅ Melhor segurança de sessão
- ✅ Menos exposição de implementação

---

## 🔒 Práticas de Segurança

### Variáveis de Ambiente

✅ **Correto** - Variáveis públicas:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
```

❌ **NUNCA faça isso** - Variáveis secretas:
```env
# NÃO COLOQUE ISSO NO CÓDIGO FRONTEND
SUPABASE_SERVICE_ROLE_KEY=xxxx
DATABASE_PASSWORD=xxxx
AUTH_SECRET=xxxx
```

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:
- `profiles` - Usuários só veem seus próprios dados
- `avaliacoes` - Apenas supervisores/admins podem ler
- `processos_fila` - Acesso baseado em lote
- `lotes_importacao` - Acesso apenas para importador

Exemplo de policy:
```sql
CREATE POLICY "users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```

### Autenticação

- Senhas são hasheadas com bcrypt
- JWT tokens são validados em cada requisição
- Sessões expiram após período de inatividade
- Email é verificado em cadastro

---

## 🔍 O que pode ser hackeado?

### ❌ Não pode ser hackeado:
- Senhas dos usuários (hasheadas)
- Dados de outros usuários (RLS protege)
- Chaves secretas (não estão no frontend)
- Banco de dados inteiro (RLS restringe acesso)

### ⚠️ Pode ser comprometido se:
1. **Você compartilha sua conta** com alguém
2. **Phishing**: Um atacante enganar você a dar sua senha
3. **CSRF**: Um site malicioso fazer requisições em seu nome (mitigado por CORS)
4. **XSS**: Código malicioso injetado no site (prevenido por Content Security Policy)

---

## 🛡️ Como Manter Seguro

### Para Desenvolvedores

1. **Nunca commit credenciais**
   ```bash
   # ✅ Certo
   git add .
   # (o .env é ignorado automaticamente)
   
   # ❌ Errado
   git add .env
   git commit -m "Add secrets"
   ```

2. **Use variáveis de ambiente**
   ```typescript
   // ✅ Correto
   const url = import.meta.env.VITE_SUPABASE_URL;
   
   // ❌ Errado
   const url = 'https://xxx.supabase.co'; // Hardcoded
   ```

3. **Atualize dependências**
   ```bash
   npm audit fix
   npm outdated
   ```

### Para Usuários

1. **Use senhas fortes**
   - Mínimo 12 caracteres
   - Misture maiúsculas, minúsculas, números, símbolos

2. **Nunca reutilize senhas**
   - Use um gerenciador de senhas

3. **Ative 2FA se disponível**
   - (Quando implementado no Supabase)

---

## 📊 Checklist de Segurança

- [x] Arquivo `.env` não é commitado
- [x] Não há hardcoded secrets no código
- [x] Variáveis públicas começam com `VITE_`
- [x] Usando Supabase Client em vez de HTTP direto
- [x] RLS está habilitado em todas as tabelas
- [x] HTTPS é usado em produção
- [x] Senhas são hasheadas
- [x] Sessões expiram após inatividade
- [x] CORS está configurado corretamente
- [x] Headers de segurança estão presentes

---

## 🔗 Referências

- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10](https://owasp.org/Top10/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

## ❓ Dúvidas?

Se encontrar uma vulnerabilidade:
1. **NÃO compartilhe publicamente**
2. Abra uma issue privada no GitHub
3. Ou entre em contato diretamente

---

**Última atualização**: 2026-01-26  
**Status**: ✅ Seguro para Produção
