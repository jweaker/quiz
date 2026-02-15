import { motion, AnimatePresence } from 'motion/react'
import { wipeVariants, animationPresets } from '@/lib/animationPresets'
import type { ReactNode } from 'react'

type WipeDirection = 'left' | 'right' | 'up' | 'down'

interface WipeTransitionProps {
  /** Unique key for AnimatePresence to track section changes */
  sectionKey: string
  /** Direction of the wipe transition (default 'left') */
  direction?: WipeDirection
  children: ReactNode
}

/**
 * Cinematic directional wipe transition wrapper.
 * Uses AnimatePresence mode="popLayout" for overlapping enter/exit.
 * New content slides in from the given direction while old content slides out.
 */
export function WipeTransition({
  sectionKey,
  direction = 'left',
  children,
}: WipeTransitionProps) {
  const variants = wipeVariants(direction)

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={sectionKey}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={animationPresets.sectionWipe}
        style={{ position: 'absolute', inset: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
