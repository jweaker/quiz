import { useState, useEffect } from 'react'

/**
 * Detects whether the user prefers reduced motion.
 * SSR-safe: defaults to true (reduced) until client-side check.
 * Listens for preference changes in real time.
 *
 * Use this for non-Motion animations (confetti, Three.js, custom CSS).
 * Motion components already respect reduced motion via MotionConfig.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: no-preference)')
    setPrefersReducedMotion(!mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(!e.matches)
    }

    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  return prefersReducedMotion
}
