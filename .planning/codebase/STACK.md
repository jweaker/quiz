# Technology Stack

**Analysis Date:** 2026-02-08

## Languages

**Primary:**
- JavaScript (ES2018+) - All application code and configuration

## Runtime

**Environment:**
- Node.js 24.6.0

**Package Manager:**
- npm 11.5.1
- Lockfile: `bun.lockb` present (alternative package manager, Bun runtime)

## Frameworks

**Core:**
- React 18.0.0 - UI framework and component library

**Routing:**
- react-router-dom 6.3.0 - Client-side routing for multiple screens

**Build & Development:**
- react-scripts 5.0.1 - Build tool and dev server (Create React App)

**UI Components:**
- react-countdown-circle-timer 3.0.9 - Circular countdown timer component
- react-countdown 2.3.2 - Countdown timer component
- react-icons 4.3.1 - Icon library for UI

## Key Dependencies

**Critical:**
- react 18.0.0 - Core UI library
- react-dom 18.0.0 - React rendering for web
- react-router-dom 6.3.0 - Navigation and routing

**Utilities:**
- web-vitals 2.1.0 - Performance metrics tracking

**Build:**
- file-loader 6.2.0 - Webpack loader for importing static assets (audio, video, images)

## Configuration

**Environment:**
- Environment files supported: `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`
- Configuration managed through React environment variables (REACT_APP_ prefix pattern)

**Build:**
- Create React App standard configuration in `package.json`
- ESLint configuration extends `react-app` and `react-app/jest`
- Browserslist configured for production and development targets

## Platform Requirements

**Development:**
- Node.js v24.6.0 or compatible
- npm 11.5.1 or Bun package manager
- Modern browser with ES2018 support

**Production:**
- Browser support: >0.2% market share, not dead, excluding Opera Mini
- Mobile-friendly (viewport meta configured)
- Service Worker support for PWA functionality (manifest.json present)

## Build Scripts

```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run Jest tests
npm run eject      # Eject from Create React App
```

---

*Stack analysis: 2026-02-08*
