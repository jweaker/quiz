import { useEffect, useRef, useCallback } from 'react'

/**
 * Timer audio hook using Web Audio API for smooth, overlap-free playback.
 * Replaces HTMLAudioElement approach which caused choppy audio at rapid intervals.
 *
 * Uses AudioBuffer for preloaded sounds and creates new BufferSourceNode for each play.
 * This allows overlapping playback without artifacts and works at 100ms+ intervals.
 */
export function useTimerAudio() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBuffersRef = useRef<{
    tick?: AudioBuffer
    warning?: AudioBuffer
    urgent?: AudioBuffer
    final?: AudioBuffer
  }>({})
  const isLoadingRef = useRef(false)

  useEffect(() => {
    // Create AudioContext singleton
    audioContextRef.current = new AudioContext()

    // Preload all sounds on mount
    const loadSounds = async () => {
      if (isLoadingRef.current) return
      isLoadingRef.current = true

      const ctx = audioContextRef.current
      if (!ctx) return

      try {
        // Fetch and decode all audio files in parallel
        const [tickResponse, warningResponse, urgentResponse, finalResponse] = await Promise.all([
          fetch('/sounds/tick.wav'),
          fetch('/sounds/beep-warning.mp3'),
          fetch('/sounds/beep-urgent.mp3'),
          fetch('/sounds/beep-final.mp3'),
        ])

        const [tickArrayBuffer, warningArrayBuffer, urgentArrayBuffer, finalArrayBuffer] = await Promise.all([
          tickResponse.arrayBuffer(),
          warningResponse.arrayBuffer(),
          urgentResponse.arrayBuffer(),
          finalResponse.arrayBuffer(),
        ])

        // Decode all audio data in parallel
        const [tickBuffer, warningBuffer, urgentBuffer, finalBuffer] = await Promise.all([
          ctx.decodeAudioData(tickArrayBuffer),
          ctx.decodeAudioData(warningArrayBuffer),
          ctx.decodeAudioData(urgentArrayBuffer),
          ctx.decodeAudioData(finalArrayBuffer),
        ])

        // Store decoded buffers for reuse
        audioBuffersRef.current = {
          tick: tickBuffer,
          warning: warningBuffer,
          urgent: urgentBuffer,
          final: finalBuffer,
        }
      } catch (err) {
        console.warn('Failed to preload timer audio:', err)
      }
    }

    loadSounds()

    // Cleanup: do NOT close AudioContext (may be shared across components)
    // Just clear references
    return () => {
      audioContextRef.current = null
      audioBuffersRef.current = {}
      isLoadingRef.current = false
    }
  }, [])

  /**
   * Play a warning beep at specific countdown thresholds (10s, 5s, 0s)
   */
  const playBeep = useCallback((threshold: 10 | 5 | 0) => {
    const ctx = audioContextRef.current
    if (!ctx) return

    // Handle AudioContext suspension (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch((err) => {
        console.warn('AudioContext resume failed:', err)
      })
    }

    // Select buffer based on threshold
    const buffer =
      threshold === 10
        ? audioBuffersRef.current.warning
        : threshold === 5
          ? audioBuffersRef.current.urgent
          : audioBuffersRef.current.final

    if (!buffer) {
      console.warn(`Audio buffer not loaded for threshold: ${threshold}s`)
      return
    }

    try {
      // Create a new BufferSourceNode for this playback
      // (BufferSourceNode is one-shot — fire and forget, garbage-collected after playback)
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)
    } catch (err) {
      console.warn('Audio playback failed:', err)
    }
  }, [])

  /**
   * Play a tick sound (for timer ticking at rapid intervals)
   */
  const playTick = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx) return

    // Handle AudioContext suspension
    if (ctx.state === 'suspended') {
      ctx.resume().catch((err) => {
        console.warn('AudioContext resume failed:', err)
      })
    }

    const buffer = audioBuffersRef.current.tick
    if (!buffer) {
      console.warn('Tick audio buffer not loaded')
      return
    }

    try {
      // Create new source for each tick — allows natural overlapping
      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.connect(ctx.destination)
      source.start(0)
    } catch (err) {
      console.warn('Tick playback failed:', err)
    }
  }, [])

  return { playBeep, playTick }
}
