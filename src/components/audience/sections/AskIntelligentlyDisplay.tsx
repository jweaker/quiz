import { useOperatorStore } from '@/state'
import { getContentStyle } from '@/lib/safeArea'
import { TimerDisplay } from '@/components/audience/TimerDisplay'
import { motion } from 'motion/react'
import animalsImage from '@/assets/animals.png'

export function AskIntelligentlyDisplay() {
  const safeArea = useOperatorStore((s) => s.safeArea)
  const contentStyle = getContentStyle(safeArea)

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

      {/* Animal grid image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex-1 w-full max-w-5xl flex items-center justify-center px-4"
      >
        <img
          src={animalsImage}
          alt="72 حيواناً - اسأل بذكاء"
          className="max-w-full max-h-full object-contain rounded-lg"
          loading="eager"
        />
      </motion.div>

      {/* Timer display */}
      <TimerDisplay />
    </div>
  )
}
