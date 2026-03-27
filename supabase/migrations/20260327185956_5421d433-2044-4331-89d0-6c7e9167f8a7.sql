ALTER TABLE public.avaliacoes_sugestoes_ia ADD COLUMN IF NOT EXISTS regra_aplicada text;
ALTER TABLE public.avaliacoes_sugestoes_ia ADD COLUMN IF NOT EXISTS sinais_detectados jsonb;