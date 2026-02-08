# Project Research Summary

**Project:** بشائر المعرفة (Basha'ir Al-Ma'rifa) - TV Quiz Show Modernization
**Domain:** Live TV quiz show control system
**Researched:** 2026-02-08
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a live TV quiz show control system requiring dual-screen architecture (operator panel + audience display) with broadcast-quality animations and real-time state synchronization. The current codebase uses deprecated Create React App and needs migration to modern tooling. Research indicates the recommended approach is Vite + React 18 + TypeScript + Zustand for state management, with Broadcast Channel API for cross-window synchronization. The app must support Arabic RTL layouts, handle 8 different section types including specialized features like chess-clock timers and 72-photo animal grids, and maintain 60fps animation performance for professional TV production quality.

Critical risks center on browser timer throttling (tabs in background lose timer accuracy), missing error boundaries (single component crash takes down entire app during live TV), and multi-window state synchronization race conditions. These risks can be mitigated by using Web Workers for timers, implementing granular error boundaries early, and using Broadcast Channel API instead of localStorage for state sync. The technology stack is well-documented and proven (HIGH confidence), but multi-window patterns and RTL implementation require careful attention to established pitfalls (MEDIUM confidence).

The recommended migration path prioritizes infrastructure (Vite migration, TypeScript setup, error boundaries) before features, addresses timer accuracy and dual-screen architecture before animations, and defers complex features like 3D elements and episode editor until core gameplay is proven. This approach avoids the common pitfall of attempting too much in parallel and ensures a functional, broadcast-ready system before adding production-workflow enhancements.

## Key Findings

### Recommended Stack

The modern React ecosystem has converged on Vite as the build tool standard, replacing deprecated Create React App. Vite 7+ offers 10x faster builds with instant HMR and first-class TypeScript support. State management should use Zustand (lightweight, no Provider wrapper needed, works across windows) instead of Redux which adds unnecessary complexity for single-operator apps. Styling via Tailwind CSS enables rapid development with automatic purging and built-in RTL support using logical properties.

**Core technologies:**
- **Vite 7.3+**: Build tool and dev server — fast HMR, native ESM, TypeScript-first. CRA is deprecated and unmaintained.
- **TypeScript 5.8+**: Type system — catches errors at compile time, better IDE support, v5.8 adds Node 18 module support.
- **Zustand 5.0+**: State management — 3kb, zero boilerplate, works across browser windows without Provider wrapper. Perfect for dual-screen architecture.
- **Tailwind CSS 3.4+**: Styling — rapid development, automatic purging, built-in RTL support via logical properties.
- **Framer Motion 12.33+**: 2D animations — declarative API, 60fps GPU-accelerated, gesture handling. Avoid 3D (React Three Fiber) unless confirmed needed.
- **Broadcast Channel API**: Cross-window sync — native browser API, better performance than localStorage, automatic message delivery.
- **shadcn/ui + Radix**: Accessible UI components — copy-paste ownership, Radix primitives for a11y, perfect for episode editor.
- **dnd-kit**: Drag-and-drop — modern, accessible, 10kb. react-beautiful-dnd is deprecated.
- **Zod 3.24+**: Schema validation — runtime validation for episode JSON files, TypeScript-first schemas.

**Critical version requirements:**
- Node.js 18+ (Vite 7 dropped Node 16 support)
- React 18.3+ (current codebase uses this already)
- ESLint 9+ with flat config (legacy config deprecated)

**What to avoid:**
- Create React App (deprecated, unmaintained, slow)
- Redux (overkill for this use case, 5x more boilerplate than Zustand)
- Styled Components / CSS-in-JS (runtime overhead, trend is build-time CSS)
- react-beautiful-dnd (officially deprecated by Atlassian)

### Expected Features

**Must have (table stakes):**
- **Dual-screen architecture** — Industry standard for broadcast. Operator sees private controls + preview, audience sees polished output only. Missing this = amateur product.
- **Real-time scoring with animations** — Leaderboard updates after every scored event with smooth transitions. Always visible on audience display.
- **Section timers with visual countdown** — Per-section configurable timers, progress ring/bar, audio cues at thresholds (10s, 5s, 0s). Creates tension, prevents dead air.
- **Broadcast-quality animations** — Entrance animations for questions, score counter odometer effects, celebration effects, section reveals. Makes show feel professional vs amateur.
- **Keyboard operator controls** — Single-key triggers for all actions. Live TV requires instant control without mouse hunting.
- **Chess clock visualization (Poetic Chase)** — Side-by-side countdown clocks with time-to-points conversion. Makes complex timing rules immediately understandable.
- **Dynamic animal grid (Ask Intelligently)** — Interactive 72-photo grid with reveal animations. More engaging than static image.
- **Turn indicator** — Visual highlight showing which team is active. Always visible, swappable left/right.
- **Undo/reset capability** — Operator mistakes happen live. Must be recoverable without restarting.
- **Safe area boundaries** — TV screens have bezels/overscan that cut off edges. Configurable margins with visual guides.

**Should have (competitive advantage):**
- **Confidence monitor** — Operator sees preview of what's about to air before triggering. Industry standard in broadcast trucks.
- **Rundown view** — Timeline of full episode structure, progress indicators, click to jump. Industry term for episode flow visualization.
- **Episode editor UI** — Create/edit episodes without touching JSON. Validation, preview mode, drag-drop reordering.
- **Tournament bracket display** — 6-team, 9-episode structure visualization with animated progression.
- **Dynamic graphics overlays** — Animated lower thirds, team names, category badges. Real-time composited like Chyron/Vizrt.
- **Instant replay markers** — Timestamp logging for post-production highlights. Simple but valuable for production team.

**Defer (v2+):**
- **3D elements** — Three.js section transitions, 3D category badges, particle effects. High production value but risky performance. Test on MacBook Pro first.
- **Video playback in questions** — High risk for live show. Video encoding, format compatibility, playback reliability issues.
- **Multi-user networked controls** — Adds massive complexity. Single operator with keyboard shortcuts is faster and proven for broadcast.
- **AI-generated questions** — Quality critical for TV. Not ready for live broadcast without heavy review.
- **Mobile companion app for host** — Keyboard on laptop is faster. Tablet adds failure point. Host communicates with operator via audio (industry standard).

### Architecture Approach

The recommended architecture uses native browser APIs (window.open + Broadcast Channel) for dual-screen management instead of Electron, keeping the bundle lightweight and deployment simple. Each window has its own React root but shares state via Zustand stores synchronized through Broadcast Channel middleware. Timer logic uses Web Workers to avoid browser tab backgrounding throttle, and audio uses a singleton AudioManager wrapping Web Audio API to prevent multiple AudioContext instances.

**Major components:**
1. **Window Manager** — Opens/closes display window, establishes Broadcast Channel communication. Single hook manages window.open() reference and cleanup.
2. **State Sync Service** — Synchronizes Zustand stores between windows via Broadcast Channel API (primary) with localStorage fallback. Each store broadcasts updates automatically via middleware.
3. **Timer Engine** — Chess clock and countdown logic using Web Workers for accuracy, useRef for interval IDs to prevent re-render issues. Timer state in Zustand, setInterval managed outside React.
4. **Audio Manager** — Singleton wrapping Web Audio API AudioContext. Pre-loads sound effects, handles playback queue, ensures single AudioContext instance (browser limitation).
5. **Episode Data Store** — Loads/validates JSON episodes with Zod schema, tracks completion state separately in persisted Zustand store. Read-only episode data + write-only progress tracking.
6. **Operator UI** — Keyboard handlers via global event listener with priority stack (exclusive handlers for modals). Control interface, status display, confidence monitor preview.
7. **Audience UI** — Full-screen presentation with safe area wrapper, Motion animations, RTL layout. All content stays within configurable TV boundaries.

**Key patterns:**
- Broadcast Channel middleware for automatic store sync across windows
- Web Worker timers to avoid browser tab throttling
- Singleton AudioManager for Web Audio API best practices
- Global keyboard handler with priority stack for modal exclusivity
- CSS logical properties (`margin-inline-start`) for RTL support
- Error boundaries at component level (not just root) for graceful degradation

### Critical Pitfalls

1. **Browser tab backgrounding breaks timer precision** — Chrome throttles setInterval to 1Hz after 10s in background, once per minute after 5 minutes. Chess clock timers become completely inaccurate during live shows if operator switches tabs. **Solution:** Use Web Workers for timer logic (not throttled) and performance.now() for elapsed time calculation instead of counter variables. Test specifically with tab backgrounding scenarios.

2. **Missing error boundaries lead to complete app crashes** — Single uncaught error unmounts entire React app, causing blank white screen during live TV. Without error boundaries, there's no graceful degradation. **Solution:** Implement error boundaries around major features (timer, score, editor, grids) with recovery UI. Add root-level error boundary as final fallback. Test by deliberately throwing errors.

3. **Multi-window state sync assumes localStorage is instant** — localStorage storage event doesn't fire in originating window, has no delivery order guarantee, and 100-200ms latency. Creates visible desynchronization between operator and audience screens. **Solution:** Use Broadcast Channel API instead (better performance, event-driven) with sequence numbers to detect out-of-order delivery.

4. **Animation state updates cause render cascade collapse** — Updating React state on every animation frame (60fps) triggers parent re-renders cascading to siblings. App becomes laggy, animations stutter. **Solution:** Use Framer Motion's useMotionValue (bypasses React render cycle) and CSS animations where possible. Keep animated state in refs, not React state.

5. **RTL layout hardcoded LTR assumptions** — Absolute positioning with left:, margin-left instead of logical properties, portals ignore dir="rtl". Results in dozens of visual glitches making app look unprofessional. **Solution:** Use CSS logical properties from day one (margin-inline-start, inset-inline-end), set dir="rtl" on portals explicitly, test with actual Arabic content.

6. **TypeScript strict mode enabled too early** — Enabling strict: true during migration generates thousands of errors, causing migration paralysis. Feature development stops, team becomes frustrated. **Solution:** Start with strict: false, enable noImplicitAny first to prevent any spreading, add strictNullChecks after components converted, enable remaining flags only after migration complete.

7. **Overusing TypeScript any during migration** — Using any as "temporary" escape hatch causes type safety to spread like a virus. Any function receiving any parameter loses type checking. **Solution:** Use unknown instead (forces type checking before use), enable noImplicitAny from day one, create .types.ts files for complex shared types.

## Implications for Roadmap

Based on research, suggested phase structure prioritizes infrastructure and risky technical challenges before features:

### Phase 1: Foundation & Migration
**Rationale:** Must establish modern tooling and prevent critical pitfalls before building features. Browser timer throttling and missing error boundaries are showstopper risks that must be addressed in infrastructure, not discovered during feature development. TypeScript migration done incrementally to avoid paralysis.

**Delivers:** Vite build system, TypeScript with noImplicitAny (not full strict mode), error boundaries around major component areas, Web Worker timer infrastructure, Broadcast Channel sync hook, CSS architecture using logical properties for RTL.

**Addresses (from FEATURES.md):** Safe area configuration, RTL layout foundation.

**Avoids (from PITFALLS.md):** Browser tab backgrounding breaks timers, missing error boundaries, strict TypeScript paralysis, RTL layout hardcoded assumptions.

**Stack elements:** Vite 7.3, TypeScript 5.8, Tailwind CSS 3.4, Broadcast Channel API.

**Research flag:** Standard migration patterns. Well-documented. Skip phase research.

### Phase 2: Dual-Screen Architecture
**Rationale:** Core architectural requirement that all features depend on. Multi-window state synchronization is complex and must be proven before building gameplay features. Operator panel + audience display separation is fundamental to broadcast use case.

**Delivers:** Window manager hook (window.open), Zustand stores with Broadcast Channel middleware, window type detection, operator panel scaffolding, audience display with safe area wrapper, out-of-sync detection UI.

**Addresses (from FEATURES.md):** Dual-screen architecture (table stakes), confidence monitor (differentiator).

**Avoids (from PITFALLS.md):** Multi-window state sync race conditions, localStorage assumptions.

**Uses (from STACK.md):** Zustand 5.0+, Broadcast Channel API, window.open() native API.

**Implements (from ARCHITECTURE.md):** Window Manager, State Sync Service, Operator UI scaffold, Audience UI scaffold.

**Research flag:** Multi-window patterns need validation. MEDIUM confidence. Consider /gsd:research-phase if issues arise.

### Phase 3: Game State & Scoring System
**Rationale:** Once dual-screen communication proven, implement core gameplay mechanics. Scoring and turn management are simpler than timers (no Web Worker complexity) and serve as validation that state sync works correctly across windows.

**Delivers:** Score tracking (left team, right team), turn management with visual indicators, undo/reset capabilities, score increment/decrement controls, animated score updates (odometer effect), keyboard shortcuts (s = switch turn, r = reset).

**Addresses (from FEATURES.md):** Real-time scoring with animations (table stakes), turn indicator (table stakes), undo/reset capability (table stakes).

**Uses (from STACK.md):** Zustand stores, Framer Motion 12.33+ for score animations.

**Implements (from ARCHITECTURE.md):** Game State Manager.

**Research flag:** Standard state management. Well-documented. Skip phase research.

### Phase 4: Timer System
**Rationale:** Timers are high-risk due to browser throttling. Build after state sync proven. Requires Web Worker implementation (non-trivial). Chess clock is most complex timer variant, so build countdown timer first, then chess clock.

**Delivers:** Countdown timer with Web Worker implementation, visual countdown (progress ring), audio cues (10s, 5s, 0s warnings), performance.now() timestamp-based accuracy, Page Visibility API warning when tab backgrounded, chess clock with dual timers and pass mechanic.

**Addresses (from FEATURES.md):** Section timers with visual countdown (table stakes), chess clock visualization (table stakes).

**Uses (from STACK.md):** Web Workers, Web Audio API via AudioManager.

**Implements (from ARCHITECTURE.md):** Timer Engine, Audio Manager.

**Avoids (from PITFALLS.md):** Browser tab backgrounding breaks timers.

**Research flag:** Web Worker timer patterns need research. MEDIUM confidence. Run /gsd:research-phase before planning.

### Phase 5: Animation System
**Rationale:** Build after core gameplay (scores, timers) proven. Animations are high-value for broadcast quality but carry performance risks. Must implement with useMotionValue to avoid render cascades. Test on actual hardware (MacBook + external display).

**Delivers:** Motion variant definitions for all transitions, entrance animations for questions, score change animations, section transition effects, performance monitoring (60fps target), prefers-reduced-motion support.

**Addresses (from FEATURES.md):** Broadcast-quality animations (table stakes), smooth scene transitions (table stakes).

**Uses (from STACK.md):** Framer Motion 12.33+, GPU-accelerated transforms.

**Implements (from ARCHITECTURE.md):** Animation state machine, Motion variants.

**Avoids (from PITFALLS.md):** Animation state updates cause render cascade.

**Research flag:** Framer Motion patterns well-documented. Skip phase research.

### Phase 6: Section Implementations
**Rationale:** Implement all 8 section types (Speed, Windows, Puzzle, Debate, Poetic Chase, Ask Intelligently, Rapid, Audience). Each section is a vertical slice using timer + score + animation infrastructure. Group by complexity: simple text-based first, then interactive grids.

**Delivers:** All section types with appropriate UI, question display system, category headers, media support (images), dynamic 72-photo animal grid with lazy loading, minefield special treatment (حقل الالغام), debate judge scoring UI.

**Addresses (from FEATURES.md):** Question/content display (table stakes), dynamic animal grid (differentiator), all 8 section types (table stakes).

**Uses (from STACK.md):** Intersection Observer for lazy loading, Tailwind grid layouts.

**Research flag:** Image grid lazy loading patterns. Standard. Skip phase research. Minefield scoring might need quick research on visual patterns.

### Phase 7: Audio & Polish
**Rationale:** Add audio feedback after gameplay proven. Audio enhances experience but isn't core functionality. Can be deferred if schedule pressure.

**Delivers:** Audio manager initialization, sound effect library (correct, wrong, timer tick, alarm, transition whoosh), operator mute control, audio preloading on app start, Web Audio API implementation.

**Addresses (from FEATURES.md):** Audio feedback system (table stakes).

**Uses (from STACK.md):** Web Audio API via singleton AudioManager.

**Implements (from ARCHITECTURE.md):** Audio Manager service fully.

**Avoids (from PITFALLS.md):** Multiple AudioContext instances.

**Research flag:** Web Audio API patterns well-documented. Skip phase research.

### Phase 8: Episode Data & Editor (Optional v1.x)
**Rationale:** Episode editor is production workflow enhancement, not needed for first live show if episodes can be authored as JSON manually. Defer to v1.x after core validated with 2-3 successful recordings. Only build if operator feedback indicates JSON editing is painful.

**Delivers:** Episode JSON schema (Zod), episode loader with validation, episode editor UI with shadcn/ui forms, drag-drop question reordering (dnd-kit), import/export episode data, preview mode.

**Addresses (from FEATURES.md):** Episode/content management (table stakes), episode editor UI (differentiator), import/export (differentiator).

**Uses (from STACK.md):** Zod 3.24+, shadcn/ui + Radix, dnd-kit.

**Implements (from ARCHITECTURE.md):** Episode Data Store, Episode Editor components.

**Research flag:** Zod schema patterns, dnd-kit usage. Standard patterns. Skip phase research unless complex validation needed.

### Phase Ordering Rationale

- **Infrastructure first, features second:** Phases 1-2 establish tooling, prevent critical pitfalls (timer accuracy, error boundaries, state sync). Building features on CRA with no error boundaries = building on quicksand.

- **Risky architecture proven early:** Dual-screen (Phase 2) and timers (Phase 4) are highest technical risk. Proving these early prevents late-stage discovery of insurmountable problems.

- **Dependencies respected:** Animations (Phase 5) need state sync working. Sections (Phase 6) need timers + scores + animations. Editor (Phase 8) needs schema + validation which depends on knowing section structure from Phase 6.

- **Value delivery incremental:** After Phase 3, have working operator controls + audience display with scores. After Phase 4, add timers. After Phase 5, looks broadcast-quality. After Phase 6, all sections implemented = MVP complete.

- **Defer production workflow tools:** Episode editor (Phase 8) deferred to v1.x because episodes can be JSON-authored initially. Operator needs working show controls first, editor improvements second.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Timer System):** Web Worker implementation patterns, performance.now() timestamp strategies, Page Visibility API integration. MEDIUM confidence from research. Run /gsd:research-phase before detailed planning.
- **Phase 2 (Dual-Screen):** Broadcast Channel API edge cases, window lifecycle management. MEDIUM confidence. May need phase research if complex sync scenarios discovered.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Vite migration, TypeScript setup, Tailwind. Well-documented, established patterns. HIGH confidence.
- **Phase 3 (Game State):** Zustand state management, keyboard handlers. Standard React patterns. HIGH confidence.
- **Phase 5 (Animation):** Framer Motion usage, Motion variants. Well-documented library. HIGH confidence.
- **Phase 6 (Sections):** Lazy loading images, grid layouts. Standard web patterns. HIGH confidence.
- **Phase 7 (Audio):** Web Audio API singleton. Documented in ARCHITECTURE.md. MEDIUM-HIGH confidence.
- **Phase 8 (Editor):** Zod validation, dnd-kit drag-drop. Standard library usage. HIGH confidence.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major technologies verified with official docs, npm versions, release notes. Vite, TypeScript, Zustand, Framer Motion, Tailwind are mainstream 2026 choices with extensive documentation. |
| Features | MEDIUM | Based on broadcast industry standards and production software research. Professional TV quiz systems are proprietary so some inference required from visible features and operator workflows. Table stakes vs differentiators well-defined. |
| Architecture | MEDIUM-HIGH | HIGH confidence for standard React patterns (state management, component structure). MEDIUM confidence for multi-window specifics (Broadcast Channel edge cases, window lifecycle) which are less commonly documented. Patterns provided are proven but edge cases may emerge. |
| Pitfalls | MEDIUM-HIGH | HIGH confidence for well-documented issues (browser timer throttling, React error boundaries, TypeScript migration). MEDIUM confidence for multi-window sync and RTL implementation specifics which require domain experience. All pitfalls sourced from technical blogs and community wisdom. |

**Overall confidence:** MEDIUM-HIGH

Research is sufficient to begin roadmap creation and Phase 1 implementation. Multi-window patterns (Phase 2) and Web Worker timers (Phase 4) should be validated with spike/proof-of-concept work before full commitment.

### Gaps to Address

**Multi-window state synchronization edge cases** — Research covers Broadcast Channel API basics and localStorage fallbacks, but production edge cases (window closed mid-show, message delivery failures, sync recovery strategies) will need handling during Phase 2 implementation. Plan for extra QA cycles and contingency patterns.

**3D elements performance validation** — Research recommends deferring React Three Fiber to v2+, but if stakeholders request 3D for initial launch, need dedicated performance testing on target MacBook Pro + external display. No confidence in whether target hardware can maintain 60fps with 3D scene transitions.

**Arabic font rendering optimization** — Cairo font from Google Fonts is recommended, but actual rendering performance at large sizes (TV display) with RTL layout needs validation during Phase 1. May need font subsetting or custom loading strategy.

**Operator keyboard shortcut conflicts** — Global keyboard handler pattern is documented, but actual key assignments for 8 sections + score controls + timer controls need UX design to avoid conflicts. Build conflict detection into Phase 3.

**Episode JSON schema evolution** — Once schema locked in Phase 8, changes become breaking. Need validation with actual show content before committing to schema structure. Consider versioning strategy from start.

**Tournament bracket data model** — Research doesn't cover how 6-team, 9-episode tournament structure maps to data model. Need to design this during Phase 8 or defer to v2.

## Sources

### Primary (HIGH confidence)
- [Vite Documentation v7.3.1](https://vite.dev/) — Build tool features, configuration
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) — Type system features
- [Zustand npm](https://www.npmjs.com/package/zustand) — State management API, version 5.0.11
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) — Animation library, v12.33.0
- [Broadcast Channel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) — Cross-window communication
- [React Error Boundaries](https://legacy.reactjs.org/docs/error-boundaries.html) — Error handling patterns
- [Chrome Background Tab Throttling](https://developer.chrome.com/blog/background_tabs) — Timer throttling behavior
- [Web Workers API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) — Worker timer patterns
- [Web Audio API Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — AudioContext patterns
- [TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) — Official migration strategy

### Secondary (MEDIUM confidence)
- [Vite vs CRA Migration Guide 2026](https://dev.to/solitrix02/goodbye-cra-hello-vite-a-developers-2026-survival-guide-for-migration-2a9f) — Migration patterns
- [Zustand vs Redux 2026](https://medium.com/@sangramkumarp530/zustand-vs-redux-toolkit-which-should-you-use-in-2026-903304495e84) — State management comparison
- [React Multi-Window Patterns](https://pietrasiak.com/creating-multi-window-electron-apps-using-react-portals) — Window communication
- [React RTL Guide](https://leancode.co/blog/right-to-left-in-react) — RTL implementation patterns
- [React Animation Performance](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react) — Animation optimization
- [Multi-Window State Sync](https://torsten-muller.dev/javascript/communication-between-browser-tabs-synchronizing-state/) — Cross-window synchronization challenges
- [Broadcast Control Systems](https://www.screenskills.com/job-profiles/browse/broadcast-engineering/distribution-and-playout/control-room-engineer-mcr-playout-broadcast-engineering/) — MCR operator workflows
- [Ross XPression Graphics](https://www.rossvideo.com/live-production/graphics/xpression/) — Industry-standard broadcast graphics
- [BuzzerSystems Quiz Timer](https://buzzersystems.com/product/match-timer/) — Professional quiz timer hardware
- [Confidence Monitoring Guide 2026](https://huview.com/what-is-a-confidence-monitor/) — Confidence monitor setup

### Tertiary (LOW confidence, requires validation)
- Various DEV.to and Medium articles on React patterns
- Community forum discussions on timer accuracy
- GitHub reference implementations (react-chess-clock)

---
*Research completed: 2026-02-08*
*Ready for roadmap: Yes*
