import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  SkipForward,
  Eye,
  Shield,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { PecaParaClassificar, TIPOS_DOCUMENTAIS, ClassificacaoIA } from "@/types/classificador";
import { supabase } from "@/integrations/supabase/client";

// Função para extrair texto de PDF
async function extrairTextoPDF(file: File): Promise<{ texto: string; imagemBase64?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Extração básica de texto do PDF
        let text = "";
        const decoder = new TextDecoder("latin1");
        const content = decoder.decode(bytes);
        
        // Extrair texto entre parênteses (formato PDF básico)
        const matches = content.match(/\(([^)]+)\)/g);
        if (matches) {
          text = matches
            .map(m => m.slice(1, -1))
            .filter(t => t.length > 2 && !/^[0-9.]+$/.test(t))
            .join(" ");
        }
        
        // Se não encontrou texto suficiente, pode ser PDF escaneado
        if (text.length < 100) {
          const legibleText = content.match(/[A-Za-záéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{10,}/g);
          if (legibleText) {
            text = legibleText.join(" ");
          }
        }
        
        // Converter para base64 para OCR se texto insuficiente
        let imagemBase64: string | undefined;
        if (text.length < 100) {
          imagemBase64 = btoa(String.fromCharCode(...bytes));
        }
        
        resolve({ 
          texto: text.trim() || "", 
          imagemBase64 
        });
      } catch {
        resolve({ texto: "" });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function ClassificadorIA() {
  const [responsavel, setResponsavel] = useState("");
  const [codigoProcesso, setCodigoProcesso] = useState("");
  const [sessaoIniciada, setSessaoIniciada] = useState(false);
  const [modoRevisao, setModoRevisao] = useState(false);
  const [pecas, setPecas] = useState<PecaParaClassificar[]>([]);
  const [pecaAtualIndex, setPecaAtualIndex] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [tipoAlternativo, setTipoAlternativo] = useState("");

  const pecaAtual = pecas[pecaAtualIndex];
  const totalPendentes = pecas.filter(p => p.status === 'PENDENTE').length;
  const totalAguardando = pecas.filter(p => p.status === 'AGUARDANDO_CONFIRMACAO').length;
  const totalConfirmadas = pecas.filter(p => p.status === 'CONFIRMADO').length;
  const totalRejeitadas = pecas.filter(p => p.status === 'REJEITADO').length;
  const pecasParaRevisar = pecas.filter(p => p.status === 'AGUARDANDO_CONFIRMACAO');

  const handleUploadPDFs = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCarregando(true);
    const novasPecas: PecaParaClassificar[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const { texto, imagemBase64 } = await extrairTextoPDF(file);
        novasPecas.push({
          id: `${Date.now()}-${i}`,
          nomeArquivo: file.name,
          codigoProcesso: codigoProcesso,
          conteudoTexto: texto,
          imagemPreview: imagemBase64,
          arquivo: file,
          status: 'PENDENTE'
        });
      }
    }

    if (novasPecas.length > 0) {
      setPecas(prev => [...prev, ...novasPecas]);
      toast.success(`${novasPecas.length} PDF(s) carregado(s)!`);
    } else {
      toast.error("Nenhum PDF válido");
    }

    setCarregando(false);
    e.target.value = '';
  }, [codigoProcesso]);

  const classificarPeca = async (peca: PecaParaClassificar) => {
    setProcessandoIA(true);
    
    try {
      setPecas(prev => prev.map(p => 
        p.id === peca.id ? { ...p, status: 'CLASSIFICANDO' } : p
      ));

      const { data, error } = await supabase.functions.invoke('classificar-peca', {
        body: { 
          textoDocumento: peca.conteudoTexto,
          imagemBase64: peca.imagemPreview
        }
      });

      if (error) throw error;

      const classificacao: ClassificacaoIA = data.classificacao;

      setPecas(prev => prev.map(p => 
        p.id === peca.id 
          ? { ...p, status: 'AGUARDANDO_CONFIRMACAO', classificacaoIA: classificacao }
          : p
      ));

      toast.success(`${classificacao.tipoDocumental} (${classificacao.confianca}%) - ${classificacao.auditoriaAprovada ? '✓ Auditoria OK' : '⚠ Revisar'}`);
    } catch (error) {
      console.error("Erro ao classificar:", error);
      setPecas(prev => prev.map(p => 
        p.id === peca.id ? { ...p, status: 'ERRO' } : p
      ));
      toast.error("Erro ao classificar");
    } finally {
      setProcessandoIA(false);
    }
  };

  const classificarTodas = async () => {
    const pendentes = pecas.filter(p => p.status === 'PENDENTE');
    for (const peca of pendentes) {
      await classificarPeca(peca);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    if (pendentes.length > 0) {
      toast.success("Classificação automática concluída! Inicie a revisão.");
    }
  };

  const confirmarClassificacao = (tipoFinal?: string) => {
    if (!pecaAtual) return;

    const tipo = tipoFinal || pecaAtual.classificacaoIA?.tipoDocumental || "Outros/Não Identificado";

    setPecas(prev => prev.map(p => 
      p.id === pecaAtual.id 
        ? { 
            ...p, 
            status: 'CONFIRMADO', 
            classificacaoFinal: tipo,
            confirmadoPor: responsavel,
            dataConfirmacao: new Date().toISOString()
          }
        : p
    ));

    toast.success(`✓ ${tipo}`);
    irParaProximaPeca();
  };

  const rejeitarClassificacao = () => {
    if (!pecaAtual) return;

    setPecas(prev => prev.map(p => 
      p.id === pecaAtual.id 
        ? { ...p, status: 'REJEITADO' }
        : p
    ));

    toast.info("✗ Rejeitado - revisão manual necessária");
    irParaProximaPeca();
  };

  const irParaProximaPeca = () => {
    const pecasRestantes = pecas.filter(p => p.status === 'AGUARDANDO_CONFIRMACAO');
    const proximaIndex = pecas.findIndex(p => 
      p.status === 'AGUARDANDO_CONFIRMACAO' && p.id !== pecaAtual?.id
    );
    
    if (proximaIndex !== -1) {
      setPecaAtualIndex(proximaIndex);
    } else if (pecasRestantes.length === 0) {
      setModoRevisao(false);
      toast.success("Todas as peças foram revisadas!");
    }
  };

  const iniciarRevisao = () => {
    const primeiraAguardando = pecas.findIndex(p => p.status === 'AGUARDANDO_CONFIRMACAO');
    if (primeiraAguardando !== -1) {
      setPecaAtualIndex(primeiraAguardando);
      setModoRevisao(true);
    } else {
      toast.info("Nenhuma peça aguardando revisão");
    }
  };

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 80) return "bg-green-500";
    if (confianca >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDestinacaoIcon = (destinacao: string) => {
    switch (destinacao) {
      case 'Guarda Permanente':
        return <Shield className="h-5 w-5 text-green-500" />;
      case 'Eliminação':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  // Tela inicial
  if (!sessaoIniciada) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Classificador IA de Peças</CardTitle>
          <CardDescription>
            Pipeline de 3 IAs: Extração → Classificação → Auditoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="responsavel">Nome do Avaliador</Label>
            <Input
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              placeholder="Digite seu nome completo"
            />
          </div>
          <div>
            <Label htmlFor="processo">Código do Processo (opcional)</Label>
            <Input
              id="processo"
              value={codigoProcesso}
              onChange={(e) => setCodigoProcesso(e.target.value)}
              placeholder="Ex: 0024517-43.2024.8.13.0024"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={() => setSessaoIniciada(true)}
            disabled={!responsavel.trim()}
          >
            Iniciar Sessão
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Modo Revisão Estilo Tinder
  if (modoRevisao && pecaAtual && pecaAtual.status === 'AGUARDANDO_CONFIRMACAO' && pecaAtual.classificacaoIA) {
    const classificacao = pecaAtual.classificacaoIA;
    
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header de progresso */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setModoRevisao(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div className="text-sm text-muted-foreground">
            {pecasParaRevisar.findIndex(p => p.id === pecaAtual.id) + 1} / {pecasParaRevisar.length + totalConfirmadas + totalRejeitadas}
          </div>
        </div>

        {/* Card Principal - Estilo Tinder */}
        <Card className="overflow-hidden">
          {/* Preview do documento */}
          <div className="bg-muted/50 p-6 border-b">
            <div className="flex items-start gap-4">
              <div className="w-20 h-28 bg-white rounded shadow flex items-center justify-center shrink-0">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{pecaAtual.nomeArquivo}</p>
                {codigoProcesso && (
                  <p className="text-sm text-muted-foreground mt-1">Processo: {codigoProcesso}</p>
                )}
                <div className="mt-3 text-sm text-muted-foreground line-clamp-4 bg-white/50 p-2 rounded">
                  {pecaAtual.conteudoTexto?.substring(0, 300) || "Documento processado via OCR"}...
                </div>
              </div>
            </div>
          </div>

          {/* Classificação da IA */}
          <CardContent className="pt-6 space-y-4">
            {/* Tipo e Confiança */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-2xl font-bold">
                <Sparkles className="h-6 w-6 text-primary" />
                {classificacao.tipoDocumental}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div className={`h-2 w-24 rounded-full bg-muted overflow-hidden`}>
                  <div 
                    className={`h-full ${getConfiancaColor(classificacao.confianca)}`}
                    style={{ width: `${classificacao.confianca}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{classificacao.confianca}%</span>
              </div>
            </div>

            {/* Destinação */}
            <div className="flex items-center justify-center gap-2 py-2">
              {getDestinacaoIcon(classificacao.destinacao)}
              <span className="font-medium">{classificacao.destinacao}</span>
            </div>

            {/* Auditoria */}
            <div className={`rounded-lg p-3 text-sm ${
              classificacao.auditoriaAprovada 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 font-medium mb-1">
                {classificacao.auditoriaAprovada ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {classificacao.auditoriaAprovada ? 'Auditoria Aprovada' : 'Necessita Revisão'}
              </div>
              <p className="text-xs">{classificacao.auditoriaMotivo}</p>
            </div>

            {/* Elementos encontrados */}
            {classificacao.elementosEncontrados.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Elementos identificados:</p>
                <div className="flex flex-wrap gap-1">
                  {classificacao.elementosEncontrados.slice(0, 5).map((elem, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{elem}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Motivo */}
            <div className="text-sm text-muted-foreground bg-muted/30 rounded p-3">
              <Eye className="h-4 w-4 inline mr-1" />
              {classificacao.motivo}
            </div>

            {/* Ajuste de tipo */}
            <div className="pt-2">
              <Label className="text-xs text-muted-foreground">Ou selecione outro tipo:</Label>
              <Select value={tipoAlternativo} onValueChange={setTipoAlternativo}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Alterar classificação..." />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_DOCUMENTAIS.map(tipo => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          {/* Ações - Estilo Tinder */}
          <div className="border-t p-6">
            <div className="flex items-center justify-center gap-6">
              {/* Rejeitar */}
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-16 rounded-full border-2 border-red-300 hover:border-red-500 hover:bg-red-50"
                onClick={rejeitarClassificacao}
              >
                <ThumbsDown className="h-6 w-6 text-red-500" />
              </Button>

              {/* Pular */}
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-12 rounded-full"
                onClick={irParaProximaPeca}
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              {/* Confirmar */}
              <Button
                size="lg"
                className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
                onClick={() => confirmarClassificacao(tipoAlternativo || undefined)}
              >
                <ThumbsUp className="h-6 w-6" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              👎 Rejeitar | ⏭ Pular | 👍 Confirmar
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Tela Principal
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">{responsavel}</span>
              {codigoProcesso && (
                <Badge variant="outline">{codigoProcesso}</Badge>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Pendentes: {totalPendentes}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span>Aguardando: {totalAguardando}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Confirmadas: {totalConfirmadas}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span>Rejeitadas: {totalRejeitadas}</span>
              </div>
            </div>
          </div>
          {pecas.length > 0 && (
            <Progress 
              value={((totalConfirmadas + totalRejeitadas) / pecas.length) * 100} 
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Peças (PDF)
          </CardTitle>
          <CardDescription>
            A IA irá: 1) Extrair chunks relevantes → 2) Classificar pelo mapa de elementos → 3) Auditar contra alucinações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <span className="text-primary font-medium hover:underline">
                Selecionar PDFs
              </span>
            </Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleUploadPDFs}
              disabled={carregando}
            />
            <p className="text-xs text-muted-foreground mt-2">
              OCR automático para PDFs escaneados
            </p>
          </div>

          {pecas.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={classificarTodas}
                disabled={processandoIA || totalPendentes === 0}
                className="flex-1"
              >
                {processandoIA ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Classificando...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Classificar Todas ({totalPendentes})
                  </>
                )}
              </Button>
              <Button
                onClick={iniciarRevisao}
                disabled={totalAguardando === 0}
                variant="secondary"
              >
                <Eye className="h-4 w-4 mr-2" />
                Revisar ({totalAguardando})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Peças */}
      {pecas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Peças ({pecas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y max-h-80 overflow-y-auto">
              {pecas.map((peca) => (
                <div 
                  key={peca.id} 
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{peca.nomeArquivo}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {peca.classificacaoIA && (
                      <span className="text-xs text-muted-foreground">
                        {peca.classificacaoFinal || peca.classificacaoIA.tipoDocumental}
                      </span>
                    )}
                    <Badge 
                      variant={
                        peca.status === 'CONFIRMADO' ? 'default' :
                        peca.status === 'REJEITADO' ? 'destructive' :
                        peca.status === 'AGUARDANDO_CONFIRMACAO' ? 'secondary' :
                        peca.status === 'ERRO' ? 'destructive' :
                        'outline'
                      }
                      className="text-xs"
                    >
                      {peca.status === 'CONFIRMADO' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {peca.status === 'REJEITADO' && <XCircle className="h-3 w-3 mr-1" />}
                      {peca.status === 'CLASSIFICANDO' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {peca.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Final */}
      {pecas.length > 0 && (totalConfirmadas + totalRejeitadas) === pecas.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800">
              Revisão Concluída!
            </h3>
            <p className="text-green-700 mt-2">
              {totalConfirmadas} confirmadas | {totalRejeitadas} rejeitadas
            </p>
            <Button 
              className="mt-4"
              onClick={() => {
                const resultados = pecas.map(p => ({
                  arquivo: p.nomeArquivo,
                  tipoClassificado: p.classificacaoIA?.tipoDocumental,
                  tipoFinal: p.classificacaoFinal || 'Rejeitado',
                  confianca: p.classificacaoIA?.confianca,
                  destinacao: p.classificacaoIA?.destinacao,
                  status: p.status,
                  confirmadoPor: p.confirmadoPor,
                  data: p.dataConfirmacao
                }));
                console.log("Resultados:", resultados);
                navigator.clipboard.writeText(JSON.stringify(resultados, null, 2));
                toast.success("Resultados copiados para a área de transferência!");
              }}
            >
              Exportar Resultados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
