# Phase 1: Foundation & Migration - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Modernize the existing CRA/JavaScript quiz show app to Vite 7+ with full TypeScript, add error boundaries, replace React Context with Zustand stores, migrate CSS to Tailwind with logical properties for RTL, and reorganize the folder structure. The app is small (~12 source files) and can break temporarily during migration.

</domain>

<decisions>
## Implementation Decisions

### Error recovery during live show
- Audience display freezes on last good frame when a component crashes — no visual disruption on air
- Operator panel shows subtle indicator (small icon/dot) with recovery options — not alarming
- Auto-retry the crashed component first; only show error to operator if retry fails
- If auto-retry fails, operator can skip to next section as an escape hatch — the show must go on

### State survival on refresh
- Full state persistence — scores, current section, question progress, and timer state all survive browser refresh
- Silent auto-resume after refresh — same screen, same state, no confirmation dialog
- Persistence via localStorage — survives refresh, tab close, and browser restart
- Explicit "Reset" action to clear all persisted state before a new episode (no auto-clear on episode load)

### RTL and typography presentation
- RTL direction for all text content and general layout flow
- Score panels use spatial layout (left-team stays visually left, right-team stays visually right) — positional, not directional
- Western/standard numerals (123) for all numbers — scores, timers, counts
- Fonts self-hosted and bundled with the app — no CDN dependency during live broadcast

### Migration cutover approach
- Big-bang TypeScript conversion — all files converted at once, no JS/TS coexistence period
- App can break temporarily during migration — no upcoming shows requiring the old version
- Migrate from plain CSS to Tailwind CSS — utility-first with built-in RTL support
- Reorganize folder structure during migration — move from flat screens/components/contexts to a cleaner architecture

### Claude's Discretion
- Font selection — Cairo or alternative Arabic font(s) for broadcast readability
- Exact folder structure after reorganization (features/, shared/, etc.)
- Error boundary component design and retry mechanism implementation
- Zustand store architecture and slice boundaries
- Tailwind configuration and theme setup
- TypeScript strictness level beyond noImplicitAny

</decisions>

<specifics>
## Specific Ideas

- The app runs on a broadcast machine during live TV — network independence is critical (self-hosted fonts, no CDN)
- Keyboard-driven operation is the primary interaction model — every screen uses global keydown listeners
- The codebase is small (~12 source files, 2 reusable components) so big-bang migration is feasible
- Current state management is a single React Context with flat useState hooks — Zustand migration is straightforward

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-migration*
*Context gathered: 2026-02-09*
