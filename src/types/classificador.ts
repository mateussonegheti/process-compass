// Tipos do Classificador IA de Peças Processuais

export interface PecaParaClassificar {
  id: string;
  nomeArquivo: string;
  codigoProcesso?: string;
  conteudoTexto?: string;
  pdfUrl?: string; // Para quando tivermos acesso direto
  arquivo?: File;
  status: 'PENDENTE' | 'CLASSIFICANDO' | 'AGUARDANDO_CONFIRMACAO' | 'CONFIRMADO' | 'ERRO';
  classificacaoIA?: ClassificacaoIA;
  classificacaoFinal?: string;
  confirmadoPor?: string;
  dataConfirmacao?: string;
}

export interface ClassificacaoIA {
  tipoDocumental: string;
  confianca: number; // 0-100
  motivo: string;
  elementosEncontrados: string[];
  destinacao: 'Guarda Permanente' | 'Eliminação' | 'Análise Manual';
  processadoEm: string;
}

export interface SessaoClassificacao {
  responsavel: string;
  iniciada: boolean;
  pecaAtual?: PecaParaClassificar;
  totalPecas: number;
  classificadas: number;
  confirmadas: number;
}

// Mapa de tipos documentais extraído do CSV
export const TIPOS_DOCUMENTAIS = [
  "Acórdão",
  "Acórdão dos Embargos de Declaração",
  "Acordo",
  "Andamento Processual",
  "Ata de Sessão",
  "Ata Geral de Sessão de Julgamento",
  "Atestado Médico",
  "Auto de Arrematação",
  "Auto de Penhora",
  "Aviso de Recebimento (AR)",
  "Carta de Sentença",
  "Carta Precatória",
  "Certidão",
  "Certidão de Julgamento",
  "Certidão de Objeto e Pé",
  "Certidão de Trânsito em Julgado",
  "Comprovante de Pagamento",
  "Contestação",
  "Contrarrazões",
  "Decisão Interlocutória",
  "Decisão Monocrática",
  "Demonstrativo de Débito",
  "Despacho",
  "Edital",
  "Embargos de Declaração",
  "Guia de Custas",
  "Impugnação",
  "Intimação",
  "Laudo Pericial",
  "Mandado",
  "Manifestação",
  "Ofício",
  "Parecer do Ministério Público",
  "Petição",
  "Petição Inicial",
  "Procuração",
  "Quesitos",
  "Recurso",
  "Réplica",
  "Sentença",
  "Substabelecimento",
  "Termo de Audiência",
  "Termo de Juntada",
  "Outros/Não Identificado"
] as const;

export type TipoDocumental = typeof TIPOS_DOCUMENTAIS[number];

// Mapeamento de destinação por tipo (baseado no CSV)
export const DESTINACAO_POR_TIPO: Record<string, 'Guarda Permanente' | 'Eliminação' | 'Análise Manual'> = {
  "Acórdão": "Guarda Permanente",
  "Acórdão dos Embargos de Declaração": "Guarda Permanente",
  "Acordo": "Guarda Permanente",
  "Ata de Sessão": "Guarda Permanente",
  "Ata Geral de Sessão de Julgamento": "Guarda Permanente",
  "Carta de Sentença": "Guarda Permanente",
  "Certidão de Trânsito em Julgado": "Guarda Permanente",
  "Decisão Monocrática": "Guarda Permanente",
  "Laudo Pericial": "Guarda Permanente",
  "Parecer do Ministério Público": "Guarda Permanente",
  "Petição Inicial": "Guarda Permanente",
  "Sentença": "Guarda Permanente",
  "Termo de Audiência": "Guarda Permanente",
  // Eliminação
  "Andamento Processual": "Eliminação",
  "Aviso de Recebimento (AR)": "Eliminação",
  "Comprovante de Pagamento": "Eliminação",
  "Guia de Custas": "Eliminação",
  "Intimação": "Eliminação",
  "Termo de Juntada": "Eliminação",
  // Análise Manual para os demais
  "Outros/Não Identificado": "Análise Manual"
};

// Palavras-chave para classificação (extraídas do CSV)
export const PALAVRAS_CHAVE_POR_TIPO: Record<string, string[]> = {
  "Sentença": [
    "JULGO PROCEDENTE", "JULGO IMPROCEDENTE", "resolvo o mérito",
    "art. 487", "dispositivo", "condeno", "absolvo", "homologo",
    "extingo o processo", "julgo extinto"
  ],
  "Acórdão": [
    "EMENTA", "acordam os desembargadores", "dar provimento",
    "negar provimento", "Câmara Cível", "Turma Recursal",
    "decisão unânime", "por unanimidade"
  ],
  "Petição Inicial": [
    "qualificação das partes", "causa de pedir", "DOS FATOS",
    "DO DIREITO", "DOS PEDIDOS", "requer a citação",
    "valor da causa", "provas que pretende produzir"
  ],
  "Decisão Interlocutória": [
    "DEFIRO", "INDEFIRO", "tutela de urgência",
    "tutela antecipada", "preliminar", "art. 203, §2º"
  ],
  "Despacho": [
    "Cite-se", "Intime-se", "Cumpra-se", "Aguarde-se",
    "Dê-se vista", "Junte-se", "Manifeste-se"
  ],
  "Certidão": [
    "CERTIFICO", "CERTIDÃO", "para os devidos fins",
    "dou fé", "em testemunho da verdade"
  ],
  "Mandado": [
    "MANDADO DE CITAÇÃO", "MANDADO DE INTIMAÇÃO",
    "oficial de justiça", "dilação de prazo"
  ],
  "Procuração": [
    "PROCURAÇÃO", "constituo meu procurador",
    "poderes para o foro em geral", "poderes especiais",
    "ad judicia"
  ],
  "Termo de Audiência": [
    "TERMO DE AUDIÊNCIA", "presentes as partes",
    "aberta a audiência", "encerrada a audiência",
    "oitiva de testemunhas"
  ],
  "Contestação": [
    "CONTESTAÇÃO", "contesta a presente ação",
    "preliminarmente", "no mérito", "impugna"
  ],
  "Laudo Pericial": [
    "LAUDO PERICIAL", "perito judicial",
    "quesitos", "conclusão pericial", "exame pericial"
  ],
  "Acordo": [
    "as partes acordaram", "termo de acordo",
    "composição amigável", "transação", "quitação"
  ]
};
