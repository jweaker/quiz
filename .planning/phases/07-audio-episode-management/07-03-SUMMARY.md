---
phase: 07-audio-episode-management
plan: 03
subsystem: database
tags: [zod, validation, typescript, schema, episode-data]

# Dependency graph
requires:
  - phase: 06-quiz-sections
    provides: "Episode data structure used across all quiz sections"
provides:
  - "Zod episode schema with runtime validation and TypeScript type inference"
  - "Episode type as single source of truth (replaces manual interfaces)"
  - "validateEpisode() utility with field-level error reporting"
  - "createBlankEpisode() and createTemplateEpisode() factory functions"
  - "WindowsCategoryKey utility type for typed dynamic access"
affects: [07-audio-episode-management, episode-editor, data-import]

# Tech tracking
tech-stack:
  added: [zod@4.3.6]
  patterns: [zod-schema-as-type-source, z.infer-over-manual-interfaces, factory-functions]

key-files:
  created:
    - "src/lib/episodeSchema.ts"
  modified:
    - "src/state/showStore.ts"
    - "src/state/index.ts"
    - "src/App.tsx"
    - "src/components/audience/sections/WindowsDisplay.tsx"
    - "src/screens/Question.tsx"
    - "src/screens/QuestionPicker.tsx"
    - "package.json"

key-decisions:
  - "Zod v4 installed (latest) instead of v3 — API compatible, same safeParse/flatten/z.infer patterns"
  - "Added done? field to QuestionSchema for runtime completion tracking used by legacy screens"
  - "EpisodeData type alias with @deprecated tag for backward compatibility"
  - "WindowsCategoryKey utility type exported for typed dynamic category access"

patterns-established:
  - "Zod schema as single source of truth: define schema, infer type with z.infer, never hand-write matching interface"
  - "Factory functions for blank/template creation: createBlankEpisode() for empty forms, createTemplateEpisode() for pre-filled structure"

# Metrics
duration: 7min
completed: 2026-02-19
---

# Phase 7 Plan 3: Episode Schema & Validation Summary

**Zod episode schema with full validation, inferred TypeScript types replacing manual interfaces, and blank/template factory functions**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T14:14:21Z
- **Completed:** 2026-02-19T14:21:58Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created comprehensive Zod schema for full episode data structure (Question, Windows, Parts, Settings, Episode)
- Replaced all manual TypeScript interfaces in showStore with Zod-inferred types — single source of truth
- Added validateEpisode() utility returning field-level errors for inline display
- Added createBlankEpisode() and createTemplateEpisode() factory functions
- Existing data.json validates against schema without modifications
- Fixed all dynamic key access patterns across legacy screens (Question, QuestionPicker, WindowsDisplay)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Zod and create episode schema** - `6bf5851` (feat)
2. **Task 2: Migrate showStore types to Zod-inferred types** - `b5a24cc` (feat)

## Files Created/Modified
- `src/lib/episodeSchema.ts` - Zod schemas (Question, Windows, Parts, Settings, Episode), validation utility, factory functions
- `src/state/showStore.ts` - Removed 5 manual interfaces, imports Episode from episodeSchema
- `src/state/index.ts` - Barrel export unchanged (EpisodeData alias maintains compat)
- `src/App.tsx` - Updated import from EpisodeData to Episode
- `src/components/audience/sections/WindowsDisplay.tsx` - Added WindowsCategoryKey cast for dynamic access
- `src/screens/Question.tsx` - Fixed dynamic parts[type] access with Record cast
- `src/screens/QuestionPicker.tsx` - Fixed dynamic key access with keyof casts
- `package.json` - Added zod@^4.3.6 dependency

## Decisions Made
- **Zod v4 over v3:** pnpm installed v4 as latest; API fully compatible (safeParse, flatten, z.infer all work identically)
- **done? field added to QuestionSchema:** Legacy screens (Windows, Question, QuestionPicker) track completion via done property on questions — required for backward compatibility
- **EpisodeData type alias:** Kept as `export type EpisodeData = Episode` with @deprecated tag so existing imports from `@/state` continue working
- **WindowsCategoryKey utility type:** Exported from episodeSchema for typed dynamic category access, replacing the old `[key: string]: QuestionItem[]` index signature

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added done? field to QuestionSchema**
- **Found during:** Task 2 (type migration)
- **Issue:** Old QuestionItem interface had `done?: boolean` used by legacy screens (Windows.tsx, Question.tsx, QuestionPicker.tsx) for completion tracking. Zod schema omitted it, causing 16 type errors.
- **Fix:** Added `done: z.boolean().optional()` to QuestionSchema
- **Files modified:** src/lib/episodeSchema.ts
- **Verification:** tsc --noEmit passes, existing data.json still validates
- **Committed in:** b5a24cc (Task 2 commit)

**2. [Rule 1 - Bug] Fixed dynamic key access patterns after index signature removal**
- **Found during:** Task 2 (type migration)
- **Issue:** Old interfaces had `[key: string]: unknown` / `[key: string]: QuestionItem[]` index signatures enabling `parts[type]` and `windows[id]` dynamic access. Zod-inferred types lack these, causing 8 type errors across 4 files.
- **Fix:** Added explicit casts: `Record<string, any>` for legacy Question.tsx, `keyof typeof` for QuestionPicker.tsx, `WindowsCategoryKey` for WindowsDisplay.tsx
- **Files modified:** src/screens/Question.tsx, src/screens/QuestionPicker.tsx, src/components/audience/sections/WindowsDisplay.tsx
- **Verification:** tsc --noEmit passes, npm run build succeeds
- **Committed in:** b5a24cc (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for correctness — the type migration inherently required handling index signature differences and the done property. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Episode schema ready for episode editor (07-04)
- Factory functions available for new episode creation flow
- Validation utility ready for import/editor data checking

---
*Phase: 07-audio-episode-management*
*Completed: 2026-02-19*
