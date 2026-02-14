import { useHotkeys } from 'react-hotkeys-hook'
import { useShowStore } from '@/state'

/**
 * Registers global keyboard shortcuts for scoring controls.
 * All shortcuts disabled when typing in form fields (enableOnFormTags: false).
 *
 * Scoring presets (apply to active team):
 * - 1: +1 point (speed question, general)
 * - 2: +2 points (windows of knowledge)
 * - 5: +5 points (puzzle second solver, debate judge)
 * - 8: +8 points (windows of knowledge max)
 * - 0: +10 points (puzzle first solver)
 * - Shift+5: +15 points (puzzle/debate max)
 * - Shift+6: +16 points (minefield correct)
 * - -: -8 points (minefield wrong)
 *
 * Turn and team controls:
 * - Space: Toggle turn
 * - Cmd/Ctrl+Shift+S: Swap sides
 *
 * Undo/redo:
 * - Cmd/Ctrl+Z: Undo
 * - Cmd/Ctrl+Shift+Z: Redo
 */
export function useScoreControls(): void {
  // Helper to add score to active team
  const addActiveScore = (points: number) => {
    const { rightsTurn, addRightScore, addLeftScore } = useShowStore.getState()
    if (rightsTurn) {
      addRightScore(points)
    } else {
      addLeftScore(points)
    }
  }

  // Scoring presets for active team
  useHotkeys('1', () => addActiveScore(1), { enableOnFormTags: false }, [])
  useHotkeys('2', () => addActiveScore(2), { enableOnFormTags: false }, [])
  useHotkeys('5', () => addActiveScore(5), { enableOnFormTags: false }, [])
  useHotkeys('8', () => addActiveScore(8), { enableOnFormTags: false }, [])
  useHotkeys('0', () => addActiveScore(10), { enableOnFormTags: false }, [])
  useHotkeys('shift+5', () => addActiveScore(15), { enableOnFormTags: false }, [])
  useHotkeys('shift+6', () => addActiveScore(16), { enableOnFormTags: false }, [])
  useHotkeys('-', () => addActiveScore(-8), { enableOnFormTags: false }, [])

  // Turn toggle
  useHotkeys(
    'space',
    (e) => {
      e.preventDefault()
      const { toggleTurn } = useShowStore.getState()
      toggleTurn()
    },
    { enableOnFormTags: false, preventDefault: true },
    []
  )

  // Swap sides
  useHotkeys(
    'cmd+shift+s, ctrl+shift+s',
    (e) => {
      e.preventDefault()
      const { swapSides } = useShowStore.getState()
      swapSides()
    },
    { enableOnFormTags: false, preventDefault: true },
    []
  )

  // Undo
  useHotkeys(
    'cmd+z, ctrl+z',
    (e) => {
      e.preventDefault()
      const { undo } = useShowStore.temporal.getState()
      undo()
    },
    { enableOnFormTags: false, preventDefault: true },
    []
  )

  // Redo
  useHotkeys(
    'cmd+shift+z, ctrl+shift+z',
    (e) => {
      e.preventDefault()
      const { redo } = useShowStore.temporal.getState()
      redo()
    },
    { enableOnFormTags: false, preventDefault: true },
    []
  )
}
