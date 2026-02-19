import { useShowStore } from '@/state'
import { useHotkeys } from 'react-hotkeys-hook'

export function SpeedQuestionPanel() {
  const currentSection = useShowStore((s) => s.currentSection)
  const data = useShowStore((s) => s.data)
  const sectionState = useShowStore((s) => s.sectionState)
  const isActive = currentSection === 'speed-question'

  const questions = data?.parts.speedQuestions ?? []
  const totalQuestions = questions.length
  const currentQ = questions[sectionState.questionIndex]

  // Enter: reveal question on audience (answerRevealed marks it as displayed)
  useHotkeys(
    'enter',
    () => {
      const state = useShowStore.getState().sectionState
      if (!state.answerRevealed) {
        useShowStore.getState().setSectionState({ answerRevealed: true })
      }
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive]
  )

  // N / ArrowRight: next/reserve question
  useHotkeys(
    'n, arrowright',
    () => {
      const state = useShowStore.getState().sectionState
      const newIndex = state.questionIndex + 1
      if (newIndex < questions.length) {
        useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
      }
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive, questions.length]
  )

  // B / ArrowLeft: previous question
  useHotkeys(
    'b, arrowleft',
    () => {
      const state = useShowStore.getState().sectionState
      const newIndex = Math.max(0, state.questionIndex - 1)
      useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive]
  )

  // Z: right team answered -> assign turn to right team
  useHotkeys(
    'z',
    () => {
      useShowStore.getState().setRightsTurn(true)
      useShowStore.getState().setTurned(true)
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive]
  )

  // C: left team answered -> assign turn to left team
  useHotkeys(
    'c',
    () => {
      useShowStore.getState().setRightsTurn(false)
      useShowStore.getState().setTurned(true)
    },
    { enabled: isActive, enableOnFormTags: false },
    [isActive]
  )

  if (!isActive) return null

  return (
    <div className="space-y-3 pt-1">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">سؤال السرعة</span>
        <span className="text-xs font-bold tabular-nums western-numerals bg-muted px-2 py-0.5 rounded">
          {sectionState.questionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Current question preview */}
      <div className="rounded border border-border bg-card p-2 text-sm text-right leading-relaxed min-h-[3rem]">
        {currentQ ? currentQ.text : <span className="text-muted-foreground text-xs">لا يوجد سؤال</span>}
      </div>

      {/* Controls reference */}
      <div className="grid grid-cols-3 gap-1">
        <button
          onClick={() => { useShowStore.getState().setRightsTurn(true); useShowStore.getState().setTurned(true) }}
          className="rounded border border-border bg-card px-2 py-1 text-[11px] text-center hover:bg-accent transition-colors"
        >
          أجاب الأيمن <kbd className="text-[9px] bg-muted rounded px-1">Z</kbd>
        </button>
        <button
          onClick={() => {
            const state = useShowStore.getState().sectionState
            const newIndex = state.questionIndex + 1
            if (newIndex < questions.length) useShowStore.getState().setSectionState({ questionIndex: newIndex, answerRevealed: false })
          }}
          className="rounded border border-border bg-card px-2 py-1 text-[11px] text-center hover:bg-accent transition-colors"
        >
          التالي <kbd className="text-[9px] bg-muted rounded px-1">N</kbd>
        </button>
        <button
          onClick={() => { useShowStore.getState().setRightsTurn(false); useShowStore.getState().setTurned(true) }}
          className="rounded border border-border bg-card px-2 py-1 text-[11px] text-center hover:bg-accent transition-colors"
        >
          أجاب الأيسر <kbd className="text-[9px] bg-muted rounded px-1">C</kbd>
        </button>
      </div>
    </div>
  )
}
