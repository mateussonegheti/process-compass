-- Migração: Sistema de controle de fila e inatividade
-- Data: 2026-01-26
-- Descrição: Adiciona campos para rastreamento de sessão ativa e inatividade

-- Adicionar colunas para controle de sessão e inatividade
ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS ultima_interacao TIMESTAMP WITH TIME ZONE;
ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS avaliador_id_original UUID REFERENCES auth.users(id);
ALTER TABLE processos_fila ADD COLUMN IF NOT EXISTS tempo_captura TIMESTAMP WITH TIME ZONE;

-- Criar índice para otimizar queries de processos órfãos
CREATE INDEX IF NOT EXISTS idx_processos_orfaos 
ON processos_fila(status_avaliacao, ultima_interacao) 
WHERE status_avaliacao = 'EM_ANALISE' AND responsavel_avaliacao IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN processos_fila.ultima_interacao IS 'Timestamp da última interação do avaliador (digitação, clique, scroll, salvamento)';
COMMENT ON COLUMN processos_fila.avaliador_id_original IS 'ID do avaliador que originally completed a avaliação (para controle de edição)';
COMMENT ON COLUMN processos_fila.tempo_captura IS 'Timestamp quando o processo foi capturado (EM_ANALISE)';

-- Função para limpar processos órfãos (timeout de 1 hora)
CREATE OR REPLACE FUNCTION liberar_processos_orfaos()
RETURNS void AS $$
BEGIN
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    ultima_interacao = NULL,
    tempo_captura = NULL
  WHERE 
    status_avaliacao = 'EM_ANALISE' 
    AND responsavel_avaliacao IS NOT NULL
    AND ultima_interacao IS NOT NULL
    AND (NOW() - ultima_interacao) > INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Função para validar acesso à edição (apenas avaliador original)
CREATE OR REPLACE FUNCTION pode_editar_avaliacao(
  p_processo_id UUID,
  p_usuario_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_avaliador_original UUID;
BEGIN
  SELECT avaliador_id_original INTO v_avaliador_original
  FROM processos_fila
  WHERE id = p_processo_id;
  
  -- Se não tem avaliador original, ninguém pode editar
  -- Se tem e é igual ao usuário atual, pode editar
  RETURN v_avaliador_original = p_usuario_id;
END;
$$ LANGUAGE plpgsql;
