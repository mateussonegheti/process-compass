import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, LayoutDashboard, ClipboardList, LogOut, FileSearch,
  Loader2, User, CheckCircle2, Clock, Activity, Users, AlertTriangle,
  Eye,
} from "lucide-react";
import sinvalIcon from "@/assets/sinval-icon.png";
import { FormularioAvaliacao } from "@/components/cogede/FormularioAvaliacao";
import { ProcessoFila, AvaliacaoDocumental, SessaoAvaliacao } from "@/types/cogede";
import { toast } from "sonner";
import {
  DEMO_PROCESSOS,
  DEMO_AVALIACOES_CONCLUIDAS,
  DEMO_STATS,
  DEMO_PROFILE,
  DEMO_TEMPORALIDADE,
  DEMO_HIERARQUIA,
} from "@/data/demoData";
import { extrairCodigoAssunto } from "@/lib/temporalidadeParser";

export default function Demo() {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState<ProcessoFila[]>([...DEMO_PROCESSOS]);
  const [avaliacoesConcluidas, setAvaliacoesConcluidas] = useState(DEMO_AVALIACOES_CONCLUIDAS);
  const [sessao, setSessao] = useState<SessaoAvaliacao>({
    responsavel: DEMO_PROFILE.nome,
    processoAtual: undefined,
    iniciada: true,
  });
  const [carregando, setCarregando] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState("avaliacao");
  const [stats, setStats] = useState(DEMO_STATS);

  const pendentes = processos.filter((p) => p.STATUS_AVALIACAO === "PENDENTE");
  const emAnalise = processos.filter((p) => p.STATUS_AVALIACAO === "EM_ANALISE");
  const concluidos = processos.filter((p) => p.STATUS_AVALIACAO === "CONCLUIDO");

  const handleIniciarAvaliacao = useCallback(() => {
    const proximo = processos.find((p) => p.STATUS_AVALIACAO === "PENDENTE");
    if (!proximo) {
      toast.info("Não há mais processos pendentes na fila");
      return;
    }

    setCarregando(true);
    // Simular latência
    setTimeout(() => {
      const updated = processos.map((p) =>
        p.ID === proximo.ID
          ? { ...p, STATUS_AVALIACAO: "EM_ANALISE" as const, DATA_INICIO_AVALIACAO: new Date().toISOString() }
          : p
      );
      setProcessos(updated);
      setSessao((prev) => ({ ...prev, processoAtual: { ...proximo, STATUS_AVALIACAO: "EM_ANALISE" } }));
      toast.success(`Processo ${proximo.CODIGO_PROCESSO} capturado para avaliação`);
      setCarregando(false);
    }, 800);
  }, [processos]);

  const handleSalvarEProximo = useCallback(
    (avaliacao: AvaliacaoDocumental) => {
      setCarregando(true);

      setTimeout(() => {
        const processoAtual = sessao.processoAtual;
        if (!processoAtual) return;

        // Marcar como concluído
        const updated = processos.map((p) =>
          p.ID === processoAtual.ID
            ? { ...p, STATUS_AVALIACAO: "CONCLUIDO" as const, DATA_FIM: new Date().toISOString() }
            : p
        );

        // Adicionar à lista de avaliações concluídas
        setAvaliacoesConcluidas((prev) => [
          {
            id: `demo-aval-${Date.now()}`,
            processo_id: processoAtual.ID || "",
            codigo_processo: processoAtual.CODIGO_PROCESSO,
            numero_cnj: processoAtual.NUMERO_CNJ,
            data_inicio: processoAtual.DATA_INICIO_AVALIACAO || new Date().toISOString(),
            data_fim: new Date().toISOString(),
            destinacao_permanente: avaliacao.destinacaoPermanente || "Não informada",
            status_avaliacao: "CONCLUIDO",
            tem_ocorrencia: !!(avaliacao.documentoNaoLocalizado || avaliacao.documentoDuplicado || avaliacao.erroTecnico),
          },
          ...prev,
        ]);

        // Atualizar stats
        setStats((prev) => ({
          ...prev,
          concluidos: prev.concluidos + 1,
          pendentes: prev.pendentes - 1,
        }));

        // Buscar próximo
        const proximo = updated.find((p) => p.STATUS_AVALIACAO === "PENDENTE");
        if (proximo) {
          const updatedWithNext = updated.map((p) =>
            p.ID === proximo.ID
              ? { ...p, STATUS_AVALIACAO: "EM_ANALISE" as const, DATA_INICIO_AVALIACAO: new Date().toISOString() }
              : p
          );
          setProcessos(updatedWithNext);
          setSessao((prev) => ({ ...prev, processoAtual: { ...proximo, STATUS_AVALIACAO: "EM_ANALISE" } }));
          toast.success("Avaliação salva! Próximo processo carregado.");
        } else {
          setProcessos(updated);
          setSessao((prev) => ({ ...prev, processoAtual: undefined }));
          toast.success("Avaliação salva! Todos os processos foram avaliados.");
        }
        setCarregando(false);
      }, 600);
    },
    [sessao.processoAtual, processos]
  );

  const handleFinalizarAvaliacao = useCallback(() => {
    if (!sessao.processoAtual) return;
    setCarregando(true);
    setTimeout(() => {
      // Voltar para pendente
      setProcessos((prev) =>
        prev.map((p) =>
          p.ID === sessao.processoAtual?.ID
            ? { ...p, STATUS_AVALIACAO: "PENDENTE" as const, DATA_INICIO_AVALIACAO: undefined }
            : p
        )
      );
      setSessao((prev) => ({ ...prev, processoAtual: undefined }));
      toast.info("Avaliação finalizada. Processo devolvido à fila.");
      setCarregando(false);
    }, 400);
  }, [sessao.processoAtual]);

  const progressPercent = stats.totalProcessos > 0 ? (stats.concluidos / stats.totalProcessos) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-4 bg-[#10473d]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/inicio")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img alt="SINVAL" className="h-10 w-10 border-0 shadow-none" src={sinvalIcon} />
              <div className="text-left">
                <h1 className="text-2xl font-bold tracking-tight">SINVAL</h1>
                <p className="text-sm text-primary-foreground/80">Sistema Integrado de Avaliação</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500 text-white border-amber-400 animate-pulse">
                <Eye className="h-3 w-3 mr-1" />
                MODO DEMONSTRAÇÃO
              </Badge>
              <Badge variant="secondary" className="hidden sm:flex bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                Avaliador
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/inicio")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="container mx-auto flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Modo demonstração:</strong> Os dados exibidos são fictícios. Suas ações não afetam o sistema real.
            Explore livremente todas as funcionalidades!
          </span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="avaliacao" className="gap-2">
              <FileText className="h-4 w-4" />
              Avaliação
            </TabsTrigger>
            <TabsTrigger value="minhas-avaliacoes" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Minhas Avaliações
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* ===== ABA AVALIAÇÃO ===== */}
          <TabsContent value="avaliacao" className="space-y-6">
            {/* Sessão Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Sessão Ativa</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4" />
                      {sessao.responsavel}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {pendentes.length} pendentes
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {emAnalise.length} em análise
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {concluidos.length + avaliacoesConcluidas.length - DEMO_AVALIACOES_CONCLUIDAS.length} concluídos
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!sessao.processoAtual ? (
                  <Button
                    type="button"
                    onClick={handleIniciarAvaliacao}
                    disabled={carregando || pendentes.length === 0}
                    className="w-full"
                    size="lg"
                  >
                    {carregando ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <FileSearch className="h-5 w-5 mr-2" />
                    )}
                    {carregando ? "Buscando processo..." : "Iniciar Avaliação"}
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileSearch className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Avaliando processo</p>
                      <p className="text-sm text-muted-foreground">{sessao.processoAtual.CODIGO_PROCESSO}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Formulário de Avaliação */}
            {sessao.processoAtual && (
              <FormularioAvaliacao
                processo={sessao.processoAtual}
                responsavel={sessao.responsavel}
                onSalvarEProximo={handleSalvarEProximo}
                onFinalizarAvaliacao={handleFinalizarAvaliacao}
                carregando={carregando}
                modoDemonstracao
              />
            )}
          </TabsContent>

          {/* ===== ABA MINHAS AVALIAÇÕES ===== */}
          <TabsContent value="minhas-avaliacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Minhas Avaliações
                </CardTitle>
                <CardDescription>
                  Avaliações realizadas nesta sessão de demonstração
                </CardDescription>
              </CardHeader>
              <CardContent>
                {avaliacoesConcluidas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Nenhuma avaliação realizada ainda.</p>
                    <p className="text-sm">Inicie uma avaliação na aba "Avaliação".</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Processo</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead>Fim</TableHead>
                        <TableHead>Destinação</TableHead>
                        <TableHead>Ocorrência</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {avaliacoesConcluidas.map((av) => (
                        <TableRow key={av.id}>
                          <TableCell className="font-mono text-sm">{av.codigo_processo}</TableCell>
                          <TableCell className="text-sm">
                            {new Date(av.data_inicio).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {av.data_fim
                              ? new Date(av.data_fim).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={av.destinacao_permanente === "Guarda Permanente" ? "default" : "secondary"}>
                              {av.destinacao_permanente || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {av.tem_ocorrencia ? (
                              <Badge variant="destructive" className="text-xs">Sim</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Não</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ABA DASHBOARD ===== */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Progresso Geral */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Activity className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalProcessos}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Clock className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pendentes.length}</p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.concluidos}</p>
                      <p className="text-sm text-muted-foreground">Concluídos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Clock className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.tempoMedio}</p>
                      <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progresso */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso do Lote</CardTitle>
                <CardDescription>Lote Demonstração - 1ª Vara Cível</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={progressPercent} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {stats.concluidos} de {stats.totalProcessos} processos avaliados ({progressPercent.toFixed(0)}%)
                </p>
              </CardContent>
            </Card>

            {/* Avaliadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" />
                  Desempenho por Avaliador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Avaliador</TableHead>
                      <TableHead className="text-center">Concluídos</TableHead>
                      <TableHead className="text-center">Em Análise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.avaliadores.map((av) => (
                      <TableRow key={av.nome}>
                        <TableCell className="font-medium">{av.nome}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {av.concluidos}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {av.em_analise}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell className="font-medium">{DEMO_PROFILE.nome} (você)</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {avaliacoesConcluidas.length - DEMO_AVALIACOES_CONCLUIDAS.length}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {emAnalise.length}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
