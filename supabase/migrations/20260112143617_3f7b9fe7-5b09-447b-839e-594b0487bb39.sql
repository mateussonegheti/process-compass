-- Tabela para armazenar processos da fila de avaliação
CREATE TABLE public.processos_fila (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_processo TEXT NOT NULL,
    numero_cnj TEXT NOT NULL,
    possui_assunto TEXT,
    assunto_principal TEXT,
    possui_mov_arquivado TEXT,
    data_distribuicao TEXT,
    data_arquivamento_def TEXT,
    prazo_5_anos_completo TEXT,
    status_avaliacao TEXT NOT NULL DEFAULT 'PENDENTE',
    responsavel_avaliacao UUID REFERENCES public.profiles(id),
    data_inicio_avaliacao TIMESTAMP WITH TIME ZONE,
    data_fim_avaliacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    lote_id UUID NOT NULL
);

-- Tabela para armazenar lotes de importação
CREATE TABLE public.lotes_importacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    importado_por UUID NOT NULL REFERENCES public.profiles(id),
    ativo BOOLEAN NOT NULL DEFAULT true,
    total_processos INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar FK para lote
ALTER TABLE public.processos_fila 
ADD CONSTRAINT fk_lote FOREIGN KEY (lote_id) REFERENCES public.lotes_importacao(id) ON DELETE CASCADE;

-- Tabela para armazenar avaliações
CREATE TABLE public.avaliacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    processo_id UUID NOT NULL REFERENCES public.processos_fila(id) ON DELETE CASCADE,
    avaliador_id UUID NOT NULL REFERENCES public.profiles(id),
    
    -- Seção 2 - Assunto/TPU
    descricao_assunto_faltante TEXT,
    assunto_tpu TEXT,
    hierarquia_correta TEXT,
    divergencia_hierarquia TEXT,
    destinacao_permanente TEXT,
    
    -- Seção 3 - Movimentações/Prazos
    descricao_situacao_arquivamento TEXT,
    inconsistencia_prazo TEXT,
    
    -- Seção 4 - Peças Processuais
    pecas_tipos TEXT,
    pecas_ids TEXT,
    pecas_combinado TEXT,
    observacoes_pecas TEXT,
    documento_nao_localizado BOOLEAN DEFAULT false,
    documento_duplicado BOOLEAN DEFAULT false,
    erro_tecnico BOOLEAN DEFAULT false,
    ocorrencias_outro_detalhe TEXT,
    divergencia_classificacao TEXT,
    tipo_informado_sistema TEXT,
    tipo_real_identificado TEXT,
    
    -- Seção 5 - Inconsistências
    processo_vazio BOOLEAN DEFAULT false,
    observacoes_gerais TEXT,
    
    -- Metadados
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_fim TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processos_fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas para lotes_importacao (apenas admin/supervisor podem inserir)
CREATE POLICY "Usuários autenticados podem ver lotes ativos"
ON public.lotes_importacao FOR SELECT
TO authenticated
USING (ativo = true);

CREATE POLICY "Admin e supervisor podem inserir lotes"
ON public.lotes_importacao FOR INSERT
TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'supervisor'::app_role)
);

CREATE POLICY "Admin e supervisor podem atualizar lotes"
ON public.lotes_importacao FOR UPDATE
TO authenticated
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'supervisor'::app_role)
);

-- Políticas para processos_fila
CREATE POLICY "Usuários autenticados podem ver processos"
ON public.processos_fila FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin e supervisor podem inserir processos"
ON public.processos_fila FOR INSERT
TO authenticated
WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'supervisor'::app_role)
);

CREATE POLICY "Usuários podem atualizar processos em avaliação"
ON public.processos_fila FOR UPDATE
TO authenticated
USING (true);

-- Políticas para avaliacoes
CREATE POLICY "Usuários autenticados podem ver avaliações"
ON public.avaliacoes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários podem criar suas avaliações"
ON public.avaliacoes FOR INSERT
TO authenticated
WITH CHECK (avaliador_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar suas avaliações"
ON public.avaliacoes FOR UPDATE
TO authenticated
USING (avaliador_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_processos_fila_updated_at
BEFORE UPDATE ON public.processos_fila
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.processos_fila;
ALTER PUBLICATION supabase_realtime ADD TABLE public.avaliacoes;