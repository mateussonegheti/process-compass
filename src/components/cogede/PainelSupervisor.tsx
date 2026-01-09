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

// Todas as colunas disponíveis para exportação
const COLUNAS_EXPORTACAO = [
  { key: "codigoProcesso", label: "Código do Processo", grupo: "Identificação" },
  { key: "numeroCnj", label: "Número CNJ", grupo: "Identificação" },
  { key: "possuiAssunto", label: "Possui Assunto", grupo: "Assunto/TPU" },
  { key: "assuntoPrincipal", label: "Assunto Principal", grupo: "Assunto/TPU" },
  { key: "descricaoAssuntoFaltante", label: "Descrição Assunto Faltante", grupo: "Assunto/TPU" },
  { key: "assuntoTpu", label: "Assunto TPU", grupo: "Assunto/TPU" },
  { key: "hierarquiaCorreta", label: "Hierarquia Correta", grupo: "Assunto/TPU" },
  { key: "divergenciaHierarquia", label: "Divergência Hierarquia", grupo: "Assunto/TPU" },
  { key: "destinacaoPermanente", label: "Destinação Permanente", grupo: "Assunto/TPU" },
  { key: "possuiMovArquivado", label: "Possui Mov. Arquivado", grupo: "Movimentações" },
  { key: "descricaoSituacaoArquivamento", label: "Descrição Situação Arquivamento", grupo: "Movimentações" },
  { key: "dataDistribuicao", label: "Data Distribuição", grupo: "Movimentações" },
  { key: "dataArquivamentoDef", label: "Data Arquivamento Def.", grupo: "Movimentações" },
  { key: "prazo5AnosCompleto", label: "Prazo 5 Anos Completo", grupo: "Movimentações" },
  { key: "inconsistenciaPrazo", label: "Inconsistência Prazo", grupo: "Movimentações" },
  { key: "pecasTipos", label: "Peças - Tipos", grupo: "Peças" },
  { key: "pecasIds", label: "Peças - IDs", grupo: "Peças" },
  { key: "pecasCombinado", label: "Peças - Combinado", grupo: "Peças" },
  { key: "documentoNaoLocalizado", label: "Documento Não Localizado", grupo: "Ocorrências" },
  { key: "documentoDuplicado", label: "Documento Duplicado", grupo: "Ocorrências" },
  { key: "erroTecnico", label: "Erro Técnico", grupo: "Ocorrências" },
  { key: "divergenciaClassificacao", label: "Divergência Classificação", grupo: "Ocorrências" },
  { key: "processoVazio", label: "Processo Vazio", grupo: "Inconsistências" },
  { key: "observacoesGerais", label: "Observações Gerais", grupo: "Inconsistências" },
  { key: "responsavel", label: "Responsável", grupo: "Metadados" },
  { key: "dataInicioAvaliacao", label: "Data Início Avaliação", grupo: "Metadados" },
  { key: "dataFimAvaliacao", label: "Data Fim Avaliação", grupo: "Metadados" },
];

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

        const headers = lines[0].split(";").map((h) => h.trim().replace(/"/g, ""));
        
        // Mapear colunas esperadas
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
        ];

        expectedCols.forEach((col) => {
          const idx = headers.findIndex((h) => h.toUpperCase() === col);
          if (idx !== -1) colMap[col] = idx;
        });

        const processos: ProcessoFila[] = lines.slice(1).map((line) => {
          const values = line.split(";").map((v) => v.trim().replace(/"/g, ""));
          return {
            CODIGO_PROCESSO: values[colMap.CODIGO_PROCESSO] || "",
            NUMERO_CNJ: values[colMap.NUMERO_CNJ] || "",
            POSSUI_ASSUNTO: values[colMap.POSSUI_ASSUNTO] || "",
            ASSUNTO_PRINCIPAL: values[colMap.ASSUNTO_PRINCIPAL] || "",
            POSSUI_MOV_ARQUIVADO: values[colMap.POSSUI_MOV_ARQUIVADO] || "",
            DATA_DISTRIBUICAO: values[colMap.DATA_DISTRIBUICAO] || "",
            DATA_ARQUIVAMENTO_DEF: values[colMap.DATA_ARQUIVAMENTO_DEF] || "",
            PRAZO_5_ANOS_COMPLETO: values[colMap.PRAZO_5_ANOS_COMPLETO] || "",
            STATUS_AVALIACAO: "PENDENTE" as const,
          };
        }).filter((p) => p.CODIGO_PROCESSO);

        onProcessosCarregados(processos);
        toast.success(`${processos.length} processos carregados do CSV`);
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

    // Criar cabeçalho
    const headers = colunasExportacao
      .map((key) => COLUNAS_EXPORTACAO.find((c) => c.key === key)?.label || key)
      .join(";");

    // Criar linhas
    const rows = avaliacoesRealizadas.map((av) => {
      return colunasExportacao
        .map((key) => {
          const value = (av as unknown as Record<string, unknown>)[key];
          if (typeof value === "boolean") return value ? "Sim" : "Não";
          if (value === undefined || value === null) return "";
          return String(value).replace(/;/g, ",").replace(/\n/g, " ");
        })
        .join(";");
    });

    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `avaliacoes_cogede_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Avaliações exportadas com sucesso!");
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
                Carregar processos.csv
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
            O CSV deve conter as colunas: CODIGO_PROCESSO, NUMERO_CNJ, POSSUI_ASSUNTO, ASSUNTO_PRINCIPAL, etc.
            Separador: ponto e vírgula (;)
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
              Exportar CSV ({avaliacoesRealizadas.length} avaliações)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
