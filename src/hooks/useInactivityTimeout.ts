import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

/**
 * Hook para rastrear inatividade e atualizar timestamp de interação
 * 
 * Detecta: digitação, cliques, scroll, salvamento
 * Atualiza timestamp a cada interação para controle de timeout (1 hora)
 * Se processo ficar sem interação por 1h, volta a PENDENTE automaticamente
 * 
 * @param processoId - ID do processo em EM_ANALISE
 * @param enabled - Se deve estar ativo (default: true)
 */
export function useInactivityTimeout(processoId: string | undefined, enabled = true) {
  const timeoutIdRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const updateUltimaInteracao = useCallback(async () => {
    if (!processoId) return;

    try {
      await supabase
        .from("processos_fila")
        .update({ ultima_interacao: new Date().toISOString() })
        .eq("id", processoId);
      
      lastActivityRef.current = Date.now();
    } catch (error) {
      logger.error("[useInactivityTimeout] Erro ao atualizar última interação:", error);
    }
  }, [processoId]);

  const verificarTimeout = useCallback(async () => {
    if (!processoId) return;

    const agora = Date.now();
    const minutosInativo = (agora - lastActivityRef.current) / (1000 * 60);

    // Após 1 hora de inatividade, o banco vai liberar automaticamente via CRON
    // Mas checamos localmente para avisar o usuário se necessário
    if (minutosInativo > 60) {
      logger.warn(
        `[useInactivityTimeout] Processo ${processoId} inativo por ${minutosInativo.toFixed(0)} minutos`
      );
    }
  }, [processoId]);

  useEffect(() => {
    if (!enabled || !processoId) {
      // Limpar se desabilitado
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      return;
    }

    // Handler para detectar atividade
    const handleActivity = () => {
      lastActivityRef.current = Date.now();

      // Limpar timeout anterior
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      // Atualizar no banco a cada 30 segundos de atividade
      // (evitar sobrecarga com updates muito frequentes)
      timeoutIdRef.current = setTimeout(() => {
        updateUltimaInteracao();
      }, 30 * 1000);
    };

    // Eventos para detectar atividade
    const eventos = ["keydown", "click", "scroll", "change", "input"];
    eventos.forEach((evento) => {
      window.addEventListener(evento, handleActivity);
    });

    // Inicializar timer de verificação (a cada 10 minutos)
    checkIntervalRef.current = setInterval(() => {
      verificarTimeout();
    }, 10 * 60 * 1000);

    // Registrar primeira interação imediatamente
    updateUltimaInteracao();

    // Cleanup
    return () => {
      eventos.forEach((evento) => {
        window.removeEventListener(evento, handleActivity);
      });
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [processoId, enabled, updateUltimaInteracao, verificarTimeout]);
}
