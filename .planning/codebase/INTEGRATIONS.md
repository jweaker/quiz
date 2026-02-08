# External Integrations

**Analysis Date:** 2026-02-08

## APIs & External Services

**No external APIs detected** - Application is fully client-side with no server integration points.

## Data Storage

**Databases:**
- Not used - No backend database integration

**File Storage:**
- Local filesystem only - Static assets served by webpack through Create React App
- Assets location: `src/assets/`
- Supported file types:
  - Images: `.png`, `.jpg`
  - Audio: `.mp3`, `.wav`
  - Video: `.mp4`

**Data Management:**
- All quiz data stored in JSON configuration files (`src/config/data-*.json`)
- Data imported at runtime and managed in React Context state
- No persistence layer - data resets on page refresh

**Caching:**
- Browser cache via Create React App build output
- No explicit caching service

## Authentication & Identity

**Auth Provider:**
- None - No authentication system implemented

## Monitoring & Observability

**Error Tracking:**
- None detected - Console logging only via `console.log()`

**Logs:**
- Browser console only - Development logging with `console.log()` in source files
- No structured logging or external log aggregation

**Performance Monitoring:**
- web-vitals 2.1.0 - Client-side performance metrics (no external endpoint)

## CI/CD & Deployment

**Hosting:**
- Static file hosting compatible (builds to `build/` directory)
- PWA ready with manifest.json at `public/manifest.json`

**CI Pipeline:**
- Not detected - No CI/CD configuration files present

## Environment Configuration

**No environment variables required** - Application is fully self-contained with no external service dependencies.

## Content Delivery

**External Resources:**
- Google Fonts API - Cairo font family loaded from `https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap`
- Google Font DNS preconnect: `https://fonts.gstatic.com`

## Webhooks & Callbacks

**Incoming:**
- None - No backend endpoints

**Outgoing:**
- None - No external service calls

## File Manifest

Key asset locations in `src/assets/`:
- Audio: `tick.wav`, `boom.mp3`, `correct.mp3`, `wrong.mp3`, `whoosh.mp3`, `quicktick.mp3`, `ding.wav`
- Images: `actors.png`, `animals.png`, `apuzz.jpg`, `balls.png`, `cars.png`, `chests.png`, `diff.png`, `flags.png`, `icons.png`, `logob.png`, `logom.png`, `marvel.png`, `paintings.png`
- Video: `gar.mp4`, `omar.mp4`

---

*Integration audit: 2026-02-08*
