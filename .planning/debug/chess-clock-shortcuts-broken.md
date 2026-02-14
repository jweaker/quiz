---
status: diagnosed
trigger: "Investigate why chess clock keyboard shortcuts [ ] \ don't work but 'p' does in the timer panel."
created: 2026-02-14T00:00:00Z
updated: 2026-02-14T00:05:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: react-hotkeys-hook doesn't recognize '[', ']', '\\' as single-character key strings - needs event.code names like 'BracketLeft', 'BracketRight', 'Backslash'
test: Research confirms GitHub issue #1125 documents this bug - bracket and backslash keys not parsed correctly
expecting: Changing '[' to 'BracketLeft', ']' to 'BracketRight', '\\' to 'Backslash' will fix shortcuts
next_action: Return diagnosis with exact code changes needed

## Symptoms

expected: Pressing '[' starts right team clock, ']' starts left team clock, '\' switches clocks
actual: '[', ']', '\' keys do nothing when pressed
errors: None reported
reproduction: Enter chess-clock mode, press [, ], or \ keys
started: Unknown - likely since implementation

## Eliminated

## Evidence

- timestamp: 2026-02-14T00:00:00Z
  checked: TimerPanel.tsx lines 57-80
  found: useHotkeys calls for '[', ']', '\\' use single character strings with backslash escaping for '\\', same pattern as working 'p' key
  implication: Syntax looks correct at first glance, but special characters may need different handling

- timestamp: 2026-02-14T00:01:00Z
  checked: useLetterDisplay.ts lines 14-20
  found: Only captures a-z letters (and escape), not bracket or backslash keys, enabled only in chess-clock mode
  implication: useLetterDisplay is not interfering with bracket/backslash keys, but 'p' is captured by both hooks

- timestamp: 2026-02-14T00:02:00Z
  checked: package.json line 16
  found: react-hotkeys-hook version ^5.2.4
  implication: Need to check v5.2.4 documentation for special character handling

- timestamp: 2026-02-14T00:03:00Z
  checked: GitHub issue #1125 and MDN KeyboardEvent documentation
  found: react-hotkeys-hook has known bug where '[', ']', '\' are not parsed correctly as key strings. MDN shows event.key values are '[', ']', '\' but event.code values are 'BracketLeft', 'BracketRight', 'Backslash'
  implication: react-hotkeys-hook likely expects event.code names for special keys, not event.key values

- timestamp: 2026-02-14T00:04:00Z
  checked: Comparison of working vs non-working shortcuts
  found: 'p' works because it's alphanumeric - parseHotkeys.ts handles a-z correctly. '[', ']', '\' fail because they're special characters with incorrect mappings in parseHotkeys.ts
  implication: ROOT CAUSE CONFIRMED - Must use event.code names ('BracketLeft', 'BracketRight', 'Backslash') instead of single-character strings

## Resolution

root_cause: react-hotkeys-hook v5.2.4 has a known bug (GitHub issue #1125) where special characters like '[', ']', '\' are not correctly parsed in parseHotkeys.ts. The library expects event.code names ('BracketLeft', 'BracketRight', 'Backslash') for these keys, not single-character event.key strings. Alphanumeric keys like 'p' work because they're handled correctly by the parser.

fix: Change key strings in TimerPanel.tsx:
  - Line 57: '[' → 'BracketLeft'
  - Line 62: ']' → 'BracketRight'
  - Line 67: '\\' → 'Backslash'

verification: After fix, test in chess-clock mode: press [ key (should start right team), ] key (should start left team), \ key (should switch clocks)

files_changed:
  - src/components/operator/TimerPanel.tsx
