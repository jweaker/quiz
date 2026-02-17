---
status: diagnosed
phase: 05-visual-system
source: 05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md
started: 2026-02-17T10:00:00Z
updated: 2026-02-17T10:20:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Typewriter Title on Audience Display
expected: Open the audience display window. The show title (بشائر المعرفة) appears with a letter-by-letter RTL animation, characters revealing one at a time with slide-up motion.
result: issue
reported: "the typewriter effect is working, but the letters are disconnected, as you know arabic is cursive and connected"
severity: major

### 2. Section Background Changes
expected: On the audience display, navigate between sections using Cmd+Right/Left. The background gradient should smoothly animate to a different color scheme per section type.
result: pass

### 3. Score Celebration Effects
expected: Award points to a team (number keys). On the audience display, a gold confetti burst and scale-pop animation should appear on the score that changed.
result: issue
reported: "works, but the +n text should be below the score box since it will collide with the team name, also team names are a bit too small, also when i add a point before the animation finishes the new point doesnt play an animation, animations should be able to play in parallel"
severity: major

### 4. Screen Shake on Negative Score
expected: Deduct points from a team (e.g., wrong answer scoring). The audience display should shake horizontally with a brief red flash overlay.
result: issue
reported: "same issues in the adding animation, but also there is no red flash only red text"
severity: major

### 5. Minefield Visual Treatment
expected: Navigate to the "نوافذ المعرفة" (Windows of Knowledge) section. The audience display should switch to a dark suspense theme with a pulsing red glow effect.
result: issue
reported: "it works but that effect should only be there for the minefield window in that section"
severity: minor

### 6. Operator Persistent Zone
expected: On the operator panel, scores for both teams, timer status, and quick action buttons should be visible at the top without scrolling. Keyboard shortcut hints (kbd tags) should appear on buttons.
result: issue
reported: "works, but i would like the scores to be text inputable, like directly editable, also the score container in the operator panel is a bit empty, the text is in the top middle, not filling the entire box"
severity: major

### 7. Operator Adaptive Zone Tabs
expected: Below the persistent zone, tab buttons for Scoring / Countdown / Chess Clock should be visible. Clicking each tab switches the controls shown with a smooth transition.
result: issue
reported: "works but the backslash shortcut doesnt work, maybe change it, also i dont like the full screen shortcut names (big letters please remove)"
severity: major

### 8. Keyboard Shortcut Overlay
expected: Press the ? key. A full-screen overlay with backdrop blur should appear listing all keyboard shortcuts grouped by category (Navigation, Scoring, Timer, etc.). Press Escape to close.
result: issue
reported: "pressing ? doesnt show the cheat sheet"
severity: major

### 9. Rundown Rail
expected: A horizontal strip of section cards should be visible between the persistent zone and adaptive zone on the operator panel. Each card shows the section name and status. Clicking a card jumps to that section.
result: issue
reported: "works, also there is a problem with the sound its janky, especially the ticking sound, its just spam that gets cutoff and its inconsistent"
severity: major

### 10. Rundown Rail Toggle
expected: Press the R key. The rundown rail should hide/show, freeing up vertical space on the operator panel.
result: pass

### 11. Section Navigation Shortcuts
expected: Press Cmd+Right to advance to the next section and Cmd+Left to go back. The rundown rail highlights the active section and the audience display updates accordingly.
result: issue
reported: "works but its reversed, right is going left and left is going right"
severity: major

### 12. Wipe Transitions on Section Change
expected: When jumping between sections, the audience display content should transition with a cinematic wipe animation (not an instant swap).
result: pass

## Summary

total: 12
passed: 3
issues: 9
pending: 0
skipped: 0

## Gaps

- truth: "Arabic typewriter text appears with connected/cursive letter forms"
  status: failed
  reason: "User reported: the typewriter effect is working, but the letters are disconnected, as you know arabic is cursive and connected"
  severity: major
  test: 1
  root_cause: "TypewriterText.tsx uses text.split('') to split into individual characters, each wrapped in separate motion.span elements. Arabic contextual shaping requires contiguous text nodes — isolated DOM elements render isolated letter forms."
  artifacts:
    - path: "src/components/animations/TypewriterText.tsx"
      issue: "line 28: text.split('') breaks Arabic ligatures; lines 55-59: separate motion.span per character"
  missing:
    - "Rewrite TypewriterText to keep Arabic text in single DOM element with clip-path/mask reveal animation instead of character splitting"
  debug_session: ".planning/debug/arabic-typewriter-disconnected.md"

- truth: "Score delta text (+N) positioned without colliding with team name, team names sized appropriately, and rapid score changes each trigger their own animation"
  status: failed
  reason: "User reported: +n text should be below the score box since it collides with team name, team names too small, rapid points dont each play animation"
  severity: major
  test: 3
  root_cause: "Delta text uses absolute -top-4 -translate-y-full positioning (above score box, colliding with team name). Team name clamp min 0.8rem too small. useScoreDelta replaces previous delta on rapid changes instead of queueing — single state value + conditional rendering = no animation stacking."
  artifacts:
    - path: "src/components/animations/ScoreFlash.tsx"
      issue: "Delta positioned above score box (absolute -top-4 -translate-y-full)"
    - path: "src/components/score/TeamScore.tsx"
      issue: "line 36: team name fontSize clamp min 0.8rem too small"
    - path: "src/hooks/useScoreDelta.ts"
      issue: "lines 26-35: clears previous timeout, replaces delta state — no parallel animations"
  missing:
    - "Move delta text position to below score box"
    - "Increase team name font size minimum"
    - "Implement delta queue or key-based animation stacking for parallel score animations"
  debug_session: ".planning/debug/score-celebration-issues.md"

- truth: "Negative score triggers screen shake with red flash overlay"
  status: failed
  reason: "User reported: no red flash only red text, plus same animation overlap issues"
  severity: major
  test: 4
  root_cause: "ScreenShake component is never used in audience display hierarchy. ScoreFlash handles its own negative animation (red text shake) but doesn't integrate with ScreenShake's red flash overlay. Neither ScoreOverlay nor AudienceDisplay wraps content in ScreenShake."
  artifacts:
    - path: "src/components/audience/ScoreOverlay.tsx"
      issue: "No ScreenShake wrapper — component renders TeamScores directly"
    - path: "src/screens/audience/AudienceDisplay.tsx"
      issue: "ScoreOverlay rendered without ScreenShake integration"
  missing:
    - "Wrap audience display content in ScreenShake and trigger on negative score changes"
  debug_session: ".planning/debug/score-celebration-issues.md"

- truth: "MinefieldLayout only activates for the minefield window, not the entire Windows section"
  status: failed
  reason: "User reported: that effect should only be there for the minefield window in that section"
  severity: minor
  test: 5
  root_cause: "AudienceDisplay.tsx activates MinefieldLayout for entire 'windows' section type. Per plan decision, this was intentional placeholder until Phase 6 adds granular sub-section detection."
  artifacts:
    - path: "src/screens/audience/AudienceDisplay.tsx"
      issue: "MinefieldLayout active={currentSectionType === 'windows'} — too broad"
  missing:
    - "Add sub-section state or minefield detection flag to narrow MinefieldLayout activation to specific minefield window only"
  debug_session: ""

- truth: "Operator score values are directly editable text inputs, score container fills available space"
  status: failed
  reason: "User reported: scores should be text inputable/directly editable, score container is empty with text in top middle not filling box"
  severity: major
  test: 6
  root_cause: "OperatorControls.tsx lines 120/138 render scores as read-only <p> elements. Store has setRightScore/setLeftScore actions but no UI input wired. Container uses px-3 py-2 text-center without vertical centering (flex flex-col justify-center)."
  artifacts:
    - path: "src/screens/operator/OperatorControls.tsx"
      issue: "lines 120, 138: <p> elements instead of <input>; lines 110-114, 128-132: no vertical centering"
  missing:
    - "Replace <p> with <input type='number'> wired to setRightScore/setLeftScore"
    - "Add flex flex-col justify-center to score containers"
  debug_session: ".planning/debug/operator-panel-issues.md"

- truth: "Tab switching shortcut works and tab labels are compact without full shortcut names"
  status: failed
  reason: "User reported: backslash shortcut doesnt work, full screen shortcut names (big letters) should be removed"
  severity: major
  test: 7
  root_cause: "No useHotkeys binding for adaptive zone tab cycling. Backslash is registered for chess clock switching in TimerPanel.tsx, not tab switching. Tab buttons include Timer/Users icons (lines 267, 276) which user wants removed for compact text-only labels."
  artifacts:
    - path: "src/screens/operator/OperatorControls.tsx"
      issue: "No tab switching hotkey; lines 267, 276: unwanted icons on tabs"
    - path: "src/lib/shortcutRegistry.ts"
      issue: "line 41: backslash registered for clock-switch, not tab switching"
  missing:
    - "Add useHotkeys for tab cycling (new key or context-aware backslash)"
    - "Remove Timer and Users icon components from tab buttons"
  debug_session: ".planning/debug/operator-panel-issues.md"

- truth: "Pressing ? key opens keyboard shortcut overlay"
  status: failed
  reason: "User reported: pressing ? doesnt show the cheat sheet"
  severity: major
  test: 8
  root_cause: "Shortcut registry defines '?' as key (line 52) but react-hotkeys-hook requires 'shift+/' to detect ? key press. The binding likely uses '?' literal which doesn't match the keyboard event."
  artifacts:
    - path: "src/components/operator/KeyboardShortcutOverlay.tsx"
      issue: "useHotkeys binding likely uses '?' instead of 'shift+/'"
    - path: "src/lib/shortcutRegistry.ts"
      issue: "line 52: keys: '?' — may not work with react-hotkeys-hook"
  missing:
    - "Change hotkey binding from '?' to 'shift+/' in both registry and component"
  debug_session: ".planning/debug/keyboard-nav-audio-issues.md"

- truth: "Timer ticking audio plays smoothly without cutting off or janky repetition"
  status: failed
  reason: "User reported: sound is janky, especially ticking sound, spam that gets cutoff and inconsistent"
  severity: major
  test: 9
  root_cause: "useTimerAudio uses HTMLAudioElement with currentTime=0 reset for re-triggering. Rapid 100ms interval ticks cause audio overlap/cutoff. tick.wav is 189KB — too large for rapid playback. Need Web Audio API with short buffer or debounced playback."
  artifacts:
    - path: "src/hooks/useTimerAudio.ts"
      issue: "HTMLAudioElement with currentTime=0 reset causes choppy rapid playback"
    - path: "public/sounds/tick-CeyYiYf9.wav"
      issue: "189KB WAV too large for rapid tick playback"
  missing:
    - "Switch to Web Audio API AudioBuffer for tick sounds (instant, overlap-free playback)"
    - "Use shorter tick sound file or generate programmatically"
  debug_session: ".planning/debug/keyboard-nav-audio-issues.md"

- truth: "Cmd+Right advances forward through sections and Cmd+Left goes backward (respecting RTL layout)"
  status: failed
  reason: "User reported: its reversed, right is going left and left is going right"
  severity: major
  test: 11
  root_cause: "Section navigation binds Cmd+Right to nextSection and Cmd+Left to prevSection. In RTL layout, 'next' section is visually to the LEFT and 'previous' is to the RIGHT. The bindings need to be swapped for RTL context."
  artifacts:
    - path: "src/screens/operator/OperatorControls.tsx"
      issue: "Cmd+Right bound to nextSection, Cmd+Left to prevSection — reversed for RTL"
    - path: "src/lib/shortcutRegistry.ts"
      issue: "Navigation shortcut definitions don't account for RTL"
  missing:
    - "Swap Cmd+Right to prevSection and Cmd+Left to nextSection (RTL-aware navigation)"
  debug_session: ".planning/debug/keyboard-nav-audio-issues.md"
