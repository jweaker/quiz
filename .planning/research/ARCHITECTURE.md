# Architecture Research: Dual-Screen Live TV Quiz Show

**Domain:** Live TV quiz show application
**Researched:** 2026-02-08
**Confidence:** MEDIUM-HIGH

## Recommended Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WINDOW LAYER                                 │
├──────────────────────────────┬──────────────────────────────────────┤
│   Operator Window            │   Audience Display Window            │
│   (MacBook Internal)         │   (External Display)                 │
│                              │                                      │
│  ┌────────────────────┐      │  ┌────────────────────────────┐     │
│  │ Operator Controls  │      │  │ Audience View              │     │
│  │ - Keyboard input   │      │  │ - Full-screen presentation │     │
│  │ - Score controls   │      │  │ - Animations               │     │
│  │ - Timer controls   │      │  │ - Safe area compliance     │     │
│  │ - Section picker   │      │  │ - RTL layout               │     │
│  └────────────────────┘      │  └────────────────────────────┘     │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│                    STATE SYNCHRONIZATION LAYER                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Broadcast Channel API  OR  localStorage + storage event     │   │
│  │  (Primary)                  (Fallback)                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                      APPLICATION STATE LAYER                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐     │
│  │ Game      │  │ Timer     │  │ Audio     │  │ Episode      │     │
│  │ State     │  │ State     │  │ Manager   │  │ Data         │     │
│  └───────────┘  └───────────┘  └───────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────────────┤
│                         CORE DOMAIN LAYER                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Episode Model • Section Logic • Timer Logic • Audio Logic   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Window Manager | Opens/closes display window, establishes communication channel | React hook managing window.open() reference |
| State Sync Service | Synchronizes state between windows using Broadcast Channel API | Custom hook wrapping BroadcastChannel with fallback to localStorage |
| Game State Manager | Manages scores, turns, section state, current question | Zustand store (no Provider needed for multi-window) |
| Timer Engine | Chess clock logic, countdown timers, interval management | Custom hook with useRef for interval IDs, cleanup in useEffect |
| Audio Manager | Sound effects, background music, audio queuing | Singleton wrapping Web Audio API AudioContext |
| Episode Data Store | Loads/parses JSON episodes, tracks completion state | Zustand store with persistence middleware |
| Operator UI | Keyboard handlers, control interface, status display | React components with global event listeners |
| Audience UI | Full-screen presentation, animations, safe area layout | React components with Motion (Framer Motion) animations |

### Window Communication Pattern

**Primary: Broadcast Channel API** (MEDIUM-HIGH confidence)
- Native browser API for same-origin cross-window communication
- Better performance than localStorage polling
- Automatic message delivery to all subscribed contexts
- No need to track window references

**Fallback: localStorage + storage event** (HIGH confidence)
- For browsers without Broadcast Channel support
- storage event fires automatically in other tabs/windows (not same tab)
- 5MB limit (sufficient for quiz state)
- Synchronous writes may cause UI blocking with large data

**Anti-pattern: window.postMessage** (MEDIUM confidence)
- Requires maintaining window references (window.opener, window.open return value)
- More complex error handling for closed windows
- Better for iframe communication, not peer windows

## Recommended Project Structure

```
src/
├── windows/                 # Window management
│   ├── useWindowManager.js  # Hook to open/close display window
│   └── WindowRouter.js      # Routes for operator vs audience views
├── state/                   # State management
│   ├── sync/                # Cross-window synchronization
│   │   ├── useBroadcastSync.js   # Broadcast Channel hook
│   │   └── useStorageSync.js     # localStorage fallback
│   ├── stores/              # Zustand stores
│   │   ├── gameStore.js     # Scores, turns, section state
│   │   ├── timerStore.js    # Timer state
│   │   └── episodeStore.js  # Episode data, completion tracking
│   └── index.js             # Store exports
├── domain/                  # Core business logic
│   ├── episode/             # Episode data model
│   │   ├── episodeSchema.js # JSON schema definition
│   │   ├── episodeLoader.js # Load/validate episodes
│   │   └── sectionTypes.js  # Section type definitions
│   ├── timers/              # Timer logic
│   │   ├── useChessClock.js # Chess clock implementation
│   │   └── useCountdown.js  # Countdown timer
│   └── scoring/             # Scoring rules
│       └── scoringRules.js  # Score calculation logic
├── services/                # Infrastructure services
│   ├── audio/               # Audio management
│   │   ├── AudioManager.js  # Web Audio API singleton
│   │   └── useAudio.js      # React hook wrapper
│   └── keyboard/            # Keyboard handling
│       └── useGlobalKeys.js # Global keyboard event handler
├── components/              # Shared components
│   ├── operator/            # Operator-specific UI
│   │   ├── OperatorPanel.js
│   │   ├── ScoreControl.js
│   │   └── SectionPicker.js
│   ├── audience/            # Audience-specific UI
│   │   ├── AudienceView.js
│   │   ├── SafeArea.js      # Safe area wrapper
│   │   └── QuestionDisplay.js
│   └── shared/              # Shared between both windows
│       ├── Score.js
│       ├── Timer.js
│       └── IconButton.js
├── animations/              # Animation definitions
│   ├── transitions.js       # Motion variants
│   └── useAnimationState.js # Animation state machine
├── config/                  # Configuration
│   ├── data/                # Episode JSON files
│   │   └── episode1.json
│   ├── viewport.js          # Safe area configuration
│   └── audio.js             # Audio file paths
└── App.js                   # Root component with window detection
```

### Structure Rationale

- **windows/**: Separates dual-window concerns from application logic. Window manager hook encapsulates window.open() complexity and reference tracking.
- **state/sync/**: Cross-window synchronization is a distinct concern. Isolating it allows swapping implementations (Broadcast Channel vs localStorage) without touching business logic.
- **state/stores/**: Zustand stores don't require Providers, making them ideal for multi-window apps where React roots are separate. Each store manages a single domain concern.
- **domain/**: Pure business logic without React dependencies. Episode model, timer logic, scoring rules can be tested independently.
- **services/**: Infrastructure concerns (audio, keyboard) wrapped in singleton or hook patterns for consistent access across components.
- **components/operator/ vs audience/**: Physical separation mirrors logical separation—operator sees controls, audience sees presentation.

## Architectural Patterns

### Pattern 1: Window Manager with Singleton Communication Channel

**What:** Single window manager hook creates display window and establishes Broadcast Channel, shared across app via singleton or context.

**When to use:** When operator window controls display window lifecycle and both need bidirectional communication.

**Trade-offs:**
- Pros: Centralized window lifecycle management, automatic cleanup on unmount
- Cons: Display window closes if operator window closes (acceptable for controlled environment)

**Example:**
```javascript
// windows/useWindowManager.js
import { useEffect, useRef } from 'react';
import { useBroadcastSync } from '../state/sync/useBroadcastSync';

export function useWindowManager() {
  const displayWindowRef = useRef(null);
  const { send, subscribe } = useBroadcastSync('quiz-show');

  const openDisplay = () => {
    if (!displayWindowRef.current || displayWindowRef.current.closed) {
      displayWindowRef.current = window.open(
        '/audience',
        'audience-display',
        'fullscreen=yes,location=no,menubar=no'
      );
    }
  };

  const closeDisplay = () => {
    if (displayWindowRef.current && !displayWindowRef.current.closed) {
      displayWindowRef.current.close();
    }
  };

  useEffect(() => {
    return () => closeDisplay();
  }, []);

  return { openDisplay, closeDisplay, send, subscribe };
}
```

### Pattern 2: Broadcast Channel with Zustand Integration

**What:** Zustand stores automatically sync via Broadcast Channel middleware. Each window maintains own React app but shares state.

**When to use:** For all shared state (scores, timers, section progress) that must stay synchronized.

**Trade-offs:**
- Pros: Automatic synchronization, no manual message passing, works without Provider
- Cons: Race conditions possible with rapid updates, requires conflict resolution strategy

**Example:**
```javascript
// state/sync/useBroadcastSync.js
import { useEffect, useRef } from 'react';

export function useBroadcastSync(channelName) {
  const channelRef = useRef(null);

  useEffect(() => {
    // Broadcast Channel API check
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(channelName);
    } else {
      // Fallback to localStorage + storage event
      console.warn('BroadcastChannel not supported, using localStorage');
    }

    return () => {
      channelRef.current?.close();
    };
  }, [channelName]);

  const send = (message) => {
    if (channelRef.current) {
      channelRef.current.postMessage(message);
    } else {
      // localStorage fallback
      localStorage.setItem(channelName, JSON.stringify(message));
    }
  };

  const subscribe = (handler) => {
    if (channelRef.current) {
      channelRef.current.onmessage = (event) => handler(event.data);
      return () => { channelRef.current.onmessage = null; };
    } else {
      // storage event fallback
      const storageHandler = (e) => {
        if (e.key === channelName && e.newValue) {
          handler(JSON.parse(e.newValue));
        }
      };
      window.addEventListener('storage', storageHandler);
      return () => window.removeEventListener('storage', storageHandler);
    }
  };

  return { send, subscribe };
}

// state/stores/gameStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const broadcastMiddleware = (config) => (set, get, api) => {
  const channel = new BroadcastChannel('game-state');

  channel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE') {
      set(event.data.state, true); // true = replace state
    }
  };

  const setState = (partial, replace) => {
    set(partial, replace);
    channel.postMessage({ type: 'STATE_UPDATE', state: get() });
  };

  return config(setState, get, api);
};

export const useGameStore = create(
  broadcastMiddleware(
    persist(
      (set) => ({
        rightScore: 0,
        leftScore: 0,
        rightsTurn: false,
        currentSection: null,
        incrementRight: () => set((state) => ({ rightScore: state.rightScore + 1 })),
        incrementLeft: () => set((state) => ({ leftScore: state.leftScore + 1 })),
        toggleTurn: () => set((state) => ({ rightsTurn: !state.rightsTurn })),
      }),
      { name: 'game-state' }
    )
  )
);
```

### Pattern 3: Chess Clock with useRef for Interval Management

**What:** Timer state in Zustand, but setInterval ID stored in useRef to avoid re-renders and ensure cleanup.

**When to use:** For any timer that needs precise control (pause, resume, switch) without losing interval reference.

**Trade-offs:**
- Pros: Ref prevents interval loss on re-renders, cleanup guaranteed in useEffect
- Cons: More complex than simple setTimeout, requires understanding of ref lifecycle

**Example:**
```javascript
// domain/timers/useChessClock.js
import { useEffect, useRef } from 'react';
import { useTimerStore } from '../../state/stores/timerStore';

export function useChessClock() {
  const intervalRef = useRef(null);
  const { rightTime, leftTime, activePlayer, decrementTime, pauseClock } = useTimerStore();

  useEffect(() => {
    if (activePlayer) {
      intervalRef.current = setInterval(() => {
        decrementTime(activePlayer);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activePlayer, decrementTime]);

  const switchPlayer = () => {
    pauseClock();
    // Timer store handles switching activePlayer
  };

  return { rightTime, leftTime, activePlayer, switchPlayer };
}
```

### Pattern 4: Audio Manager Singleton with Web Audio API

**What:** Single AudioContext instance (browser limitation) wrapped in singleton, exposed via React hook.

**When to use:** For all audio playback (SFX, background music). AudioContext must be created after user interaction.

**Trade-offs:**
- Pros: Follows Web Audio API best practices, prevents multiple AudioContext instances
- Cons: Singleton pattern less "React-like", but necessary for Web Audio

**Example:**
```javascript
// services/audio/AudioManager.js
class AudioManager {
  constructor() {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }
    this.context = null;
    this.buffers = new Map();
    AudioManager.instance = this;
  }

  async init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.context.state === 'running' || this.context.resume();
  }

  async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.buffers.set(name, audioBuffer);
  }

  play(name, options = {}) {
    const buffer = this.buffers.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume ?? 1.0;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
  }
}

export const audioManager = new AudioManager();

// services/audio/useAudio.js
import { useEffect } from 'react';
import { audioManager } from './AudioManager';

export function useAudio() {
  useEffect(() => {
    // AudioContext must be initialized after user gesture
    const initAudio = () => {
      audioManager.init();
      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);

    return () => document.removeEventListener('click', initAudio);
  }, []);

  return {
    play: (name, options) => audioManager.play(name, options),
    load: (name, url) => audioManager.loadSound(name, url),
  };
}
```

### Pattern 5: Global Keyboard Handler with Priority Stack

**What:** App-level keyboard event listener with handlers registered by components. Exclusive handlers (modal, overlay) take priority.

**When to use:** For operator controls that need keyboard shortcuts (s = switch turn, c = hide cursor).

**Trade-offs:**
- Pros: Centralized keyboard logic, prevents event handler conflicts, supports modal exclusivity
- Cons: More complex than per-component listeners, requires handler registration pattern

**Example:**
```javascript
// services/keyboard/useGlobalKeys.js
import { useEffect } from 'react';

const handlerStack = [];

export function useGlobalKeys(handlers, options = {}) {
  useEffect(() => {
    const handlerObj = { handlers, exclusive: options.exclusive || false };

    if (options.exclusive) {
      handlerStack.unshift(handlerObj); // Add to front for priority
    } else {
      handlerStack.push(handlerObj);
    }

    return () => {
      const index = handlerStack.indexOf(handlerObj);
      if (index > -1) handlerStack.splice(index, 1);
    };
  }, [handlers, options.exclusive]);
}

// App.js global listener
useEffect(() => {
  const handleKeyDown = (e) => {
    // Find first exclusive handler or use all non-exclusive
    const exclusiveHandler = handlerStack.find(h => h.exclusive);
    const activeHandlers = exclusiveHandler ? [exclusiveHandler] : handlerStack;

    for (const { handlers } of activeHandlers) {
      if (handlers[e.key]) {
        handlers[e.key](e);
        break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Pattern 6: Episode Data with JSON Schema Validation

**What:** Episode JSON files validated against schema on load, with completion state tracked separately in persisted store.

**When to use:** For static episode data that doesn't change during runtime but needs progress tracking.

**Trade-offs:**
- Pros: Simple data format (JSON), easy to author new episodes, version-controllable
- Cons: No dynamic content, must reload app for new episodes, limited to JSON-serializable data

**Example:**
```javascript
// domain/episode/episodeSchema.js
export const episodeSchema = {
  type: 'object',
  required: ['id', 'title', 'parts'],
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    parts: {
      type: 'object',
      properties: {
        windows: { type: 'object' },
        quick: { type: 'array' },
        debate: { type: 'array' },
        // ... other section types
      }
    }
  }
};

// domain/episode/episodeLoader.js
import episodeData from '../../config/data/episode1.json';

export function loadEpisode(id) {
  // In production, validate against schema
  // For now, just return data
  return episodeData;
}

// state/stores/episodeStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loadEpisode } from '../../domain/episode/episodeLoader';

export const useEpisodeStore = create(
  persist(
    (set, get) => ({
      episodeData: null,
      completionState: {},
      loadEpisode: (id) => {
        const data = loadEpisode(id);
        set({ episodeData: data });
      },
      markComplete: (sectionPath) => {
        set((state) => ({
          completionState: {
            ...state.completionState,
            [sectionPath]: true
          }
        }));
      },
      isComplete: (sectionPath) => get().completionState[sectionPath] || false,
    }),
    { name: 'episode-state' }
  )
);
```

### Pattern 7: Safe Area with CSS env() Variables

**What:** Use CSS environment variables (safe-area-inset-*) to respect display safe areas, especially for TV displays with overscan.

**When to use:** For audience display that may appear on TV screens with non-rectangular safe areas.

**Trade-offs:**
- Pros: Native browser support, works with fullscreen API, respects device notches/bezels
- Cons: Requires viewport-fit=cover meta tag, manual padding application

**Example:**
```javascript
// components/audience/SafeArea.js
import './SafeArea.css';

export function SafeArea({ children }) {
  return (
    <div className="safe-area">
      {children}
    </div>
  );
}

// SafeArea.css
.safe-area {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  /* Fallbacks for browsers without safe-area support */
  padding-top: max(env(safe-area-inset-top), 20px);
  padding-right: max(env(safe-area-inset-right), 20px);
  padding-bottom: max(env(safe-area-inset-bottom), 20px);
  padding-left: max(env(safe-area-inset-left), 20px);
}

// public/index.html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Sharing State via Context Across Windows

**What people do:** Wrap both windows in same Context Provider, expecting state to sync automatically.

**Why it's wrong:** Each window has separate React root with separate virtual DOM. Context doesn't cross window boundaries.

**Do this instead:** Use Broadcast Channel API or localStorage + storage event for cross-window state. Use Zustand stores that don't require Providers.

### Anti-Pattern 2: Using setInterval Without Cleanup or Ref

**What people do:**
```javascript
const [time, setTime] = useState(60);
setInterval(() => setTime(t => t - 1), 1000); // Creates new interval on every render
```

**Why it's wrong:** Creates multiple intervals on re-renders, causing timer to speed up. No cleanup causes memory leaks.

**Do this instead:** Store interval ID in useRef, clear in useEffect cleanup:
```javascript
const intervalRef = useRef(null);
useEffect(() => {
  intervalRef.current = setInterval(() => setTime(t => t - 1), 1000);
  return () => clearInterval(intervalRef.current);
}, []);
```

### Anti-Pattern 3: Creating Multiple AudioContext Instances

**What people do:** Create new AudioContext in each component that needs audio.

**Why it's wrong:** Browsers limit AudioContext instances (typically 6). Multiple contexts cause playback failures and warnings.

**Do this instead:** Use singleton AudioManager pattern (see Pattern 4 above).

### Anti-Pattern 4: Polling localStorage for State Changes

**What people do:**
```javascript
setInterval(() => {
  const newState = JSON.parse(localStorage.getItem('state'));
  setState(newState);
}, 100); // Poll every 100ms
```

**Why it's wrong:** Wastes CPU cycles, 100ms-10s latency, doesn't detect changes immediately.

**Do this instead:** Use storage event listener which fires immediately when localStorage changes in another window:
```javascript
window.addEventListener('storage', (e) => {
  if (e.key === 'state') setState(JSON.parse(e.newValue));
});
```

### Anti-Pattern 5: Deep Nesting Keyboard Event Handlers

**What people do:** Attach keydown listeners in every component that needs keyboard input.

**Why it's wrong:** Event handlers compete, unclear precedence, difficult to prevent conflicts (e.g., modal vs global shortcuts).

**Do this instead:** Single global keyboard handler with priority stack (see Pattern 5 above).

### Anti-Pattern 6: Mutating Episode Data Directly

**What people do:** Mark sections as complete by mutating the imported JSON:
```javascript
import data from './data.json';
data.parts.windows.religion[0].done = true; // Mutation!
```

**Why it's wrong:** Mutations don't trigger re-renders, changes lost on refresh, hard to track state changes.

**Do this instead:** Store completion state separately in Zustand with persistence:
```javascript
const markComplete = (path) => {
  set(state => ({ completionState: { ...state.completionState, [path]: true }}));
};
```

### Anti-Pattern 7: Inline Animation Variants

**What people do:** Define Motion variants inline in component JSX, causing new object identity on each render:
```jsx
<motion.div variants={{visible: {opacity: 1}, hidden: {opacity: 0}}}>
```

**Why it's wrong:** Animations restart on every re-render due to new variant object identity.

**Do this instead:** Define variants outside component or in separate file:
```javascript
const variants = { visible: {opacity: 1}, hidden: {opacity: 0} };
<motion.div variants={variants}>
```

## Data Flow

### Primary Flow: Operator Action → State Update → Audience Display

```
[Operator Keyboard Press]
         ↓
[useGlobalKeys handler] → [Zustand Store Action]
         ↓                        ↓
[Local State Update]    [Broadcast Channel Message]
         ↓                        ↓
[Operator UI Re-render] [Audience Window Receives Message]
                                 ↓
                        [Zustand Store Update in Audience Window]
                                 ↓
                        [Audience UI Re-render with Animation]
```

### Timer Flow: Dual-Clock Updates

```
[useChessClock Hook]
         ↓
[setInterval (1000ms)]
         ↓
[Timer Store decrementTime Action]
         ↓
    ┌────┴────┐
    ↓         ↓
[Local Update] [Broadcast Channel Message]
    ↓              ↓
[Operator Timer Display] [Audience Timer Display]
```

### Audio Flow: Trigger → Load → Play

```
[Component: play('tick')]
         ↓
[useAudio Hook]
         ↓
[AudioManager.play()]
         ↓
[AudioContext.createBufferSource()] → [Connect to GainNode] → [Connect to Destination]
         ↓
[source.start()]
         ↓
[Audio Playback in Both Windows (if triggered in both)]
```

### Episode Load Flow

```
[App Mount]
     ↓
[Episode Store: loadEpisode(id)]
     ↓
[episodeLoader.loadEpisode()]
     ↓
[Parse JSON, Validate Schema]
     ↓
[Store Episode Data]
     ↓
[Components Read Episode Data via useEpisodeStore()]
```

### Key Data Flow Principles

1. **Unidirectional Flow:** Operator actions → State updates → UI updates (never UI mutates state directly)
2. **State Synchronization:** All shared state changes broadcast to other window automatically via middleware
3. **Local-First Updates:** Store updates locally immediately, then broadcasts (optimistic UI)
4. **Separation of Read/Write:** Episode data is read-only, completion state is write-only concern
5. **Timer Independence:** Each window can render timers, but only one decrements (controlled by store)

## Window Lifecycle Management

### Opening Display Window

```javascript
// Operator Window
const { openDisplay } = useWindowManager();

// User clicks "Open Display"
openDisplay(); // → window.open('/audience', ..., 'fullscreen=yes')
                // → Broadcast Channel established
                // → Current game state sent to new window
```

### Detecting Window Type

```javascript
// App.js
function App() {
  const isAudienceWindow = window.location.pathname.startsWith('/audience');
  const isOperatorWindow = !isAudienceWindow;

  return isOperatorWindow ? <OperatorApp /> : <AudienceApp />;
}
```

### Handling Display Window Close

```javascript
// Operator detects display closed
useEffect(() => {
  const checkDisplayAlive = setInterval(() => {
    if (displayWindowRef.current?.closed) {
      // Display closed, update UI to show "Display Disconnected"
      setDisplayStatus('disconnected');
    }
  }, 1000);

  return () => clearInterval(checkDisplayAlive);
}, []);
```

## Build Order Dependencies

Based on component dependencies, suggested build order:

### Phase 1: Foundation (No Dependencies)
1. **Broadcast Channel Sync Hook** — Core cross-window communication
2. **Episode Data Model** — Data structure definitions
3. **Safe Area Component** — CSS wrapper for TV displays

### Phase 2: State Layer (Depends on Phase 1)
4. **Game State Store** — Zustand + broadcast middleware
5. **Episode Store** — Load/track episode data
6. **Timer Store** — Timer state management

### Phase 3: Domain Logic (Depends on Phase 2)
7. **Timer Hooks** (useChessClock, useCountdown) — Timer logic
8. **Audio Manager** — Singleton audio service
9. **Keyboard Service** — Global keyboard handler

### Phase 4: Window Management (Depends on Phase 1, 2)
10. **Window Manager Hook** — Open/close display window
11. **Window Router** — Route operator vs audience views

### Phase 5: UI Components (Depends on Phase 2, 3, 4)
12. **Shared Components** (Score, Timer, IconButton) — Used by both windows
13. **Operator Components** — Control panel UI
14. **Audience Components** — Presentation UI with animations

### Phase 6: Integration (Depends on All)
15. **App Router** — Integrate operator and audience apps
16. **Episode Loading Flow** — Load episode on app start
17. **Animation System** — Motion variants and transitions

**Critical Path:** Broadcast Channel → Stores → Window Manager → Components
**Parallelizable:** Audio Manager, Keyboard Service, Safe Area Component (no interdependencies)

## Scalability Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 episode, 2 contestants | Current architecture sufficient. Client-side only, no backend needed. |
| 10+ episodes, remote audience | Add backend for episode CDN delivery, analytics. State still client-side. |
| Multi-show, multi-operator | Add WebSocket server for real-time sync across operators. Broadcast Channel insufficient for cross-network. |

### Scaling Priorities

1. **First bottleneck:** localStorage 5MB limit with many episodes
   - **Solution:** Move episodes to CDN, fetch on-demand, cache in IndexedDB

2. **Second bottleneck:** Timer drift over long shows (30+ minutes)
   - **Solution:** Use performance.now() timestamps instead of setInterval counter, sync with server time periodically

3. **Third bottleneck:** Broadcast Channel message queue with rapid updates (e.g., sub-second timer ticks)
   - **Solution:** Debounce non-critical state updates, batch messages, or use SharedArrayBuffer for high-frequency data

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Episode CDN | Fetch API on app load | Future enhancement for remote episode loading |
| Analytics | Window-level tracking | Only operator window sends analytics to avoid double-counting |
| Remote Control | WebSocket connection | Future enhancement for mobile remote control |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Operator ↔ Audience | Broadcast Channel API | Primary sync mechanism |
| Store ↔ Components | Zustand hooks | Automatic re-render on state change |
| Audio Manager ↔ Components | useAudio hook | Singleton ensures single AudioContext |
| Timer ↔ Store | Direct store actions | Timer hook reads/writes timer store |
| Keyboard ↔ App | Global event listener | Top-level listener, handler registration pattern |

## RTL (Right-to-Left) Considerations

**Arabic Language Support:**
- Set `dir="rtl"` on `<html>` or root `<div>`
- Use logical CSS properties: `margin-inline-start` instead of `margin-left`
- Flexbox automatically reverses with `dir="rtl"`
- Test animations for direction-awareness (Motion respects CSS direction)

**Example:**
```css
.score-display {
  /* Use logical properties for RTL support */
  margin-inline-start: 20px; /* Auto-adjusts for RTL */
  padding-inline-end: 10px;
}
```

## Sources

### Cross-Window Communication
- [Broadcast Channel API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) — HIGH confidence
- [How to Use Broadcast Channel API in React - DEV Community](https://dev.to/sachinchaurasiya/how-to-use-broadcast-channel-api-in-react-5eec) — MEDIUM confidence
- [Cross-Tab State Synchronization in React Using the Browser storage Event - Medium](https://medium.com/@vinaykumarbr07/cross-tab-state-synchronization-in-react-using-the-browser-storage-event-14b6f1a97ea6) — MEDIUM confidence
- [Share states across tabs and child windows in React Application - Medium](https://djimmy.medium.com/share-states-across-tabs-and-child-windows-in-react-application-1066cc752ce2) — MEDIUM confidence
- [Window: postMessage() method - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) — HIGH confidence

### State Management
- [Top 5 React State Management Tools Developers Actually Use in 2026 - Syncfusion](https://www.syncfusion.com/blogs/post/react-state-management-libraries) — MEDIUM confidence
- [Zustand - GitHub](https://github.com/pmndrs/zustand) — HIGH confidence
- [React State Management in 2025: Context API vs Zustand - DEV Community](https://dev.to/cristiansifuentes/react-state-management-in-2025-context-api-vs-zustand-385m) — MEDIUM confidence

### Timers and Game Logic
- [Using Timers in React Apps - Medium](https://medium.com/swlh/using-timers-in-react-apps-a5f8c93241bf) — MEDIUM confidence
- [How to Create a Countdown Timer with React Hooks - DigitalOcean](https://www.digitalocean.com/community/tutorials/react-countdown-timer-react-hooks) — MEDIUM confidence
- [GitHub - exrol/react-chess-clock](https://github.com/exrol/react-chess-clock) — LOW confidence (reference implementation)

### Audio Management
- [Web Audio API best practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — HIGH confidence
- [React and Web Audio](http://joesul.li/van/react-and-web-audio/) — MEDIUM confidence
- [Controlling Web Audio With React and Redux Middleware - DZone](https://dzone.com/articles/controlling-web-audio-with-react-and-redux-middlew) — MEDIUM confidence

### Keyboard Handling
- [Managing global DOM events in React with Hooks - DEV Community](https://dev.to/akumzy/managing-global-dom-events-in-react-with-hooks-3ckl) — MEDIUM confidence
- [GitHub - linsight/react-keyboard-event-handler](https://github.com/linsight/react-keyboard-event-handler) — LOW confidence (library reference)

### Animations
- [Motion - JavaScript & React animation library](https://motion.dev) — HIGH confidence
- [Creating React animations in Motion - LogRocket Blog](https://blog.logrocket.com/creating-react-animations-with-motion/) — MEDIUM confidence
- [Framer Motion React Animations - Refine](https://refine.dev/blog/framer-motion/) — MEDIUM confidence

### Safe Areas and Display
- [Safe areas - Expo Documentation](https://docs.expo.dev/develop/user-interface/safe-areas/) — MEDIUM confidence (React Native, concepts apply to web)
- [Understanding env() Safe Area Insets in CSS - Medium](https://medium.com/@developerr.ayush/understanding-env-safe-area-insets-in-css-from-basics-to-react-and-tailwind-a0b65811a8ab) — MEDIUM confidence

### Architecture Patterns
- [Container/Presentational Pattern - Patterns.dev](https://www.patterns.dev/react/presentational-container-pattern/) — HIGH confidence
- [React Architecture Patterns for Your Projects - OpenReplay](https://blog.openreplay.com/react-architecture-patterns-for-your-projects/) — MEDIUM confidence
- [Building Scalable React Applications - DEV Community](https://dev.to/drruvari/building-scalable-react-applications-design-patterns-and-architecture-39a0) — MEDIUM confidence

---
*Architecture research for: بشائر المعرفة (Live TV Quiz Show)*
*Researched: 2026-02-08*
*Overall confidence: MEDIUM-HIGH (HIGH for standard React patterns, MEDIUM for multi-window specifics)*
