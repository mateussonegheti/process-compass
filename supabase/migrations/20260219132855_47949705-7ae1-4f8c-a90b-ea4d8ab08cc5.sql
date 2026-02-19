
-- Tabela para armazenar dados de temporalidade CNJ
CREATE TABLE public.tabela_temporalidade (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo integer NOT NULL,
  nome text NOT NULL,
  temporalidade text NOT NULL, -- 'Permanente', '5 anos', '10 anos', '90 dias', etc.
  tipo_guarda text NOT NULL, -- 'Permanente', 'Temporal', 'Não se aplica', 'Vide Guia'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index para busca rápida por código
CREATE INDEX idx_temporalidade_codigo ON public.tabela_temporalidade (codigo);

-- Unique constraint para evitar duplicatas
CREATE UNIQUE INDEX idx_temporalidade_codigo_unique ON public.tabela_temporalidade (codigo);

-- Enable RLS
ALTER TABLE public.tabela_temporalidade ENABLE ROW LEVEL SECURITY;

-- Todos os autenticados podem consultar
CREATE POLICY "Usuários autenticados podem ver temporalidade"
ON public.tabela_temporalidade
FOR SELECT
USING (true);

-- Admin e supervisor podem inserir/atualizar/deletar
CREATE POLICY "Admin e supervisor podem inserir temporalidade"
ON public.tabela_temporalidade
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Admin e supervisor podem atualizar temporalidade"
ON public.tabela_temporalidade
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));

CREATE POLICY "Admin e supervisor podem deletar temporalidade"
ON public.tabela_temporalidade
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'supervisor'::app_role));
