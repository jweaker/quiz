# Technology Stack

**Project:** بشائر المعرفة (Basha'ir Al-Ma'rifa) - TV Quiz Show
**Researched:** 2026-02-08
**Confidence:** HIGH

## Recommended Stack

### Build Tool & Development Environment

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vite | 7.3+ | Build tool and dev server | Fast HMR (instant vs CRA's 15s), native ESM, TypeScript first-class support, 10x faster builds. CRA is deprecated and unmaintained. Vite is the 2026 standard for React apps. |
| TypeScript | 5.8+ | Type system | Type safety, better IDE support, catches errors at compile time. 5.8 adds improved conditional type checking and Node 18 module support. |
| Node.js | 18+ | Runtime environment | Required for build tools. Vite 7+ dropped Node 16 support. Node 18+ is LTS. |

### Core Framework

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3+ | UI framework | Already in use. React 18 has concurrent features, automatic batching, and better performance. Stable and mature for production TV apps. |
| React Router | 6.3+ | Client-side routing | Already in use for multi-screen navigation. v6 has simplified API, better TypeScript support, and nested routes. |

### State Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.0+ | Global state management | Lightweight (3kb), zero boilerplate, no Provider wrapper needed. Perfect for episode data, timer state, score tracking. 30%+ YoY growth, 14M+ weekly downloads. Simpler than Redux for single-operator apps. |

### Styling & UI

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Tailwind CSS | 3.4+ | Utility-first CSS framework | Rapid UI development, consistent design system, production bundle includes only used classes. Better than CSS Modules for this use case due to speed and no naming fatigue. |
| shadcn/ui | Latest (Radix-based) | Accessible UI components | Copy-paste components (full ownership), built on Radix UI primitives (130M+ downloads/month), Tailwind-styled, TypeScript-native. Now uses unified radix-ui package (cleaner dependencies). Perfect for episode editor UI. |
| Cairo (Google Fonts) | Latest | Arabic typography | Contemporary Arabic/Latin typeface based on Kufi calligraphic style. Wide counters, excellent RTL readability, 9 weights, free. Already specified in project requirements. |

### Animation Libraries

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Framer Motion | 12.33+ | 2D UI animations | Declarative API, gesture handling, layout animations, scroll triggers. Most popular React animation library. Recently rebranded to "Motion". Perfect for transitions, score reveals, section intros. |
| React Three Fiber | 9.5+ | 3D graphics (optional) | React renderer for Three.js. Only if 3D elements are truly needed for TV polish. React 19 compatible, declarative 3D, good performance. |
| @react-three/drei | 10.7+ | R3F helper components | Pre-built 3D primitives, controls, effects. Reduces boilerplate if using R3F. Only install if 3D is confirmed. |

### Internationalization & RTL

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-i18next | 16.5+ | i18n and RTL support | Industry standard (though project is Arabic-only). Provides i18n.dir() for RTL detection, dynamic content loading. Better than building RTL logic from scratch. Mature and battle-tested. |

### Dual-Screen Architecture

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Browser window.open() + React Portals | Native API | Dual window management | Lightweight, no Electron needed. Use window.open() to create audience display window, React.createPortal to render into it. Simpler than Electron for MacBook + external display. Works with Vite dev server. |

### Editor & Data Management

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| dnd-kit | Latest | Drag-and-drop for editor | Modern, accessible, 10kb, keyboard support, better than react-beautiful-dnd. Perfect for reordering questions/sections in episode editor. React 19 compatible. |
| Zod | 3.24+ | Schema validation | Runtime type validation for episode JSON files. TypeScript-first, composable schemas, better error messages. Validates imported episode data. |

### Development Tools

| Tool | Version | Purpose | Why Recommended |
|------|---------|---------|-----------------|
| ESLint | 9+ (flat config) | Code linting | Flat config is 2026 standard. Use @typescript-eslint for TypeScript rules. Catches bugs, enforces consistency. |
| Prettier | 3.8+ | Code formatting | Opinionated formatting, integrates with ESLint. Version 3.8 has faster CLI. |
| @vitejs/plugin-react | Latest | Vite React support | Official Vite plugin for React Fast Refresh and JSX. Required for Vite + React. |

## Installation

```bash
# Remove Create React App
npm uninstall react-scripts

# Core dependencies
npm install react@^18.3.0 react-dom@^18.3.0
npm install react-router-dom@^6.3.0

# Build tool
npm install vite@^7.3.0
npm install -D @vitejs/plugin-react

# TypeScript
npm install -D typescript@^5.8.0
npm install -D @types/react @types/react-dom @types/node

# State management
npm install zustand@^5.0.0

# Styling & UI
npm install tailwindcss@^3.4.0 postcss autoprefixer
npm install @radix-ui/react-* # Individual Radix primitives as needed via shadcn/ui CLI

# Animation
npm install framer-motion@^12.33.0

# Optional: 3D (only if confirmed needed)
# npm install three@^0.170.0 @react-three/fiber@^9.5.0 @react-three/drei@^10.7.0

# RTL & i18n
npm install react-i18next@^16.5.0 i18next@^24.0.0

# Editor & validation
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install zod@^3.24.0

# Dev tools
npm install -D eslint@^9.0.0 @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier@^3.8.0 eslint-config-prettier
npm install -D @types/react-router-dom
```

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Build Tool | Vite | Create React App | CRA is deprecated, unmaintained, slow builds. No TypeScript-first support. |
| Build Tool | Vite | Webpack | Requires manual config, slower than Vite for dev. Overkill for this project. |
| Build Tool | Vite | Parcel | Less ecosystem support than Vite. Vite has better React integration. |
| State Management | Zustand | Redux Toolkit | Redux is overkill for single-operator app. Zustand has 1/5 the boilerplate. |
| State Management | Zustand | React Context | Context causes unnecessary re-renders. Zustand has better performance and DX. |
| Animation | Framer Motion | React Spring | React Spring has steeper learning curve. Framer Motion is more beginner-friendly with better docs. |
| Animation | Framer Motion | GSAP | GSAP is powerful but commercial license required for some features. Framer Motion is free and React-native. |
| Styling | Tailwind CSS | CSS Modules | CSS Modules = naming fatigue, more files. Tailwind faster for rapid development. Better for animations. |
| Styling | Tailwind CSS | Styled Components | Runtime overhead, larger bundle. Tailwind has zero runtime cost. |
| Dual Screen | window.open() | Electron | Electron = 200MB+ bundle, complex build, unnecessary for local MacBook app. Browser API is simpler and sufficient. |
| Component Library | shadcn/ui | Material UI | MUI is heavy, opinionated styling. shadcn/ui gives full code ownership and is Tailwind-native. |
| Component Library | shadcn/ui | Ant Design | Ant Design doesn't support Arabic/RTL well. shadcn/ui with Radix has better a11y and RTL support. |
| Drag & Drop | dnd-kit | react-beautiful-dnd | react-beautiful-dnd is deprecated by Atlassian. dnd-kit is modern, maintained, accessible. |
| Drag & Drop | dnd-kit | react-dnd | react-dnd is older, HTML5 DnD API has limitations. dnd-kit is more flexible and performant. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Deprecated, unmaintained, slow. Community has moved to Vite. | Vite 7+ |
| react-scripts | Part of CRA. No longer supported. | @vitejs/plugin-react |
| Redux (classic) | Massive boilerplate, overkill for this app. Only 10% of new projects use it. | Zustand 5+ |
| Styled Components / Emotion | Runtime CSS-in-JS has performance overhead. Trend is toward build-time CSS. | Tailwind CSS |
| react-beautiful-dnd | Officially deprecated by Atlassian. No longer maintained. | dnd-kit |
| Node.js 16 or below | Vite 7 dropped support. Security vulnerabilities. | Node.js 18+ LTS |
| ESLint legacy config | Deprecated. ESLint 9 uses flat config. | ESLint flat config (eslint.config.mjs) |
| Webpack (manual setup) | Complex config, slow dev server. Only use if you need very specific customization. | Vite (handles 99% of use cases) |

## Stack Patterns by Use Case

### If 3D is NOT needed (recommended starting point):
```bash
Vite + React + TypeScript + Zustand + Tailwind + Framer Motion + shadcn/ui
```
- Lighter bundle, faster builds
- Focus on 2D animations (sufficient for most TV graphics)
- Add React Three Fiber later if needed

### If 3D elements are confirmed:
```bash
Add: React Three Fiber + @react-three/drei + three.js
```
- Use sparingly (intro sequences, 3D logo reveals)
- Pre-optimize models (Draco compression, LOD)
- Test on MacBook Pro to ensure 60fps

### For episode editor:
```bash
shadcn/ui (forms, dialogs, inputs) + dnd-kit (reordering) + Zod (validation)
```
- Visual editing with drag-drop
- JSON import/export with validation
- TypeScript types generated from Zod schemas

### For dual-screen setup:
```javascript
// Main window (operator panel)
const audienceWindow = window.open('/audience', 'audience', 'width=1920,height=1080');

// Render into audience window using Portal
import { createPortal } from 'react-dom';
createPortal(<AudienceDisplay />, audienceWindow.document.body);
```
- Main app hosts operator controls
- Audience window shows clean display
- State synchronized via Zustand (shared across windows)

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 18.3 | React Three Fiber 9.5 | R3F@9 pairs with React@18-19 |
| Vite 7.3 | Node.js 18+ | Vite 7 dropped Node 16 support |
| TypeScript 5.8 | ESLint 9 + @typescript-eslint | Use flat config format |
| Framer Motion 12.33 | React 18.3 | Full compatibility, no breaking changes |
| Zustand 5.0 | React 18.3 | Works with React 18 concurrent features |
| Tailwind 3.4 | Vite 7.3 | Use @vitejs/plugin-react with PostCSS |
| shadcn/ui (Feb 2026) | radix-ui (unified) | New unified package instead of individual @radix-ui/react-* |

## Migration Path from Current CRA Setup

### Phase 1: Build Tool Migration
1. Install Vite and remove react-scripts
2. Create vite.config.ts
3. Move index.html to root, update script tags
4. Update package.json scripts (start → dev, build)
5. Replace REACT_APP_ env vars with VITE_
6. Test dev server and production build

### Phase 2: TypeScript Migration
1. Install TypeScript and type definitions
2. Rename .js → .tsx (components with JSX) or .ts
3. Add tsconfig.json
4. Fix type errors incrementally (start with strict: false)
5. Enable strict mode gradually

### Phase 3: Modernize Dependencies
1. Install Zustand, migrate from component state
2. Install Tailwind CSS, migrate from inline styles
3. Install Framer Motion for animations
4. Add shadcn/ui components for editor
5. Implement dual-screen with window.open()

## Critical Configuration Files

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
});
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        primary: '#0066cc', // Adjust to match existing blue scheme
      },
    },
  },
  plugins: [],
};
```

## Performance Considerations

**For TV production quality:**
- Target 60fps for all animations (use Framer Motion's `layoutId` sparingly)
- Preload all episode assets (images, audio) before section start
- Use React.memo for expensive components (score displays, timer)
- Debounce keyboard inputs to avoid state thrashing
- Test on actual MacBook Pro + external display setup (1920x1080 or 4K)

**Bundle size targets:**
- Initial bundle: <500kb gzipped (without 3D)
- With 3D: <1MB gzipped
- Use dynamic imports for episode editor (not needed during live show)

**Animation performance:**
- Framer Motion uses GPU-accelerated transforms (translateX/Y, scale, rotate)
- Avoid animating width/height/top/left (causes layout recalculation)
- Use `will-change` CSS property sparingly
- Test animations on external display (may have different refresh rate)

## Arabic RTL Specific Notes

**react-i18next setup:**
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'ar',
  resources: {
    ar: {
      translation: {
        // translations
      },
    },
  },
});

// Set document direction
document.dir = i18n.dir(); // 'rtl' for Arabic
```

**Tailwind RTL:**
- Tailwind 3.4+ has built-in RTL support
- Use logical properties: `ms-4` (margin-inline-start) instead of `ml-4`
- Add `dir="rtl"` to root element
- Test all layouts in RTL mode

**Cairo font integration:**
```html
<!-- In index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

## Sources

### Official Documentation (HIGH confidence)
- [Vite Documentation](https://vite.dev/) - v7.3.1 release notes
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/) - Official Microsoft blog
- [Framer Motion npm](https://www.npmjs.com/package/framer-motion) - v12.33.0
- [Zustand npm](https://www.npmjs.com/package/zustand) - v5.0.11
- [React Three Fiber npm](https://www.npmjs.com/package/@react-three/fiber) - v9.5.0
- [react-i18next Documentation](https://react.i18next.com/) - v16.5.4
- [Cairo Font - Google Fonts](https://fonts.google.com/specimen/Cairo) - Official font page
- [shadcn/ui February 2026 Changelog](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) - Unified Radix package
- [dnd-kit Documentation](https://dndkit.com/) - Official docs
- [Prettier 3.8.0 Release](https://prettier.io/blog/2026/01/14/3.8.0) - Official blog

### Verified Web Search (MEDIUM-HIGH confidence)
- [Vite vs CRA Migration Guide 2026](https://dev.to/solitrix02/goodbye-cra-hello-vite-a-developers-2026-survival-guide-for-migration-2a9f)
- [React Animation Libraries Comparison 2026](https://www.syncfusion.com/blogs/post/top-react-animation-libraries)
- [Zustand vs Redux 2026 Analysis](https://medium.com/@sangramkumarp530/zustand-vs-redux-toolkit-which-should-you-use-in-2026-903304495e84)
- [State Management Trends 2026](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)
- [React Three Fiber Best Practices](https://docs.pmnd.rs/react-three-fiber/tutorials/basic-animations)
- [ESLint Flat Config Guide 2026](https://advancedfrontends.com/eslint-flat-config-typescript-javascript/)
- [Tailwind vs CSS Modules 2026](https://www.polytomic.com/blog-posts/goodbye-css-modules-hello-tailwindcss)
- [React Multi-Window Patterns](https://pietrasiak.com/creating-multi-window-electron-apps-using-react-portals)
- [GitHub - Vite Releases](https://github.com/vitejs/vite/releases)

---
*Stack research for: بشائر المعرفة TV Quiz Show Modernization*
*Researched: 2026-02-08*
*Confidence: HIGH (all major technologies verified with official docs or npm)*
