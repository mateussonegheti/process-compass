import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileSpreadsheet, Settings, Eye, EyeOff, ShieldAlert, Loader2 } from "lucide-react";
import { ProcessoFila, AvaliacaoDocumental } from "@/types/cogede";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { useAuth } from "@/hooks/useAuth";

interface PainelSupervisorProps {
  onProcessosCarregados: (processos: ProcessoFila[]) => void;
  avaliacoesRealizadas: AvaliacaoDocumental[];
  processosCount: number;
  uploading?: boolean;
  podeCarregarPlanilha?: boolean;
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
  { key: "tipoInformadoSistema", label: "TIPO_INFORMADO_SISTEMA", grupo: "Ocorrências" },
  { key: "tipoRealIdentificado", label: "TIPO_REAL_IDENTIFICADO", grupo: "Ocorrências" },
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
  avaliacoesRealizadas, 
  processosCount,
  uploading = false,
  podeCarregarPlanilha = false
}: PainelSupervisorProps) {
  const { isAdmin, isSupervisor } = useAuth();
  const [colunasExportacao, setColunasExportacao] = useState<string[]>(
    COLUNAS_EXPORTACAO.map((c) => c.key)
  );
  const [mostrarColunas, setMostrarColunas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verificar permissão (prop tem prioridade, senão usa hook)
  const temPermissao = podeCarregarPlanilha || isAdmin || isSupervisor;

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

  // Colunas opcionais (para compatibilidade futura)
  const COLUNAS_OPCIONAIS: { nome: string; descricao: string }[] = [];

  const handleUploadProcessos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          toast.error("Arquivo CSV vazio ou inválido");
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

        const processos: ProcessoFila[] = lines.slice(1).map((line) => {
          const values = parseCSVLine(line, separator).map((v) => v.replace(/"/g, "").trim());
          
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
          };
        }).filter((p) => p.CODIGO_PROCESSO && p.NUMERO_CNJ);

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

    // Limpar input para permitir reupload do mesmo arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const exportarAvaliacoes = () => {
    if (avaliacoesRealizadas.length === 0) {
      toast.error("Nenhuma avaliação realizada para exportar");
      return;
    }

    if (colunasExportacao.length === 0) {
      toast.error("Selecione ao menos uma coluna para exportar");
      return;
    }

    // Criar cabeçalho usando os labels das colunas (nomes da aba AVALIAÇÃO_DOCUMENTAL)
    const headers = colunasExportacao
      .map((key) => COLUNAS_EXPORTACAO.find((c) => c.key === key)?.label || key)
      .join(",");

    // Criar linhas
    const rows = avaliacoesRealizadas.map((av) => {
      return colunasExportacao
        .map((key) => {
          // Campo especial: anoDistribuicao (extrair ano da data de distribuição)
          if (key === "anoDistribuicao") {
            return extrairAno(av.dataDistribuicao);
          }
          
          // Campo especial: ocorrenciasPecas (concatenar checkboxes)
          if (key === "ocorrenciasPecas") {
            const ocorrencias: string[] = [];
            if (av.documentoNaoLocalizado) ocorrencias.push("Documento não localizado");
            if (av.documentoDuplicado) ocorrencias.push("Documento duplicado");
            if (av.erroTecnico) ocorrencias.push("Erro técnico");
            return ocorrencias.join("; ");
          }

          // Campo especial: destinacaoPermanente -> GUARDA (I = Integral/Permanente, P = Parcial)
          if (key === "destinacaoPermanente") {
            const val = av.destinacaoPermanente;
            if (val === "Sim") return "I"; // Guarda Permanente (Integral)
            if (val === "Não") return "P"; // Guarda Parcial
            return val || "";
          }

          // Campos de data: formatar para dd/mm/aaaa
          if (key === "dataDistribuicao" || key === "dataArquivamentoDef") {
            const value = (av as unknown as Record<string, unknown>)[key];
            return formatarData(String(value || ""));
          }
          
          const value = (av as unknown as Record<string, unknown>)[key];
          if (typeof value === "boolean") return value ? "Sim" : "Não";
          if (value === undefined || value === null) return "";
          return String(value).replace(/;/g, ",").replace(/\n/g, " ");
        })
        .join(",");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "processos.csv";
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Avaliações exportadas para processos.csv!");
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
            <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">Formato do arquivo CSV:</p>
              
              <div>
                <p className="font-medium text-destructive">Colunas obrigatórias (nesta ordem):</p>
                <ol className="list-decimal list-inside ml-2">
                  {COLUNAS_OBRIGATORIAS.map((col, index) => (
                    <li key={col.nome}><code className="bg-muted px-1 rounded">{col.nome}</code> - {col.descricao}</li>
                  ))}
                </ol>
              </div>
              
              <p className="pt-1 border-t">
                📝 Aceita separador vírgula (,) ou ponto e vírgula (;) automaticamente.
                <br />⚠️ <strong>Atenção:</strong> Carregar uma nova planilha substituirá a anterior.
              </p>
            </div>
          )}
        </div>

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
            <Button onClick={exportarAvaliacoes} disabled={avaliacoesRealizadas.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exportar processos.csv ({avaliacoesRealizadas.length} avaliações)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
