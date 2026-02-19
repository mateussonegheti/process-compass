// Parser para a planilha CNJ de Temporalidade
// Estrutura: Nome, 90 dias, 2 anos, 3 anos, 5 anos, 10 anos, 20 anos, 30 anos, 40 anos, 100 anos, Permanente, Não se aplica, vide Guia de Aplicação, Cod. Nota

export interface TemporalidadeRecord {
  codigo: number;
  nome: string;
  temporalidade: string; // "Permanente", "5 anos", "90 dias", etc.
  tipoGuarda: string;    // "Permanente", "Temporal", "Não se aplica", "Vide Guia"
}

// Colunas de temporalidade (índices 1-12 no CSV)
const COLUNAS_TEMPORALIDADE = [
  { indice: 1, label: "90 dias" },
  { indice: 2, label: "2 anos" },
  { indice: 3, label: "3 anos" },
  { indice: 4, label: "5 anos" },
  { indice: 5, label: "10 anos" },
  { indice: 6, label: "20 anos" },
  { indice: 7, label: "30 anos" },
  { indice: 8, label: "40 anos" },
  { indice: 9, label: "100 anos" },
  { indice: 10, label: "Permanente" },
  { indice: 11, label: "Não se aplica" },
  { indice: 12, label: "Vide Guia de Aplicação" },
];

function parseCSVLineTemporalidade(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Extrai o código numérico de uma string no formato "CODIGO - Nome"
 */
export function extrairCodigoAssunto(valor: string): number | null {
  if (!valor) return null;
  const match = valor.match(/^(\d+)\s*-/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parseia o CSV de temporalidade CNJ e retorna registros normalizados
 */
export function parseTemporalidadeCSV(csvContent: string): TemporalidadeRecord[] {
  const lines = csvContent.split("\n").filter(line => line.trim());
  const records: TemporalidadeRecord[] = [];

  // Pular linha 1 (título) e linha 2 (cabeçalhos)
  for (let i = 2; i < lines.length; i++) {
    const values = parseCSVLineTemporalidade(lines[i]);
    const nome = values[0]?.trim();
    if (!nome) continue;

    const codigo = extrairCodigoAssunto(nome);
    if (codigo === null) continue;

    // Encontrar qual coluna de temporalidade tem "X"
    let temporalidade = "";
    let tipoGuarda = "";

    for (const col of COLUNAS_TEMPORALIDADE) {
      const valor = values[col.indice]?.trim().toUpperCase();
      if (valor === "X") {
        if (col.label === "Permanente") {
          temporalidade = "Permanente";
          tipoGuarda = "Permanente";
        } else if (col.label === "Não se aplica") {
          temporalidade = "Não se aplica";
          tipoGuarda = "Não se aplica";
        } else if (col.label === "Vide Guia de Aplicação") {
          temporalidade = "Vide Guia de Aplicação";
          tipoGuarda = "Vide Guia";
        } else {
          temporalidade = col.label;
          tipoGuarda = "Temporal";
        }
        break;
      }
    }

    // Pular linhas sem temporalidade definida (categorias-pai)
    if (!temporalidade) continue;

    // Extrair nome sem o código
    const nomeClean = nome.replace(/^\d+\s*-\s*/, "").trim();

    records.push({
      codigo,
      nome: nomeClean,
      temporalidade,
      tipoGuarda,
    });
  }

  return records;
}
