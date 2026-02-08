# Domain Pitfalls

**Domain:** Live TV Quiz Show Application
**Researched:** 2026-02-08
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: Browser Tab Backgrounding Breaks Timer Precision

**What goes wrong:**
Chrome throttles `setInterval` to once per minute in background tabs. When the operator switches browser tabs during a live show, chess clock timers drift, freeze, or become completely inaccurate. The timer appears to work fine during testing (when the tab is focused) but fails catastrophically during actual use when operators might have multiple windows/tabs open.

**Why it happens:**
Browsers aggressively throttle JavaScript timers in inactive tabs to save battery and CPU. Chrome limits timers to 1Hz after 10 seconds in background, and to once per minute after 5 minutes. This is a security/performance feature, not a bug.

**How to avoid:**
- Use Web Workers for timing logic - workers are not throttled like the main thread
- Use `performance.now()` instead of counter variables to calculate elapsed time
- Implement the Page Visibility API to detect backgrounding and warn operators
- Consider the `worker-timers` npm package as a drop-in replacement for `setInterval`/`setTimeout`
- Store target datetime with timezone and calculate remaining time on each tick rather than decrementing counters

**Warning signs:**
- Timers work perfectly in development but drift during rehearsals
- Time discrepancies appear after operators switch windows
- Timer "catches up" when tab regains focus
- Reports of "timer stopped" during live shows

**Phase to address:**
Phase 1 (Timer Infrastructure) - This must be solved before any timer-dependent features are built. Test specifically with tab backgrounding scenarios.

**Sources:**
- [Chrome throttling documentation](https://developer.chrome.com/blog/background_tabs) - HIGH confidence
- [Why browsers throttle timers](https://nolanlawson.com/2025/08/31/why-do-browsers-throttle-javascript-timers/) - HIGH confidence
- [Web Workers for accurate timers](https://hackwild.com/article/web-worker-timers/) - MEDIUM confidence

---

### Pitfall 2: Missing Error Boundaries Lead to Complete App Crashes on Live TV

**What goes wrong:**
A single uncaught JavaScript error in any component causes the entire React app to unmount and display a blank white screen. During live TV broadcast, this means total system failure visible to the audience. Without error boundaries, there's no graceful degradation - the app is either 100% working or 0% working.

**Why it happens:**
React 16+ intentionally unmounts the entire component tree when an error occurs without an error boundary. Developers often skip error boundaries during rapid development, assuming "we'll add them later," but this creates a critical production vulnerability.

**How to avoid:**
- Implement error boundaries around major feature areas (timer display, score display, content editor, image grids)
- Create a root-level error boundary with recovery UI
- Log errors to console/monitoring service even when caught
- Provide "Reload Component" buttons in error boundary fallback UI for operator recovery
- Test error boundaries by deliberately throwing errors in development
- Consider Sentry or similar error monitoring for production

**Warning signs:**
- White screen appears during testing when unexpected errors occur
- No fallback UI exists for component failures
- Error handling is only at the data fetching level
- Production crashes leave no trace of what went wrong

**Phase to address:**
Phase 1 (Foundation/Architecture) - Error boundaries must be in place before building any live-critical features. This is infrastructure, not a feature to add later.

**Sources:**
- [React Error Boundaries documentation](https://legacy.reactjs.org/docs/error-boundaries.html) - HIGH confidence
- [Production-ready error handling](https://dzone.com/articles/react-native-error-handling-guide) - MEDIUM confidence
- [Building resilient applications](https://dev.to/blamsa0mine/react-error-boundaries-building-resilient-applications-that-dont-crash-4kc5) - MEDIUM confidence

---

### Pitfall 3: Overusing TypeScript `any` During Migration Creates False Type Safety

**What goes wrong:**
During JavaScript-to-TypeScript migration, developers use `any` as a "temporary" escape hatch for complex components. The `any` type spreads like a virus through the codebase - any function that receives an `any` parameter also loses type checking, and any property accessed on `any` is also `any`. The app technically "compiles" but has zero actual type safety, defeating the entire purpose of migration.

**Why it happens:**
Complex React components with inconsistent prop usage (sometimes passed, sometimes optional, sometimes different types) are hard to type correctly. Under deadline pressure, `any` feels like a quick fix. Event handlers (`React.FormEvent`, `React.ChangeEvent`) require specific typing knowledge that's unfamiliar to JS developers.

**How to avoid:**
- Use `unknown` instead of `any` when type is genuinely unclear (forces type checking before use)
- Enable `noImplicitAny` in tsconfig from day one, but keep `strict: false` initially
- Create `.types.ts` files for complex shared types rather than inline typing
- Migrate "leaf" components first (no dependencies) to build typing patterns
- Use TypeScript's type inference - don't over-annotate simple cases
- Budget extra time for typing event handlers and React-specific patterns

**Warning signs:**
- TSC compiles without errors but runtime errors still occur frequently
- Search codebase for `: any` and find dozens or hundreds of instances
- Props that should be required are sometimes undefined at runtime
- Developers avoid TypeScript features and treat it like "JavaScript with extra steps"

**Phase to address:**
Throughout Migration phase - Address this during JS-to-TS conversion, not as cleanup later. Once `any` spreads, it's extremely difficult to remove.

**Sources:**
- [TypeScript migration pitfalls](https://medium.com/@DevBoostLab/javascript-typescript-migration-honest-review-d80a82a5eb17) - MEDIUM confidence
- [Official TypeScript migration guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html) - HIGH confidence
- [React TypeScript migration tips](https://dev.to/mitchkarajohn/tips-for-migrating-a-react-app-to-typescript-4jpk) - MEDIUM confidence

---

### Pitfall 4: Multi-Window State Synchronization Assumes localStorage Is Instant

**What goes wrong:**
When building dual-screen (operator screen + audience screen) architecture, developers use localStorage to sync state between windows. However, the `storage` event doesn't fire in the originating window, only in other windows. Additionally, there's no guarantee of event delivery order or timing - one window can be several state updates behind. During live shows, this creates visible desynchronization where the operator screen shows different scores/timers than the audience screen.

**Why it happens:**
localStorage appears synchronous but the `storage` event mechanism is asynchronous and unreliable. Documentation examples show simple toy cases that don't reveal edge cases. Developers test with both windows visible on the same screen, where human perception doesn't catch 100-200ms delays, but projector/TV lag compounds the issue.

**How to avoid:**
- Use `BroadcastChannel API` instead of localStorage for real-time sync (better performance, event-driven)
- Implement sequence numbers/timestamps on state updates to detect out-of-order delivery
- Add visual indicators when windows are out of sync (e.g., "Waiting for sync..." badge)
- Consider a "source of truth" window that other windows explicitly subscribe to
- Use `Window.postMessage()` if windows are opened via `window.open()` (direct communication)
- Test with windows on different physical displays with realistic projector lag

**Warning signs:**
- Operator reports "changes don't appear on audience screen immediately"
- Score updates sometimes skip numbers or show old values briefly
- Timer starts on one screen before the other
- State "flickers" between old and new values

**Phase to address:**
Phase 2 (Dual-Screen Architecture) - This is fundamental to multi-window design. Don't build on localStorage assumptions.

**Sources:**
- [Multi-window synchronization challenges](https://torsten-muller.dev/javascript/communication-between-browser-tabs-synchronizing-state/) - MEDIUM confidence
- [State management across tabs](https://blog.pixelfreestudio.com/how-to-manage-state-across-multiple-tabs-and-windows/) - MEDIUM confidence
- [Web multi-screen patterns](https://web.dev/patterns/web-apps/multiple-screens) - HIGH confidence

---

### Pitfall 5: Animation State Updates Cause Render Cascade Performance Collapse

**What goes wrong:**
Adding animations that update React state on every frame (via `requestAnimationFrame` or animation libraries) triggers re-renders of parent components. Parent re-renders cascade to siblings and children. At 60fps, this means 60 re-renders/second of large component trees. The app becomes laggy, animations stutter, and the UI feels unresponsive - especially critical during live TV where visual smoothness matters.

**Why it happens:**
Developers treat animation state like regular state and store it in React's state system. Animation libraries that integrate with React state (poorly implemented) trigger re-renders for every position change. The React state paradigm ("state change = re-render") conflicts with animation's need for frequent, localized updates.

**How to avoid:**
- Use CSS animations/transitions for simple cases (runs on compositor thread, bypasses React entirely)
- Use Framer Motion's `useMotionValue` hook - values update outside React's render cycle
- Use `useTransform` for derived animation values (also bypasses re-renders)
- Keep animated state in refs (`useRef`) instead of state when only the animated element needs updates
- Use `React.memo` on components that receive animated props but don't need to re-render
- Profile with React DevTools to identify animation-triggered render cascades

**Warning signs:**
- App runs smoothly without animations but stutters when animations are enabled
- React DevTools Profiler shows 60+ renders/second during animations
- CPU usage spikes during simple UI transitions
- Animation FPS drops below 30 during state updates elsewhere in the app

**Phase to address:**
Phase 3 (Animation System) - Build animation infrastructure with performance in mind from the start. Refactoring animated components later is extremely difficult.

**Sources:**
- [React animation performance](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react) - MEDIUM confidence
- [Optimizing re-renders during animations](https://app.studyraid.com/en/read/7850/206069/reducing-re-renders-during-animations) - LOW confidence
- [React re-renders guide](https://www.developerway.com/posts/react-re-renders-guide) - HIGH confidence

---

### Pitfall 6: RTL Layout Hardcoded LTR Assumptions Break Arabic UI

**What goes wrong:**
After setting `dir="rtl"` on the root element, certain UI elements still appear LTR: absolute positioned elements use `left:` values that should be `right:`, flexbox `margin-left` doesn't flip, punctuation appears on wrong side of text, portal components (modals/tooltips) ignore RTL. The app "mostly" works in Arabic but has dozens of visual glitches that create unprofessional appearance.

**Why it happens:**
CSS logical properties are still not consistently used. Developers use `margin-left`, `padding-right`, `left`, `right` instead of `margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `inset-inline-end`. React portals render outside the root element, so they don't inherit `dir` attribute. Absolute/fixed positioning often hardcodes orientation assumptions.

**How to avoid:**
- Use CSS logical properties from the start: `margin-inline-*`, `padding-block-*`, `inset-inline-*`
- Use `<bdi>` tag for dynamic text content to isolate text directionality
- Set `dir="rtl"` explicitly on portal components (modals, tooltips, dropdowns)
- Set `letter-spacing: 0` for Arabic (default letter-spacing breaks connected Arabic letters)
- Test with actual Arabic content, not just flipped English
- Use `text-align: start` instead of `text-align: left`

**Warning signs:**
- Layout "mostly" works in RTL but some elements feel wrong
- Tooltips and modals appear in LTR while rest of app is RTL
- Arabic text has unexpected spacing between letters
- Punctuation (commas, periods) appears on the left side of sentences
- Icon-text pairs have icons on the wrong side

**Phase to address:**
Phase 1 (Foundation) - CSS architecture must use logical properties from the start. Retrofitting RTL later requires touching every stylesheet.

**Sources:**
- [RTL in React guide](https://leancode.co/blog/right-to-left-in-react) - MEDIUM confidence
- [RTL common mistakes](https://www.reffine.com/en/blog/rtl-website-design-and-development-mistakes-best-practices) - MEDIUM confidence
- [RTL Styling 101](https://rtlstyling.com/posts/rtl-styling/) - MEDIUM confidence

---

### Pitfall 7: Strict TypeScript Mode Enabled Too Early Creates Migration Paralysis

**What goes wrong:**
Enabling `strict: true` in tsconfig.json during JS-to-TypeScript migration generates thousands of errors. The team spends weeks trying to fix type errors instead of converting functionality. Feature development stops completely. Developers become frustrated and view TypeScript as an obstacle rather than a tool. The migration stalls or gets abandoned.

**Why it happens:**
Strict mode enables ~10 different type checking flags simultaneously (`strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, etc.). Each flag reveals hundreds of existing issues. Migrating code while fixing strict mode issues is overwhelming. Management pressure to ship features conflicts with fixing type errors.

**How to avoid:**
- Start with `strict: false` and enable flags incrementally
- Enable `noImplicitAny` first (prevents `any` spreading), then migrate components
- Add `strictNullChecks` after most components are converted
- Add remaining strict flags only after migration is complete
- Use `// @ts-expect-error` with comments for known issues to be fixed later (creates technical debt backlog)
- Convert utility functions and "leaf" components first to establish typing patterns
- Create shared `.types.ts` files before converting components that use them

**Warning signs:**
- Migration branch has 2000+ TypeScript errors
- Developers create "any-heavy" code just to get it compiling
- Feature velocity drops to near-zero during migration
- Team discusses abandoning TypeScript migration
- Every PR has hundreds of lines of type fixes for 10 lines of actual changes

**Phase to address:**
During Migration Planning - Set realistic tsconfig targets for each migration phase. Don't attempt strict mode until migration is 80%+ complete.

**Sources:**
- [Gradual TypeScript migration](https://www.mikeborozdin.com/post/gradual-typescript-migration) - MEDIUM confidence
- [Incremental strict mode migration](https://www.bitovi.com/blog/how-to-incrementally-migrate-an-angular-project-to-typescript-strict-mode) - MEDIUM confidence
- [TypeScript migration guide](https://medium.com/@schaman762/migrating-from-javascript-to-typescript-a-step-by-step-guide-for-success-c8fce2d8b0b6) - MEDIUM confidence

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Using `any` type for complex React props | Component compiles quickly | Type safety completely lost, bugs slip through | Never - use `unknown` or partial types instead |
| localStorage for multi-window sync | Simple to implement | Race conditions, sync bugs in production | Only for non-critical data like UI preferences |
| State-based animations | Works with React patterns | Re-render performance collapse | Only for infrequent, non-performance-critical animations |
| `setInterval` on main thread | Straightforward timer logic | Throttled in background tabs | Only for non-critical countdown displays, not live show timers |
| Skipping error boundaries | Faster initial development | Complete app crashes in production | Never for production - add during foundation phase |
| CSS pixel values instead of logical properties | Familiar CSS syntax | RTL requires touching every stylesheet | Never - use logical properties from day one |
| Enabling TypeScript strict mode immediately | "Proper" TypeScript from start | Migration paralysis, team frustration | Never during migration - enable incrementally |
| Single root error boundary | One-line solution | Entire app crashes for single component error | Only as final fallback - use granular boundaries |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Image loading | Loading all images on grid mount | Use `react-lazyload` or `Intersection Observer` to load images as they enter viewport |
| Font loading (Arabic fonts) | Not preloading Arabic fonts | Use `<link rel="preload">` for Arabic font files to prevent FOUT during live show |
| Dual-screen communication | Assuming both windows are always open | Check `window.opener` and handle communication failures gracefully |
| Performance.now() | Using it once and storing value | Call `performance.now()` on every timer tick to compensate for throttling |
| CSS Grid auto-placement | Assuming grid items stay in DOM order | Explicitly set `grid-row`/`grid-column` for critical layouts that must not reflow |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating large component trees via state | Stuttering at 60fps, high CPU usage | Use CSS animations or `useMotionValue` to bypass React renders | 5+ animated components simultaneously |
| localStorage for frequent state updates | Storage events flood other windows | Use `BroadcastChannel` for real-time sync | >10 updates per second |
| No React.memo on expensive components | Every parent state change re-renders everything | Wrap expensive pure components in `React.memo` | Component tree depth >5 levels |
| Grid rendering 100+ images without virtualization | Initial load takes 5+ seconds, janky scrolling | Use `react-window` or `react-virtualized` for large grids | >50 grid items |
| Re-creating event handlers on every render | Child components re-render unnecessarily | Use `useCallback` for functions passed as props | >20 child components receiving callbacks |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing episode data in localStorage without size limits | QuotaExceededError crashes editor during live show | Check localStorage size before saving, implement quota monitoring |
| Not handling QuotaExceededError | App crashes when localStorage quota exceeded | Wrap all localStorage operations in try/catch blocks |
| Exposing sensitive show content in client code | Episode questions/answers visible in browser DevTools before show airs | This is client-side only app - accept this limitation or add server component |
| Unicode/RTL text in localStorage | Encoding issues when parsing JSON | Use UTF-8 aware JSON.stringify/parse, test with Arabic content |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual indicator when windows are out of sync | Operator doesn't know audience screen is showing stale data | Add sync status indicator with timestamp of last successful sync |
| Timer continues when tab is backgrounded but appears frozen | Operator switches tabs, timer appears stopped but is still running, returns to tab and time is "wrong" | Use Page Visibility API to show "PAUSED - tab in background" warning |
| Error boundary shows technical error messages | During live TV, operators see React stack traces instead of recovery options | Error boundary fallback UI should show "Reload Component" button and hide technical details |
| No keyboard shortcuts for chess clock controls | Operator must use mouse during time-critical moments | Add spacebar to start/stop, arrow keys to switch active timer |
| Animations ignore prefers-reduced-motion | Users with motion sensitivity experience discomfort | Check `prefers-reduced-motion` media query and provide reduced animation alternative |
| No undo for episode editor changes | Accidental delete requires manual reconstruction | Implement undo stack for editor operations |
| Image grid loads all images on mount | Initial load shows blank screen for 3-5 seconds | Show loading skeleton UI, lazy load images progressively |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Timers:** Often missing Web Worker implementation - verify timer accuracy when tab is backgrounded for 30+ seconds
- [ ] **Error Boundaries:** Often missing error logging - verify errors are logged to console/monitoring service, not just caught silently
- [ ] **RTL Layout:** Often missing portal component RTL - verify modals/tooltips/dropdowns inherit RTL direction
- [ ] **Dual-Screen Sync:** Often missing out-of-sync detection - verify UI shows warning when windows drift >500ms apart
- [ ] **Animations:** Often missing accessibility support - verify `prefers-reduced-motion` is respected
- [ ] **localStorage Usage:** Often missing QuotaExceededError handling - verify try/catch on all .setItem() calls
- [ ] **TypeScript Migration:** Often missing proper event handler types - verify no `any` types in event handlers
- [ ] **Multi-Window:** Often missing window closure detection - verify app handles when secondary window is closed
- [ ] **Chess Clock:** Often missing millisecond precision - verify display shows centiseconds (0.01s precision)
- [ ] **Image Grids:** Often missing lazy loading - verify images don't all load simultaneously on grid mount
- [ ] **Episode Editor:** Often missing autosave - verify content isn't lost when browser crashes

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Timer accuracy lost to backgrounding | MEDIUM | 1. Implement Web Worker timers. 2. Use `performance.now()` for elapsed time calculation. 3. Test with Page Visibility API. Estimate: 1-2 days |
| Missing error boundaries cause production crash | HIGH | 1. Add root error boundary immediately. 2. Add granular boundaries around major features. 3. Implement error logging. Estimate: 2-3 days + testing |
| `any` type spread throughout codebase | HIGH | 1. Enable `noImplicitAny`. 2. Fix errors file-by-file starting with utilities. 3. Replace `any` with `unknown` where type is unclear. Estimate: 1-2 weeks |
| Multi-window sync unreliable | MEDIUM | 1. Replace localStorage with `BroadcastChannel`. 2. Add sequence numbers. 3. Implement sync status UI. Estimate: 2-3 days |
| Animation performance collapse | MEDIUM-HIGH | 1. Identify animation-triggered renders with React DevTools. 2. Move animation state to refs/`useMotionValue`. 3. Add `React.memo` to affected components. Estimate: 3-5 days |
| RTL layout broken in multiple places | HIGH | 1. Audit all CSS for physical properties. 2. Replace with logical properties. 3. Test with Arabic content. 4. Fix portal components. Estimate: 1-2 weeks |
| Strict mode paralysis | LOW | 1. Disable strict flags. 2. Enable `noImplicitAny` only. 3. Continue migration. 4. Re-enable flags incrementally later. Estimate: 1 day |
| localStorage quota exceeded | LOW-MEDIUM | 1. Add try/catch to all localStorage operations. 2. Implement quota monitoring. 3. Add data cleanup/compression. Estimate: 1-2 days |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Browser tab backgrounding breaks timers | Phase 1: Timer Infrastructure | Timer remains accurate after 5 minutes in background tab |
| Missing error boundaries cause crashes | Phase 1: Foundation/Architecture | Deliberately throw error in component, verify app shows fallback UI not blank screen |
| TypeScript `any` type spreading | During Migration: Convert to TypeScript | Audit codebase for `: any`, count should be <10 instances total |
| Multi-window state sync race conditions | Phase 2: Dual-Screen Architecture | Open both windows, rapidly update state, verify no visible desync |
| Animation state updates cause render cascade | Phase 3: Animation System | Profile with React DevTools during animations, verify <10 renders/second |
| RTL layout hardcoded LTR assumptions | Phase 1: Foundation CSS Architecture | Full UI review with Arabic content, check all portals/modals/tooltips |
| Strict TypeScript mode paralysis | Migration Planning Phase | tsconfig.json should have `strict: false` with selective flags enabled |
| localStorage quota exceeded | Phase 4: Episode Editor | Save large episode, verify QuotaExceededError is caught and handled |
| Event handler typing errors | During Migration: Component Conversion | Search for `React.FormEvent<any>`, should find zero instances |
| Image grid performance issues | Phase 5: Dynamic Image Grid | Load grid with 100+ images, verify progressive loading not simultaneous |

---

## Sources

### High Confidence Sources (Official Documentation)
- [TypeScript Migration Guide](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)
- [React Error Boundaries](https://legacy.reactjs.org/docs/error-boundaries.html)
- [Chrome Background Tab Throttling](https://developer.chrome.com/blog/background_tabs)
- [MDN Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [MDN Storage Quotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- [React Re-renders Guide](https://www.developerway.com/posts/react-re-renders-guide)

### Medium Confidence Sources (Technical Blogs & Community Wisdom)
- [JavaScript to TypeScript Migration Honest Review](https://medium.com/@DevBoostLab/javascript-typescript-migration-honest-review-d80a82a5eb17)
- [React RTL Guide](https://leancode.co/blog/right-to-left-in-react)
- [Multi-Window State Synchronization](https://torsten-muller.dev/javascript/communication-between-browser-tabs-synchronizing-state/)
- [Why Browsers Throttle Timers](https://nolanlawson.com/2025/08/31/why-do-browsers-throttle-javascript-timers/)
- [Web Worker Timers](https://hackwild.com/article/web-worker-timers/)
- [Creating Accurate JavaScript Timers](https://www.sitepoint.com/creating-accurate-timers-in-javascript/)
- [React Animation Performance](https://www.zigpoll.com/content/can-you-explain-the-best-practices-for-optimizing-web-performance-when-implementing-complex-animations-in-react)

### Low Confidence Sources (Requires Validation)
- Various Medium articles and DEV.to posts on React patterns
- Community forum discussions on timer accuracy
- Blog posts on RTL implementation specifics

---

*Pitfalls research for: بشائر المعرفة (Live TV Quiz Show)*
*Researched: 2026-02-08*
*Focus: Browser timing, TypeScript migration, dual-screen sync, RTL layouts, animation performance, production resilience*
