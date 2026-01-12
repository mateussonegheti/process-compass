import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GitMerge, LayoutDashboard } from "lucide-react";
import { Header } from "@/components/cogede/Header";
import { SessaoCard } from "@/components/cogede/SessaoCard";
import { FormularioAvaliacao } from "@/components/cogede/FormularioAvaliacao";
import { MergePlanilhas } from "@/components/cogede/MergePlanilhas";
import { PainelSupervisor } from "@/components/cogede/PainelSupervisor";
import { DashboardSupervisor } from "@/components/cogede/DashboardSupervisor";
import { SessaoAvaliacao, ProcessoFila, AvaliacaoDocumental } from "@/types/cogede";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProcessos } from "@/hooks/useProcessos";

export default function Index() {
  const { profile, isAdmin, isSupervisor } = useAuth();
  const { 
    processos, 
    loading: processosLoading, 
    uploading,
    podeCarregarPlanilha,
    carregarPlanilha,
    atualizarStatusProcesso 
  } = useProcessos();
  
  const [sessao, setSessao] = useState<SessaoAvaliacao>({
    responsavel: "",
    processoAtual: undefined,
    iniciada: false
  });
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoDocumental[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Auto-preencher responsável quando o perfil do usuário estiver disponível
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
    
    // Buscar próximo processo pendente
    const proximoProcesso = processos.find(p => p.STATUS_AVALIACAO === "PENDENTE");
    
    if (proximoProcesso) {
      // Atualizar no banco
      const sucesso = await atualizarStatusProcesso(
        proximoProcesso.CODIGO_PROCESSO,
        "EM_ANALISE",
        profile.id
      );
      
      if (sucesso) {
        setSessao(prev => ({
          ...prev,
          processoAtual: {
            ...proximoProcesso,
            STATUS_AVALIACAO: "EM_ANALISE",
            RESPONSAVEL: sessao.responsavel,
            DATA_INICIO_AVALIACAO: new Date().toISOString()
          }
        }));
        
        toast.success(`Processo ${proximoProcesso.CODIGO_PROCESSO} capturado para avaliação`);
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
    
    // Marcar processo como concluído
    const sucesso = await atualizarStatusProcesso(
      avaliacao.codigoProcesso,
      "CONCLUIDO",
      profile.id
    );
    
    if (sucesso) {
      toast.success("Avaliação salva com sucesso!");
      
      // Buscar próximo processo
      const proximoProcesso = processos.find(p => 
        p.STATUS_AVALIACAO === "PENDENTE" && 
        p.CODIGO_PROCESSO !== avaliacao.codigoProcesso
      );
      
      if (proximoProcesso) {
        const sucessoProximo = await atualizarStatusProcesso(
          proximoProcesso.CODIGO_PROCESSO,
          "EM_ANALISE",
          profile.id
        );
        
        if (sucessoProximo) {
          setSessao(prev => ({
            ...prev,
            processoAtual: {
              ...proximoProcesso,
              STATUS_AVALIACAO: "EM_ANALISE",
              RESPONSAVEL: sessao.responsavel,
              DATA_INICIO_AVALIACAO: new Date().toISOString()
            }
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
    
    setCarregando(false);
  };

  const handleProcessosCarregados = async (novosProcessos: ProcessoFila[]) => {
    await carregarPlanilha(novosProcessos);
    setSessao((prev) => ({ ...prev, processoAtual: undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="avaliacao" className="space-y-6">
          <TabsList className={`grid w-full max-w-lg ${podeVerDashboard ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="avaliacao" className="gap-2">
              <FileText className="h-4 w-4" />
              Avaliação
            </TabsTrigger>
            {podeVerDashboard && (
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            )}
            <TabsTrigger value="merge" className="gap-2">
              <GitMerge className="h-4 w-4" />
              Merge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avaliacao" className="space-y-6">
            {podeVerDashboard && (
              <PainelSupervisor
                onProcessosCarregados={handleProcessosCarregados}
                avaliacoesRealizadas={avaliacoes}
                processosCount={processos.length}
                uploading={uploading}
                podeCarregarPlanilha={podeCarregarPlanilha}
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
              />
            )}
          </TabsContent>

          {podeVerDashboard && (
            <TabsContent value="dashboard" className="space-y-6">
              <DashboardSupervisor processos={processos} />
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
