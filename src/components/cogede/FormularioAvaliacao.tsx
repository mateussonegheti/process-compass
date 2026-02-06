import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, ArrowRight, Lock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { ProcessoFila, AvaliacaoDocumental, PecaProcessual, ASSUNTOS_TPU } from "@/types/cogede";
import { toast } from "sonner";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { PainelPecasProcessuais, PecaPermanente, DadosMovimentosConcatenados } from "./PainelPecasProcessuais";

interface FormularioAvaliacaoProps {
  processo: ProcessoFila;
  responsavel: string;
  onSalvarEProximo: (avaliacao: AvaliacaoDocumental) => void;
  onFinalizarAvaliacao?: () => void;
  carregando: boolean;
  avaliacaoAnterior?: Record<string, unknown>; // Dados da avaliação anterior para edição
  modoEdicao?: boolean; // Indica se estamos editando uma avaliação existente
}

// Interface para divergência de classificação (mantida para compatibilidade)
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

export function FormularioAvaliacao({ processo, responsavel, onSalvarEProximo, onFinalizarAvaliacao, carregando, avaliacaoAnterior, modoEdicao }: FormularioAvaliacaoProps) {
  const [pecas, setPecas] = useState<PecaProcessual[]>([]);
  const [formData, setFormData] = useState(initialFormData);
  const [divergencias, setDivergencias] = useState<DivergenciaClassificacao[]>([]);
  const [pecasPermanentes, setPecasPermanentes] = useState<PecaPermanente[]>([]);

  // Ativar rastreamento de inatividade enquanto o formulário está sendo editado
  useInactivityTimeout(processo.ID, true);

  // Handlers para peças permanentes (novo painel)
  const handleAdicionarPecaPermanente = (peca: PecaPermanente) => {
    setPecasPermanentes(prev => [...prev.filter(p => p.movimentoId !== peca.movimentoId), peca]);
    
    // Sincronizar com o formato antigo de peças para manter compatibilidade
    const novaPeca: PecaProcessual = {
      id: peca.movimentoId,
      tipo: peca.tipoIdentificado,
      idProjudi: peca.idPeca
    };
    setPecas(prev => [...prev.filter(p => p.id !== peca.movimentoId), novaPeca]);
    
    // Se há divergência, atualizar as divergências antigas também
    if (peca.temDivergencia && peca.tipoInformadoSistema && peca.tipoRealIdentificado) {
      const novaDivergencia: DivergenciaClassificacao = {
        id: peca.movimentoId,
        tipoInformado: peca.tipoInformadoSistema,
        tipoReal: peca.tipoRealIdentificado,
        idPeca: peca.idPeca
      };
      setDivergencias(prev => [...prev.filter(d => d.id !== peca.movimentoId), novaDivergencia]);
      setFormData(prev => ({ ...prev, divergenciaClassificacao: "Sim" }));
    }
  };

  const handleRemoverPecaPermanente = (movimentoId: string) => {
    setPecasPermanentes(prev => prev.filter(p => p.movimentoId !== movimentoId));
    setPecas(prev => prev.filter(p => p.id !== movimentoId));
    setDivergencias(prev => prev.filter(d => d.id !== movimentoId));
    
    // Se não há mais divergências, limpar o campo
    if (divergencias.length <= 1) {
      setFormData(prev => ({ ...prev, divergenciaClassificacao: "" }));
    }
  };

  // Carregar dados da avaliação anterior ao montar ou quando avaliacaoAnterior mudar
  // Este efeito restaura dados salvos quando o avaliador está editando uma avaliação existente
  useEffect(() => {
    if (avaliacaoAnterior) {
      setPecasPermanentes([]);
      // Carregar form data completa com todos os campos preenchidos anteriormente
      setFormData({
        descricaoAssuntoFaltante: (avaliacaoAnterior.descricao_assunto_faltante as string) || "",
        assuntoTpu: (avaliacaoAnterior.assunto_tpu as string) || "",
        hierarquiaCorreta: (avaliacaoAnterior.hierarquia_correta as string) || "",
        divergenciaHierarquia: (avaliacaoAnterior.divergencia_hierarquia as string) || "",
        destinacaoPermanente: (avaliacaoAnterior.destinacao_permanente as string) || "",
        descricaoSituacaoArquivamento: (avaliacaoAnterior.descricao_situacao_arquivamento as string) || "",
        inconsistenciaPrazo: (avaliacaoAnterior.inconsistencia_prazo as string) || "",
        observacoesPecas: (avaliacaoAnterior.observacoes_pecas as string) || "",
        documentoNaoLocalizado: (avaliacaoAnterior.documento_nao_localizado as boolean) || false,
        documentoDuplicado: (avaliacaoAnterior.documento_duplicado as boolean) || false,
        erroTecnico: (avaliacaoAnterior.erro_tecnico as boolean) || false,
        ocorrenciasOutroDetalhe: (avaliacaoAnterior.ocorrencias_outro_detalhe as string) || "",
        divergenciaClassificacao: (avaliacaoAnterior.divergencia_classificacao as string) || "",
        processoVazio: (avaliacaoAnterior.processo_vazio as boolean) || false,
        observacoesGerais: (avaliacaoAnterior.observacoes_gerais as string) || "",
      });

      // Carregar peças se existirem (processos documentados anteriormente)
      if (avaliacaoAnterior.pecas_combinado) {
        // Parse das peças do formato concatenado
        // Esperamos que seja "Tipo1: ID1 | Tipo2: ID2"
        const pecasString = avaliacaoAnterior.pecas_combinado as string;
        const pecasArray = pecasString.split(" | ").filter((p: string) => p.trim());
        const novasPecas: PecaProcessual[] = pecasArray.map((p: string) => {
          const [tipo, idProjudi] = p.split(": ");
          return {
            id: crypto.randomUUID(),
            tipo: tipo?.trim() || "",
            idProjudi: idProjudi?.trim() || "",
          };
        });
        setPecas(novasPecas);
      } else {
        // Se não há peças anteriores, iniciar com lista vazia para novo preenchimento
        setPecas([]);
      }

      // Carregar divergências de classificação se existirem
      if (avaliacaoAnterior.divergencia_classificacao === "Sim" && avaliacaoAnterior.divergencias_detalhes) {
        // Parse das divergências do formato concatenado
        // Esperamos que seja "Tipo1 → Real1 (ID: id1) | Tipo2 → Real2 (ID: id2)"
        const divergenciasString = avaliacaoAnterior.divergencias_detalhes as string;
        const divergenciasArray = divergenciasString.split(" | ").filter((d: string) => d.trim());
        const novasDivergencias: DivergenciaClassificacao[] = divergenciasArray.map((d: string) => {
          const match = d.match(/(.+?)\s*→\s*(.+?)\s*\(ID:\s*(.+?)\)/);
          if (match) {
            return {
              id: crypto.randomUUID(),
              tipoInformado: match[1]?.trim() || "",
              tipoReal: match[2]?.trim() || "",
              idPeca: match[3]?.trim() || "",
            };
          }
          return { id: crypto.randomUUID(), tipoInformado: "", tipoReal: "", idPeca: "" };
        });
        setDivergencias(novasDivergencias);
      } else {
        // Se não há divergências anteriores, iniciar lista vazia
        setDivergencias([]);
      }
    } else {
      // Modo de nova avaliação: limpar formulário e inicializar com campos vazios
      setPecas([]);
      setPecasPermanentes([]);
      setFormData(initialFormData);
      setDivergencias([]);
    }
  }, [avaliacaoAnterior, processo.CODIGO_PROCESSO]);

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

    // Validar IDs de peças duplicados
    const idsPreenchidos = pecas.map(p => p.idProjudi.trim()).filter(Boolean);
    const idsDuplicados = idsPreenchidos.filter((id, index) => idsPreenchidos.indexOf(id) !== index);
    if (idsDuplicados.length > 0) {
      toast.error(`IDs de peça duplicados: ${[...new Set(idsDuplicados)].join(", ")}`);
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

      {/* Seção 4 - Peças Processuais (usando dados reais do CSV) */}
      <PainelPecasProcessuais
        dadosConcatenados={{
          movimentoCodigo: processo.MOV_CODIGOS || undefined,
          movimentoDescricao: processo.MOV_DESCRICOES || undefined,
          complemento: processo.MOV_COMPLEMENTOS || undefined,
          movimentoData: processo.MOV_DATAS || undefined,
          idsPecas: processo.PECAS_IDS || "",
          tiposPecas: processo.PECAS_TIPOS || ""
        }}
        pecasPermanentes={pecasPermanentes}
        onAdicionarPecaPermanente={handleAdicionarPecaPermanente}
        onRemoverPecaPermanente={handleRemoverPecaPermanente}
        observacoesPecas={formData.observacoesPecas}
        onObservacoesChange={(value) => setFormData({ ...formData, observacoesPecas: value })}
        ocorrencias={{
          documentoNaoLocalizado: formData.documentoNaoLocalizado,
          documentoDuplicado: formData.documentoDuplicado,
          erroTecnico: formData.erroTecnico,
          outroDetalhe: formData.ocorrenciasOutroDetalhe
        }}
        onOcorrenciasChange={(ocorrencias) => setFormData({
          ...formData,
          documentoNaoLocalizado: ocorrencias.documentoNaoLocalizado,
          documentoDuplicado: ocorrencias.documentoDuplicado,
          erroTecnico: ocorrencias.erroTecnico,
          ocorrenciasOutroDetalhe: ocorrencias.outroDetalhe
        })}
      />

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

      {/* Botões de Ação */}
      <div className="sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-lg">
        <div className="flex gap-3">
          {/* Botão Finalizar Avaliação - apenas se não estiver em modo edição */}
          {!modoEdicao && onFinalizarAvaliacao && (
            <Button 
              onClick={onFinalizarAvaliacao} 
              disabled={carregando} 
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Finalizar avaliação
            </Button>
          )}
          
          {/* Botão Salvar */}
          <Button onClick={handleSubmit} disabled={carregando} className="flex-1" size="lg">
            {carregando ? (
              <>Salvando...</>
            ) : modoEdicao ? (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar alterações
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar e próximo
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
