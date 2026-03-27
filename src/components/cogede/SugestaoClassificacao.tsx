import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SugestaoResult {
  tipo_sugerido: string;
  confianca: number;
  justificativa: string;
  risco_divergencia: boolean;
  features_extraidas: Record<string, unknown>;
}

interface SugestaoClassificacaoProps {
  processoId: string | undefined;
  onAplicarSugestao: (tipo: string) => void;
  /** When true, auto-fill was applied */
  onAutoPreenchimento?: (tipo: string, confianca: number) => void;
  modoDemonstracao?: boolean;
}

const MOCK_SUGESTAO: SugestaoResult = {
  tipo_sugerido: "Sentença",
  confianca: 0.82,
  justificativa: "Identificamos peça do tipo \"Sentença\", padrão comum em classificações deste tipo.",
  risco_divergencia: false,
  features_extraidas: {
    tem_sentenca: true,
    tem_peticao_inicial: true,
    total_pecas: 5,
    total_movimentos: 8,
  },
};

export function SugestaoClassificacao({
  processoId,
  onAplicarSugestao,
  onAutoPreenchimento,
  modoDemonstracao = false,
}: SugestaoClassificacaoProps) {
  const [sugestao, setSugestao] = useState<SugestaoResult | null>(null);
  const [aplicada, setAplicada] = useState(false);
  const [autoPreenchida, setAutoPreenchida] = useState(false);
  const [sugestaoId, setSugestaoId] = useState<string | null>(null);

  const fetchSugestao = useCallback(async () => {
    if (!processoId) return;

    if (modoDemonstracao) {
      setSugestao(MOCK_SUGESTAO);
      setAplicada(false);
      setAutoPreenchida(false);
      return;
    }

    try {
      setSugestao(null);
      setAplicada(false);
      setAutoPreenchida(false);

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

      if (!response.ok) return;

      const result: SugestaoResult = await response.json();
      if (!result.tipo_sugerido) return;

      setSugestao(result);

      // Log to audit table
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

      // Auto-fill if confidence >= 0.85
      if (result.confianca >= 0.85 && onAutoPreenchimento) {
        onAutoPreenchimento(result.tipo_sugerido, result.confianca);
        setAutoPreenchida(true);
        // Mark as accepted in audit
        if (inserted) {
          await supabase
            .from("avaliacoes_sugestoes_ia" as never)
            .update({ usuario_aceitou_sugestao: true } as never)
            .eq("id" as never, (inserted as { id: string }).id as never);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar sugestão:", err);
    }
  }, [processoId, modoDemonstracao, onAutoPreenchimento]);

  useEffect(() => {
    fetchSugestao();
  }, [fetchSugestao]);

  const handleAplicar = useCallback(async () => {
    if (!sugestao?.tipo_sugerido) return;
    setAplicada(true);
    onAplicarSugestao(sugestao.tipo_sugerido);

    if (sugestaoId && !modoDemonstracao) {
      await supabase
        .from("avaliacoes_sugestoes_ia" as never)
        .update({ usuario_aceitou_sugestao: true } as never)
        .eq("id" as never, sugestaoId as never);
    }
  }, [sugestao, onAplicarSugestao, sugestaoId, modoDemonstracao]);

  if (!sugestao || !sugestao.tipo_sugerido) return null;

  const confiancaPct = Math.round(sugestao.confianca * 100);

  // Confidence < 0.6: don't show anything
  if (sugestao.confianca < 0.6) return null;

  // Auto-filled (>=0.85): show subtle confirmation
  if (autoPreenchida) {
    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
        <Sparkles className="h-3 w-3" />
        Preenchido automaticamente com base nas peças do processo ({confiancaPct}%)
      </p>
    );
  }

  // Already applied manually
  if (aplicada) {
    return (
      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-1">
        <Check className="h-3 w-3" />
        Sugestão aplicada: {sugestao.tipo_sugerido}
      </p>
    );
  }

  // Medium confidence (0.6 - 0.85): show inline suggestion
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Sugestão:
        </span>
        <Badge variant="outline" className="text-xs font-medium">
          {sugestao.tipo_sugerido} ({confiancaPct}%)
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAplicar}
          className="h-6 px-2 text-xs text-primary hover:text-primary"
        >
          Aplicar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground pl-4">
        {sugestao.justificativa}
      </p>
      {sugestao.risco_divergencia && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 pl-4">
          <AlertTriangle className="h-3 w-3" />
          Este tipo de processo frequentemente apresenta divergência de classificação
        </p>
      )}
    </div>
  );
}
