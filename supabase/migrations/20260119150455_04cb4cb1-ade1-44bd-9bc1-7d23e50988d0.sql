-- Adicionar policies de DELETE para Admin

-- Policy para deletar lotes
CREATE POLICY "Admin pode deletar lotes" 
  ON lotes_importacao 
  FOR DELETE 
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy para deletar processos
CREATE POLICY "Admin pode deletar processos" 
  ON processos_fila 
  FOR DELETE 
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy para deletar avaliações
CREATE POLICY "Admin pode deletar avaliacoes" 
  ON avaliacoes 
  FOR DELETE 
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy para Admin ver todos os lotes (inclusive inativos)
DROP POLICY IF EXISTS "Usuários autenticados podem ver lotes ativos" ON lotes_importacao;

CREATE POLICY "Usuários autenticados podem ver lotes" 
  ON lotes_importacao 
  FOR SELECT 
  TO authenticated
  USING (ativo = true OR has_role(auth.uid(), 'admin'::app_role));