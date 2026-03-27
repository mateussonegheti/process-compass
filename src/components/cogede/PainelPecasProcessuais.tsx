import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ExternalLink, 
  FileCheck, 
  AlertTriangle, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Keyboard,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { TIPOS_PECA } from "@/types/cogede";

// ── Multi-signal heuristic suggestion ────────────────────────────────────────
interface SugestaoPeca {
  tipo: string;
  confianca: number;
  justificativa: string;
  riscoDivergencia: boolean;
  regraAplicada: string;
  sinaisDetectados: string[];
}

// Movement description patterns → suggested type
const MOVIMENTO_PATTERNS: { pattern: RegExp; tipo: string; peso: number; label: string }[] = [
  { pattern: /proced[eê]ncia/i, tipo: "Sentença", peso: 0.35, label: "Procedência" },
  { pattern: /improced[eê]ncia/i, tipo: "Sentença", peso: 0.35, label: "Improcedência" },
  { pattern: /parcial\s*proced[eê]ncia/i, tipo: "Sentença", peso: 0.35, label: "Parcial Procedência" },
  { pattern: /julgamento/i, tipo: "Acórdão", peso: 0.30, label: "Julgamento" },
  { pattern: /audi[eê]ncia/i, tipo: "Termo de Audiência", peso: 0.30, label: "Audiência" },
  { pattern: /homologa[çc][ãa]o/i, tipo: "Sentença Homologaçao", peso: 0.30, label: "Homologação" },
];

// Complemento text patterns → suggested type
const COMPLEMENTO_PATTERNS: { pattern: RegExp; tipo: string; peso: number; label: string }[] = [
  { pattern: /senten[çc]a/i, tipo: "Sentença", peso: 0.35, label: "Sentença (complemento)" },
  { pattern: /julgad[ao]\s*procedente/i, tipo: "Sentença", peso: 0.35, label: "Julgada procedente" },
  { pattern: /julgad[ao]\s*improcedente/i, tipo: "Sentença", peso: 0.35, label: "Julgada improcedente" },
  { pattern: /extingo\s*o\s*processo/i, tipo: "Sentença", peso: 0.35, label: "Extingo o processo" },
  { pattern: /resolu[çc][ãa]o\s*do\s*m[ée]rito/i, tipo: "Sentença", peso: 0.35, label: "Resolução do mérito" },
  { pattern: /ac[óo]rd[ãa]o/i, tipo: "Acórdão", peso: 0.35, label: "Acórdão (complemento)" },
  { pattern: /\bvoto\b/i, tipo: "Voto", peso: 0.30, label: "Voto (complemento)" },
  { pattern: /homologa[çc][ãa]o\s*de\s*acordo/i, tipo: "Sentença Homologaçao", peso: 0.30, label: "Homologação de acordo" },
  { pattern: /\bacordo\b/i, tipo: "Sentença Homologaçao", peso: 0.30, label: "Acordo (complemento)" },
  { pattern: /audi[eê]ncia/i, tipo: "Termo de Audiência", peso: 0.30, label: "Audiência (complemento)" },
];

// Known permanent types for tipoInformado reinforcement
const TIPOS_PERMANENTES_CONHECIDOS = new Set([
  "sentença", "acórdão", "decisão", "petição inicial", "termo de audiência",
  "voto", "voto de sessão", "voto relator", "voto vogal",
  "ementa e acórdão", "inteiro teor do acórdão", "sentença homologaçao",
  "sentença primeiro grau", "petição inicial (atermação)", "ata de sessão", "portaria",
]);

// High-risk types that frequently need correction (fallback only)
const TIPOS_ALTO_RISCO: Record<string, { sugestao: string; confianca: number }> = {
  "conclusão": { sugestao: "Sentença", confianca: 0.55 },
  "despacho": { sugestao: "Sentença", confianca: 0.50 },
  "petição": { sugestao: "Petição Inicial", confianca: 0.55 },
};

function sugerirTipoPeca(movimento: MovimentoProcessual): SugestaoPeca | null {
  if (!movimento) return null;

  const codigoDesc = movimento.codigo || "";
  const complemento = movimento.complemento || "";
  const tipoInformado = movimento.tipoInformado || "";
  const tipoLower = tipoInformado.toLowerCase().trim();

  let tipoSugerido = "";
  let score = 0.10; // base
  const sinais: string[] = [];
  let regraAplicada = "";
  let riscoDivergencia = false;

  // --- Priority 1: Movement description ---
  let movimentoMatch: typeof MOVIMENTO_PATTERNS[0] | null = null;
  for (const rule of MOVIMENTO_PATTERNS) {
    if (rule.pattern.test(codigoDesc)) {
      movimentoMatch = rule;
      break;
    }
  }

  if (movimentoMatch) {
    tipoSugerido = movimentoMatch.tipo;
    score += movimentoMatch.peso;
    sinais.push(`movimento: ${movimentoMatch.label}`);
    regraAplicada = `movimento_${movimentoMatch.label.toLowerCase().replace(/\s+/g, "_")}`;
  }

  // --- Priority 2: Complemento text ---
  let complementoMatch: typeof COMPLEMENTO_PATTERNS[0] | null = null;
  for (const rule of COMPLEMENTO_PATTERNS) {
    if (rule.pattern.test(complemento)) {
      complementoMatch = rule;
      break;
    }
  }

  if (complementoMatch) {
    // If no movement match, use complemento as primary
    if (!tipoSugerido) {
      tipoSugerido = complementoMatch.tipo;
    }
    // If types align, add full weight; if not, use complemento type
    if (tipoSugerido === complementoMatch.tipo) {
      score += complementoMatch.peso;
    } else {
      // Conflicting signals — use complemento (usually more specific)
      tipoSugerido = complementoMatch.tipo;
      score += complementoMatch.peso * 0.5;
    }
    sinais.push(`complemento: ${complementoMatch.label}`);
    regraAplicada = regraAplicada
      ? `${regraAplicada}_${complementoMatch.label.toLowerCase().replace(/\s+/g, "_")}`
      : `complemento_${complementoMatch.label.toLowerCase().replace(/\s+/g, "_")}`;
  }

  // --- Priority 3: tipoInformado reinforcement ---
  if (tipoSugerido) {
    // Check if tipoInformado aligns with the suggested type
    if (tipoLower === tipoSugerido.toLowerCase()) {
      score += 0.15;
      sinais.push(`tipo_peca: ${tipoInformado}`);
    } else if (TIPOS_PERMANENTES_CONHECIDOS.has(tipoLower)) {
      // tipoInformado is a known type but doesn't match suggestion — mild reinforcement
      score += 0.05;
      sinais.push(`tipo_informado: ${tipoInformado} (não alinhado)`);
      riscoDivergencia = true;
    }
  }

  // --- Priority 4: Only tipoInformado available (no movement/complemento signals) ---
  if (!tipoSugerido) {
    // No structural signals found; fall back to tipoInformado only
    if (TIPOS_PERMANENTES_CONHECIDOS.has(tipoLower)) {
      tipoSugerido = tipoInformado;
      score = Math.min(score + 0.45, 0.60); // cap at 0.60 when sole signal
      sinais.push(`tipo_informado: ${tipoInformado} (único sinal)`);
      regraAplicada = "tipo_informado_unico";
    } else {
      // Check high-risk types
      const risco = TIPOS_ALTO_RISCO[tipoLower];
      if (risco) {
        tipoSugerido = risco.sugestao;
        score = Math.min(score + 0.35, 0.60);
        sinais.push(`tipo_informado_risco: ${tipoInformado}`);
        regraAplicada = "tipo_informado_alto_risco";
        riscoDivergencia = true;
      }
    }
  }

  // No suggestion possible
  if (!tipoSugerido || score < 0.6) return null;

  // Cap score at 1.0
  const confiancaFinal = Math.min(score, 1.0);

  // Build justificativa from detected signals
  const sinaisTexto = sinais.join(" + ");
  const justificativa = `Sugestão baseada em ${sinaisTexto}, compatíveis com peça do tipo ${tipoSugerido}.`;

  return {
    tipo: tipoSugerido,
    confianca: confiancaFinal,
    justificativa,
    riscoDivergencia,
    regraAplicada,
    sinaisDetectados: sinais,
  };
}

// Interface para movimento processual (virá da planilha de importação)
export interface MovimentoProcessual {
  id: string;
  codigo: string;
  descricao: string;
  complemento?: string;
  data: string;
  tipoInformado: string;
  idPeca: string;
}

// Interface para peça identificada como permanente
export interface PecaPermanente {
  movimentoId: string;
  tipoIdentificado: string;
  idPeca: string;
  temDivergencia: boolean;
  tipoInformadoSistema?: string;
  tipoRealIdentificado?: string;
}

// Interface para dados concatenados do CSV
export interface DadosMovimentosConcatenados {
  movimentoCodigo?: string;      // "101 | 102 | 103"
  movimentoDescricao?: string;   // "Petição Inicial | Despacho | Sentença"
  complemento?: string;          // "Distribuição | Cite-se | Procedente"
  movimentoData?: string;        // "01/01/2020 | 05/01/2020 | 15/06/2020"
  idsPecas: string;              // "506978 | 506979 | 539990"
  tiposPecas: string;            // "Petição Inicial | Despacho | Sentença"
}

interface PainelPecasProcessuaisProps {
  // Pode receber movimentos já parseados OU dados concatenados do CSV
  movimentos?: MovimentoProcessual[];
  dadosConcatenados?: DadosMovimentosConcatenados;
  pecasPermanentes: PecaPermanente[];
  onAdicionarPecaPermanente: (peca: PecaPermanente) => void;
  onRemoverPecaPermanente: (movimentoId: string) => void;
  observacoesPecas: string;
  onObservacoesChange: (value: string) => void;
  ocorrencias: {
    documentoNaoLocalizado: boolean;
    documentoDuplicado: boolean;
    erroTecnico: boolean;
    outroDetalhe: string;
  };
  onOcorrenciasChange: (ocorrencias: {
    documentoNaoLocalizado: boolean;
    documentoDuplicado: boolean;
    erroTecnico: boolean;
    outroDetalhe: string;
  }) => void;
  modoDemonstracao?: boolean;
}

// URL base do Projudi para visualização de peças
const PROJUDI_BASE_URL = "https://projudi.tjmg.jus.br/projudi/listagens/DownloadArquivo?arquivo=";


// Função para parsear data no formato dd/mm/aaaa para ordenação
function parseDataBR(dataStr: string): Date | null {
  if (!dataStr || dataStr.trim() === "") return null;
  const partes = dataStr.trim().split("/");
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes;
  const anoCompleto = ano.length === 2 ? (parseInt(ano) > 50 ? `19${ano}` : `20${ano}`) : ano;
  return new Date(parseInt(anoCompleto), parseInt(mes) - 1, parseInt(dia));
}

// Função para fazer parse das listas concatenadas
function parseMovimentosConcatenados(dados: DadosMovimentosConcatenados): MovimentoProcessual[] {
  const ids = dados.idsPecas?.split(" | ").map(s => s.trim()).filter(Boolean) || [];
  const tipos = dados.tiposPecas?.split(" | ").map(s => s.trim()).filter(Boolean) || [];
  const codigos = dados.movimentoCodigo?.split(" | ").map(s => s.trim()) || [];
  const descricoes = dados.movimentoDescricao?.split(" | ").map(s => s.trim()) || [];
  const complementos = dados.complemento?.split(" | ").map(s => s.trim()) || [];
  const datas = dados.movimentoData?.split(" | ").map(s => s.trim()) || [];

  // O array de IDs é a referência principal
  const movimentos = ids.map((idPeca, index) => ({
    id: `mov-${index}-${idPeca}`,
    // Concatenar código + descrição para o campo "Movimento"
    codigo: codigos[index] && descricoes[index] 
      ? `${codigos[index]} - ${descricoes[index]}` 
      : codigos[index] || descricoes[index] || String(index + 1),
    descricao: descricoes[index] || tipos[index] || "Documento",
    complemento: complementos[index] || undefined,
    data: datas[index] || "",
    tipoInformado: tipos[index] || "Outros",
    idPeca: idPeca
  }));

  // Ordenar por data (mais recente primeiro)
  return movimentos.sort((a, b) => {
    const dataA = parseDataBR(a.data);
    const dataB = parseDataBR(b.data);
    
    // Se ambos têm data, ordenar mais recente primeiro
    if (dataA && dataB) return dataB.getTime() - dataA.getTime();
    // Se só um tem data, ele vem primeiro
    if (dataA && !dataB) return -1;
    if (!dataA && dataB) return 1;
    // Se nenhum tem data, manter ordem original
    return 0;
  });
}

export function PainelPecasProcessuais({
  movimentos: movimentosProps,
  dadosConcatenados,
  pecasPermanentes,
  onAdicionarPecaPermanente,
  onRemoverPecaPermanente,
  observacoesPecas,
  onObservacoesChange,
  ocorrencias,
  onOcorrenciasChange,
  modoDemonstracao = false,
}: PainelPecasProcessuaisProps) {
  const [movimentoSelecionado, setMovimentoSelecionado] = useState<MovimentoProcessual | null>(null);
  const [modoIdentificacao, setModoIdentificacao] = useState(false);
  const [tipoIdentificado, setTipoIdentificado] = useState("");
  const [idPecaEditavel, setIdPecaEditavel] = useState("");
  const [temDivergencia, setTemDivergencia] = useState(false);
  const [focusPanel, setFocusPanel] = useState<"list" | "identification">("list");
  const [sugestaoAplicada, setSugestaoAplicada] = useState<Record<string, boolean>>({});

  // Refs for cards and scroll container
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const listContainerRef = useRef<HTMLDivElement>(null);
  const identificationPanelRef = useRef<HTMLDivElement>(null);
  const tipoSelectRef = useRef<HTMLButtonElement>(null);

  // Fazer parse dos movimentos: usa props direto ou dados concatenados do CSV (SEM MOCK)
  const movimentos = useMemo(() => {
    if (movimentosProps && movimentosProps.length > 0) {
      return movimentosProps;
    }
    if (dadosConcatenados && dadosConcatenados.idsPecas) {
      return parseMovimentosConcatenados(dadosConcatenados);
    }
    // Se não há dados, retornar lista vazia (sem mock)
    return [];
  }, [movimentosProps, dadosConcatenados]);


  // Verificar se um movimento já foi identificado como permanente (por movimentoId ou idPeca)
  const isPecaPermanente = useCallback((movimentoId: string, idPeca?: string) => {
    return pecasPermanentes.some(p => p.movimentoId === movimentoId || (idPeca && p.idPeca === idPeca));
  }, [pecasPermanentes]);

  // Verificar se um movimento tem divergência registrada
  const temDivergenciaRegistrada = useCallback((movimentoId: string, idPeca?: string) => {
    const peca = pecasPermanentes.find(p => p.movimentoId === movimentoId || (idPeca && p.idPeca === idPeca));
    return peca?.temDivergencia || false;
  }, [pecasPermanentes]);

  // Auto-scroll to selected card
  const scrollToCard = useCallback((movimentoId: string) => {
    requestAnimationFrame(() => {
      const el = cardRefs.current.get(movimentoId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }, []);

  // Selecionar movimento (with auto-scroll)
  const handleSelecionarMovimento = useCallback((movimento: MovimentoProcessual) => {
    setMovimentoSelecionado(movimento);
    setModoIdentificacao(false);
    setTipoIdentificado(movimento.tipoInformado);
    setIdPecaEditavel(movimento.idPeca);
    setTemDivergencia(false);
    scrollToCard(movimento.id);
  }, [scrollToCard]);

  // Iniciar identificação de peça permanente
  const handleIniciarIdentificacao = useCallback(() => {
    setModoIdentificacao(true);
    setFocusPanel("identification");

    // Per-piece heuristic: auto-fill if high confidence
    if (movimentoSelecionado) {
      const sugestao = sugerirTipoPeca(movimentoSelecionado);
      if (sugestao && sugestao.confianca >= 0.85) {
        setTipoIdentificado(sugestao.tipo);
        setSugestaoAplicada(prev => ({ ...prev, [movimentoSelecionado.id]: true }));
      }
    }

    // Auto-focus the tipo select when opening identification
    setTimeout(() => {
      tipoSelectRef.current?.focus();
    }, 100);
  }, [movimentoSelecionado]);

  // Salvar identificação da peça
  const handleSalvarIdentificacao = useCallback(() => {
    if (!movimentoSelecionado) return;

    const novaPeca: PecaPermanente = {
      movimentoId: movimentoSelecionado.id,
      tipoIdentificado,
      idPeca: idPecaEditavel,
      temDivergencia,
      tipoInformadoSistema: temDivergencia ? movimentoSelecionado.tipoInformado : undefined,
      tipoRealIdentificado: temDivergencia ? tipoIdentificado : undefined
    };

    onAdicionarPecaPermanente(novaPeca);
    
    // After saving, auto-advance to PREVIOUS piece (upward — evaluation goes bottom-to-top)
    const currentIdx = movimentos.findIndex(m => m.id === movimentoSelecionado.id);
    let prevIdx = -1;
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (!isPecaPermanente(movimentos[i].id, movimentos[i].idPeca)) {
        prevIdx = i;
        break;
      }
    }
    
    setModoIdentificacao(false);
    setTemDivergencia(false);
    
    if (prevIdx !== -1) {
      handleSelecionarMovimento(movimentos[prevIdx]);
      setFocusPanel("list");
      setTimeout(() => (listContainerRef.current?.closest('[tabindex="0"]') as HTMLElement)?.focus(), 50);
    } else {
      setMovimentoSelecionado(null);
      setTipoIdentificado("");
      setIdPecaEditavel("");
    }
  }, [movimentoSelecionado, tipoIdentificado, idPecaEditavel, temDivergencia, onAdicionarPecaPermanente, movimentos, isPecaPermanente, handleSelecionarMovimento]);

  // Remover identificação
  const handleRemoverIdentificacao = () => {
    if (!movimentoSelecionado) return;
    onRemoverPecaPermanente(movimentoSelecionado.idPeca);
    setMovimentoSelecionado(null);
    setModoIdentificacao(false);
  };

  // Gerar URL da peça
  const gerarUrlPeca = (idPeca: string) => `${PROJUDI_BASE_URL}${idPeca}`;

  const abrirDocumento = useCallback((idPeca: string, tipoPeca?: string, movimento?: MovimentoProcessual) => {
    // Update selection to the card whose document is being opened
    if (movimento) {
      handleSelecionarMovimento(movimento);
    }

    if (modoDemonstracao) {
      const nomeTipo = tipoPeca || "Documento";
      const conteudo = [
        "DOCUMENTO FICTÍCIO - MODO DEMONSTRAÇÃO",
        "",
        `Peça: ${nomeTipo}`,
        `ID: ${idPeca}`,
        "",
        "Este arquivo é sintético e não contém dados reais.",
      ].join("\n");

      const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      return;
    }

    window.open(gerarUrlPeca(idPeca), "_blank", "noopener,noreferrer");
  }, [modoDemonstracao, handleSelecionarMovimento]);

  // Keyboard navigation
  const selectedIndex = useMemo(() => {
    if (!movimentoSelecionado) return -1;
    return movimentos.findIndex(m => m.id === movimentoSelecionado.id);
  }, [movimentoSelecionado, movimentos]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (movimentos.length === 0) return;

    const target = e.target as HTMLElement;
    const isInputField = ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
      target.getAttribute("role") === "combobox" ||
      target.getAttribute("role") === "listbox" ||
      target.getAttribute("role") === "option" ||
      target.closest("[role='listbox']") !== null;

    const navigate = (newIndex: number) => {
      if (newIndex >= 0 && newIndex < movimentos.length) {
        handleSelecionarMovimento(movimentos[newIndex]);
      }
    };

    // Ctrl+Enter → save identification
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (movimentoSelecionado && modoIdentificacao && tipoIdentificado && idPecaEditavel) {
        handleSalvarIdentificacao();
      }
      return;
    }


    // Ctrl+← → focus list panel
    if ((e.ctrlKey || e.metaKey) && e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusPanel("list");
      listContainerRef.current?.focus();
      return;
    }

    // Ctrl+Space → focus tipo select
    if ((e.ctrlKey || e.metaKey) && e.key === " ") {
      e.preventDefault();
      if (movimentoSelecionado && modoIdentificacao) {
        tipoSelectRef.current?.click();
      }
      return;
    }

    // Esc → close identification panel, return focus to list
    if (e.key === "Escape") {
      if (modoIdentificacao) {
        e.preventDefault();
        setModoIdentificacao(false);
        setFocusPanel("list");
        listContainerRef.current?.focus();
      }
      return;
    }

    // If focus is inside an input/select/textarea/combobox, skip navigation shortcuts
    if (isInputField) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        setFocusPanel("list");
        const next = selectedIndex < 0 ? 0 : Math.min(selectedIndex + 1, movimentos.length - 1);
        navigate(next);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        setFocusPanel("list");
        const prev = selectedIndex <= 0 ? 0 : selectedIndex - 1;
        navigate(prev);
        break;
      }
      case "Enter": {
        e.preventDefault();
        if (movimentoSelecionado) {
          abrirDocumento(movimentoSelecionado.idPeca, movimentoSelecionado.tipoInformado, movimentoSelecionado);
        }
        break;
      }
      case " ": {
        e.preventDefault();
        if (movimentoSelecionado) {
          if (isPecaPermanente(movimentoSelecionado.id, movimentoSelecionado.idPeca)) {
            handleRemoverIdentificacao();
          } else {
            handleIniciarIdentificacao();
          }
        }
        break;
      }
    }
  }, [movimentos, selectedIndex, movimentoSelecionado, handleSelecionarMovimento, abrirDocumento, isPecaPermanente, modoIdentificacao, tipoIdentificado, idPecaEditavel, handleSalvarIdentificacao, handleIniciarIdentificacao]);


  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
            4
          </span>
          Peças Processuais
          <Badge variant="outline" className="ml-auto">
            {pecasPermanentes.length} peça(s) permanente(s)
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Movimentos processuais e identificação de peças de guarda permanente
        </p>



        {/* Keyboard shortcuts hint */}
        {movimentos.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Keyboard className="h-3 w-3" />
            <span>↑↓ navegar · Enter abrir · Space identificar · Ctrl+← voltar lista · Ctrl+Space tipo · Ctrl+Enter salvar · Esc fechar identificação</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Layout side-by-side */}
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px] outline-none"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          
          {/* Área A - Lista de Movimentos */}
          <div
            className={`border rounded-lg focus:outline-none transition-shadow ${focusPanel === "list" ? "ring-2 ring-ring" : ""}`}
            ref={listContainerRef}
            tabIndex={-1}
          >
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Movimentos do Processo
              </h3>
            </div>
            
            <ScrollArea className="h-[450px]">
              <div className="p-2 space-y-2">
                {movimentos.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-muted-foreground py-12">
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">
                        Nenhuma peça processual disponível.<br />
                        <span className="text-xs">Os dados de peças serão carregados da planilha de importação.</span>
                      </p>
                    </div>
                  </div>
                ) : movimentos.map((movimento) => {
                  const isPermanente = isPecaPermanente(movimento.id, movimento.idPeca);
                  const temDiverg = temDivergenciaRegistrada(movimento.id, movimento.idPeca);
                  const isSelected = movimentoSelecionado?.id === movimento.id;
                  
                  
                  return (
                    <div
                      key={movimento.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(movimento.id, el);
                        else cardRefs.current.delete(movimento.id);
                      }}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected && !isPermanente ? 'border-destructive bg-destructive/10 ring-1 ring-destructive' : ''}
                        ${isSelected && isPermanente ? 'border-green-600 bg-green-100 ring-1 ring-green-600' : ''}
                        ${!isSelected && isPermanente ? 'bg-green-50 border-green-200' : ''}
                        ${!isSelected && !isPermanente ? 'border-border hover:border-primary/50 hover:bg-muted/30' : ''}
                        ${temDiverg && !isSelected ? 'bg-amber-50 border-amber-200' : ''}
                      `}
                      onClick={() => handleSelecionarMovimento(movimento)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">{movimento.tipoInformado}</span>
                            <span className="text-xs text-muted-foreground">Mov. {movimento.codigo}</span>
                            {isPermanente && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                            {temDiverg && (
                              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            )}
                          </div>

                          
                          {movimento.complemento && (
                            <p className="text-xs text-muted-foreground truncate">
                              {movimento.complemento}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Data: {movimento.data}</span>
                            <span>•</span>
                            <span>Tipo: {movimento.tipoInformado}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              ID: {movimento.idPeca}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirDocumento(movimento.idPeca, movimento.tipoInformado, movimento);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Abrir peça
                            </Button>
                          </div>
                        </div>
                        
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
          
          {/* Área B - Identificação da Peça */}
          <div
            className={`border rounded-lg transition-shadow ${focusPanel === "identification" ? "ring-2 ring-ring" : ""}`}
            ref={identificationPanelRef}
            tabIndex={-1}
          >
            <div className="bg-muted/50 px-4 py-2 border-b">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <FileCheck className="h-4 w-4" />
                Identificação da Peça
              </h3>
            </div>
            
            <div className="p-4 h-[450px] overflow-y-auto">
              {!movimentoSelecionado ? (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                  <div>
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      Selecione um movimento à esquerda<br />
                      para identificar peça de guarda permanente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Contexto do movimento (somente leitura) */}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Movimento selecionado
                    </h4>
                    <div>
                      <span className="text-sm text-muted-foreground">Movimento:</span>
                      <p className="text-sm font-medium">{movimentoSelecionado.codigo}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Data:</span>
                      <span className="ml-1 font-medium text-sm">{movimentoSelecionado.data || "—"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Complemento:</span>
                      <p className="text-sm">{movimentoSelecionado.complemento || "—"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Tipo informado:</span>
                      <Badge variant="outline" className="ml-2">{movimentoSelecionado.tipoInformado}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">ID da peça:</span>
                      <code className="bg-background px-2 py-0.5 rounded text-sm">{movimentoSelecionado.idPeca}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7"
                        onClick={() => abrirDocumento(movimentoSelecionado.idPeca, movimentoSelecionado.tipoInformado)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visualizar
                      </Button>
                    </div>
                  </div>


                  {/* Verificar se já foi identificado */}
                  {isPecaPermanente(movimentoSelecionado.id, movimentoSelecionado.idPeca) ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800 mb-3">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">Peça identificada como permanente</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoverIdentificacao}
                        className="text-destructive hover:text-destructive"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Remover identificação
                      </Button>
                    </div>
                  ) : !modoIdentificacao ? (
                    /* Ação principal - botão para identificar */
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Se esta peça for de guarda permanente,<br />
                        registre sua identificação abaixo.
                      </p>
                      <Button onClick={handleIniciarIdentificacao}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Identificar peça permanente
                      </Button>
                    </div>
                  ) : (
                    /* Formulário de identificação */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tipo da peça identificada</Label>
                        <Select value={tipoIdentificado} onValueChange={setTipoIdentificado}>
                          <SelectTrigger ref={tipoSelectRef}>
                            <SelectValue placeholder="Selecione o tipo..." />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_PECA.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Inline per-piece suggestion */}
                        {movimentoSelecionado && (() => {
                          const sugestao = sugerirTipoPeca(movimentoSelecionado);
                          if (!sugestao) return null;
                          const confiancaPct = Math.round(sugestao.confianca * 100);
                          const wasAutoFilled = sugestaoAplicada[movimentoSelecionado.id];

                          // Low confidence → hide
                          if (sugestao.confianca < 0.6) return null;

                          // High confidence auto-filled
                          if (sugestao.confianca >= 0.85 && wasAutoFilled) {
                            return (
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                <Sparkles className="h-3 w-3" />
                                Preenchido automaticamente com base no tipo informado ({confiancaPct}%)
                              </p>
                            );
                          }

                          // Medium confidence → show suggestion with apply button
                          if (sugestao.confianca < 0.85) {
                            return (
                              <div className="mt-2 space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Sugestão:
                                  </span>
                                  <Badge variant="outline" className="text-xs font-medium">
                                    {sugestao.tipo} ({confiancaPct}%)
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setTipoIdentificado(sugestao.tipo);
                                      setSugestaoAplicada(prev => ({ ...prev, [movimentoSelecionado.id]: true }));
                                    }}
                                    className="h-6 px-2 text-xs text-primary hover:text-primary"
                                  >
                                    Aplicar
                                  </Button>
                                </div>
                                <p className="text-xs text-muted-foreground pl-4">
                                  {sugestao.justificativa}
                                </p>
                                {sugestao.riscoDivergencia && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 pl-4">
                                    <AlertTriangle className="h-3 w-3" />
                                    Este tipo de processo frequentemente apresenta divergência de classificação
                                  </p>
                                )}
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>

                      <div className="space-y-2">
                        <Label>ID da peça</Label>
                        <Input
                          value={idPecaEditavel}
                          onChange={(e) => setIdPecaEditavel(e.target.value)}
                          placeholder="ID da peça no Projudi"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Link para visualização</Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-muted px-2 py-1 rounded text-xs truncate">
                            {modoDemonstracao ? `documento-demo-${idPecaEditavel || "sem-id"}.txt` : gerarUrlPeca(idPecaEditavel)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirDocumento(idPecaEditavel, tipoIdentificado || movimentoSelecionado?.tipoInformado)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Divergência */}
                      <div className="border-t pt-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            id="divergencia"
                            checked={temDivergencia}
                            onCheckedChange={(c) => setTemDivergencia(c as boolean)}
                          />
                          <Label htmlFor="divergencia" className="text-sm font-normal">
                            Divergência entre o movimento/peça e o tipo identificado
                          </Label>
                        </div>

                        {temDivergencia && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">Tipo informado no sistema</Label>
                              <Input
                                value={movimentoSelecionado.tipoInformado}
                                disabled
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">Tipo identificado pelo avaliador</Label>
                              <Input
                                value={tipoIdentificado || "(selecione o tipo acima)"}
                                disabled
                                className="bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-amber-800">ID da peça usada para verificação</Label>
                              <Input
                                value={idPecaEditavel}
                                disabled
                                className="bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botão salvar */}
                      <Button 
                        onClick={handleSalvarIdentificacao} 
                        className="w-full"
                        disabled={!tipoIdentificado || !idPecaEditavel}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Salvar identificação da peça
                        <kbd className="ml-2 text-xs opacity-70 bg-primary-foreground/20 px-1.5 py-0.5 rounded">Ctrl+Enter</kbd>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campo global - Observações e Ocorrências */}
        <div className="mt-6 space-y-4 border-t pt-4">
          <div className="space-y-2">
            <Label>4.3 Observações sobre peças</Label>
            <Textarea
              placeholder="Adicione observações sobre as peças processuais..."
              value={observacoesPecas}
              onChange={(e) => onObservacoesChange(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Ocorrências</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docNaoLoc"
                  checked={ocorrencias.documentoNaoLocalizado}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, documentoNaoLocalizado: c as boolean })}
                />
                <Label htmlFor="docNaoLoc" className="text-sm font-normal">
                  Documento não localizado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="docDup"
                  checked={ocorrencias.documentoDuplicado}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, documentoDuplicado: c as boolean })}
                />
                <Label htmlFor="docDup" className="text-sm font-normal">
                  Documento duplicado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="erroTec"
                  checked={ocorrencias.erroTecnico}
                  onCheckedChange={(c) => onOcorrenciasChange({ ...ocorrencias, erroTecnico: c as boolean })}
                />
                <Label htmlFor="erroTec" className="text-sm font-normal">
                  Erro técnico
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Outro detalhe de ocorrência</Label>
              <Input
                placeholder="Descreva outra ocorrência se necessário..."
                value={ocorrencias.outroDetalhe}
                onChange={(e) => onOcorrenciasChange({ ...ocorrencias, outroDetalhe: e.target.value })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
