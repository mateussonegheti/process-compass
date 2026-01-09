import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Eye,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { PecaParaClassificar, TIPOS_DOCUMENTAIS, ClassificacaoIA } from "@/types/classificador";
import { supabase } from "@/integrations/supabase/client";

// Função para extrair texto de PDF usando pdf.js (simplificado - texto básico)
async function extrairTextoPDF(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Extração básica de texto do PDF (procura por streams de texto)
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
        
        // Se não encontrou texto, tentar outro método
        if (text.length < 100) {
          // Procurar por texto legível
          const legibleText = content.match(/[A-Za-záéíóúâêîôûãõçÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]{10,}/g);
          if (legibleText) {
            text = legibleText.join(" ");
          }
        }
        
        resolve(text.trim() || "Não foi possível extrair texto. O PDF pode ser uma imagem escaneada.");
      } catch {
        resolve("Erro ao processar o PDF. Verifique se o arquivo não está corrompido.");
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function ClassificadorIA() {
  const [responsavel, setResponsavel] = useState("");
  const [sessaoIniciada, setSessaoIniciada] = useState(false);
  const [pecas, setPecas] = useState<PecaParaClassificar[]>([]);
  const [pecaAtualIndex, setPecaAtualIndex] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [processandoIA, setProcessandoIA] = useState(false);

  const pecaAtual = pecas[pecaAtualIndex];
  const totalPendentes = pecas.filter(p => p.status === 'PENDENTE').length;
  const totalClassificadas = pecas.filter(p => p.status === 'AGUARDANDO_CONFIRMACAO').length;
  const totalConfirmadas = pecas.filter(p => p.status === 'CONFIRMADO').length;

  const handleUploadPDFs = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCarregando(true);
    const novasPecas: PecaParaClassificar[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        const texto = await extrairTextoPDF(file);
        novasPecas.push({
          id: `${Date.now()}-${i}`,
          nomeArquivo: file.name,
          conteudoTexto: texto,
          arquivo: file,
          status: 'PENDENTE'
        });
      }
    }

    if (novasPecas.length > 0) {
      setPecas(prev => [...prev, ...novasPecas]);
      toast.success(`${novasPecas.length} PDF(s) carregado(s) com sucesso!`);
    } else {
      toast.error("Nenhum arquivo PDF válido selecionado");
    }

    setCarregando(false);
    e.target.value = '';
  }, []);

  const classificarPeca = async (peca: PecaParaClassificar) => {
    setProcessandoIA(true);
    
    try {
      setPecas(prev => prev.map(p => 
        p.id === peca.id ? { ...p, status: 'CLASSIFICANDO' } : p
      ));

      const { data, error } = await supabase.functions.invoke('classificar-peca', {
        body: { 
          textoDocumento: peca.conteudoTexto,
          nomeArquivo: peca.nomeArquivo
        }
      });

      if (error) throw error;

      const classificacao: ClassificacaoIA = data.classificacao;

      setPecas(prev => prev.map(p => 
        p.id === peca.id 
          ? { ...p, status: 'AGUARDANDO_CONFIRMACAO', classificacaoIA: classificacao }
          : p
      ));

      toast.success(`Classificado como: ${classificacao.tipoDocumental} (${classificacao.confianca}%)`);
    } catch (error) {
      console.error("Erro ao classificar:", error);
      setPecas(prev => prev.map(p => 
        p.id === peca.id ? { ...p, status: 'ERRO' } : p
      ));
      toast.error("Erro ao classificar o documento");
    } finally {
      setProcessandoIA(false);
    }
  };

  const classificarTodas = async () => {
    const pendentes = pecas.filter(p => p.status === 'PENDENTE');
    for (const peca of pendentes) {
      await classificarPeca(peca);
      // Pequeno delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
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

    toast.success(`Classificação confirmada: ${tipo}`);

    // Ir para próxima peça pendente de confirmação
    const proximaIndex = pecas.findIndex((p, i) => 
      i > pecaAtualIndex && p.status === 'AGUARDANDO_CONFIRMACAO'
    );
    if (proximaIndex !== -1) {
      setPecaAtualIndex(proximaIndex);
    } else {
      // Procurar desde o início
      const primeiraIndex = pecas.findIndex(p => p.status === 'AGUARDANDO_CONFIRMACAO');
      if (primeiraIndex !== -1 && primeiraIndex !== pecaAtualIndex) {
        setPecaAtualIndex(primeiraIndex);
      }
    }
  };

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 80) return "text-green-600 bg-green-50";
    if (confianca >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status: PecaParaClassificar['status']) => {
    switch (status) {
      case 'PENDENTE':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'CLASSIFICANDO':
        return <Badge className="bg-blue-500">Classificando...</Badge>;
      case 'AGUARDANDO_CONFIRMACAO':
        return <Badge className="bg-yellow-500">Aguardando</Badge>;
      case 'CONFIRMADO':
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case 'ERRO':
        return <Badge variant="destructive">Erro</Badge>;
    }
  };

  // Tela inicial - identificação
  if (!sessaoIniciada) {
    return (
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Classificador IA de Peças</CardTitle>
          <CardDescription>
            Sistema de classificação automática de documentos processuais com confirmação humana
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
          <Button 
            className="w-full" 
            onClick={() => setSessaoIniciada(true)}
            disabled={!responsavel.trim()}
          >
            Iniciar Sessão de Classificação
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">Avaliador: {responsavel}</span>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Pendentes: {totalPendentes}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span>Aguardando: {totalClassificadas}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span>Confirmadas: {totalConfirmadas}</span>
              </div>
            </div>
          </div>
          {pecas.length > 0 && (
            <Progress 
              value={(totalConfirmadas / pecas.length) * 100} 
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* Upload de PDFs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Peças (PDF)
          </CardTitle>
          <CardDescription>
            Carregue os PDFs das peças processuais para classificação automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <Label htmlFor="pdf-upload" className="cursor-pointer">
              <span className="text-primary font-medium hover:underline">
                Clique para selecionar PDFs
              </span>
              <span className="text-muted-foreground"> ou arraste os arquivos</span>
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
              Múltiplos arquivos PDF permitidos
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de peças */}
      {pecas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Peças Carregadas ({pecas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y max-h-60 overflow-y-auto">
              {pecas.map((peca, index) => (
                <div 
                  key={peca.id} 
                  className={`flex items-center justify-between py-2 px-2 cursor-pointer hover:bg-muted/50 rounded ${index === pecaAtualIndex ? 'bg-primary/10' : ''}`}
                  onClick={() => setPecaAtualIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm truncate max-w-[200px]">{peca.nomeArquivo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {peca.classificacaoIA && (
                      <span className="text-xs text-muted-foreground">
                        {peca.classificacaoIA.tipoDocumental}
                      </span>
                    )}
                    {getStatusBadge(peca.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Painel de confirmação */}
      {pecaAtual && pecaAtual.status === 'AGUARDANDO_CONFIRMACAO' && pecaAtual.classificacaoIA && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Confirmar Classificação
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPecaAtualIndex(Math.max(0, pecaAtualIndex - 1))}
                  disabled={pecaAtualIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground py-1">
                  {pecaAtualIndex + 1} / {pecas.length}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setPecaAtualIndex(Math.min(pecas.length - 1, pecaAtualIndex + 1))}
                  disabled={pecaAtualIndex === pecas.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info do arquivo */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{pecaAtual.nomeArquivo}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {pecaAtual.conteudoTexto?.substring(0, 300)}...
              </p>
            </div>

            {/* Classificação da IA */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Tipo Identificado pela IA</Label>
                <div className="mt-1 text-xl font-semibold">
                  {pecaAtual.classificacaoIA.tipoDocumental}
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Confiança</Label>
                <div className={`mt-1 text-xl font-semibold inline-block px-3 py-1 rounded ${getConfiancaColor(pecaAtual.classificacaoIA.confianca)}`}>
                  {pecaAtual.classificacaoIA.confianca}%
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Motivo da Classificação</Label>
              <p className="mt-1 text-sm">{pecaAtual.classificacaoIA.motivo}</p>
            </div>

            {pecaAtual.classificacaoIA.elementosEncontrados.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Elementos Encontrados</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {pecaAtual.classificacaoIA.elementosEncontrados.map((elem, i) => (
                    <Badge key={i} variant="outline">{elem}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/30 rounded-lg p-4">
              <Label className="text-muted-foreground">Destinação Sugerida</Label>
              <div className="mt-1 flex items-center gap-2">
                {pecaAtual.classificacaoIA.destinacao === 'Guarda Permanente' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {pecaAtual.classificacaoIA.destinacao === 'Eliminação' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {pecaAtual.classificacaoIA.destinacao === 'Análise Manual' && (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="font-medium">{pecaAtual.classificacaoIA.destinacao}</span>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex gap-3">
                <Button 
                  className="flex-1"
                  onClick={() => confirmarClassificacao()}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Classificação
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => classificarPeca(pecaAtual)}
                  disabled={processandoIA}
                >
                  <RefreshCw className={`h-4 w-4 ${processandoIA ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div>
                <Label>Ou ajustar para outro tipo:</Label>
                <div className="flex gap-2 mt-2">
                  <Select onValueChange={(value) => confirmarClassificacao(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar outro tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPOS_DOCUMENTAIS.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo final */}
      {totalConfirmadas > 0 && totalConfirmadas === pecas.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-green-800">
              Todas as peças foram classificadas!
            </h3>
            <p className="text-green-700 mt-2">
              {totalConfirmadas} peças processadas e confirmadas.
            </p>
            <Button 
              className="mt-4"
              variant="outline"
              onClick={() => {
                // Aqui poderia exportar ou salvar os resultados
                const resultados = pecas.map(p => ({
                  arquivo: p.nomeArquivo,
                  tipo: p.classificacaoFinal,
                  confianca: p.classificacaoIA?.confianca,
                  confirmadoPor: p.confirmadoPor,
                  data: p.dataConfirmacao
                }));
                console.log("Resultados:", resultados);
                toast.success("Resultados prontos para exportação!");
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
