import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Feature extraction ─────────────────────────────────────────────────────

interface Features {
  tem_sentenca: boolean;
  tem_peticao_inicial: boolean;
  tem_acordao: boolean;
  tem_decisao: boolean;
  tem_termo_audiencia: boolean;
  total_pecas: number;
  total_movimentos: number;
  estrutura_minima: boolean;
  alto_risco_divergencia: boolean;
}

const ALTO_RISCO_TIPOS = ["conclusão", "despacho", "petição", "outros"];

function extractFeatures(processo: Record<string, unknown>): Features {
  const pecasTipos = ((processo.pecas_tipos as string) || "").toLowerCase();
  const tiposArr = pecasTipos
    .split("|")
    .map((t: string) => t.trim())
    .filter(Boolean);

  const movCodigos = ((processo.mov_codigos as string) || "")
    .split("|")
    .map((c: string) => c.trim())
    .filter(Boolean);
  const movDescricoes = ((processo.mov_descricoes as string) || "")
    .split("|")
    .map((d: string) => d.trim())
    .filter(Boolean);

  const tem_sentenca = tiposArr.some((t: string) => t.includes("sentença"));
  const tem_peticao_inicial = tiposArr.some((t: string) => t.includes("petição inicial"));
  const tem_acordao = tiposArr.some((t: string) => t.includes("acórdão"));
  const tem_decisao = tiposArr.some((t: string) => t.includes("decisão"));
  const tem_termo_audiencia = tiposArr.some((t: string) => t.includes("termo de audiência"));

  const total_pecas = tiposArr.length;
  const total_movimentos = Math.max(movCodigos.length, movDescricoes.length);

  const estrutura_minima = tem_peticao_inicial && (tem_sentenca || tem_decisao);

  const alto_risco_divergencia = tiposArr.some((t: string) =>
    ALTO_RISCO_TIPOS.some((r) => t === r)
  );

  return {
    tem_sentenca,
    tem_peticao_inicial,
    tem_acordao,
    tem_decisao,
    tem_termo_audiencia,
    total_pecas,
    total_movimentos,
    estrutura_minima,
    alto_risco_divergencia,
  };
}

// ─── Heuristic classification (modular, replaceable by ML) ──────────────────

interface ClassificationResult {
  tipo_sugerido: string;
  confianca: number;
  justificativa: string;
  risco_divergencia: boolean;
  features_extraidas: Features;
}

interface HistoricoDivergencia {
  tipo_original: string;
  tipo_corrigido: string;
  contagem: number;
}

function getSuggestedClassification(
  features: Features,
  _processo: Record<string, unknown>,
  historicoDivergencias: HistoricoDivergencia[]
): ClassificationResult {
  let tipo_sugerido = "";
  let justificativa = "";
  let confianca = 0.5;

  // ── Primary rules based on features ──
  if (features.tem_sentenca) {
    tipo_sugerido = "Sentença";
    justificativa = "Sugestão baseada na presença de Sentença entre as peças do processo.";
  } else if (features.tem_acordao) {
    tipo_sugerido = "Acórdão";
    justificativa = "Sugestão baseada na presença de Acórdão entre as peças do processo.";
  } else if (features.tem_decisao) {
    tipo_sugerido = "Decisão";
    justificativa = "Sugestão baseada na presença de Decisão entre as peças do processo.";
  } else if (features.tem_termo_audiencia) {
    tipo_sugerido = "Termo de Audiência";
    justificativa = "Sugestão baseada na presença de Termo de Audiência entre as peças do processo.";
  } else if (features.tem_peticao_inicial) {
    tipo_sugerido = "Petição Inicial";
    justificativa = "Sugestão baseada na presença de Petição Inicial sem peça decisória posterior.";
  }

  // ── Historical divergence correction ──
  const pecasTipos = ((_processo.pecas_tipos as string) || "").toLowerCase();
  const tiposArr = pecasTipos.split("|").map((t: string) => t.trim()).filter(Boolean);

  for (const tipo of tiposArr) {
    const tipoLower = tipo.toLowerCase();
    // Check divergence history for this tipo
    const divHistorica = historicoDivergencias.find(
      (d) => d.tipo_original.toLowerCase() === tipoLower && d.contagem >= 2
    );

    if (divHistorica) {
      tipo_sugerido = divHistorica.tipo_corrigido;
      justificativa = `Sugestão baseada em padrão recorrente de divergência histórica: "${divHistorica.tipo_original}" frequentemente corrigido para "${divHistorica.tipo_corrigido}" (${divHistorica.contagem} ocorrências).`;
      confianca += 0.1; // historical convergence bonus
      break;
    }

    // Fallback heuristics for known problematic types
    if (!tipo_sugerido) {
      if (tipoLower === "conclusão" || tipoLower === "despacho") {
        tipo_sugerido = features.tem_sentenca ? "Sentença" : "Decisão";
        justificativa = `Sugestão baseada em tipo "${tipo}" frequentemente reclassificado.`;
      } else if (tipoLower === "petição") {
        tipo_sugerido = "Petição Inicial";
        justificativa = `Sugestão baseada em tipo genérico "Petição" reclassificado como Petição Inicial.`;
      } else if (tipoLower === "outros") {
        if (features.tem_termo_audiencia) tipo_sugerido = "Termo de Audiência";
        else if (features.tem_sentenca) tipo_sugerido = "Sentença";
        else if (features.tem_peticao_inicial) tipo_sugerido = "Petição Inicial";
        if (tipo_sugerido) {
          justificativa = `Sugestão baseada em tipo "Outros" com indicação de "${tipo_sugerido}" nas peças.`;
        }
      }
    }
  }

  // ── If no suggestion could be made ──
  if (!tipo_sugerido) {
    return {
      tipo_sugerido: "",
      confianca: 0,
      justificativa: "Não foi possível gerar sugestão com os dados disponíveis.",
      risco_divergencia: features.alto_risco_divergencia,
      features_extraidas: features,
    };
  }

  // ── Confidence scoring ──
  // Check if the suggested type is clearly dominant
  const pecasLower = tiposArr;
  const matchCount = pecasLower.filter((t: string) =>
    t.includes(tipo_sugerido.toLowerCase())
  ).length;
  if (matchCount > 0 && features.total_pecas > 0 && matchCount / features.total_pecas >= 0.4) {
    confianca += 0.2; // dominant piece bonus
  }

  if (features.estrutura_minima) confianca += 0.15;

  if (features.alto_risco_divergencia) confianca -= 0.1;

  // Check for contradictory signals
  const decisoryCount = [
    features.tem_sentenca,
    features.tem_acordao,
    features.tem_decisao,
  ].filter(Boolean).length;
  if (decisoryCount > 1) confianca -= 0.1;

  // Clamp
  confianca = Math.max(0, Math.min(1, confianca));
  confianca = Math.round(confianca * 100) / 100;

  return {
    tipo_sugerido,
    confianca,
    justificativa,
    risco_divergencia: features.alto_risco_divergencia,
    features_extraidas: features,
  };
}

// ─── Edge function handler ──────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse & validate input
    const body = await req.json();
    const processoId = body?.processo_id;
    if (!processoId || typeof processoId !== "string") {
      return new Response(
        JSON.stringify({ error: "processo_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch processo
    const { data: processo, error: procError } = await supabase
      .from("processos_fila")
      .select("*")
      .eq("id", processoId)
      .single();

    if (procError || !processo) {
      return new Response(
        JSON.stringify({ error: "Processo não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Extract features
    const features = extractFeatures(processo);

    // 3. Fetch historical divergences from avaliacoes
    const { data: avaliacoes } = await supabase
      .from("avaliacoes")
      .select("divergencias_detalhes")
      .not("divergencias_detalhes", "is", null)
      .limit(200);

    // Parse divergence history to find common corrections
    const divergenciaCount = new Map<string, { corrigido: string; count: number }>();
    if (avaliacoes) {
      for (const av of avaliacoes) {
        const detalhes = (av.divergencias_detalhes as string) || "";
        const entries = detalhes.split(" | ").filter((d: string) => d.trim());
        for (const entry of entries) {
          const match = entry.match(/(.+?)\s*→\s*(.+?)\s*\(ID:/);
          if (match) {
            const original = match[1].trim();
            const corrigido = match[2].trim();
            const key = `${original}::${corrigido}`;
            const existing = divergenciaCount.get(key);
            if (existing) {
              existing.count++;
            } else {
              divergenciaCount.set(key, { corrigido, count: 1 });
            }
          }
        }
      }
    }

    const historicoDivergencias: HistoricoDivergencia[] = [];
    for (const [key, val] of divergenciaCount.entries()) {
      const original = key.split("::")[0];
      historicoDivergencias.push({
        tipo_original: original,
        tipo_corrigido: val.corrigido,
        contagem: val.count,
      });
    }
    // Sort by frequency
    historicoDivergencias.sort((a, b) => b.contagem - a.contagem);

    // 4. Classify
    const result = getSuggestedClassification(features, processo, historicoDivergencias);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("classificacao-inteligente error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
