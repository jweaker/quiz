import { useEffect, useRef } from 'react'
import { audioManager } from '@/lib/audioManager'
import { useShowStore } from '@/state/showStore'

/**
 * Side-effect hook that wires game events to sound effects.
 *
 * Subscribes to showStore changes and plays appropriate sounds:
 * - Scoring events: correct/wrong/milestone
 * - Section navigation: enter/exit
 * - Section-specific: minefield danger/correct/wrong, debate reveal
 *
 * Call once in OperatorControls — operator-only, audience doesn't play audio.
 * Returns nothing — pure side-effect hook.
 */
export function useAudioIntegration(): void {
  const prevRef = useRef<{
    rightScore: number
    leftScore: number
    currentSection: string | null
    isMinefieldQuestion: boolean
    debateRevealedCount: number
  } | null>(null)

  useEffect(() => {
    // Initialize prev state from current store state
    const initial = useShowStore.getState()
    prevRef.current = {
      rightScore: initial.rightScore,
      leftScore: initial.leftScore,
      currentSection: initial.currentSection,
      isMinefieldQuestion: initial.sectionState.isMinefieldQuestion,
      debateRevealedCount: initial.sectionState.debateRevealedCount,
    }

    const unsub = useShowStore.subscribe((state) => {
      const prev = prevRef.current
      if (!prev) return

      const {
        rightScore,
        leftScore,
        currentSection,
        sectionState: { isMinefieldQuestion, debateRevealedCount },
      } = state

      // ── Scoring events ──────────────────────────────────────────
      const rightDelta = rightScore - prev.rightScore
      const leftDelta = leftScore - prev.leftScore

      if (rightDelta > 0 || leftDelta > 0) {
        // Score increased
        if (isMinefieldQuestion && (rightDelta === 16 || leftDelta === 16)) {
          audioManager.play('minefield-correct')
        } else {
          audioManager.play('correct')
        }

        // Check milestone: score crossed a multiple of 50
        const checkMilestone = (prevScore: number, newScore: number) => {
          const prevMilestone = Math.floor(prevScore / 50)
          const newMilestone = Math.floor(newScore / 50)
          return newMilestone > prevMilestone
        }

        if (checkMilestone(prev.rightScore, rightScore) || checkMilestone(prev.leftScore, leftScore)) {
          // Play milestone after a short delay so it doesn't overlap with correct sound
          setTimeout(() => audioManager.play('score-milestone'), 200)
        }
      } else if (rightDelta < 0 || leftDelta < 0) {
        // Score decreased
        if (isMinefieldQuestion && (rightDelta === -8 || leftDelta === -8)) {
          audioManager.play('minefield-wrong')
        } else {
          audioManager.play('wrong')
        }
      }

      // ── Section navigation events ───────────────────────────────
      if (currentSection !== prev.currentSection) {
        if (prev.currentSection === null && currentSection !== null) {
          // First section activated
          audioManager.play('section-enter')
        } else if (prev.currentSection !== null && currentSection !== null) {
          // Section change
          audioManager.play('section-exit')
          setTimeout(() => audioManager.play('section-enter'), 300)
        }
      }

      // ── Section-specific events ─────────────────────────────────
      // Minefield danger activation
      if (isMinefieldQuestion && !prev.isMinefieldQuestion) {
        audioManager.play('minefield-danger')
      }

      // Debate reveal progression
      if (debateRevealedCount > prev.debateRevealedCount) {
        audioManager.play('debate-reveal')
      }

      // Update prev ref
      prevRef.current = {
        rightScore,
        leftScore,
        currentSection,
        isMinefieldQuestion,
        debateRevealedCount,
      }
    })

    return unsub
  }, [])
}
