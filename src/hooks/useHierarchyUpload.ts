import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseTemporalidadeXLSX, extractUniqueColors, ColorMapping, DEFAULT_COLOR_MAPPINGS, TemporalidadeHierarchyRecord } from "@/lib/hierarchyParser";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export function useHierarchyUpload() {
  const [uploading, setUploading] = useState(false);
  const [previewColors, setPreviewColors] = useState<Array<{ color: string; bold: boolean; count: number; sample: string }>>([]);
  const [previewRecords, setPreviewRecords] = useState<TemporalidadeHierarchyRecord[]>([]);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [colorMappings, setColorMappings] = useState<ColorMapping[]>(DEFAULT_COLOR_MAPPINGS);

  const loadFile = useCallback(async (buffer: ArrayBuffer) => {
    try {
      setFileBuffer(buffer);
      const colors = await extractUniqueColors(buffer);
      setPreviewColors(colors);
      const records = await parseTemporalidadeXLSX(buffer, colorMappings);
      setPreviewRecords(records);
      return colors;
    } catch (error) {
      logger.error("Erro ao analisar XLSX:", error);
      toast.error("Erro ao ler arquivo XLSX. Verifique se o formato está correto.");
      return [];
    }
  }, [colorMappings]);

  const reparseWithMappings = useCallback(async (mappings: ColorMapping[]) => {
    if (!fileBuffer) return;
    setColorMappings(mappings);
    try {
      const records = await parseTemporalidadeXLSX(fileBuffer, mappings);
      setPreviewRecords(records);
    } catch (error) {
      logger.error("Erro ao re-parsear:", error);
    }
  }, [fileBuffer]);

  // Save both temporalidade AND hierarchy to database
  const saveToDatabase = useCallback(async () => {
    if (previewRecords.length === 0) {
      toast.error("Nenhum registro para salvar");
      return false;
    }

    setUploading(true);
    try {
      // Delete existing records
      const { error: deleteError } = await supabase
        .from("tabela_temporalidade")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (deleteError) {
        logger.error("Erro ao limpar tabela:", deleteError);
        toast.error("Erro ao limpar tabela anterior");
        return false;
      }

      // Insert in batches of 500
      const batchSize = 500;
      for (let i = 0; i < previewRecords.length; i += batchSize) {
        const batch = previewRecords.slice(i, i + batchSize).map(r => ({
          codigo: r.codigo,
          nome: r.nome,
          temporalidade: r.temporalidade || "Não definido",
          tipo_guarda: r.tipoGuarda || "Não definido",
          hierarchy_level: r.hierarchyLevel >= 0 ? r.hierarchyLevel : null,
        }));

        const { error: insertError } = await supabase
          .from("tabela_temporalidade")
          .insert(batch);

        if (insertError) {
          logger.error("Erro ao inserir batch:", insertError);
          toast.error(`Erro ao inserir registros (batch ${Math.floor(i / batchSize) + 1})`);
          return false;
        }
      }

      const comTemporalidade = previewRecords.filter(r => r.temporalidade).length;
      const comHierarquia = previewRecords.filter(r => r.hierarchyLevel >= 0).length;
      toast.success(`${previewRecords.length} assuntos carregados (${comTemporalidade} com temporalidade, ${comHierarquia} com hierarquia)`);
      
      setFileBuffer(null);
      setPreviewColors([]);
      setPreviewRecords([]);
      return true;
    } catch (error) {
      logger.error("Erro ao salvar:", error);
      toast.error("Erro ao processar planilha");
      return false;
    } finally {
      setUploading(false);
    }
  }, [previewRecords]);

  const reset = useCallback(() => {
    setFileBuffer(null);
    setPreviewColors([]);
    setPreviewRecords([]);
    setColorMappings(DEFAULT_COLOR_MAPPINGS);
  }, []);

  return {
    uploading,
    previewColors,
    previewRecords,
    colorMappings,
    hasFile: fileBuffer !== null,
    loadFile,
    reparseWithMappings,
    saveToDatabase,
    setColorMappings,
    reset,
  };
}
