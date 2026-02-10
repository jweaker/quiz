# Phase 2: Dual-Screen Architecture - Research

**Researched:** 2026-02-10
**Domain:** Cross-window communication, state synchronization, component library setup
**Confidence:** HIGH

## Summary

This phase implements a dual-screen architecture where an operator panel (laptop) controls an audience display (external monitor). The key technical challenges are: (1) cross-window state synchronization via BroadcastChannel API, (2) window lifecycle management with `window.open()`, (3) configurable safe area system for 4K broadcast output, and (4) component library integration for operator panel controls.

The research confirms BroadcastChannel API is well-supported and ideal for same-origin, same-browser communication. Zustand's `subscribe()` API provides the foundation for broadcasting state changes. shadcn/ui with Tailwind v4 is production-ready for Vite projects and provides the Resizable component needed for the confidence monitor.

**Primary recommendation:** Create a thin BroadcastChannel middleware layer that wraps Zustand's subscribe/setState to synchronize state between windows, using the existing persist middleware pattern as a model.

## Standard Stack

The established libraries/tools for this domain:

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | ^5.0.11 | State management | Already in use, has subscribe API for cross-window sync |
| tailwindcss | ^4.1.18 | Styling | Already configured with Vite plugin |
| react-router-dom | ^6.3.0 | Routing | Already in use, supports `/operator` and `/audience` routes |

### New Dependencies
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | latest | Component library | Integrates with existing Tailwind v4, provides Resizable, Button, Kbd, theme system |
| react-resizable-panels | ^4.6.2 | Resizable layouts | Powers shadcn/ui Resizable component, used for confidence monitor sizing |
| lucide-react | latest | Icons | shadcn/ui peer dependency, used for theme toggle and UI controls |

### Native APIs (No Install)
| API | Browser Support | Purpose | Notes |
|-----|-----------------|---------|-------|
| BroadcastChannel | 98%+ (all modern) | Cross-window messaging | Same-origin only, perfect for this use case |
| window.open() | Universal | Open audience window | Returns window reference for lifecycle tracking |
| localStorage | Universal | Persist safe area settings | Already used by Zustand persist |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BroadcastChannel | localStorage events | BroadcastChannel is cleaner, purpose-built; localStorage events fire on ALL tabs including sender |
| BroadcastChannel | SharedWorker | Overkill for simple state sync; more complex setup |
| shadcn/ui | Radix primitives directly | shadcn provides pre-built Tailwind integration; saves significant time |
| react-resizable-panels | CSS resize property | CSS resize lacks fine-grained control, callbacks, and keyboard support |

**Installation:**
```bash
# shadcn/ui initialization (handles dependencies automatically)
pnpm dlx shadcn@latest init

# Add required components
pnpm dlx shadcn@latest add button resizable kbd switch slider input label
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── OperatorRoot.tsx      # Operator-specific wrapper (theme, layout)
│   ├── AudienceRoot.tsx      # Audience-specific wrapper (fullscreen, safe area)
│   └── ...existing error boundaries
├── screens/
│   ├── operator/             # Operator panel screens
│   │   ├── OperatorPanel.tsx # Main operator view with confidence monitor
│   │   └── Settings.tsx      # Safe area configuration
│   └── audience/             # Audience display screens
│       └── AudienceDisplay.tsx
├── state/
│   ├── showStore.ts          # Existing show state (extend for audience state)
│   ├── operatorStore.ts      # Operator-only state (theme, panel sizes)
│   └── sync/
│       ├── broadcastMiddleware.ts  # BroadcastChannel Zustand middleware
│       └── windowManager.ts        # window.open() lifecycle management
├── components/
│   ├── ui/                   # shadcn/ui components (auto-generated)
│   └── operator/             # Operator-specific components
│       ├── ConfidenceMonitor.tsx
│       ├── WindowLauncher.tsx
│       └── DisconnectBanner.tsx
├── lib/
│   └── safeArea.ts           # Safe area calculation utilities
└── hooks/
    └── useBroadcastSync.ts   # Hook for components needing sync awareness
```

### Pattern 1: BroadcastChannel Zustand Middleware

**What:** Middleware that broadcasts state changes and applies incoming broadcasts to local store
**When to use:** For any store that needs cross-window synchronization

```typescript
// Source: Zustand docs pattern + BroadcastChannel API
import { StateCreator, StoreMutatorIdentifier } from 'zustand'

type BroadcastMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  options: { channelName: string }
) => StateCreator<T, Mps, Mcs>

const broadcast: BroadcastMiddleware = (f, { channelName }) => (set, get, store) => {
  const channel = new BroadcastChannel(channelName)
  
  // Listen for incoming state from other windows
  channel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE') {
      // Use store.setState to bypass our wrapper and avoid echo
      store.setState(event.data.state, true) // true = replace
    }
  }
  
  // Wrap set to broadcast changes
  const broadcastingSet: typeof set = (...args) => {
    set(...args)
    const state = get()
    channel.postMessage({ type: 'STATE_UPDATE', state })
  }
  
  return f(broadcastingSet, get, store)
}
```

### Pattern 2: Window Lifecycle Management

**What:** Track audience window state, detect disconnection, enable reconnection
**When to use:** Managing the operator→audience window relationship

```typescript
// Source: window.open() API + event listeners
interface WindowManager {
  audienceWindow: Window | null
  isConnected: boolean
  open: () => void
  close: () => void
}

function createWindowManager(): WindowManager {
  let audienceWindow: Window | null = null
  let checkInterval: number | null = null
  
  const open = () => {
    // Close existing if any
    if (audienceWindow && !audienceWindow.closed) {
      audienceWindow.close()
    }
    
    // Open new window - user positions manually
    audienceWindow = window.open('/audience', 'quiz-audience', 'popup')
    
    // Start polling for closed state (no reliable close event across windows)
    checkInterval = window.setInterval(() => {
      if (audienceWindow?.closed) {
        audienceWindow = null
        clearInterval(checkInterval!)
        // Trigger disconnect state update
      }
    }, 500)
  }
  
  return { /* ... */ }
}
```

### Pattern 3: Safe Area Configuration

**What:** Configurable margins (all four edges) that define where content can appear
**When to use:** Audience display layout, settings persistence

```typescript
// Safe area stored in operatorStore (persisted to localStorage)
interface SafeArea {
  top: number     // pixels or percentage
  right: number
  bottom: number
  left: number
  unit: 'px' | '%'
}

// Default: 15% bottom margin as mentioned in context
const defaultSafeArea: SafeArea = {
  top: 0,
  right: 0,
  bottom: 15,
  left: 0,
  unit: '%'
}

// Apply to audience container
const getContentStyle = (safeArea: SafeArea): React.CSSProperties => {
  const unit = safeArea.unit
  return {
    position: 'absolute',
    top: `${safeArea.top}${unit}`,
    right: `${safeArea.right}${unit}`,
    bottom: `${safeArea.bottom}${unit}`,
    left: `${safeArea.left}${unit}`,
  }
}
```

### Pattern 4: Confidence Monitor (Scaled Replica)

**What:** Live-scaled iframe or CSS-transformed replica of audience view
**When to use:** Operator panel preview of audience display

```typescript
// Approach: CSS transform scale within resizable panel
// Better than iframe because it shares React state directly

function ConfidenceMonitor() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  
  // Calculate scale to fit 4K (3840x2160) into container
  useEffect(() => {
    if (!containerRef.current) return
    const { width, height } = containerRef.current.getBoundingClientRect()
    const scaleX = width / 3840
    const scaleY = height / 2160
    setScale(Math.min(scaleX, scaleY))
  }, [/* resize observer */])
  
  return (
    <div ref={containerRef} className="overflow-hidden">
      <div style={{ 
        width: 3840, 
        height: 2160, 
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}>
        <AudienceDisplay /> {/* Same component, just scaled */}
      </div>
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Don't use localStorage for real-time sync:** `storage` events fire too slowly and include sender
- **Don't poll for state changes:** BroadcastChannel is event-driven, no polling needed
- **Don't duplicate state between stores:** Single source of truth (showStore) synced to both windows
- **Don't use iframe for confidence monitor:** Complicates state sharing; CSS transform is simpler
- **Don't auto-position audience window:** Browser security prevents programmatic positioning; manual is required

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Resizable panels | CSS resize or custom drag | react-resizable-panels (via shadcn) | Keyboard support, touch support, min/max constraints, persistence |
| Theme toggle | Custom localStorage + CSS | shadcn/ui ThemeProvider pattern | System preference detection, persistence, no FOUC |
| Button/controls | Custom styled buttons | shadcn/ui Button, Kbd, Switch | Accessibility, consistent styling, keyboard support |
| Cross-window messaging | Custom postMessage | BroadcastChannel | Purpose-built, cleaner API, no window references needed |

**Key insight:** The browser's BroadcastChannel API is specifically designed for same-origin cross-window communication. It's simpler than postMessage (no window references) and cleaner than localStorage events (no self-notification).

## Common Pitfalls

### Pitfall 1: State Echo/Loops
**What goes wrong:** Window A broadcasts state, Window B receives and re-broadcasts, infinite loop
**Why it happens:** Both windows use the same middleware pattern
**How to avoid:** 
- Include sender ID in messages, ignore own messages
- Or use `store.setState()` directly (bypasses wrapper) for incoming messages
**Warning signs:** Console shows rapid state updates, browser becomes unresponsive

### Pitfall 2: Window Reference Becomes Stale
**What goes wrong:** `audienceWindow.closed` check fails, window reference unusable
**Why it happens:** Browser garbage-collects closed window references unpredictably
**How to avoid:** Poll `window.closed` property rather than relying on events; set reference to null when closed detected
**Warning signs:** `Cannot read property 'closed' of null` errors

### Pitfall 3: BroadcastChannel Not Closing
**What goes wrong:** Old messages arrive after component unmount, memory leaks
**Why it happens:** BroadcastChannel not closed in cleanup
**How to avoid:** Call `channel.close()` in useEffect cleanup or store cleanup
**Warning signs:** State updates after navigating away from page

### Pitfall 4: Safe Area Calculation at Wrong Time
**What goes wrong:** Safe area percentages calculated against wrong container size
**Why it happens:** Calculation runs before layout completes or during resize
**How to avoid:** Use ResizeObserver, calculate in useLayoutEffect or after animation frame
**Warning signs:** Content jumps on load, incorrect margins

### Pitfall 5: Theme Flash (FOUC)
**What goes wrong:** Light theme flashes before dark theme applies
**Why it happens:** React hydrates before localStorage-persisted theme is read
**How to avoid:** Apply theme class to `<html>` in blocking script before React loads (shadcn pattern handles this)
**Warning signs:** Brief white flash on page load in dark mode

### Pitfall 6: Keyboard Shortcuts Conflict
**What goes wrong:** Window launch shortcut captured by browser or other handlers
**Why it happens:** Common shortcuts (Cmd+O, Cmd+N) are browser-reserved
**How to avoid:** Use uncommon modifiers (Cmd+Shift+A for audience) or function keys
**Warning signs:** Shortcut does nothing or triggers wrong action

## Code Examples

Verified patterns from official sources:

### BroadcastChannel Basic Usage
```typescript
// Source: MDN Web Docs - BroadcastChannel API
// Creating and using a channel
const channel = new BroadcastChannel('show-state')

// Sending a message (all other same-origin tabs/windows receive it)
channel.postMessage({ type: 'STATE_UPDATE', payload: { score: 100 } })

// Receiving messages
channel.onmessage = (event: MessageEvent) => {
  console.log('Received:', event.data)
}

// Cleanup (important!)
channel.close()
```

### Zustand Subscribe API
```typescript
// Source: Context7 - /pmndrs/zustand
// Subscribe to all state changes outside React
const unsubscribe = useShowStore.subscribe((state) => {
  console.log('State changed:', state)
})

// Subscribe with selector (requires subscribeWithSelector middleware)
import { subscribeWithSelector } from 'zustand/middleware'

const useStore = create(
  subscribeWithSelector((set) => ({
    score: 0,
    setScore: (score) => set({ score })
  }))
)

// Listen to specific state slice
const unsub = useStore.subscribe(
  (state) => state.score,
  (score, prevScore) => console.log('Score changed:', prevScore, '->', score)
)
```

### shadcn/ui Resizable Panels
```typescript
// Source: Context7 - /websites/ui_shadcn
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

function OperatorLayout() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-screen">
      <ResizablePanel defaultSize="70%" minSize="40%">
        {/* Main controls area */}
        <OperatorControls />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="30%" minSize="15%">
        {/* Confidence monitor - resizable by operator */}
        <ConfidenceMonitor />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
```

### shadcn/ui Theme Provider (Vite)
```typescript
// Source: Context7 - ui.shadcn.com/docs/dark-mode/vite
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

const ThemeProviderContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: "system", setTheme: () => null })

export function ThemeProvider({ children, defaultTheme = "system", storageKey = "ui-theme" }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }
    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{
      theme,
      setTheme: (theme) => {
        localStorage.setItem(storageKey, theme)
        setTheme(theme)
      }
    }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeProviderContext)
```

### Window Open with Lifecycle Tracking
```typescript
// Source: MDN Web Docs - window.open()
function useAudienceWindow() {
  const [isConnected, setIsConnected] = useState(false)
  const windowRef = useRef<Window | null>(null)

  const openAudience = useCallback(() => {
    // Close existing window if any
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.focus()
      return
    }

    // Open new window
    windowRef.current = window.open(
      '/audience',
      'quiz-audience',
      'popup,width=1920,height=1080'
    )
    setIsConnected(true)
  }, [])

  // Poll for window closed (beforeunload not reliable cross-window)
  useEffect(() => {
    const interval = setInterval(() => {
      if (windowRef.current?.closed) {
        windowRef.current = null
        setIsConnected(false)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return { isConnected, openAudience }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| localStorage events for cross-tab | BroadcastChannel API | 2022+ widespread support | Cleaner API, no self-notification, purpose-built |
| Custom CSS resize | react-resizable-panels v4 | Feb 2025 | Better accessibility, keyboard support, touch support |
| Class component + componentDidMount | useEffect + hooks | React 16.8 (2019) | Simpler lifecycle management for window tracking |
| Tailwind v3 + config file | Tailwind v4 + Vite plugin | 2024 | Already using v4; shadcn/ui compatible with empty config |

**Deprecated/outdated:**
- `window.postMessage()` for same-origin: Still works but BroadcastChannel is cleaner when both windows are same-origin
- Tailwind `tailwind.config.js` for v4: Leave empty in components.json per shadcn docs

## Open Questions

Things that couldn't be fully resolved:

1. **Confidence Monitor Rendering Strategy**
   - What we know: Can use CSS transform scaling or render same component
   - What's unclear: Performance impact of rendering AudienceDisplay twice (operator + confidence monitor)
   - Recommendation: Start with CSS transform scale of shared component; measure performance; optimize if needed

2. **Initial Sync on Audience Window Open**
   - What we know: BroadcastChannel doesn't replay missed messages
   - What's unclear: Best pattern for initial state hydration of new window
   - Recommendation: On audience mount, request current state via channel; operator responds with full state

3. **4K Aspect Ratio Maintenance**
   - What we know: Target is 3840x2160 (16:9)
   - What's unclear: How to handle operator positioning audience on non-16:9 displays
   - Recommendation: Audience display maintains 16:9 aspect ratio with letterboxing; CSS `aspect-ratio` property

## Sources

### Primary (HIGH confidence)
- `/pmndrs/zustand` (Context7) - persist middleware, subscribe API, setState
- `/websites/ui_shadcn` (Context7) - Tailwind v4 setup, dark mode, Resizable component
- `https://ui.shadcn.com/docs/installation/vite` - Vite + shadcn/ui installation
- `https://ui.shadcn.com/docs/dark-mode/vite` - Theme provider pattern
- `https://ui.shadcn.com/docs/components/radix/resizable` - Resizable component API

### Secondary (MEDIUM confidence)
- `https://github.com/bvaughn/react-resizable-panels` - react-resizable-panels v4 API
- BroadcastChannel API (MDN pattern, verified through browser compatibility tables)

### Tertiary (LOW confidence)
- None - all critical patterns verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via Context7 and official docs
- Architecture: HIGH - Patterns derived from official documentation
- Pitfalls: MEDIUM - Based on API constraints and common patterns; some require validation during implementation

**Research date:** 2026-02-10
**Valid until:** 2026-03-10 (30 days - stable technologies)
