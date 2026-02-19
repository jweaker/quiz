import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { motion, AnimatePresence } from 'motion/react'

const WINDOWS_CATEGORIES = [
  { key: 'naturalSciences', label: 'العلوم الطبيعية', icon: '🔬' },
  { key: 'humanSciences',   label: 'العلوم الإنسانية', icon: '📖' },
  { key: 'misc',            label: 'أسئلة عامة', icon: '💡' },
  { key: 'arts',            label: 'الأدب والفنون', icon: '🎨' },
  { key: 'religion',        label: 'الدين والسيرة', icon: '☪' },
] as const

export function WindowsDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const windows = data?.parts.windows
  const activeCategory = sectionState.windowsActiveCategory

  // Category picker: shown when no category is selected
  const showPicker = !activeCategory || activeCategory === null

  // Question data
  const catQuestions = activeCategory === 'minefield'
    ? (windows?.misc ?? [])
    : activeCategory
      ? (windows?.[activeCategory] ?? [])
      : []
  const currentQ = catQuestions[sectionState.questionIndex]

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
            className="w-full max-w-4xl"
          >
            <h2 className="text-white text-center font-bold mb-6 drop-shadow-lg"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 3rem)' }}>
              نوافذ المعرفة
            </h2>
            <div className="grid grid-cols-3 gap-4 px-8">
              {WINDOWS_CATEGORIES.map((cat) => {
                const catQs = windows?.[cat.key] ?? []
                const done = catQs.every((q: { done?: boolean }) => q.done)
                return (
                  <div
                    key={cat.key}
                    className={
                      'rounded-2xl border-2 p-6 text-center transition-all ' +
                      (done
                        ? 'border-white/20 bg-white/5 opacity-40'
                        : 'border-white/40 bg-white/10 backdrop-blur-sm')
                    }
                  >
                    <div className="text-4xl mb-2">{cat.icon}</div>
                    <p className="text-white font-bold" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)' }}>
                      {cat.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`q-${activeCategory}-${sectionState.questionIndex}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6 px-8 w-full max-w-4xl"
          >
            <p
              className="text-white font-bold text-center drop-shadow-lg whitespace-pre-line"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 4rem)' }}
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
                  style={{ fontSize: 'clamp(1rem, 2.5vw, 3rem)' }}
                >
                  {currentQ.answer}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
