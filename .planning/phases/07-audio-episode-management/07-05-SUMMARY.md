---
phase: 07-audio-episode-management
plan: 05
subsystem: ui
tags: [react, editor, forms, paste-parser, bulk-paste, question-editor, rtl]

# Dependency graph
requires:
  - phase: 07-audio-episode-management
    provides: "Editor shell with placeholder section cards, updateParts helper"
provides:
  - "pasteParser with JSON/TSV/QA-pairs/lines format detection"
  - "QuestionListEditor reusable component with add/remove/bulk-paste"
  - "BulkPasteDialog with format auto-detection and preview"
  - "SpeedQuestionsForm, WindowsForm, PuzzleForm section editors"
affects: [07-audio-episode-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [reusable-question-list, bulk-paste-workflow, section-form-card-pattern]

key-files:
  created:
    - "src/lib/pasteParser.ts"
    - "src/screens/editor/components/QuestionListEditor.tsx"
    - "src/screens/editor/components/BulkPasteDialog.tsx"
    - "src/screens/editor/components/SpeedQuestionsForm.tsx"
    - "src/screens/editor/components/WindowsForm.tsx"
    - "src/screens/editor/components/PuzzleForm.tsx"
  modified:
    - "src/screens/editor/EpisodeEditor.tsx"

key-decisions:
  - "QuestionListEditor as shared component with configurable showMarks/showDuration props"
  - "WindowsForm enforces max 2 questions per category via onChange guard"
  - "BulkPasteDialog uses radix-ui Dialog primitive directly (no shadcn/ui dialog wrapper needed)"

patterns-established:
  - "Section form pattern: Card wrapper with section ID, h2 title, QuestionListEditor child"
  - "Bulk paste workflow: paste → auto-detect format → preview → add or replace"

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 7 Plan 5: Section Forms Summary

**Paste parser with 4-format detection, reusable QuestionListEditor with bulk-paste dialog, and Speed/Windows/Puzzle section forms integrated into EpisodeEditor**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-19T14:41:20Z
- **Completed:** 2026-02-19T14:45:50Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Paste parser with JSON/TSV/QA-pairs/lines auto-detection and Arabic numeral support
- Reusable QuestionListEditor with per-question editing, add/remove, and bulk paste trigger
- BulkPasteDialog with format preview, detected question count, and add/replace options
- SpeedQuestionsForm (no marks), WindowsForm (5 categories × 2-question limit), PuzzleForm (duration override)
- EpisodeEditor wired with real forms replacing speed/windows/puzzle placeholders

## Task Commits

Each task was committed atomically:

1. **Task 1: Paste parser, QuestionListEditor, BulkPasteDialog** - `7f35061` (feat)
2. **Task 2: SpeedQuestionsForm, WindowsForm, PuzzleForm, editor integration** - `b3773bc` (feat)

## Files Created/Modified
- `src/lib/pasteParser.ts` - Format detection (JSON/TSV/QA/lines) and parsing with Arabic support
- `src/screens/editor/components/QuestionListEditor.tsx` - Reusable question list with add/remove/bulk-paste controls
- `src/screens/editor/components/BulkPasteDialog.tsx` - Dialog with textarea, auto-detection preview, add/replace buttons
- `src/screens/editor/components/SpeedQuestionsForm.tsx` - Speed question section (no marks)
- `src/screens/editor/components/WindowsForm.tsx` - 5-category Windows of Knowledge editor with 2-question limit
- `src/screens/editor/components/PuzzleForm.tsx` - Puzzle section with duration override
- `src/screens/editor/EpisodeEditor.tsx` - Replaced 3 placeholders with real forms, kept debate/rapid/audience for 07-06

## Decisions Made
- **QuestionListEditor as shared component:** configurable via showMarks/showDuration boolean props, used by all three section forms
- **WindowsForm max enforcement:** onChange guard prevents adding beyond 2 questions per category (rather than hiding button only)
- **Radix Dialog primitive directly:** Used `Dialog` from `radix-ui` directly for BulkPasteDialog — no need for shadcn/ui dialog wrapper component

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Three section forms complete, editor shows real editing for speed/windows/puzzle
- Remaining 3 placeholders (debate, rapid, audience) ready for 07-06
- QuestionListEditor pattern established for reuse in remaining section forms

---
*Phase: 07-audio-episode-management*
*Completed: 2026-02-19*
