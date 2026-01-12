import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Database,
  List,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface AvaliacaoProcesso {
  processo_id: string;
  destinacao_permanente: string | null;
  pecas_ids: string | null;
}

interface DashboardSupervisorProps {
  processos: ProcessoFila[];
}

export function DashboardSupervisor({ processos }: DashboardSupervisorProps) {
  const [avaliacoesEmAndamento, setAvaliacoesEmAndamento] = useState<AvaliacaoEmAndamento[]>([]);
  const [estatisticasPorAvaliador, setEstatisticasPorAvaliador] = useState<EstatisticasAvaliador[]>([]);
  const [avaliacoesMap, setAvaliacoesMap] = useState<Map<string, AvaliacaoProcesso>>(new Map());
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [linhasExibidas, setLinhasExibidas] = useState<string>("10");

  const totalPendentes = processos.filter((p) => p.STATUS_AVALIACAO === "PENDENTE").length;
  const totalEmAnalise = processos.filter((p) => p.STATUS_AVALIACAO === "EM_ANALISE").length;
  const totalConcluidos = processos.filter((p) => p.STATUS_AVALIACAO === "CONCLUIDO").length;
  const total = processos.length;
  const progresso = total > 0 ? (totalConcluidos / total) * 100 : 0;

  // Buscar dados em tempo real
  const fetchDadosRealtime = async () => {
    try {
      // Primeiro buscar todos os profiles para fazer o mapeamento
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nome");

      const newProfilesMap = new Map<string, string>();
      if (!profilesError && allProfiles) {
        allProfiles.forEach((p) => {
          newProfilesMap.set(p.id, p.nome);
        });
        setProfilesMap(newProfilesMap);
      }

      // Buscar processos em análise (apenas os que estão realmente sendo avaliados agora)
      const { data: processosEmAnalise, error: processosError } = await supabase
        .from("processos_fila")
        .select(`
          id,
          codigo_processo,
          numero_cnj,
          data_inicio_avaliacao,
          responsavel_avaliacao
        `)
        .eq("status_avaliacao", "EM_ANALISE")
        .not("responsavel_avaliacao", "is", null)
        .not("data_inicio_avaliacao", "is", null);

      if (processosError) {
        logger.error("Erro ao buscar processos em análise:", processosError);
      } else if (processosEmAnalise) {
        const emAndamento: AvaliacaoEmAndamento[] = processosEmAnalise.map((p) => ({
          avaliador_nome: p.responsavel_avaliacao ? newProfilesMap.get(p.responsavel_avaliacao) || "Desconhecido" : "Desconhecido",
          processo_codigo: p.codigo_processo,
          processo_cnj: p.numero_cnj,
          inicio: p.data_inicio_avaliacao || "",
        }));
        setAvaliacoesEmAndamento(emAndamento);
      }

      // Buscar estatísticas por avaliador (apenas processos concluídos)
      const { data: stats, error: statsError } = await supabase
        .from("processos_fila")
        .select(`
          status_avaliacao,
          responsavel_avaliacao
        `)
        .not("responsavel_avaliacao", "is", null)
        .in("status_avaliacao", ["CONCLUIDO", "EM_ANALISE"]);

      if (statsError) {
        logger.error("Erro ao buscar estatísticas:", statsError);
      } else if (stats) {
        const porAvaliador = new Map<string, EstatisticasAvaliador>();
        
        stats.forEach((s) => {
          const nome = s.responsavel_avaliacao ? newProfilesMap.get(s.responsavel_avaliacao) || "Desconhecido" : "Desconhecido";
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

      // Buscar dados de avaliações concluídas (GUARDA e ARQUIVOS)
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from("avaliacoes")
        .select(`
          processo_id,
          destinacao_permanente,
          pecas_ids
        `)
        .not("data_fim", "is", null);

      if (avaliacoesError) {
        logger.error("Erro ao buscar avaliações:", avaliacoesError);
      } else if (avaliacoes) {
        const map = new Map<string, AvaliacaoProcesso>();
        avaliacoes.forEach((av) => {
          map.set(av.processo_id, {
            processo_id: av.processo_id,
            destinacao_permanente: av.destinacao_permanente,
            pecas_ids: av.pecas_ids,
          });
        });
        setAvaliacoesMap(map);
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

      {/* Grid de Dados - Apenas processos concluídos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dados dos Processos Avaliados
              </CardTitle>
              <CardDescription>
                Processos com avaliação concluída ({processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length} de {processos.length})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDadosRealtime}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
                Atualizar
              </Button>
              <List className="h-4 w-4 text-muted-foreground" />
              <Select value={linhasExibidas} onValueChange={setLinhasExibidas}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Linhas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 linhas</SelectItem>
                  <SelectItem value="10">10 linhas</SelectItem>
                  <SelectItem value="25">25 linhas</SelectItem>
                  <SelectItem value="50">50 linhas</SelectItem>
                  <SelectItem value="100">100 linhas</SelectItem>
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            const processosConcluidos = processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO");
            
            if (processosConcluidos.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Nenhuma avaliação concluída ainda
                </div>
              );
            }
            
            return (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">CODIGO</TableHead>
                    <TableHead className="font-semibold">NUMERO_PROCESSO</TableHead>
                    <TableHead className="font-semibold">DATA_DISTRIBUICAO</TableHead>
                    <TableHead className="font-semibold">ANO</TableHead>
                    <TableHead className="font-semibold">DATA_ARQUIVAMENTO</TableHead>
                    <TableHead className="font-semibold">GUARDA</TableHead>
                    <TableHead className="font-semibold">ARQUIVOS</TableHead>
                    <TableHead className="font-semibold">RESPONSAVEL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const processosConcluidos = processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO");
                    const processosExibir = linhasExibidas === "all" 
                      ? processosConcluidos 
                      : processosConcluidos.slice(0, parseInt(linhasExibidas));
                    
                    return processosExibir.map((processo, idx) => {
                      // Extrair ano da data de distribuição
                      const extrairAno = (dataStr: string) => {
                        if (!dataStr) return "";
                        const partes = dataStr.split("/");
                        if (partes.length === 3) {
                          const ano = partes[2].split(" ")[0];
                          return ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
                        }
                        return "";
                      };

                      // Buscar dados da avaliação
                      const avaliacao = processo.ID ? avaliacoesMap.get(processo.ID) : null;
                      
                      // Converter destinacao_permanente para GUARDA (I = Integral/Permanente, P = Parcial)
                      const getGuarda = () => {
                        if (!avaliacao?.destinacao_permanente) return "—";
                        if (avaliacao.destinacao_permanente === "Sim") return "I";
                        if (avaliacao.destinacao_permanente === "Não") return "P";
                        return avaliacao.destinacao_permanente;
                      };

                      return (
                        <TableRow key={idx} className="text-sm">
                          <TableCell className="font-mono text-xs">
                            {processo.CODIGO_PROCESSO}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {processo.NUMERO_CNJ}
                          </TableCell>
                          <TableCell className="text-xs">
                            {processo.DATA_DISTRIBUICAO || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {extrairAno(processo.DATA_DISTRIBUICAO)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {processo.DATA_ARQUIVAMENTO_DEF || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {getGuarda()}
                          </TableCell>
                          <TableCell className="text-xs max-w-[150px] truncate" title={avaliacao?.pecas_ids || ""}>
                            {avaliacao?.pecas_ids || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            {processo.RESPONSAVEL ? (profilesMap.get(processo.RESPONSAVEL) || processo.RESPONSAVEL) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            </ScrollArea>
            );
          })()}
          {processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length > 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Exibindo {linhasExibidas === "all" 
                ? processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length 
                : Math.min(parseInt(linhasExibidas), processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length)
              } de {processos.filter(p => p.STATUS_AVALIACAO === "CONCLUIDO").length} processos concluídos
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
