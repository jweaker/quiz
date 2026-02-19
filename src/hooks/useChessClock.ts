import { useEffect, useRef } from 'react'
import { setInterval, clearInterval } from 'worker-timers'
import { useTimerStore } from '@/state'

interface UseChessClockParams {
  onTimerExpired?: (expiredTeam: 'right' | 'left') => void
}

export function useChessClock({ onTimerExpired }: UseChessClockParams = {}) {
  const activeTimer = useTimerStore((s) => s.activeTimer)

  // Use refs for callbacks and playBeep to avoid deps churn
  const onTimerExpiredRef = useRef(onTimerExpired)
  onTimerExpiredRef.current = onTimerExpired

  const startTimeRef = useRef<number>(0)
  const intervalIdRef = useRef<number | undefined>(undefined)
  const thresholdsTriggeredRef = useRef<Set<number>>(new Set())
  // Capture which timer side was started so we read it inside the interval
  const activeTimerRef = useRef(activeTimer)
  activeTimerRef.current = activeTimer

  // Main timer effect - runs only when activeTimer identity changes (right/left/null)
  useEffect(() => {
    if (activeTimer === null) {
      // No active timer - clear interval
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = undefined
      }
      return
    }

    // Reset thresholds when timer starts or switches
    thresholdsTriggeredRef.current = new Set()
    startTimeRef.current = performance.now()

    // Start worker-timers interval for background-tab resilience
    intervalIdRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current
      const state = useTimerStore.getState()
      const side = activeTimerRef.current
      if (side === null) return

      const currentTimeMs = side === 'right' ? state.rightTimeMs : state.leftTimeMs
      const newTimeMs = Math.max(0, currentTimeMs - elapsed)

      // Update the active team's time
      if (side === 'right') {
        state.setRightTimeMs(newTimeMs)
      } else {
        state.setLeftTimeMs(newTimeMs)
      }

      // Reset start time for next tick (drift correction)
      startTimeRef.current = performance.now()

      // Calculate remaining seconds for thresholds
      const remainingSeconds = Math.ceil(newTimeMs / 1000)

      // Check audio thresholds (10s, 5s, 0s)
      const thresholds: (10 | 5 | 0)[] = [10, 5, 0]
      for (const threshold of thresholds) {
        if (remainingSeconds <= threshold && !thresholdsTriggeredRef.current.has(threshold)) {
          thresholdsTriggeredRef.current.add(threshold)
          // Audio is now handled externally via onThreshold or by the caller
        }
      }

      // Handle timer expiration
      if (newTimeMs === 0) {
        if (intervalIdRef.current !== undefined) {
          clearInterval(intervalIdRef.current)
          intervalIdRef.current = undefined
        }
        state.setActiveTimer(null)
        onTimerExpiredRef.current?.(side)
      }
    }, 100) // 100ms for smooth updates

    // Cleanup on unmount or when activeTimer changes
    return () => {
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = undefined
      }
    }
  }, [activeTimer])

  // Exposed actions — use getState() to avoid stale closures
  const startClock = (team: 'right' | 'left') => {
    useTimerStore.getState().setActiveTimer(team)
  }

  const switchClock = () => {
    const current = useTimerStore.getState().activeTimer
    if (current === null) return
    useTimerStore.getState().setActiveTimer(current === 'right' ? 'left' : 'right')
  }

  const pauseClock = () => {
    useTimerStore.getState().setActiveTimer(null)
  }

  const resetClock = (durationMs = 100_000) => {
    useTimerStore.getState().resetChessClock(durationMs)
  }

  // Computed values for display (still subscribed for rendering)
  const rightTimeMs = useTimerStore((s) => s.rightTimeMs)
  const leftTimeMs = useTimerStore((s) => s.leftTimeMs)
  const rightSeconds = Math.ceil(rightTimeMs / 1000)
  const leftSeconds = Math.ceil(leftTimeMs / 1000)
  const rightPoints = Math.floor(rightTimeMs / 5000)
  const leftPoints = Math.floor(leftTimeMs / 5000)

  return {
    activeTimer,
    rightTimeMs,
    leftTimeMs,
    rightSeconds,
    leftSeconds,
    rightPoints,
    leftPoints,
    startClock,
    switchClock,
    pauseClock,
    resetClock,
  }
}
