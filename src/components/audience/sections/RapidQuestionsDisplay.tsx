import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { motion, AnimatePresence } from 'motion/react'

export function RapidQuestionsDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const quickSets = data?.parts.quickQuestions ?? []
  const currentSet = quickSets[0]
  const subQuestions = currentSet?.questions ?? []
  const currentSubQ = subQuestions[sectionState.questionIndex]

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-8">
      {/* Section/set title */}
      {currentSet?.title && (
        <p className="text-white/60 font-bold text-center"
           style={{ fontSize: 'clamp(1rem, 2vw, 2.5rem)' }}>
          {currentSet.title}
        </p>
      )}

      {/* Current sub-question */}
      <AnimatePresence mode="wait">
        <motion.p
          key={sectionState.questionIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-white font-bold text-center drop-shadow-lg px-8 whitespace-pre-line"
          style={{ fontSize: 'clamp(2rem, 4vw, 5rem)' }}
        >
          {currentSubQ?.text ?? (currentSet?.title ?? 'الرشق السريع')}
        </motion.p>
      </AnimatePresence>

      <TimerDisplay />
    </div>
  )
}
