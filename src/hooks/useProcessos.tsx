import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessoFila } from "@/types/cogede";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface LoteImportacao {
  id: string;
  nome: string | null;
  importado_por: string;
  ativo: boolean;
  total_processos: number;
  created_at: string;
}

interface ProcessoDB {
  id: string;
  codigo_processo: string;
  numero_cnj: string;
  possui_assunto: string | null;
  assunto_principal: string | null;
  possui_mov_arquivado: string | null;
  data_distribuicao: string | null;
  data_arquivamento_def: string | null;
  prazo_5_anos_completo: string | null;
  status_avaliacao: string;
  responsavel_avaliacao: string | null;
  data_inicio_avaliacao: string | null;
  data_fim_avaliacao: string | null;
  lote_id: string;
}

export function useProcessos() {
  const { profile, isAdmin, isSupervisor } = useAuth();
  const [processos, setProcessos] = useState<ProcessoFila[]>([]);
  const [loteAtivo, setLoteAtivo] = useState<LoteImportacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const podeCarregarPlanilha = isAdmin || isSupervisor;

  // Buscar lote ativo e processos
  const fetchProcessos = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar lote ativo
      const { data: lotes, error: lotesError } = await supabase
        .from("lotes_importacao")
        .select("*")
        .eq("ativo", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (lotesError) {
        logger.error("Erro ao buscar lote:", lotesError);
        return;
      }

      if (lotes && lotes.length > 0) {
        const lote = lotes[0] as LoteImportacao;
        setLoteAtivo(lote);

        // Buscar processos do lote
        const { data: processosData, error: processosError } = await supabase
          .from("processos_fila")
          .select("*")
          .eq("lote_id", lote.id)
          .order("created_at", { ascending: true });

        if (processosError) {
          logger.error("Erro ao buscar processos:", processosError);
          return;
        }

        if (processosData) {
          const processosFormatados: ProcessoFila[] = (processosData as ProcessoDB[]).map((p) => ({
            CODIGO_PROCESSO: p.codigo_processo,
            NUMERO_CNJ: p.numero_cnj,
            POSSUI_ASSUNTO: p.possui_assunto || "",
            ASSUNTO_PRINCIPAL: p.assunto_principal || "",
            POSSUI_MOV_ARQUIVADO: p.possui_mov_arquivado || "",
            DATA_DISTRIBUICAO: p.data_distribuicao || "",
            DATA_ARQUIVAMENTO_DEF: p.data_arquivamento_def || "",
            PRAZO_5_ANOS_COMPLETO: p.prazo_5_anos_completo || "",
            STATUS_AVALIACAO: p.status_avaliacao as "PENDENTE" | "EM_ANALISE" | "CONCLUIDO",
            RESPONSAVEL: p.responsavel_avaliacao || undefined,
            DATA_INICIO_AVALIACAO: p.data_inicio_avaliacao || undefined,
            DATA_FIM: p.data_fim_avaliacao || undefined,
          }));
          setProcessos(processosFormatados);
        }
      } else {
        setLoteAtivo(null);
        setProcessos([]);
      }
    } catch (error) {
      logger.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar nova planilha (apenas admin/supervisor)
  const carregarPlanilha = async (novosProcessos: ProcessoFila[]) => {
    if (!podeCarregarPlanilha || !profile) {
      toast.error("Você não tem permissão para carregar planilhas");
      return;
    }

    try {
      setUploading(true);

      // Desativar lotes anteriores
      if (loteAtivo) {
        await supabase
          .from("lotes_importacao")
          .update({ ativo: false })
          .eq("id", loteAtivo.id);
      }

      // Criar novo lote
      const { data: novoLote, error: loteError } = await supabase
        .from("lotes_importacao")
        .insert({
          nome: `Importação ${new Date().toLocaleDateString("pt-BR")}`,
          importado_por: profile.id,
          ativo: true,
          total_processos: novosProcessos.length,
        })
        .select()
        .single();

      if (loteError || !novoLote) {
        logger.error("Erro ao criar lote:", loteError);
        toast.error("Erro ao criar lote de importação");
        return;
      }

      // Inserir processos
      const processosParaInserir = novosProcessos.map((p) => ({
        codigo_processo: p.CODIGO_PROCESSO,
        numero_cnj: p.NUMERO_CNJ,
        possui_assunto: p.POSSUI_ASSUNTO || null,
        assunto_principal: p.ASSUNTO_PRINCIPAL || null,
        possui_mov_arquivado: p.POSSUI_MOV_ARQUIVADO || null,
        data_distribuicao: p.DATA_DISTRIBUICAO || null,
        data_arquivamento_def: p.DATA_ARQUIVAMENTO_DEF || null,
        prazo_5_anos_completo: p.PRAZO_5_ANOS_COMPLETO || null,
        status_avaliacao: p.STATUS_AVALIACAO || "PENDENTE",
        lote_id: (novoLote as LoteImportacao).id,
      }));

      const { error: insertError } = await supabase
        .from("processos_fila")
        .insert(processosParaInserir);

      if (insertError) {
        logger.error("Erro ao inserir processos:", insertError);
        toast.error("Erro ao inserir processos");
        return;
      }

      toast.success(`${novosProcessos.length} processos carregados com sucesso!`);
      await fetchProcessos();
    } catch (error) {
      logger.error("Erro ao carregar planilha:", error);
      toast.error("Erro ao carregar planilha");
    } finally {
      setUploading(false);
    }
  };

  // Atualizar status de um processo
  const atualizarStatusProcesso = async (
    codigoProcesso: string,
    status: "PENDENTE" | "EM_ANALISE" | "CONCLUIDO",
    responsavelId?: string
  ) => {
    try {
      const { error } = await supabase
        .from("processos_fila")
        .update({
          status_avaliacao: status,
          responsavel_avaliacao: responsavelId || null,
          data_inicio_avaliacao: status === "EM_ANALISE" ? new Date().toISOString() : undefined,
          data_fim_avaliacao: status === "CONCLUIDO" ? new Date().toISOString() : undefined,
        })
        .eq("codigo_processo", codigoProcesso)
        .eq("lote_id", loteAtivo?.id);

      if (error) {
        logger.error("Erro ao atualizar processo:", error);
        return false;
      }

      // Atualizar estado local
      setProcessos((prev) =>
        prev.map((p) =>
          p.CODIGO_PROCESSO === codigoProcesso
            ? {
                ...p,
                STATUS_AVALIACAO: status,
                RESPONSAVEL: responsavelId,
                DATA_INICIO_AVALIACAO:
                  status === "EM_ANALISE" ? new Date().toISOString() : p.DATA_INICIO_AVALIACAO,
                DATA_FIM: status === "CONCLUIDO" ? new Date().toISOString() : p.DATA_FIM,
              }
            : p
        )
      );

      return true;
    } catch (error) {
      logger.error("Erro ao atualizar processo:", error);
      return false;
    }
  };

  // Configurar realtime
  useEffect(() => {
    fetchProcessos();

    // Subscrever a mudanças em processos_fila
    const channel = supabase
      .channel("processos-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "processos_fila",
        },
        (payload) => {
          logger.log("Mudança em processos:", payload);
          fetchProcessos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProcessos]);

  return {
    processos,
    loteAtivo,
    loading,
    uploading,
    podeCarregarPlanilha,
    carregarPlanilha,
    atualizarStatusProcesso,
    refetch: fetchProcessos,
  };
}
