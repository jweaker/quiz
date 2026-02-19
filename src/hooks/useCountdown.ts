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

  // Use refs for callbacks to avoid recreating the interval when callbacks change
  const onTickRef = useRef(onTick)
  const onCompleteRef = useRef(onComplete)
  const onThresholdRef = useRef(onThreshold)
  onTickRef.current = onTick
  onCompleteRef.current = onComplete
  onThresholdRef.current = onThreshold

  const startTimeRef = useRef<number>(0)
  const intervalIdRef = useRef<number | undefined>(undefined)
  const thresholdsTriggeredRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if (countdownRunning) {
      // Read current values via getState() — no subscription needed
      const { countdownDuration, countdownRemaining } = useTimerStore.getState()

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

        useTimerStore.getState().setCountdownRemaining(remaining)
        onTickRef.current?.(remaining)

        // Check thresholds (10s, 5s, 0s) - only trigger once per threshold
        const thresholds = [10, 5, 0]
        for (const threshold of thresholds) {
          if (remaining <= threshold && !thresholdsTriggeredRef.current.has(threshold)) {
            thresholdsTriggeredRef.current.add(threshold)
            onThresholdRef.current?.(threshold)
          }
        }

        // Complete when reaching 0
        if (remaining === 0) {
          if (intervalIdRef.current !== undefined) {
            clearInterval(intervalIdRef.current)
            intervalIdRef.current = undefined
          }
          useTimerStore.getState().setCountdownRunning(false)
          onCompleteRef.current?.()
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
  }, [countdownRunning])
}
