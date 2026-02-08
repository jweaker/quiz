# Architecture

**Analysis Date:** 2026-02-08

## Pattern Overview

**Overall:** React Context API + Client-Side State Management with React Router navigation

**Key Characteristics:**
- Single-page application (SPA) using React 18 and React Router v6
- Global state managed via React Context (not Redux or other state libraries)
- Keyboard-driven UI with event listeners on document level
- Component-based architecture with separation of concerns
- Data loaded from JSON config file at app startup
- Client-side rendering with no backend API calls

## Layers

**Presentation Layer (UI/Components):**
- Purpose: Render quiz interface, display questions, manage keyboard interactions, show scores
- Location: `src/components/` and `src/screens/`
- Contains: React functional components with hooks
- Depends on: Global context for state, React Router for navigation, react-icons for icons
- Used by: App root component

**State Management Layer (Context):**
- Purpose: Maintain quiz state (scores, turn management, question data, UI toggles) and provide access throughout app
- Location: `src/contexts/Global.js`
- Contains: React Context creation, provider wrapper, custom hook
- Depends on: Quiz data from `src/config/data.json`
- Used by: All screen components and some feature components

**Data Layer:**
- Purpose: Store quiz questions, answers, configurations, and metadata
- Location: `src/config/data.json` and alternate versions `data-1.json` through `data-8.json`
- Contains: Team names, all quiz parts (questions, durations, answers, marks)
- Structure: JSON with `leftTeamName`, `rightTeamName`, and `parts` containing quiz categories
- Used by: Global context on initialization

**Assets Layer:**
- Purpose: Store static media files (audio, images, videos) referenced by quiz questions
- Location: `src/assets/`
- Contains: PNG/JPG images, MP3/WAV audio files, MP4 videos
- Used by: Question component dynamically imports files based on question data

**Routing Layer:**
- Purpose: Handle navigation between quiz screens and maintain URL state
- Location: `src/App.js` with React Router setup in `src/index.js`
- Routes: Home (`/`), Windows (`/windows`), QuestionPicker (`/questionpicker/:id`), Question (`/question/:type/:id/:index`), Rate (`/rate/:type`)
- Used by: Navigation via `useNavigate()` hook

## Data Flow

**Quiz Initialization:**
1. `src/index.js` wraps app with `BrowserRouter` and `GlobalContextProvider`
2. `GlobalContextProvider` loads `data.json` and initializes state (scores, turn, question data)
3. User navigates to quiz sections via keyboard (numbers 1-8 on home screen)

**Question Display Flow:**
1. User selects quiz type from Home screen → navigates to appropriate route
2. Route determines question type (speedQuestions, debate, puzzles, windows, etc.)
3. Question component extracts question data from global context based on route params
4. Question component renders title, timer (CountdownCircleTimer), and media (audio or image)
5. User presses Z (correct) or X (wrong) → updates scores in context
6. Navigation handled by keyboard shortcuts (Escape, Enter, numeric keys)

**Scoring Flow:**
1. Answer recorded in Question component via keyboard input
2. Scores updated in global context state
3. For debate/puzzles/windows: User navigates to Rate screen
4. Rate component accumulates judge/guest/audience ratings
5. Enter key confirms and submits combined score back to context
6. Navigation returns to previous screens

**State Management:**
- Centralized in `GlobalContextProvider` context
- State includes: `rightScore`, `leftScore`, `rightsTurn`, `quickQuestion`, `audienceQuestion`, `turned`, `DATA`
- State updates propagate to all consuming components automatically
- No side effects persist to backend (client-side only)

## Key Abstractions

**Question Types:**
- `speedQuestions`: Fast-paced questions with 30-second timer
- `debate`: Freestyle discussion with 60-second timer
- `puzzles`: Logic puzzles with extended timer
- `windows`: Category-based questions (natural sciences, humanities, arts, religion, misc)
- `quickQuestions`: Sub-questions grouped by category
- `poeticChase`: Poetry-related questions with 15-second timer
- `askSmartly`: Team turn-based questions with 120-second timer and image support
- `audienceQuestions`: Questions for audience participation

**Global State Context:**
- Purpose: Single source of truth for quiz state accessible throughout app
- Location: `src/contexts/Global.js`
- Exposed via: `useGlobalContext()` custom hook
- Contains: Team scores, turn indicators, question data, UI flags

**Score Component:**
- Purpose: Display current team score, team name, and highlight active team's turn
- Location: `src/components/Score.js`
- Props: `right` (which team), `turn` (is active), `top/bottom` position, `overlay` mode, `zero` reset
- Reactive: Updates when scores change in context

**IconButton Component:**
- Purpose: Reusable button with icon, title, and state indicators
- Location: `src/components/IconButton.js`
- Props: Icon (React Icon component), title text, color, dimensions, `done` status, `active` state
- Pattern: Used in Home, Windows, and QuestionPicker screens

## Entry Points

**Application Root:**
- Location: `public/index.html`
- Mounts: React root at `<div id="root">`
- Initializes: React StrictMode, BrowserRouter, GlobalContextProvider

**JavaScript Entry:**
- Location: `src/index.js`
- Initializes: React DOM root, wraps App with providers
- Loads: App component from `src/App.js`

**App Component:**
- Location: `src/App.js`
- Responsibilities: Global keyboard listeners (Escape, 'c' for cursor toggle, 's' for turn swap), defines all routes, renders active route
- Routes defined: 6 main routes handling different quiz paths

**Home Screen:**
- Location: `src/screens/Home.js`
- Triggers: Main entry point after app initialization
- Responsibilities: Display 7 quiz type buttons, handle numeric key selection, manage keyboard navigation

## Error Handling

**Strategy:** Try-catch blocks with silent failures (errors logged to console, app continues)

**Patterns:**
- Async file import in Question component wrapped in try-catch for dynamic asset loading
- Optional chaining (`?.`) used throughout to handle undefined data structures
- Fallback question text and defaults when data is missing (e.g., "المطاردة الشعرية" for poeticChase type)
- Audio playback errors silently ignored, app continues functioning

**Example:** Question.js line 288-295 attempts to import question media file, catches error and logs it without crashing

## Cross-Cutting Concerns

**Logging:**
- Minimal logging via `console.log()` at strategic points (keyboard input, data access)
- No structured logging framework
- Debug logging visible in browser console

**Validation:**
- Route parameters parsed from URL but no explicit validation
- Question data accessed with optional chaining to handle missing properties
- Score calculations assume numeric values but cast to int with `parseInt()`

**Authentication:**
- Not applicable - no user authentication or backend access
- Client-side only application

**Keyboard Input Handling:**
- Global listeners attached to `document.addEventListener("keydown", handler)`
- Each screen component manages its own keyboard handlers
- Listeners properly cleaned up in useEffect return function
- Number keys (0-8) mapped to actions in Home screen
- Special keys (Z/X for answer, 1 for reset, 'e' for rate, 'm' for mark, 'f' for overlay) in Question screen
- Escape key navigates back, 'c' toggles cursor, 's' toggles turn

**Audio Management:**
- Audio elements created as state in Question component
- Multiple audio tracks: tick (loop), boom (complete), correct, wrong, whoosh
- Playback rate dynamically adjusted based on timer countdown
- Audio volume controlled (0.7 for loop, 1.0 for effects)
- Cleanup not explicitly done but audio state recreated on component mount

---

*Architecture analysis: 2026-02-08*
