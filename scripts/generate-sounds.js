#!/usr/bin/env node

/**
 * Sound generation script for quiz show audio effects.
 * Generates distinct synthesized WAV files using raw PCM audio data.
 *
 * Each sound has a unique pitch, waveform, duration, and envelope
 * to be audibly distinguishable. These are functional stand-ins —
 * replace with real royalty-free dramatic TV stings before broadcast.
 *
 * Usage: node scripts/generate-sounds.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const SOUNDS_DIR = join(__dirname, '..', 'public', 'sounds')

const SAMPLE_RATE = 44100

// ─── WAV file writing ────────────────────────────────────────────

function writeWav(filePath, samples) {
  const numSamples = samples.length
  const byteRate = SAMPLE_RATE * 2 // 16-bit mono
  const dataSize = numSamples * 2

  const buffer = Buffer.alloc(44 + dataSize)

  // RIFF header
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)

  // fmt  chunk
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)        // chunk size
  buffer.writeUInt16LE(1, 20)         // PCM format
  buffer.writeUInt16LE(1, 22)         // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24)
  buffer.writeUInt32LE(byteRate, 28)
  buffer.writeUInt16LE(2, 32)         // block align
  buffer.writeUInt16LE(16, 34)        // bits per sample

  // data chunk
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]))
    const val = Math.round(clamped * 32767)
    buffer.writeInt16LE(val, 44 + i * 2)
  }

  writeFileSync(filePath, buffer)
}

// ─── Waveform generators ─────────────────────────────────────────

function sine(t, freq) {
  return Math.sin(2 * Math.PI * freq * t)
}

function sawtooth(t, freq) {
  const p = (t * freq) % 1
  return 2 * p - 1
}

function triangle(t, freq) {
  const p = (t * freq) % 1
  return 4 * Math.abs(p - 0.5) - 1
}

// ─── Envelope helpers ────────────────────────────────────────────

function adsr(t, duration, attack = 0.02, decay = 0.05, sustain = 0.7, release = 0.1) {
  const releaseStart = duration - release
  if (t < attack) return t / attack
  if (t < attack + decay) return 1 - ((t - attack) / decay) * (1 - sustain)
  if (t < releaseStart) return sustain
  if (t < duration) return sustain * (1 - (t - releaseStart) / release)
  return 0
}

function fadeOut(t, duration, fadeStart = 0.7) {
  const fadeFraction = fadeStart * duration
  if (t < fadeFraction) return 1
  return 1 - (t - fadeFraction) / (duration - fadeFraction)
}

// ─── Sound definitions ───────────────────────────────────────────

function generateCorrect() {
  // Ascending 3-note arpeggio C5→E5→G5, bright/major, 0.4s
  const duration = 0.4
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  const noteLen = duration / 3

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const noteIdx = Math.min(Math.floor(t / noteLen), 2)
    const noteT = t - noteIdx * noteLen
    const env = adsr(noteT, noteLen, 0.005, 0.02, 0.8, 0.05)
    samples[i] = sine(t, notes[noteIdx]) * env * 0.7
  }
  return samples
}

function generateWrong() {
  // Descending dissonant 2-note E4→Eb4, buzzer-like, 0.3s
  const duration = 0.3
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const freq = t < 0.15 ? 329.63 : 311.13 // E4 → Eb4
    const env = adsr(t, duration, 0.005, 0.03, 0.6, 0.08)
    // Mix sawtooth + sine for buzzer quality
    samples[i] = (sawtooth(t, freq) * 0.4 + sine(t, freq) * 0.3) * env
  }
  return samples
}

function generateScoreMilestone() {
  // Triumphant ascending scale C4→E4→G4→C5, longer sustain, 0.8s
  const duration = 0.8
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)
  const notes = [261.63, 329.63, 392.0, 523.25] // C4, E4, G4, C5
  const noteLen = duration / 4

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const noteIdx = Math.min(Math.floor(t / noteLen), 3)
    const noteT = t - noteIdx * noteLen
    const env = adsr(noteT, noteLen, 0.01, 0.03, 0.85, 0.06)
    // Add a touch of harmonics for richness
    samples[i] = (sine(t, notes[noteIdx]) * 0.6 + sine(t, notes[noteIdx] * 2) * 0.15) * env
  }
  return samples
}

function generateSectionEnter() {
  // Rising sweep/whoosh 200Hz→800Hz, 0.5s
  const duration = 0.5
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const frac = t / duration
    const freq = 200 + (800 - 200) * frac * frac // quadratic ramp
    const env = adsr(t, duration, 0.02, 0.05, 0.7, 0.15)
    // Mix sine + noise-like component
    samples[i] = (sine(t, freq) * 0.5 + triangle(t, freq * 1.5) * 0.2) * env
  }
  return samples
}

function generateSectionExit() {
  // Falling sweep 800Hz→200Hz, 0.5s
  const duration = 0.5
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const frac = t / duration
    const freq = 800 - (800 - 200) * frac * frac
    const env = adsr(t, duration, 0.01, 0.03, 0.6, 0.2)
    samples[i] = (sine(t, freq) * 0.5 + triangle(t, freq * 1.5) * 0.2) * env
  }
  return samples
}

function generateShowIntro() {
  // Dramatic build: low rumble 80Hz swelling to chord C4+E4+G4, 1.5s
  const duration = 1.5
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const frac = t / duration
    // Rumble phase (0-0.8s), chord phase (0.5-1.5s with crossfade)
    const rumble = sine(t, 80) * 0.3 * Math.max(0, 1 - frac * 1.5)
    const chordVol = Math.min(1, Math.max(0, (frac - 0.3) / 0.4))
    const chord = (sine(t, 261.63) + sine(t, 329.63) + sine(t, 392.0)) / 3 * 0.5 * chordVol
    const env = frac < 0.9 ? Math.min(1, frac * 2) : (1 - (frac - 0.9) / 0.1)
    samples[i] = (rumble + chord) * env
  }
  return samples
}

function generateShowOutro() {
  // Chord C4+E4+G4 fading with reverb tail, 1.5s
  const duration = 1.5
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const frac = t / duration
    const chord = (sine(t, 261.63) + sine(t, 329.63) + sine(t, 392.0)) / 3
    // Exponential fade for reverb-like tail
    const env = Math.exp(-3 * frac) * 0.6
    // Add slight detune for shimmer
    const shimmer = sine(t, 262.5) * 0.05 * Math.exp(-4 * frac)
    samples[i] = (chord + shimmer) * env
  }
  return samples
}

function generateMinefieldDanger() {
  // Low pulsing tone 100Hz, amplitude modulated at 4Hz, 0.6s
  const duration = 0.6
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const carrier = sine(t, 100)
    const modulation = 0.5 + 0.5 * sine(t, 4)
    const env = adsr(t, duration, 0.03, 0.05, 0.8, 0.15)
    samples[i] = carrier * modulation * env * 0.6
  }
  return samples
}

function generateMinefieldCorrect() {
  // Bright double-ping high G5, 0.3s
  const duration = 0.3
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const isSecond = t >= 0.12
    const localT = isSecond ? t - 0.12 : t
    const env = Math.exp(-12 * localT) * (isSecond ? 0.8 : 0.7)
    samples[i] = sine(t, 783.99) * env // G5
  }
  return samples
}

function generateMinefieldWrong() {
  // Harsh buzz sawtooth 150Hz, 0.3s
  const duration = 0.3
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const env = adsr(t, duration, 0.005, 0.02, 0.7, 0.1)
    samples[i] = sawtooth(t, 150) * env * 0.5
  }
  return samples
}

function generateDebateReveal() {
  // Dramatic sting: quick ascending then sustain A4→D5 hold, 0.6s
  const duration = 0.6
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    // Glide from A4 (440) to D5 (587.33) over first 0.1s, then hold
    const freq = t < 0.1 ? 440 + (587.33 - 440) * (t / 0.1) : 587.33
    const env = t < 0.05 ? t / 0.05 : Math.exp(-2 * (t - 0.05))
    // Add octave harmonic for dramatic sting
    samples[i] = (sine(t, freq) * 0.5 + sine(t, freq * 2) * 0.2) * env
  }
  return samples
}

function generatePuzzleSolve() {
  // Sparkle effect: rapid high-frequency arpeggios C6→G6, 0.5s
  const duration = 0.5
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)
  const notes = [1046.5, 1174.66, 1318.51, 1396.91, 1567.98] // C6, D6, E6, F6, G6

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const noteIdx = Math.min(Math.floor(t / 0.08), notes.length - 1)
    const noteT = t - noteIdx * 0.08
    const env = Math.exp(-15 * noteT) * 0.5
    const overall = fadeOut(t, duration, 0.6)
    samples[i] = sine(t, notes[noteIdx]) * env * overall
  }
  return samples
}

function generateThinkingLoop() {
  // Gentle ticking clock-like pulse at 120bpm, 2.0s
  const duration = 2.0
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)
  const beatInterval = 60 / 120 // 0.5s per beat

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const beatPhase = (t % beatInterval) / beatInterval
    // Short click at each beat start
    if (beatPhase < 0.02) {
      const clickEnv = 1 - beatPhase / 0.02
      samples[i] = sine(t, 1200) * clickEnv * 0.3
    } else {
      // Very subtle background tone
      samples[i] = sine(t, 440) * 0.02 * fadeOut(t, duration, 0.8)
    }
  }
  return samples
}

function generatePassVerse() {
  // Soft chime high E5 with gentle decay, 0.4s
  const duration = 0.4
  const numSamples = Math.floor(SAMPLE_RATE * duration)
  const samples = new Float64Array(numSamples)

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE
    const env = Math.exp(-6 * t) * 0.5
    // E5 + slight harmonic for chime character
    samples[i] = (sine(t, 659.25) * 0.6 + sine(t, 659.25 * 3) * 0.1) * env
  }
  return samples
}

// ─── Main ────────────────────────────────────────────────────────

const SOUNDS = [
  { name: 'correct', generator: generateCorrect },
  { name: 'wrong', generator: generateWrong },
  { name: 'score-milestone', generator: generateScoreMilestone },
  { name: 'section-enter', generator: generateSectionEnter },
  { name: 'section-exit', generator: generateSectionExit },
  { name: 'show-intro', generator: generateShowIntro },
  { name: 'show-outro', generator: generateShowOutro },
  { name: 'minefield-danger', generator: generateMinefieldDanger },
  { name: 'minefield-correct', generator: generateMinefieldCorrect },
  { name: 'minefield-wrong', generator: generateMinefieldWrong },
  { name: 'debate-reveal', generator: generateDebateReveal },
  { name: 'puzzle-solve', generator: generatePuzzleSolve },
  { name: 'thinking-loop', generator: generateThinkingLoop },
  { name: 'pass-verse', generator: generatePassVerse },
]

if (!existsSync(SOUNDS_DIR)) {
  mkdirSync(SOUNDS_DIR, { recursive: true })
}

console.log(`Generating ${SOUNDS.length} sound files in ${SOUNDS_DIR}...\n`)

for (const { name, generator } of SOUNDS) {
  const samples = generator()
  const filePath = join(SOUNDS_DIR, `${name}.wav`)
  writeWav(filePath, samples)
  const sizeKb = (samples.length * 2 + 44) / 1024
  console.log(`  ✓ ${name}.wav (${(samples.length / SAMPLE_RATE).toFixed(1)}s, ${sizeKb.toFixed(1)} KB)`)
}

console.log(`\nDone! Generated ${SOUNDS.length} distinct sound files.`)
console.log('NOTE: These are synthesized stand-ins. Replace with real dramatic TV stings before broadcast.')
