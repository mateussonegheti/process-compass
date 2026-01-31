import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ExternalLink, 
  FileCheck, 
  AlertTriangle, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText
} from "lucide-react";
import { TIPOS_PECA } from "@/types/cogede";

// Interface para movimento processual (virá da planilha de importação)
export interface MovimentoProcessual {
  id: string;
  codigo: string;
  descricao: string;
  complemento?: string;
  data: string;
  tipoInformado: string;
  idPeca: string;
}

// Interface para peça identificada como permanente
export interface PecaPermanente {
  movimentoId: string;
  tipoIdentificado: string;
  idPeca: string;
  temDivergencia: boolean;
  tipoInformadoSistema?: string;
  tipoRealIdentificado?: string;
}

// Interface para dados concatenados do CSV
export interface DadosMovimentosConcatenados {
  movimentoCodigo?: string;      // "101 | 102 | 103"
  movimentoDescricao?: string;   // "Petição Inicial | Despacho | Sentença"
  complemento?: string;          // "Distribuição | Cite-se | Procedente"
  movimentoData?: string;        // "01/01/2020 | 05/01/2020 | 15/06/2020"
  idsPecas: string;              // "506978 | 506979 | 539990"
  tiposPecas: string;            // "Petição Inicial | Despacho | Sentença"
}

interface PainelPecasProcessuaisProps {
  // Pode receber movimentos já parseados OU dados concatenados do CSV
  movimentos?: MovimentoProcessual[];
  dadosConcatenados?: DadosMovimentosConcatenados;
  pecasPermanentes: PecaPermanente[];
  onAdicionarPecaPermanente: (peca: PecaPermanente) => void;
  onRemoverPecaPermanente: (movimentoId: string) => void;
  observacoesPecas: string;
  onObservacoesChange: (value: string) => void;
  ocorrencias: {
    documentoNaoLocalizado: boolean;
    documentoDuplicado: boolean;
    erroTecnico: boolean;
    outroDetalhe: string;
  };
  onOcorrenciasChange: (ocorrencias: {
    documentoNaoLocalizado: boolean;
    documentoDuplicado: boolean;
    erroTecnico: boolean;
    outroDetalhe: string;
  }) => void;
}

// URL base do Projudi para visualização de peças
const PROJUDI_BASE_URL = "https://projudi.tjmg.jus.br/projudi/listagens/DownloadArquivo?arquivo=";

// Função para fazer parse das listas concatenadas
function parseMovimentosConcatenados(dados: DadosMovimentosConcatenados): MovimentoProcessual[] {
  const ids = dados.idsPecas?.split(" | ").map(s => s.trim()).filter(Boolean) || [];
  const tipos = dados.tiposPecas?.split(" | ").map(s => s.trim()).filter(Boolean) || [];
  const codigos = dados.movimentoCodigo?.split(" | ").map(s => s.trim()) || [];
  const descricoes = dados.movimentoDescricao?.split(" | ").map(s => s.trim()) || [];
  const complementos = dados.complemento?.split(" | ").map(s => s.trim()) || [];
  const datas = dados.movimentoData?.split(" | ").map(s => s.trim()) || [];

  // O array de IDs é a referência principal
  return ids.map((idPeca, index) => ({
    id: `mov-${index}-${idPeca}`,
    codigo: codigos[index] || String(index + 1),
    descricao: descricoes[index] || tipos[index] || "Documento",
    complemento: complementos[index] || undefined,
    data: datas[index] || "",
    tipoInformado: tipos[index] || "Outros",
    idPeca: idPeca
  }));
}

export function PainelPecasProcessuais({
  movimentos: movimentosProps,
  dadosConcatenados,
  pecasPermanentes,
  onAdicionarPecaPermanente,
  onRemoverPecaPermanente,
  observacoesPecas,
  onObservacoesChange,
  ocorrencias,
  onOcorrenciasChange
}: PainelPecasProcessuaisProps) {
  const [movimentoSelecionado, setMovimentoSelecionado] = useState<MovimentoProcessual | null>(null);
  const [modoIdentificacao, setModoIdentificacao] = useState(false);
  const [tipoIdentificado, setTipoIdentificado] = useState("");
  const [idPecaEditavel, setIdPecaEditavel] = useState("");
  const [temDivergencia, setTemDivergencia] = useState(false);
  const [tipoRealDivergencia, setTipoRealDivergencia] = useState("");

  // Fazer parse dos movimentos: usa props direto ou dados concatenados do CSV (SEM MOCK)
  const movimentos = useMemo(() => {
    if (movimentosProps && movimentosProps.length > 0) {
      return movimentosProps;
    }
    if (dadosConcatenados && dadosConcatenados.idsPecas) {
      return parseMovimentosConcatenados(dadosConcatenados);
    }
    // Se não há dados, retornar lista vazia (sem mock)
    return [];
  }, [movimentosProps, dadosConcatenados]);
  // Verificar se um movimento já foi identificado como permanente
  const isPecaPermanente = useCallback((movimentoId: string) => {
    return pecasPermanentes.some(p => p.movimentoId === movimentoId);
  }, [pecasPermanentes]);

  // Verificar se um movimento tem divergência registrada
  const temDivergenciaRegistrada = useCallback((movimentoId: string) => {
    const peca = pecasPermanentes.find(p => p.movimentoId === movimentoId);
    return peca?.temDivergencia || false;
  }, [pecasPermanentes]);

  // Selecionar movimento
  const handleSelecionarMovimento = (movimento: MovimentoProcessual) => {
    setMovimentoSelecionado(movimento);
    setModoIdentificacao(false);
    setTipoIdentificado(movimento.tipoInformado);
    setIdPecaEditavel(movimento.idPeca);
    setTemDivergencia(false);
    setTipoRealDivergencia("");
  };

  // Iniciar identificação de peça permanente
  const handleIniciarIdentificacao = () => {
    setModoIdentificacao(true);
  };

  // Salvar identificação da peça
  const handleSalvarIdentificacao = () => {
    if (!movimentoSelecionado) return;

    const novaPeca: PecaPermanente = {
      movimentoId: movimentoSelecionado.id,
      tipoIdentificado,
      idPeca: idPecaEditavel,
      temDivergencia,
      tipoInformadoSistema: temDivergencia ? movimentoSelecionado.tipoInformado : undefined,
      tipoRealIdentificado: temDivergencia ? tipoRealDivergencia : undefined
    };

    onAdicionarPecaPermanente(novaPeca);
    
    // Limpar formulário e voltar ao estado inicial
    setModoIdentificacao(false);
    setMovimentoSelecionado(null);
    setTipoIdentificado("");
    setIdPecaEditavel("");
    setTemDivergencia(false);
    setTipoRealDivergencia("");
  };

  // Remover identificação
  const handleRemoverIdentificacao = () => {
    if (!movimentoSelecionado) return;
    onRemoverPecaPermanente(movimentoSelecionado.id);
    setMovimentoSelecionado(null);
    setModoIdentificacao(false);
  };

  // Gerar URL da peça
  const gerarUrlPeca = (idPeca: string) => `${PROJUDI_BASE_URL}${idPeca}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
            4
          </span>
          Peças Processuais
          <Badge variant="outline" className="ml-auto">
            {pecasPermanentes.length} peça(s) permanente(s)
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Movimentos processuais e identificação de peças de guarda permanente
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Layout side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
          
          {/* Área A - Lista de Movimentos */}
          <div className="border rounded-lg">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Movimentos do Processo
              </h3>
            </div>
            
            <ScrollArea className="h-[450px]">
              <div className="p-2 space-y-2">
                {movimentos.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground py-12">
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">
                        Nenhuma peça processual disponível.<br />
                        <span className="text-xs">Os dados de peças serão carregados da planilha de importação.</span>
                      </p>
                    </div>
                  </div>
                ) : movimentos.map((movimento) => {
                  const isPermanente = isPecaPermanente(movimento.id);
                  const temDiverg = temDivergenciaRegistrada(movimento.id);
                  const isSelected = movimentoSelecionado?.id === movimento.id;
                  
                  return (
                    <div
                      key={movimento.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                        ${isPermanente && !isSelected ? 'bg-green-50 border-green-200' : ''}
                        ${temDiverg && !isSelected ? 'bg-amber-50 border-amber-200' : ''}
                      `}
                      onClick={() => handleSelecionarMovimento(movimento)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Mov. {movimento.codigo}</span>
                            <span className="font-medium text-sm">{movimento.descricao}</span>
                            {isPermanente && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {temDiverg && (
                              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            )}
                          </div>
                          
                          {movimento.complemento && (
                            <p className="text-xs text-muted-foreground truncate">
                              {movimento.complemento}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Data: {movimento.data}</span>
                            <span>•</span>
                            <span>Tipo: {movimento.tipoInformado}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              ID: {movimento.idPeca}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(gerarUrlPeca(movimento.idPeca), '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Abrir peça
                            </Button>
                          </div>
                        </div>
                        
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {/* Área B - Identificação da Peça */}
          <div className="border rounded-lg">
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Identificação da Peça
              </h3>
            </div>
            
            <div className="p-4 h-[450px] overflow-y-auto">
              {!movimentoSelecionado ? (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      Selecione um movimento à esquerda<br />
                      para identificar peça de guarda permanente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Contexto do movimento (somente leitura) */}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Movimento selecionado
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Código:</span>
                        <span className="ml-1 font-medium">{movimentoSelecionado.codigo}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data:</span>
                        <span className="ml-1 font-medium">{movimentoSelecionado.data}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Descrição:</span>
                      <p className="text-sm font-medium">{movimentoSelecionado.descricao}</p>
                    </div>
                    {movimentoSelecionado.complemento && (
                      <div>
                        <span className="text-sm text-muted-foreground">Complemento:</span>
                        <p className="text-sm">{movimentoSelecionado.complemento}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Tipo informado:</span>
                      <Badge variant="outline" className="ml-2">{movimentoSelecionado.tipoInformado}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">ID da peça:</span>
                      <code className="bg-background px-2 py-0.5 rounded text-sm">{movimentoSelecionado.idPeca}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={() => window.open(gerarUrlPeca(movimentoSelecionado.idPeca), '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                    </div>
                  </div>

                  {/* Verificar se já foi identificado */}
                  {isPecaPermanente(movimentoSelecionado.id) ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 mb-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Peça identificada como permanente</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoverIdentificacao}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remover identificação
                      </Button>
                    </div>
                  ) : !modoIdentificacao ? (
                    /* Ação principal - botão para identificar */
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Se esta peça for de guarda permanente,<br />
                        registre sua identificação abaixo.
                      </p>
                      <Button onClick={handleIniciarIdentificacao}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Identificar peça permanente
                      </Button>
                    </div>
                  ) : (
                    /* Formulário de identificação */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo da peça identificada</Label>
                        <Select value={tipoIdentificado} onValueChange={setTipoIdentificado}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_PECA.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>ID da peça</Label>
                        <Input
                          value={idPecaEditavel}
                          onChange={(e) => setIdPecaEditavel(e.target.value)}
                          placeholder="ID da peça no Projudi"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Link para visualização</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs truncate">
                            {gerarUrlPeca(idPecaEditavel)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(gerarUrlPeca(idPecaEditavel), '_blank')}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Divergência */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            id="divergencia"
                            checked={temDivergencia}
                            onCheckedChange={(c) => setTemDivergencia(c as boolean)}
                          />
                          <Label htmlFor="divergencia" className="text-sm font-normal">
                            Divergência entre o movimento/peça e o tipo identificado
                          </Label>
                        </div>

                        {temDivergencia && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">Tipo informado no sistema</Label>
                              <Input
                                value={movimentoSelecionado.tipoInformado}
                                disabled
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">Tipo identificado pelo avaliador</Label>
                              <Select value={tipoRealDivergencia} onValueChange={setTipoRealDivergencia}>
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Selecione o tipo real..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIPOS_PECA.map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>
                                      {tipo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">ID da peça usada para verificação</Label>
                              <Input
                                value={idPecaEditavel}
                                disabled
                                className="bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botão salvar */}
                      <Button 
                        onClick={handleSalvarIdentificacao} 
                        className="w-full"
                        disabled={!tipoIdentificado || !idPecaEditavel}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Salvar identificação da peça
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campo global - Observações e Ocorrências */}
        <div className="mt-6 space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label>4.3 Observações sobre peças</Label>
            <Textarea
              placeholder="Adicione observações sobre as peças processuais..."
              value={observacoesPecas}
              onChange={(e) => onObservacoesChange(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Ocorrências</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docNaoLoc"
                  checked={ocorrencias.documentoNaoLocalizado}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, documentoNaoLocalizado: c as boolean })}
                />
                <Label htmlFor="docNaoLoc" className="text-sm font-normal">
                  Documento não localizado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docDup"
                  checked={ocorrencias.documentoDuplicado}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, documentoDuplicado: c as boolean })}
                />
                <Label htmlFor="docDup" className="text-sm font-normal">
                  Documento duplicado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="erroTec"
                  checked={ocorrencias.erroTecnico}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, erroTecnico: c as boolean })}
                />
                <Label htmlFor="erroTec" className="text-sm font-normal">
                  Erro técnico
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Outro detalhe de ocorrência</Label>
              <Input
                placeholder="Descreva outra ocorrência se necessário..."
                value={ocorrencias.outroDetalhe}
                onChange={(e) => onOcorrenciasChange({ ...ocorrencias, outroDetalhe: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
