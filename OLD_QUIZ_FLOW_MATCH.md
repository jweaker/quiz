# Old Quiz Flow Mapping (Baseline -> Current)

## Goal
Use `../old-quiz` behavior as the runtime baseline for control flow and operator actions,
then improve UI/design without changing quiz logic.

## Verified baseline from old project

### Navigation flow
1. `Home` section launcher.
2. `Windows` category picker.
3. `QuestionPicker` direct question number selection per category.
4. `Question` runtime screen with timer/answer/score controls.

### Windows behavior (critical)
- Selection is **not sequential-only**.
- Operator chooses category, then directly chooses question number.
- Timer is tied to the selected question and visible on question screen.

### Poetic Chase baseline scoring
- Correct: `+1`.
- Wrong: `+0`.
- Pass: `+0` (clock/turn logic only).
- Time conversion: `5s = 1 point` when chase ends.

## Current alignment status (after fixes in this pass)

### Matched
- Windows operator flow now supports direct question selection (buttons), not just next/prev.
- Windows audience display now includes timer rendering path.
- Windows category naming aligned to `نوافذ المعرفة` and `حقل الألغام`.
- Poetic chase pass/correct/wrong logic aligned to `+1 / +0 / +0`.
- Timer runtime state is normalized on section transitions and no longer persists across reload.

### Remaining checks
- Full rehearsal validation for all hotkeys in operator mode.
- Ensure no duplicate time-bonus awarding in edge operator paths.
- Confirm exact intended behavior for pass + same-letter return rule extension.

## Files that currently implement this mapping
- `src/components/operator/sections/WindowsPanel.tsx`
- `src/components/audience/sections/WindowsDisplay.tsx`
- `src/components/audience/TimerDisplay.tsx`
- `src/hooks/usePassMechanic.ts`
- `src/components/operator/sections/PoeticChasePanel.tsx`
