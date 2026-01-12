import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, GitMerge } from "lucide-react";
import { Header } from "@/components/cogede/Header";
import { SessaoCard } from "@/components/cogede/SessaoCard";
import { FormularioAvaliacao } from "@/components/cogede/FormularioAvaliacao";
import { MergePlanilhas } from "@/components/cogede/MergePlanilhas";
import { PainelSupervisor } from "@/components/cogede/PainelSupervisor";
import { SessaoAvaliacao, ProcessoFila, AvaliacaoDocumental } from "@/types/cogede";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { profile } = useAuth();
  
  const [sessao, setSessao] = useState<SessaoAvaliacao>({
    responsavel: "",
    processoAtual: undefined,
    iniciada: false
  });
  const [processos, setProcessos] = useState<ProcessoFila[]>([]);
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

  const handleIniciarSessao = (responsavel: string) => {
    setSessao({
      responsavel,
      processoAtual: undefined,
      iniciada: true
    });
    toast.success(`Sessão iniciada para ${responsavel}`);
  };

  const handleIniciarAvaliacao = () => {
    setCarregando(true);
    
    // Simular busca do próximo processo pendente
    setTimeout(() => {
      const proximoProcesso = processos.find(p => p.STATUS_AVALIACAO === "PENDENTE");
      
      if (proximoProcesso) {
        // Marcar como EM_ANALISE
        setProcessos(prev => prev.map(p => 
          p.CODIGO_PROCESSO === proximoProcesso.CODIGO_PROCESSO
            ? { ...p, STATUS_AVALIACAO: "EM_ANALISE" as const, RESPONSAVEL: sessao.responsavel, DATA_INICIO_AVALIACAO: new Date().toISOString() }
            : p
        ));
        
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
        toast.info("Não há mais processos pendentes na fila");
      }
      
      setCarregando(false);
    }, 1000);
  };

  const handleSalvarEProximo = (avaliacao: AvaliacaoDocumental) => {
    setCarregando(true);
    
    // Adicionar data de fim e salvar avaliação
    const avaliacaoCompleta = {
      ...avaliacao,
      dataFimAvaliacao: new Date().toISOString(),
    };
    setAvaliacoes((prev) => [...prev, avaliacaoCompleta]);
    
    // Simular salvamento
    setTimeout(() => {
      // Marcar processo atual como CONCLUIDO
      setProcessos(prev => prev.map(p => 
        p.CODIGO_PROCESSO === avaliacao.codigoProcesso
          ? { ...p, STATUS_AVALIACAO: "CONCLUIDO" as const }
          : p
      ));
      
      toast.success("Avaliação salva com sucesso!");
      
      // Buscar próximo processo
      const proximoProcesso = processos.find(p => 
        p.STATUS_AVALIACAO === "PENDENTE" && 
        p.CODIGO_PROCESSO !== avaliacao.codigoProcesso
      );
      
      if (proximoProcesso) {
        setProcessos(prev => prev.map(p => 
          p.CODIGO_PROCESSO === proximoProcesso.CODIGO_PROCESSO
            ? { ...p, STATUS_AVALIACAO: "EM_ANALISE" as const, RESPONSAVEL: sessao.responsavel }
            : p
        ));
        
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
      } else {
        setSessao(prev => ({ ...prev, processoAtual: undefined }));
        toast.info("Todos os processos foram avaliados!");
      }
      
      setCarregando(false);
    }, 1500);
  };

  const handleProcessosCarregados = (novosProcessos: ProcessoFila[]) => {
    setProcessos(novosProcessos);
    setSessao((prev) => ({ ...prev, processoAtual: undefined }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="avaliacao" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="avaliacao" className="gap-2">
              <FileText className="h-4 w-4" />
              Avaliação Documental
            </TabsTrigger>
            <TabsTrigger value="merge" className="gap-2">
              <GitMerge className="h-4 w-4" />
              Merge de Planilhas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avaliacao" className="space-y-6">
            <PainelSupervisor
              onProcessosCarregados={handleProcessosCarregados}
              avaliacoesRealizadas={avaliacoes}
              processosCount={processos.length}
            />
            
            <SessaoCard
              sessao={sessao}
              onIniciarSessao={handleIniciarSessao}
              onIniciarAvaliacao={handleIniciarAvaliacao}
              carregando={carregando}
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

          <TabsContent value="merge">
            <MergePlanilhas />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
