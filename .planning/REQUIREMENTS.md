# Requirements: بشائر المعرفة

**Defined:** 2026-02-08
**Core Value:** The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.

## v1 Requirements

### Architecture (ARCH)

- [ ] **ARCH-01**: App built with Vite + React 18 + TypeScript (no JavaScript, no CRA)
- [ ] **ARCH-02**: Dual-screen architecture — operator panel on MacBook, audience view on external display via window.open()
- [ ] **ARCH-03**: Cross-window state sync via Broadcast Channel API with automatic reconnection
- [ ] **ARCH-04**: Configurable safe area / content boundaries (margins adjustable per edge, persisted)
- [ ] **ARCH-05**: Error boundaries around every major section (crash in one section doesn't kill the app)
- [ ] **ARCH-06**: Web Worker timers for accurate countdowns even when browser tab is backgrounded
- [ ] **ARCH-07**: Confidence monitor — operator sees preview of what audience will see next before triggering
- [ ] **ARCH-08**: All state managed via Zustand stores (not React Context)

### Quiz Sections (SECT)

- [ ] **SECT-01**: Speed Question — first to answer determines who picks first, no points, reserve questions if unanswered
- [ ] **SECT-02**: نوافذ المعرفة (Windows of Knowledge) — 5 windows, 2 questions each, up to 8 marks per question with partial scoring
- [ ] **SECT-03**: حقل الالغام (Minefield) — special window replacing general questions, +16 correct / -8 wrong / 0 partial, distinct visual treatment, 2 questions any team can pick
- [ ] **SECT-04**: Puzzle — configurable time per episode (set in episode config), solve + explain why, one solves = 15pts, both solve = 10 first + 5 second
- [ ] **SECT-05**: Debate — alternating rounds (60s first, 40s second), 3 judges + audience rep + guest of honor each vote up to 5, max 15 per team
- [ ] **SECT-06**: Poetic Chase (chess clock) — 100s per team, clock runs continuously switching on turn, remaining seconds convert to points (5s = 1pt), each correct verse = 1pt
- [ ] **SECT-07**: Poetic Chase pass mechanic — pass sends verse to opponent (+1pt), opponent answers with required letter (+1pt extra, can return same letter) or uses new letter (no extra, can't return)
- [ ] **SECT-08**: Poetic Chase letter display — pressing a letter key on keyboard instantly displays the required letter on audience screen
- [ ] **SECT-09**: Ask Intelligently — 72 real animal photos in dynamic interactive grid, one team picks, other team gets 20 points and 2 minutes, each yes/no question costs 1 point
- [ ] **SECT-10**: Rapid Questions — same set of 20 questions for both teams, 60 seconds each, headphones isolation (operator switches between teams)
- [ ] **SECT-11**: Audience Questions — simple questions for prizes, operator triggers flexibly between any sections

### Scoring & State (SCOR)

- [ ] **SCOR-01**: Real-time score display with animated number transitions on audience screen
- [ ] **SCOR-02**: Turn management with visual indicator of active team (glow/highlight)
- [ ] **SCOR-03**: Team side swap — instantly switch left/right team placement via keyboard shortcut
- [ ] **SCOR-04**: Undo last score change (at least 1 level of undo)
- [ ] **SCOR-05**: Reset current section timer without affecting scores
- [ ] **SCOR-06**: Manual score adjustment by operator (add/subtract arbitrary points)

### Visual Design & Animations (ANIM)

- [ ] **ANIM-01**: Broadcast-quality 2D animations via Framer Motion — entrance effects for questions, score changes, section transitions
- [ ] **ANIM-02**: Smooth scene transitions between sections (fade, slide, scale — 300-500ms)
- [ ] **ANIM-03**: 3D elements via React Three Fiber — section title reveals, show title, category badges
- [ ] **ANIM-04**: Graphics overlays — animated lower thirds for team names, section titles, category badges
- [ ] **ANIM-05**: Dynamic lighting — background color/atmosphere changes based on active section
- [ ] **ANIM-06**: Minefield (حقل الالغام) gets special high-stakes visual treatment (danger theme, risk indicators)
- [ ] **ANIM-07**: Chess clock visualization — side-by-side countdown clocks with active/paused states, time-to-points conversion preview
- [ ] **ANIM-08**: Animal grid — reveal/zoom animations when selecting animals, visual feedback for eliminated options
- [ ] **ANIM-09**: Score celebration effects on correct answers (particles, flash, scale)
- [ ] **ANIM-10**: Blue color scheme maintained, Arabic RTL throughout, Cairo font, polished TV look
- [ ] **ANIM-11**: All animations run at 60fps on MacBook Pro

### Operator Controls (CTRL)

- [ ] **CTRL-01**: Keyboard shortcuts for every action (advance, score, timer, swap, undo, mute)
- [ ] **CTRL-02**: Operator panel shows all controls, current state, and keyboard shortcut reference
- [ ] **CTRL-03**: Rundown view — timeline of episode flow showing all sections, progress, and ability to jump to any section
- [ ] **CTRL-04**: Section-specific operator controls (e.g., letter input for poetic chase, animal selection for ask intelligently)

### Content Management (DATA)

- [ ] **DATA-01**: Clean episode data structure — typed JSON schema with Zod validation, no redundant fields
- [ ] **DATA-02**: Episode editor UI — create new episodes from scratch
- [ ] **DATA-03**: Episode editor — edit existing episode questions, answers, timers, team names
- [ ] **DATA-04**: Episode editor — import episode from JSON file
- [ ] **DATA-05**: Episode editor — export episode to JSON file
- [ ] **DATA-06**: Episode editor — validation with clear error messages before saving
- [ ] **DATA-07**: Episode config includes per-episode settings (puzzle time, team names, etc.)

### Audio (AUDIO)

- [ ] **AUDIO-01**: Sound effects for correct answer, wrong answer, timer tick, timer alarm, section transitions
- [ ] **AUDIO-02**: Audio cues at timer thresholds (configurable — e.g., 10s, 5s, 0s)
- [ ] **AUDIO-03**: Operator mute/unmute control
- [ ] **AUDIO-04**: Audio managed via singleton AudioManager (Web Audio API, not multiple Audio elements)

## v2 Requirements

### Tournament

- **TOURN-01**: Tournament bracket display for 6 teams, 9 episodes (structure TBD)
- **TOURN-02**: Animated bracket reveal showing team progression
- **TOURN-03**: Match result entry between episodes

### Production Enhancements

- **PROD-01**: Operator training/practice mode with simulated data
- **PROD-02**: Instant replay timestamp markers for post-production
- **PROD-03**: Theme customization system (colors, fonts, logos via config)
- **PROD-04**: Multi-episode statistics and team performance tracking
- **PROD-05**: Performance monitoring overlay (FPS counter, memory usage)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-user / networked controls | Single operator is proven broadcast model. Adds massive complexity. |
| Real-time audience voting via mobile | Requires backend, auth, spam prevention. Separate production decision. |
| AI-generated questions | Question quality critical for TV. Not ready for live broadcast. |
| Video playback in questions | Broadcast team handles video via separate equipment. |
| Score persistence across episodes | Each episode standalone. Tournament tracking is v2. |
| Mobile companion app | Keyboard on laptop is faster/more reliable. |
| Live streaming integration | Broadcast team handles streaming separately. |
| Multi-language support | Arabic only for current scope. |
| Backend server | Client-side only. Data in files. |

## Traceability

Populated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| — | — | — |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 0
- Unmapped: 42

---
*Requirements defined: 2026-02-08*
*Last updated: 2026-02-08 after initial definition*
