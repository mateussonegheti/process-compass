import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Users, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessoFila } from "@/types/cogede";
import { logger } from "@/lib/logger";

interface AvaliacaoEmAndamento {
  avaliador_nome: string;
  processo_codigo: string;
  processo_cnj: string;
  inicio: string;
}

interface EstatisticasAvaliador {
  nome: string;
  concluidos: number;
  em_analise: number;
}

interface DashboardSupervisorProps {
  processos: ProcessoFila[];
}

export function DashboardSupervisor({ processos }: DashboardSupervisorProps) {
  const [avaliacoesEmAndamento, setAvaliacoesEmAndamento] = useState<AvaliacaoEmAndamento[]>([]);
  const [estatisticasPorAvaliador, setEstatisticasPorAvaliador] = useState<EstatisticasAvaliador[]>([]);
  const [loading, setLoading] = useState(true);

  const totalPendentes = processos.filter((p) => p.STATUS_AVALIACAO === "PENDENTE").length;
  const totalEmAnalise = processos.filter((p) => p.STATUS_AVALIACAO === "EM_ANALISE").length;
  const totalConcluidos = processos.filter((p) => p.STATUS_AVALIACAO === "CONCLUIDO").length;
  const total = processos.length;
  const progresso = total > 0 ? (totalConcluidos / total) * 100 : 0;

  // Buscar dados em tempo real
  const fetchDadosRealtime = async () => {
    try {
      // Buscar processos em análise com dados do avaliador
      const { data: processosEmAnalise, error: processosError } = await supabase
        .from("processos_fila")
        .select(`
          codigo_processo,
          numero_cnj,
          data_inicio_avaliacao,
          responsavel_avaliacao,
          profiles!processos_fila_responsavel_avaliacao_fkey(nome)
        `)
        .eq("status_avaliacao", "EM_ANALISE");

      if (processosError) {
        logger.error("Erro ao buscar processos em análise:", processosError);
      } else if (processosEmAnalise) {
        const emAndamento: AvaliacaoEmAndamento[] = processosEmAnalise
          .filter((p): p is typeof p & { profiles: { nome: string } | null } => true)
          .map((p) => ({
            avaliador_nome: (p.profiles as { nome: string } | null)?.nome || "Desconhecido",
            processo_codigo: p.codigo_processo,
            processo_cnj: p.numero_cnj,
            inicio: p.data_inicio_avaliacao || "",
          }));
        setAvaliacoesEmAndamento(emAndamento);
      }

      // Buscar estatísticas por avaliador
      const { data: stats, error: statsError } = await supabase
        .from("processos_fila")
        .select(`
          status_avaliacao,
          responsavel_avaliacao,
          profiles!processos_fila_responsavel_avaliacao_fkey(nome)
        `)
        .not("responsavel_avaliacao", "is", null);

      if (statsError) {
        logger.error("Erro ao buscar estatísticas:", statsError);
      } else if (stats) {
        const porAvaliador = new Map<string, EstatisticasAvaliador>();
        
        stats.forEach((s) => {
          const nome = (s.profiles as { nome: string } | null)?.nome || "Desconhecido";
          const existente = porAvaliador.get(nome) || { nome, concluidos: 0, em_analise: 0 };
          
          if (s.status_avaliacao === "CONCLUIDO") {
            existente.concluidos++;
          } else if (s.status_avaliacao === "EM_ANALISE") {
            existente.em_analise++;
          }
          
          porAvaliador.set(nome, existente);
        });
        
        setEstatisticasPorAvaliador(Array.from(porAvaliador.values()));
      }
    } catch (error) {
      logger.error("Erro ao buscar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Configurar realtime
  useEffect(() => {
    fetchDadosRealtime();

    // Subscrever a mudanças
    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "processos_fila",
        },
        () => {
          fetchDadosRealtime();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "avaliacoes",
        },
        () => {
          fetchDadosRealtime();
        }
      )
      .subscribe();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDadosRealtime, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const formatarTempo = (dataIso: string) => {
    if (!dataIso) return "—";
    const inicio = new Date(dataIso);
    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    
    if (diffMin < 60) return `${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    return `${diffHoras}h ${diffMin % 60}min`;
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <Progress value={progresso} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {progresso.toFixed(1)}% concluído
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalPendentes}</div>
            <p className="text-xs text-muted-foreground">
              aguardando avaliação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalEmAnalise}</div>
            <p className="text-xs text-muted-foreground">
              sendo avaliados agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConcluidos}</div>
            <p className="text-xs text-muted-foreground">
              avaliações finalizadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Avaliações em Tempo Real */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Avaliações em Andamento
              {avaliacoesEmAndamento.length > 0 && (
                <Badge variant="secondary" className="ml-2 animate-pulse">
                  {avaliacoesEmAndamento.length} ativo(s)
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Acompanhamento em tempo real das avaliações
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando...
              </div>
            ) : avaliacoesEmAndamento.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhuma avaliação em andamento
              </div>
            ) : (
              <div className="space-y-3">
                {avaliacoesEmAndamento.map((av, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <div>
                        <p className="font-medium text-sm">{av.avaliador_nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {av.processo_codigo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatarTempo(av.inicio)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas por Avaliador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Produtividade por Avaliador
            </CardTitle>
            <CardDescription>
              Quantidade de processos avaliados por cada membro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Carregando...
              </div>
            ) : estatisticasPorAvaliador.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                Nenhuma estatística disponível
              </div>
            ) : (
              <div className="space-y-3">
                {estatisticasPorAvaliador
                  .sort((a, b) => b.concluidos - a.concluidos)
                  .map((av, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{av.nome}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {av.em_analise > 0 && (
                          <Badge variant="outline" className="text-blue-600">
                            {av.em_analise} em análise
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-green-600">
                          {av.concluidos} concluídos
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
