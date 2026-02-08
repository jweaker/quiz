# Testing Patterns

**Analysis Date:** 2026-02-08

## Test Framework

**Runner:**
- Jest (bundled with Create React App via `react-scripts`)
- Version: Configured in `package.json` as part of react-scripts 5.0.1

**Assertion Library:**
- Jest built-in assertions (no separate assertion library configured)

**Run Commands:**
```bash
npm test              # Run all tests in watch mode (Create React App default)
npm run test          # Same as above - uses react-scripts test
npm run build         # Production build (includes test coverage via Create React App)
```

**Note:** Project uses `bun` as package manager (indicated by `bun.lockb`) but npm scripts are configured.

## Test File Organization

**Location:**
- No test files currently exist in `src/` directory
- Testing is not currently implemented in this codebase
- Create React App convention is co-located tests (same directory as component)

**Naming Convention (Not Applied):**
- `.test.js` or `.spec.js` suffix would be used if tests existed
- Pattern: `ComponentName.test.js` or `ComponentName.spec.js`

**Structure (Template for future tests):**
```
src/
├── components/
│   ├── Score.js
│   ├── Score.test.js          # (not present)
│   ├── IconButton.js
│   └── IconButton.test.js      # (not present)
├── screens/
│   ├── Home.js
│   ├── Home.test.js            # (not present)
│   ├── Question.js
│   └── Question.test.js        # (not present)
└── contexts/
    ├── Global.js
    └── Global.test.js          # (not present)
```

## Test Structure

**Jest Configuration:**
- Default Create React App configuration (implicit, not exposed)
- ESLint config extends `react-app/jest` in `package.json`
- Would use Jest test environment with DOM (jsdom) for React component testing

**Testing Patterns (Not Currently Implemented):**

If tests were to be added, they would follow React Testing Library patterns (standard for Create React App):

```javascript
// Expected pattern for component tests
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContextProvider } from '../contexts/Global';
import Score from './Score';

describe('Score Component', () => {
  const renderWithContext = (component) => {
    return render(
      <BrowserRouter>
        <GlobalContextProvider>
          {component}
        </GlobalContextProvider>
      </BrowserRouter>
    );
  };

  test('renders score display', () => {
    renderWithContext(<Score right={true} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
```

## Mocking

**Framework:** Jest mocking (not actively used)

**Patterns (Recommended for future tests):**

Mock external modules:
```javascript
// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ type: 'debate' }),
}));

// Mock context
jest.mock('../contexts/Global', () => ({
  useGlobalContext: () => ({
    rightScore: 0,
    setRightScore: jest.fn(),
    // ... other mock values
  }),
}));
```

**What to Mock:**
- Router hooks: `useNavigate`, `useParams`
- Global context via `useGlobalContext`
- External audio element creation
- Audio playback methods (play, pause, etc.)

**What NOT to Mock:**
- React hooks (`useState`, `useEffect`, `useCallback`)
- Component rendering logic
- State updates within components
- Component prop passing

## Fixtures and Factories

**Test Data (Not Currently Used):**

If implemented, would structure like this:

```javascript
// src/__fixtures__/mockData.js
export const mockGameData = {
  parts: {
    debate: [...],
    windows: {...},
    puzzles: [...],
    quickQuestions: {...},
  },
  rightTeamName: 'Team A',
  leftTeamName: 'Team B',
};

// src/__fixtures__/contextFactory.js
export const createMockGlobalContext = (overrides = {}) => ({
  rightScore: 0,
  leftScore: 0,
  rightsTurn: false,
  turned: false,
  DATA: mockGameData,
  // ... other default values
  ...overrides,
});
```

**Location (Not Present):**
- Would be in `src/__fixtures__/` directory
- Could also use factory functions in test files directly

## Coverage

**Requirements:** Not enforced

**View Coverage (If Tests Existed):**
```bash
npm test -- --coverage
```

**Current State:**
- No test files present
- No coverage reports
- Coverage target not specified in configuration
- Create React App would generate coverage if `--coverage` flag used

## Test Types

**Unit Tests (Not Implemented):**
- Would test individual components in isolation
- Would verify component props, state changes, event handling
- Example targets: `Score.js`, `IconButton.js`, `useGlobalContext` hook

**Integration Tests (Not Implemented):**
- Would test multiple components working together
- Example: `Question.js` with `Score.js` components and context
- Would verify data flow and state updates across component tree

**E2E Tests:**
- Not present
- Would require Cypress, Playwright, or Selenium
- Not configured in project

## Common Patterns (Templates for Future Tests)

**Async Testing:**
```javascript
// Pattern for testing async operations
test('loads asset on mount', async () => {
  renderWithContext(<Question type="debate" />);

  await waitFor(() => {
    expect(screen.getByAltText('question')).toBeInTheDocument();
  });
});
```

**Error Testing:**
```javascript
// Pattern for testing error scenarios
test('handles missing audio gracefully', () => {
  // Mock failed asset import
  const { container } = renderWithContext(<Question />);

  // Verify component still renders without error
  expect(container.querySelector('.Question')).toBeInTheDocument();
});
```

**Event Handling:**
```javascript
// Pattern for testing keyboard handlers
test('pauses audio on Escape key', () => {
  const mockPause = jest.fn();
  renderWithContext(<Question />);

  const event = new KeyboardEvent('keydown', { key: 'Escape' });
  document.dispatchEvent(event);

  // Verify audio pause was called
});
```

## Current Testing Status

**No Tests Currently Exist**

The codebase has no unit, integration, or E2E tests. Key areas that would benefit from testing:

- **`src/contexts/Global.js`:** Context provider and hook functionality
- **`src/components/Score.js`:** Score display and input handling
- **`src/components/IconButton.js`:** Button state and styling logic
- **`src/screens/Question.js`:** Complex event handling, audio management, state updates (highest complexity)
- **`src/screens/Home.js`:** Navigation logic and keyboard handling
- **`src/screens/Rate.js`:** Score calculation and form submission

## Setup for Adding Tests

To add tests to this project:

1. Install testing dependencies (already available via Create React App):
   - `@testing-library/react` - Component testing
   - `@testing-library/jest-dom` - Jest matchers
   - `@testing-library/user-event` - User interaction simulation

2. Create test files alongside components using `.test.js` suffix

3. Create `src/setupTests.js` if custom test configuration needed (standard Create React App location)

4. Import global test utilities in test files:
   ```javascript
   import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   ```

5. Wrap component renders with router and context provider for integration tests

---

*Testing analysis: 2026-02-08*
