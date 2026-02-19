// Parser para hierarquia de assuntos CNJ baseado em cores de fonte e negrito do XLSX
// Usa exceljs para ler metadados de formatação das células

import ExcelJS from "exceljs";

export interface HierarchyRecord {
  subjectCode: number;
  subjectName: string;
  hierarchyLevel: number;
}

// Mapeamento padrão de cores de fonte para níveis hierárquicos
export interface ColorMapping {
  color: string;      // RGB hex (ex: "000080")
  bold: boolean;       // Se deve ser negrito
  level: number;       // Nível hierárquico
  label: string;       // Rótulo descritivo
}

export const DEFAULT_COLOR_MAPPINGS: ColorMapping[] = [
  { color: "000000", bold: true,  level: 0, label: "Raiz (Preto Negrito)" },
  { color: "000080", bold: false, level: 1, label: "Nível 1 (Azul Marinho)" },
  { color: "B22222", bold: false, level: 2, label: "Nível 2 (Vermelho Tijolo)" },
  { color: "228B22", bold: false, level: 3, label: "Nível 3 (Verde Floresta)" },
  { color: "B8860B", bold: false, level: 4, label: "Nível 4 (Dourado Escuro)" },
  { color: "000000", bold: false, level: 5, label: "Nível 5 (Preto Normal)" },
];

/**
 * Normaliza cor hex para comparação (remove prefixos, uppercase, 6 chars)
 */
function normalizeColor(color: string | undefined): string {
  if (!color) return "000000";
  // Remove prefixos como "FF" (ARGB) se tiver 8 chars
  let hex = color.replace(/^#/, "").toUpperCase();
  if (hex.length === 8) {
    hex = hex.substring(2); // Remove alpha prefix
  }
  return hex.padStart(6, "0");
}

/**
 * Compara duas cores hex com tolerância
 */
function colorsMatch(actual: string, expected: string, tolerance = 20): boolean {
  const a = normalizeColor(actual);
  const e = normalizeColor(expected).toUpperCase();

  if (a === e) return true;

  // Parse RGB e comparar com tolerância
  const ar = parseInt(a.substring(0, 2), 16);
  const ag = parseInt(a.substring(2, 4), 16);
  const ab = parseInt(a.substring(4, 6), 16);
  const er = parseInt(e.substring(0, 2), 16);
  const eg = parseInt(e.substring(2, 4), 16);
  const eb = parseInt(e.substring(4, 6), 16);

  return (
    Math.abs(ar - er) <= tolerance &&
    Math.abs(ag - eg) <= tolerance &&
    Math.abs(ab - eb) <= tolerance
  );
}

/**
 * Determina o nível hierárquico baseado na cor da fonte e estilo negrito
 */
function determineHierarchyLevel(
  fontColor: string | undefined,
  isBold: boolean,
  mappings: ColorMapping[]
): number | null {
  const normalized = normalizeColor(fontColor);

  for (const mapping of mappings) {
    if (mapping.bold === isBold && colorsMatch(normalized, mapping.color)) {
      return mapping.level;
    }
  }
  return null;
}

/**
 * Extrai código numérico de uma string no formato "CODIGO - Nome" ou apenas número
 */
function extractSubjectCode(text: string): number | null {
  if (!text) return null;
  const match = text.trim().match(/^(\d+)\s*[-–]/);
  if (match) return parseInt(match[1], 10);
  // Tentar número puro
  const numMatch = text.trim().match(/^(\d+)$/);
  return numMatch ? parseInt(numMatch[1], 10) : null;
}

/**
 * Extrai o nome do assunto removendo o código numérico
 */
function extractSubjectName(text: string): string {
  return text.replace(/^\d+\s*[-–]\s*/, "").trim();
}

/**
 * Parseia um arquivo XLSX e extrai a hierarquia baseada em cores de fonte e negrito
 */
export async function parseHierarchyXLSX(
  fileBuffer: ArrayBuffer,
  mappings: ColorMapping[] = DEFAULT_COLOR_MAPPINGS
): Promise<HierarchyRecord[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("Nenhuma planilha encontrada no arquivo");
  }

  const records: HierarchyRecord[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // Pular cabeçalhos (primeiras 2 linhas)
    if (rowNumber <= 2) return;

    const cell = row.getCell(1); // Coluna A (nome do assunto)
    const cellValue = cell.text?.trim();
    if (!cellValue) return;

    const code = extractSubjectCode(cellValue);
    if (code === null) return;

    // Extrair formatação da fonte
    const font = cell.font || {};
    const isBold = font.bold === true;

    // Extrair cor da fonte
    let fontColorHex: string | undefined;
    if (font.color) {
      if (font.color.argb) {
        fontColorHex = font.color.argb;
      } else if (font.color.theme !== undefined) {
        // Cores de tema — tratar como preto por padrão
        fontColorHex = "000000";
      }
    }

    const level = determineHierarchyLevel(fontColorHex, isBold, mappings);
    if (level === null) return; // Cor não mapeada, ignorar

    records.push({
      subjectCode: code,
      subjectName: extractSubjectName(cellValue),
      hierarchyLevel: level,
    });
  });

  return records;
}

/**
 * Extrai cores únicas de fonte presentes no XLSX para preview
 */
export async function extractUniqueColors(
  fileBuffer: ArrayBuffer
): Promise<Array<{ color: string; bold: boolean; count: number; sample: string }>> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const colorMap = new Map<string, { count: number; sample: string }>();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= 2) return;

    const cell = row.getCell(1);
    const cellValue = cell.text?.trim();
    if (!cellValue) return;

    const font = cell.font || {};
    const isBold = font.bold === true;
    let fontColorHex = "000000";

    if (font.color?.argb) {
      fontColorHex = normalizeColor(font.color.argb);
    }

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
    return {
      color,
      bold: boldStr === "true",
      count: data.count,
      sample: data.sample,
    };
  });
}
