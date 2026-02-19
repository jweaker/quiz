import { useCallback } from 'react'
import { audioManager } from '@/lib/audioManager'

/**
 * Timer audio hook — thin wrapper delegating to AudioManager singleton.
 *
 * Backward-compatible: returns { playBeep, playTick } with same signatures.
 * All AudioContext/AudioBuffer management is now handled by AudioManager.
 */
export function useTimerAudio() {
  /**
   * Play a warning beep at specific countdown thresholds (10s, 5s, 0s)
   */
  const playBeep = useCallback((threshold: 10 | 5 | 0) => {
    const soundId =
      threshold === 10
        ? 'timer-warning'
        : threshold === 5
          ? 'timer-urgent'
          : 'timer-expire'
    audioManager.play(soundId)
  }, [])

  /**
   * Play a tick sound (for timer ticking at rapid intervals)
   */
  const playTick = useCallback(() => {
    audioManager.play('tick')
  }, [])

  return { playBeep, playTick }
}
