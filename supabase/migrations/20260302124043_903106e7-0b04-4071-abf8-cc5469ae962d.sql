DROP POLICY "Usuários autenticados podem ver lotes" ON public.lotes_importacao;

CREATE POLICY "Usuários autenticados podem ver lotes"
ON public.lotes_importacao
FOR SELECT
TO authenticated
USING (
  (ativo = true)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
);