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
  { id: "dc-1", codigo: "0001111000001", numeroCnj: "00011112220178080001", dataDistribuicao: "10/03/2017", ano: "2017", dataArquivamento: "20/02/2019", guarda: "P", arquivos: "FIC-001 | FIC-002 | FIC-003", responsavel: "Maria Silva" },
  { id: "dc-2", codigo: "0002222000002", numeroCnj: "00022223330178080002", dataDistribuicao: "15/06/2017", ano: "2017", dataArquivamento: "19/12/2018", guarda: "P", arquivos: "FIC-004 | FIC-005 | FIC-006", responsavel: "Maria Silva" },
  { id: "dc-3", codigo: "0003333000003", numeroCnj: "00033334440168080003", dataDistribuicao: "22/01/2016", ano: "2016", dataArquivamento: "05/10/2020", guarda: "P", arquivos: "FIC-007 | FIC-008 | FIC-009", responsavel: "Maria Silva" },
  { id: "dc-4", codigo: "0004444000004", numeroCnj: "00044445550188080004", dataDistribuicao: "08/09/2018", ano: "2018", dataArquivamento: "15/01/2021", guarda: "P", arquivos: "FIC-010 | FIC-011 | FIC-012", responsavel: "Maria Silva" },
  { id: "dc-5", codigo: "0005555000005", numeroCnj: "00055556660158080005", dataDistribuicao: "03/04/2015", ano: "2015", dataArquivamento: "09/06/2019", guarda: "P", arquivos: "FIC-013 | FIC-014 | FIC-015", responsavel: "João Santos" },
  { id: "dc-6", codigo: "0006666000006", numeroCnj: "00066667770178080006", dataDistribuicao: "18/11/2017", ano: "2017", dataArquivamento: "15/12/2020", guarda: "P", arquivos: "FIC-016 | FIC-017 | FIC-018", responsavel: "Maria Silva" },
  { id: "dc-7", codigo: "0007777000007", numeroCnj: "00077778880168080007", dataDistribuicao: "27/07/2016", ano: "2016", dataArquivamento: "29/08/2022", guarda: "P", arquivos: "FIC-019 | FIC-020 | FIC-021", responsavel: "João Santos" },
  { id: "dc-8", codigo: "0008888000008", numeroCnj: "00088889990188080008", dataDistribuicao: "14/02/2018", ano: "2018", dataArquivamento: "12/03/2021", guarda: "I", arquivos: "FIC-022 | FIC-023", responsavel: "Maria Silva" },
  { id: "dc-9", codigo: "0009999000009", numeroCnj: "00099990010158080009", dataDistribuicao: "30/05/2015", ano: "2015", dataArquivamento: "22/07/2020", guarda: "P", arquivos: "FIC-024 | FIC-025 | FIC-026", responsavel: "João Santos" },
  { id: "dc-10", codigo: "0010101000010", numeroCnj: "00101012220178080010", dataDistribuicao: "06/08/2017", ano: "2017", dataArquivamento: "03/04/2019", guarda: "P", arquivos: "FIC-027 | FIC-028 | FIC-029", responsavel: "Maria Silva" },
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
