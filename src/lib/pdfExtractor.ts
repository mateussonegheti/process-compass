// Extrator de texto de PDFs usando pdf.js
// Funciona no navegador, acessa PDFs via URL

import * as pdfjsLib from "pdfjs-dist";

// Configure worker - use CDN for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extrai texto de um PDF a partir de uma URL.
 * @param url URL do PDF (Projudi ou blob URL)
 * @returns Texto extraído concatenado de todas as páginas
 */
export async function extrairTextoPdf(url: string): Promise<string> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      url,
      // Desabilitar range requests para simplificar
      disableRange: true,
      disableStream: true,
    });

    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      textParts.push(pageText);
    }

    return textParts.join("\n\n");
  } catch (error: any) {
    // CORS errors or network errors
    if (error?.name === "MissingPDFException" || error?.message?.includes("Missing PDF")) {
      throw new Error("PDF não encontrado na URL fornecida");
    }
    if (error?.message?.includes("fetch") || error?.message?.includes("Failed") || error?.message?.includes("CORS")) {
      throw new Error("CORS_BLOCKED");
    }
    throw new Error(`Erro ao extrair texto do PDF: ${error?.message || "desconhecido"}`);
  }
}
