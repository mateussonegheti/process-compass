

# Plano: Correção da Race Condition na Captura de Processos

## Diagnóstico do Problema

A race condition ocorre porque a seleção do processo acontece no front-end ANTES do lock ser adquirido no banco:

```
USUÁRIO A                          USUÁRIO B
    |                                  |
    v                                  v
SELECT proximo PENDENTE            SELECT proximo PENDENTE
    |                                  |
    +---> Escolhe processo #123 <------+
    |                                  |
    v                                  v
RPC capturar_processo(#123)        RPC capturar_processo(#123)
    |                                  |
    v                                  v
  LOCK (mas ja escolheu!)          LOCK (espera A terminar)
    |                                  |
    v                                  v
  Captura OK                       Erro: ja em uso
```

O problema: ambos escolhem o mesmo processo ANTES do lock existir.

---

## Solucao Proposta

Mover a selecao do processo para DENTRO do banco de dados usando `FOR UPDATE SKIP LOCKED`:

```
USUARIO A                          USUARIO B
    |                                  |
    v                                  v
RPC capturar_proximo()             RPC capturar_proximo()
    |                                  |
    v                                  v
SELECT FOR UPDATE SKIP LOCKED      SELECT FOR UPDATE SKIP LOCKED
    |                                  |
    v                                  v
  Lock #123, retorna #123          Skip #123, Lock #124, retorna #124
```

---

## Script SQL para Executar no Supabase

```sql
-- =====================================================
-- NOVA FUNCAO: capturar_proximo_processo
-- Resolve race condition selecionando E capturando atomicamente
-- =====================================================

CREATE OR REPLACE FUNCTION public.capturar_proximo_processo(
  p_lote_id uuid, 
  p_profile_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_processo_id uuid;
  v_codigo_processo text;
  v_numero_cnj text;
  v_possui_assunto text;
  v_assunto_principal text;
  v_possui_mov_arquivado text;
  v_data_distribuicao text;
  v_data_arquivamento_def text;
  v_prazo_5_anos_completo text;
BEGIN
  -- 1. Primeiro, liberar qualquer processo orfao deste usuario
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE'
    AND lote_id = p_lote_id;

  -- 2. Selecionar E capturar o proximo processo atomicamente
  -- FOR UPDATE SKIP LOCKED garante que cada transacao pega um registro diferente
  UPDATE processos_fila
  SET 
    status_avaliacao = 'EM_ANALISE',
    responsavel_avaliacao = p_profile_id,
    data_inicio_avaliacao = NOW(),
    updated_at = NOW()
  WHERE id = (
    SELECT id 
    FROM processos_fila
    WHERE lote_id = p_lote_id 
      AND status_avaliacao = 'PENDENTE'
    ORDER BY created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING 
    id, 
    codigo_processo,
    numero_cnj,
    possui_assunto,
    assunto_principal,
    possui_mov_arquivado,
    data_distribuicao,
    data_arquivamento_def,
    prazo_5_anos_completo
  INTO 
    v_processo_id,
    v_codigo_processo,
    v_numero_cnj,
    v_possui_assunto,
    v_assunto_principal,
    v_possui_mov_arquivado,
    v_data_distribuicao,
    v_data_arquivamento_def,
    v_prazo_5_anos_completo;

  -- 3. Verificar se encontrou algum processo
  IF v_processo_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SEM_PROCESSOS_PENDENTES',
      'message', 'Nao ha mais processos pendentes na fila'
    );
  END IF;

  -- 4. Retornar sucesso com dados completos do processo
  RETURN jsonb_build_object(
    'success', true,
    'processo_id', v_processo_id,
    'codigo_processo', v_codigo_processo,
    'numero_cnj', v_numero_cnj,
    'possui_assunto', COALESCE(v_possui_assunto, ''),
    'assunto_principal', COALESCE(v_assunto_principal, ''),
    'possui_mov_arquivado', COALESCE(v_possui_mov_arquivado, ''),
    'data_distribuicao', COALESCE(v_data_distribuicao, ''),
    'data_arquivamento_def', COALESCE(v_data_arquivamento_def, ''),
    'prazo_5_anos_completo', COALESCE(v_prazo_5_anos_completo, ''),
    'message', 'Processo capturado com sucesso'
  );
END;
$$;

-- Dar permissao para usuarios autenticados executarem
GRANT EXECUTE ON FUNCTION public.capturar_proximo_processo(uuid, uuid) TO authenticated;
```

---

## Alteracoes Necessarias no Front-End

Sim, sera necessario alterar o front-end para usar a nova funcao. Sao **2 pontos principais**:

### 1. Funcao `handleIniciarAvaliacao` (src/pages/Index.tsx, linhas 220-293)

**Antes (com race condition):**
```typescript
// 1. Query para buscar processo (PROBLEMA: dois usuarios podem pegar o mesmo)
const { data: proximoProcessoDb } = await supabase
  .from("processos_fila")
  .select("*")
  .eq("status_avaliacao", "PENDENTE")
  ...

// 2. Depois chama RPC com o ID ja escolhido
const { data: capturaData } = await supabase.rpc('capturar_processo', {
  p_codigo_processo: proximoProcessoDb.codigo_processo,
  ...
});
```

**Depois (atomico, sem race condition):**
```typescript
// Uma unica chamada que seleciona E captura atomicamente
const { data: capturaData, error: capturaError } = await supabase.rpc('capturar_proximo_processo', {
  p_lote_id: loteAtivo.id,
  p_profile_id: profile.id
});

if (capturaData?.success) {
  const processoFormatado: ProcessoFila = {
    ID: capturaData.processo_id,
    CODIGO_PROCESSO: capturaData.codigo_processo,
    NUMERO_CNJ: capturaData.numero_cnj,
    POSSUI_ASSUNTO: capturaData.possui_assunto,
    ASSUNTO_PRINCIPAL: capturaData.assunto_principal,
    POSSUI_MOV_ARQUIVADO: capturaData.possui_mov_arquivado,
    DATA_DISTRIBUICAO: capturaData.data_distribuicao,
    DATA_ARQUIVAMENTO_DEF: capturaData.data_arquivamento_def,
    PRAZO_5_ANOS_COMPLETO: capturaData.prazo_5_anos_completo,
    STATUS_AVALIACAO: "EM_ANALISE",
    RESPONSAVEL: sessao.responsavel,
    DATA_INICIO_AVALIACAO: new Date().toISOString()
  };
  // ...
}
```

### 2. Funcao `handleSalvarEProximo` (src/pages/Index.tsx, linhas 390-434)

A mesma logica se aplica ao buscar o proximo processo apos salvar uma avaliacao.

---

## Resumo das Acoes

| Acao | Onde | Obrigatorio |
|------|------|-------------|
| Executar script SQL | SQL Editor do Supabase | Sim |
| Alterar `handleIniciarAvaliacao` | src/pages/Index.tsx | Sim |
| Alterar `handleSalvarEProximo` | src/pages/Index.tsx | Sim |
| Manter funcao `capturar_processo` antiga | Supabase | Opcional (pode remover depois) |

---

## Por que SKIP LOCKED resolve o problema

- `FOR UPDATE` bloqueia a linha para outras transacoes
- `SKIP LOCKED` faz com que transacoes concorrentes **pulem** linhas ja bloqueadas ao inves de esperar
- Resultado: cada usuario sempre pega uma linha diferente, mesmo em acesso simultaneo

Esta e a mesma tecnica usada por sistemas de filas de alta concorrencia como RabbitMQ e SQS.

