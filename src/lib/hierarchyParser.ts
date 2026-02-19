// Parser unificado para a planilha CNJ de Temporalidade + Hierarquia
// Extrai: temporalidade (marcações X nas colunas) + hierarquia (cor da fonte + negrito da coluna "Nome")
// Usa exceljs para ler metadados de formatação das células

import ExcelJS from "exceljs";

export interface TemporalidadeHierarchyRecord {
  codigo: number;
  nome: string;
  temporalidade: string;   // "Permanente", "5 anos", "90 dias", etc.
  tipoGuarda: string;      // "Permanente", "Temporal", "Não se aplica", "Vide Guia"
  hierarchyLevel: number;  // 0=Raiz, 1-5=profundidade, -1=desconhecido
  isLeaf: boolean;         // true se é nó folha (sem filhos)
}

export interface HierarchyTreeNode {
  codigo: number;
  nome: string;
  hierarchyLevel: number;
  isLeaf: boolean;
  temporalidade: string;
  tipoGuarda: string;
  children: HierarchyTreeNode[];
}

// Mapeamento padrão de cores de fonte para níveis hierárquicos
export interface ColorMapping {
  color: string;
  bold: boolean;
  level: number;
  label: string;
}

export const DEFAULT_COLOR_MAPPINGS: ColorMapping[] = [
  { color: "000000", bold: true,  level: 0, label: "Raiz (Preto Negrito)" },
  { color: "000080", bold: false, level: 1, label: "Nível 1 (Azul Marinho)" },
  { color: "B22222", bold: false, level: 2, label: "Nível 2 (Vermelho Tijolo)" },
  { color: "228B22", bold: false, level: 3, label: "Nível 3 (Verde Floresta)" },
  { color: "B8860B", bold: false, level: 4, label: "Nível 4 (Dourado Escuro)" },
  { color: "000000", bold: false, level: 5, label: "Nível 5 (Preto Normal)" },
];

// Colunas de temporalidade (índices 1-based no XLSX, colunas B até M)
const COLUNAS_TEMPORALIDADE = [
  { colIndex: 2,  label: "90 dias" },
  { colIndex: 3,  label: "2 anos" },
  { colIndex: 4,  label: "3 anos" },
  { colIndex: 5,  label: "5 anos" },
  { colIndex: 6,  label: "10 anos" },
  { colIndex: 7,  label: "20 anos" },
  { colIndex: 8,  label: "30 anos" },
  { colIndex: 9,  label: "40 anos" },
  { colIndex: 10, label: "100 anos" },
  { colIndex: 11, label: "Permanente" },
  { colIndex: 12, label: "Não se aplica" },
  { colIndex: 13, label: "Vide Guia de Aplicação" },
];

function normalizeColor(color: string | undefined): string {
  if (!color) return "000000";
  let hex = color.replace(/^#/, "").toUpperCase();
  if (hex.length === 8) hex = hex.substring(2);
  return hex.padStart(6, "0");
}

function colorsMatch(actual: string, expected: string, tolerance = 20): boolean {
  const a = normalizeColor(actual);
  const e = normalizeColor(expected).toUpperCase();
  if (a === e) return true;
  const ar = parseInt(a.substring(0, 2), 16);
  const ag = parseInt(a.substring(2, 4), 16);
  const ab = parseInt(a.substring(4, 6), 16);
  const er = parseInt(e.substring(0, 2), 16);
  const eg = parseInt(e.substring(2, 4), 16);
  const eb = parseInt(e.substring(4, 6), 16);
  return Math.abs(ar - er) <= tolerance && Math.abs(ag - eg) <= tolerance && Math.abs(ab - eb) <= tolerance;
}

function determineHierarchyLevel(fontColor: string | undefined, isBold: boolean, mappings: ColorMapping[]): number | null {
  const normalized = normalizeColor(fontColor);
  for (const mapping of mappings) {
    if (mapping.bold === isBold && colorsMatch(normalized, mapping.color)) return mapping.level;
  }
  return null;
}

function extractSubjectCode(text: string): number | null {
  if (!text) return null;
  const match = text.trim().match(/^(\d+)\s*[-–]/);
  if (match) return parseInt(match[1], 10);
  const numMatch = text.trim().match(/^(\d+)$/);
  return numMatch ? parseInt(numMatch[1], 10) : null;
}

function extractSubjectName(text: string): string {
  return text.replace(/^\d+\s*[-–]\s*/, "").trim();
}

function extractTemporalidade(row: ExcelJS.Row): { temporalidade: string; tipoGuarda: string } {
  for (const col of COLUNAS_TEMPORALIDADE) {
    const cell = row.getCell(col.colIndex);
    const value = cell.text?.trim().toUpperCase();
    if (value === "X") {
      if (col.label === "Permanente") return { temporalidade: "Permanente", tipoGuarda: "Permanente" };
      if (col.label === "Não se aplica") return { temporalidade: "Não se aplica", tipoGuarda: "Não se aplica" };
      if (col.label === "Vide Guia de Aplicação") return { temporalidade: "Vide Guia de Aplicação", tipoGuarda: "Vide Guia" };
      return { temporalidade: col.label, tipoGuarda: "Temporal" };
    }
  }
  return { temporalidade: "", tipoGuarda: "" };
}

/**
 * Encontra o índice da coluna "Nome" no cabeçalho (linhas 1-2)
 * Fallback para coluna 1 (A) se não encontrada
 */
function findNomeColumnIndex(worksheet: ExcelJS.Worksheet): number {
  for (let rowNum = 1; rowNum <= 2; rowNum++) {
    const row = worksheet.getRow(rowNum);
    if (!row) continue;
    for (let colNum = 1; colNum <= 20; colNum++) {
      const cell = row.getCell(colNum);
      const val = cell.text?.trim().toLowerCase();
      if (val === "nome") return colNum;
    }
  }
  return 1; // fallback: coluna A
}

/**
 * Extrai cor da fonte de uma célula
 */
function getCellFontColor(cell: ExcelJS.Cell): string | undefined {
  const font = cell.font || {};
  if (font.color) {
    if (font.color.argb) return font.color.argb;
    if (font.color.theme !== undefined) return "000000";
  }
  return undefined;
}

/**
 * Parseia um arquivo XLSX e extrai temporalidade + hierarquia
 * Hierarquia é detectada APENAS pela coluna "Nome" (cor de fonte + negrito)
 * Leaf nodes são determinados por transições de hierarquia, não por propriedades fixas
 */
export async function parseTemporalidadeXLSX(
  fileBuffer: ArrayBuffer,
  mappings: ColorMapping[] = DEFAULT_COLOR_MAPPINGS
): Promise<TemporalidadeHierarchyRecord[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("Nenhuma planilha encontrada no arquivo");

  const nomeColIndex = findNomeColumnIndex(worksheet);

  // First pass: collect all records with hierarchy levels
  const rawRecords: Omit<TemporalidadeHierarchyRecord, "isLeaf">[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return;

    const cell = row.getCell(nomeColIndex);
    const cellValue = cell.text?.trim();
    if (!cellValue) return;

    const code = extractSubjectCode(cellValue);
    if (code === null) return;

    // Hierarchy from "Nome" column ONLY
    const font = cell.font || {};
    const isBold = font.bold === true;
    const fontColorHex = getCellFontColor(cell);
    const level = determineHierarchyLevel(fontColorHex, isBold, mappings);
    const hierarchyLevel = level ?? -1;

    // Temporalidade from retention columns
    const { temporalidade, tipoGuarda } = extractTemporalidade(row);

    rawRecords.push({
      codigo: code,
      nome: extractSubjectName(cellValue),
      temporalidade,
      tipoGuarda,
      hierarchyLevel,
    });
  });

  // Second pass: determine leaf nodes by hierarchy transitions
  // A node is a leaf if:
  //   - it's the last record, OR
  //   - the next record has a level <= current level (hierarchy decreases or stays same)
  const records: TemporalidadeHierarchyRecord[] = rawRecords.map((r, i) => {
    let isLeaf = true;
    if (i < rawRecords.length - 1) {
      const nextLevel = rawRecords[i + 1].hierarchyLevel;
      // If next row is deeper, current is NOT a leaf (it has children)
      if (nextLevel > r.hierarchyLevel) {
        isLeaf = false;
      }
    }
    return { ...r, isLeaf };
  });

  return records;
}

/**
 * Constrói árvore hierárquica a partir dos registros planos
 */
export function buildHierarchyTree(records: TemporalidadeHierarchyRecord[]): HierarchyTreeNode[] {
  const roots: HierarchyTreeNode[] = [];
  const stack: HierarchyTreeNode[] = [];

  for (const record of records) {
    const node: HierarchyTreeNode = {
      codigo: record.codigo,
      nome: record.nome,
      hierarchyLevel: record.hierarchyLevel,
      isLeaf: record.isLeaf,
      temporalidade: record.temporalidade,
      tipoGuarda: record.tipoGuarda,
      children: [],
    };

    // Pop stack until we find a parent (a node with a shallower level)
    while (stack.length > 0 && stack[stack.length - 1].hierarchyLevel >= record.hierarchyLevel) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return roots;
}

/**
 * Extrai cores únicas de fonte da coluna "Nome" para preview
 */
export async function extractUniqueColors(
  fileBuffer: ArrayBuffer
): Promise<Array<{ color: string; bold: boolean; count: number; sample: string }>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const nomeColIndex = findNomeColumnIndex(worksheet);
  const colorMap = new Map<string, { count: number; sample: string }>();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return;

    const cell = row.getCell(nomeColIndex);
    const cellValue = cell.text?.trim();
    if (!cellValue) return;

    const font = cell.font || {};
    const isBold = font.bold === true;
    let fontColorHex = "000000";
    if (font.color?.argb) fontColorHex = normalizeColor(font.color.argb);

    const key = `${fontColorHex}-${isBold}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { count: 1, sample: cellValue.substring(0, 60) });
    }
  });

  return Array.from(colorMap.entries()).map(([key, data]) => {
    const [color, boldStr] = key.split("-");
    return { color, bold: boldStr === "true", count: data.count, sample: data.sample };
  });
}
