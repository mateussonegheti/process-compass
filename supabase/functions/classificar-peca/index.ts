import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Palavras-chave para classificação
const PALAVRAS_CHAVE: Record<string, string[]> = {
  "Sentença": [
    "JULGO PROCEDENTE", "JULGO IMPROCEDENTE", "resolvo o mérito",
    "art. 487", "dispositivo", "condeno", "absolvo", "homologo",
    "extingo o processo", "julgo extinto", "SENTENÇA"
  ],
  "Acórdão": [
    "EMENTA", "acordam os desembargadores", "dar provimento",
    "negar provimento", "Câmara Cível", "Turma Recursal",
    "decisão unânime", "por unanimidade", "ACÓRDÃO"
  ],
  "Petição Inicial": [
    "qualificação das partes", "causa de pedir", "DOS FATOS",
    "DO DIREITO", "DOS PEDIDOS", "requer a citação",
    "valor da causa", "provas que pretende produzir", "EXCELENTÍSSIMO"
  ],
  "Decisão Interlocutória": [
    "DEFIRO", "INDEFIRO", "tutela de urgência",
    "tutela antecipada", "preliminar", "art. 203, §2º", "DECISÃO"
  ],
  "Despacho": [
    "Cite-se", "Intime-se", "Cumpra-se", "Aguarde-se",
    "Dê-se vista", "Junte-se", "Manifeste-se", "DESPACHO"
  ],
  "Certidão": [
    "CERTIFICO", "CERTIDÃO", "para os devidos fins",
    "dou fé", "em testemunho da verdade"
  ],
  "Mandado": [
    "MANDADO DE CITAÇÃO", "MANDADO DE INTIMAÇÃO",
    "oficial de justiça", "MANDADO"
  ],
  "Procuração": [
    "PROCURAÇÃO", "constituo meu procurador",
    "poderes para o foro em geral", "ad judicia"
  ],
  "Termo de Audiência": [
    "TERMO DE AUDIÊNCIA", "presentes as partes",
    "aberta a audiência", "encerrada a audiência"
  ],
  "Contestação": [
    "CONTESTAÇÃO", "contesta a presente ação",
    "preliminarmente", "no mérito", "impugna"
  ],
  "Laudo Pericial": [
    "LAUDO PERICIAL", "perito judicial",
    "quesitos", "conclusão pericial"
  ],
  "Acordo": [
    "as partes acordaram", "termo de acordo",
    "composição amigável", "transação", "quitação"
  ]
};

const DESTINACAO: Record<string, string> = {
  "Sentença": "Guarda Permanente",
  "Acórdão": "Guarda Permanente",
  "Petição Inicial": "Guarda Permanente",
  "Termo de Audiência": "Guarda Permanente",
  "Laudo Pericial": "Guarda Permanente",
  "Acordo": "Guarda Permanente",
  "Certidão": "Guarda Permanente",
  "Decisão Interlocutória": "Análise Manual",
  "Despacho": "Eliminação",
  "Mandado": "Eliminação",
  "Procuração": "Análise Manual",
  "Contestação": "Análise Manual"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textoDocumento, nomeArquivo } = await req.json();
    
    if (!textoDocumento || textoDocumento.trim().length < 50) {
      return new Response(
        JSON.stringify({ 
          error: "Texto do documento muito curto ou vazio",
          classificacao: {
            tipoDocumental: "Outros/Não Identificado",
            confianca: 0,
            motivo: "Texto insuficiente para análise",
            elementosEncontrados: [],
            destinacao: "Análise Manual",
            processadoEm: new Date().toISOString()
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Primeiro, fazer uma pré-análise com palavras-chave
    const textoUpper = textoDocumento.toUpperCase();
    const preAnalise: { tipo: string; matches: string[] }[] = [];
    
    for (const [tipo, palavras] of Object.entries(PALAVRAS_CHAVE)) {
      const matches = palavras.filter(p => textoUpper.includes(p.toUpperCase()));
      if (matches.length > 0) {
        preAnalise.push({ tipo, matches });
      }
    }

    // Ordenar por quantidade de matches
    preAnalise.sort((a, b) => b.matches.length - a.matches.length);

    // Usar IA para classificação refinada
    const systemPrompt = `Você é um especialista em classificação de documentos jurídicos do TJMG.
Sua tarefa é identificar o tipo documental de uma peça processual.

TIPOS DOCUMENTAIS POSSÍVEIS:
- Sentença: decisão judicial que resolve o mérito da causa
- Acórdão: decisão colegiada de tribunal
- Petição Inicial: peça que inicia o processo
- Decisão Interlocutória: decisão que não põe fim ao processo
- Despacho: ato de mero expediente
- Certidão: documento que atesta fato processual
- Mandado: ordem judicial para cumprimento
- Procuração: instrumento de representação
- Termo de Audiência: registro de audiência
- Contestação: resposta do réu
- Laudo Pericial: parecer técnico
- Acordo: composição entre as partes
- Outros/Não Identificado: quando não for possível classificar

RESPONDA APENAS em JSON válido com esta estrutura:
{
  "tipoDocumental": "nome do tipo",
  "confianca": número de 0 a 100,
  "motivo": "explicação breve da classificação",
  "elementosEncontrados": ["elemento1", "elemento2"]
}`;

    const userPrompt = `Classifique o seguinte documento jurídico:

Nome do arquivo: ${nomeArquivo || "não informado"}

${preAnalise.length > 0 ? `Pré-análise por palavras-chave sugere: ${preAnalise.slice(0, 3).map(p => `${p.tipo} (${p.matches.length} matches)`).join(", ")}` : ""}

TEXTO DO DOCUMENTO (primeiros 3000 caracteres):
${textoDocumento.substring(0, 3000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos em Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extrair JSON da resposta
    let classificacao;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classificacao = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch {
      // Fallback para pré-análise
      const melhorMatch = preAnalise[0];
      classificacao = {
        tipoDocumental: melhorMatch?.tipo || "Outros/Não Identificado",
        confianca: melhorMatch ? Math.min(melhorMatch.matches.length * 20, 70) : 0,
        motivo: melhorMatch 
          ? `Classificado por palavras-chave: ${melhorMatch.matches.join(", ")}`
          : "Não foi possível identificar o tipo documental",
        elementosEncontrados: melhorMatch?.matches || []
      };
    }

    // Adicionar destinação
    const destinacao = DESTINACAO[classificacao.tipoDocumental] || "Análise Manual";

    return new Response(
      JSON.stringify({
        classificacao: {
          ...classificacao,
          destinacao,
          processadoEm: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao classificar:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        classificacao: {
          tipoDocumental: "Outros/Não Identificado",
          confianca: 0,
          motivo: "Erro durante a classificação",
          elementosEncontrados: [],
          destinacao: "Análise Manual",
          processadoEm: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
