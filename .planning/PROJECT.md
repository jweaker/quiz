# بشائر المعرفة (Basha'ir Al-Ma'rifa)

## What This Is

A live TV quiz show application for a Ramadan program in Karbala, Iraq. Two teams of 5 compete through 8 sections — knowledge windows, puzzles, debate, poetic chase, animal guessing, and rapid-fire questions — operated by a backstage controller on a MacBook Pro with dual-screen output (operator panel + audience display). 6 teams compete across a 9-episode tournament.

## Core Value

The operator must be able to run every section of a live TV episode smoothly, with zero dead air — the audience display must always look polished and broadcast-ready while the operator has full control behind the scenes.

## Requirements

### Validated

<!-- Existing capabilities from current codebase -->

- ✓ Speed question section with reserve questions — existing
- ✓ Windows of Knowledge with 5 categories, 2 questions each — existing
- ✓ Puzzle section with team scoring — existing
- ✓ Debate section with judge/guest/audience voting — existing
- ✓ Poetic chase section — existing
- ✓ Ask Intelligently section with animal image display — existing
- ✓ Rapid questions section — existing
- ✓ Audience questions between sections — existing
- ✓ Team score tracking and display — existing
- ✓ Keyboard-driven operator controls — existing
- ✓ Arabic RTL interface with Cairo font — existing
- ✓ Blue color scheme — existing
- ✓ Audio feedback (correct/wrong/tick sounds) — existing
- ✓ Timer system per section — existing
- ✓ Turn management between teams — existing

### Active

<!-- New and changed requirements for this season -->

- [ ] Complete TypeScript migration from JavaScript
- [ ] Dual-screen architecture: operator control panel (laptop) + audience display (external)
- [ ] Configurable safe area / content boundaries (like game HUD margins)
- [ ] Team side swap (quickly switch left/right placement)
- [ ] Episode editor: create, edit, import, export episode data
- [ ] Improved episode data structure (cleaner, no redundant fields)
- [ ] Production-quality design with animations, possibly 3D elements
- [ ] نوافذ المعرفة renamed and restructured
- [ ] حقل الالغام (Minefield) replacing general questions: +16 correct / -8 wrong / 0 partial, special visual treatment
- [ ] Poetic chase chess clock: 100 seconds per team, remaining seconds convert to points (5s = 1 point), verse points, pass mechanic with return rules, quick letter display via keyboard
- [ ] Ask Intelligently dynamic animal grid (72 real photos in interactive grid instead of single pre-made image)
- [ ] Rapid questions: same 20 questions for both teams, 60 seconds, headphones isolation
- [ ] Debate timing: first round 60s, second round 40s per team (alternating)
- [ ] Puzzle section: configurable time per episode
- [ ] Tournament bracket display (when structure confirmed)
- [ ] Modern React best practices and clean architecture

### Out of Scope

- Mobile app — this is a MacBook-operated show
- Backend/server — stays client-side, data in files
- Multi-language — Arabic only (audience), operator UI Arabic
- Live streaming integration — separate system handles broadcast
- Score persistence across episodes — each episode is standalone

## Context

**Show format:** Ramadan TV quiz show, ~60 minutes per episode, filmed in Karbala, Iraq. Two teams of 5 people. Operator runs the app from backstage on a MacBook Pro, audience sees a big screen.

**Tournament:** 6 teams, 9 episodes. Tournament structure TBD — bracket visualization needed when confirmed.

**Episode flow (8 sections + audience questions between):**

1. **سؤال السرعة (Speed Question)** — First to answer determines who picks first. No points. Reserve questions if unanswered.

2. **نوافذ المعرفة (Windows of Knowledge)** — 5 windows with 2 questions each, up to 8 marks per question (partial scoring). Categories: العلوم الطبيعية، العلوم الانسانية، فنون واداب، الدين والسيرة، and the special حقل الالغام (Minefield). Teams pick windows and question numbers blindly. Minefield has 2 questions any team can pick: +16 correct, -8 wrong, 0 partial — needs distinct visual treatment.

3. **الألغاز (Puzzle)** — Configurable time per episode. Teams solve a puzzle and explain why. One team solves: 15 points. Both solve: first gets 10, second gets 5.

4. **النقاش (Debate)** — Topic discussion. Alternating: 60s first round, 40s second round per team. 3 judges + audience rep + guest of honor each vote up to 5, max 15 per team.

5. **المطاردة الشعرية (Poetic Chase)** — Chess clock style. Each team gets 100 seconds. Recite classical Arabic poetry where your verse starts with the letter the opponent's verse ended with. Clock runs continuously, switching on turn change. When one team hits 0, remaining seconds on the other team's clock convert to points (5s = 1 point). Each correct verse = 1 point. Pass mechanic: passed verse goes to opponent who gets +1 extra point; if they answer with the required letter they get another +1 and can return the same letter; if they use a new letter, no extra point and can't return the passed letter. Max 15 seconds per verse. Quick letter display via keyboard press.

6. **اسأل بذكاء (Ask Intelligently)** — 72 real animal photos displayed in a dynamic grid. One team picks an animal, other team gets 20 points and 2 minutes. They ask yes/no questions, each costing 1 point, to guess the animal.

7. **الرشق السريع (Rapid Questions)** — Same set of 20 questions for both teams. 60 seconds each. Teams wear headphones so they can't hear each other's answers.

8. **أسئلة الجمهور (Audience Questions)** — Simple questions for audience prizes. Flexible timing, operator triggers between sections.

**Debate scoring breakdown:** 3 judges (5 each) + audience representative (5) + guest of honor (5) = max 15 per team.

**Display setup:** Dual-screen — operator control panel on MacBook, audience view on external display/projector. Configurable safe area for when parts of the screen are obscured.

**Design direction:** Blue color scheme, show name بشائر المعرفة, no existing logo. Needs to look like a real TV quiz show — animations, polish, possibly 3D elements. Fun and clean.

**Existing codebase:** React 18 + JavaScript with Create React App. ~1000 lines of code, 10+ data files, keyboard-driven. Needs complete modernization.

## Constraints

- **Platform**: MacBook Pro, dual-screen output (laptop + external display)
- **Language**: TypeScript (migration from JavaScript)
- **UI Language**: Full Arabic RTL
- **Font**: Cairo (Arabic, from Google Fonts)
- **Color**: Blue color scheme (keep existing blue, open to refinement)
- **Runtime**: Client-side only, no backend server
- **Data**: Episode data stored as files (JSON or similar), loaded at startup
- **Operator**: Single operator controlling everything via keyboard/controls from backstage
- **Timing**: Needs to be ready for Ramadan season

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dual-screen (operator + audience) | Operator needs private controls, audience needs clean display | — Pending |
| TypeScript migration | Code quality, maintainability, type safety | — Pending |
| Configurable safe area | Bottom/edges of big screen may be obscured | — Pending |
| Chess clock for poetic chase | More dynamic than deduction-based scoring | — Pending |
| حقل الالغام replacing general questions | Higher stakes, more exciting TV | — Pending |
| Same questions for rapid round (headphones) | Fairer comparison between teams | — Pending |
| Dynamic animal grid | More visually engaging than static image | — Pending |
| Episode editor | Currently editing raw JSON is error-prone | — Pending |

---
*Last updated: 2026-02-08 after initialization*
