import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { parseHierarchyXLSX, extractUniqueColors, ColorMapping, DEFAULT_COLOR_MAPPINGS, HierarchyRecord } from "@/lib/hierarchyParser";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export function useHierarchyUpload() {
  const [uploading, setUploading] = useState(false);
  const [previewColors, setPreviewColors] = useState<Array<{ color: string; bold: boolean; count: number; sample: string }>>([]);
  const [previewRecords, setPreviewRecords] = useState<HierarchyRecord[]>([]);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [colorMappings, setColorMappings] = useState<ColorMapping[]>(DEFAULT_COLOR_MAPPINGS);

  // Step 1: Load file and extract colors for preview
  const loadFile = useCallback(async (buffer: ArrayBuffer) => {
    try {
      setFileBuffer(buffer);
      const colors = await extractUniqueColors(buffer);
      setPreviewColors(colors);
      // Also do a preview parse with default mappings
      const records = await parseHierarchyXLSX(buffer, colorMappings);
      setPreviewRecords(records);
      return colors;
    } catch (error) {
      logger.error("Erro ao analisar XLSX:", error);
      toast.error("Erro ao ler arquivo XLSX. Verifique se o formato está correto.");
      return [];
    }
  }, [colorMappings]);

  // Step 2: Re-parse with updated mappings
  const reparseWithMappings = useCallback(async (mappings: ColorMapping[]) => {
    if (!fileBuffer) return;
    setColorMappings(mappings);
    try {
      const records = await parseHierarchyXLSX(fileBuffer, mappings);
      setPreviewRecords(records);
    } catch (error) {
      logger.error("Erro ao re-parsear:", error);
    }
  }, [fileBuffer]);

  // Step 3: Save to database (update hierarchy_level on existing records)
  const saveHierarchy = useCallback(async () => {
    if (previewRecords.length === 0) {
      toast.error("Nenhum registro para salvar");
      return false;
    }

    setUploading(true);
    try {
      // Update hierarchy_level in batches
      const batchSize = 100;
      let updated = 0;
      let notFound = 0;

      for (let i = 0; i < previewRecords.length; i += batchSize) {
        const batch = previewRecords.slice(i, i + batchSize);
        
        for (const record of batch) {
          const { error, count } = await supabase
            .from("tabela_temporalidade")
            .update({ hierarchy_level: record.hierarchyLevel })
            .eq("codigo", record.subjectCode);

          if (error) {
            logger.error(`Erro ao atualizar código ${record.subjectCode}:`, error);
          } else if (count && count > 0) {
            updated++;
          } else {
            notFound++;
          }
        }
      }

      toast.success(`Hierarquia salva: ${updated} registros atualizados${notFound > 0 ? `, ${notFound} códigos não encontrados na tabela` : ""}`);
      setFileBuffer(null);
      setPreviewColors([]);
      setPreviewRecords([]);
      return true;
    } catch (error) {
      logger.error("Erro ao salvar hierarquia:", error);
      toast.error("Erro ao salvar hierarquia no banco");
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
    saveHierarchy,
    setColorMappings,
    reset,
  };
}
