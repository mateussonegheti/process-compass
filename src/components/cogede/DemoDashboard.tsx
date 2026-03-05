import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ResizableDataGrid, ColumnDef } from "./ResizableDataGrid";
import {
  Activity,
  FileCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  List,
  RefreshCw,
  Filter,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DemoProcessoConcluido {
  id: string;
  codigo: string;
  numeroCnj: string;
  dataDistribuicao: string;
  ano: string;
  dataArquivamento: string;
  guarda: string;
  arquivos: string;
  responsavel: string;
}

interface DemoAvaliadorAtivo {
  nome: string;
  processoCodigo: string;
  loteNome: string;
}

interface DemoDashboardProps {
  totalProcessos: number;
  pendentes: number;
  emAnalise: number;
  concluidos: number;
  avaliadoresAtivos: DemoAvaliadorAtivo[];
  processosConcluidos: DemoProcessoConcluido[];
}

const DEMO_PROCESSOS_CONCLUIDOS: DemoProcessoConcluido[] = [
  { id: "dc-1", codigo: "2420089160220", numeroCnj: "99160226520088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "20/02/2009", guarda: "P", arquivos: "355162 | 518845 | 518472", responsavel: "Maria Silva" },
  { id: "dc-2", codigo: "2420089160386", numeroCnj: "99160381920088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "19/12/2008", guarda: "P", arquivos: "355438 | 501523 | 506106", responsavel: "Maria Silva" },
  { id: "dc-3", codigo: "2420089160238", numeroCnj: "99160235020088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "05/10/2010", guarda: "P", arquivos: "355163 | 3203862 | 321...", responsavel: "Maria Silva" },
  { id: "dc-4", codigo: "2420089160246", numeroCnj: "99160243520088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "15/01/2009", guarda: "P", arquivos: "355175 | 464951 | 464361", responsavel: "Maria Silva" },
  { id: "dc-5", codigo: "2420089160428", numeroCnj: "99160425620088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "09/06/2009", guarda: "P", arquivos: "355529 | 438719 | 437599", responsavel: "João Santos" },
  { id: "dc-6", codigo: "2420089161186", numeroCnj: "99161188020088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "15/12/2009", guarda: "P", arquivos: "356516 | 492941 | 1025...", responsavel: "Maria Silva" },
  { id: "dc-7", codigo: "2420089160469", numeroCnj: "99160469320088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "29/08/2014", guarda: "P", arquivos: "355596 | 424755 | 4767...", responsavel: "João Santos" },
  { id: "dc-8", codigo: "2420089160352", numeroCnj: "99160352820088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "12/03/2010", guarda: "I", arquivos: "355412 | 489231", responsavel: "Maria Silva" },
  { id: "dc-9", codigo: "2420089160501", numeroCnj: "99160501220088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "22/07/2011", guarda: "P", arquivos: "355628 | 612843 | 612901", responsavel: "João Santos" },
  { id: "dc-10", codigo: "2420089160295", numeroCnj: "99160295620088130024", dataDistribuicao: "30/10/2008", ano: "2008", dataArquivamento: "03/04/2009", guarda: "P", arquivos: "355301 | 445872 | 445910", responsavel: "Maria Silva" },
];

type SortColumn = "CODIGO" | "NUMERO_CNJ" | "DATA_DISTRIBUICAO" | "ANO" | "DATA_ARQUIVAMENTO" | "GUARDA" | "ARQUIVOS" | "RESPONSAVEL";

export function DemoDashboard({
  totalProcessos,
  pendentes,
  emAnalise,
  concluidos,
  avaliadoresAtivos,
  processosConcluidos: externalConcluidos,
}: DemoDashboardProps) {
  const [linhasExibidas, setLinhasExibidas] = useState("10");
  const [sortColumn, setSortColumn] = useState<SortColumn>("CODIGO");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [avaliadorSelecionado, setAvaliadorSelecionado] = useState("todos");

  const progresso = totalProcessos > 0 ? (concluidos / totalProcessos) * 100 : 0;

  // Merge external + built-in demo data
  const allConcluidos = useMemo(() => {
    const fromExternal: DemoProcessoConcluido[] = externalConcluidos.map((p, i) => ({
      id: `ext-${i}`,
      codigo: p.codigo,
      numeroCnj: p.numeroCnj,
      dataDistribuicao: p.dataDistribuicao,
      ano: p.ano,
      dataArquivamento: p.dataArquivamento,
      guarda: p.guarda,
      arquivos: p.arquivos,
      responsavel: p.responsavel,
    }));
    return [...fromExternal, ...DEMO_PROCESSOS_CONCLUIDOS];
  }, [externalConcluidos]);

  const processosFiltrados = useMemo(() => {
    if (avaliadorSelecionado === "todos") return allConcluidos;
    return allConcluidos.filter(p => p.responsavel === avaliadorSelecionado);
  }, [allConcluidos, avaliadorSelecionado]);

  const handleSort = (columnId: string) => {
    const col = columnId as SortColumn;
    if (sortColumn === col) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  };

  const processosOrdenados = useMemo(() => {
    const sorted = [...processosFiltrados].sort((a, b) => {
      let vA = "", vB = "";
      switch (sortColumn) {
        case "CODIGO": vA = a.codigo; vB = b.codigo; break;
        case "NUMERO_CNJ": vA = a.numeroCnj; vB = b.numeroCnj; break;
        case "DATA_DISTRIBUICAO": vA = a.dataDistribuicao; vB = b.dataDistribuicao; break;
        case "ANO": vA = a.ano; vB = b.ano; break;
        case "DATA_ARQUIVAMENTO": vA = a.dataArquivamento; vB = b.dataArquivamento; break;
        case "GUARDA": vA = a.guarda; vB = b.guarda; break;
        case "ARQUIVOS": vA = a.arquivos; vB = b.arquivos; break;
        case "RESPONSAVEL": vA = a.responsavel; vB = b.responsavel; break;
      }
      const cmp = vA < vB ? -1 : vA > vB ? 1 : 0;
      return sortDirection === "asc" ? cmp : -cmp;
    });
    const limite = linhasExibidas === "all" ? sorted.length : parseInt(linhasExibidas);
    return sorted.slice(0, limite);
  }, [processosFiltrados, sortColumn, sortDirection, linhasExibidas]);

  const columns: ColumnDef<DemoProcessoConcluido>[] = useMemo(() => [
    { id: "CODIGO", header: "CODIGO", accessor: r => r.codigo, defaultWidth: 120, minWidth: 80, render: v => <span className="font-mono">{String(v)}</span> },
    { id: "NUMERO_CNJ", header: "NUMERO_PROCESSO", accessor: r => r.numeroCnj, defaultWidth: 200, minWidth: 120, render: v => <span className="font-mono">{String(v)}</span> },
    { id: "DATA_DISTRIBUICAO", header: "DATA_DISTRIBUICAO", accessor: r => r.dataDistribuicao, defaultWidth: 150, minWidth: 100 },
    { id: "ANO", header: "ANO", accessor: r => r.ano, defaultWidth: 70, minWidth: 50 },
    { id: "DATA_ARQUIVAMENTO", header: "DATA_ARQUIVAMENTO", accessor: r => r.dataArquivamento, defaultWidth: 150, minWidth: 100 },
    { id: "GUARDA", header: "GUARDA", accessor: r => r.guarda, defaultWidth: 80, minWidth: 60 },
    { id: "ARQUIVOS", header: "ARQUIVOS", accessor: r => r.arquivos, defaultWidth: 150, minWidth: 80 },
    { id: "RESPONSAVEL", header: "RESPONSAVEL", accessor: r => r.responsavel, defaultWidth: 200, minWidth: 100 },
  ], []);

  const avaliadores = useMemo(() => {
    const names = new Set(allConcluidos.map(p => p.responsavel));
    return Array.from(names);
  }, [allConcluidos]);

  const handleLiberar = (nome: string) => {
    toast.info(`Modo demonstração: processo de ${nome} seria liberado no sistema real.`);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtros:</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Lote:</Label>
              <Badge variant="default" className="text-xs">Ativo</Badge>
              <span className="text-sm">Importação 27/02/2026</span>
              <span className="text-sm text-muted-foreground">({totalProcessos} processos)</span>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Avaliador:</Label>
              <Select value={avaliadorSelecionado} onValueChange={setAvaliadorSelecionado}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os avaliadores</SelectItem>
                  {avaliadores.map(av => (
                    <SelectItem key={av} value={av}>{av}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
            <div className="text-2xl font-bold">{totalProcessos}</div>
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
            <div className="text-2xl font-bold text-amber-600">{pendentes}</div>
            <p className="text-xs text-muted-foreground">aguardando avaliação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{emAnalise}</div>
            <p className="text-xs text-muted-foreground">sendo avaliados agora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{concluidos}</div>
            <p className="text-xs text-muted-foreground">avaliações finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Avaliações em Andamento */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Avaliações em Andamento
            {avaliadoresAtivos.length > 0 && (
              <Badge variant="secondary" className="ml-2 animate-pulse">
                {avaliadoresAtivos.length} ativo(s)
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Acompanhamento em tempo real das avaliações</CardDescription>
        </CardHeader>
        <CardContent>
          {avaliadoresAtivos.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
              Nenhuma avaliação em andamento
            </div>
          ) : (
            <div className="space-y-2">
              {avaliadoresAtivos.map((av, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{av.nome}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs font-mono text-muted-foreground">{av.processoCodigo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{av.loteNome}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLiberar(av.nome)}
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Unlock className="h-4 w-4 mr-1" />
                    Liberar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Dados */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Dados dos Processos Avaliados
              </CardTitle>
              <CardDescription>
                Processos com avaliação concluída ({processosFiltrados.length} de {totalProcessos})
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Modo demonstração: dados já atualizados.")}>
                <RefreshCw className="h-4 w-4 mr-1" />
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
                  <SelectItem value="all">Todas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {processosFiltrados.length === 0 ? (
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
                keyExtractor={(row, idx) => row.id || String(idx)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Exibindo {processosOrdenados.length} de {processosFiltrados.length} processos concluídos
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
