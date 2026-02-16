import { useState, useCallback } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { motion, AnimatePresence } from 'motion/react'
import {
  getShortcutsByCategory,
  formatShortcutKey,
  CATEGORY_LABELS,
} from '@/lib/shortcutRegistry'
import type { ShortcutCategory } from '@/lib/shortcutRegistry'
import { X } from 'lucide-react'

const CATEGORIES: ShortcutCategory[] = ['scoring', 'timer', 'chess-clock', 'navigation', 'general']

/**
 * Full keyboard shortcut reference overlay.
 * Toggled by pressing ? (Shift+/).
 * Shows all shortcuts grouped by category in a compact multi-column grid.
 */
export function KeyboardShortcutOverlay() {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  useHotkeys('shift+/', toggle, { enableOnFormTags: false })
  useHotkeys('escape', () => setIsOpen(false), { enableOnFormTags: false, enabled: isOpen }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-card border rounded-lg shadow-2xl max-w-[560px] w-[90vw] max-h-[80vh] overflow-auto p-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold">اختصارات لوحة المفاتيح</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Shortcuts grouped by category */}
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map((category) => {
                const shortcuts = getShortcutsByCategory(category)
                if (shortcuts.length === 0) return null

                return (
                  <div key={category}>
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 border-b pb-1">
                      {CATEGORY_LABELS[category]}
                    </h3>
                    <div className="space-y-0.5">
                      {shortcuts.map((shortcut, idx) => (
                        <div
                          key={`${category}-${idx}`}
                          className="flex items-center justify-between gap-2 py-0.5"
                        >
                          <span className="text-[11px] text-foreground truncate">
                            {shortcut.label}
                            {shortcut.description && (
                              <span className="text-muted-foreground ms-1">
                                ({shortcut.description})
                              </span>
                            )}
                          </span>
                          <kbd className="shrink-0 px-1.5 py-0.5 text-[10px] font-mono bg-muted border rounded text-muted-foreground">
                            {formatShortcutKey(shortcut.keys)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="mt-3 pt-2 border-t text-center">
              <p className="text-[10px] text-muted-foreground">
                اضغط <kbd className="px-1 py-0 text-[9px] bg-muted border rounded">?</kbd> لإغلاق
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
