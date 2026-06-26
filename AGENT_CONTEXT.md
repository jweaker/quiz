# Quiz Show Recovery Context

## Objective
Stabilize and improve the Ramadan quiz show app for live production use.

## Source of truth
- Current app: `/Users/jweaker/code/quiz`
- Legacy baseline (working flow): `/Users/jweaker/code/old-quiz`

## Current status (2026-02-24)
- Project has two UI paths:
  - Legacy route flow (`/windows`, `/question/*`, `/rate/*`) based on keyboard control.
  - Dual-screen flow (`/operator` + `/audience`) with Zustand + BroadcastChannel.
- High-risk regression area was `src/screens/Question.tsx` where old behavior had been partially lost.

## Implemented in this recovery pass
- Restored key legacy gameplay behavior in TypeScript:
  - Poetic Chase chess-clock behavior with 100s per team.
  - Rapid Questions as same question set for both teams (A/B phase flow).
  - Debate round timing sequence: 60, 60, 40, 40 seconds.
  - Puzzle duration fallback to episode settings when not set per-question.
  - Keyboard letter display in Poetic Chase by direct key press.
- Restored terminology in legacy screens:
  - `نوافذ المعرفة`
  - `حقل الالغام`
- Added legacy global controls:
  - `S` swap team sides.
  - `C` hide/show cursor.

## Implemented in the latest pass
- Operator `windows` flow now supports direct question selection (non-sequential) matching old project intent.
- `windows` timer is initialized/reset per selected question and displayed on audience windows screen.
- Poetic chase pass mechanic now follows requested scoring:
  - correct `+1`
  - wrong `+0`
  - pass `+0`
- Operator section transitions now normalize timer/chess-clock state to prevent stale timers.
- Timer store persistence for runtime timer values is disabled to prevent weird carry-over after reloads.
- Added old-flow mapping notes in `OLD_QUIZ_FLOW_MATCH.md`.

## Show rules and structure (latest user direction)
1. Speed Question: decides first team, no score.
2. نوافذ المعرفة:
   - 5 windows, 2 questions each.
   - Standard windows up to +8.
   - `حقل الالغام`: +16 correct, -8 wrong, 0 partial.
3. Puzzle:
   - Team puzzle solving, with custom episode-config duration.
4. Debate:
   - Alternating turns; second cycle is 40s each.
   - Scoring from judges/audience/guest (up to 15/team).
5. Poetic Chase:
   - Chess clock, 100s/team.
   - Verse points + time conversion (5s => 1 point) at finish.
   - Pass mechanic and letter display support needed.
6. Ask Smartly:
   - 2 minutes, yes/no question cost model, dynamic image grid target.
7. Rapid Questions:
   - Same 20-question set for both teams.
   - 60 seconds per team.
8. Audience questions between sections.

## Technical quality targets
- TypeScript-first code (strict and maintainable).
- Operator-focused controls and reliable keyboard mapping.
- Broadcast-safe state sync between operator and audience.
- Scalable episode schema + editor import/export/create/edit.
- Screen-safe content area controls for broadcast constraints.

## Critical open risks
- Legacy flow and dual-screen flow still coexist; behavior can drift.
- Some Poetic Chase pass-rule details are only partially modeled.
- Visual language remains inconsistent (operator utility look vs show aesthetic).

## Next implementation preference
Prefer improving `/operator` + `/audience` as the production path while keeping legacy routes stable as fallback.
