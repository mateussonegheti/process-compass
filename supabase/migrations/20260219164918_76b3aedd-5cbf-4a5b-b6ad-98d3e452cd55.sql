
-- Add hierarchy_level column to tabela_temporalidade
ALTER TABLE public.tabela_temporalidade 
ADD COLUMN hierarchy_level integer DEFAULT NULL;

-- Add index for hierarchy queries
CREATE INDEX idx_temporalidade_hierarchy ON public.tabela_temporalidade(hierarchy_level);
