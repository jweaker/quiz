# Coding Conventions

**Analysis Date:** 2026-02-08

## Naming Patterns

**Files:**
- Component files: PascalCase (e.g., `Score.js`, `IconButton.js`, `Question.js`)
- Screen files: PascalCase (e.g., `Home.js`, `Windows.js`, `Rate.js`, `QuestionPicker.js`)
- Context files: PascalCase (e.g., `Global.js`)
- Style files: Match component name with `.css` extension (e.g., `App.css`, `Score.css`, `Home.css`)
- Config/data files: lowercase or kebab-case (e.g., `data.json`, `data-1.json`)

**Functions:**
- React components: PascalCase (e.g., `export default function App()`, `export default function Score()`)
- Utility functions and callbacks: camelCase (e.g., `handleKeyDown`, `pauseAudio`, `triggerComplete`)
- Custom hooks: camelCase prefixed with 'use' (e.g., `useGlobalContext`)
- Event handlers: camelCase with 'handle' prefix (e.g., `handleKeyDown`, `handleChange`)

**Variables:**
- State variables: camelCase (e.g., `isPlaying`, `isComplete`, `zdone`, `showOverlay`)
- Context state setters: camelCase with 'set' prefix (e.g., `setRightScore`, `setLeftScore`, `setRightsTurn`)
- Local constants: camelCase (e.g., `type`, `navigate`, `params`)
- DOM queries/references: camelCase (e.g., `sourceAudio`, `audio`, `fileLoc`)

**Types/Objects:**
- Context objects: PascalCase (e.g., `MyContext`)
- Import names: Preserve source naming (e.g., `Routes`, `Route`, `useNavigate` from 'react-router-dom')

## Code Style

**Formatting:**
- No explicit prettier/eslint config found - uses Create React App defaults
- Indentation: 2 spaces (observed throughout codebase)
- Semicolons: Present at end of statements
- Quote style: Double quotes for strings (e.g., `"react"`, `"./App.css"`)
- Arrow functions: Used consistently for callbacks (e.g., `(e) => { ... }`)

**Linting:**
- ESLint configuration in `package.json`: extends `react-app` and `react-app/jest`
- ESLint disable comments used when needed: `// eslint-disable-next-line react-hooks/exhaustive-deps`

## Import Organization

**Order:**
1. React and library imports first (e.g., `import React`, `import { useState }`, `import { useNavigate }`)
2. Third-party UI libraries (e.g., `import { CountdownCircleTimer }`, `import { GiInfinity }`)
3. Local component/context imports (e.g., `import Score`, `import { useGlobalContext }`)
4. Style imports last (e.g., `import "./App.css"`)

**Path Aliases:**
- Relative imports used throughout (e.g., `../contexts/Global`, `../components/Score`)
- No path aliases configured in project

**Examples:**
- `src/App.js`: React hooks first, router imports, context hooks, screen components, styles
- `src/screens/Question.js`: CSS first, router, audio assets, React hooks, components, context, icons
- `src/components/Score.js`: React hooks, context hook, styles

## Error Handling

**Patterns:**
- `try/catch` blocks used for async operations and dynamic imports (see `src/screens/Question.js` lines 74-89, 289-294)
- Empty catch blocks with no logging: `} catch { }`
- Error logging with `console.log(err)` for debugging
- No formal error boundaries implemented
- Silent failures are acceptable in certain cases (e.g., asset imports)

**Example from `src/screens/Question.js`:**
```javascript
try {
  if (type === "puzzles") {
    setDATA((prevState) => { ... });
  }
} catch { }
```

## Logging

**Framework:** `console` object (no logging library)

**Patterns:**
- `console.log()` used for debugging (lines visible in multiple files)
- Logged at strategic points: event handlers (`console.log(e.key)`), component renders, error conditions
- No structured logging or log levels
- Temporary debugging logs left in code (should be cleaned up)

**Usage locations:**
- `src/App.js:17`: `console.log(e.key)` in keydown handler
- `src/components/Score.js:20`: `console.log(mscore)` in render
- `src/screens/Home.js:56`: `console.log(DATA.parts.audienceQuestions.length)`
- `src/screens/Question.js:293`: `console.log(err)` in error handler

## Comments

**When to Comment:**
- Comments are minimal in codebase
- Inline comments explain complex logic (see `src/screens/Question.js` lines 29-66 explaining question data extraction)
- JSDoc-style comments not used
- Complex state transformations documented: `// Get current question data from DATA`, `// Initialize audio elements`, `// Helper to pause audio and update playing state`

**Examples:**
```javascript
// Get current question data from DATA
const currentWindow = DATA.parts[type]?.[id];

// Initialize audio elements
const [audio] = useState(new Audio(sourceAudio));

// Helper to pause audio and update playing state
const pauseAudio = useCallback(() => { ... }, [audio]);
```

## Function Design

**Size:**
- Functions are generally medium to large (especially in screens like `Question.js`)
- Most components are single-export default functions
- Handler functions kept inline as callbacks within components
- No extraction of complex logic to separate utilities

**Parameters:**
- Component props use object destructuring with defaults (e.g., `Score.js` lines 5-11)
- Event handlers receive event object as parameter: `(e) => { ... }`
- Callback dependencies clearly listed in dependency arrays

**Return Values:**
- Components return JSX elements
- Event handlers return void (side effects only)
- Callbacks return void or conditional JSX (conditional rendering)
- CSS class strings built with ternary operators and string concatenation

**Example component with parameter defaults:**
```javascript
export default function Score({
  right = false,
  turn,
  top = false,
  overlay = false,
  zero = false,
}) { ... }
```

## Module Design

**Exports:**
- Default exports used for all component files: `export default function ComponentName()`
- Named exports for context hooks: `export function useGlobalContext()` and `export function GlobalContextProvider()`
- Single file, single responsibility pattern (one component per file)

**Barrel Files:**
- Used selectively: `src/contexts/index.js` exports both `GlobalContextProvider` and `useGlobalContext`
- Not used for components directory

**Example from `src/contexts/index.js`:**
```javascript
export { GlobalContextProvider, useGlobalContext } from "./Global";
```

## State Management

**Pattern:**
- React Context API + useState hooks (no Redux or state management library)
- Global state in `src/contexts/Global.js`: scores, turns, game DATA, quick question tracking
- Local component state for UI: `isPlaying`, `isComplete`, `active`, `showOverlay`
- Context accessed via custom hook: `const { rightScore, setRightScore } = useGlobalContext()`

## React Patterns

**Hooks:**
- `useState`: For all state management
- `useContext`: Combined with custom hook for global state
- `useCallback`: For memoized event handlers (essential with dependencies)
- `useEffect`: For side effects (event listeners, asset loading, data initialization)
- `useMemo`: For memoized computations (used in `Home.js` for actions mapping)
- `useParams`: For route parameters
- `useNavigate`: For programmatic navigation

**Key dependency patterns:**
- Event handlers properly depend on all used state/props
- Effect cleanup functions always return cleanup (remove event listeners)
- ESLint rules enforced for hook dependencies

---

*Convention analysis: 2026-02-08*
