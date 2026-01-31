-- Função RPC atômica para capturar o próximo processo pendente
-- Resolve race condition usando FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION public.capturar_proximo_processo(
  p_lote_id uuid,
  p_profile_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_processo RECORD;
BEGIN
  -- Primeiro, liberar qualquer processo órfão deste usuário no lote
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE'
    AND lote_id = p_lote_id;

  -- Selecionar e bloquear o próximo processo pendente atomicamente
  -- FOR UPDATE SKIP LOCKED evita race condition entre avaliadores
  SELECT 
    id,
    codigo_processo,
    numero_cnj,
    possui_assunto,
    assunto_principal,
    possui_mov_arquivado,
    data_distribuicao,
    data_arquivamento_def,
    prazo_5_anos_completo
  INTO v_processo
  FROM processos_fila
  WHERE 
    lote_id = p_lote_id
    AND status_avaliacao = 'PENDENTE'
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  -- Verificar se encontrou um processo
  IF v_processo.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'NENHUM_PROCESSO_DISPONIVEL',
      'message', 'Não há processos pendentes disponíveis no lote'
    );
  END IF;

  -- Capturar o processo
  UPDATE processos_fila
  SET 
    status_avaliacao = 'EM_ANALISE',
    responsavel_avaliacao = p_profile_id,
    data_inicio_avaliacao = NOW(),
    updated_at = NOW()
  WHERE id = v_processo.id;

  -- Retornar os dados do processo capturado
  RETURN jsonb_build_object(
    'success', true,
    'processo_id', v_processo.id,
    'codigo_processo', v_processo.codigo_processo,
    'numero_cnj', v_processo.numero_cnj,
    'possui_assunto', v_processo.possui_assunto,
    'assunto_principal', v_processo.assunto_principal,
    'possui_mov_arquivado', v_processo.possui_mov_arquivado,
    'data_distribuicao', v_processo.data_distribuicao,
    'data_arquivamento_def', v_processo.data_arquivamento_def,
    'prazo_5_anos_completo', v_processo.prazo_5_anos_completo,
    'message', 'Processo capturado com sucesso'
  );
END;
$function$;