import type { CSSProperties } from 'react'
import { motion } from 'motion/react'
import { typewriterVariants } from '@/lib/animationPresets'

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
 * RTL-aware letter-by-letter text reveal component.
 * Letters slide up from below with opacity fade, staggered at 30ms intervals.
 * Arabic text renders right-to-left in correct reading order.
 */
export function TypewriterText({
  text,
  speed = 0.03,
  className,
  style: externalStyle,
  onComplete,
}: TypewriterTextProps) {
  const letters = text.split('')

  // Build custom container variants if speed differs from default
  const containerVariants =
    speed === 0.03
      ? typewriterVariants.container
      : {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: speed,
              delayChildren: 0.2,
            },
          },
        }

  return (
    <motion.div
      dir="rtl"
      style={{ direction: 'rtl', textAlign: 'right', display: 'inline-flex', flexWrap: 'wrap', ...externalStyle }}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onAnimationComplete={() => onComplete?.()}
    >
      {letters.map((letter, i) => (
        <motion.span key={i} variants={typewriterVariants.letter}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  )
}
