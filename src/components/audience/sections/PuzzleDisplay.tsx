import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { motion, AnimatePresence } from 'motion/react'

export function PuzzleDisplay() {
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

  const puzzles = data?.parts.puzzles ?? []
  const currentPuzzle = puzzles[sectionState.questionIndex] ?? puzzles[0]

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={sectionState.questionIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center gap-6 px-8 w-full max-w-4xl"
        >
          <p
            className="text-white font-bold text-center drop-shadow-lg whitespace-pre-line"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 4.5rem)' }}
          >
            {currentPuzzle?.text ?? 'الألغاز'}
          </p>
          <AnimatePresence>
            {sectionState.answerRevealed && currentPuzzle?.answer && (
              <motion.p
                key="answer"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="text-amber-300 font-bold text-center whitespace-pre-line drop-shadow-lg"
                style={{ fontSize: 'clamp(1rem, 2vw, 3rem)' }}
              >
                {currentPuzzle.answer}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
      {/* Countdown timer — reuses existing TimerDisplay component */}
      <TimerDisplay />
    </div>
  )
}
