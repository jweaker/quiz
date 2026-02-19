---
phase: 07-audio-episode-management
plan: 01
subsystem: audio
tags: [web-audio-api, gainnode, singleton, audio-manager, volume-control]

# Dependency graph
requires:
  - phase: 05-visual-system
    provides: Timer audio foundation (useTimerAudio hook, sound files in public/sounds/)
provides:
  - AudioManager singleton with Web Audio API GainNode routing
  - useAudio React hook for component integration
  - Category-based volume mixing (timer, feedback, transition, section)
  - Mute keyboard shortcut (m key)
  - Volume state persistence in operatorStore
affects: [07-audio-episode-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [AudioManager singleton, GainNode category routing, sound ID mapping]

key-files:
  created:
    - src/lib/audioManager.ts
    - src/hooks/useAudio.ts
  modified:
    - src/hooks/useTimerAudio.ts
    - src/state/operatorStore.ts
    - src/lib/shortcutRegistry.ts

key-decisions:
  - "SOUND_FILE_NAMES mapping for backward-compatible timer file paths (beep-* files → timer-* sound IDs)"
  - "Lazy AudioContext creation on first play/preload for browser autoplay policy compliance"
  - "Promise.allSettled for resilient preloading — missing sound files don't break other audio"

patterns-established:
  - "AudioManager singleton: all audio goes through audioManager.play(soundId) — no direct AudioContext creation in components"
  - "GainNode routing chain: category GainNodes → masterGain → destination for hierarchical volume control"
  - "Sound ID convention: kebab-case IDs mapped to categories via SOUND_CATEGORIES record"

# Metrics
duration: 5min
completed: 2026-02-19
---

# Phase 7 Plan 01: Audio Manager Summary

**AudioManager singleton with Web Audio API GainNode routing chain, category-based volume mixing, and migrated timer audio**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-19T14:14:27Z
- **Completed:** 2026-02-19T14:19:53Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- AudioManager singleton centralizing all audio through single shared AudioContext with GainNode routing
- Category-based volume mixing: timer, feedback, transition, section gains routed through masterGain
- useTimerAudio migrated to delegate to singleton — backward-compatible, zero caller breakage
- Volume/mute state persisted in operatorStore (master + 4 categories)
- Mute shortcut 'm' registered in shortcutRegistry

## Task Commits

Each task was committed atomically:

1. **Task 1: AudioManager singleton with GainNode routing and useAudio hook** - `5780809` (feat)
2. **Task 2: Migrate useTimerAudio to AudioManager singleton** - `75cb15d` (refactor)

## Files Created/Modified
- `src/lib/audioManager.ts` - AudioManager class singleton with GainNode routing, preload, play, volume, mute
- `src/hooks/useAudio.ts` - React hook wrapping AudioManager for component use with reactive mute state
- `src/hooks/useTimerAudio.ts` - Refactored to thin wrapper delegating to audioManager.play()
- `src/state/operatorStore.ts` - Added masterVolume, timerVolume, feedbackVolume, transitionVolume, sectionVolume, audioMuted with persistence
- `src/lib/shortcutRegistry.ts` - Added audio-mute shortcut ('m' key, general category)

## Decisions Made
- Added `SOUND_FILE_NAMES` mapping to bridge existing `beep-*` file names to new `timer-*` sound IDs, avoiding file renames that would break other references
- Lazy AudioContext creation (on first play/preload) to comply with browser autoplay policies
- Promise.allSettled for sound preloading so missing files (future sounds not yet added) don't block existing audio

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added SOUND_FILE_NAMES mapping for backward-compatible file paths**
- **Found during:** Task 2 (useTimerAudio migration)
- **Issue:** Existing timer sound files use `beep-warning.mp3`, `beep-urgent.mp3`, `beep-final.mp3` but new sound IDs are `timer-warning`, `timer-urgent`, `timer-expire`. Without mapping, preloadAll would fetch wrong URLs.
- **Fix:** Added `SOUND_FILE_NAMES` record mapping sound IDs to actual file names, used in preloadAll fetch path
- **Files modified:** src/lib/audioManager.ts
- **Verification:** Sound IDs correctly resolve to existing file paths
- **Committed in:** 75cb15d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential for correctness — without the mapping, timer sounds would fail to load after migration.

## Issues Encountered
None — plan executed as written with one deviation for file name compatibility.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- AudioManager singleton ready for Plan 07-02 to add sound effects (correct/wrong stings, section transitions, etc.)
- Sound file slots defined in SOUND_CATEGORIES — just add .mp3 files to public/sounds/ and they'll be preloaded
- Volume mixer UI can be built against existing operatorStore volume state

---
*Phase: 07-audio-episode-management*
*Completed: 2026-02-19*
