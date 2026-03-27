
DROP POLICY "Usuários autenticados podem criar sugestões" ON public.avaliacoes_sugestoes_ia;
DROP POLICY "Usuários autenticados podem atualizar sugestões" ON public.avaliacoes_sugestoes_ia;

CREATE POLICY "Usuários autenticados podem criar sugestões"
  ON public.avaliacoes_sugestoes_ia FOR INSERT
  TO authenticated
  WITH CHECK (
    processo_id IN (
      SELECT pf.id FROM public.processos_fila pf
      WHERE pf.responsavel_avaliacao IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Usuários autenticados podem atualizar sugestões"
  ON public.avaliacoes_sugestoes_ia FOR UPDATE
  TO authenticated
  USING (
    processo_id IN (
      SELECT pf.id FROM public.processos_fila pf
      WHERE pf.responsavel_avaliacao IN (
        SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()
      )
    )
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'supervisor')
  );
