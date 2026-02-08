# Codebase Concerns

**Analysis Date:** 2026-02-08

## Tech Debt

**Empty catch blocks silently swallow errors:**
- Issue: Multiple catch blocks ignore errors without logging or handling them
- Files: `src/screens/Question.js` (lines 89, 293)
- Impact: Runtime errors in dynamic imports and state updates fail silently, making debugging difficult. Users cannot be informed of failures
- Fix approach: Replace empty catches with proper error logging at minimum; consider user feedback (toast/alert) for critical failures

**Multiple independent audio element instances created in state:**
- Issue: Five separate Audio objects instantiated via `useState` in Question component (lines 93-97)
- Files: `src/screens/Question.js`
- Impact: Each audio object is created on every render, potentially causing memory leaks and duplicate audio resources. No cleanup on unmount
- Fix approach: Move audio initialization outside React or use useRef with cleanup function that calls `.pause()` and nullifies references

**Unused empty useEffect in Global context:**
- Issue: useEffect with empty dependency array and no body (line 23)
- Files: `src/contexts/Global.js`
- Impact: Dead code creates confusion about intended initialization; wastes processing
- Fix approach: Remove entirely if no initialization needed

**Undeclared variable `audioWhoosh` used before state initialization:**
- Issue: Line 88 of Question.js calls `audioWhoosh.play()` in useEffect that runs before audioWhoosh state is declared (lines 93-97)
- Files: `src/screens/Question.js` (lines 88 vs 93-97)
- Impact: `audioWhoosh` is undefined when accessed, will throw runtime error on mount
- Fix approach: Move audio initialization before the effect that uses it, or guard audio calls with null checks

**Magic number threshold without explanation:**
- Issue: Value 15 used repeatedly for duration/remaining time comparisons without constant definition
- Files: `src/screens/Question.js` (lines 372, 376)
- Impact: Unclear intent; difficult to maintain if threshold needs adjustment
- Fix approach: Define `TIMER_FINAL_THRESHOLD = 15` at top of file

## Known Bugs

**Score display calculation broken for zero-based rounds:**
- Symptoms: Score displays as negative when trying to decrement from 0 or when initializing with `zero` flag
- Files: `src/components/Score.js` (line 40)
- Trigger: Navigate to poeticChase, askSmartly, or quickQuestions (types where zero=true). Initial score shows as `mscore - init` but init logic is incomplete
- Current behavior: When `zero` is true, init is set to current score, but onChange sends raw value without subtracting init, creating inconsistency

**Race condition in QuestionPicker navigation:**
- Symptoms: Active state updates can trigger navigation before state fully updates
- Files: `src/screens/QuestionPicker.js` (lines 15-33)
- Trigger: Rapid key presses on same key can cause navigation issues when section.length boundary condition is checked
- Impact: Can navigate to non-existent question indices if rapid key presses occur

**Missing bounds checking in array access:**
- Symptoms: Undefined behavior when accessing question data from nested structures
- Files: `src/screens/Question.js` (lines 42-59)
- Trigger: DATA structure modifications without index validation; complex conditional logic for different question types
- Impact: Line 149-150 accesses `DATA.parts.quickQuestions[id].questions.length` but no validation that id exists in DATA

## Security Considerations

**Dynamic import vulnerability:**
- Risk: Files loaded via dynamic import are not validated (e.g., `await import(\`../assets/${fileLoc}\`)`)
- Files: `src/screens/Question.js` (lines 288-295)
- Current mitigation: Only assets folder accessible, somewhat mitigated by file path restriction
- Recommendations: Validate fileLoc against whitelist of allowed files before import; never trust user input in import paths

**No input validation on score/rating inputs:**
- Risk: Score components accept arbitrary number input without validation or bounds
- Files: `src/components/Score.js` (line 41), `src/screens/Rate.js` (lines 25-32)
- Current mitigation: None; inputs can be negative or extremely large
- Recommendations: Add min/max bounds to number inputs; validate before state updates

**Hardcoded team names in data without sanitization:**
- Risk: Team names from DATA.json displayed directly in DOM via defaultValue attribute
- Files: `src/components/Score.js` (line 35)
- Current mitigation: Data comes from local JSON, not external source
- Recommendations: Consider DOMPurify if team names ever come from user input or external API

## Performance Bottlenecks

**Audio object lifecycle mismanagement:**
- Problem: Multiple Audio instances created, looped indefinitely, but never properly destroyed
- Files: `src/screens/Question.js` (lines 93-97, 281-285)
- Cause: useState creates new Audio objects; no cleanup in useEffect; audio.loop = true set without managed pause/cleanup
- Improvement path: Use useRef for persistent audio objects across re-renders; add cleanup function that stops playback and releases resources

**Excessive re-renders from complex conditional logic:**
- Problem: Question component renders complex nested ternary conditions on every state change
- Files: `src/screens/Question.js` (lines 328-345)
- Cause: Multiple dependent state variables (isPlaying, isComplete, type, hduration) trigger re-render even for unrelated changes
- Improvement path: Memoize expensive conditionals with useMemo; split into smaller components

**Global context provider broadcasts all state changes to entire app:**
- Problem: Any score/turn change re-renders all components subscribed to Global context
- Files: `src/contexts/Global.js`
- Cause: Single context contains 10+ state values, changes to any propagate globally
- Improvement path: Split context into separate concerns (ScoreContext, TurnContext) to isolate re-renders

**All data JSON loaded into memory at startup:**
- Problem: 3731 total lines across 9+ JSON files loaded as single data object
- Files: `src/config/data.json` and related files (16K-384 lines each)
- Cause: `DATA` kept entirely in React state for entire app lifetime
- Improvement path: Load only current round's data; implement data pagination or lazy loading

## Fragile Areas

**Question.js component with 414 lines:**
- Files: `src/screens/Question.js`
- Why fragile: Single component handles 6+ question types with completely different logic paths, audio management, scoring rules, and UI rendering. Massive switch statement in handleKeyDown with overlapping concerns
- Safe modification: Extract separate handler functions for each question type; create QuestionController subcomponents for each type; unit test each type independently
- Test coverage: No unit tests exist for any component; cannot verify behavior changes safely

**Complex Question data accessors with silent fallbacks:**
- Files: `src/screens/Question.js` (lines 42-59)
- Why fragile: Deeply nested conditional logic with fallback defaults makes it unclear which data structure is actually being used. Changes to DATA structure will break silently
- Safe modification: Create helper function `getQuestion(type, id, index, defaultData)` that explicitly documents all data access paths and validates structure
- Test coverage: No type checking; structure assumptions are implicit

**Global context with inconsistent state initialization:**
- Files: `src/contexts/Global.js` (lines 28-30)
- Why fragile: audienceQuestion declared but not documented; quickQuestion usage unclear; setQuickQuestion not always paired with setQuickQuestion(0) reset
- Safe modification: Document each context value with JSDoc; ensure consistent initialization between useState and context value object
- Test coverage: No tests for context behavior under navigation changes

**Score component infinite useEffect:**
- Files: `src/components/Score.js` (lines 17-19)
- Why fragile: useEffect has no dependency array (line 17), so it runs after EVERY render. Calls setInit which triggers re-render, creating potential infinite loop
- Safe modification: Add dependency array `[zero, mscore]` to control when init is recalculated; or use useMemo instead
- Test coverage: No tests to verify Score behavior with different props

## Scaling Limits

**Single monolithic Global context for entire app state:**
- Current capacity: Handles 10+ state values (rightScore, leftScore, rightsTurn, turned, DATA, quickQuestion, audienceQuestion)
- Limit: Breaks when adding features that require frequent state updates (will cause unnecessary re-renders across unrelated components)
- Scaling path: Implement separate contexts or state management library (Redux, Zustand); split scoring logic from navigation logic

**All question data in memory simultaneously:**
- Current capacity: ~16-20KB of JSON per round × 10 rounds = 160-200KB
- Limit: Would break with 100+ rounds or if adding media metadata (file sizes, timestamps)
- Scaling path: Implement lazy loading; move to database; fetch round data on demand instead of loading all at startup

**Audio instances one-per-question:**
- Current capacity: 5 Audio objects × ~10 question types = manageable
- Limit: Would break if adding dynamic audio per user input or question variations
- Scaling path: Implement audio pool/manager singleton; reuse audio objects instead of creating new ones

## Dependencies at Risk

**React Scripts 5.0.1 - potential vulnerability window:**
- Risk: Create React App is no longer maintained; react-scripts 5.0.1 is end-of-life
- Impact: Security patches no longer released; cannot upgrade to React 19+ without ejecting
- Migration plan: Consider migrate to Vite + React + TypeScript stack; offers better DX and active maintenance

**React Router 6.3.0 - early v6 release:**
- Risk: Early v6 release before stabilization; newer versions have better type safety and features
- Impact: Missing modern routing patterns (loaders, actions); no type safety
- Migration plan: Update to latest React Router v6 (6.20+); refactor to use data loaders

**Countdown circle timer third-party dependency:**
- Risk: Dependency on external countdown component; if unmaintained, harder to debug timer issues
- Impact: Custom timer logic cannot be controlled; timer re-render issues traced through third-party code
- Migration plan: Consider building custom timer with HTML5 Canvas or CSS animations for full control

## Missing Critical Features

**No error boundary:**
- Problem: Any runtime error in component crashes entire app
- Blocks: Cannot gracefully handle component failures
- Recommendation: Add ErrorBoundary component wrapping Routes; implements graceful error UI and recovery

**No loading states:**
- Problem: Dynamic imports of files and audio are fire-and-forget with no user feedback
- Blocks: Users don't know if file failed to load or is loading
- Recommendation: Add loading state to Question component; show spinner while assets load

**No undo/reset functionality:**
- Problem: Score modifications are permanent within session
- Blocks: Cannot fix accidental score entry without page reload
- Recommendation: Add undo button or modal confirmation before score updates

**No accessibility:**
- Problem: Entire app is keyboard-driven but no ARIA labels, semantic HTML, or screen reader support
- Blocks: Keyboard-only users cannot navigate; no indication of active state to assistive tech
- Recommendation: Add ARIA labels to buttons; use semantic HTML (button instead of div); announce state changes

## Test Coverage Gaps

**No unit tests for any component:**
- What's not tested: Component rendering, state updates, keyboard handlers, conditional logic
- Files: All files in `src/` lack corresponding `.test.js` or `.spec.js` files
- Risk: Cannot verify refactoring doesn't break existing behavior; new code introduced via copy-paste patterns without verification
- Priority: HIGH - 414-line Question.js is most critical; needs comprehensive tests for each question type

**No integration tests for navigation:**
- What's not tested: Route transitions, state persistence across navigation, params handling
- Files: No tests for `src/index.js`, router configuration, or context usage across routes
- Risk: Breaking navigation changes will only be discovered in manual testing
- Priority: HIGH - navigation is core feature; used constantly

**No tests for audio playback:**
- What's not tested: Audio play/pause, volume control, playback speed adjustments
- Files: No tests for audio logic in `src/screens/Question.js`
- Risk: Audio timing issues (line 372-378) cannot be verified; audio leaks go undetected
- Priority: MEDIUM - audio failure is user-facing but not data-critical

**No tests for Global context:**
- What's not tested: Context value updates, state initialization, hook behavior
- Files: `src/contexts/Global.js` has no test coverage
- Risk: Context changes break silently; useGlobalContext hook may not work as expected in edge cases
- Priority: MEDIUM - foundational but not often modified

---

*Concerns audit: 2026-02-08*
