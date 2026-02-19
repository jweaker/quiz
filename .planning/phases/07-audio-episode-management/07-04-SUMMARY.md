---
phase: 07-audio-episode-management
plan: 04
subsystem: ui
tags: [react, editor, forms, zod-validation, lazy-loading, rtl]

# Dependency graph
requires:
  - phase: 07-audio-episode-management
    provides: "Zod episode schema with validation, factory functions, and inferred types"
provides:
  - "/editor route with lazy-loaded EpisodeEditor shell"
  - "EditorHeader with new/template/clone/import/export actions"
  - "MetadataSection with team names, date, collapsible settings form"
  - "ValidationSummary with grouped errors and scroll-to-section"
  - "MetadataUpdate type interface for form data flow"
affects: [07-audio-episode-management, episode-editor-sections]

# Tech tracking
tech-stack:
  added: []
  patterns: [debounced-validation, section-placeholder-cards, metadata-update-interface]

key-files:
  created:
    - "src/screens/editor/EpisodeEditor.tsx"
    - "src/screens/editor/components/EditorHeader.tsx"
    - "src/screens/editor/components/MetadataSection.tsx"
    - "src/screens/editor/components/ValidationSummary.tsx"
  modified:
    - "src/App.tsx"

key-decisions:
  - "Debounced validation at 300ms via setTimeout ref — no external debounce library"
  - "MetadataUpdate interface exported from EpisodeEditor for typed form data flow"
  - "Section placeholders as simple cards with IDs for scroll-to targeting from ValidationSummary"
  - "Collapsible settings section with triangle toggle for duration inputs"

patterns-established:
  - "Editor form pattern: single episode state at EpisodeEditor level, section slices + updater callbacks passed down"
  - "Placeholder card pattern: section IDs match ValidationSummary scroll targets for seamless replacement"

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 7 Plan 4: Editor Route & Shell Summary

**Episode editor route with EditorHeader (new/template/clone/import/export), MetadataSection with inline validation, and ValidationSummary with scroll-to-section links**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T14:27:19Z
- **Completed:** 2026-02-19T14:31:52Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Lazy-loaded /editor route in App.tsx with EpisodeEditor shell
- EditorHeader with three starting points (blank/template/clone) plus import/export
- MetadataSection with required team names, optional title/date, collapsible duration settings
- ValidationSummary showing error count, grouped by section, with click-to-scroll navigation
- Debounced real-time validation (300ms) triggers on every episode state change
- Section placeholder cards with IDs for upcoming form components (07-05/07-06)

## Task Commits

Each task was committed atomically:

1. **Task 1: Editor route and EpisodeEditor shell** - `d534f0b` (feat)
2. **Task 2: EditorHeader, MetadataSection, ValidationSummary** - `b510aa2` (feat)

## Files Created/Modified
- `src/App.tsx` - Added lazy import and /editor route
- `src/screens/editor/EpisodeEditor.tsx` - Main editor page with state management, debounced validation, import/export handlers, section placeholders
- `src/screens/editor/components/EditorHeader.tsx` - Header with title edit, new/template/clone/import/export buttons, back link
- `src/screens/editor/components/MetadataSection.tsx` - Team names, title, date, collapsible settings form with inline validation
- `src/screens/editor/components/ValidationSummary.tsx` - Error summary grouped by section with scroll-to navigation

## Decisions Made
- **Debounced validation:** Used setTimeout ref pattern (300ms) instead of importing a debounce library — keeps bundle small and pattern simple
- **MetadataUpdate interface:** Exported from EpisodeEditor for typed data flow between parent and MetadataSection
- **Placeholder cards with section IDs:** Each placeholder div has an id (e.g., `section-speed-questions`) matching ValidationSummary's scroll targets, enabling seamless replacement by real form components
- **Collapsible settings:** Duration inputs hidden by default to reduce initial visual noise — toggle reveals all 5 timer duration inputs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Editor shell ready for section form components (07-05)
- updateParts helper defined and ready for section form integration
- Placeholder cards provide clear replacement targets with matching IDs
- ValidationSummary already wired to display section-level errors

## Self-Check: PASSED
- All 4 created files verified on disk
- Both commit hashes (d534f0b, b510aa2) verified in git log
- `npx tsc --noEmit` passes for committed code (1 pre-existing error in unstaged work from 07-02)
- `npm run build` succeeds

---
*Phase: 07-audio-episode-management*
*Completed: 2026-02-19*
