// Motor de classificação automática de peças processuais
// Baseado em regras textuais (expressões fortes, verbos, anti-padrões)

import { REGRAS_CLASSIFICACAO, RegraClassificacao, TIPO_LABEL_MAP } from "@/data/regrasClassificacao";

export interface ResultadoClassificacao {
  tipo: string;
  label: string;
  score: number;
  confianca: "alta" | "media" | "baixa" | "indefinida";
  regrasDetectadas: string[];
}

/**
 * Normaliza texto para classificação:
 * - Converte para minúsculas
 * - Remove acentos
 * - Remove caracteres especiais (mantém letras, números, espaços e pontuação básica)
 * - Normaliza espaços múltiplos
 */
export function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    // Remove acentos
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Remove caracteres especiais exceto letras, números, espaços, pontos, vírgulas
    .replace(/[^a-z0-9\s.,;:!?/()-]/g, " ")
    // Normaliza espaços
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classifica um texto usando o motor de regras.
 * Retorna todos os tipos com score > 0, ordenados por score decrescente.
 */
export function classificarTexto(textoOriginal: string): ResultadoClassificacao[] {
  if (!textoOriginal || textoOriginal.trim().length < 20) {
    return [];
  }

  const textoNormalizado = normalizarTexto(textoOriginal);
  // Também mantém versão com acentos em minúsculas para matching de expressões com acentos
  const textoMinusculo = textoOriginal.toLowerCase();

  const resultados: ResultadoClassificacao[] = [];

  for (const regra of REGRAS_CLASSIFICACAO) {
    let score = 0;
    const regrasDetectadas: string[] = [];

    // Expressões fortes
    for (const expr of regra.expressoes_fortes) {
      const exprNorm = normalizarTexto(expr);
      const exprLower = expr.toLowerCase();
      
      if (textoNormalizado.includes(exprNorm) || textoMinusculo.includes(exprLower)) {
        score += regra.peso_regra;
        regrasDetectadas.push(expr);
      }
    }

    // Verbos
    for (const verbo of regra.verbos) {
      const verboNorm = normalizarTexto(verbo);
      const verboLower = verbo.toLowerCase();
      
      if (textoNormalizado.includes(verboNorm) || textoMinusculo.includes(verboLower)) {
        score += 0.5;
        regrasDetectadas.push(`[verbo] ${verbo}`);
      }
    }

    // Anti-padrões (reduz score)
    for (const anti of regra.anti_padroes) {
      const antiNorm = normalizarTexto(anti);
      const antiLower = anti.toLowerCase();
      
      if (textoNormalizado.includes(antiNorm) || textoMinusculo.includes(antiLower)) {
        score -= 1;
      }
    }

    if (score > 0) {
      resultados.push({
        tipo: regra.tipo,
        label: regra.label,
        score: Math.round(score * 10) / 10,
        confianca: calcularConfianca(score),
        regrasDetectadas,
      });
    }
  }

  // Ordenar por score decrescente
  return resultados.sort((a, b) => b.score - a.score);
}

function calcularConfianca(score: number): "alta" | "media" | "baixa" | "indefinida" {
  if (score >= 4) return "alta";
  if (score >= 2) return "media";
  if (score > 0) return "baixa";
  return "indefinida";
}

/**
 * Retorna apenas o melhor resultado da classificação
 */
export function classificarMelhor(texto: string): ResultadoClassificacao | null {
  const resultados = classificarTexto(texto);
  return resultados.length > 0 ? resultados[0] : null;
}
