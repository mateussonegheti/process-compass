
ALTER TABLE public.tabela_temporalidade
ADD COLUMN IF NOT EXISTS sort_order integer;

CREATE INDEX IF NOT EXISTS idx_tabela_temporalidade_sort_order
ON public.tabela_temporalidade (sort_order);
