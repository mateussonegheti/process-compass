import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, FileText, Loader2, History, Clock, CheckCircle2, AlertTriangle, Play } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/lib/logger";
import { ProcessoFila } from "@/types/cogede";

interface AvaliacaoComProcesso {
  id: string;
  processo_id: string;
  data_inicio: string;
  data_fim: string | null;
  codigo_processo: string;
  numero_cnj: string;
  destinacao_permanente: string | null;
  lote_nome?: string;
  status_avaliacao: string;
  tem_ocorrencia: boolean;
}

interface MinhasAvaliacoesProps {
  onEditarAvaliacao: (processo: ProcessoFila, avaliacaoAnterior?: Record<string, unknown>) => void;
  loteId?: string;
}

export function MinhasAvaliacoes({ onEditarAvaliacao, loteId }: MinhasAvaliacoesProps) {
  const { profile } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComProcesso[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchMinhasAvaliacoes = async () => {
      try {
        // Buscar avaliações do usuário atual
        const { data: avaliacoesData, error } = await supabase
          .from("avaliacoes")
          .select(`
            id,
            processo_id,
            data_inicio,
            data_fim,
            destinacao_permanente,
            documento_nao_localizado,
            documento_duplicado,
            erro_tecnico,
            processo_vazio
          `)
          .eq("avaliador_id", profile.id)
          .order("data_fim", { ascending: false });

        if (error) {
          logger.error("Erro ao buscar minhas avaliações:", error);
          return;
        }

        if (!avaliacoesData || avaliacoesData.length === 0) {
          setAvaliacoes([]);
          setLoading(false);
          return;
        }

        // Buscar dados dos processos com informações do lote
        const processoIds = avaliacoesData.map(a => a.processo_id);
        let query = supabase
          .from("processos_fila")
          .select("id, codigo_processo, numero_cnj, lote_id, status_avaliacao")
          .in("id", processoIds);
        
        // Filtrar por lote apenas se NÃO estiver mostrando todos
        if (!mostrarTodos && loteId) {
          query = query.eq("lote_id", loteId);
        }

        const { data: processosData, error: processosError } = await query;

        if (processosError) {
          logger.error("Erro ao buscar processos:", processosError);
          return;
        }

        // Buscar nomes dos lotes
        const loteIds = [...new Set(processosData?.map(p => p.lote_id) || [])];
        const { data: lotesData } = await supabase
          .from("lotes_importacao")
          .select("id, nome, created_at")
          .in("id", loteIds);
        
        const lotesMap = new Map(lotesData?.map(l => [l.id, l.nome || `Lote ${new Date(l.created_at).toLocaleDateString("pt-BR")}`]) || []);

        // Combinar dados
        const processosMap = new Map(processosData?.map(p => [p.id, p]) || []);
        
        const avaliacoesCompletas: AvaliacaoComProcesso[] = avaliacoesData
          .filter(av => processosMap.has(av.processo_id))
          .map(av => {
            const processo = processosMap.get(av.processo_id)!;
            const temOcorrencia = Boolean(
              av.documento_nao_localizado || 
              av.documento_duplicado || 
              av.erro_tecnico || 
              av.processo_vazio
            );
            return {
              id: av.id,
              processo_id: av.processo_id,
              data_inicio: av.data_inicio,
              data_fim: av.data_fim,
              codigo_processo: processo.codigo_processo,
              numero_cnj: processo.numero_cnj,
              destinacao_permanente: av.destinacao_permanente,
              lote_nome: lotesMap.get(processo.lote_id) || "—",
              status_avaliacao: processo.status_avaliacao,
              tem_ocorrencia: temOcorrencia,
            };
          });

        setAvaliacoes(avaliacoesCompletas);
      } catch (error) {
        logger.error("Erro ao buscar avaliações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMinhasAvaliacoes();

    // Subscrever a mudanças
    const channel = supabase
      .channel("minhas-avaliacoes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "avaliacoes",
        },
        () => {
          fetchMinhasAvaliacoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loteId, mostrarTodos]);

  const handleEditar = async (avaliacao: AvaliacaoComProcesso) => {
    // Buscar dados completos do processo
    const { data: processoCompleto, error } = await supabase
      .from("processos_fila")
      .select("*")
      .eq("id", avaliacao.processo_id)
      .maybeSingle();

    if (error || !processoCompleto) {
      logger.error("Erro ao buscar processo para edição:", error);
      return;
    }

    const processoFormatado: ProcessoFila = {
      ID: processoCompleto.id,
      CODIGO_PROCESSO: processoCompleto.codigo_processo,
      NUMERO_CNJ: processoCompleto.numero_cnj,
      POSSUI_ASSUNTO: processoCompleto.possui_assunto || "",
      ASSUNTO_PRINCIPAL: processoCompleto.assunto_principal || "",
      POSSUI_MOV_ARQUIVADO: processoCompleto.possui_mov_arquivado || "",
      DATA_DISTRIBUICAO: processoCompleto.data_distribuicao || "",
      DATA_ARQUIVAMENTO_DEF: processoCompleto.data_arquivamento_def || "",
      PRAZO_5_ANOS_COMPLETO: processoCompleto.prazo_5_anos_completo || "",
      STATUS_AVALIACAO: processoCompleto.status_avaliacao as "PENDENTE" | "EM_ANALISE" | "CONCLUIDO",
      RESPONSAVEL: processoCompleto.responsavel_avaliacao || undefined,
      DATA_INICIO_AVALIACAO: processoCompleto.data_inicio_avaliacao || undefined,
      DATA_FIM: processoCompleto.data_fim_avaliacao || undefined,
      // Campos de movimentos e peças
      MOV_CODIGOS: processoCompleto.mov_codigos || undefined,
      MOV_DESCRICOES: processoCompleto.mov_descricoes || undefined,
      MOV_COMPLEMENTOS: processoCompleto.mov_complementos || undefined,
      MOV_DATAS: processoCompleto.mov_datas || undefined,
      PECAS_IDS: processoCompleto.pecas_ids || undefined,
      PECAS_TIPOS: processoCompleto.pecas_tipos || undefined,
    };

    // Buscar dados da avaliação anterior
    const { data: avaliacaoAnterior, error: erroAvaliacao } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("id", avaliacao.id)
      .maybeSingle();

    if (erroAvaliacao) {
      logger.error("Erro ao buscar avaliação anterior:", erroAvaliacao);
      // Ainda assim passar o processo sem os dados da avaliação
      onEditarAvaliacao(processoFormatado, null);
      return;
    }

    // Passar processo e avaliação anterior
    onEditarAvaliacao(processoFormatado, avaliacaoAnterior);
  };

  const formatarData = (dataIso: string | null) => {
    if (!dataIso) return "—";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Carregando suas avaliações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Minhas Avaliações
              <Badge variant="secondary" className="ml-2">
                {avaliacoes.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {mostrarTodos 
                ? "Todas as suas avaliações de todos os lotes" 
                : "Processos que você avaliou neste lote"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="mostrar-todos" className="text-sm">Histórico completo</Label>
            <Switch
              id="mostrar-todos"
              checked={mostrarTodos}
              onCheckedChange={setMostrarTodos}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {avaliacoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>{mostrarTodos ? "Você ainda não avaliou nenhum processo." : "Você ainda não avaliou nenhum processo neste lote."}</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">Status</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Número CNJ</TableHead>
                  {mostrarTodos && <TableHead>Lote</TableHead>}
                  <TableHead>Guarda</TableHead>
                  <TableHead>Avaliado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map((av) => (
                  <TableRow key={av.id}>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {av.tem_ocorrencia ? (
                            <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                          ) : av.status_avaliacao === "CONCLUIDO" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 cursor-help" />
                          ) : av.status_avaliacao === "EM_ANALISE" ? (
                            <Play className="h-4 w-4 text-blue-500 cursor-help" />
                          ) : (
                            <Clock className="h-4 w-4 text-muted-foreground cursor-help" />
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {av.tem_ocorrencia 
                            ? "Processo com ocorrência" 
                            : av.status_avaliacao === "CONCLUIDO" 
                              ? "Concluído" 
                              : av.status_avaliacao === "EM_ANALISE" 
                                ? "Em análise" 
                                : "Pendente"}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="font-mono">{av.codigo_processo}</TableCell>
                    <TableCell className="font-mono">{av.numero_cnj}</TableCell>
                    {mostrarTodos && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {av.lote_nome}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant={av.destinacao_permanente === "Sim" ? "default" : "secondary"}>
                        {av.destinacao_permanente === "Sim" ? "I (Permanente)" : av.destinacao_permanente === "Não" ? "P (Parcial)" : "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatarData(av.data_fim)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditar(av)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
