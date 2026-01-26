-- =============================================
-- COGEDE DATABASE EXPORT
-- Exportado em: 2026-01-26
-- =============================================

-- =============================================
-- PARTE 1: SCHEMA (ESTRUTURA)
-- =============================================

-- 1. ENUM para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'supervisor', 'avaliador');

-- 2. Tabela profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  nome text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Tabela user_roles
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role app_role NOT NULL DEFAULT 'avaliador',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 4. Tabela lotes_importacao
CREATE TABLE public.lotes_importacao (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text,
  importado_por uuid NOT NULL REFERENCES profiles(id),
  ativo boolean NOT NULL DEFAULT true,
  total_processos integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 5. Tabela processos_fila
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

-- 6. Tabela avaliacoes
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
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 7. Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes_importacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos_fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- 8. Função auxiliar has_role
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

-- 9. Função get_user_role
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

-- 10. Trigger para criar profile automaticamente
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Função update_updated_at_column
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
-- PARTE 2: RLS POLICIES
-- =============================================

-- Profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins e supervisores podem ver todos os perfis" ON profiles FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Sistema pode inserir perfis" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins podem atualizar qualquer perfil" ON profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Usuários podem ver seu próprio role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins podem ver todos os roles" ON user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins podem gerenciar roles" ON user_roles FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Lotes
CREATE POLICY "Usuários autenticados podem ver lotes" ON lotes_importacao FOR SELECT USING ((ativo = true) OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin e supervisor podem inserir lotes" ON lotes_importacao FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admin e supervisor podem atualizar lotes" ON lotes_importacao FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Admin pode deletar lotes" ON lotes_importacao FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Processos
CREATE POLICY "Usuários podem ver processos visíveis" ON processos_fila FOR SELECT USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') OR (status_avaliacao = 'PENDENTE') OR (responsavel_avaliacao IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admin e supervisor podem inserir processos" ON processos_fila FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor'));
CREATE POLICY "Usuários podem atualizar processos atribuídos" ON processos_fila FOR UPDATE USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'supervisor') OR (responsavel_avaliacao IN (SELECT id FROM profiles WHERE user_id = auth.uid())));
CREATE POLICY "Admin pode deletar processos" ON processos_fila FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Avaliacoes
CREATE POLICY "Usuários autenticados podem ver avaliações" ON avaliacoes FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar suas avaliações" ON avaliacoes FOR INSERT WITH CHECK (avaliador_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Usuários podem atualizar suas avaliações" ON avaliacoes FOR UPDATE USING (avaliador_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admin pode deletar avaliacoes" ON avaliacoes FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- PARTE 3: DADOS (OPCIONAL - PARA TESTES)
-- IMPORTANTE: Os user_id precisam ser atualizados
-- após criar os usuários no novo Supabase
-- =============================================

-- NOTA: Os dados de profiles e user_roles são criados
-- automaticamente pelo trigger quando você cria usuários.
-- Você precisará criar os usuários primeiro no Supabase Auth,
-- e depois atualizar as roles se necessário.

-- Exemplo de como atualizar uma role para admin:
-- UPDATE user_roles SET role = 'admin' WHERE user_id = 'SEU_USER_ID';

-- Lotes de importação (exemplo - ajuste o importado_por após criar o profile)
-- INSERT INTO lotes_importacao (id, nome, ativo, total_processos, importado_por) VALUES
-- ('f7b890cd-7d0b-4519-8523-d1224eecf7c5', 'Importação 19/01/2026', true, 200, 'ID_DO_PROFILE_IMPORTADOR');

-- =============================================
-- INSTRUÇÕES DE MIGRAÇÃO
-- =============================================
-- 
-- 1. Crie um novo projeto em supabase.com
-- 2. Vá em SQL Editor e execute este script (Parte 1 e 2)
-- 3. Crie os usuários no Authentication > Users
-- 4. Os profiles e roles serão criados automaticamente
-- 5. Atualize as roles dos admins/supervisores:
--    UPDATE user_roles SET role = 'admin' WHERE user_id = 'USER_ID_DO_ADMIN';
--    UPDATE user_roles SET role = 'supervisor' WHERE user_id = 'USER_ID_DO_SUPERVISOR';
-- 6. Copie as credenciais (URL e Anon Key) de Settings > API
-- 7. Atualize seu .env com as novas credenciais
-- 8. Faça deploy no GitHub Pages
--
-- =============================================
