# Phase 7: Audio & Episode Management - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Audio feedback system for live show events and episode editor for production workflow. Operator can manage sound effects with per-category mixing, create/edit episodes with full validation, and import/export episode data as JSON files. Keyboard shortcuts are finalized globally and contextually.

</domain>

<decisions>
## Implementation Decisions

### Sound palette & event mapping
- Dramatic TV stings style — orchestral hits, tension builds, reveal fanfares (like Who Wants to Be a Millionaire)
- Source royalty-free dramatic sounds to bundle with the app (not placeholders)
- Full broadcast sound package (~15+ distinct sounds): correct/wrong answers, timer warning/expire, section transitions, Minefield danger, Debate reveal, Puzzle solve, score milestones, ambient thinking loops, victory/defeat fanfares
- Full mixer with preview: master volume + per-category volume controls (timer, feedback, transitions) + individual sound preview/test buttons
- Builds on existing Web Audio API infrastructure from Phase 5 (AudioContext singleton, AudioBuffer preloading)

### Episode editor layout & workflow
- Separate editor screen/route — edit episodes before the show, then switch to operator mode to run
- Single scrollable page with all sections visible — everything on one page, Ctrl+F friendly
- Minimal episode metadata: episode title, team names, date
- Fixed section order matching the show's standard format — no reordering

### Question entry flow
- Bulk paste + form edit: paste to bulk-import questions, then form fields to review/edit individually
- Auto-detect paste format: accept multiple formats (line-based Q/A pairs, tab-separated, JSON) and parse automatically
- Adaptive form fields per section type: fields change based on section (e.g., Debate gets judge config, Windows gets categories, Puzzle gets configurable time)
- Answers always visible in the editor — no spoiler-hiding needed

### Episode lifecycle & file handling
- JSON files only — no localStorage persistence, episodes are files loaded via import
- All three starting points supported: blank slate, pre-filled template with section structure, clone from previous episode
- Real-time inline validation — show warnings as the operator types (missing answers, incomplete sections, field errors)
- Loading from both editor and operator panel: editor for pre-show prep, operator panel has file picker to load/swap episodes during show

### Claude's Discretion
- Specific royalty-free sound sources and selection
- Audio manager singleton architecture details
- Zod schema design for episode validation
- JSON file structure and versioning
- Form field layout and spacing within the scrollable editor
- Paste format detection heuristics
- Keyboard shortcut assignments for audio controls

</decisions>

<specifics>
## Specific Ideas

- Sound style reference: "Who Wants to Be a Millionaire" dramatic stings — musical tension and payoff
- Full mixer implies a settings/audio panel where operator can adjust category volumes and test individual sounds before going live
- Episode editor is a distinct route, not embedded in the operator panel — clean separation between "prep mode" and "live mode"
- Clone-from-previous implies the app needs to remember recently loaded episodes or let user pick a file to clone from

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-audio-episode-management*
*Context gathered: 2026-02-19*
