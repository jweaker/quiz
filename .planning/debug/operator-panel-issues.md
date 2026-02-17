---
status: resolved
trigger: "Investigate 4 issues with the operator panel"
created: 2026-02-17T00:00:00Z
updated: 2026-02-17T00:00:00Z
---

## Current Focus

hypothesis: All 4 issues identified and root causes found
test: Code review and evidence gathering complete
expecting: Return comprehensive diagnosis
next_action: Return structured diagnosis to user

## Symptoms

expected:
1. Scores should be directly editable text inputs in operator persistent zone
2. Score container should fill available space (not just text in top middle)
3. Backslash (\) shortcut should switch between adaptive zone tabs
4. Adaptive zone tab labels should be compact (no full shortcut names displayed as big letters)

actual:
1. Scores displayed as read-only text (lines 120, 138 in OperatorControls.tsx)
2. Score container has excessive padding with text centered at top (px-3 py-2 with text-3xl and leading-tight)
3. No keyboard shortcut registered for adaptive zone tab switching
4. Tab buttons show icon + text labels, unclear what "full shortcut names as big letters" refers to

errors: None
reproduction: View operator panel persistent zone and adaptive zone tabs
started: UAT test 6 and 7 failures

## Eliminated

N/A - Initial evidence gathering complete

## Evidence

- timestamp: 2026-02-17T00:00:00Z
  checked: OperatorControls.tsx lines 109-143 (persistent zone score containers)
  found: |
    Score display uses `<p className="text-3xl font-bold tabular-nums leading-tight">{rightScore}</p>`
    and `<p className="text-3xl font-bold tabular-nums leading-tight">{leftScore}</p>`.
    These are read-only paragraph elements, not input fields.
    Container styling: `px-3 py-2 text-center` with alignment causing text to appear at top.
  implication: Need to replace <p> with <input> or contentEditable element, and adjust container flexbox to center content vertically

- timestamp: 2026-02-17T00:00:00Z
  checked: OperatorControls.tsx lines 252-279 (adaptive zone tabs)
  found: |
    Three Button components for tab switching:
    - Line 253-260: "النقاط" (scoring) - text only
    - Line 261-269: Timer icon + "عد تنازلي" (countdown)
    - Line 270-278: Users icon + "المطاردة" (chess clock)
    No keyboard shortcuts registered for switching between tabs.
    No visible "big letters" or full shortcut names in the markup.
  implication: Need to add useHotkeys for backslash key to cycle through adaptiveMode states. "Big letters" issue unclear from code inspection.

- timestamp: 2026-02-17T00:00:00Z
  checked: useScoreControls.ts (entire file)
  found: No keyboard shortcut for adaptive zone tab switching. Hook only registers scoring shortcuts and general controls.
  implication: Tab switching shortcut must be added to OperatorControls.tsx directly (component-local state)

- timestamp: 2026-02-17T00:00:00Z
  checked: shortcutRegistry.ts line 41
  found: |
    'clock-switch': { keys: '\\', label: 'تبديل الساعة', category: 'chess-clock' }
    This is for switching the active chess clock timer, NOT for adaptive zone tabs.
  implication: Backslash is already used for chess clock switching. User likely wants a different key, OR wants backslash to switch tabs when not in chess-clock mode.

- timestamp: 2026-02-17T00:00:00Z
  checked: showStore.ts lines 95-98
  found: |
    setRightScore: (score) => set({ rightScore: score })
    setLeftScore: (score) => set({ leftScore: score })
    Actions exist to directly set score values (not just increment).
  implication: Store already supports direct score editing. Just need UI inputs wired to these actions.

- timestamp: 2026-02-17T00:00:00Z
  checked: Phase 04 verification docs (previous backslash fix)
  found: |
    Backslash shortcut was fixed in phase 04-04 for chess clock switching.
    Changed from '\\' to 'Backslash' (KeyboardEvent.code name) due to react-hotkeys-hook bug.
    This is implemented in TimerPanel.tsx line 74: `useHotkeys('Backslash', ...)`
  implication: Backslash IS working, but only for chess clock switching when in chess-clock mode. User wants it for TAB switching, which is a different feature.

## Resolution

root_cause: |
  ISSUE 1 - Scores not editable:
  Lines 120 and 138 in OperatorControls.tsx render scores as read-only <p> elements.
  No input fields or contentEditable wired to setRightScore/setLeftScore actions.

  ISSUE 2 - Score container spacing:
  Container uses `px-3 py-2` padding with `text-center` alignment. The `leading-tight`
  on the score text and lack of vertical centering causes text to appear at top of box.
  Need `flex flex-col justify-center` on container to vertically center content.

  ISSUE 3 - Backslash tab switching:
  No keyboard shortcut registered in OperatorControls.tsx for cycling adaptiveMode.
  Backslash is currently used for chess clock switching (TimerPanel.tsx:74).
  User expects backslash to switch adaptive zone tabs (scoring/countdown/chess-clock).

  ISSUE 4 - Full shortcut names on tabs:
  Lines 267 and 276 show Timer and Users icons on tabs (size-3 = 12px).
  User wants "compact tab labels only" - likely means remove the icons, keep just text.
  Tabs currently show: [Icon] + "عد تنازلي" and [Icon] + "المطاردة"
  User wants: just "عد تنازلي" and "المطاردة" (text only, no icons)

fix: |
  ISSUE 1: Replace score <p> elements with <input type="number"> fields
    - Wire onChange to setRightScore/setLeftScore
    - Style to match existing appearance (text-3xl, font-bold, tabular-nums)
    - Add input-specific classes (remove spinner, transparent background)

  ISSUE 2: Add flex vertical centering to score containers
    - Change `px-3 py-2 text-center` to `px-3 py-2 text-center flex flex-col justify-center`
    - This will vertically center all content in the score box

  ISSUE 3: Add backslash shortcut for tab cycling
    - Add useHotkeys('Backslash', ...) in OperatorControls.tsx
    - Cycle through adaptiveMode: scoring -> countdown -> chess-clock -> scoring
    - Use enableOnFormTags: false to prevent conflicts
    - Consider: This conflicts with chess clock switching. May need context-aware behavior
      (e.g., backslash switches tabs UNLESS in chess-clock mode, where it switches clocks)

  ISSUE 4: Remove icons from adaptive zone tab buttons
    - Line 267: Remove `<Timer className="size-3 me-1" />`
    - Line 276: Remove `<Users className="size-3 me-1" />`
    - Keep only text labels: "النقاط", "عد تنازلي", "المطاردة"
    - This makes tabs more compact and uniform (all text-only)

verification: Not yet applied

files_changed: []
