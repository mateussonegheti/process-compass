import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight, Lock, Plus, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { ProcessoFila, AvaliacaoDocumental, PecaProcessual, ASSUNTOS_TPU, TIPOS_PECA } from "@/types/cogede";
import { toast } from "sonner";

interface FormularioAvaliacaoProps {
  processo: ProcessoFila;
  responsavel: string;
  onSalvarEProximo: (avaliacao: AvaliacaoDocumental) => void;
  carregando: boolean;
}

// Interface para divergência de classificação
interface DivergenciaClassificacao {
  id: string;
  tipoInformado: string;
  tipoReal: string;
  idPeca: string;
}

const initialFormData = {
  // Campos manuais - Seção 2
  descricaoAssuntoFaltante: "",
  assuntoTpu: "",
  hierarquiaCorreta: "",
  divergenciaHierarquia: "",
  destinacaoPermanente: "",

  // Campos manuais - Seção 3
  descricaoSituacaoArquivamento: "",
  inconsistenciaPrazo: "",

  // Campos manuais - Seção 4
  observacoesPecas: "",
  documentoNaoLocalizado: false,
  documentoDuplicado: false,
  erroTecnico: false,
  ocorrenciasOutroDetalhe: "",
  divergenciaClassificacao: "",

  // Campos manuais - Seção 5
  processoVazio: false,
  observacoesGerais: "",
};

export function FormularioAvaliacao({ processo, responsavel, onSalvarEProximo, carregando }: FormularioAvaliacaoProps) {
  const [pecas, setPecas] = useState<PecaProcessual[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [divergencias, setDivergencias] = useState<DivergenciaClassificacao[]>([]);

  // Limpar formulário quando mudar de processo
  useEffect(() => {
    setPecas([]);
    setFormData(initialFormData);
    setDivergencias([]);
  }, [processo.CODIGO_PROCESSO]);

  // Funções para gerenciar divergências
  const adicionarDivergencia = () => {
    setDivergencias([...divergencias, { id: crypto.randomUUID(), tipoInformado: "", tipoReal: "", idPeca: "" }]);
  };

  const removerDivergencia = (id: string) => {
    setDivergencias(divergencias.filter((d) => d.id !== id));
  };

  const atualizarDivergencia = (id: string, campo: keyof Omit<DivergenciaClassificacao, 'id'>, valor: string) => {
    setDivergencias(divergencias.map((d) => (d.id === id ? { ...d, [campo]: valor } : d)));
  };

  // Gerar campos concatenados para divergências
  const gerarCamposDivergencias = () => {
    const tiposInformados = divergencias.map((d) => d.tipoInformado).filter(Boolean).join("; ");
    const tiposReais = divergencias.map((d) => d.tipoReal).filter(Boolean).join("; ");
    const combinado = divergencias
      .map((d) => `${d.tipoInformado} → ${d.tipoReal} (ID: ${d.idPeca})`)
      .filter((d) => d !== " →  (ID: )")
      .join(" | ");
    return { tiposInformados, tiposReais, combinado };
  };

  const naoTemAssunto = processo.POSSUI_ASSUNTO?.toLowerCase() === "não";
  const naoTemMovArquivado = processo.POSSUI_MOV_ARQUIVADO?.toLowerCase() === "não";
  const prazoIncompleto = processo.PRAZO_5_ANOS_COMPLETO?.toLowerCase() === "não";
  const temDivergenciaClassificacao = formData.divergenciaClassificacao === "Sim";

  const adicionarPeca = () => {
    setPecas([...pecas, { id: crypto.randomUUID(), tipo: "", idProjudi: "" }]);
  };

  const removerPeca = (id: string) => {
    setPecas(pecas.filter((p) => p.id !== id));
  };

  const atualizarPeca = (id: string, campo: "tipo" | "idProjudi", valor: string) => {
    setPecas(pecas.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));
  };

  // Formatar data para dd/mm/aaaa
  const formatarData = (dataStr: string): string => {
    if (!dataStr) return "";
    // Tenta extrair apenas a parte da data (antes do espaço se houver hora)
    const dataParte = dataStr.split(" ")[0];
    // Se já está no formato dd/mm/yy ou dd/mm/yyyy
    const partes = dataParte.split("/");
    if (partes.length === 3) {
      const [dia, mes, ano] = partes;
      // Se ano tem 2 dígitos, adiciona 20 na frente (assumindo anos 2000)
      const anoCompleto = ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
      return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anoCompleto}`;
    }
    return dataParte;
  };

  const gerarCamposConcatenados = () => {
    const tipos = pecas
      .map((p) => p.tipo)
      .filter(Boolean)
      .join("; ");
    const ids = pecas
      .map((p) => p.idProjudi)
      .filter(Boolean)
      .join(" | ");
    const combinado = pecas
      .map((p) => `${p.tipo}: ${p.idProjudi}`)
      .filter((p) => p !== ": ")
      .join(" | ");
    return { tipos, ids, combinado };
  };

  const handleSubmit = () => {
    // Validações básicas
    if (naoTemAssunto && !formData.descricaoAssuntoFaltante.trim()) {
      toast.error("Campo obrigatório: Descreva o assunto faltante");
      return;
    }

    if (naoTemMovArquivado && !formData.descricaoSituacaoArquivamento.trim()) {
      toast.error("Campo obrigatório: Descreva a situação do arquivamento");
      return;
    }

    const { tipos, ids, combinado } = gerarCamposConcatenados();

    const { tiposInformados, tiposReais, combinado: divergenciasCombinado } = gerarCamposDivergencias();

    const avaliacao: AvaliacaoDocumental = {
      codigoProcesso: processo.CODIGO_PROCESSO,
      numeroCnj: processo.NUMERO_CNJ,
      possuiAssunto: processo.POSSUI_ASSUNTO,
      assuntoPrincipal: processo.ASSUNTO_PRINCIPAL,
      descricaoAssuntoFaltante: formData.descricaoAssuntoFaltante,
      assuntoTpu: formData.assuntoTpu,
      hierarquiaCorreta: formData.hierarquiaCorreta,
      divergenciaHierarquia: formData.divergenciaHierarquia,
      destinacaoPermanente: formData.destinacaoPermanente,
      possuiMovArquivado: processo.POSSUI_MOV_ARQUIVADO,
      descricaoSituacaoArquivamento: formData.descricaoSituacaoArquivamento,
      dataDistribuicao: processo.DATA_DISTRIBUICAO,
      dataArquivamentoDef: processo.DATA_ARQUIVAMENTO_DEF,
      prazo5AnosCompleto: processo.PRAZO_5_ANOS_COMPLETO,
      inconsistenciaPrazo: formData.inconsistenciaPrazo,
      pecas,
      pecasTipos: tipos,
      pecasIds: ids,
      pecasCombinado: combinado,
      observacoesPecas: formData.observacoesPecas,
      documentoNaoLocalizado: formData.documentoNaoLocalizado,
      documentoDuplicado: formData.documentoDuplicado,
      erroTecnico: formData.erroTecnico,
      ocorrenciasOutroDetalhe: formData.ocorrenciasOutroDetalhe,
      divergenciaClassificacao: formData.divergenciaClassificacao,
      tipoInformadoSistema: tiposInformados,
      tipoRealIdentificado: tiposReais,
      divergenciasDetalhes: divergenciasCombinado,
      processoVazio: formData.processoVazio,
      observacoesGerais: formData.observacoesGerais,
      responsavel,
      dataInicioAvaliacao: processo.DATA_INICIO_AVALIACAO || new Date().toISOString(),
    };

    onSalvarEProximo(avaliacao);
  };

  return (
    <div className="space-y-6">
      {/* Seção 1 - Identificação (Auto-preenchido) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
              1
            </span>
            Identificação do Processo
            <Badge variant="secondary" className="ml-auto">
              <Lock className="h-3 w-3 mr-1" />
              Auto-preenchido
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>1.1 Código do Processo</Label>
            <Input value={processo.CODIGO_PROCESSO} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>1.2 Número CNJ</Label>
            <Input value={processo.NUMERO_CNJ?.replace(/[-.]/g, "")} disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2 - Assunto/TPU */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            Assunto / TPU
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                2.1 Possui assunto cadastrado?
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input value={processo.POSSUI_ASSUNTO} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                2.2 Assunto principal (PROJUDI)
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input value={processo.ASSUNTO_PRINCIPAL || "N/A"} disabled className="bg-muted" />
            </div>
          </div>

          {naoTemAssunto && (
            <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Label className="text-amber-800">
                2.1.1 Descrição do assunto faltante <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Descreva o assunto que deveria estar cadastrado..."
                value={formData.descricaoAssuntoFaltante}
                onChange={(e) => setFormData({ ...formData, descricaoAssuntoFaltante: e.target.value })}
                className="bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>2.3 Hierarquia correta?</Label>
              <Select
                value={formData.hierarquiaCorreta}
                onValueChange={(v) => setFormData({ ...formData, hierarquiaCorreta: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>2.4 Destinação permanente?</Label>
              <Select
                value={formData.destinacaoPermanente}
                onValueChange={(v) => setFormData({ ...formData, destinacaoPermanente: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                  <SelectItem value="N/A">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.hierarquiaCorreta === "Não" && (
            <div className="space-y-2">
              <Label>2.3.1 Divergência na hierarquia</Label>
              <Textarea
                placeholder="Descreva a divergência encontrada..."
                value={formData.divergenciaHierarquia}
                onChange={(e) => setFormData({ ...formData, divergenciaHierarquia: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 3 - Movimentações/Prazos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
              3
            </span>
            Movimentações e Prazos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              3.1 Possui movimentação "Processo Arquivado"?
              <Lock className="h-3 w-3 text-muted-foreground" />
            </Label>
            <Input value={processo.POSSUI_MOV_ARQUIVADO} disabled className="bg-muted" />
          </div>

          {naoTemMovArquivado && (
            <div className="space-y-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Label className="text-amber-800">
                3.1.1 Descrever situação do arquivamento <span className="text-destructive">*</span>
              </Label>
              <Textarea
                placeholder="Descreva a situação atual do processo em relação ao arquivamento..."
                value={formData.descricaoSituacaoArquivamento}
                onChange={(e) => setFormData({ ...formData, descricaoSituacaoArquivamento: e.target.value })}
                className="bg-white"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                3.2 Data da distribuição
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input value={formatarData(processo.DATA_DISTRIBUICAO)} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                3.3 Data do arquivamento definitivo
                <Lock className="h-3 w-3 text-muted-foreground" />
              </Label>
              <Input value={formatarData(processo.DATA_ARQUIVAMENTO_DEF)} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              3.4 Prazo de 5 anos completo?
              <Lock className="h-3 w-3 text-muted-foreground" />
              {prazoIncompleto && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Prazo incompleto
                </Badge>
              )}
              {!prazoIncompleto && processo.PRAZO_5_ANOS_COMPLETO && (
                <Badge className="ml-2 bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Prazo completo
                </Badge>
              )}
            </Label>
            <Input value={processo.PRAZO_5_ANOS_COMPLETO} disabled className="bg-muted" />
          </div>

          {prazoIncompleto && (
            <div className="space-y-2">
              <Label>3.4.1 Reportar inconsistência do prazo</Label>
              <Textarea
                placeholder="Descreva a inconsistência encontrada no prazo..."
                value={formData.inconsistenciaPrazo}
                onChange={(e) => setFormData({ ...formData, inconsistenciaPrazo: e.target.value })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 4 - Peças Processuais */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
              4
            </span>
            Peças Processuais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {pecas.map((peca, index) => (
              <div key={peca.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground mt-2">{index + 1}.</span>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Select value={peca.tipo} onValueChange={(v) => atualizarPeca(peca.id, "tipo", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo da peça..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_PECA.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="ID PROJUDI"
                    value={peca.idProjudi}
                    onChange={(e) => atualizarPeca(peca.id, "idProjudi", e.target.value)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removerPeca(peca.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" onClick={adicionarPeca} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Peça Processual
          </Button>

          {pecas.length > 0 && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-muted rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">4.1 Tipos (concatenado)</Label>
                <p className="text-sm font-mono">{gerarCamposConcatenados().tipos || "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">4.2 IDs (concatenado)</Label>
                <p className="text-sm font-mono">{gerarCamposConcatenados().ids || "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Combinado</Label>
                <p className="text-sm font-mono">{gerarCamposConcatenados().combinado || "—"}</p>
              </div>
            </div>
          )}

          {/* Observações sobre peças */}
          <div className="space-y-2">
            <Label>4.3 Observações sobre peças</Label>
            <Textarea
              placeholder="Adicione observações sobre as peças processuais..."
              value={formData.observacoesPecas}
              onChange={(e) => setFormData({ ...formData, observacoesPecas: e.target.value })}
            />
          </div>

          <div className="space-y-3 pt-3 border-t">
            <Label className="text-sm font-medium">Ocorrências</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docNaoLoc"
                  checked={formData.documentoNaoLocalizado}
                  onCheckedChange={(c) => setFormData({ ...formData, documentoNaoLocalizado: c as boolean })}
                />
                <Label htmlFor="docNaoLoc" className="text-sm font-normal">
                  Documento não localizado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docDup"
                  checked={formData.documentoDuplicado}
                  onCheckedChange={(c) => setFormData({ ...formData, documentoDuplicado: c as boolean })}
                />
                <Label htmlFor="docDup" className="text-sm font-normal">
                  Documento duplicado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="erroTec"
                  checked={formData.erroTecnico}
                  onCheckedChange={(c) => setFormData({ ...formData, erroTecnico: c as boolean })}
                />
                <Label htmlFor="erroTec" className="text-sm font-normal">
                  Erro técnico
                </Label>
              </div>
            </div>

            {/* Campo para outro detalhe de ocorrência */}
            <div className="space-y-2 mt-2">
              <Label>Outro detalhe de ocorrência</Label>
              <Input
                placeholder="Descreva outra ocorrência se necessário..."
                value={formData.ocorrenciasOutroDetalhe}
                onChange={(e) => setFormData({ ...formData, ocorrenciasOutroDetalhe: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-3 border-t">
            <div className="space-y-2">
              <Label>Divergência de classificação</Label>
              <Select
                value={formData.divergenciaClassificacao}
                onValueChange={(v) => setFormData({ ...formData, divergenciaClassificacao: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sim">Sim</SelectItem>
                  <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {temDivergenciaClassificacao && (
              <div className="space-y-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                {/* Cabeçalho da tabela */}
                <div className="grid grid-cols-[1fr_1fr_120px_40px] gap-2 text-sm font-medium text-amber-800">
                  <span>Tipo Informado</span>
                  <span>Tipo Real</span>
                  <span>ID da Peça</span>
                  <span></span>
                </div>

                {/* Lista de divergências */}
                {divergencias.map((divergencia) => (
                  <div key={divergencia.id} className="grid grid-cols-[1fr_1fr_120px_40px] gap-2 items-center">
                    <Input
                      placeholder="Ex: Petição Inicial"
                      value={divergencia.tipoInformado}
                      onChange={(e) => atualizarDivergencia(divergencia.id, "tipoInformado", e.target.value)}
                      className="bg-white"
                    />
                    <Input
                      placeholder="Ex: Contestação"
                      value={divergencia.tipoReal}
                      onChange={(e) => atualizarDivergencia(divergencia.id, "tipoReal", e.target.value)}
                      className="bg-white"
                    />
                    <Input
                      placeholder="ID"
                      value={divergencia.idPeca}
                      onChange={(e) => atualizarDivergencia(divergencia.id, "idPeca", e.target.value)}
                      className="bg-white"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerDivergencia(divergencia.id)}
                      className="text-destructive hover:text-destructive h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* Botão de adicionar */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={adicionarDivergencia}
                  className="w-full bg-white hover:bg-amber-100"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Divergência
                </Button>

                {/* Resumo concatenado */}
                {divergencias.length > 0 && (
                  <div className="pt-2 border-t border-amber-200">
                    <Label className="text-xs text-amber-700">Resumo das divergências:</Label>
                    <p className="text-sm font-mono text-amber-900 mt-1">
                      {gerarCamposDivergencias().combinado || "—"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção 5 - Inconsistências */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
              5
            </span>
            Inconsistências e Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="procVazio"
              checked={formData.processoVazio}
              onCheckedChange={(c) => setFormData({ ...formData, processoVazio: c as boolean })}
            />
            <Label htmlFor="procVazio" className="font-normal">
              Processo vazio (sem documentos)
            </Label>
          </div>

          <div className="space-y-2">
            <Label>Observações gerais</Label>
            <Textarea
              placeholder="Adicione observações relevantes sobre o processo..."
              value={formData.observacoesGerais}
              onChange={(e) => setFormData({ ...formData, observacoesGerais: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão de Ação */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
        <Button onClick={handleSubmit} disabled={carregando} className="w-full" size="lg">
          {carregando ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salvar e ir para o próximo
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
