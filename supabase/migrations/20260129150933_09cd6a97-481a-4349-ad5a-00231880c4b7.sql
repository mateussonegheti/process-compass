
-- Adicionar constraint UNIQUE para prevenir avaliações duplicadas
-- Um avaliador só pode ter uma avaliação por processo
ALTER TABLE avaliacoes
ADD CONSTRAINT unique_processo_avaliador UNIQUE (processo_id, avaliador_id);
