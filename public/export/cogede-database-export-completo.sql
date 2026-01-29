-- =============================================
-- COGEDE DATABASE EXPORT - COMPLETO
-- Exportado em: 2026-01-29
-- Inclui: Schema, Funções, Triggers, RLS Policies
-- =============================================

-- =============================================
-- PARTE 1: ENUM
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'avaliador');

-- =============================================
-- PARTE 2: TABELAS
-- =============================================

-- 1. Tabela profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  nome text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Tabela user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'avaliador',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Tabela lotes_importacao
CREATE TABLE public.lotes_importacao (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text,
  importado_por uuid NOT NULL REFERENCES profiles(id),
  ativo boolean NOT NULL DEFAULT true,
  total_processos integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Tabela processos_fila
CREATE TABLE public.processos_fila (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_processo text NOT NULL,
  numero_cnj text NOT NULL,
  possui_assunto text,
  assunto_principal text,
  possui_mov_arquivado text,
  data_distribuicao text,
  data_arquivamento_def text,
  prazo_5_anos_completo text,
  status_avaliacao text NOT NULL DEFAULT 'PENDENTE',
  responsavel_avaliacao uuid REFERENCES profiles(id),
  data_inicio_avaliacao timestamp with time zone,
  data_fim_avaliacao timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  lote_id uuid NOT NULL REFERENCES lotes_importacao(id)
);

-- 5. Tabela avaliacoes
CREATE TABLE public.avaliacoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  processo_id uuid NOT NULL REFERENCES processos_fila(id),
  avaliador_id uuid NOT NULL REFERENCES profiles(id),
  descricao_assunto_faltante text,
  assunto_tpu text,
  hierarquia_correta text,
  divergencia_hierarquia text,
  destinacao_permanente text,
  descricao_situacao_arquivamento text,
  inconsistencia_prazo text,
  pecas_tipos text,
  pecas_ids text,
  pecas_combinado text,
  observacoes_pecas text,
  documento_nao_localizado boolean DEFAULT false,
  documento_duplicado boolean DEFAULT false,
  erro_tecnico boolean DEFAULT false,
  ocorrencias_outro_detalhe text,
  divergencia_classificacao text,
  tipo_informado_sistema text,
  tipo_real_identificado text,
  processo_vazio boolean DEFAULT false,
  observacoes_gerais text,
  data_inicio timestamp with time zone NOT NULL DEFAULT now(),
  data_fim timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Constraint para prevenir avaliações duplicadas (mesmo avaliador/processo)
  CONSTRAINT unique_processo_avaliador UNIQUE (processo_id, avaliador_id)
);

-- =============================================
-- PARTE 3: HABILITAR RLS
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos_fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PARTE 4: FUNÇÕES AUXILIARES
-- =============================================

-- Função has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função get_user_role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Função update_updated_at_column (para triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =============================================
-- PARTE 5: FUNÇÕES DE NEGÓCIO (RPC)
-- =============================================

-- Função para criar profile automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_nome TEXT;
BEGIN
  user_nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);
  user_nome := TRIM(user_nome);
  user_nome := SUBSTRING(user_nome FROM 1 FOR 255);
  IF user_nome = '' OR user_nome IS NULL THEN
    user_nome := NEW.email;
  END IF;
  
  INSERT INTO public.profiles (user_id, nome, email)
  VALUES (NEW.id, user_nome, NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'avaliador');
  
  RETURN NEW;
END;
$$;

-- Função para capturar processo (com lock atômico)
CREATE OR REPLACE FUNCTION public.capturar_processo(p_codigo_processo text, p_lote_id uuid, p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_processo_id uuid;
  v_status_atual text;
  v_responsavel_atual uuid;
BEGIN
  -- Primeiro, liberar qualquer processo órfão deste usuário
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE'
    AND lote_id = p_lote_id;

  -- Adquirir lock advisory para serializar acesso ao processo
  PERFORM pg_advisory_xact_lock(hashtext('processo_' || p_codigo_processo));

  -- Buscar o processo e seu status atual
  SELECT id, status_avaliacao, responsavel_avaliacao
  INTO v_processo_id, v_status_atual, v_responsavel_atual
  FROM processos_fila
  WHERE codigo_processo = p_codigo_processo
    AND lote_id = p_lote_id
  FOR UPDATE;

  -- Verificar se o processo existe
  IF v_processo_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_ENCONTRADO',
      'message', 'Processo não encontrado no lote atual'
    );
  END IF;

  -- Verificar se já está sendo avaliado por outro usuário
  IF v_status_atual = 'EM_ANALISE' AND v_responsavel_atual IS NOT NULL AND v_responsavel_atual != p_profile_id THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_EM_USO',
      'message', 'Este processo já está sendo avaliado por outro usuário'
    );
  END IF;

  -- Verificar se já está concluído
  IF v_status_atual = 'CONCLUIDO' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_CONCLUIDO',
      'message', 'Este processo já foi avaliado'
    );
  END IF;

  -- Capturar o processo
  UPDATE processos_fila
  SET 
    status_avaliacao = 'EM_ANALISE',
    responsavel_avaliacao = p_profile_id,
    data_inicio_avaliacao = NOW(),
    updated_at = NOW()
  WHERE id = v_processo_id;

  RETURN jsonb_build_object(
    'success', true,
    'processo_id', v_processo_id,
    'message', 'Processo capturado com sucesso'
  );
END;
$$;

-- Função para liberar processo específico
CREATE OR REPLACE FUNCTION public.liberar_processo(p_codigo_processo text, p_lote_id uuid, p_profile_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
BEGIN
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    codigo_processo = p_codigo_processo
    AND lote_id = p_lote_id
    AND responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  IF v_rows_affected > 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Processo liberado com sucesso'
    );
  ELSE
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PROCESSO_NAO_LIBERADO',
      'message', 'Processo não encontrado ou não pertence ao usuário'
    );
  END IF;
END;
$$;

-- Função para liberar todos os processos de um usuário
CREATE OR REPLACE FUNCTION public.liberar_processos_usuario(p_profile_id uuid, p_lote_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
BEGIN
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    responsavel_avaliacao = p_profile_id
    AND status_avaliacao = 'EM_ANALISE'
    AND lote_id = p_lote_id;

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'processos_liberados', v_rows_affected
  );
END;
$$;

-- Função para liberar processos inativos (mais de 1 hora)
CREATE OR REPLACE FUNCTION public.liberar_processos_inativos()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows_affected integer;
BEGIN
  UPDATE processos_fila
  SET 
    status_avaliacao = 'PENDENTE',
    responsavel_avaliacao = NULL,
    data_inicio_avaliacao = NULL,
    updated_at = NOW()
  WHERE 
    status_avaliacao = 'EM_ANALISE'
    AND updated_at < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'processos_liberados', v_rows_affected,
    'executado_em', NOW()
  );
END;
$$;

-- =============================================
-- PARTE 6: TRIGGERS
-- =============================================

-- Trigger para criar profile ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processos_fila_updated_at
  BEFORE UPDATE ON processos_fila
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON avaliacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- PARTE 7: RLS POLICIES - PROFILES
-- =============================================

CREATE POLICY "Usuários podem ver seu próprio perfil" 
ON profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins e supervisores podem ver todos os perfis" 
ON profiles FOR SELECT 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Sistema pode inserir perfis" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar qualquer perfil" 
ON profiles FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- PARTE 8: RLS POLICIES - USER_ROLES
-- =============================================

CREATE POLICY "Usuários podem ver seu próprio role" 
ON user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os roles" 
ON user_roles FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins podem gerenciar roles" 
ON user_roles FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- PARTE 9: RLS POLICIES - LOTES_IMPORTACAO
-- =============================================

CREATE POLICY "Usuários autenticados podem ver lotes" 
ON lotes_importacao FOR SELECT 
USING ((ativo = true) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin e supervisor podem inserir lotes" 
ON lotes_importacao FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admin e supervisor podem atualizar lotes" 
ON lotes_importacao FOR UPDATE 
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Admin pode deletar lotes" 
ON lotes_importacao FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- PARTE 10: RLS POLICIES - PROCESSOS_FILA
-- =============================================

CREATE POLICY "Usuários podem ver processos visíveis" 
ON processos_fila FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'supervisor') OR 
  (status_avaliacao = 'PENDENTE') OR 
  (responsavel_avaliacao IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Admin e supervisor podem inserir processos" 
ON processos_fila FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));

CREATE POLICY "Usuários podem atualizar processos atribuídos" 
ON processos_fila FOR UPDATE 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'supervisor') OR 
  (responsavel_avaliacao IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
);

CREATE POLICY "Admin pode deletar processos" 
ON processos_fila FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- PARTE 11: RLS POLICIES - AVALIACOES
-- =============================================

CREATE POLICY "Usuários autenticados podem ver avaliações" 
ON avaliacoes FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar suas avaliações" 
ON avaliacoes FOR INSERT 
WITH CHECK (avaliador_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Usuários podem atualizar suas avaliações" 
ON avaliacoes FOR UPDATE 
USING (avaliador_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admin pode deletar avaliacoes" 
ON avaliacoes FOR DELETE 
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- INSTRUÇÕES DE MIGRAÇÃO
-- =============================================
-- 
-- 1. Crie um novo projeto em supabase.com
-- 2. Vá em SQL Editor e execute este script completo
-- 3. Crie os usuários no Authentication > Users
-- 4. Os profiles e roles serão criados automaticamente pelo trigger
-- 5. Atualize as roles dos admins/supervisores:
--    UPDATE user_roles SET role = 'admin' WHERE user_id = 'USER_ID_DO_ADMIN';
--    UPDATE user_roles SET role = 'supervisor' WHERE user_id = 'USER_ID_DO_SUPERVISOR';
-- 6. Copie as credenciais (URL e Anon Key) de Settings > API
-- 7. Atualize seu .env com as novas credenciais
-- 8. Faça deploy no GitHub Pages
--
-- =============================================
