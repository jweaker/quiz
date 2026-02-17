---
status: diagnosed
trigger: "Investigate why the TypewriterText component renders Arabic letters disconnected instead of in their connected cursive forms."
created: 2026-02-17T00:00:00Z
updated: 2026-02-17T00:05:30Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - root cause identified
test: documenting technical solution requirements
expecting: complete diagnosis with fix strategy
next_action: finalize resolution with artifact details

## Symptoms

expected: Arabic text should render with connected cursive forms (contextual shaping)
actual: Arabic letters render disconnected in isolated forms
errors: none (visual rendering issue)
reproduction: use TypewriterText component with Arabic text
started: always broken (architectural issue with character splitting)

## Eliminated

## Evidence

- timestamp: 2026-02-17T00:01:00Z
  checked: TypewriterText.tsx line 28
  found: `const letters = text.split('')` - splits text into individual characters
  implication: each character becomes a separate array element

- timestamp: 2026-02-17T00:02:00Z
  checked: TypewriterText.tsx lines 55-59
  found: each letter wrapped in separate `<motion.span key={i}>` element
  implication: Arabic characters rendered in isolated DOM nodes cannot form contextual ligatures

- timestamp: 2026-02-17T00:03:00Z
  checked: component rendering structure
  found: dir="rtl" and direction: 'rtl' set on container, display: 'inline-flex' used
  implication: RTL handling is present but doesn't solve contextual shaping (CSS cannot reconnect glyphs across DOM boundaries)

- timestamp: 2026-02-17T00:04:00Z
  checked: AudienceDisplay.tsx usage (lines 49-52)
  found: component used with Arabic text "بشائر المعرفة" (title display)
  implication: real-world usage confirmed with Arabic script

- timestamp: 2026-02-17T00:05:00Z
  checked: browser text shaping requirements
  found: Arabic contextual forms require contiguous text nodes within same element
  implication: each character in separate DOM element = isolated form rendering (no CSS solution exists)

## Resolution

root_cause: TypewriterText.tsx uses `text.split('')` (line 28) to split text into individual characters, then wraps each character in a separate `<motion.span>` element (lines 55-59). Arabic script requires contextual shaping where letter forms change based on position (initial/medial/final/isolated). When each character is isolated in its own DOM element, the browser's text shaping engine cannot apply contextual forms, resulting in all letters rendering in their isolated form regardless of position. This is a fundamental incompatibility between character-level DOM splitting and Arabic script requirements.

fix: Must keep Arabic text in a single contiguous DOM element to preserve contextual shaping, while still achieving staggered reveal animation. Options: (1) Use CSS animation with clip-path/mask for character-by-character reveal on single text node, (2) Apply per-character opacity animation via CSS variables without DOM splitting, (3) Detect Arabic script and fall back to word-level or full-text animation, or (4) Use SVG text with individual tspan elements (which can preserve shaping in some browsers).

verification: Test with Arabic text "بشائر المعرفة" - letters should render connected (ب connects to ش, ش connects to ا, etc.) instead of isolated forms.

files_changed:
- src/components/animations/TypewriterText.tsx: lines 28, 55-59 (character splitting logic)
