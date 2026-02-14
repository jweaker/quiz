---
status: investigating
trigger: "Investigate why audio beeps don't play during countdown timer (10s, 5s, 0s thresholds) but a bell DOES play when chess clock timer reaches zero."
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:00:00Z
---

## Current Focus

hypothesis: useCountdown accepts onThreshold callback but TimerPanel.tsx does not wire useTimerAudio's playBeep to it
test: comparing useChessClock (working) vs useCountdown (not working) integration
expecting: TimerPanel.tsx missing the connection between useTimerAudio and useCountdown
next_action: verify root cause in code

## Symptoms

expected: Audio beeps should play at 10s, 5s, and 0s during countdown mode
actual: No beeps play during countdown (silent)
errors: None visible
reproduction: Start countdown timer in TimerPanel, observe no audio at thresholds
started: Unknown (symptom reported by user)

## Eliminated

## Evidence

- timestamp: 2026-02-14T00:00:00Z
  checked: /Users/jweaker/code/quiz/src/hooks/useCountdown.ts
  found: Lines 36-43 show onThreshold callback is CALLED when thresholds are hit (10, 5, 0)
  implication: Hook is working correctly and provides the mechanism

- timestamp: 2026-02-14T00:00:00Z
  checked: /Users/jweaker/code/quiz/src/hooks/useTimerAudio.ts
  found: Lines 30-41 provide playBeep function that plays audio for thresholds 10, 5, 0
  implication: Audio hook exists and provides the correct interface

- timestamp: 2026-02-14T00:00:00Z
  checked: /Users/jweaker/code/quiz/src/hooks/useChessClock.ts
  found: Line 19 imports useTimerAudio, line 64 calls playBeep(threshold) from within the hook
  implication: Chess clock hook INTERNALLY connects audio - this is why it works

- timestamp: 2026-02-14T00:00:00Z
  checked: /Users/jweaker/code/quiz/src/components/operator/TimerPanel.tsx
  found: Line 39 calls useCountdown() with NO parameters - no onThreshold callback provided
  implication: ROOT CAUSE - TimerPanel never connects audio to countdown

- timestamp: 2026-02-14T00:00:00Z
  checked: Architectural difference
  found: useChessClock internally uses useTimerAudio (line 4, 19, 64), but useCountdown does NOT import useTimerAudio
  implication: Design expects caller (TimerPanel) to wire audio, but TimerPanel doesn't do it

## Resolution

root_cause: TimerPanel.tsx line 39 calls useCountdown() without providing an onThreshold callback. The useCountdown hook accepts and calls onThreshold (line 41), but no callback is passed, so audio never plays. In contrast, useChessClock internally calls playBeep (line 64), which is why chess clock audio works.
fix:
verification:
files_changed: []
