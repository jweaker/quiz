/**
 * AudioManager singleton — centralizes all audio through a single AudioContext
 * with category-based GainNode routing for volume mixing.
 *
 * GainNode chain: category gains → masterGain → ctx.destination
 *
 * Fire-and-forget playback: BufferSourceNode created per play() call,
 * routed through the correct category GainNode.
 */

import { useOperatorStore } from '@/state/operatorStore'

export type AudioCategory = 'timer' | 'feedback' | 'transition' | 'section'

/** Maps each sound ID to its audio category for GainNode routing */
const SOUND_CATEGORIES: Record<string, AudioCategory> = {
  // Timer
  tick: 'timer',
  'timer-warning': 'timer',
  'timer-urgent': 'timer',
  'timer-expire': 'timer',
  // Feedback
  correct: 'feedback',
  wrong: 'feedback',
  'score-milestone': 'feedback',
  // Transition
  'section-enter': 'transition',
  'section-exit': 'transition',
  'show-intro': 'transition',
  'show-outro': 'transition',
  // Section-specific
  'minefield-danger': 'section',
  'minefield-correct': 'section',
  'minefield-wrong': 'section',
  'debate-reveal': 'section',
  'puzzle-solve': 'section',
  'thinking-loop': 'section',
  'pass-verse': 'section',
}

/** Sound file extensions (most are .mp3 except tick.wav) */
const SOUND_EXTENSIONS: Record<string, string> = {
  tick: 'wav',
}

class AudioManager {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private categoryGains: Record<AudioCategory, GainNode | null> = {
    timer: null,
    feedback: null,
    transition: null,
    section: null,
  }
  private buffers: Map<string, AudioBuffer> = new Map()
  private preloaded = false
  private preloading = false
  private _isMuted = false
  private _previousMasterVolume = 0.8

  /** Lazily create AudioContext and GainNode chain */
  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx

    this.ctx = new AudioContext()

    // Create master gain → destination
    this.masterGain = this.ctx.createGain()
    this.masterGain.connect(this.ctx.destination)

    // Create category gains → master gain
    const categories: AudioCategory[] = ['timer', 'feedback', 'transition', 'section']
    for (const cat of categories) {
      const gain = this.ctx.createGain()
      gain.connect(this.masterGain)
      this.categoryGains[cat] = gain
    }

    // Sync volumes from operator store
    const state = useOperatorStore.getState()
    this.masterGain.gain.value = state.audioMuted ? 0 : state.masterVolume
    this._isMuted = state.audioMuted
    this._previousMasterVolume = state.masterVolume

    if (this.categoryGains.timer) this.categoryGains.timer.gain.value = state.timerVolume
    if (this.categoryGains.feedback) this.categoryGains.feedback.gain.value = state.feedbackVolume
    if (this.categoryGains.transition) this.categoryGains.transition.gain.value = state.transitionVolume
    if (this.categoryGains.section) this.categoryGains.section.gain.value = state.sectionVolume

    return this.ctx
  }

  /**
   * Preload all known sound files. Idempotent — skips if already loaded.
   * Uses Promise.allSettled so one missing file doesn't break all audio.
   */
  async preloadAll(): Promise<void> {
    if (this.preloaded || this.preloading) return
    this.preloading = true

    const ctx = this.ensureContext()
    const soundIds = Object.keys(SOUND_CATEGORIES)

    const results = await Promise.allSettled(
      soundIds.map(async (id) => {
        const ext = SOUND_EXTENSIONS[id] || 'mp3'
        const response = await fetch(`/sounds/${id}.${ext}`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for /sounds/${id}.${ext}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        this.buffers.set(id, audioBuffer)
      })
    )

    // Log warnings for any failures
    results.forEach((result, i) => {
      if (result.status === 'rejected') {
        console.warn(`Failed to preload sound "${soundIds[i]}":`, result.reason)
      }
    })

    this.preloaded = true
    this.preloading = false
  }

  /**
   * Play a sound by ID. Fire-and-forget pattern.
   * Routes through the correct category GainNode.
   */
  play(soundId: string, options?: { gain?: number }): void {
    const ctx = this.ensureContext()

    // Handle AudioContext suspension (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch((err) => {
        console.warn('AudioContext resume failed:', err)
      })
    }

    const buffer = this.buffers.get(soundId)
    if (!buffer) {
      console.warn(`Audio buffer not loaded for sound: "${soundId}"`)
      return
    }

    try {
      const source = ctx.createBufferSource()
      source.buffer = buffer

      // Route through category GainNode
      const category = SOUND_CATEGORIES[soundId]
      const categoryGain = category ? this.categoryGains[category] : null

      if (categoryGain) {
        // Optional per-play gain adjustment
        if (options?.gain !== undefined) {
          const playGain = ctx.createGain()
          playGain.gain.value = options.gain
          source.connect(playGain)
          playGain.connect(categoryGain)
        } else {
          source.connect(categoryGain)
        }
      } else {
        // Fallback: connect directly to master
        source.connect(this.masterGain!)
      }

      source.start(0)
    } catch (err) {
      console.warn('Audio playback failed:', err)
    }
  }

  /** Set master volume (0-1) */
  setMasterVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = value
    }
    this._previousMasterVolume = value
    if (value > 0) {
      this._isMuted = false
    }
  }

  /** Set category volume (0-1) */
  setCategoryVolume(category: AudioCategory, value: number): void {
    const gain = this.categoryGains[category]
    if (gain) {
      gain.gain.value = value
    }
  }

  /** Toggle mute: sets masterGain to 0 or restores previous value */
  toggleMute(): void {
    if (!this.masterGain) {
      this.ensureContext()
    }

    if (this._isMuted) {
      // Unmute — restore previous volume
      if (this.masterGain) {
        this.masterGain.gain.value = this._previousMasterVolume
      }
      this._isMuted = false
    } else {
      // Mute — store current and set to 0
      if (this.masterGain) {
        this._previousMasterVolume = this.masterGain.gain.value
        this.masterGain.gain.value = 0
      }
      this._isMuted = true
    }
  }

  /** Whether audio is currently muted */
  get isMuted(): boolean {
    return this._isMuted
  }

  /** Clean up AudioContext and buffers */
  dispose(): void {
    if (this.ctx) {
      this.ctx.close().catch(() => {})
      this.ctx = null
    }
    this.masterGain = null
    this.categoryGains = { timer: null, feedback: null, transition: null, section: null }
    this.buffers.clear()
    this.preloaded = false
    this.preloading = false
  }
}

/** Singleton instance */
export const audioManager = new AudioManager()
