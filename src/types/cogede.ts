// Tipos do Sistema COGEDE

export interface ProcessoFila {
  ID?: string; // ID do banco de dados
  CODIGO_PROCESSO: string;
  NUMERO_CNJ: string;
  POSSUI_ASSUNTO: string;
  ASSUNTO_PRINCIPAL: string;
  POSSUI_MOV_ARQUIVADO: string;
  DATA_DISTRIBUICAO: string;
  DATA_ARQUIVAMENTO_DEF: string;
  PRAZO_5_ANOS_COMPLETO: string;
  STATUS_AVALIACAO: "PENDENTE" | "EM_ANALISE" | "CONCLUIDO";
  RESPONSAVEL?: string;
  DATA_INICIO_AVALIACAO?: string;
  DATA_FIM?: string;
  // Campos preenchidos pela avaliação
  GUARDA?: string;
  ARQUIVOS?: string;
}

export interface PecaProcessual {
  id: string;
  tipo: string;
  idProjudi: string;
}

export interface AvaliacaoDocumental {
  // Seção 1 - Identificação (auto-preenchido)
  codigoProcesso: string;
  numeroCnj: string;

  // Seção 2 - Assunto/TPU (parcialmente auto-preenchido)
  possuiAssunto: string;
  assuntoPrincipal: string;
  descricaoAssuntoFaltante?: string;
  assuntoTpu?: string;
  hierarquiaCorreta?: string;
  divergenciaHierarquia?: string;
  destinacaoPermanente?: string;

  // Seção 3 - Movimentações/Prazos (parcialmente auto-preenchido)
  possuiMovArquivado: string;
  descricaoSituacaoArquivamento?: string;
  dataDistribuicao: string;
  dataArquivamentoDef: string;
  prazo5AnosCompleto: string;
  inconsistenciaPrazo?: string;

  // Seção 4 - Peças Processuais
  pecas: PecaProcessual[];
  pecasTipos: string;
  pecasIds: string;
  pecasCombinado: string;
  observacoesPecas?: string;
  documentoNaoLocalizado?: boolean;
  documentoDuplicado?: boolean;
  erroTecnico?: boolean;
  ocorrenciasOutroDetalhe?: string;
  divergenciaClassificacao?: string;
  tipoInformadoSistema?: string;
  tipoRealIdentificado?: string;
  divergenciasDetalhes?: string;

  // Seção 5 - Inconsistências
  processoVazio?: boolean;
  observacoesGerais?: string;

  // Metadados
  responsavel: string;
  dataInicioAvaliacao: string;
  dataFimAvaliacao?: string;
}

export interface SessaoAvaliacao {
  responsavel: string;
  processoAtual?: ProcessoFila;
  iniciada: boolean;
}

export const ASSUNTOS_TPU = [
  "Abandono de Cargo",
  "Abandono de Emprego",
  "Abono de Permanência",
  "Absorção de Função",
  "Acidente de Trabalho",
  "Ação Civil Pública",
  "Ação Popular",
  "Adicional de Insalubridade",
  "Adicional de Periculosidade",
  "Adicional Noturno",
  "Admissão",
  "Aposentadoria",
  "Aposentadoria Compulsória",
  "Aposentadoria por Invalidez",
  "Aposentadoria por Tempo de Contribuição",
  "Aposentadoria Voluntária",
  "Auxílio-Alimentação",
  "Auxílio-Doença",
  "Auxílio-Reclusão",
  "Auxílio-Transporte",
  "Avaliação de Desempenho",
  "Cargo em Comissão",
  "Cessão",
  "Compensação",
  "Concurso Público",
  "Contribuição Previdenciária",
  "Conversão de Licença",
  "Demissão",
  "Disponibilidade",
  "Enquadramento",
  "Estágio Probatório",
  "Exoneração",
  "Férias",
  "FGTS",
  "Função Gratificada",
  "Gratificação",
  "Hora Extra",
  "Improbidade Administrativa",
  "Indenização",
  "Licença",
  "Licença Capacitação",
  "Licença Gestante",
  "Licença Médica",
  "Licença Prêmio",
  "Mandado de Segurança",
  "Nomeação",
  "Pensão",
  "Processo Administrativo",
  "Progressão Funcional",
  "Promoção",
  "Readaptação",
  "Reclassificação",
  "Reconhecimento de Vínculo",
  "Redistribuição",
  "Reintegração",
  "Remoção",
  "Remuneração",
  "Rescisão Contratual",
  "Reversão",
  "Revisão de Aposentadoria",
];

export const TIPOS_PECA = [
  "Acórdão",
  "Acórdão dos Embargos de Declaração",
  "Acordo",
  "Andamento Processual",
  "Ata de Sessão",
  "Ata Geral de Sessão de Julgamento",
  "Autorização Judicial",
  "Decisão",
  "Decisão - STF, STJ, TJMG",
  "Decisão de Inadmissão do Recurso Extraordinário",
  "Decisão em Pedido Urgência",
  "Decisões Primeiro Grau",
  "Decisões Segundo Grau",
  "Ementa e Acórdão",
  "Inteiro Teor do Acórdão",
  "Petição Inicial",
  "Petição Inicial (Atermação)",
  "Portaria",
  "Precedentes - STF",
  "Sentença",
  "Sentença Homologaçao",
  "Sentença Primeiro Grau",
  "Termo de Audiência",
  "Voto",
  "Voto de Sessão",
  "Voto Relator",
  "Voto Vogal",
  "Outros",
];
