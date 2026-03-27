

## Refactoring: Per-Piece Intelligent Classification Suggestion

### Problem
The classification suggestion currently operates at the **process level** (Section 2), showing one suggestion for the entire process. The user needs it **per piece** inside Section 4 (Peças Processuais), appearing contextually when the evaluator is identifying a specific piece.

### What Changes

**1. Remove process-level suggestion from FormularioAvaliacao.tsx**
- Remove `SugestaoClassificacao` import and usage from Section 2
- Remove `handleAplicarSugestao`, `handleAutoPreenchimento`, `sugestaoAceita` state

**2. Integrate per-piece suggestion into PainelPecasProcessuais.tsx**
- When identification mode opens for a piece, run a local heuristic to suggest the piece type based on:
  - The piece's `tipoInformado` (system-reported type)
  - Historical divergence patterns (types frequently corrected)
  - Known problematic types ("Conclusão" → "Sentença", "Despacho" → "Decisão", etc.)
- This is **client-side only** — no edge function call per piece. The heuristic uses the same rules already in the edge function but applied to each individual piece's `tipoInformado`.

**3. Suggestion behavior inside identification panel (Area B)**
- Appears below the "Tipo da peça identificada" select field
- Confidence-based behavior:
  - **High (≥ 0.85)**: Auto-select the tipo in the dropdown, show "Preenchido automaticamente com base no tipo informado"
  - **Medium (0.6–0.85)**: Show "Sugestão: [tipo] (X%)" with [Aplicar] button
  - **Low (< 0.6)**: Show nothing
- Divergence risk alert when the `tipoInformado` is in the high-risk list
- Never blocks manual selection

**4. Client-side heuristic function**
Create a utility `sugerirTipoPeca(tipoInformado: string, pecasPermanentesExistentes: PecaPermanente[]): { tipo: string; confianca: number; justificativa: string; riscoDivergencia: boolean } | null`

Rules:
- If `tipoInformado` matches a known permanent type exactly (Sentença, Acórdão, Decisão, Petição Inicial, Termo de Audiência) → suggest same type, confidence 0.90
- If `tipoInformado` is "Conclusão" or "Despacho" → suggest "Sentença", confidence 0.70, flag divergence risk
- If `tipoInformado` is "Petição" → suggest "Petição Inicial", confidence 0.75
- If `tipoInformado` is "Outros" → no suggestion (confidence < 0.6)
- Otherwise → no suggestion

**5. Audit logging**
- When a suggestion is applied (auto or manual), log to `avaliacoes_sugestoes_ia` with the piece-specific context (piece ID, tipo_sugerido, confidence, accepted)
- The edge function `classificacao-inteligente` remains available for future use but is not called in this flow

**6. Remove the standalone SugestaoClassificacao.tsx component**
- It will no longer be needed since the logic moves inline into PainelPecasProcessuais

### Files Modified
- `src/components/cogede/PainelPecasProcessuais.tsx` — add per-piece suggestion logic inside identification panel
- `src/components/cogede/FormularioAvaliacao.tsx` — remove SugestaoClassificacao usage
- `src/components/cogede/SugestaoClassificacao.tsx` — delete

### Files Kept (no changes)
- `supabase/functions/classificacao-inteligente/index.ts` — kept for future ML integration
- `avaliacoes_sugestoes_ia` table — continues to be used for audit

