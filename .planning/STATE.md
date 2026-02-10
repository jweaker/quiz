# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.
**Current focus:** Phase 2 in progress — Dual-Screen Architecture (plan 1 of 3 complete)

## Current Position

Phase: 2 of 7 (Dual-Screen Architecture)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-02-10 — Completed 02-01-PLAN.md (BroadcastChannel middleware, shadcn/ui, operatorStore)

Progress: [█████░░░░░░░░░░░░░░░░░░░░] 5/25 (20%)

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 8 min
- Total execution time: 0.7 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Migration | 4/4 ✅ | 36 min | 9 min |
| 2 - Dual-Screen Architecture | 1/3 | 6 min | 6 min |

**Recent Trend:**
- Last 5 plans: 01-02 (8 min), 01-03 (10 min), 01-04 (11 min), 02-01 (6 min)
- Trend: Consistent ~6-11 min per plan

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dual-screen architecture: Operator controls on laptop, audience view on external display (Pending)
- Individual Zustand selectors: useShowStore((s) => s.field) per field for optimal re-render performance (01-03)
- Physical positioning for Score panels: right/left not start/end for spatial consistency regardless of RTL (01-04)
- @ path alias: baseUrl/paths in tsconfig + resolve.alias in vite.config for shadcn/ui imports (02-01)
- broadcast(persist(creator)) ordering: broadcast wraps persist so BroadcastChannel gets post-hydration state (02-01)
- partialize operatorStore: audienceWindowConnected excluded from persistence — runtime-only state (02-01)
- ESM vite config: fileURLToPath/import.meta.url instead of __dirname for ESM compatibility (02-01)
- esbuild build scripts: pnpm.onlyBuiltDependencies for esbuild to fix EPIPE errors (02-01)

### Pending Todos

None.

### Blockers/Concerns

**Phase 1 (Foundation & Migration):** ✅ COMPLETE

**Phase 2 (Dual-Screen):**
- ~~Multi-window state synchronization patterns~~ — VALIDATED in 02-01 (BroadcastChannel middleware working)

**Phase 4 (Timer System):**
- Web Worker timer implementation patterns need research before detailed planning (MEDIUM confidence)

**Phase 6 (Quiz Sections):**
- 72 animal photos need collection/licensing before Ask Intelligently section implementation

## Session Continuity

Last session: 2026-02-10
Stopped at: Completed 02-01-PLAN.md (BroadcastChannel middleware, shadcn/ui, operatorStore)
Resume file: None
Next step: Execute 02-02-PLAN.md (Operator panel layout, audience display with safe area, settings)
