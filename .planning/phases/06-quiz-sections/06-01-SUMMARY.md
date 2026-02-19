---
phase: 06-quiz-sections
plan: 01
subsystem: ui
tags: [zustand, section-state, broadcast-channel, react-hotkeys-hook, motion, audience-display, operator-panel]

# Dependency graph
requires:
  - phase: 05-visual-system
    provides: "MinefieldLayout, WipeTransition, RundownRail, adaptive zone architecture, shortcut registry"
provides:
  - "sectionState slice in showStore (questionIndex, answerRevealed, isMinefieldQuestion, debateVotes, etc.)"
  - "Section routing in AudienceDisplay (dispatches to per-section display components)"
  - "Section adaptive mode in OperatorControls with auto-activation"
  - "SpeedQuestionPanel/Display — fully functional speed question section"
  - "AudienceQuestionsPanel/Display — fully functional audience questions section"
  - "Section keyboard shortcuts registered in shortcutRegistry"
affects: [06-02-PLAN, 06-03-PLAN, 06-04-PLAN, 06-05-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sectionState slice pattern: per-section transient state reset on section change"
    - "Section component pair pattern: operator Panel + audience Display per section type"
    - "Section hotkeys pattern: useHotkeys with enabled=isActive guard per section"

key-files:
  created:
    - src/components/operator/sections/SpeedQuestionPanel.tsx
    - src/components/operator/sections/AudienceQuestionsPanel.tsx
    - src/components/audience/sections/SpeedQuestionDisplay.tsx
    - src/components/audience/sections/AudienceQuestionsDisplay.tsx
  modified:
    - src/state/showStore.ts
    - src/lib/shortcutRegistry.ts
    - src/screens/audience/AudienceDisplay.tsx
    - src/screens/operator/OperatorControls.tsx

key-decisions:
  - "sectionState reset on every section jump (jumpToSection, nextSection, prevSection) — prevents stale question state bleed between sections"
  - "MinefieldLayout activation switched from section type check to sectionState.isMinefieldQuestion — enables granular per-question minefield activation within windows section"
  - "Section adaptive mode auto-activates via useEffect but backtick cycling skips it — section mode is context-driven, not manually cycled"

patterns-established:
  - "Section pair pattern: each section type has SpeedQuestionPanel (operator) + SpeedQuestionDisplay (audience)"
  - "Section hotkey guard: useHotkeys enabled={isActive} prevents cross-section key conflicts"
  - "defaultSectionState constant: extracted for DRY reset across multiple navigation actions"

# Metrics
duration: 7min
completed: 2026-02-19
---

# Phase 6 Plan 1: Section Infrastructure + Speed Question + Audience Questions Summary

**sectionState store slice with broadcast sync, section routing in both displays, and fully functional Speed Question and Audience Questions sections**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-19T06:29:06Z
- **Completed:** 2026-02-19T06:36:40Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- sectionState slice added to showStore with all fields needed by every Phase 6 section type
- Section routing wired in AudienceDisplay — routes to per-section display components based on currentSection
- OperatorControls adaptive zone gains 'section' mode with auto-activation and per-section panel dispatch
- Speed Question section fully operational: question display, Z/C turn assignment, N/B navigation, progress counter
- Audience Questions section fully operational: show/reveal flow with animated answer entrance, no timer
- MinefieldLayout now activates on sectionState.isMinefieldQuestion (CRITICAL fix from windows section type check)

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend showStore + wire section routing** - `1757943` (feat)
2. **Task 2: Implement Speed Question + Audience Questions sections** - `7048f9c` (feat)

## Files Created/Modified
- `src/state/showStore.ts` - sectionState slice with setSectionState/resetSectionState, jumpToSection now resets sectionState
- `src/lib/shortcutRegistry.ts` - 'section' category with all section shortcuts (enter, n, b, z, c, s, e)
- `src/screens/audience/AudienceDisplay.tsx` - Section router dispatching to per-section display components
- `src/screens/operator/OperatorControls.tsx` - Section adaptive mode with auto-activation and per-section panels
- `src/components/operator/sections/SpeedQuestionPanel.tsx` - Operator panel for speed question with hotkeys and controls
- `src/components/operator/sections/AudienceQuestionsPanel.tsx` - Operator panel for audience questions with answer preview
- `src/components/audience/sections/SpeedQuestionDisplay.tsx` - Audience display for speed question with animated transitions
- `src/components/audience/sections/AudienceQuestionsDisplay.tsx` - Audience display for audience questions with animated answer reveal

## Decisions Made
- sectionState reset on every section navigation action to prevent question index bleed between sections
- MinefieldLayout activation switched to sectionState.isMinefieldQuestion for granular per-question control (vs entire section type)
- Section adaptive mode auto-activates via useEffect but is excluded from backtick tab cycling (context-driven, not manually cycled)
- defaultSectionState extracted as constant for DRY usage across jumpToSection, nextSection, prevSection, and resetSectionState

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Section infrastructure complete — ready for Plans 06-02 through 06-05 to add remaining section types
- Each future plan adds import to AudienceDisplay/OperatorControls and creates its Panel/Display component pair
- sectionState fields (debateVotes, debateRevealedCount, askedQuestions, rapidActiveTeam) ready for complex section types

---
*Phase: 06-quiz-sections*
*Completed: 2026-02-19*

## Self-Check: PASSED
