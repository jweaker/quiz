---
phase: 07-audio-episode-management
plan: 02
subsystem: audio
tags: [web-audio-api, sound-effects, audio-mixer, volume-control, wav-generation]

# Dependency graph
requires:
  - phase: 07-audio-episode-management
    provides: AudioManager singleton with GainNode routing and category-based volume mixing
provides:
  - 14 distinct synthesized sound files for game events
  - useAudioIntegration hook wiring scoring/section/minefield events to sounds
  - AudioMixer UI with master + 4 category volume sliders and 18 sound preview buttons
  - M key mute toggle with visual indicator in operator header
affects: [07-audio-episode-management]

# Tech tracking
tech-stack:
  added: []
  patterns: [WAV PCM generation script, Zustand subscribe for side-effect audio, category-based mixer UI]

key-files:
  created:
    - scripts/generate-sounds.js
    - src/hooks/useAudioIntegration.ts
    - src/components/operator/AudioMixer.tsx
  modified:
    - src/lib/audioManager.ts
    - src/screens/operator/OperatorControls.tsx

key-decisions:
  - "WAV PCM generation with raw byte writing — no external audio dependencies needed"
  - "useShowStore.subscribe (Zustand subscribe) for side-effect audio — no re-renders, pure event detection"
  - "Audio tab in backtick cycle: scoring → countdown → chess-clock → audio → scoring"

patterns-established:
  - "Sound generation script: scripts/generate-sounds.js for reproducible audio asset creation"
  - "Side-effect hook pattern: useAudioIntegration subscribes to store changes without returning state"
  - "Mixer category layout: CategoryDef array drives both volume sliders and sound preview buttons"

# Metrics
duration: 9min
completed: 2026-02-19
---

# Phase 7 Plan 02: Sound Effects & Audio Mixer Summary

**14 synthesized sound effects wired to game events via useAudioIntegration hook, with full AudioMixer UI in operator adaptive zone**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-19T14:27:04Z
- **Completed:** 2026-02-19T14:36:18Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Generated 14 distinct synthesized sound files via Node.js WAV generation script (each with unique pitch/waveform/duration)
- Created useAudioIntegration hook that subscribes to showStore for scoring, section navigation, minefield, and debate events
- Built AudioMixer panel with master + 4 category volume sliders and 18 individual sound preview buttons
- Wired M key mute toggle with Volume2/VolumeX indicator in operator header
- Integrated mixer as new 'audio' tab in operator adaptive zone backtick cycle

## Task Commits

Each task was committed atomically:

1. **Task 1: Sound files, audio integration hook, and mute shortcut wiring** - `d534f0b` (feat)
2. **Task 2: Audio Mixer panel with volume controls and sound preview** - `2c89002` (feat)

## Files Created/Modified
- `scripts/generate-sounds.js` - Node.js script generating 14 WAV files with distinct synthesized audio
- `src/hooks/useAudioIntegration.ts` - Side-effect hook wiring game events to audioManager.play calls
- `src/components/operator/AudioMixer.tsx` - Full mixer panel with master/category sliders and preview buttons
- `src/lib/audioManager.ts` - Updated SOUND_EXTENSIONS for .wav generated sound files
- `src/screens/operator/OperatorControls.tsx` - Added audio integration, mute shortcut, mute indicator, audio tab
- `public/sounds/*.wav` - 14 synthesized sound files (correct, wrong, milestone, section enter/exit, show intro/outro, minefield, debate, puzzle, thinking, pass)

## Decisions Made
- Used raw WAV PCM byte generation in Node.js — no external audio library dependencies, reproducible via `node scripts/generate-sounds.js`
- useShowStore.subscribe (Zustand's non-React subscription) for audio side-effects — avoids re-renders, cleanly detects state deltas
- Audio tab included in backtick tab cycling (scoring → countdown → chess-clock → audio) — no dedicated hotkey to avoid conflicts with section-specific keys

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 14 sound effects ready for playback and mixer control
- AudioMixer accessible in operator panel for live volume adjustment
- TODO: Replace synthesized WAV files with real royalty-free dramatic TV stings before broadcast use
- Episode schema (07-03) and editor UI (07-04, 07-05, 07-06) can proceed independently

---
*Phase: 07-audio-episode-management*
*Completed: 2026-02-19*
