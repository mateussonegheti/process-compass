-- Adicionar colunas para armazenar dados de movimentos processuais (concatenados com pipe)
-- Esses campos receberão os dados importados da planilha CSV

ALTER TABLE processos_fila 
ADD COLUMN IF NOT EXISTS mov_codigos text,
ADD COLUMN IF NOT EXISTS mov_descricoes text,
ADD COLUMN IF NOT EXISTS mov_complementos text,
ADD COLUMN IF NOT EXISTS mov_datas text,
ADD COLUMN IF NOT EXISTS pecas_tipos text,
ADD COLUMN IF NOT EXISTS pecas_ids text;

-- Comentários para documentação
COMMENT ON COLUMN processos_fila.mov_codigos IS 'Códigos dos movimentos concatenados com pipe (ex: 101 | 102 | 103)';
COMMENT ON COLUMN processos_fila.mov_descricoes IS 'Descrições dos movimentos concatenadas com pipe';
COMMENT ON COLUMN processos_fila.mov_complementos IS 'Complementos dos movimentos concatenados com pipe';
COMMENT ON COLUMN processos_fila.mov_datas IS 'Datas dos movimentos concatenadas com pipe';
COMMENT ON COLUMN processos_fila.pecas_tipos IS 'Tipos das peças concatenados com pipe (ex: Petição Inicial | Sentença)';
COMMENT ON COLUMN processos_fila.pecas_ids IS 'IDs das peças no Projudi concatenados com pipe (ex: 506978 | 506979)';