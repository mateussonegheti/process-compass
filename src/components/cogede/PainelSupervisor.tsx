import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, Settings, Eye, EyeOff } from "lucide-react";
import { ProcessoFila, AvaliacaoDocumental } from "@/types/cogede";
import { toast } from "sonner";

interface PainelSupervisorProps {
  onProcessosCarregados: (processos: ProcessoFila[]) => void;
  avaliacoesRealizadas: AvaliacaoDocumental[];
  processosCount: number;
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

export function PainelSupervisor({ onProcessosCarregados, avaliacoesRealizadas, processosCount }: PainelSupervisorProps) {
  const [colunasExportacao, setColunasExportacao] = useState<string[]>(
    COLUNAS_EXPORTACAO.map((c) => c.key)
  );
  const [mostrarColunas, setMostrarColunas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        console.log(`Separador detectado: "${separator}"`);

        const headers = parseCSVLine(lines[0], separator).map((h) => 
          h.replace(/"/g, "").toUpperCase().trim()
        );
        console.log("Headers encontrados:", headers);
        
        // Mapear colunas esperadas (aba FILA_PROCESSOS)
        const colMap: Record<string, number> = {};
        const expectedCols = [
          "CODIGO_PROCESSO",
          "NUMERO_CNJ", 
          "POSSUI_ASSUNTO",
          "ASSUNTO_PRINCIPAL",
          "POSSUI_MOV_ARQUIVADO",
          "DATA_DISTRIBUICAO",
          "DATA_ARQUIVAMENTO_DEF",
          "PRAZO_5_ANOS_COMPLETO",
          "STATUS_AVALIACAO",
          "RESPONSAVEL",
          "DATA_INICIO",
          "DATA_FIM",
          "ID_PECA",
          "TIPOS_PECAS",
        ];

        expectedCols.forEach((col) => {
          const idx = headers.findIndex((h) => h === col);
          if (idx !== -1) colMap[col] = idx;
        });

        console.log("Mapeamento de colunas:", colMap);

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
            ID_PECA: colMap.ID_PECA !== undefined ? values[colMap.ID_PECA] || undefined : undefined,
            TIPOS_PECAS: colMap.TIPOS_PECAS !== undefined ? values[colMap.TIPOS_PECAS] || undefined : undefined,
          };
        }).filter((p) => p.CODIGO_PROCESSO);

        if (processos.length === 0) {
          toast.error("Nenhum processo válido encontrado no CSV. Verifique se a coluna CODIGO_PROCESSO existe.");
          return;
        }

        onProcessosCarregados(processos);
        
        const pendentes = processos.filter(p => p.STATUS_AVALIACAO === "PENDENTE").length;
        toast.success(`${processos.length} processos carregados (${pendentes} pendentes)`);
      } catch (error) {
        toast.error("Erro ao processar arquivo CSV");
        console.error(error);
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

          // Campo especial: destinacaoPermanente -> GUARDA (P ou E)
          if (key === "destinacaoPermanente") {
            const val = av.destinacaoPermanente;
            if (val === "Sim") return "P";
            if (val === "Não") return "E";
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
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleUploadProcessos}
              className="hidden"
              id="upload-processos"
            />
            <Button variant="outline" asChild>
              <label htmlFor="upload-processos" className="cursor-pointer flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Carregar FILA_PROCESSOS.csv
              </label>
            </Button>
            {processosCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <FileSpreadsheet className="h-3 w-3" />
                {processosCount} processos carregados
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            O CSV deve conter as colunas: CODIGO_PROCESSO, NUMERO_CNJ, DATA_DISTRIBUICAO, POSSUI_MOV_ARQUIVADO, etc.
            <br />Aceita separador vírgula (,) ou ponto e vírgula (;) automaticamente.
          </p>
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
