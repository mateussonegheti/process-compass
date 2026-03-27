import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Check, X, Edit3, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SugestaoResult {
  tipo_sugerido: string;
  confianca: number;
  justificativa: string;
  risco_divergencia: boolean;
  features_extraidas: Record<string, unknown>;
}

interface SugestaoInteligenteProps {
  processoId: string | undefined;
  onAceitarSugestao: (tipo: string) => void;
  modoDemonstracao?: boolean;
}

// Mock data for demo mode
const MOCK_SUGESTAO: SugestaoResult = {
  tipo_sugerido: "Sentença",
  confianca: 0.82,
  justificativa: "Sugestão baseada na presença de Sentença entre as peças do processo.",
  risco_divergencia: false,
  features_extraidas: {
    tem_sentenca: true,
    tem_peticao_inicial: true,
    tem_acordao: false,
    tem_decisao: false,
    tem_termo_audiencia: false,
    total_pecas: 5,
    total_movimentos: 8,
    estrutura_minima: true,
    alto_risco_divergencia: false,
  },
};

export function SugestaoInteligente({
  processoId,
  onAceitarSugestao,
  modoDemonstracao = false,
}: SugestaoInteligenteProps) {
  const [sugestao, setSugestao] = useState<SugestaoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "accepted" | "ignored">("pending");
  const [sugestaoId, setSugestaoId] = useState<string | null>(null);

  const fetchSugestao = useCallback(async () => {
    if (!processoId) return;

    if (modoDemonstracao) {
      setSugestao(MOCK_SUGESTAO);
      setStatus("pending");
      return;
    }

    try {
      setLoading(true);
      setStatus("pending");
      setSugestao(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) return;

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/classificacao-inteligente`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ processo_id: processoId }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error("Erro na classificação:", errData);
        return;
      }

      const result: SugestaoResult = await response.json();
      setSugestao(result);

      // Log suggestion to audit table
      if (result.tipo_sugerido) {
        const { data: inserted } = await supabase
          .from("avaliacoes_sugestoes_ia" as never)
          .insert({
            processo_id: processoId,
            tipo_sugerido: result.tipo_sugerido,
            confianca: result.confianca,
            justificativa: result.justificativa,
            risco_divergencia: result.risco_divergencia,
            features_extraidas: result.features_extraidas,
            usuario_aceitou_sugestao: false,
          } as never)
          .select("id" as never)
          .single();

        if (inserted) {
          setSugestaoId((inserted as { id: string }).id);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar sugestão:", err);
    } finally {
      setLoading(false);
    }
  }, [processoId, modoDemonstracao]);

  useEffect(() => {
    fetchSugestao();
  }, [fetchSugestao]);

  const handleAceitar = useCallback(async () => {
    if (!sugestao?.tipo_sugerido) return;
    setStatus("accepted");
    onAceitarSugestao(sugestao.tipo_sugerido);
    toast.success(`Sugestão "${sugestao.tipo_sugerido}" aceita`);

    // Update audit record
    if (sugestaoId && !modoDemonstracao) {
      await supabase
        .from("avaliacoes_sugestoes_ia" as never)
        .update({ usuario_aceitou_sugestao: true } as never)
        .eq("id" as never, sugestaoId as never);
    }
  }, [sugestao, onAceitarSugestao, sugestaoId, modoDemonstracao]);

  const handleIgnorar = useCallback(() => {
    setStatus("ignored");
    toast.info("Sugestão ignorada");
  }, []);

  if (loading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Analisando processo...</span>
        </CardContent>
      </Card>
    );
  }

  if (!sugestao || !sugestao.tipo_sugerido) return null;

  const confiancaPct = Math.round(sugestao.confianca * 100);

  return (
    <Card
      className={`transition-all ${
        status === "accepted"
          ? "border-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/10"
          : status === "ignored"
          ? "opacity-60"
          : "border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/10"
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Sugestão Inteligente
          {status === "accepted" && (
            <Badge className="bg-emerald-600 text-white ml-auto text-xs">Aceita</Badge>
          )}
          {status === "ignored" && (
            <Badge variant="secondary" className="ml-auto text-xs">Ignorada</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Suggested type */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Tipo sugerido:</span>
          <Badge variant="outline" className="text-sm font-semibold">
            {sugestao.tipo_sugerido}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Confiança: {confiancaPct}%
          </span>
        </div>

        {/* Risk badge */}
        {sugestao.risco_divergencia && (
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              Alto risco de divergência
            </Badge>
          </div>
        )}

        {/* Justification */}
        <p className="text-xs text-muted-foreground italic">{sugestao.justificativa}</p>

        {/* Actions */}
        {status === "pending" && (
          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="default" onClick={handleAceitar} className="gap-1">
              <Check className="h-3.5 w-3.5" />
              Aceitar
            </Button>
            <Button size="sm" variant="outline" onClick={handleIgnorar} className="gap-1">
              <X className="h-3.5 w-3.5" />
              Ignorar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onAceitarSugestao(sugestao.tipo_sugerido);
                setStatus("accepted");
              }}
              className="gap-1"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
