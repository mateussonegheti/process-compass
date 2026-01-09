import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapa completo de elementos por tipo documental (baseado no CSV)
const MAPA_ELEMENTOS: Record<string, { 
  descricao: string;
  elementosChave: string[];
  frasesChave: string[];
  destinacao: string;
}> = {
  "Sentença": {
    descricao: "Decisão judicial que resolve o mérito da causa, encerrando a fase cognitiva do processo",
    elementosChave: ["Relatório", "Fundamentação", "Dispositivo", "Assinatura do juiz"],
    frasesChave: [
      "JULGO PROCEDENTE", "JULGO IMPROCEDENTE", "resolvo o mérito",
      "art. 487", "dispositivo", "condeno", "absolvo", "homologo",
      "extingo o processo", "julgo extinto", "Ante o exposto",
      "isto posto", "pelo exposto", "face ao exposto"
    ],
    destinacao: "Guarda Permanente"
  },
  "Acórdão": {
    descricao: "Decisão colegiada proferida por tribunal",
    elementosChave: ["Ementa", "Relatório", "Voto", "Dispositivo", "Assinaturas dos desembargadores"],
    frasesChave: [
      "EMENTA", "acordam os desembargadores", "dar provimento",
      "negar provimento", "Câmara Cível", "Turma Recursal",
      "decisão unânime", "por unanimidade", "ACÓRDÃO", "por maioria"
    ],
    destinacao: "Guarda Permanente"
  },
  "Petição Inicial": {
    descricao: "Peça inaugural do processo que contém a pretensão do autor",
    elementosChave: ["Qualificação das partes", "Fatos", "Fundamentos jurídicos", "Pedidos", "Valor da causa", "Provas"],
    frasesChave: [
      "EXCELENTÍSSIMO", "DOS FATOS", "DO DIREITO", "DOS PEDIDOS",
      "requer a citação", "valor da causa", "provas que pretende produzir",
      "causa de pedir", "nestes termos, pede deferimento"
    ],
    destinacao: "Guarda Permanente"
  },
  "Decisão Interlocutória": {
    descricao: "Decisão que resolve questão incidente sem encerrar o processo",
    elementosChave: ["Fundamentação", "Decisão", "Assinatura do juiz"],
    frasesChave: [
      "DEFIRO", "INDEFIRO", "tutela de urgência", "tutela antecipada",
      "preliminar", "art. 203, §2º", "DECISÃO", "tutela provisória"
    ],
    destinacao: "Análise Manual"
  },
  "Despacho": {
    descricao: "Ato de mero expediente sem conteúdo decisório",
    elementosChave: ["Determinação", "Assinatura"],
    frasesChave: [
      "Cite-se", "Intime-se", "Cumpra-se", "Aguarde-se",
      "Dê-se vista", "Junte-se", "Manifeste-se", "DESPACHO",
      "Ao arquivo", "Venham conclusos"
    ],
    destinacao: "Eliminação"
  },
  "Certidão": {
    descricao: "Documento que atesta fato ou situação processual",
    elementosChave: ["Texto certificatório", "Assinatura do serventuário", "Data"],
    frasesChave: [
      "CERTIFICO", "CERTIDÃO", "para os devidos fins",
      "dou fé", "em testemunho da verdade", "Eu,", "Escrivã"
    ],
    destinacao: "Guarda Permanente"
  },
  "Certidão de Trânsito em Julgado": {
    descricao: "Certidão que atesta que a decisão se tornou irrecorrível",
    elementosChave: ["Referência à decisão", "Data do trânsito", "Assinatura"],
    frasesChave: [
      "transitou em julgado", "trânsito em julgado", "certifico o trânsito",
      "decisão irrecorrível", "não houve recurso"
    ],
    destinacao: "Guarda Permanente"
  },
  "Mandado": {
    descricao: "Ordem judicial para cumprimento de ato processual",
    elementosChave: ["Ordem judicial", "Prazo", "Destinatário", "Assinatura"],
    frasesChave: [
      "MANDADO DE CITAÇÃO", "MANDADO DE INTIMAÇÃO", "MANDADO",
      "oficial de justiça", "para que cumpra", "fica intimado"
    ],
    destinacao: "Eliminação"
  },
  "Procuração": {
    descricao: "Instrumento de representação que confere poderes ao advogado",
    elementosChave: ["Outorgante", "Outorgado", "Poderes conferidos", "Assinatura"],
    frasesChave: [
      "PROCURAÇÃO", "constituo meu procurador", "poderes para o foro em geral",
      "ad judicia", "substabelecer", "outorgante", "outorgado"
    ],
    destinacao: "Análise Manual"
  },
  "Termo de Audiência": {
    descricao: "Registro de atos praticados em audiência",
    elementosChave: ["Data e hora", "Partes presentes", "Atos realizados", "Assinaturas"],
    frasesChave: [
      "TERMO DE AUDIÊNCIA", "presentes as partes", "aberta a audiência",
      "encerrada a audiência", "oitiva de testemunhas", "interrogatório"
    ],
    destinacao: "Guarda Permanente"
  },
  "Contestação": {
    descricao: "Resposta do réu à pretensão do autor",
    elementosChave: ["Preliminares", "Mérito", "Pedidos", "Assinatura do advogado"],
    frasesChave: [
      "CONTESTAÇÃO", "contesta a presente ação", "preliminarmente",
      "no mérito", "impugna", "requer a improcedência"
    ],
    destinacao: "Análise Manual"
  },
  "Laudo Pericial": {
    descricao: "Parecer técnico elaborado por perito",
    elementosChave: ["Identificação do perito", "Metodologia", "Análise", "Conclusão", "Assinatura"],
    frasesChave: [
      "LAUDO PERICIAL", "perito judicial", "quesitos", "conclusão pericial",
      "exame pericial", "resposta aos quesitos"
    ],
    destinacao: "Guarda Permanente"
  },
  "Acordo": {
    descricao: "Composição entre as partes",
    elementosChave: ["Identificação das partes", "Termos do acordo", "Assinaturas"],
    frasesChave: [
      "as partes acordaram", "termo de acordo", "composição amigável",
      "transação", "quitação", "homologação de acordo"
    ],
    destinacao: "Guarda Permanente"
  },
  "Parecer do Ministério Público": {
    descricao: "Manifestação do Ministério Público no processo",
    elementosChave: ["Relatório", "Fundamentação", "Conclusão", "Assinatura do promotor"],
    frasesChave: [
      "PARECER", "MINISTÉRIO PÚBLICO", "Promotor de Justiça",
      "opina pelo", "manifesta-se pelo", "custos legis"
    ],
    destinacao: "Guarda Permanente"
  },
  "Recurso": {
    descricao: "Impugnação de decisão judicial",
    elementosChave: ["Razões recursais", "Pedido de reforma", "Assinatura do advogado"],
    frasesChave: [
      "APELAÇÃO", "AGRAVO", "RECURSO", "razões de recurso",
      "requer a reforma", "dar provimento", "tempestividade"
    ],
    destinacao: "Análise Manual"
  },
  "Contrarrazões": {
    descricao: "Resposta ao recurso interposto pela parte contrária",
    elementosChave: ["Resposta aos argumentos", "Pedido de manutenção", "Assinatura"],
    frasesChave: [
      "CONTRARRAZÕES", "negar provimento", "manter a decisão",
      "sem razão o recorrente"
    ],
    destinacao: "Análise Manual"
  },
  "Embargos de Declaração": {
    descricao: "Recurso para sanar omissão, contradição ou obscuridade",
    elementosChave: ["Indicação do vício", "Pedido de esclarecimento", "Assinatura"],
    frasesChave: [
      "EMBARGOS DE DECLARAÇÃO", "omissão", "contradição", "obscuridade",
      "prequestionamento", "sanar"
    ],
    destinacao: "Análise Manual"
  },
  "Aviso de Recebimento (AR)": {
    descricao: "Comprovante de entrega de correspondência",
    elementosChave: ["Destinatário", "Data de entrega", "Assinatura do recebedor"],
    frasesChave: [
      "AR", "aviso de recebimento", "entregue em", "recebido por"
    ],
    destinacao: "Eliminação"
  },
  "Comprovante de Pagamento": {
    descricao: "Documento que comprova pagamento de custas ou valores",
    elementosChave: ["Valor", "Data", "Beneficiário", "Comprovação"],
    frasesChave: [
      "comprovante", "pagamento", "GRU", "depósito judicial", "transferência"
    ],
    destinacao: "Eliminação"
  },
  "Guia de Custas": {
    descricao: "Documento para pagamento de custas processuais",
    elementosChave: ["Valor das custas", "Código de barras", "Prazo"],
    frasesChave: [
      "guia de custas", "custas processuais", "taxa judiciária", "recolhimento"
    ],
    destinacao: "Eliminação"
  },
  "Intimação": {
    descricao: "Comunicação de ato processual às partes",
    elementosChave: ["Destinatário", "Prazo", "Objeto da intimação"],
    frasesChave: [
      "INTIMAÇÃO", "fica intimado", "prazo de", "para que tome ciência"
    ],
    destinacao: "Eliminação"
  },
  "Termo de Juntada": {
    descricao: "Registro de anexação de documento aos autos",
    elementosChave: ["Documento juntado", "Data", "Assinatura do serventuário"],
    frasesChave: [
      "TERMO DE JUNTADA", "junto aos autos", "faço juntar"
    ],
    destinacao: "Eliminação"
  }
};

// Função para fazer chamada à IA
async function chamarIA(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("RATE_LIMIT");
    }
    if (response.status === 402) {
      throw new Error("PAYMENT_REQUIRED");
    }
    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { textoDocumento, imagemBase64 } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // Se recebeu imagem base64, usar OCR via visão da IA
    let textoParaAnalise = textoDocumento || "";
    
    if (imagemBase64 && (!textoParaAnalise || textoParaAnalise.length < 100)) {
      console.log("Tentando OCR via visão da IA...");
      
      const ocrResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { 
              role: "user", 
              content: [
                {
                  type: "text",
                  text: "Extraia TODO o texto visível nesta imagem de documento jurídico. Preserve a formatação e estrutura original. Retorne apenas o texto extraído, sem comentários."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/png;base64,${imagemBase64}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        }),
      });

      if (ocrResponse.ok) {
        const ocrData = await ocrResponse.json();
        textoParaAnalise = ocrData.choices?.[0]?.message?.content || textoParaAnalise;
        console.log("OCR extraiu:", textoParaAnalise.length, "caracteres");
      }
    }

    if (!textoParaAnalise || textoParaAnalise.trim().length < 50) {
      return new Response(
        JSON.stringify({ 
          error: "Texto do documento muito curto ou vazio",
          classificacao: {
            tipoDocumental: "Outros/Não Identificado",
            confianca: 0,
            motivo: "Não foi possível extrair texto suficiente do documento",
            elementosEncontrados: [],
            chunksRelevantes: [],
            destinacao: "Análise Manual",
            auditoriaAprovada: false,
            auditoriaMotivo: "Texto insuficiente para análise",
            processadoEm: new Date().toISOString()
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== IA 1: EXTRAÇÃO DE CHUNKS RELEVANTES ==========
    const mapaElementosStr = Object.entries(MAPA_ELEMENTOS)
      .map(([tipo, info]) => `${tipo}: ${info.frasesChave.slice(0, 5).join(", ")}`)
      .join("\n");

    const promptIA1 = `Você é um extrator de chunks jurídicos especializado.

TAREFA: Analise o documento e extraia os PARÁGRAFOS/TRECHOS mais importantes que identificam o tipo documental.

ELEMENTOS-CHAVE POR TIPO DOCUMENTAL:
${mapaElementosStr}

REGRAS:
1. IGNORE completamente o nome do arquivo - use APENAS o conteúdo
2. Identifique o parágrafo principal (dispositivo da sentença, ementa do acórdão, pedidos da petição, etc.)
3. Extraia até 3 chunks mais relevantes, copiando o texto LITERAL do documento
4. Para cada chunk, indique qual tipo documental ele sugere

RESPONDA em JSON:
{
  "chunks": [
    {
      "texto": "texto literal extraído do documento",
      "tipoSugerido": "tipo documental que este chunk sugere",
      "elementoIdentificado": "qual elemento-chave foi encontrado (ex: dispositivo, ementa, pedidos)"
    }
  ],
  "observacoes": "notas sobre a qualidade do texto"
}`;

    const respostaIA1 = await chamarIA(
      promptIA1,
      `DOCUMENTO PARA ANÁLISE:\n\n${textoParaAnalise.substring(0, 6000)}`,
      LOVABLE_API_KEY
    );

    let chunksExtraidos: { texto: string; tipoSugerido: string; elementoIdentificado: string }[] = [];
    try {
      const jsonMatch = respostaIA1.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        chunksExtraidos = parsed.chunks || [];
      }
    } catch {
      console.log("Falha ao parsear IA1, usando fallback");
    }

    // ========== IA 2: CLASSIFICAÇÃO BASEADA NOS CHUNKS ==========
    const promptIA2 = `Você é um classificador de documentos jurídicos do TJMG.

MAPA COMPLETO DE TIPOS DOCUMENTAIS:
${Object.entries(MAPA_ELEMENTOS).map(([tipo, info]) => 
  `## ${tipo}
  - Descrição: ${info.descricao}
  - Elementos-chave: ${info.elementosChave.join(", ")}
  - Frases identificadoras: ${info.frasesChave.join(", ")}
  - Destinação: ${info.destinacao}`
).join("\n\n")}

REGRAS ESTRITAS:
1. USE APENAS os chunks fornecidos para classificar
2. NÃO invente informações - baseie-se SOMENTE no que está escrito
3. Identifique QUAL elemento do mapa foi encontrado nos chunks
4. Se não houver elementos suficientes, classifique como "Outros/Não Identificado"

RESPONDA em JSON:
{
  "tipoDocumental": "nome exato do tipo (da lista acima)",
  "confianca": número de 0 a 100,
  "motivo": "explicação de QUAIS elementos do mapa foram encontrados nos chunks",
  "elementosEncontrados": ["elemento1 do mapa", "elemento2 do mapa"],
  "destinacao": "Guarda Permanente | Eliminação | Análise Manual"
}`;

    const userPromptIA2 = `CHUNKS EXTRAÍDOS DO DOCUMENTO:

${chunksExtraidos.map((c, i) => 
  `CHUNK ${i + 1}:
  Texto: "${c.texto}"
  Tipo sugerido: ${c.tipoSugerido}
  Elemento: ${c.elementoIdentificado}`
).join("\n\n")}

Classifique o documento com base APENAS nesses chunks.`;

    const respostaIA2 = await chamarIA(promptIA2, userPromptIA2, LOVABLE_API_KEY);

    let classificacao = {
      tipoDocumental: "Outros/Não Identificado",
      confianca: 0,
      motivo: "",
      elementosEncontrados: [] as string[],
      destinacao: "Análise Manual"
    };

    try {
      const jsonMatch = respostaIA2.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        classificacao = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.log("Falha ao parsear IA2");
    }

    // ========== IA 3: AUDITORIA ANTI-ALUCINAÇÃO ==========
    const promptIA3 = `Você é um auditor de classificações documentais. Sua função é verificar se a classificação feita está correta e baseada em evidências REAIS.

MAPA DE ELEMENTOS ACEITOS:
${Object.entries(MAPA_ELEMENTOS).map(([tipo, info]) => 
  `${tipo}: ${info.elementosChave.join(", ")} | Frases: ${info.frasesChave.slice(0, 3).join(", ")}`
).join("\n")}

CLASSIFICAÇÃO FEITA:
- Tipo: ${classificacao.tipoDocumental}
- Confiança: ${classificacao.confianca}%
- Motivo dado: ${classificacao.motivo}
- Elementos citados: ${classificacao.elementosEncontrados.join(", ")}

CHUNKS ORIGINAIS:
${chunksExtraidos.map((c, i) => `${i + 1}. "${c.texto}"`).join("\n")}

TAREFA:
1. Verifique se os elementos citados REALMENTE aparecem nos chunks
2. Verifique se a classificação está coerente com o mapa de elementos
3. Identifique se há ALUCINAÇÃO (informação inventada não presente nos chunks)

RESPONDA em JSON:
{
  "aprovado": true ou false,
  "motivo": "explicação da aprovação ou reprovação",
  "elementosConfirmados": ["elementos que realmente foram encontrados"],
  "alucinacoes": ["informações citadas que NÃO estão nos chunks"],
  "confiancaAjustada": número de 0 a 100,
  "sugestaoTipo": "tipo documental correto se a classificação estiver errada"
}`;

    const respostaIA3 = await chamarIA(promptIA3, "Faça a auditoria conforme instruído.", LOVABLE_API_KEY);

    let auditoria = {
      aprovado: false,
      motivo: "",
      elementosConfirmados: [] as string[],
      alucinacoes: [] as string[],
      confiancaAjustada: classificacao.confianca,
      sugestaoTipo: classificacao.tipoDocumental
    };

    try {
      const jsonMatch = respostaIA3.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        auditoria = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.log("Falha ao parsear IA3");
    }

    // Aplicar resultado da auditoria
    const tipoFinal = auditoria.aprovado ? classificacao.tipoDocumental : auditoria.sugestaoTipo || classificacao.tipoDocumental;
    const confiancaFinal = auditoria.confiancaAjustada || classificacao.confianca;
    const destinacaoFinal = MAPA_ELEMENTOS[tipoFinal]?.destinacao || "Análise Manual";

    return new Response(
      JSON.stringify({
        classificacao: {
          tipoDocumental: tipoFinal,
          confianca: confiancaFinal,
          motivo: classificacao.motivo,
          elementosEncontrados: auditoria.elementosConfirmados.length > 0 
            ? auditoria.elementosConfirmados 
            : classificacao.elementosEncontrados,
          chunksRelevantes: chunksExtraidos.map(c => c.texto),
          destinacao: destinacaoFinal,
          auditoriaAprovada: auditoria.aprovado,
          auditoriaMotivo: auditoria.motivo,
          alucinacoesDetectadas: auditoria.alucinacoes,
          processadoEm: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro ao classificar:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    if (errorMessage === "RATE_LIMIT") {
      return new Response(
        JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (errorMessage === "PAYMENT_REQUIRED") {
      return new Response(
        JSON.stringify({ error: "Créditos insuficientes. Adicione créditos em Settings → Workspace." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        classificacao: {
          tipoDocumental: "Outros/Não Identificado",
          confianca: 0,
          motivo: "Erro durante a classificação",
          elementosEncontrados: [],
          chunksRelevantes: [],
          destinacao: "Análise Manual",
          auditoriaAprovada: false,
          auditoriaMotivo: "Erro no processamento",
          processadoEm: new Date().toISOString()
        }
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
