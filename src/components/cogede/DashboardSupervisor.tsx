import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResizableDataGrid, ColumnDef } from "./ResizableDataGrid";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  RefreshCw,
  Filter,
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

interface LoteInfo {
  id: string;
  nome: string | null;
  created_at: string;
  total_processos: number;
  ativo: boolean;
}

interface DashboardSupervisorProps {
  processos: ProcessoFila[];
  loteId?: string;
}

interface ProcessoComDados extends ProcessoFila {
  guarda: string;
  arquivos: string;
  responsavelNome: string;
  ano: string;
}

type SortColumn =
  | "CODIGO"
  | "NUMERO_CNJ"
  | "DATA_DISTRIBUICAO"
  | "ANO"
  | "DATA_ARQUIVAMENTO"
  | "GUARDA"
  | "ARQUIVOS"
  | "RESPONSAVEL"
  | "DATA_FIM";

export function DashboardSupervisor({ processos: processosProps, loteId: loteIdProp }: DashboardSupervisorProps) {
  const [avaliacoesEmAndamento, setAvaliacoesEmAndamento] = useState<AvaliacaoEmAndamento[]>([]);
  const [estatisticasPorAvaliador, setEstatisticasPorAvaliador] = useState<EstatisticasAvaliador[]>([]);
  const [avaliacoesMap, setAvaliacoesMap] = useState<Map<string, AvaliacaoProcesso>>(new Map());
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [linhasExibidas, setLinhasExibidas] = useState<string>("10");
  const [sortColumn, setSortColumn] = useState<SortColumn>("DATA_FIM");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Novos estados para seletores
  const [lotes, setLotes] = useState<LoteInfo[]>([]);
  const [loteSelecionado, setLoteSelecionado] = useState<string | undefined>(loteIdProp);
  const [avaliadores, setAvaliadores] = useState<{ id: string; nome: string }[]>([]);
  const [avaliadorSelecionado, setAvaliadorSelecionado] = useState<string>("todos");
  const [processosDoLote, setProcessosDoLote] = useState<ProcessoFila[]>(processosProps);

  // Usar lote selecionado ou prop
  const loteId = loteSelecionado || loteIdProp;

  // Calcular totais baseado nos processos atuais e filtro de avaliador
  const processosFiltrados = useMemo(() => {
    if (avaliadorSelecionado === "todos") return processosDoLote;
    return processosDoLote.filter((p) => p.RESPONSAVEL === avaliadorSelecionado);
  }, [processosDoLote, avaliadorSelecionado]);

  const totalPendentes = processosFiltrados.filter((p) => p.STATUS_AVALIACAO === "PENDENTE").length;
  const totalEmAnalise = processosFiltrados.filter((p) => p.STATUS_AVALIACAO === "EM_ANALISE").length;
  const totalConcluidos = processosFiltrados.filter((p) => p.STATUS_AVALIACAO === "CONCLUIDO").length;
  const total = processosFiltrados.length;
  const progresso = total > 0 ? (totalConcluidos / total) * 100 : 0;

  // Buscar dados em tempo real
  const fetchDadosRealtime = useCallback(async () => {
    try {
      // Primeiro buscar todos os profiles para fazer o mapeamento
      const { data: allProfiles, error: profilesError } = await supabase.from("profiles").select("id, nome");

      const newProfilesMap = new Map<string, string>();
      if (!profilesError && allProfiles) {
        allProfiles.forEach((p) => {
          newProfilesMap.set(p.id, p.nome);
        });
        setProfilesMap(newProfilesMap);
      }

      // Buscar processos em análise (apenas os que estão realmente sendo avaliados agora)
      let queryEmAnalise = supabase
        .from("processos_fila")
        .select(
          `
          id,
          codigo_processo,
          numero_cnj,
          data_inicio_avaliacao,
          responsavel_avaliacao
        `,
        )
        .eq("status_avaliacao", "EM_ANALISE")
        .not("responsavel_avaliacao", "is", null)
        .not("data_inicio_avaliacao", "is", null);

      // Filtrar por lote se informado
      if (loteId) {
        queryEmAnalise = queryEmAnalise.eq("lote_id", loteId);
      }

      const { data: processosEmAnalise, error: processosError } = await queryEmAnalise;

      if (processosError) {
        logger.error("Erro ao buscar processos em análise:", processosError);
      } else if (processosEmAnalise) {
        const emAndamento: AvaliacaoEmAndamento[] = processosEmAnalise.map((p) => ({
          avaliador_nome: p.responsavel_avaliacao
            ? newProfilesMap.get(p.responsavel_avaliacao) || "Desconhecido"
            : "Desconhecido",
          processo_codigo: p.codigo_processo,
          processo_cnj: p.numero_cnj,
          inicio: p.data_inicio_avaliacao || "",
        }));
        setAvaliacoesEmAndamento(emAndamento);
      }

      // Buscar estatísticas por avaliador (apenas processos concluídos)
      let queryStats = supabase
        .from("processos_fila")
        .select(
          `
          status_avaliacao,
          responsavel_avaliacao
        `,
        )
        .not("responsavel_avaliacao", "is", null)
        .in("status_avaliacao", ["CONCLUIDO", "EM_ANALISE"]);

      // Filtrar por lote se informado
      if (loteId) {
        queryStats = queryStats.eq("lote_id", loteId);
      }

      const { data: stats, error: statsError } = await queryStats;

      if (statsError) {
        logger.error("Erro ao buscar estatísticas:", statsError);
      } else if (stats) {
        const porAvaliador = new Map<string, EstatisticasAvaliador>();

        stats.forEach((s) => {
          const nome = s.responsavel_avaliacao
            ? newProfilesMap.get(s.responsavel_avaliacao) || "Desconhecido"
            : "Desconhecido";
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
        .select(
          `
          processo_id,
          destinacao_permanente,
          pecas_ids
        `,
        )
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
  }, [loteId]);

  // Buscar todos os lotes disponíveis
  const fetchLotes = useCallback(async () => {
    const { data: lotesData, error } = await supabase
      .from("lotes_importacao")
      .select("id, nome, created_at, total_processos, ativo")
      .order("created_at", { ascending: false });

    if (!error && lotesData) {
      setLotes(lotesData);

      // Extrair avaliadores únicos dos profiles que avaliaram no lote
      const { data: profilesData } = await supabase.from("profiles").select("id, nome");

      if (profilesData) {
        setAvaliadores(profilesData);
      }
    }
  }, []);

  // Buscar processos do lote selecionado
  const fetchProcessosDoLote = useCallback(async () => {
    if (!loteId) {
      setProcessosDoLote(processosProps);
      return;
    }

    // Se é o lote da prop, usar os processos da prop
    if (loteId === loteIdProp) {
      setProcessosDoLote(processosProps);
      return;
    }

    // Senão, buscar do banco
    const { data: processosData, error } = await supabase.from("processos_fila").select("*").eq("lote_id", loteId);

    if (!error && processosData) {
      const processosFormatados: ProcessoFila[] = processosData.map((p) => ({
        ID: p.id,
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
      setProcessosDoLote(processosFormatados);
    }
  }, [loteId, loteIdProp, processosProps]);

  // Configurar realtime
  useEffect(() => {
    fetchDadosRealtime();
    fetchLotes();

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
          fetchProcessosDoLote();
        },
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
        },
      )
      .subscribe();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDadosRealtime, 10000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [loteId, fetchDadosRealtime, fetchLotes, fetchProcessosDoLote]);

  // Atualizar processos quando o lote selecionado mudar
  useEffect(() => {
    fetchProcessosDoLote();
  }, [fetchProcessosDoLote]);

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

  const extrairAno = (dataStr: string) => {
    if (!dataStr) return "";
    const partes = dataStr.split("/");
    if (partes.length === 3) {
      const ano = partes[2].split(" ")[0];
      return ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
    }
    return "";
  };

  const handleSort = (columnId: string) => {
    const column = columnId as SortColumn;
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Preparar dados para o grid
  const processosComDados = useMemo((): ProcessoComDados[] => {
    const processosConcluidos = processosFiltrados.filter((p) => p.STATUS_AVALIACAO === "CONCLUIDO");

    return processosConcluidos.map((processo) => {
      const avaliacao = processo.ID ? avaliacoesMap.get(processo.ID) : null;

      let guarda = "—";
      if (avaliacao?.destinacao_permanente) {
        if (avaliacao.destinacao_permanente === "Sim") guarda = "I";
        else if (avaliacao.destinacao_permanente === "Não") guarda = "P";
        else guarda = avaliacao.destinacao_permanente;
      }

      return {
        ...processo,
        guarda,
        arquivos: avaliacao?.pecas_ids || "—",
        responsavelNome: processo.RESPONSAVEL ? profilesMap.get(processo.RESPONSAVEL) || processo.RESPONSAVEL : "—",
        ano: extrairAno(processo.DATA_DISTRIBUICAO),
      };
    });
  }, [processosFiltrados, avaliacoesMap, profilesMap]);

  // Ordenar dados
  const processosOrdenados = useMemo(() => {
    const sorted = [...processosComDados].sort((a, b) => {
      let valorA: string | number = "";
      let valorB: string | number = "";

      switch (sortColumn) {
        case "CODIGO":
          valorA = a.CODIGO_PROCESSO || "";
          valorB = b.CODIGO_PROCESSO || "";
          break;
        case "NUMERO_CNJ":
          valorA = a.NUMERO_CNJ || "";
          valorB = b.NUMERO_CNJ || "";
          break;
        case "DATA_DISTRIBUICAO":
          valorA = a.DATA_DISTRIBUICAO || "";
          valorB = b.DATA_DISTRIBUICAO || "";
          break;
        case "ANO":
          valorA = a.ano || "";
          valorB = b.ano || "";
          break;
        case "DATA_ARQUIVAMENTO":
          valorA = a.DATA_ARQUIVAMENTO_DEF || "";
          valorB = b.DATA_ARQUIVAMENTO_DEF || "";
          break;
        case "GUARDA":
          valorA = a.guarda || "";
          valorB = b.guarda || "";
          break;
        case "ARQUIVOS":
          valorA = a.arquivos || "";
          valorB = b.arquivos || "";
          break;
        case "RESPONSAVEL":
          valorA = a.responsavelNome || "";
          valorB = b.responsavelNome || "";
          break;
        case "DATA_FIM":
          valorA = a.DATA_FIM || "";
          valorB = b.DATA_FIM || "";
          break;
      }

      let comparacao = 0;
      if (valorA < valorB) comparacao = -1;
      else if (valorA > valorB) comparacao = 1;

      return sortDirection === "asc" ? comparacao : -comparacao;
    });

    const limite = linhasExibidas === "all" ? sorted.length : parseInt(linhasExibidas);

    return sorted.slice(0, limite);
  }, [processosComDados, sortColumn, sortDirection, linhasExibidas]);

  // Definição das colunas do grid
  const columns: ColumnDef<ProcessoComDados>[] = useMemo(
    () => [
      {
        id: "CODIGO",
        header: "CODIGO",
        accessor: (row) => row.CODIGO_PROCESSO || "",
        defaultWidth: 120,
        minWidth: 80,
        render: (value) => <span className="font-mono">{String(value)}</span>,
      },
      {
        id: "NUMERO_CNJ",
        header: "NUMERO_PROCESSO",
        accessor: (row) => row.NUMERO_CNJ || "",
        defaultWidth: 200,
        minWidth: 120,
        render: (value) => <span className="font-mono">{String(value)}</span>,
      },
      {
        id: "DATA_DISTRIBUICAO",
        header: "DATA_DISTRIBUICAO",
        accessor: (row) => row.DATA_DISTRIBUICAO || "",
        defaultWidth: 150,
        minWidth: 100,
      },
      {
        id: "ANO",
        header: "ANO",
        accessor: (row) => row.ano || "",
        defaultWidth: 70,
        minWidth: 50,
      },
      {
        id: "DATA_ARQUIVAMENTO",
        header: "DATA_ARQUIVAMENTO",
        accessor: (row) => row.DATA_ARQUIVAMENTO_DEF || "",
        defaultWidth: 150,
        minWidth: 100,
      },
      {
        id: "GUARDA",
        header: "GUARDA",
        accessor: (row) => row.guarda || "",
        defaultWidth: 80,
        minWidth: 60,
      },
      {
        id: "ARQUIVOS",
        header: "ARQUIVOS",
        accessor: (row) => row.arquivos || "",
        defaultWidth: 150,
        minWidth: 80,
      },
      {
        id: "RESPONSAVEL",
        header: "RESPONSAVEL",
        accessor: (row) => row.responsavelNome || "",
        defaultWidth: 200,
        minWidth: 100,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Filtros: Seletor de Lote e Avaliador */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtros:</Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="lote-select" className="text-sm text-muted-foreground">
                Lote:
              </Label>
              <Select
                value={loteSelecionado || ""}
                onValueChange={(value) => {
                  setLoteSelecionado(value || undefined);
                  setAvaliadorSelecionado("todos");
                }}
              >
                <SelectTrigger id="lote-select" className="w-[280px]">
                  <SelectValue placeholder="Selecione um lote" />
                </SelectTrigger>
                <SelectContent>
                  {lotes.map((lote) => (
                    <SelectItem key={lote.id} value={lote.id}>
                      <div className="flex items-center gap-2">
                        {lote.ativo && (
                          <Badge variant="default" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                        <span>{lote.nome || `Lote ${new Date(lote.created_at).toLocaleDateString("pt-BR")}`}</span>
                        <span className="text-muted-foreground">({lote.total_processos} processos)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="avaliador-select" className="text-sm text-muted-foreground">
                Avaliador:
              </Label>
              <Select value={avaliadorSelecionado} onValueChange={setAvaliadorSelecionado}>
                <SelectTrigger id="avaliador-select" className="w-[200px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os avaliadores</SelectItem>
                  {avaliadores.map((av) => (
                    <SelectItem key={av.id} value={av.id}>
                      {av.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {avaliadorSelecionado !== "todos" && (
              <Button variant="ghost" size="sm" onClick={() => setAvaliadorSelecionado("todos")}>
                Limpar filtro
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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
            <p className="text-xs text-muted-foreground mt-1">{progresso.toFixed(1)}% concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalPendentes}</div>
            <p className="text-xs text-muted-foreground">aguardando avaliação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalEmAnalise}</div>
            <p className="text-xs text-muted-foreground">sendo avaliados agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalConcluidos}</div>
            <p className="text-xs text-muted-foreground">avaliações finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Avaliações em Tempo Real - Layout Horizontal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Avaliações em Andamento
            {avaliacoesEmAndamento.length > 0 && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                {avaliacoesEmAndamento.length} ativo(s)
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Acompanhamento em tempo real das avaliações</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
          ) : avaliacoesEmAndamento.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Nenhuma avaliação em andamento
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {avaliacoesEmAndamento.map((av, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-medium text-sm">{av.avaliador_nome}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-mono text-muted-foreground">{av.processo_codigo}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 
      ========================================================================
      TABELA DE PRODUTIVIDADE POR AVALIADOR - DESATIVADA TEMPORARIAMENTE
      Para reativar, descomente o bloco abaixo e remova esta seção comentada
      ========================================================================
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Produtividade por Avaliador
          </CardTitle>
          <CardDescription>Quantidade de processos avaliados por cada membro</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Carregando...</div>
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
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
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
      */}

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
                Processos com avaliação concluída ({processosComDados.length} de {processosFiltrados.length})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchDadosRealtime} disabled={loading}>
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
          {processosComDados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhuma avaliação concluída ainda
            </div>
          ) : (
            <>
              <ResizableDataGrid
                data={processosOrdenados}
                columns={columns}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                keyExtractor={(row, idx) => row.ID || String(idx)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo {processosOrdenados.length} de {processosComDados.length} processos concluídos
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
