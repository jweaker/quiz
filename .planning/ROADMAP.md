# Roadmap: بشائر المعرفة (Basha'ir Al-Ma'rifa)

## Overview

Transform an existing React/JavaScript quiz show application into a broadcast-ready, dual-screen TypeScript system. Seven phases deliver foundation (Vite + TypeScript + error boundaries), dual-screen architecture (operator panel + audience display), game state synchronization, accurate Web Worker-based timers, broadcast-quality animations, all 8 quiz sections, and production workflow tools (audio + episode editor). The journey prioritizes infrastructure and risky technical challenges (multi-window sync, timer accuracy) before features, ensuring a stable foundation for live TV operation.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Migration** - Modernize build system, establish type safety, prevent critical pitfalls
- [ ] **Phase 2: Dual-Screen Architecture** - Operator panel + audience display with state synchronization
- [ ] **Phase 3: Game State & Scoring** - Score tracking, turn management, team controls
- [ ] **Phase 4: Timer System** - Accurate timers with Web Workers, chess clock, countdown
- [ ] **Phase 5: Visual System** - Broadcast-quality animations, operator UI, rundown view
- [ ] **Phase 6: Quiz Sections** - Implement all 8 section types with specialized features
- [ ] **Phase 7: Audio & Episode Management** - Audio feedback system and episode editor

## Phase Details

### Phase 1: Foundation & Migration
**Goal**: Establish modern tooling and prevent critical infrastructure pitfalls before building features
**Depends on**: Nothing (first phase)
**Requirements**: ARCH-01, ARCH-05, ARCH-08
**Success Criteria** (what must be TRUE):
  1. App runs on Vite 7+ with instant HMR and TypeScript compilation
  2. Error boundaries catch component crashes without blank screen (deliberate error test passes)
  3. Zustand stores work without Provider wrapper and persist across page refreshes
  4. All CSS uses logical properties (margin-inline-start, padding-block-end) for RTL support
  5. Dir attribute set to "rtl" on root element with Cairo font loaded
**Plans**: 4 plans

Plans:
- [ ] 01-01: Vite migration and build system setup
- [ ] 01-02: TypeScript migration with noImplicitAny
- [ ] 01-03: Error boundaries and Zustand state architecture
- [ ] 01-04: RTL CSS foundation with logical properties

### Phase 2: Dual-Screen Architecture
**Goal**: Operator controls on laptop screen, audience display on external screen with synchronized state
**Depends on**: Phase 1
**Requirements**: ARCH-02, ARCH-03, ARCH-04, ARCH-07
**Success Criteria** (what must be TRUE):
  1. Operator can open audience display window on external monitor via button/shortcut
  2. State changes on operator panel appear on audience display within 100ms
  3. Audience display shows safe area boundaries and keeps all content within configurable margins
  4. Operator sees confidence monitor preview of what will appear on audience screen before triggering
  5. App detects when audience window closes and shows reconnection UI
**Plans**: 3 plans

Plans:
- [ ] 02-01: Window manager and Broadcast Channel sync
- [ ] 02-02: Operator panel scaffold and audience display with safe area
- [ ] 02-03: Confidence monitor and window lifecycle management

### Phase 3: Game State & Scoring
**Goal**: Real-time score tracking with animations visible on both screens
**Depends on**: Phase 2
**Requirements**: SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05, SCOR-06
**Success Criteria** (what must be TRUE):
  1. Scores update on both screens simultaneously with animated number transitions
  2. Active team highlighted with visual indicator (glow/color) that swaps when turn changes
  3. Operator can swap team sides (left becomes right) with single keyboard shortcut
  4. Operator can undo last score change and see previous value restored
  5. Operator can reset timer or manually adjust scores via keyboard controls
**Plans**: 2 plans

Plans:
- [ ] 03-01: Score state management and display with animations
- [ ] 03-02: Turn management, team swap, undo, and manual controls

### Phase 4: Timer System
**Goal**: Accurate countdown and chess clock timers that work even when browser tab backgrounded
**Depends on**: Phase 3
**Requirements**: ARCH-06, SECT-06, SECT-07, SECT-08
**Success Criteria** (what must be TRUE):
  1. Countdown timer remains accurate after 5+ minutes in background tab (performance.now validation)
  2. Chess clock shows dual timers with one running while other paused, switching on turn change
  3. Remaining seconds convert to points visually (5s = 1 point preview shown during countdown)
  4. Pass mechanic works: passed verse goes to opponent with +1pt, correct answer adds +1 more
  5. Pressing any letter key instantly displays that letter on audience screen for verse requirements
  6. Audio cues play at 10s, 5s, and 0s thresholds during countdowns
**Plans**: 3 plans

Plans:
- [ ] 04-01: Web Worker timer infrastructure with performance.now
- [ ] 04-02: Chess clock implementation with time-to-points conversion
- [ ] 04-03: Pass mechanic and letter display system

### Phase 5: Visual System
**Goal**: Broadcast-quality animations and operator interface with full episode visualization
**Depends on**: Phase 4
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04, ANIM-05, ANIM-06, ANIM-07, ANIM-08, ANIM-09, ANIM-10, ANIM-11, CTRL-02, CTRL-03
**Success Criteria** (what must be TRUE):
  1. Questions appear with entrance animations (fade/slide) at 60fps on external display
  2. Score changes trigger celebration effects (particles/flash) without frame drops
  3. Section transitions use smooth animations (300-500ms) with preloaded content
  4. Minefield section shows high-stakes visual treatment (danger theme, risk indicators)
  5. Operator panel shows keyboard shortcut reference and all available controls
  6. Rundown view displays episode timeline with progress indicators and click-to-jump navigation
  7. All animations respect prefers-reduced-motion and run at 60fps on MacBook Pro
**Plans**: 4 plans

Plans:
- [ ] 05-01: Framer Motion setup with core animation variants
- [ ] 05-02: Score and section transition animations
- [ ] 05-03: Operator panel UI with keyboard reference
- [ ] 05-04: Rundown view and episode progress visualization

### Phase 6: Quiz Sections
**Goal**: All 8 section types implemented with specialized UI and interactions
**Depends on**: Phase 5
**Requirements**: SECT-01, SECT-02, SECT-03, SECT-04, SECT-05, SECT-09, SECT-10, SECT-11
**Success Criteria** (what must be TRUE):
  1. Speed Question section displays reserve questions if initial unanswered
  2. Windows of Knowledge shows 5 categories with 2 questions each, partial scoring up to 8 marks
  3. Minefield window visually distinct with +16/-8/0 scoring rules displayed
  4. Puzzle section uses configurable time (from episode data) with dual-solve scoring logic
  5. Debate section shows judge voting UI with 3 judges + audience rep + guest (max 15 per team)
  6. Ask Intelligently displays 72 animal photos in dynamic grid with reveal animations
  7. Rapid Questions shows same 20 questions for both teams with operator-controlled switching
  8. Audience Questions section triggers flexibly between main sections
**Plans**: 5 plans

Plans:
- [ ] 06-01: Speed Question and Windows of Knowledge sections
- [ ] 06-02: Minefield special treatment and Puzzle section
- [ ] 06-03: Debate section with judge scoring UI
- [ ] 06-04: Ask Intelligently with 72-photo interactive grid
- [ ] 06-05: Rapid Questions and Audience Questions sections

### Phase 7: Audio & Episode Management
**Goal**: Audio feedback system and episode editor for production workflow
**Depends on**: Phase 6
**Requirements**: AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, CTRL-01, CTRL-04
**Success Criteria** (what must be TRUE):
  1. Correct/wrong/timer/transition sounds play on appropriate events
  2. Operator can mute/unmute audio without stopping playback
  3. Audio preloads on app start with no playback delays during live show
  4. Operator can create new episode from scratch via editor UI
  5. Operator can edit existing episode questions, answers, timers, and team names
  6. Episode editor validates data and shows clear error messages before saving
  7. Episodes can be imported from JSON files and exported after editing
  8. All keyboard shortcuts work globally and section-specific shortcuts appear contextually
**Plans**: 4 plans

Plans:
- [ ] 07-01: Audio Manager singleton with Web Audio API
- [ ] 07-02: Sound effect integration and operator mute control
- [ ] 07-03: Episode data structure with Zod validation
- [ ] 07-04: Episode editor UI with import/export

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Migration | 0/4 | Not started | - |
| 2. Dual-Screen Architecture | 0/3 | Not started | - |
| 3. Game State & Scoring | 0/2 | Not started | - |
| 4. Timer System | 0/3 | Not started | - |
| 5. Visual System | 0/4 | Not started | - |
| 6. Quiz Sections | 0/5 | Not started | - |
| 7. Audio & Episode Management | 0/4 | Not started | - |

**Total:** 0/25 plans complete (0%)
