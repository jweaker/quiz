---
phase: 01-foundation-migration
plan: 01
subsystem: infra
tags: [vite, typescript, build-tooling, react, cra-migration]

# Dependency graph
requires: []
provides:
  - Vite 7 build system with React plugin
  - TypeScript strict-mode configuration
  - Vite entry point (index.html at root with module script to src/main.tsx)
  - JSX file extensions for all React component files
affects: [01-02, 01-03, 01-04, 02, 03, 04, 05, 06, 07]

# Tech tracking
tech-stack:
  added: [vite@7.3.1, "@vitejs/plugin-react", "typescript@5.9.3", "@types/react", "@types/react-dom"]
  removed: [react-scripts@5.0.1, web-vitals]
  patterns:
    - "Vite entry: index.html at project root with <script type=module src=/src/main.tsx>"
    - "JSX in .jsx files (Vite 7 requires proper extensions)"
    - "TypeScript strict mode with bundler module resolution"

key-files:
  created:
    - vite.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - src/vite-env.d.ts
    - index.html
  modified:
    - package.json
    - src/main.tsx (renamed from src/index.js)
    - "src/**/*.jsx (10 files renamed from .js)"

key-decisions:
  - "Renamed .js to .jsx instead of configuring Vite loader overrides (Vite 7 Rollup parser rejects JSX in .js)"
  - "Set lang=ar dir=rtl on root html element per project requirements"
  - "Kept allowJs:true in tsconfig for incremental migration (Plan 02 handles .jsx to .tsx)"

patterns-established:
  - "Vite convention: index.html at project root, not in public/"
  - "File extensions: .jsx for React components, .ts/.tsx for TypeScript (after migration)"
  - "Build command: tsc -b && vite build (type-check then bundle)"

# Metrics
duration: 7min
completed: 2026-02-10
---

# Phase 1 Plan 1: CRA to Vite Migration Summary

**Migrated from Create React App to Vite 7.3.1 with TypeScript strict config, renaming all JSX files for Vite 7 compatibility**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-02-10T12:02:19Z
- **Completed:** 2026-02-10T12:09:33Z
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- Removed react-scripts and CRA config, installed Vite 7 + TypeScript 5.9
- Created vite.config.ts, tsconfig.json (strict mode), and Vite entry point
- Renamed 10 .js files to .jsx for Vite 7 Rollup parser compatibility
- Dev server starts in ~100ms with HMR, production build in ~1.5s

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Vite and configure build system** - `93abaae` (chore)
2. **Task 2: Create Vite entry point and rename main file** - `49da26b` (feat)

## Files Created/Modified
- `vite.config.ts` - Vite configuration with React plugin
- `tsconfig.json` - TypeScript strict config with bundler module resolution
- `tsconfig.node.json` - TypeScript config for vite.config.ts
- `src/vite-env.d.ts` - Vite client type declarations
- `index.html` - Vite entry point at project root (lang=ar, dir=rtl)
- `package.json` - Removed CRA deps, added Vite/TS deps, updated scripts
- `src/main.tsx` - Renamed from src/index.js with HTMLElement type assertion
- `src/App.jsx` - Renamed from .js (plus 9 other component files)

## Decisions Made
- **JSX file extensions:** Vite 7's Rollup parser fails on JSX in `.js` files before esbuild/Babel transforms run. Tried `esbuild.include` and `loader` config options — none worked. Renamed all 10 `.js` files containing JSX to `.jsx`. Left `contexts/index.js` as-is (no JSX). This is the correct Vite convention anyway.
- **RTL from the start:** Set `lang="ar" dir="rtl"` on the root `<html>` element now rather than deferring, since all content is Arabic.
- **allowJs in tsconfig:** Kept `allowJs: true` to allow the `.jsx` files to compile. Plan 02 will convert these to `.tsx`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Renamed .js files to .jsx for Vite 7 compatibility**
- **Found during:** Task 2 (Create Vite entry point)
- **Issue:** Vite 7 uses Rollup's native parser which rejects JSX syntax in `.js` files. The error occurs before esbuild/Babel transforms can process the files. Multiple `esbuild.include` and `loader` configurations were attempted but none resolved the issue.
- **Fix:** Renamed all 10 `.js` files containing JSX to `.jsx` using `git mv`. Files: App, Score, IconButton, Global, QuestionPicker, Set, Rate, Home, Windows, Question. The non-JSX file `contexts/index.js` was left unchanged.
- **Files modified:** 10 files renamed (.js → .jsx)
- **Verification:** `npm run dev` starts successfully, `npm run build` produces dist/ with all assets
- **Committed in:** `49da26b` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential for Vite 7 compatibility. Aligns with Vite conventions. No scope creep — Plan 02 will convert these .jsx files to .tsx anyway.

## Issues Encountered
- **Build warnings (pre-existing, non-blocking):**
  - `src/screens/Question.jsx`: Dynamic import `"../assets/${fileLoc}"` requires file extension in static part — pre-existing code pattern, not introduced by migration
  - `src/screens/Windows.jsx`: `MdMiscSoccer` not exported from react-icons — pre-existing import error in original code

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Vite dev server and build system fully operational
- Ready for Plan 02 (JavaScript to TypeScript conversion of all .jsx → .tsx files)
- Pre-existing build warnings should be addressed during TypeScript migration (Plan 02)
- `type: "module"` in package.json enables ESM throughout

---
*Phase: 01-foundation-migration*
*Completed: 2026-02-10*
