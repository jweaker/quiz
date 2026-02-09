# Phase 1: Foundation & Migration - Research

**Researched:** 2026-02-09
**Domain:** Vite 7 + React 18 migration, TypeScript, Zustand, Tailwind CSS (RTL), Error Boundaries
**Confidence:** MEDIUM

## Summary

This research covers the migration of a small CRA React 18 app to Vite 7 with full TypeScript, replacing Context with Zustand (with persistent localStorage state), moving to Tailwind CSS (RTL + logical properties), and adding error boundaries with auto-retry and operator-only recovery controls. Sources are Vite 7 docs, React error boundary docs, Zustand persist middleware docs, and Tailwind docs for logical properties, RTL variants, and custom fonts.

The standard approach is: Vite 7 as the build tool with `index.html` at project root; TypeScript in strict mode with a few pragmatic options; Zustand v5 persist middleware to auto-hydrate from localStorage; Tailwind v4 utilities and logical properties (ps/pe/ms/me, text-start/end, border-s/e, etc.); and error boundaries using `react-error-boundary` to provide reset + retry and operator fallback paths.

**Primary recommendation:** Use Vite 7 + TypeScript strict mode, Zustand persist (localStorage), Tailwind logical utilities with `dir="rtl"`, and `react-error-boundary` for retryable boundaries while keeping audience UI frozen and operator UI informed.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | 7.x | Build/dev tooling for React | Official next-gen tool with fast dev server and modern config |
| React | 18.x | UI framework | Current app baseline, supports error boundaries |
| TypeScript | 5.9.x | Static typing | Current TypeScript release (Context7) with strict options |
| Zustand | 5.0.x | State management | Minimal API + persist middleware for localStorage |
| Tailwind CSS | 4.x | Utility-first styling | Logical properties, RTL/LTR variants, theme tokens |
| react-error-boundary | 4.x | Error boundary utilities | Reset/retry patterns and fallback rendering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vitejs/plugin-react | 4.x | React Fast Refresh + JSX | Standard Vite React plugin |
| @tailwindcss/vite | 4.x | Tailwind plugin for Vite | Required for Tailwind v4 with Vite |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Context | Redux Toolkit | Overkill for small app; Zustand simpler |
| CSS files | CSS Modules | More setup, less consistent RTL utilities |

**Installation:**
```bash
npm install react react-dom
npm install -D vite @vitejs/plugin-react typescript
npm install zustand react-error-boundary
npm install -D tailwindcss @tailwindcss/vite
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/                # App shell, routes, providers, boundaries
├── features/           # Feature screens (rounds, scoreboard, timer)
├── shared/             # Reusable UI components
├── state/              # Zustand stores and persistence
├── styles/             # Tailwind entry + font-face files
├── assets/             # Local images/audio imported via Vite
└── main.tsx            # Vite entry
```

### Pattern 1: Vite asset usage with `import` or `new URL`
**What:** Import assets as URLs or use `new URL` for module-relative assets.
**When to use:** Any local image/audio/video referenced in TS/JS.
**Example:**
```ts
// Source: https://github.com/vitejs/vite/blob/v7.0.0/docs/guide/assets.md
import imgUrl from './img.png'
document.getElementById('hero-img')!.setAttribute('src', imgUrl)

// Source: https://github.com/vitejs/vite/blob/v7.0.0/playground/css-lightningcss-root/root/index.html
const imageUrl: string = new URL('./assets/icon.svg', import.meta.url).href
```

### Pattern 2: Zustand store with persist middleware (localStorage)
**What:** Persist app state and auto-hydrate on reload.
**When to use:** Required for show recovery and refresh survival.
**Example:**
```ts
// Source: https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ShowState {
  scoreA: number
  scoreB: number
  reset: () => void
}

export const useShowStore = create<ShowState>()(
  persist(
    (set) => ({
      scoreA: 0,
      scoreB: 0,
      reset: () => set({ scoreA: 0, scoreB: 0 }),
    }),
    {
      name: 'show-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
```

### Pattern 3: Error boundaries with retry/reset
**What:** Wrap crash-prone UI with `ErrorBoundary` and provide reset hooks.
**When to use:** Audience view and operator panel recovery.
**Example:**
```tsx
// Source: https://context7.com/bvaughn/react-error-boundary/llms.txt
import { ErrorBoundary } from 'react-error-boundary'

function fallbackRender({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

<ErrorBoundary
  fallbackRender={fallbackRender}
  onReset={() => {
    // reset application state
  }}
  resetKeys={[/* change to auto-reset */]}
>
  <AudienceView />
</ErrorBoundary>
```

### Pattern 4: Tailwind logical properties for RTL
**What:** Use logical utilities for padding/margin/border/text alignment.
**When to use:** RTL-first layouts to avoid left/right hardcoding.
**Example:**
```html
<!-- Source: https://tailwindcss.com/docs/padding -->
<div dir="rtl" class="ps-8 pe-8 text-start">
  ...
</div>

<!-- Source: https://tailwindcss.com/docs/margin -->
<div dir="rtl" class="ms-6 me-6">
  ...
</div>
```

### Anti-Patterns to Avoid
- **Trying to catch render errors with try/catch:** React render errors must be caught by Error Boundaries, not try/catch. (React docs)
- **Persisting transient UI state:** Persist only show-critical state; avoid storing timers or ephemeral UI that should reset each session unless required.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error handling UI | Custom error boundary from scratch | react-error-boundary | Provides reset/retry hooks and fallback rendering |
| State persistence | Manual localStorage sync | Zustand persist middleware | Handles hydration, migrations, and serialization |
| RTL spacing | Manual left/right CSS | Tailwind logical utilities | Adapts to RTL/LTR automatically |

**Key insight:** These areas already have robust, edge-case-aware solutions; custom implementations tend to miss hydration edge cases or RTL direction flips.

## Common Pitfalls

### Pitfall 1: Vite public assets vs. imported assets
**What goes wrong:** Files in `/public` are served as-is and not transformed; assets in `src` should be imported. Mixing patterns causes broken paths.
**Why it happens:** CRA conventions differ from Vite; `public` handling in Vite is explicit.
**How to avoid:** Put runtime-imported images/audio in `src/assets` and import them; keep only truly static files in `/public`.
**Warning signs:** Broken image URLs after build; assets missing hashes.

### Pitfall 2: Vite env variables not prefixed
**What goes wrong:** `process.env` from CRA does not work; env vars must be accessed via `import.meta.env` and prefixed with `VITE_`.
**Why it happens:** Vite only exposes prefixed env vars to client bundles.
**How to avoid:** Rename env vars to `VITE_*` and update references.
**Warning signs:** `undefined` env values at runtime.

### Pitfall 3: Error boundaries don’t catch event/async errors
**What goes wrong:** Errors thrown in event handlers or timers are not caught by error boundaries.
**Why it happens:** React error boundaries only catch render/lifecycle errors (and errors in `startTransition`).
**How to avoid:** Wrap async flows in try/catch and surface errors into render state.
**Warning signs:** App crashes or logs without fallback UI.

### Pitfall 4: Tailwind RTL without logical props
**What goes wrong:** Hardcoded `ml-*`/`mr-*` or left/right positioning flips incorrectly in RTL.
**Why it happens:** RTL needs logical properties or directional variants.
**How to avoid:** Prefer `ms-*`/`me-*`, `ps-*`/`pe-*`, `text-start`/`text-end`.
**Warning signs:** Spacing visually reversed in RTL.

### Pitfall 5: Node version mismatch for Vite 7
**What goes wrong:** Vite 7 requires Node 20.19+/22.12+. Older Node breaks dev/build.
**Why it happens:** Node 18 is EOL and not supported in Vite 7.
**How to avoid:** Verify Node version before migration.
**Warning signs:** Vite start/build errors mentioning unsupported Node.

## Code Examples

Verified patterns from official sources:

### Vite env variables
```ts
// Source: https://github.com/vitejs/vite/blob/v7.0.0/playground/env/index.html
console.log(import.meta.env.BASE_URL)
console.log(import.meta.env.MODE)
```

### React class-based Error Boundary
```tsx
// Source: https://github.com/reactjs/react.dev/blob/main/src/content/reference/react/Component.md
import * as React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // log error
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
```

### Tailwind logical padding and margin
```html
<!-- Source: https://tailwindcss.com/docs/padding -->
<div dir="rtl" class="ps-8 pe-8">...</div>

<!-- Source: https://tailwindcss.com/docs/margin -->
<div dir="rtl" class="ms-8 me-8">...</div>
```

### Tailwind custom font
```css
/* Source: https://tailwindcss.com/docs/font-family */
@font-face {
  font-family: Cairo;
  font-style: normal;
  font-weight: 200 700;
  font-display: swap;
  src: url("/fonts/Cairo.woff2") format("woff2");
}

/* Source: https://tailwindcss.com/docs/theme */
@theme {
  --font-display: "Cairo", sans-serif;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CRA build pipeline | Vite 7 | 2025+ | Faster dev server, simpler config |
| React Context for global state | Zustand + persist | Ongoing | Easier persistence + smaller boilerplate |
| Left/right CSS | Logical properties (start/end) | Tailwind modern | RTL correctness |

**Deprecated/outdated:**
- CRA-specific env access (`process.env.REACT_APP_*`) → Vite `import.meta.env.VITE_*`

## Open Questions

1. **Audience freeze-on-crash implementation details**
   - What we know: Error boundaries catch render errors and can show fallback UI.
   - What's unclear: Best way to render “last good frame” without snapshotting.
   - Recommendation: Use store-backed “last stable view state” and render a static view in fallback; validate in implementation.

2. **Score panel spatial layout in RTL**
   - What we know: Tailwind logical properties adapt to RTL; rtl/ltr variants exist.
   - What's unclear: Whether to force `dir="ltr"` on the score panel container or use directional variants.
   - Recommendation: Prefer `dir="ltr"` for score panel container to lock spatial positioning, while global `dir="rtl"` remains for text.

## Sources

### Primary (HIGH confidence)
- /vitejs/vite/v7.0.0 - assets, env, publicDir, build
- /reactjs/react.dev - Error boundary docs and limitations
- /pmndrs/zustand - persist middleware
- /tailwindlabs/tailwindcss.com - logical properties, RTL variants, fonts
- /bvaughn/react-error-boundary - retry/reset patterns
- https://vite.dev/guide/migration - Vite 7 migration and Node support

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Versions for Tailwind v4 and React plugin inferred from docs.
- Architecture: MEDIUM - Based on official docs + reasonable migration patterns.
- Pitfalls: HIGH - Directly supported by Vite/React/Tailwind docs.

**Research date:** 2026-02-09
**Valid until:** 2026-03-11
