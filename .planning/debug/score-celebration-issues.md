---
status: diagnosed
trigger: "Investigate 3 issues with score celebrations on the audience display: 1. The +N delta text appears in a position that collides with the team name — it should be below the score box 2. Team names are too small on the audience display 3. When adding points rapidly before animation finishes, new points don't trigger their own animation — animations should play in parallel. Also for negative scores (Test 4): there's no red flash overlay, only red delta text. The ScreenShake component at src/components/animations/ScreenShake.tsx should provide a red flash."
created: 2026-02-17T00:00:00Z
updated: 2026-02-17T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Multiple layout and animation issues in audience score display
test: examining component structure and animation logic
expecting: identify root causes for positioning, sizing, and animation queueing
next_action: read all relevant component files

## Symptoms

expected:
1. +N delta text should appear below the score box, not colliding with team name
2. Team names should be appropriately sized on audience display
3. Rapid point additions should trigger parallel animations
4. Negative scores should show red flash overlay via ScreenShake

actual:
1. +N delta text collides with team name
2. Team names are too small
3. New points don't trigger animation if previous animation hasn't finished
4. Only red delta text shows, no red flash overlay

errors: none reported

reproduction: Add points to teams on audience display, observe positioning and animation behavior

started: Current issue in production

## Eliminated

## Evidence

- timestamp: 2026-02-17T00:05:00Z
  checked: TeamScore.tsx audience variant structure (lines 31-64)
  found: Delta text positioned with `absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full` which places it ABOVE the score box, not below. Team name is at line 34-39, score box at 40-62, delta inside score box at line 51.
  implication: Issue #1 confirmed - delta text positioning is above score box where team name is, causing collision

- timestamp: 2026-02-17T00:06:00Z
  checked: TeamScore.tsx line 36 team name font size
  found: `fontSize: 'clamp(0.8rem, 2vw, 2.5rem)'` - scales from 0.8rem to 2.5rem based on viewport
  implication: Issue #2 confirmed - minimum 0.8rem is quite small, especially at smaller viewport sizes

- timestamp: 2026-02-17T00:07:00Z
  checked: useScoreDelta.ts hook logic (lines 22-36)
  found: On score change, delta is set and timeout clears it after 2 seconds. BUT if timeout exists, it's cleared (line 27-29), replacing previous delta. ScoreFlash component remounts on delta change but doesn't stack.
  implication: Issue #3 confirmed - rapid score changes replace previous delta/animation instead of running in parallel

- timestamp: 2026-02-17T00:08:00Z
  checked: ScoreFlash.tsx negative delta path (lines 82-101)
  found: Negative delta only renders red text with shake animation. No mention of red flash overlay. Component is self-contained animation, doesn't trigger parent ScreenShake.
  implication: Issue #4 partially explained - ScoreFlash handles its own negative animation but doesn't integrate with ScreenShake

- timestamp: 2026-02-17T00:09:00Z
  checked: ScreenShake.tsx component (lines 1-92)
  found: ScreenShake wraps children and triggers shake + red flash overlay on trigger increment. Requires parent to pass incrementing trigger prop.
  implication: Issue #4 root cause - ScreenShake is NOT wrapping TeamScore/ScoreOverlay, so red flash never appears for negative scores

- timestamp: 2026-02-17T00:10:00Z
  checked: ScoreOverlay.tsx structure (lines 22-53)
  found: ScoreOverlay renders two TeamScore components in a flex layout. No ScreenShake wrapper. No trigger prop management for negative scores.
  implication: Issue #4 confirmed - ScoreOverlay doesn't use ScreenShake at all

- timestamp: 2026-02-17T00:11:00Z
  checked: AudienceDisplay.tsx structure (lines 38-39)
  found: ScoreOverlay is rendered directly without ScreenShake wrapper
  implication: Issue #4 confirmed at display level - no ScreenShake integration in component hierarchy

## Resolution

root_cause:

**Issue #1: Delta text collision with team name**
- Location: `src/components/animations/ScoreFlash.tsx` lines 38-45 (reduced motion), 62-76 (positive delta), 86-99 (negative delta)
- Problem: Delta text uses `absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-full` which positions it ABOVE the score box. Team name is also above the score box (TeamScore.tsx line 34-39), causing collision.
- Technical cause: Absolute positioning with `-translate-y-full` and `-top-4` moves delta upward from score box top edge, overlapping with team name space.

**Issue #2: Team names too small**
- Location: `src/components/score/TeamScore.tsx` line 36
- Problem: `fontSize: 'clamp(0.8rem, 2vw, 2.5rem)'` - minimum of 0.8rem is too small for audience viewing
- Technical cause: Clamp minimum set too conservatively for broadcast display, prioritizing small viewports over audience legibility

**Issue #3: Rapid score changes don't trigger parallel animations**
- Location: `src/hooks/useScoreDelta.ts` lines 26-35 and `src/components/score/TeamScore.tsx` line 51
- Problem: useScoreDelta replaces previous delta instead of queueing. Line 27-29 clears existing timeout and overwrites delta state. ScoreFlash is conditionally rendered based on `delta !== null` (TeamScore.tsx:51), so only one instance can exist at a time.
- Technical cause: Single delta state value + conditional rendering = no animation stacking. Architecture assumes one animation at a time.

**Issue #4: No red flash overlay for negative scores**
- Location: `src/components/audience/ScoreOverlay.tsx` (entire component) and `src/screens/audience/AudienceDisplay.tsx` line 39
- Problem: ScreenShake component is never used in audience display hierarchy. ScoreFlash handles its own negative animation (red text shake) but doesn't trigger ScreenShake's red flash overlay.
- Technical cause: ScreenShake requires (1) wrapping the content and (2) parent managing incrementing trigger prop. Neither exists in ScoreOverlay or AudienceDisplay. ScoreFlash is isolated and doesn't communicate with ScreenShake.

fix: [to be implemented by plan-phase]
verification: [to be verified after fix]
files_changed: []
