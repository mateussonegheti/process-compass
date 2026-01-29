-- =============================================
-- FUNÇÕES PARA CONTROLE ATÔMICO DE PROCESSOS
-- =============================================

-- 1. Função para capturar processo atomicamente
-- Garante que apenas um usuário pode capturar um processo por vez
-- e que um usuário só pode ter um processo em análise
CREATE OR REPLACE FUNCTION public.capturar_processo(
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
  v_processo_id uuid;
  v_status_atual text;
  v_responsavel_atual uuid;
BEGIN
  -- Primeiro, liberar qualquer processo órfão deste usuário
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE'
    AND lote_id = p_lote_id;

  -- Adquirir lock advisory para serializar acesso ao processo
  PERFORM pg_advisory_xact_lock(hashtext('processo_' || p_codigo_processo));

  -- Buscar o processo e seu status atual
  SELECT id, status_avaliacao, responsavel_avaliacao
  INTO v_processo_id, v_status_atual, v_responsavel_atual
  FROM processos_fila
  WHERE codigo_processo = p_codigo_processo
    AND lote_id = p_lote_id
  FOR UPDATE;

  -- Verificar se o processo existe
  IF v_processo_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_ENCONTRADO',
      'message', 'Processo não encontrado no lote atual'
    );
  END IF;

  -- Verificar se já está sendo avaliado por outro usuário
  IF v_status_atual = 'EM_ANALISE' AND v_responsavel_atual IS NOT NULL AND v_responsavel_atual != p_profile_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_EM_USO',
      'message', 'Este processo já está sendo avaliado por outro usuário'
    );
  END IF;

  -- Verificar se já está concluído
  IF v_status_atual = 'CONCLUIDO' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_CONCLUIDO',
      'message', 'Este processo já foi avaliado'
    );
  END IF;

  -- Capturar o processo
  UPDATE processos_fila
  SET 
    status_avaliacao = 'EM_ANALISE',
    responsavel_avaliacao = p_profile_id,
    data_inicio_avaliacao = NOW(),
    updated_at = NOW()
  WHERE id = v_processo_id;

  RETURN jsonb_build_object(
    'success', true,
    'processo_id', v_processo_id,
    'message', 'Processo capturado com sucesso'
  );
END;
$$;

-- 2. Função para liberar processo (quando usuário sai ou desiste)
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
BEGIN
  -- Liberar apenas se o processo pertencer ao usuário
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
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_LIBERADO',
      'message', 'Processo não encontrado ou não pertence ao usuário'
    );
  END IF;
END;
$$;

-- 3. Função para liberar TODOS os processos órfãos de um usuário
CREATE OR REPLACE FUNCTION public.liberar_processos_usuario(
  p_profile_id uuid,
  p_lote_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
BEGIN
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

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'processos_liberados', v_rows_affected
  );
END;
$$;

-- 4. Função para liberar processos inativos (timeout de 1 hora)
-- Pode ser chamada via CRON job
CREATE OR REPLACE FUNCTION public.liberar_processos_inativos()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
BEGIN
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    status_avaliacao = 'EM_ANALISE'
    AND updated_at < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'processos_liberados', v_rows_affected,
    'executado_em', NOW()
  );
END;
$$;

-- 5. Conceder permissões para usuários autenticados
GRANT EXECUTE ON FUNCTION public.capturar_processo(text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.liberar_processo(text, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.liberar_processos_usuario(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.liberar_processos_inativos() TO authenticated;