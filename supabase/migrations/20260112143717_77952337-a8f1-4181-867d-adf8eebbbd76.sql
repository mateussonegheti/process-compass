-- Remover políticas permissivas e criar políticas mais restritivas
DROP POLICY IF EXISTS "Usuários podem atualizar processos em avaliação" ON public.processos_fila;

-- Política mais específica: apenas admin/supervisor ou o responsável pela avaliação pode atualizar
CREATE POLICY "Usuários podem atualizar processos atribuídos"
ON public.processos_fila FOR UPDATE
TO authenticated
USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'supervisor'::app_role) OR
    responsavel_avaliacao IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);