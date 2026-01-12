import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText, Loader2 } from "lucide-react";
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
}

interface MinhasAvaliacoesProps {
  onEditarAvaliacao: (processo: ProcessoFila) => void;
  loteId?: string;
}

export function MinhasAvaliacoes({ onEditarAvaliacao, loteId }: MinhasAvaliacoesProps) {
  const { profile } = useAuth();
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoComProcesso[]>([]);
  const [loading, setLoading] = useState(true);

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
            destinacao_permanente
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

        // Buscar dados dos processos
        const processoIds = avaliacoesData.map(a => a.processo_id);
        let query = supabase
          .from("processos_fila")
          .select("id, codigo_processo, numero_cnj")
          .in("id", processoIds);
        
        if (loteId) {
          query = query.eq("lote_id", loteId);
        }

        const { data: processosData, error: processosError } = await query;

        if (processosError) {
          logger.error("Erro ao buscar processos:", processosError);
          return;
        }

        // Combinar dados
        const processosMap = new Map(processosData?.map(p => [p.id, p]) || []);
        
        const avaliacoesCompletas: AvaliacaoComProcesso[] = avaliacoesData
          .filter(av => processosMap.has(av.processo_id))
          .map(av => {
            const processo = processosMap.get(av.processo_id)!;
            return {
              id: av.id,
              processo_id: av.processo_id,
              data_inicio: av.data_inicio,
              data_fim: av.data_fim,
              codigo_processo: processo.codigo_processo,
              numero_cnj: processo.numero_cnj,
              destinacao_permanente: av.destinacao_permanente,
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
  }, [profile?.id, loteId]);

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
    };

    onEditarAvaliacao(processoFormatado);
  };

  const formatarData = (dataIso: string | null) => {
    if (!dataIso) return "—";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Minhas Avaliações
          <Badge variant="secondary" className="ml-2">
            {avaliacoes.length}
          </Badge>
        </CardTitle>
        <CardDescription>
          Processos que você avaliou neste lote. Clique em "Editar" para corrigir alguma avaliação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {avaliacoes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Você ainda não avaliou nenhum processo neste lote.</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Número CNJ</TableHead>
                  <TableHead>Guarda</TableHead>
                  <TableHead>Avaliado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.map((av) => (
                  <TableRow key={av.id}>
                    <TableCell className="font-mono">{av.codigo_processo}</TableCell>
                    <TableCell className="font-mono">{av.numero_cnj}</TableCell>
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
