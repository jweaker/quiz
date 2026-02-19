import { useEffect, useCallback, useState } from 'react'
import { audioManager } from '@/lib/audioManager'
import { useOperatorStore } from '@/state/operatorStore'

/**
 * React hook wrapping the AudioManager singleton.
 *
 * - Preloads all sounds on mount (idempotent)
 * - Syncs volume/mute state from operatorStore to audioManager
 * - Returns stable play/toggleMute callbacks and reactive isMuted state
 */
export function useAudio() {
  const masterVolume = useOperatorStore((s) => s.masterVolume)
  const timerVolume = useOperatorStore((s) => s.timerVolume)
  const feedbackVolume = useOperatorStore((s) => s.feedbackVolume)
  const transitionVolume = useOperatorStore((s) => s.transitionVolume)
  const sectionVolume = useOperatorStore((s) => s.sectionVolume)
  const audioMuted = useOperatorStore((s) => s.audioMuted)
  const setAudioMuted = useOperatorStore((s) => s.setAudioMuted)

  const [isMuted, setIsMuted] = useState(audioMuted)

  // Preload all sounds on mount (idempotent)
  useEffect(() => {
    audioManager.preloadAll()
  }, [])

  // Sync master volume
  useEffect(() => {
    if (!audioMuted) {
      audioManager.setMasterVolume(masterVolume)
    }
  }, [masterVolume, audioMuted])

  // Sync category volumes
  useEffect(() => {
    audioManager.setCategoryVolume('timer', timerVolume)
  }, [timerVolume])

  useEffect(() => {
    audioManager.setCategoryVolume('feedback', feedbackVolume)
  }, [feedbackVolume])

  useEffect(() => {
    audioManager.setCategoryVolume('transition', transitionVolume)
  }, [transitionVolume])

  useEffect(() => {
    audioManager.setCategoryVolume('section', sectionVolume)
  }, [sectionVolume])

  // Sync mute state from store to audioManager
  useEffect(() => {
    if (audioMuted && !audioManager.isMuted) {
      audioManager.toggleMute()
    } else if (!audioMuted && audioManager.isMuted) {
      audioManager.toggleMute()
    }
    setIsMuted(audioMuted)
  }, [audioMuted])

  const play = useCallback((soundId: string, options?: { gain?: number }) => {
    audioManager.play(soundId, options)
  }, [])

  const toggleMute = useCallback(() => {
    audioManager.toggleMute()
    const muted = audioManager.isMuted
    setIsMuted(muted)
    setAudioMuted(muted)
  }, [setAudioMuted])

  return { play, toggleMute, isMuted }
}
