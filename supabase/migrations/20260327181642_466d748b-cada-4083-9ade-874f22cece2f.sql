
CREATE TABLE public.avaliacoes_sugestoes_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id uuid REFERENCES public.avaliacoes(id) ON DELETE CASCADE,
  processo_id uuid NOT NULL REFERENCES public.processos_fila(id) ON DELETE CASCADE,
  tipo_sugerido text NOT NULL,
  confianca numeric NOT NULL DEFAULT 0,
  justificativa text,
  risco_divergencia boolean DEFAULT false,
  features_extraidas jsonb,
  usuario_aceitou_sugestao boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.avaliacoes_sugestoes_ia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver sugestões"
  ON public.avaliacoes_sugestoes_ia FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem criar sugestões"
  ON public.avaliacoes_sugestoes_ia FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar sugestões"
  ON public.avaliacoes_sugestoes_ia FOR UPDATE
  TO authenticated
  USING (true);
