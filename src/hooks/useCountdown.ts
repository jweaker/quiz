import { useEffect, useRef } from 'react'
import { setInterval, clearInterval } from 'worker-timers'
import { useTimerStore } from '@/state'

interface UseCountdownParams {
  onTick?: (remaining: number) => void
  onComplete?: () => void
  onThreshold?: (seconds: number) => void
}

export function useCountdown({ onTick, onComplete, onThreshold }: UseCountdownParams = {}) {
  const countdownRunning = useTimerStore((s) => s.countdownRunning)
  const countdownDuration = useTimerStore((s) => s.countdownDuration)
  const countdownRemaining = useTimerStore((s) => s.countdownRemaining)
  const setCountdownRemaining = useTimerStore((s) => s.setCountdownRemaining)
  const setCountdownRunning = useTimerStore((s) => s.setCountdownRunning)

  const startTimeRef = useRef<number>(0)
  const intervalIdRef = useRef<number | undefined>(undefined)
  const thresholdsTriggeredRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (countdownRunning) {
      // Reset thresholds only when starting fresh (not on resume)
      if (countdownRemaining === countdownDuration) {
        thresholdsTriggeredRef.current = new Set()
      }
      // Calculate startTime to account for already-elapsed time on resume
      startTimeRef.current = performance.now() - ((countdownDuration - countdownRemaining) * 1000)
      const durationMs = countdownDuration * 1000

      // Worker-timers setInterval for background-tab resilience
      intervalIdRef.current = setInterval(() => {
        const elapsed = performance.now() - startTimeRef.current
        const remaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000))

        setCountdownRemaining(remaining)
        onTick?.(remaining)

        // Check thresholds (10s, 5s, 0s) - only trigger once per threshold
        const thresholds = [10, 5, 0]
        for (const threshold of thresholds) {
          if (remaining <= threshold && !thresholdsTriggeredRef.current.has(threshold)) {
            thresholdsTriggeredRef.current.add(threshold)
            onThreshold?.(threshold)
          }
        }

        // Complete when reaching 0
        if (remaining === 0) {
          if (intervalIdRef.current !== undefined) {
            clearInterval(intervalIdRef.current)
            intervalIdRef.current = undefined
          }
          setCountdownRunning(false)
          onComplete?.()
        }
      }, 100) // 100ms for smooth updates
    } else {
      // Countdown paused or stopped - clear interval
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = undefined
      }
    }

    // Cleanup on unmount or when countdownRunning changes
    return () => {
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = undefined
      }
    }
  }, [countdownRunning, countdownDuration, countdownRemaining, setCountdownRemaining, setCountdownRunning, onTick, onComplete, onThreshold])
}
