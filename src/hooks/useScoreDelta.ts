import { useEffect, useRef, useState } from 'react'

export interface DeltaEntry {
  id: number
  value: number
}

/**
 * Hook to compute and display score deltas (+N/-N) with parallel animation support.
 * Each score change creates a new delta entry that auto-removes after 2 seconds.
 * Skips delta on first render to avoid spurious indicators on page load.
 * Returns array of active deltas for simultaneous animations.
 */
export function useScoreDelta(currentScore: number): DeltaEntry[] {
  const [deltas, setDeltas] = useState<DeltaEntry[]>([])
  const previousScoreRef = useRef<number>(currentScore)
  const isFirstRenderRef = useRef<boolean>(true)
  const nextIdRef = useRef<number>(0)

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

      // Create new delta entry with unique ID
      const newDelta: DeltaEntry = {
        id: nextIdRef.current++,
        value: scoreDelta,
      }

      // Add new delta to array (parallel animations)
      setDeltas((prev) => [...prev, newDelta])

      // Schedule removal after 2 seconds
      setTimeout(() => {
        setDeltas((prev) => prev.filter((d) => d.id !== newDelta.id))
      }, 2000)
    }
  }, [currentScore])

  return deltas
}
