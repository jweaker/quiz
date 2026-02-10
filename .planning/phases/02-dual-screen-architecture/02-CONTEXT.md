# Phase 2: Dual-Screen Architecture - Context

**Gathered:** 2026-02-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Split the application into two synchronized windows: an operator panel (laptop screen) and an audience display (external monitor). State changes propagate via BroadcastChannel within the same browser. Operator controls the show from one window; audience sees only the polished display. Game logic, scoring, timers, and section-specific features are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Audience display presentation
- Target display: 4K (3840x2160), 16:9 aspect ratio
- Configurable safe area: operator defines margins (e.g., bottom 15%) where no content appears — just background
- Safe area configured via a settings page with pixel/percentage inputs, values persist across sessions
- Audience display served at its own route (e.g., `/audience`), separate from operator route (e.g., `/operator`)

### Operator panel layout
- Both keyboard and mouse equally supported — controls work with either input method
- Light/dark theme toggle — operator picks based on venue lighting conditions
- Component library choice deferred to research (shadcn/ui is a candidate given existing Tailwind v4 setup)

### Confidence monitor behavior
- Live mirror: shows exactly what the audience sees in real-time (not a preview-before-reveal)
- Resizable by the operator — they decide how much panel space it takes
- Scaled replica of the full audience display (including safe-area background, not cropped to content)
- Clean mirror only — no overlay guides or safe area lines

### Window launch & reconnection
- Same machine, two windows — operator opens audience window via `window.open()`, manually drags to external display
- Both a button in the operator panel and a keyboard shortcut to open the audience window
- Operator manually positions and fullscreens the audience window on external display
- On audience window close: prominent banner on operator panel with "Audience display disconnected — Reopen" and one-click relaunch
- Sync via BroadcastChannel (same-origin, same browser) — no network server needed

### Claude's Discretion
- Audience display background design (solid, gradient, pattern — whatever suits broadcast aesthetic)
- Content layout within the safe area (full-width vs centered with padding)
- Operator panel information density and layout structure (split, stacked, etc.)
- Audience window resume behavior after reconnection (instant vs brief transition)

</decisions>

<specifics>
## Specific Ideas

- Operator may need to adjust safe area per venue — the bottom 15% example is just one scenario, all four edges should be configurable
- Separate routes (`/operator` and `/audience`) so they're bookmarkable and independently loadable
- The architecture should be simple — BroadcastChannel within same browser, no server component

</specifics>

<deferred>
## Deferred Ideas

- Cross-machine operator/audience sync (WebSocket or WebRTC) — potential future enhancement if production needs change
- Auto-detection of secondary display via Window Management API — browser support is limited, revisit if needed

</deferred>

---

*Phase: 02-dual-screen-architecture*
*Context gathered: 2026-02-10*
