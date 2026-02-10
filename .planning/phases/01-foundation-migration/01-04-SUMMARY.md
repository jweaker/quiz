---
phase: 01-foundation-migration
plan: 04
subsystem: ui
tags: [tailwindcss, rtl, cairo-font, css, vite-plugin, logical-properties]

# Dependency graph
requires:
  - phase: 01-02
    provides: TypeScript component files to apply Tailwind classes to
provides:
  - Tailwind CSS v4 with Vite plugin integration
  - Self-hosted Cairo Arabic font (no CDN dependency)
  - RTL-first styling with logical properties
  - All components using Tailwind utility classes
affects: [02-dual-screen, 03-component-library, 05-visual-polish]

# Tech tracking
tech-stack:
  added: [tailwindcss@4, "@tailwindcss/vite"]
  patterns: [tailwind-utility-classes, rtl-logical-properties, arbitrary-value-syntax, self-hosted-fonts]

key-files:
  created:
    - src/styles/main.css
    - src/styles/fonts.css
    - public/fonts/Cairo-Regular.woff2
    - public/fonts/Cairo-Bold.woff2
  modified:
    - vite.config.ts
    - src/main.tsx
    - src/App.tsx
    - src/screens/Home.tsx
    - src/screens/Windows.tsx
    - src/screens/QuestionPicker.tsx
    - src/screens/Question.tsx
    - src/screens/Rate.tsx
    - src/screens/Set.tsx
    - src/components/Score.tsx
    - src/components/IconButton.tsx

key-decisions:
  - "Physical positioning for Score panels (right/left not start/end) to maintain spatial consistency regardless of RTL"
  - "Arbitrary value syntax for complex CSS (gradients, shadows, animations) rather than @apply or custom classes"
  - "western-numerals utility class for score/timer Western numeral display"

patterns-established:
  - "RTL logical properties: use ms/me/ps/pe for margins/padding, never left/right"
  - "Tailwind arbitrary values: [animation:name_duration_easing_forwards_1] for keyframe animations"
  - "Score spatial positioning: physical right/left for fixed screen-position elements"

# Metrics
duration: 11min
completed: 2026-02-10
---

# Phase 1 Plan 4: Tailwind CSS & RTL Summary

**Tailwind CSS v4 with Vite plugin, self-hosted Cairo font, and RTL-first logical properties across all components**

## Performance

- **Duration:** 11 min
- **Started:** 2026-02-10T12:23:48Z
- **Completed:** 2026-02-10T12:34:33Z
- **Tasks:** 3
- **Files modified:** 24 (11 modified, 3 created, 10 deleted)

## Accomplishments
- Tailwind CSS v4 integrated via Vite plugin — zero-config, CSS-first setup
- Cairo Arabic font self-hosted in public/fonts/ with @font-face declarations (Regular 400 + Bold 700)
- All 10 components migrated from CSS class files to Tailwind utility classes with RTL logical properties
- 10 old CSS files deleted, only src/styles/main.css and src/styles/fonts.css remain
- Build verified: `vite build` succeeds cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Tailwind v4 and configure for Vite** - `ad87a84` (chore)
2. **Task 2: Self-host Cairo font and configure font-face** - `f10af62` (feat)
3. **Task 3: Migrate components to Tailwind with logical properties** - `ece0a3a` (feat)

## Files Created/Modified
- `vite.config.ts` - Added @tailwindcss/vite plugin
- `src/styles/main.css` - Tailwind entry point with base styles, keyframe animations, spinner hiding
- `src/styles/fonts.css` - @font-face declarations for self-hosted Cairo Regular/Bold
- `public/fonts/Cairo-Regular.woff2` - Self-hosted Cairo font (400 weight)
- `public/fonts/Cairo-Bold.woff2` - Self-hosted Cairo font (700 weight)
- `src/main.tsx` - Import changed from index.css to styles/main.css
- `src/App.tsx` - Removed App.css import, converted to Tailwind (radial gradient bg, cursor-none)
- `src/screens/Home.tsx` - Converted layout to Tailwind flex utilities
- `src/screens/Windows.tsx` - Converted to Tailwind with starta animation
- `src/screens/QuestionPicker.tsx` - Converted to Tailwind with starta animation
- `src/screens/Question.tsx` - Most complex: timer container, overlay, answer animations all in Tailwind
- `src/screens/Rate.tsx` - Rating inputs with Tailwind, logical margin (me) for team container
- `src/screens/Set.tsx` - Score editing with Tailwind utilities
- `src/components/Score.tsx` - Fixed positioning with physical right/left, western-numerals class
- `src/components/IconButton.tsx` - Button with gradient text via arbitrary values

## Decisions Made
- **Physical positioning for Score panels:** Score panels use `right-[-12rem]` and `left-[-12rem]` (physical properties) instead of logical `start/end` because they represent spatial screen positions that should NOT flip in RTL — left team is always visually left, right team is always visually right.
- **Arbitrary value syntax for complex CSS:** Used Tailwind's `[value]` syntax extensively for gradients, animations, shadows rather than creating custom utility classes or using @apply. This keeps all styles co-located in JSX.
- **Parallel execution coordination:** Plan 01-03 (Zustand migration) ran in parallel and committed some files that already contained our CSS changes. We only committed files that weren't already covered by 01-03's commit.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- **Parallel plan overlap:** Plan 01-03 committed files (App.tsx, Home.tsx, Windows.tsx, QuestionPicker.tsx, Score.tsx, main.tsx) that already contained our CSS changes because they were editing the same files at the same time. Our Task 3 commit only included the remaining files that 01-03 hadn't touched (deleted CSS files, IconButton.tsx, Question.tsx, Rate.tsx, Set.tsx).
- **Pre-existing TSC error:** `src/app/OperatorErrorBoundary.tsx` has an unused import warning — this is from plan 01-03's work and unrelated to our changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All styling infrastructure is in place for Phase 2 (Dual-Screen) and Phase 3 (Component Library)
- Tailwind utility pattern established — future components should follow the same pattern
- RTL logical properties pattern documented for consistency
- No blockers for subsequent phases

---
*Phase: 01-foundation-migration*
*Completed: 2026-02-10*
