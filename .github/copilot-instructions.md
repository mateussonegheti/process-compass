# Process Compass - AI Coding Instructions

## Project Overview
Process Compass is a React + TypeScript SPA for managing judicial process evaluations and document management (COGEDE system). Deployed on GitHub Pages with a Supabase backend.

## Core Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (Radix primitives + Tailwind)
- **Styling**: Tailwind CSS + PostCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: React Query + React Hook Form
- **Routing**: React Router v6
- **Charting**: Recharts

### Key File Structure
- `src/pages/` - Three main routes: Index (dashboard), Login, Admin
- `src/components/cogede/` - Domain components (Dashboard, Evaluations, Merge)
- `src/components/ui/` - shadcn/ui exported components (auto-generated via CLI)
- `src/hooks/useAuth.tsx` - Auth context + role management (admin/supervisor/avaliador)
- `src/integrations/supabase/client.ts` - Supabase client singleton
- `src/types/cogede.ts` - Domain types (ProcessoFila, AvaliacaoDocumental)

## Critical Patterns

### Authentication & Authorization
- **Three roles**: admin, supervisor, avaliador
- `useAuth()` hook provides user, session, role, isAdmin/isSupervisor/isAvaliador flags
- **ProtectedRoute** wrapper in App.tsx enforces UI-level access (but RLS policies are primary security)
- Role fetched from user profile table on auth state change

### Data Fetching
- Use React Query for server state (see DashboardSupervisor.tsx for patterns)
- Supabase client: `import { supabase } from "@/integrations/supabase/client"`
- Always handle loading and error states

### CSV Import Security
- `src/lib/csvValidation.ts`: File size (10MB), extension, MIME type, formula injection checks
- Sanitize formula prefixes (=, +, -, @, \t, \r) before storing
- Validate before upload; show user-friendly error messages

### Form Patterns
- Use React Hook Form + Zod validation
- shadcn/ui form wrapper in `src/components/ui/form.tsx`
- FormularioAvaliacao.tsx shows domain form structure

### Styling
- Tailwind utility-first; use `cn()` from `@/lib/utils` for conditional classes
- Dark mode via next-themes (theme stored in localStorage)
- Component-scoped CSS rarely needed

## Development Workflow

### Commands
```bash
npm run dev      # Start dev server (http://localhost:8080)
npm run build    # Production build (to dist/)
npm run preview  # Preview production build locally
npm run lint     # ESLint check (strict off for vars)
```

### Build & Deployment
- **Base URL**: `/process-compass/` (GitHub Pages subpath)
- **Auto-deploy**: `.github/workflows/deploy.yml` runs on main branch push
- Uses SWC for fast transpilation via `@vitejs/plugin-react-swc`

### TypeScript Config
- Loose checking: `noImplicitAny: false`, `strictNullChecks: false` (intentional)
- Path alias: `@/*` → `./src/*`
- Reference: tsconfig.app.json and tsconfig.node.json

## Integration Points

### Supabase
- **URL & Key**: Environment variables VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
- **Auth**: Uses localStorage for session persistence, auto-refresh enabled
- **Types**: Auto-generated from migrations → `src/integrations/supabase/types.ts`
- **RLS**: Database policies enforce security; UI-level checks are secondary

### Environment Variables
Create `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-key
```

## Common Workflows

### Adding a New Component
1. Create in `src/components/cogede/` or `src/components/ui/`
2. For UI: Use shadcn/ui CLI or copy existing component structure
3. Import and use in pages or parent components

### Adding a New Page
1. Create in `src/pages/PageName.tsx`
2. Add route in App.tsx Routes
3. Wrap with ProtectedRoute if authentication needed

### Modifying Database
1. Create migration: `supabase migration new description`
2. Write SQL in `supabase/migrations/`
3. Types auto-sync to `src/integrations/supabase/types.ts`
4. Update domain types in `src/types/cogede.ts` as needed

### Handling Errors & Logging
- Import `logger` from `@/lib/logger` for structured logging
- Use `sonner` toast for user-facing errors (see imports in App.tsx)
- Catch async operations and show appropriate UI feedback

## Conventions

- **No unused vars** via eslint rule (allows flexibility during development)
- **React Hooks Rules** enforced; components must be pure
- **API errors**: Always catch and display via toast/alert
- **Portuguese naming**: Domain types and components use Portuguese (COGEDE system)
- **shadcn/ui pattern**: Radix-based, headless by default; compose with Tailwind

## Process Queue Management (Sistema de Fila)

### Process States & Transitions
```
PENDENTE → EM_ANALISE → CONCLUIDO
            ↓ (inatividade 1h)
          PENDENTE (volta silenciosamente)
```

**States:**
- **PENDENTE**: Aguardando avaliação (responsavel_avaliacao = NULL)
- **EM_ANALISE**: Avaliador está preenchendo (responsavel_avaliacao = avaliador_id)
- **CONCLUIDO**: Avaliação finalizada (salvo no banco)

### Critical Rules

1. **Lock por Avaliador**: Dois avaliadores NUNCA podem abrir o mesmo processo em EM_ANALISE
   - Campo `responsavel_avaliacao` garante isso
   - Ao clicar "Iniciar", sistema atualiza para EM_ANALISE com ID do avaliador

2. **Timeout Automático (1 HORA)**: Processo sem interação por 1h volta a PENDENTE silenciosamente
   - Hook `useInactivityTimeout` rastreia: digitação, clicks, scroll, salvamento
   - Atualiza `ultima_interacao` timestamp a cada 30s de atividade
   - Função `liberar_processos_orfaos()` roda periodicamente (via Supabase CRON)
   - Sem avisos ao usuário - processo volta automaticamente

3. **Ao Editar Processo Anterior**: Se avaliador A está em EM_ANALISE com Processo Y e vai editar Processo X (CONCLUIDO)
   - Handler `handleEditarAvaliacao` libera Processo Y automaticamente
   - Y volta a PENDENTE (responsavel_avaliacao = NULL)
   - Agora A pode editar X normalmente

4. **Re-edição sem Salvar**: Quando editor fecha sem salvar
   - Processo mantém status anterior (ex: CONCLUIDO continua CONCLUIDO)
   - Nenhuma validação necessária - apenas guardado é persistido no banco

5. **Pode Salvar Vazio**: Avaliador pode deixar campos em branco
   - Sistema permite (validação é opcional)
   - Nota: recomendado adicionar validação obrigatória via Zod se necessário

### Database Schema
```sql
processos_fila {
  id: UUID (PK)
  codigo_processo: VARCHAR
  ...existing fields...
  
  -- Queue control
  responsavel_avaliacao: UUID (FK users) - Quem está avaliando agora
  status_avaliacao: ENUM (PENDENTE|EM_ANALISE|CONCLUIDO)
  
  -- Inactivity tracking
  ultima_interacao: TIMESTAMP - Última ação do avaliador
  tempo_captura: TIMESTAMP - Quando foi pego para EM_ANALISE
  
  -- Edit control
  avaliador_id_original: UUID (FK users) - Quem avaliou originalmente
}
```

### Key Hooks & Functions

**`useInactivityTimeout(processoId, enabled)`**
- Path: `src/hooks/useInactivityTimeout.ts`
- Detecta: keydown, click, scroll, change, input
- Atualiza `ultima_interacao` cada 30s de atividade
- Chamado em `FormularioAvaliacao.tsx`

**`liberar_processos_orfaos()`**
- SQL: `supabase/migrations/20260126_add_queue_control.sql`
- Limpa processos em EM_ANALISE com 1h+ sem interação
- Volta para PENDENTE silenciosamente
- Executado via CRON do Supabase

## Notes for AI Agents

- This is a **GitHub Pages deployment**: Static site; no backend API routes
- **All data persistence** goes through Supabase (auth, storage, functions)
- **No Next.js or SSR**: Pure SPA, so all rendering happens client-side
- **Bundle size**: Monitor dependencies; Vite handles tree-shaking
- **GitHub Actions**: Triggered only on main branch; PR builds may differ from live site
- **Queue Management**: Critical for multi-user evaluation scenarios - monitor timeout logic carefully
