# Phase 5: Visual System - Context

**Gathered:** 2026-02-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Broadcast-quality animations for the audience display and a redesigned operator interface with rundown view. This phase delivers entrance/exit animations, score celebrations, section transitions, Minefield visual treatment, operator panel redesign (fixing the current broken vertical-scroll layout), keyboard shortcut surfacing, and an episode rundown view. Does NOT add new game mechanics, sections, or audio — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Operator panel redesign
- **Context-adaptive layout** — layout shifts based on current section, showing only relevant controls for what's happening now (e.g., timer controls appear only during timed sections)
- **Mission-control density** — small text, compact controls, everything on one screen like a broadcast switcher; no scrolling for core operations
- **Always visible: scores + timer + confidence monitor** — these three persist regardless of active section; everything else adapts to context
- **Keyboard shortcuts: inline hints + overlay** — primary controls show their shortcut key inline (e.g., `[T] Timer`), plus `?` toggles a full reference overlay

### Animation style & identity
- **Energetic & bold tone** — dramatic reveals, punchy score effects, high-energy transitions (Who Wants to Be a Millionaire style, not BBC restrained)
- **Type-on question reveal** — text appears letter by letter or word by word on the audience display, building anticipation
- **Score celebrations: punchy without team colors** — no specific team colors exist, so use a universal punchy effect (flash, particles, scale pop) that looks good for either team
- **Cinematic wipe transitions** — section changes use directional wipes, like a TV scene change (not fade-through-black)

### Minefield visual treatment
- **Accent changes only** — same layout structure as other sections, but with tension/suspense accents (dark background, spotlight on question, subtle pulsing glow)
- **Score stakes flash on answer** — +16/-8/0 point values shown dramatically when an answer is given, not permanently visible
- **Wrong answer: screen shake + red flash** — brief screen shake and red overlay when -8 hits, audience feels the loss viscerally

### Rundown view
- **Horizontal rail** — sections as cards in a horizontal strip, current section highlighted, compact
- **Direct click-to-jump** — click any section to jump immediately, no confirmation dialog (operator knows what they're doing)
- **Cards show name + status only** — section name and completion state (pending/active/done), minimal for horizontal fit
- **Togglable visibility** — show/hide with keyboard shortcut, saves space when not needed

### Claude's Discretion
- Exact animation timing and easing curves within the energetic tone
- Confidence monitor size and placement within the persistent zone
- Specific particle/flash effects for score celebrations
- How context-adaptive transitions between section layouts work
- Rundown rail positioning (top vs bottom of operator panel)
- Animation for the type-on effect speed and character grouping
- Cinematic wipe direction patterns (left-to-right, top-down, etc.)

</decisions>

<specifics>
## Specific Ideas

- Operator panel currently has a "long vertical scroll, redundant options, poor use of space" problem — Phase 5 must redesign this, not add more panels on top
- No team-specific colors exist — score celebrations need to work with a universal palette
- All animations must respect `prefers-reduced-motion` and hit 60fps on MacBook Pro
- Western numerals for timer displays (established in Phase 4)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-visual-system*
*Context gathered: 2026-02-15*
