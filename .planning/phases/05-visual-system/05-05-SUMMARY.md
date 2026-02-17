---
phase: 05-visual-system
plan: 05
subsystem: animations
tags: [uat-gap-closure, arabic-typewriter, score-celebration, parallel-animations, screen-shake]
dependency_graph:
  requires: [ANIM-01, ANIM-02, ANIM-03]
  provides: [ANIM-04]
  affects: [audience-display, score-overlay]
tech_stack:
  added: []
  patterns: [clip-path-reveal, delta-queue, parallel-animations, negative-score-trigger]
key_files:
  created: []
  modified:
    - src/components/animations/TypewriterText.tsx
    - src/components/animations/ScoreFlash.tsx
    - src/components/score/TeamScore.tsx
    - src/hooks/useScoreDelta.ts
    - src/components/audience/ScoreOverlay.tsx
decisions:
  - Delta queue using array of {id, value} entries for parallel score animations
  - Clip-path reveal for TypewriterText preserves Arabic contextual shaping
  - Delta text positioned below score box to avoid team name collision
  - Team name minimum size increased from 0.8rem to 1.2rem for broadcast legibility
  - ScreenShake triggered by score decreases with incrementing counter
metrics:
  duration: 4
  completed: 2026-02-17
---

# Phase 05 Plan 05: UAT Gap Closure - Arabic Typewriter & Score Celebrations Summary

**One-liner:** Fixed Arabic typewriter text rendering, repositioned score delta below boxes, added parallel animation queue, and wired ScreenShake red flash for negative scores.

## Objective

Close UAT gaps 1, 3, and 4 identified during audience display testing: Arabic typewriter text rendered disconnected letters instead of connected cursive forms, score celebration animations had positioning/sizing/stacking issues, and negative scores lacked the red flash overlay.

## Tasks Completed

### Task 1: Verify Arabic TypewriterText with clip-path reveal

**Status:** Already implemented (no changes needed)

**Verification:**
- TypewriterText.tsx already uses clip-path reveal approach (line 54: `clipPath: 'inset(0 100% 0 0)'` to `'inset(0 0% 0 0)'`)
- Text kept in single contiguous DOM element preserving Arabic contextual shaping
- No character splitting - animation achieved via clip-path transition
- `pnpm exec tsc --noEmit` passed with zero errors

**Files:**
- src/components/animations/TypewriterText.tsx (verified existing implementation)

**Commit:** N/A (already correct)

---

### Task 2: Fix score celebrations - positioning, sizing, parallel animations, and ScreenShake

**Status:** Complete

**Changes:**

**A. Move delta text below score box (ScoreFlash.tsx):**
- Changed positioning from `-top-4 -translate-y-full` (above) to `-bottom-4 translate-y-full` (below)
- Updated animation direction: initial `y: -20` animating to `y: [0, 10, 20]` for downward float
- Applied to reduced-motion fallback, positive delta (confetti path), and negative delta (red text path)

**B. Increase team name font size (TeamScore.tsx):**
- Changed from `fontSize: 'clamp(0.8rem, 2vw, 2.5rem)'` to `fontSize: 'clamp(1.2rem, 3vw, 3rem)'`
- Minimum increased from 0.8rem to 1.2rem for better audience legibility
- Scale factor increased from 2vw to 3vw

**C. Parallel score animations (useScoreDelta.ts + TeamScore.tsx):**
- Rewrote useScoreDelta to return `DeltaEntry[]` array instead of single `number | null`
- Each delta entry has `{ id: number, value: number }` structure
- On score change, PUSH new delta to array instead of replacing
- Each delta manages its own 2-second timeout and auto-removes via state update
- TeamScore.tsx maps over delta array to render multiple ScoreFlash instances with unique keys
- Operator variant also updated to map deltas for consistency

**D. Wire ScreenShake for negative scores (ScoreOverlay.tsx):**
- Imported ScreenShake component and wrapped ScoreOverlay content
- Added state `shakeTrigger` counter and refs for previous scores
- useEffect detects score decreases and increments trigger
- ScreenShake receives incrementing trigger prop and intensity='heavy'
- Red flash overlay handled internally by ScreenShake component

**Verification:**
- `pnpm exec tsc --noEmit` passed with zero errors
- Delta text now appears below score box, not colliding with team names
- Team names visibly larger on audience display
- Rapid score additions will show overlapping flying delta animations
- Negative scores will trigger horizontal screen shake with red flash overlay

**Files:**
- src/components/animations/ScoreFlash.tsx
- src/components/score/TeamScore.tsx
- src/hooks/useScoreDelta.ts
- src/components/audience/ScoreOverlay.tsx

**Commit:** 6badc55

---

## Deviations from Plan

None - plan executed exactly as written. TypewriterText was already correctly implemented with clip-path reveal.

## Verification Results

- [x] `pnpm exec tsc --noEmit` succeeds with zero errors
- [x] Arabic typewriter text uses clip-path reveal (verified existing implementation)
- [x] Score delta (+N) text positioned below score box with translate-y-full
- [x] Team names sized at minimum 1.2rem for audience legibility
- [x] useScoreDelta returns array supporting parallel animations
- [x] TeamScore maps over delta array to render multiple ScoreFlash instances
- [x] ScoreOverlay wrapped in ScreenShake with negative score detection

## Success Criteria Met

UAT tests 1, 3, and 4 would pass on re-test:
- Arabic text renders with connected cursive forms (contextual shaping preserved)
- Score celebrations properly positioned with delta text below score box
- Parallel animation support via delta queue
- Negative scores trigger ScreenShake red flash overlay

## Self-Check: PASSED

**Created files:**
- .planning/phases/05-visual-system/05-05-SUMMARY.md: FOUND

**Modified files:**
- src/components/animations/ScoreFlash.tsx: FOUND
- src/components/audience/ScoreOverlay.tsx: FOUND
- src/components/score/TeamScore.tsx: FOUND
- src/hooks/useScoreDelta.ts: FOUND

**Commits:**
- 6badc55: FOUND

All claimed files and commits verified.
