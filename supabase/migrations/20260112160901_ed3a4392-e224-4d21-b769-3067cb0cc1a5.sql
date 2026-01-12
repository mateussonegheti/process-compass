-- Fix 1: Replace overly permissive SELECT policy on processos_fila
-- This restricts access to role-based and assignment-based visibility
DROP POLICY IF EXISTS "Usuários autenticados podem ver processos" ON public.processos_fila;

CREATE POLICY "Usuários podem ver processos visíveis" 
ON public.processos_fila FOR SELECT 
TO authenticated
USING (
  -- Admins and supervisors can see all processes
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'supervisor'::app_role) OR
  -- Avaliadores can see pending processes (to claim work)
  status_avaliacao = 'PENDENTE' OR
  -- Avaliadores can see processes assigned to them
  responsavel_avaliacao IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Fix 2: Add input validation constraints to avaliacoes table
ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_observacoes_gerais_length 
CHECK (LENGTH(observacoes_gerais) <= 5000);

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_descricao_assunto_length 
CHECK (LENGTH(descricao_assunto_faltante) <= 2000);

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_observacoes_pecas_length 
CHECK (LENGTH(observacoes_pecas) <= 5000);

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_ocorrencias_outro_length 
CHECK (LENGTH(ocorrencias_outro_detalhe) <= 2000);

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_tipo_informado_length 
CHECK (LENGTH(tipo_informado_sistema) <= 500);

ALTER TABLE public.avaliacoes 
ADD CONSTRAINT avaliacoes_tipo_real_length 
CHECK (LENGTH(tipo_real_identificado) <= 500);

-- Fix 3: Add input validation constraint to profiles table
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_nome_length 
CHECK (LENGTH(nome) BETWEEN 1 AND 255);

-- Fix 4: Add input validation constraint to processos_fila
ALTER TABLE public.processos_fila 
ADD CONSTRAINT processos_codigo_length 
CHECK (LENGTH(codigo_processo) <= 100);

-- Fix 5: Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_nome TEXT;
BEGIN
  -- Extract nome from metadata or fallback to email
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  
  -- Validate and sanitize: trim whitespace and limit length
  user_nome := TRIM(user_nome);
  user_nome := SUBSTRING(user_nome FROM 1 FOR 255);
  
  -- Ensure nome is not empty after trimming
  IF user_nome = '' OR user_nome IS NULL THEN
    user_nome := NEW.email;
  END IF;
  
  -- Insert profile with validated data
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, user_nome, NEW.email);
  
  -- Insert default role (least privilege)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'avaliador');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;