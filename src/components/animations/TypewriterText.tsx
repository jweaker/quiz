import type { CSSProperties } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface TypewriterTextProps {
  text: string
  /** Stagger delay between letters in seconds (default 0.03 = 30ms) */
  speed?: number
  className?: string
  /** Additional inline styles (merged with RTL defaults) */
  style?: CSSProperties
  /** Called when the full text reveal animation completes */
  onComplete?: () => void
}

/**
 * RTL-aware text reveal component using clip-path animation.
 * Keeps all text in a single DOM element to preserve Arabic contextual shaping
 * (connected cursive letter forms). Reveals right-to-left via clip-path inset.
 */
export function TypewriterText({
  text,
  speed = 0.03,
  className,
  style: externalStyle,
  onComplete,
}: TypewriterTextProps) {
  const prefersReducedMotion = useReducedMotion()
  const duration = text.length * speed

  if (prefersReducedMotion) {
    return (
      <div
        dir="rtl"
        style={{ direction: 'rtl', textAlign: 'right', ...externalStyle }}
        className={className}
      >
        {text}
      </div>
    )
  }

  return (
    <motion.div
      dir="rtl"
      style={{ direction: 'rtl', textAlign: 'right', ...externalStyle }}
      className={className}
      initial={{ opacity: 0, y: 20, clipPath: 'inset(0 0 0 100%)' }}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0%)' }}
      transition={{
        opacity: { duration: 0.3, delay: 0.2 },
        y: { duration: 0.4, delay: 0.2 },
        clipPath: { duration, delay: 0.4, ease: 'linear' },
      }}
      onAnimationComplete={() => onComplete?.()}
    >
      {text}
    </motion.div>
  )
}
