import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useTimerStore, useShowStore } from '@/state'

/**
 * Poetic Chase pass mechanic hook.
 *
 * Required scoring rules:
 * - correct: +1
 * - wrong: +0
 * - pass: +0
 */
export function usePassMechanic() {
  const [passActive, setPassActive] = useState(false)
  const [passedToTeam, setPassedToTeam] = useState<'right' | 'left' | null>(null)

  const currentSection = useShowStore((s) => s.currentSection)
  const isPoeticChase = currentSection === 'poetic-chase'

  const activeTimer = useTimerStore((s) => s.activeTimer)
  const setActiveTimer = useTimerStore((s) => s.setActiveTimer)
  const addVerse = useTimerStore((s) => s.addVerse)
  const addRightScore = useShowStore((s) => s.addRightScore)
  const addLeftScore = useShowStore((s) => s.addLeftScore)

  const passVerse = () => {
    if (!isPoeticChase || !activeTimer) return

    const receivingTeam = activeTimer === 'right' ? 'left' : 'right'
    setActiveTimer(receivingTeam)

    setPassActive(true)
    setPassedToTeam(receivingTeam)
  }

  const correctAnswer = () => {
    if (!isPoeticChase || !activeTimer) return

    addVerse(activeTimer)
    if (activeTimer === 'right') {
      addRightScore(1)
    } else {
      addLeftScore(1)
    }

    setPassActive(false)
    setPassedToTeam(null)

    const nextTeam = activeTimer === 'right' ? 'left' : 'right'
    setActiveTimer(nextTeam)
  }

  const wrongAnswer = () => {
    if (!isPoeticChase || !activeTimer) return

    setPassActive(false)
    setPassedToTeam(null)

    const nextTeam = activeTimer === 'right' ? 'left' : 'right'
    setActiveTimer(nextTeam)
  }

  const resetPass = () => {
    setPassActive(false)
    setPassedToTeam(null)
  }

  useHotkeys('g', passVerse, { enableOnFormTags: false, enabled: isPoeticChase }, [
    isPoeticChase,
    activeTimer,
  ])
  useHotkeys('v', correctAnswer, { enableOnFormTags: false, enabled: isPoeticChase }, [
    isPoeticChase,
    activeTimer,
  ])
  useHotkeys('x', wrongAnswer, { enableOnFormTags: false, enabled: isPoeticChase }, [
    isPoeticChase,
    activeTimer,
  ])

  return {
    passVerse,
    correctAnswer,
    wrongAnswer,
    resetPass,
    passActive,
    passedToTeam,
  }
}
