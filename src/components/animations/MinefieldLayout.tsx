import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { energeticEasing } from '@/lib/animationPresets'

interface MinefieldLayoutProps {
  /** Whether the Minefield section is active */
  active: boolean
  children: React.ReactNode
}

/**
 * Minefield visual treatment with dark background and suspense accents.
 * Same layout structure as other sections, but with dark bg, spotlight,
 * and pulsing red glow for tension/suspense.
 */
export function MinefieldLayout({ active, children }: MinefieldLayoutProps) {
  if (!active) {
    return <>{children}</>
  }

  return (
    <div className="relative w-full h-full">
      {/* Dark background overlay */}
      <div className="absolute inset-0 bg-black/90 z-0" />

      {/* Spotlight: radial gradient from transparent center to dark edges */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />

      {/* Pulsing red glow container */}
      <motion.div
        className="relative z-[2] w-full h-full"
        animate={{
          boxShadow: [
            'inset 0 0 20px rgba(220, 38, 38, 0.2)',
            'inset 0 0 50px rgba(220, 38, 38, 0.5)',
            'inset 0 0 20px rgba(220, 38, 38, 0.2)',
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// --- StakesFlash sub-component ---

interface StakesFlashProps {
  /** The point value to display (+16, -8, 0). null = hidden. */
  value: number | null
  /** Answer type determines color and animation style */
  type: 'correct' | 'wrong' | 'partial'
}

/**
 * Dramatic stakes flash overlay showing +16/-8/0 when answer is given.
 * Large centered text that appears dramatically and auto-hides.
 * Per user decision: "score stakes flash on answer -- shown dramatically
 * when answer is given, not permanently visible."
 */
export function StakesFlash({ value, type }: StakesFlashProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (value !== null) {
      setVisible(true)
      const duration = type === 'wrong' ? 2000 : type === 'correct' ? 1500 : 1200
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [value, type])

  const colorClass =
    type === 'correct'
      ? 'text-green-400'
      : type === 'wrong'
        ? 'text-red-500'
        : 'text-amber-400'

  const displayValue =
    value !== null
      ? value > 0
        ? `+${value}`
        : `${value}`
      : ''

  return (
    <AnimatePresence>
      {visible && value !== null && (
        <motion.div
          className={
            'fixed inset-0 flex items-center justify-center z-50 pointer-events-none'
          }
          initial={{ opacity: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <motion.span
            className={`font-bold drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] ${colorClass}`}
            style={{ fontSize: 'clamp(4rem, 12vw, 8rem)' }}
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : type === 'correct'
                  ? { scale: 0.5, opacity: 0 }
                  : type === 'wrong'
                    ? { scale: 1.2, opacity: 0, x: 0 }
                    : { opacity: 0 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : type === 'correct'
                  ? {
                      scale: [0.5, 1.3, 1],
                      opacity: 1,
                    }
                  : type === 'wrong'
                    ? {
                        opacity: 1,
                        x: [0, -12, 12, -12, 12, -6, 6, 0],
                      }
                    : { opacity: 1 }
            }
            transition={
              type === 'correct'
                ? {
                    duration: 0.5,
                    ease: energeticEasing.emphasized,
                  }
                : type === 'wrong'
                  ? {
                      duration: 0.5,
                      ease: 'easeInOut',
                    }
                  : {
                      duration: 0.4,
                      ease: 'easeOut',
                    }
            }
          >
            {displayValue}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
