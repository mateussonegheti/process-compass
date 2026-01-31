-- Atualizar função capturar_proximo_processo para retornar os campos de movimentos e peças

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
  v_mov_codigos text;
  v_mov_descricoes text;
  v_mov_complementos text;
  v_mov_datas text;
  v_pecas_tipos text;
  v_pecas_ids text;
BEGIN
  -- 1. Primeiro, liberar qualquer processo órfão deste usuário
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

  -- 2. Selecionar E capturar o próximo processo atomicamente
  -- FOR UPDATE SKIP LOCKED garante que cada transação pega um registro diferente
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
    prazo_5_anos_completo,
    mov_codigos,
    mov_descricoes,
    mov_complementos,
    mov_datas,
    pecas_tipos,
    pecas_ids
  INTO 
    v_processo_id,
    v_codigo_processo,
    v_numero_cnj,
    v_possui_assunto,
    v_assunto_principal,
    v_possui_mov_arquivado,
    v_data_distribuicao,
    v_data_arquivamento_def,
    v_prazo_5_anos_completo,
    v_mov_codigos,
    v_mov_descricoes,
    v_mov_complementos,
    v_mov_datas,
    v_pecas_tipos,
    v_pecas_ids;

  -- 3. Verificar se encontrou algum processo
  IF v_processo_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SEM_PROCESSOS_PENDENTES',
      'message', 'Não há mais processos pendentes na fila'
    );
  END IF;

  -- 4. Retornar sucesso com dados completos do processo (incluindo movimentos e peças)
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
    'mov_codigos', v_mov_codigos,
    'mov_descricoes', v_mov_descricoes,
    'mov_complementos', v_mov_complementos,
    'mov_datas', v_mov_datas,
    'pecas_tipos', v_pecas_tipos,
    'pecas_ids', v_pecas_ids,
    'message', 'Processo capturado com sucesso'
  );
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.capturar_proximo_processo(uuid, uuid) TO authenticated;