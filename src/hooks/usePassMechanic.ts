import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore, useShowStore } from '@/state'

/**
 * Poetic Chase pass mechanic hook.
 *
 * Pass flow rules:
 * 1. Team A passes → Team B gets +1 point (for receiving pass)
 * 2. Clock switches to Team B
 * 3. Team B answers correctly → +1 additional point (total +2 for correct answer after pass)
 * 4. Team B answers incorrectly → no extra point (just the +1 from receiving pass)
 *
 * Keyboard shortcuts:
 * - g: pass verse (mnemonic: "give")
 * - v: correct verse (mnemonic: "verse")
 * - x: wrong/skip verse
 */
export function usePassMechanic() {
  // Local state for tracking active pass flow
  const [passActive, setPassActive] = useState(false)
  const [passedToTeam, setPassedToTeam] = useState<'right' | 'left' | null>(null)

  // Store selectors
  const activeTimer = useTimerStore((s) => s.activeTimer)
  const setActiveTimer = useTimerStore((s) => s.setActiveTimer)
  const addVerse = useTimerStore((s) => s.addVerse)
  const addRightScore = useShowStore((s) => s.addRightScore)
  const addLeftScore = useShowStore((s) => s.addLeftScore)

  /**
   * Pass verse to the other team.
   * Awards +1 point to receiving team and switches clock.
   */
  const passVerse = () => {
    if (!activeTimer) return

    // Determine receiving team (opposite of active timer)
    const receivingTeam = activeTimer === 'right' ? 'left' : 'right'

    // Award +1 point to receiving team for accepting the pass
    if (receivingTeam === 'right') {
      addRightScore(1)
    } else {
      addLeftScore(1)
    }

    // Switch clock to receiving team
    setActiveTimer(receivingTeam)

    // Track pass state
    setPassActive(true)
    setPassedToTeam(receivingTeam)
  }

  /**
   * Mark current verse as correct.
   * Adds verse count, awards bonus point if this was a passed verse,
   * then switches clock.
   */
  const correctAnswer = () => {
    if (!activeTimer) return

    // Add verse count for answering team
    addVerse(activeTimer)

    // If this team received a pass and answered correctly, award +1 bonus point
    if (passActive && activeTimer === passedToTeam) {
      if (activeTimer === 'right') {
        addRightScore(1)
      } else {
        addLeftScore(1)
      }
    }

    // Reset pass state
    setPassActive(false)
    setPassedToTeam(null)

    // Switch clock to other team
    const nextTeam = activeTimer === 'right' ? 'left' : 'right'
    setActiveTimer(nextTeam)
  }

  /**
   * Mark current verse as wrong or skip it.
   * No points awarded, resets pass state, switches clock.
   */
  const wrongAnswer = () => {
    if (!activeTimer) return

    // Reset pass state (no bonus point for wrong answer)
    setPassActive(false)
    setPassedToTeam(null)

    // Switch clock to other team
    const nextTeam = activeTimer === 'right' ? 'left' : 'right'
    setActiveTimer(nextTeam)
  }

  /**
   * Reset pass state (for manual cleanup if needed)
   */
  const resetPass = () => {
    setPassActive(false)
    setPassedToTeam(null)
  }

  // Register keyboard shortcuts
  useHotkeys('g', passVerse, { enableOnFormTags: false })
  useHotkeys('v', correctAnswer, { enableOnFormTags: false })
  useHotkeys('x', wrongAnswer, { enableOnFormTags: false })

  return {
    passVerse,
    correctAnswer,
    wrongAnswer,
    resetPass,
    passActive,
    passedToTeam,
  }
}
