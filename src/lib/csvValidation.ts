// CSV Validation Utilities for Security
// Provides file size limits, MIME type validation, and formula sanitization

// Constants
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ROW_COUNT = 10000;
export const ALLOWED_EXTENSIONS = ['.csv'];
export const ALLOWED_MIME_TYPES = ['text/csv', 'text/plain', 'application/csv', 'application/vnd.ms-excel'];

// Formula prefixes that could be dangerous in spreadsheet applications
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

export interface CSVValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates file size before processing
 */
export function validateFileSize(file: File): CSVValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo permitido: ${MAX_FILE_SIZE_MB}MB. Seu arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
    };
  }
  return { valid: true };
}

/**
 * Validates file extension
 */
export function validateFileExtension(file: File): CSVValidationResult {
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidExtension) {
    return {
      valid: false,
      error: `Extensão de arquivo inválida. Apenas arquivos CSV são aceitos.`
    };
  }
  return { valid: true };
}

/**
 * Validates MIME type (with fallback for browsers that don't report it correctly)
 */
export function validateMimeType(file: File): CSVValidationResult {
  // Some browsers don't report MIME type correctly for CSV, so we're lenient here
  // The extension check is more reliable
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    // Only fail if the type is explicitly set to something clearly wrong
    const isObviouslyWrong = file.type.startsWith('image/') || 
                              file.type.startsWith('audio/') || 
                              file.type.startsWith('video/') ||
                              file.type === 'application/pdf' ||
                              file.type === 'application/zip';
    if (isObviouslyWrong) {
      return {
        valid: false,
        error: `Tipo de arquivo inválido. Apenas arquivos CSV são aceitos.`
      };
    }
  }
  return { valid: true };
}

/**
 * Validates row count to prevent memory exhaustion
 */
export function validateRowCount(lines: string[]): CSVValidationResult {
  if (lines.length > MAX_ROW_COUNT) {
    return {
      valid: false,
      error: `Arquivo contém muitas linhas (${lines.length}). Máximo permitido: ${MAX_ROW_COUNT} linhas.`
    };
  }
  return { valid: true };
}

/**
 * Sanitizes a CSV cell value to prevent formula injection
 * Removes or escapes dangerous prefixes that could execute as formulas in Excel/LibreOffice
 */
export function sanitizeCellValue(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  let sanitized = value.trim();
  
  // If the value starts with a formula prefix, prepend with a single quote
  // This is the standard way to escape formulas in CSV
  if (FORMULA_PREFIXES.some(prefix => sanitized.startsWith(prefix))) {
    sanitized = "'" + sanitized;
  }
  
  return sanitized;
}

/**
 * Checks if a value contains suspicious patterns (for logging/warning purposes)
 */
export function hasSuspiciousContent(value: string): boolean {
  if (!value) return false;
  
  // Common formula injection patterns
  const suspiciousPatterns = [
    /^=.*\(/i,           // =FUNCTION(
    /^@.*\(/i,           // @FUNCTION(
    /^\+.*\(/i,          // +FUNCTION(
    /^-.*\(/i,           // -FUNCTION(
    /cmd|powershell|bash|sh\s/i,  // Shell commands
    /javascript:/i,      // JavaScript protocol
    /<script/i,          // Script tags
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(value));
}

/**
 * Full file validation - runs all checks
 */
export function validateCSVFile(file: File): CSVValidationResult {
  const sizeCheck = validateFileSize(file);
  if (!sizeCheck.valid) return sizeCheck;
  
  const extensionCheck = validateFileExtension(file);
  if (!extensionCheck.valid) return extensionCheck;
  
  const mimeCheck = validateMimeType(file);
  if (!mimeCheck.valid) return mimeCheck;
  
  return { valid: true };
}

/**
 * Sanitizes all values in a CSV row
 */
export function sanitizeCSVRow(values: string[]): string[] {
  return values.map(sanitizeCellValue);
}
