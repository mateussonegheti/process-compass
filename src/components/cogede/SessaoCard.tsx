import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, FileSearch, Loader2 } from "lucide-react";
import { SessaoAvaliacao } from "@/types/cogede";
import { useAuth } from "@/hooks/useAuth";

interface SessaoCardProps {
  sessao: SessaoAvaliacao;
  onIniciarSessao: (responsavel: string) => void;
  onIniciarAvaliacao: () => void;
  carregando: boolean;
  totalPendentes: number;
  totalEmAnalise: number;
  totalConcluidos: number;
}

export function SessaoCard({
  sessao,
  onIniciarSessao,
  onIniciarAvaliacao,
  carregando,
  totalPendentes,
  totalEmAnalise,
  totalConcluidos
}: SessaoCardProps) {
  const { profile, loading } = useAuth();

  // Auto-iniciar sessão quando o perfil estiver disponível
  useEffect(() => {
    if (!sessao.iniciada && profile?.nome && !loading) {
      onIniciarSessao(profile.nome);
    }
  }, [sessao.iniciada, profile?.nome, loading, onIniciarSessao]);

  if (!sessao.iniciada) {
    return (
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Carregando...
          </CardTitle>
          <CardDescription>
            Preparando sessão de avaliação...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Sessão Ativa</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4" />
              {sessao.responsavel}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              {totalPendentes} pendentes
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {totalEmAnalise} em análise
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {totalConcluidos} concluídos
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!sessao.processoAtual ? (
          <Button 
            onClick={onIniciarAvaliacao} 
            disabled={carregando || totalPendentes === 0}
            className="w-full"
            size="lg"
          >
            {carregando ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <FileSearch className="h-5 w-5 mr-2" />
            )}
            {carregando ? "Buscando processo..." : "Iniciar Avaliação"}
          </Button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileSearch className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Avaliando processo</p>
              <p className="text-sm text-muted-foreground">
                {sessao.processoAtual.CODIGO_PROCESSO}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
