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
  status_avaliacao: "PENDENTE" | "EM_ANALISE" | "CONCLUIDO";
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

  // ======================================================
  // BUSCAR LOTE ATIVO E PROCESSOS
  // ======================================================
  const fetchProcessos = useCallback(async () => {
    try {
      setLoading(true);

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

      if (!lotes || lotes.length === 0) {
        setLoteAtivo(null);
        setProcessos([]);
        return;
      }

      const lote = lotes[0] as LoteImportacao;
      setLoteAtivo(lote);

      const { data: processosData, error: processosError } = await supabase
        .from("processos_fila")
        .select("*")
        .eq("lote_id", lote.id)
        .order("created_at", { ascending: true });

      if (processosError) {
        logger.error("Erro ao buscar processos:", processosError);
        return;
      }

      const processosFormatados: ProcessoFila[] = (processosData as ProcessoDB[]).map(
        (p) => ({
          ID: p.id,
          CODIGO_PROCESSO: p.codigo_processo,
          NUMERO_CNJ: p.numero_cnj,
          POSSUI_ASSUNTO: p.possui_assunto || "",
          ASSUNTO_PRINCIPAL: p.assunto_principal || "",
          POSSUI_MOV_ARQUIVADO: p.possui_mov_arquivado || "",
          DATA_DISTRIBUICAO: p.data_distribuicao || "",
          DATA_ARQUIVAMENTO_DEF: p.data_arquivamento_def || "",
          PRAZO_5_ANOS_COMPLETO: p.prazo_5_anos_completo || "",
          STATUS_AVALIACAO: p.status_avaliacao,
          RESPONSAVEL: p.responsavel_avaliacao || undefined,
          DATA_INICIO_AVALIACAO: p.data_inicio_avaliacao || undefined,
          DATA_FIM: p.data_fim_avaliacao || undefined,
        })
      );

      setProcessos(processosFormatados);
    } catch (error) {
      logger.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================================================
  // CARREGAR PLANILHA (ADMIN / SUPERVISOR)
  // ======================================================
  const carregarPlanilha = async (novosProcessos: ProcessoFila[]) => {
    if (!podeCarregarPlanilha || !profile) {
      toast.error("Você não tem permissão para carregar planilhas");
      return;
    }

    try {
      setUploading(true);

      if (loteAtivo) {
        await supabase
          .from("lotes_importacao")
          .update({ ativo: false })
          .eq("id", loteAtivo.id);
      }

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
        toast.error("Erro ao criar lote");
        return;
      }

      const processosParaInserir = novosProcessos.map((p) => ({
        codigo_processo: p.CODIGO_PROCESSO,
        numero_cnj: p.NUMERO_CNJ,
        possui_assunto: p.POSSUI_ASSUNTO || null,
        assunto_principal: p.ASSUNTO_PRINCIPAL || null,
        possui_mov_arquivado: p.POSSUI_MOV_ARQUIVADO || null,
        data_distribuicao: p.DATA_DISTRIBUICAO || null,
        data_arquivamento_def: p.DATA_ARQUIVAMENTO_DEF || null,
        prazo_5_anos_completo: p.PRAZO_5_ANOS_COMPLETO || null,
        status_avaliacao: "PENDENTE",
        lote_id: novoLote.id,
      }));

      const { error: insertError } = await supabase
        .from("processos_fila")
        .insert(processosParaInserir);

      if (insertError) {
        logger.error("Erro ao inserir processos:", insertError);
        toast.error("Erro ao inserir processos");
        return;
      }

      toast.success("Planilha carregada com sucesso");
      await fetchProcessos();
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // CAPTURAR PRÓXIMO PROCESSO (RPC — ATÔMICO)
  // ======================================================
  const capturarProximoProcesso = async () => {
    try {
      const { data, error } = await supabase.rpc("capturar_proximo_processo" as any);

      if (error) {
        logger.error("Erro RPC capturar_proximo_processo:", error);
        toast.error("Erro ao capturar processo");
        return null;
      }

      if (!data) {
        toast.info("Não há processos pendentes disponíveis");
        return null;
      }

      await fetchProcessos();
      return data;
    } catch {
      toast.error("Erro inesperado ao capturar processo");
      return null;
    }
  };

  // ======================================================
  // CONCLUIR PROCESSO
  // ======================================================
  const atualizarStatusProcesso = async (codigoProcesso: string) => {
    try {
      if (!loteAtivo?.id) return false;

      const { error } = await supabase
        .from("processos_fila")
        .update({
          status_avaliacao: "CONCLUIDO",
          data_fim_avaliacao: new Date().toISOString(),
        })
        .eq("codigo_processo", codigoProcesso)
        .eq("lote_id", loteAtivo.id);

      if (error) {
        logger.error("Erro ao concluir processo:", error);
        return false;
      }

      await fetchProcessos();
      return true;
    } catch (error) {
      logger.error("Erro ao concluir processo:", error);
      return false;
    }
  };

  // ======================================================
  // REALTIME
  // ======================================================
  useEffect(() => {
    fetchProcessos();

    const channel = supabase
      .channel("processos-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "processos_fila" },
        () => fetchProcessos()
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
    capturarProximoProcesso,
    atualizarStatusProcesso,
    refetch: fetchProcessos,
  };
}