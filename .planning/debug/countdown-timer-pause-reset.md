---
status: investigating
trigger: "Investigate why the countdown timer pause/resume jumps back instead of resuming from the paused time, and why reset doesn't return to 60 seconds."
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:00:00Z
---

## Current Focus

hypothesis: pause/resume jumps back because startTime is not adjusted on resume to account for elapsed time; reset uses current countdownRemaining instead of original duration
test: analyzing code flow in useCountdown.ts, timerStore.ts, and TimerPanel.tsx
expecting: confirm startTime reset on resume causes drift, and reset handler uses wrong value
next_action: document root cause with specific line numbers

## Symptoms

expected:
1. Press 't' to start 60s countdown → pause at 45s → resume → should continue from 45s
2. Press Shift+T to reset → should return to 60 seconds

actual:
1. Press 't' to start → pause → resume → timer jumps back (doesn't resume from paused time)
2. Press Shift+T → doesn't reset to 60 seconds

errors: None (logic bug, not runtime error)

reproduction:
1. Start countdown timer with preset (e.g., 60s)
2. Press 't' to start
3. Press 't' to pause (e.g., at 45s remaining)
4. Press 't' to resume → BUG: jumps back instead of continuing from 45s
5. Press Shift+T to reset → BUG: doesn't return to 60s

started: Unknown (existing issue in current implementation)

## Eliminated

## Evidence

- timestamp: 2026-02-14T00:00:00Z
  checked: useCountdown.ts lines 21-26
  found: When countdownRunning changes to true, startTimeRef.current is ALWAYS reset to performance.now(), regardless of whether this is initial start or resume from pause
  implication: On resume, the hook recalculates from full duration instead of accounting for already-elapsed time

- timestamp: 2026-02-14T00:00:00Z
  checked: useCountdown.ts lines 30-31
  found: elapsed = performance.now() - startTimeRef.current; remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))
  implication: Calculation always uses countdownDuration (full duration), not countdownRemaining (current remaining time)

- timestamp: 2026-02-14T00:00:00Z
  checked: timerStore.ts lines 50-52
  found: setCountdown sets both countdownDuration and countdownRemaining; setCountdownRemaining only sets remaining; setCountdownRunning only sets running flag
  implication: No mechanism to preserve elapsed time when pausing

- timestamp: 2026-02-14T00:00:00Z
  checked: TimerPanel.tsx lines 45-48
  found: 't' hotkey toggles countdownRunning without any state preservation: setCountdownRunning(!countdownRunning)
  implication: Pause doesn't save current remaining time before toggling

- timestamp: 2026-02-14T00:00:00Z
  checked: TimerPanel.tsx lines 50-54
  found: Shift+T reset handler: setCountdown(countdownRemaining || 60); setCountdownRunning(false)
  implication: Reset uses countdownRemaining (current value, which may be 0 or decremented) instead of original countdownDuration. If countdown reached 0, resets to 60. Otherwise resets to whatever current remaining value is.

- timestamp: 2026-02-14T00:00:00Z
  checked: useCountdown.ts line 26
  found: const durationMs = countdownDuration * 1000 - uses DURATION, not REMAINING
  implication: Hook always counts down from full duration, ignoring any partially-elapsed state

## Resolution

root_cause:
1. PAUSE/RESUME BUG: useCountdown.ts lines 22-26 reset startTimeRef on every countdownRunning transition, and line 26 always uses countdownDuration instead of countdownRemaining. When resuming, the hook calculates elapsed time from performance.now() (current time) minus startTimeRef.current (just set to current time = 0 elapsed), then subtracts from full duration instead of remaining time. This causes the timer to jump back to the original duration.

2. RESET BUG: TimerPanel.tsx line 52 uses setCountdown(countdownRemaining || 60) which sets duration to current remaining value. If timer ran to completion (remaining = 0), resets to 60. Otherwise, "resets" to whatever the current decremented value is, not the original duration. There's no stored reference to the original duration that was set.

fix:
1. For pause/resume: useCountdown should check if countdownRemaining < countdownDuration on resume, and if so, adjust startTimeRef to account for already-elapsed time: startTimeRef.current = performance.now() - ((countdownDuration - countdownRemaining) * 1000)

2. For reset: TimerPanel reset handler should use countdownDuration (the original duration) instead of countdownRemaining: setCountdown(countdownDuration || 60)

verification:

files_changed:
- /Users/jweaker/code/quiz/src/hooks/useCountdown.ts
- /Users/jweaker/code/quiz/src/components/operator/TimerPanel.tsx
