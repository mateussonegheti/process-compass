import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  FileWarning
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface ProcessoCSV {
  NOME_PROCESSO_HASH: string;
  [key: string]: string;
}

interface ArchivalReport {
  UUID: string;
  Localizacao: string;
  Nome: string;
  [key: string]: string;
}

interface ResultadoMerge {
  processosComUUID: ProcessoCSV[];
  processosSemUUID: ProcessoCSV[];
  nomesNaoUsados: string[];
}

export function MergePlanilhas() {
  const [arquivoProcessos, setArquivoProcessos] = useState<File | null>(null);
  const [arquivoArchival, setArquivoArchival] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoMerge | null>(null);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
      const values = line.match(/(".*?"|[^,]+)/g) || [];
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = (values[index] || '').replace(/^"|"$/g, '').trim();
      });
      return obj;
    });
  };

  const executarMerge = async () => {
    if (!arquivoProcessos || !arquivoArchival) {
      toast.error("Selecione os dois arquivos");
      return;
    }

    setProcessando(true);

    try {
      const processosText = await arquivoProcessos.text();
      const archivalText = await arquivoArchival.text();

      const processos = parseCSV(processosText) as ProcessoCSV[];
      const archivalData = parseCSV(archivalText) as ArchivalReport[];

      // Criar mapa de nomes para UUIDs
      const nomeParaUUID = new Map<string, { uuid: string; localizacao: string }>();
      archivalData.forEach(item => {
        if (item.Nome) {
          nomeParaUUID.set(item.Nome.toLowerCase(), {
            uuid: item.UUID || '',
            localizacao: item.Localizacao || ''
          });
        }
      });

      const processosComUUID: ProcessoCSV[] = [];
      const processosSemUUID: ProcessoCSV[] = [];
      const nomesUsados = new Set<string>();

      processos.forEach(processo => {
        const nomeHash = processo.NOME_PROCESSO_HASH?.toLowerCase();
        const match = nomeParaUUID.get(nomeHash);

        if (match && match.uuid) {
          processosComUUID.push({
            ...processo,
            UUID: match.uuid,
            LOCALIZACAO_ARCHIVAL: match.localizacao
          });
          nomesUsados.add(nomeHash);
        } else {
          processosSemUUID.push(processo);
        }
      });

      // Encontrar nomes no archival que não foram usados
      const nomesNaoUsados = archivalData
        .filter(item => item.Nome && !nomesUsados.has(item.Nome.toLowerCase()))
        .map(item => item.Nome);

      setResultado({
        processosComUUID,
        processosSemUUID,
        nomesNaoUsados
      });

      toast.success(`Merge concluído! ${processosComUUID.length} processos com UUID encontrado.`);
    } catch (error) {
      logger.error("Erro no merge:", error);
      toast.error("Erro ao processar os arquivos");
    } finally {
      setProcessando(false);
    }
  };

  const exportarCSV = (dados: Record<string, string>[], nomeArquivo: string) => {
    if (dados.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const headers = Object.keys(dados[0]);
    const csvContent = [
      headers.join(','),
      ...dados.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload de Arquivos */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Processos (CSV)
            </CardTitle>
            <CardDescription>
              Arquivo com a coluna NOME_PROCESSO_HASH
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setArquivoProcessos(e.target.files?.[0] || null)}
              />
              {arquivoProcessos && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {arquivoProcessos.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Archival Storage Report (CSV)
            </CardTitle>
            <CardDescription>
              Arquivo com as colunas UUID, Localizacao, Nome
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setArquivoArchival(e.target.files?.[0] || null)}
              />
              {arquivoArchival && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {arquivoArchival.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={executarMerge} 
        disabled={!arquivoProcessos || !arquivoArchival || processando}
        className="w-full"
        size="lg"
      >
        <Upload className="h-5 w-5 mr-2" />
        {processando ? "Processando..." : "Executar Merge"}
      </Button>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-6">
          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">
                      {resultado.processosComUUID.length}
                    </p>
                    <p className="text-sm text-green-600">Processos com UUID</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-2xl font-bold text-amber-700">
                      {resultado.processosSemUUID.length}
                    </p>
                    <p className="text-sm text-amber-600">Processos sem UUID</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <FileWarning className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">
                      {resultado.nomesNaoUsados.length}
                    </p>
                    <p className="text-sm text-blue-600">Nomes não utilizados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Exportação */}
          <div className="flex gap-4">
            <Button 
              onClick={() => exportarCSV(resultado.processosComUUID, 'processos_com_uuid.csv')}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar com UUID ({resultado.processosComUUID.length})
            </Button>
            <Button 
              onClick={() => exportarCSV(resultado.processosSemUUID, 'processos_sem_uuid.csv')}
              variant="outline"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar sem UUID ({resultado.processosSemUUID.length})
            </Button>
          </div>

          {/* Prévia dos resultados */}
          {resultado.processosComUUID.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Prévia - Processos com UUID (primeiros 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NOME_PROCESSO_HASH</TableHead>
                        <TableHead>UUID</TableHead>
                        <TableHead>LOCALIZAÇÃO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultado.processosComUUID.slice(0, 10).map((processo, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-sm">
                            {processo.NOME_PROCESSO_HASH}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {processo.UUID}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {processo.LOCALIZACAO_ARCHIVAL}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discrepâncias */}
          {resultado.nomesNaoUsados.length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-700">
                  <FileWarning className="h-5 w-5" />
                  Nomes no Archival não encontrados nos Processos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {resultado.nomesNaoUsados.slice(0, 20).map((nome, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {nome}
                    </Badge>
                  ))}
                  {resultado.nomesNaoUsados.length > 20 && (
                    <Badge variant="secondary">
                      +{resultado.nomesNaoUsados.length - 20} mais...
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
