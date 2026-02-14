# Phase 3: Game State & Scoring - Research

**Researched:** 2026-02-14
**Domain:** Score animations, keyboard controls, state history/undo, live production UI patterns
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Score display & animations:**
- Compact corner overlay on audience display, always visible
- Each team shows: team name, current score, change delta (+2, -8, etc.) that fades out after update
- Score changes apply instantly to both screens simultaneously
- Animation style for number transitions: Claude's discretion (rolling counter, pop & scale, or flip — pick what looks best for broadcast)
- Extra visual effect on score change (glow, color pulse, etc.): Claude's discretion

**Active team indicator:**
- Glow/halo effect around the active team's score area
- Single accent color (e.g., gold/white) that moves to whichever team is active — not tied to team identity
- Turn change transition: smooth slide of the glow from one team to the other (300-500ms)
- Same glow treatment on both operator panel and audience display

**Operator scoring controls:**
- Keyboard-only controls — no mouse/click buttons needed during live show
- Two input modes: section-aware presets (quick keys for +1, +2, +8, +16, -8) AND custom number entry for arbitrary values
- Full scoring history with ability to review and revert any past scoring action
- Score changes apply instantly to audience display — no staging/commit workflow

**Team identity & sides:**
- Teams identified by name only (from episode data) — no colors, logos, or avatars
- No color distinction between teams — differentiated by position and name only
- Side swap (left/right) is instant — no animation
- Initial left/right positioning: Claude's discretion (sensible default, potentially configurable)

### Claude's Discretion

- Score number animation style (rolling counter, pop & scale, or flip)
- Extra visual effect on score change (glow, pulse, or none)
- Initial team side positioning logic
- Specific keyboard shortcut assignments
- Scoring history UI design on operator panel
- Custom number entry interaction pattern

### Specific Context

- Show is RTL (Arabic) — "right" is the primary/first position, matching Phase 1's physical positioning decisions (right/left not start/end)
- Section-aware presets should reflect the actual scoring values from the quiz format: +1 (speed/general), +2 (windows), +8/+16/-8 (minefield), etc.
- Keyboard-only operation is critical for live TV — operator cannot look away from the screen to find a mouse

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

## Summary

This phase implements real-time score tracking with animations, turn management, and keyboard-driven operator controls for live broadcast. The key technical challenges are: (1) animated number transitions with delta display that fades out, (2) keyboard-only scoring controls with section presets and custom entry, (3) scoring history with undo/revert capabilities, (4) active team glow indicator that transitions smoothly, and (5) instant side swapping.

The research confirms that CSS-based animations with Tailwind (already using tw-animate-css) provide the best performance for broadcast. For undo/redo, the zundo library is purpose-built for Zustand and weighs under 700 bytes. Keyboard handling requires conditional event listeners to avoid conflicts with input fields. The existing showStore already has score state and turn management — this phase extends it with history middleware and adds operator UI controls.

**Primary recommendation:** Use CSS transitions with Tailwind classes for score animations (pop & scale with glow pulse), implement zundo middleware for scoring history, create a keyboard handler hook that disables during input focus, and leverage existing BroadcastChannel sync for instant cross-window updates.

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 | State management | Already in use, base for scoring state and history |
| tailwindcss | ^4.1.18 | Styling with animations | Already configured, tw-animate-css already imported |
| tw-animate-css | ^1.4.0 | Pre-built CSS animations | Already installed, provides fade, scale, slide utilities |
| react | ^18.0.0 | UI framework | Already in use, hooks for keyboard handling |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zundo | ^2.2.0 | Undo/redo for Zustand | Purpose-built, <700 bytes, handles temporal state for scoring history |
| react-hotkeys-hook | ^4.7.0 | Keyboard shortcuts | Production-ready, input-aware filtering, supports sequences |

### Optional (Evaluate During Implementation)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-countup | ^6.5.3 | Number counter animation | If CSS transitions insufficient for rolling counter effect |
| react-slot-counter | ^2.0.0 | Flip/slot animation | If flip animation chosen instead of pop & scale |

### Native Features (No Install)
| Feature | Browser Support | Purpose | Notes |
|---------|----------------|---------|-------|
| CSS transitions | Universal | Score number animations, glow effects | Hardware-accelerated, best performance |
| CSS animations | Universal | Delta fade-out, pulse effects | Keyframes for multi-step animations |
| KeyboardEvent API | Universal | Keyboard controls | Built-in, requires careful event handling |
| BroadcastChannel | 98%+ (already in use) | Cross-window score sync | Already implemented in Phase 2 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zundo | Custom history array | zundo handles edge cases, memory limits, partial history |
| CSS transitions | Framer Motion | CSS is faster, lighter, better for broadcast; Motion adds 50KB+ |
| react-hotkeys-hook | react-keyboard-event-handler | hotkeys-hook has better input filtering, more active |
| CSS animations | JavaScript animation libraries | CSS is hardware-accelerated, lower overhead for live production |

**Installation:**
```bash
# Required dependencies
bun add zundo react-hotkeys-hook

# Optional (evaluate based on animation choice)
# bun add react-countup react-slot-counter
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── state/
│   ├── showStore.ts              # Extend with history middleware
│   └── middleware/
│       └── historyMiddleware.ts  # zundo configuration for scoring
├── hooks/
│   ├── useScoreControls.ts       # Keyboard shortcuts for scoring
│   └── useScoringHistory.ts      # History navigation (undo/redo)
├── components/
│   ├── audience/
│   │   ├── ScoreOverlay.tsx      # Corner overlay with deltas
│   │   └── TeamScore.tsx         # Individual team score with animations
│   └── operator/
│       ├── ScoringPanel.tsx      # Keyboard controls UI
│       ├── ScoringHistory.tsx    # History list with revert
│       ├── ScorePresets.tsx      # Section-aware quick buttons
│       └── TeamControls.tsx      # Turn toggle, side swap
└── lib/
    └── scoringHistory.ts         # History entry formatting utilities
```

### Pattern 1: Score Animation with Delta Display

**What:** Animated number transition with temporary delta indicator (+2, -8) that fades out
**When to use:** Score updates on audience display and confidence monitor

**Recommended approach: Pop & Scale with Glow Pulse**
- Number scales up slightly (1.1x) then back to 1.0 over 300ms
- Delta appears above/beside score, fades out over 2s
- Glow pulse effect on container (box-shadow expansion)

```typescript
// Source: CSS transitions + Tailwind utilities
interface TeamScoreProps {
  score: number
  delta: number | null // null when no recent change
  teamName: string
  isActive: boolean
}

function TeamScore({ score, delta, teamName, isActive }: TeamScoreProps) {
  const [animateScore, setAnimateScore] = useState(false)
  const [showDelta, setShowDelta] = useState(false)

  useEffect(() => {
    if (delta !== null && delta !== 0) {
      setAnimateScore(true)
      setShowDelta(true)

      // Clear animation flag after duration
      const animTimer = setTimeout(() => setAnimateScore(false), 300)
      // Fade delta after 2s
      const deltaTimer = setTimeout(() => setShowDelta(false), 2000)

      return () => {
        clearTimeout(animTimer)
        clearTimeout(deltaTimer)
      }
    }
  }, [delta])

  return (
    <div
      className={`
        relative transition-shadow duration-300
        ${isActive ? 'ring-4 ring-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}
      `}
    >
      <span className="text-white/80 text-2xl">{teamName}</span>

      {/* Score number with pop animation */}
      <div className="relative">
        <span
          className={`
            text-7xl font-bold tabular-nums text-white
            transition-transform duration-300
            ${animateScore ? 'scale-110' : 'scale-100'}
          `}
        >
          {score}
        </span>

        {/* Delta indicator */}
        {showDelta && delta !== null && (
          <span
            className={`
              absolute -top-8 right-0 text-3xl font-bold
              ${delta > 0 ? 'text-green-400' : 'text-red-400'}
              animate-fade-out
            `}
          >
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
    </div>
  )
}

// CSS (add to main.css)
// @keyframes fade-out {
//   0% { opacity: 1; transform: translateY(0); }
//   80% { opacity: 1; }
//   100% { opacity: 0; transform: translateY(-10px); }
// }
// .animate-fade-out {
//   animation: fade-out 2s ease-out forwards;
// }
```

### Pattern 2: Active Team Glow with Smooth Transition

**What:** Glow/halo effect that slides from one team to the other on turn change
**When to use:** Turn indicator on both operator and audience displays

```typescript
// Source: CSS transitions + absolute positioning
function ScoreDisplay() {
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const turned = useShowStore((s) => s.turned)

  return (
    <div className="relative flex gap-8 items-center">
      {/* Sliding glow background */}
      {turned && (
        <div
          className={`
            absolute inset-0 pointer-events-none
            transition-transform duration-400 ease-in-out
            ${rightsTurn ? 'translate-x-0' : 'translate-x-[calc(100%-8rem)]'}
          `}
        >
          <div className="w-[8rem] h-full rounded-xl bg-yellow-400/20 blur-xl" />
        </div>
      )}

      <TeamScore {...rightTeamProps} isActive={rightsTurn && turned} />
      <TeamScore {...leftTeamProps} isActive={!rightsTurn && turned} />
    </div>
  )
}
```

### Pattern 3: Keyboard Controls with Input Field Awareness

**What:** Global keyboard shortcuts that automatically disable when input fields are focused
**When to use:** Scoring presets and controls on operator panel

```typescript
// Source: react-hotkeys-hook + conditional enablement
import { useHotkeys } from 'react-hotkeys-hook'

function useScoreControls() {
  const addRightScore = useShowStore((s) => s.addRightScore)
  const addLeftScore = useShowStore((s) => s.addLeftScore)
  const toggleTurn = useShowStore((s) => s.toggleTurn)
  const rightsTurn = useShowStore((s) => s.rightsTurn)

  // Section presets - right team
  useHotkeys('1', () => rightsTurn && addRightScore(1), { enableOnFormTags: false })
  useHotkeys('2', () => rightsTurn && addRightScore(2), { enableOnFormTags: false })
  useHotkeys('8', () => rightsTurn && addRightScore(8), { enableOnFormTags: false })
  useHotkeys('shift+8', () => rightsTurn && addRightScore(16), { enableOnFormTags: false })
  useHotkeys('minus', () => rightsTurn && addRightScore(-8), { enableOnFormTags: false })

  // Section presets - left team
  useHotkeys('q', () => !rightsTurn && addLeftScore(1), { enableOnFormTags: false })
  useHotkeys('w', () => !rightsTurn && addLeftScore(2), { enableOnFormTags: false })
  useHotkeys('e', () => !rightsTurn && addLeftScore(8), { enableOnFormTags: false })
  useHotkeys('shift+e', () => !rightsTurn && addLeftScore(16), { enableOnFormTags: false })
  useHotkeys('r', () => !rightsTurn && addLeftScore(-8), { enableOnFormTags: false })

  // Turn management
  useHotkeys('space', () => toggleTurn(), { enableOnFormTags: false })

  // Undo/redo
  useHotkeys('cmd+z, ctrl+z', () => undo(), { enableOnFormTags: false })
  useHotkeys('cmd+shift+z, ctrl+shift+z', () => redo(), { enableOnFormTags: false })
}

// Note: enableOnFormTags: false prevents shortcuts when typing in inputs
```

### Pattern 4: Scoring History with Zundo

**What:** Undo/redo middleware for Zustand that tracks scoring actions
**When to use:** Wrap showStore to enable history tracking

```typescript
// Source: zundo documentation
import { create } from 'zustand'
import { temporal } from 'zundo'
import { broadcast } from './sync/broadcastMiddleware'
import { persist } from 'zustand/middleware'

export const useShowStore = create<ShowState>()(
  broadcast(
    persist(
      temporal(
        (set) => ({
          // ...existing state
        }),
        {
          limit: 50, // Keep last 50 scoring actions
          partialize: (state) => ({
            // Only track score-related changes in history
            rightScore: state.rightScore,
            leftScore: state.leftScore,
            rightsTurn: state.rightsTurn,
            turned: state.turned,
          }),
        }
      ),
      {
        name: 'show-storage',
        storage: createJSONStorage(() => localStorage),
      }
    ),
    'quiz-show-state'
  )
)

// Access temporal store for undo/redo
export const useTemporalStore = create(useShowStore.temporal)

// Hook for history controls
function useScoringHistory() {
  const undo = useTemporalStore((state) => state.undo)
  const redo = useTemporalStore((state) => state.redo)
  const pastStates = useTemporalStore((state) => state.pastStates)
  const futureStates = useTemporalStore((state) => state.futureStates)

  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  return { undo, redo, canUndo, canRedo, pastStates }
}
```

### Pattern 5: Side Swap (Instant, No Animation)

**What:** Swap team positions (left ↔ right) with single keyboard shortcut
**When to use:** Pre-show setup or mid-show adjustment

```typescript
// Add to showStore
interface ShowState {
  // ...existing
  swapSides: () => void
}

// Implementation
swapSides: () => set((state) => ({
  rightScore: state.leftScore,
  leftScore: state.rightScore,
  rightsTurn: !state.rightsTurn, // Maintain turn with team
}))

// Also swap team names in data
updateData: (updater) =>
  set((state) => {
    if (!state.data) return state
    return { data: updater(state.data) }
  }),

// Keyboard shortcut
useHotkeys('cmd+shift+s, ctrl+shift+s', () => {
  const { swapSides, updateData } = useShowStore.getState()
  swapSides()
  updateData((data) => ({
    ...data,
    leftTeamName: data.rightTeamName,
    rightTeamName: data.leftTeamName,
  }))
}, { enableOnFormTags: false })
```

### Anti-Patterns to Avoid
- **Don't use JavaScript libraries for number animations:** CSS transitions are faster and more reliable for live broadcast
- **Don't broadcast every keystroke:** Only broadcast final score changes, not intermediate states
- **Don't create separate delta state:** Derive delta from previous/current score during render
- **Don't use complex animation libraries:** Framer Motion, GSAP add overhead; CSS is sufficient
- **Don't allow keyboard shortcuts during input:** Use `enableOnFormTags: false` to prevent conflicts
- **Don't track all state in history:** Only score-related fields to keep history lightweight

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Undo/redo state management | Custom history array with actions | zundo middleware | Handles edge cases, memory limits, partialize for selective tracking |
| Keyboard shortcut handling | Manual addEventListener with key checks | react-hotkeys-hook | Input field awareness, modifier keys, key combinations, cleanup |
| Number counter animation | requestAnimationFrame loop | CSS transitions or react-countup | CSS is hardware-accelerated; countup handles edge cases |
| Delta calculation | Store previous score in separate state | Calculate in useEffect from score change | Avoids state sync issues, simpler |

**Key insight:** CSS transitions/animations are the gold standard for broadcast graphics because they're hardware-accelerated, predictable, and don't cause React re-render overhead. Only reach for JS animation libraries if CSS cannot achieve the effect.

## Common Pitfalls

### Pitfall 1: Animation Jank During Score Updates
**What goes wrong:** Score number stutters or delays during transition
**Why it happens:** React re-render triggers layout recalculation mid-animation
**How to avoid:** Use CSS transitions on transform/opacity only (not layout properties); set will-change on animated elements
**Warning signs:** Choppy animations, dropped frames, layout shift

```css
/* Fix: Use GPU-accelerated properties only */
.score-number {
  will-change: transform, opacity;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Pitfall 2: Delta Shows on Initial Render
**What goes wrong:** Delta "+0" or previous value appears on component mount
**Why it happens:** useEffect runs on mount, treats initial score as change
**How to avoid:** Track "first render" flag, only show delta after score actually changes
**Warning signs:** Delta visible on page load, incorrect delta values

```typescript
// Fix: Skip delta on mount
const isFirstRender = useRef(true)
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false
    return
  }
  // Now safe to show delta
}, [score])
```

### Pitfall 3: Keyboard Shortcuts Fire During Custom Number Entry
**What goes wrong:** Operator typing "8" in custom input triggers +8 preset
**Why it happens:** Event listener doesn't check event target
**How to avoid:** Use `enableOnFormTags: false` in react-hotkeys-hook options
**Warning signs:** Input fields unusable, unexpected score changes while typing

### Pitfall 4: History Grows Unbounded
**What goes wrong:** Memory usage increases indefinitely during long show
**Why it happens:** No limit on zundo history size
**How to avoid:** Set `limit: 50` in zundo options to keep last 50 states only
**Warning signs:** Increasing memory usage, slow undo operations

### Pitfall 5: Side Swap Doesn't Update Team Names
**What goes wrong:** Scores swap but team names stay in place
**Why it happens:** Team names stored separately in episode data
**How to avoid:** Swap both scores AND team names in data object atomically
**Warning signs:** Team names mismatched with scores

### Pitfall 6: Glow Transition Jumps Instead of Sliding
**What goes wrong:** Glow appears instantly on new team instead of sliding across
**Why it happens:** Using conditional rendering instead of transform transition
**How to avoid:** Keep glow element rendered, use `translate-x` to move it
**Warning signs:** Abrupt glow appearance, no smooth motion

### Pitfall 7: BroadcastChannel Echoes Undo Actions
**What goes wrong:** Undo on operator triggers undo on audience, infinite loop
**Why it happens:** Temporal state changes broadcast like normal state changes
**How to avoid:** Ensure zundo wraps inside broadcast middleware, or filter temporal actions
**Warning signs:** Multiple undo steps per keypress, state thrashing

## Code Examples

Verified patterns from official sources:

### Zundo Temporal Middleware
```typescript
// Source: https://github.com/charkour/zundo (zundo documentation)
import { temporal } from 'zundo'
import { create } from 'zustand'

const useStore = create(
  temporal(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      limit: 10, // Keep only 10 states
      partialize: (state) => ({
        // Only track specific fields
        count: state.count,
      }),
    }
  )
)

// Access temporal methods
const { undo, redo, clear } = useStore.temporal.getState()
```

### React Hotkeys Hook with Form Awareness
```typescript
// Source: https://react-hotkeys-hook.vercel.app/
import { useHotkeys } from 'react-hotkeys-hook'

function MyComponent() {
  // Shortcut disabled when focus is on input/textarea/select
  useHotkeys('ctrl+s', () => save(), {
    enableOnFormTags: false,
    preventDefault: true,
  })

  // Shortcut with modifier keys
  useHotkeys('shift+8', () => addScore(16), {
    enableOnFormTags: false,
  })

  // Multiple keys for same action (cross-platform)
  useHotkeys('cmd+z, ctrl+z', () => undo(), {
    enableOnFormTags: false,
  })
}
```

### CSS Score Pop Animation
```css
/* Source: CSS transitions best practices */
@keyframes score-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes delta-fade {
  0% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-20px); }
}

.score-number {
  /* Use will-change for performance hint */
  will-change: transform;
  transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.score-number.animate {
  animation: score-pop 300ms ease-out;
}

.score-delta {
  animation: delta-fade 2s ease-out forwards;
}
```

### Glow Effect with Box Shadow
```css
/* Source: Tailwind CSS + custom CSS */
.team-score {
  transition: box-shadow 300ms ease-in-out;
}

.team-score.active {
  box-shadow:
    0 0 20px rgba(255, 215, 0, 0.4),
    0 0 40px rgba(255, 215, 0, 0.2),
    0 0 60px rgba(255, 215, 0, 0.1);
}

/* Or using Tailwind (if custom shadow defined) */
/* className="transition-shadow duration-300 shadow-glow-active" */
```

### Delta State Management Pattern
```typescript
// Source: React hooks patterns
function useScoreDelta(currentScore: number) {
  const [delta, setDelta] = useState<number | null>(null)
  const previousScore = useRef(currentScore)

  useEffect(() => {
    const change = currentScore - previousScore.current
    if (change !== 0) {
      setDelta(change)
      // Clear delta after display duration
      const timer = setTimeout(() => setDelta(null), 2000)
      previousScore.current = currentScore
      return () => clearTimeout(timer)
    }
  }, [currentScore])

  return delta
}

// Usage
function TeamScore({ score }: { score: number }) {
  const delta = useScoreDelta(score)
  return (
    <>
      <span>{score}</span>
      {delta !== null && <span className="delta">{delta > 0 ? '+' : ''}{delta}</span>}
    </>
  )
}
```

### RTL-Aware Positioning
```typescript
// Source: Tailwind CSS RTL best practices
// Use logical properties (start/end) not directional (left/right)
// For absolute positioning in RTL:

function ScoreOverlay() {
  return (
    <div className="fixed top-4 end-4"> {/* end-4 not right-4 */}
      <TeamScore position="right" />
    </div>

    <div className="fixed top-4 start-4"> {/* start-4 not left-4 */}
      <TeamScore position="left" />
    </div>
  )
}

// Note: For this phase, user specified "right/left not start/end" for spatial consistency
// So we should use right-4 and left-4 explicitly, NOT logical properties
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript number counters | CSS transitions/transforms | 2020+ GPU acceleration | Smoother, more performant for live broadcast |
| Custom undo implementation | zundo temporal middleware | 2022 (zundo released) | Handles edge cases, memory limits, < 700 bytes |
| Manual keyboard listeners | react-hotkeys-hook | 2021+ (v4 in 2023) | Input awareness, modifier support, cleanup |
| Framer Motion for UI | Tailwind + CSS animations | Tailwind 3+ (2021) | Lighter weight, faster for simple animations |
| Class-based animation toggling | Tailwind animation utilities | Tailwind 3+ | Declarative, consistent naming |

**Deprecated/outdated:**
- `useKeyPress` custom hooks: react-hotkeys-hook supersedes with better API
- `immer` for undo: zundo handles this internally with better memory management
- Complex animation libraries (GSAP, Anime.js): Overkill for score displays; CSS is sufficient

## Open Questions

1. **Animation Style Choice**
   - What we know: User wants Claude to pick between rolling counter, pop & scale, or flip
   - What's unclear: Which style will be most readable at 4K broadcast resolution
   - Recommendation: **Pop & scale** — simplest to implement, most reliable, no library needed; verify readability during implementation

2. **Glow Effect Color**
   - What we know: Single accent color (e.g., gold/white), not team-specific
   - What's unclear: Exact color value, brightness level for broadcast
   - Recommendation: Start with gold (#FFD700 / yellow-400) at 40% opacity; adjust based on confidence monitor preview

3. **Keyboard Shortcut Layout**
   - What we know: Need presets for +1, +2, +8, +16, -8 per team
   - What's unclear: Optimal key mappings for right vs left team
   - Recommendation: Right hand (1,2,8,9,0) for right team, left hand (q,w,e,r,t) for left team; allows two-handed operation

4. **History Display Format**
   - What we know: Full scoring history with review/revert
   - What's unclear: How to present history (list, timeline, table)
   - Recommendation: Reverse chronological list showing: timestamp, action (+8 Right), operator, with "Revert to this" button

5. **Custom Number Entry Pattern**
   - What we know: Need arbitrary value entry alongside presets
   - What's unclear: Modal dialog, inline input, or number pad interface
   - Recommendation: Dedicated text input with +/- buttons, active team context, Enter to apply

## Sources

### Primary (HIGH confidence)
- [zundo GitHub](https://github.com/charkour/zundo) - Undo/redo middleware for Zustand
- [react-hotkeys-hook](https://react-hotkeys-hook.vercel.app/) - Keyboard shortcuts with form awareness
- [tw-animate-css documentation](https://www.npmjs.com/package/tw-animate-css) - Already installed, animation utilities
- MDN Web Docs - CSS transitions, animations, transform properties
- Zustand documentation - State management, middleware composition

### Secondary (MEDIUM confidence)
- [React animation libraries comparison 2026](https://blog.logrocket.com/best-react-animation-libraries/)
- [CSS Glow Effects](https://motion-primitives.com/docs/glow-effect)
- [Tailwind CSS RTL Support](https://flowbite.com/docs/customize/rtl/)
- [React keyboard event handling patterns](https://alexbostock.medium.com/lessons-about-react-keyboard-input-forms-event-listeners-and-debugging-e79016c20ef1)

### Tertiary (LOW confidence)
- WebSearch results on sports broadcast graphics (general patterns, no specific technical implementation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified, already using Zustand and Tailwind
- Architecture: HIGH - Patterns align with existing Phase 2 patterns, proven approaches
- Pitfalls: MEDIUM - Based on common React animation issues and keyboard handling edge cases
- Animation choice: MEDIUM - Recommendation based on broadcast reliability, needs validation

**Research date:** 2026-02-14
**Valid until:** 2026-03-14 (30 days - stable technologies, well-established patterns)

**Key technical decisions for planner:**
1. Use CSS transitions (not JS libraries) for score animations — pop & scale with glow pulse
2. Use zundo temporal middleware for scoring history — wraps showStore
3. Use react-hotkeys-hook for keyboard controls — enableOnFormTags: false critical
4. Derive delta from score changes in useEffect, don't store separately
5. Glow transition uses transform translate, not conditional rendering
6. Side swap is instant state mutation, no animation per user requirement
7. Right hand keys for right team, left hand keys for left team
