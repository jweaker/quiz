---
phase: 02-dual-screen-architecture
plan: 01
subsystem: state
tags: [zustand, broadcastchannel, shadcn-ui, tailwind-merge, clsx, lucide-react, react-resizable-panels]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Zustand store with persist middleware, Tailwind CSS v4, TypeScript strict mode
provides:
  - BroadcastChannel middleware for cross-window Zustand state sync
  - operatorStore with theme, safe area, and panel size settings
  - shadcn/ui component library (Button, Resizable, Switch, Slider, Input, Label)
  - cn() utility for class merging
  - @ path alias configured in tsconfig and vite
affects: [02-02-PLAN, 02-03-PLAN, 03-game-state, 05-visual-system]

# Tech tracking
tech-stack:
  added: [shadcn/ui, clsx, tailwind-merge, lucide-react, react-resizable-panels, class-variance-authority, radix-ui, tw-animate-css]
  patterns: [broadcast middleware wrapping persist, operator-only vs shared state separation, partialize for selective persistence]

key-files:
  created:
    - src/state/sync/broadcastMiddleware.ts
    - src/state/operatorStore.ts
    - src/lib/utils.ts
    - src/components/ui/button.tsx
    - src/components/ui/resizable.tsx
    - src/components/ui/switch.tsx
    - src/components/ui/slider.tsx
    - src/components/ui/input.tsx
    - src/components/ui/label.tsx
    - components.json
  modified:
    - package.json
    - tsconfig.json
    - vite.config.ts
    - src/state/showStore.ts
    - src/state/index.ts
    - src/styles/main.css

key-decisions:
  - "@ path alias: Added baseUrl/paths to tsconfig and resolve.alias to vite.config for shadcn/ui compatibility"
  - "broadcast(persist(creator)) ordering: broadcast wraps persist so BroadcastChannel receives post-hydration state"
  - "partialize operatorStore persistence: audienceWindowConnected excluded from localStorage since it's runtime-only state"
  - "ESM vite config: Use fileURLToPath/import.meta.url instead of __dirname for ESM compatibility"
  - "esbuild build scripts: Added pnpm.onlyBuiltDependencies for esbuild to fix EPIPE errors"

patterns-established:
  - "Broadcast middleware pattern: broadcast(persist(storeCreator), channelName) for cross-window sync"
  - "Operator-only state: Local persist without broadcast for settings that don't need cross-window sync"
  - "shadcn/ui component path: @/components/ui/* for all UI primitives"

# Metrics
duration: 6min
completed: 2026-02-10
---

# Phase 2 Plan 1: Cross-Window State Sync & shadcn/ui Summary

**BroadcastChannel middleware for Zustand cross-window state sync, operatorStore for local operator settings, and shadcn/ui component library with 6 components**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-10T14:45:08Z
- **Completed:** 2026-02-10T14:51:16Z
- **Tasks:** 3
- **Files modified:** 17

## Accomplishments
- BroadcastChannel middleware syncs showStore state between all open browser windows with echo prevention and late-join support
- operatorStore provides local-only persisted settings (theme, safe area, panel sizes) with runtime-only audienceWindowConnected
- shadcn/ui installed with New York style, neutral base, CSS variables, and RTL support — 6 components ready (Button, Resizable, Switch, Slider, Input, Label)
- Path alias (@/) configured in both TypeScript and Vite for clean imports

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize shadcn/ui with required components** - `78a13b8` (chore)
2. **Task 2: Create BroadcastChannel middleware for Zustand** - `8c071ab` (feat)
3. **Task 3: Create operatorStore for operator-specific state** - `c206ab0` (feat)

## Files Created/Modified
- `src/state/sync/broadcastMiddleware.ts` - BroadcastChannel middleware for Zustand with STATE_UPDATE/STATE_REQUEST protocol
- `src/state/operatorStore.ts` - Operator-only store with theme, safe area, confidence monitor size
- `src/state/showStore.ts` - Wrapped with broadcast middleware for cross-window sync
- `src/state/index.ts` - Re-exports useOperatorStore and SafeArea type
- `src/lib/utils.ts` - cn() utility combining clsx and tailwind-merge
- `src/components/ui/button.tsx` - shadcn/ui Button component
- `src/components/ui/resizable.tsx` - shadcn/ui Resizable panel component
- `src/components/ui/switch.tsx` - shadcn/ui Switch toggle
- `src/components/ui/slider.tsx` - shadcn/ui Slider component
- `src/components/ui/input.tsx` - shadcn/ui Input field
- `src/components/ui/label.tsx` - shadcn/ui Label component
- `components.json` - shadcn/ui configuration (New York, neutral, RTL)
- `package.json` - Added shadcn/ui deps and esbuild build approval
- `tsconfig.json` - Added baseUrl and paths for @ alias
- `vite.config.ts` - Added @ path alias with ESM-compatible resolution
- `src/styles/main.css` - Added shadcn theme variables and CSS custom properties

## Decisions Made
- **@ path alias**: Added `baseUrl: "."` and `paths: {"@/*": ["./src/*"]}` to tsconfig.json and `resolve.alias` to vite.config.ts — required by shadcn/ui for component imports
- **broadcast(persist(creator)) ordering**: Broadcast middleware wraps persist so the BroadcastChannel receives state after localStorage hydration, preventing stale state propagation
- **partialize operatorStore**: Used Zustand's `partialize` to exclude `audienceWindowConnected` from persistence since it represents runtime connection state managed by window lifecycle (Plan 03)
- **ESM vite config**: Replaced `path.resolve(__dirname, ...)` with `fileURLToPath(new URL("./src", import.meta.url))` since project uses ESM modules where `__dirname` is unavailable
- **esbuild build scripts approval**: Added `pnpm.onlyBuiltDependencies: ["esbuild"]` to package.json to fix EPIPE errors caused by pnpm ignoring esbuild's postinstall script

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] ESM compatibility for vite.config.ts path alias**
- **Found during:** Task 1
- **Issue:** shadcn/ui docs recommend `path.resolve(__dirname, "./src")` but `__dirname` is not available in ESM modules, causing build failure
- **Fix:** Used `fileURLToPath(new URL("./src", import.meta.url))` instead
- **Files modified:** vite.config.ts
- **Verification:** `pnpm build` succeeds
- **Committed in:** 78a13b8

**2. [Rule 3 - Blocking] esbuild postinstall script blocked by pnpm**
- **Found during:** Task 1
- **Issue:** pnpm v10 ignores build scripts by default; esbuild's postinstall (which installs the platform-specific binary) was skipped, causing `EPIPE` errors on every build
- **Fix:** Added `pnpm.onlyBuiltDependencies: ["esbuild"]` to package.json and re-ran `pnpm install`
- **Files modified:** package.json
- **Verification:** `pnpm build` succeeds without EPIPE errors
- **Committed in:** 78a13b8

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both were infrastructure blockers that prevented builds. No scope creep.

## Issues Encountered
None — all tasks completed and verified successfully.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- BroadcastChannel middleware ready for use in operator/audience window communication
- operatorStore ready for theme switching, safe area configuration, and panel sizing
- shadcn/ui components available for operator panel UI construction
- Ready for 02-02-PLAN.md (Operator panel layout, audience display with safe area, settings)

---
*Phase: 02-dual-screen-architecture*
*Completed: 2026-02-10*
