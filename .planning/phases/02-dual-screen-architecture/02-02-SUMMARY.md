---
phase: 02-dual-screen-architecture
plan: 02
subsystem: ui
tags: [react-router, resizable-panels, safe-area, theme, operator, audience, broadcast-display]

# Dependency graph
requires:
  - phase: 02-01
    provides: operatorStore, shadcn/ui components, BroadcastChannel middleware, @ path alias
  - phase: 01-foundation
    provides: showStore with Zustand persist, Tailwind CSS v4, TypeScript strict, error boundaries
provides:
  - /operator route with themed resizable panel layout
  - /audience route with 16:9 broadcast display and safe area positioning
  - ThemeProvider and ThemeToggle for operator dark/light mode
  - Settings page for safe area margin configuration
  - safeArea utility for converting SafeArea config to CSS positioning
  - OperatorRoot and AudienceRoot layout wrappers with error boundaries
affects: [02-03-PLAN, 03-game-state, 05-visual-system, 06-quiz-sections]

# Tech tracking
tech-stack:
  added: []
  patterns: [lazy-loaded route screens, resizable panel layout with persisted sizes, safe area margin system for broadcast content, theme sync via useLayoutEffect]

key-files:
  created:
    - src/app/OperatorRoot.tsx
    - src/app/AudienceRoot.tsx
    - src/components/operator/ThemeProvider.tsx
    - src/components/operator/ThemeToggle.tsx
    - src/screens/operator/OperatorPanel.tsx
    - src/screens/operator/OperatorControls.tsx
    - src/screens/operator/Settings.tsx
    - src/screens/audience/AudienceDisplay.tsx
    - src/lib/safeArea.ts
  modified:
    - src/App.tsx

key-decisions:
  - "ResizablePanelGroup v4 API: Uses orientation (not direction), onLayoutChanged (not onLayout), panel id prop for layout tracking"
  - "Lazy-loaded route screens: OperatorPanel, AudienceDisplay, Settings loaded via React.lazy for code splitting"
  - "Root redirect: / redirects to /operator as primary entry point, legacy routes preserved"
  - "Safe area defaults: top:0, right:0, bottom:15, left:0 in % — bottom margin for broadcast lower-third space"
  - "Unit toggle resets values: Switching between px/% resets margins to avoid nonsensical values"

patterns-established:
  - "Operator screen pattern: screens/operator/*.tsx for operator route pages"
  - "Audience screen pattern: screens/audience/*.tsx for audience display pages"
  - "Safe area system: safeArea config in operatorStore → getContentStyle() → absolute CSS positioning"
  - "Theme pattern: ThemeProvider syncs operatorStore theme to document.documentElement class"

# Metrics
duration: 7min
completed: 2026-02-10
---

# Phase 2 Plan 2: Operator & Audience Routes Summary

**Dual-screen routing with resizable operator panel (controls + confidence monitor), 16:9 audience display with configurable safe area margins, theme toggle, and settings page**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-10T14:56:00Z
- **Completed:** 2026-02-10T15:03:37Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Dual-screen routing: `/operator` with nested routes and `/audience` with broadcast display, root `/` redirects to operator
- Resizable two-column operator panel with controls (70%) and confidence monitor (30%) areas, sizes persist in operatorStore
- 16:9 audience display with safe area margin system — content positioned within configurable margins while background fills full canvas
- Settings page with four margin inputs, px/% unit toggle, percentage sliders (0-50% range), live visual preview, and immediate save
- Theme system with ThemeProvider syncing dark/light class to `<html>` element, supporting system preference

## Task Commits

Each task was committed atomically:

1. **Task 1: Create operator and audience root wrappers with routing** - `e26ff92` (feat)
2. **Task 2: Build operator panel layout with resizable sections** - `328f5ca` (feat)
3. **Task 3: Create audience display with safe area and settings page** - `55358c9` (feat)

## Files Created/Modified
- `src/App.tsx` - Updated with /operator/*, /audience routes, lazy-loaded screens, root redirect
- `src/app/OperatorRoot.tsx` - Operator layout wrapper with ThemeProvider and error boundary
- `src/app/AudienceRoot.tsx` - Audience layout wrapper with broadcast gradient background and error boundary
- `src/components/operator/ThemeProvider.tsx` - Syncs operatorStore theme to document.documentElement classList via useLayoutEffect
- `src/components/operator/ThemeToggle.tsx` - shadcn Switch with sun/moon icons for light/dark toggle
- `src/screens/operator/OperatorPanel.tsx` - ResizablePanelGroup with horizontal controls/confidence-monitor split
- `src/screens/operator/OperatorControls.tsx` - Header with show title, settings button, scoreboard with team scores and turn indicator
- `src/screens/operator/Settings.tsx` - Safe area configuration with margin inputs, unit toggle, sliders, live preview
- `src/screens/audience/AudienceDisplay.tsx` - 16:9 broadcast display with safe area positioning, score cards, turn indicator
- `src/lib/safeArea.ts` - getContentStyle() utility converting SafeArea config to CSS absolute positioning

## Decisions Made
- **react-resizable-panels v4 API**: Uses `orientation` (not `direction`), `onLayoutChanged` with `Layout` type `{ [id: string]: number }` (not `onLayout` with `number[]`), and `id` prop on panels for tracking
- **Lazy-loaded route screens**: OperatorPanel, AudienceDisplay, and Settings loaded via `React.lazy()` for automatic code splitting per route
- **Root redirect**: `/` redirects to `/operator` since operator is the primary entry point; legacy routes preserved during migration
- **Safe area defaults**: `{ top: 0, right: 0, bottom: 15, left: 0, unit: '%' }` — bottom margin reserves space for broadcast lower-thirds
- **Unit toggle resets**: Switching between px and % resets all margin values to avoid nonsensical values (e.g., 200px becoming 200%)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None — all tasks completed and verified successfully.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Operator panel layout ready for confidence monitor integration (Plan 03)
- Audience display ready for window lifecycle management (Plan 03)
- Settings page ready — safe area changes propagate via operatorStore → BroadcastChannel → audience window
- "Open Audience Window" button in OperatorControls is placeholder (disabled) — will be activated in Plan 03
- Ready for 02-03-PLAN.md (Window lifecycle, confidence monitor, disconnect banner)

---
*Phase: 02-dual-screen-architecture*
*Completed: 2026-02-10*
