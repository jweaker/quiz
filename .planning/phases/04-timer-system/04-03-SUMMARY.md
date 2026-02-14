---
phase: 04-timer-system
plan: 03
subsystem: timer-system
tags: [poetic-chase, pass-mechanic, letter-display, keyboard-controls]
dependency_graph:
  requires:
    - 04-02 (chess clock UI and controls)
    - 03-02 (scoring keyboard controls pattern)
  provides:
    - letter display for verse requirements
    - pass mechanic with scoring and clock switching
    - complete Poetic Chase operator workflow
  affects:
    - src/state/timerStore.ts (requiredLetter, verseCount already existed)
    - src/state/showStore.ts (scoring actions)
tech_stack:
  added:
    - useLetterDisplay hook for A-Z keyboard capture
    - usePassMechanic hook for pass flow state management
  patterns:
    - keyboard shortcuts with enableOnFormTags: false
    - local transient state (pass flow) vs global store state
    - BroadcastChannel sync for letter display
key_files:
  created:
    - src/hooks/useLetterDisplay.ts
    - src/hooks/usePassMechanic.ts
    - src/components/audience/LetterDisplay.tsx
    - src/components/operator/PassControls.tsx
  modified:
    - src/screens/audience/AudienceDisplay.tsx
    - src/components/operator/TimerPanel.tsx
decisions:
  - "Local state for pass tracking: passActive and passedToTeam stored in hook state, not global store (transient flow state)"
  - "Letter keys (a-z) verified conflict-free: scoring uses numbers, timer uses t/p/[/]\\, pass uses g/v/x"
  - "Pass scoring rules: +1pt for receiving team on pass, +1pt additional bonus for correct answer after pass"
  - "Western numerals for Latin letters: A-Z represent Arabic letters in show convention"
metrics:
  duration: 2 min
  tasks_completed: 2
  files_created: 4
  files_modified: 2
  commits: 2
  completed_at: "2026-02-14"
---

# Phase 04 Plan 03: Poetic Chase Pass Mechanic & Letter Display Summary

**One-liner:** Keyboard-driven Poetic Chase workflow with instant letter display and pass mechanic scoring (+1pt receive, +1pt correct answer)

## Overview

Implemented the complete Poetic Chase operator workflow: pressing any A-Z key instantly displays that letter on the audience screen (representing the required Arabic letter for the next verse), and the pass mechanic awards points correctly (+1pt to receiving team when passed, +1pt additional bonus if they answer correctly), with clock switching on each pass and verse completion. All actions keyboard-controlled (g/v/x for pass/correct/wrong, a-z for letters, Escape to clear).

## What Was Built

### Letter Display System
- **useLetterDisplay hook**: Captures all 26 letter keys (a-z) and Escape, updates timerStore.requiredLetter
- **LetterDisplay component**: Large, prominent overlay with radial gradient backdrop and text glow for broadcast readability
- **Keyboard shortcuts**: Any letter key shows letter, Escape clears (enableOnFormTags: false to avoid firing during form input)
- **Sync mechanism**: BroadcastChannel via timerStore broadcasts letter to audience window instantly

### Pass Mechanic System
- **usePassMechanic hook**: Implements Poetic Chase pass flow rules
  - Local state: passActive, passedToTeam (transient flow state, not persisted)
  - Pass action: Awards +1pt to receiving team, switches clock to receiver
  - Correct answer: Awards +1pt bonus if answering team received pass, adds verse count, switches clock
  - Wrong answer: No bonus points, resets pass state, switches clock
- **PassControls component**: Operator UI with three action buttons (pass/correct/wrong) and verse count display
- **Keyboard shortcuts**: g (pass), v (correct verse), x (wrong verse)
- **Visual feedback**: Active pass shows amber-highlighted status indicator with receiving team name

### Integration
- **TimerPanel**: Added PassControls below chess clock display, activated useLetterDisplay hook when panel mounts
- **AudienceDisplay**: Added LetterDisplay as overlay above content area
- **Keyboard layout verified**: No conflicts (letters: a-z, pass: g/v/x, timer: t/p/[/]\\, scoring: numbers)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All verification criteria met:
- Build passes with zero type errors
- Letter key press → instant display on audience screen (via BroadcastChannel)
- Escape key clears letter display
- Pass flow: pass awards +1pt to receiving team, switches clock
- Correct answer after pass awards +1pt additional bonus (total +2 for pass recipient answering correctly)
- Verse count increments correctly per team
- All keyboard shortcuts (g/v/x) functional with form-tag awareness
- No conflicts with existing shortcuts (scoring: numbers, timer: t/p/[/]\\, pass: g/v/x, letters: a-z)
- PassControls integrated into TimerPanel chess clock section
- Letter display hook activated when TimerPanel is mounted

## Success Criteria Status

All success criteria met:
- [x] Letter key press → instant display on audience screen
- [x] Pass mechanic correctly scores: +1pt receiving team, +1pt more for correct answer
- [x] Clock switches on pass and on each verse completion
- [x] Verse counts tracked per team
- [x] Operator has keyboard-only workflow for entire Poetic Chase section
- [x] All timer features work together: chess clock + pass + letter display

## Key Decisions

1. **Local state for pass tracking**: passActive and passedToTeam are local hook state, not global store state, because they represent transient pass flow state that doesn't need persistence or cross-window sync. Global store holds persistent data (verseCount, scores).

2. **Keyboard shortcut allocation**: Verified zero conflicts:
   - Scoring: number keys (1-9)
   - Timer: t/p/[/]\\ (toggle/pause/start-right/start-left/switch)
   - Pass: g/v/x (give/verse/wrong)
   - Letters: a-z (all available)

3. **Pass scoring rules**: +1pt awarded immediately when receiving pass (recognizing the challenge of accepting a passed verse), +1pt additional bonus if they answer correctly (total +2pts for successful answer after receiving pass).

4. **Western numerals for letters**: Latin letters A-Z displayed using western-numerals class, consistent with the show's convention where Latin letters represent the Arabic letter that the verse must start with.

## Next Steps

Phase 4 (Timer System) complete. All timer features ready:
- Countdown timer for general sections
- Chess clock for Poetic Chase
- Pass mechanic with scoring and clock switching
- Letter display for verse requirements

Next phase: Phase 5 (Episode Manager) - JSON episode loader and question data management.

## Files Changed

**Created:**
- /Users/jweaker/code/quiz/src/hooks/useLetterDisplay.ts
- /Users/jweaker/code/quiz/src/hooks/usePassMechanic.ts
- /Users/jweaker/code/quiz/src/components/audience/LetterDisplay.tsx
- /Users/jweaker/code/quiz/src/components/operator/PassControls.tsx

**Modified:**
- /Users/jweaker/code/quiz/src/screens/audience/AudienceDisplay.tsx
- /Users/jweaker/code/quiz/src/components/operator/TimerPanel.tsx

## Commits

- 2a280de: feat(04-timer-system-03): add letter display for Poetic Chase
- 27a3e60: feat(04-timer-system-03): add pass mechanic for Poetic Chase

## Self-Check: PASSED

All created files verified:
- src/hooks/useLetterDisplay.ts: FOUND
- src/hooks/usePassMechanic.ts: FOUND
- src/components/audience/LetterDisplay.tsx: FOUND
- src/components/operator/PassControls.tsx: FOUND

All commits verified:
- 2a280de: FOUND
- 27a3e60: FOUND
