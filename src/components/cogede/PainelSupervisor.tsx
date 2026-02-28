import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet, Settings, Eye, EyeOff, ShieldAlert, Loader2, Database, FolderOpen, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProcessoFila } from "@/types/cogede";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";
import { validateCSVFile, validateRowCount, sanitizeCellValue, hasSuspiciousContent, MAX_ROW_COUNT } from "@/lib/csvValidation";
import { supabase } from "@/integrations/supabase/client";
import { useTemporalidade } from "@/hooks/useTemporalidade";
import { useHierarchyUpload } from "@/hooks/useHierarchyUpload";
import { DEFAULT_COLOR_MAPPINGS } from "@/lib/hierarchyParser";
import { HierarchyTreeView } from "@/components/cogede/HierarchyTreeView";

interface AvaliacaoConsolidada {
  // Dados do processo
  codigoProcesso: string;
  numeroCnj: string;
  dataDistribuicao: string;
  dataArquivamentoDef: string;
  possuiAssunto: string;
  assuntoPrincipal: string;
  possuiMovArquivado: string;
  prazo5AnosCompleto: string;
  // Dados da avaliação
  responsavel: string;
  descricaoAssuntoFaltante?: string;
  assuntoTpu?: string;
  hierarquiaCorreta?: string;
  divergenciaHierarquia?: string;
  destinacaoPermanente?: string;
  descricaoSituacaoArquivamento?: string;
  inconsistenciaPrazo?: string;
  pecasTipos?: string;
  pecasIds?: string;
  pecasCombinado?: string;
  observacoesPecas?: string;
  documentoNaoLocalizado?: boolean;
  documentoDuplicado?: boolean;
  erroTecnico?: boolean;
  ocorrenciasOutroDetalhe?: string;
  divergenciaClassificacao?: string;
  divergenciasDetalhes?: string;
  processoVazio?: boolean;
  observacoesGerais?: string;
  dataInicioAvaliacao?: string;
  dataFimAvaliacao?: string;
}

interface PainelSupervisorProps {
  onProcessosCarregados: (processos: ProcessoFila[]) => void;
  onLoteAtivado?: () => void;
  processosCount: number;
  uploading?: boolean;
  podeCarregarPlanilha?: boolean;
  loteId?: string;
}

// Formatar data para dd/mm/aaaa
const formatarData = (dataStr: string): string => {
  if (!dataStr) return "";
  const dataParte = dataStr.split(" ")[0];
  const partes = dataParte.split("/");
  if (partes.length === 3) {
    const [dia, mes, ano] = partes;
    const anoCompleto = ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
    return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anoCompleto}`;
  }
  return dataParte;
};

// Extrair ano de uma data no formato dd/mm/aaaa ou dd/mm/aa
const extrairAno = (dataStr: string): string => {
  if (!dataStr) return "";
  const dataParte = dataStr.split(" ")[0];
  const partes = dataParte.split("/");
  if (partes.length === 3) {
    const ano = partes[2];
    return ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
  }
  return "";
};

// Mapeamento das colunas do formulário para exportação (aba AVALIAÇÃO_DOCUMENTAL)
const COLUNAS_EXPORTACAO = [
  // Colunas para sistema de preservação digital
  { key: "codigoProcesso", label: "CODIGO", grupo: "Preservação Digital" },
  { key: "numeroCnj", label: "NUMERO_PROCESSO", grupo: "Preservação Digital" },
  { key: "dataDistribuicao", label: "DATA_DISTRIBUICAO", grupo: "Preservação Digital" },
  { key: "anoDistribuicao", label: "ANO", grupo: "Preservação Digital" },
  { key: "dataArquivamentoDef", label: "DATA_ARQUIVAMENTO", grupo: "Preservação Digital" },
  { key: "destinacaoPermanente", label: "GUARDA", grupo: "Preservação Digital" },
  { key: "pecasIds", label: "ARQUIVOS", grupo: "Preservação Digital" },
  // Colunas de controle
  { key: "responsavel", label: "RESPONSAVEL", grupo: "Controle" },
  { key: "possuiAssunto", label: "ASSUNTO_CADASTRADO_PROJUDI", grupo: "Assunto/TPU" },
  { key: "descricaoAssuntoFaltante", label: "REPORTAR_AUSENCIA_ASSUNTO", grupo: "Assunto/TPU" },
  { key: "assuntoPrincipal", label: "ASSUNTO_PRINCIPAL_PROJUDI", grupo: "Assunto/TPU" },
  { key: "assuntoTpu", label: "INSTR_ASSUNTO_PROJUDI", grupo: "Assunto/TPU" },
  { key: "hierarquiaCorreta", label: "HIERARQUIA_CONFERE_TPU", grupo: "Assunto/TPU" },
  { key: "divergenciaHierarquia", label: "DIVERGENCIA_HIERARQUIA", grupo: "Assunto/TPU" },
  { key: "possuiMovArquivado", label: "MOV_PROCESSO_ARQUIVADO", grupo: "Movimentações" },
  { key: "descricaoSituacaoArquivamento", label: "SITUACAO_ATUAL_PROCESSO", grupo: "Movimentações" },
  { key: "prazo5AnosCompleto", label: "PRAZO_5_ANOS_COMPLETO", grupo: "Movimentações" },
  { key: "inconsistenciaPrazo", label: "REPORTAR_INCONSISTENCIA_PRAZO", grupo: "Movimentações" },
  { key: "pecasTipos", label: "PECAS_TIPOS", grupo: "Peças" },
  { key: "pecasCombinado", label: "PECAS_TIPO_ID", grupo: "Peças" },
  { key: "observacoesPecas", label: "OBSERVACOES_PECAS", grupo: "Peças" },
  { key: "ocorrenciasPecas", label: "OCORRENCIAS_PECAS", grupo: "Ocorrências" },
  { key: "ocorrenciasOutroDetalhe", label: "OCORRENCIAS_OUTRO_DETALHE", grupo: "Ocorrências" },
  { key: "divergenciaClassificacao", label: "CLASSIFICACAO_DIVERGENTE", grupo: "Ocorrências" },
  { key: "divergenciaConsolidada", label: "DIVERGENCIA_TIPO_INFORMADO_X_REAL", grupo: "Ocorrências" },
  { key: "processoVazio", label: "INCONSISTENCIA_PROCESSO_VAZIO", grupo: "Inconsistências" },
];

// Função para detectar separador e parsear linha CSV
const parseCSVLine = (line: string, separator: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
};

// Detectar separador automaticamente
const detectSeparator = (line: string): string => {
  const semicolonCount = (line.match(/;/g) || []).length;
  const commaCount = (line.match(/,/g) || []).length;
  return semicolonCount >= commaCount ? ";" : ",";
};

export function PainelSupervisor({ 
  onProcessosCarregados,
  onLoteAtivado,
  processosCount,
  uploading = false,
  podeCarregarPlanilha = false,
  loteId
}: PainelSupervisorProps) {
  const { isAdmin, isSupervisor } = useAuth();
  const [colunasExportacao, setColunasExportacao] = useState<string[]>(
    COLUNAS_EXPORTACAO.map((c) => c.key)
  );
  const [mostrarColunas, setMostrarColunas] = useState(false);
  const [avaliacoesConsolidadas, setAvaliacoesConsolidadas] = useState<AvaliacaoConsolidada[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const [ativandoLote, setAtivandoLote] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hierarquiaInputRef = useRef<HTMLInputElement>(null);
  const { totalRegistros: totalTemporalidade } = useTemporalidade();
  const hierarchy = useHierarchyUpload();
  // Estado para seletor de lote de exportação
  const [lotes, setLotes] = useState<{ id: string; nome: string | null; created_at: string; total_processos: number; ativo: boolean }[]>([]);
  const [loteExportacao, setLoteExportacao] = useState<string | undefined>(loteId);
  
  // Verificar permissão (prop tem prioridade, senão usa hook)
  const temPermissao = podeCarregarPlanilha || isAdmin || isSupervisor;

  // Buscar todos os lotes disponíveis
  const fetchLotes = useCallback(async () => {
    const { data: lotesData, error } = await supabase
      .from("lotes_importacao")
      .select("id, nome, created_at, total_processos, ativo")
      .order("created_at", { ascending: false });

    if (!error && lotesData) {
      setLotes(lotesData);
    }
  }, []);

  // Buscar lotes ao montar
  useEffect(() => {
    fetchLotes();
  }, [fetchLotes]);

  // Atualizar lote de exportação quando o lote ativo mudar
  useEffect(() => {
    if (loteId && !loteExportacao) {
      setLoteExportacao(loteId);
    }
  }, [loteId, loteExportacao]);

  // Função para ativar/desativar lote para avaliação
  const handleAtivarLote = async (loteIdParaAtivar: string) => {
    try {
      setAtivandoLote(true);
      
      // Buscar informações do lote
      const lote = lotes.find(l => l.id === loteIdParaAtivar);
      if (!lote) {
        toast.error("Lote não encontrado");
        return;
      }

      // Se já está ativo, não faz nada
      if (lote.ativo) {
        toast.info("Este lote já está ativo para avaliação");
        return;
      }

      // Desativar TODOS os lotes (garantir apenas 1 ativo)
      const { error: desativarError } = await supabase
        .from("lotes_importacao")
        .update({ ativo: false })
        .eq("ativo", true);

      if (desativarError) {
        logger.error("Erro ao desativar lotes:", desativarError);
        toast.error("Erro ao desativar lotes anteriores");
        return;
      }

      // Ativar o lote selecionado
      const { error: ativarError } = await supabase
        .from("lotes_importacao")
        .update({ ativo: true })
        .eq("id", loteIdParaAtivar);

      if (ativarError) {
        logger.error("Erro ao ativar lote:", ativarError);
        toast.error("Erro ao ativar lote");
        return;
      }

      toast.success(
        `Lote "${lote.nome || 'Lote ' + new Date(lote.created_at).toLocaleDateString("pt-BR")}" ativado para avaliação!`
      );
      
      // Atualizar lista de lotes
      await fetchLotes();
      
      // Notificar componente pai para recarregar processos do lote ativado
      if (onLoteAtivado) {
        onLoteAtivado();
      }
    } catch (error) {
      logger.error("Erro ao ativar lote:", error);
      toast.error("Erro ao ativar lote para avaliação");
    } finally {
      setAtivandoLote(false);
    }
  };

  // Buscar avaliações consolidadas do banco
  const fetchAvaliacoesConsolidadas = useCallback(async () => {
    const loteParaExportar = loteExportacao || loteId;
    if (!loteParaExportar) return;
    
    setLoadingExport(true);
    try {
      const loteParaExportar = loteExportacao || loteId;
      // Buscar processos concluídos do lote
      const { data: processos, error: processosError } = await supabase
        .from("processos_fila")
        .select("*")
        .eq("lote_id", loteParaExportar)
        .eq("status_avaliacao", "CONCLUIDO");

      if (processosError) {
        logger.error("Erro ao buscar processos:", processosError);
        return;
      }

      if (!processos || processos.length === 0) {
        setAvaliacoesConsolidadas([]);
        return;
      }

      // Buscar avaliações
      const processoIds = processos.map(p => p.id);
      const { data: avaliacoes, error: avaliacoesError } = await supabase
        .from("avaliacoes")
        .select("*")
        .in("processo_id", processoIds);

      if (avaliacoesError) {
        logger.error("Erro ao buscar avaliações:", avaliacoesError);
        return;
      }

      // Buscar nomes dos avaliadores
      const avaliadorIds = [...new Set(avaliacoes?.map(a => a.avaliador_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, nome")
        .in("id", avaliadorIds);

      if (profilesError) {
        logger.error("Erro ao buscar profiles:", profilesError);
      }

      const profilesMap = new Map(profiles?.map(p => [p.id, p.nome]) || []);
      const avaliacoesMap = new Map(avaliacoes?.map(a => [a.processo_id, a]) || []);

      // Combinar dados
      const consolidadas: AvaliacaoConsolidada[] = processos.map(p => {
        const av = avaliacoesMap.get(p.id);
        return {
          codigoProcesso: p.codigo_processo,
          numeroCnj: p.numero_cnj,
          dataDistribuicao: p.data_distribuicao || "",
          dataArquivamentoDef: p.data_arquivamento_def || "",
          possuiAssunto: p.possui_assunto || "",
          assuntoPrincipal: p.assunto_principal || "",
          possuiMovArquivado: p.possui_mov_arquivado || "",
          prazo5AnosCompleto: p.prazo_5_anos_completo || "",
          responsavel: av?.avaliador_id ? (profilesMap.get(av.avaliador_id) || "Desconhecido") : "—",
          descricaoAssuntoFaltante: av?.descricao_assunto_faltante || undefined,
          assuntoTpu: av?.assunto_tpu || undefined,
          hierarquiaCorreta: av?.hierarquia_correta || undefined,
          divergenciaHierarquia: av?.divergencia_hierarquia || undefined,
          destinacaoPermanente: av?.destinacao_permanente || undefined,
          descricaoSituacaoArquivamento: av?.descricao_situacao_arquivamento || undefined,
          inconsistenciaPrazo: av?.inconsistencia_prazo || undefined,
          pecasTipos: av?.pecas_tipos || undefined,
          pecasIds: av?.pecas_ids || undefined,
          pecasCombinado: av?.pecas_combinado || undefined,
          observacoesPecas: av?.observacoes_pecas || undefined,
          documentoNaoLocalizado: av?.documento_nao_localizado || false,
          documentoDuplicado: av?.documento_duplicado || false,
          erroTecnico: av?.erro_tecnico || false,
          ocorrenciasOutroDetalhe: av?.ocorrencias_outro_detalhe || undefined,
          divergenciaClassificacao: av?.divergencia_classificacao || undefined,
          divergenciasDetalhes: av?.divergencias_detalhes || undefined,
          processoVazio: av?.processo_vazio || false,
          observacoesGerais: av?.observacoes_gerais || undefined,
          dataInicioAvaliacao: av?.data_inicio || undefined,
          dataFimAvaliacao: av?.data_fim || undefined,
        };
      });

      setAvaliacoesConsolidadas(consolidadas);
    } catch (error) {
      logger.error("Erro ao buscar avaliações consolidadas:", error);
    } finally {
      setLoadingExport(false);
    }
  }, [loteExportacao, loteId]);

  // Carregar avaliações quando o lote mudar
  useEffect(() => {
    fetchAvaliacoesConsolidadas();

    // Subscrever a mudanças
    const channel = supabase
      .channel("avaliacoes-consolidadas")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "avaliacoes",
        },
        () => {
          fetchAvaliacoesConsolidadas();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "processos_fila",
        },
        () => {
          fetchAvaliacoesConsolidadas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAvaliacoesConsolidadas]);

  const toggleColuna = (key: string) => {
    setColunasExportacao((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const selecionarTodas = () => {
    setColunasExportacao(COLUNAS_EXPORTACAO.map((c) => c.key));
  };

  const desmarcarTodas = () => {
    setColunasExportacao([]);
  };

  // Colunas obrigatórias para validação (na ordem correta)
  const COLUNAS_OBRIGATORIAS = [
    { nome: "CODIGO_PROCESSO", descricao: "Código único do processo no sistema" },
    { nome: "NUMERO_CNJ", descricao: "Número CNJ do processo (formato: 0000000-00.0000.0.00.0000)" },
    { nome: "DATA_DISTRIBUICAO", descricao: "Data de distribuição do processo (formato: dd/mm/aaaa)" },
    { nome: "POSSUI_MOV_ARQUIVADO", descricao: "Indica se possui movimentação 'Processo Arquivado' (Sim/Não)" },
    { nome: "DATA_ARQUIVAMENTO_DEF", descricao: "Data do arquivamento definitivo (formato: dd/mm/aaaa)" },
    { nome: "PRAZO_5_ANOS_COMPLETO", descricao: "Indica se o prazo de 5 anos foi atingido (Sim/Não)" },
    { nome: "POSSUI_ASSUNTO", descricao: "Indica se o processo possui assunto cadastrado (Sim/Não)" },
    { nome: "ASSUNTO_PRINCIPAL", descricao: "Assunto principal cadastrado no processo" },
  ];

  // Colunas opcionais para movimentos e peças processuais
  const COLUNAS_OPCIONAIS = [
    { nome: "MOVIMENTO_CODIGO", descricao: "Códigos dos movimentos concatenados com pipe" },
    { nome: "MOVIMENTO_DESCRICAO", descricao: "Descrições dos movimentos concatenadas com pipe" },
    { nome: "COMPLEMENTO", descricao: "Complementos dos movimentos concatenados com pipe" },
    { nome: "MOVIMENTO_DATA", descricao: "Datas dos movimentos concatenadas com pipe" },
    { nome: "IDS_PECAS", descricao: "IDs das peças no Projudi concatenados com pipe" },
    { nome: "TIPOS_PECAS", descricao: "Tipos das peças concatenados com pipe" },
  ];

  const handleUploadProcessos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo antes de processar
    const fileValidation = validateCSVFile(file);
    if (!fileValidation.valid) {
      toast.error(fileValidation.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast.error("Arquivo CSV vazio ou inválido");
          return;
        }

        // Validar número de linhas
        const rowValidation = validateRowCount(lines);
        if (!rowValidation.valid) {
          toast.error(rowValidation.error);
          return;
        }

        // Detectar separador automaticamente
        const separator = detectSeparator(lines[0]);
        logger.log(`Separador detectado: "${separator}"`);

        const headers = parseCSVLine(lines[0], separator).map((h) => 
          h.replace(/"/g, "").toUpperCase().trim()
        );
        logger.log("Headers encontrados:", headers);
        
        // Validar colunas obrigatórias
        const colunasAusentes = COLUNAS_OBRIGATORIAS
          .filter(col => !headers.includes(col.nome))
          .map(col => col.nome);
        
        if (colunasAusentes.length > 0) {
          toast.error(
            `Colunas obrigatórias ausentes: ${colunasAusentes.join(", ")}`,
            { duration: 6000 }
          );
          return;
        }

        // Mapear colunas esperadas (aba FILA_PROCESSOS)
        const colMap: Record<string, number> = {};
        const expectedCols = [
          ...COLUNAS_OBRIGATORIAS.map(c => c.nome),
          ...COLUNAS_OPCIONAIS.map(c => c.nome),
        ];

        expectedCols.forEach((col) => {
          const idx = headers.findIndex((h) => h === col);
          if (idx !== -1) colMap[col] = idx;
        });

        logger.log("Mapeamento de colunas:", colMap);
        
        // Avisar sobre colunas opcionais ausentes
        const opcionaisAusentes = COLUNAS_OPCIONAIS
          .filter(col => !headers.includes(col.nome))
          .map(col => col.nome);
        
        if (opcionaisAusentes.length > 0) {
          logger.log("Colunas opcionais ausentes:", opcionaisAusentes);
        }

        let suspiciousCount = 0;
        const processos: ProcessoFila[] = lines.slice(1).map((line) => {
          const rawValues = parseCSVLine(line, separator).map((v) => v.replace(/"/g, "").trim());
          // Sanitizar valores para prevenir injeção de fórmulas
          const values = rawValues.map(v => {
            if (hasSuspiciousContent(v)) {
              suspiciousCount++;
            }
            return sanitizeCellValue(v);
          });
          
          // Preservar status original ou definir como PENDENTE
          const statusOriginal = colMap.STATUS_AVALIACAO !== undefined 
            ? values[colMap.STATUS_AVALIACAO] 
            : "";
          const status = ["PENDENTE", "EM_ANALISE", "CONCLUIDO"].includes(statusOriginal.toUpperCase())
            ? statusOriginal.toUpperCase() as "PENDENTE" | "EM_ANALISE" | "CONCLUIDO"
            : "PENDENTE";

          return {
            CODIGO_PROCESSO: colMap.CODIGO_PROCESSO !== undefined ? values[colMap.CODIGO_PROCESSO] || "" : "",
            NUMERO_CNJ: colMap.NUMERO_CNJ !== undefined ? values[colMap.NUMERO_CNJ] || "" : "",
            POSSUI_ASSUNTO: colMap.POSSUI_ASSUNTO !== undefined ? values[colMap.POSSUI_ASSUNTO] || "" : "",
            ASSUNTO_PRINCIPAL: colMap.ASSUNTO_PRINCIPAL !== undefined ? values[colMap.ASSUNTO_PRINCIPAL] || "" : "",
            POSSUI_MOV_ARQUIVADO: colMap.POSSUI_MOV_ARQUIVADO !== undefined ? values[colMap.POSSUI_MOV_ARQUIVADO] || "" : "",
            DATA_DISTRIBUICAO: colMap.DATA_DISTRIBUICAO !== undefined ? values[colMap.DATA_DISTRIBUICAO] || "" : "",
            DATA_ARQUIVAMENTO_DEF: colMap.DATA_ARQUIVAMENTO_DEF !== undefined ? values[colMap.DATA_ARQUIVAMENTO_DEF] || "" : "",
            PRAZO_5_ANOS_COMPLETO: colMap.PRAZO_5_ANOS_COMPLETO !== undefined ? values[colMap.PRAZO_5_ANOS_COMPLETO] || "" : "",
            STATUS_AVALIACAO: status,
            RESPONSAVEL: colMap.RESPONSAVEL !== undefined ? values[colMap.RESPONSAVEL] || undefined : undefined,
            DATA_INICIO_AVALIACAO: colMap.DATA_INICIO !== undefined ? values[colMap.DATA_INICIO] || undefined : undefined,
            DATA_FIM: colMap.DATA_FIM !== undefined ? values[colMap.DATA_FIM] || undefined : undefined,
            // Campos de movimentos e peças processuais (concatenados com pipe)
            MOV_CODIGOS: colMap.MOVIMENTO_CODIGO !== undefined ? values[colMap.MOVIMENTO_CODIGO] || undefined : undefined,
            MOV_DESCRICOES: colMap.MOVIMENTO_DESCRICAO !== undefined ? values[colMap.MOVIMENTO_DESCRICAO] || undefined : undefined,
            MOV_COMPLEMENTOS: colMap.COMPLEMENTO !== undefined ? values[colMap.COMPLEMENTO] || undefined : undefined,
            MOV_DATAS: colMap.MOVIMENTO_DATA !== undefined ? values[colMap.MOVIMENTO_DATA] || undefined : undefined,
            PECAS_IDS: colMap.IDS_PECAS !== undefined ? values[colMap.IDS_PECAS] || undefined : undefined,
            PECAS_TIPOS: colMap.TIPOS_PECAS !== undefined ? values[colMap.TIPOS_PECAS] || undefined : undefined,
          };
        }).filter((p) => p.CODIGO_PROCESSO && p.NUMERO_CNJ);

        // Alertar sobre conteúdo suspeito
        if (suspiciousCount > 0) {
          logger.warn(`${suspiciousCount} células com conteúdo suspeito foram sanitizadas`);
          toast.warning(`${suspiciousCount} células com padrões suspeitos foram sanitizadas por segurança`, { duration: 5000 });
        }

        if (processos.length === 0) {
          toast.error("Nenhum processo válido encontrado. Verifique se CODIGO_PROCESSO e NUMERO_CNJ estão preenchidos.");
          return;
        }

        onProcessosCarregados(processos);
        
        const pendentes = processos.filter(p => p.STATUS_AVALIACAO === "PENDENTE").length;
        toast.success(`${processos.length} processos carregados (${pendentes} pendentes)`);
        
        // Avisar sobre colunas opcionais ausentes após sucesso
        if (opcionaisAusentes.length > 0 && opcionaisAusentes.length <= 3) {
          toast.info(`Colunas não encontradas (opcionais): ${opcionaisAusentes.join(", ")}`, { duration: 5000 });
        }
      } catch (error) {
        toast.error("Erro ao processar arquivo CSV");
        logger.error("CSV parsing error:", error);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleUploadHierarquia = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      toast.error("Apenas arquivos .xlsx são aceitos para hierarquia de assuntos");
      return;
    }

    const buffer = await file.arrayBuffer();
    await hierarchy.loadFile(buffer);
    toast.success("Arquivo carregado! Verifique as cores detectadas abaixo.");

    if (hierarquiaInputRef.current) {
      hierarquiaInputRef.current.value = "";
    }
  };

  // Separador CSV — ponto-e-vírgula é padrão para locale PT-BR (Excel)
  const CSV_SEP = ";";

  // Função para escapar valor CSV corretamente (RFC 4180)
  // SEMPRE envolve em aspas para garantir que separadores internos não quebrem colunas
  const escapeCSV = (value: string): string => {
    if (!value) return '""';
    return `"${value.replace(/"/g, '""')}"`;
  };

  const exportarAvaliacoes = () => {
    if (avaliacoesConsolidadas.length === 0) {
      toast.error("Nenhuma avaliação concluída para exportar");
      return;
    }

    // SEMPRE exportar TODAS as colunas do template fixo, na ordem definida
    const colunasParaExportar = colunasExportacao.length > 0
      ? COLUNAS_EXPORTACAO.filter(c => colunasExportacao.includes(c.key))
      : COLUNAS_EXPORTACAO;

    if (colunasParaExportar.length === 0) {
      toast.error("Selecione ao menos uma coluna para exportar");
      return;
    }

    // Criar cabeçalho fixo
    const headers = colunasParaExportar.map(c => escapeCSV(c.label)).join(CSV_SEP);

    // Criar linhas com valores escapados
    const rows = avaliacoesConsolidadas.map((av) => {
      return colunasParaExportar
        .map((col) => {
          const key = col.key;
          let value = "";

          // Campo especial: anoDistribuicao
          if (key === "anoDistribuicao") {
            value = extrairAno(av.dataDistribuicao);
          }
          // Campo especial: divergenciaConsolidada
          else if (key === "divergenciaConsolidada") {
            if (av.divergenciaClassificacao === "Sim" && av.divergenciasDetalhes) {
              try {
                // Parse: "Tipo1 → Real1 (ID: id1) | Tipo2 → Real2 (ID: id2)"
                // Output: "Tipo1 x Real1 - id1 | Tipo2 x Real2 - id2"
                value = av.divergenciasDetalhes
                  .split(" | ")
                  .filter(d => d.trim())
                  .map(d => {
                    const match = d.match(/^(.+?)\s*→\s*(.+?)\s*\(ID:\s*(.+?)\)$/);
                    if (match) {
                      return `${match[1].trim()} x ${match[2].trim()} - ${match[3].trim()}`;
                    }
                    return d;
                  })
                  .join(" | ");
              } catch {
                value = av.divergenciasDetalhes;
              }
            }
          }
          // Campo especial: ocorrenciasPecas
          else if (key === "ocorrenciasPecas") {
            const ocorrencias: string[] = [];
            if (av.documentoNaoLocalizado) ocorrencias.push("Documento não localizado");
            if (av.documentoDuplicado) ocorrencias.push("Documento duplicado");
            if (av.erroTecnico) ocorrencias.push("Erro técnico");
            value = ocorrencias.join("; ");
          }
          // Campo especial: destinacaoPermanente -> GUARDA
          else if (key === "destinacaoPermanente") {
            const val = av.destinacaoPermanente;
            if (val === "Sim") value = "I";
            else if (val === "Não") value = "P";
            else value = val || "";
          }
          // Campos de data
          else if (key === "dataDistribuicao" || key === "dataArquivamentoDef") {
            const raw = (av as unknown as Record<string, unknown>)[key];
            value = formatarData(String(raw || ""));
          }
          // Demais campos
          else {
            const raw = (av as unknown as Record<string, unknown>)[key];
            if (typeof raw === "boolean") value = raw ? "Sim" : "Não";
            else if (raw === undefined || raw === null) value = "";
            else value = String(raw);
          }

          return escapeCSV(value);
        })
        .join(CSV_SEP);
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avaliacoes_lote_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`${avaliacoesConsolidadas.length} avaliações exportadas com ${colunasParaExportar.length} colunas!`);
  };

  // Agrupar colunas
  const gruposUnicos = [...new Set(COLUNAS_EXPORTACAO.map((c) => c.grupo))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Painel de Configuração
        </CardTitle>
        <CardDescription>
          Carregue os processos e configure a exportação das avaliações
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload de Processos */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Fonte de Dados</Label>
          
          {!temPermissao && (
            <Alert>
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                Apenas administradores e supervisores podem carregar novas planilhas.
                {processosCount > 0 && " A planilha atual está disponível para avaliação."}
              </AlertDescription>
            </Alert>
          )}
          
          {temPermissao && (
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleUploadProcessos}
                className="hidden"
                id="upload-processos"
                disabled={uploading}
              />
              <Button variant="outline" asChild disabled={uploading}>
                <label htmlFor="upload-processos" className="cursor-pointer flex items-center gap-2">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? "Carregando..." : "Carregar FILA_PROCESSOS.csv"}
                </label>
              </Button>
            </div>
          )}
          
          {processosCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <FileSpreadsheet className="h-3 w-3" />
              {processosCount} processos carregados
            </Badge>
          )}
          
          {temPermissao && (
            <div className="text-xs text-muted-foreground space-y-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="font-medium text-foreground">Formato do arquivo CSV:</p>
              
              <div>
                <p className="font-medium text-destructive">Colunas obrigatórias (nesta ordem):</p>
                <ol className="list-decimal list-inside ml-2">
                  {COLUNAS_OBRIGATORIAS.map((col) => (
                    <li key={col.nome}><code className="bg-muted px-1 rounded">{col.nome}</code> - {col.descricao}</li>
                  ))}
                </ol>
              </div>
              
              <div className="pt-2 border-t">
                <p className="font-medium text-foreground">Colunas opcionais (movimentos/peças):</p>
                <ul className="list-disc list-inside ml-2">
                  {COLUNAS_OPCIONAIS.map((col) => (
                    <li key={col.nome}><code className="bg-muted px-1 rounded">{col.nome}</code> - {col.descricao}</li>
                  ))}
                </ul>
              </div>
              
              <p className="pt-1 border-t">
                📝 Aceita separador vírgula (,) ou ponto e vírgula (;) automaticamente.
                <br />⚠️ <strong>Atenção:</strong> Carregar uma nova planilha substituirá a anterior.
              </p>
            </div>
          )}
        </div>
        {/* Seção de Temporalidade CSV removida — agora unificada no upload XLSX abaixo */}

        {/* Upload de Temporalidade + Hierarquia de Assuntos (XLSX unificado) */}
        {temPermissao && (
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Tabela de Temporalidade e Hierarquia CNJ
            </Label>
            
            <div className="flex items-center gap-3">
              <input
                ref={hierarquiaInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleUploadHierarquia}
                className="hidden"
                id="upload-hierarquia"
                disabled={hierarchy.uploading}
              />
              <Button variant="outline" asChild disabled={hierarchy.uploading}>
                <label htmlFor="upload-hierarquia" className="cursor-pointer flex items-center gap-2">
                  {hierarchy.uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {hierarchy.uploading ? "Salvando..." : "Carregar Tabela (.xlsx)"}
                </label>
              </Button>

              {totalTemporalidade > 0 && !hierarchy.hasFile && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {totalTemporalidade} assuntos carregados
                </Badge>
              )}
            </div>

            {/* Preview após carregar arquivo */}
            {hierarchy.previewColors.length > 0 && (
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Cores de fonte detectadas:</p>
                <div className="space-y-2">
                  {hierarchy.previewColors.map((c, idx) => {
                    const mapping = hierarchy.colorMappings.find(
                      m => m.color.toUpperCase() === c.color.toUpperCase() && m.bold === c.bold
                    );
                    return (
                      <div key={idx} className="flex items-center gap-3 text-sm">
                        <div
                          className="w-6 h-6 rounded border border-border flex-shrink-0"
                          style={{ backgroundColor: `#${c.color}` }}
                        />
                        <span className={`font-mono text-xs ${c.bold ? "font-bold" : ""}`}>
                          #{c.color} {c.bold ? "(Negrito)" : ""}
                        </span>
                        <Badge variant="outline" className="text-xs">{c.count} células</Badge>
                        {mapping ? (
                          <Badge variant="secondary" className="text-xs">
                            Nível {mapping.level}: {mapping.label}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Não mapeado</Badge>
                        )}
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          Ex: {c.sample}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {hierarchy.previewRecords.length > 0 && (
                  <div className="pt-3 border-t">
                    <HierarchyTreeView records={hierarchy.previewRecords} />
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={hierarchy.saveToDatabase} disabled={hierarchy.uploading || hierarchy.previewRecords.length === 0}>
                    {hierarchy.uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Salvar ({hierarchy.previewRecords.length} registros)
                  </Button>
                  <Button size="sm" variant="outline" onClick={hierarchy.reset}>Cancelar</Button>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <p>Arquivo <strong>.xlsx</strong> original da tabela de temporalidade do CNJ (Justiça Estadual).</p>
              <p>O sistema extrai automaticamente:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li><strong>Temporalidade:</strong> prazo de guarda (marcações "X" nas colunas)</li>
                <li><strong>Hierarquia:</strong> nível do assunto (cor da fonte + negrito)</li>
              </ul>
              <div className="mt-2 space-y-0.5">
                <p className="font-medium">Mapeamento de cores:</p>
                {DEFAULT_COLOR_MAPPINGS.map((m, idx) => (
                  <p key={idx} className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: `#${m.color}` }} />
                    <code className="bg-muted px-1 rounded">#{m.color}</code>
                    {m.bold && <strong>(Negrito)</strong>}
                    → Nível {m.level}
                  </p>
                ))}
              </div>
              <p className="mt-1">⚠️ Carregar uma nova tabela substituirá a anterior.</p>
            </div>
          </div>
        )}

        {/* Exportar Avaliações */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Exportar Avaliações Realizadas</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarColunas(!mostrarColunas)}
              className="gap-1"
            >
              {mostrarColunas ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {mostrarColunas ? "Ocultar colunas" : "Selecionar colunas"}
            </Button>
          </div>

          {/* Seletor de Lote para Exportação e Ativação */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm text-muted-foreground">Lote:</Label>
            <Select 
              value={loteExportacao || ""} 
              onValueChange={(value) => setLoteExportacao(value || undefined)}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Selecione um lote" />
              </SelectTrigger>
              <SelectContent>
                {lotes.map((lote) => (
                  <SelectItem key={lote.id} value={lote.id}>
                    {lote.ativo && "(Ativo) "}
                    {lote.nome || `Lote ${new Date(lote.created_at).toLocaleDateString("pt-BR")}`}
                    {` (${lote.total_processos} processos)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchAvaliacoesConsolidadas}
              disabled={loadingExport || !loteExportacao}
            >
              {loadingExport ? <Loader2 className="h-4 w-4 animate-spin" /> : "Carregar"}
            </Button>
            {loteExportacao && (() => {
              const loteSelecionado = lotes.find(l => l.id === loteExportacao);
              if (!loteSelecionado) return null;
              
              if (loteSelecionado.ativo) {
                return (
                  <Button 
                    variant="default" 
                    size="sm"
                    disabled
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Ativo
                  </Button>
                );
              }
              
              return (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAtivarLote(loteExportacao)}
                  disabled={ativandoLote}
                  className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  {ativandoLote ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="h-4 w-4" />
                  )}
                  {ativandoLote ? "Ativando..." : "Ativar para Avaliação"}
                </Button>
              );
            })()}
          </div>

          {mostrarColunas && (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selecionarTodas}>
                  Selecionar todas
                </Button>
                <Button variant="outline" size="sm" onClick={desmarcarTodas}>
                  Desmarcar todas
                </Button>
                <Badge variant="secondary">
                  {colunasExportacao.length}/{COLUNAS_EXPORTACAO.length} selecionadas
                </Badge>
              </div>

              {gruposUnicos.map((grupo) => (
                <div key={grupo} className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    {grupo}
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {COLUNAS_EXPORTACAO.filter((c) => c.grupo === grupo).map((col) => (
                      <div key={col.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={col.key}
                          checked={colunasExportacao.includes(col.key)}
                          onCheckedChange={() => toggleColuna(col.key)}
                        />
                        <Label htmlFor={col.key} className="text-sm font-normal cursor-pointer">
                          {col.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button 
              onClick={exportarAvaliacoes} 
              disabled={avaliacoesConsolidadas.length === 0 || loadingExport}
            >
              {loadingExport ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Exportar Consolidado ({avaliacoesConsolidadas.length} avaliações)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
