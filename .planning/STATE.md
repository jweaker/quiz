# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-08)

**Core value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.
**Current focus:** Phase 6 (Quiz Sections) — Complete (incl. gap closure). Phase 7 (Audio & Episode Management) next.

## Current Position

Phase: 6 of 7 (Quiz Sections) — COMPLETE
Plan: 6 of 6 complete (incl. gap closure plan 06-06)
Status: Phase 6 complete — All 8 quiz sections implemented + grid overlay gap closed
Last activity: 2026-02-19 — Completed 06-06 (Ask Intelligently Grid Overlay)

Progress: [██████████████████████████] 26/30 (87%)

## Performance Metrics

**Velocity:**
- Total plans completed: 26
- Average duration: 3.9 min
- Total execution time: 2.3 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation & Migration | 4/4 ✅ | 36 min | 9 min |
| 2 - Dual-Screen Architecture | 3/3 ✅ | 13 min | 4 min |
| 3 - Game State & Scoring | 2/2 ✅ | 6 min | 3 min |
| 4 - Timer System | 4/4 ✅ | 9 min | 2.25 min |
| 5 - Visual System | 7/7 ✅ | 27 min | 3.9 min |
| 6 - Quiz Sections | 6/6 ✅ | 26 min | 4.3 min |

**Recent Trend:**
- Last 5 plans: 06-06 (3 min), 06-01 (7 min), 06-02 (4 min), 06-05 (2 min), 06-04 (5 min)
- Trend: Consistent 2-7 min range

*Updated after each plan completion*
| Phase 04 P03 | 2 | 2 tasks | 6 files |
| Phase 04-timer-system P04 | 2 | 2 tasks | 3 files |
| Phase 05-visual-system P01 | 4 | 2 tasks | 8 files |
| Phase 05-visual-system P04 | 9 | 2 tasks | 7 files |
| Phase 05-visual-system P06 | 2 | 2 tasks | 2 files |
| Phase 05-visual-system P07 | 4 | 1 task | 2 files |
| Phase 05-visual-system P05 | 4 | 2 tasks | 4 files |
| Phase 06-quiz-sections P01 | 7 | 2 tasks | 8 files |
| Phase 06-quiz-sections P05 | 2 | 2 tasks | 4 files |
| Phase 06-quiz-sections P04 | 5 | 2 tasks | 4 files |
| Phase 06-quiz-sections P03 | 5 | 2 tasks | 6 files |
| Phase 06-quiz-sections P02 | 4 | 2 tasks | 5 files |
| Phase 06-quiz-sections P06 | 3 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Dual-screen architecture: Operator controls on laptop, audience view on external display (Pending)
- Individual Zustand selectors: useShowStore((s) => s.field) per field for optimal re-render performance (01-03)
- Physical positioning for Score panels: right/left not start/end for spatial consistency regardless of RTL (01-04)
- @ path alias: baseUrl/paths in tsconfig + resolve.alias in vite.config for shadcn/ui imports (02-01)
- broadcast(persist(creator)) ordering: broadcast wraps persist so BroadcastChannel gets post-hydration state (02-01)
- partialize operatorStore: audienceWindowConnected excluded from persistence — runtime-only state (02-01)
- ESM vite config: fileURLToPath/import.meta.url instead of __dirname for ESM compatibility (02-01)
- esbuild build scripts: pnpm.onlyBuiltDependencies for esbuild to fix EPIPE errors (02-01)
- ResizablePanelGroup v4 API: Uses orientation (not direction), onLayoutChanged with Layout map (not onLayout with number[]), panel id for tracking (02-02)
- Lazy-loaded route screens: React.lazy() for OperatorPanel, AudienceDisplay, Settings (02-02)
- Safe area defaults: bottom 15% margin for broadcast lower-third space (02-02)
- Unit toggle resets margins: Switching px/% resets values to avoid nonsensical conversions (02-02)
- Temporal middleware ordering: broadcast(persist(temporal(creator))) ensures temporal captures state before persist/broadcast (03-01)
- Temporal partialization: only track score-related fields to avoid undo affecting non-scoring state (03-01)
- Pop & scale animation: chosen over rolling counter/flip for simplicity, reliability, and broadcast sync (03-01)
- Single gold accent color: for active team glow, not team-specific colors (03-01)
- First-render skip: useScoreDelta prevents spurious delta indicators on page load (03-01)
- Form-tag awareness: enableOnFormTags: false prevents shortcuts from firing while typing in custom score input (03-02)
- Active team pattern: All scoring presets apply to whichever team has rightsTurn flag (03-02)
- Reverse-chronological history: Most recent actions at top for natural "what just happened?" workflow (03-02)
- Per-entry revert: Each history entry has revert button for direct state restoration (03-02)
- Separate timer BroadcastChannel: quiz-timer-state channel and timer-storage localStorage key for independent sync (04-01)
- Timer state temporal exclusion: Timer state excluded from temporal middleware to prevent undo rewinding clocks (04-01)
- worker-timers for countdown: Background-tab resilience with performance.now() drift correction for broadcast accuracy (04-01)
- Audio placeholder strategy: Copied existing assets to public/sounds/ for unblocked development with swap capability (04-01)
- Chess clock mutual exclusion: Single activeTimer field ensures only one team's clock ticks at a time, atomic switching (04-02)
- Points conversion formula: Math.floor(timeMs / 5000) for conservative rounding in Poetic Chase (5s = 1pt) (04-02)
- Dual-mode timer UI: TimerPanel toggles between countdown and chess clock modes with dedicated keyboard shortcuts (04-02)
- Western numerals for timers: All timer digits use western-numerals class for broadcast clarity (04-02)
- Local state for pass tracking: passActive and passedToTeam stored in hook state, not global store (transient flow state) (04-03)
- Pass scoring rules: +1pt for receiving team on pass, +1pt additional bonus for correct answer after pass (04-03)
- Letter keys conflict-free: a-z verified no conflicts with scoring (numbers), timer (t/p/[/]\), pass (g/v/x) (04-03)
- [Phase 04-timer-system]: KeyboardEvent.code names for react-hotkeys-hook v5 bracket/backslash support (04-04)
- [Phase 04-timer-system]: Elapsed time offset for pause/resume: startTimeRef accounts for (duration - remaining) (04-04)
- [Phase 05-visual-system]: Motion ^12.34.0 installed as latest stable; MotionConfig wraps app with reducedMotion='user' (05-01)
- [Phase 05-visual-system]: TypewriterText at 50ms stagger for show title (slower than 30ms default for dramatic Arabic reveal) (05-01)
- [Phase 05-visual-system]: Hardcoded 'idle' section type until Plan 05-04 adds section state to showStore (05-01)
- [Phase 05-visual-system]: Section IDs use kebab-case matching SectionType union; background keys aligned accordingly (05-04)
- [Phase 05-visual-system]: RundownRail placed between persistent and adaptive zones as natural divider (05-04)
- [Phase 05-visual-system]: MinefieldLayout activates for entire windows section type; Phase 6 adds granular detection (05-04)
- [Phase 05-visual-system]: Backtick key for tab cycling instead of Tab or backslash to avoid conflicts (05-06)
- [Phase 05-visual-system]: RTL navigation swap: Cmd+Right=backward, Cmd+Left=forward for spatial consistency (05-06)
- [Phase 05-visual-system]: Web Audio API for timer sounds: AudioContext singleton, AudioBuffer preloading, BufferSourceNode per play for overlap-free rapid playback (05-07)
- [Phase 06-quiz-sections]: sectionState reset on every section jump prevents question state bleed between sections (06-01)
- [Phase 06-quiz-sections]: MinefieldLayout activation switched to sectionState.isMinefieldQuestion for granular per-question control (06-01)
- [Phase 06-quiz-sections]: Section adaptive mode auto-activates via useEffect, excluded from backtick tab cycling (06-01)
- [Phase 06-quiz-sections]: windowsActiveCategory added to sectionState for clean operator-audience sync — null = picker, string = active category (06-02)
- [Phase 06-quiz-sections]: Minefield treated as special category entry in Windows picker, not separate section — uses isMinefieldQuestion flag (06-02)
- [Phase 06-quiz-sections]: Local state (selectedCategory) in operator for UI, global state (windowsActiveCategory) for audience sync (06-02)
- [Phase 06-quiz-sections]: Ask Intelligently uses local started state for operator-only pre-start/active phase tracking (06-05)
- [Phase 06-quiz-sections]: Composite animals.png as single image placeholder until individual images collected (06-05)
- [Phase 06-quiz-sections]: Enter key gated with enableOnFormTags: false and debateVotes !== null for form-coexisting hotkeys (06-04)
- [Phase 06-quiz-sections]: Sequential reveal pattern: revealedCount threshold controls progressive slot visibility with AnimatePresence (06-04)
- [Phase 06-quiz-sections]: revealedCount === 4 signals scores-applied state beyond 3 vote slots (06-04)
- [Phase 06-quiz-sections]: sectionState.questionIndex as single source of truth for puzzle/question navigation — no local state duplication (06-03)
- [Phase 06-quiz-sections]: Dual-solve uses existing scoring hotkeys (0/5) for split scoring rather than new mechanic (06-03)
- [Phase 06-quiz-sections]: No team indicator on audience display for Rapid Questions — headphones isolation per SECT-10 (06-03)
- [Phase 06-quiz-sections]: Team switching with timer isolation: pause → reset to 60s → switch → wait for manual start (06-03)
- [Phase 06-quiz-sections]: CSS grid overlay on bg-cover container for per-animal interaction — 72 divs over animals.png (06-06)
- [Phase 06-quiz-sections]: revealedAnimals as number[] for simple cell-index tracking, AnimatePresence per-cell for independent reveal animations (06-06)

### Pending Todos

None.

### Blockers/Concerns

**Phase 1 (Foundation & Migration):** ✅ COMPLETE

**Phase 2 (Dual-Screen):** ✅ COMPLETE

**Phase 3 (Game State & Scoring):** ✅ COMPLETE
- Plan 03-01 complete — temporal middleware and score display foundation ready
- Plan 03-02 complete — keyboard controls for scoring and undo/redo
- All scoring workflow operable via keyboard only (zero mouse dependency)

**Phase 4 (Timer System):** ✅ COMPLETE
- Plan 04-01 complete — Timer infrastructure with drift-corrected countdown and audio cues
- Plan 04-02 complete — Chess clock UI with operator controls and audience display
- Plan 04-03 complete — Poetic Chase pass mechanic and letter display integration
- Plan 04-04 complete — UAT gap closure (pause/resume fix, audio wiring, keyboard shortcuts, custom input, verse counter)
- All 5 UAT gaps closed, timer system production-ready

**Phase 5 (Visual System):** ✅ COMPLETE
- Plan 05-01 complete — Motion foundation with animation presets, TypewriterText, WipeTransition
- Plan 05-02 complete — Score celebrations and Minefield visual effects
- Plan 05-03 complete — Operator panel redesign with persistent+adaptive zones, shortcut registry
- Plan 05-04 complete — Rundown rail, section state, audience display section wiring
- Plan 05-06 complete — Operator panel UAT gaps closed (editable scores, tab cycling, RTL navigation, shortcut overlay)
- Plan 05-07 complete — Timer audio Web Audio API (smooth tick playback, UAT gap 8 closed)
- CRITICAL USER FEEDBACK addressed: operator panel redesigned from broken vertical scroll to compact mission-control density
- All 9 UAT gaps closed, visual system production-ready

**Phase 6 (Quiz Sections):** ✅ COMPLETE
- Plan 06-01 complete — section infrastructure, Speed Question, Audience Questions
- Plan 06-02 complete — Windows of Knowledge with category picker and Minefield
- Plan 06-03 complete — Puzzle with configurable timer and dual-solve, Rapid Questions with team switching
- Plan 06-04 complete — Debate section with vote entry form and dramatic sequential reveal
- Plan 06-05 complete — Ask Intelligently with composite animal grid and point deduction
- Plan 06-06 complete — Ask Intelligently grid overlay with per-animal reveal and animated audience highlights
- All 8 quiz sections implemented: Speed Question, Audience Questions, Windows of Knowledge, Minefield, Puzzle, Debate, Ask Intelligently, Rapid Questions
- SECT-09 gap closed: 72-cell interactive grid with per-animal reveal state and BroadcastChannel sync

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 06-06-PLAN.md (Ask Intelligently Grid Overlay gap closure)
Resume file: None
Next step: Execute Phase 7 Plan 01 (Audio Manager)
