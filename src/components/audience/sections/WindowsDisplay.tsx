import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { motion, AnimatePresence } from 'motion/react'
import type { WindowsCategoryKey } from '@/lib/episodeSchema'

const WINDOWS_CATEGORIES = [
  { key: 'religion', label: 'الدين والسيرة' },
  { key: 'humanSciences', label: 'العلوم الإنسانية' },
  { key: 'naturalSciences', label: 'العلوم الطبيعية' },
  { key: 'arts', label: 'الأدب والفنون' },
  { key: 'misc', label: 'حقل الألغام' },
] as const

export function WindowsDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const windows = data?.parts.windows
  const activeCategory = sectionState.windowsActiveCategory as WindowsCategoryKey | null

  const showPicker = !activeCategory
  const catQuestions = activeCategory ? (windows?.[activeCategory] ?? []) : []
  const hasSelectedQuestion = sectionState.questionIndex >= 0
  const currentQ = hasSelectedQuestion ? catQuestions[sectionState.questionIndex] : undefined
  const categoryLabel = WINDOWS_CATEGORIES.find((c) => c.key === activeCategory)?.label ?? ''

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-6">
      <AnimatePresence mode="wait">
        {showPicker ? (
          <motion.div
            key="picker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl"
          >
            <h2
              className="text-white text-center font-bold mb-6 drop-shadow-lg"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3.6rem)' }}
            >
              نوافذ المعرفة
            </h2>
            <div className="grid grid-cols-3 gap-4 px-8">
              {WINDOWS_CATEGORIES.map((cat) => {
                const catQs = windows?.[cat.key] ?? []
                const done = catQs.length > 0 && catQs.every((q: { done?: boolean }) => q.done)
                return (
                  <div
                    key={cat.key}
                    className={
                      'rounded-2xl border-2 p-5 text-center transition-all ' +
                      (cat.key === 'misc'
                        ? 'border-red-500/40 bg-red-500/10 backdrop-blur-sm'
                        : done
                          ? 'border-white/20 bg-white/5 opacity-50'
                          : 'border-white/40 bg-white/10 backdrop-blur-sm')
                    }
                  >
                    <p
                      className="text-white font-bold"
                      style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.6rem)' }}
                    >
                      {cat.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : !hasSelectedQuestion ? (
          <motion.div
            key={`pick-${activeCategory}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-4 px-8 w-full max-w-5xl"
          >
            <p className="text-white/80 font-bold" style={{ fontSize: 'clamp(1rem, 1.8vw, 2rem)' }}>
              {categoryLabel}
            </p>
            <p className="text-white font-bold text-center drop-shadow-lg" style={{ fontSize: 'clamp(1.6rem, 2.8vw, 3.8rem)' }}>
              اختر رقم السؤال
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`q-${activeCategory}-${sectionState.questionIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6 px-8 w-full max-w-5xl"
          >
            <div className="text-center">
              <p className="text-white/80 font-bold" style={{ fontSize: 'clamp(1rem, 1.8vw, 2rem)' }}>
                {categoryLabel}
              </p>
              <p className="text-white/70 western-numerals" style={{ fontSize: 'clamp(0.9rem, 1.4vw, 1.5rem)' }}>
                سؤال {sectionState.questionIndex + 1}
              </p>
            </div>

            <p
              className="text-white font-bold text-center drop-shadow-lg whitespace-pre-line"
              style={{ fontSize: 'clamp(1.8rem, 3.2vw, 4.5rem)' }}
            >
              {currentQ?.text ?? ''}
            </p>

            <AnimatePresence>
              {sectionState.answerRevealed && currentQ?.answer && (
                <motion.p
                  key="answer"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="text-amber-300 font-bold text-center whitespace-pre-line drop-shadow-lg"
                  style={{ fontSize: 'clamp(1.1rem, 2.4vw, 3.2rem)' }}
                >
                  {currentQ.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {activeCategory && hasSelectedQuestion && <TimerDisplay />}
    </div>
  )
}
