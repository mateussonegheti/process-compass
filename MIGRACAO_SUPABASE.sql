-- ===============================================================================
-- SCRIPT DE MIGRAÇÃO CONSOLIDADO - Process Compass
-- Data: 2026-02-28
-- Descrição: Migrações necessárias para funcionalidade de liberação de processos
-- ===============================================================================

-- ⚠️ INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/yiiligldjnfxajodtpys/sql
-- 2. Copie e cole TODO este script no SQL Editor
-- 3. Clique em "RUN" para executar
-- 4. Aguarde a mensagem de sucesso
-- ===============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. FUNÇÃO: liberar_processo (individual)
-- Libera um processo específico que está em análise
-- -----------------------------------------------------------------------------

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

  -- Se processo não pertence ao usuário (permitir supervisores liberarem qualquer processo)
  IF v_processo_responsavel IS DISTINCT FROM p_profile_id THEN
    -- Verificar se é supervisor/admin
    DECLARE
      v_is_supervisor boolean;
    BEGIN
      SELECT role IN ('admin', 'supervisor')
      INTO v_is_supervisor
      FROM profiles
      WHERE id = p_profile_id;
      
      IF NOT v_is_supervisor THEN
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
    END;
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
      'error', 'ERRO_INESPERADO',
      'message', 'Erro inesperado ao liberar processo'
    );
  END IF;
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.liberar_processo(text, uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 2. FUNÇÃO: liberar_processos_usuario (bulk)
-- Libera todos os processos de um usuário em um lote
-- -----------------------------------------------------------------------------

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
  -- Liberar todos os processos do usuário no lote especificado
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND lote_id = p_lote_id
    AND status_avaliacao = 'EM_ANALISE';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'processos_liberados', v_rows_affected,
    'message', v_rows_affected || ' processo(s) liberado(s) com sucesso'
  );
END;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.liberar_processos_usuario(uuid, uuid) TO authenticated;

-- -----------------------------------------------------------------------------
-- 3. Verificar se as colunas necessárias existem
-- Se não existirem, cria (idempotente - pode rodar múltiplas vezes)
-- -----------------------------------------------------------------------------

-- Adicionar coluna 'ativo' na tabela lotes_importacao se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lotes_importacao' 
    AND column_name = 'ativo'
  ) THEN
    ALTER TABLE lotes_importacao ADD COLUMN ativo boolean DEFAULT false;
    RAISE NOTICE 'Coluna "ativo" adicionada à tabela lotes_importacao';
  ELSE
    RAISE NOTICE 'Coluna "ativo" já existe em lotes_importacao';
  END IF;
END $$;

-- Garantir que apenas um lote esteja ativo por vez
CREATE OR REPLACE FUNCTION ensure_single_active_lote()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ativo = true THEN
    -- Desativar todos os outros lotes
    UPDATE lotes_importacao 
    SET ativo = false 
    WHERE id != NEW.id AND ativo = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'ensure_single_active_lote_trigger'
  ) THEN
    CREATE TRIGGER ensure_single_active_lote_trigger
      BEFORE INSERT OR UPDATE ON lotes_importacao
      FOR EACH ROW
      WHEN (NEW.ativo = true)
      EXECUTE FUNCTION ensure_single_active_lote();
    RAISE NOTICE 'Trigger "ensure_single_active_lote_trigger" criado';
  ELSE
    RAISE NOTICE 'Trigger "ensure_single_active_lote_trigger" já existe';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Atualizar RLS Policies (se necessário)
-- -----------------------------------------------------------------------------

-- Permitir que authenticated users chamem as funções
DO $$
BEGIN
  -- Verificar e criar policy para processos_fila se não existir
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'processos_fila' 
    AND policyname = 'allow_authenticated_update_processos'
  ) THEN
    -- Criar policy básica se a tabela permitir
    RAISE NOTICE 'Policy de update não encontrada - verifique manualmente se RLS está configurado';
  ELSE
    RAISE NOTICE 'Policies existentes detectadas';
  END IF;
END $$;

COMMIT;

-- ===============================================================================
-- FIM DO SCRIPT
-- ===============================================================================

-- ✅ SUCESSO! As funções foram criadas/atualizadas:
--    1. liberar_processo(codigo, lote_id, profile_id)
--    2. liberar_processos_usuario(profile_id, lote_id)
--    3. Campo 'ativo' em lotes_importacao
--    4. Trigger para garantir apenas 1 lote ativo

-- 🔄 PRÓXIMOS PASSOS:
--    1. Aguarde o deploy do frontend (GitHub Actions)
--    2. Recarregue o site: https://mateussonegheti.github.io/process-compass/
--    3. Teste a funcionalidade de "Ativar Lote" e "Liberar Processo"
