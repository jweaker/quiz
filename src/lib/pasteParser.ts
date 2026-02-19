import type { Question } from './episodeSchema'

// ─── Format Detection ────────────────────────────────────────────

export type PasteFormat = 'json' | 'tsv' | 'qa-pairs' | 'lines'

/**
 * Detect the format of pasted text.
 * Priority: JSON > TSV > QA-pairs > lines (fallback)
 */
export function detectPasteFormat(text: string): PasteFormat {
  const trimmed = text.trim()
  if (!trimmed) return 'lines'

  // JSON: starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Not valid JSON, continue detection
    }
  }

  // TSV: majority of lines contain tabs
  const lines = trimmed.split('\n').filter((l) => l.trim())
  const tabLines = lines.filter((l) => l.includes('\t'))
  if (tabLines.length > lines.length / 2) return 'tsv'

  // QA-pairs: lines match Q/A patterns
  // English: Q: / A:, Arabic: س: / ج:, Numbered with indented answers
  const qaPattern =
    /^(?:Q|A|q|a|س|ج)\s*[:：]|^(?:\d+[\.\)、]|[١٢٣٤٥٦٧٨٩٠]+[\.\)،])\s*.+/
  const qaMatches = lines.filter((l) => qaPattern.test(l.trim()))
  if (qaMatches.length > lines.length / 3) return 'qa-pairs'

  return 'lines'
}

// ─── Parsing ─────────────────────────────────────────────────────

const defaultQuestion = (): Question => ({
  text: '',
  answer: '',
  duration: 30,
  marks: 0,
})

function parseJSON(text: string): Question[] {
  try {
    const parsed = JSON.parse(text.trim())
    const items = Array.isArray(parsed) ? parsed : [parsed]
    return items
      .map((item: Record<string, unknown>) => ({
        ...defaultQuestion(),
        text: String(item.text ?? item.question ?? item.سؤال ?? ''),
        answer: String(item.answer ?? item.إجابة ?? item.جواب ?? ''),
        duration: Number(item.duration ?? item.مدة ?? 30) || 30,
        marks: Number(item.marks ?? item.نقاط ?? 0) || 0,
      }))
      .filter((q) => q.text.trim())
  } catch {
    return []
  }
}

function parseTSV(text: string): Question[] {
  return text
    .trim()
    .split('\n')
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split('\t')
      return {
        ...defaultQuestion(),
        text: (cols[0] ?? '').trim(),
        answer: (cols[1] ?? '').trim(),
        duration: Number(cols[2]) || 30,
        marks: Number(cols[3]) || 0,
      }
    })
    .filter((q) => q.text)
}

function parseQAPairs(text: string): Question[] {
  const lines = text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const questions: Question[] = []
  let current: Question | null = null

  for (const line of lines) {
    // Question line: Q:, س:, numbered
    const qMatch = line.match(
      /^(?:Q|q|س)\s*[:：]\s*(.+)|^(?:\d+[\.\)、]|[١٢٣٤٥٦٧٨٩٠]+[\.\)،])\s*(.+)/
    )
    // Answer line: A:, ج:
    const aMatch = line.match(/^(?:A|a|ج)\s*[:：]\s*(.+)/)

    if (qMatch) {
      if (current) questions.push(current)
      current = {
        ...defaultQuestion(),
        text: (qMatch[1] ?? qMatch[2] ?? '').trim(),
      }
    } else if (aMatch && current) {
      current.answer = (aMatch[1] ?? '').trim()
    }
  }
  if (current) questions.push(current)

  return questions.filter((q) => q.text)
}

function parseLines(text: string): Question[] {
  return text
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => ({
      ...defaultQuestion(),
      text: line,
    }))
}

/**
 * Parse pasted text into Question[] with automatic format detection.
 * Handles JSON, TSV, QA-pair patterns, and plain lines.
 * Supports Arabic question marks ؟ and Arabic-Indic numerals ١٢٣.
 */
export function parsePastedQuestions(text: string): Question[] {
  if (!text.trim()) return []

  // Normalize Arabic question marks
  const normalized = text.replace(/؟/g, '?')

  const format = detectPasteFormat(normalized)

  switch (format) {
    case 'json':
      return parseJSON(normalized)
    case 'tsv':
      return parseTSV(normalized)
    case 'qa-pairs':
      return parseQAPairs(normalized)
    case 'lines':
      return parseLines(normalized)
  }
}
