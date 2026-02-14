import { useEffect, useRef } from 'react'
import { setInterval, clearInterval } from 'worker-timers'
import { useTimerStore } from '@/state'
import { useTimerAudio } from './useTimerAudio'

interface UseChessClockParams {
  onTimerExpired?: (expiredTeam: 'right' | 'left') => void
}

export function useChessClock({ onTimerExpired }: UseChessClockParams = {}) {
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const rightTimeMs = useTimerStore((s) => s.rightTimeMs)
  const leftTimeMs = useTimerStore((s) => s.leftTimeMs)
  const setRightTimeMs = useTimerStore((s) => s.setRightTimeMs)
  const setLeftTimeMs = useTimerStore((s) => s.setLeftTimeMs)
  const setActiveTimer = useTimerStore((s) => s.setActiveTimer)
  const resetChessClock = useTimerStore((s) => s.resetChessClock)

  const { playBeep } = useTimerAudio()

  const startTimeRef = useRef<number>(0)
  const intervalIdRef = useRef<number | undefined>(undefined)
  const thresholdsTriggeredRef = useRef<Set<number>>(new Set())

  // Main timer effect - runs when activeTimer changes
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
      const currentTimeMs = activeTimer === 'right' ? rightTimeMs : leftTimeMs
      const newTimeMs = Math.max(0, currentTimeMs - elapsed)

      // Update the active team's time
      if (activeTimer === 'right') {
        setRightTimeMs(newTimeMs)
      } else {
        setLeftTimeMs(newTimeMs)
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
          playBeep(threshold)
        }
      }

      // Handle timer expiration
      if (newTimeMs === 0) {
        if (intervalIdRef.current !== undefined) {
          clearInterval(intervalIdRef.current)
          intervalIdRef.current = undefined
        }
        setActiveTimer(null)
        onTimerExpired?.(activeTimer)
      }
    }, 100) // 100ms for smooth updates

    // Cleanup on unmount or when activeTimer changes
    return () => {
      if (intervalIdRef.current !== undefined) {
        clearInterval(intervalIdRef.current)
        intervalIdRef.current = undefined
      }
    }
  }, [activeTimer, rightTimeMs, leftTimeMs, setRightTimeMs, setLeftTimeMs, setActiveTimer, playBeep, onTimerExpired])

  // Exposed actions
  const startClock = (team: 'right' | 'left') => {
    setActiveTimer(team)
  }

  const switchClock = () => {
    if (activeTimer === null) return
    setActiveTimer(activeTimer === 'right' ? 'left' : 'right')
  }

  const pauseClock = () => {
    setActiveTimer(null)
  }

  const resetClock = (durationMs = 100_000) => {
    resetChessClock(durationMs)
  }

  // Computed values for display
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
