---
status: diagnosed
phase: 04-timer-system
source: 04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md
started: 2026-02-14T19:00:00Z
updated: 2026-02-15T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Countdown Timer Start/Stop
expected: On operator panel, switch to countdown mode. Press 't' to start countdown. Timer appears on both operator and audience screens counting down. Press 't' again to pause. Press 't' to resume. Timer digits use western numerals. At 10s remaining, countdown turns yellow. At 5s, turns red.
result: issue
reported: "why are there big letters when i use the keybaord on the audience window? is that for testing ? when i pause and resume the timer, it doesnt pause and resume from the same time it jumps back, and when i reset it doesnt reset back to 60 , it needs review, also i require a more fun timer, with a better design, and good sound design, and colors and animations, also i should be able to manually input time for timer,"
severity: major

### 2. Countdown Audio Cues
expected: During a countdown, audio beeps play at 10s remaining, 5s remaining, and when timer reaches 0. Three distinct sounds at each threshold.
result: issue
reported: "no sound is playing, colors are working"
severity: major

### 3. Chess Clock Operation
expected: Switch to chess clock mode on operator panel. Press '[' to start right team's clock, ']' for left team. Only one clock ticks at a time (mutual exclusion). Press '\' to switch which team's clock is active. Both clocks visible side-by-side on audience display.
result: issue
reported: "keyboard shortcuts arent working, only p works, but the clocks are visible side by side and i can switch between them by clicking the buttons"
severity: major

### 4. Points Conversion Display
expected: During chess clock, audience display shows remaining time converting to points below each timer (5 seconds = 1 point). Points preview updates in real-time as clock ticks down.
result: pass

### 5. Letter Key Display
expected: Press any letter key (a-z) and that letter appears large and prominent on the audience screen with a glowing backdrop. Press Escape to clear the letter. Letters don't fire while typing in form inputs.
result: pass
note: "User also confirmed: bell ring plays when chess clock timer ends (but not on countdown timer), bell sound quality isn't great, no ticking or sound effects during countdown — bland experience"

### 6. Pass Mechanic
expected: During Poetic Chase (chess clock mode), press 'g' to pass verse to opponent. Receiving team gets +1 point immediately. Clock switches to the receiving team. An amber indicator shows which team received the pass.
result: pass
note: "g/v/x all work, but no live verse counter visible on audience display. Needs better, more fun design."

### 7. Correct/Wrong Verse After Pass
expected: After a pass, press 'v' for correct answer — receiving team gets +1 bonus point (total +2 from pass), verse count increments, clock switches. Press 'x' for wrong — no bonus, pass state resets, clock switches.
result: pass
note: "Works functionally but pass/verse info not shown on audience display"

## Summary

total: 7
passed: 4
issues: 3
pending: 0
skipped: 0

## Gaps

- truth: "Countdown timer pauses and resumes from same time, reset returns to default"
  status: failed
  reason: "User reported: pause/resume jumps back instead of resuming from same time, reset doesn't reset back to 60"
  severity: major
  test: 1
  root_cause: "useCountdown.ts resets startTimeRef on every resume and always uses countdownDuration (full duration) not countdownRemaining. On resume elapsed=0 so timer jumps to full duration. Reset handler uses countdownRemaining instead of countdownDuration."
  artifacts:
    - path: "src/hooks/useCountdown.ts"
      issue: "Lines 22-26: startTimeRef reset on every resume, durationMs always uses full countdownDuration"
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "Line 52: setCountdown(countdownRemaining || 60) should use countdownDuration"
  missing:
    - "Adjust startTimeRef on resume: startTimeRef = performance.now() - ((countdownDuration - countdownRemaining) * 1000)"
    - "Reset handler should use countdownDuration || 60 instead of countdownRemaining || 60"
  debug_session: ".planning/debug/countdown-timer-pause-reset.md"

- truth: "Letter keys only display during Poetic Chase mode, not during general countdown"
  status: fixed
  reason: "User reported: big letters appear on audience window when using keyboard during countdown"
  severity: major
  test: 1
  root_cause: "useLetterDisplay() called unconditionally in TimerPanel, now gated by mode === chess-clock"
  artifacts:
    - path: "src/hooks/useLetterDisplay.ts"
      issue: "No enabled parameter, always active"
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "useLetterDisplay() called without mode check"
  missing: []
  debug_session: ""

- truth: "Timer has polished, fun design with good animations and colors"
  status: failed
  reason: "User reported: requires a more fun timer with better design, good sound design, colors and animations. Also: bell ring on chess clock timeout isn't great, no ticking sounds, bland experience. Pass/verse info not shown on audience."
  severity: major
  test: 1
  root_cause: "Design gap — current timer UI is functional but minimal. No animations, no ticking sounds, no visual flair. This is Phase 5 (Visual System) scope."
  artifacts:
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "Basic functional UI without animations or polish"
    - path: "src/components/audience/TimerDisplay.tsx"
      issue: "Basic display without animations or visual flair"
  missing:
    - "Animated countdown with circular progress or radial timer"
    - "Ticking sound effects during countdown"
    - "Better bell/buzzer sounds"
    - "Visual flourishes and animations"
  debug_session: ""

- truth: "Operator can manually input custom time duration for timer"
  status: failed
  reason: "User reported: should be able to manually input time for timer"
  severity: major
  test: 1
  root_cause: "Missing feature — only preset durations (30/60/100/120) exist. No custom number input field."
  artifacts:
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "Only preset buttons, no custom input"
  missing:
    - "Add number input field for custom timer duration"
  debug_session: ""

- truth: "Audio beeps play at 10s, 5s, and 0s thresholds during countdown"
  status: failed
  reason: "User reported: no sound on countdown timer. Bell ring DOES play on chess clock timeout but not on countdown. No ticking or intermediate sound effects."
  severity: major
  test: 2
  root_cause: "TimerPanel.tsx line 39 calls useCountdown() with no params — no onThreshold callback. useChessClock internally uses useTimerAudio (self-contained), but useCountdown expects caller to wire audio (composition pattern). TimerPanel never connects them."
  artifacts:
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "Line 39: useCountdown() called with no onThreshold callback"
    - path: "src/hooks/useCountdown.ts"
      issue: "Correctly calls onThreshold but no callback provided"
  missing:
    - "Import useTimerAudio in TimerPanel, pass playBeep as onThreshold to useCountdown()"
  debug_session: ".planning/debug/countdown-audio-missing.md"

- truth: "Chess clock keyboard shortcuts [ ] \\ work to start/switch clocks"
  status: failed
  reason: "User reported: keyboard shortcuts aren't working, only p works, buttons work fine."
  severity: major
  test: 3
  root_cause: "react-hotkeys-hook v5.2.4 bug (GitHub #1125): special characters [ ] \\ not parsed correctly in parseHotkeys.ts. Must use KeyboardEvent.code names (BracketLeft, BracketRight, Backslash) instead of single-char strings."
  artifacts:
    - path: "src/components/operator/TimerPanel.tsx"
      issue: "Lines 57/62/67: '[', ']', '\\\\' not recognized by react-hotkeys-hook"
  missing:
    - "Change '[' to 'BracketLeft', ']' to 'BracketRight', '\\\\' to 'Backslash'"
  debug_session: ".planning/debug/chess-clock-shortcuts-broken.md"

- truth: "Audience display shows live verse counter and pass status during Poetic Chase"
  status: failed
  reason: "User reported: no live verse counter for audience, pass/verse info not shown on audience display"
  severity: major
  test: 6
  root_cause: "Missing feature — audience TimerDisplay component shows clocks and points but not verse count or pass status"
  artifacts:
    - path: "src/components/audience/TimerDisplay.tsx"
      issue: "No verse count or pass status display"
  missing:
    - "Add verse count per team to audience chess clock display"
    - "Add pass status indicator to audience display"
  debug_session: ""
