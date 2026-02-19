---
status: testing
phase: 06-quiz-sections
source: 06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md, 06-06-SUMMARY.md
started: 2026-02-19T08:00:00Z
updated: 2026-02-19T08:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Section Navigation via Rundown Rail
expected: |
  Clicking a section in the Rundown Rail jumps both operator panel and audience display to that section. The operator adaptive zone switches to the section-specific panel, and the audience display routes to the matching section component.
awaiting: user response

## Tests

### 1. Section Navigation via Rundown Rail
expected: Clicking a section in the Rundown Rail jumps both operator panel and audience display to that section. Operator adaptive zone switches to section-specific panel automatically.
result: [pending]

### 2. Speed Question Section
expected: In Speed Question, operator sees question text with Z/C keys to assign turn to team, N/B to navigate questions, and a progress counter. Audience display shows question text with animated transitions between questions.
result: [pending]

### 3. Audience Questions Section
expected: Audience Questions shows question on audience display. Operator can reveal answer (Enter), which appears with an animated entrance. No timer is shown for this section.
result: [pending]

### 4. Windows of Knowledge - Category Picker
expected: Operator sees a grid of 5 categories (with done/partial/pending visual states) plus a Minefield entry. Selecting a category syncs to the audience display, which shows the category grid with icons and transitions to question view.
result: [pending]

### 5. Windows of Knowledge - Question Flow
expected: Within a selected category, operator uses Enter to reveal answer, N/B to navigate between the 2 questions. Audience shows question text with fade-in and answer with scale-in animation.
result: [pending]

### 6. Minefield Activation
expected: Selecting Minefield from the Windows category picker activates the MinefieldLayout visual treatment on the audience display (red glow, danger theme, pulsing effects from Phase 5).
result: [pending]

### 7. Puzzle Section with Timer
expected: Puzzle section shows puzzle content with configurable timer (T to start/stop, Shift+T to reset). Enter reveals answer. Dual-solve flow: first team solve button gives +15, split solve uses existing scoring hotkeys (0 for +10, 5 for +5).
result: [pending]

### 8. Rapid Questions with Team Switching
expected: Rapid Questions shows 20 questions. S key switches teams (pauses timer, resets to 60s, switches active team). Audience display shows question text and timer but NO team indicator (headphones isolation). T starts timer.
result: [pending]

### 9. Debate - Vote Entry & Confirm
expected: Debate section shows 6 numeric input fields (3 judges 0-9, audience rep 0-3, guest 0-3 per team). After entering votes, a Confirm button locks in the values. Timer available (T start/stop, Shift+T reset to 40s).
result: [pending]

### 10. Debate - Sequential Vote Reveal
expected: After confirming votes, pressing Enter reveals vote slots one at a time on audience display with dramatic scale+fade animation. After 3 reveals, a fourth Enter applies final scores with green checkmark. Audience sees debate topic text before votes are revealed.
result: [pending]

### 11. Ask Intelligently - Start & Point Deduction
expected: Operator sees pre-start view with animal thumbnail and Start button. Starting awards +20 to active team and begins 120s countdown. Q key (or cell click) deducts 1 point per question. Progress bar shows remaining points with color transitions (green > amber > red). E key ends early.
result: [pending]

### 12. Ask Intelligently - Interactive Animal Grid
expected: Both operator and audience show a 9x8 (72-cell) CSS grid overlay on the animals.png composite image. Operator clicks individual cells to mark animals as revealed (dark overlay appears). Audience sees animated emerald highlights (scale+fade) on revealed cells. Cell click combines reveal + point deduction.
result: [pending]

## Summary

total: 12
passed: 0
issues: 0
pending: 12
skipped: 0

## Gaps

[none yet]
