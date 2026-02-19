import { useShowStore, useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { motion, AnimatePresence } from 'motion/react'
import animalsImage from '@/assets/animals.png'

const TOTAL_CELLS = 72

export function AskIntelligentlyDisplay() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)
  const revealedAnimals = useShowStore((s) => s.sectionState.revealedAnimals)

  return (
    <div style={contentStyle} className="flex flex-col items-center justify-center h-full gap-4">
      {/* Section title */}
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-white/70 font-bold text-center"
        style={{ fontSize: 'clamp(1rem, 2vw, 2rem)' }}
      >
        اسأل بذكاء
      </motion.p>

      {/* Animal grid with overlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 w-full max-w-5xl flex items-center justify-center px-4"
      >
        <div
          className="relative w-full rounded-lg overflow-hidden"
          style={{
            aspectRatio: '16 / 9',
            backgroundImage: `url(${animalsImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Grid overlay */}
          <div className="absolute inset-0 grid grid-cols-9" style={{ gridTemplateRows: 'repeat(8, 1fr)' }}>
            {Array.from({ length: TOTAL_CELLS }, (_, i) => {
              const isRevealed = revealedAnimals.includes(i)
              return (
                <div key={i} className="relative border border-white/5">
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 bg-emerald-500/30 ring-2 ring-inset ring-emerald-400"
                      />
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Timer display */}
      <TimerDisplay />
    </div>
  )
}
