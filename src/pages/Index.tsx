import { useState, useEffect } from "react";
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
    capturarProximoProcesso,
    atualizarStatusProcesso
  } = useProcessos();

  const [sessao, setSessao] = useState<SessaoAvaliacao>({
    responsavel: "",
    processoAtual: undefined,
    iniciada: false
  });

  const [avaliacaoAnterior, setAvaliacaoAnterior] =
    useState<Record<string, unknown> | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("avaliacao");

  // Preencher responsável automaticamente
  useEffect(() => {
    if (profile?.nome && !sessao.responsavel) {
      setSessao(prev => ({
        ...prev,
        responsavel: profile.nome
      }));
    }
  }, [profile?.nome, sessao.responsavel]);

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

  const handleIniciarAvaliacao = async () => {
    if (!profile?.id) return;

    setCarregando(true);

    try {
      const processo = await capturarProximoProcesso();

      if (!processo) {
        toast.info("Não há processos pendentes disponíveis");
        setSessao(prev => ({ ...prev, processoAtual: undefined }));
        return;
      }

      const processoFormatado: ProcessoFila = {
        ID: processo.id,
        CODIGO_PROCESSO: processo.codigo_processo,
        NUMERO_CNJ: processo.numero_cnj,
        POSSUI_ASSUNTO: processo.possui_assunto || "",
        ASSUNTO_PRINCIPAL: processo.assunto_principal || "",
        POSSUI_MOV_ARQUIVADO: processo.possui_mov_arquivado || "",
        DATA_DISTRIBUICAO: processo.data_distribuicao || "",
        DATA_ARQUIVAMENTO_DEF: processo.data_arquivamento_def || "",
        PRAZO_5_ANOS_COMPLETO: processo.prazo_5_anos_completo || "",
        STATUS_AVALIACAO: "EM_ANALISE",
        RESPONSAVEL: sessao.responsavel,
        DATA_INICIO_AVALIACAO: new Date().toISOString()
      };

      setSessao(prev => ({
        ...prev,
        processoAtual: processoFormatado,
        iniciada: true
      }));

      toast.success(`Processo ${processo.codigo_processo} capturado para avaliação`);
    } catch (error) {
      logger.error("[Index] Erro ao capturar processo:", error);
      toast.error("Erro ao capturar processo");
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarEProximo = async (avaliacao: AvaliacaoDocumental) => {
    if (!profile?.id || !sessao.processoAtual?.ID) return;

    setCarregando(true);

    try {
      // Salvar avaliação
      const { error } = await supabase
        .from("avaliacoes")
        .upsert(
          {
            processo_id: sessao.processoAtual.ID,
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
          },
          {
            onConflict: "processo_id,avaliador_id",
          }
        );

      if (error) throw error;

      await atualizarStatusProcesso(
        sessao.processoAtual.CODIGO_PROCESSO
      );

      toast.success("Avaliação salva com sucesso!");

      // Captura atômica do próximo
      const proximo = await capturarProximoProcesso();

      if (proximo) {
        const processoFormatado: ProcessoFila = {
          ID: proximo.id,
          CODIGO_PROCESSO: proximo.codigo_processo,
          NUMERO_CNJ: proximo.numero_cnj,
          POSSUI_ASSUNTO: proximo.possui_assunto || "",
          ASSUNTO_PRINCIPAL: proximo.assunto_principal || "",
          POSSUI_MOV_ARQUIVADO: proximo.possui_mov_arquivado || "",
          DATA_DISTRIBUICAO: proximo.data_distribuicao || "",
          DATA_ARQUIVAMENTO_DEF: proximo.data_arquivamento_def || "",
          PRAZO_5_ANOS_COMPLETO: proximo.prazo_5_anos_completo || "",
          STATUS_AVALIACAO: "EM_ANALISE",
          RESPONSAVEL: sessao.responsavel,
        };

        setSessao(prev => ({
          ...prev,
          processoAtual: processoFormatado
        }));

        toast.info("Próximo processo carregado automaticamente");
      } else {
        setSessao(prev => ({ ...prev, processoAtual: undefined }));
        toast.info("Todos os processos foram avaliados!");
      }

      setAvaliacaoAnterior(null);
    } catch (error) {
      logger.error("[Index] Erro ao salvar avaliação:", error);
      toast.error("Erro ao salvar avaliação");
    } finally {
      setCarregando(false);
    }
  };

  const handleProcessosCarregados = async (novosProcessos: ProcessoFila[]) => {
    await carregarPlanilha(novosProcessos);
    setSessao(prev => ({ ...prev, processoAtual: undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
          <TabsList
            className={`grid w-full max-w-2xl ${
              podeVerDashboard ? "grid-cols-4" : "grid-cols-2"
            }`}
          >
            <TabsTrigger value="avaliacao">
              <FileText className="h-4 w-4 mr-2" />
              Avaliação
            </TabsTrigger>

            <TabsTrigger value="minhas-avaliacoes">
              <ClipboardList className="h-4 w-4 mr-2" />
              Minhas Avaliações
            </TabsTrigger>

            {podeVerDashboard && (
              <TabsTrigger value="dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
            )}

            {podeVerDashboard && (
              <TabsTrigger value="merge">
                <GitMerge className="h-4 w-4 mr-2" />
                Merge
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="avaliacao">
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

          <TabsContent value="minhas-avaliacoes">
            {loteAtivo?.id ? (
              <MinhasAvaliacoes
                onEditarAvaliacao={() => {}}
                loteId={loteAtivo.id}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum lote ativo.
              </div>
            )}
          </TabsContent>

          {podeVerDashboard && (
            <TabsContent value="dashboard">
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