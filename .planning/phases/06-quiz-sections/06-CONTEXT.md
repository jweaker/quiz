# Phase 6: Quiz Sections - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement all 8 quiz section types with specialized UI and interactions for both operator panel and audience display. Each section has unique mechanics, scoring rules, and visual treatment. Sections: Speed Question, Windows of Knowledge, Minefield, Puzzle, Debate, Ask Intelligently, Rapid Questions, Audience Questions.

</domain>

<decisions>
## Implementation Decisions

### Question-to-answer flow
- Answers are shown on the audience display after the operator reveals them (not verbal-only)
- Advance behavior varies by section type — some auto-advance after scoring, others require manual advance (Claude determines per section based on section mechanics)
- Each operator step (show question, reveal answer, advance) is a single key press
- Question progress (e.g. "3/10") shown on operator panel only, not on audience display

### Debate judge voting interface
- Three input groups: Judges (3 judges combined), Audience rep (1), Guest (1)
- Each of the 5 judges gives a numeric score of 0-3 per team, max 15 total per team
- Audience display shows 3 slots: "Judges" (combined score of 3 judges), "Audience" (audience rep score), "Guest" (guest score)
- Votes revealed one slot at a time on audience display for dramatic effect
- Operator enters all votes before triggering sequential reveal

### Section-specific operator controls
- Common controls always visible in operator panel, section-specific controls added in adaptive zone
- Keyboard primary for all sections; mouse allowed for complex interactions (e.g. Ask Intelligently 72-photo grid)
- Both inline shortcut hints per section AND full overlay on ? key
- Full navigation within sections: operator can skip questions, go back, or jump to any question

### Claude's Discretion
- Which sections auto-advance vs require manual advance after scoring
- Specific key bindings per section (consistent with existing Phase 3-5 patterns)
- Layout of section-specific adaptive zone content
- Animation timing for debate vote reveals
- Ask Intelligently grid interaction design (mouse-driven)

</decisions>

<specifics>
## Specific Ideas

- Debate reveal should feel dramatic — one slot at a time, building tension
- Operator workflow stays keyboard-first, matching the mission-control density established in Phase 5
- Question progress counter on operator screen helps the operator pace the show without revealing pacing to the audience

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-quiz-sections*
*Context gathered: 2026-02-19*
