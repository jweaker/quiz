import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface ScreenShakeProps {
  /** Incrementing counter to re-trigger shake. 0 = no shake. */
  trigger: number
  /** Shake intensity. Default: 'heavy' */
  intensity?: 'light' | 'heavy'
  children: React.ReactNode
}

/**
 * Screen shake effect wrapper with red flash for wrong answers.
 * Wraps children in a motion.div that shakes horizontally on trigger.
 * Heavy: ±12px over 400ms. Light: ±4px over 250ms.
 * Includes red flash overlay that pulses simultaneously.
 * Reduced motion: skip shake, show brief red border flash instead.
 */
export function ScreenShake({
  trigger,
  intensity = 'heavy',
  children,
}: ScreenShakeProps) {
  const controls = useAnimationControls()
  const flashControls = useAnimationControls()
  const prefersReducedMotion = usePrefersReducedMotion()
  const prevTrigger = useRef(trigger)

  useEffect(() => {
    if (trigger > 0 && trigger !== prevTrigger.current) {
      prevTrigger.current = trigger

      if (prefersReducedMotion) {
        // Reduced motion: brief red border flash instead of shake
        flashControls.start({
          borderColor: [
            'rgba(220, 38, 38, 0)',
            'rgba(220, 38, 38, 0.8)',
            'rgba(220, 38, 38, 0)',
          ],
          borderWidth: [0, 4, 0],
          transition: { duration: 0.5, ease: 'easeInOut' },
        })
      } else {
        // Shake animation
        const isHeavy = intensity === 'heavy'
        controls.start({
          x: isHeavy
            ? [0, -12, 12, -12, 12, -6, 6, 0]
            : [0, -4, 4, -4, 0],
          transition: {
            duration: isHeavy ? 0.4 : 0.25,
            ease: 'easeInOut',
          },
        })

        // Red flash overlay
        flashControls.start({
          opacity: [0, 0.6, 0],
          transition: {
            duration: 0.5,
            times: [0, 0.3, 1],
            ease: 'easeInOut',
          },
        })
      }
    }
  }, [trigger, intensity, controls, flashControls, prefersReducedMotion])

  return (
    <motion.div
      animate={controls}
      className="relative"
      style={{ position: 'relative' }}
    >
      {children}
      {/* Red flash overlay */}
      <motion.div
        animate={flashControls}
        initial={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none rounded-lg"
        style={{
          backgroundColor: 'rgba(220, 38, 38, 0.5)',
          borderStyle: 'solid',
          borderColor: 'rgba(220, 38, 38, 0)',
          borderWidth: 0,
        }}
      />
    </motion.div>
  )
}
