import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { motion, AnimatePresence } from 'motion/react'

export function SpeedQuestionDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const questions = data?.parts.speedQuestions ?? []
  const currentQ = questions[sectionState.questionIndex]

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={sectionState.questionIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center px-8"
        >
          <p className="text-white font-bold text-center drop-shadow-lg whitespace-pre-line"
             style={{ fontSize: 'clamp(2rem, 4vw, 5rem)' }}>
            {currentQ?.text ?? 'سؤال السرعة'}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
