# Phase 7 Research: Audio & Episode Management

**Date:** 2026-02-19
**Phase:** 07 — Audio & Episode Management

## 1. Audio Manager Singleton Architecture

### Current State
- `useTimerAudio` hook creates an `AudioContext` per instance (not a singleton)
- Preloads 4 sounds (tick, warning, urgent, final) via `AudioBuffer`
- Uses fire-and-forget `BufferSourceNode` pattern
- Located at `src/hooks/useTimerAudio.ts`

### Singleton Design
Refactor to a class-based `AudioManager` singleton at `src/lib/audioManager.ts`:

```
AudioManager (singleton)
├── AudioContext (single, shared)
├── GainNode: masterGain → ctx.destination
│   ├── GainNode: timerGain → masterGain
│   ├── GainNode: feedbackGain → masterGain
│   ├── GainNode: transitionGain → masterGain
│   └── GainNode: sectionGain → masterGain
├── buffers: Map<string, AudioBuffer>
├── preloadAll(): Promise<void>
├── play(soundId: string, options?: { gain?: number }): void
├── setMasterVolume(0-1): void
├── setCategoryVolume(category, 0-1): void
├── getMasterMuted(): boolean
├── toggleMute(): void
└── dispose(): void
```

**GainNode routing:** Each category GainNode connects to masterGain, which connects to `ctx.destination`. Setting masterGain to 0 mutes everything without stopping playback (requirement AUDIO-03). Category gains allow per-category volume from the mixer UI.

**Autoplay policy:** AudioContext starts suspended. Resume on first user interaction via a one-time click/keydown listener. The existing pattern in `useTimerAudio` already handles this.

**React integration:** Thin `useAudio()` hook wraps the singleton, exposes `play(soundId)`, `toggleMute()`, volume controls. The hook doesn't own the AudioContext lifecycle — the singleton does.

### Migration from useTimerAudio
- Extract AudioContext creation and buffer loading into AudioManager
- useTimerAudio becomes a thin wrapper calling `audioManager.play('tick')` etc.
- Backward compatible — existing timer audio keeps working

## 2. Sound Catalog & Sourcing

### Event → Sound Mapping (~18 sounds)

**Timer category:**
- `tick` — countdown tick (existing tick.wav)
- `timer-warning` — 10s threshold (existing beep-warning.mp3)
- `timer-urgent` — 5s threshold (existing beep-urgent.mp3)
- `timer-expire` — 0s alarm (existing beep-final.mp3)

**Feedback category:**
- `correct` — correct answer sting (orchestral rising hit)
- `wrong` — wrong answer sting (descending buzz/tone)
- `score-milestone` — score threshold celebration (fanfare)

**Transition category:**
- `section-enter` — section transition whoosh/sting
- `section-exit` — section exit swoosh
- `show-intro` — show opening fanfare
- `show-outro` — show closing fanfare

**Section-specific category:**
- `minefield-danger` — tension sting for Minefield entry
- `minefield-correct` — relief/triumph for +16
- `minefield-wrong` — dramatic fail for -8
- `debate-reveal` — dramatic reveal per vote slot
- `puzzle-solve` — puzzle completion fanfare
- `thinking-loop` — ambient tension loop (loopable)
- `pass-verse` — Poetic Chase pass swoosh

### Royalty-free Sources (Claude's Discretion)
- **Pixabay** (pixabay.com/sound-effects) — free, no attribution, large library of dramatic stings
- **Freesound.org** — CC0 licensed dramatic sounds
- **Mixkit** (mixkit.co/free-sound-effects) — free, no attribution
- Bundle as .mp3 files in `public/sounds/` (consistent with existing pattern)
- All files should be short (0.5-3s for stings, up to 30s for thinking loop)

## 3. Zod Episode Schema Design

### Schema Structure

```typescript
import { z } from 'zod'

const QuestionSchema = z.object({
  text: z.string().min(1),
  answer: z.string(),
  duration: z.number().positive(),
  marks: z.number().min(0),
  file: z.string().optional(),
  isImage: z.boolean().optional(),
})

const QuickQuestionSetSchema = z.object({
  title: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
})

const WindowsCategorySchema = z.array(QuestionSchema).min(1).max(2)

const WindowsSchema = z.object({
  naturalSciences: WindowsCategorySchema,
  humanSciences: WindowsCategorySchema,
  misc: WindowsCategorySchema,
  arts: WindowsCategorySchema,
  religion: WindowsCategorySchema,
})

const EpisodePartsSchema = z.object({
  speedQuestions: z.array(QuestionSchema).min(1),
  debate: QuestionSchema,  // single object, not array
  puzzles: z.array(QuestionSchema).min(1),
  windows: WindowsSchema,
  audienceQuestions: z.array(QuestionSchema),
  quickQuestions: z.array(QuickQuestionSetSchema),
})

const EpisodeSchema = z.object({
  version: z.literal(1).default(1),
  title: z.string().optional(),
  date: z.string().optional(),
  leftTeamName: z.string().min(1),
  rightTeamName: z.string().min(1),
  settings: z.object({
    puzzleDuration: z.number().positive().default(90),
    debateDuration: z.number().positive().default(60),
    rapidQuestionsDuration: z.number().positive().default(60),
    poeticChaseDuration: z.number().positive().default(100),
    askIntelligentlyDuration: z.number().positive().default(120),
  }).optional(),
  parts: EpisodePartsSchema,
})

type Episode = z.infer<typeof EpisodeSchema>
```

**Key decisions:**
- `version: z.literal(1)` enables future schema migrations
- `settings` object for per-episode config (DATA-07)
- Debate is a single object (matches existing data.json structure)
- Windows has exactly 5 fixed categories with 1-2 questions each
- `z.infer<typeof EpisodeSchema>` generates the TypeScript type — replaces manual EpisodeData interface

### Validation Strategy
- `EpisodeSchema.safeParse(data)` returns `{ success, data, error }`
- Error messages extracted via `error.flatten()` for field-level display
- Real-time validation: validate on every field change with debounce (300ms)
- Section-level validation: each section validated independently for incremental feedback

## 4. Paste Detection & Parsing

### Format Detection Heuristics

```
Input text → trim → detect:
1. Starts with '{' or '[' → try JSON.parse → JSON format
2. Contains '\t' on most lines → tab-separated (Q\tA per line)
3. Lines alternate Q/A pattern → line-based pairs
4. Fallback: treat each line as a question with empty answer
```

**Arabic considerations:**
- RTL text doesn't affect parsing (it's stored LTR in strings)
- Question marks: both `?` and `؟` (Arabic question mark) can signal Q/A boundaries
- Numbers: both Western (1,2,3) and Arabic-Indic (١,٢,٣) numerals in numbered lists

### Line-based Q/A Detection
```
Pattern 1: "Q: text\nA: text" or "س: text\nج: text"
Pattern 2: Numbered "1. question\n   answer" (indented answer)
Pattern 3: Alternating lines (odd=question, even=answer)
```

### Tab-separated
```
question\tanswer\tduration\tmarks
```
First row may be header — detect by checking if first cell matches known headers.

## 5. Browser File I/O

### Import (JSON file loading)
```typescript
// Via <input type="file" accept=".json">
const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const json = JSON.parse(event.target?.result as string)
    const result = EpisodeSchema.safeParse(json)
    if (result.success) setEpisode(result.data)
    else showErrors(result.error)
  }
  reader.readAsText(file)
}
```

### Export (JSON file download)
```typescript
const handleExport = (episode: Episode) => {
  const json = JSON.stringify(episode, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${episode.title || 'episode'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Operator Panel File Picker
- Add a "Load Episode" button to OperatorPanel or Settings
- Uses same `<input type="file">` pattern
- On load: validate with Zod → if valid, call `showStore.setData(parsed)`

## 6. Episode Editor Architecture

### Route & Layout
- New route: `/editor` at top level (not under /operator)
- Lazy-loaded: `const Editor = lazy(() => import('./screens/editor/EpisodeEditor'))`
- Single scrollable page with section cards

### Page Structure
```
[Header: title, new/import/export buttons, validation summary]
[Metadata: episode title, team names, date]
[Section: Speed Questions — question list + bulk paste]
[Section: Windows of Knowledge — 5 category groups]
[Section: Puzzle — questions + duration config]
[Section: Debate — topic + duration config]
[Section: Poetic Chase — (duration from settings)]
[Section: Ask Intelligently — (duration from settings)]
[Section: Rapid Questions — question list]
[Section: Audience Questions — question list]
[Footer: save/export, validation errors]
```

### Form State Management
- **React state + Zod** — no form library needed (shadcn/ui inputs are uncontrolled-friendly)
- Single `episode` state object at EditorPage level
- Section components receive their slice + setter callback
- Zod validation runs on the full episode object on change (debounced)
- Validation errors displayed inline per field and in summary banner

### Adaptive Section Forms
Each section type gets a dedicated form component:
- `SpeedQuestionsForm` — question/answer list, bulk paste area
- `WindowsForm` — 5 category tabs, 2 questions each
- `PuzzleForm` — question/answer + duration input
- `DebateForm` — topic text + duration
- `RapidQuestionsForm` — 20 questions, bulk paste
- `AudienceQuestionsForm` — flexible question list

### Starting Points
1. **Blank slate:** Empty episode with section structure scaffolded
2. **Template:** Pre-filled with placeholder text and default durations
3. **Clone:** File picker to load existing episode as starting point

## 7. Implementation Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AudioContext per-page limit | Audio stops working | Singleton ensures single context |
| Autoplay policy blocks sounds | No audio on first load | Resume on first interaction + visual indicator |
| Large sound files slow load | Playback delay | Keep files small (<100KB each), preload on app init |
| Zod bundle size | Larger app | Zod is ~13KB gzipped — acceptable |
| Complex editor form state | Bugs, lost data | Validate continuously, warn on navigation away |
| Arabic paste parsing | Wrong Q/A split | Multiple heuristics with fallback to manual edit |

## 8. Recommendations for Claude's Discretion

1. **Audio manager:** Class-based singleton at `src/lib/audioManager.ts` with GainNode routing chain. Thin `useAudio()` hook for React components.

2. **Zod version:** Use Zod v3 (stable, well-documented, 13KB gzipped). v4 is too new.

3. **Keyboard shortcuts for audio:** `m` for mute/unmute (add to 'general' category in shortcutRegistry). Volume controls via mixer UI only (not hotkeys — too many keys already used).

4. **Episode JSON versioning:** `version: 1` field at root. Future migrations can check version and transform.

5. **Form layout:** Each section as a collapsible card (shadcn Collapsible or simple div with toggle). Questions in a vertical list with add/remove/reorder buttons.

6. **Paste heuristics priority:** JSON → tab-separated → line-based Q/A → raw lines. Show preview of parsed result before committing.

---

*Research completed: 2026-02-19*
