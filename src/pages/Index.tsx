import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GitMerge, LayoutDashboard, ClipboardList } from "lucide-react";
import { Header } from "@/components/cogede/Header";
import { SessaoCard } from "@/components/cogede/SessaoCard";
import { FormularioAvaliacao } from "@/components/cogede/FormularioAvaliacao";
import { MergePlanilhas } from "@/components/cogede/MergePlanilhas";
import { PainelSupervisor } from "@/components/cogede/PainelSupervisor";
import { DashboardSupervisor } from "@/components/cogede/DashboardSupervisor";
import { MinhasAvaliacoes } from "@/components/cogede/MinhasAvaliacoes";
import { SessaoAvaliacao, ProcessoFila, AvaliacaoDocumental } from "@/types/cogede";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProcessos } from "@/hooks/useProcessos";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export default function Index() {
  const { profile, isAdmin, isSupervisor } = useAuth();
  const { 
    processos, 
    loteAtivo,
    loading: processosLoading, 
    uploading,
    podeCarregarPlanilha,
    carregarPlanilha,
    atualizarStatusProcesso,
    liberarProcessosOrfaos
  } = useProcessos();
  
  const [sessao, setSessao] = useState<SessaoAvaliacao>({
    responsavel: "",
    processoAtual: undefined,
    iniciada: false
  });
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDocumental[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("avaliacao");
  const [avaliacaoAnterior, setAvaliacaoAnterior] = useState<Record<string, unknown> | null>(null);
  const cleanupExecutedRef = useRef(false);

  // Auto-preencher responsável quando o perfil do usuário estiver disponível
  useEffect(() => {
    if (profile?.nome && !sessao.responsavel) {
      setSessao(prev => ({
        ...prev,
        responsavel: profile.nome
      }));
    }
  }, [profile?.nome, sessao.responsavel]);

  // Liberar processos órfãos do usuário ao carregar a página (apenas uma vez)
  useEffect(() => {
    if (profile?.id && loteAtivo?.id) {
      liberarProcessosOrfaos(profile.id);
    }
  }, [profile?.id, loteAtivo?.id, liberarProcessosOrfaos]);

  // Cleanup function para liberar processo quando usuário sai
  const cleanupOnExit = useCallback(async () => {
    if (cleanupExecutedRef.current) return;
    if (!sessao.processoAtual?.CODIGO_PROCESSO || !profile?.id || !loteAtivo?.id) return;
    
    cleanupExecutedRef.current = true;
    logger.log("[Index] Executando cleanup - liberando processo do usuário");
    
    try {
      // Use Supabase client instead of direct HTTP calls for better security
      await supabase
        .from("processos_fila")
        .update({
          status_avaliacao: "PENDENTE",
          responsavel_avaliacao: null,
          data_inicio_avaliacao: null
        })
        .eq("codigo_processo", sessao.processoAtual.CODIGO_PROCESSO)
        .eq("lote_id", loteAtivo.id);
    } catch (error) {
      logger.error("[Index] Erro ao liberar processo no cleanup:", error);
    }
  }, [sessao.processoAtual?.CODIGO_PROCESSO, profile?.id, loteAtivo?.id]);

  // Adicionar listeners para cleanup na saída
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessao.processoAtual) {
        cleanupOnExit();
        // Mostrar confirmação se há processo em andamento
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessao.processoAtual) {
        cleanupOnExit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessao.processoAtual, cleanupOnExit]);

  // Reset cleanup flag when a new process is captured
  useEffect(() => {
    if (sessao.processoAtual) {
      cleanupExecutedRef.current = false;
    }
  }, [sessao.processoAtual?.CODIGO_PROCESSO]);

  const totalPendentes = processos.filter(p => p.STATUS_AVALIACAO === "PENDENTE").length;
  const totalEmAnalise = processos.filter(p => p.STATUS_AVALIACAO === "EM_ANALISE").length;
  const totalConcluidos = processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length;

  const podeVerDashboard = isAdmin || isSupervisor;

  const handleIniciarSessao = (responsavel: string) => {
    setSessao({
      responsavel,
      processoAtual: undefined,
      iniciada: true
    });
    toast.success(`Sessão iniciada para ${responsavel}`);
  };

  // Handler para editar avaliação existente
  const handleEditarAvaliacao = async (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => {
    // Se há um processo em EM_ANALISE, liberar ele da fila antes de editar outro
    if (sessao.processoAtual?.STATUS_AVALIACAO === "EM_ANALISE" && sessao.processoAtual.ID) {
      try {
        logger.log(`[Index] Liberando processo ${sessao.processoAtual.CODIGO_PROCESSO} ao editar anterior`);
        
        await supabase
          .from("processos_fila")
          .update({
            status_avaliacao: "PENDENTE",
            responsavel_avaliacao: null,
            data_inicio_avaliacao: null,
            ultima_interacao: null,
            tempo_captura: null
          })
          .eq("id", sessao.processoAtual.ID);
      } catch (error) {
        logger.error("[Index] Erro ao liberar processo anterior:", error);
        toast.error("Erro ao liberar processo anterior");
        return;
      }
    }

    // Agora editar o processo anterior
    setSessao(prev => ({
      ...prev,
      processoAtual: processo,
      iniciada: true
    }));

    // Carregar dados da avaliação anterior se foram passados
    if (avaliacaoAnterior) {
      setAvaliacaoAnterior(avaliacaoAnterior);
    }

    // Navegação automática para aba de avaliação
    setAbaSelecionada("avaliacao");

    logger.info(`[Index] Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
    toast.info(`Editando avaliação do processo ${processo.CODIGO_PROCESSO}`);
  };

  const handleIniciarAvaliacao = async () => {
    if (!profile?.id) return;
    if (!loteAtivo?.id) {
      toast.error("Nenhum lote ativo encontrado");
      return;
    }
    
    setCarregando(true);
    
    // Buscar próximo processo pendente diretamente do banco para ter dados completos
    const { data: proximoProcessoDb, error } = await supabase
      .from("processos_fila")
      .select("*")
      .eq("status_avaliacao", "PENDENTE")
      .eq("lote_id", loteAtivo.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      logger.error("Erro ao buscar processo:", error);
      toast.error("Erro ao buscar processo");
      setCarregando(false);
      return;
    }
    
    if (proximoProcessoDb) {
      // Atualizar no banco
      const sucesso = await atualizarStatusProcesso(
        proximoProcessoDb.codigo_processo,
        "EM_ANALISE",
        profile.id
      );
      
      if (sucesso) {
        const processoFormatado: ProcessoFila = {
          ID: proximoProcessoDb.id,
          CODIGO_PROCESSO: proximoProcessoDb.codigo_processo,
          NUMERO_CNJ: proximoProcessoDb.numero_cnj,
          POSSUI_ASSUNTO: proximoProcessoDb.possui_assunto || "",
          ASSUNTO_PRINCIPAL: proximoProcessoDb.assunto_principal || "",
          POSSUI_MOV_ARQUIVADO: proximoProcessoDb.possui_mov_arquivado || "",
          DATA_DISTRIBUICAO: proximoProcessoDb.data_distribuicao || "",
          DATA_ARQUIVAMENTO_DEF: proximoProcessoDb.data_arquivamento_def || "",
          PRAZO_5_ANOS_COMPLETO: proximoProcessoDb.prazo_5_anos_completo || "",
          STATUS_AVALIACAO: "EM_ANALISE",
          RESPONSAVEL: sessao.responsavel,
          DATA_INICIO_AVALIACAO: new Date().toISOString()
        };
        
        setSessao(prev => ({
          ...prev,
          processoAtual: processoFormatado
        }));
        
        toast.success(`Processo ${proximoProcessoDb.codigo_processo} capturado para avaliação`);
      } else {
        toast.error("Erro ao capturar processo");
      }
    } else {
      toast.info("Não há mais processos pendentes na fila");
    }
    
    setCarregando(false);
  };

  const handleSalvarEProximo = async (avaliacao: AvaliacaoDocumental) => {
    if (!profile?.id) return;
    
    setCarregando(true);
    
    // Adicionar data de fim e salvar avaliação
    const avaliacaoCompleta = {
      ...avaliacao,
      dataFimAvaliacao: new Date().toISOString(),
    };
    setAvaliacoes((prev) => [...prev, avaliacaoCompleta]);
    
    // Buscar o ID do processo no banco
    const processoAtual = sessao.processoAtual;
    if (!processoAtual?.ID) {
      toast.error("ID do processo não encontrado");
      setCarregando(false);
      return;
    }
    
    // Inserir avaliação no banco de dados
    const { error: insertError } = await supabase
      .from("avaliacoes")
      .insert({
        processo_id: processoAtual.ID,
        avaliador_id: profile.id,
        descricao_assunto_faltante: avaliacao.descricaoAssuntoFaltante || null,
        assunto_tpu: avaliacao.assuntoTpu || null,
        hierarquia_correta: avaliacao.hierarquiaCorreta || null,
        divergencia_hierarquia: avaliacao.divergenciaHierarquia || null,
        destinacao_permanente: avaliacao.destinacaoPermanente || null,
        descricao_situacao_arquivamento: avaliacao.descricaoSituacaoArquivamento || null,
        inconsistencia_prazo: avaliacao.inconsistenciaPrazo || null,
        pecas_tipos: avaliacao.pecasTipos || null,
        pecas_ids: avaliacao.pecasIds || null,
        pecas_combinado: avaliacao.pecasCombinado || null,
        observacoes_pecas: avaliacao.observacoesPecas || null,
        documento_nao_localizado: avaliacao.documentoNaoLocalizado || false,
        documento_duplicado: avaliacao.documentoDuplicado || false,
        erro_tecnico: avaliacao.erroTecnico || false,
        ocorrencias_outro_detalhe: avaliacao.ocorrenciasOutroDetalhe || null,
        divergencia_classificacao: avaliacao.divergenciaClassificacao || null,
        tipo_informado_sistema: avaliacao.tipoInformadoSistema || null,
        tipo_real_identificado: avaliacao.tipoRealIdentificado || null,
        processo_vazio: avaliacao.processoVazio || false,
        observacoes_gerais: avaliacao.observacoesGerais || null,
        data_inicio: avaliacao.dataInicioAvaliacao,
        data_fim: new Date().toISOString(),
      });
    
    if (insertError) {
      logger.error("Erro ao inserir avaliação:", insertError);
      toast.error("Erro ao salvar avaliação no banco de dados");
      setCarregando(false);
      return;
    }
    
    // Marcar processo como concluído
    const sucesso = await atualizarStatusProcesso(
      avaliacao.codigoProcesso,
      "CONCLUIDO",
      profile.id
    );
    
    if (sucesso) {
      toast.success("Avaliação salva com sucesso!");
      
      // Buscar próximo processo diretamente do banco para ter dados completos
      const { data: proximoProcessoDb, error: proximoError } = await supabase
        .from("processos_fila")
        .select("*")
        .eq("status_avaliacao", "PENDENTE")
        .eq("lote_id", loteAtivo?.id || "")
        .neq("codigo_processo", avaliacao.codigoProcesso)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      
      if (proximoError) {
        logger.error("Erro ao buscar próximo processo:", proximoError);
      }
      
      if (proximoProcessoDb) {
        const sucessoProximo = await atualizarStatusProcesso(
          proximoProcessoDb.codigo_processo,
          "EM_ANALISE",
          profile.id
        );
        
        if (sucessoProximo) {
          const processoFormatado: ProcessoFila = {
            ID: proximoProcessoDb.id,
            CODIGO_PROCESSO: proximoProcessoDb.codigo_processo,
            NUMERO_CNJ: proximoProcessoDb.numero_cnj,
            POSSUI_ASSUNTO: proximoProcessoDb.possui_assunto || "",
            ASSUNTO_PRINCIPAL: proximoProcessoDb.assunto_principal || "",
            POSSUI_MOV_ARQUIVADO: proximoProcessoDb.possui_mov_arquivado || "",
            DATA_DISTRIBUICAO: proximoProcessoDb.data_distribuicao || "",
            DATA_ARQUIVAMENTO_DEF: proximoProcessoDb.data_arquivamento_def || "",
            PRAZO_5_ANOS_COMPLETO: proximoProcessoDb.prazo_5_anos_completo || "",
            STATUS_AVALIACAO: "EM_ANALISE",
            RESPONSAVEL: sessao.responsavel,
            DATA_INICIO_AVALIACAO: new Date().toISOString()
          };
          
          setSessao(prev => ({
            ...prev,
            processoAtual: processoFormatado
          }));
          
          toast.info("Próximo processo carregado automaticamente");
        }
      } else {
        setSessao(prev => ({ ...prev, processoAtual: undefined }));
        toast.info("Todos os processos foram avaliados!");
      }
    } else {
      toast.error("Erro ao salvar avaliação");
    }

    // Limpar dados da avaliação anterior após salvar
    setAvaliacaoAnterior(null);
    
    setCarregando(false);
  };

  const handleProcessosCarregados = async (novosProcessos: ProcessoFila[]) => {
    await carregarPlanilha(novosProcessos);
    setSessao((prev) => ({ ...prev, processoAtual: undefined }));
    setAvaliacoes([]); // Resetar avaliações ao carregar nova planilha
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
          <TabsList className={`grid w-full max-w-2xl ${podeVerDashboard ? "grid-cols-4" : "grid-cols-2"}`}>
            <TabsTrigger value="avaliacao" className="gap-2">
              <FileText className="h-4 w-4" />
              Avaliação
            </TabsTrigger>
            <TabsTrigger value="minhas-avaliacoes" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Minhas Avaliações
            </TabsTrigger>
            {podeVerDashboard && (
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            )}
            {podeVerDashboard && (
              <TabsTrigger value="merge" className="gap-2">
                <GitMerge className="h-4 w-4" />
                Merge
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="avaliacao" className="space-y-6">
            {podeVerDashboard && (
              <PainelSupervisor
                onProcessosCarregados={handleProcessosCarregados}
                processosCount={processos.length}
                uploading={uploading}
                podeCarregarPlanilha={podeCarregarPlanilha}
                loteId={loteAtivo?.id}
              />
            )}
            
            <SessaoCard
              sessao={sessao}
              onIniciarSessao={handleIniciarSessao}
              onIniciarAvaliacao={handleIniciarAvaliacao}
              carregando={carregando || processosLoading}
              totalPendentes={totalPendentes}
              totalEmAnalise={totalEmAnalise}
              totalConcluidos={totalConcluidos}
            />

            {sessao.processoAtual && (
              <FormularioAvaliacao
                processo={sessao.processoAtual}
                responsavel={sessao.responsavel}
                onSalvarEProximo={handleSalvarEProximo}
                carregando={carregando}
                avaliacaoAnterior={avaliacaoAnterior}
              />
            )}
          </TabsContent>

          <TabsContent value="minhas-avaliacoes" className="space-y-6">
            {loteAtivo?.id ? (
              <MinhasAvaliacoes
                onEditarAvaliacao={handleEditarAvaliacao}
                loteId={loteAtivo.id}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum lote ativo. Aguarde o supervisor carregar uma planilha.
              </div>
            )}
          </TabsContent>

          {podeVerDashboard && (
            <TabsContent value="dashboard" className="space-y-6">
              <DashboardSupervisor processos={processos} loteId={loteAtivo?.id} />
            </TabsContent>
          )}

          <TabsContent value="merge">
            <MergePlanilhas />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
