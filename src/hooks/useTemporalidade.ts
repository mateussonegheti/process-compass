import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { extrairCodigoAssunto, parseTemporalidadeCSV } from "@/lib/temporalidadeParser";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface TemporalidadeInfo {
  codigo: number;
  nome: string;
  temporalidade: string;
  tipoGuarda: string;
}

export function useTemporalidade() {
  const [tabela, setTabela] = useState<Map<number, TemporalidadeInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Carregar tabela de temporalidade do banco
  const fetchTemporalidade = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all records (may need pagination if > 1000)
      let allData: TemporalidadeInfo[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("tabela_temporalidade")
          .select("codigo, nome, temporalidade, tipo_guarda")
          .range(from, from + pageSize - 1);

        if (error) {
          logger.error("Erro ao buscar temporalidade:", error);
          break;
        }

        if (data && data.length > 0) {
          allData = [...allData, ...data.map(d => ({
            codigo: d.codigo,
            nome: d.nome,
            temporalidade: d.temporalidade,
            tipoGuarda: d.tipo_guarda,
          }))];
          from += pageSize;
          hasMore = data.length === pageSize;
        } else {
          hasMore = false;
        }
      }

      const map = new Map<number, TemporalidadeInfo>();
      allData.forEach(d => map.set(d.codigo, d));
      setTabela(map);
      setTotalRegistros(map.size);
    } catch (error) {
      logger.error("Erro ao carregar temporalidade:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemporalidade();
  }, [fetchTemporalidade]);

  // Upload de nova tabela de temporalidade
  const uploadTemporalidade = async (csvContent: string) => {
    try {
      setUploading(true);
      const records = parseTemporalidadeCSV(csvContent);

      if (records.length === 0) {
        toast.error("Nenhum registro válido encontrado na planilha");
        return false;
      }

      // Deletar registros antigos
      const { error: deleteError } = await supabase
        .from("tabela_temporalidade")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // delete all

      if (deleteError) {
        logger.error("Erro ao limpar tabela:", deleteError);
        toast.error("Erro ao limpar tabela de temporalidade anterior");
        return false;
      }

      // Inserir em batches de 500
      const batchSize = 500;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize).map(r => ({
          codigo: r.codigo,
          nome: r.nome,
          temporalidade: r.temporalidade,
          tipo_guarda: r.tipoGuarda,
        }));

        const { error: insertError } = await supabase
          .from("tabela_temporalidade")
          .insert(batch);

        if (insertError) {
          logger.error("Erro ao inserir batch:", insertError);
          toast.error(`Erro ao inserir registros (batch ${i / batchSize + 1})`);
          return false;
        }
      }

      toast.success(`${records.length} registros de temporalidade carregados com sucesso!`);
      await fetchTemporalidade();
      return true;
    } catch (error) {
      logger.error("Erro ao fazer upload da temporalidade:", error);
      toast.error("Erro ao processar planilha de temporalidade");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // Consultar temporalidade por assunto principal
  const consultarTemporalidade = useCallback((assuntoPrincipal: string): TemporalidadeInfo | null => {
    if (!assuntoPrincipal || tabela.size === 0) return null;
    const codigo = extrairCodigoAssunto(assuntoPrincipal);
    if (codigo === null) return null;
    return tabela.get(codigo) || null;
  }, [tabela]);

  return {
    tabela,
    loading,
    totalRegistros,
    uploading,
    uploadTemporalidade,
    consultarTemporalidade,
    refetch: fetchTemporalidade,
  };
}
