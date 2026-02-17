import { useEffect, useState } from 'react'
import ConfettiBoom from 'react-confetti-boom'
import { motion, AnimatePresence } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { energeticEasing } from '@/lib/animationPresets'

interface ScoreFlashProps {
  delta: number
  onComplete?: () => void
}

/**
 * Score celebration with confetti particles and flash overlay.
 * Positive scores: gold confetti burst + floating score delta with scale pop.
 * Negative scores: red delta text with shake + fade.
 * Uses universal gold/white palette (no team-specific colors per user decision).
 */
export function ScoreFlash({ delta, onComplete }: ScoreFlashProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const duration = prefersReducedMotion ? 1000 : delta > 0 ? 1500 : 1200
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [delta, onComplete, prefersReducedMotion])

  if (!visible) return null

  // Reduced motion: instant appear, disappear after 1s
  if (prefersReducedMotion) {
    return (
      <div
        className={
          'absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full font-bold z-20 ' +
          (delta > 0 ? 'text-amber-400' : 'text-red-500')
        }
        style={{ fontSize: 'clamp(1.5rem, 4vw, 4rem)' }}
      >
        {delta > 0 ? '+' : ''}
        {delta}
      </div>
    )
  }

  if (delta > 0) {
    return (
      <>
        {/* Confetti burst */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <ConfettiBoom
            particleCount={40}
            colors={['#FFD700', '#FFA500', '#FFFFFF', '#FFE4B5']}
          />
        </div>
        {/* Floating score delta with scale animation */}
        <AnimatePresence>
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full font-bold text-amber-400 z-20 drop-shadow-lg"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 4rem)' }}
            initial={{ scale: 1, opacity: 1, y: -20 }}
            animate={{
              scale: [1, 1.8, 1.2],
              opacity: [1, 1, 0],
              y: [0, 10, 20],
            }}
            transition={{
              duration: 0.5,
              ease: energeticEasing.emphasized,
              times: [0, 0.5, 1],
            }}
          >
            +{delta}
          </motion.div>
        </AnimatePresence>
      </>
    )
  }

  // Negative delta: red text with shake + fade (no confetti)
  return (
    <AnimatePresence>
      <motion.div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 translate-y-full font-bold text-red-500 z-20 drop-shadow-lg"
        style={{ fontSize: 'clamp(1.5rem, 4vw, 4rem)' }}
        initial={{ x: 0, opacity: 1, y: -20 }}
        animate={{
          x: [0, -8, 8, -8, 8, -4, 4, 0],
          opacity: [1, 1, 1, 1, 1, 1, 0.5, 0],
          y: [0, 10, 20],
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut',
        }}
      >
        {delta}
      </motion.div>
    </AnimatePresence>
  )
}
