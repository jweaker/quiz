# Phase 3: Game State & Scoring - Context

**Gathered:** 2026-02-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Real-time score tracking with animations visible on both operator and audience screens. Turn management, team controls, side swapping, undo, and manual score adjustments via keyboard. Creating timers, visual effects systems, and quiz section logic are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Score display & animations
- Compact corner overlay on audience display, always visible
- Each team shows: team name, current score, change delta (+2, -8, etc.) that fades out after update
- Score changes apply instantly to both screens simultaneously
- Animation style for number transitions: Claude's discretion (rolling counter, pop & scale, or flip — pick what looks best for broadcast)
- Extra visual effect on score change (glow, color pulse, etc.): Claude's discretion

### Active team indicator
- Glow/halo effect around the active team's score area
- Single accent color (e.g., gold/white) that moves to whichever team is active — not tied to team identity
- Turn change transition: smooth slide of the glow from one team to the other (300-500ms)
- Same glow treatment on both operator panel and audience display

### Operator scoring controls
- Keyboard-only controls — no mouse/click buttons needed during live show
- Two input modes: section-aware presets (quick keys for +1, +2, +8, +16, -8) AND custom number entry for arbitrary values
- Full scoring history with ability to review and revert any past scoring action
- Score changes apply instantly to audience display — no staging/commit workflow

### Team identity & sides
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

</decisions>

<specifics>
## Specific Ideas

- Show is RTL (Arabic) — "right" is the primary/first position, matching Phase 1's physical positioning decisions (right/left not start/end)
- Section-aware presets should reflect the actual scoring values from the quiz format: +1 (speed/general), +2 (windows), +8/+16/-8 (minefield), etc.
- Keyboard-only operation is critical for live TV — operator cannot look away from the screen to find a mouse

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-game-state-scoring*
*Context gathered: 2026-02-13*
