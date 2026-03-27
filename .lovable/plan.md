

## Refactoring: Multi-Signal Classification Heuristic

### Problem
The current `sugerirTipoPeca` function only looks at `tipoInformado` (the system-reported piece type) and mirrors it back. It ignores the movement code/description and complemento fields, which often carry stronger evidence about the actual document type.

### What Changes

**1. Rewrite `sugerirTipoPeca` to accept full movement context**

Change signature from `sugerirTipoPeca(tipoInformado)` to `sugerirTipoPeca(movimento: MovimentoProcessual)` so it can inspect `codigo` (which contains "219 - Procedência"), `complemento` ("SENTENÇA JULGADA PROCEDENTE"), and `tipoInformado`.

**2. Multi-signal heuristic with priority ordering**

Priority 1 — Movement description (extracted from `codigo` field which is formatted as "CODE - Description"):
- "Procedência", "Improcedência", "Parcial Procedência" → Sentença (+0.35)
- "Julgamento" → Acórdão (+0.30)
- "Audiência" → Termo de Audiência (+0.30)
- "Homologação" → Sentença Homologação (+0.30)

Priority 2 — Complemento text (case-insensitive pattern matching):
- Contains "SENTENÇA", "JULGADA PROCEDENTE", "JULGADA IMPROCEDENTE", "EXTINGO O PROCESSO", "RESOLUÇÃO DO MÉRITO" → Sentença (+0.35)
- Contains "ACÓRDÃO" → Acórdão (+0.35)
- Contains "VOTO" → Voto (+0.30)
- Contains "ACORDO", "HOMOLOGAÇÃO DE ACORDO" → Sentença Homologação (+0.30)
- Contains "AUDIÊNCIA" → Termo de Audiência (+0.30)

Priority 3 — Tipo da peça (`tipoInformado`):
- Direct match with known type → +0.15 (reinforcement only, not primary)

Priority 4 — Tipo informado as sole signal:
- If no movement/complemento signals found, use tipoInformado alone → max confidence 0.60

**3. Confidence scoring**

- Base: 0.10
- Movement signal: +0.35
- Complemento signal: +0.35
- Tipo peça alignment: +0.15
- Tipo informado alignment: +0.05
- Capped at 1.0
- If only tipoInformado available: max 0.60

**4. Rich justificativa generation**

Build justificativa string from detected signals:
- "Sugestão baseada no movimento 'Procedência' e no complemento 'Sentença julgada procedente', compatíveis com peça decisória do tipo Sentença."

Add `sinais_detectados` array and `regra_aplicada` string to the return type.

**5. Update UI text**

Replace "Preenchido automaticamente com base no tipo informado" with contextual text showing actual signals:
- High confidence: "Sugestão: Sentença (96%) — Base: Procedência + 'Sentença julgada procedente'" with auto-fill
- Medium confidence: Same format with Aplicar button
- Show signals detected below the suggestion

**6. Update `avaliacoes_sugestoes_ia` table**

Add two columns via migration:
- `regra_aplicada text`
- `sinais_detectados jsonb`

### Files Modified
- `src/components/cogede/PainelPecasProcessuais.tsx` — rewrite heuristic function, update suggestion UI
- Migration for `avaliacoes_sugestoes_ia` new columns

### Files Kept
- `supabase/functions/classificacao-inteligente/index.ts` — kept for future use, not called in this flow
- `src/components/cogede/FormularioAvaliacao.tsx` — no changes needed

