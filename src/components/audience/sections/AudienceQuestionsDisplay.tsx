import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { motion, AnimatePresence } from 'motion/react'

export function AudienceQuestionsDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const questions = data?.parts.audienceQuestions ?? []
  const currentQ = questions[sectionState.questionIndex]

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-8">
      <AnimatePresence mode="wait">
        <motion.p
          key={`q-${sectionState.questionIndex}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-white font-bold text-center drop-shadow-lg whitespace-pre-line px-8"
          style={{ fontSize: 'clamp(2rem, 4vw, 5rem)' }}
        >
          {currentQ?.text ?? 'سؤال الجمهور'}
        </motion.p>
      </AnimatePresence>
      <AnimatePresence>
        {sectionState.answerRevealed && currentQ?.answer && (
          <motion.p
            key={`a-${sectionState.questionIndex}`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-amber-300 font-bold text-center drop-shadow-lg whitespace-pre-line px-8"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 4rem)' }}
          >
            {currentQ.answer}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
