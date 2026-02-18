# Phase 6: Quiz Sections - Research

**Researched:** 2026-02-19
**Domain:** React quiz section UI, Zustand state management, keyboard-driven operator controls, animation patterns
**Confidence:** HIGH

## Summary

Phase 6 builds all 8 quiz section types within the existing dual-screen architecture established in Phases 1-5. The codebase is already set up with the exact patterns Phase 6 needs: `useHotkeys` for keyboard controls, `AnimatePresence`/`motion` for transitions, Zustand stores with `broadcast` middleware for cross-window sync, and an adaptive zone in the operator panel ready to hold section-specific controls. No new libraries are required.

The key architectural insight is that Phase 6 does NOT create a new architecture — it fills in the current `AudienceDisplay` stub (which shows only the show title and timer) with real section-aware content, and extends the operator panel adaptive zone to have a fourth mode per active section. The existing `currentSection` field in `showStore` and `getSectionBackground()` mapping already handle section switching; Phase 6 adds the actual UI for each section type.

The largest complexity points are: (1) the Debate section's vote reveal sequence requires new transient state (votes entered but not revealed), (2) Ask Intelligently needs a 72-item grid with click tracking that is mouse-primary but must still broadcast via BroadcastChannel to the audience window, and (3) Windows of Knowledge needs a 5-category picker that also tracks question completion state already stored in `data.parts.windows`.

**Primary recommendation:** Extend `showStore` minimally (add per-section state slices for debate votes, question indices, and rapid question team switching), build section-specific operator adaptive panels that slot into `OperatorControls`, and drive the audience display via `currentSection` + new section-specific sub-state.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Question-to-answer flow:**
- Answers are shown on the audience display after the operator reveals them (not verbal-only)
- Advance behavior varies by section type — some auto-advance after scoring, others require manual advance (Claude determines per section based on section mechanics)
- Each operator step (show question, reveal answer, advance) is a single key press
- Question progress (e.g. "3/10") shown on operator panel only, not on audience display

**Debate judge voting interface:**
- Three input groups: Judges (3 judges combined), Audience rep (1), Guest (1)
- Each of the 5 judges gives a numeric score of 0-3 per team, max 15 total per team
- Audience display shows 3 slots: "Judges" (combined score of 3 judges), "Audience" (audience rep score), "Guest" (guest score)
- Votes revealed one slot at a time on audience display for dramatic effect
- Operator enters all votes before triggering sequential reveal

**Section-specific operator controls:**
- Common controls always visible in operator panel, section-specific controls added in adaptive zone
- Keyboard primary for all sections; mouse allowed for complex interactions (e.g. Ask Intelligently 72-photo grid)
- Both inline shortcut hints per section AND full overlay on ? key
- Full navigation within sections: operator can skip questions, go back, or jump to any question

### Claude's Discretion
- Which sections auto-advance vs require manual advance after scoring
- Specific key bindings per section (consistent with existing Phase 3-5 patterns)
- Layout of section-specific adaptive zone content
- Animation timing for debate vote reveals
- Ask Intelligently grid interaction design (mouse-driven)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SECT-01 | Speed Question — first to answer determines who picks first, no points, reserve questions if unanswered | Show question text on audience display with no timer; operator keys: Enter to show question, Z/X to mark answerer (right/left), N for next/reserve question; no score applied, only turn assignment |
| SECT-02 | نوافذ المعرفة (Windows of Knowledge) — 5 windows, 2 questions each, up to 8 marks per question with partial scoring | Windows picker grid in AudienceDisplay; each window tracks `done` state already in `data.parts.windows`; partial scoring uses existing +2/+8 hotkeys; operator shows category picker then question flow |
| SECT-03 | حقل الالغام (Minefield) — special window replacing general questions, +16 correct / -8 wrong / 0 partial, distinct visual treatment, 2 questions any team can pick | `MinefieldLayout` already exists and activates for `type === 'windows'`; Phase 6 adds granular detection for minefield questions specifically; existing +16/−8 hotkeys cover scoring |
| SECT-04 | Puzzle — configurable time per episode (set in episode config), solve + explain why, one solves = 15pts, both solve = 10 first + 5 second | `data.parts.puzzles[n].duration` holds configurable time; timer via `setCountdown`/`setCountdownRunning`; dual-solve tracked in section state; existing +10/+5/+15 hotkeys cover scoring |
| SECT-05 | Debate — alternating rounds (60s first, 40s second), 3 judges + audience rep + guest of honor each vote up to 5, max 15 per team | New `debateState` in `showStore`: votes object, revealed count; audience display renders 3 reveal slots; operator has numeric inputs for 5 judges (3+1+1 per team) |
| SECT-09 | Ask Intelligently — 72 real animal photos in dynamic interactive grid, one team picks, other team gets 20 points and 2 minutes, each yes/no question costs 1 point | Grid of 72 images from `assets/`; mouse click reveals/tracks yes-no; score decrements via `addActiveScore(-1)`; timer via countdown store; initial 20 points via `addActiveScore(20)` |
| SECT-10 | Rapid Questions — same set of 20 questions for both teams, 60 seconds each, headphones isolation (operator switches between teams) | Questions from `data.parts.quickQuestions`; operator panel shows current team + question; team switch key (Space or dedicated key) pauses/resumes timer and flips active team; audience display shows question text |
| SECT-11 | Audience Questions — simple questions for prizes, operator triggers flexibly between any sections | Minimal: operator shows question text on audience display; no timer needed; advance with Enter; can be triggered at any point via section jump in rundown rail |
</phase_requirements>

---

## Standard Stack

All libraries are already installed. No new dependencies required.

### Core (all already in project)
| Library | Version | Purpose | Why Used |
|---------|---------|---------|----------|
| zustand | ^5.0.11 | Global state for section content, debate votes, question indices | Already the state layer; broadcast middleware syncs to audience window |
| motion | ^12.34.0 | Animations for question reveal, vote reveal, grid animations | Already used for all Phase 5 animations |
| react-hotkeys-hook | ^5.2.4 | Keyboard shortcuts per section in operator panel | Already used for all operator shortcuts |
| react-router-dom | ^6.3.0 | Route structure (operator/audience paths) | Already used |
| tailwindcss | ^4.1.18 | Styling | Already used |
| lucide-react | ^0.563.0 | Icons in operator panel controls | Already used |

### No New Libraries Needed
The 72-photo grid for Ask Intelligently uses CSS grid with static image assets — no virtualization library needed at 72 items. The debate vote reveal uses `AnimatePresence` staggered reveals — no additional animation library needed.

**Installation:** None required.

---

## Architecture Patterns

### Recommended File Structure for Phase 6

```
src/
├── components/
│   ├── operator/
│   │   ├── sections/
│   │   │   ├── SpeedQuestionPanel.tsx      # adaptive zone for speed-question
│   │   │   ├── WindowsPanel.tsx            # adaptive zone for windows
│   │   │   ├── PuzzlePanel.tsx             # adaptive zone for puzzle
│   │   │   ├── DebatePanel.tsx             # adaptive zone for debate
│   │   │   ├── AskIntelligentlyPanel.tsx   # adaptive zone for ask-intelligently
│   │   │   ├── RapidQuestionsPanel.tsx     # adaptive zone for rapid-questions
│   │   │   └── AudienceQuestionsPanel.tsx  # adaptive zone for audience-questions
│   └── audience/
│       ├── sections/
│       │   ├── SpeedQuestionDisplay.tsx    # audience view for speed-question
│       │   ├── WindowsDisplay.tsx          # audience view for windows
│       │   ├── PuzzleDisplay.tsx           # audience view for puzzle
│       │   ├── DebateDisplay.tsx           # audience view for debate
│       │   ├── AskIntelligentlyDisplay.tsx # audience view for ask-intelligently
│       │   ├── RapidQuestionsDisplay.tsx   # audience view for rapid-questions
│       │   └── AudienceQuestionsDisplay.tsx
├── state/
│   └── showStore.ts                        # extended with sectionState slice
```

### Pattern 1: Adaptive Zone Section Panels

The operator panel's `OperatorControls.tsx` currently has a fixed `AdaptiveMode` type (`'scoring' | 'countdown' | 'chess-clock'`). Phase 6 extends this with a section-driven fourth mode: when a section is active, the adaptive zone shows that section's panel.

**What:** When `currentSection` changes, the adaptive zone automatically switches to show that section's controls in addition to the existing tabs. A new `'section'` mode is added to `AdaptiveMode`.

**When to use:** For all 8 section types — each gets a dedicated panel component that renders in the adaptive zone.

**Example pattern from existing code (OperatorControls.tsx):**
```typescript
// Source: src/screens/operator/OperatorControls.tsx (existing pattern)

// EXTEND this type:
type AdaptiveMode = 'scoring' | 'countdown' | 'chess-clock' | 'section'

// ADD section-specific tab that activates when currentSection is set:
const currentSection = useShowStore((s) => s.currentSection)

// In adaptive zone render:
{adaptiveMode === 'section' && currentSection === 'speed-question' && (
  <motion.div key="speed-question" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <SpeedQuestionPanel />
  </motion.div>
)}
```

### Pattern 2: Section State Extension in showStore

Add a `sectionState` slice to `showStore` to track per-section transient state. This state must go through `broadcast` so the audience window receives it.

**What:** A single `sectionState` object in `showStore` that holds the current section's active content (question index, revealed answer, debate votes, etc.).

**Why centralized:** Cross-window sync via BroadcastChannel. The audience display needs to know which question is shown, whether the answer is revealed, and debate vote reveal progress.

```typescript
// Source: pattern from src/state/showStore.ts (existing broadcast + temporal pattern)
// Add to ShowState interface:
interface SectionState {
  questionIndex: number         // current question being shown (0-based)
  answerRevealed: boolean       // whether answer is shown on audience
  // Debate-specific:
  debateVotes: {
    right: { judges: number; audience: number; guest: number }
    left:  { judges: number; audience: number; guest: number }
  } | null
  debateRevealedCount: number   // 0=none, 1=judges revealed, 2=+audience, 3=+guest
  // Ask Intelligently:
  askedQuestions: number        // count of yes/no questions asked (deducted from 20pt bonus)
  // Rapid Questions:
  rapidActiveTeam: 'right' | 'left' | null
}

// Action:
setSectionState: (update: Partial<SectionState>) => void
resetSectionState: () => void
```

**Critical:** `sectionState` must be included in `broadcast` middleware serialization but excluded from `temporal` (we don't need undo for question navigation — use `Cmd+Z` only for scores).

### Pattern 3: Question Flow — Show/Reveal/Advance

The locked decision establishes a three-step key-press pattern per question. Implement this as a state machine within each section panel.

**Steps:**
1. **Enter** — show question text on audience display (`answerRevealed: false`, `questionIndex: n`)
2. **Enter again** — reveal answer on audience display (`answerRevealed: true`)
3. **Apply score** (section-specific key) — apply points using existing hotkeys
4. **Arrow right/left** — advance to next or previous question (`questionIndex: n+1`)

**Implementation:** Each section panel registers its own `useHotkeys` bindings that only fire when that section is active. Use the `enabled` option from react-hotkeys-hook to gate by section.

```typescript
// Source: pattern from src/hooks/useScoreControls.ts + react-hotkeys-hook docs
useHotkeys(
  'enter',
  () => {
    const { sectionState, setSectionState } = useShowStore.getState()
    if (!sectionState.answerRevealed) {
      setSectionState({ answerRevealed: true })
    } else {
      // advance to next question
      setSectionState({ questionIndex: sectionState.questionIndex + 1, answerRevealed: false })
    }
  },
  { enabled: currentSection === 'speed-question', enableOnFormTags: false },
  [currentSection]
)
```

### Pattern 4: Audience Display Section Routing

`AudienceDisplay.tsx` currently renders the show title and timer for all sections. Phase 6 replaces this stub with a section router inside `WipeTransition`.

```typescript
// Source: src/screens/audience/AudienceDisplay.tsx (existing pattern to extend)
// Inside the WipeTransition > MinefieldLayout > div:
{currentSection === 'speed-question' && <SpeedQuestionDisplay />}
{currentSection === 'windows' && <WindowsDisplay />}
{currentSection === 'puzzle' && <PuzzleDisplay />}
{currentSection === 'debate' && <DebateDisplay />}
{currentSection === 'ask-intelligently' && <AskIntelligentlyDisplay />}
{currentSection === 'rapid-questions' && <RapidQuestionsDisplay />}
{currentSection === 'audience-questions' && <AudienceQuestionsDisplay />}
{!currentSection && <IdleDisplay />}  {/* show title when no section active */}
```

### Pattern 5: Debate Vote Reveal Sequence

The debate section requires entering all votes, then revealing them one slot at a time for dramatic effect. This is the most complex UI in Phase 6.

**State:** `debateVotes` (entered by operator before reveal), `debateRevealedCount` (0→3, increments on each reveal key press).

**Operator flow:**
1. Enter all 6 vote values (3 judges + audience + guest × 2 teams) into numeric inputs in operator panel
2. Press `Enter` to trigger first reveal (Judges slot appears on audience)
3. Press `Enter` again for Audience slot
4. Press `Enter` again for Guest slot
5. Press `Enter` to apply total scores to both teams and advance

**Audience display:** 3 cards with `AnimatePresence` — each card animates in when its `debateRevealedCount` threshold is met.

```typescript
// Source: motion/react AnimatePresence pattern (existing in codebase)
<AnimatePresence>
  {debateRevealedCount >= 1 && (
    <motion.div
      key="judges"
      initial={{ scale: 0.5, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <VoteSlot label="الحكام" value={votes.right.judges + votes.left.judges} />
    </motion.div>
  )}
</AnimatePresence>
```

### Pattern 6: Ask Intelligently Grid (Mouse-Primary)

72 images in a grid where the operator clicks to reveal/interact. This is the one section where mouse is the primary input per locked decision.

**Grid layout:** CSS grid with `auto-fill` columns at ~80px each fills well at typical operator panel widths. At 72 items with thumbnails, no virtualization needed.

**State tracked:** Which grid items have been asked about (boolean array of 72). Each click on an item marks it as "asked" and decrements the team's remaining point balance (`addActiveScore(-1)`).

**Images:** Load from `src/assets/` or `public/` folder. The existing `data.json` pattern shows `file: "animals.png"` — Phase 6 likely uses individual numbered images (`animal-01.jpg` ... `animal-72.jpg`) or a JSON manifest.

**Key question (LOW confidence):** Whether the 72 animal images exist as individual files or as a sprite sheet. The existing `Question.tsx` references `animals.png` as a single image — Phase 6 may need to investigate the actual assets structure.

### Anti-Patterns to Avoid

- **Separate route per section:** The old codebase (Rate.tsx, Windows.tsx, Question.tsx) used separate routes with `navigate(-1)` for back navigation. Phase 6 must NOT do this — everything stays within the `AudienceDisplay` and `OperatorControls` components, driven by `showStore.currentSection`.
- **Local state for cross-window data:** Any state the audience display needs must go through `showStore` (broadcast middleware). Don't use React local state for question index or reveal status.
- **Re-implementing timer logic:** The `useCountdown` and `useChessClock` hooks already exist. Puzzle and Debate use `setCountdown(duration)` + `setCountdownRunning(true)` — don't build new timer logic.
- **Blocking `enableOnFormTags`:** The Debate panel uses numeric inputs for vote entry. Section hotkeys that would conflict (Enter for reveal) need special handling — check `enableOnFormTags: false` isn't set when you need Enter to trigger reveal after focus leaves inputs.

---

## Auto-Advance Recommendations (Claude's Discretion)

Based on section mechanics:

| Section | After Scoring | Advance Behavior | Rationale |
|---------|---------------|------------------|-----------|
| Speed Question | N/A (no score) | Manual (press key) | Operator may need to show reserve questions before deciding turn |
| Windows of Knowledge | Manual | Manual | Category picker must stay visible; operator selects next window |
| Minefield | Manual | Manual | Both teams can pick; operator needs to control pacing |
| Puzzle | Manual | Manual | Dual-solve scenario; operator may need to set timer for second team |
| Debate | Auto after final reveal | Auto-advance after score applied | Reveal sequence is the final step; no user choice after scoring |
| Ask Intelligently | Manual | Manual | Grid stays up; operator ends section when done |
| Rapid Questions | Manual team switch | Manual | Operator explicitly switches teams; questions shared |
| Audience Questions | Manual | Manual | Flexible triggering — operator decides when to show |

---

## Key Binding Recommendations (Claude's Discretion)

Consistent with existing Phase 3-5 patterns (`useScoreControls.ts`, `shortcutRegistry.ts`):

| Action | Key | Section |
|--------|-----|---------|
| Show question / reveal answer | Enter | All sections |
| Next question (forward) | ArrowRight or N | All sections |
| Previous question (back) | ArrowLeft or B | All sections |
| Jump to question # | Number keys | All sections (operator types number) |
| Mark right team answered | Z | Speed Question |
| Mark left team answered | X | Speed Question |
| Next reserve question | N | Speed Question |
| Trigger next debate reveal | Enter | Debate |
| Apply debate total scores | Enter (4th press) | Debate |
| Switch active team | Space (or S) | Rapid Questions |
| End Ask Intelligently | E | Ask Intelligently |
| Trigger audience question | (via rundown jump) | Audience Questions |

**Conflict check:** `Enter` for reveal does not conflict with existing shortcuts (Enter is not registered in `shortcutRegistry.ts`). `N` for next question conflicts with nothing registered. `Z`/`X` exist in the old `Question.tsx` but are not in the new `useScoreControls` hook — safe to re-register for speed question.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Timer countdown | Custom timer with setInterval | `useCountdown` + `useTimerStore.setCountdown` | Already exists, handles worker-timers, Web Audio API beeps |
| Cross-window state sync | Custom postMessage | `broadcast` middleware in showStore | Already implemented, handles echo prevention and late-join |
| Undo/redo for scores | Custom history | `useShowStore.temporal.getState().undo()` | Already wired via zundo |
| Animation sequencing | Manual setTimeout chains | `AnimatePresence` + `staggerChildren` | Already in use throughout codebase |
| Keyboard shortcuts | `document.addEventListener('keydown')` | `useHotkeys` from react-hotkeys-hook | Already the established pattern; handles enableOnFormTags |
| Section background colors | Hardcoded inline styles | `getSectionBackground(sectionType)` | Already defined in `animationPresets.ts` for all 8 section types |

**Key insight:** Every infrastructure piece Phase 6 needs was built in Phases 1-5. The work is UI composition, not infrastructure.

---

## Common Pitfalls

### Pitfall 1: Debate Votes in Local State
**What goes wrong:** Operator enters votes in React `useState`, but audience window never receives them because local state doesn't go through BroadcastChannel.
**Why it happens:** Votes are entered on the operator side and need to appear on the audience side during the reveal.
**How to avoid:** Store `debateVotes` in `showStore` (which has `broadcast` middleware). Operator inputs write to store; audience display reads from store.
**Warning signs:** Audience display shows no vote values during reveal.

### Pitfall 2: Enter Key Conflicts in Debate Panel
**What goes wrong:** The `Enter` key both submits numeric inputs and triggers debate reveal sequence.
**Why it happens:** `useHotkeys('enter', ...)` fires even when a form input has focus if `enableOnFormTags` is not set to `false`, but we actually DO need Enter to trigger reveal after filling inputs.
**How to avoid:** Use two separate interactions: Enter triggers vote submission only when no input is focused (operator clicks "Confirm" button or presses Tab to blur, then Enter for reveal). OR use a dedicated non-Enter key (e.g., `F` key) for reveal steps.
**Warning signs:** Reveal triggers while operator is still typing vote values.

### Pitfall 3: MinefieldLayout Granularity
**What goes wrong:** `MinefieldLayout` currently activates for the entire `'windows'` section type. Minefield questions are a subset within Windows. Activating the Minefield visual for all Windows questions is wrong.
**Why it happens:** Current code: `<MinefieldLayout active={currentSectionType === 'windows'}>` — this is too broad.
**How to avoid:** Add a `isMinefieldQuestion` flag to `sectionState` in `showStore` that the operator sets when the active question is a minefield question. `MinefieldLayout` reads this flag instead of the section type.
**Warning signs:** Dark Minefield background appears for all Windows questions, not just minefield ones.

### Pitfall 4: Ask Intelligently Image Assets
**What goes wrong:** Assuming 72 individual image files exist when they may be a sprite or single composite image.
**Why it happens:** The old `Question.tsx` references `animals.png` (single image) not `animal-01.png` through `animal-72.png`.
**How to avoid:** Before implementing the grid, check `src/assets/` and `public/` for the actual animal image files. If it's a single PNG, the grid needs to use CSS `background-position` offsets. If individual files, use `<img>` tags.
**Warning signs:** 72 broken image tags in the grid.

### Pitfall 5: sectionState Not Reset on Section Change
**What goes wrong:** `questionIndex` from the previous section persists when operator jumps to a new section, causing wrong question to display.
**Why it happens:** `jumpToSection` in `showStore` changes `currentSection` but doesn't reset `sectionState`.
**How to avoid:** Call `resetSectionState()` inside `jumpToSection` action, or add a `useEffect` in the section panels that resets on mount.
**Warning signs:** Second time entering a section, it opens to last question instead of first.

### Pitfall 6: Rapid Questions Timer Isolation
**What goes wrong:** Timer continues running when operator switches between teams, giving second team an advantage.
**Why it happens:** `setCountdownRunning(false)` is not called on team switch.
**How to avoid:** Team switch action must: (1) pause timer, (2) record time used by first team, (3) reset countdown for second team's 60 seconds, (4) wait for operator to manually start next team's timer.
**Warning signs:** Second team's timer starts immediately on switch without operator action.

### Pitfall 7: Windows + Minefield Category Data Structure
**What goes wrong:** Trying to add Minefield as a 6th category when it's supposed to replace the `misc` window (or be a special 2-question pool).
**Why it happens:** Minefield is "special window replacing general questions" per SECT-03. The existing `data.parts.windows` has 5 categories: `naturalSciences`, `humanSciences`, `misc`, `arts`, `religion`. Minefield likely replaces `misc` or is a separate key.
**How to avoid:** Check existing episode data files (`config/data-*.json`) for whether a `minefield` key already exists in parts. Treat it as a separate 2-question pool, not a 6th window category.
**Warning signs:** Minefield questions showing in normal Windows picker grid.

---

## Code Examples

Verified patterns from existing codebase:

### Adding Section State to showStore
```typescript
// Source: src/state/showStore.ts (extending existing pattern)

// Add to ShowState interface:
sectionState: {
  questionIndex: number
  answerRevealed: boolean
  debateVotes: {
    right: { judges: number; audience: number; guest: number }
    left:  { judges: number; audience: number; guest: number }
  } | null
  debateRevealedCount: number
  askedQuestions: number
  rapidActiveTeam: 'right' | 'left' | null
}
setSectionState: (update: Partial<ShowState['sectionState']>) => void
resetSectionState: () => void

// Initial state:
sectionState: {
  questionIndex: 0,
  answerRevealed: false,
  debateVotes: null,
  debateRevealedCount: 0,
  askedQuestions: 0,
  rapidActiveTeam: null,
}

// Action (use set, which triggers broadcast automatically):
setSectionState: (update) => set((state) => ({
  sectionState: { ...state.sectionState, ...update }
})),
resetSectionState: () => set({
  sectionState: { /* initial values */ }
}),
```

### Section-Specific Hotkeys (gated by section)
```typescript
// Source: pattern from src/hooks/useScoreControls.ts + react-hotkeys-hook
// In SpeedQuestionPanel.tsx:

const currentSection = useShowStore((s) => s.currentSection)
const isActive = currentSection === 'speed-question'

// Advance to next/reserve question
useHotkeys(
  'n',
  () => {
    const { sectionState, setSectionState } = useShowStore.getState()
    setSectionState({
      questionIndex: sectionState.questionIndex + 1,
      answerRevealed: false,
    })
  },
  { enabled: isActive, enableOnFormTags: false },
  [isActive]
)

// Mark right team answered (assign turn)
useHotkeys(
  'z',
  () => {
    useShowStore.getState().setRightsTurn(true)
    useShowStore.getState().setTurned(true)
  },
  { enabled: isActive, enableOnFormTags: false },
  [isActive]
)
```

### Debate Vote Reveal on Audience Display
```typescript
// Source: motion/react AnimatePresence (already used in codebase)
// In DebateDisplay.tsx:

const debateVotes = useShowStore((s) => s.sectionState.debateVotes)
const revealedCount = useShowStore((s) => s.sectionState.debateRevealedCount)

const slots = [
  { key: 'judges', label: 'الحكام', right: debateVotes?.right.judges ?? 0, left: debateVotes?.left.judges ?? 0 },
  { key: 'audience', label: 'الجمهور', right: debateVotes?.right.audience ?? 0, left: debateVotes?.left.audience ?? 0 },
  { key: 'guest', label: 'الضيف', right: debateVotes?.right.guest ?? 0, left: debateVotes?.left.guest ?? 0 },
]

return (
  <div className="flex gap-8 justify-center items-end">
    <AnimatePresence>
      {slots.map((slot, i) =>
        revealedCount > i ? (
          <motion.div
            key={slot.key}
            initial={{ scale: 0.3, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <span className="text-white text-4xl font-bold">{slot.label}</span>
            <div className="flex gap-4 mt-2">
              <span className="western-numerals text-amber-400 text-8xl font-bold">{slot.right}</span>
              <span className="text-white text-8xl opacity-40">:</span>
              <span className="western-numerals text-amber-400 text-8xl font-bold">{slot.left}</span>
            </div>
          </motion.div>
        ) : null
      )}
    </AnimatePresence>
  </div>
)
```

### Extending Shortcut Registry for Section Shortcuts
```typescript
// Source: src/lib/shortcutRegistry.ts (existing pattern)
// Add a new category 'section' to ShortcutCategory:
export type ShortcutCategory = 'scoring' | 'timer' | 'navigation' | 'chess-clock' | 'general' | 'section'

// Add section-specific entries:
'section-next-question': { keys: 'n', label: 'السؤال التالي', category: 'section' },
'section-prev-question': { keys: 'b', label: 'السؤال السابق', category: 'section' },
'section-show-answer': { keys: 'enter', label: 'عرض الإجابة', category: 'section' },
'section-right-answered': { keys: 'z', label: 'أجاب الأيمن', category: 'section', description: 'سؤال السرعة' },
'section-left-answered': { keys: 'x', label: 'أجاب الأيسر', category: 'section', description: 'سؤال السرعة' },
'section-switch-team': { keys: 'space', label: 'تبديل الفريق', category: 'section', description: 'الرشق السريع' },
'section-next-reveal': { keys: 'enter', label: 'الكشف التالي', category: 'section', description: 'النقاش' },
```

### Windows Category Picker Pattern
```typescript
// Source: existing Windows.tsx (legacy, to be replaced in audience display)
// Modern version in WindowsDisplay.tsx:

const WINDOWS_CATEGORIES = [
  { key: 'religion', label: 'الدين والسيرة' },
  { key: 'humanSciences', label: 'العلوم الإنسانية' },
  { key: 'naturalSciences', label: 'العلوم الطبيعية' },
  { key: 'arts', label: 'الأدب والفنون' },
  { key: 'misc', label: 'أسئلة عامة' },
] as const

// Data access (already in showStore):
const windows = useShowStore((s) => s.data?.parts.windows)
// windows.religion[0].done, windows.religion[1].done, etc.
```

---

## Section Mechanics Summary (Design Decisions for Planner)

### Speed Question (SECT-01)
- **Audience display:** Question text (no timer, no answer until revealed)
- **No scoring** — only turn assignment (Z = right team gets turn, X = left team gets turn)
- **Reserve questions:** If unanswered, operator presses N to show next reserve question
- **Auto-advance:** No — operator must explicitly assign turn before moving on
- **Operator panel:** Shows question number (e.g., "1/3"), question text preview, Z/X/N keys

### Windows of Knowledge (SECT-02)
- **Audience display:** Category picker grid (5 categories) → question → answer
- **Partial scoring:** Up to 8 marks per question; operator uses +2/+4/+8 presets or custom
- **Category tracking:** `data.parts.windows[category][0/1].done` marks completion
- **Auto-advance:** No — operator picks next category
- **Operator panel:** Category grid showing done/undone status, current question, progress

### Minefield (SECT-03)
- **Audience display:** Minefield visual treatment (dark + spotlight + red glow, from existing `MinefieldLayout`)
- **Two questions:** Both teams can pick; scoring +16/−8/0 via existing hotkeys
- **Integration:** Shown as a special option within the Windows section picker
- **Auto-advance:** No — operator controls pacing
- **Operator panel:** Shows 2 minefield questions, which are taken/remaining

### Puzzle (SECT-04)
- **Audience display:** Puzzle text, countdown timer (from `data.parts.puzzles[n].duration`)
- **Dual-solve:** If first team solves → +15 pts for them; if second team also solves → +10 first, +5 second (use existing +10 and +5 hotkeys in two separate presses)
- **Timer:** Use `setCountdown(puzzle.duration)` from timerStore
- **Auto-advance:** No — operator manages dual-solve flow
- **Operator panel:** Start/stop timer, mark first/second solve

### Debate (SECT-05)
- **Audience display:** Debate topic → vote reveal slots (3 slots, one at a time)
- **Two rounds:** 60s first team, 40s second team (both teams visible, timer shows current)
- **Vote entry:** Operator enters all votes in panel inputs before triggering reveal
- **Auto-advance:** Yes — after 3rd reveal press, scores auto-applied
- **Operator panel:** 5 input groups per team (judges ×3, audience, guest), Enter to reveal

### Ask Intelligently (SECT-09)
- **Audience display:** 72 animal photos in grid, hidden until operator interaction
- **Team assignment:** One team picks which animal; other team asks yes/no questions
- **Initial points:** 20 points to asking team (`addActiveScore(20)`), then −1 per question (`addActiveScore(-1)`)
- **Timer:** 2-minute countdown via `setCountdown(120)`
- **Operator panel:** Mouse-driven grid for operator to track revealed animals, point balance counter
- **Auto-advance:** No — operator ends section manually (E key or button)

### Rapid Questions (SECT-10)
- **Audience display:** Question text (same questions for both teams)
- **Same 20 questions:** Both teams answer same set; operator tracks per-team
- **Timer:** 60 seconds per team; operator manually starts each team's timer
- **Team isolation:** Operator switches teams (Space or dedicated key), pauses timer
- **Auto-advance:** No — operator explicitly switches
- **Operator panel:** Question list, team selector, per-team time tracking

### Audience Questions (SECT-11)
- **Audience display:** Simple question text and answer (same flow as speed question)
- **No timer:** Simple show/reveal
- **Flexible triggering:** Can be activated by jumping to section via rundown rail at any point
- **Auto-advance:** No — operator controls fully

---

## State of the Art

| Old Approach (Legacy Question.tsx) | New Phase 6 Approach | Impact |
|------------------------------------|---------------------|--------|
| Separate React Router routes per question type | Single `currentSection` + section components in `AudienceDisplay` | No page navigation, smooth wipe transitions, state persists |
| `document.addEventListener('keydown')` with long switch statement | `useHotkeys` hooks with `enabled` option per section | Cleaner, composable, no manual cleanup |
| HTMLAudioElement for sound | Web Audio API via `useTimerAudio` | Already done in Phase 5; Phase 6 can reuse |
| Navigate to `/rate/:type` for vote entry | Inline operator panel vote inputs + store | No page navigation for vote entry |
| All section logic in one monolithic `Question.tsx` | Per-section panel + display components | Maintainable, testable, no cross-section bugs |

---

## Open Questions

1. **Ask Intelligently image assets**
   - What we know: `Question.tsx` references `animals.png` (single composite image)
   - What's unclear: Are there 72 individual animal images, or is it a sprite sheet, or a static grid image?
   - Recommendation: Check `src/assets/` before implementing the grid. If only `animals.png` exists, the grid implementation needs to change (use CSS grid of clickable zones over a single image, or source 72 individual images).

2. **Minefield question location in episode data**
   - What we know: `data.parts.windows` has 5 categories; SECT-03 says "special window replacing general questions"
   - What's unclear: Is minefield data at `data.parts.windows.misc` (replacing misc), or a separate key like `data.parts.minefield`?
   - Recommendation: Check `config/data.json` and `config/data-1.json` through `data-8.json` for a `minefield` key. If absent, treat it as using `misc` questions with `+16/-8/0` scoring applied.

3. **Puzzle configurable time per episode**
   - What we know: `data.parts.puzzles[n].duration` field exists (seen in data.json: `"duration": 90`)
   - What's unclear: Whether this duration field is already the intended "configurable per episode" mechanism
   - Recommendation: HIGH confidence this is already correct — `duration` in puzzle data drives `setCountdown(puzzle.duration)` in the timer.

4. **Debate: 3 judges combined vs individual**
   - What we know: Operator enters "judges" as a combined score (one number representing all 3 judges), not 3 separate inputs
   - What's unclear: Whether the audience display should show "Judges: 9" (combined) or show individual judge scores
   - Recommendation: Show combined value per locked decision: "Audience display shows 3 slots: Judges (combined score of 3 judges), Audience (audience rep score), Guest (guest score)". One number per slot.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `src/state/showStore.ts` — existing state shape, broadcast middleware, section navigation
- Codebase: `src/screens/operator/OperatorControls.tsx` — adaptive zone pattern, existing hotkey registrations
- Codebase: `src/screens/audience/AudienceDisplay.tsx` — section routing stub, MinefieldLayout usage
- Codebase: `src/lib/shortcutRegistry.ts` — existing key bindings (verified no conflicts with proposed new keys)
- Codebase: `src/lib/animationPresets.ts` — `getSectionBackground` already maps all 8 section types
- Codebase: `src/components/animations/MinefieldLayout.tsx` — existing Minefield visual treatment
- Codebase: `src/screens/Rate.tsx` — legacy debate vote UI (replaced in Phase 6)
- Codebase: `src/config/data.json` — episode data structure including `windows`, `puzzles`, `debate`, `speedQuestions`, `audienceQuestions`, `quickQuestions`
- Codebase: `package.json` — exact library versions (motion 12.34.0, react-hotkeys-hook 5.2.4, zustand 5.0.11)

### Secondary (MEDIUM confidence)
- Phase 5 RESEARCH.md — established patterns for adaptive zone, animation timing, RTL patterns
- Codebase: `src/screens/Windows.tsx` (legacy) — category key names and data access patterns for windows section

### Tertiary (LOW confidence)
- Ask Intelligently image asset structure — assumed based on `animals.png` reference in `Question.tsx`; actual asset layout unverified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed in package.json, versions exact
- Architecture: HIGH — patterns derived directly from existing codebase analysis
- Section mechanics: HIGH — derived from REQUIREMENTS.md + CONTEXT.md decisions
- Key bindings: MEDIUM — consistent with existing registry but final assignments are Claude's discretion
- Image assets: LOW — Ask Intelligently grid depends on unverified asset structure

**Research date:** 2026-02-19
**Valid until:** 2026-03-21 (30 days — stable codebase, no fast-moving dependencies)
