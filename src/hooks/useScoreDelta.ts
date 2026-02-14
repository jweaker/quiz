import { useEffect, useRef, useState } from 'react'

/**
 * Hook to compute and display score delta (+N/-N) for 2 seconds after score change.
 * Skips delta on first render to avoid spurious indicators on page load.
 */
export function useScoreDelta(currentScore: number): number | null {
  const [delta, setDelta] = useState<number | null>(null)
  const previousScoreRef = useRef<number>(currentScore)
  const isFirstRenderRef = useRef<boolean>(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Skip delta on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      previousScoreRef.current = currentScore
      return
    }

    // Calculate delta if score changed
    if (currentScore !== previousScoreRef.current) {
      const scoreDelta = currentScore - previousScoreRef.current
      previousScoreRef.current = currentScore

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set delta and schedule clear after 2 seconds
      setDelta(scoreDelta)
      timeoutRef.current = setTimeout(() => {
        setDelta(null)
      }, 2000)
    }
  }, [currentScore])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return delta
}
