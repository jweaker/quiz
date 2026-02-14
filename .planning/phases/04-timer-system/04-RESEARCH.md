# Phase 04: Timer System - Research

**Researched:** 2026-02-14
**Domain:** Web Worker timers, countdown accuracy, chess clock patterns, audio cues
**Confidence:** HIGH

## Summary

Phase 4 requires accurate countdown timers that maintain precision even when the browser tab is backgrounded. The standard approach is using Web Workers to bypass browser throttling (which limits main thread timers to 1 execution per second in inactive tabs). The `worker-timers` npm package provides a drop-in replacement for setInterval/setTimeout that runs in a Web Worker. For maximum accuracy, combine Web Worker timing with `performance.now()` drift correction. Audio cues require HTML5 Audio elements preloaded with `metadata` for instant playback. Letter key display needs standard keyboard event handling with react-hotkeys-hook (already in use). Chess clock pattern: dual timers with mutual exclusion (one runs while other paused), switching atomically on turn change.

**Primary recommendation:** Use `worker-timers` package for background-resistant countdown, implement drift correction with `performance.now()`, preload audio files with HTML5 Audio elements, extend existing Zustand showStore with timer state synchronized via BroadcastChannel middleware.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| worker-timers | 8.0.30+ | Background-resistant setInterval/setTimeout | Industry standard for accurate timers in inactive tabs, 246k weekly downloads |
| performance.now() | Browser native | High-resolution timestamps for drift correction | Monotonic clock immune to system clock changes, microsecond precision |
| Zustand | Already in use | Timer state management with BroadcastChannel sync | Already used for score state, familiar pattern |
| react-hotkeys-hook | Already in use | Letter key capture for instant display | Already integrated, proven form-tag awareness |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| HTML5 Audio | Browser native | Beep playback at 10s, 5s, 0s thresholds | Simple sound cues, no synthesis needed |
| react-timer-hook | 3.0.7+ | Optional: Pre-built useTimer hook with pause/resume | If you want battle-tested timer logic instead of custom |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| worker-timers | Custom Web Worker | More code to maintain, need to handle bundling, same accuracy outcome |
| HTML5 Audio | Web Audio API | Overkill for simple beeps, more complex API, better for synthesized sounds |
| react-timer-hook | Custom useTimer hook | Less code but loses control over drift correction algorithm |

**Installation:**
```bash
npm install worker-timers
# react-timer-hook is optional if you want pre-built hooks
npm install react-timer-hook
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── workers/
│   └── timer.worker.ts       # Web Worker for countdown logic (if custom)
├── hooks/
│   ├── useCountdown.ts       # Countdown timer with worker-timers
│   ├── useChessClock.ts      # Dual timer with mutual exclusion
│   └── useTimerAudio.ts      # Audio cue manager
├── state/
│   └── timerStore.ts         # Timer state (timeRemaining, isRunning, etc.)
└── components/
    └── operator/
        └── TimerPanel.tsx    # Operator timer controls
```

### Pattern 1: Worker-Timers Integration
**What:** Drop-in replacement for setInterval/setTimeout that runs in Web Worker
**When to use:** All countdown timers that need accuracy in background tabs

**Example:**
```typescript
// Source: https://www.npmjs.com/package/worker-timers
import { setInterval, clearInterval } from 'worker-timers'

// Works exactly like native setInterval but immune to tab throttling
const intervalId = setInterval(() => {
  // Tick countdown
}, 1000)

// Clean up
clearInterval(intervalId)
```

**CRITICAL:** worker-timers maintains separate interval/timeout lists. You MUST use `clearInterval` from worker-timers (not window.clearInterval) to cancel worker intervals.

### Pattern 2: Drift Correction with performance.now()
**What:** Track expected vs actual elapsed time and adjust for drift
**When to use:** Countdowns longer than 30 seconds or requiring sub-second accuracy

**Example:**
```typescript
// Source: https://www.sitepoint.com/creating-accurate-timers-in-javascript/
// Adapted from https://hackwild.com/article/web-worker-timers/
import { setInterval, clearInterval } from 'worker-timers'

function createDriftCorrectedCountdown(durationMs: number, onTick: (remaining: number) => void) {
  const startTime = performance.now()
  let expectedTime = startTime + 1000 // First tick in 1s

  const intervalId = setInterval(() => {
    const drift = performance.now() - expectedTime
    const remaining = durationMs - (performance.now() - startTime)

    onTick(Math.max(0, Math.floor(remaining / 1000)))

    // Adjust next interval to compensate for drift
    expectedTime += 1000
  }, 1000)

  return () => clearInterval(intervalId)
}
```

### Pattern 3: Chess Clock (Dual Timer with Mutual Exclusion)
**What:** Two timers where only one runs at a time, switching on turn change
**When to use:** Poetic Chase section with 100s per team, clock runs continuously

**Example:**
```typescript
// Source: https://www.freecodecamp.org/news/how-to-build-a-chess-clock-with-javascript-and-setinterval/
interface ChessClockState {
  rightTimeMs: number
  leftTimeMs: number
  activeTimer: 'right' | 'left' | null
}

// In Zustand store:
const toggleTimer = () => {
  set((state) => ({
    activeTimer: state.activeTimer === 'right' ? 'left' : 'right'
  }))
}

// In useChessClock hook:
useEffect(() => {
  if (activeTimer === null) return

  const intervalId = setInterval(() => {
    const field = activeTimer === 'right' ? 'rightTimeMs' : 'leftTimeMs'

    useTimerStore.setState((state) => {
      const newTime = state[field] - 1000
      if (newTime <= 0) {
        // Timer expired
        return { [field]: 0, activeTimer: null }
      }
      return { [field]: newTime }
    })
  }, 1000)

  return () => clearInterval(intervalId)
}, [activeTimer])
```

### Pattern 4: React useEffect Web Worker Cleanup
**What:** Proper cleanup of Web Worker when component unmounts
**When to use:** If creating custom Web Worker (not needed if using worker-timers package)

**Example:**
```typescript
// Source: https://medium.com/@ignatovich.dm/optimizing-react-apps-with-web-workers-cb01b9d8f77c
useEffect(() => {
  const worker = new Worker(new URL('./timer.worker.ts', import.meta.url))

  worker.onmessage = (e) => {
    // Handle tick message
    setTimeRemaining(e.data.remaining)
  }

  worker.postMessage({ command: 'start', duration: 100 })

  return () => {
    worker.terminate() // CRITICAL: Always terminate in cleanup
  }
}, [])
```

### Pattern 5: Vite Web Worker Import
**What:** Import Web Workers using Vite's ?worker suffix
**When to use:** If creating custom Web Worker for timer logic

**Example:**
```typescript
// Source: https://vite.dev/guide/features
// Recommended: ?worker suffix returns constructor
import TimerWorker from './timer.worker?worker'
const worker = new TimerWorker()

// Alternative: Standard new URL pattern
const worker = new Worker(new URL('./timer.worker.ts', import.meta.url), {
  type: 'module'
})
```

### Pattern 6: Audio Cue Preloading
**What:** Preload audio files with metadata, play on threshold events
**When to use:** 10s, 5s, 0s countdown beeps

**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio
// Source: https://www.w3schools.com/tags/att_audio_preload.asp
function useTimerAudio() {
  const audio10s = useRef<HTMLAudioElement>(null)
  const audio5s = useRef<HTMLAudioElement>(null)
  const audio0s = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Preload audio files
    audio10s.current = new Audio('/sounds/beep-10s.mp3')
    audio5s.current = new Audio('/sounds/beep-5s.mp3')
    audio0s.current = new Audio('/sounds/beep-0s.mp3')

    // Preload metadata (duration, etc.) without downloading full file
    audio10s.current.preload = 'metadata'
    audio5s.current.preload = 'metadata'
    audio0s.current.preload = 'metadata'

    // Load the files
    audio10s.current.load()
    audio5s.current.load()
    audio0s.current.load()
  }, [])

  const playBeep = (threshold: 10 | 5 | 0) => {
    const audio = threshold === 10 ? audio10s.current
                : threshold === 5 ? audio5s.current
                : audio0s.current
    audio?.play()
  }

  return { playBeep }
}

// In countdown logic:
if (remaining === 10) playBeep(10)
if (remaining === 5) playBeep(5)
if (remaining === 0) playBeep(0)
```

### Pattern 7: Letter Key Instant Display
**What:** Capture letter key press and broadcast to audience display immediately
**When to use:** Poetic Chase letter requirement display

**Example:**
```typescript
// Source: Already implemented in project with react-hotkeys-hook
// Extend useScoreControls pattern for letter keys
import { useHotkeys } from 'react-hotkeys-hook'

function useLetterDisplay() {
  const { setRequiredLetter } = useTimerStore()

  // Register A-Z keys
  useHotkeys(
    'a-z',
    (e) => {
      const letter = e.key.toUpperCase()
      setRequiredLetter(letter)
      // State syncs to audience via BroadcastChannel middleware
    },
    {
      enableOnFormTags: false, // Don't fire when typing in inputs
      preventDefault: true
    },
    []
  )
}
```

### Anti-Patterns to Avoid
- **Using native setInterval for background timers:** Browser throttles to 1 execution per minute in inactive tabs after 5 minutes
- **Forgetting to clear worker-timers intervals:** Must use `clearInterval` from worker-timers package, not window.clearInterval
- **Mixing worker-timers and native timers for same countdown:** Leads to desync and confusion
- **Playing audio without preloading:** First play causes noticeable delay while file loads
- **Storing timer state locally without Zustand:** Won't sync to audience window via BroadcastChannel
- **Creating new Web Worker on every tick:** Massive performance hit, create once per timer lifecycle

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Background-resistant timers | Custom Web Worker with postMessage protocol | worker-timers package | Handles bundling, cleanup, browser compatibility, tested by 246k users/week |
| Timer drift correction | Ad-hoc setTimeout adjustment | performance.now() + expected time tracking | Monotonic clock immune to system time changes, proven pattern |
| Pause/resume/reset timer logic | Custom state machine | react-timer-hook (optional) | Battle-tested edge cases (pause during last second, rapid resume, etc.) |
| Audio beep synthesis | Web Audio API oscillator | HTML5 Audio with preloaded MP3/WAV | Simpler API, better browser support, easier to replace sounds |

**Key insight:** Timer accuracy problems are deceptively complex. Browser throttling, event loop delays, garbage collection pauses, system clock changes, time zone transitions all affect naive implementations. Use proven libraries that handle edge cases.

## Common Pitfalls

### Pitfall 1: Browser Tab Throttling
**What goes wrong:** Countdown appears to "pause" when tab loses focus, then jumps forward when tab regains focus
**Why it happens:** Chrome throttles main thread timers to 1 execution per second in inactive tabs, 1 per minute after 5 minutes. Firefox and Safari have similar policies.
**How to avoid:** Use worker-timers package which runs timers in Web Worker thread (not subject to same throttling)
**Warning signs:** Timer runs fine when testing with tab focused, breaks in production when operator switches to another app

**Sources:**
- [Browser throttling policies](https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/)
- [Chrome throttling documentation](https://blog.chromium.org/2020/11/tab-throttling-and-more-performance.html)

### Pitfall 2: Timer Drift Accumulation
**What goes wrong:** 100-second countdown reaches zero after 102 or 98 seconds
**Why it happens:** setInterval/setTimeout guarantee minimum delay, not exact delay. Each tick's slight delay (5-50ms) accumulates over time.
**How to avoid:** Track expected time with `performance.now()`, calculate remaining time from wall clock difference, not tick count
**Warning signs:** Short countdowns (10s) work fine, long countdowns (100s+) drift visibly

**Example of drift:**
```typescript
// BAD: Drift accumulates
let remaining = 100
setInterval(() => {
  remaining -= 1 // Assumes exactly 1 second passed
}, 1000)

// GOOD: Drift-corrected
const startTime = performance.now()
const duration = 100000 // 100s in ms
setInterval(() => {
  const elapsed = performance.now() - startTime
  remaining = Math.max(0, Math.floor((duration - elapsed) / 1000))
}, 1000)
```

**Sources:**
- [Creating Accurate Timers in JavaScript](https://www.sitepoint.com/creating-accurate-timers-in-javascript/)
- [Why JavaScript timer is unreliable](https://abhi9bakshi.medium.com/why-javascript-timer-is-unreliable-and-how-can-you-fix-it-9ff5e6d34ee0)

### Pitfall 3: Web Worker Cannot Access DOM/React State
**What goes wrong:** Custom Web Worker tries to call Zustand actions or update React state directly, throws errors
**Why it happens:** Web Workers run in isolated context with no access to window, document, React, or Zustand
**How to avoid:** Web Worker only computes timer logic and sends messages via postMessage. Main thread receives messages and updates Zustand state. Zustand BroadcastChannel middleware syncs to audience window.
**Warning signs:** "ReferenceError: window is not defined" in worker, "Cannot read property 'setState' of undefined"

**Architecture:**
```
Web Worker (timer.worker.ts)
  ↓ postMessage({ remaining: 95 })
Main Thread (useCountdown.ts)
  ↓ useTimerStore.setState({ remaining: 95 })
Zustand + BroadcastChannel
  ↓ broadcast message
Audience Window
  ↓ receives state update
  → Display updates
```

**Sources:**
- [Web Workers limitations](https://blog.logrocket.com/web-workers-react-typescript/)
- [Web Workers cannot access DOM](https://www.tutorialspoint.com/what-are-the-restrictions-of-web-workers-on-dom-in-javascript)

### Pitfall 4: Forgetting worker-timers Cleanup
**What goes wrong:** Intervals keep running after component unmounts, memory leak, zombie timers
**Why it happens:** worker-timers uses separate ID lists, must call `clearInterval` from worker-timers, not window.clearInterval
**How to avoid:** Always return cleanup function from useEffect: `return () => clearInterval(id)` where clearInterval is imported from worker-timers
**Warning signs:** Timer continues updating state after navigating away, DevTools shows increasing worker message count

**Example:**
```typescript
// BAD: Wrong clearInterval, leak persists
import { setInterval } from 'worker-timers'
const id = setInterval(() => tick(), 1000)
return () => window.clearInterval(id) // WRONG!

// GOOD: Correct cleanup
import { setInterval, clearInterval } from 'worker-timers'
const id = setInterval(() => tick(), 1000)
return () => clearInterval(id) // Correct
```

**Sources:**
- [worker-timers documentation](https://www.npmjs.com/package/worker-timers)
- [React useEffect cleanup patterns](https://dmitripavlutin.com/react-cleanup-async-effects/)

### Pitfall 5: Audio Autoplay Policy Violations
**What goes wrong:** Audio beeps don't play at threshold events, silent failures
**Why it happens:** Browsers block autoplay until user has interacted with page (click, keypress, etc.)
**How to avoid:** Preload audio files early, ensure operator has clicked something before countdown starts, use `audio.play().catch()` to handle rejections gracefully
**Warning signs:** Audio works in development (because you clicked), fails in production when countdown auto-starts

**Example:**
```typescript
const playBeep = (audio: HTMLAudioElement) => {
  audio.play().catch((err) => {
    console.warn('Audio play blocked by browser policy:', err)
    // Could show visual cue as fallback
  })
}
```

**Sources:**
- [HTML5 Audio autoplay policies](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio)
- [Web Audio API best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

### Pitfall 6: Points Conversion Rounding Errors
**What goes wrong:** 99 seconds shows as 19 points instead of 19.8, unfair to teams
**Why it happens:** Formula `remaining / 5` gives fractional points, needs clear rounding rule
**How to avoid:** Decide rounding strategy up front: floor (always round down), ceil (always round up), or round (nearest). Document in code.
**Warning signs:** Teams dispute score conversion, operator confused about preview calculation

**Recommendation:** Use `Math.floor(remaining / 5)` for conservative "completed 5-second blocks" logic. 24s = 4 points (not 5), 25s = 5 points.

### Pitfall 7: Chess Clock Switching Race Conditions
**What goes wrong:** Both timers tick simultaneously for 1 second after turn change, or both pause
**Why it happens:** State update and interval restart not atomic, brief window where old interval still runs or new one hasn't started
**How to avoid:** Single state field `activeTimer: 'right' | 'left' | null`, single useEffect watches this field and starts/stops interval atomically
**Warning signs:** Occasional duplicate ticks in logs, time deductions happen on wrong team

**Example:**
```typescript
// BAD: Separate state, race condition
const [rightRunning, setRightRunning] = useState(false)
const [leftRunning, setLeftRunning] = useState(false)
// Can have both true or both false briefly during transition

// GOOD: Single source of truth
const [activeTimer, setActiveTimer] = useState<'right' | 'left' | null>(null)
// Only one can be active, atomic transition
```

## Code Examples

Verified patterns from official sources:

### Complete Drift-Corrected Countdown Hook
```typescript
// Combining patterns from research
import { setInterval, clearInterval } from 'worker-timers'
import { useEffect, useState } from 'react'

function useCountdown(
  durationSeconds: number,
  onComplete: () => void,
  onTick?: (remaining: number) => void
) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    const startTime = performance.now()
    const durationMs = durationSeconds * 1000
    let expectedTime = startTime + 1000

    const intervalId = setInterval(() => {
      const elapsed = performance.now() - startTime
      const newRemaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))

      setRemaining(newRemaining)
      onTick?.(newRemaining)

      if (newRemaining === 0) {
        clearInterval(intervalId)
        setIsRunning(false)
        onComplete()
      }

      expectedTime += 1000
    }, 1000)

    return () => clearInterval(intervalId)
  }, [isRunning, durationSeconds, onComplete, onTick])

  const start = () => setIsRunning(true)
  const pause = () => setIsRunning(false)
  const reset = () => {
    setIsRunning(false)
    setRemaining(durationSeconds)
  }

  return { remaining, isRunning, start, pause, reset }
}
```

### Chess Clock Hook
```typescript
import { setInterval, clearInterval } from 'worker-timers'
import { useEffect } from 'react'
import { useTimerStore } from '@/state/timerStore'

function useChessClock() {
  const { activeTimer, rightTimeMs, leftTimeMs } = useTimerStore()

  useEffect(() => {
    if (activeTimer === null) return

    const intervalId = setInterval(() => {
      useTimerStore.setState((state) => {
        const field = state.activeTimer === 'right' ? 'rightTimeMs' : 'leftTimeMs'
        const newTime = state[field] - 1000

        if (newTime <= 0) {
          // Timer expired
          return { [field]: 0, activeTimer: null }
        }

        return { [field]: newTime }
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [activeTimer])

  const switchTimer = () => {
    useTimerStore.setState((state) => ({
      activeTimer: state.activeTimer === 'right' ? 'left' : 'right'
    }))
  }

  return { switchTimer }
}
```

### Audio Cue Manager
```typescript
import { useEffect, useRef, useCallback } from 'react'

function useTimerAudio() {
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({})

  useEffect(() => {
    // Preload audio files
    [10, 5, 0].forEach((threshold) => {
      const audio = new Audio(`/sounds/beep-${threshold}s.mp3`)
      audio.preload = 'metadata'
      audio.load()
      audioRefs.current[threshold] = audio
    })
  }, [])

  const playBeep = useCallback((threshold: 10 | 5 | 0) => {
    const audio = audioRefs.current[threshold]
    if (!audio) return

    // Reset to start in case it's already been played
    audio.currentTime = 0

    audio.play().catch((err) => {
      console.warn(`Audio play blocked for ${threshold}s beep:`, err)
    })
  }, [])

  return { playBeep }
}
```

### Letter Key Display Hook
```typescript
// Extends existing useScoreControls pattern
import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore } from '@/state/timerStore'

function useLetterDisplay() {
  // Register A-Z keys
  useHotkeys(
    'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z',
    (e) => {
      const letter = e.key.toUpperCase()
      useTimerStore.getState().setRequiredLetter(letter)
      // BroadcastChannel middleware syncs to audience window
    },
    {
      enableOnFormTags: false,
      preventDefault: true
    },
    []
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom Web Worker timer | worker-timers package | ~2020 | Simpler integration, better bundler support, actively maintained |
| Web Audio API for all sounds | HTML5 Audio for simple playback | Ongoing | Lower complexity for basic use cases, Web Audio API for synthesis/effects |
| Date.now() for timing | performance.now() | ~2012 (spec), widespread 2015+ | Immune to system clock changes, monotonic guarantee |
| Manual drift tracking | performance.now() + expected time | ~2016+ | Proven pattern, easier to understand than PID controllers |

**Deprecated/outdated:**
- **setTimeout/setInterval for background timers:** Replaced by worker-timers or custom Web Workers (since ~2020 when throttling policies tightened)
- **Audio() constructor with immediate play():** Must handle autoplay policies with .catch() (since ~2018 when Chrome/Safari enforced policies)

## Open Questions

1. **Audio file format preference**
   - What we know: MP3 and WAV both supported, MP3 smaller, WAV no licensing concerns
   - What's unclear: Which format provides lower latency on play() call?
   - Recommendation: Use WAV for beeps (small files, no compression delay), test latency on target browsers

2. **Pass mechanic timer interaction**
   - What we know: Pass sends verse to opponent with +1pt, timer continues running
   - What's unclear: Does timer pause during pass animation? Does receiving team's timer start immediately or after operator confirmation?
   - Recommendation: Keep timer running continuously (no pause), operator confirms with keyboard shortcut (extends existing useScoreControls pattern)

3. **Points conversion display timing**
   - What we know: 5s = 1pt preview shown during countdown
   - What's unclear: Update preview every second, or only at 5s intervals?
   - Recommendation: Update every second for transparency (shows points decreasing in real-time as time runs out)

4. **Temporal (undo) interaction with timer state**
   - What we know: Temporal partialization tracks score-related fields only
   - What's unclear: Should timer state (remaining time, isRunning) be included in temporal tracking or excluded?
   - Recommendation: EXCLUDE timer state from temporal tracking (undo should not rewind the clock, only scores)

## Sources

### Primary (HIGH confidence)
- [worker-timers npm package](https://www.npmjs.com/package/worker-timers) - API documentation, version info
- [MDN Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) - Web Worker fundamentals
- [MDN performance.now()](https://developer.mozilla.org/en-US/docs/Web/API/Performance/now) - Timing API specification
- [MDN HTMLAudioElement](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio) - Audio element usage
- [Vite Web Workers](https://vite.dev/guide/features) - Worker import syntax
- [react-hotkeys-hook documentation](https://react-hotkeys-hook.vercel.app/) - Keyboard event handling (already verified in project)

### Secondary (MEDIUM confidence)
- [HackWild - Web Worker Timers](https://hackwild.com/article/web-worker-timers/) - Timer accuracy patterns
- [SitePoint - Creating Accurate Timers](https://www.sitepoint.com/creating-accurate-timers-in-javascript/) - Drift correction algorithms
- [FreeCodeCamp - Chess Clock Tutorial](https://www.freecodecamp.org/news/how-to-build-a-chess-clock-with-javascript-and-setinterval/) - Chess clock implementation
- [LogRocket - Web Workers React TypeScript](https://blog.logrocket.com/web-workers-react-typescript/) - React integration patterns
- [Chrome Developers - Tab Throttling](https://blog.chromium.org/2020/11/tab-throttling-and-more-performance.html) - Browser throttling policies
- [Pontis Technology - setInterval Throttling](https://pontistechnology.com/learn-why-setinterval-javascript-breaks-when-throttled/) - Throttling behavior explained

### Tertiary (LOW confidence)
- [react-timer-hook GitHub](https://github.com/amrlabib/react-timer-hook) - Optional library examples (not verified for accuracy)
- [Chess clock GitHub implementations](https://github.com/topics/chess-clock) - Various community examples (quality varies)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - worker-timers well-documented, 246k weekly downloads, performance.now() is standard Web API
- Architecture: HIGH - Patterns verified from MDN, SitePoint, and working implementations
- Pitfalls: HIGH - Browser throttling documented by Chrome/Mozilla, drift issues proven in multiple sources

**Research date:** 2026-02-14
**Valid until:** ~2026-04-14 (60 days - stable domain, timing APIs unlikely to change)
