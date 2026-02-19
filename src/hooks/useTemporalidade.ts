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
  hierarchyLevel: number | null;
}

export interface HierarchyPathItem {
  codigo: number;
  nome: string;
  level: number;
}

export function useTemporalidade() {
  const [tabela, setTabela] = useState<Map<number, TemporalidadeInfo>>(new Map());
  // Ordered list to reconstruct hierarchy paths
  const [orderedRecords, setOrderedRecords] = useState<TemporalidadeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Carregar tabela de temporalidade do banco
  const fetchTemporalidade = useCallback(async () => {
    try {
      setLoading(true);
      
      let allData: TemporalidadeInfo[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("tabela_temporalidade")
          .select("codigo, nome, temporalidade, tipo_guarda, hierarchy_level, sort_order")
          .order("sort_order", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
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
            hierarchyLevel: d.hierarchy_level,
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
      setOrderedRecords(allData);
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

      const { error: deleteError } = await supabase
        .from("tabela_temporalidade")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        logger.error("Erro ao limpar tabela:", deleteError);
        toast.error("Erro ao limpar tabela de temporalidade anterior");
        return false;
      }

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

  // Build hierarchy path (ancestors) for a given codigo
  const getHierarchyPath = useCallback((codigo: number): HierarchyPathItem[] => {
    if (orderedRecords.length === 0) return [];

    // Find index of this record in ordered list
    const idx = orderedRecords.findIndex(r => r.codigo === codigo);
    if (idx === -1) return [];

    const target = orderedRecords[idx];
    const targetLevel = target.hierarchyLevel ?? -1;
    if (targetLevel < 0) return [{ codigo: target.codigo, nome: target.nome, level: targetLevel }];

    // Walk backwards to find ancestors at each level
    const path: HierarchyPathItem[] = [];
    let nextLevelNeeded = targetLevel - 1;

    for (let i = idx - 1; i >= 0 && nextLevelNeeded >= 0; i--) {
      const r = orderedRecords[i];
      const rLevel = r.hierarchyLevel ?? -1;
      if (rLevel === nextLevelNeeded) {
        path.unshift({ codigo: r.codigo, nome: r.nome, level: rLevel });
        nextLevelNeeded--;
      }
    }

    // Add the target itself
    path.push({ codigo: target.codigo, nome: target.nome, level: targetLevel });
    return path;
  }, [orderedRecords]);

  // Consultar temporalidade por assunto principal
  const consultarTemporalidade = useCallback((assuntoPrincipal: string): TemporalidadeInfo | null => {
    if (!assuntoPrincipal || tabela.size === 0) return null;
    const codigo = extrairCodigoAssunto(assuntoPrincipal);
    if (codigo === null) return null;
    return tabela.get(codigo) || null;
  }, [tabela]);

  // Get hierarchy path for an assunto principal string
  const consultarHierarquia = useCallback((assuntoPrincipal: string): HierarchyPathItem[] => {
    if (!assuntoPrincipal || orderedRecords.length === 0) return [];
    const codigo = extrairCodigoAssunto(assuntoPrincipal);
    if (codigo === null) return [];
    return getHierarchyPath(codigo);
  }, [orderedRecords, getHierarchyPath]);

  return {
    tabela,
    loading,
    totalRegistros,
    uploading,
    uploadTemporalidade,
    consultarTemporalidade,
    consultarHierarquia,
    refetch: fetchTemporalidade,
  };
}
