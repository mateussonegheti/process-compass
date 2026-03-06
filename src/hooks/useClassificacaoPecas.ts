// Hook para classificação automática em background de peças processuais
// Processa peças da mais antiga para a mais recente (bottom-up)

import { useState, useEffect, useCallback, useRef } from "react";
import { MovimentoProcessual } from "@/components/cogede/PainelPecasProcessuais";
import { extrairTextoPdf } from "@/lib/pdfExtractor";
import { classificarMelhor, ResultadoClassificacao } from "@/lib/classificadorPecas";
import { logger } from "@/lib/logger";

export interface ClassificacaoPeca {
  movimentoId: string;
  idPeca: string;
  resultado: ResultadoClassificacao | null;
  status: "pendente" | "processando" | "concluido" | "erro" | "cors_bloqueado";
  erro?: string;
}

interface UseClassificacaoPecasOptions {
  movimentos: MovimentoProcessual[];
  habilitado: boolean;
  baseUrl: string; // URL base do Projudi
  modoDemonstracao?: boolean;
}

export function useClassificacaoPecas({
  movimentos,
  habilitado,
  baseUrl,
  modoDemonstracao = false,
}: UseClassificacaoPecasOptions) {
  const [classificacoes, setClassificacoes] = useState<Map<string, ClassificacaoPeca>>(new Map());
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState({ total: 0, concluidos: 0 });
  const abortRef = useRef(false);
  const processingRef = useRef(false);

  // Reset when movimentos change
  useEffect(() => {
    if (!habilitado || movimentos.length === 0) return;
    
    const newMap = new Map<string, ClassificacaoPeca>();
    movimentos.forEach(m => {
      newMap.set(m.id, {
        movimentoId: m.id,
        idPeca: m.idPeca,
        resultado: null,
        status: "pendente",
      });
    });
    setClassificacoes(newMap);
    setProgresso({ total: movimentos.length, concluidos: 0 });
    abortRef.current = false;
  }, [movimentos, habilitado]);

  // Process queue: oldest first (reversed array since movimentos are sorted newest-first)
  const iniciarClassificacao = useCallback(async () => {
    if (processingRef.current || !habilitado || movimentos.length === 0) return;
    
    processingRef.current = true;
    setProcessando(true);
    abortRef.current = false;

    // Process from oldest to newest (reverse of the display order)
    const filaProcessamento = [...movimentos].reverse();
    let concluidos = 0;

    for (const movimento of filaProcessamento) {
      if (abortRef.current) break;

      // Update status to processing
      setClassificacoes(prev => {
        const next = new Map(prev);
        const existing = next.get(movimento.id);
        if (existing && existing.status === "pendente") {
          next.set(movimento.id, { ...existing, status: "processando" });
        }
        return next;
      });

      try {
        let resultado: ResultadoClassificacao | null = null;

        if (modoDemonstracao) {
          // In demo mode, simulate classification with a delay
          await new Promise(r => setTimeout(r, 300 + Math.random() * 500));
          resultado = {
            tipo: "despacho",
            label: "Despacho (Demo)",
            score: 3.2,
            confianca: "media",
            regrasDetectadas: ["[demo] classificação simulada"],
          };
        } else {
          // Real mode: fetch PDF and classify
          const pdfUrl = `${baseUrl}${movimento.idPeca}&convertePDF=false`;
          const texto = await extrairTextoPdf(pdfUrl);
          resultado = classificarMelhor(texto);
        }

        concluidos++;
        setProgresso(prev => ({ ...prev, concluidos }));

        setClassificacoes(prev => {
          const next = new Map(prev);
          next.set(movimento.id, {
            movimentoId: movimento.id,
            idPeca: movimento.idPeca,
            resultado,
            status: "concluido",
          });
          return next;
        });
      } catch (error: any) {
        concluidos++;
        setProgresso(prev => ({ ...prev, concluidos }));

        const isCors = error?.message === "CORS_BLOCKED";
        
        setClassificacoes(prev => {
          const next = new Map(prev);
          next.set(movimento.id, {
            movimentoId: movimento.id,
            idPeca: movimento.idPeca,
            resultado: null,
            status: isCors ? "cors_bloqueado" : "erro",
            erro: error?.message || "Erro desconhecido",
          });
          return next;
        });

        // If CORS blocked, stop processing all remaining (same domain = all will fail)
        if (isCors) {
          logger.warn("Classificação automática bloqueada por CORS. Parando fila.");
          // Mark remaining as cors_bloqueado
          setClassificacoes(prev => {
            const next = new Map(prev);
            for (const m of filaProcessamento) {
              const existing = next.get(m.id);
              if (existing && existing.status === "pendente") {
                next.set(m.id, { ...existing, status: "cors_bloqueado" });
              }
            }
            return next;
          });
          break;
        }

        logger.error(`Erro ao classificar peça ${movimento.idPeca}:`, error);
      }

      // Small delay between requests to not overload
      if (!abortRef.current) {
        await new Promise(r => setTimeout(r, 200));
      }
    }

    setProcessando(false);
    processingRef.current = false;
  }, [movimentos, habilitado, baseUrl, modoDemonstracao]);

  // Auto-start when movimentos are loaded
  useEffect(() => {
    if (habilitado && movimentos.length > 0 && !processingRef.current) {
      // Delay start slightly to let UI render first
      const timer = setTimeout(() => {
        iniciarClassificacao();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [habilitado, movimentos.length, iniciarClassificacao]);

  const pararClassificacao = useCallback(() => {
    abortRef.current = true;
  }, []);

  const getClassificacao = useCallback((movimentoId: string): ClassificacaoPeca | undefined => {
    return classificacoes.get(movimentoId);
  }, [classificacoes]);

  return {
    classificacoes,
    processando,
    progresso,
    iniciarClassificacao,
    pararClassificacao,
    getClassificacao,
  };
}
