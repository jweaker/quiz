/**
 * Centralized keyboard shortcut definitions.
 * Used by both inline hints on buttons and the full shortcut overlay.
 */

export type ShortcutCategory = 'scoring' | 'timer' | 'navigation' | 'chess-clock' | 'general' | 'section'

export interface ShortcutDef {
  keys: string
  label: string
  category: ShortcutCategory
  description?: string
}

/**
 * All keyboard shortcuts registered in the app.
 * Keys use a canonical format: mod = Cmd/Ctrl, shift, alt, then the key.
 */
export const SHORTCUTS: Record<string, ShortcutDef> = {
  // Scoring
  'score-1': { keys: '1', label: '+1', category: 'scoring', description: 'سؤال سريع' },
  'score-2': { keys: '2', label: '+2', category: 'scoring', description: 'نوافذ المعرفة' },
  'score-5': { keys: '5', label: '+5', category: 'scoring', description: 'لغز / مناظرة' },
  'score-8': { keys: '8', label: '+8', category: 'scoring', description: 'نوافذ المعرفة (كامل)' },
  'score-10': { keys: '0', label: '+10', category: 'scoring', description: 'لغز أول حل' },
  'score-15': { keys: 'shift+5', label: '+15', category: 'scoring', description: 'لغز / مناظرة (كامل)' },
  'score-16': { keys: 'shift+6', label: '+16', category: 'scoring', description: 'حقل ألغام (صحيح)' },
  'score-neg8': { keys: '-', label: '-8', category: 'scoring', description: 'حقل ألغام (خطأ)' },
  'toggle-turn': { keys: 'space', label: 'تبديل الدور', category: 'scoring' },
  'swap-sides': { keys: 'mod+shift+s', label: 'تبديل الجوانب', category: 'scoring' },
  'undo': { keys: 'mod+z', label: 'تراجع', category: 'scoring' },
  'redo': { keys: 'mod+shift+z', label: 'إعادة', category: 'scoring' },

  // Timer (countdown)
  'timer-toggle': { keys: 't', label: 'بدء / إيقاف', category: 'timer', description: 'العد التنازلي' },
  'timer-reset': { keys: 'shift+t', label: 'إعادة تعيين', category: 'timer', description: 'العد التنازلي' },

  // Chess clock
  'clock-right': { keys: '[', label: 'بدء الأيمن', category: 'chess-clock' },
  'clock-left': { keys: ']', label: 'بدء الأيسر', category: 'chess-clock' },
  'clock-switch': { keys: '\\', label: 'تبديل الساعة', category: 'chess-clock' },
  'clock-pause': { keys: 'p', label: 'إيقاف', category: 'chess-clock' },
  'clock-reset': { keys: 'shift+p', label: 'إعادة تعيين', category: 'chess-clock' },

  // Pass (Poetic Chase)
  'pass-verse': { keys: 'g', label: 'تمرير', category: 'chess-clock', description: 'تمرير البيت' },
  'pass-correct': { keys: 'v', label: 'صحيح', category: 'chess-clock', description: 'إجابة صحيحة' },
  'pass-wrong': { keys: 'x', label: 'خطأ', category: 'chess-clock', description: 'إجابة خاطئة' },

  // General
  'open-audience': { keys: 'mod+shift+a', label: 'فتح العرض', category: 'general', description: 'فتح شاشة الجمهور' },
  'shortcuts-overlay': { keys: 'shift+/', label: '?', category: 'general', description: 'مرجع الاختصارات' },
  'escape': { keys: 'escape', label: 'رجوع', category: 'general' },

  // Navigation
  'tab-cycle': { keys: '`', label: 'تبديل اللوحة', category: 'navigation' },
  'toggle-rundown': { keys: 'r', label: 'إظهار/إخفاء الخطة', category: 'navigation' },
  'next-section': { keys: 'mod+left', label: 'القسم التالي', category: 'navigation' },
  'prev-section': { keys: 'mod+right', label: 'القسم السابق', category: 'navigation' },

  // Section — question flow (all sections)
  'section-show-answer': { keys: 'enter', label: 'عرض السؤال / الجواب', category: 'section' },
  'section-next-question': { keys: 'n', label: 'السؤال التالي', category: 'section' },
  'section-prev-question': { keys: 'b', label: 'السؤال السابق', category: 'section' },
  // Section — Speed Question
  'section-right-answered': { keys: 'z', label: 'أجاب الأيمن', category: 'section', description: 'سؤال السرعة' },
  'section-left-answered': { keys: 'c', label: 'أجاب الأيسر', category: 'section', description: 'سؤال السرعة' },
  // Section — Rapid Questions
  'section-switch-team': { keys: 's', label: 'تبديل الفريق', category: 'section', description: 'الرشق السريع' },
  // Section — Debate
  'section-debate-reveal': { keys: 'enter', label: 'كشف التالي', category: 'section', description: 'النقاش' },
  // Section — Ask Intelligently
  'section-end-ask': { keys: 'e', label: 'إنهاء اسأل بذكاء', category: 'section' },
}

/**
 * Get all shortcuts for a given category.
 */
export function getShortcutsByCategory(category: ShortcutCategory): ShortcutDef[] {
  return Object.values(SHORTCUTS).filter((s) => s.category === category)
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent)

/**
 * Format shortcut key string for display.
 * Converts canonical format to platform-specific symbols.
 * e.g., 'mod+shift+s' -> '⌘⇧S' (macOS) or 'Ctrl+⇧S' (Windows)
 */
export function formatShortcutKey(keys: string): string {
  return keys
    .split('+')
    .map((part) => {
      const lower = part.toLowerCase()
      if (lower === 'mod') return isMac ? '⌘' : 'Ctrl'
      if (lower === 'shift') return '⇧'
      if (lower === 'alt') return isMac ? '⌥' : 'Alt'
      if (lower === 'space') return 'Space'
      if (lower === 'escape') return 'Esc'
      if (lower === '\\') return '\\'
      return part.toUpperCase()
    })
    .join('')
}

/**
 * Category display labels (Arabic).
 */
export const CATEGORY_LABELS: Record<ShortcutCategory, string> = {
  scoring: 'التحكم بالنقاط',
  timer: 'المؤقتات',
  'chess-clock': 'ساعة الشطرنج',
  navigation: 'التنقل',
  general: 'عام',
  section: 'أقسام البرنامج',
}
