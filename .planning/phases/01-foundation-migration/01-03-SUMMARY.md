---
phase: 01-foundation-migration
plan: 03
subsystem: state-management
tags: [zustand, persist, localStorage, error-boundary, react-error-boundary]

# Dependency graph
requires:
  - phase: 01-02
    provides: TypeScript migration (all components typed)
provides:
  - Zustand store with localStorage persistence (useShowStore)
  - Error boundary components (base, audience-freeze, operator-retry)
  - No more React Context — direct store imports
affects: [02-dual-screen, 05-audience-view, 06-quiz-sections]

# Tech tracking
tech-stack:
  added: [zustand@5, react-error-boundary@6]
  patterns: [zustand-persist-localStorage, individual-selector-pattern, null-guard-pattern, error-boundary-hierarchy]

key-files:
  created:
    - src/state/showStore.ts
    - src/state/index.ts
    - src/app/ErrorBoundary.tsx
    - src/app/AudienceErrorBoundary.tsx
    - src/app/OperatorErrorBoundary.tsx
  modified:
    - src/App.tsx
    - src/main.tsx
    - src/screens/Home.tsx
    - src/screens/Windows.tsx
    - src/screens/QuestionPicker.tsx
    - src/screens/Question.tsx
    - src/screens/Rate.tsx
    - src/screens/Set.tsx
    - src/components/Score.tsx
  deleted:
    - src/contexts/Global.tsx
    - src/contexts/index.ts

key-decisions:
  - "Individual useShowStore selectors over destructured object for React re-render optimization"
  - "Alias data to DATA locally in components to minimize diff size during migration"
  - "Null guard pattern with early return for data-dependent components"
  - "Error boundary wraps BrowserRouter (catches routing errors too)"

patterns-established:
  - "Zustand selector: useShowStore((state) => state.fieldName) for each field"
  - "addRightScore(delta) / addLeftScore(delta) for relative score changes"
  - "toggleTurn() combines setRightsTurn(!current) + setTurned(true) atomically"
  - "updateData(updater) for functional updates to episode data"
  - "null guard: if (!data) return null at top of component (after hooks)"

# Metrics
duration: 10min
completed: 2026-02-10
---

# Phase 1 Plan 3: State & Error Boundaries Summary

**Zustand store with localStorage persist replacing React Context, plus three-tier error boundaries (base/audience-freeze/operator-retry)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-02-10T12:23:22Z
- **Completed:** 2026-02-10T12:34:11Z
- **Tasks:** 3
- **Files modified:** 16 (9 migrated, 2 deleted, 5 created)

## Accomplishments
- All components migrated from React Context (useGlobalContext) to Zustand (useShowStore) with individual selectors
- State persists across browser refresh via localStorage with key 'show-storage'
- Three error boundary types created: base with retry, audience freeze-on-crash, operator auto-retry with skip option
- Context files and Provider wrapper fully removed — no GlobalContextProvider in codebase

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Zustand store with persist middleware** - `c30299e` (feat)
2. **Task 2: Migrate components from Context to Zustand** - `c6c21eb` (feat)
3. **Task 3: Add error boundaries with auto-retry** - `6e91d7b` (feat)

## Files Created/Modified
- `src/state/showStore.ts` - Zustand store with ShowState interface, persist middleware, all actions
- `src/state/index.ts` - Barrel export for store
- `src/app/ErrorBoundary.tsx` - Base error boundary with default fallback and retry button
- `src/app/AudienceErrorBoundary.tsx` - Class component that freezes on last good render (no error shown to audience)
- `src/app/OperatorErrorBoundary.tsx` - Auto-retries once after 500ms, then shows subtle red dot + retry/skip buttons
- `src/App.tsx` - Migrated to useShowStore, loads defaultData on mount
- `src/main.tsx` - Removed GlobalContextProvider, added ErrorBoundary wrapper
- `src/screens/Question.tsx` - Most complex migration: callback setters → addScore/updateData actions
- `src/screens/Rate.tsx` - Score accumulation via addRightScore/addLeftScore
- `src/screens/Set.tsx` - Direct score setters via useShowStore
- `src/screens/Home.tsx` - Individual selectors for all consumed state
- `src/screens/Windows.tsx` - Individual selectors with null guard
- `src/screens/QuestionPicker.tsx` - Individual selectors with null guard
- `src/components/Score.tsx` - Migrated to useShowStore, null guard after hooks
- `src/contexts/Global.tsx` - **Deleted**
- `src/contexts/index.ts` - **Deleted**

## Decisions Made
- **Individual selectors over destructuring:** Used `useShowStore((s) => s.field)` pattern per-field for optimal React re-render performance (only re-renders when specific field changes)
- **Local DATA alias:** In components like Question.tsx and Rate.tsx, aliased `const DATA = data` after null guard to minimize diff from original code and maintain readability of deeply nested access patterns
- **Error types as unknown:** react-error-boundary v6 types error as `unknown` not `Error` — used `instanceof Error` check for safe message extraction
- **Null guard placement:** Placed `if (!data) return null` after all hooks but before any data access, satisfying React's rules of hooks while protecting against initial null state

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed error type mismatch in error boundaries**
- **Found during:** Task 3 (Error boundary creation)
- **Issue:** Plan specified `error: Error` type but react-error-boundary v6 uses `error: unknown`
- **Fix:** Used FallbackProps type from library, added `instanceof Error` check for message extraction
- **Files modified:** src/app/ErrorBoundary.tsx, src/app/OperatorErrorBoundary.tsx
- **Verification:** `tsc --noEmit` passes clean
- **Committed in:** 6e91d7b (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type adjustment for library compatibility. No scope creep.

## Issues Encountered
- Plan 01-04 (Tailwind CSS) running in parallel modified some of the same files (Score.tsx CSS import removed, IconButton.tsx classes changed, main.tsx CSS import path changed). Carefully staged only state-management changes to avoid cross-contamination between parallel plans.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Zustand store ready for dual-screen state sync (Phase 2) — can use `useShowStore.subscribe()` for cross-window updates
- Error boundaries ready for audience/operator split (Phase 5) — AudienceErrorBoundary and OperatorErrorBoundary ready to wrap respective views
- Plan 01-04 (Tailwind CSS) is the last remaining plan in Phase 1

---
*Phase: 01-foundation-migration*
*Completed: 2026-02-10*
