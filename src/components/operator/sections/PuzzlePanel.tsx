import { useState } from 'react'
import { useShowStore, useTimerStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

export function PuzzlePanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const rightsTurn = useShowStore((s) => s.rightsTurn)
  const isActive = currentSection === 'puzzle'

  const [firstSolvedBy, setFirstSolvedBy] = useState<'right' | 'left' | null>(null)

  const puzzles = data?.parts.puzzles ?? []
  const puzzleIndex = sectionState.questionIndex
  const currentPuzzle = puzzles[puzzleIndex]
  const duration = currentPuzzle?.duration ?? 90

  // T: toggle timer (start/stop). Wires to existing timerStore.
  useHotkeys('t', () => {
    const timerStore = useTimerStore.getState()
    if (!timerStore.countdownRunning) {
      timerStore.setCountdown(duration)
      timerStore.setCountdownRunning(true)
    } else {
      timerStore.setCountdownRunning(false)
    }
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, duration])

  // Shift+T: reset timer to puzzle duration
  useHotkeys('shift+t', () => {
    useTimerStore.getState().setCountdownRunning(false)
    useTimerStore.getState().setCountdown(duration)
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, duration])

  // N: next puzzle
  useHotkeys('n, arrowright', () => {
    if (puzzleIndex + 1 < puzzles.length) {
      useShowStore.getState().setSectionState({ questionIndex: puzzleIndex + 1, answerRevealed: false })
      setFirstSolvedBy(null)
      useTimerStore.getState().setCountdownRunning(false)
    }
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, puzzleIndex, puzzles.length])

  // B: previous puzzle
  useHotkeys('b, arrowleft', () => {
    if (puzzleIndex > 0) {
      useShowStore.getState().setSectionState({ questionIndex: puzzleIndex - 1, answerRevealed: false })
      setFirstSolvedBy(null)
    }
  }, { enabled: isActive, enableOnFormTags: false }, [isActive, puzzleIndex])

  // Enter: reveal answer on audience
  useHotkeys('enter', () => {
    const state = useShowStore.getState().sectionState
    useShowStore.getState().setSectionState({ answerRevealed: !state.answerRevealed })
  }, { enabled: isActive, enableOnFormTags: false }, [isActive])

  // "Mark first solve" handler
  const markFirstSolve = () => {
    const team = rightsTurn ? 'right' : 'left'
    setFirstSolvedBy(team)
    if (rightsTurn) useShowStore.getState().addRightScore(15)
    else useShowStore.getState().addLeftScore(15)
    useTimerStore.getState().setCountdownRunning(false)
  }

  if (!isActive) return null

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">اللغز</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {puzzleIndex + 1} / {puzzles.length}
        </span>
      </div>

      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[3rem]">
        {currentPuzzle?.text ?? <span className="text-muted-foreground text-xs">لا يوجد لغز</span>}
      </div>

      {sectionState.answerRevealed && currentPuzzle?.answer && (
        <div className="rounded border border-green-500/30 bg-green-500/10 p-2 text-xs text-right text-green-400 whitespace-pre-line leading-relaxed">
          {currentPuzzle.answer}
        </div>
      )}

      <div className="rounded border border-border bg-muted/30 p-2 text-[10px] text-muted-foreground space-y-1">
        <p>المدة: <span className="font-bold western-numerals text-foreground">{duration}</span> ثانية</p>
        {firstSolvedBy && (
          <p className="text-amber-400">
            حلّ أولاً: {firstSolvedBy === 'right' ? 'الأيمن' : 'الأيسر'} (+15 ✓)
          </p>
        )}
        {firstSolvedBy && (
          <p className="text-muted-foreground">إذا حلّ الثاني: استخدم <kbd className="bg-muted rounded px-1">0</kbd>+10 و<kbd className="bg-muted rounded px-1">5</kbd>+5</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <button
          onClick={() => {
            const timerStore = useTimerStore.getState()
            if (!timerStore.countdownRunning) {
              timerStore.setCountdown(duration)
              timerStore.setCountdownRunning(true)
            } else {
              timerStore.setCountdownRunning(false)
            }
          }}
          className="rounded border border-border bg-card px-2 py-1.5 text-[11px] hover:bg-accent transition-colors"
        >
          بدء/إيقاف <kbd className="text-[9px] bg-muted rounded px-1">T</kbd>
        </button>
        <button
          onClick={markFirstSolve}
          disabled={!!firstSolvedBy}
          className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-1.5 text-[11px] hover:bg-amber-500/20 transition-colors disabled:opacity-40"
        >
          حلّ أولاً (+15)
        </button>
      </div>
    </div>
  )
}
