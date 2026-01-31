-- Melhorar função liberar_processo com mais informações de debug

CREATE OR REPLACE FUNCTION public.liberar_processo(
  p_codigo_processo text,
  p_lote_id uuid,
  p_profile_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
  v_processo_status text;
  v_processo_responsavel uuid;
BEGIN
  -- Verificar estado atual do processo antes de liberar
  SELECT status_avaliacao, responsavel_avaliacao
  INTO v_processo_status, v_processo_responsavel
  FROM processos_fila
  WHERE codigo_processo = p_codigo_processo
    AND lote_id = p_lote_id;

  -- Se processo não existe
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_ENCONTRADO',
      'message', 'Processo não encontrado no lote especificado',
      'debug_info', jsonb_build_object(
        'codigo_processo', p_codigo_processo,
        'lote_id', p_lote_id
      )
    );
  END IF;

  -- Se processo não está EM_ANALISE
  IF v_processo_status != 'EM_ANALISE' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_EM_ANALISE',
      'message', 'Processo não está em análise (status: ' || COALESCE(v_processo_status, 'NULL') || ')',
      'debug_info', jsonb_build_object(
        'codigo_processo', p_codigo_processo,
        'status_atual', v_processo_status
      )
    );
  END IF;

  -- Se processo não pertence ao usuário
  IF v_processo_responsavel IS DISTINCT FROM p_profile_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_PERTENCE',
      'message', 'Processo não pertence ao usuário atual',
      'debug_info', jsonb_build_object(
        'codigo_processo', p_codigo_processo,
        'responsavel_atual', v_processo_responsavel,
        'profile_solicitante', p_profile_id
      )
    );
  END IF;

  -- Liberar processo
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    codigo_processo = p_codigo_processo
    AND lote_id = p_lote_id
    AND responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected > 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Processo liberado com sucesso'
    );
  ELSE
    -- Isso não deveria acontecer após as verificações acima
    RETURN jsonb_build_object(
      'success', false,
      'error', 'ERRO_INESPERADO',
      'message', 'Erro inesperado ao liberar processo'
    );
  END IF;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.liberar_processo(text, uuid, uuid) TO authenticated;
