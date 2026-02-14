import { useEffect, useRef, useCallback } from 'react'

export function useTimerAudio() {
  const audioRef = useRef<Record<number, HTMLAudioElement>>({})

  useEffect(() => {
    // Preload audio elements on mount
    const warningAudio = new Audio('/sounds/beep-warning.mp3')
    const urgentAudio = new Audio('/sounds/beep-urgent.mp3')
    const finalAudio = new Audio('/sounds/beep-final.mp3')

    // Set preload mode for instant playback (small files, full preload)
    warningAudio.preload = 'auto'
    urgentAudio.preload = 'auto'
    finalAudio.preload = 'auto'

    // Trigger preload
    warningAudio.load()
    urgentAudio.load()
    finalAudio.load()

    // Store by threshold
    audioRef.current = {
      10: warningAudio,
      5: urgentAudio,
      0: finalAudio,
    }
  }, [])

  const playBeep = useCallback((threshold: 10 | 5 | 0) => {
    const audio = audioRef.current[threshold]
    if (!audio) return

    // Reset to start for rapid re-triggering
    audio.currentTime = 0

    // Play with autoplay policy handling
    audio.play().catch((err) => {
      console.warn('Audio playback blocked:', err)
    })
  }, [])

  return { playBeep }
}
